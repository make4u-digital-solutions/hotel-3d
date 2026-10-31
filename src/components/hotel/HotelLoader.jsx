"use client";

/**
 * HotelLoader Component
 *
 * Displays a luxury buffering preloader during initial frame caching.
 * Once the hero section loads, the percentage area and loader smoothly fade out
 * and are completely unmounted and removed from the DOM.
 */

import { useState, useEffect } from "react";

export default function HotelLoader({
  isReady = false,
  progress = 0,
  loadedCount = 0,
  targetBatch = 50,
  title = "The Grand Horizon",
  subtitle = "Curating Architectural Experience",
}) {
  const isDismissed = isReady || progress >= 100;
  const [isRendered, setIsRendered] = useState(!isDismissed);

  useEffect(() => {
    if (isDismissed) {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDismissed]);

  // After the hero section loads, do not show the percentage area or loader
  if (!isRendered) {
    return null;
  }

  return (
    <div
      aria-hidden={isDismissed}
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 transition-all duration-500 ease-out select-none ${
        isDismissed
          ? "opacity-0 pointer-events-none scale-105"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Status Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs tracking-widest uppercase font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Interactive 3D Sequence
        </div>

        {/* Title */}
        <h2 className="text-2xl font-light tracking-wide text-zinc-100 mb-2 font-serif">
          {title}
        </h2>
        <p className="text-xs text-zinc-400 tracking-wider mb-8 uppercase">
          {subtitle}
        </p>

        {/* Circular Progress Indicator (Percentage Area) */}
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
              strokeDashoffset={2 * Math.PI * 44 * (1 - Math.min(100, progress) / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extralight tracking-tighter text-white">
              {progress}
              <span className="text-sm font-normal text-amber-400">%</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">INITIALIZING</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-3 border border-zinc-700/50">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>

        <p className="text-[11px] text-zinc-400 font-mono">
          Buffering initial frames {Math.min(loadedCount, targetBatch)} / {targetBatch}
        </p>
      </div>
    </div>
  );
}
