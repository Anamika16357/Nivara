import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const MemoryCrystal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Smooth scroll transformations
  const crystalScale = useTransform(scrollYProgress, [0.1, 0.4, 0.7, 0.95], [0.65, 1, 1, 0.85]);
  const crystalOpacity = useTransform(scrollYProgress, [0.08, 0.35, 0.8, 1], [0.1, 1, 1, 0.2]);
  const crystalRotate = useTransform(scrollYProgress, [0, 1], [-15, 25]);
  const fragmentSpread = useTransform(scrollYProgress, [0.3, 0.8], [0, 45]);
  const corePulse = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.3, 0.85, 0.4]);

  return (
    <div
      ref={containerRef}
      className="relative w-72 sm:w-96 h-72 sm:h-96 mx-auto flex items-center justify-center select-none"
    >
      {/* Outer Atmospheric Aura (Subtle cold mist) */}
      <motion.div
        style={{ opacity: corePulse }}
        className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-radial from-cyan-400/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none"
      />

      {/* Floating Memory Fragments (Shards drifting away) */}
      {[
        { x: -75, y: -70, s: 0.8, d: 0 },
        { x: 80, y: -60, s: 0.6, d: 1.2 },
        { x: -85, y: 55, s: 0.7, d: 2.1 },
        { x: 75, y: 70, s: 0.9, d: 0.8 },
        { x: -30, y: -100, s: 0.5, d: 1.7 },
        { x: 35, y: 95, s: 0.65, d: 2.5 }
      ].map((shard, i) => (
        <motion.div
          key={i}
          style={{
            translateX: useTransform(fragmentSpread, (v) => shard.x * (1 + v / 35)),
            translateY: useTransform(fragmentSpread, (v) => shard.y * (1 + v / 30)),
            scale: shard.s,
            opacity: crystalOpacity
          }}
          animate={{
            y: [0, -8, 0],
            rotate: [0, 8, -4, 0]
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shard.d
          }}
          className="absolute w-4 h-7 pointer-events-none"
        >
          <svg viewBox="0 0 24 40" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            <polygon
              points="12,2 22,20 12,38 2,20"
              fill="rgba(226, 232, 240, 0.25)"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="0.8"
            />
          </svg>
        </motion.div>
      ))}

      {/* Gathering Ambient Particles (Converging onto the crystal) */}
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={`p-${i}`}
          animate={{
            scale: [0.6, 1.2, 0.6],
            opacity: [0.2, 0.7, 0.2],
            rotate: 360
          }}
          transition={{
            duration: 6 + (i % 4),
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.4
          }}
          style={{
            top: `${20 + (i * 27) % 60}%`,
            left: `${15 + (i * 31) % 70}%`
          }}
          className="absolute w-1 h-1 rounded-full bg-cyan-200/70 shadow-[0_0_6px_rgba(186,230,253,0.8)] pointer-events-none"
        />
      ))}

      {/* Core Memory Crystal (Precision 3D geometric SVG lattice) */}
      <motion.div
        style={{
          scale: crystalScale,
          opacity: crystalOpacity,
          rotate: crystalRotate
        }}
        className="relative w-48 sm:w-64 h-60 sm:h-80 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 200 280"
          className="w-full h-full overflow-visible drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Crystalline Refraction Gradients */}
            <linearGradient id="facetTopLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#94a3b8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="facetTopRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="facetCenter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#bae6fd" stopOpacity="0.3" />
              <stop offset="80%" stopColor="#1e293b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="facetBottom" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#02040a" stopOpacity="0.9" />
            </linearGradient>

            <radialGradient id="innerMemoryLight" cx="50%" cy="45%" r="45%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Internal Soul / Memory Pulse */}
          <circle cx="100" cy="130" r="32" fill="url(#innerMemoryLight)" className="animate-pulse" />

          {/* Back Facets */}
          <polygon points="100,15 155,75 145,185 100,265" fill="#0f172a" fillOpacity="0.5" />
          <polygon points="100,15 45,75 55,185 100,265" fill="#0b1120" fillOpacity="0.6" />

          {/* Main Translucent Hexagonal Bipyramid Facets */}
          {/* Top-Left facet */}
          <polygon
            points="100,15 45,75 100,120"
            fill="url(#facetTopLeft)"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="0.75"
          />

          {/* Top-Right facet */}
          <polygon
            points="100,15 155,75 100,120"
            fill="url(#facetTopRight)"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="0.75"
          />

          {/* Mid-Left facet */}
          <polygon
            points="45,75 100,120 100,195 55,185"
            fill="url(#facetCenter)"
            stroke="rgba(226, 232, 240, 0.35)"
            strokeWidth="0.75"
          />

          {/* Mid-Right facet */}
          <polygon
            points="155,75 100,120 100,195 145,185"
            fill="url(#facetCenter)"
            stroke="rgba(226, 232, 240, 0.45)"
            strokeWidth="0.75"
          />

          {/* Bottom-Left facet */}
          <polygon
            points="55,185 100,195 100,265"
            fill="url(#facetBottom)"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="0.75"
          />

          {/* Bottom-Right facet */}
          <polygon
            points="145,185 100,195 100,265"
            fill="url(#facetBottom)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="0.75"
          />

          {/* Crystalline Spine Light Reflections */}
          <line
            x1="100"
            y1="15"
            x2="100"
            y2="265"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="0.9"
            strokeDasharray="180 5"
          />
          <line
            x1="45"
            y1="75"
            x2="155"
            y2="75"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="0.6"
          />
          <line
            x1="55"
            y1="185"
            x2="145"
            y2="185"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="0.6"
          />
        </svg>

        {/* Soft Center Specular Gleam */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white blur-[1px] shadow-[0_0_12px_rgba(255,255,255,0.9)] pointer-events-none" />
      </motion.div>
    </div>
  );
};
