import React from 'react';
import { SmoothScrollProvider } from './components/layout/SmoothScrollProvider';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/hero/HeroSection';
import { AboutSection } from './components/about/AboutSection';
import { ProjectsSection } from './components/projects/ProjectsSection';
import { SkillsSection } from './components/skills/SkillsSection';
import { ContactSection } from './components/contact/ContactSection';
import { ClosingCta } from './components/layout/ClosingCta';
import { Footer } from './components/layout/Footer';

export const App: React.FC = () => {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-canvas text-gray-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300 overflow-x-hidden">
        <Navbar />
        <main id="main-content" className="flex-grow overflow-x-hidden">
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <SkillsSection />
          <ContactSection />
          <ClosingCta />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
};

export default App;
