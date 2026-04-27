import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePortfolio } from "@/store/portfolio"

export function Navbar() {
  const open = usePortfolio((s) => s.openOnboarding)
  const data = usePortfolio((s) => s.data)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 md:px-8 pt-4">
      <nav className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5">
        <a
          href="#"
          className="flex items-center gap-2.5 text-bone hover:text-bone transition-colors"
          aria-label="Home"
        >
          <span className="block h-2 w-2 rounded-full bg-moss" aria-hidden />
          <span className="font-display text-base tracking-tight">
            twinkling glade
          </span>
        </a>

        <div className="flex items-center gap-1">
          {data && (
            <span className="hidden sm:inline font-sans text-[11px] uppercase tracking-[0.3em] text-bone/45 mr-3">
              {data.name}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={open}
            aria-label={data ? "Edit info" : "Begin"}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>{data ? "edit info" : "begin"}</span>
          </Button>
        </div>
      </nav>
    </header>
  )
}
