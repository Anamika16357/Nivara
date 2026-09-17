import React, { useEffect, useRef, useState } from 'react';

interface NivaraFrameSequenceProps {
  currentFrameIndex: number; // 1 to 240
  totalFrames?: number;
  onLoadingProgress?: (percent: number) => void;
  scaleTransform?: number;
  opacity?: number;
}

export const NivaraFrameSequence: React.FC<NivaraFrameSequenceProps> = ({
  currentFrameIndex,
  totalFrames = 240,
  onLoadingProgress,
  scaleTransform = 1.0,
  opacity = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const [, setLoadedCount] = useState(0);

  // Helper to format frame path: 1 -> /images/herosection/ezgif-frame-001.png
  const getFramePath = (index: number) => {
    const padded = String(index).padStart(3, '0');
    return `/images/herosection/ezgif-frame-${padded}.png`;
  };

  // Progressive smart caching:
  // 1. Initial burst: frames 1..30 (instant start)
  // 2. Structural skeleton: key frames (multiples of 5 up to 240)
  // 3. Dense fill: all remaining frames loaded concurrently in small batches
  useEffect(() => {
    let isCancelled = false;
    let totalLoaded = 0;

    const loadSingleFrame = (idx: number): Promise<void> => {
      return new Promise((resolve) => {
        if (imagesCache.current.has(idx)) {
          resolve();
          return;
        }
        const img = new Image();
        img.src = getFramePath(idx);
        img.onload = () => {
          if (!isCancelled) {
            imagesCache.current.set(idx, img);
            totalLoaded++;
            setLoadedCount(totalLoaded);
            if (onLoadingProgress) {
              const pct = Math.min(100, Math.floor((totalLoaded / totalFrames) * 100));
              onLoadingProgress(pct);
            }
          }
          resolve();
        };
        img.onerror = () => {
          resolve(); // gracefully continue without blocking
        };
      });
    };

    async function streamAllFrames() {
      // Step 1: Preload initial 30 frames
      const initialBatch: number[] = [];
      for (let i = 1; i <= Math.min(30, totalFrames); i++) initialBatch.push(i);
      await Promise.all(initialBatch.map(loadSingleFrame));
      if (isCancelled) return;

      // Step 2: Key structural frames (every 5th frame)
      const structuralBatch: number[] = [];
      for (let i = 35; i <= totalFrames; i += 5) structuralBatch.push(i);
      await Promise.all(structuralBatch.map(loadSingleFrame));
      if (isCancelled) return;

      // Step 3: Stream all remaining frames in chunks of 8
      const loadedSet = new Set([...initialBatch, ...structuralBatch]);
      const remaining: number[] = [];
      for (let i = 1; i <= totalFrames; i++) {
        if (!loadedSet.has(i)) remaining.push(i);
      }

      const chunkSize = 8;
      for (let i = 0; i < remaining.length; i += chunkSize) {
        if (isCancelled) return;
        const chunk = remaining.slice(i, i + chunkSize);
        await Promise.all(chunk.map(loadSingleFrame));
      }
    }

    streamAllFrames();

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, onLoadingProgress]);

  // Canvas drawing loop with high-DPI support and aspect-ratio contain centering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Find current frame image or closest cached frame
      let img = imagesCache.current.get(currentFrameIndex);
      if (!img) {
        // Fallback to nearest cached index
        let nearestDiff = Infinity;
        let nearestImg: HTMLImageElement | undefined = undefined;
        imagesCache.current.forEach((cachedImg, idx) => {
          const diff = Math.abs(idx - currentFrameIndex);
          if (diff < nearestDiff) {
            nearestDiff = diff;
            nearestImg = cachedImg;
          }
        });
        img = nearestImg;
      }

      if (img && img.complete && img.naturalWidth > 0) {
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const screenAspect = width / height;

        let drawWidth = width;
        let drawHeight = height;
        let drawX = 0;
        let drawY = 0;

        if (screenAspect > imgAspect) {
          drawHeight = height;
          drawWidth = height * imgAspect;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgAspect;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }

        ctx.save();
        // Camera matrix zoom/transform around viewport center
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleTransform, scaleTransform);
        ctx.translate(-width / 2, -height / 2);

        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentFrameIndex, scaleTransform, opacity]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#030712]">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-none transition-opacity duration-300"
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  );
};
