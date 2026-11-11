import { Suspense, useState } from 'react'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import About from './sections/About'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Journey from './sections/Journey'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import HeroScene from './three/HeroScene'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useCustomCursor } from './hooks/useCustomCursor'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useSmoothScroll()
  const { dotRef, ringRef } = useCustomCursor()

  const handlePreloaderComplete = () => setIsLoading(false)

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Custom Cursor */}
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />

      {/* Film Grain Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-bg focus:px-4 focus:py-2 focus:font-mono focus:text-xs"
      >
        Skip to main content
      </a>

      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main id="main-content">
        {/* Hero with 3D Background */}
        <div className="relative min-h-screen">
          <Suspense fallback={<div className="absolute inset-0 bg-[#0B0B0C]" />}>
            <HeroScene />
          </Suspense>
          <Hero />
        </div>

        <About />
        <Projects />
        <Skills />
        <Journey />
        <Contact />
        <Footer />
      </main>
    </>
  )
}