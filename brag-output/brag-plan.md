# Brag Plan: MIRAGE — Camera Atelier

## What is this app?

MIRAGE is a 3D camera shop configurator: a single-screen, mobile-first WebGL "atelier" where a
customer picks a camera body, bolts accessories onto the live model, watches the price roll up in
real time, and checks out by sending the finished invoice to the shop's Telegram chat.

## The angle

A luxury product film played completely dead straight. The camera house is styled like a jewelry
boutique — near-black stage, warm gold light, a Fraunces serif headline, film grain, and the word
"Atelier" in the eyebrow — and then the actual numbers show up: **24MP Full-Frame Sensor**,
**33MP Stacked CMOS · 8K**, and a total of **$389.50**. The comedy is the collision between the
high-ritual presentation and the completely ordinary price, delivered without a wink. Every number,
every spec string, and every line of copy in this video is the product's real text and its real
arithmetic — the joke is that it's all true.

The signature moment is the app's own animation: when you add an accessory, its thumbnail chip
**arcs out of the card, up over the frame, and drops into the shopping bag** in the corner, and the
bag bumps. That flight is the product's personality in one gesture, so it gets a whole scene.

## Hook (first 2-3 seconds)

The real landing headline, in the real Fraunces display serif, on the real dark stage:

> **High afford.**

…then, a beat later, in the gold gradient italic:

> *Pretty price, pretty quality.*

"High afford." is a genuinely strange two-word phrase to set in a luxury serif. It reads as a
mistake, which is the point — it earns the next four seconds. The camera floats up behind it in
the warm stage light while the words settle. Gold hairlines draw in around **From $280**.

## Key moments (the middle)

- **The body swap.** The real model rail — 01 Aurora X7 −15% $410, 02 Vela Pro −10% $460,
  03 Drift Mini −15% $280, 04 Nova Lite $199 — arrives one card at a time. A cursor taps
  **Vela Pro**: the body on stage swaps, the spec pill re-reads **33MP Stacked CMOS · 8K**, and the
  price rolls from $348.50 to $414.00. It is the app being a real configurator, not a mockup.
- **The kit flight.** Four accessory cards. The cursor adds a **Woven Shoulder Strap** — the chip
  peels off the card, arcs up, and lands in the bag, which bumps; badge 2, `Kit $29`, price rolls to
  $377.50. Then a **Locking Lens Cap** flies the same arc: badge 3, `Kit $41`, $389.50.
- **The invoice.** The real review card rises: **THE ORDER / Invoice**, a real order id, the
  camera row with its −15% badge, two accessory rows, a drawn hairline, Subtotal **$451.00**,
  Discount **−$61.50** in gold, and **Total $389.50** in the gold gradient serif. Under it, the
  real gold CTA with its slow halo pulse: **Send to shop chat**.

## Outro / punchline

The invoice recedes into the dark stage. A gold ring draws itself, the checkmark lands, and the
product's real handoff headline sets in the display serif:

> Order *ready*

Then the lockup: **MIRAGE** between two gold hairlines, sitting in the dark a beat too long. Fade
to black.

## User flow worth showing

Entry → key action → result, exactly as the app runs it:

1. **Landing** — "High afford. / Pretty price, pretty quality." / "From $280" / "Tap anywhere to begin."
2. **Camera step** — tap a body in the model rail; the 3D body, the spec pill, and the rolled price
   all respond.
3. **Kit step** — tap accessories; each one physically attaches, the thumbnail chip flies into the
   bag, the bag bumps, the total climbs.
4. **Review** — the invoice builds itself line by line and lands on the total.
5. **Sent** — order handed off to the shop chat.

## Tone

- Preset: `polished`
- Creative direction: *luxury camera-house product film, played dead straight; the copy does the smiling*
- Interpretation: Serious, elegant, and slow-revealed. Confidence comes from restraint — 5 scenes,
  soft 0.6-0.8s crossfades, serif display type, gold hairlines, generous negative space. The
  typography is elegant and the numbers underneath it are aggressively cheap. Nothing on screen
  winks, emoji, or jokes; the joke is entirely in the contrast, which is why every figure and every
  spec string is real.

## Format: vertical — 1080x1920

The product is a portrait, mobile-first experience (`h-dvh`, bottom-anchored product bar, top-left
product card, top-right spec pill, corner cart bag). A landscape frame would force a redesign of a
UI that only exists in portrait. Vertical also renders correctly on mobile, and plays natively in
LinkedIn, X, TikTok, Reels, and Stories without letterboxing.

## Duration: 21.2 seconds

## Visual identity (from the project)

- Background: `#0a0a0c` (warm secondary `#12110f`, panels `#16161a` / `#1d1d23`)
- Accent: `#e2b877` gold, accent-deep `#b98a45`, accent-soft `rgba(226,184,119,0.13)`
- Text: `#f4f1ea` ink, muted `#9d968a`, faint `#6b665e`
- Gold gradient (verbatim from `--color-gold`): `linear-gradient(120deg, #f0d9a8 0%, #e2b877 45%, #b98a45 100%)`
- Display font: **Fraunces** (variable, `opsz 72`, italic for the gold lines)
- Body font: **Inter** (400/500/600/700)
- Strongest visual element: the warm radial stage light —
  `radial-gradient(120% 90% at 50% 12%, rgba(226,184,119,0.07), transparent 55%)` over
  `radial-gradient(90% 70% at 50% 118%, rgba(0,0,0,0.55), transparent 60%)` — plus the 5% film
  grain overlay and the gold hairline rules.

### Product assets to use (real files from `public/`)

- `public/stage/aurora-x7.png`, `public/stage/vela-pro.png`, `public/stage/drift-mini.png` — the
  1536×1536 product renders for the body on stage (these are the app's own rendered product imagery)
- `public/thumbs/*.png` — the exact 256×256 thumbnails the app uses in the model rail, accessory
  picker, and flying chips
- No secrets, keys, endpoints, or real customer data appear. The Telegram target is shown only as
  the app's own on-screen CTA text, never as a URL or chat id.

## Share copy (draft)

MIRAGE is a 3D camera shop: pick the body, bolt the accessories on, watch the price roll, send the
invoice to the chat. Aurora X7, 24MP full-frame, a woven strap and a lens cap — **$389.50**.

## Audio direction

- Role: warm, restrained bed. The audio sits under a luxury film, it doesn't announce itself.
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (steady and clean; the bundled
  track designated for `polished` / `cinematic`)
- Music treatment: starts at 0 at full presence for the first line, sits at a constant low level
  (`0.30`), and dips to ~`0.20` under the final lockup so the last bell can ring out. No fade-in —
  the film opens on music already playing. Hard fade to silence on the last 0.35s.
- Music cue guidance: bundled preset read —
  `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`
  (117.36s, ~109.96 BPM, beat ≈ 0.55s).
  - **1-3 strong cue locks (±0.15s):** scene boundaries at **8.74s**, **13.11s**, and **17.47s**
    (all `strong_beat`, intensity ≥ 0.99). These are the only cue locks in the video.
  - **Beat-grid windows (±0.10s) for sequential events:**
    - Scene 1 type-on/settle: 0.56, 1.09, 2.19, 3.27, 3.82
    - Scene 2 model rail cards: 4.91, 5.34, 6.00, 6.56; the two taps at 7.09 and 7.64
    - Scene 3 accessory cards: 8.74; the two taps at 9.83 and 11.46; continue at 12.55
    - Scene 4 invoice rows: 13.64, 14.20, 14.73; hairline 15.29; subtotal 15.84; discount 16.38;
      total 16.93; CTA press 17.20
    - Scene 5 check ring 17.98; "Order ready." 18.56; MIRAGE lockup 19.66; fade 20.75
  - Restraint note: no per-beat sparkle ticks. The grid is used only to seat real UI events.
- Audio-reactive treatment: subtle. The warm gold stage light behind the body and the gold halo
  behind the CTA breathe very slightly with the music's RMS — a few percent of scale/opacity, no
  waveform bars, no note graphics, nothing that pulses fast enough to compete with the type.
- SFX posture: sparse — 5 cues total, all low/medium HF risk, matched to real interactions.
- Audio-coupled moments: model swap (click on the tap, soft drop on the price landing), chip flight
  (a soft whoosh-free rise, landing thud in the bag), invoice total (one deep resonant bell),
  CTA press (click), final lockup (the payoff bell).
- Restraint rule: nothing percussive or bright may land on top of a line the viewer is still
  reading. The invoice is the busiest visual moment in the video, so it gets exactly one bell and
  one click — not a rhythm.

## Storyboard

### Scene 1 — The Stage — 4.0s (0.00 → 4.00)

Black stage. The warm gold radial light rises from the bottom. The Aurora X7 product render fades up
from 0.96 scale, centered, sitting in the light.

`MIRAGE · Camera Atelier` in gold letter-spaced eyebrow, top-center (0.56s).
`High afford.` in Fraunces, near-white, very large (1.09s) — settles and holds.
`Pretty price, pretty quality.` in the gold gradient, Fraunces italic, below it (2.19s).
Two gold hairlines draw outward from a centered `From $280` (3.27s).
`Tap anywhere to begin.` fades up in faint tracked caps at the bottom (3.82s), and a cursor dot
drifts in and taps the stage.

Sequential/interaction: yes — the headline sets in two beats, the hairlines draw, and a simulated
cursor tap lands at 3.82s.
Audio intent: the room tone of a quiet, expensive room. Establish confidence before any product
claim.
Audio-coupled idea: the eyebrow, headline, and price line each seat on a beat; the cursor tap gets
the click.
Music: steady, clean, understated.
Transition mood: clean → Scene 2

### Scene 2 — The Body — 4.74s (4.00 → 8.74)

The landing overlay lifts away and the app chrome resolves: the top-left product card
(`THE BODY` / `Aurora X7` / `Matte Black`), the top-right spec pill
(`24MP Full-Frame Sensor` with its chevron), the right-edge progress rail (`Stage · Camera · Kit ·
Review · Sent`) with Camera lit gold, the corner cart bag, and the bottom product bar: rolled
price **$348.50**, struck-through $410.00, `You save $61.50`, the model rail, the quantity stepper,
and the gold `Continue` pill.

The four model cards arrive one at a time, each with its gold discount pill and price:
`01 −15% $410 Aurora X7`, `02 −10% $460 Vela Pro`, `03 −15% $280 Drift Mini`, `04 $199 Nova Lite`.

The cursor taps **Vela Pro** (7.09s): the body on stage crossfades to the Vela render, the spec
pill re-reads `33MP Stacked CMOS · 8K`, and the price rolls **$348.50 → $414.00**.
The cursor taps **Aurora X7** (7.64s): it all rolls back. `Continue` presses at 8.19s.

Sequential/interaction: yes — 4 cards arrive in sequence; 2 simulated taps drive real state changes
and real price rolls.
Audio intent: precise, small, mechanical. This is the app being competent.
Audio-coupled idea: a click on each tap, a soft drop as each price roll settles.
Music: unchanged bed.
Transition mood: clean → Scene 3

### Scene 3 — The Kit — 4.37s (8.74 → 13.11)

Progress advances to **Kit**. The model rail is replaced by the accessory picker; the product card
now reads `YOUR KIT`. Four accessory cards arrive: Leather Wrist Keychain $19, Locking Lens Cap $12,
Woven Shoulder Strap $29, Vintage Leather Backpack $149.

The cursor taps **Woven Shoulder Strap** (9.83s). The card takes the gold border. A 32px thumbnail
chip **peels off the card, arcs up and to the right, shrinks, and drops into the cart bag**, which
bumps. Badge → 2. `Kit $29` appears under the price. The price rolls **$348.50 → $377.50**.

The cursor taps **Locking Lens Cap** (11.46s). The same flight, from a different card. Badge → 3.
`Kit $41`. Price rolls **$377.50 → $389.50**. `Continue` presses at 12.55s.

Sequential/interaction: yes — 4 cards in sequence, 2 simulated taps, 2 real chip-flight animations.
Audio intent: the one moment of physical motion in the film. Light, quick, satisfying.
Audio-coupled idea: the chip flight is the audio moment — a soft rise and a landing thud in the bag
on each arrival, both synced to the visual impact.
Music: bed continues, unchanged level.
Transition mood: clean → Scene 4

### Scene 4 — The Invoice — 4.36s (13.11 → 17.47)

The stage dims to 16% behind a glass panel. The real invoice card springs up, centered:

`THE ORDER` (gold eyebrow) / `Invoice` (Fraunces) with an order id at the right.

Rows arrive one at a time, each springing in from 10px below:
- `Camera` — `Aurora X7 · Matte Black` — gold `−15%` — `$410.00`
- `Accessory` — `Woven Shoulder Strap` — `$29.00`
- `Accessory` — `Locking Lens Cap` — `$12.00`

A hairline draws left to right. Then:
`Subtotal $451.00` → `Discount −$61.50` (gold) → **Total $389.50** in the gold gradient Fraunces
at 30px, with a single 1.0 → 1.06 → 1.0 emphasis pulse as it locks.

The gold `Send to shop chat` button sits below with its slow expanding halo ring. The cursor presses
it at 17.20s.

Sequential/interaction: yes — 5 rows in sequence plus a simulated press on the real CTA.
Audio intent: the invoice is the payoff of the whole film. One deep bell on the total, one click on
the press. Nothing else.
Audio-coupled idea: the total's scale pulse is the only emphasis in the scene; it lands with the
bell.
Music: bed continues.
Transition mood: soft → Scene 5

### Scene 5 — Order Ready — 3.73s (17.47 → 21.20)

The invoice recedes and dims. A soft gold ring draws itself and settles; the checkmark inside lands
and holds. Beneath it, the product's real handoff headline in Fraunces:

> Order *ready*

with *ready* in the gold gradient italic. Below, the lockup: `MIRAGE` letter-spaced between two gold
hairlines. Everything holds in the dark for a beat, then fades to black at 20.75s.

Sequential/interaction: no — a single held payoff.
Audio intent: the bell rings out over the music as the music drops away underneath it.
Audio-coupled idea: none beyond the fade.
Music: dips to 0.20 under the lockup, hard-fades on the last 0.35s.
Transition mood: none — fade to black

**Music mood for this video:** polished — steady, warm, understated; a bed, not a theme.
**Audio summary:** One warm bed runs the whole 21 seconds at a single low level, five restrained
interaction cues sit exactly on the real taps and landings, one deep bell punctuates the invoice
total, and a final bell rings out alone as the music drops away under the MIRAGE lockup.

---

## Notes for the composition

- Numbers must stay exact. If the price math drifts anywhere on screen, the joke dies. The chain is:
  Aurora X7 $410 − 15% = $348.50; + Woven Shoulder Strap $29 = $377.50; + Locking Lens Cap $12 =
  $389.50. Subtotal (undiscounted) = $410 + $29 + $12 = **$451.00**. Discount = **−$61.50**.
- The product's real handoff screen has a copy bug ("Thank for your order. We'll shipping your
  order soon."). It is deliberately **not** used in this video — the fix belongs in the app, not in
  a launch video. Flag it to the user separately.
- All renders and thumbnails come from the project's own `public/` folder. Nothing is redrawn or
  invented.
