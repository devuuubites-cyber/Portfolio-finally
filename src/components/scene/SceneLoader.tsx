import { Html } from "@react-three/drei"

export function SceneLoader() {
  return (
    <Html center>
      <div className="flex items-center gap-3 text-bone/60">
        <div className="flex gap-1">
          <span className="block h-2 w-2 bg-moss animate-pulse" style={{ animationDelay: "0ms" }} />
          <span className="block h-2 w-2 bg-moss-deep animate-pulse" style={{ animationDelay: "150ms" }} />
          <span className="block h-2 w-2 bg-moss-dim animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="font-display italic text-sm">loading the street</span>
      </div>
    </Html>
  )
}
