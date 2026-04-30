# Architecture

Why each piece of each template variant exists. Read before modifying any
template files.

## Common to all variants

### Scroll bus (`src/store/progress.ts`)

Native vertical scroll on a tall invisible spacer is the source of
truth. `progress.target` is the raw normalized value; `progress.current`
is the eased value the camera/video reads. Both live outside React state
so 60 fps updates don't re-render the tree. A single `requestAnimationFrame`
loop emits to subscribed listeners only when `current` moves more than
0.001 since the last emit — keeps overlay re-renders bounded.

### Pointer bus (`src/store/pointer.ts`)

Same pattern, used for camera parallax in `3d-walk`. Mutated by
`useScrollDriver` from `pointermove`.

### `useScrollDriver` (`src/hooks/useScrollDriver.ts`)

Listens to `scroll` and `pointermove`, normalizes against
`document.documentElement.scrollHeight - window.innerHeight`, writes to
`progress.target` and `pointer`. The 600vh spacer in `App.tsx` is what
gives the browser scroll distance to drive the timeline.

### Onboarding modal

A Radix dialog that captures portfolio data on first run and persists it
to localStorage via zustand's `persist` middleware. Stays mounted; opens
automatically when `data === null`. The skill can pre-seed localStorage
during scaffolding so the modal never appears.

## `3d-walk`-specific

### Texture cache (`CityModel.tsx`)

`useLoader.preload()` is intentionally NOT called. R3F's loader cache
keys on `[loader, ...urls]` only — the extension callback isn't part of
the key. Preloading at module load would cache the OBJ *without*
`setMaterials` being called, leaving every mesh on white materials. The
session in which this skill was authored hit and fixed exactly this bug;
preserving the pattern is non-negotiable.

### Phong → Basic swap

OBJ files generally come with Phong materials. The Twinkling Glade
project's textures are baked palettes — Phong's lighting math muddies
them. We replace each material with a `MeshBasicMaterial` that copies
the texture map, color, alpha, and side. Lighting becomes irrelevant;
the baked palette reads as intended.

### `SKY_MATERIAL_NAMES`

Sky materials live on a giant cube ~320 units from the origin — far past
the scene fog (5..35) which would otherwise swallow the sky into ink.
The `SKY_MATERIAL_NAMES` set lists the material names whose `fog` flag
must be false. The default set covers the Twinkling Glade city; for new
models the analyzer reports any material whose bbox extends past the fog
far plane and the skill adds those names to the set.

### Camera path (`src/lib/cameraPath.ts`)

A `CatmullRomCurve3` through hand-tuned waypoints on the road
centerline. The road is *not* straight in this model; the centerline
shifts X positive as Z goes negative. The analyzer produces the
waypoints by per-Z-slice scanning of the `road` material's bounding
box; we take ~7 samples and smooth with `tension: 0.5`. `LOOK_AHEAD`
on the curve gives the camera something to point at without computing a
tangent.

## `video-scrub`-specific

### `currentTime` binding

The native `<video>` element is positioned full-bleed (`object-fit:
cover`), `preload="auto"`, `muted`, `playsInline`. The component
subscribes to the same `progress` bus and assigns
`video.currentTime = progress.current * VIDEO_DURATION` on every emit.
No `play()` is called — we drive frames by setting `currentTime`.

This requires the source video to be *seekable*, which means:
- Encoded with `faststart` (moov atom at the front).
- Keyframe interval ≤ 1s for smooth scrubbing.
- The skill's `analyze-video.py` warns if the video's keyframe interval
  is too long; the user is told to re-encode with
  `ffmpeg -g 30 -movflags +faststart`.

### Sections layer

Same `TextSection` component as `3d-walk`, same `SECTIONS` array. The
overlay is rendered on top of the scrubbed video; the `display-edge`
text shadow keeps copy readable against any frame.

## `cinematic-reveal`-specific

### Frozen scroll math

The arrays in `App.tsx` like
`[0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1]` are the result of careful
hand-tuning. **Do not modify them.** They produce:

- `clipPath` ellipse rises from 0% to 55% radius across `[0, 0.08]`,
  holds, never closes.
- Title text fades + un-blurs in across `[0.03, 0.08]`, holds until
  `0.15`, fades + blurs out across `[0.15, 0.22]`, returns at `[0.90, 1]`.
- Orbit rises from a 330×140 small ellipse to a 650×650 circle across
  `[0.15, 0.25]`, holds, returns to small at `[0.85, 0.95]`.
- Orbit translateX shifts to `-targetRadius` (650) so the gallery
  centers off-axis during the open phase.
- `focusStrength` rises from 0 to 1 during the open phase — the orbit
  items scale-curve based on their distance from the focal point at
  50% along the path.

If the user wants different timing they can edit the arrays themselves;
the skill should warn that hand-tuning these is a rabbit hole.

### `OrbitImages` component

Maps motion paths over SVG strings via `offsetPath` /
`offsetDistance` / `offsetRotate`. Accepts Framer Motion `MotionValue`s
as overrides so the parent can drive radius / rotation / item-size /
translation from a single `useScroll` source. Supports 10 path shapes
(ellipse, circle, square, rectangle, triangle, star, heart, infinity,
wave, custom). The default for cinematic-reveal is `ellipse`.

The component contains a counter-rotation wrapper around each item so
the items don't rotate with the gallery.

### Liquid glass

A `.liquid-glass` utility class layered on top of normal Tailwind. The
gradient border is masked via `mask-composite: exclude` against a
`linear-gradient(#fff 0 0)` content-box mask — the standard way to draw
a gradient border without painting the inner content.

It is the **only** glassmorphism the skill ships by default, and only
in this variant. Plain `.glass` from the 3d-walk variant is a different
recipe.

### Animated heading

`<AnimatedHeading text="…">` splits into spans with per-character
`transitionDelay` of
`lineIndex * line.length * charDelay + charIndex * charDelay` ms.
Spaces are preserved with ` ` so flexbox doesn't collapse them.
Multi-line via `\n` split, each line wrapped in
`<div className="flex flex-wrap justify-center">`. Fires after `delay`
ms via `setTimeout`.

### FadeIn

Single-prop wrapper: `<FadeIn delay={ms}>`. Toggles opacity 0 → 1 after
`delay` via `setTimeout`. `transitionDuration` defaults to 800ms.

### Tailwind v4 over v3

This variant uses Tailwind v4 because:
1. `@theme` blocks let us put font CSS vars next to the color tokens
   without a config file.
2. `@tailwindcss/vite` removes the postcss step entirely.
3. The variant pulls in `motion/react` and lucide-react and intentionally
   *does not* pull in shadcn primitives — the cinematic style doesn't use
   them.

Because it diverges so much from the v3 templates, it does not consume
the `_shared/` files. It ships with its own minimal set of components.
