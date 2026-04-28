import * as THREE from "three"

/**
 * Camera waypoints in the model's own coordinate space.
 *
 * The OBJ's actual city geometry occupies a tiny volume:
 *   X: -6 .. 9   (width ~15)
 *   Y:  0 .. 14  (height ~14, ground at Y≈0)
 *   Z: -39 .. 1  (length ~40, road runs from front Z=1 → back Z=-39)
 *
 * Camera walks down the street's long axis (+Z → -Z), staying centered on the
 * road (X≈1.5) at eye-level (Y≈2.5). Slight X drift keeps the motion human.
 */
const WAYPOINTS: [number, number, number][] = [
  [0.5, 2.6, 4],     // start: just outside the front of the street
  [1.0, 2.6, -2],
  [-0.4, 2.55, -10],
  [1.6, 2.6, -18],
  [-0.2, 2.55, -26],
  [1.2, 2.6, -33],
  [0.6, 2.6, -41],   // end: past the far edge so arrival feels final
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
