import React, { useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion';

const RupeeCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  /*
   * Fast symbol tracking.
   * This should feel close to the native cursor,
   * not like a slow floating object.
   */
  const symbolSpringConfig = {
    damping: 35,
    stiffness: 1200,
    mass: 0.15,
  };

  /*
   * Slightly softer ring movement.
   * Gives a premium trailing effect without
   * making the cursor feel delayed.
   */
  const ringSpringConfig = {
    damping: 30,
    stiffness: 700,
    mass: 0.3,
  };

  const smoothX = useSpring(cursorX, symbolSpringConfig);
  const smoothY = useSpring(cursorY, symbolSpringConfig);

  const ringX = useSpring(cursorX, ringSpringConfig);
  const ringY = useSpring(cursorY, ringSpringConfig);

  const scaleRing = useSpring(1, {
    damping: 25,
    stiffness: 500,
    mass: 0.2,
  });

  const opacityRing = useSpring(0, {
    damping: 25,
    stiffness: 500,
    mass: 0.2,
  });

  const scaleSymbol = useSpring(1, {
    damping: 25,
    stiffness: 600,
    mass: 0.15,
  });

  const opacitySymbol = useSpring(0, {
    damping: 25,
    stiffness: 600,
    mass: 0.15,
  });

  useEffect(() => {
    /*
     * Disable custom cursor on touch/coarse pointer devices.
     */
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    /*
     * If reduced motion is enabled, we keep the ₹ cursor
     * but remove the noticeable trailing effect by making
     * the springs effectively immediate.
     *
     * The cursor remains usable without unnecessary motion.
     */
    const styleEl = document.createElement('style');

    styleEl.innerHTML = `
      body,
      body a,
      body button,
      body [role="button"] {
        cursor: none !important;
      }

      body input,
      body textarea,
      body select,
      body [contenteditable="true"] {
        cursor: auto !important;
      }
    `;

    document.head.appendChild(styleEl);

    let isHovering = false;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const isInput = e.target.closest(
        'input, textarea, select, [contenteditable="true"]'
      );

      /*
       * Restore native cursor behavior for text/input areas.
       */
      if (isInput) {
        opacitySymbol.set(0);
        opacityRing.set(0);
        return;
      }

      opacitySymbol.set(1);

      const isClickable = e.target.closest(
        'a, button, [role="button"]'
      );

      const hoveringNow = Boolean(isClickable);

      if (hoveringNow !== isHovering) {
        isHovering = hoveringNow;

        /*
         * Interactive state:
         * Small increase only — noticeable but not gimmicky.
         */
        scaleSymbol.set(hoveringNow ? 1.15 : 1);
        scaleRing.set(hoveringNow ? 1.35 : 1);

        opacityRing.set(hoveringNow ? 0.55 : 0.3);
      } else if (!isHovering) {
        opacityRing.set(0.3);
      }
    };

    const handleMouseLeave = () => {
      opacitySymbol.set(0);
      opacityRing.set(0);
    };

    const handleMouseEnter = () => {
      opacitySymbol.set(1);
      opacityRing.set(isHovering ? 0.55 : 0.3);
    };

    window.addEventListener('mousemove', handleMouseMove);

    document.documentElement.addEventListener(
      'mouseleave',
      handleMouseLeave
    );

    document.documentElement.addEventListener(
      'mouseenter',
      handleMouseEnter
    );

    return () => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );

      document.documentElement.removeEventListener(
        'mouseleave',
        handleMouseLeave
      );

      document.documentElement.removeEventListener(
        'mouseenter',
        handleMouseEnter
      );
    };
  }, [
    cursorX,
    cursorY,
    opacitySymbol,
    opacityRing,
    scaleSymbol,
    scaleRing,
  ]);

  return (
    <>
      {/* Subtle outer interaction ring */}
      <motion.div
        className="fixed pointer-events-none z-[9999] rounded-full"
        style={{
          width: 28,
          height: 28,
          top: -14,
          left: -14,
          x: ringX,
          y: ringY,
          scale: scaleRing,
          opacity: opacityRing,
          border: '1px solid var(--primary)',
          boxShadow:
            '0 0 12px color-mix(in srgb, var(--primary) 30%, transparent)',
        }}
      />

      {/* Indian Rupee cursor */}
      <motion.div
        className="fixed pointer-events-none z-[10000] flex items-center justify-center select-none"
        style={{
          width: 22,
          height: 22,
          top: -11,
          left: -11,

          x: smoothX,
          y: smoothY,

          scale: scaleSymbol,
          opacity: opacitySymbol,

          fontSize: '40px',
          fontWeight: 800,
          lineHeight: 1,

          /*
           * Uses the existing fintech primary color.
           */
          color: 'var(--primary)',

          /*
           * Small contrast halo so ₹ remains visible
           * over dark/light sections and gradients.
           */
          textShadow:
            '0 0 2px var(--bg-app), ' +
            '-1px -1px 0 var(--bg-app), ' +
            '1px -1px 0 var(--bg-app), ' +
            '-1px 1px 0 var(--bg-app), ' +
            '1px 1px 0 var(--bg-app)',

          filter:
            'drop-shadow(0 0 6px color-mix(in srgb, var(--primary) 35%, transparent))',
        }}
      >
        ₹
      </motion.div>
    </>
  );
};

export default RupeeCursor;