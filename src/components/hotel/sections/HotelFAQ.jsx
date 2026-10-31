"use client";

/**
 * Section 10 — Frequently Asked Questions (FAQ)
 *
 * Expandable accordions covering essential guest inquiries:
 * 1. Check-in & check-out times
 * 2. Room booking and hold process
 * 3. Cancellation policy
 * 4. Hotel facilities and suite amenities
 * 5. Guest services, butler & private transfers
 *
 * - Framer Motion smooth height animation
 * - 70% desktop width centered container
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    id: "checkin",
    question: "What are the standard check-in and check-out times?",
    answer:
      "Standard check-in begins at 3:00 PM, and check-out is scheduled for 12:00 PM (Noon). Early arrival privileges and late check-out arrangements may be arranged in advance through our Resident Concierge, subject to suite availability.",
  },
  {
    id: "booking",
    question: "How does the room reservation & priority hold process work?",
    answer:
      "Upon submitting your reservation search parameters, our concierge team places a preliminary priority hold on your preferred residence category. A dedicated reservations ambassador contacts you personally within 15 minutes to review suite preferences, arrival transfers, and dietary requirements prior to charging any deposits.",
  },
  {
    id: "cancellation",
    question: "What is the cancellation and itinerary modification policy?",
    answer:
      "We offer complimentary cancellations and date modifications up to 48 hours prior to your scheduled arrival date. For presidential penthouses and multi-villa private retreats, cancellation terms are customized and detailed on your bespoke confirmation itinerary.",
  },
  {
    id: "facilities",
    question: "What facilities and privileges are included with each suite?",
    answer:
      "All guest suites include complimentary valet parking, daily artisan breakfast served in-suite or at The Solarium, unlimited access to the Thermal Spa and Horizon Infinity Pool, high-speed Wi-Fi 7, and evening bespoke turn-down service.",
  },
  {
    id: "services",
    question: "Are private butler, airport chauffeur, and dining arrangements available?",
    answer:
      "Yes. Executive Residences and Palace Penthouses include a dedicated 24-hour butler. Airport transfers in our luxury electric house fleet or direct helicopter arrivals to our on-site private helipad can be coordinated seamlessly through our concierge desk.",
  },
];

export default function HotelFAQ() {
  const [openId, setOpenId] = useState("checkin");

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="w-full py-20 lg:py-28 bg-white text-[#1A1A1A] relative border-b border-[#E8E1D5]/60"
    >
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#B89758] font-semibold">
              Guest Inquiries
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed">
            Essential information regarding arrivals, residence reservations, and personalized hospitality services.
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="bg-[#FAF8F5] rounded-2xl border border-[#E8E1D5] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#B89758]"
                >
                  <span className="font-serif text-base sm:text-lg text-[#1A1A1A] font-normal leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full border border-[#E8E1D5] bg-white flex items-center justify-center text-xs text-[#B89758] transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-45 bg-[#1A1A1A] text-white border-[#1A1A1A]" : ""
                    }`}
                  >
                    +
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-7 text-xs sm:text-sm text-[#5A554E] font-light leading-relaxed border-t border-[#E8E1D5]/60 pt-3">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
