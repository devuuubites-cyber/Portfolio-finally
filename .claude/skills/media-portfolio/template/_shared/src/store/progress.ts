/**
 * Shared scroll progress, kept OUTSIDE React state on purpose so updates at
 * 60fps never re-render the component tree. Subscribers (camera, overlays)
 * read .target / .current directly inside requestAnimationFrame loops.
 */
export const progress = {
  /** Raw normalized scroll position (0..1), driven by wheel/touch/keys. */
  target: 0,
  /** Eased value the scene actually uses. Lerped toward target each frame. */
  current: 0,
}

const listeners = new Set<(p: number) => void>()

let rafId: number | null = null
let lastEmitted = -1

function tick() {
  // Notify React-side observers only when the eased value moves enough that
  // a re-render becomes meaningful (overlay opacity / progress bar).
  if (Math.abs(progress.current - lastEmitted) > 0.001) {
    lastEmitted = progress.current
    listeners.forEach((fn) => fn(progress.current))
  }
  rafId = requestAnimationFrame(tick)
}

export function startProgressBus() {
  if (rafId !== null) return
  rafId = requestAnimationFrame(tick)
}

export function stopProgressBus() {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
}

export function subscribeProgress(fn: (p: number) => void): () => void {
  listeners.add(fn)
  fn(progress.current)
  return () => {
    listeners.delete(fn)
  }
}
