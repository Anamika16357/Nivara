import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Snowflake, Shield, Activity, Compass } from 'lucide-react';

interface Faculty {
  id: string;
  title: string;
  category: string;
  desc: string;
  icon: React.ReactNode;
  temperature: string;
  vector: string;
}

export const ThermalGiftVisual: React.FC = () => {
  const [activeFaculty, setActiveFaculty] = useState<string>('extraction');

  const faculties: Faculty[] = [
    {
      id: 'extraction',
      title: 'THERMAL EXTRACTION',
      category: 'PRIMARY DISCIPLINE',
      desc: 'Pulls heat from ambient atmosphere at microscopic speed, collapsing kinetic vibration to absolute stasis.',
      icon: <Snowflake className="w-4 h-4 text-cyan-200" />,
      temperature: '-273.15°C',
      vector: 'KINETIC DRAW'
    },
    {
      id: 'crystalline',
      title: 'CRYSTALLINE STRUCTURING',
      category: 'MATTER CONTROL',
      desc: 'Rearranges moisture and mineral atoms into flawless hexagonal lattices with Mohs 10 diamond hardness.',
      icon: <Compass className="w-4 h-4 text-cyan-200" />,
      temperature: '-120.00°C',
      vector: 'LATTICE DENSITY'
    },
    {
      id: 'barriers',
      title: 'GLACIAL BARRIERS',
      category: 'DEFENSIVE ARCHITECTURE',
      desc: 'Raises dense, thermal-reflective shields that deflect impact energy and disperse incoming shockwaves.',
      icon: <Shield className="w-4 h-4 text-cyan-200" />,
      temperature: '-196.00°C',
      vector: 'IMPACT SHIELD'
    },
    {
      id: 'stasis',
      title: 'KINETIC STASIS',
      category: 'FIELD EFFECT',
      desc: 'Freezes movement across entire zones, locking projectiles and enemies in suspended thermodynamic arrest.',
      icon: <Activity className="w-4 h-4 text-cyan-200" />,
      temperature: '0.00 KELVIN',
      vector: 'ENTROPY HALT'
    }
  ];

  const current = faculties.find((f) => f.id === activeFaculty) || faculties[0];

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl p-6 sm:p-8 bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background Crystalline Watermark & Gradients */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-950/20 blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Header telemetry readout */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-cyan-200/80 font-semibold">
            THERMAL TELEMETRY
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-400 tracking-wider">
          STATE: <span className="text-white font-bold">{current.temperature}</span>
        </div>
      </div>

      {/* Crystalline Lattice Vector Graphic */}
      <div className="relative h-44 sm:h-52 w-full flex items-center justify-center my-2 select-none">
        <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
          {/* Hexagonal nodes & connections */}
          <g stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" fill="none">
            {/* Horizontal lattice lines */}
            <line x1="40" y1="90" x2="360" y2="90" strokeDasharray="4 6" />
            <line x1="120" y1="40" x2="280" y2="40" strokeDasharray="2 4" />
            <line x1="120" y1="140" x2="280" y2="140" strokeDasharray="2 4" />

            {/* Hexagonal central matrix */}
            <polygon
              points="200,30 260,65 260,115 200,150 140,115 140,65"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="1.2"
              fill="rgba(8, 145, 178, 0.04)"
            />
            <polygon
              points="200,50 240,75 240,105 200,130 160,105 160,75"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="0.8"
            />

            {/* Connecting diagonal spokes */}
            <line x1="70" y1="90" x2="140" y2="65" />
            <line x1="70" y1="90" x2="140" y2="115" />
            <line x1="330" y1="90" x2="260" y2="65" />
            <line x1="330" y1="90" x2="260" y2="115" />
          </g>

          {/* Central thermal core */}
          <circle cx="200" cy="90" r="14" fill="rgba(6, 182, 212, 0.15)" />
          <circle
            cx="200"
            cy="90"
            r="6"
            fill="#e0f2fe"
            className="animate-pulse"
            style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}
          />

          {/* Exterior nodes with interactive coordinates */}
          {[
            { cx: 140, cy: 65, active: activeFaculty === 'extraction' },
            { cx: 260, cy: 65, active: activeFaculty === 'crystalline' },
            { cx: 260, cy: 115, active: activeFaculty === 'barriers' },
            { cx: 140, cy: 115, active: activeFaculty === 'stasis' }
          ].map((node, i) => (
            <g key={i}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.active ? 7 : 4}
                fill={node.active ? '#38bdf8' : 'rgba(255,255,255,0.4)'}
                className="transition-all duration-300"
              />
              {node.active && (
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="12"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  className="animate-ping"
                  opacity="0.6"
                />
              )}
            </g>
          ))}
        </svg>

        {/* Floating node annotation */}
        <div className="absolute top-2 right-4 text-right">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">VECTOR</span>
          <p className="text-xs font-cinzel font-semibold text-cyan-200">{current.vector}</p>
        </div>
      </div>

      {/* Interactive Faculty Selector Pills */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
        {faculties.map((fac) => {
          const isActive = fac.id === activeFaculty;
          return (
            <button
              key={fac.id}
              onClick={() => setActiveFaculty(fac.id)}
              className={`text-left p-3 rounded-xl border transition-all duration-300 flex items-center gap-2.5 ${
                isActive
                  ? 'bg-white/15 border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 text-slate-400'
                }`}
              >
                {fac.icon}
              </div>
              <div className="overflow-hidden">
                <span className="block text-[10px] font-cinzel tracking-wider text-slate-400 truncate">
                  {fac.category}
                </span>
                <span className="block text-xs font-cinzel font-bold text-white tracking-wide truncate">
                  {fac.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Faculty Narrative Description */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed font-light"
      >
        <span className="text-cyan-200 font-cinzel font-semibold tracking-wider mr-2">
          MANIFESTATION:
        </span>
        {current.desc}
      </motion.div>
    </div>
  );
};
