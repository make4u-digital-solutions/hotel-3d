"use client";

/**
 * Section 6 — Experiences
 *
 * Curated coastal & resort experiences:
 * - Sunset Horizon Yacht Charter
 * - Private Wine Cellar Tasting
 * - Coastal Scenic Heli-Flight
 * - Dawn Sound & Mindfulness Meditation
 * - 70% desktop width centered container
 */

import Image from "next/image";
import { motion } from "framer-motion";

const EXPERIENCES = [
  {
    id: "yacht",
    title: "Sunset Horizon Yacht Charter",
    duration: "3.5 Hours",
    category: "Maritime Adventure",
    image: "/images/gallery-1.webp",
    description: "Sail into the golden-hour horizon aboard our private 62-foot catamaran, catered with champagne and fresh oysters.",
    badge: "Exclusive to Guests",
  },
  {
    id: "cellar",
    title: "Rare Reserve Cellar Tasting",
    duration: "2 Hours",
    category: "Oenology",
    image: "/images/gallery-2.webp",
    description: "An intimate tasting of six storied vintages in our subterranean volcanic stone cellar with our Head Sommelier.",
    badge: "Private Reservation",
  },
  {
    id: "heli",
    title: "Coastal Cliff Heli-Flight",
    duration: "45 Minutes",
    category: "Aerial Excursion",
    image: "/images/gallery-3.webp",
    description: "Depart directly from our on-site helipad for a dramatic aerial perspective of rugged sea stacks and secluded coves.",
    badge: "Helipad Departure",
  },
  {
    id: "meditation",
    title: "Dawn Sound & Ocean Meditation",
    duration: "75 Minutes",
    category: "Mindfulness",
    image: "/images/gallery-4.webp",
    description: "Greet the rising sun from the cantilevered marble terrace with Tibetan singing bowls and guided breathing.",
    badge: "Complimentary Daily",
  },
];

export default function HotelExperiences({ onInquireExperience }) {
  return (
    <section
      id="experiences"
      className="w-full py-20 lg:py-28 bg-[#FAF8F5] text-[#1A1A1A] relative border-b border-[#E8E1D5]/60"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
              Bespoke Discoveries
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight mb-4">
            Curated Local & Coastal Experiences
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed">
            From private yacht expeditions along coastal coves to rare vintage cellar journeys,
            our concierge creates indelible memories tailored exclusively to you.
          </p>
        </div>

        {/* 2-Column Responsive Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
          {EXPERIENCES.map((exp) => (
            <motion.div
              key={exp.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-[#B89758]"
            >
              <div className="relative w-full aspect-16/10 overflow-hidden bg-stone-200">
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 93vw, 35vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-white/90 backdrop-blur-sm text-[#B89758] border border-[#E8E1D5] font-semibold shadow-xs">
                    {exp.category}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono bg-black/75 backdrop-blur-sm text-zinc-200 shadow-md">
                    ⏱ {exp.duration}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-normal mb-2 leading-snug group-hover:text-[#B89758] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed mb-4">
                    {exp.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wide text-[#736B5E]">
                    {exp.badge}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onInquireExperience) onInquireExperience(exp);
                    }}
                    className="text-xs font-mono tracking-wider uppercase text-[#B89758] hover:text-[#1A1A1A] font-medium transition-colors cursor-pointer"
                  >
                    Arrange with Concierge →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
