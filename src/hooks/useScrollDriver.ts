import { useEffect } from "react"
import { progress, startProgressBus, stopProgressBus } from "@/store/progress"
import { pointer } from "@/store/pointer"
import { clamp } from "@/lib/utils"

/**
 * Native vertical scroll feeds the camera's progress target.
 *
 * We rely on a tall invisible spacer (rendered by App) so the browser owns
 * scroll inertia, keyboard nav, mobile momentum, and accessibility — we just
 * read scrollY and normalize it.
 */
export function useScrollDriver() {
  useEffect(() => {
    startProgressBus()

    const compute = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      )
      progress.target = clamp(window.scrollY / max, 0, 1)
    }

    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }

    compute()
    window.addEventListener("scroll", compute, { passive: true })
    window.addEventListener("resize", compute, { passive: true })
    window.addEventListener("pointermove", onPointer, { passive: true })

    return () => {
      window.removeEventListener("scroll", compute)
      window.removeEventListener("resize", compute)
      window.removeEventListener("pointermove", onPointer)
      stopProgressBus()
    }
  }, [])
}
