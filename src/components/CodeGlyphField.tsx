import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const GLYPHS = [
  "{", "}", "(", ")", "<", ">", "/", String.fromCharCode(92), ";", ":",
  "=", "=>", "0", "1", "#", "$", "*", "+", "-", "_",
]
const ALPHAS = [0.055, 0.2, 0.5, 0.78]
const LIME = "#C8FF3D"
const MUTED = "#8A8780"
const FRAME_INTERVAL = 1000 / 30
const LENS_RADIUS = 170
const LENS_RADIUS_SQ = LENS_RADIUS * LENS_RADIUS
const SCRAMBLE_INTERVAL = 100
const RIPPLE_DURATION = 700
const MAX_RIPPLES = 4
const RESIZE_DEBOUNCE = 200
const VIGNETTE = "radial-gradient(ellipse 95% 90% at 70% 45%, rgba(11, 11, 12, 0) 0%, rgba(11, 11, 12, 0.08) 48%, rgba(11, 11, 12, 0.55) 82%, rgba(11, 11, 12, 0.92) 100%)"

type Ripple = {
  x: number
  y: number
  start: number
}

function randomGlyph() {
  return Math.floor(Math.random() * GLYPHS.length)
}

export default function CodeGlyphField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const field = fieldRef.current
    const base = baseRef.current
    const overlay = overlayRef.current
    if (!container || !field || !base || !overlay) return

    const containerEl = container
    const fieldEl = field
    const baseEl = base
    const overlayEl = overlay

    let cancelled = false
    let dispose: (() => void) | undefined

    function setup() {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
      let lensEnabled = hoverQuery.matches
      let compact = window.matchMedia("(max-width: 1023px)").matches
      let width = 0
      let height = 0
      let dpr = 1
      let cell = 14
      let cols = 0
      let rows = 0
      let total = 0
      let atlas: HTMLCanvasElement | null = null
      let atlasCell = 0
      let mask: Uint8Array | null = null
      let glyphs: Uint8Array | null = null
      let maskCells = new Uint32Array(0)
      let baseCtx: CanvasRenderingContext2D | null = null
      let overlayCtx: CanvasRenderingContext2D | null = null
      let rafId = 0
      let inView = true
      let lastDraw = 0
      let lastScramble = 0
      let scrollProgress = 0
      let pointerX = -9999
      let pointerY = -9999
      let targetX = -9999
      let targetY = -9999
      let lensActive = false
      let resizeTimer = 0
      let disposed = false
      let rippleCursor = 0
      let resizeObserver: ResizeObserver | null = null
      let intersectionObserver: IntersectionObserver | null = null
      let scrollTrigger: ScrollTrigger | null = null
      const ripples: Ripple[] = []

      for (let i = 0; i < MAX_RIPPLES; i += 1) {
        ripples.push({ x: 0, y: 0, start: -1 })
      }

      function paint(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, glyph: number, variant: number, x: number, y: number, scale: number) {
        const size = cell * scale
        const source = atlasCell
        ctx.drawImage(src, variant * source, glyph * source, source, source, x - size * 0.5, y - size * 0.5, size, size)
      }

      function buildAtlas() {
        atlasCell = cell * dpr
        const canvas = document.createElement("canvas")
        canvas.width = Math.ceil(atlasCell * 8) + 1
        canvas.height = Math.ceil(atlasCell * GLYPHS.length) + 1
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          atlas = null
          return
        }
        const fontPx = Math.max(8, Math.round(cell * dpr * 0.66))
        ctx.font = `400 ${fontPx}px "JetBrains Mono", monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        for (let color = 0; color < 2; color += 1) {
          ctx.fillStyle = color === 0 ? LIME : MUTED
          for (let level = 0; level < ALPHAS.length; level += 1) {
            ctx.globalAlpha = ALPHAS[level]
            const column = color * ALPHAS.length + level
            for (let glyph = 0; glyph < GLYPHS.length; glyph += 1) {
              ctx.fillText(GLYPHS[glyph], column * atlasCell + atlasCell * 0.5, glyph * atlasCell + atlasCell * 0.5)
            }
          }
        }
        ctx.globalAlpha = 1
        atlas = canvas
      }

      function buildGlyphs() {
        const next = new Uint8Array(total)
        for (let i = 0; i < total; i += 1) {
          next[i] = randomGlyph()
        }
        glyphs = next
      }

      function buildMask() {
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.ceil(width))
        canvas.height = Math.max(1, Math.ceil(height))
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) {
          mask = new Uint8Array(total)
          maskCells = new Uint32Array(0)
          return
        }
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        let size = 0
        let x = 0
        let y = 0
        if (compact) {
          size = Math.min(width * 0.95, height * 0.55)
          x = width * 0.82
          y = height * 0.8
        } else {
          size = Math.min(height * 0.85, width * 0.7)
          x = width * 0.71
          y = height * 0.5
        }
        ctx.font = `italic 400 ${size}px "Instrument Serif", Georgia, serif`
        ctx.fillText("A", x, y)
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = image.data
        const nextMask = new Uint8Array(total)
        let maskCount = 0
        for (let row = 0; row < rows; row += 1) {
          const sampleY = Math.floor((row + 0.5) * cell)
          if (sampleY >= canvas.height) continue
          for (let col = 0; col < cols; col += 1) {
            const sampleX = Math.floor((col + 0.5) * cell)
            if (sampleX >= canvas.width) continue
            const alpha = data[(sampleY * canvas.width + sampleX) * 4 + 3]
            if (alpha > 20) {
              nextMask[row * cols + col] = alpha
              maskCount += 1
            }
          }
        }
        const nextMaskCells = new Uint32Array(maskCount)
        let cursor = 0
        for (let i = 0; i < total; i += 1) {
          if (nextMask[i] !== 0) {
            nextMaskCells[cursor] = i
            cursor += 1
          }
        }
        mask = nextMask
        maskCells = nextMaskCells
      }

      function resizeCanvases() {
        const canvasWidth = Math.max(1, Math.round(width * dpr))
        const canvasHeight = Math.max(1, Math.round(height * dpr))
        baseEl.width = canvasWidth
        baseEl.height = canvasHeight
        overlayEl.width = canvasWidth
        overlayEl.height = canvasHeight
        baseCtx = baseEl.getContext("2d")
        overlayCtx = overlayEl.getContext("2d")
        if (baseCtx) {
          baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
          baseCtx.imageSmoothingEnabled = true
        }
        if (overlayCtx) {
          overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
          overlayCtx.imageSmoothingEnabled = true
        }
      }

      function drawBase(includeMask: boolean) {
        const ctx = baseCtx
        const src = atlas
        const maskArray = mask
        const glyphArray = glyphs
        if (!ctx || !src || !maskArray || !glyphArray) return
        ctx.clearRect(0, 0, width, height)
        for (let row = 0; row < rows; row += 1) {
          const y = (row + 0.5) * cell
          for (let col = 0; col < cols; col += 1) {
            const index = row * cols + col
            const inside = maskArray[index] !== 0
            if (inside && !includeMask) continue
            const x = (col + 0.5) * cell
            const variant = inside ? (compact ? 1 : 2) : 4
            paint(ctx, src, glyphArray[index], variant, x, y, 1)
          }
        }
      }

      function drawStatic() {
        drawBase(true)
        if (overlayCtx) overlayCtx.clearRect(0, 0, width, height)
      }

      function drawFrame(now: number) {
        const ctx = overlayCtx
        const src = atlas
        const maskArray = mask
        const glyphArray = glyphs
        if (!ctx || !src || !maskArray || !glyphArray) return
        ctx.clearRect(0, 0, width, height)
        const canLens = lensEnabled && lensActive
        if (canLens) {
          pointerX += (targetX - pointerX) * 0.12
          pointerY += (targetY - pointerY) * 0.12
        }
        const time = now * 0.001
        let scramble = false
        if (now - lastScramble >= SCRAMBLE_INTERVAL) {
          scramble = true
          lastScramble = now
        }
        if (maskCells.length > 0) {
          for (let i = 0; i < 8; i += 1) {
            const index = maskCells[Math.floor(Math.random() * maskCells.length)]
            glyphArray[index] = randomGlyph()
          }
        }
        let activeRipples = 0
        for (let i = 0; i < MAX_RIPPLES; i += 1) {
          const ripple = ripples[i]
          if (ripple.start >= 0 && now - ripple.start < RIPPLE_DURATION) activeRipples += 1
        }
        const maxRadius = Math.min(640, Math.max(260, Math.min(width, height) * 0.62))
        for (let row = 0; row < rows; row += 1) {
          const y = (row + 0.5) * cell
          for (let col = 0; col < cols; col += 1) {
            const x = (col + 0.5) * cell
            const index = row * cols + col
            const inside = maskArray[index] !== 0
            let lens = 0
            if (canLens) {
              const dx = x - pointerX
              const dy = y - pointerY
              const distanceSq = dx * dx + dy * dy
              if (distanceSq < LENS_RADIUS_SQ) {
                lens = 1 - Math.sqrt(distanceSq) / LENS_RADIUS
                lens = lens * lens * (3 - 2 * lens)
              }
            }
            let ripple = 0
            if (activeRipples > 0) {
              for (let r = 0; r < MAX_RIPPLES; r += 1) {
                const ring = ripples[r]
                if (ring.start < 0) continue
                const age = now - ring.start
                if (age < 0 || age >= RIPPLE_DURATION) continue
                const progress = age / RIPPLE_DURATION
                const radius = progress * maxRadius
                const band = 10 + 34 * (1 - progress)
                const dx = x - ring.x
                const dy = y - ring.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const value = (1 - Math.abs(distance - radius) / band) * (1 - progress)
                if (value > ripple) ripple = value
              }
            }
            if (!inside && lens === 0 && ripple === 0) continue
            let level = 0
            let color = 1
            let scale = 1
            if (inside) {
              color = 0
              const wave = Math.sin((x + y) * 0.006 - time * 0.75)
              if (compact) {
                level = wave > 0.35 ? 2 : 1
              } else {
                level = wave > 0.55 ? 3 : wave > -0.35 ? 2 : 1
              }
            }
            if (lens > 0) {
              color = 0
              if (inside) {
                level = lens > 0.55 ? 3 : Math.max(level, 2)
              } else {
                level = lens > 0.68 ? 3 : lens > 0.28 ? 2 : 1
              }
              scale = 1 + 0.25 * lens
              if (scramble) glyphArray[index] = randomGlyph()
            }
            if (ripple > 0) {
              color = 0
              level = Math.max(level, ripple > 0.55 ? 3 : 2)
              const rippleScale = 1 + 0.18 * ripple
              if (rippleScale > scale) scale = rippleScale
            }
            const variant = color * 4 + level
            paint(ctx, src, glyphArray[index], variant, x, y, scale)
          }
        }
      }

      function frame(now: number) {
        rafId = 0
        if (disposed || !inView || document.hidden) return
        rafId = requestAnimationFrame(frame)
        if (now - lastDraw < FRAME_INTERVAL) return
        lastDraw = now
        drawFrame(now)
      }

      function startLoop() {
        if (disposed || reduced || rafId !== 0 || !inView || document.hidden) return
        lastDraw = 0
        rafId = requestAnimationFrame(frame)
      }

      function stopLoop() {
        if (rafId !== 0) cancelAnimationFrame(rafId)
        rafId = 0
      }

      function applyScroll(progress: number) {
        scrollProgress = progress
        if (reduced) return
        const offset = -progress * height * 0.08
        fieldEl.style.transform = `translate3d(0, ${offset}px, 0)`
        fieldEl.style.opacity = `${Math.max(0, 1 - progress * 0.95)}`
      }

      function scheduleResize() {
        if (disposed) return
        if (resizeTimer !== 0) window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(() => {
          resizeTimer = 0
          rebuild(false)
        }, RESIZE_DEBOUNCE)
      }

      function onPointerMove(event: PointerEvent) {
        if (!lensEnabled || event.pointerType === "touch") return
        const rect = fieldEl.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        if (x < 0 || y < 0 || x > width || y > height) {
          lensActive = false
          return
        }
        if (!lensActive) {
          pointerX = x
          pointerY = y
        }
        targetX = x
        targetY = y
        lensActive = true
      }

      function onPointerDown(event: PointerEvent) {
        if (!event.isPrimary || event.button !== 0) return
        const rect = fieldEl.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        if (x < 0 || y < 0 || x > width || y > height) return
        const ripple = ripples[rippleCursor]
        ripple.x = x
        ripple.y = y
        ripple.start = performance.now()
        rippleCursor = (rippleCursor + 1) % MAX_RIPPLES
        startLoop()
      }

      function onWindowBlur() {
        lensActive = false
      }

      function handleWindowResize() {
        scheduleResize()
      }

      function handleVisibilityChange() {
        if (document.hidden) {
          stopLoop()
        } else {
          startLoop()
        }
      }

      function handleHoverChange() {
        lensEnabled = hoverQuery.matches
        if (!lensEnabled) lensActive = false
      }

      function rebuild(force: boolean) {
        if (disposed) return
        const nextWidth = containerEl.clientWidth
        const nextHeight = containerEl.clientHeight
        if (nextWidth < 4 || nextHeight < 4) return
        const nextCompact = window.matchMedia("(max-width: 1023px)").matches
        const nextDpr = Math.min(window.devicePixelRatio || 1, nextCompact ? 1 : 1.5)
        if (!force && nextWidth === width && nextHeight === height && nextCompact === compact && nextDpr === dpr && atlas !== null) return
        width = nextWidth
        height = nextHeight
        compact = nextCompact
        dpr = nextDpr
        cell = compact ? 18 : 14
        cols = Math.ceil(width / cell)
        rows = Math.ceil(height / cell)
        total = cols * rows
        lensEnabled = hoverQuery.matches
        lensActive = false
        resizeCanvases()
        buildAtlas()
        buildGlyphs()
        buildMask()
        if (overlayCtx) overlayCtx.clearRect(0, 0, width, height)
        if (reduced) {
          drawStatic()
        } else {
          drawBase(false)
          drawFrame(performance.now())
        }
        applyScroll(scrollProgress)
      }

      function cleanup() {
        if (disposed) return
        disposed = true
        if (resizeTimer !== 0) {
          window.clearTimeout(resizeTimer)
          resizeTimer = 0
        }
        if (rafId !== 0) {
          cancelAnimationFrame(rafId)
          rafId = 0
        }
        if (resizeObserver) resizeObserver.disconnect()
        if (intersectionObserver) intersectionObserver.disconnect()
        if (scrollTrigger) scrollTrigger.kill()
        window.removeEventListener("resize", handleWindowResize)
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("pointerdown", onPointerDown)
        window.removeEventListener("blur", onWindowBlur)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        hoverQuery.removeEventListener("change", handleHoverChange)
        fieldEl.style.transform = ""
        fieldEl.style.opacity = ""
      }

      rebuild(true)

      window.addEventListener("resize", handleWindowResize, { passive: true })
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(handleWindowResize)
        resizeObserver.observe(containerEl)
      }

      if (reduced) return cleanup

      hoverQuery.addEventListener("change", handleHoverChange)
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      window.addEventListener("pointerdown", onPointerDown, { passive: true })
      window.addEventListener("blur", onWindowBlur)
      document.addEventListener("visibilitychange", handleVisibilityChange)

      if (typeof IntersectionObserver !== "undefined") {
        intersectionObserver = new IntersectionObserver((entries) => {
          const entry = entries[0]
          if (!entry) return
          inView = entry.isIntersecting
          if (inView) {
            startLoop()
          } else {
            stopLoop()
          }
        }, { rootMargin: "120px 0px" })
        intersectionObserver.observe(containerEl)
      }

      scrollTrigger = ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => applyScroll(self.progress),
        onRefresh: (self) => applyScroll(self.progress),
      })

      startLoop()
      return cleanup
    }

    const boot = async () => {
      if (document.fonts) {
        try {
          await Promise.all([
            document.fonts.load(`italic 400 100px "Instrument Serif"`),
            document.fonts.load(`400 12px "JetBrains Mono"`),
          ])
          await document.fonts.ready
        } catch {
          // Fallback serif and monospace still render a usable field.
        }
      }
      if (cancelled) return
      dispose = setup()
    }

    void boot()

    return () => {
      cancelled = true
      dispose?.()
      dispose = undefined
    }
  }, [])

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div ref={fieldRef} className="absolute inset-0">
        <canvas ref={baseRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
        <canvas ref={overlayRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
      </div>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: VIGNETTE }} />
    </div>
  )
}