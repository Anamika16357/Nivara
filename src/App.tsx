import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { NivaraStory } from './components/story/NivaraStory';
import { Footer } from './components/Footer';
import { NivaraChatDrawer } from './components/NivaraChatDrawer';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);

  const handleReplayIntro = () => {
    const heroEl = document.getElementById('hero');
    heroEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenChat = () => {
    setIsChatDrawerOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatDrawerOpen(false);
  };

  // Scroll spy for active navigation highlighting
  useEffect(() => {
    const sections = ['hero', 'story', 'powers', 'memory', 'zerostate'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* 1. Minimal Floating Navigation Header */}
      <Navigation
        isVisible={true}
        onReplayIntro={handleReplayIntro}
        activeSection={activeSection}
        onOpenChat={handleOpenChat}
      />

      {/* 2. Main Website Sections with Living Cinematic Hero */}
      <main className="relative z-10">
        <HeroSection onOpenHelpPortal={handleOpenChat} />
        <NivaraStory onOpenChat={handleOpenChat} />
      </main>

      {/* 3. Side Pop Up Chatting Interface & Persistent Floating Trigger */}
      <NivaraChatDrawer
        isOpen={isChatDrawerOpen}
        onOpen={handleOpenChat}
        onClose={handleCloseChat}
      />

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}

