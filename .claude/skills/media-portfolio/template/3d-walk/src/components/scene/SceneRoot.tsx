import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import * as THREE from "three"
import { CityModel } from "./CityModel"
import { ScrollCamera } from "./ScrollCamera"
import { SceneLoader } from "./SceneLoader"

// Fog distances are in the model's own units. The street geometry runs ~40
// units long, so fog 5 → 35 lets the user see a few segments ahead while the
// far end fades cleanly into ink.
const FOG_NEAR = 5
const FOG_FAR = 35

export function SceneRoot() {
  return (
    <Canvas
      gl={{ antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      camera={{ fov: 60, near: 0.05, far: 500, position: [0.0, 2.2, 5] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#050505", 1)
        gl.outputColorSpace = THREE.SRGBColorSpace
        scene.fog = new THREE.Fog("#0a0a0a", FOG_NEAR, FOG_FAR)
      }}
      className="!fixed inset-0"
    >
      <ambientLight intensity={1.0} />
      <hemisphereLight args={["#cfd6c4", "#1a1a18", 0.35]} />
      <Suspense fallback={<SceneLoader />}>
        <CityModel />
      </Suspense>
      <ScrollCamera />
    </Canvas>
  )
}
