# Anti-defaults

The fonts and aesthetics this skill must avoid unless the user explicitly
opts in. Surface this verbatim during Round 5e.

## Fonts to avoid by default

These read as "AI default sans-soup" and make every site look the same.
Never auto-pick them. If the user wants them, fine — but they must say so.

- Inter (any weight)
- Roboto / Roboto Flex
- Geist / Geist Sans / Geist Mono
- Public Sans
- Noto Sans
- system-ui / `font-sans` Tailwind default
- DM Sans
- Plus Jakarta Sans

**Allowed exceptions** (they share the family but feel intentional):

- *Inter Tight* — only when the user picks a cinematic mood and wants
  a tight modern sans paired with a serif display.
- *IBM Plex Sans / Plex Mono / Plex Serif* — these are distinctive
  enough not to read as default.

## Aesthetics to avoid by default

- Violet → indigo → cyan or fuchsia → purple gradients.
- Default shadcn slate / blue palette (`slate-950`, `blue-500`, etc.).
- Neon glow drop shadows, "✨"/"💫"/"🚀" decorative emoji in copy.
- Generic gradient blobs, "aurora" backgrounds, animated mesh
  gradients used as decoration.
- Rounded-card-with-soft-shadow stacks (the shadcn landing-page
  starter look).
- Default frosted-glass cards (low-contrast white-on-blur).
- Centered-everything layouts with no editorial structure.

## Allowed exceptions (do not auto-apply, only when chosen)

- **Liquid glass** — refined glassmorphism with a 1.4px linear-gradient
  border masked via `mask-composite: exclude`. Implemented as the
  `.liquid-glass` utility in the `cinematic-reveal` template's
  `index.css`. Only ships in that variant; other variants stick to
  the `.glass` utility from the Twinkling Glade pattern.

  ```css
  .liquid-glass {
    background: rgba(0, 0, 0, 0.4);
    background-blend-mode: luminosity;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: none;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }
  .liquid-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.4px;
    background: linear-gradient(180deg,
      rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 20%,
      rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
      rgba(255,255,255,0.1) 80%, rgba(255,255,255,0.3) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  ```

- **Cinematic luxury palette** — black surfaces, off-white reveals
  (`#FDFFB7` accent), Instrument Serif display + Manrope body + Great
  Vibes script. Reserved for `cinematic-reveal`.

## Scope (v1)

The skill **does not yet** support:

- Multiple media at once (3D + video together).
- Self-hosted custom font files (`.woff2` upload). Only npm
  `@fontsource/*` packages and Google Fonts `@import` work.
- Mixing Tailwind v3 and v4 in the same project. Pick a variant and
  stick with it; v3 (3d-walk, video-scrub) and v4 (cinematic-reveal)
  scaffolds are mutually exclusive.

## Round 5e ritual

After locking mood / typography / palette / layout, re-show the lists
above and ask:

> "Anything else AI-coded sites tend to do that you want forbidden in
> this project? Common ones: tracking pixels, cookie banners, generic
> hero copy ('Empower your team to…'), AI-generated stock illustration.
> I'll add them to `.claude/anti-defaults.local.md` so future Claude
> sessions on this repo see them."

Capture additions verbatim into the scaffolded
`.claude/anti-defaults.local.md`.
