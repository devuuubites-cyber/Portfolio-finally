import { useEffect } from "react"
import { SceneRoot } from "@/components/scene/SceneRoot"
import { Navbar } from "@/components/overlay/Navbar"
import { SectionsLayer } from "@/components/overlay/SectionsLayer"
import { ScrollHint } from "@/components/overlay/ScrollHint"
import { ProgressBar } from "@/components/overlay/ProgressBar"
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog"
import { useScrollDriver } from "@/hooks/useScrollDriver"
import { usePortfolio } from "@/store/portfolio"

export default function App() {
  useScrollDriver()

  // Open the onboarding dialog automatically on a first visit (no persisted
  // data). Runs once after persist has hydrated.
  const data = usePortfolio((s) => s.data)
  const openOnboarding = usePortfolio((s) => s.openOnboarding)
  useEffect(() => {
    if (!data) openOnboarding()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Fixed-layer scene + overlay UI sit at z-0..z-30 */}
      <SceneRoot />

      <ProgressBar />
      <Navbar />

      {/* The overlay layer is non-interactive so the scene receives pointer events.
          Section content can opt-in to pointer-events:auto if it ever needs to. */}
      <main className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <SectionsLayer />
      </main>

      <ScrollHint />

      <OnboardingDialog />

      {/* Tall invisible spacer — gives the browser scroll distance to drive the
          camera. The scene reads scrollY directly, so this is the only thing
          that produces vertical scroll. 600vh ~ 6 viewport heights of room. */}
      <div aria-hidden className="h-[600vh] w-full" />
    </>
  )
}
