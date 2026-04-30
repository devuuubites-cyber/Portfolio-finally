# Claude rules for this repository

This repo is the Twinkling Glade portfolio (Vite + React + TypeScript +
Tailwind v3 + R3F). It also hosts the **`media-portfolio` skill** — a
reusable scaffold-generator that ships with this repo and can be invoked
from any Claude Code session that has this folder loaded.

## Project conventions

- TypeScript everywhere; strict mode is on. Don't downgrade.
- Tailwind v3 + `tailwindcss-animate` for the live site. Don't pull in v4
  unless you're working inside `.claude/skills/media-portfolio/template/cinematic-reveal/`.
- Imports use the `@/` alias (`baseUrl: "."`, `paths: { "@/*": ["./src/*"] }`).
- Asset URLs use `import.meta.env.BASE_URL` so they keep working under
  the GitHub Pages project subpath.
- The texture-cache fix in `src/components/scene/CityModel.tsx` — never
  reintroduce `useLoader.preload()` for the OBJ. It silently caches
  white materials. See the comment block at the top of the file.

## Available skills

### `/media-portfolio [output-dir]`

Path: `.claude/skills/media-portfolio/SKILL.md`

Triggers: "build a portfolio from this 3D model", "build a portfolio
from this video", "turn this model/video into a website", "scaffold a
scroll-driven media portfolio", "make a portfolio from a video".

What it does: runs an iterative discovery interview (goal, media,
media role, content, mood / typography / palette / layout) and
scaffolds a fresh Vite + React + TypeScript project tailored to the
answers. Three implemented variants:

- **3d-walk** — Tailwind v3 + R3F, the Twinkling Glade pattern.
- **video-scrub** — Tailwind v3, native `<video>` whose `currentTime`
  is bound to scroll progress.
- **cinematic-reveal** — Tailwind v4 + `motion/react`, full-bleed
  background video, scroll-driven `clipPath` ellipse reveal, orbit
  gallery, liquid-glass surfaces, Instrument Serif + Manrope + Great
  Vibes typography stack.

Side effects: writes a new project at the given path, runs
`npm install`, starts a dev server. Never commits or pushes inside the
scaffolded project.

The skill has `disable-model-invocation: true` — Claude must not auto-
fire it. The user invokes via `/media-portfolio`.

## Anti-defaults policy

When making visual changes anywhere in this repo (or in scaffolds the
skill produces), avoid: Inter / Geist / system-sans as the default body
font; violet-indigo or cyan-violet gradients; default shadcn slate-blue;
neon-glow drop shadows; generic glassmorphism; "aurora" backgrounds;
rounded-card-with-soft-shadow stacks. Full list:
`.claude/skills/media-portfolio/anti-defaults.md`.

## Useful files

- `src/components/scene/CityModel.tsx` — texture-cache + sky-fog
  patterns, kept verbatim in the `3d-walk` template.
- `src/lib/cameraPath.ts` — road-centerline waypoints.
- `src/store/progress.ts` — scroll bus, shared between live site and
  every variant of the skill template.
- `Skill builder.md` and `reference.md` — the spec the skill follows.
