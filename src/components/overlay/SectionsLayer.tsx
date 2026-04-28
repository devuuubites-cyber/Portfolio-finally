import { TextSection } from "./TextSection"
import { SECTIONS } from "@/lib/sections"
import { usePortfolio } from "@/store/portfolio"

/** Renders each section block with markup driven by the user's answers. */
export function SectionsLayer() {
  const data = usePortfolio((s) => s.data)
  if (!data) return null

  const byId = Object.fromEntries(SECTIONS.map((s) => [s.id, s] as const))

  return (
    <>
      <TextSection section={byId.name} anchor="center">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-bone/55 mb-6">
          {byId.name.overline} &middot; portfolio
        </p>
        <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-tight text-bone text-balance">
          {data.name || "Unnamed"}
        </h1>
        {data.skills.length > 0 || data.accomplishments.length > 0 ? (
          <p className="mt-6 font-display italic text-bone/60 text-lg md:text-xl">
            {data.skills[0] ?? "—"} &middot; {data.hobbies[0] ?? "in motion"}
          </p>
        ) : null}
      </TextSection>

      <TextSection section={byId.skills} anchor="bottom-left">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-moss mb-4">
          {byId.skills.overline} &middot; craft
        </p>
        <h2 className="font-display text-4xl md:text-6xl leading-tight text-bone mb-6 text-balance">
          What I do.
        </h2>
        <ul className="flex flex-wrap gap-2 max-w-2xl">
          {data.skills.map((skill) => (
            <li
              key={skill}
              className="px-3.5 py-1.5 rounded-full text-sm text-bone bg-moss-deep/25 ring-1 ring-moss/40 backdrop-blur-sm"
            >
              {skill}
            </li>
          ))}
        </ul>
      </TextSection>

      <TextSection section={byId.achievements} anchor="right-middle">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-amber mb-4 text-right">
          {byId.achievements.overline} &middot; selected work
        </p>
        <h2 className="font-display text-4xl md:text-6xl leading-tight text-bone mb-8 text-right text-balance">
          Things I&rsquo;m proud of.
        </h2>
        <ol className="space-y-5 text-right">
          {data.accomplishments.slice(0, 5).map((line, i) => (
            <li key={i} className="flex items-baseline justify-end gap-5">
              <span className="font-display text-amber/90 text-2xl tabular-nums shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-sans text-bone text-base md:text-lg leading-relaxed max-w-xl">
                {line}
              </span>
            </li>
          ))}
        </ol>
      </TextSection>

      <TextSection section={byId.hobbies} anchor="bottom-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-bone/60 mb-4">
          {byId.hobbies.overline} &middot; off the clock
        </p>
        <h2 className="font-display italic text-4xl md:text-6xl leading-tight text-bone mb-6 text-balance">
          When the work stops.
        </h2>
        <ul className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          {data.hobbies.map((h) => (
            <li
              key={h}
              className="px-3.5 py-1.5 rounded-full text-sm text-bone bg-ink/40 ring-1 ring-bone/15 backdrop-blur-sm"
            >
              {h}
            </li>
          ))}
        </ul>
      </TextSection>

      <TextSection section={byId.closing} anchor="center">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-bone/55 mb-6">
          {byId.closing.overline} &middot; arrival
        </p>
        <p className="font-display italic text-3xl md:text-5xl text-bone leading-tight text-balance">
          Thanks for walking with me.
        </p>
        <p className="mt-6 font-sans text-bone/60 text-sm tracking-wide">
          &mdash; {data.name || "the author"}
        </p>
      </TextSection>
    </>
  )
}
