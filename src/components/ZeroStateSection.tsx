import React, { useState, useEffect } from 'react';
import { Thermometer, ShieldAlert, Cpu, Activity, Snowflake, Globe } from 'lucide-react';

export const ZeroStateSection: React.FC = () => {
  const [frozenCount, setFrozenCount] = useState(148920);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrozenCount((prev) => prev + Math.floor(Math.random() * 2));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="zerostate" className="relative py-28 px-6 bg-slate-50/60 overflow-hidden border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-cinzel tracking-[0.3em] mb-4 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-slate-700" />
            <span>CHAPTER IV — TELEMETRY & DOMAIN METRICS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-[0.2em] text-slate-950 uppercase mb-6">
            ZERO STATE DOMAIN
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mb-6" />
          <p className="font-cormorant text-xl text-slate-600 italic">
            “At absolute zero, entropy ceases. No chaos can survive her presence.”
          </p>
        </div>

        {/* Real-time Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Domain Temperature */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-cinzel text-xs tracking-widest text-slate-500 uppercase font-semibold">
                DOMAIN TEMP
              </span>
              <Thermometer className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <p className="font-cinzel text-3xl sm:text-4xl font-black text-slate-950 mb-1">
                -273.15°C
              </p>
              <p className="font-mono text-xs text-slate-500">0.0000 KELVIN</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-cinzel text-slate-500">
              <span>THERMAL STATE</span>
              <span className="text-slate-950 font-bold">ABSOLUTE ZERO</span>
            </div>
          </div>

          {/* Card 2: Frozen Grievances */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-cinzel text-xs tracking-widest text-slate-500 uppercase font-semibold">
                PRESERVED MEMORIES
              </span>
              <Snowflake className="w-5 h-5 text-slate-700 animate-spin-slow" />
            </div>
            <div>
              <p className="font-cinzel text-3xl sm:text-4xl font-black text-slate-950 mb-1">
                {frozenCount.toLocaleString()}
              </p>
              <p className="font-mono text-xs text-slate-500">CRYSTALLINE RECORDS</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-cinzel text-slate-500">
              <span>DECAY RATE</span>
              <span className="text-slate-950 font-bold">0.00% PER CENTURY</span>
            </div>
          </div>

          {/* Card 3: Frost Stability */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-cinzel text-xs tracking-widest text-slate-500 uppercase font-semibold">
                FROST STABILITY
              </span>
              <ShieldAlert className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <p className="font-cinzel text-3xl sm:text-4xl font-black text-slate-950 mb-1">
                99.999%
              </p>
              <p className="font-mono text-xs text-slate-500">SANCTUARY MATRIX</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-cinzel text-slate-500">
              <span>SECURITY LEVEL</span>
              <span className="text-slate-950 font-bold">IMMUTABLE</span>
            </div>
          </div>

          {/* Card 4: Global Resonance */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-cinzel text-xs tracking-widest text-slate-500 uppercase font-semibold">
                WORLD REACH
              </span>
              <Globe className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <p className="font-cinzel text-3xl sm:text-4xl font-black text-slate-950 mb-1">
                195/195
              </p>
              <p className="font-mono text-xs text-slate-500">NATIONS HEARD</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-cinzel text-slate-500">
              <span>LISTENING STATUS</span>
              <span className="text-slate-950 font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
