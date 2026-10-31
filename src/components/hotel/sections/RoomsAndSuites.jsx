"use client";

/**
 * Section 2 — Rooms & Suites
 *
 * Showcases the hotel's 4 signature suite residences:
 * - Premium room cards with photography
 * - Architectural specifications, inclusions, and rates
 * - "View Details" and "Book Now" actions
 * - 70% desktop width centered container
 */

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const ROOM_ITEMS = [
  {
    id: "horizon-master",
    name: "The Horizon Oceanfront Master Suite",
    category: "Signature Suite",
    price: 1250,
    size: "95 m² / 1,022 sq.ft",
    bed: "1 California King",
    view: "Panoramic Ocean Terraces",
    image: "/images/suite-horizon.webp",
    description:
      "Oriented directly toward the morning sunrise, featuring an intimate cantilevered outdoor lounge and monolithic quartzite soaking tub.",
    amenities: ["Private Sunrise Deck", "Honed Quartzite Soaking Tub", "Solarium Lounge Access", "Evening Turn-down"],
  },
  {
    id: "porte-villa",
    name: "The Porte-Cochère Garden Villa",
    category: "Garden Villa",
    price: 980,
    size: "82 m² / 882 sq.ft",
    bed: "1 California King",
    view: "Reflection Pools & Flora",
    image: "/images/suite-villa.webp",
    description:
      "A serene garden haven secluded behind monolithic basalt columns, offering soothing water fountain acoustics and acoustic privacy.",
    amenities: ["Volcanic Basalt Courtyard", "Acoustic Silence Slats", "Private Portico Access", "Daily Breakfast Basket"],
  },
  {
    id: "solarium-atelier",
    name: "The Solarium Dining Atelier Suite",
    category: "Executive Residence",
    price: 1650,
    size: "135 m² / 1,453 sq.ft",
    bed: "1 King + 1 Daybed",
    view: "Floor-to-Ceiling Pacific",
    image: "/images/suite-solarium.webp",
    description:
      "Expansive entertaining quarters featuring an in-suite culinary salon, brushed brass bar, and bespoke sommelier tastings.",
    amenities: ["Private In-Suite Dining Salon", "Brushed Brass Wet Bar", "Personal Sommelier Tasting", "Chauffeured House Car"],
  },
  {
    id: "presidential-penthouse",
    name: "The Grand Presidential Penthouse",
    category: "Palace Penthouse",
    price: 2800,
    size: "240 m² / 2,583 sq.ft",
    bed: "2 California Kings",
    view: "360° Coastal Horizon",
    image: "/images/suite-penthouse.webp",
    description:
      "The pinnacle of coastal luxury occupying the top residence tier with a private heated rooftop plunge pool and dedicated 24h butler.",
    amenities: ["Private Rooftop Plunge Pool", "Dedicated 24h Butler", "Private Elevator Access", "Calacatta Gold Marble"],
  },
];

export default function RoomsAndSuites({ onBookSuite, onViewDetails }) {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: (index % 2) * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="rooms-and-suites"
      className="w-full py-20 lg:py-28 bg-[#F5F2EB] text-[#1A1A1A] relative border-b border-[#E8E1D5]/60"
    >
      <span id="rooms" className="absolute -top-10 opacity-0 pointer-events-none" />
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
              Curated Accommodations
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight mb-4">
            Sanctuaries of Quiet Refinement
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed">
            Every residence has been positioned to capture natural maritime breeze, filtered golden-hour sunlight,
            and panoramic views across coastal waters.
          </p>
        </div>

        {/* 2-Column Responsive Suite Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
          {ROOM_ITEMS.map((suite, idx) => (
            <div
              key={suite.id}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className="bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-16/10 overflow-hidden bg-stone-200">
                <Image
                  src={suite.image}
                  alt={suite.name}
                  fill
                  sizes="(max-width: 768px) 93vw, 35vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-white/90 backdrop-blur-sm text-[#B89758] border border-[#E8E1D5] font-semibold shadow-xs">
                    {suite.category}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 z-10">
                  <div className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white font-mono text-xs shadow-md">
                    <span className="font-serif text-sm font-semibold">${suite.price.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-300"> / night</span>
                  </div>
                </div>
              </div>

              {/* Suite Information Content */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-normal mb-2 leading-snug group-hover:text-[#B89758] transition-colors">
                    {suite.name}
                  </h3>

                  {/* Specs Pill Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#736B5E] font-mono mb-3.5 pb-3 border-b border-[#F0EBE1]">
                    <span>📐 {suite.size}</span>
                    <span>·</span>
                    <span>🛏️ {suite.bed}</span>
                    <span>·</span>
                    <span>🌊 {suite.view}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed mb-4">
                    {suite.description}
                  </p>

                  {/* Inclusions */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {suite.amenities.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#4A4A4A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Row */}
                <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onViewDetails) onViewDetails(suite);
                    }}
                    className="text-xs font-mono tracking-wider uppercase text-[#5A554E] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    View Details →
                  </button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (onBookSuite) onBookSuite(suite);
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#B89758] text-[#FAF8F5] text-xs font-mono font-medium tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
                  >
                    Book Residence
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
