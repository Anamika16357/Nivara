import React, { useState, useEffect } from 'react';
import { Snowflake } from 'lucide-react';

interface NavigationProps {
  isVisible: boolean;
  onReplayIntro?: () => void;
  activeSection: string;
  onOpenChat?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isVisible, activeSection, onOpenChat }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HER STORY', href: '#story' },
    { name: 'POWERS', href: '#powers' },
    { name: 'MEMORY', href: '#memory' },
    { name: 'SEEK HELP', href: '#help', isHighlight: true }
  ];

  if (!isVisible) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-3 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Sovereign Branding Logo (Clicking returns to top/hero) */}
        <a
          href="#hero"
          className="group flex items-center gap-3 font-cinzel font-bold tracking-[0.35em] text-lg sm:text-xl transition-all duration-300"
        >
          <div
            className={`relative w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
              isScrolled
                ? 'bg-slate-100 border-slate-300/80 text-slate-800 group-hover:border-slate-400 shadow-sm'
                : 'bg-black/40 backdrop-blur-md border-white/30 text-white group-hover:border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
            }`}
          >
            <Snowflake className="w-4 h-4 animate-spin-slow" />
          </div>
          <span className={`font-black transition-colors ${isScrolled ? 'text-slate-950' : 'text-white drop-shadow-md'}`}>
            NIVARA
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          className={`hidden md:flex items-center gap-1 sm:gap-2 lg:gap-6 px-5 py-2 rounded-full border shadow-sm backdrop-blur-md transition-all ${
            isScrolled
              ? 'bg-white/90 border-slate-200/90 text-slate-600'
              : 'bg-black/40 border-white/20 text-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          }`}
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.isHighlight && onOpenChat) {
                    e.preventDefault();
                    onOpenChat();
                  }
                }}
                className={`relative px-4 py-1.5 text-xs font-medium tracking-[0.2em] transition-all duration-300 rounded-full cursor-pointer ${
                  link.isHighlight
                    ? isScrolled
                      ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm'
                      : 'bg-white text-slate-950 font-bold hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : isActive
                    ? isScrolled
                      ? 'text-slate-950 font-bold'
                      : 'text-white font-bold'
                    : isScrolled
                    ? 'text-slate-600 hover:text-slate-950'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                {link.name}
                {isActive && !link.isHighlight && (
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full transition-colors ${
                      isScrolled ? 'bg-slate-900' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    }`}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Mobile Menu Trigger CTA */}
        <button
          onClick={onOpenChat}
          className={`md:hidden px-4 py-1.5 text-[11px] font-cinzel font-semibold tracking-widest rounded-full shadow-sm cursor-pointer ${
            isScrolled ? 'bg-slate-950 text-white' : 'bg-white text-slate-950 font-bold'
          }`}
        >
          SEEK HELP
        </button>
      </div>
    </header>
  );
};
