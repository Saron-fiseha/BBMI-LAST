"use client"

import { motion } from "framer-motion"

interface FlipTextProps {
  text: string
  className?: string
}

export function FlipText({ text, className = "" }: FlipTextProps) {
  return (
    <motion.div
      className={className}
      initial={{ rotateX: 0 }}
      whileHover={{ rotateX: 180 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {text}
    </motion.div>
  )
}
