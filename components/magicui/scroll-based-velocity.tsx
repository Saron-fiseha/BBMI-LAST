"use client"

import type React from "react"

import { motion } from "framer-motion"

interface ScrollBasedVelocityProps {
  children: React.ReactNode
  baseVelocity?: number
  className?: string
}

export function ScrollBasedVelocity({ children, baseVelocity = 100, className = "" }: ScrollBasedVelocityProps) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="flex"
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </motion.div>
    </div>
  )
}
