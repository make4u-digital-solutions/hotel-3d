"use client";

/**
 * HotelCanvas Component
 *
 * Hosts the HTML5 Canvas DOM element and manages high-DPI canvas lifecycle,
 * ResizeObserver observation, and delegating draw operations to CanvasRenderer.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CanvasRenderer } from "@/lib/hotel/canvasRenderer";

const HotelCanvas = forwardRef(function HotelCanvas(
  { className = "", onResize },
  ref
) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new CanvasRenderer(canvas);
    rendererRef.current = renderer;
    renderer.resize();

    // ResizeObserver on canvas container
    const observer = new ResizeObserver(() => {
      if (rendererRef.current) {
        const metrics = rendererRef.current.resize();
        if (onResize) onResize(metrics);
      }
    });

    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    return () => {
      observer.disconnect();
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [onResize]);

  // Expose renderer methods to parent component
  useImperativeHandle(
    ref,
    () => ({
      renderFrame: (image) => {
        rendererRef.current?.scheduleRender(image);
      },
      renderImmediate: (image) => {
        rendererRef.current?.renderImmediate(image);
      },
      resize: () => {
        return rendererRef.current?.resize();
      },
      getCanvas: () => canvasRef.current,
    }),
    []
  );

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full block select-none pointer-events-none ${className}`}
    />
  );
});

export default HotelCanvas;
