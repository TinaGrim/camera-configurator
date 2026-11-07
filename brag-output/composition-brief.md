# Hyperframes Composition Brief: MIRAGE — Camera Atelier

## Objective

Create a short launch-style brag video for **MIRAGE**, a 3D camera shop configurator.

## Output

- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: **vertical — 1080x1920**
- Duration: **21.2 seconds**

Vertical is deliberate, not a default: the product is a portrait, mobile-first experience
(`h-dvh`, bottom-anchored product bar, top-left product card, top-right spec pill, corner cart
bag). A landscape frame would require redesigning a UI that only exists in portrait. Vertical also
plays natively on mobile without letterboxing.

## Source Material

- Project root: `/Users/grim/Documents/Workspace/program/Web/camera-configurator`
- Primary files read:
  - `index.html` (title `MIRAGE — Configure your camera`, Fraunces + Inter via Google Fonts)
  - `src/App.jsx` (landing, the 5-step shell, `Landing` component with the real headline)
  - `src/index.css` (the full `@theme` token set, gold gradient, stage vignette, grain, hairlines)
  - `src/data/cameras.json`, `src/data/accessories.json` (real names, specs, prices, discounts)
  - `src/utils/pricing.js` (the real discount + totals math)
  - `src/components/` — `ProductInfo`, `ProductBar`, `ModelSwitcher`, `AccessoryPicker`,
    `ProgressSteps`, `CartIcon`, `QuantityStepper`, `BottomCTA`, `PriceRoll`, `InvoiceSummary`,
    `TelegramHandoff`, `ImageCard`, `StepShell`
  - `public/stage/*.png`, `public/thumbs/*.png` (the product's own renders and thumbnails)
- Product name: **MIRAGE** (`MIRAGE · Camera Atelier`)
- Tagline / strongest claim: **"High afford. Pretty price, pretty quality."** with **"From $280"**

### Copy that must appear verbatim

- `MIRAGE · Camera Atelier`
- `High afford.`
- `Pretty price, pretty quality.`
- `From $280`
- `Tap anywhere to begin.`
- `Mirage` (wordmark, top-left, with the gold period)
- `Stage` · `Camera` · `Kit` · `Review` · `Sent` (progress rail)
- `THE BODY` / `Aurora X7` / `Matte Black`
- `24MP Full-Frame Sensor` → on model swap → `33MP Stacked CMOS · 8K`
- `Back`
- Rail: `01 −15% $410` / `02 −10% $460` / `03 −15% $280` / `04 $199`
- `$348.50`, `$410.00` (struck), `You save $61.50`
- `YOUR KIT` / `Vintage Leather Backpack` / `Woven Shoulder Strap` / `Leather Wrist Keychain` / `Locking Lens Cap` / `$149` / `$29` / `$19` / `$12`
- `Kit $29`, `Kit $41`
- `Continue`
- `THE ORDER` / `Invoice` / an order id
- `Camera` / `Accessory` rows, `−15%`
- `Subtotal` `$451.00` / `Discount` `−$61.50` / `Total` `$389.50`
- `Send to shop chat`
- `Order ready` (with *ready* in the gold gradient italic)
- `MIRAGE` (final lockup)

## Creative Direction

- Tone preset: `polished`
- Creative direction: *luxury camera-house product film, played dead straight; the copy does the smiling*
- Interpretation: Serious, elegant, slow-revealed. Confidence through restraint — 5 scenes, soft
  0.6-0.8s crossfades, serif display type, gold hairlines, generous negative space, one product
  event per beat. The typography is expensive and the numbers underneath it are aggressively
  cheap. Nothing winks; the contrast does all the work. That only works if every figure and spec
  string on screen is exactly what the app says.
- Angle: A luxury product film played completely straight. The camera house is staged like a
  jewelry boutique — near-black, warm gold light, Fraunces serif, film grain, "Atelier" in the
  eyebrow — and then the real numbers appear: 24MP Full-Frame Sensor, 33MP Stacked CMOS · 8K, total
  $389.50. The signature moment is the app's own animation: an accessory's thumbnail chip peels off
  its card, arcs over the frame, and drops into the shopping bag, which bumps.
- Hook: the real landing headline in the real display serif on the real dark stage — **"High afford."**
  then, a beat later in gold gradient italic, **"Pretty price, pretty quality."**
- Outro / punchline: the invoice recedes; a gold ring draws itself, the check lands, and the real
  handoff headline sets — **Order *ready*** — followed by the `MIRAGE` lockup between two gold
  hairlines, held a beat in the dark, then fade to black.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Invented numbers, invented specs, or approximate prices (see the arithmetic contract below)
  - The app's real Telegram URL, chat id, or any config/credential file

## Arithmetic contract (must be exact — the joke depends on it)

```
Aurora X7                 $410.00  −15%  →  $348.50
+ Woven Shoulder Strap     $29.00
                          --------          $377.50
+ Locking Lens Cap         $12.00
                          --------          $389.50   ← Total

Subtotal (pre-discount)  $410 + $29 + $12  =  $451.00
Discount                 410 × 0.15        =  −$61.50
```

## Visual Identity

- Background: `#0a0a0c` (warm `#12110f`, panels `#16161a` / `#1d1d23`)
- Text: `#f4f1ea` ink · muted `#9d968a` · faint `#6b665e`
- Accent: `#e2b877` gold · deep `#b98a45` · soft `rgba(226,184,119,0.13)`
- Gold gradient (verbatim `--color-gold`): `linear-gradient(120deg, #f0d9a8 0%, #e2b877 45%, #b98a45 100%)`
- Hairline: `rgba(255,255,255,0.08)`; gold hairline rule fades transparent → gold → transparent
- Display font: **Fraunces** (variable; `font-variation-settings: 'opsz' 72`; italic for gold lines)
- Body font: **Inter** (400/500/600/700)
- Eyebrow style: `0.7rem`, weight 600, `letter-spacing: 0.28em`, uppercase
- Stage light (verbatim from `.stage-vignette`):
  `radial-gradient(120% 90% at 50% 12%, rgba(226,184,119,0.07), transparent 55%)` over
  `radial-gradient(90% 70% at 50% 118%, rgba(0,0,0,0.55), transparent 60%)`
- Grain: the app's 5%-opacity SVG `feTurbulence` overlay
- Visual references from the project: the product card (`THE BODY` / name / color), the spec pill
  with its chevron, the 4-up model rail with gold discount pills, the accessory picker cards, the
  right-edge 3-slot progress rail, the round cart bag with a gold count badge, the glass-panel
  product bar with the rolled price, the invoice card, and the gold CTA with its halo pulse.

### Product imagery — use the project's own files, already copied to `assets/img/`

| File | Source | Use |
|---|---|---|
| `assets/img/stage-aurora-x7.png` | `public/stage/aurora-x7.png` (1536²) | Body on stage, scenes 1-2 |
| `assets/img/stage-vela-pro.png` | `public/stage/vela-pro.png` (1536²) | Body on stage after the Vela Pro tap |
| `assets/img/stage-drift-mini.png` | `public/stage/drift-mini.png` (1536²) | Optional stage swap |
| `assets/img/thumb-aurora-x7.png` … `thumb-nova` | `public/thumbs/*.png` (256²) | Model rail cards |
| `assets/img/thumb-leather-keychain.png`, `thumb-lens-cap.png`, `thumb-shoulder-strap.png`, `thumb-leather-backpack.png` | `public/thumbs/*.png` | Accessory cards + flying chips |

The stage renders are square product images. Present them in a soft-edged card with the app's own
layered treatment (dark back plate → thin gold ring → dark bezel, exactly as `ImageCard.jsx` does it)
rather than as a raw full-bleed photograph — that keeps the hero consistent with the real image-mode
card in the app. Blend the render into the dark stage with a soft mask and the warm radial light
behind it; do not let a visible square edge read as a pasted photo.

## Storyboard

Use `brag-output/brag-plan.md` as the creative contract. Scene summary:

1. **The Stage** — 4.00s (0.00→4.00) — black stage, warm gold light rises, Aurora X7 render fades
   up; `MIRAGE · Camera Atelier`; **"High afford."** then the gold italic *"Pretty price, pretty
   quality."*; gold hairlines draw around `From $280`; `Tap anywhere to begin.`; cursor taps.
2. **The Body** — 4.74s (4.00→8.74) — app chrome resolves (product card, spec pill, progress rail,
   cart bag, product bar); the 4 model cards arrive one at a time; cursor taps **Vela Pro** → body
   swaps to the Vela render, spec pill re-reads `33MP Stacked CMOS · 8K`, price rolls
   **$348.50 → $414.00**; cursor taps **Aurora X7** → rolls back; `Continue` presses.
3. **The Kit** — 4.37s (8.74→13.11) — progress to `Kit`, rail swaps to the accessory picker, card
   reads `YOUR KIT`; 4 accessory cards arrive; cursor adds **Woven Shoulder Strap** → chip flies
   into the bag, badge 2, `Kit $29`, price **$377.50**; then **Locking Lens Cap** → badge 3,
   `Kit $41`, price **$389.50**; `Continue` presses.
4. **The Invoice** — 4.36s (13.11→17.47) — stage dims to 16%, invoice card springs up; rows arrive
   one at a time; hairline draws; `Subtotal $451.00` → `Discount −$61.50` → **Total $389.50** in
   gold serif with one emphasis pulse; `Send to shop chat` with its halo; cursor presses.
5. **Order Ready** — 3.73s (17.47→21.20) — invoice recedes; gold ring draws, check lands;
   **Order *ready***; `MIRAGE` lockup between gold hairlines; hold; fade to black at 20.75s.

## Audio

- Audio role: warm, restrained bed under a luxury film.
- Audio arc: one bed runs the full 21.2s at a single low level. Five restrained interaction cues sit
  exactly on the real taps and landings. One deep bell punctuates the invoice total. A final bell
  rings out as the music drops away under the lockup.
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (117.36s, ~109.96 BPM)
- Music treatment: no fade-in — the film opens on music already playing. Constant `0.30` through
  scene 4; dip to `0.20` under the scene-5 lockup so the final bell rings over it; hard fade to
  silence across the last 0.35s.
- Music cue guidance: bundled preset copied to
  `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`
  (rich schema: `beats` + `strongCues`).
  - **1-3 strong cue locks (±0.15s), all three on scene boundaries:**
    **8.74s**, **13.11s**, **17.47s** (each a `strong_beat`, intensity ≥ 0.99). Mark `// beat-locked`.
  - **Beat-grid windows (±0.10s) for sequential events** (beat ≈ 0.55s):
    - S1: 0.56, 1.09, 2.19, 3.27, 3.82
    - S2: 4.91, 5.34, 6.00, 6.56, 7.09, 7.64, 8.19
    - S3: 8.74, 9.83, 11.46, 12.55
    - S4: 13.64, 14.20, 14.73, 15.29, 15.84, 16.38, 16.93, 17.20
    - S5: 17.98, 18.56, 19.66, 20.75
  - Restraint note: `polished` tone. No per-beat sparkle ticks, no dense percussion. The grid only
    seats real UI events.
- Audio-reactive treatment: **subtle**. The warm gold stage light behind the body and the gold halo
  behind the CTA breathe a few percent with the music's RMS. Follow the `hyperframes-creative`
  audio-reactive guidance for extraction and synchronous sampling. If extraction is unavailable
  (no helper, or ffmpeg missing), skip it, document the skip, and do not block the render. No
  waveform bars, no note graphics, no visible beat pulse.
- Audio-coupled moments:
  - Scene 2 — each simulated tap → a click at the press; a soft drop as the price roll settles
  - Scene 3 — each chip flight → a soft rise and a landing thud in the bag, synced to the impact
  - Scene 4 — the Total's emphasis pulse → one deep resonant bell; the CTA press → one click
  - Scene 5 — the lockup → the payoff bell, ringing out as the music drops
- SFX selection guidance: match the visible action, prefer low HF-risk files for the repeated UI
  moments. Suggested character (Hyperframes picks the exact files):
  - tap / press → `interface/click_002.ogg`, `interface/click_003.ogg`, `interface/click_005.ogg`
    (all low HF risk) or `ui/click2.ogg`
  - price / card settling → `interface/drop_001.ogg`
  - chip flight landing in the bag → `impact/impactSoft_medium_001.ogg` (warm, low HF risk)
  - invoice total + final lockup → `impact/impactBell_heavy_000.ogg` (deep resonant, medium risk)
- SFX analysis guidance: `brag/assets/sfx/sfx-analysis.md` (full picks table by use case, HF-risk
  flags, family summary). Low-risk picks are called out in that file; the invoice is the busiest
  visual moment in the video, so it gets exactly one bell and one click, not a rhythm.
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density, and volume based on the
  implemented animation. Copy any selected SFX into `assets/sfx/...` from
  `/Users/grim/.agents/skills/brag/assets/sfx/`.
- Audio files: music and cue JSON are already in `assets/music/`.
- Track allocation: music on one low track index; every overlapping SFX on its own ascending track
  index. Never share a track index between overlapping audio.

## Hyperframes Instructions

Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract
+ `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats,
audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli`
(lint/check/render). `/brag` is its own workflow: do **not** enter the `hyperframes` entry-point
intent interview and do **not** route into its generic promo / launch-video workflow. Prefer native
Hyperframes conventions over anything in `/brag`.

Requirements:

- Standalone composition, root `data-composition-id` matching the `window.__timelines` key,
  `data-width="1080" data-height="1920"`, `data-duration="21.2"`, one paused timeline.
- Show real UI, copy, and imagery at every step. At least four distinct real UI surfaces (product
  card + spec pill, model rail, accessory picker, invoice card) plus the real landing headline and
  the real handoff headline.
- Keep all text readable in the final render. Every line must reach its 0.8s/0.3s-per-word settled
  hold before it moves.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer.
- Beat-lock exactly three major tweens (8.74, 13.11, 17.47) and mark them `// beat-locked`; snap
  sequential events to the listed `beats[]` within ±0.10s and mark them `// beat-grid`.
- Audio-reactive: subtle RMS breathing on the stage light and the CTA halo, or documented skip.
- Use local assets only. Paths are relative to `composition/` — never absolute.
- Fonts: ship local `woff2` files for Fraunces and Inter with in-file `@font-face` rules (a named
  CSS `font-family` without a local `@font-face` fails lint). Files are in `assets/fonts/`.
- No secrets in the composition: no Telegram URL, no chat id, no tokens, no `src/config/*`.
- Run `hyperframes check` before render — brag's single gate.
