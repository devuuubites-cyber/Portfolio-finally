import { useEffect, useMemo } from "react"
import { useLoader } from "@react-three/fiber"
import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"

// Asset URLs are absolute against import.meta.env.BASE_URL so they resolve
// correctly under a GitHub Pages project subpath (e.g. /Portfolio-finally/).
const MODEL_URL = `${import.meta.env.BASE_URL}models/city/city.obj`
const MTL_URL = `${import.meta.env.BASE_URL}models/city/city.mtl`

/**
 * Loads the gameboy-palette city street, then walks every material:
 *  - swaps Phong → Basic so baked palette colors aren't muddied by lighting
 *  - applies NearestFilter so pixel-art textures stay crisp
 */
export function CityModel(props: JSX.IntrinsicElements["group"]) {
  const materials = useLoader(MTLLoader, MTL_URL)
  const obj = useLoader(OBJLoader, MODEL_URL, (loader) => {
    materials.preload()
    ;(loader as OBJLoader).setMaterials(materials)
  })

  const scene = useMemo(() => obj.clone(true), [obj])

  useEffect(() => {
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      const replaced = mats.map((m) => convertToBasic(m))
      node.material = Array.isArray(node.material) ? replaced : replaced[0]
      node.frustumCulled = true
      node.castShadow = false
      node.receiveShadow = false
    })
  }, [scene])

  return (
    // Model space is roughly ±320 units; rotation/scale tuned so the long
    // axis runs into -Z (the camera walks in that direction).
    <group {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

function pinTexture(tex: THREE.Texture | null | undefined) {
  if (!tex) return
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.anisotropy = 1
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
}

function convertToBasic(src: THREE.Material): THREE.Material {
  // Already basic? Just pin its textures.
  if (src instanceof THREE.MeshBasicMaterial) {
    pinTexture(src.map)
    pinTexture(src.alphaMap)
    return src
  }

  const phong = src as THREE.MeshPhongMaterial
  const basic = new THREE.MeshBasicMaterial({
    map: phong.map ?? null,
    color: phong.color ?? new THREE.Color(0xffffff),
    transparent: phong.transparent,
    alphaTest: phong.alphaTest || 0,
    opacity: phong.opacity,
    side: phong.side,
    alphaMap: phong.alphaMap ?? null,
  })
  basic.name = phong.name
  pinTexture(basic.map)
  pinTexture(basic.alphaMap)
  src.dispose()
  return basic
}

useLoader.preload(MTLLoader, MTL_URL)
useLoader.preload(OBJLoader, MODEL_URL)
