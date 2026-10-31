"use client";

/**
 * HotelExperience Component
 *
 * Apple-style scroll-scrubbing architecture:
 * 1. Pinned viewport section during user scroll via GSAP ScrollTrigger.
 * 2. Uses strictly `scrub: true`.
 * 3. Maps normalized progress (0.0 to 1.0) to active sequence's total frame count.
 * 4. Requests corresponding frames exclusively through FrameManager.
 * 5. Draws cached frames immediately upon scroll.
 * 6. Prioritizes missing frames at the front of the queue.
 * 7. Supports forward and reverse scrolling.
 * 8. Retains the last displayed frame until the latest requested frame is ready.
 *
 * STRICTLY FORBIDDEN:
 * - Autoplay
 * - Automatic frame advancement
 * - setInterval-based playback
 * - Independent requestAnimationFrame playback loops
 * - Automatic animation after page load
 */

import { useCallback, useEffect, useRef, useState } from "react";
import HotelCanvas from "./HotelCanvas";
import HotelLoader from "./HotelLoader";
import HotelOverlay from "./HotelOverlay";
import { HOTEL_SECTIONS, SEQUENCE_CONFIG } from "@/lib/hotel/config";
import {
  getActiveSequenceConfig,
  subscribeDeviceChange,
} from "@/lib/hotel/deviceDetector";
import { defaultFrameCache } from "@/lib/hotel/frameCache";
import { FrameManager } from "@/lib/hotel/frameManager";
import { ScrollController } from "@/lib/hotel/scrollController";

export default function HotelExperience({
  scrollDistance = "400vh",
  title = "The Grand Horizon",
  subtitle = "Curating Architectural Experience",
}) {
  const containerRef = useRef(null);
  const pinnedRef = useRef(null);
  const canvasComponentRef = useRef(null);

  // Active configuration (desktop or mobile)
  const [activeConfig, setActiveConfig] = useState(getActiveSequenceConfig);

  // Buffer and progress telemetry
  const [telemetry, setTelemetry] = useState({
    variant: activeConfig.id,
    currentFrame: 1,
    currentChunk: 1,
    totalChunks: Math.ceil(activeConfig.totalFrames / 50),
    totalLoaded: 0,
    initialLoaded: 0,
    initialPercent: 0,
    isInitialReady: false,
    activeChunks: [1],
    direction: 1,
  });

  // Strict tracking of requested and rendered frames
  const currentTargetFrameRef = useRef(1);
  const lastRenderedFrameRef = useRef(1);

  // Engine references
  const frameManagerRef = useRef(null);
  const scrollControllerRef = useRef(null);

  /**
   * Renders the requested frame or retains the last displayed frame if not yet decoded.
   * Guarantees the canvas never clears or flickers to black.
   */
  const renderTargetOrFallback = useCallback((targetFrame) => {
    currentTargetFrameRef.current = targetFrame;
    const fm = frameManagerRef.current;
    if (!fm || !canvasComponentRef.current) return;

    // Check if target frame is immediately available in cache
    const directHit = defaultFrameCache.get(activeConfig.id, targetFrame);
    if (directHit) {
      canvasComponentRef.current.renderImmediate(directHit);
      lastRenderedFrameRef.current = targetFrame;
      return;
    }

    // Missing frame: retain last displayed frame, or fallback to closest loaded neighbor
    const { image } = fm.getClosestLoadedFrame(targetFrame, 25);
    if (image) {
      canvasComponentRef.current.renderImmediate(image);
    }
  }, [activeConfig.id]);

  // Initialize FrameManager: stages initial 50-frame chunk with 6 concurrency
  useEffect(() => {
    const frameManager = new FrameManager({
      cache: defaultFrameCache,
      concurrency: 6,
      chunkSize: 50,
      prefetchThreshold: 15,
    });

    // Display initial poster (Frame 1) immediately once decoded
    frameManager.onFirstFrameReadyCallback = (img) => {
      if (canvasComponentRef.current && currentTargetFrameRef.current === 1) {
        canvasComponentRef.current.renderImmediate(img);
        lastRenderedFrameRef.current = 1;
      }
    };

    // Redraw Canvas ONLY when the latest requested frame becomes available
    frameManager.onFrameLoadedCallback = (loadedFrameIndex, img) => {
      if (
        loadedFrameIndex === currentTargetFrameRef.current &&
        canvasComponentRef.current
      ) {
        canvasComponentRef.current.renderImmediate(img);
        lastRenderedFrameRef.current = loadedFrameIndex;
      }
    };

    // Update telemetry state
    frameManager.onProgressCallback = (data) => {
      const activeChunk = frameManager.getChunkIndex(currentTargetFrameRef.current);
      setTelemetry((prev) => ({
        ...prev,
        variant: data.variant,
        totalLoaded: data.loadedCount,
        initialLoaded: data.initialLoaded,
        initialPercent: data.initialPercent,
        isInitialReady: data.isInitialReady,
        currentChunk: activeChunk,
        totalChunks: frameManager.totalChunks,
        activeChunks: data.activeChunks,
      }));
    };

    // Initialize sequence: loads ONLY Chunk 1
    frameManager.setSequence(activeConfig);
    frameManagerRef.current = frameManager;

    // Render existing poster if already in cache
    const existingPoster = defaultFrameCache.get(activeConfig.id, 1);
    if (existingPoster && canvasComponentRef.current) {
      canvasComponentRef.current.renderImmediate(existingPoster);
      lastRenderedFrameRef.current = 1;
    }

    return () => {
      frameManager.destroy();
      frameManagerRef.current = null;
      defaultFrameCache.clear(activeConfig.id);
    };
  }, [activeConfig]);

  // Initialize GSAP ScrollTrigger controller with Apple-style scrub
  useEffect(() => {
    if (!containerRef.current || !pinnedRef.current) return;

    const controller = new ScrollController({
      triggerElement: containerRef.current,
      pinnedElement: pinnedRef.current,
      totalFrames: activeConfig.totalFrames,
      onUpdate: ({ frameIndex, direction, hasFrameChanged }) => {
        currentTargetFrameRef.current = frameIndex;

        const fm = frameManagerRef.current;
        if (!fm) return;

        // Redraw Canvas only when scrolling requests a different frame
        if (hasFrameChanged) {
          // Request frame through FrameManager with direction-aware prefetch
          const cachedImg = fm.requestFrame(frameIndex, direction);

          if (cachedImg && canvasComponentRef.current) {
            // Draw cached frame immediately
            canvasComponentRef.current.renderImmediate(cachedImg);
            lastRenderedFrameRef.current = frameIndex;
          } else {
            // Missing frame: FrameManager prioritized it; keep last displayed frame visible
            renderTargetOrFallback(frameIndex);
          }

          const chunk = fm.getChunkIndex(frameIndex);
          setTelemetry((prev) => ({
            ...prev,
            currentFrame: frameIndex,
            currentChunk: chunk,
            direction,
          }));
        }
      },
    });

    controller.init();
    scrollControllerRef.current = controller;

    return () => {
      controller.destroy();
      scrollControllerRef.current = null;
    };
  }, [activeConfig.totalFrames, renderTargetOrFallback]);

  // Handle responsive device breakpoint transitions (desktop <-> mobile)
  useEffect(() => {
    const unsubscribe = subscribeDeviceChange((nextVariant) => {
      const newConfig = SEQUENCE_CONFIG[nextVariant];

      // Purge previous variant memory cache
      defaultFrameCache.clear(activeConfig.id);

      setActiveConfig(newConfig);

      if (scrollControllerRef.current) {
        scrollControllerRef.current.updateTotalFrames(newConfig.totalFrames);
        scrollControllerRef.current.refresh();
      }
    });

    return unsubscribe;
  }, [activeConfig.id]);

  // Handle canvas resize: redraw current frame synchronously
  const handleCanvasResize = useCallback(() => {
    renderTargetOrFallback(currentTargetFrameRef.current);
    scrollControllerRef.current?.refresh();
  }, [renderTargetOrFallback]);

  /**
   * Jump directly to a room perspective on click
   */
  const handleJumpToSection = (section) => {
    const targetProgress = (section.startProgress + section.endProgress) / 2;
    const targetFrame = Math.min(
      activeConfig.totalFrames,
      Math.max(1, Math.floor(targetProgress * (activeConfig.totalFrames - 1)) + 1)
    );

    const dir = targetFrame >= currentTargetFrameRef.current ? 1 : -1;
    currentTargetFrameRef.current = targetFrame;

    const fm = frameManagerRef.current;
    if (fm) {
      const cachedImg = fm.requestFrame(targetFrame, dir);
      if (cachedImg && canvasComponentRef.current) {
        canvasComponentRef.current.renderImmediate(cachedImg);
        lastRenderedFrameRef.current = targetFrame;
      } else {
        renderTargetOrFallback(targetFrame);
      }
    }

    // Scroll window smoothly to match
    if (scrollControllerRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top;
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: scrollTop + targetProgress * totalScrollable,
        behavior: "smooth",
      });
    }
  };

  const normalizedProgress =
    (telemetry.currentFrame - 1) / Math.max(1, activeConfig.totalFrames - 1);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-zinc-950"
      style={{ height: scrollDistance }}
    >
      {/* Pinned Viewport Container (Locked by GSAP ScrollTrigger) */}
      <div
        ref={pinnedRef}
        className="w-full h-screen overflow-hidden flex flex-col justify-between items-center relative select-none"
      >
        {/* HTML5 Reusable Canvas */}
        <HotelCanvas
          ref={canvasComponentRef}
          onResize={handleCanvasResize}
        />

        {/* Loading Indicator for Initial 50 Frames (Chunk 1) */}
        <HotelLoader
          isReady={telemetry.isInitialReady}
          progress={telemetry.initialPercent}
          loadedCount={telemetry.initialLoaded}
          targetBatch={50}
          title={title}
          subtitle={subtitle}
        />

        {/* Real-time Architectural Space Overlays */}
        <HotelOverlay progress={normalizedProgress} />

        {/* Top-Right Progressive Telemetry Badge */}
        <div className="absolute top-6 right-8 z-30 pointer-events-none flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2.5 bg-zinc-950/75 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800 text-xs font-mono shadow-xl">
            <span
              className={`w-2 h-2 rounded-full ${
                telemetry.isInitialReady
                  ? "bg-emerald-400"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-zinc-200 uppercase font-semibold">
              {telemetry.variant}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-amber-300">
              Frame {String(telemetry.currentFrame).padStart(3, "0")} /{" "}
              {String(activeConfig.totalFrames).padStart(3, "0")}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-cyan-300">
              Chunk {telemetry.currentChunk} of {telemetry.totalChunks}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400">
              {telemetry.totalLoaded} Cached
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-zinc-950/60 px-3 py-1 rounded-full border border-zinc-800/60">
            <span>Direction: {telemetry.direction > 0 ? "↓ Forward" : "↑ Reverse"}</span>
            <span>· Active Chunks: [{telemetry.activeChunks.join(", ")}]</span>
          </div>
        </div>

        {/* Floating Quick Perspective Navigation (for Distant Jumps) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-2 pointer-events-auto">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 px-2 mb-1">
            Perspectives
          </span>
          {HOTEL_SECTIONS.map((sec) => {
            const isActive =
              normalizedProgress >= sec.startProgress &&
              normalizedProgress <= sec.endProgress;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleJumpToSection(sec)}
                className={`text-left px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10"
                    : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-amber-400" : "bg-zinc-600"
                    }`}
                  />
                  <span>
                    {sec.number} {sec.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Ambient Bottom Scrub Progress Line */}
        <div className="w-full max-w-xl px-8 pb-4 z-20 flex items-center gap-3 pointer-events-none">
          <span className="text-[10px] font-mono text-zinc-500">001</span>
          <div className="flex-1 bg-zinc-800/80 h-1 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-75"
              style={{ width: `${Math.round(normalizedProgress * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {String(activeConfig.totalFrames).padStart(3, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
