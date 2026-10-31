"use client";

/**
 * Section 11 — Final Booking CTA
 *
 * Full-width visual sanctuary banner inviting guests to reserve their stay:
 * - High-impact visual photography background with dark ambient gradient
 * - Evocative headline and invitation
 * - Prominent "Book Your Stay" action (opens verified suite search modal)
 * - 70% desktop width centered container
 */

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function FinalBookingCTA({ onBookClick }) {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.96, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
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
      className="w-full py-20 lg:py-28 bg-[#FAF8F5] relative border-b border-[#E8E1D5]/60 overflow-hidden"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        <div
          ref={cardRef}
          className="relative w-full rounded-3xl overflow-hidden bg-zinc-950 p-8 sm:p-14 lg:p-20 shadow-2xl text-center text-white border border-white/[0.12]"
        >
          {/* Background Ambient Image */}
          <Image
            src="/images/cta-bg.webp"
            alt="The Grand Horizon twilight architectural perspective"
            fill
            sizes="(max-width: 768px) 93vw, 70vw"
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-zinc-950/40 pointer-events-none" />

          {/* Hairline Gold Accent */}
          <div className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-amber-300 font-semibold">
                Your Sanctuary Awaits
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-tight mb-5 leading-tight">
              Begin Your Journey to The Grand Horizon
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed mb-8 max-w-xl mx-auto">
              Where architectural vision meets peerless hospitality. Reserve your perspective on coastal luxury
              and let our concierge craft an itinerary defined by quiet elegance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBookClick}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-semibold tracking-[0.18em] uppercase transition-all duration-300 shadow-xl shadow-amber-400/25 cursor-pointer"
              >
                Book Your Stay
              </motion.button>

              <a
                href="tel:+18005554321"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono tracking-wider uppercase border border-white/20 transition-colors"
              >
                Speak with Concierge
              </a>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 text-center">
              <span className="text-[11px] font-mono text-zinc-400">
                Direct Guest Privileges: Complimentary arrival transfers, daily artisan breakfast, and flexible 48h cancellation.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
