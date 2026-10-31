/**
 * Hotel Experience Configuration
 *
 * Imports authoritative manifest and defines milestones & room overlays.
 * Initial batch is strictly configured to 50 frames.
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
    initialBatchSize: 50, // Strictly load first 50 frames initially
  },
  mobile: {
    ...FRAME_MANIFEST.mobile,
    initialBatchSize: 50, // Strictly load first 50 frames initially
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
 * Architectural room milestones mapped by normalized progress (0.0 to 1.0).
 */
export const HOTEL_SECTIONS = [
  {
    id: "entrance",
    number: "01",
    label: "Arrival",
    title: "Grand Porte-Cochère",
    specs: "Volcanic Basalt · Reflective Water Court",
    description: "A monumental entry sequence welcoming guests with acoustic calm and ambient warmth.",
    startProgress: 0.02,
    endProgress: 0.16,
    position: "left",
  },
  {
    id: "living",
    number: "02",
    label: "Living Space",
    title: "The Panoramic Salon",
    specs: "Floor-to-Ceiling Glass · French Oak",
    description: "Expansive living spaces bathed in diffused natural daylight with unobstructed ocean vistas.",
    startProgress: 0.18,
    endProgress: 0.32,
    position: "right",
  },
  {
    id: "kitchen",
    number: "03",
    label: "Dining & Bar",
    title: "Culinary Atelier",
    specs: "Calacatta Quartzite · Fluted Walnut",
    description: "Sculpted stone island complemented by concealed cabinetry and architectural lighting.",
    startProgress: 0.34,
    endProgress: 0.48,
    position: "left",
  },
  {
    id: "bedroom",
    number: "04",
    label: "Private Suite",
    title: "Master Sanctuary",
    specs: "Acoustic Slats · Cantilever Terrace",
    description: "Oriented toward the morning dawn with direct access to private cantilevered decks.",
    startProgress: 0.50,
    endProgress: 0.65,
    position: "right",
  },
  {
    id: "bathroom",
    number: "05",
    label: "Wellness Suite",
    title: "Spa & Thermal Bath",
    specs: "Honed Monolithic Tub · Sky Oculus",
    description: "Sculptural soaking tub centered directly underneath a frameless natural daylight aperture.",
    startProgress: 0.67,
    endProgress: 0.82,
    position: "left",
  },
  {
    id: "garden",
    number: "06",
    label: "Outdoor Terrace",
    title: "Botanical Pavilion",
    specs: "Native Flora · Infinity Edge Pool",
    description: "An open-air retreat framed by coastal gardens and a reflective sunset horizon.",
    startProgress: 0.84,
    endProgress: 0.98,
    position: "right",
  },
];
