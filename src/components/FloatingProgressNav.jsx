"use client";

import { useMemo } from "react";

export const ROOMS = [
  {
    id: "entrance",
    number: "01",
    label: "Entrance",
    targetFrame: 5,
    range: [1, 42],
  },
  {
    id: "living",
    number: "02",
    label: "Living Room",
    targetFrame: 43,
    range: [43, 82],
  },
  {
    id: "kitchen",
    number: "03",
    label: "Kitchen",
    targetFrame: 85,
    range: [83, 124],
  },
  {
    id: "bedroom",
    number: "04",
    label: "Bedroom",
    targetFrame: 127,
    range: [125, 166],
  },
  {
    id: "bathroom",
    number: "05",
    label: "Bathroom",
    targetFrame: 169,
    range: [167, 206],
  },
  {
    id: "garden",
    number: "06",
    label: "Garden",
    targetFrame: 209,
    range: [207, 248],
  },
];

/**
 * FloatingProgressNav
 *
 * Requirements:
 * - Fixed to the right side of the screen
 * - Features small dots/lines representing each room:
 *   Entrance, Living Room, Kitchen, Bedroom, Bathroom, Garden
 * - Automatically highlights the active room according to ScrollTrigger progress
 * - Allows users to click on any indicator to smoothly scroll to that frame range using Lenis
 * - Subtle transitions and luxury architectural styling
 * - Responsive and unobtrusive
 */
export default function FloatingProgressNav({
  activeFrame = 1,
  onSelectRoom,
}) {
  // Find currently active room index
  const activeRoomIndex = useMemo(() => {
    const idx = ROOMS.findIndex(
      (room) => activeFrame >= room.range[0] && activeFrame <= room.range[1]
    );
    return idx !== -1 ? idx : 0;
  }, [activeFrame]);

  return (
    <aside
      aria-label="Room Timeline Navigation"
      className="fixed right-5 sm:right-8 lg:right-10 top-1/2 -translate-y-1/2 z-40 pointer-events-none select-none"
    >
      <div className="relative flex flex-col items-end gap-5 py-4 px-2">
        {/* Subtle background connecting track */}
        <div className="absolute right-[11px] top-4 bottom-4 w-[1px] bg-white/[0.08]" />

        {/* Progress fill on the track */}
        <div
          className="absolute right-[11px] top-4 w-[1px] bg-gradient-to-b from-amber-400 via-amber-300 to-amber-500 transition-all duration-300 ease-out"
          style={{
            height: `${(activeRoomIndex / (ROOMS.length - 1)) * 100}%`,
          }}
        />

        {/* Room Navigation Indicators */}
        {ROOMS.map((room, index) => {
          const isActive = index === activeRoomIndex;

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelectRoom?.(room.targetFrame)}
              aria-label={`Scroll to ${room.label}`}
              className="group pointer-events-auto flex items-center justify-end gap-3.5 cursor-pointer py-1.5 focus:outline-none"
            >
              {/* Tooltip Label (Floats to the left on hover or when active) */}
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded-md backdrop-blur-md transition-all duration-300 ease-out ${
                  isActive
                    ? "opacity-100 translate-x-0 bg-zinc-950/70 border border-white/[0.08] shadow-lg"
                    : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-zinc-950/60 border border-transparent"
                }`}
              >
                <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest">
                  {room.number}
                </span>
                <span
                  className={`text-xs tracking-wider transition-colors duration-200 font-sans ${
                    isActive
                      ? "text-white font-medium"
                      : "text-zinc-400 group-hover:text-zinc-200 font-light"
                  }`}
                >
                  {room.label}
                </span>
              </div>

              {/* Indicator Dot / Line */}
              <div className="relative flex items-center justify-center w-6 h-4">
                <div
                  className={`rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? "w-6 h-[2.5px] bg-gradient-to-r from-amber-400 to-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.65)]"
                      : "w-2 h-[2px] bg-zinc-600 group-hover:w-4 group-hover:bg-zinc-300"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
