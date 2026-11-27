import { useCallback, useEffect, useState } from 'react'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import About from './sections/About'
import Certificates from './sections/Certificates'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Journey from './sections/Journey'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import CodeGlyphField from './components/CodeGlyphField'
import { getLenis, scrollToSection, useSmoothScroll } from './hooks/useSmoothScroll'
import { useCustomCursor } from './hooks/useCustomCursor'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useSmoothScroll()
  const { dotRef, ringRef } = useCustomCursor()

  const handlePreloaderComplete = useCallback(() => setIsLoading(false), [])

  useEffect(() => {
    const lenis = getLenis();
    if (isLoading) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  }, [isLoading])

  useEffect(() => {
    if (isLoading) return;
    const hash = window.location.hash;
    if (!hash) return;
    let target: Element | null = null;
    try {
      target = document.querySelector(hash);
    } catch {
      return;
    }
    if (!target) return;
    const frame = requestAnimationFrame(() => scrollToSection(hash, false));
    return () => cancelAnimationFrame(frame);
  }, [isLoading])

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Custom Cursor */}
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />

      {/* Film Grain Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      <div inert={isLoading ? true : undefined}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-bg focus:px-4 focus:py-2 focus:font-mono focus:text-xs"
        >
          Skip to main content
        </a>

        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main id="main-content" tabIndex={-1} aria-busy={isLoading} className="focus:outline-none">
          {/* Hero with CodeGlyphField background */}
          <div className="relative min-h-screen">
            <CodeGlyphField />
            <Hero />
          </div>

          <About />
          <Certificates />
          <Projects />
          <Skills />
          <Journey />
          <Contact />
        </main>

        <Footer />
      </div>
    </>
  )
}