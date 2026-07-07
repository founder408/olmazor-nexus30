"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Small animated node-burst used on the confirmation screen — echoes the
 * signature network motif (a node "connecting" successfully) instead of a
 * generic confetti animation.
 */
export function ConfettiNode() {
  const prefersReducedMotion = useReducedMotion();
  const nodes = [0, 60, 120, 180, 240, 300];

  return (
    <div className="relative h-20 w-20">
      {nodes.map((angle, i) => (
        <motion.span
          key={angle}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent-teal"
          style={{
            transform: `rotate(${angle}deg) translate(0, -28px)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: [0, 1, 0], scale: [0, 1, 0.8] }
          }
          transition={{ duration: 1.4, delay: i * 0.06, repeat: prefersReducedMotion ? 0 : Infinity, repeatDelay: 1.2 }}
        />
      ))}
    </div>
  );
}
