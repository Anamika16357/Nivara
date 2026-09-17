import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 240;
const PLAYBACK_FPS = 24; // 24fps natural cinematic playback speed
const ANIMATION_MS = (TOTAL_FRAMES / PLAYBACK_FPS) * 1000; // 10,000ms (10 seconds)
const HOLD_MS = 2500; // Hold on final canonical frame for 2.5 seconds
const FADE_MS = 800; // Smooth crossfade back to darkness
const CYCLE_MS = ANIMATION_MS + HOLD_MS + FADE_MS; // 13,300ms total loop

const getFramePath = (index: number) => {
  const padded = String(index).padStart(3, '0');
  return `/images/herosection/ezgif-frame-${padded}.png`;
};

interface CinematicHeroBackgroundProps {
  className?: string;
  fillMode?: 'cover' | 'contain';
}

export const CinematicHeroBackground: React.FC<CinematicHeroBackgroundProps> = ({
  className = '',
  fillMode = 'cover'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesCache = useRef<Map<number, HTMLImageElement>>(new Map());

  // Progressive frame streaming with native GPU decode
  useEffect(() => {
    let isCancelled = false;

    const loadSingle = (idx: number): Promise<void> => {
      return new Promise((resolve) => {
        if (imagesCache.current.has(idx)) {
          resolve();
          return;
        }
        const img = new Image();
        img.src = getFramePath(idx);
        img.onload = async () => {
          if ('decode' in img) {
            try {
              await img.decode();
            } catch {
              // Ignore decode fallback
            }
          }
          if (!isCancelled) imagesCache.current.set(idx, img);
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    async function streamAllFrames() {
      // 1. Initial critical stream buffer (frames 1-40)
      const startBatch: number[] = [];
      for (let i = 1; i <= Math.min(40, TOTAL_FRAMES); i++) {
        startBatch.push(i);
      }
      await Promise.all(startBatch.map(loadSingle));
      if (isCancelled) return;

      // 2. High-speed concurrent streaming for remaining frames
      const concurrency = 8;
      for (let i = 41; i <= TOTAL_FRAMES; i += concurrency) {
        if (isCancelled) return;
        const batch: number[] = [];
        for (let j = i; j < i + concurrency && j <= TOTAL_FRAMES; j++) {
          batch.push(j);
        }
        await Promise.all(batch.map(loadSingle));
      }
    }

    streamAllFrames();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Pixel-perfect native render loop (Physical pixel mapping without intermediate scaling blur)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let animId: number;
    let startTime: number | null = null;
    let lastValidImg: HTMLImageElement | null = null;

    // Cache physical dimensions to eliminate layout thrashing inside 60fps render loop
    let physicalW = 1920;
    let physicalH = 1080;

    const updateCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      physicalW = Math.round(rect.width * dpr);
      physicalH = Math.round(rect.height * dpr);

      if (canvas.width !== physicalW || canvas.height !== physicalH) {
        canvas.width = physicalW;
        canvas.height = physicalH;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    };

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions, { passive: true });

    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % CYCLE_MS;

      // Deep pitch black background matching source video
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, physicalW, physicalH);

      // Determine active frame and opacity
      let targetFrame = 1;
      let targetOpacity = 1.0;

      if (elapsed < ANIMATION_MS) {
        const prog = elapsed / ANIMATION_MS;
        targetFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.floor(1 + prog * (TOTAL_FRAMES - 1))));
        targetOpacity = 1.0;
      } else if (elapsed < ANIMATION_MS + HOLD_MS) {
        // Hold on complete canonical character portrait
        targetFrame = TOTAL_FRAMES;
        targetOpacity = 1.0;
      } else {
        // Smooth crossfade back to black
        const fadeElapsed = elapsed - (ANIMATION_MS + HOLD_MS);
        const fadeProg = fadeElapsed / FADE_MS;
        targetFrame = TOTAL_FRAMES;
        targetOpacity = Math.max(0, 1.0 - fadeProg);
      }

      // Fetch target frame or latest available frame to guarantee zero flicker
      let img = imagesCache.current.get(targetFrame);
      if (!img) {
        for (let f = targetFrame - 1; f >= 1; f--) {
          const cached = imagesCache.current.get(f);
          if (cached) {
            img = cached;
            break;
          }
        }
        if (!img) {
          img = lastValidImg || imagesCache.current.get(1);
        }
      } else {
        lastValidImg = img;
      }

      // Draw image in 1:1 physical pixel coordinates for maximum razor-sharp clarity
      if (img && img.complete && img.naturalWidth > 0) {
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const imgAspect = imgW / imgH;
        const canvasAspect = physicalW / physicalH;

        let drawW = physicalW;
        let drawH = physicalH;
        let drawX = 0;
        let drawY = 0;

        if (fillMode === 'contain') {
          if (canvasAspect > imgAspect) {
            drawH = physicalH;
            drawW = Math.round(physicalH * imgAspect);
            drawX = Math.round((physicalW - drawW) / 2);
            drawY = 0;
          } else {
            drawW = physicalW;
            drawH = Math.round(physicalW / imgAspect);
            drawX = 0;
            drawY = Math.round((physicalH - drawH) / 2);
          }
        } else {
          // Cover mode
          if (canvasAspect > imgAspect) {
            drawW = physicalW;
            drawH = Math.round(physicalW / imgAspect);
            drawX = 0;
            drawY = Math.round((physicalH - drawH) / 2);
          } else {
            drawH = physicalH;
            drawW = Math.round(physicalH * imgAspect);
            drawX = Math.round((physicalW - drawW) / 2);
            drawY = 0;
          }
        }

        ctx.save();
        ctx.globalAlpha = targetOpacity;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [fillMode]);

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'auto'
        }}
      />
    </div>
  );
};
