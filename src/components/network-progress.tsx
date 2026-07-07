"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type NetworkProgressStep = {
  id: string;
  label: string;
};

/**
 * NEXUS30 signature element: a "network trace" progress indicator.
 * Each form step is a node; the connecting trace lights up with a
 * Framer Motion pathLength/scale animation as the user advances,
 * echoing the platform's "connection" (nexus) identity.
 */
export function NetworkProgress({
  steps,
  currentIndex,
}: {
  steps: NetworkProgressStep[];
  currentIndex: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : 0.5;

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={currentIndex + 1}
      aria-label={`Qadam ${currentIndex + 1} / ${steps.length}`}
      className="w-full"
    >
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isComplete = i < currentIndex;
          const isActive = i === currentIndex;
          const isLast = i === steps.length - 1;

          return (
            <div key={step.id} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-mono font-medium sm:h-10 sm:w-10",
                    isComplete && "border-accent-teal bg-accent-teal/15 text-accent-teal",
                    isActive && "border-accent-violet bg-accent-violet/15 text-accent-violet",
                    !isComplete && !isActive && "border-white/15 bg-white/[0.03] text-text-muted"
                  )}
                  animate={isActive && !prefersReducedMotion ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={
                    isActive && !prefersReducedMotion
                      ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                      : { duration }
                  }
                >
                  {isActive && !prefersReducedMotion && (
                    <span className="absolute inset-0 -z-10 rounded-full bg-accent-violet/25 animate-pulse-node" />
                  )}
                  {isComplete ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>}
                </motion.div>
                <span
                  className={cn(
                    "hidden max-w-[6.5rem] text-center text-xs leading-tight sm:block",
                    isActive ? "text-text-primary" : "text-text-muted"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="relative mx-1.5 h-[2px] flex-1 overflow-hidden rounded-full bg-white/10 sm:mx-3">
                  <motion.div
                    className="absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r from-accent-violet to-accent-teal"
                    initial={false}
                    animate={{ scaleX: isComplete ? 1 : 0 }}
                    style={{ transformOrigin: "left", width: "100%" }}
                    transition={{ duration, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
