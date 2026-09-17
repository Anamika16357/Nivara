import React from 'react';
import { ArrowDown, MessageSquare, Compass, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { CinematicHeroBackground } from './CinematicHeroBackground';

interface HeroSectionProps {
  onOpenHelpPortal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenHelpPortal }) => {
  const handlePrimaryClick = () => {
    soundManager.playCrystalChime(750);
    const element = document.getElementById('story');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSecondaryClick = () => {
    soundManager.playCrystalChime(950);
    onOpenHelpPortal();
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between items-center text-center overflow-hidden bg-black text-white pt-20 sm:pt-24 pb-8 sm:pb-12"
    >
      {/* 100% Native Clarity Video Canvas (Physical pixel 1:1 render, no scaling blur) */}
      <CinematicHeroBackground fillMode="cover" className="absolute inset-0 z-0" />

      {/* Subtle Top Air Gradient (Minimal fade so top bar stays crisp) */}
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* Clean Bottom Seam (Smooth cinematic gradient transition into realm below) */}
      <div className="absolute bottom-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-transparent via-black/70 to-[#02040a] pointer-events-none z-10" />

      {/* Top Header Region: Sovereign Crest & Royal Title */}
      <div className="relative z-20 flex flex-col items-center pt-2 animate-fade-in">
        {/* Sovereign Crest Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-[10px] sm:text-xs font-cinzel tracking-[0.3em] shadow-lg mb-2">
          <Sparkles className="w-3.5 h-3.5 text-slate-200" />
          <span>CANONICAL SOVEREIGN DOMAIN</span>
        </div>

        {/* Regal Title & Epithet */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-cinzel tracking-[0.25em] text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] select-none">
          NIVARA
        </h1>
        <h2 className="text-[11px] sm:text-xs md:text-sm font-cinzel font-semibold tracking-[0.45em] text-slate-300 uppercase drop-shadow-md">
          THE ICE SOVEREIGN
        </h2>
      </div>

      {/* Center Zone: Intentionally left completely open and clear so Nivara's face, eyes, and ice fracture details are 100% unobstructed */}
      <div className="flex-1 w-full pointer-events-none" />

      {/* Bottom Region: Quotes, CTAs, and Navigation Guidance */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 flex flex-col items-center animate-fade-in">
        {/* Poetic Inscription */}
        <div className="mb-6 space-y-1.5">
          <blockquote className="text-base sm:text-xl md:text-2xl font-cormorant italic text-white tracking-wide font-medium drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
            “SHE FREEZES WHAT THE WORLD FORGETS.”
          </blockquote>
          <p className="text-[10px] sm:text-xs font-cinzel tracking-[0.3em] text-slate-400 uppercase font-medium drop-shadow-md">
            “THE COLD DIDN'T CHOOSE HER. THE WORLD DID.”
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full sm:w-auto mb-6">
          {/* Primary CTA */}
          <button
            onClick={handlePrimaryClick}
            className="group relative w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-slate-950 font-cinzel text-xs sm:text-sm font-bold tracking-[0.25em] transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-slate-100 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-800 group-hover:rotate-45 transition-transform duration-500" />
              ENTER NIVARA'S WORLD
            </span>
          </button>

          {/* Secondary CTA */}
          <button
            onClick={handleSecondaryClick}
            className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white font-cinzel text-xs sm:text-sm font-semibold tracking-[0.25em] transition-all duration-300 hover:bg-white/20 hover:border-white/60 flex items-center justify-center gap-2.5 shadow-md"
          >
            <MessageSquare className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform duration-300" />
            <span>TELL HER YOUR STORY</span>
          </button>
        </div>

        {/* Scroll Indicator */}
        <div
          onClick={handlePrimaryClick}
          className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer transition-colors duration-300 mb-2 group select-none"
        >
          <span className="font-cinzel text-[9px] sm:text-[10px] tracking-[0.35em] uppercase font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:tracking-[0.4em] transition-all">
            SCROLL TO DISCOVER
          </span>
          <ArrowDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-white animate-bounce drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" />
        </div>
      </div>
    </section>
  );
};
