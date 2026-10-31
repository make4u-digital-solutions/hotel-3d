"use client";

/**
 * Section 5 — Dining Experience
 *
 * Highlights The Solarium restaurant and culinary atelier:
 * - Restaurant introduction and philosophy
 * - Large food & restaurant photography
 * - Explore Dining interactive button
 * - 70% desktop width centered container
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const MENU_HIGHLIGHTS = [
  { course: "First Course", dish: "Pacific Bluefin Crudo", notes: "Yuzu emulsion, shaved sea fennel, cold-pressed olive nectar" },
  { course: "Main Atelier", dish: "Wild Turbot Roasted in Sea Kelp", notes: "Morel mousseline, charred baby leeks, vin jaune reduction" },
  { course: "From the Cellar", dish: "Grand Cru Reserve Sommelier Pairing", notes: "Domaine Leflaive 2018 & Château Margaux 2010" },
  { course: "Dolce Finale", dish: "Dark Valrhona Cocoa & Smoked Sea Salt", notes: "Burnt rosemary gelato, crisp candied hazelnut wafers" },
];

export default function DiningExperience() {
  const [showMenuModal, setShowMenuModal] = useState(false);

  return (
    <section
      id="dining"
      className="w-full py-20 lg:py-28 bg-[#F5F2EB] text-[#1A1A1A] relative border-b border-[#E8E1D5]/60"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
              Culinary Atelier
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight mb-4">
            Culinary Artistry at The Solarium
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed">
            Floor-to-ceiling glass pavilions overlooking tranquil coastal gardens. Our Michelin-caliber culinary
            team reimagines native maritime bounty through French precision and Japanese restraint.
          </p>
        </div>

        {/* Large Heroic Dining Photography Card */}
        <div className="relative w-full aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden shadow-2xl border border-[#E8E1D5] mb-10 group bg-stone-900">
          <Image
            src="/images/dining.jpg"
            alt="The Solarium oceanfront dining salon and fine dining table settings"
            fill
            sizes="(max-width: 768px) 93vw, 70vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Floating Gastronomy Inset */}
          <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-10 text-white max-w-md z-10">
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 block mb-1">
              Floor-to-Ceiling Solarium
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-light mb-2">
              Seafood Harvest & Grand Cru Cellar
            </h3>
            <p className="text-xs text-zinc-300 font-light leading-relaxed hidden sm:block">
              Daily artisanal tasting menus crafted around the ocean catch brought to our private dock each morning.
            </p>
          </div>

          <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-10 z-10">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMenuModal(true)}
              className="px-6 py-2.5 rounded-full bg-white text-[#1A1A1A] hover:bg-[#B89758] hover:text-white text-xs font-mono font-medium tracking-wider uppercase transition-colors shadow-lg cursor-pointer"
            >
              Explore Dining Menu →
            </motion.button>
          </div>
        </div>

        {/* 3 Pillars of Gastronomy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <span className="text-xs font-mono text-[#B89758] font-semibold tracking-wider block mb-1">01 · MORNING HARVEST</span>
            <h4 className="font-serif text-lg text-[#1A1A1A] mb-1.5">Hyper-Local Provenance</h4>
            <p className="text-xs text-[#5A554E] font-light leading-relaxed">
              Every vegetable harvested from our coastal greenhouse garden within hours of service.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <span className="text-xs font-mono text-[#B89758] font-semibold tracking-wider block mb-1">02 · SOMMELIER CELLAR</span>
            <h4 className="font-serif text-lg text-[#1A1A1A] mb-1.5">3,500 Rare Vintages</h4>
            <p className="text-xs text-[#5A554E] font-light leading-relaxed">
              Curated by Head Sommelier Jean-Luc Moreau with bespoke private pairings in the basalt cellar.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <span className="text-xs font-mono text-[#B89758] font-semibold tracking-wider block mb-1">03 · IN-SUITE ATELIER</span>
            <h4 className="font-serif text-lg text-[#1A1A1A] mb-1.5">Private Chef Dining</h4>
            <p className="text-xs text-[#5A554E] font-light leading-relaxed">
              Experience multi-course bespoke dining on your private residence terrace under the stars.
            </p>
          </div>
        </div>
      </div>

      {/* Tasting Menu Modal */}
      <AnimatePresence>
        {showMenuModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenuModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-2xl z-10"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] mb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B89758] block">The Solarium Tasting Menu</span>
                    <h3 className="font-serif text-xl text-[#1A1A1A]">Autumn Degustation Menu</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMenuModal(false)}
                    className="p-1.5 rounded-full hover:bg-stone-200 text-stone-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {MENU_HIGHLIGHTS.map((item, idx) => (
                    <div key={idx} className="pb-3 border-b border-[#E8E1D5]/60 last:border-0">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-[#B89758] block mb-0.5">{item.course}</span>
                      <h4 className="font-serif text-base text-[#1A1A1A] font-medium">{item.dish}</h4>
                      <p className="text-xs text-[#736B5E] font-light">{item.notes}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowMenuModal(false)}
                  className="w-full py-3 rounded-full bg-[#1A1A1A] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#B89758] transition-colors"
                >
                  Close Tasting Menu
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
