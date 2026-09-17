import React from 'react';
import { motion } from 'framer-motion';

interface StoryTransitionProps {
  variant?: 'hero-to-story' | 'chapter' | 'story-to-portal';
  className?: string;
}

export const StoryTransition: React.FC<StoryTransitionProps> = ({
  variant = 'chapter',
  className = ''
}) => {
  if (variant === 'hero-to-story') {
    return (
      <div className={`relative w-full h-32 sm:h-48 overflow-hidden pointer-events-none select-none ${className}`}>
        {/* Seamless bridge: white transition from hero bottom into deep midnight realm */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#060c18] to-[#02040a]" />

        {/* Ambient Frost Crystal Ridge */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center opacity-30">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 text-cyan-200">
            <path
              d="M0,60 L60,45 L120,55 L200,30 L280,50 L380,25 L460,50 L560,15 L660,45 L760,20 L860,50 L960,30 L1060,52 L1140,35 L1200,60 Z"
              fill="currentColor"
              fillOpacity="0.08"
            />
          </svg>
        </div>

        {/* Atmospheric Drift Mist */}
        <motion.div
          animate={{ x: ['-5%', '5%', '-5%'], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cyan-950/20 to-transparent blur-2xl"
        />
      </div>
    );
  }

  if (variant === 'story-to-portal') {
    return (
      <div className={`relative w-full h-32 sm:h-44 overflow-hidden pointer-events-none select-none ${className}`}>
        {/* Smooth dark-to-white or dark-to-portal fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-[#050c1b] to-white" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      </div>
    );
  }

  // Chapter-to-chapter transition
  return (
    <div className={`relative w-full h-24 sm:h-36 overflow-hidden pointer-events-none select-none ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="w-36 sm:w-64 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
};
