# Typography

Mood-indexed font pairings for Round 5b. Three options per mood, all
deliberately *non-default*. The skill picks one to demo, then asks the
user to confirm or pick a different one.

For each pairing, the columns are: **display** (headlines, hero) /
**body** (paragraphs, UI labels) / **availability** (`fontsource` if
`@fontsource/<name>` exists; `google` if Google Fonts only; `commercial`
if it's a paid font and we'd substitute a free analogue).

## cinematic-luxury (default for `cinematic-reveal`)

| display | body | script accent | availability |
|---|---|---|---|
| **Instrument Serif** | Manrope | Great Vibes | google |
| Reckless | Inter Tight | Allura | commercial → fontsource (Reckless → Fraunces fallback) |
| Tiempos Headline | Söhne | Pinyon Script | commercial → google (Tiempos → Source Serif 4) |

The `cinematic-reveal` template ships Instrument Serif + Manrope + Great
Vibes by default via Google Fonts `@import`. Round 5b can substitute the
other rows; the skill rewrites the `@import` URL and the `--font-*`
variables in `src/index.css`'s `@theme` block.

## editorial-magazine

| display | body | availability |
|---|---|---|
| **Fraunces** | Söhne | fontsource (display) + google (body fallback: Inter Tight) |
| GT Sectra | Untitled Sans | commercial → google (Source Serif 4 + Work Sans) |
| Editorial New | Authentic Sans | commercial → fontsource (PP Editorial → Fraunces) |

Best when the page is text-heavy and the media plays a quiet supporting
role. Pairs with the `3d-walk` and `video-scrub` variants.

## brutalist

| display | body | availability |
|---|---|---|
| **Space Grotesk** | JetBrains Mono | fontsource |
| Neue Machina | IBM Plex Mono | commercial → fontsource (Neue Machina → Space Grotesk) |
| Archivo Black | IBM Plex Sans | fontsource |

Pairs with monochrome palettes, no rounded corners, no soft shadows.

## vintage-print

| display | body | availability |
|---|---|---|
| **GT Sectra** | Spectral | commercial → google (substitute: Source Serif 4 + Spectral) |
| Tiempos Headline | Tiempos Text | commercial → google (Source Serif 4 + Lora) |
| Recoleta | Crimson Pro | commercial → google (Fraunces + Crimson Pro) |

Pairs with paper-textured backgrounds, off-white surfaces, deep ink.

## playful-zine

| display | body | availability |
|---|---|---|
| **Redaction** | Karla | fontsource (Redaction) + google (Karla) |
| Migra | Söhne Breit | commercial → fontsource (Migra → DM Serif Display) |
| Druk | Inter Tight | commercial → google (Druk → Bebas Neue) |

Pairs with high-contrast accent colors, hand-drawn underlines, cut-paper
collage aesthetics.

## hand-built-indieweb

| display | body | availability |
|---|---|---|
| **IBM Plex Serif** | IBM Plex Sans | fontsource |
| Lora | Public Sans | google (Public Sans is on the avoid list — only when explicitly chosen) |
| Newsreader | iA Writer Quattro | commercial → google (Newsreader + JetBrains Mono) |

Pairs with content-first layouts, no carousels, RSS-friendly typography.

## monospaced-terminal

| display | body | availability |
|---|---|---|
| **JetBrains Mono** | JetBrains Mono | fontsource |
| Berkeley Mono | Berkeley Mono | commercial → fontsource (Berkeley → JetBrains Mono) |
| iA Writer Mono | iA Writer Mono | commercial → fontsource (iA → JetBrains Mono) |

Both display and body in mono. Pairs with terminal greens, amber CRT
accents, ASCII border decorations.

## How the skill picks

1. Round 5a captures the mood.
2. Round 5b reads this file, prints the matching table, and asks the user
   to pick a row (1 / 2 / 3) or paste their own font names.
3. If the chosen pair is `commercial`, the skill substitutes the
   parenthetical fallback and notes the substitution in the project README.
4. The skill writes the chosen pair into:
   - **Tailwind v3 templates** (`3d-walk`, `video-scrub`):
     `tailwind.config.ts` `theme.extend.fontFamily.{display, sans}`
     plus `@fontsource/<name>` imports in `src/main.tsx`.
   - **Tailwind v4 template** (`cinematic-reveal`):
     `@import` URL at the top of `src/index.css` and the
     `--font-serif` / `--font-sans` / `--font-script` variables
     inside `@theme {}`.
