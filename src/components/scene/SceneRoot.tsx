import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import * as THREE from "three"
import { CityModel } from "./CityModel"
import { ScrollCamera } from "./ScrollCamera"
import { SceneLoader } from "./SceneLoader"

const FOG_NEAR = 220
const FOG_FAR = 580

/**
 * Fog distances are large here because the model lives at ~±320 unit scale.
 * The image spec (THREE.Fog("#0a0a0a", 8, 25)) assumes a 1-unit-per-meter
 * scene; we scale those distances proportionally to keep the cinematic
 * "scene end disappears into ink" feel the spec calls for.
 */
export function SceneRoot() {
  return (
    <Canvas
      gl={{ antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      camera={{ fov: 55, near: 1, far: 2000, position: [0, 90, 280] }}
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
