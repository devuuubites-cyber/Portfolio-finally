import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface PortfolioData {
  name: string
  skills: string[]
  accomplishments: string[]
  hobbies: string[]
}

interface PortfolioState {
  data: PortfolioData | null
  /** True before the user has filled the onboarding form at least once. */
  isOnboardingOpen: boolean
  setData: (data: PortfolioData) => void
  openOnboarding: () => void
  closeOnboarding: () => void
}

export const usePortfolio = create<PortfolioState>()(
  persist(
    (set, get) => ({
      data: null,
      isOnboardingOpen: false,
      setData: (data) => set({ data, isOnboardingOpen: false }),
      openOnboarding: () => set({ isOnboardingOpen: true }),
      closeOnboarding: () => {
        // Don't allow closing if there's no data yet.
        if (!get().data) return
        set({ isOnboardingOpen: false })
      },
    }),
    {
      name: "twinkling-glade-portfolio",
      partialize: (s) => ({ data: s.data }),
    },
  ),
)
