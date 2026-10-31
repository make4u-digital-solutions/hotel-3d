"use client";

/**
 * HotelOverlay Component (Wrapper for HotelScenes)
 *
 * Exposes the scene-based content and text transitions for the 6 hotel scenes.
 */

import HotelScenes from "./HotelScenes";

export default function HotelOverlay({
  triggerRef,
  totalFrames = 190,
  onActionClick,
}) {
  return (
    <HotelScenes
      triggerRef={triggerRef}
      totalFrames={totalFrames}
      onActionClick={onActionClick}
    />
  );
}
