/**
 * Canvas Renderer Module
 *
 * Dedicated rendering engine for HTML5 Canvas.
 * Computes high-DPI retina backing-store dimensions, handles
 * object-fit: cover aspect ratio math for both landscape and portrait frames,
 * and coalesces redraw calls via requestAnimationFrame.
 */

export class CanvasRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
    this.rafId = null;
    this.pendingImage = null;
    this.currentDpr = 1;
    this.displayWidth = 0;
    this.displayHeight = 0;
  }

  /**
   * Updates canvas internal dimensions matching display bounds and device pixel ratio.
   *
   * @returns {{ width: number, height: number, dpr: number }}
   */
  resize() {
    if (!this.canvas) return { width: 0, height: 0, dpr: 1 };

    const rect = this.canvas.getBoundingClientRect();
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth <= 768 || (window.screen && window.screen.width <= 768));

    const deviceMemory =
      typeof navigator !== "undefined" && "deviceMemory" in navigator
        ? Number(navigator.deviceMemory)
        : null;

    // Mobile DPR cap: 1.25 on low-memory mobile, 1.5 on standard mobile, 2.0 on desktop
    const maxDpr = isMobile ? (deviceMemory !== null && deviceMemory <= 3 ? 1.0 : 1.5) : 2.0;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
    this.currentDpr = dpr;

    let physicalWidth = Math.round(rect.width * dpr);
    let physicalHeight = Math.round(rect.height * dpr);

    // Clamp dimensions to source frame resolution (1080x1920 mobile, 1920x1080 desktop)
    const maxNativeWidth = isMobile ? 1080 : 1920;
    const maxNativeHeight = isMobile ? 1920 : 1080;
    physicalWidth = Math.min(physicalWidth, maxNativeWidth);
    physicalHeight = Math.min(physicalHeight, maxNativeHeight);

    if (
      physicalWidth > 0 &&
      physicalHeight > 0 &&
      (this.canvas.width !== physicalWidth || this.canvas.height !== physicalHeight)
    ) {
      this.canvas.width = physicalWidth;
      this.canvas.height = physicalHeight;
    }

    return { width: physicalWidth, height: physicalHeight, dpr };
  }

  /**
   * Draws an image into the canvas context using 'cover' aspect ratio geometry.
   * Ensures the image fully fills the viewport without stretching or distortion.
   *
   * @param {HTMLImageElement|ImageBitmap} image
   */
  drawCover(image) {
    if (!this.ctx || !image) return;

    // Ensure canvas dimensions match container if not yet measured
    if (!this.canvas.width || !this.canvas.height) {
      this.resize();
    }

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;

    if (!imageWidth || !imageHeight || !canvasWidth || !canvasHeight) return;

    // Calculate scale factor to cover canvas completely without letterboxing
    const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    // Center image within canvas viewport
    const dx = (canvasWidth - scaledWidth) / 2;
    const dy = (canvasHeight - scaledHeight) / 2;

    try {
      this.ctx.drawImage(
        image,
        0,
        0,
        imageWidth,
        imageHeight,
        dx,
        dy,
        scaledWidth,
        scaledHeight
      );
    } catch (_) {
      // Safely ignore if ImageBitmap was closed concurrently
    }
  }

  /**
   * Synchronously draws the image immediately (ideal for instant poster render).
   *
   * @param {HTMLImageElement} image
   */
  renderImmediate(image) {
    if (!image) return;
    this.pendingImage = null;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.drawCover(image);
  }

  /**
   * Schedules a frame render on the next animation frame, coalescing redundant requests.
   *
   * @param {HTMLImageElement} image
   */
  scheduleRender(image) {
    if (!image) return;
    this.pendingImage = image;

    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (this.pendingImage) {
        this.drawCover(this.pendingImage);
      }
    });
  }

  /**
   * Cleans up pending animation frames.
   */
  destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pendingImage = null;
    this.canvas = null;
    this.ctx = null;
  }
}
