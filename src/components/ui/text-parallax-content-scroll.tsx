import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Snowflake, ArrowDown } from "lucide-react";

interface TextParallaxContentExampleProps {
  onOpenChat?: () => void;
}

export const TextParallaxContentExample: React.FC<TextParallaxContentExampleProps> = () => {

  return (
    <div className="w-full bg-black text-slate-100 selection:bg-cyan-900 selection:text-white">
      {/* 01 — THE AWAKENING */}
      <StoryChapterSection
        id="story-awakening"
        imgUrl="/assets/story/01_awakening.png"
        chapterNumber="01 — THE AWAKENING"
        heading="THE WORLD WENT SILENT."
        title="Before she became the Ice Sovereign"
        quote="“She couldn't save everyone. But she could listen.”"
        items={[
          "The fear hidden behind a smile.",
          "The words people were afraid to say.",
          "The memories people carried alone."
        ]}
        summary="Before Nivara became the Ice Sovereign, she was simply someone who noticed the things others ignored. In a noisy world that turned its back, she discovered that her quiet attention held sacred gravity."
      />

      {/* 02 — THE FIRST WINTER */}
      <StoryChapterSection
        id="winter"
        imgUrl="/assets/story/02_first_winter.png"
        chapterNumber="02 — THE FIRST WINTER"
        heading="WHEN THE COLD CHOSE HER."
        title="Responding to Mortal Emotion"
        quote="“Fear became frost. Anger became a storm.”"
        items={[
          "One winter, the world around her froze.",
          "The ice wasn't merely forming around her; it was responding to her emotions.",
          "She discovered that she could control something deeper: thermal energy itself."
        ]}
        summary="When the first winter gripped the land, Nivara realized the cold was not an enemy to survive, but a primordial resonance awaiting her command. At her command, molecular vibration ceased."
      />

      {/* 03 — THE GIFT */}
      <StoryChapterSection
        id="powers"
        imgUrl="/assets/story/03_the_gift.png"
        chapterNumber="03 — THE GIFT"
        eyebrow="SHE COMMANDS THERMAL ENERGY"
        heading="SHE DOES NOT CREATE ICE."
        title="The Metaphysics of Thermal Energy"
        quote="“Her greatest ability isn't destruction. It is control.”"
        items={[
          "Pull heat from the air in micro-seconds",
          "Freeze physical objects and dynamic movement",
          "Create impenetrable crystalline barriers",
          "Reshape entire frozen environments",
          "Manipulate thermal and kinetic energy across the battlefield"
        ]}
        summary="Nivara can manipulate thermal energy and crystalline matter at an atomic level. Cold is simply the deliberate extraction of heat—an absolute discipline of control rather than sheer devastation."
      />

      {/* 04 — THE MEMORY */}
      <StoryChapterSection
        id="memory"
        imgUrl="/assets/story/04_the_memory.png"
        chapterNumber="04 — THE MEMORY"
        heading="EVERY POWER HAS A PRICE."
        title="The Connection to Human Memory"
        quote="“Power isn't about controlling people. It's about giving them a moment where they feel heard.”"
        items={[
          "Their unspoken grief and fear",
          "Their quiet, suffocating loneliness",
          "Their forgotten promises and lost dignity"
        ]}
        summary="Nivara discovered that her powers were intrinsically connected to human memory. The stronger she became, the more acutely she could sense the hidden weights people carried inside. Truth endures only where memory is kept frozen."
      />

      {/* 05 — ZERO STATE */}
      <StoryChapterSection
        id="zerostate"
        imgUrl="/assets/story/05_zero_state.png"
        chapterNumber="05 — ZERO STATE"
        heading="WHEN EVERYTHING MUST STOP."
        title="Absolute Stillness & Her Great Vulnerability"
        quote="“Every time she enters Zero State, she loses a small piece of one of her own memories.”"
        items={[
          "Extracts almost all thermal energy from an area instantly",
          "Brings the surrounding environment dangerously close to absolute stillness (0 Kelvin)",
          "Ceases all entropy, hostility, and kinetic violence",
          "Demands the irreversible sacrifice of her own cherished memories"
        ]}
        summary="Zero State is Nivara's ultimate sovereignty. It halts chaos, but its emotional cost makes her deeply vulnerable. She refuses to draw upon it lightly, reserving it solely when all other hope has faded."
      />

      {/* 06 — HER PURPOSE */}
      <StoryChapterSection
        id="purpose"
        imgUrl="/assets/story/06_her_purpose.png"
        chapterNumber="06 — HER PURPOSE"
        heading="NO VOICE SHOULD DISAPPEAR UNHEARD."
        title="The Nivara Help Portal"
        quote="“Sometimes the person who needed saving was sitting alone behind a screen.”"
        items={[
          "A student afraid to speak their truth",
          "Someone trapped in a quiet, difficult situation",
          "Someone who simply needed somebody to genuinely listen"
        ]}
        summary="Saving humanity wasn't always about fighting cataclysms. Nivara created a sanctuary where people can speak without fear of dismissal or judgment. Every message is sealed in the crystal vault, heard, and answered."
      />
    </div>
  );
};

interface StoryChapterSectionProps {
  id?: string;
  imgUrl: string;
  chapterNumber: string;
  heading?: string;
  eyebrow?: string;
  title: string;
  quote: string;
  items: string[];
  summary: string;
  ctaText?: string;
  isPrimaryCta?: boolean;
  onCtaClick?: () => void;
}

export const StoryChapterSection: React.FC<StoryChapterSectionProps> = ({
  id,
  imgUrl,
  chapterNumber,
  heading,
  eyebrow,
  title,
  quote,
  items,
  summary,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: chapterProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: imageProgress } = useScroll({
    target: imageContainerRef,
    offset: ["start end", "end start"],
  });

  // Smooth cinematic parallax for visual chronicle image (subtle drift and depth zoom)
  const imageScale = useTransform(imageProgress, [0, 0.5, 1], [1.12, 1.04, 1.0]);
  const imageY = useTransform(imageProgress, [0, 1], [-45, 45]);

  // Subtle floating text parallax
  const textY = useTransform(chapterProgress, [0.1, 0.9], [30, -30]);

  return (
    <section ref={sectionRef} id={id} className="relative w-full scroll-mt-20">
      {/* 1. Full-Screen Writings on Black Background with Animations */}
      <div className="relative w-full min-h-[75vh] lg:min-h-screen flex flex-col justify-center items-center bg-black text-white px-6 sm:px-12 lg:px-20 py-16 sm:py-24">
        {/* Subtle Ambient Radial Frost Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-6xl mx-auto"
        >
          {/* Top Pill Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-400/30 text-cyan-200 text-xs font-cinzel tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Snowflake className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
              <span>{chapterNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Title & Poetic Inscription Quote */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              {eyebrow && (
                <p className="text-[11px] font-cinzel tracking-[0.4em] text-cyan-400 uppercase font-semibold">
                  {eyebrow}
                </p>
              )}

              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold font-cinzel tracking-wider text-white uppercase leading-tight drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                {title}
              </h3>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black to-black border-l-4 border-cyan-400 shadow-xl">
                <p className="font-cormorant text-2xl sm:text-3xl text-cyan-100 italic leading-relaxed font-light">
                  {quote}
                </p>
              </div>
            </div>

            {/* Right Column: Narrative, Items & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-slate-300 text-base sm:text-xl font-light leading-relaxed">
                {summary}
              </p>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <p className="text-[11px] font-cinzel tracking-[0.3em] text-slate-400 uppercase mb-3 font-semibold">
                  Sacred Echoes & Truths
                </p>
                <ul className="space-y-3">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3.5 text-slate-200 text-sm sm:text-base font-light">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_10px_#38bdf8]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex items-center gap-2 text-slate-400 text-xs font-cinzel tracking-widest uppercase">
                <span>Scroll for Visual Chronicle</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-cyan-300" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Full-Screen Visual Chronicle with Cinematic Parallax Depth */}
      <div
        ref={imageContainerRef}
        className="relative w-full h-screen min-h-screen bg-black overflow-hidden flex items-center justify-center"
      >
        <motion.div
          style={{ scale: imageScale, y: imageY }}
          className="w-full h-full will-change-transform"
        >
          <img
            src={imgUrl}
            alt={heading || title}
            className="w-full h-full object-cover object-center select-none"
            loading="lazy"
          />
        </motion.div>

        {/* Cinematic gradient seams for ultra-smooth edge blending */}
        <div className="absolute top-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-black via-black/70 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

// Backwards-compatible export
export const TextParallaxContent = StoryChapterSection;
