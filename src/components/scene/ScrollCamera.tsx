import { useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import { cameraPath, LOOK_AHEAD, SCROLL_LERP } from "@/lib/cameraPath"
import { progress } from "@/store/progress"
import { pointer } from "@/store/pointer"
import { clamp } from "@/lib/utils"

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

/**
 * Drives the camera each frame:
 *   1. ease raw scroll target → smoothed `progress.current`
 *   2. position = curve.getPointAt(current); lookAt = curve.getPointAt(current + LOOK_AHEAD)
 *   3. add tiny sin breathing for life
 *   4. add subtle mouse parallax via camera rotation offset
 *
 * All vectors are pre-allocated to avoid per-frame GC.
 */
export function ScrollCamera() {
  const camera = useThree((s) => s.camera)

  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const breathing = useMemo(() => new THREE.Vector3(), [])

  const baseRotY = useRef(0)
  const baseRotX = useRef(0)
  const mouseRotY = useRef(0)
  const mouseRotX = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const time = performance.now() * 0.001

    // 1. Smooth scroll progress (frame-rate independent enough at typical FPS).
    if (REDUCED) {
      progress.current = progress.target
    } else {
      progress.current = THREE.MathUtils.lerp(
        progress.current,
        progress.target,
        SCROLL_LERP,
      )
    }

    const t = clamp(progress.current, 0, 1)
    const tLook = clamp(t + LOOK_AHEAD, 0, 1)

    // 2. Sample curve.
    cameraPath.getPointAt(t, pos)
    cameraPath.getPointAt(tLook, look)

    // 3. Subtle camera breathing — applied after curve sampling, before lookAt.
    if (!REDUCED) {
      breathing.set(
        Math.sin(time * 0.3) * 0.6,
        Math.sin(time * 0.5) * 0.45,
        0,
      )
      pos.add(breathing)
    }

    camera.position.copy(pos)
    camera.lookAt(look)

    // Capture the path-derived rotation as the baseline, then layer mouse parallax.
    baseRotY.current = camera.rotation.y
    baseRotX.current = camera.rotation.x

    if (!REDUCED) {
      // Smooth approach to mouse target.
      const targetY = pointer.x * 0.05
      const targetX = -pointer.y * 0.03
      mouseRotY.current = THREE.MathUtils.lerp(
        mouseRotY.current,
        targetY,
        Math.min(1, dt * 4),
      )
      mouseRotX.current = THREE.MathUtils.lerp(
        mouseRotX.current,
        targetX,
        Math.min(1, dt * 4),
      )
      camera.rotation.y = baseRotY.current + mouseRotY.current
      camera.rotation.x = baseRotX.current + mouseRotX.current
    }
  })

  return null
}
