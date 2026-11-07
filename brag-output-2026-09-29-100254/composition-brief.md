# Hyperframes Composition Brief: MIRAGE

## Objective

Create a short launch-style brag video for MIRAGE, a browser-based 3D camera
atelier. The centerpiece is one continuous 3D camera move that pushes from the
marketing hero straight into the live configurator — Scene A (hero) into Scene B
(live camera preview) with no cut — and then keeps going through kit, invoice, and
order handoff.

## Output

- Composition directory: `brag-output-2026-09-29-100254/composition/`
- Rendered video: `brag-output-2026-09-29-100254/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 22.4s

## Source Material

- Project root: `/Users/grim/Documents/Workspace/program/Web/camera-configurator`
- Primary files read: `index.html`, `src/App.jsx`, `src/index.css`,
  `src/components/SceneViewer.jsx`, `src/components/ProductInfo.jsx`,
  `src/components/ProgressSteps.jsx`, `src/components/InvoiceSummary.jsx`,
  `src/components/TelegramHandoff.jsx`, `src/store/useConfiguratorStore.js`,
  `src/utils/pricing.js`, `src/data/cameras.json`, `src/data/accessories.json`
- Deliberately NOT read: `src/config/telegram.js`, `src/utils/telegram.js`
  (credential-adjacent; nothing from them may appear in the video)
- Product name: MIRAGE (wordmark renders as `Mirage.` — period in accent gold)
- Tagline / strongest claim: "High afford. / Pretty price, pretty quality." with
  "From $280"
- Key UI or visual moment to recreate: the configurator stage — a camera body on a
  studio-lit platform with a contact shadow, warm vignette, and idle sway — plus the
  Invoice card whose line items and total are real computed values
- Copy that must appear verbatim:
  - "MIRAGE · Camera Atelier"
  - "High afford."
  - "Pretty price, pretty quality."
  - "From $280"
  - "Tap anywhere to begin"
  - "Stage" / "Camera" / "Kit" / "Review" / "Sent"
  - "The body"
  - "Aurora X7"
  - "Matte Black"
  - "24MP Full-Frame Sensor"
  - "Woven Shoulder Strap"
  - "Locking Lens Cap"
  - "The order"
  - "Invoice"
  - "Send to shop chat"
  - "Order ready"
  - "Mirage."

## The arithmetic must be correct

Every figure is computed exactly as `src/utils/pricing.js` computes it. Do not
invent, round, or "clean up" these values:

| Value | Derivation | On screen |
|---|---|---|
| Aurora X7 list price | `price` | $410.00 |
| Discount | `round(410 * 0.15 * 100) / 100` | −15% / −$61.50 |
| Discounted body | `410 − 61.5` | $348.50 |
| Woven Shoulder Strap | `price` | $29.00 |
| Locking Lens Cap | `price` | $12.00 |
| After strap | `348.5 + 29` | $377.50 |
| After both | `348.5 + 29 + 12` | $389.50 |
| Subtotal row | `410 * 1 + 41` | $451.00 |
| Total row | `348.5 * 1 + 41` | $389.50 |

The three-step price counter in Scene 3 ($348.50 → $377.50 → $389.50) must be
arithmetically consistent with the Invoice in Scene 4.

## Creative Direction

- Tone preset: `polished`
- Creative direction: boutique atelier product film, with one deadpan wink at the
  very end
- Interpretation: luxury restraint. Fewer scenes, longer holds, soft crossfades and
  slides, Fraunces display type carrying the emotion. The camera move carries the
  energy instead of cuts. Confidence through stillness. The only joke is the final
  subtitle, which must land deadpan — no wink, no nudge, no music sting.
- Angle: a fake-luxury boutique camera brand whose entire funnel is one continuous
  stage. The video starts on the marketing hero and flies through the typography into
  the live configurator, then continues — body, kit, invoice, sent. The joke is that
  the marketing claim and the product are the same surface: you are already in the
  shop when the logo lands.
- Hook: black stage, a gold hairline draws, then the headline slams in fast and HOLDS
  — "High afford." with "Pretty price, pretty quality." in gold italic, "From $280"
  between two gold hairlines, "Tap anywhere to begin" at the bottom. A tap ripple
  fires on the word "anywhere" and the camera flies through the type.
- Outro / punchline: CTA press → "Opening Telegram…" → gold check ring blooms →
  "Order ready" with *ready* in gold italic → MIRAGE. lockup between two gold
  hairlines → deadpan subtitle "From $280. No spreadsheet required." → black.
- Avoid:
  - Generic SaaS language ("streamline your workflow", "seamlessly configure")
  - Abstract filler visuals, color washes, generic motion graphics
  - Unrelated visual redesign — this is MIRAGE's palette, type, and stage
  - Rapid flashing or strobing
  - Any bot, chat, account, or Telegram identity

## Visual Identity

- Background: `#0a0a0c`, with a warm radial vignette
  `radial-gradient(120% 90% at 50% 12%, rgba(226,184,119,0.07), transparent 55%)`
  and a floor vignette
  `radial-gradient(90% 70% at 50% 118%, rgba(0,0,0,0.55), transparent 60%)`
- Text: ink `#f4f1ea`, muted `#9d968a`, faint `#6b665e`
- Accent: `#e2b877` (deep `#b98a45`, soft `rgba(226,184,119,0.13)`)
- Panel: `#16161a` at 60–80% opacity with heavy backdrop blur
- Hairline: `rgba(255,255,255,0.08)`
- Gold gradient: `linear-gradient(120deg, #f0d9a8 0%, #e2b877 45%, #b98a45 100%)`
  used as clipped text for the gold italic lines and the total
- Display font: **Fraunces** (serif; the product uses `opsz 72` for display).
  Use the real webfont if the composition runtime allows; otherwise the closest
  available serif fallback. Do not substitute a geometric sans.
- Body font: **Inter** (labels, prices, rail, line items). Real webfont, or closest
  neutral sans fallback.
- Eyebrow style: ~11px, weight 600, `letter-spacing: 0.28em`, uppercase
- Film grain: ~5% opacity turbulence overlay, the product's own `.grain` treatment
- Visual references from the project:
  - the lit stage + contact shadow + ACES filmic tone mapping + idle sway from
    `SceneViewer.jsx`
  - the five-step vertical progress rail with the glowing accent dot and checked
    rings from `ProgressSteps.jsx`
  - the glass product card ("The body" eyebrow + Fraunces name + muted subtitle)
  - the invoice card with the drawn hairline and gold total
  - the gold-hairline rule motif used throughout

## Storyboard

Use the storyboard in `brag-output-2026-09-29-100254/brag-plan.md` as the creative
contract. Scene summary:

1. **Tap anywhere to begin** — 3.6s — hero type staggers up and holds; tap ripple
   fires on "anywhere" at the end.
2. **The stage** — 4.4s — continuous push-through into the live stage; Aurora X7
   resolves under warm key light; rail, product card, and spec pill land in sequence.
3. **The kit snaps on** — 4.4s — cursor adds Woven Shoulder Strap then Locking Lens
   Cap; each physically attaches; price ticks $348.50 → $377.50 → $389.50; rail
   advances to "Kit".
4. **The invoice** — 5.2s — stage dims to 16%, invoice card springs in, rows stagger
   and hold, hairline draws, total rolls to $389.50 in gold, CTA reads
   "Send to shop chat".
5. **Order ready** — 2.8s — CTA press → spinner → gold check ring → "Order ready" →
   MIRAGE. lockup → deadpan subtitle → black.

The Scene 1 → Scene 2 move must read as ONE continuous camera move, not a cut. The
typography should scale past the viewer and dissolve into the depth of the stage as
the camera passes through it. This is the single most important structural
requirement in the video.

## Audio

- Audio role: warm minimal bed under sparse, motion-matched UI sound
- Audio arc: hushed and expectant over the hero type → opens up as the camera enters
  the stage → sits back for the kit interaction → ducks slightly under the invoice →
  one clean resolve on the check ring → fades to near-silence under the deadpan
  subtitle so the joke lands dry
- Music: `assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3`
  (87.6s, ~114.84 BPM)
- Music treatment: fade in from silence over ~0.6s, held low as a bed not a driver,
  duck ~2dB under the invoice's busiest moment, final ~0.8s fade out. Let the
  "Order ready" resolve ring slightly over the tail.
- Music cue guidance: bundled preset available at
  `/Users/grim/.agents/skills/brag/assets/music/cues/happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.json`
  (114.84 BPM). Use **at most 3 strong-cue locks**:
  - `// beat-locked: 3.70s` — the push-through (Scene 1 → 2)
  - `// beat-locked: 8.96s` — first kit attach
  - `// beat-locked: 12.65s` — invoice card spring
  Beat grid for sequential reveals:
  - `// beat-grid: strap at 8.96s, lens cap at 9.50s` (two beats apart — both items
    stay on screen and the price holds afterward)
  - `// beat-grid: invoice rows at 13.18 / 14.22 / 15.28 / 16.34` — snap to every
    *other* beat so each row is readable. Do not put a row on every beat.
  Treat all cue metadata as optional hints. Readability, story, and pacing win.
- Audio-reactive treatment: subtle. Let the track's low-band energy drive only the
  warmth of the stage vignette, the accent glow behind the product card, and the
  presence of the total. No waveform bars, no equalizer, no musical-note graphics,
  no particles, no strobing, no heavy pulsing.
- Audio-coupled moments:
  - Scene 1 tap ripple → tap + air movement; this is the causal sound that the
    Scene 2 camera move responds to
  - Scene 3 kit attaches → two clean mechanical clicks, one per attach, firing at the
    same timestamp as each visual attach
  - Scene 4 invoice rows → soft ticks per row; total gets a settle/roll sound
  - Scene 5 check ring → one clean warm resolve
  - Final subtitle → no sound at all
- SFX selection guidance: match each sound to the actual motion it supports. Card
  sounds for card-like reveals, key/click for the tap and the accessory attaches,
  short dry ticks for the invoice rows, one announcement-style resolve for the
  payoff. Use the lowest high-frequency-risk files for the repeated row ticks and the
  polished accessory clicks, since they repeat and should not get shrill.
- SFX analysis guidance:
  `/Users/grim/.agents/skills/brag/assets/sfx/sfx-analysis.md` (and `.json`) — use
  it during selection.
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and
  volume based on the implemented animation.
- Audio files: music is already copied to `composition/assets/music/`. Copy any
  Hyperframes-selected SFX into `composition/assets/` (or its category subfolder
  matching the existing skill layout).

## Hyperframes Instructions

Load `hyperframes-core` (composition contract + `data-*` timing),
`hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats,
audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and
`hyperframes-cli` (lint/check/render). This is a `/brag` run: do not enter the
`hyperframes` entry-point intent interview and do not route into its generic
promo / launch-video workflow. Prefer native Hyperframes conventions.

Requirements:
- The Scene 1 → Scene 2 push-through must be one continuous camera move, not a cut.
- Show the real UI: the stage with product, the progress rail, the glass product
  card, and the invoice card with correct real arithmetic.
- Keep all text readable in the final render — respect the reading-time floor
  (short label ~0.8s settled; sentence ~0.3s/word, min ~1.2s). Fast in, then HOLD.
- Total duration 20.4s, within 15–25s.
- Include the planned music + SFX layer.
- The deadpan subtitle must land in near-silence.
- Accessibility: no rapid flashing, no strobing; keep text over dark background at
  full opacity for the duration it is on screen.
- Honor `prefers-reduced-motion`-style restraint in the render: the product's own
  reduced-motion mode disables the idle sway, so keep ambient motion very small.
- Use local assets for audio and any runtime/media dependencies.
- Wire at least one visual element subtly to the music (glow / vignette warmth /
  presence), or document the extraction failure.
- Run `hyperframes check` before render — it is brag's single gate.
