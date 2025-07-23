"use client"

import { motion } from "framer-motion"

interface AnimatedGradientTextProps {
  text: string
  className?: string
}

export function AnimatedGradientText({ text, className = "" }: AnimatedGradientTextProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-slate-800 via-slate-600 to-slate-900 bg-clip-text text-transparent animate-pulse ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {text}
    </motion.div>
  )
}
