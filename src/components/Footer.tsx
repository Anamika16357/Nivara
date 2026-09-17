import React from 'react';
import { Snowflake, ChevronUp, Shield, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    soundManager.playCrystalChime(900);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-16 px-6 bg-slate-50 border-t border-slate-200 text-slate-600 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-sm">
            <Snowflake className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-sm text-slate-950 tracking-[0.25em]">
              NIVARA — THE ICE SOVEREIGN
            </h3>
            <p className="text-[11px] text-slate-500 font-cinzel tracking-wider">
              “SHE FREEZES WHAT THE WORLD FORGETS.”
            </p>
          </div>
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-cinzel tracking-[0.2em] font-medium">
          <a href="#hero" className="hover:text-slate-950 transition-colors">HOME</a>
          <a href="#story" className="hover:text-slate-950 transition-colors">HER STORY</a>
          <a href="#powers" className="hover:text-slate-950 transition-colors">POWERS</a>
          <a href="#memory" className="hover:text-slate-950 transition-colors">MEMORY</a>
          <a href="#help" className="hover:text-slate-950 transition-colors">SEEK HELP</a>
        </div>

        {/* Right Controls & Back to Top */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-slate-600 border border-slate-300 px-3 py-1 rounded-full bg-white shadow-sm font-semibold">
            DOMAIN ACTIVE • -273.15°C
          </span>

          <button
            onClick={scrollToTop}
            aria-label="Back to Top"
            className="p-3 rounded-full bg-white border border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100 hover:border-slate-400 shadow-sm transition-all"
            title="Scroll to top"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-cinzel text-slate-500">
        <p>© 2026 NIVARA SOVEREIGN DOMAIN. ALL CANONICAL ASSETS PRESERVED.</p>
        <p className="flex items-center gap-1">
          <span>CANONICAL CHARACTER EXPERIENCE</span>
          <Sparkles className="w-3 h-3 text-slate-600" />
        </p>
      </div>
    </footer>
  );
};
