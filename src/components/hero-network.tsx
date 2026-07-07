"use client";

import { motion, useReducedMotion } from "framer-motion";

const STAGES = [
  { key: "ideaton", angle: -90, radius: 148, color: "#7C5CFF", duration: 26, pulseDelay: 0 },
  { key: "hakaton", angle: 30, radius: 148, color: "#2DD4BF", duration: 32, pulseDelay: 0.6 },
  { key: "startup", angle: 150, radius: 148, color: "#D4A94E", duration: 38, pulseDelay: 1.2 },
];

const PARTICLES = [
  { top: "8%", left: "18%", delay: 0 },
  { top: "82%", left: "12%", delay: 0.7 },
  { top: "14%", left: "82%", delay: 1.3 },
  { top: "88%", left: "78%", delay: 0.4 },
  { top: "48%", left: "3%", delay: 1.6 },
  { top: "44%", left: "95%", delay: 1 },
];

/**
 * Hero's signature visual: a glowing "hub" (the NEXUS30 mark) with three
 * satellite nodes — one per event stage — slowly orbiting on a tilted
 * plane, connected to the core by pulsing gradient arcs. Replaces the old
 * flat rotating zigzag graph with a more premium, intentional motif.
 */
export function HeroNetwork() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute h-[70%] w-[70%] rounded-full bg-gradient-to-br from-accent-violet/25 via-accent-teal/15 to-accent-gold/20 blur-[70px]" />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/50 animate-pulse-node"
          style={{ top: p.top, left: p.left, animationDelay: `${p.delay}s` }}
        />
      ))}

      <div className="relative h-[85%] w-[85%]" style={{ perspective: "900px" }}>
        <div
          className="absolute inset-0"
          style={{ transform: "rotateX(58deg)", transformStyle: "preserve-3d" }}
        >
          <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
            <defs>
              {STAGES.map((s, i) => (
                <linearGradient key={s.key} id={`nexus-arc-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.85" />
                </linearGradient>
              ))}
            </defs>

            {[100, 148, 190].map((r) => (
              <circle key={r} cx={200} cy={200} r={r} fill="none" stroke="white" strokeOpacity={0.08} />
            ))}

            {STAGES.map((s, i) => {
              const rad = (s.angle * Math.PI) / 180;
              const x = 200 + s.radius * Math.cos(rad);
              const y = 200 + s.radius * Math.sin(rad);
              return (
                <motion.g
                  key={s.key}
                  style={{ transformOrigin: "200px 200px" }}
                  animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                  transition={{ duration: s.duration, repeat: Infinity, ease: "linear" }}
                >
                  <motion.line
                    x1={200}
                    y1={200}
                    x2={x}
                    y2={y}
                    stroke={`url(#nexus-arc-${i})`}
                    strokeWidth={1.5}
                    initial={{ opacity: 0.15 }}
                    animate={{ opacity: [0.15, 0.6, 0.15] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      delay: s.pulseDelay,
                      ease: "easeInOut",
                    }}
                  />
                  <circle cx={x} cy={y} r={16} fill={s.color} fillOpacity={0.15} />
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={7}
                    fill={s.color}
                    style={{ transformOrigin: `${x}px ${y}px` }}
                    animate={prefersReducedMotion ? undefined : { scale: [1, 1.25, 1] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: s.pulseDelay,
                      ease: "easeInOut",
                    }}
                  />
                </motion.g>
              );
            })}
          </svg>
        </div>
      </div>

      <motion.div
        className="absolute flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-teal font-display text-base font-bold text-white sm:h-14 sm:w-14 sm:rounded-2xl sm:text-lg md:h-16 md:w-16 md:text-xl"
        style={{ boxShadow: "0 0 50px rgba(124,92,255,0.45)" }}
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        N
      </motion.div>
    </div>
  );
}
