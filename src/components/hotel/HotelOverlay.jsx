"use client";

/**
 * HotelOverlay Component
 *
 * Renders ambient architectural overlays and space perspectives
 * synchronized to normalized scroll progress [0.0, 1.0].
 * Cleanly decouples presentation from frame counts.
 */

import { HOTEL_SECTIONS } from "@/lib/hotel/config";

export default function HotelOverlay({
  progress = 0,
  activeSection = null,
  sections = HOTEL_SECTIONS,
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {sections.map((section) => {
        // Active if normalized progress falls within section range
        const isVisible =
          progress >= section.startProgress && progress <= section.endProgress;
        const isLeft = section.position === "left";

        return (
          <div
            key={section.id}
            className={`absolute bottom-12 sm:bottom-16 w-[90%] max-w-[340px] sm:max-w-[380px] transition-all duration-500 ease-out ${
              isLeft
                ? "left-6 sm:left-10 lg:left-14"
                : "right-6 sm:right-10 lg:right-14"
            } ${
              isVisible
                ? "opacity-100 translate-y-0 filter-none pointer-events-auto"
                : "opacity-0 translate-y-6 blur-sm pointer-events-none"
            }`}
          >
            {/* Glassmorphic Card Container */}
            <div className="relative p-5 sm:p-6 rounded-2xl bg-zinc-950/50 backdrop-blur-xl border border-white/[0.09] shadow-2xl shadow-black/80 overflow-hidden">
              {/* Top ambient gold accent hairline */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

              {/* Tag & Room Identifier */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-300 font-medium">
                    {section.number} · {section.label}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-light font-serif tracking-wide text-white mb-1">
                {section.title}
              </h3>

              {/* Architectural Specs */}
              {section.specs && (
                <p className="text-[10px] sm:text-[11px] font-mono text-amber-200/70 tracking-wider mb-2">
                  {section.specs}
                </p>
              )}

              {/* Description */}
              <p className="text-xs text-zinc-300/85 font-light leading-relaxed">
                {section.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
