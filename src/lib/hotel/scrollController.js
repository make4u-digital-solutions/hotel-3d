/**
 * GSAP ScrollTrigger Controller Module
 *
 * Manages GSAP ScrollTrigger pinning and scroll-scrub synchronization.
 * Normalizes scroll progress from 0.0 to 1.0 and maps it to the active
 * frame sequence without assuming identical desktop and mobile frame counts.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure GSAP plugins are registered safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export class ScrollController {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.triggerElement - Scroll track container element
   * @param {HTMLElement} options.pinnedElement - Viewport element to pin
   * @param {number} options.totalFrames - Number of frames in active sequence
   * @param {(data: { progress: number, frameIndex: number, direction: number }) => void} options.onUpdate
   */
  constructor({ triggerElement, pinnedElement, totalFrames, onUpdate }) {
    this.triggerElement = triggerElement;
    this.pinnedElement = pinnedElement;
    this.totalFrames = totalFrames;
    this.onUpdate = onUpdate;

    this.currentFrameIndex = 1;
    this.scrollTriggerInstance = null;
  }

  /**
   * Initializes ScrollTrigger instance.
   */
  init() {
    if (typeof window === "undefined" || !this.triggerElement || !this.pinnedElement) {
      return;
    }

    this.destroy();

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.triggerElement,
      start: "top top",
      end: "bottom bottom",
      pin: this.pinnedElement,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 to 1.0
        const frameOffset = Math.floor(progress * (this.totalFrames - 1));
        const targetFrame = Math.min(this.totalFrames, Math.max(1, frameOffset + 1));

        if (targetFrame !== this.currentFrameIndex) {
          this.currentFrameIndex = targetFrame;
        }

        if (this.onUpdate) {
          this.onUpdate({
            progress,
            frameIndex: targetFrame,
            direction: self.direction, // 1 = scrolling down, -1 = scrolling up
          });
        }
      },
    });

    ScrollTrigger.refresh();
  }

  /**
   * Updates total frames count (e.g. after switching device sequence).
   *
   * @param {number} newTotalFrames
   */
  updateTotalFrames(newTotalFrames) {
    this.totalFrames = newTotalFrames;
    if (this.scrollTriggerInstance) {
      const progress = this.scrollTriggerInstance.progress;
      const frameOffset = Math.floor(progress * (this.totalFrames - 1));
      this.currentFrameIndex = Math.min(this.totalFrames, Math.max(1, frameOffset + 1));
    }
  }

  /**
   * Refreshes ScrollTrigger positions (e.g. after layout resize or font load).
   */
  refresh() {
    if (typeof window !== "undefined") {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Destroys ScrollTrigger instance cleanly to prevent memory leaks.
   */
  destroy() {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }
  }
}
