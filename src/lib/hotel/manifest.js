/**
 * Hotel Frame Sequence Manifest
 *
 * Defines the authoritative metadata for each frame sequence.
 * Frame counts and dimensions are defined separately for desktop and mobile.
 */

export const BREAKPOINT_MOBILE_MAX = 768; // Viewport width in px for mobile breakpoint

export const FRAME_MANIFEST = {
  desktop: {
    id: "desktop",
    name: "Desktop Horizon",
    basePath: "/frames/desktop/",
    prefix: "frame_",
    digits: 5,
    extension: ".webp",
    totalFrames: 190,
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    mimeType: "image/webp",
  },
  mobile: {
    id: "mobile",
    name: "Mobile Horizon",
    basePath: "/frames/mobile/",
    prefix: "frame_",
    digits: 5,
    extension: ".webp",
    totalFrames: 190,
    width: 1080,
    height: 1920,
    aspectRatio: 9 / 16,
    mimeType: "image/webp",
  },
};

/**
 * Returns the manifest for a specific variant.
 *
 * @param {('desktop'|'mobile')} variant
 * @returns {typeof FRAME_MANIFEST['desktop']}
 */
export function getManifest(variant) {
  return FRAME_MANIFEST[variant] || FRAME_MANIFEST.desktop;
}

/**
 * Generates the frame URL for a specific frame index from the manifest.
 *
 * @param {typeof FRAME_MANIFEST['desktop']} manifest
 * @param {number} frameIndex - 1-based frame index
 * @returns {string} URL to the WebP frame
 */
export function getFrameUrlFromManifest(manifest, frameIndex) {
  const index = Math.min(manifest.totalFrames, Math.max(1, frameIndex));
  const paddedIndex = String(index).padStart(manifest.digits, "0");
  return `${manifest.basePath}${manifest.prefix}${paddedIndex}${manifest.extension}`;
}
