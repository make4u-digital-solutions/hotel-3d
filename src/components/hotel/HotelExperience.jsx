"use client";

/**
 * HotelExperience Component
 *
 * Master orchestrator module for the hotel scroll experience.
 * Coordinates device detection, sequence configuration, priority chunking,
 * in-memory caching, canvas rendering, and GSAP ScrollTrigger scrubbing.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import HotelCanvas from "./HotelCanvas";
import HotelLoader from "./HotelLoader";
import HotelOverlay from "./HotelOverlay";
import { SEQUENCE_CONFIG } from "@/lib/hotel/config";
import {
  getActiveSequenceConfig,
  subscribeDeviceChange,
} from "@/lib/hotel/deviceDetector";
import { defaultFrameCache } from "@/lib/hotel/frameCache";
import { ChunkManager } from "@/lib/hotel/chunkManager";
import { ScrollController } from "@/lib/hotel/scrollController";

export default function HotelExperience({
  scrollDistance = "400vh",
  title = "The Grand Horizon",
  onFrameUpdate,
}) {
  const containerRef = useRef(null);
  const pinnedRef = useRef(null);
  const canvasComponentRef = useRef(null);

  // Active configuration state
  const [activeConfig, setActiveConfig] = useState(getActiveSequenceConfig);
  const [isInitialReady, setIsInitialReady] = useState(false);
  const [initialProgress, setInitialProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);

  // Engine references
  const chunkManagerRef = useRef(null);
  const scrollControllerRef = useRef(null);

  // Initialize or re-initialize chunk manager on variant change
  useEffect(() => {
    const chunkManager = new ChunkManager({
      cache: defaultFrameCache,
      concurrency: 5,
    });

    chunkManager.onProgressCallback = (data) => {
      setLoadedCount(data.loadedCount);
      setInitialProgress(data.initialPercent);
      if (data.isInitialReady) {
        setIsInitialReady(true);
      }
    };

    chunkManager.setSequence(activeConfig);
    chunkManagerRef.current = chunkManager;

    return () => {
      chunkManager.destroy();
      chunkManagerRef.current = null;
    };
  }, [activeConfig]);

  // Handle frame drawing
  const renderFrameAtIndex = useCallback(
    (index) => {
      const img = defaultFrameCache.get(activeConfig.id, index);
      if (img && canvasComponentRef.current) {
        canvasComponentRef.current.renderFrame(img);
      } else if (chunkManagerRef.current) {
        // Prioritize loading this frame and adjacent window
        chunkManagerRef.current.prioritizeWindow(index, 10);
      }
    },
    [activeConfig.id]
  );

  // Render initial frame as soon as first batch is ready
  useEffect(() => {
    if (isInitialReady) {
      renderFrameAtIndex(currentFrame);
    }
  }, [isInitialReady, currentFrame, renderFrameAtIndex]);

  // Initialize ScrollController
  useEffect(() => {
    if (!containerRef.current || !pinnedRef.current || !isInitialReady) return;

    const controller = new ScrollController({
      triggerElement: containerRef.current,
      pinnedElement: pinnedRef.current,
      totalFrames: activeConfig.totalFrames,
      onUpdate: ({ progress, frameIndex }) => {
        setScrollProgress(progress);
        setCurrentFrame(frameIndex);

        renderFrameAtIndex(frameIndex);

        if (chunkManagerRef.current) {
          chunkManagerRef.current.prioritizeWindow(frameIndex, 12);
        }

        if (onFrameUpdate) {
          onFrameUpdate({ progress, frameIndex });
        }
      },
    });

    controller.init();
    scrollControllerRef.current = controller;

    return () => {
      controller.destroy();
      scrollControllerRef.current = null;
    };
  }, [isInitialReady, activeConfig.totalFrames, renderFrameAtIndex, onFrameUpdate]);

  // Subscribe to responsive device breakpoint transitions
  useEffect(() => {
    const unsubscribe = subscribeDeviceChange((nextVariant) => {
      const newConfig = SEQUENCE_CONFIG[nextVariant];
      setActiveConfig(newConfig);

      if (scrollControllerRef.current) {
        scrollControllerRef.current.updateTotalFrames(newConfig.totalFrames);
        scrollControllerRef.current.refresh();
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-zinc-950"
      style={{ height: scrollDistance }}
    >
      {/* Pinned Viewport Container */}
      <div
        ref={pinnedRef}
        className="w-full h-screen overflow-hidden flex flex-col justify-between items-center relative select-none"
      >
        {/* HTML5 Canvas */}
        <HotelCanvas
          ref={canvasComponentRef}
          onResize={() => {
            renderFrameAtIndex(currentFrame);
            scrollControllerRef.current?.refresh();
          }}
        />

        {/* Preloader Overlay */}
        <HotelLoader
          isReady={isInitialReady}
          progress={initialProgress}
          loadedCount={loadedCount}
          targetBatch={activeConfig.initialBatchSize}
          title={title}
        />

        {/* Architectural Story Overlays */}
        <HotelOverlay progress={scrollProgress} />

        {/* Subtle Ambient Bottom Progress Line */}
        <div className="w-full max-w-xl px-8 pb-4 z-20 flex items-center gap-3 pointer-events-none">
          <span className="text-[10px] font-mono text-zinc-500">001</span>
          <div className="flex-1 bg-zinc-800/80 h-1 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-75"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
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
