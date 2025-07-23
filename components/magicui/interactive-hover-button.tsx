"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"
import * as React from "react"

export interface InteractiveHoverButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  href?: string
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ className, children, href, ...props }, ref) => {
    const content = (
      <>
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-md"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <span className="relative z-10">{children}</span>
      </>
    )

    if (href) {
      return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link href={href}>
            <Button {...props} className={cn("relative overflow-hidden", className)} ref={ref}>
              {content}
            </Button>
          </Link>
        </motion.div>
      )
    }

    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button {...props} className={cn("relative overflow-hidden", className)} ref={ref}>
          {content}
        </Button>
      </motion.div>
    )
  },
)
InteractiveHoverButton.displayName = "InteractiveHoverButton"

export { InteractiveHoverButton }
