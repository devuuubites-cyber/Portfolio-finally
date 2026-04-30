import { useEffect, useRef } from "react"
import { subscribeProgress } from "@/store/progress"

const BASE = import.meta.env.BASE_URL
const VIDEO_URL = `${BASE}media/__SLUG__/source.mp4`
/** Duration of the source video in seconds — patched by the skill from analyze-video.py output. */
const VIDEO_DURATION = __VIDEO_DURATION__

/**
 * Full-bleed background video whose currentTime is bound to scroll progress.
 *
 * Notes:
 *   - We never call play(); frames advance by setting currentTime.
 *   - The video must be encoded with -movflags +faststart and a reasonable
 *     keyframe interval (≤1s) so seeking is responsive. The skill's
 *     analyze-video.py warns at scaffold time when those conditions aren't met.
 *   - preload="auto" pulls bytes early; muted + playsInline keeps mobile happy.
 */
export function ScrubbedVideo() {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    let pending = -1

    const flush = () => {
      raf = 0
      if (pending < 0 || !el.duration) return
      // readyState >= 2 means we have current data — safe to seek.
      if (el.readyState >= 2) {
        el.currentTime = Math.min(VIDEO_DURATION, Math.max(0, pending)) || 0
      }
    }

    return subscribeProgress((p) => {
      pending = p * VIDEO_DURATION
      if (raf === 0) raf = requestAnimationFrame(flush)
    })
  }, [])

  return (
    <video
      ref={ref}
      className="!fixed inset-0 h-full w-full object-cover"
      src={VIDEO_URL}
      preload="auto"
      muted
      playsInline
      autoPlay={false}
      controls={false}
      tabIndex={-1}
      aria-hidden
    />
  )
}
