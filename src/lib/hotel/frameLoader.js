/**
 * Single Frame Loader Module
 *
 * Handles asynchronous download and off-main-thread decoding of WebP frames
 * using HTMLImageElement and modern img.decode() API with AbortSignal support.
 */

/**
 * Loads and asynchronously decodes a single frame image.
 *
 * @param {string} url - URL path to the WebP frame
 * @param {AbortSignal} [signal] - Optional signal to abort download/decoding
 * @returns {Promise<HTMLImageElement|null>} Decoded image element or null if failed/aborted
 */
export async function loadFrameImage(url, signal) {
  if (typeof window === "undefined") {
    return null;
  }

  if (signal?.aborted) {
    return null;
  }

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
      // Clearing src terminates pending network activity
      img.src = "";
      resolve(null);
    };

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }

    img.onload = async () => {
      cleanup();
      if (signal?.aborted) {
        return resolve(null);
      }

      // Asynchronously decode pixel buffer in a background thread to prevent UI jank
      if ("decode" in img) {
        try {
          await img.decode();
        } catch (_) {
          // If decode rejects (e.g. image detached), resolve img anyway if valid
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
