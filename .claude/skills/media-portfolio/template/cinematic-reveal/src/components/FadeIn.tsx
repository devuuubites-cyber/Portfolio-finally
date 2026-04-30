import { useEffect, useState } from "react"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  /** Delay before the fade starts (ms). */
  delay?: number
  /** Transition duration (ms). */
  duration?: number
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration = 800,
  className,
}: FadeInProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), delay)
    return () => window.clearTimeout(t)
  }, [delay])

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  )
}
