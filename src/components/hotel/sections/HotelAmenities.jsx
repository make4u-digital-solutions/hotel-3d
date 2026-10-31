"use client";

/**
 * Section 4 — Hotel Amenities
 *
 * Cards highlighting the 6 luxury wellness & lifestyle facilities:
 * 1. Swimming Pool
 * 2. Spa and Wellness
 * 3. Solarium Restaurant
 * 4. Fitness Center
 * 5. Free Gigabit Wi-Fi
 * 6. Private Chauffeur & Helipad
 *
 * - 70% desktop width centered container
 */

import Image from "next/image";
import { motion } from "framer-motion";

const AMENITY_ITEMS = [
  {
    id: "pool",
    title: "Horizon Infinity Pool",
    category: "Aquatic Sanctuary",
    description: "Multi-tiered heated volcanic stone pool seamlessly blending into the ocean horizon with sun reflection loungers.",
    icon: "🏊",
    specs: "Heated Year-Round · Private Cabanas",
    image: null,
  },
  {
    id: "spa",
    title: "The Thermal Spa Sanctuary",
    category: "Holistic Wellness",
    description: "Travertine stone thermal baths, eucalyptus steam rooms, and restorative botanical facial therapies curated by master practitioners.",
    icon: "🧖",
    specs: "Thermal Circuit · Custom Apothecary",
    image: "/images/spa.jpg",
  },
  {
    id: "dining",
    title: "The Solarium Restaurant",
    category: "Culinary Atelier",
    description: "Floor-to-ceiling glass pavilion serving Michelin-caliber maritime cuisine, accompanied by rare reserve cellar pairings.",
    icon: "🍷",
    specs: "Michelin-Caliber · Oceanfront Glass",
    image: "/images/dining.jpg",
  },
  {
    id: "fitness",
    title: "Movement & Fitness Studio",
    category: "Rejuvenation",
    description: "Ocean-facing fitness salon outfitted with state-of-the-art Technogym Artis equipment, reformer pilates, and private yoga instructors.",
    icon: "🧘",
    specs: "Technogym Artis · Reformer Pilates",
    image: null,
  },
  {
    id: "wifi",
    title: "Ultra High-Speed Wi-Fi 7",
    category: "Connectivity",
    description: "Enterprise-grade gigabit fiber optic network covering all indoor sanctuaries, coastal terraces, and private beach pavilions.",
    icon: "📶",
    specs: "Gigabit Fiber · Seamless Roaming",
    image: null,
  },
  {
    id: "transfers",
    title: "Private Chauffeur & Helipad",
    category: "Bespoke Mobility",
    description: "Dedicated airport transfers in our luxury electric house fleet, with an on-site licensed private helipad for direct charter arrivals.",
    icon: "🚁",
    specs: "Private Helipad · Luxury Fleet",
    image: null,
  },
];

export default function HotelAmenities() {
  return (
    <section
      id="amenities"
      className="w-full py-20 lg:py-28 bg-white text-[#1A1A1A] relative border-b border-[#E8E1D5]/60"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
              Resort Amenities
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight mb-4">
            Curated Amenities for Body & Soul
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed">
            Every amenity has been designed to elevate your stay into an effortless state of restorative well-being.
          </p>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {AMENITY_ITEMS.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="bg-[#FAF8F5] rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:border-[#B89758]"
            >
              {/* Optional Photo Header for Key Amenities */}
              {item.image && (
                <div className="relative w-full aspect-16/9 overflow-hidden bg-stone-200">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 93vw, 25vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* Icon & Category Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[9px] font-mono tracking-widest uppercase text-[#B89758] bg-white px-2.5 py-0.5 rounded-full border border-[#E8E1D5] font-semibold">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl text-[#1A1A1A] font-medium mb-2 group-hover:text-[#B89758] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#5A554E] font-light leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E1D5]/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8C8275] tracking-wide">
                    {item.specs}
                  </span>
                  <span className="text-xs text-[#B89758] font-mono">✦</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
