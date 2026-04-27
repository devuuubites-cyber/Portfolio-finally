import * as THREE from "three"

/**
 * Camera waypoints in world space (model is in centimeters; ~640 across).
 * Slight X drift gives a natural "walking" feel; Y stays at eye level.
 * Z marches forward through the street. Tune as you walk the path.
 */
const WAYPOINTS: [number, number, number][] = [
  [0, 90, 280],
  [-12, 92, 200],
  [10, 88, 100],
  [-8, 90, 0],
  [12, 92, -100],
  [-6, 88, -200],
  [4, 90, -310],
]

export const cameraPath = new THREE.CatmullRomCurve3(
  WAYPOINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "catmullrom",
  0.5,
)

/** How far ahead on the curve the camera looks. Larger = smoother turns. */
export const LOOK_AHEAD = 0.02

/** Smoothing factor for raw → eased scroll. Lower = more inertia. */
export const SCROLL_LERP = 0.06

/** Clamp the visible scroll range so users don't run past the path. */
export const PATH_HEAD_PAD = 0.0
export const PATH_TAIL_PAD = 0.0
