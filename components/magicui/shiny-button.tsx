"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"
import * as React from "react"

export interface ShinyButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  href?: string
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, children, href, ...props }, ref) => {
    const content = (
      <>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
        <span className="relative z-10">{children}</span>
      </>
    )

    if (href) {
      return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href={href}>
            <Button
              {...props}
              className={cn(
                "relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold",
                className,
              )}
              ref={ref}
            >
              {content}
            </Button>
          </Link>
        </motion.div>
      )
    }

    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          {...props}
          className={cn(
            "relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold",
            className,
          )}
          ref={ref}
        >
          {content}
        </Button>
      </motion.div>
    )
  },
)
ShinyButton.displayName = "ShinyButton"

export { ShinyButton }