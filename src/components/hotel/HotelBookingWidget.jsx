"use client";

/**
 * HotelBookingWidget Component (Dark Luxury Architectural Edition)
 *
 * Premium luxury hotel search and booking bar in Dark Mode:
 * - Dark luxury hospitality palette (bg-zinc-950/85, amber gold #F59E0B accents, crisp white text)
 * - Desktop: single horizontal booking bar with distinct input segments separated by clean dividers
 * - Mobile: compact responsive booking card with clean grid, tap-friendly controls, and zero overflow
 * - Fields: Check-in, Check-out, Guests (Adults/Children), Rooms, and Search Rooms button
 * - Validation: Check-out must be after Check-in (min 1 night), Adults >= 1, Rooms >= 1
 * - Interactive popovers for Calendar / Date picking and Guests / Rooms counter steppers in dark theme
 * - Framer Motion for smooth entrances, popovers, and micro-interactions
 */

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to format Date object into YYYY-MM-DD
function toDateInputValue(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to format date for human display
function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const options = { weekday: "short", month: "short", day: "numeric" };
  return d.toLocaleDateString("en-US", options);
}

// Compute night count between two dates
function calculateNights(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr) return 1;
  const inDate = new Date(checkInStr + "T00:00:00");
  const outDate = new Date(checkOutStr + "T00:00:00");
  const diffTime = outDate - inDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

const subscribeEmpty = () => () => {};

const SERVER_DATE_SNAPSHOT = Object.freeze({
  todayStr: "2026-11-01",
  defaultIn: "2026-11-02",
  defaultOut: "2026-11-05",
});

let clientDateSnapshot = null;
function getClientDateSnapshot() {
  if (typeof window === "undefined") {
    return SERVER_DATE_SNAPSHOT;
  }
  if (!clientDateSnapshot) {
    const today = new Date();
    const dIn = new Date(today);
    dIn.setDate(today.getDate() + 1);
    const dOut = new Date(today);
    dOut.setDate(today.getDate() + 4);

    clientDateSnapshot = Object.freeze({
      todayStr: toDateInputValue(today),
      defaultIn: toDateInputValue(dIn),
      defaultOut: toDateInputValue(dOut),
    });
  }
  return clientDateSnapshot;
}

function getServerDateSnapshot() {
  return SERVER_DATE_SNAPSHOT;
}

export default function HotelBookingWidget({
  onSearch,
  scrollProgress = 0,
}) {
  const initialDates = useSyncExternalStore(
    subscribeEmpty,
    getClientDateSnapshot,
    getServerDateSnapshot
  );

  const [userCheckIn, setUserCheckIn] = useState(null);
  const [userCheckOut, setUserCheckOut] = useState(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const checkIn = userCheckIn ?? initialDates.defaultIn;
  const checkOut = userCheckOut ?? initialDates.defaultOut;
  const minDate = initialDates.todayStr;

  // Active popover state: null | 'dates' | 'guests'
  const [activePopover, setActivePopover] = useState(null);
  const [validationError, setValidationError] = useState("");

  const widgetRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check-in date change handler with validation
  const handleCheckInChange = (newIn) => {
    setUserCheckIn(newIn);
    setValidationError("");

    // If check-out is before or equal to new check-in, push check-out 1 night ahead
    const inDate = new Date(newIn + "T00:00:00");
    const outDate = new Date(checkOut + "T00:00:00");
    if (outDate <= inDate) {
      const nextDay = new Date(inDate);
      nextDay.setDate(inDate.getDate() + 1);
      setUserCheckOut(toDateInputValue(nextDay));
    }
  };

  // Check-out date change handler with validation
  const handleCheckOutChange = (newOut) => {
    const inDate = new Date(checkIn + "T00:00:00");
    const outDate = new Date(newOut + "T00:00:00");

    if (outDate <= inDate) {
      setValidationError("Check-out date must be after check-in date.");
      return;
    }
    setUserCheckOut(newOut);
    setValidationError("");
  };

  // Quick preset selections
  const applyPresetNights = (numNights) => {
    const inDate = new Date(checkIn + "T00:00:00");
    const outDate = new Date(inDate);
    outDate.setDate(inDate.getDate() + numNights);
    setUserCheckOut(toDateInputValue(outDate));
    setValidationError("");
    setActivePopover(null);
  };

  const handleSearchClick = () => {
    const nights = calculateNights(checkIn, checkOut);
    if (adults < 1) {
      setValidationError("At least 1 adult guest is required.");
      return;
    }
    if (rooms < 1) {
      setValidationError("At least 1 room must be selected.");
      return;
    }

    if (onSearch) {
      onSearch({
        checkIn: formatDisplayDate(checkIn),
        checkOut: formatDisplayDate(checkOut),
        checkInRaw: checkIn,
        checkOutRaw: checkOut,
        nights,
        adults,
        children,
        rooms,
      });
    }
    setActivePopover(null);
  };

  const nights = calculateNights(checkIn, checkOut);

  // Fade out widget smoothly when user scrolls deep into the 3D scene narrative (progress > 0.08)
  const isHeroActive = scrollProgress < 0.08;

  return (
    <div
      ref={widgetRef}
      className={`absolute bottom-5 sm:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 w-[94%] sm:w-[90%] max-w-5xl z-30 transition-all duration-500 ease-out ${
        isHeroActive
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >
      {/* Dark-theme container */}
      <div className="relative bg-zinc-950/85 backdrop-blur-2xl rounded-3xl sm:rounded-full border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-2 sm:p-2.5">
        {/* Amber Gold Accent Hairline at top */}
        <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        {/* Validation Error Banner */}
        {validationError && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-rose-950/90 text-rose-200 text-xs px-4 py-1.5 rounded-full border border-rose-500/50 shadow-lg font-mono whitespace-nowrap">
            ⚠️ {validationError}
          </div>
        )}

        {/* Desktop View: Single Horizontal Bar */}
        <div className="hidden md:flex items-center justify-between divide-x divide-white/[0.1]">
          {/* Segment 1: Check-In */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === "dates" ? null : "dates")}
            className="flex-1 px-5 py-2.5 text-left rounded-l-full hover:bg-white/[0.05] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300/80 font-semibold">
                Check-In
              </span>
            </div>
            <div className="text-sm font-serif font-medium text-white group-hover:text-amber-200 transition-colors truncate">
              {formatDisplayDate(checkIn)}
            </div>
          </button>

          {/* Segment 2: Check-Out with Nights Badge */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === "dates" ? null : "dates")}
            className="flex-1 px-5 py-2.5 text-left hover:bg-white/[0.05] transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300/80 font-semibold">
                  Check-Out
                </span>
              </div>
              <span className="text-[9px] font-mono bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-medium">
                {nights} {nights === 1 ? "Night" : "Nights"}
              </span>
            </div>
            <div className="text-sm font-serif font-medium text-white group-hover:text-amber-200 transition-colors truncate">
              {formatDisplayDate(checkOut)}
            </div>
          </button>

          {/* Segment 3: Guests (Adults & Children) */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === "guests" ? null : "guests")}
            className="flex-1 px-5 py-2.5 text-left hover:bg-white/[0.05] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300/80 font-semibold">
                Guests
              </span>
            </div>
            <div className="text-sm font-serif font-medium text-white group-hover:text-amber-200 transition-colors truncate">
              {adults} {adults === 1 ? "Adult" : "Adults"}
              {children > 0 && `, ${children} ${children === 1 ? "Child" : "Children"}`}
            </div>
          </button>

          {/* Segment 4: Rooms */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === "guests" ? null : "guests")}
            className="flex-1 px-5 py-2.5 text-left hover:bg-white/[0.05] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300/80 font-semibold">
                Rooms
              </span>
            </div>
            <div className="text-sm font-serif font-medium text-white group-hover:text-amber-200 transition-colors truncate">
              {rooms} {rooms === 1 ? "Room" : "Rooms"}
            </div>
          </button>

          {/* Segment 5: Search Rooms Button */}
          <div className="pl-3 pr-1 py-1">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearchClick}
              className="px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-semibold tracking-[0.16em] uppercase transition-all duration-300 shadow-lg shadow-amber-400/25 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
            >
              <svg className="w-4 h-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Rooms</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile View: Compact Responsive Grid Card in Dark Theme */}
        <div className="md:hidden flex flex-col gap-2 p-1">
          <div className="grid grid-cols-2 gap-2">
            {/* Check-In Tap */}
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === "dates" ? null : "dates")}
              className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-left hover:border-zinc-700 transition-colors"
            >
              <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400 block mb-0.5">
                Check-In
              </span>
              <span className="text-xs font-serif font-medium text-white block truncate">
                {formatDisplayDate(checkIn)}
              </span>
            </button>

            {/* Check-Out Tap */}
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === "dates" ? null : "dates")}
              className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-left hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400 block mb-0.5">
                  Check-Out
                </span>
                <span className="text-[8px] font-mono text-amber-400 font-semibold">
                  {nights}n
                </span>
              </div>
              <span className="text-xs font-serif font-medium text-white block truncate">
                {formatDisplayDate(checkOut)}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Guests Tap */}
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === "guests" ? null : "guests")}
              className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-left hover:border-zinc-700 transition-colors"
            >
              <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400 block mb-0.5">
                Guests
              </span>
              <span className="text-xs font-serif font-medium text-white block truncate">
                {adults} Adults{children > 0 && `, ${children} Ch`}
              </span>
            </button>

            {/* Rooms Tap */}
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === "guests" ? null : "guests")}
              className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-left hover:border-zinc-700 transition-colors"
            >
              <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400 block mb-0.5">
                Rooms
              </span>
              <span className="text-xs font-serif font-medium text-white block truncate">
                {rooms} {rooms === 1 ? "Room" : "Rooms"}
              </span>
            </button>
          </div>

          {/* Search Button Mobile */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="w-full mt-1 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-mono font-semibold tracking-[0.16em] uppercase transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <svg className="w-4 h-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search Available Rooms</span>
          </button>
        </div>

        {/* Popover 1: Date Selection Drawer in Dark Theme */}
        <AnimatePresence>
          {activePopover === "dates" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-3 left-0 right-0 sm:left-4 sm:right-auto sm:w-[420px] bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-5 z-40 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-mono tracking-wider uppercase text-zinc-100 font-semibold">
                    Select Stay Dates
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePopover(null)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  ✕ Close
                </button>
              </div>

              {/* Date Input Fields */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={minDate}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => handleCheckOutChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mb-4">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                  Stay Presets:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPresetNights(2)}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-[11px] font-mono text-zinc-200 transition-colors"
                  >
                    2 Nights
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetNights(4)}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-[11px] font-mono text-zinc-200 transition-colors"
                  >
                    4 Nights
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetNights(7)}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-[11px] font-mono text-zinc-200 transition-colors"
                  >
                    7 Nights
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs font-mono uppercase tracking-wider transition-colors shadow-md"
              >
                Apply Dates ({nights} {nights === 1 ? "Night" : "Nights"})
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popover 2: Guests & Rooms Stepper in Dark Theme */}
        <AnimatePresence>
          {activePopover === "guests" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-3 right-0 sm:right-4 sm:w-[360px] bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-5 z-40 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-mono tracking-wider uppercase text-zinc-100 font-semibold">
                    Guests & Rooms
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePopover(null)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  ✕ Close
                </button>
              </div>

              {/* Stepper: Adults */}
              <div className="flex items-center justify-between py-2.5 border-b border-zinc-800/80">
                <div>
                  <div className="text-xs font-serif text-white font-medium">Adults</div>
                  <div className="text-[10px] font-mono text-zinc-400">Ages 13+</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults((a) => Math.max(1, a - 1))}
                    className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-sm text-white disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-mono font-medium text-white">
                    {adults}
                  </span>
                  <button
                    type="button"
                    disabled={adults >= 8}
                    onClick={() => setAdults((a) => Math.min(8, a + 1))}
                    className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-sm text-white disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stepper: Children */}
              <div className="flex items-center justify-between py-2.5 border-b border-zinc-800/80">
                <div>
                  <div className="text-xs font-serif text-white font-medium">Children</div>
                  <div className="text-[10px] font-mono text-zinc-400">Ages 0–12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren((c) => Math.max(0, c - 1))}
                    className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-sm text-white disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-mono font-medium text-white">
                    {children}
                  </span>
                  <button
                    type="button"
                    disabled={children >= 6}
                    onClick={() => setChildren((c) => Math.min(6, c + 1))}
                    className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-sm text-white disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stepper: Rooms */}
              <div className="flex items-center justify-between py-2.5 mb-4">
                <div>
                  <div className="text-xs font-serif text-white font-medium">Rooms</div>
                  <div className="text-[10px] font-mono text-zinc-400">Max 4 suites</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={rooms <= 1}
                    onClick={() => setRooms((r) => Math.max(1, r - 1))}
                    className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-sm text-white disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-mono font-medium text-white">
                    {rooms}
                  </span>
                  <button
                    type="button"
                    disabled={rooms >= 4}
                    onClick={() => setRooms((r) => Math.min(4, r + 1))}
                    className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-sm text-white disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs font-mono uppercase tracking-wider transition-colors shadow-md"
              >
                Confirm Guests ({adults + children} Guests · {rooms} {rooms === 1 ? "Room" : "Rooms"})
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
