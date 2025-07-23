"use client"

import { motion } from "framer-motion"

interface AuroraTextProps {
  text: string
  className?: string
}

export function AuroraText({ text, className = "" }: AuroraTextProps) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
        {text}
      </div>
      <div className="relative bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-900 bg-clip-text text-transparent">
        {text}
      </div>
    </motion.div>
  )
}
