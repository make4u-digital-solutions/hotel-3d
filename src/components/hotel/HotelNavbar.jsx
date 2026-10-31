"use client";

/**
 * HotelNavbar Component (Dark Luxury Architectural Edition)
 *
 * Ultra-low profile, elegant floating luxury navbar in Dark Mode:
 * - Reduced vertical height (~46px-48px) to maximize hotel canvas visibility
 * - Dark luxury hospitality aesthetic (bg-zinc-950/85, amber/gold accents #F59E0B, crisp white text)
 * - Well-balanced, generous item gapping (gap-8 / gap-9)
 * - Horizontal streamlined brand lockup with minimalist amber crest
 * - Sleek desktop navigation links with gold hover indicator
 * - Prominent amber/gold "Book Now" CTA pill button
 * - Mobile responsive drawer animated with Framer Motion in dark theme
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Rooms & Suites", href: "#rooms" },
  { label: "Experiences", href: "#experiences" },
  { label: "Dining", href: "#dining" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function HotelNavbar({ onBookNowClick, onNavClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect scroll offset for solid background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock background scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (e, item) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavClick) {
      onNavClick(item);
    }
  };

  const handleBookClick = () => {
    setMobileMenuOpen(false);
    if (onBookNowClick) {
      onBookNowClick();
    }
  };

  return (
    <>
      <header className="fixed top-2.5 sm:top-3.5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
        <nav
          className={`max-w-6xl mx-auto rounded-full transition-all duration-400 ease-out pointer-events-auto px-5 sm:px-7 py-1.5 sm:py-2 flex items-center justify-between border ${
            isScrolled
              ? "bg-zinc-950/95 backdrop-blur-2xl border-white/[0.18] shadow-[0_8px_32px_rgba(0,0,0,0.85)]"
              : "bg-zinc-950/80 backdrop-blur-xl border-white/[0.12] shadow-[0_6px_24px_rgba(0,0,0,0.65)]"
          }`}
        >
          {/* Left: Streamlined Horizontal Brand Lockup */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, { label: "Home", href: "#home" })}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full py-0.5"
          >
            {/* Minimalist Crest Emblem */}
            <div className="w-7 h-7 rounded-full border border-amber-400/50 flex items-center justify-center bg-zinc-900/90 shadow-sm group-hover:border-amber-300 group-hover:scale-105 transition-all">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 transition-colors"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 19V12a8 8 0 0116 0v7" />
                <path d="M8 19V14a4 4 0 018 0v5" />
                <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </div>

            {/* Compact Brand Typography */}
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xs sm:text-sm tracking-[0.22em] text-zinc-100 font-medium uppercase group-hover:text-amber-300 transition-colors whitespace-nowrap">
                The Grand Horizon
              </span>
            </div>
          </a>

          {/* Center: Desktop Navigation Links with Generous Gapping */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-9">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="relative text-[11px] xl:text-xs tracking-[0.16em] uppercase text-zinc-300 hover:text-amber-300 font-medium transition-colors duration-200 py-1 group px-1"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-amber-400 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Right: Actions with Proper Spacing */}
          <div className="flex items-center gap-3.5 sm:gap-5">
            {/* Direct Phone (Desktop) */}
            <a
              href="tel:+18005554321"
              className="hidden xl:flex items-center gap-2 text-[10px] font-mono text-zinc-400 hover:text-amber-300 transition-colors px-1 py-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>+1 (800) 555-4321</span>
            </a>

            {/* Amber Gold "Book Now" CTA */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBookClick}
              className="px-4.5 py-1.5 sm:px-5 sm:py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.16em] uppercase transition-all duration-300 shadow-md shadow-amber-400/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Book Now</span>
              <span className="text-xs font-bold">→</span>
            </motion.button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-1.5 rounded-full text-zinc-200 hover:bg-white/[0.08] transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Slide-Down Menu (Dark Theme) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed top-2.5 inset-x-3.5 bg-zinc-950/98 rounded-3xl border border-zinc-800 shadow-2xl z-50 lg:hidden p-5 max-h-[88vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-serif text-xs tracking-[0.2em] uppercase text-zinc-100">
                    The Grand Horizon
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links */}
              <nav className="py-3 divide-y divide-zinc-800/60">
                {NAV_LINKS.map((link, idx) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={(e) => handleLinkClick(e, link)}
                    className="py-2.5 text-xs font-mono tracking-[0.16em] uppercase text-zinc-200 hover:text-amber-300 flex items-center justify-between transition-colors"
                  >
                    <span>{link.label}</span>
                    <span className="text-zinc-500">→</span>
                  </motion.a>
                ))}
              </nav>

              {/* Action Button */}
              <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleBookClick}
                  className="w-full py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-semibold uppercase tracking-[0.16em] transition-colors shadow-md shadow-amber-400/20"
                >
                  Book Your Residence
                </button>
                <div className="text-center text-[10px] font-mono text-zinc-400">
                  Concierge Desk: <span className="text-amber-400">+1 (800) 555-4321</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
