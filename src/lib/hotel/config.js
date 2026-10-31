/**
 * Hotel Experience Configuration
 *
 * Defines the 6 authoritative hotel scenes and their progress boundaries:
 * 1. Hotel exterior
 * 2. Hotel entrance
 * 3. Reception and lobby
 * 4. Restaurant and lounge
 * 5. Guest suite
 * 6. Final hotel reveal
 */

import {
  BREAKPOINT_MOBILE_MAX,
  FRAME_MANIFEST,
  getFrameUrlFromManifest,
  getManifest,
} from "./manifest.js";

export { BREAKPOINT_MOBILE_MAX, FRAME_MANIFEST, getFrameUrlFromManifest, getManifest };

export const SEQUENCE_CONFIG = {
  desktop: {
    ...FRAME_MANIFEST.desktop,
    chunkSize: 35,
    initialBatchSize: 25,
    concurrency: 4,
    prefetchThreshold: 12,
  },
  mobile: {
    ...FRAME_MANIFEST.mobile,
    chunkSize: 20,
    initialBatchSize: 15,
    concurrency: 2,
    prefetchThreshold: 8,
  },
};

/**
 * Generates the URL for a specific frame based on sequence configuration.
 *
 * @param {('desktop'|'mobile')} variant - Device sequence variant
 * @param {number} frameNumber - 1-based frame index
 * @returns {string} URL to the frame asset
 */
export function getFrameUrl(variant, frameNumber) {
  const manifest = getManifest(variant);
  return getFrameUrlFromManifest(manifest, frameNumber);
}

/**
 * The 6 Authoritative Hotel Scenes mapped by normalized scroll progress.
 */
export const HOTEL_SCENES = [
  {
    id: "exterior",
    number: "01",
    label: "Hotel Exterior",
    tag: "01 · THE ESTATE",
    title: "A Monument of Modern Grandeur",
    specs: "Honed Quartzite · Water Reflection Terraces",
    description:
      "Nestled within coastal flora, sculpted stone terraces and infinity reflection pools frame an unforgettable first impression.",
    cta: "Explore Grounds",
    startProgress: 0.00,
    endProgress: 0.16,
    position: "left",
  },
  {
    id: "entrance",
    number: "02",
    label: "Hotel Entrance",
    tag: "02 · THE ARRIVAL",
    title: "The Grand Porte-Cochère",
    specs: "Monolithic Basalt Pillars · Bronze Gateways",
    description:
      "A private covered arrival pavilion welcoming guests with acoustic tranquility and gentle cascading water fountains.",
    cta: "Valet & Entry",
    startProgress: 0.17,
    endProgress: 0.33,
    position: "right",
  },
  {
    id: "lobby",
    number: "03",
    label: "Reception & Lobby",
    tag: "03 · THE RECEPTION",
    title: "Cathedral of Light & Marble",
    specs: "Calacatta Gold · Hand-Blown Murano Chandeliers",
    description:
      "Double-height glass curtain walls illuminate a sculptural marble reception desk and bespoke low-slung lounge seating.",
    cta: "Check-In Privileges",
    startProgress: 0.34,
    endProgress: 0.50,
    position: "left",
  },
  {
    id: "restaurant",
    number: "04",
    label: "Restaurant & Lounge",
    tag: "04 · CULINARY ATELIER",
    title: "The Solarium Dining Salon",
    specs: "Fluted American Walnut · Brushed Brass Bar",
    description:
      "Michelin-caliber culinary artistry served against floor-to-ceiling glass pavilions overlooking tranquil gardens.",
    cta: "Reserve a Table",
    startProgress: 0.51,
    endProgress: 0.67,
    position: "right",
  },
  {
    id: "suite",
    number: "05",
    label: "Guest Suite",
    tag: "05 · SANCTUARY SUITES",
    title: "The Horizon Master Suite",
    specs: "Acoustic Slats · Cantilevered Sunrise Terrace",
    description:
      "An intimate retreat designed for restful quietude, featuring a private soaking bath and panoramic ocean-facing glass.",
    cta: "View Suite Details",
    startProgress: 0.68,
    endProgress: 0.84,
    position: "left",
  },
  {
    id: "reveal",
    number: "06",
    label: "Final Hotel Reveal",
    tag: "06 · THE REVEAL",
    title: "The Grand Horizon Destination",
    specs: "5-Star Ultra Luxury · Architectural Icon",
    description:
      "Where visionary design meets peerless hospitality. Every perspective curated to inspire lasting memories.",
    cta: "Book Your Experience",
    startProgress: 0.85,
    endProgress: 1.00,
    position: "center",
  },
];

// Alias for backwards compatibility
export const HOTEL_SECTIONS = HOTEL_SCENES;

/**
 * Computes exact integer frame boundaries for a scene given sequence totalFrames.
 *
 * @param {typeof HOTEL_SCENES[0]} scene
 * @param {number} totalFrames
 * @returns {{ startFrame: number, endFrame: number, frameCount: number }}
 */
export function getSceneBoundaries(scene, totalFrames) {
  const startFrame = Math.max(1, Math.round(scene.startProgress * (totalFrames - 1)) + 1);
  const endFrame = Math.min(totalFrames, Math.round(scene.endProgress * (totalFrames - 1)) + 1);
  return {
    startFrame,
    endFrame,
    frameCount: Math.max(1, endFrame - startFrame + 1),
  };
}
