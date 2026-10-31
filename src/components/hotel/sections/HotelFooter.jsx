"use client";

/**
 * Section 12 — Footer
 *
 * Comprehensive luxury hotel footer:
 * - Hotel logo and architectural crest
 * - Multi-column quick navigation
 * - Contact information & concierge dispatch
 * - Social media links
 * - Newsletter subscription UI with interactive feedback
 * - Legal & copyright documentation
 * - 70% desktop width centered container
 */

import { useState } from "react";
import { motion } from "framer-motion";

const FOOTER_COLUMNS = [
  {
    title: "The Hotel",
    links: [
      { label: "Overview & Story", href: "#about" },
      { label: "Architectural Vision", href: "#introduction" },
      { label: "Sustainability & Flora", href: "#about" },
      { label: "Critical Acclaim", href: "#acclaim" },
      { label: "Press & Inquiries", href: "#contact" },
    ],
  },
  {
    title: "Residences",
    links: [
      { label: "Horizon Master Suite", href: "#rooms-and-suites" },
      { label: "Porte-Cochère Villa", href: "#rooms-and-suites" },
      { label: "Solarium Dining Suite", href: "#rooms-and-suites" },
      { label: "Presidential Penthouse", href: "#rooms-and-suites" },
      { label: "Private Estate Buyout", href: "#contact" },
    ],
  },
  {
    title: "Experiences",
    links: [
      { label: "The Solarium Restaurant", href: "#dining" },
      { label: "Thermal Spa & Soaking", href: "#amenities" },
      { label: "Sunset Yacht Voyage", href: "#experiences" },
      { label: "Subterranean Cellar", href: "#dining" },
      { label: "Private Helicopter Transit", href: "#contact" },
    ],
  },
];

export default function HotelFooter({ onBookClick }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-zinc-950 text-white relative pt-16 sm:pt-20 pb-12 border-t border-zinc-900">
      <div className="w-[93%] lg:w-[70%] max-w-[1200px] mx-auto">
        {/* Top Row: Newsletter Subscription Banner */}
        <div className="pb-12 sm:pb-16 border-b border-zinc-800/80 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-400 font-semibold block mb-2">
                Privileged Access
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-light">
                Receive The Horizon Gazette
              </h3>
              <p className="text-xs text-zinc-400 font-light mt-1.5 leading-relaxed">
                Seasonal culinary release dates, private cellar tasting allocations, and exclusive invitations to quiet escapes.
              </p>
            </div>

            <div className="lg:col-span-6">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 px-4 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-semibold tracking-wider uppercase transition-colors shrink-0 cursor-pointer shadow-md"
                  >
                    Subscribe
                  </motion.button>
                </form>
              ) : (
                <div className="p-3.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono text-center">
                  ✓ You are subscribed to The Horizon Gazette. Welcome.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 sm:pb-16 border-b border-zinc-800/80">
          {/* Brand Info Column — 2 cols on lg */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full border border-amber-400/50 flex items-center justify-center bg-zinc-900 text-amber-400">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 19V12a8 8 0 0116 0v7" />
                  <path d="M8 19V14a4 4 0 018 0v5" />
                  <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="font-serif text-sm tracking-[0.22em] text-white font-medium uppercase">
                The Grand Horizon
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm mb-6">
              A coastal architectural sanctuary dedicated to the art of quietude, bespoke hospitality, and maritime connection.
            </p>

            <div className="space-y-1.5 text-xs font-mono text-zinc-400">
              <div>1000 Coastal Horizon Way, Sanctuary Headlands</div>
              <div>Direct: +1 (800) 555-4321 · 24h Concierge</div>
              <div className="text-amber-300/80">reservations@grandhorizon.com</div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          {FOOTER_COLUMNS.map((col, idx) => (
            <div key={idx}>
              <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-amber-400 font-semibold mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-xs text-zinc-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal, Social & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-6">
            <span>© 2026 The Grand Horizon Resort & Spa.</span>
            <a href="#privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-zinc-300 transition-colors">Terms of Hospitality</a>
          </div>

          <div className="flex items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4 text-zinc-400">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                Instagram
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                LinkedIn
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                YouTube
              </a>
            </div>

            {/* Back to Top */}
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-full border border-zinc-800 hover:border-amber-400 text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              ↑ Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
