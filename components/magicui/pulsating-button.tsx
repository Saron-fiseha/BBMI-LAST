"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"
import * as React from "react"

export interface PulsatingButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  href?: string
}

const PulsatingButton = React.forwardRef<HTMLButtonElement, PulsatingButtonProps>(
  ({ className, children, href, ...props }, ref) => {
    const content = (
      <>
        <motion.div
          className="absolute inset-0 rounded-md bg-current opacity-20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
        <span className="relative z-10">{children}</span>
      </>
    )

    if (href) {
      return (
        <Link href={href}>
          <Button {...props} className={cn("relative overflow-hidden", className)} ref={ref}>
            {content}
          </Button>
        </Link>
      )
    }

    return (
      <Button {...props} className={cn("relative overflow-hidden", className)} ref={ref}>
        {content}
      </Button>
    )
  },
)
PulsatingButton.displayName = "PulsatingButton"

export { PulsatingButton }
