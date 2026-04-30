import * as THREE from "three"

/**
 * Camera waypoints in the model's own coordinate space.
 *
 * The road is NOT straight — it curves to the right as it goes deeper.
 * Per a per-Z-slice scan of the road material, the centerline shifts:
 *
 *   Z≈   0  →  X = 0.0
 *   Z≈ -10  →  X = 0.5
 *   Z≈ -18  →  X = 1.7
 *   Z≈ -25  →  X = 1.7
 *   Z≈ -30  →  X = 3.0
 *   Z≈ -35  →  X = 3.5
 *   Z≈ -39  →  X = 3.5  (road terminus)
 *
 * Walls (wall1_panel, X: -2.5 .. 5.97) follow the same curve. A flat path
 * at any single X lands on the centerline only in the middle of the
 * corridor and clips into the right wall by the time the camera reaches
 * Z=-30 — that was the off-center / wall-hugging look in the screenshots.
 *
 * The end waypoint stops just inside the Z=-39 road terminus to avoid
 * punching through the back of the corridor at the end of the walk.
 */
const WAYPOINTS: [number, number, number][] = [
  [0.0, 2.2, 5],    // start: road centerline at the entrance is X=0
  [0.1, 2.2, -2],
  [0.6, 2.2, -10],
  [1.6, 2.2, -18],
  [2.4, 2.2, -25],
  [3.0, 2.2, -30],
  [3.4, 2.2, -35],
  [3.4, 2.2, -38],  // end: just inside the road terminus
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
