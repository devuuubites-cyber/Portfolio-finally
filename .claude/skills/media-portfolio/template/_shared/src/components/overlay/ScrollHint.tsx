import { useEffect, useRef } from "react"
import { subscribeProgress } from "@/store/progress"

export function ScrollHint() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return subscribeProgress((p) => {
      const o = Math.max(0, 1 - p * 30)
      el.style.opacity = o.toFixed(3)
      el.style.visibility = o < 0.01 ? "hidden" : "visible"
    })
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center text-bone/55"
      style={{ transition: "none" }}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="font-sans text-[10px] uppercase tracking-[0.5em]">
          scroll to walk
        </span>
        <span className="block h-8 w-px bg-bone/30 animate-pulse" />
      </div>
    </div>
  )
}
