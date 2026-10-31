/**
 * GSAP ScrollTrigger Controller Module
 *
 * Implements Apple-style scroll-scrubbing:
 * 1. Pins the hotel animation section during scroll.
 * 2. Uses strictly `scrub: true`.
 * 3. Maps ScrollTrigger progress (0.0 to 1.0) to active sequence's totalFrames.
 * 4. Only notifies onFrameChange when the calculated target frame actually changes.
 * 5. Passes scroll direction (+1 for forward, -1 for reverse).
 * 6. Cleanly destroys timelines and ScrollTriggers on teardown.
 *
 * STRICTLY FORBIDDEN:
 * - Autoplay
 * - Automatic frame advancement
 * - setInterval loops
 * - Independent requestAnimationFrame playback loops
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Safely register ScrollTrigger in browser environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export class ScrollController {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.triggerElement - Scroll track container element
   * @param {HTMLElement} options.pinnedElement - Viewport element to pin
   * @param {number} options.totalFrames - Number of frames in active sequence
   * @param {(data: { progress: number, frameIndex: number, direction: number, hasFrameChanged: boolean }) => void} options.onUpdate
   */
  constructor({ triggerElement, pinnedElement, totalFrames, onUpdate }) {
    this.triggerElement = triggerElement;
    this.pinnedElement = pinnedElement;
    this.totalFrames = totalFrames;
    this.onUpdate = onUpdate;

    this.currentFrameIndex = 1;
    this.lastProgress = 0;
    this.scrollTriggerInstance = null;
  }

  /**
   * Initializes pinned ScrollTrigger with scrub: true.
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
      scrub: true, // Apple-style synchronous scrub locked to scroll physics
      onUpdate: (self) => {
        const progress = Math.min(1, Math.max(0, self.progress));
        const frameOffset = Math.floor(progress * (this.totalFrames - 1));
        const targetFrame = Math.min(this.totalFrames, Math.max(1, frameOffset + 1));

        const hasFrameChanged = targetFrame !== this.currentFrameIndex;
        if (hasFrameChanged) {
          this.currentFrameIndex = targetFrame;
        }

        this.lastProgress = progress;

        // Dispatch update
        if (this.onUpdate) {
          this.onUpdate({
            progress,
            frameIndex: targetFrame,
            direction: self.direction || 1, // 1 = forward/down, -1 = reverse/up
            hasFrameChanged,
          });
        }
      },
    });

    ScrollTrigger.refresh();
  }

  /**
   * Updates total frames count when sequence changes (e.g. desktop <-> mobile).
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
   * Refreshes ScrollTrigger layout calculations.
   */
  refresh() {
    if (typeof window !== "undefined" && ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Cleanly destroys the ScrollTrigger instance.
   */
  destroy() {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill(true);
      this.scrollTriggerInstance = null;
    }
  }
}
