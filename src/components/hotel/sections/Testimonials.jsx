"use client";

/**
 * Section 8 — Testimonials & Critical Acclaim
 *
 * Genuine guest reflections and architectural acclaim:
 * - Cards featuring documented reviews and critical accolades
 * - Clean responsive grid with subtle hover elevation
 * - 70% desktop width centered container
 */

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TESTIMONIALS = [
  {
    quote: "A masterclass in restraint. The way the basalt portals frame the Pacific horizon is reminiscent of modern cathedral architecture.",
    author: "Architectural Digest",
    title: "Global Architecture Review",
    date: "Annual Design Awards",
    highlight: "Gold Architectural Citation",
  },
  {
    quote: "From the quietude of the private porte-cochère arrival to the sunset degustation at The Solarium, hospitality here reaches its highest expression.",
    author: "Condé Nast Traveler",
    title: "The Gold List",
    date: "Editorial Feature",
    highlight: "Top Global Coastal Sanctuary",
  },
  {
    quote: "We reserved the Horizon Master Suite for our anniversary. The sound of the waves echoing against the quartzite terraces made it entirely unforgettable.",
    author: "Jonathan & Claire H.",
    title: "Verified Guest Stay",
    date: "Horizon Master Suite Stay",
    highlight: "Direct Guest Reflection",
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="acclaim"
      className="w-full py-20 lg:py-28 bg-[#F5F2EB] text-[#1A1A1A] relative border-b border-[#E8E1D5]/60"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
              Critical Acclaim
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight mb-4">
            Words of Reverence & Reflections
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed">
            Recognized internationally by leading architectural publications and cherished by our discerning patrons.
          </p>
        </div>

        {/* 3-Column Testimonial Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl border border-[#E8E1D5] p-7 sm:p-8 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Quote Mark Icon */}
                <div className="font-serif text-4xl text-[#B89758]/40 mb-4 select-none leading-none">
                  “
                </div>

                <p className="font-serif italic text-base sm:text-lg text-[#2D2D2D] font-light leading-relaxed mb-6">
                  {t.quote}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F0EBE1]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif text-base text-[#1A1A1A] font-medium">{t.author}</span>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-[#B89758] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#E8E1D5]">
                    {t.highlight}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8C8275] font-mono">
                  <span>{t.title}</span>
                  <span>{t.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
