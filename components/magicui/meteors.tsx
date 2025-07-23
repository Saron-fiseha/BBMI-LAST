"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface MeteorsProps {
  number?: number
}

export function Meteors({ number = 20 }: MeteorsProps) {
  const [meteors, setMeteors] = useState<Array<{ id: number; x: number; delay: number }>>([])

  useEffect(() => {
    const meteorArray = Array.from({ length: number }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setMeteors(meteorArray)
  }, [number])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {meteors.map((meteor) => (
        <motion.div
          key={meteor.id}
          className="absolute w-px h-20 bg-gradient-to-b from-white to-transparent"
          style={{ left: `${meteor.x}%`, top: "-20px" }}
          animate={{
            y: ["0vh", "100vh"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: meteor.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 3,
          }}
        />
      ))}
    </div>
  )
}
