"use client";

/**
 * Section 1 — Hotel Introduction
 *
 * Welcomes guests below the hero sequence with an editorial layout:
 * - Elegant serif welcome heading
 * - Evocative architectural introduction
 * - High-resolution supporting photograph with subtle hover parallax
 * - "Discover More" action
 * - 70% desktop width container centered horizontally
 * - Zero opacity reduction or white overlays on scroll (full 100% visibility)
 */

import Image from "next/image";
import { motion } from "framer-motion";

export default function HotelIntroduction({ onDiscoverClick }) {
  const handleScrollToSuites = () => {
    if (onDiscoverClick) {
      onDiscoverClick();
      return;
    }
    const el = document.getElementById("rooms-and-suites");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="introduction"
      className="w-full py-20 lg:py-28 bg-[#FAF8F5] text-[#1A1A1A] relative border-b border-[#E8E1D5]/60"
    >
      {/* 70% Viewport Centered Container */}
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Editorial Subtitle & Tag */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
              The Grand Horizon Sanctuary
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight leading-[1.18] mb-6">
            A Coastal Monument Where Architectural Grandeur Meets Timeless Hospitality
          </h2>

          <p className="text-sm sm:text-base text-[#5A554E] font-light leading-relaxed max-w-2xl mx-auto mb-8">
            Perched gracefully along sculpted volcanic basalt cliffs, The Grand Horizon invites you into a world
            of unhurried quietude. Framed by expansive cantilevered reflection terraces and double-height curtain
            walls, every perspective has been thoughtfully sculpted to foster connection with the sea.
          </p>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleScrollToSuites}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#B89758] text-[#FAF8F5] text-xs font-mono tracking-[0.16em] uppercase transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>Discover More</span>
            <span className="text-sm">↓</span>
          </motion.button>
        </div>

        {/* Supporting Architectural Photograph */}
        <div className="relative w-full aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden shadow-xl border border-[#E8E1D5] group">
          <Image
            src="/images/intro.webp"
            alt="The Grand Horizon estate grounds and coastal reflection pool"
            fill
            sizes="(max-width: 768px) 93vw, 70vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            priority={false}
          />
          {/* Subtle Ambient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Floating Image Caption */}
          <div className="absolute bottom-5 left-6 sm:bottom-7 sm:left-8 text-white z-10 pointer-events-none">
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300/90 block mb-0.5">
              Exterior Estate Terraces
            </span>
            <span className="font-serif text-base sm:text-lg font-light tracking-wide">
              Where Honed Quartzite Meets the Pacific Horizon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
