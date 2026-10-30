"use client";

import { useState } from "react";
import HotelCanvasViewer from "@/components/HotelCanvasViewer";

export default function Home() {
  const [activeFrame, setActiveFrame] = useState(1);

  // Key perspectives mapped to sequence frames
  const perspectives = [
    {
      title: "Front Facade & Arrival",
      frame: 1,
      description: "Grand entrance driveway and architectural exterior lighting.",
    },
    {
      title: "Sunlit Terraces",
      frame: 68,
      description: "Private balconies overlooking the cascading tropical gardens.",
    },
    {
      title: "Main Villa & Courtyard",
      frame: 135,
      description: "Central open-air lounge and reflection pools.",
    },
    {
      title: "Panorama & Ocean Wing",
      frame: 210,
      description: "Full sweeping vista of the resort complex and coastal sunset.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Luxury Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-zinc-950 font-black text-base font-serif">H</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-widest uppercase text-zinc-100">
                The Grand Horizon
              </h1>
              <p className="text-[10px] text-zinc-400 tracking-wider uppercase font-mono">
                Cinematic 3D Image Sequence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Canvas 2D / Off-Thread Decoded</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <span>248 WebP Keyframes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Showcase */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">
        {/* Title & Experience Overview */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest mb-2">
              <span>● Interactive Virtual Tour</span>
              <span className="text-zinc-600">/</span>
              <span>Ultra-Smooth Scrubbing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white font-serif">
              Explore The Resort in 360°
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Drag horizontally across the canvas or use the timeline controls below.
              The preloader buffers the first 50 frames before seamless render, while the
              remaining 198 frames stream progressively in the background.
            </p>
          </div>

          {/* Current Frame Readout */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-4 shrink-0 shadow-lg">
            <div>
              <div className="text-[10px] uppercase font-mono text-zinc-500">
                Active Frame
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {String(activeFrame).padStart(4, "0")}
                <span className="text-xs text-zinc-500 font-normal"> / 0248</span>
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div>
              <div className="text-[10px] uppercase font-mono text-zinc-500">
                Resolution
              </div>
              <div className="text-sm font-semibold text-zinc-200">
                1280 × 720 <span className="text-xs text-zinc-500">HD</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Canvas Sequence Component */}
        <section className="w-full h-[60vh] sm:h-[68vh] min-h-[480px] max-h-[820px]">
          <HotelCanvasViewer
            totalFrames={248}
            initialBatchSize={50}
            basePath="/hotel-frames/"
            onFrameChange={setActiveFrame}
          />
        </section>

        {/* Quick Perspective Jump Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perspectives.map((item, index) => {
            const isActive = Math.abs(activeFrame - item.frame) < 18;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveFrame(item.frame)}
                className={`text-left p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between group ${
                  isActive
                    ? "bg-zinc-900 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                    : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80">
                      Perspective 0{index + 1}
                    </span>
                    <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      Frame #{item.frame}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-100 mb-1 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Click to view angle</span>
                  <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        {/* Architecture & Engineering Highlights */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Engineering & Performance Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider font-mono text-amber-400">
                1. Intelligent Preloader
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Fetches the first 50 frames with an active percentage gauge. Automatically
                transitions away the instant initial readiness is reached to ensure zero wait
                time for user interaction.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider font-mono text-cyan-400">
                2. Progressive Non-Blocking Cache
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                The remaining 198 frames are streamed via a controlled background queue
                leveraging <code className="text-zinc-300">requestIdleCallback</code>. Interactive
                scrubbing prioritizes frames in the immediate playhead radius.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider font-mono text-emerald-400">
                3. LRU Memory Management & High-DPI
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Decodes images off-thread with <code className="text-zinc-300">createImageBitmap</code>.
                An LRU cache dynamically evicts GPU textures to prevent browser tab bloat, while
                scaling dynamically to retina <code className="text-zinc-300">devicePixelRatio</code>.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500 font-mono">
        <p>The Grand Horizon 3D Canvas Showcase · 248 High-Resolution WebP Frames</p>
      </footer>
    </div>
  );
}
