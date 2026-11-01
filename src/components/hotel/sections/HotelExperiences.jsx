"use client";

/**
 * Section 6 — Experiences (Vertical-to-Horizontal Scroll)
 *
 * Implements a pinned horizontal scroll experience driven by vertical page scroll:
 * - When user scrolls down the page, this section pins to the viewport.
 * - Scrolling vertically scrubs the track horizontally from left to right.
 * - Synchronized live progress line and frame counter.
 * - Interactive prev/next buttons that smoothly advance the vertical scroll.
 * - Once all cards have slid through, normal vertical scroll resumes naturally.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const EXPERIENCES = [
  {
    id: "yacht",
    title: "Sunset Horizon Yacht Charter",
    duration: "3.5 Hours",
    category: "Maritime Adventure",
    image: "/images/gallery-1.webp",
    description: "Sail into the golden-hour horizon aboard our private 62-foot catamaran, catered with vintage champagne and chilled oysters.",
    badge: "Exclusive to Guests",
  },
  {
    id: "cellar",
    title: "Rare Reserve Cellar Tasting",
    duration: "2 Hours",
    category: "Oenology",
    image: "/images/gallery-2.webp",
    description: "An intimate tasting of six storied vintages in our subterranean volcanic stone cellar guided by our Head Sommelier.",
    badge: "Private Reservation",
  },
  {
    id: "heli",
    title: "Coastal Cliff Heli-Flight",
    duration: "45 Minutes",
    category: "Aerial Excursion",
    image: "/images/gallery-3.webp",
    description: "Depart directly from our on-site cliff helipad for a dramatic aerial perspective of rugged sea stacks and secluded coves.",
    badge: "Helipad Departure",
  },
  {
    id: "meditation",
    title: "Dawn Sound & Ocean Meditation",
    duration: "75 Minutes",
    category: "Mindfulness",
    image: "/images/gallery-4.webp",
    description: "Greet the rising sun from the cantilevered marble terrace with handcrafted singing bowls and guided pranayama breathwork.",
    badge: "Complimentary Daily",
  },
  {
    id: "spa-sanctum",
    title: "Thermal Spa & Sound Sanctuary",
    duration: "2.5 Hours",
    category: "Restorative Wellness",
    image: "/images/spa.jpg",
    description: "Immerse in mineral-rich volcanic thermal pools followed by customized circadian acoustic resonance and botanical steam.",
    badge: "Holistic Wellness",
  },
  {
    id: "chef-atelier",
    title: "Solarium Private Chef Atelier",
    duration: "3 Hours",
    category: "Culinary Masterclass",
    image: "/images/dining.jpg",
    description: "An exclusive fireside masterclass with our executive chef pairing coastal catches with rare biodynamic vineyard selections.",
    badge: "Bespoke Dining",
  },
];

export default function HotelExperiences({ onInquireExperience }) {
  const sectionRef = useRef(null);
  const pinnedRef = useRef(null);
  const trackRef = useRef(null);
  const progressBarRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const pinnedEl = pinnedRef.current;
    const trackEl = trackRef.current;
    const progressEl = progressBarRef.current;
    const counterEl = counterRef.current;

    if (!sectionEl || !pinnedEl || !trackEl || typeof window === "undefined") {
      return;
    }

    const ctx = gsap.context(() => {
      // Calculate how far the track needs to travel horizontally
      const getScrollAmount = () => {
        const trackWidth = trackEl.scrollWidth;
        const windowWidth = window.innerWidth;
        // Leave comfortable right padding so the last card is fully visible
        const endPadding = windowWidth > 1024 ? 160 : 60;
        return -(trackWidth - windowWidth + endPadding);
      };

      const scrollTween = gsap.to(trackEl, {
        x: getScrollAmount,
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: sectionEl,
        start: "top top",
        end: () => `+=${Math.max(1600, Math.abs(getScrollAmount()))}`,
        pin: pinnedEl,
        pinSpacing: true,
        anticipatePin: 1,
        animation: scrollTween,
        scrub: 0.8, // Smooth GSAP scrub
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = Math.min(1, Math.max(0, self.progress));

          // 1. Update bottom progress bar (0ms overhead direct DOM update)
          if (progressEl) {
            progressEl.style.width = `${Math.max(12, Math.round(progress * 100))}%`;
          }

          // 2. Update active card index counter
          if (counterEl) {
            const activeIndex = Math.min(
              EXPERIENCES.length,
              Math.max(1, Math.ceil(progress * EXPERIENCES.length) || 1)
            );
            counterEl.textContent = `0${activeIndex} / 0${EXPERIENCES.length}`;
          }
        },
      });

      // Refresh ScrollTrigger after layout stabilizes
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  /**
   * Smoothly navigates the vertical scroll to step between cards
   */
  const handleStep = (direction) => {
    const sectionEl = sectionRef.current;
    if (!sectionEl || typeof window === "undefined") return;

    const rect = sectionEl.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top;
    const totalScrollable = sectionEl.offsetHeight - window.innerHeight;
    if (totalScrollable <= 0) return;

    const currentProgress = Math.min(1, Math.max(0, -rect.top / totalScrollable));
    const stepSize = 1 / (EXPERIENCES.length - 1);

    const targetProgress =
      direction === "next"
        ? Math.min(1, currentProgress + stepSize)
        : Math.max(0, currentProgress - stepSize);

    window.scrollTo({
      top: scrollTop + targetProgress * totalScrollable,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="experiences"
      className="relative w-full bg-[#FAF8F5] text-[#1A1A1A] border-b border-[#E8E1D5]/60"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={pinnedRef}
        className="w-full h-screen overflow-hidden flex flex-col justify-between py-6 sm:py-8 lg:py-10 select-none relative"
      >
        {/* Section Header */}
        <div className="w-[93%] lg:w-[85%] max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
                Bespoke Discoveries
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1A1A1A] font-light tracking-tight mb-1 leading-snug">
              Curated Local & Coastal Experiences
            </h2>
            <p className="text-xs sm:text-sm text-[#5A554E] font-light max-w-xl hidden sm:block">
              Scroll down to journey through our private yacht expeditions, cellar tastings, and cliffside flights.
            </p>
          </div>

          {/* Controls: Active Counter & Step Arrows */}
          <div className="flex items-center gap-4 shrink-0">
            <span
              ref={counterRef}
              className="text-xs font-mono text-[#736B5E] tracking-widest uppercase font-semibold"
            >
              01 / 0{EXPERIENCES.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStep("prev")}
                aria-label="Previous experience"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E8E1D5] bg-white text-[#1A1A1A] hover:bg-[#B89758] hover:border-[#B89758] hover:text-white transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="text-base leading-none">←</span>
              </button>
              <button
                type="button"
                onClick={() => handleStep("next")}
                aria-label="Next experience"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E8E1D5] bg-white text-[#1A1A1A] hover:bg-[#B89758] hover:border-[#B89758] hover:text-white transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
              >
                <span className="text-base leading-none">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Moving Cards Track (Scrubbed with Vertical Scroll) */}
        <div className="w-full overflow-visible my-auto py-2">
          <div
            ref={trackRef}
            className="flex gap-6 sm:gap-8 items-stretch pl-[3.5%] lg:pl-[7.5%] will-change-transform"
          >
            {EXPERIENCES.map((exp, idx) => (
              <motion.div
                key={exp.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 w-[82vw] sm:w-[380px] lg:w-[420px] max-w-[440px] bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-[#B89758]"
              >
                {/* Card Image Banner */}
                <div className="relative w-full aspect-16/10 overflow-hidden bg-stone-200">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    sizes="(max-width: 640px) 82vw, (max-width: 1024px) 380px, 420px"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                  />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-white/90 backdrop-blur-sm text-[#B89758] border border-[#E8E1D5] font-semibold shadow-xs">
                      {exp.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 z-10">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono bg-black/75 backdrop-blur-sm text-zinc-200 shadow-md">
                      ⏱ {exp.duration}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-mono font-medium bg-black/60 backdrop-blur-sm text-white border border-white/20">
                      0{idx + 1}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-normal mb-2 leading-snug group-hover:text-[#B89758] transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed mb-4 line-clamp-3">
                      {exp.description}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wide text-[#736B5E]">
                      {exp.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onInquireExperience) onInquireExperience(exp);
                      }}
                      className="text-xs font-mono tracking-wider uppercase text-[#B89758] hover:text-[#1A1A1A] font-medium transition-colors cursor-pointer group-hover:underline"
                    >
                      Arrange with Concierge →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ambient Bottom Scrub Indicator */}
        <div className="w-[93%] lg:w-[85%] max-w-[1400px] mx-auto flex items-center justify-between gap-6 shrink-0 pt-2">
          <div className="flex-1 bg-[#E8E1D5]/70 h-1.5 rounded-full overflow-hidden border border-[#E8E1D5]">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#B89758] to-[#99793D] rounded-full transition-all duration-75"
              style={{ width: "12%" }}
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[#736B5E] tracking-wider uppercase shrink-0">
            <span>Scroll vertically to traverse</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
