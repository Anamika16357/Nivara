'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Snowflake } from 'lucide-react';

export interface ParallaxComponentProps {
  title?: string;
  subtitle?: string;
  layer1Url?: string;
  layer2Url?: string;
  layer4Url?: string;
  showContent?: boolean;
  contentHeading?: string;
  contentDescription?: string;
  className?: string;
}

export function ParallaxComponent({
  title = "Parallax",
  subtitle,
  // High quality, verified Unsplash stock images for layered depth
  layer1Url = "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80", // Night starry mountain peaks (deep background)
  layer2Url = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80", // Cold mountain ridge (midground)
  layer4Url = "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80", // Crystalline frost & ice formations (foreground)
  showContent = true,
  contentHeading,
  contentDescription,
  className = ""
}: ParallaxComponentProps = {}) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = parallaxRef.current;
    if (!container) return;

    const header = container.querySelector('.parallax__header') as HTMLElement;
    const triggerElement = container.querySelector('[data-parallax-layers]') as HTMLElement;

    if (!header || !triggerElement) return;

    // 1. Scoped GSAP Timeline with smooth scrub interpolation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: "top top",
        end: "bottom top",
        scrub: 1.2, // Smooth dampening prevents jitter on mouse wheel
        invalidateOnRefresh: true,
      }
    });

    const layers = [
      { layer: "1", yPercent: 65 },
      { layer: "2", yPercent: 45 },
      { layer: "3", yPercent: 30 },
      { layer: "4", yPercent: 12 }
    ];

    layers.forEach((layerObj, idx) => {
      const target = triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`);
      if (target.length > 0) {
        tl.to(
          target,
          {
            yPercent: layerObj.yPercent,
            ease: "power1.out"
          },
          idx === 0 ? undefined : "<"
        );
      }
    });

    // 2. Smooth virtual scrolling via Lenis singleton
    let lenis: Lenis;
    let isCreatedLocally = false;

    if ((window as any).__lenisGlobal) {
      lenis = (window as any).__lenisGlobal;
    } else {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });
      (window as any).__lenisGlobal = lenis;
      isCreatedLocally = true;
    }

    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(500, 33);

    // 3. Ensure accurate layout calculations after initial paint
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      // Clean up ONLY this component's timeline to protect other sections
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.killTweensOf(triggerElement);
      gsap.ticker.remove(tickerCallback);
      lenis.off('scroll', onScroll);

      if (isCreatedLocally) {
        lenis.destroy();
        delete (window as any).__lenisGlobal;
      }
    };
  }, []);

  return (
    <div className={`parallax ${className}`} ref={parallaxRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow"></div>
          <div data-parallax-layers className="parallax__layers">
            <img
              src={layer1Url}
              loading="eager"
              width="800"
              data-parallax-layer="1"
              alt="Parallax background layer"
              className="parallax__layer-img"
            />
            <img
              src={layer2Url}
              loading="eager"
              width="800"
              data-parallax-layer="2"
              alt="Parallax midground layer"
              className="parallax__layer-img"
            />
            <div data-parallax-layer="3" className="parallax__layer-title">
              <div className="flex flex-col items-center justify-center text-center px-4">
                {subtitle && (
                  <span className="text-xs sm:text-sm uppercase tracking-[0.35em] text-cyan-400 font-cinzel mb-2">
                    {subtitle}
                  </span>
                )}
                <h2 className="parallax__title">{title}</h2>
              </div>
            </div>
            <img
              src={layer4Url}
              loading="eager"
              width="800"
              data-parallax-layer="4"
              alt="Parallax foreground layer"
              className="parallax__layer-img opacity-85"
            />
          </div>
          <div className="parallax__fade"></div>
        </div>
      </section>

      {showContent && (
        <section className="parallax__content">
          <Snowflake className="osmo-icon-svg" aria-label="Ice crystal motif" />
          {contentHeading && (
            <h3 className="mt-4 text-xl sm:text-2xl font-cinzel tracking-widest text-slate-100 uppercase">
              {contentHeading}
            </h3>
          )}
          {contentDescription && (
            <p className="mt-2 max-w-xl text-sm sm:text-base font-cormorant italic text-slate-300 leading-relaxed">
              {contentDescription}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export default ParallaxComponent;
