---
name: media-portfolio
description: Use when someone asks to build a portfolio site from a 3D model or a video, scaffold a scroll-driven media portfolio, turn an OBJ/GLB into a website, or build a bespoke portfolio centered on a piece of media. Runs an iterative discovery interview (media role, typography, palette, layout) that deliberately avoids AI-default fonts and themes, then generates a Vite+React+TypeScript+Tailwind project tailored to the answers.
argument-hint: [output-dir]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash(npm *), Bash(npx *), Bash(git *), Bash(unzip *), Bash(python3 *), Bash(ffmpeg *), Bash(ffprobe *), Bash(cp *), Bash(mkdir *), Bash(rm *), Bash(ls *), Bash(test *), Bash(file *)
---

## What This Skill Does

Scaffolds a bespoke scroll-driven portfolio website built around a piece of
media — a 3D model (OBJ+MTL or GLB) or a video (mp4/webm). The skill runs a
**conversational interview** that keeps asking clarifying questions until it
understands the user's intent, then writes a fresh Vite + React + TypeScript +
Tailwind project mirroring the architecture in this repo.

This skill has side effects (creates files, runs `npm install`). It is gated
to user invocation only — Claude must not auto-fire it.

## Context to load on demand

These supporting files live alongside SKILL.md. Read them when relevant; they
are NOT preloaded:

- `architecture.md` — why each template piece exists (texture cache, sky-fog
  disable, scroll bus, video scrub math). Read before modifying templates.
- `typography.md` — the curated, mood-indexed font pairings to offer in
  Round 5b. Read before suggesting fonts.
- `anti-defaults.md` — the verbatim list of fonts and aesthetics the skill
  must avoid. Read before Round 5 and surface it to the user.

Output dir: `$ARGUMENTS` if given, otherwise ask.

## Operating principles

1. **Never silently default.** If the user says "you decide" on any visual
   question, present 2–3 concrete options and wait for a pick.
2. **Surface assumptions.** After every round, restate what you heard *and*
   what you're assuming. Ask "anything to correct?" before moving on.
3. **Keep asking until 95% certain.** Discovery is iterative — re-ask
   anything ambiguous; don't paper over gaps.
4. **Anti-defaults are non-negotiable.** Inter-by-default, purple/indigo
   gradients, default-shadcn blue, generic glassmorphism — banned unless
   the user explicitly opts in. See `anti-defaults.md`.

## Steps

### Step 0 — Capture the output dir

If `$ARGUMENTS` is non-empty, use it as the output directory. Otherwise ask
"Where should I scaffold the project? (default: `./media-portfolio`)".
Verify the parent directory exists and the target dir is empty or absent.

### Step 1 — Round 1: Goal & identity

Ask, then echo back what you heard:
- What is the site for? (personal portfolio / studio one-pager / case study /
  launch page / something else)
- Project slug (kebab-case, used for `package.json`, `<title>`, GH Pages
  base path).
- Display name (shown in `<title>`, OG tags, navbar).

### Step 2 — Round 2: Media intake

Ask: "What media will the site be built around — a **3D model** (OBJ+MTL
or GLB), a **video** (mp4/webm), or both?" If "both", note the v1 limitation
(see `anti-defaults.md` Scope) and ask them to pick one.

Capture file paths. Validate with `Bash(test -f <path>)`. If the file is
missing, re-ask. For 3D, also capture the textures folder path. For video,
ask the expected runtime and aspect ratio.

### Step 3 — Round 3: Media role (branching question)

Ask *how* the media should be used. Read these options aloud:

For **3D models**:
- a) **Walkable scene** — camera flies along a path, content fades in at
  depth markers (the Twinkling Glade pattern).
- b) **Orbit hero** — model in a hero block, slow auto-rotate + cursor
  parallax, content scrolls past *(coming soon — falls back to walk).*
- c) **Anchored set pieces** — model appears in 2–3 specific sections
  *(coming soon — falls back to walk).*
- d) **Background ambient** — model loops behind a normal text site
  *(coming soon — falls back to walk).*

For **video**:
- a) **Scroll-scrubbed full-bleed** — `currentTime` bound to scroll
  progress, content overlays at chosen progress points.
- b) **Cinematic reveal** — looping background video, a scroll-driven
  `clipPath` ellipse opens to expose an orbit gallery overlay, with
  scroll-bound typography timelines (per-character animated heading,
  liquid-glass surfaces, Framer Motion). Premium luxury landing page.
- c) **Pinned hero loop** — silent autoplay loop in a hero, page scrolls
  past *(coming soon — falls back to scrub).*
- d) **Cuts at section boundaries** — video advances to specific timestamps
  per section *(coming soon — falls back to scrub).*
- e) **Background ambient** — full-bleed muted loop behind a text layout
  *(coming soon — falls back to scrub).*

The chosen role determines which `template/<variant>/` directory gets
copied. Implemented variants in v1:
- `3d-walk` (3D option a) — Tailwind v3, R3F, the Twinkling Glade pattern.
- `video-scrub` (video option a) — Tailwind v3, native `<video>` +
  shared scroll bus.
- `cinematic-reveal` (video option b) — **Tailwind v4** via
  `@tailwindcss/vite`, Framer Motion (`motion/react`), Instrument
  Serif + Manrope + Great Vibes via Google Fonts, ships the
  `OrbitImages`, `AnimatedHeading`, `FadeIn` primitives and the
  `liquid-glass` utility class. Scroll math values in this variant
  are **frozen** — see `architecture.md`.

Other roles route to the closest implemented variant and the skill must
inform the user of the substitution before proceeding.

### Step 4 — Round 4: Page content

Ask:
- Name, role/title, contact (email or link).
- Skills (comma-separated).
- Accomplishments (one per line).
- Hobbies/interests (comma-separated).
- Optional: section count + custom section titles. Default sections are
  `name / skills / achievements / hobbies / closing`.

For **3d-walk only**: offer "skip — let the onboarding modal collect this
at first run" as a valid answer (the modal is wired in the template).

### Step 5 — Round 5: Visual direction

Read `anti-defaults.md` and load `typography.md`. Surface the avoid-list to
the user verbatim:

> "I'm going to avoid: Inter / Geist / system-sans as the body font;
> purple-indigo or cyan-violet gradients; default shadcn blue;
> glassmorphism unless you ask for it; generic blob/aurora backgrounds;
> rounded-card-with-soft-shadow stacks. Tell me if you want any of those —
> otherwise we'll pick something with more character."

Then ask in order:

**5a — Mood.** One word or phrase: cinematic / editorial-magazine /
brutalist / playful-zine / vintage-print / hand-built-indieweb /
monospaced-terminal / something-else.

**5b — Typography.**
1. "Do you have specific fonts in mind?" If yes, capture display + body.
   The skill will wire them via `@fontsource/*` if the package exists,
   else via Google Fonts `<link>`, else flag that v1 doesn't support
   self-hosted .woff2.
2. If no, present 3 mood-matched pairings from `typography.md` and ask
   the user to pick.
3. Confirm the choice; re-ask if uncertain.

**5c — Palette.**
1. "Do you have specific hex codes?" If yes, capture them.
2. If no, run `scripts/extract-palette.py` against the media and present 3
   candidate palettes (mono / complementary / triadic) derived from the
   dominant colors. User picks one or asks to nudge.
3. Light or dark mode? Background type (flat / textured / noise-grain /
   paper)?

**5d — Layout language.** minimalist-whitespace / dense-editorial-grid /
asymmetric-broken-grid / single-column-longform / split-screen.

**5e — Anti-list confirmation.** Re-show the avoid-list and ask if there
are other AI tropes the user wants forbidden in this project. Add any
additions to a `.claude/anti-defaults.local.md` file in the scaffold so
future Claude sessions on the project see them.

After Round 5 print a written summary of every decision and ask explicitly:
"ship it?" Only proceed on a yes.

### Step 6 — Round 6: Confirmation & assumption surfacing

List every assumption the user did NOT explicitly address. Examples:

- "Assuming GitHub Pages deploy via `.github/workflows/pages.yml`. Say
  `no deploy` to omit."
- "Assuming TypeScript strict mode."
- "Assuming we vendor the media into `public/` rather than fetching from
  a CDN."
- "Assuming the media file is licensed for public web use."

User can override any. Then proceed to execute.

### Step 7 — Analyze the media

Run the analyzer for the chosen media type. Each script writes a JSON
report the next steps read from.

For **3D**:
```
python3 .claude/skills/media-portfolio/scripts/analyze-model.py \
    <obj-path> --textures <textures-dir> --out /tmp/media-portfolio-analysis.json
```
Output includes per-material bounding boxes, recommended camera waypoints,
and the dominant texture colors (forwarded from `extract-palette.py`).

For **video**:
```
python3 .claude/skills/media-portfolio/scripts/analyze-video.py \
    <video-path> --out /tmp/media-portfolio-analysis.json
```
Output includes duration, dimensions, 5 evenly-spaced keyframe paths,
and per-frame dominant colors.

### Step 8 — Scaffold the project

```
npm create vite@latest <slug> -- --template react-ts
cd <slug>
```

Install deps based on chosen role:

- **3d-walk and video-scrub** (Tailwind v3 base):
  - Always: `react react-dom tailwindcss@^3 postcss autoprefixer
    tailwindcss-animate zustand clsx tailwind-merge
    class-variance-authority lucide-react @radix-ui/react-dialog
    @radix-ui/react-slot`.
  - 3d-walk adds: `three @react-three/fiber @react-three/drei @types/three`.
  - video-scrub adds nothing — native `<video>` + shared scroll bus.
  - Fonts: `@fontsource/<chosen-display>` and `@fontsource/<chosen-body>`
    if the packages exist; otherwise a Google Fonts `<link>` in
    `index.html` (document the choice in the project README).
  - Run `npx tailwindcss init -p`.

- **cinematic-reveal** (Tailwind v4 base, do **not** mix with v3):
  - `npm install motion react react-dom lucide-react`
  - `npm install -D tailwindcss @tailwindcss/vite`
  - Wire `@tailwindcss/vite` in `vite.config.ts` (the template ships
    a config that already does this).
  - No `tailwind.config.ts`, no `postcss.config.js` — Tailwind v4 reads
    `@theme` blocks directly from `src/index.css`.
  - Fonts come from a Google Fonts `@import` at the top of
    `src/index.css`. The default cinematic stack is **Instrument
    Serif + Manrope + Great Vibes**, but Round 5b can substitute a
    different mood-matched pair from `typography.md` and the skill
    rewrites the `@import` line and the `--font-*` variables in the
    `@theme` block accordingly.

### Step 9 — Copy templates

1. Copy everything in `.claude/skills/media-portfolio/template/_shared/`
   into the new project (preserving paths).
2. Overlay `.claude/skills/media-portfolio/template/<variant>/` on top.
3. Delete any leftover Vite default files (`src/App.css`, the default
   `src/assets/`, the default `index.html` content).

### Step 10 — Inject project specifics

Edit the scaffolded files:

- `package.json` → set `name` to the slug.
- `index.html` → set `<title>`, `<meta description>`, theme color from the
  chosen palette.
- `tailwind.config.ts` → write `theme.extend.fontFamily.display` /
  `.body` with the chosen fonts and `theme.extend.colors` with the palette
  tokens (`ink`, `bone`, plus mood-specific accent names).
- `src/main.tsx` → import the `@fontsource` CSS files for the chosen
  fonts, OR rely on the Google Fonts link if @fontsource was unavailable.
- `src/index.css` → set `body` background and selection colors from the
  palette.

For **3d-walk**:
- Copy the model into `public/models/<slug>/` (preserving the textures
  folder layout).
- Rewrite `MODEL_URL` and `MTL_URL` in `src/components/scene/CityModel.tsx`
  to point at `models/<slug>/...`.
- Write `src/lib/cameraPath.ts` with the waypoints from the analyzer
  output (replacing the city-street defaults).
- Update `SKY_MATERIAL_NAMES` in `CityModel.tsx` if the analyzer flagged
  custom sky material names; otherwise leave the default set.

For **video-scrub**:
- Copy the video into `public/media/<slug>/`.
- Set `VIDEO_URL` and `VIDEO_DURATION` in
  `src/components/media/ScrubbedVideo.tsx` from analyzer output.

For **cinematic-reveal**:
- Copy the video into `public/media/<slug>/`.
- Rewrite the `<source src="...">` in `src/App.tsx` to point at the
  vendored video (no Cloudinary CDN URL).
- Replace the placeholder `orbitImagesData` array with paths under
  `/orbit/` (or with the analyzer keyframes copied to
  `public/orbit/`). At least 4 images are required; 6 is ideal.
- Replace the brand `<text>` in the corner SVG with the user's display
  name (preserve the `©` superscript pattern).
- Replace the heading copy ("Master the Elements", "embrace") with the
  user's tagline + subhead from Round 4.
- Replace `2K26` / `0651` / "JOIN AN EXCLUSIVE COMMUNITY" / etc. with
  user-supplied edition number, year, and CTA text. If the user
  doesn't provide them, ask in a follow-up round before scaffolding.
- **Do not modify** the scroll-progress arrays in `App.tsx` — the
  numeric values are tuned and frozen (see `architecture.md`).
- If the user picked a different palette in Round 5c, update the
  `--font-*` variables and the inline `fill="#FDFFB7"` brand color
  to match. Body text stays black on the reveal-white surface.

For both: if portfolio content was provided in Round 4, write a one-shot
`<script>` into `index.html` that pre-seeds `localStorage` so the
onboarding modal does not appear on first run.

### Step 11 — Verify

Run, in order:

1. `npm run typecheck` — must exit 0.
2. `npm run build` — must succeed.
3. `npm run dev` (background) — note the localhost URL.

Report a smoke-test checklist for the user:
- Page loads at the URL with no console errors.
- Scrolling moves the camera (3D) or scrubs the video.
- Chosen fonts are visible (no Inter fallback unless they picked it).
- Chosen palette is applied.
- Onboarding modal appears only on first visit (or never, if pre-seeded).

If any step fails, stop and report the error verbatim. Do not "fix it up"
silently — surface the failure so the user can decide.

### Step 12 — Document

Append to the new project's `README.md`:

- Which template variant was used.
- Where to tune the camera path (`src/lib/cameraPath.ts`) or video timing
  (`src/components/media/ScrubbedVideo.tsx`).
- Where palette and fonts live (`tailwind.config.ts`,
  `src/main.tsx`).
- Whether the GH Pages workflow was included.
- The full anti-defaults list, copied from `anti-defaults.md`, so future
  changes to the project respect it.

## Output

A new directory at the user's chosen path containing a working Vite
project with:

- `package.json` (slug, role-specific deps, fonts wired)
- `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`,
  `tsconfig*.json`, `index.html`
- `src/` with the chosen variant's component tree
- `public/models/<slug>/` or `public/media/<slug>/`
- `.github/workflows/pages.yml` (unless user opted out)
- `README.md` with project-specific notes

Working dev server reachable on localhost.

## Notes

- **Stay under 500 lines.** Push detail into supporting files; this file
  is orchestration only.
- **Never run `git commit` or `git push` inside the scaffolded project.**
  Initialization happens but the user owns the first commit.
- **Never auto-publish to GH Pages.** The workflow is wired but only
  fires on push to `main`, which the user controls.
- **No network fetch for templates.** Everything ships in
  `.claude/skills/media-portfolio/template/`. The skill must work
  offline.
- **Validate every file path** before running scripts that touch it.
  Fail loudly on missing media; never write a half-scaffolded project.
- **Hand off cleanly.** End with the localhost URL, the smoke-test
  checklist, and the path to `README.md` for further edits.
