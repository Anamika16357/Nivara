import React, { useState } from 'react';
import { Gem, Lock, Sparkles, X, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MemoryCrystal {
  id: number;
  title: string;
  year: string;
  location: string;
  category: string;
  content: string;
  seeker: string;
}

export const MemorySection: React.FC = () => {
  const [selectedCrystal, setSelectedCrystal] = useState<MemoryCrystal | null>(null);

  const crystals: MemoryCrystal[] = [
    {
      id: 1,
      title: 'The Silent Vow of Aethelgard',
      year: '2024',
      location: 'Val-d\'Isère, France',
      category: 'Unspoken Grief',
      seeker: 'Evelyn V.',
      content:
        '“I gave thirty years of my youth to a kingdom that threw my name to the winds. When no court would hear me, Nivara froze my grievance in ice. Now it shines forever.”'
    },
    {
      id: 2,
      title: 'The Shattered Crown of Oakhaven',
      year: '2025',
      location: 'Kyoto, Japan',
      category: 'Betrayed Trust',
      seeker: 'Ren S.',
      content:
        '“My brother stole my inheritance and sealed my lips with gold. The sovereign froze my story in pure crystal. Truth cannot burn where frost endures.”'
    },
    {
      id: 3,
      title: 'Tears of the Forgotten Harbor',
      year: '2023',
      location: 'Reykjavík, Iceland',
      category: 'Lost Identity',
      seeker: 'Kaelen R.',
      content:
        '“They deleted our records and told the world we never existed. Nivara carved our names into absolute zero ice.”'
    },
    {
      id: 4,
      title: 'The Forgotten Symphony',
      year: '2026',
      location: 'Vienna, Austria',
      category: 'Stolen Art',
      seeker: 'Clara M.',
      content:
        '“My life’s composition was plagiarized by titan corporations. Nivara’s frost holds the original melody immutable.”'
    }
  ];

  const handleOpenCrystal = (crystal: MemoryCrystal) => {
    setSelectedCrystal(crystal);
    soundManager.playCrystalChime(1050);
  };

  const handleCloseModal = () => {
    setSelectedCrystal(null);
    soundManager.playCrystalChime(600);
  };

  return (
    <section id="memory" className="relative py-28 px-6 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-cinzel tracking-[0.3em] mb-4 shadow-sm">
            <Gem className="w-3.5 h-3.5 text-slate-700" />
            <span>CHAPTER III — CRYSTALLINE VAULT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-[0.2em] text-slate-950 uppercase mb-6">
            MEMORY CRYSTAL VAULT
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mb-6" />
          <p className="font-cormorant text-xl text-slate-600 italic">
            “Each crystal holds a story the world tried to erase. In Nivara’s vault, nothing is lost.”
          </p>
        </div>

        {/* Crystals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {crystals.map((c) => (
            <div
              key={c.id}
              onClick={() => handleOpenCrystal(c)}
              className="group cursor-pointer p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-cinzel text-[10px] tracking-widest text-slate-500 uppercase font-semibold">
                    {c.category}
                  </span>
                  <div className="p-2 rounded-full bg-slate-100 border border-slate-200 group-hover:scale-110 group-hover:bg-slate-200 transition-all">
                    <Gem className="w-4 h-4 text-slate-700" />
                  </div>
                </div>

                <h3 className="font-cinzel font-bold text-lg text-slate-950 mb-2 group-hover:text-slate-800 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                  {c.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-cinzel text-slate-500">
                <span>{c.seeker}</span>
                <span className="font-bold text-slate-700">{c.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Lightbox for Crystal Inspection */}
      {selectedCrystal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-2xl">
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-slate-700" />
              <span className="font-cinzel text-xs tracking-widest text-slate-600 uppercase font-semibold">
                SEALED IN ABSOLUTE ZERO MATRIX
              </span>
            </div>

            <h3 className="text-2xl font-bold font-cinzel text-slate-950 mb-2">
              {selectedCrystal.title}
            </h3>

            <div className="flex items-center gap-4 text-xs font-cinzel text-slate-500 mb-6">
              <span>SEEKER: {selectedCrystal.seeker}</span>
              <span>•</span>
              <span>LOCATION: {selectedCrystal.location}</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
              <p className="font-cormorant text-xl text-slate-800 italic leading-relaxed font-medium">
                {selectedCrystal.content}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-cinzel text-slate-600 font-medium">
              <span>STATUS: IMMUTABLE</span>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span>PRESERVED BY NIVARA</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
