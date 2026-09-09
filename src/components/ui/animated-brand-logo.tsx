"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

export function AnimatedBrandLogo() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      initial={reduceMotion ? false : { opacity: 0, rotate: -7, scale: 0.78, y: 5 }}
      animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 260, damping: 19, mass: 0.72 }
      }
      whileHover={reduceMotion ? undefined : { rotate: -2, scale: 1.055, y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream-50 shadow-[0_4px_16px_rgba(57,35,25,0.10)] ring-1 ring-brown-900/10 sm:size-14"
      aria-hidden="true"
      dir="ltr"
    >
      <Image
        src="/croissant-dar-logo.png"
        alt=""
        width={64}
        height={64}
        priority
        sizes="(min-width: 640px) 56px, 48px"
        className="size-full scale-[1.18] object-contain"
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
        initial={false}
        animate={reduceMotion ? undefined : { x: ["0%", "450%"] }}
        transition={
          reduceMotion
            ? undefined
            : { delay: 0.75, duration: 0.85, ease: "easeInOut" }
        }
      />
    </motion.span>
  );
}
