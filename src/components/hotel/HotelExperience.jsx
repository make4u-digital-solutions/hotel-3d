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

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import HotelCanvas from "./HotelCanvas";
import HotelLoader from "./HotelLoader";
import HotelOverlay from "./HotelOverlay";
import HotelNavbar from "./HotelNavbar";
import HotelBookingWidget from "./HotelBookingWidget";
import HotelSearchResultsModal from "./HotelSearchResultsModal";
import HotelHomepage from "./HotelHomepage";
import { HOTEL_SCENES, SEQUENCE_CONFIG } from "@/lib/hotel/config";
import {
  getDeviceVariantClientSnapshot,
  getDeviceVariantServerSnapshot,
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
  const scrubLineRef = useRef(null);

  // Active scene tracking for quick perspective buttons (only updates on scene boundary change)
  const [activeSceneId, setActiveSceneId] = useState(HOTEL_SCENES[0].id);
  const activeSceneRef = useRef(HOTEL_SCENES[0].id);

  // Search Results Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  // Active configuration (desktop or mobile) synchronized via external store
  const activeVariant = useSyncExternalStore(
    subscribeDeviceChange,
    getDeviceVariantClientSnapshot,
    getDeviceVariantServerSnapshot
  );
  const activeConfig = SEQUENCE_CONFIG[activeVariant];

  // Initial buffer telemetry (ONLY used for the initial preloader)
  const [telemetry, setTelemetry] = useState(() => {
    const isCached = defaultFrameCache.has(activeConfig.id, 1);
    const initialBatch = activeConfig.initialBatchSize || 20;
    return {
      variant: activeConfig.id,
      initialLoaded: isCached ? initialBatch : 0,
      initialPercent: isCached ? 100 : 0,
      isInitialReady: isCached,
    };
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

  // Initialize FrameManager with device-adaptive parameters
  useEffect(() => {
    const isMobile = activeConfig.id === "mobile";
    const frameManager = new FrameManager({
      cache: defaultFrameCache,
      concurrency: activeConfig.concurrency || (isMobile ? 2 : 4),
      chunkSize: activeConfig.chunkSize || (isMobile ? 20 : 35),
      prefetchThreshold: activeConfig.prefetchThreshold || (isMobile ? 8 : 12),
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

    // Update telemetry state ONLY for initial loader (stops re-renders once ready)
    frameManager.onProgressCallback = (data) => {
      setTelemetry((prev) => {
        if (prev.isInitialReady && data.isInitialReady) {
          return prev;
        }
        return {
          ...prev,
          variant: data.variant,
          initialLoaded: data.initialLoaded,
          initialPercent: data.initialPercent,
          isInitialReady: data.isInitialReady,
        };
      });
    };

    // Initialize sequence: loads Chunk 1 then remaining chunks in background
    frameManager.setSequence(activeConfig);
    frameManagerRef.current = frameManager;

    // Render existing poster if already in cache
    const existingPoster = defaultFrameCache.get(activeConfig.id, 1);
    if (existingPoster && canvasComponentRef.current) {
      canvasComponentRef.current.renderImmediate(existingPoster);
      lastRenderedFrameRef.current = 1;
      setTelemetry((prev) => ({
        ...prev,
        isInitialReady: true,
        initialPercent: 100,
      }));
    }

    return () => {
      frameManager.destroy();
      frameManagerRef.current = null;
      // DO NOT clear cache on unmount - frames stay permanently cached for the active device
    };
  }, [activeConfig]);

  // Initialize GSAP ScrollTrigger controller with Apple-style scrub
  useEffect(() => {
    if (!containerRef.current || !pinnedRef.current) return;

    const controller = new ScrollController({
      triggerElement: containerRef.current,
      pinnedElement: pinnedRef.current,
      totalFrames: activeConfig.totalFrames,
      onUpdate: ({ progress, frameIndex, direction, hasFrameChanged }) => {
        currentTargetFrameRef.current = frameIndex;

        // 1. Direct DOM update for scrub progress bar: 0ms overhead, zero React re-render
        if (scrubLineRef.current) {
          const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
          scrubLineRef.current.style.width = `${pct}%`;
        }

        // 2. Active scene indicator - only update state when crossing a scene boundary
        const matchedScene = HOTEL_SCENES.find(
          (s) => progress >= s.startProgress && progress <= s.endProgress
        );
        const currentSceneId = matchedScene ? matchedScene.id : HOTEL_SCENES[0].id;
        if (currentSceneId !== activeSceneRef.current) {
          activeSceneRef.current = currentSceneId;
          setActiveSceneId(currentSceneId);
        }

        const fm = frameManagerRef.current;
        if (!fm) return;

        // 3. Redraw Canvas only when scrolling requests a different frame
        if (hasFrameChanged) {
          const cachedImg = fm.requestFrame(frameIndex, direction);

          if (cachedImg && canvasComponentRef.current) {
            canvasComponentRef.current.renderImmediate(cachedImg);
            lastRenderedFrameRef.current = frameIndex;
          } else {
            renderTargetOrFallback(frameIndex);
          }
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
  const prevVariantRef = useRef(activeVariant);
  useEffect(() => {
    if (prevVariantRef.current !== activeVariant) {
      // Purge previous variant memory cache and close ImageBitmaps
      defaultFrameCache.clear(prevVariantRef.current);
      prevVariantRef.current = activeVariant;

      if (scrollControllerRef.current) {
        scrollControllerRef.current.updateTotalFrames(activeConfig.totalFrames);
        scrollControllerRef.current.refresh();
      }
    }
  }, [activeVariant, activeConfig.totalFrames]);

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

  const handleOpenSearch = useCallback((params) => {
    if (params) {
      setSearchParams(params);
    }
    setIsSearchModalOpen(true);
  }, []);

  const handleBookNowNavbar = useCallback(() => {
    setIsSearchModalOpen(true);
  }, []);

  const handleNavClick = (link) => {
    if (link.label === "Rooms & Suites") {
      const el = document.getElementById("rooms-and-suites");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        setIsSearchModalOpen(true);
      }
    } else if (link.label === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (link.label === "Experiences") {
      const el = document.getElementById("experiences");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else handleJumpToSection(HOTEL_SCENES[1]);
    } else if (link.label === "Dining") {
      const el = document.getElementById("dining");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else handleJumpToSection(HOTEL_SCENES[3]);
    } else if (link.label === "About Us") {
      const el = document.getElementById("about");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else handleJumpToSection(HOTEL_SCENES[0]);
    } else if (link.label === "Contact") {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else setIsSearchModalOpen(true);
    }
  };

  return (
    <div className="relative w-full bg-[#FAF8F5]">
      {/* Light-theme Luxury Hotel Navbar */}
      <HotelNavbar
        onBookNowClick={handleBookNowNavbar}
        onNavClick={handleNavClick}
      />

      {/* Hero Animated Walkthrough Pin Section */}
      <div
        ref={containerRef}
        id="home"
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

        {/* Loading Indicator for Initial Frames */}
        <HotelLoader
          isReady={telemetry.isInitialReady}
          progress={telemetry.initialPercent}
          loadedCount={telemetry.initialLoaded}
          targetBatch={activeConfig.initialBatchSize || 20}
          title={title}
          subtitle={subtitle}
        />

        {/* Real-time Scene Content & Text Transitions */}
        <HotelOverlay
          triggerRef={containerRef}
          totalFrames={activeConfig.totalFrames}
          onActionClick={handleJumpToSection}
        />

        {/* Hero Section Booking & Search Bar (Light Theme, Bottom of Hero) */}
        <HotelBookingWidget
          onSearch={handleOpenSearch}
        />

        {/* Floating Quick Perspective Navigation (for Distant Jumps) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-2 pointer-events-auto">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 px-2 mb-1">
            Scenes
          </span>
          {HOTEL_SCENES.map((sec) => {
            const isActive = activeSceneId === sec.id;

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

        {/* Ambient Bottom Scrub Progress Line (Driven directly via ref for 60fps smoothness) */}
        <div className="w-full max-w-xl px-8 pb-4 z-20 flex items-center gap-3 pointer-events-none">
          <span className="text-[10px] font-mono text-zinc-500">001</span>
          <div className="flex-1 bg-zinc-800/80 h-1 rounded-full overflow-hidden border border-zinc-800">
            <div
              ref={scrubLineRef}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-75"
              style={{ width: "0%" }}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {String(activeConfig.totalFrames).padStart(3, "0")}
          </span>
        </div>
        </div>
      </div>

      {/* Complete Premium Hotel Homepage Below Hero */}
      <HotelHomepage
        onBookClick={handleBookNowNavbar}
        onViewSuiteDetails={handleOpenSearch}
      />

      {/* Hotel Suite Search Results & Concierge Inquiry Modal */}
      <HotelSearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchParams={searchParams}
      />
    </div>
  );
}
