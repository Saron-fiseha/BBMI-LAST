"use client"

import { motion } from "framer-motion"

interface AnimatedShinyTextProps {
  text: string
  className?: string
}

export function AnimatedShinyText({ text, className = "" }: AnimatedShinyTextProps) {
  return (
    <motion.span className={`relative inline-block ${className}`} whileHover={{ scale: 1.02 }}>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent opacity-30"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8 }}
      />
      <span className="relative z-10">{text}</span>
    </motion.span>
  )
}
