"use client";

/**
 * InversionCircleScrollAnimation
 *
 * High-performance, GPU-accelerated scroll-driven animation:
 *   Phase 1: A sphere rises from below the screen to dead-centre.
 *     Easing: Power4 InOut (slow → fast → slow).
 *
 *   Phase 2: The sphere expands until it fills the screen.
 *     Easing: ease-in² (accelerates as it grows).
 *
 *   Color Inversion:
 *     A CSS clip-path mirrors the sphere position with sub-pixel precision.
 *     Both dark and light layers share the exact same typography and layout,
 *     preventing any letter collision or text overlap.
 *
 *   Transition:
 *     As the sphere achieves full coverage, the hero text gently dissolves,
 *     providing a seamless transition into the subsequent ContentSection.
 */

import React, { useEffect, useRef, useState } from "react";
import { Snowflake, Sparkles, ArrowRight } from "lucide-react";

export interface InversionCircleScrollAnimationProps {
  useWindowScroll?: boolean;
  title?: string;
  subtitle?: string;
  darkTitle?: string;
  darkSubtitle?: string;
  lightTitle?: string;
  lightSubtitle?: string;
  showContentSection?: boolean;
  contentLabel?: string;
  contentHeading?: string;
  contentBody?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  ballColor?: string;
  heroBgColor?: string;
  className?: string;
  bgImageUrl?: string;
}

// ─── root export ──────────────────────────────────────────────────────────────
export default function InversionCircleScrollAnimation({
  useWindowScroll = false,
  title,
  subtitle,
  darkTitle,
  darkSubtitle,
  lightTitle,
  lightSubtitle,
  showContentSection = false,
  contentLabel = "PROLOGUE — THE GENESIS OF ICE",
  contentHeading = "The Origin of\nAbsolute Stillness.",
  contentBody = "Before she became the Ice Sovereign, she was simply someone who noticed the things others ignored: the unspoken grief, the quiet loneliness, the memories people carried alone. When her quiet observation resonated with thermal stillness, molecular vibration ceased.",
  ctaText,
  onCtaClick,
  ballColor = "#0284c7",
  heroBgColor = "#02040a",
  className = "",
  bgImageUrl = "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80",
}: InversionCircleScrollAnimationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Unified title and subtitle to guarantee exact mirroring without letter collision
  const effectiveTitle = title || darkTitle || "THE COLD DIDN'T CHOOSE HER.\nTHE WORLD DID.";
  const effectiveSubtitle = subtitle || darkSubtitle || lightSubtitle || "She freezes what the world forgets.";

  return (
    <>
      <Styles />
      <div
        ref={wrapperRef}
        className={`icsa-wrap ${useWindowScroll ? "icsa-window-mode" : ""} ${className}`}
      >
        <HeroSection
          wrapperRef={wrapperRef}
          useWindowScroll={useWindowScroll}
          title={effectiveTitle}
          subtitle={effectiveSubtitle}
          ballColor={ballColor}
          heroBgColor={heroBgColor}
        />
        {showContentSection && (
          <ContentSection
            wrapperRef={wrapperRef}
            useWindowScroll={useWindowScroll}
            contentLabel={contentLabel}
            contentHeading={contentHeading}
            contentBody={contentBody}
            ctaText={ctaText}
            onCtaClick={onCtaClick}
            bgImageUrl={bgImageUrl}
          />
        )}
      </div>
    </>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────
type WRef = React.RefObject<HTMLDivElement | null>;

interface HeroSectionProps {
  wrapperRef: WRef;
  useWindowScroll?: boolean;
  title: string;
  subtitle: string;
  ballColor: string;
  heroBgColor: string;
}

function HeroSection({
  wrapperRef,
  useWindowScroll = false,
  title,
  subtitle,
  ballColor,
  heroBgColor,
}: HeroSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const darkLayerRef = useRef<HTMLDivElement>(null);
  const lightLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animFrameId: number;
    let targetProgress = 0;
    let currentProgress = 0;
    let isRunning = false;

    const render = (progress: number) => {
      const viewH = window.innerHeight || 800;
      const viewW = window.innerWidth || 1200;

      // Phase 1: 0 → 0.45 (Ball rises smoothly from below screen to dead-centre)
      const p1 = Math.min(1, Math.max(0, progress / 0.45));
      const p1e = p1 < 0.5 ? 4 * p1 * p1 * p1 : 1 - Math.pow(-2 * p1 + 2, 3) / 2;

      // Phase 2: 0.45 → 0.90 (Ball smoothly expands to envelop screen)
      const p2 = Math.min(1, Math.max(0, (progress - 0.45) / 0.45));
      const p2e = p2 * p2 * (3 - 2 * p2);

      // Geometry calculations
      const baseBallSize = Math.min(380, Math.min(viewW, viewH) * 0.65);
      const yOff = (1 - p1e) * (viewH / 2 + baseBallSize / 2);
      const coverSize = Math.max(viewW, viewH) * 2.8;
      const ballSize = baseBallSize + p2e * (coverSize - baseBallSize);
      const clipX = viewW / 2;
      const clipY = viewH / 2 + yOff;
      const clipR = ballSize / 2;

      // Hardware-accelerated direct DOM mutations
      if (ballRef.current) {
        ballRef.current.style.width = `${ballSize.toFixed(1)}px`;
        ballRef.current.style.height = `${ballSize.toFixed(1)}px`;
        ballRef.current.style.transform = `translate3d(-50%, calc(-50% + ${yOff.toFixed(1)}px), 0)`;
      }

      if (lightLayerRef.current) {
        const clipStr = `circle(${clipR.toFixed(1)}px at ${clipX.toFixed(1)}px ${clipY.toFixed(1)}px)`;
        lightLayerRef.current.style.clipPath = clipStr;
        (lightLayerRef.current.style as any).webkitClipPath = clipStr;
      }

      // Dissolve text as sphere covers the viewport (0.70 → 0.88)
      // Disappears completely before track finishes, guaranteeing ZERO overlap!
      const textOpacity = Math.max(0, Math.min(1, 1 - (progress - 0.70) / 0.18));
      if (darkLayerRef.current) {
        darkLayerRef.current.style.opacity = textOpacity.toFixed(3);
      }
      if (lightLayerRef.current) {
        lightLayerRef.current.style.opacity = textOpacity.toFixed(3);
      }
    };

    const loop = () => {
      // Exponential smoothing factor 0.12 gives natural momentum and removes all mouse wheel steps
      const delta = targetProgress - currentProgress;
      if (Math.abs(delta) < 0.0004) {
        currentProgress = targetProgress;
        render(currentProgress);
        isRunning = false;
        return;
      }

      currentProgress += delta * 0.12;
      render(currentProgress);
      animFrameId = requestAnimationFrame(loop);
    };

    const updateTarget = () => {
      if (useWindowScroll) {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const viewH = window.innerHeight;
        const totalScroll = Math.max(1, rect.height - viewH);
        const scrolled = Math.min(totalScroll, Math.max(0, -rect.top));
        targetProgress = scrolled / totalScroll;
      } else {
        const el = wrapperRef.current;
        if (!el) return;
        const viewH = el.clientHeight;
        const scrollY = el.scrollTop;
        const totalScroll = Math.max(1, el.scrollHeight - viewH);
        targetProgress = Math.min(1, Math.max(0, scrollY / totalScroll));
      }

      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(loop);
      }
    };

    updateTarget();
    currentProgress = targetProgress;
    render(currentProgress);

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [useWindowScroll, wrapperRef]);

  // Title rendering helper to guarantee 100% matching typography across both layers
  const renderTitle = (isLight: boolean) => (
    <>
      <h1 className="icsa-heading">
        {title.split("\n").map((line, idx) => (
          <span
            key={idx}
            className={`block ${
              idx > 0
                ? isLight
                  ? "mt-2.5 sm:mt-3 text-cyan-200 font-bold"
                  : "mt-2.5 sm:mt-3 text-cyan-400 font-bold"
                : ""
            }`}
          >
            {line}
          </span>
        ))}
      </h1>
      <p className="icsa-subheading">{subtitle}</p>
    </>
  );

  return (
    <div ref={trackRef} className="icsa-track">
      <section className="icsa-hero" style={{ backgroundColor: heroBgColor }}>
        {/* Ambient atmospheric background gradient */}
        <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Expanding sphere — Dark Cracked-Ice Sphere */}
        <div
          ref={ballRef}
          className="icsa-ball"
          style={ballColor !== "#0284c7" ? { backgroundColor: ballColor } : undefined}
        />

        {/* Outer text layer — dark / silver frost on deep background */}
        <div ref={darkLayerRef} className="icsa-layer icsa-dark">
          {renderTitle(false)}
        </div>

        {/* Inner text layer — clipped precisely to the sphere (color inversion with zero overlap) */}
        <div ref={lightLayerRef} className="icsa-layer icsa-light">
          {renderTitle(true)}
        </div>
      </section>
    </div>
  );
}

// ─── ContentSection ───────────────────────────────────────────────────────────
interface ContentSectionProps {
  wrapperRef: WRef;
  useWindowScroll?: boolean;
  contentLabel: string;
  contentHeading: string;
  contentBody: string;
  ctaText?: string;
  onCtaClick?: () => void;
  bgImageUrl?: string;
}

function ContentSection({
  wrapperRef,
  useWindowScroll = false,
  contentLabel,
  contentHeading,
  contentBody,
  ctaText,
  onCtaClick,
  bgImageUrl,
}: ContentSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (useWindowScroll) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setOn(true);
        },
        { threshold: 0.15 }
      );
      io.observe(el);
      return () => io.disconnect();
    } else {
      const root = wrapperRef.current;
      if (!root) return;

      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setOn(true);
        },
        { root, threshold: 0.35 }
      );
      io.observe(el);
      return () => io.disconnect();
    }
  }, [useWindowScroll, wrapperRef]);

  return (
    <section ref={ref} className={`icsa-cs${on ? " on" : ""}`}>
      {/* Background stock image with soft blur */}
      {bgImageUrl && (
        <div
          className="icsa-bg-overlay"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
        />
      )}

      <div className="icsa-inner">
        <span className="icsa-label">
          <Sparkles className="inline-block w-3.5 h-3.5 mr-2 text-cyan-400" />
          {contentLabel}
        </span>
        <h2>
          {contentHeading.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < contentHeading.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>
        <p>{contentBody}</p>
        {ctaText && <CTAButton text={ctaText} onClick={onCtaClick} />}
      </div>
    </section>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function CTAButton({
  text = "Get started",
  onClick,
}: {
  text?: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="icsa-btn group">
      <span>{text}</span>
      <ArrowRight className="w-4 h-4 ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Inter:wght@400;600;900&display=swap');

      .icsa-wrap *, .icsa-wrap *::before, .icsa-wrap *::after {
        box-sizing: border-box; margin: 0; padding: 0;
      }

      /* ── standalone scroll container ─────────────────────────────────── */
      .icsa-wrap {
        width: 100%; height: 100vh;
        overflow-y: scroll; overflow-x: clip;
        font-family: 'Inter', sans-serif;
        background: #02040a;
      }

      /* ── window-scroll mode (for embedded page sections) ──────────────── */
      .icsa-wrap.icsa-window-mode {
        height: auto;
        overflow-y: visible;
        overflow-x: clip;
        background: transparent;
      }

      /* Scroll track: 280vh ensures majestic, cinematic pacing */
      .icsa-track {
        height: 280vh;
        position: relative;
        width: 100%;
      }

      /* Pinned hero */
      .icsa-hero {
        position: sticky;
        top: 0;
        height: 100vh;
        overflow: hidden;
        width: 100%;
        background: #02040a;
        will-change: transform;
      }

      /* Expanding Sphere — Realistic Frozen Dark Cracked-Ice Sphere / Glass Orb */
      .icsa-ball {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        overflow: hidden;
        background-color: #02050f;
        background-image:
          radial-gradient(circle at 35% 32%, rgba(224, 242, 254, 0.26) 0%, rgba(56, 189, 248, 0.12) 26%, rgba(3, 11, 24, 0.55) 58%, rgba(2, 6, 18, 0.94) 88%, #01040a 100%),
          url('/assets/cracked_ice_texture.jpg');
        background-position: center center, center center;
        background-size: cover, cover;
        background-repeat: no-repeat, no-repeat;
        border: 1px solid rgba(186, 230, 253, 0.35);
        box-shadow:
          0 0 50px rgba(56, 189, 248, 0.28),
          0 0 100px rgba(14, 165, 233, 0.15),
          inset 0 0 50px rgba(56, 189, 248, 0.35),
          inset 0 0 16px rgba(224, 242, 254, 0.55);
        will-change: transform, width, height;
        transform: translate3d(-50%, 150%, 0);
        pointer-events: none;
      }

      .icsa-ball::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.25) 0%, rgba(186, 230, 253, 0.1) 30%, transparent 60%);
        pointer-events: none;
      }

      .icsa-ball::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        box-shadow: inset 0 0 35px rgba(56, 189, 248, 0.35), inset 0 1px 3px rgba(255, 255, 255, 0.6);
        pointer-events: none;
      }

      /* Text layers */
      .icsa-layer {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0 2rem;
        pointer-events: none;
        will-change: opacity;
      }

      /* Dark outer text */
      .icsa-dark {
        color: #94a3b8;
        z-index: 2;
      }

      /* Light inverted text */
      .icsa-light {
        color: #ffffff;
        z-index: 3;
        will-change: clip-path;
        text-shadow: 0 0 30px rgba(56, 189, 248, 0.7);
      }

      .icsa-heading {
        font-family: var(--font-cinzel), 'Cinzel', serif;
        font-size: clamp(2rem, 5.2vw, 4.2rem);
        font-weight: 900;
        letter-spacing: 0.12em;
        line-height: 1.2;
        text-transform: uppercase;
        max-width: 920px;
        margin: 0 auto;
      }

      .icsa-dark .icsa-heading {
        background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .icsa-light .icsa-heading {
        color: #ffffff;
        -webkit-text-fill-color: #ffffff;
      }

      .icsa-subheading {
        font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
        font-size: clamp(1.1rem, 2.2vw, 1.6rem);
        font-weight: 400;
        margin-top: 1.5rem;
        opacity: 0.9;
        font-style: italic;
        letter-spacing: 0.03em;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      .icsa-dark .icsa-subheading {
        color: #94a3b8;
      }

      .icsa-light .icsa-subheading {
        color: #e0f2fe;
      }

      /* ── content section ── */
      .icsa-cs {
        position: relative;
        z-index: 10;
        min-height: 85vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6rem 2rem;
        background: #02040a;
        color: #ffffff;
        overflow: hidden;
        border-top: 1px solid rgba(56, 189, 248, 0.15);
        transition: background 1.5s cubic-bezier(.25,0,.1,1),
                    color 1.5s cubic-bezier(.25,0,.1,1);
      }
      .icsa-cs.on {
        background: #000000;
        color: #ffffff;
      }

      .icsa-bg-overlay {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        opacity: 0.08;
        filter: blur(3px);
        pointer-events: none;
      }

      .icsa-inner {
        position: relative;
        z-index: 2;
        max-width: 800px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.75rem;
      }

      .icsa-inner > * {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity .8s cubic-bezier(.16, 1, .3, 1), transform .8s cubic-bezier(.16, 1, .3, 1);
      }
      .icsa-cs.on .icsa-inner > * { opacity: 1; transform: translateY(0); }

      .icsa-cs.on .icsa-label { transition-delay: .10s; }
      .icsa-cs.on h2          { transition-delay: .22s; }
      .icsa-cs.on p           { transition-delay: .34s; }
      .icsa-cs.on .icsa-btn   { transition-delay: .46s; }

      .icsa-label {
        font-family: var(--font-cinzel), 'Cinzel', sans-serif;
        font-size: .8rem;
        font-weight: 700;
        letter-spacing: .25em;
        text-transform: uppercase;
        color: #38bdf8;
      }

      .icsa-inner h2 {
        font-family: var(--font-cinzel), 'Cinzel', serif;
        font-size: clamp(2rem, 5vw, 3.4rem);
        font-weight: 900;
        letter-spacing: .08em;
        line-height: 1.2;
        text-transform: uppercase;
        color: #ffffff;
      }

      .icsa-inner p {
        font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
        font-size: clamp(1.15rem, 2vw, 1.45rem);
        line-height: 1.8;
        opacity: .85;
        max-width: 660px;
        font-style: italic;
        color: #cbd5e1;
      }

      /* CTA button */
      .icsa-btn {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: #ffffff;
        padding: 14px 36px;
        border-radius: 9999px;
        border: 1px solid rgba(56, 189, 248, 0.4);
        cursor: pointer;
        font-family: var(--font-cinzel), 'Cinzel', sans-serif;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: .22em;
        text-transform: uppercase;
        box-shadow: 0 10px 30px -5px rgba(2, 132, 199, 0.4);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all .3s cubic-bezier(.16, 1, .3, 1);
      }
      .icsa-btn:hover {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        transform: translateY(-2px);
        box-shadow: 0 15px 35px -5px rgba(14, 165, 233, 0.6);
        border-color: rgba(56, 189, 248, 0.7);
      }
      .icsa-btn:active {
        transform: translateY(0);
      }
    `}</style>
  );
}

export { InversionCircleScrollAnimation };
