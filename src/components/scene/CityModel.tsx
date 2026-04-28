import { useEffect, useMemo } from "react"
import { useLoader } from "@react-three/fiber"
import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"

// Asset URLs are absolute against import.meta.env.BASE_URL so they resolve
// correctly under a GitHub Pages project subpath (e.g. /Portfolio-finally/).
const BASE = import.meta.env.BASE_URL
const MODEL_URL = `${BASE}models/city/city.obj`
const MTL_URL = `${BASE}models/city/city.mtl`

/**
 * Loads the gameboy-palette city street and walks every material:
 *  - swaps Phong → Basic so baked palette colors aren't muddied by lighting
 *  - applies NearestFilter so pixel-art textures stay crisp
 *
 * Note: useLoader.preload() is intentionally NOT called here. R3F's loader
 * cache keys on [loader, ...urls] only — the extension callback isn't part
 * of the key. Preloading the OBJ at module load would cache it WITHOUT
 * setMaterials being called, leaving every mesh on white default materials
 * forever (the texture-loss bug we just fixed).
 */
export function CityModel(props: JSX.IntrinsicElements["group"]) {
  const materials = useLoader(MTLLoader, MTL_URL)
  const obj = useLoader(OBJLoader, MODEL_URL, (loader) => {
    materials.preload()
    ;(loader as OBJLoader).setMaterials(materials)
  })

  const scene = useMemo(() => obj.clone(true), [obj])

  useEffect(() => {
    let missingMaps = 0
    let totalMats = 0
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      const replaced = mats.map((m) => {
        totalMats++
        const next = convertToBasic(m)
        if (!(next as THREE.MeshBasicMaterial).map) missingMaps++
        return next
      })
      node.material = Array.isArray(node.material) ? replaced : replaced[0]
      node.frustumCulled = true
      node.castShadow = false
      node.receiveShadow = false
    })
    if (import.meta.env.DEV && missingMaps > 0) {
      console.warn(
        `[CityModel] ${missingMaps}/${totalMats} materials have no .map — ` +
          "check that all map_Kd PNGs in city.mtl exist under /public/models/city/.",
      )
    }
  }, [scene])

  return (
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
