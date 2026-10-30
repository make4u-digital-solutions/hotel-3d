"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useFrameSequence } from "@/lib/useFrameSequence";

/**
 * HotelCanvasViewer
 * Responsive HTML5 Canvas sequence player with intelligent preloader,
 * progressive background caching, and interactive scrubbing.
 */
export default function HotelCanvasViewer({
  totalFrames = 248,
  initialBatchSize = 50,
  basePath = "/hotel-frames/",
  onFrameChange,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Frame sequence hook
  const {
    initialProgress,
    isInitialReady,
    totalProgress,
    isAllLoaded,
    loadedCount,
    bufferMask,
    getFrame,
    prioritizeFrames,
  } = useFrameSequence({
    totalFrames,
    initialBatchSize,
    basePath,
    cacheCapacity: 120,
    concurrency: 4,
  });

  // Player state
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2
  const [fitMode, setFitMode] = useState("contain"); // 'contain' | 'cover'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Smooth dragging state
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartFrameRef = useRef(1);
  const lastRenderedFrameRef = useRef(1);
  const rafIdRef = useRef(null);
  const playTimerRef = useRef(null);

  // Inform parent when frame changes
  useEffect(() => {
    if (onFrameChange) {
      onFrameChange(currentFrame);
    }
  }, [currentFrame, onFrameChange]);

  // Canvas drawing function with High-DPI support
  const renderFrame = useCallback(
    (frameIndex) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const img = getFrame(frameIndex);
      if (!img) {
        // If exact frame isn't in memory, check nearest loaded frame as placeholder
        // and request priority load
        prioritizeFrames(frameIndex, 8);
        return;
      }

      lastRenderedFrameRef.current = frameIndex;

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

      // Clear with elegant dark background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Frame dimensions (e.g. 1280x720)
      const sourceWidth = img.width || 1280;
      const sourceHeight = img.height || 720;
      const sourceAspect = sourceWidth / sourceHeight;
      const canvasAspect = displayWidth / displayHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (fitMode === "cover") {
        if (canvasAspect > sourceAspect) {
          drawWidth = displayWidth;
          drawHeight = Math.round(displayWidth / sourceAspect);
        } else {
          drawHeight = displayHeight;
          drawWidth = Math.round(displayHeight * sourceAspect);
        }
      } else {
        // contain mode
        if (canvasAspect > sourceAspect) {
          drawHeight = displayHeight;
          drawWidth = Math.round(displayHeight * sourceAspect);
        } else {
          drawWidth = displayWidth;
          drawHeight = Math.round(displayWidth / sourceAspect);
        }
      }

      offsetX = Math.round((displayWidth - drawWidth) / 2);
      offsetY = Math.round((displayHeight - drawHeight) / 2);

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    },
    [fitMode, getFrame, prioritizeFrames]
  );

  // Render when currentFrame or readiness changes
  useEffect(() => {
    if (!isInitialReady) return;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      renderFrame(currentFrame);
    });

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [currentFrame, isInitialReady, renderFrame]);

  // Responsive canvas resize handling
  useEffect(() => {
    const handleResize = () => {
      if (isInitialReady) {
        renderFrame(currentFrame);
      }
    };

    window.addEventListener("resize", handleResize);
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [currentFrame, isInitialReady, renderFrame]);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying || !isInitialReady) return;

    const baseFps = 30;
    const intervalMs = 1000 / (baseFps * playbackSpeed);

    let lastTime = performance.now();
    let frameId;

    const tick = (now) => {
      const delta = now - lastTime;
      if (delta >= intervalMs) {
        lastTime = now - (delta % intervalMs);
        setCurrentFrame((prev) => {
          const next = prev >= totalFrames ? 1 : prev + 1;
          prioritizeFrames(next, 10);
          return next;
        });
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isPlaying, isInitialReady, playbackSpeed, prioritizeFrames, totalFrames]);

  // Pointer / Mouse / Touch scrubbing handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    dragStartFrameRef.current = currentFrame;
    setIsPlaying(false);

    if (e.target.setPointerCapture && e.pointerId !== undefined) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const deltaX = clientX - dragStartXRef.current;

    // Sensitivity: e.g. 5px drag = 1 frame
    const sensitivity = 5;
    const frameDelta = Math.floor(deltaX / sensitivity);

    let nextFrame = dragStartFrameRef.current + frameDelta;

    // Wrap around smoothly 1..totalFrames
    while (nextFrame > totalFrames) nextFrame -= totalFrames;
    while (nextFrame < 1) nextFrame += totalFrames;

    setCurrentFrame(nextFrame);
    prioritizeFrames(nextFrame, 8);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    if (e.target.releasePointerCapture && e.pointerId !== undefined) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setCurrentFrame((prev) => {
          const next = Math.min(totalFrames, prev + step);
          prioritizeFrames(next, 8);
          return next;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setCurrentFrame((prev) => {
          const next = Math.max(1, prev - step);
          prioritizeFrames(next, 8);
          return next;
        });
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prioritizeFrames, toggleFullscreen, totalFrames]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden bg-zinc-950 select-none font-sans group rounded-2xl border border-zinc-800/80 shadow-2xl"
    >
      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none block"
      />

      {/* INTELLIGENT INITIAL PRELOADER SCREEN */}
      <div
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-xl transition-all duration-700 ease-out ${
          isInitialReady
            ? "opacity-0 pointer-events-none scale-105"
            : "opacity-100 scale-100"
        }`}
      >
        {/* Ambient Glowing Background Effect */}
        <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
          {/* Luxury Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-xs tracking-widest uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            360° Cinematic Experience
          </div>

          <h2 className="text-2xl font-light tracking-wide text-zinc-100 mb-2 font-serif">
            The Grand Horizon
          </h2>
          <p className="text-xs text-zinc-400 tracking-wider mb-8 uppercase">
            Curating Initial 50 HD Frames
          </p>

          {/* Circular Progress & Percentage */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-6">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-zinc-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress ring */}
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

          {/* Progress bar */}
          <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden mb-3 border border-zinc-700/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${initialProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-400 font-mono">
            {loadedCount >= initialBatchSize
              ? "Ready for seamless interaction"
              : `Buffering keyframes ${Math.min(loadedCount, initialBatchSize)} / ${initialBatchSize}`}
          </p>
        </div>
      </div>

      {/* TOP FLOATING BAR: Luxury Title & Progressive Background Status */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left Badge */}
        <div className="pointer-events-auto flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 text-xs shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200 font-medium tracking-wide">
            Interactive Hotel Sequence
          </span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400 font-mono">
            Frame {String(currentFrame).padStart(3, "0")} / {totalFrames}
          </span>
        </div>

        {/* Right Badge: Progressive Background Caching Status */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-zinc-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800 text-xs shadow-lg">
          {isAllLoaded ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-mono text-[11px] font-medium">All 248 HD Frames Cached</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 text-[11px]">Background Caching</span>
                  <span className="text-cyan-400 font-mono text-[11px] font-bold">
                    {totalProgress}%
                  </span>
                </div>
                <div className="w-28 bg-zinc-800 rounded-full h-1 mt-1 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DRAG INTERACTION HINT OVERLAY (Only shows briefly on initial ready) */}
      {isInitialReady && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-zinc-300 text-xs font-light tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Click & Drag horizontally to rotate 360°
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS & TIMELINE DOCK */}
      <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-auto">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
          {/* Interactive Scrub Timeline Bar */}
          <div className="relative w-full flex flex-col gap-1.5">
            {/* Timeline Canvas / Buffer Visualizer */}
            <div className="relative w-full h-3 bg-zinc-800/90 rounded-full overflow-hidden cursor-pointer flex items-center">
              {/* Buffer Segments Bar */}
              <div
                className="absolute inset-0 h-full bg-cyan-500/20 transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />

              {/* Active Scrubber Bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                style={{
                  width: `${((currentFrame - 1) / (totalFrames - 1)) * 100}%`,
                }}
              />

              {/* Native Scrub Range Input overlaid */}
              <input
                type="range"
                min="1"
                max={totalFrames}
                value={currentFrame}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentFrame(val);
                  prioritizeFrames(val, 10);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>

            {/* Timeline markers */}
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono px-0.5">
              <span>001 (Start)</span>
              <span className="text-zinc-400">
                Frame {String(currentFrame).padStart(3, "0")}
              </span>
              <span>{totalFrames} (Loop)</span>
            </div>
          </div>

          {/* Control Buttons Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
            {/* Left Controls: Play / Pause & Speed */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                title="Spacebar to toggle"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Play 360°</span>
                  </>
                )}
              </button>

              {/* Playback Speed Cycle */}
              <button
                type="button"
                onClick={() => {
                  const nextSpeed = playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 0.5 : 1;
                  setPlaybackSpeed(nextSpeed);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Step Back / Forward */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const prev = currentFrame <= 1 ? totalFrames : currentFrame - 1;
                    setCurrentFrame(prev);
                    prioritizeFrames(prev, 6);
                  }}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Previous Frame (Left Arrow)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = currentFrame >= totalFrames ? 1 : currentFrame + 1;
                    setCurrentFrame(next);
                    prioritizeFrames(next, 6);
                  }}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Next Frame (Right Arrow)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Angle Bookmarks */}
            <div className="hidden md:flex items-center gap-1.5">
              {[
                { label: "Front Exterior", frame: 1 },
                { label: "Courtyard", frame: 65 },
                { label: "Lounge View", frame: 130 },
                { label: "Panorama", frame: 200 },
              ].map((bookmark) => (
                <button
                  key={bookmark.label}
                  type="button"
                  onClick={() => {
                    setCurrentFrame(bookmark.frame);
                    prioritizeFrames(bookmark.frame, 12);
                  }}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    Math.abs(currentFrame - bookmark.frame) < 15
                      ? "bg-zinc-700 text-amber-300 font-medium"
                      : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {bookmark.label}
                </button>
              ))}
            </div>

            {/* Right Controls: Fit Mode & Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFitMode(fitMode === "contain" ? "cover" : "contain")}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs capitalize transition-colors flex items-center gap-1"
                title="Toggle Aspect Ratio Fit"
              >
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>{fitMode}</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
