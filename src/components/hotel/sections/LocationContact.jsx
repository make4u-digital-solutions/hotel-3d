"use client";

/**
 * Section 9 — Location and Contact
 *
 * Geographical orientation and estate arrival details:
 * - Hotel location narrative & address
 * - Arrival distances (Private Airport, Marina, On-site Helipad)
 * - Stylized luxury map visual card
 * - "Get Directions" action
 * - 70% desktop width centered container
 */

import { motion } from "framer-motion";

export default function LocationContact() {
  const handleGetDirections = () => {
    window.open("https://maps.google.com/?q=The+Grand+Horizon+Resort", "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="contact"
      className="w-full py-20 lg:py-28 bg-[#FAF8F5] text-[#1A1A1A] relative border-b border-[#E8E1D5]/60 overflow-hidden"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column (Details & Contacts) — 6 cols */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
                Arrival & Location
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight mb-6">
              A Secluded Enclave on the Pacific Edge
            </h2>

            <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed mb-6">
              Situated along an exclusive coastal headland, The Grand Horizon is accessible via private scenic
              highway or direct helicopter transfer to our private on-site helipad.
            </p>

            {/* Address Block */}
            <div className="space-y-4 pt-4 border-t border-[#E8E1D5] mb-8">
              <div className="flex items-start gap-3">
                <span className="text-[#B89758] text-base mt-0.5">📍</span>
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#8C8275] block">Estate Address</span>
                  <p className="text-xs sm:text-sm text-[#1A1A1A] font-medium">
                    The Grand Horizon Estate, 1000 Coastal Horizon Way, Sanctuary Headlands
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-[#B89758] text-base mt-0.5">📞</span>
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#8C8275] block">Direct Concierge</span>
                  <a href="tel:+18005554321" className="text-xs sm:text-sm text-[#1A1A1A] font-medium hover:text-[#B89758] transition-colors">
                    +1 (800) 555-4321 · Available 24 Hours
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-[#B89758] text-base mt-0.5">✉️</span>
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#8C8275] block">Reservations Atelier</span>
                  <a href="mailto:reservations@grandhorizon.com" className="text-xs sm:text-sm text-[#1A1A1A] font-medium hover:text-[#B89758] transition-colors">
                    reservations@grandhorizon.com
                  </a>
                </div>
              </div>
            </div>

            {/* Action */}
            <div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetDirections}
                className="px-6 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#B89758] text-[#FAF8F5] text-xs font-mono tracking-[0.16em] uppercase transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Get Directions & Transit Info</span>
                <span>→</span>
              </motion.button>
            </div>
          </div>

          {/* Right Column (Stylized Map & Transit Visual) — 6 cols */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xl">
              {/* Stylized Map Viewport */}
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-center p-6 mb-6">
                {/* Architectural Grid Background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#B89758_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Stylized Coastline Vector Accent */}
                <svg className="absolute inset-0 w-full h-full text-[#B89758]/20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,80 Q30,50 60,65 T100,20 L100,100 L0,100 Z" fill="currentColor" opacity="0.4" />
                </svg>

                {/* Pin in Center */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-amber-300 border border-amber-400 flex items-center justify-center shadow-xl animate-bounce">
                    <span className="text-lg">✦</span>
                  </div>
                  <div className="mt-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-[#E8E1D5] text-[10px] font-mono tracking-wider text-[#1A1A1A] font-semibold shadow-xs">
                    The Grand Horizon
                  </div>
                </div>

                <div className="absolute top-3 left-3 text-[9px] font-mono text-[#8C8275] tracking-widest uppercase">
                  34°02′N 118°45′W · Coastal Elevation 62m
                </div>
              </div>

              {/* Transit Distance Badges */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                  <span className="text-[10px] font-mono text-[#8C8275] block uppercase">Helipad</span>
                  <span className="font-serif text-sm font-semibold text-[#1A1A1A]">On-Site</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                  <span className="text-[10px] font-mono text-[#8C8275] block uppercase">Private Jetport</span>
                  <span className="font-serif text-sm font-semibold text-[#1A1A1A]">18 Mins</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D5]">
                  <span className="text-[10px] font-mono text-[#8C8275] block uppercase">Private Marina</span>
                  <span className="font-serif text-sm font-semibold text-[#1A1A1A]">6 Mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
