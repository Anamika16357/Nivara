import React, { useState } from 'react';
import { Snowflake, Shield, Zap, Lock, Sparkles, Activity } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PowerCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  stats: { label: string; value: string }[];
  imageSrc: string;
}

export const PowersSection: React.FC = () => {
  const [activePower, setActivePower] = useState<string>('absolute-zero');

  const powers: PowerCard[] = [
    {
      id: 'absolute-zero',
      title: 'ABSOLUTE ZERO',
      subtitle: 'METAPHYSICAL STABILITY AT -273.15°C',
      icon: <Snowflake className="w-6 h-6 text-current" />,
      description:
        'Instantly drops ambient kinetic and emotional energy to absolute zero. Chaos halts, hostility freezes in mid-stride, and absolute quietude reigns across her domain.',
      stats: [
        { label: 'Thermal Output', value: '0 Kelvin' },
        { label: 'Domain Radius', value: 'Global' },
        { label: 'Duration', value: 'Permanent' }
      ],
      imageSrc: '/assets/02_hydro_shield.png'
    },
    {
      id: 'cryo-memory',
      title: 'CRYO-MEMORY VAULT',
      subtitle: 'INDESTRUCTIBLE CRYSTALLINE PRESERVATION',
      icon: <Lock className="w-6 h-6 text-current" />,
      description:
        'Locks spoken words, grievances, and forgotten human memories inside flawless crystal lattice matrices. No time, corruption, or mortal falsehood can ever distort them.',
      stats: [
        { label: 'Matrix Hardness', value: '10/10 Mohs' },
        { label: 'Decay Rate', value: '0.00%' },
        { label: 'Fidelity', value: 'Absolute' }
      ],
      imageSrc: '/assets/03_celestial_tideblade.png'
    },
    {
      id: 'glacial-shield',
      title: 'GLACIAL SHIELD',
      subtitle: 'REFLECTIVE REASONING & REPRESSION',
      icon: <Shield className="w-6 h-6 text-current" />,
      description:
        'A mirror-like wall of glacial diamond reflecting external malice back onto its originator, leaving the protected individual inside an impenetrable sanctuary of ice.',
      stats: [
        { label: 'Reflectivity', value: '100%' },
        { label: 'Absorption', value: 'Infinite' },
        { label: 'Aura Effect', value: 'Peace' }
      ],
      imageSrc: '/assets/04_abyssal_battle.png'
    },
    {
      id: 'soul-frosting',
      title: 'SOUL FROSTING',
      subtitle: 'TRANQUILLITY FOR BROKEN HEARTS',
      icon: <Sparkles className="w-6 h-6 text-current" />,
      description:
        'Gently cools burning anxiety, despair, and fiery grief, transforming emotional turmoil into quiet crystal clarity.',
      stats: [
        { label: 'Calm Factor', value: 'Maximal' },
        { label: 'Resonance', value: 'Sublime' },
        { label: 'Harm Harmonic', value: 'None' }
      ],
      imageSrc: '/assets/05_vortex_attack.png'
    }
  ];

  const handleCardClick = (id: string) => {
    setActivePower(id);
    soundManager.playCrystalChime(800 + Math.random() * 400);
  };

  return (
    <section id="powers" className="relative py-28 px-6 bg-slate-50/60 overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-cinzel tracking-[0.3em] mb-4 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-slate-700" />
            <span>CHAPTER II — DOMAIN CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-[0.2em] text-slate-950 uppercase mb-6">
            NIVARA'S POWERS
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mb-6" />
          <p className="font-cormorant text-xl text-slate-600 italic">
            “Power is not defined by destruction, but by what one can keep frozen and untainted.”
          </p>
        </div>

        {/* Powers Interactive Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Power Selector List */}
          <div className="lg:col-span-5 space-y-4">
            {powers.map((p) => {
              const isSelected = activePower === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleCardClick(p.id)}
                  className={`cursor-pointer p-6 rounded-2xl transition-all duration-500 flex items-center justify-between border ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-lg translate-x-2 ring-1 ring-slate-900/10'
                      : 'bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.icon}
                    </div>
                    <div>
                      <h3 className="font-cinzel font-bold text-base tracking-wider text-slate-950">
                        {p.title}
                      </h3>
                      <p className="font-cinzel text-[10px] tracking-widest text-slate-500">
                        {p.subtitle}
                      </p>
                    </div>
                  </div>
                  <Activity
                    className={`w-4 h-4 transition-opacity ${
                      isSelected ? 'text-slate-950 opacity-100' : 'text-slate-300 opacity-0'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Active Power Preview Panel */}
          <div className="lg:col-span-7">
            {powers.map((p) => {
              if (p.id !== activePower) return null;
              return (
                <div
                  key={p.id}
                  className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl animate-fade-in flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-cinzel text-[11px] tracking-widest">
                        SOVEREIGN DOMAIN CONTROL
                      </span>
                      <Sparkles className="w-5 h-5 text-slate-400 animate-pulse" />
                    </div>

                    <h3 className="text-3xl font-extrabold font-cinzel tracking-wider text-slate-950 mb-2">
                      {p.title}
                    </h3>
                    <p className="font-cinzel text-xs tracking-widest text-slate-500 mb-6">
                      {p.subtitle}
                    </p>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                      {p.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {p.stats.map((s, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                          <p className="font-cinzel text-[10px] tracking-wider text-slate-500 uppercase mb-1">
                            {s.label}
                          </p>
                          <p className="font-cinzel text-sm sm:text-base font-bold text-slate-950">
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Artwork Showcase */}
                  <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img
                      src={p.imageSrc}
                      alt={p.title}
                      className="w-full h-full object-cover filter brightness-[0.98]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
