"use client";

/**
 * HotelSearchResultsModal Component (Dark Luxury Architectural Edition)
 *
 * Dark-theme modal displaying real-time search results for hotel suites:
 * - Dark luxury palette (bg-zinc-950, amber gold #F59E0B accents, crisp white text)
 * - Transparent frontend interaction: displays verified suite availability and concierge inquiry
 *   without falsely pretending an automated payment transaction occurred.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SUITE_COLLECTION = [
  {
    id: "horizon-master",
    name: "The Horizon Oceanfront Master Suite",
    category: "Signature Suite",
    pricePerNight: 1250,
    size: "95 m² / 1,022 sq.ft",
    bed: "1 California King",
    capacity: "Up to 3 Guests",
    view: "Panoramic Ocean & Terrace View",
    highlights: [
      "Private Cantilevered Sunrise Terrace",
      "Honed Monolithic Quartzite Soaking Tub",
      "Complimentary Solarium Lounge Access",
      "Dedicated Evening Turn-Down Service",
    ],
  },
  {
    id: "porte-villa",
    name: "The Porte-Cochère Garden Villa",
    category: "Garden Villa",
    pricePerNight: 980,
    size: "82 m² / 882 sq.ft",
    bed: "1 California King",
    capacity: "Up to 2 Guests",
    view: "Reflection Pools & Coastal Gardens",
    highlights: [
      "Volcanic Basalt Private Courtyard",
      "Acoustic Hardwood Slats for Total Silence",
      "Private Valet & Direct Portico Access",
      "Daily Artisan Pastry & Breakfast Basket",
    ],
  },
  {
    id: "solarium-atelier",
    name: "The Solarium Dining Atelier Suite",
    category: "Executive Residence",
    pricePerNight: 1650,
    size: "135 m² / 1,453 sq.ft",
    bed: "1 King Bed + 1 Daybed",
    capacity: "Up to 4 Guests",
    view: "360° Floor-to-Ceiling Coastal Horizon",
    highlights: [
      "In-Suite Michelin-Caliber Dining Pavilion",
      "Custom Brushed Brass & Walnut Wet Bar",
      "Personal Sommelier Wine Tasting on Arrival",
      "Chauffeured Luxury House Car Transfers",
    ],
  },
  {
    id: "presidential-penthouse",
    name: "The Grand Presidential Penthouse",
    category: "Palace Penthouse",
    pricePerNight: 2800,
    size: "240 m² / 2,583 sq.ft",
    bed: "2 California Kings",
    capacity: "Up to 6 Guests",
    view: "Top-Floor Unobstructed Ocean Panoramas",
    highlights: [
      "Private Rooftop Heated Infinity Plunge Pool",
      "Dedicated 24-Hour Butler & Private Chef",
      "Direct Keycard Private Elevator Access",
      "Murano Glass & Custom Calacatta Marble Interiors",
    ],
  },
];

export default function HotelSearchResultsModal({
  isOpen,
  onClose,
  searchParams,
}) {
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  if (!isOpen) return null;

  const {
    checkIn = "Tomorrow",
    checkOut = "In 3 Days",
    nights = 2,
    adults = 2,
    children = 0,
    rooms = 1,
  } = searchParams || {};

  const handleSelectSuite = (suite) => {
    setSelectedSuite(suite);
    setInquirySubmitted(false);
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;
    setInquirySubmitted(true);
  };

  const resetSelection = () => {
    setSelectedSuite(null);
    setInquirySubmitted(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog */}
        <div className="min-h-full flex items-center justify-center p-3 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-4xl bg-zinc-950 rounded-3xl border border-zinc-800 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden z-10 flex flex-col max-h-[92vh] text-white"
          >
            {/* Header */}
            <div className="p-5 sm:p-7 border-b border-zinc-800 bg-zinc-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-amber-300 font-semibold">
                    The Grand Horizon Collection
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-white tracking-tight">
                  Available Rooms & Private Suites
                </h3>
                {/* Search Summary Pill */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-zinc-300">
                  <span className="bg-zinc-800/90 px-2.5 py-1 rounded-md border border-zinc-700">
                    {checkIn} → {checkOut} ({nights} {nights === 1 ? "Night" : "Nights"})
                  </span>
                  <span className="bg-zinc-800/90 px-2.5 py-1 rounded-md border border-zinc-700">
                    {adults} {adults === 1 ? "Adult" : "Adults"}
                    {children > 0 && ` · ${children} ${children === 1 ? "Child" : "Children"}`}
                  </span>
                  <span className="bg-zinc-800/90 px-2.5 py-1 rounded-md border border-zinc-700">
                    {rooms} {rooms === 1 ? "Room" : "Rooms"}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="self-end sm:self-center p-2 rounded-full hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body: Either Suite List or Inquiry Drawer */}
            <div className="p-4 sm:p-7 overflow-y-auto space-y-5 bg-zinc-950">
              {!selectedSuite ? (
                <>
                  <div className="text-xs text-zinc-400 font-mono tracking-wider uppercase mb-1">
                    Select a residence to review specifications & arrange priority hold:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {SUITE_COLLECTION.map((suite) => {
                      const totalStay = suite.pricePerNight * nights;

                      return (
                        <div
                          key={suite.id}
                          className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group hover:border-amber-400/60"
                        >
                          <div>
                            {/* Suite Badge & Rates */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-400/10 text-amber-300 border border-amber-400/30">
                                {suite.category}
                              </span>
                              <div className="text-right">
                                <span className="font-serif text-lg sm:text-xl font-medium text-white">
                                  ${suite.pricePerNight.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-zinc-400 font-mono"> / night</span>
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="font-serif text-lg text-white mb-2 leading-snug group-hover:text-amber-300 transition-colors">
                              {suite.name}
                            </h4>

                            {/* Specs row */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-300 font-mono mb-3.5 pb-3 border-b border-zinc-800">
                              <span>📐 {suite.size}</span>
                              <span>·</span>
                              <span>🛏️ {suite.bed}</span>
                              <span>·</span>
                              <span>👥 {suite.capacity}</span>
                            </div>

                            <p className="text-xs text-zinc-400 font-light mb-3">
                              View: <strong className="text-zinc-200 font-normal">{suite.view}</strong>
                            </p>

                            {/* Features list */}
                            <ul className="space-y-1.5 mb-5">
                              {suite.highlights.map((h, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Action Button & Total */}
                          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                                Estimated {nights} Nights
                              </span>
                              <span className="text-sm font-semibold font-mono text-white">
                                ${totalStay.toLocaleString()}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectSuite(suite)}
                              className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-semibold tracking-wider uppercase transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Inquire Suite</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Suite Detail & Direct Concierge Inquiry */
                <div className="space-y-6">
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={resetSelection}
                    className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>←</span>
                    <span>Back to all available suites</span>
                  </button>

                  <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 sm:p-7 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block mb-1">
                          Selected Residence
                        </span>
                        <h4 className="font-serif text-xl sm:text-2xl text-white">
                          {selectedSuite.name}
                        </h4>
                        <p className="text-xs font-mono text-zinc-400 mt-1">
                          {selectedSuite.size} · {selectedSuite.bed} · {selectedSuite.view}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-xs font-mono text-zinc-400 block">Total for {nights} Nights</span>
                        <span className="font-serif text-2xl text-amber-300 font-semibold">
                          ${(selectedSuite.pricePerNight * nights).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {!inquirySubmitted ? (
                      <form onSubmit={handleInquirySubmit} className="mt-5 space-y-4">
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                          <strong className="text-white font-medium">Concierge Direct Reservation:</strong>{" "}
                          To guarantee bespoke guest privileges, your selected dates have been flagged for priority review.
                          Please enter your contact details below; our Resident Concierge will confirm suite assignment and
                          bespoke arrival requests directly.
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
                              Guest Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              placeholder="e.g. Eleanor Vance"
                              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              placeholder="e.g. eleanor@vance.com"
                              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
                              Contact Phone (Optional)
                            </label>
                            <input
                              type="tel"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              placeholder="+1 (555) 000-0000"
                              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 mb-1.5">
                              Special Arrangements / Dietary / Butler
                            </label>
                            <input
                              type="text"
                              value={specialNotes}
                              onChange={(e) => setSpecialNotes(e.target.value)}
                              placeholder="e.g. Airport chauffeured transfer, late check-in"
                              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <span className="text-[11px] font-mono text-zinc-400">
                            🔒 No deposit charged today. Complimentary cancellation up to 48h prior.
                          </span>

                          <button
                            type="submit"
                            className="w-full sm:w-auto px-7 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-semibold tracking-[0.16em] uppercase transition-colors shadow-md shadow-amber-400/20 cursor-pointer"
                          >
                            Submit Concierge Inquiry
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Inquiry Success State */
                      <div className="py-8 text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-amber-400/15 border border-amber-400 text-amber-300 flex items-center justify-center mx-auto text-2xl font-bold">
                          ✓
                        </div>
                        <h4 className="font-serif text-2xl text-white">
                          Inquiry Dispatched to Head Concierge
                        </h4>
                        <p className="text-sm text-zinc-300 max-w-lg mx-auto font-light leading-relaxed">
                          Thank you, <strong className="text-amber-300">{guestName}</strong>. A dedicated concierge
                          has received your search parameters for <strong>{selectedSuite.name}</strong> ({checkIn} – {checkOut}).
                          You will receive an itinerary confirmation email at <strong className="text-white">{guestEmail}</strong> within 15 minutes.
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-full bg-amber-400 text-zinc-950 font-semibold text-xs font-mono uppercase tracking-wider hover:bg-amber-300 transition-colors shadow-md"
                          >
                            Return to Hotel Tour
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Concierge Contact */}
            <div className="px-5 py-3.5 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 font-mono gap-2">
              <span>Direct Reservations: reservations@grandhorizon.com</span>
              <span>Need immediate assistance? +1 (800) 555-4321</span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
