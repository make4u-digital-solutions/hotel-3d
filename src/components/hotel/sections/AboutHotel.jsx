"use client";

/**
 * Section 3 — About the Hotel
 *
 * Editorial 2-column layout exploring the hotel philosophy and architecture:
 * - Brand story and hospitality values
 * - Large supporting architectural photograph
 * - 70% desktop width centered container
 * - Full 100% opacity visibility at all times (zero scroll opacity reduction)
 */

import Image from "next/image";

export default function AboutHotel() {
  return (
    <section
      id="about"
      className="w-full py-20 lg:py-28 bg-[#FAF8F5] text-[#1A1A1A] relative border-b border-[#E8E1D5]/60 overflow-hidden"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Editorial Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column (Narrative & Story) — 7 cols */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
                Our Heritage & Philosophy
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight leading-[1.16] mb-6">
              Born from a Vision of Monolithic Tranquility and Coastal Harmony
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed mb-8">
              <p>
                Founded on the belief that true luxury resides in spatial generosity and quiet contemplation,
                The Grand Horizon was sculpted over four years by world-renowned minimalist architects.
                The estate synthesizes raw volcanic basalt pillars, honed quartzite stone terraces, and floor-to-ceiling
                acoustic curtain glass that captures the rhythmic ebb and flow of the tide.
              </p>
              <p>
                Our hospitality ethos is discreet, intuitive, and deeply personalized. Here, service is an art
                form: an unscripted attentiveness that anticipates every desire before it is spoken, while fiercely
                guarding the privacy and sanctity of your retreat.
              </p>
            </div>

            {/* Architectural Pillars Key Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8E1D5]">
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-semibold block">95</span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#8C8275]">
                  Private Hectares
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#B89758] font-semibold block">1 : 1</span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#8C8275]">
                  Butler Guest Ratio
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-semibold block">360°</span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#8C8275]">
                  Ocean Views
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (Large Architectural Photo) — 5 cols */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/5 w-full rounded-3xl overflow-hidden shadow-2xl border border-[#E8E1D5] group">
              <Image
                src="/images/about.webp"
                alt="Double-height reception cathedral and Calacatta marble interiors"
                fill
                sizes="(max-width: 1024px) 93vw, 30vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

              {/* Inset Quote Badge */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#FAF8F5]/90 backdrop-blur-md border border-white/60 shadow-lg text-[#1A1A1A]">
                <p className="font-serif italic text-xs leading-relaxed text-[#2D2D2D] mb-1">
                  “Architecture should not compete with the ocean; it should become a silent lens through which its majesty is magnified.”
                </p>
                <span className="text-[9px] font-mono tracking-widest uppercase text-[#B89758] font-semibold block">
                  — Atelier Director of Design
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
