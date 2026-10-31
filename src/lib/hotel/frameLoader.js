/**
 * Single Frame Loader Module
 *
 * Handles asynchronous download and off-main-thread decoding of WebP frames.
 * Uses high-performance fetch -> blob -> createImageBitmap with AbortSignal support,
 * and falls back to HTMLImageElement + img.decode() where needed.
 */

/**
 * Loads and asynchronously decodes a single frame image.
 * Returns an ImageBitmap (ideal for deterministic memory closure)
 * or HTMLImageElement.
 *
 * @param {string} url - URL path to the WebP frame
 * @param {AbortSignal} [signal] - Optional signal to abort download/decoding
 * @returns {Promise<ImageBitmap|HTMLImageElement|null>} Decoded image resource or null
 */
export async function loadFrameImage(url, signal) {
  if (typeof window === "undefined") {
    return null;
  }

  if (signal?.aborted) {
    return null;
  }

  // 1. High-Performance ImageBitmap Path (Off-main-thread decoding & deterministic .close())
  if (typeof window.createImageBitmap === "function") {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) return null;

      const blob = await response.blob();
      if (signal?.aborted) return null;

      const bitmap = await createImageBitmap(blob);
      if (signal?.aborted) {
        if (typeof bitmap.close === "function") bitmap.close();
        return null;
      }

      return bitmap;
    } catch (_) {
      if (signal?.aborted) return null;
      // Fall through to HTMLImageElement fallback on network or decode anomaly
    }
  }

  // 2. Standard HTMLImageElement fallback with async img.decode()
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
    };

    const onAbort = () => {
      cleanup();
      img.src = "";
      resolve(null);
    };

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }

    img.onload = async () => {
      cleanup();
      if (signal?.aborted) {
        img.src = "";
        return resolve(null);
      }

      if ("decode" in img) {
        try {
          await img.decode();
        } catch (_) {
          // If decode fails non-fatally, resolve img if valid
        }
      }

      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      resolve(null);
    };

    img.src = url;
  });
}
