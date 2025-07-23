"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ShinyButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  href?: string
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, children, href, ...props }, ref) => {
    const inner = (
      <>
        {/* sweeping highlight */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/10"
          initial={{ x: "-100%", rotate: -25 }}
          animate={{ x: "200%" }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
        />
        <span className="relative z-10">{children}</span>
      </>
    )

    return (
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
        <Button {...props} className={cn("relative overflow-hidden", className)} ref={ref}>
          {href ? <Link href={href}>{inner}</Link> : inner}
        </Button>
      </motion.div>
    )
  },
)
ShinyButton.displayName = "ShinyButton"

export { ShinyButton }
