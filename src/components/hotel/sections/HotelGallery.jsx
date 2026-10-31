"use client";

/**
 * Section 7 — Hotel Gallery
 *
 * Editorial photography masonry gallery:
 * - Asymmetric editorial responsive layout
 * - Elegant hover interactions with metadata caption overlays
 * - Filter tabs (All, Architecture, Suites, Gastronomy, Wellness)
 * - 70% desktop width centered container
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const GALLERY_PHOTOS = [
  { id: 1, title: "The Solarium Fine Dining", category: "Gastronomy", src: "/images/dining.jpg", span: "md:col-span-8 md:row-span-2" },
  { id: 2, title: "Thermal Spa Soaking Sanctuary", category: "Wellness", src: "/images/spa.jpg", span: "md:col-span-4 md:row-span-1" },
  { id: 3, title: "The Horizon Master Suite", category: "Suites", src: "/images/suite-horizon.webp", span: "md:col-span-4 md:row-span-1" },
  { id: 4, title: "Double-Height Marble Lobby", category: "Architecture", src: "/images/about.webp", span: "md:col-span-4 md:row-span-1" },
  { id: 5, title: "Cantilevered Reflection Terraces", category: "Architecture", src: "/images/intro.webp", span: "md:col-span-4 md:row-span-1" },
  { id: 6, title: "Porte-Cochère Basalt Columns", category: "Architecture", src: "/images/gallery-1.webp", span: "md:col-span-4 md:row-span-1" },
];

const CATEGORIES = ["All", "Architecture", "Suites", "Gastronomy", "Wellness"];

export default function HotelGallery() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPhotos =
    activeCategory === "All"
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === activeCategory);

  return (
    <section
      id="gallery"
      className="w-full py-20 lg:py-28 bg-white text-[#1A1A1A] relative border-b border-[#E8E1D5]/60"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
              Visual Narrative
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight mb-4">
            The Grand Horizon Gallery
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed">
            A visual anthology capturing the interplay of natural sea light, sculptural stone, and tranquil living spaces.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "bg-[#FAF8F5] text-[#736B5E] hover:bg-[#EAE4D9] border border-[#E8E1D5]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[240px] sm:auto-rows-[270px]">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-3xl overflow-hidden border border-[#E8E1D5] shadow-sm group bg-stone-200 cursor-pointer ${
                  photo.span || "md:col-span-4 md:row-span-1"
                }`}
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 768px) 93vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                />
                {/* Dark Ambient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Caption Badge */}
                <div className="absolute bottom-5 left-5 right-5 z-10 text-white transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-amber-300 block mb-1">
                    {photo.category}
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-light leading-snug">
                    {photo.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
