import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { subscribeProgress } from "@/store/progress"
import { smoothstep } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Section } from "@/lib/sections"

interface TextSectionProps {
  section: Section
  /** How the inner block should anchor on the viewport. */
  anchor?:
    | "center"
    | "top-left"
    | "bottom-left"
    | "bottom-center"
    | "right-middle"
  children: ReactNode
}

/**
 * Lives in the absolute overlay layer. Subscribes to scroll progress and
 * mutates inline styles directly — no React re-renders during the fade.
 *
 * Fade curve:
 *   - rise from 0 → 1 across the first quarter of the zone
 *   - hold near 1 for the middle half
 *   - fall back to 0 across the last quarter
 *   - translateY(20px → 0) tracks the rise; reverses on exit
 */
export function TextSection({ section, anchor = "center", children }: TextSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const span = section.end - section.start
    const riseEnd = section.start + span * 0.25
    const fallStart = section.end - span * 0.25

    const apply = (p: number) => {
      const inUp = smoothstep(section.start, riseEnd, p)
      const outDown = 1 - smoothstep(fallStart, section.end, p)
      const o = Math.max(0, Math.min(1, inUp * outDown))
      // Pre-rise: 20px down. Holding: 0. Falling: drift -10px up.
      const drift = (1 - inUp) * 20 - (1 - outDown) * 10
      el.style.opacity = o.toFixed(3)
      el.style.transform = `translate3d(0, ${drift.toFixed(2)}px, 0)`
      // Pull out of compositing once invisible.
      el.style.visibility = o < 0.01 ? "hidden" : "visible"
    }

    return subscribeProgress(apply)
  }, [section.start, section.end])

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex px-6 md:px-16",
        anchorClass(anchor),
      )}
    >
      <div
        ref={ref}
        className="max-w-3xl will-change-[opacity,transform] display-edge"
        style={{ opacity: 0, transform: "translate3d(0, 20px, 0)", visibility: "hidden" }}
      >
        {children}
      </div>
    </div>
  )
}

function anchorClass(anchor: TextSectionProps["anchor"]) {
  switch (anchor) {
    case "top-left":
      return "items-start justify-start pt-32"
    case "bottom-left":
      return "items-end justify-start pb-28"
    case "bottom-center":
      return "items-end justify-center pb-28 text-center"
    case "right-middle":
      return "items-center justify-end"
    case "center":
    default:
      return "items-center justify-center text-center"
  }
}
