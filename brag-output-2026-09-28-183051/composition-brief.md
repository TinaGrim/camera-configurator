# Hyperframes Composition Brief: MIRAGE — Camera Atelier (TikTok Ad Cut)

## Objective

Create a short **TikTok ad creative** for MIRAGE, a 3D camera configurator. This is a performance
cut for the feed, not a brand film: it must stop a scroll, land the price in the first three seconds,
and read completely with sound off.

## Output

- Composition directory: `brag-output-2026-09-28-183051/composition/`
- Rendered video: `brag-output-2026-09-28-183051/brag.mp4`
- Format: **vertical — 1080x1920**
- Duration: **21.0 seconds** (revised up from the first draft's 20s — the settled holds the creative
  laws require do not fit in 20s without rushing a payoff number off screen; 21.0s is still inside
  the 15–25s window)

## Source Material

- Project root: `/Users/grim/Documents/Workspace/program/Web/camera-configurator`
- Primary files read: `index.html`, `src/index.css`, `src/App.jsx`, `src/data/cameras.json`,
  `src/data/accessories.json`, `src/utils/pricing.js`, `src/store/useConfiguratorStore.js`,
  `src/components/{Landing via App, ProductInfo, ProductBar, ModelSwitcher, AccessoryPicker, InvoiceSummary, ProgressSteps, BottomCTA, TelegramHandoff}.jsx`
- Product name: **MIRAGE** (eyebrow: `MIRAGE · Camera Atelier`)
- Tagline / strongest claim: **High afford. / Pretty price, pretty quality.** — with the real price
  **$348.50** for a 24MP full-frame body, which is the ad's whole argument.
- Key UI moments to recreate:
  1. The **accessory chip flight** — a chip arcs out of its card, up over the frame, and drops into
     the shopping bag, which bumps (`ProductBar.jsx` `flights`, lines 146-174).
  2. The **gold gradient price roll** (`PriceRoll.jsx` + `.gold-text`).
  3. The **invoice card** with its real row structure, drawn hairline, and gold Total
     (`InvoiceSummary.jsx`).
  4. The **vertical progress rail** `Stage → Camera → Kit → Review → Sent`
     (`ProgressSteps.jsx`), which slides as steps complete.
- Copy that must appear verbatim:
  - `MIRAGE · Camera Atelier`
  - `High afford.`
  - `Pretty price, pretty quality.`
  - `$348.50` · `24MP Full-Frame Sensor` · `Aurora X7`
  - `Vela Pro` · `33MP Stacked CMOS · 8K` · `$414.00`
  - `Woven Shoulder Strap` · `$29` · `Locking Lens Cap` · `$12`
  - `The order` · `Invoice` · `Subtotal $451.00` · `Discount −$61.50` · `Total $389.50`
  - `Send to shop chat` · `Order ready`
  - `Stage` · `Camera` · `Kit` · `Review` · `Sent`
  - `MIRAGE` · `From $280`

## Creative Direction

- Tone preset: `polished`
- Creative direction: TikTok performance cut — restrained, sound-off legible, price-forward
- Interpretation: the polished tone is spent on clarity, not atmosphere. Fewer and longer scenes
  than a film cut. Every scene must be fully readable muted, because TikTok autoplays muted. The
  only flourishes are the accessory flight and the gold gradient. The ad wins by looking expensive
  and being honest about the price.
- Angle: a jewelry-boutique presentation (near-black stage, warm gold light, Fraunces serif, film
  grain, "Atelier" in the eyebrow) wrapped around an ordinary price. The hook is the price, not the
  luxury — **$348.50** lands by 3s against a full-frame sensor and the viewer has to resolve that.
  The spine is the accessory chip flight, which is the customizable-accessories USP expressed as
  motion rather than a feature list.
- Hook: **High afford.** (a strange two-word phrase in a luxury serif — it reads as a glitch, which
  is the hook), then the gold italic *Pretty price, pretty quality.*
- Outro / punchline: the gold ring draws, the check lands, **Order *ready*** sets in the display
  serif, then the ad lockup **MIRAGE** · **From $280** between two gold hairlines, held 1.2s.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - **Any claim that the discount applies to the kit.** The discount is on the camera body only;
    accessories are always full price (`src/utils/pricing.js:28`). Never write or show "bundle
    discount" or "up to 15% off" the kit.
  - **Fabricated urgency** — no countdown timers, no fake stock counts, no "17 people viewing".
  - Invented customer counts, review counts, or star ratings.

## Visual Identity

- Background: `#0a0a0c`, stage floor warm variant `#12110f`
- Panel: `#16161a` / `#1d1d23`, hairline `rgba(255,255,255,0.08)`
- Accent: `#e2b877`, accent-deep `#b98a45`, accent-soft `rgba(226,184,119,0.13)`
- Gold gradient: `linear-gradient(120deg, #f0d9a8 0%, #e2b877 45%, #b98a45 100%)`
- Text: `#f4f1ea`, muted `#9d968a`, faint `#6b665e`
- Stage vignette: `radial-gradient(120% 90% at 50% 12%, rgba(226,184,119,0.07), transparent 55%)`
  plus a bottom falloff `radial-gradient(90% 70% at 50% 118%, rgba(0,0,0,0.55), transparent 60%)`
- Grain: SVG fractalNoise overlay at `opacity: 0.05`
- Display font: **Fraunces** — local `@font-face` already in `assets/fonts/_faces.css`; use
  `font-variation-settings: 'opsz' 72` as the project's `.font-display` rule does, and the italic
  face for the gold line
- Body font: **Inter** — local `@font-face` in `assets/fonts/_faces.css`
- Visual references from the project: the accessory chip flight into the bag; the gold-gradient
  price roll; the invoice card with its drawn hairline and gold Total; the vertical progress rail
  with its gold current-dot and check-mark done-states; the gold gradient CTA button with its slow
  halo pulse.

**Vertical-specific note:** 1080x1920 is taller and narrower than the film cut. Compose for it —
the product's own UI is mobile-first and vertical, so the arrangement is native. Keep critical text
inside the middle ~1600px; leave the bottom ~300px clear of essential copy in the final lockup,
since TikTok overlays the caption and Shop button there.

## Storyboard

Use the storyboard in `brag-plan.md` as the creative contract.

1. **Hook: High afford.** — 2.6s (`0 → 2.6`) — eyebrow at 0.30 / `High afford.` at 0.56 / gold
   italic *Pretty price, pretty quality.* at 1.09, gold hairlines drawing in, all three held 1.5s
2. **The price** — 2.6s (`2.6 → 5.2`) — **$348.50** odometer counting up and **locking on the 3.82s
   beat**, with `24MP Full-Frame Sensor` above, `Aurora X7` below and `Was $410` / `You save $61.50`
   underneath, then a full **1.38s settled hold** (most important timing in the ad) — no SFX
3. **The body swap** — 5.2s (`5.2 → 10.4`) — the four real model cards arriving on beats 5.34 / 6.00
   / 6.56 / 7.09, a cursor tap on **Vela Pro** at 8.74 with a select click, the spec pill re-reading,
   the price rolling $348.50 → $414.00 and holding 1.06s, then a silent tap back to **Aurora X7** at
   9.80 returning it to $348.50
4. **The kit flight** — 4.6s (`10.4 → 15.0`) — accessory grid on beats 10.93 / 11.46 / 12.02 / 12.55;
   two full chip flights arcing into the bag (strap at 12.98 landing on the **13.11s strong cue**,
   then lens cap at 13.60 landing on the 14.20s beat), bag bump, badge → 3, `Kit $41`
5. **The invoice** — 3.0s (`15.0 → 18.0`) — canvas dims, the real invoice card rises, rows stagger in
   as a group at 15.54 / 15.70 / 15.86, Total **$389.50** lands at 16.93 and scales once, held 1.07s;
   gold CTA **Send to shop chat** with its halo pulse, pressed by the cursor at 17.85
6. **Order ready + lockup** — 3.0s (`18.0 → 21.0`) — gold ring draws from 18.20, check lands,
   **Order *ready*** sets in on the **18.56s strong cue**, then the **MIRAGE** · **From $280** lockup
   crossfades in on the **19.66s strong cue** and settles 1.09s before the fade to black

Total: **21.0s**

### Locked cue sheet

| Time | Event | Cue |
|---|---|---|
| 0.56 / 1.09 | hook headline / gold italic | beat-grid |
| 3.82 | $348.50 counter locks | beat 3.8197 |
| 5.34 / 6.00 / 6.56 / 7.09 | model cards 1–4 | beat-grid |
| 8.74 | Vela Pro tap (+ select click) | **strong** 0.985 |
| 9.80 | tap back to Aurora X7 | silent by design |
| 10.93 / 11.46 / 12.02 / 12.55 | accessory cards 1–4 | beat-grid |
| 13.11 | strap chip lands in bag (+ drop) | **strong** 0.978 |
| 14.20 | lens-cap chip lands (+ drop) | beat 14.199 |
| 16.93 | invoice Total scale pulse | beat 16.927 |
| 18.56 | `Order ready` sets in | **strong** 0.992 |
| 19.66 | ad lockup crossfades in | **strong** 0.962 |

Three strong-cue locks, all on real high-intensity hits. Every other entrance is beat-grid aligned
within ~0.03s.

## Audio

- Audio role: polished bed supporting a sound-off-first ad. Audio is an enhancement layer; the video
  is designed to be fully understood muted.
- Audio arc: a low steady bed under the whole ad; five motion-matched cues do the work — a soft
  impact on the hook arrival, a select click on the Vela Pro tap, one `interface/drop` per accessory
  landing, and one deep bell resolving the handoff; the bed fades to silence under the final lockup.
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (1:58, steady and
  clean — the `polished` track), already copied into `composition/assets/music/`
- Music treatment: start at 0s, volume ~0.30 so it never competes with the type; steady through the
  middle; duck slightly under the final lockup; fade to zero by 20.9s. Use the `data-automation`
  volume lane if a shape is easier than a single constant gain.
- Music cue guidance: bundled preset read —
  `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`
  (tempo ~110 BPM, beat every ~0.5455s). Strong cues (intensity ≥ 0.9) inside the 21s window:
  **8.74, 9.80, 10.93, 13.11, 15.84, 17.47, 18.56, 19.66**. See the locked cue sheet above.
  - Three strong locks: **13.11s** (strap chip lands), **18.56s** (`Order ready`), **19.66s**
    (lockup). All three are real high-intensity hits, so no lock is being forced.
  - Beat-lock the $348.50 count to **3.82s** so the number finishes arriving on a hit.
  - Beat-grid the hook's three lines (0.56 / 1.09), the four model cards (5.34 / 6.00 / 6.56 / 7.09),
    the four accessory cards (10.93 / 11.46 / 12.02 / 12.55), and the lens-cap landing (14.20).
  - Restraint: if a lock or a grid alignment ever harms a read, drop it. Legibility outranks the cue.
- Audio-reactive treatment: **subtle.** Let the warm stage vignette and the gold ring on the
  handoff breathe very slightly with music RMS. **No waveform, no equalizer, no musical-note
  graphics, and no text scaling driven by the beat** — the price must stay rock-steady while it
  counts. If extraction is unavailable, document it and skip; do not block the render.
- Audio-coupled moments:
  - Scene 3 — select click exactly on the 8.74s Vela Pro tap; the 9.80s return is silent
  - Scene 4 accessory flights — a landing sound on the exact frame each chip lands (13.11, 14.20)
  - Scene 5 — the single Total scale pulse at 16.93 takes a beat; the line items are not beat-snapped
  - Scene 6 ring draw — one deep bell at 18.12
- SFX selection guidance: **5 cues total**, motion-matched, understated, professional.
  `impact/impactSoft_medium_001` on the hook arrival, `interface/select_008` on the Vela Pro tap,
  `interface/drop_002` on each accessory landing, `impact/impactBell_heavy_000` on the ring.
  Available under `composition/assets/sfx/`. **No SFX on the price in either scene** — the number is
  the payoff and should arrive in silence. **No per-card ticks** on the model rail or the accessory
  grid; a tick on every card would turn a restrained ad into a toy, and the beat-grid alignment
  already carries those entrances.
- SFX analysis guidance: `/Users/grim/.agents/skills/brag/assets/sfx/sfx-analysis.md` — prefer
  low/medium high-frequency-risk files for these repeated, polished moments.
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density, and volume based on the
  implemented animation.
- Audio files: music and the pre-copied SFX are already in `<output-dir>/composition/assets/`.
  Music on one low track, each SFX on its own ascending `data-track-index` (music 10, SFX 11+);
  never share a track-index between overlapping audio. Every `<audio>` needs an `id`.
- `assets/music/audio-data.js` exposes `window.MIRAGE_AUDIO` with per-frame music data for 21.2s
  (636 frames at 30fps), which covers the full 21.0s cut. Drive the subtle audio-reactive treatment
  from it.

## Hyperframes Instructions

Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract +
`data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats,
audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli`
(lint/check/render). /brag is its own workflow: do not enter the `hyperframes` entry-point intent
interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes
conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project — this video is
  built almost entirely from the real UI.
- Keep all text readable in the final render, and **legible with sound off**.
- Keep the video within 15–25 seconds (20s planned).
- Include the planned music/SFX layer.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual
  animation exists.
- Major reveals may move toward nearby strong cues within about 0.15s; smaller entrances may align
  to nearby beats within about 0.10s. Use only 1–3 strong cue locks in a 15–25s video.
- Use local assets only — all paths relative to `composition/`, never absolute.
- No secrets, no real customer data, no personal data on screen. The invoice's order id is a
  generated placeholder, which is fine.
- Run `npx hyperframes check` before render — it is brag's single gate, and contrast findings gate
  as errors, not warnings.
