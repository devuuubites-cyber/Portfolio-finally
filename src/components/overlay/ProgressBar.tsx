import { useEffect, useRef } from "react"
import { subscribeProgress } from "@/store/progress"

export function ProgressBar() {
  const fill = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = fill.current
    if (!el) return
    return subscribeProgress((p) => {
      el.style.transform = `scaleX(${Math.max(0, Math.min(1, p)).toFixed(4)})`
    })
  }, [])

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-20 h-px bg-bone/5">
      <div
        ref={fill}
        className="h-full origin-left bg-bone/55"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  )
}
