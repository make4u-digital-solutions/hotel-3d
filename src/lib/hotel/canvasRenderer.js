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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
    this.currentDpr = dpr;

    const physicalWidth = Math.round(rect.width * dpr);
    const physicalHeight = Math.round(rect.height * dpr);

    if (this.canvas.width !== physicalWidth || this.canvas.height !== physicalHeight) {
      this.canvas.width = physicalWidth;
      this.canvas.height = physicalHeight;
    }

    return { width: physicalWidth, height: physicalHeight, dpr };
  }

  /**
   * Draws an image into the canvas context using 'cover' aspect ratio geometry.
   * Ensures the image fully fills the viewport without stretching or borders.
   *
   * @param {HTMLImageElement} image
   */
  drawCover(image) {
    if (!this.ctx || !image) return;

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;

    if (!imageWidth || !imageHeight) return;

    // Calculate scale factor to cover canvas
    const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    // Center offset
    const dx = (canvasWidth - scaledWidth) / 2;
    const dy = (canvasHeight - scaledHeight) / 2;

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
