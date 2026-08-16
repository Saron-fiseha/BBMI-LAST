"use client"
import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"

export function SessionManager() {
  const router = useRouter()
  const pathname = usePathname()
  const idleTimeoutRef = useRef<NodeJS.Timeout>()
  const maxSessionTimeoutRef = useRef<NodeJS.Timeout>()

  const IDLE_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes
  const MAX_SESSION_MS = 8 * 60 * 60 * 1000 // 8 hours

  const logout = async () => {
    try {
      // Clear token client-side first for immediate effect
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (e) {
      console.error("Logout failed", e)
      router.push("/login")
    }
  }

  const resetIdleTimer = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    idleTimeoutRef.current = setTimeout(logout, IDLE_TIMEOUT_MS)
  }

  useEffect(() => {
    // Only run if there is an auth_token cookie
    const hasToken = document.cookie.split('; ').find(row => row.startsWith('auth_token='))
    if (!hasToken) {
      // If we're on a protected route and lose our token somehow, clear timers.
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
      if (maxSessionTimeoutRef.current) clearTimeout(maxSessionTimeoutRef.current)
      return
    }

    // Start max session timer if not already started
    if (!maxSessionTimeoutRef.current) {
        maxSessionTimeoutRef.current = setTimeout(logout, MAX_SESSION_MS)
    }

    // Start/reset idle timer
    resetIdleTimer()

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const handleActivity = () => {
      resetIdleTimer()
    }

    events.forEach(e => document.addEventListener(e, handleActivity))

    return () => {
      events.forEach(e => document.removeEventListener(e, handleActivity))
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
    }
  }, [pathname])

  return null
}
