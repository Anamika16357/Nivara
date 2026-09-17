import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface StoryChapterProps {
  id?: string;
  number: string;
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export const StoryChapter: React.FC<StoryChapterProps> = ({
  id,
  number,
  eyebrow,
  children,
  className = '',
  fullHeight = true
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Smooth cinematic scroll parallax
  const opacity = useTransform(scrollYProgress, [0.05, 0.25, 0.75, 0.95], [0, 1, 1, 0.1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id={id}
      ref={containerRef}
      className={`relative w-full ${
        fullHeight ? 'min-h-[100vh] lg:min-h-[115vh]' : 'min-h-[85vh]'
      } flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 sm:py-28 overflow-hidden ${className}`}
    >
      {/* Chapter Marker / Subtle Eyebrow */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 max-w-7xl mx-auto w-full mb-8 sm:mb-12 flex items-center gap-3 select-none"
      >
        <span className="font-cinzel text-[11px] sm:text-xs font-bold tracking-[0.35em] text-cyan-200/90 uppercase">
          {number} — {eyebrow}
        </span>
        <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-cyan-400/40 to-transparent" />
      </motion.div>

      {/* Main Chapter Content Body */}
      <motion.div
        style={{ opacity, y: translateY }}
        className="relative z-15 max-w-7xl mx-auto w-full"
      >
        {children}
      </motion.div>
    </section>
  );
};
