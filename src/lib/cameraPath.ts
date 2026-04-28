import * as THREE from "three"

/**
 * Camera waypoints in the model's own coordinate space.
 *
 * Per-material bbox of the OBJ confirms the walkable corridor:
 *   road:        X: -1.0 .. 4.47, Y: 0,        Z: -39 .. 1
 *   wall_panel:  X: -2.5 .. 5.97, Y: 0  .. 7,  Z: -39 .. 1
 *   ceiling:     X: -2.0 .. 8.32, Y: 0  .. 6.10
 *
 * Road centerline is X≈1.7. Walls clamp X to roughly [-1, 4.5] for safety.
 * The camera hugs the centerline (drifts 1.4..2.0) at eye-level Y=2.2 — well
 * under the 6.10 ceiling, well above the Y=0 road. Catmull-Rom would overshoot
 * a wider zigzag into the walls, so the X drift here is deliberately gentle.
 */
const WAYPOINTS: [number, number, number][] = [
  [1.7, 2.2, 5],    // start: just outside the front of the street
  [1.7, 2.2, -3],
  [2.0, 2.2, -10],
  [1.4, 2.2, -18],
  [2.0, 2.2, -26],
  [1.4, 2.2, -33],
  [1.7, 2.2, -41],  // end: past the far edge so arrival feels final
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
