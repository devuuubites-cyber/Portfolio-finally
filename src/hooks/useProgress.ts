import { useEffect, useState } from "react"
import { subscribeProgress } from "@/store/progress"

/**
 * React hook that re-renders only when the eased progress value moves enough
 * to matter at the DOM layer (~0.001). Use sparingly — most overlays should
 * mutate styles imperatively instead.
 */
export function useProgress() {
  const [p, setP] = useState(0)
  useEffect(() => subscribeProgress(setP), [])
  return p
}
