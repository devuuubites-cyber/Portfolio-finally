import { useEffect } from "react"
import { ScrubbedVideo } from "@/components/media/ScrubbedVideo"
import { Navbar } from "@/components/overlay/Navbar"
import { SectionsLayer } from "@/components/overlay/SectionsLayer"
import { ScrollHint } from "@/components/overlay/ScrollHint"
import { ProgressBar } from "@/components/overlay/ProgressBar"
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog"
import { useScrollDriver } from "@/hooks/useScrollDriver"
import { usePortfolio } from "@/store/portfolio"

export default function App() {
  useScrollDriver()

  const data = usePortfolio((s) => s.data)
  const openOnboarding = usePortfolio((s) => s.openOnboarding)
  useEffect(() => {
    if (!data) openOnboarding()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ScrubbedVideo />

      <ProgressBar />
      <Navbar />

      <main className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <SectionsLayer />
      </main>

      <ScrollHint />

      <OnboardingDialog />

      <div aria-hidden className="h-[600vh] w-full" />
    </>
  )
}
