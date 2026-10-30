"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFrameSequence } from "@/lib/useFrameSequence";
import TimelineOverlays from "./TimelineOverlays";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Apple-style Scroll-Scrubbed Canvas Image Sequence Viewer
 *
 * Guarantees:
 * - All 248 frames are permanently accessible (zero eviction of frames 1-130)
 * - Frame sequence starts at frame 1 and advances/reverses in exact lockstep with scroll
 * - Frozen indefinitely when scrolling stops
 * - Redraws canvas only on scroll-driven frame change or when active frame becomes ready
 * - High-DPI responsive canvas rendering
 */
export default function HotelCanvasViewer({
  totalFrames = 248,
  initialBatchSize = 50,
  basePath = "/hotel-frames/",
  scrollDistance = "400vh",
  onFrameChange,
}) {
  const scrollTrackRef = useRef(null);
  const pinnedViewportRef = useRef(null);
  const canvasRef = useRef(null);

  // Active frame tracking
  const currentFrameRef = useRef(1);
  const [displayFrame, setDisplayFrame] = useState(1);
  const [scrollProgressPercent, setScrollProgressPercent] = useState(0);

  // RAF holder used ONLY to debounce/coalesce canvas draw on scroll update
  const renderRafIdRef = useRef(null);
  const scrollTriggerInstanceRef = useRef(null);
  const scheduleRenderRef = useRef(null);

  // Callback from loader when a newly downloaded frame matches the active frame
  const handleActiveFrameReady = useCallback((readyIndex) => {
    if (readyIndex === currentFrameRef.current) {
      scheduleRenderRef.current?.(readyIndex);
    }
  }, []);

  // Frame sequence hook with ample capacity for all 248 frames
  const {
    initialProgress,
    isInitialReady,
    totalProgress,
    isAllLoaded,
    loadedCount,
    getFrame,
    prioritizeFrames,
  } = useFrameSequence({
    totalFrames,
    initialBatchSize,
    basePath,
    cacheCapacity: 300,
    concurrency: 4,
    onActiveFrameReady: handleActiveFrameReady,
  });

  // Canvas drawing function with High-DPI support
  const renderFrame = useCallback(
    (frameIndex) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const img = getFrame(frameIndex);
      if (!img) {
        prioritizeFrames(frameIndex, 10);
        return;
      }

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth = Math.floor(rect.width * dpr);
      const displayHeight = Math.floor(rect.height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Dark luxury background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Frame dimensions (1280x720)
      const sourceWidth = img.width || 1280;
      const sourceHeight = img.height || 720;
      const sourceAspect = sourceWidth / sourceHeight;
      const canvasAspect = displayWidth / displayHeight;

      let drawWidth, drawHeight;

      // Contain fit
      if (canvasAspect > sourceAspect) {
        drawHeight = displayHeight;
        drawWidth = Math.round(displayHeight * sourceAspect);
      } else {
        drawWidth = displayWidth;
        drawHeight = Math.round(displayWidth / sourceAspect);
      }

      const offsetX = Math.round((displayWidth - drawWidth) / 2);
      const offsetY = Math.round((displayHeight - drawHeight) / 2);

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    },
    [getFrame, prioritizeFrames]
  );

  // Debounced render pass on scroll update
  const scheduleRender = useCallback(
    (frameIndex) => {
      if (renderRafIdRef.current) {
        cancelAnimationFrame(renderRafIdRef.current);
      }
      renderRafIdRef.current = requestAnimationFrame(() => {
        renderFrame(frameIndex);
        renderRafIdRef.current = null;
      });
    },
    [renderFrame]
  );

  useEffect(() => {
    scheduleRenderRef.current = scheduleRender;
  }, [scheduleRender]);

  // Setup GSAP ScrollTrigger once initial 50 frames are ready
  useEffect(() => {
    if (!isInitialReady) return;

    const track = scrollTrackRef.current;
    const pinned = pinnedViewportRef.current;
    if (!track || !pinned) return;

    // Immediately render the starting frame (Frame 1)
    scheduleRender(currentFrameRef.current);

    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      pin: pinned,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const frameOffset = Math.floor(progress * (totalFrames - 1));
        const targetFrame = Math.min(totalFrames, Math.max(1, frameOffset + 1));

        // Redraw canvas ONLY when calculated frame number changes
        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          setDisplayFrame(targetFrame);
          setScrollProgressPercent(Math.round(progress * 100));

          if (onFrameChange) {
            onFrameChange(targetFrame);
          }

          prioritizeFrames(targetFrame, 12);
          scheduleRender(targetFrame);
        }
      },
    });

    scrollTriggerInstanceRef.current = st;
    ScrollTrigger.refresh();

    return () => {
      if (renderRafIdRef.current) {
        cancelAnimationFrame(renderRafIdRef.current);
        renderRafIdRef.current = null;
      }
      if (scrollTriggerInstanceRef.current) {
        scrollTriggerInstanceRef.current.kill();
        scrollTriggerInstanceRef.current = null;
      }
    };
  }, [isInitialReady, onFrameChange, prioritizeFrames, scheduleRender, totalFrames]);

  // Handle window/container resize: re-draw the frozen frame
  useEffect(() => {
    const handleResize = () => {
      if (isInitialReady) {
        ScrollTrigger.refresh();
        scheduleRender(currentFrameRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    const observer = new ResizeObserver(handleResize);
    if (pinnedViewportRef.current) {
      observer.observe(pinnedViewportRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [isInitialReady, scheduleRender]);

  return (
    <div
      ref={scrollTrackRef}
      className="relative w-full bg-zinc-950"
      style={{ height: scrollDistance }}
    >
      {/* Pinned Viewport Container (Pinned by GSAP ScrollTrigger) */}
      <div
        ref={pinnedViewportRef}
        className="w-full h-screen overflow-hidden flex flex-col justify-between items-center relative select-none"
      >
        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />

        {/* INTELLIGENT PRELOADER (First 50 frames) */}
        <div
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 transition-all duration-700 ease-out ${
            isInitialReady
              ? "opacity-0 pointer-events-none scale-105"
              : "opacity-100 scale-100"
          }`}
        >
          {/* Ambient Lighting */}
          <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs tracking-widest uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Interactive Scroll Sequence
            </div>

            <h2 className="text-2xl font-light tracking-wide text-zinc-100 mb-2 font-serif">
              The Grand Horizon
            </h2>
            <p className="text-xs text-zinc-400 tracking-wider mb-8 uppercase">
              Curating Initial 50 HD Frames
            </p>

            {/* Circular Progress Meter */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-zinc-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-amber-400 transition-all duration-300 ease-out"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={
                    2 * Math.PI * 44 * (1 - initialProgress / 100)
                  }
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extralight tracking-tighter text-white">
                  {initialProgress}
                  <span className="text-sm font-normal text-amber-400">%</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  INITIALIZING
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-3 border border-zinc-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${initialProgress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400 font-mono">
              {loadedCount >= initialBatchSize
                ? "Scroll scrubbing enabled"
                : `Buffering keyframes ${Math.min(loadedCount, initialBatchSize)} / ${initialBatchSize}`}
            </p>
          </div>
        </div>

        {/* Top subtle buffer pill (minimal & unobtrusive) */}
        <div className="w-full max-w-7xl px-8 py-6 z-20 flex items-center justify-end pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2.5 bg-zinc-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800/60 shadow-lg text-xs">
            {isAllLoaded ? (
              <span className="font-mono text-[10px] text-emerald-400/90 tracking-wider uppercase">
                248 Frames Cached
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono text-[10px] text-zinc-400">
                  Buffer {totalProgress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subtle interior timeline overlays (Entrance, Living, Kitchen, Bedroom, Bathroom, Garden) */}
        <TimelineOverlays triggerRef={scrollTrackRef} totalFrames={totalFrames} />

        {/* Minimal Progress Line */}
        <div className="w-full max-w-7xl px-8 pb-4 z-20 flex flex-col items-center pointer-events-none">

          {/* Minimalist Apple-style Scrub Progress Line */}
          <div className="w-full max-w-xl flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">001</span>
            <div className="flex-1 bg-zinc-800/80 h-1 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-75"
                style={{ width: `${scrollProgressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {String(totalFrames).padStart(3, "0")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
