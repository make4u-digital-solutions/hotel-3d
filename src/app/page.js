"use client";

import { useState } from "react";
import HotelCanvasViewer from "@/components/HotelCanvasViewer";
import FloatingProgressNav from "@/components/FloatingProgressNav";
import CustomCursor from "@/components/CustomCursor";
import { useLenis } from "@/hooks/useLenis";

export default function Home() {
  const [activeFrame, setActiveFrame] = useState(1);

  // Initialize Lenis smooth scrolling connected to GSAP ScrollTrigger
  const { scrollTo } = useLenis({
    duration: 1.2,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.8,
  });

  // Interior spaces mapped along the 248-frame sequence
  const perspectives = [
    {
      title: "Grand Arrival Portal",
      frame: 5,
      tag: "01 · Entrance",
      description: "Monumental limestone entrance threshold with ambient cove illumination.",
    },
    {
      title: "The Great Salon",
      frame: 43,
      tag: "02 · Living Room",
      description: "Floor-to-ceiling panoramic ocean glazing and Belgian linen appointments.",
    },
    {
      title: "Culinary Atelier",
      frame: 85,
      tag: "03 · Kitchen",
      description: "Monolithic Calacatta stone island and concealed fluted walnut cabinetry.",
    },
    {
      title: "Master Sanctuary",
      frame: 127,
      tag: "04 · Bedroom",
      description: "Private sunrise bedroom terrace with acoustic fluted slat detailing.",
    },
    {
      title: "Wellness Spa Suite",
      frame: 169,
      tag: "05 · Bathroom",
      description: "Honed basalt freestanding soaking tub bathed in natural skylight.",
    },
    {
      title: "Botanical Pavilion",
      frame: 209,
      tag: "06 · Garden",
      description: "Open-air reflection water mirror surrounded by native coastal flora.",
    },
  ];

  // Helper to smoothly glide to a specific perspective frame
  const handleJumpToFrame = (frame) => {
    if (typeof window === "undefined") return;
    const progress = (frame - 1) / (248 - 1);
    const trackHeight = window.innerHeight * 4;
    const scrollDistance = trackHeight - window.innerHeight;
    const targetScrollY = progress * scrollDistance;

    scrollTo(targetScrollY, {
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  const isScrolled = activeFrame > 4;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* 1. Subtle Cinematic Film-Grain Texture */}
      <div className="film-grain" aria-hidden="true" />

      {/* 2. Soft Edge Vignette */}
      <div className="cinematic-vignette" aria-hidden="true" />

      {/* 3. Luxury Custom Cursor with Smooth Interpolation */}
      <CustomCursor />

      {/* 
        4. Transparent Navbar that adds subtle blurred background when scrolling
      */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ease-out px-6 sm:px-10 lg:px-12 flex items-center justify-between ${
          isScrolled
            ? "py-3.5 sm:py-4 bg-zinc-950/45 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/25"
            : "py-6 sm:py-8 bg-transparent border-b border-transparent"
        }`}
      >
        {/* Top-Left: Elegant Architectural Logo */}
        <div
          onClick={() => handleJumpToFrame(1)}
          className="flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full border border-amber-400/40 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:border-amber-400/80">
            <span className="font-serif text-sm tracking-widest text-amber-200">
              H
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-light tracking-[0.28em] text-white uppercase font-sans">
              The Grand Horizon
            </span>
            <span className="text-[9px] font-mono tracking-[0.24em] text-zinc-400 uppercase">
              Resort & Residences
            </span>
          </div>
        </div>

        {/* Top-Right: Minimal Navigation Bar */}
        <nav className="flex items-center gap-4 sm:gap-7 text-xs font-mono tracking-[0.16em] uppercase text-zinc-400">
          <button
            type="button"
            onClick={() => handleJumpToFrame(5)}
            className="hover:text-amber-200 transition-colors duration-200 cursor-pointer"
          >
            Entrance
          </button>
          <button
            type="button"
            onClick={() => handleJumpToFrame(43)}
            className="hover:text-amber-200 transition-colors duration-200 cursor-pointer"
          >
            Living
          </button>
          <button
            type="button"
            onClick={() => handleJumpToFrame(85)}
            className="hover:text-amber-200 transition-colors duration-200 cursor-pointer"
          >
            Kitchen
          </button>
          <button
            type="button"
            onClick={() => handleJumpToFrame(127)}
            className="hover:text-amber-200 transition-colors duration-200 cursor-pointer"
          >
            Bedroom
          </button>
          <button
            type="button"
            onClick={() => handleJumpToFrame(169)}
            className="hover:text-amber-200 transition-colors duration-200 cursor-pointer"
          >
            Bathroom
          </button>
          <button
            type="button"
            onClick={() => handleJumpToFrame(209)}
            className="hover:text-amber-200 transition-colors duration-200 cursor-pointer"
          >
            Garden
          </button>
          <button
            type="button"
            onClick={() => {
              const specSection = document.getElementById("specifications");
              if (specSection) {
                scrollTo(specSection, { duration: 1.6 });
              }
            }}
            className="hidden lg:inline-flex items-center px-4 py-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/40 backdrop-blur-sm text-zinc-200 hover:border-amber-500/60 hover:text-amber-300 transition-all duration-200 text-[11px] cursor-pointer ml-2"
          >
            Inquire
          </button>
        </nav>
      </header>

      {/* 
        5. Bottom-Center Animated Scroll Indicator
        (Fades out gracefully once the user starts scrolling)
      */}
      <div className="fixed bottom-6 sm:bottom-8 inset-x-0 pointer-events-none z-30 flex justify-center">
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-700 ${
            activeFrame > 15
              ? "opacity-0 translate-y-3 pointer-events-none"
              : "opacity-100 translate-y-0"
          }`}
        >
          <span className="text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-400">
            Scroll
          </span>
          <div className="w-[18px] h-8 rounded-full border border-zinc-600/70 bg-zinc-950/40 backdrop-blur-sm flex justify-center pt-1.5 shadow-md">
            <div className="w-1 h-2 rounded-full bg-amber-400/90 animate-bounce" />
          </div>
        </div>
      </div>

      {/* 6. FLOATING PROGRESS NAVIGATION (Fixed to the right side of the screen) */}
      <FloatingProgressNav
        activeFrame={activeFrame}
        onSelectRoom={handleJumpToFrame}
      />

      {/* 7. PINNED GSAP SCROLLTRIGGER CANVAS SECTION */}
      <main className="relative w-full">
        <HotelCanvasViewer
          totalFrames={248}
          initialBatchSize={50}
          basePath="/hotel-frames/"
          scrollDistance="400vh"
          onFrameChange={setActiveFrame}
        />
      </main>

      {/* POST-PIN ARCHITECTURAL DETAILS SECTION */}
      <section
        id="specifications"
        className="max-w-7xl mx-auto px-6 py-24 w-full flex flex-col gap-12 relative z-30 bg-zinc-950"
      >
        <div className="border-t border-zinc-800 pt-16">
          <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
            Key Architecture Perspectives
          </h3>
          <h2 className="text-3xl font-light text-white font-serif mb-8">
            Perspectives Visited During Scrubbing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {perspectives.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => handleJumpToFrame(item.frame)}
                className={`text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                  Math.abs(activeFrame - item.frame) < 18
                    ? "bg-zinc-900 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                    : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                      {item.tag}
                    </span>
                    <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300">
                      Frame #{item.frame}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-zinc-100 mb-2 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="group-hover:text-zinc-300">Smooth glide to perspective</span>
                  <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Technical Implementation Breakdown */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 sm:p-10">
          <h3 className="text-xl font-light text-white font-serif mb-6 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            Apple-Grade Scroll Architecture with Lenis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div className="space-y-2.5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                1. Lenis Smooth Scroll Integration
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Native wheel and touch scrolling are upgraded with Lenis inertia physics. Lenis is synchronized directly to the <code className="text-zinc-200">gsap.ticker</code> with <code className="text-zinc-200">lagSmoothing(0)</code> for seamless 60/120Hz consistency.
              </p>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                2. GSAP ScrollTrigger Lockstep
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Lenis scroll events trigger <code className="text-zinc-200">ScrollTrigger.update()</code> in real-time. Frame changes map strictly to scroll progress: advance on downward scroll, reverse cleanly on upward scroll, and freeze indefinitely on stop.
              </p>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                3. Permanent Memory Cache & High-DPI
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                All 248 frames are permanently retained in memory without premature eviction. Retina displays scale via <code className="text-zinc-200">devicePixelRatio</code> while <code className="text-zinc-200">requestAnimationFrame</code> coalesces canvas redraws.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 text-center text-xs text-zinc-500 font-mono">
        <p>The Grand Horizon · Lenis Smooth Scroll · 248 High-Resolution WebP Frames</p>
      </footer>
    </div>
  );
}
