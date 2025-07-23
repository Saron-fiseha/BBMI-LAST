"use client"

import type React from "react"

import { motion } from "framer-motion"

interface ShineBorderProps {
  children: React.ReactNode
  className?: string
}

export function ShineBorder({ children, className = "" }: ShineBorderProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
