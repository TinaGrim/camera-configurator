# Brag Plan: MIRAGE — Camera Atelier (TikTok Ad Cut)

## What is this app?

MIRAGE is a 3D camera shop configurator: a single-screen, mobile-first WebGL "atelier" where a
customer picks a camera body, bolts accessories onto the live model, watches the price roll up in
real time, and checks out by sending the finished invoice to the shop's Telegram chat.

## The angle

**A 9:16 ad cut for TikTok.** This is not the brand film — it is a performance creative built to
stop a scroll in the first two seconds and sell a body plus a kit.

The ad's joke is the product's actual contradiction, played completely straight: a jewelry-boutique
presentation (near-black stage, warm gold light, Fraunces serif, film grain, the word "Atelier" in
the eyebrow) wrapped around an ordinary price. The hook is the price, not the luxury. **$348.50**
starts counting at 2.85s and is settled and readable by 3.82s, against a full-frame sensor, and the
viewer's brain has to resolve that. The real UI copy does the selling: the "−15%" badge, "You save
$61.50", the price that rolls up live as a kit is assembled, and the invoice that closes to
**Total $389.50**.

The spine is the app's own signature motion: when an accessory is added, its chip **arcs out of the
card, up over the frame, and drops into the shopping bag**, and the bag bumps. That flight is the
product's personality in one gesture, so it carries the middle of the ad.

Ad-specific, overriding the default film instincts:
- **Sound-off first.** TikTok autoplays muted. The video must read completely with no audio, so every
  beat is carried by type and motion, and the music is a bonus layer, not a dependency.
- **The price is on screen by 3s and settled by 3.8s.** Hold the $348.50 for a full 1.38s.
- **No fake urgency, no fabricated claims.** The only numbers are the app's real arithmetic, and the
  discount is on the body only — never described as a bundle or kit discount, because accessories are
  always full price (`unitPrice = discountedPrice(camera) + accessoriesTotal`,
  `src/utils/pricing.js:28`).

## Hook (first 2-3 seconds)

The real hero copy, the real display serif, the real dark stage — but split so the price lands
before the viewer can swipe:

> **High afford.**

a beat, then in the gold gradient italic:

> *Pretty price, pretty quality.*

and the number itself, in the Fraunces display face at poster scale:

> **$348.50**

"High afford." is a strange two-word phrase to set in a luxury serif — it reads as a glitch, and that
is the hook. The price is the payoff of that glitch. Gold hairlines draw in around the number.

## Key moments (the middle)

- **The body swap.** The real model rail — 01 Aurora X7 −15% $410, 02 Vela Pro −10% $460,
  03 Drift Mini −15% $280, 04 Nova Lite $199 — arrives one card at a time. A cursor taps
  **Vela Pro**: the body on stage swaps, the spec pill re-reads **33MP Stacked CMOS · 8K**, and the
  price rolls $348.50 → $414.00. A real configurator, not a mockup.
- **The kit flight.** The real accessory cards. The cursor adds a **Woven Shoulder Strap** — the chip
  peels off the card, arcs up, and lands in the bag, which bumps; badge 2, `Kit $29`. Then a
  **Locking Lens Cap** flies the same arc: badge 3, `Kit $41`. This is the USP — custom accessories
  — expressed as motion instead of a feature list.
- **The invoice.** The real review card rises: **THE ORDER / Invoice**, a real order id, the camera
  row with its −15% badge, two accessory rows, a drawn hairline, Subtotal **$451.00**, Discount
  **−$61.50** in gold, and **Total $389.50** in the gold gradient serif. Under it, the real gold CTA
  with its slow halo pulse: **Send to shop chat**.

## Outro / punchline

The invoice recedes into the dark stage. A gold ring draws itself, the checkmark lands, and the
product's real handoff headline sets in the display serif:

> Order *ready*

Then the ad lockup, built for the feed — the brand and the reason to tap, held long enough to read
with the caption and the Shop button on screen:

> **MIRAGE** · **From $280**

Two gold hairlines, a long settle, fade to black.

## User flow worth showing

The real five-step flow from `STEPS` in `src/store/useConfiguratorStore.js:4`:
**Stage → Camera → Kit → Review → Sent**, rendered as the app's own vertical progress rail (the real
`ProgressSteps` component, real labels, real current/done/next dot states, the rail sliding up as
steps complete). The video walks it in order, so the viewer sees the actual path a customer takes,
not a feature grid.

## Tone

- Preset: `polished`
- Creative direction: TikTok performance cut — restrained, sound-off legible, price-forward
- Interpretation: this is an ad, so the polished tone is spent on clarity and restraint rather than
  atmosphere. Fewer, longer scenes than a film cut; no jokes that need audio; the only flourish is
  the accessory flight and the gold gradient. Every scene must be fully readable muted. The "click
  here" energy of a hacky performance ad would read as cheap against this product's real craft, so
  the ad wins by looking expensive and being honest about the price.

## Format: vertical — 1080x1920
## Duration: 21.0 seconds

> **Duration note.** The first draft of this plan specified 20s. Planning the settled holds
> honestly — the `$348.50` hero (~1.25s), the invoice Total (~1.0s), and the lockup (~1.05s), plus a
> readable ~0.85s on the Vela Pro price swap — needs 21.0s. Readability is a creative law and 21.0s
> is still inside the 15–25s window, so the cut takes the extra second rather than rushing the
> payoff numbers off screen.

## Visual identity (from the project)

From `src/index.css` `@theme`:

- Background: `#0a0a0c` (with `#12110f` warm variant for the stage floor)
- Panel: `#16161a` / `#1d1d23`
- Accent: `#e2b877`, accent-deep `#b98a45`, accent-soft `rgba(226,184,119,0.13)`
- Gold gradient: `linear-gradient(120deg, #f0d9a8 0%, #e2b877 45%, #b98a45 100%)`
- Text: `#f4f1ea`, muted `#9d968a`, faint `#6b665e`
- Hairline: `rgba(255,255,255,0.08)`
- Stage vignette: `radial-gradient(120% 90% at 50% 12%, rgba(226,184,119,0.07), transparent 55%)`
- Grain: SVG fractalNoise overlay at 0.05 opacity
- Display font: **Fraunces** (`opsz 72`, the `.font-display` rule) — italic used for the gold line
- Body font: **Inter**
- Strongest visual element: the accessory **chip flight into the bag** (ProductBar's `flights`
  animation) and the **gold-gradient price roll** (`PriceRoll` / `.gold-text`)

## Share copy (draft)

Two bodies, one carry-on. Configure the kit, watch the price move.

## Audio direction

- Role: polished bed supporting a sound-off-first ad. Audio is an enhancement layer; the video is
  designed to be fully understood muted.
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (1:58, steady and clean — the
  `polished` track)
- Music treatment: start at 0s, low volume (~0.30) so it never competes with the type; steady
  through the middle; duck slightly under the final lockup; fade to zero by 20.9s.
- Music cue guidance: bundled preset read
  (`assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`).
  Tempo ~110 BPM (beat every ~0.5455s). Strong cues (intensity ≥ 0.9) inside the 21s window:
  8.74, 9.80, 10.93, 13.11, 15.84, 17.47, 18.56, 19.66.
  - **Strong cue lock 1 — 13.11s:** the second accessory chip lands in the bag. The scene's payoff.
  - **Strong cue lock 2 — 18.56s:** `Order ready` sets in as the ring completes.
  - **Strong cue lock 3 — 19.66s:** the ad lockup crossfades in.
  - Beat-lock the price count to **3.82s** (beat 3.8197) so the number finishes arriving on a hit.
  - Beat-grid the hook's three lines onto 0.56 / 1.09; the four model cards onto consecutive beats
    5.34 / 6.00 / 6.56 / 7.09; the four accessory cards onto 10.93 / 11.46 / 12.02 / 12.55; the
    Vela Pro tap and Aurora return onto 8.74 and 9.80.
  - Restraint: three strong locks plus beat-grid alignment, all inside real cues. Readability wins
    over the grid — the 8.74s cue is used for the Vela Pro tap, not the hero, because the hero
    already has its own beat lock at 3.82s and the $414.00 needs a full settled read.
- Audio-reactive treatment: subtle. Let the warm stage vignette and the gold ring on the handoff
  breathe very slightly with music RMS. No waveform, no equalizer, no text scaling on the beat — the
  price must stay rock-steady while it counts.
- SFX posture: sparse and motion-matched, understated — 5 cues total, not per-card. A soft impact on
  the hook arrival, a select click on the Vela Pro tap, one `interface/drop` per accessory landing
  (the two moments the product is showing off), and one deep bell on the gold ring. The model-rail
  and accessory-card entrances are **silent** — beat-grid alignment is enough, and stacking a tick
  on every card would turn a restrained ad into a toy.
- Audio-coupled moments: the Vela Pro tap and the Aurora return; the two accessory chip flights
  (each landing sound fires on the exact frame its chip lands); the handoff ring draw.
- Restraint rule: no SFX on the price itself, in either scene. The number is the payoff — it
  arrives in silence so the eye lands on it, and the bell under the ring is the only celebration.

## Storyboard

### Scene 1 — Hook: High afford. — 2.6s (`0 → 2.6`)
The real landing hero on the real dark stage. Eyebrow **MIRAGE · Camera Atelier** in the gold
`eyebrow` style (uppercase, 0.28em tracking) at 0.30. Then the display-serif line **High afford.** at
0.56, then the gold-gradient italic *Pretty price, pretty quality.* at 1.09. The camera floats up
behind it in the warm stage light. Gold hairlines draw in from 0.30 to 1.00.
Sequential/interaction: yes — three lines settle one after another on consecutive beats, then all
three hold together until the cut (1.09 → 2.6 = 1.5s).
Audio intent: quiet arrival, confident, no rush.
Audio-coupled idea: the three-line sequence is the beat here; music sits under it at low level.
Music: steady, low.
Transition mood: soft → Scene 2

### Scene 2 — The price — 2.6s (`2.6 → 5.2`)
The number. **$348.50** in Fraunces display at poster scale, centered between the two gold
hairlines, with the real eyebrow **24MP Full-Frame Sensor** above it and **Aurora X7** below, plus the
app's real `Was $410` / `You save $61.50` line. This is the ad's thesis in one screen: full-frame,
discounted, today.
Sequential/interaction: yes — the odometer counts up to 348.50 and **locks at 3.82 on a beat**, then
holds **1.38s settled** so it can be read with the sound off. This hold is the most important timing
decision in the ad, and the `Was $410` / `You save $61.50` pair lands at 4.10 beneath it.
Audio intent: the payoff beat. Deliberately silent under the number.
Audio-coupled idea: the counter ticks; the final digit locks to beat 3.8197.
Music: steady.
Transition mood: clean → Scene 3

### Scene 3 — The body swap — 5.2s (`5.2 → 10.4`)
The real model rail arrives: four cards on consecutive beats at 5.34 / 6.00 / 6.56 / 7.09, each with
its real thumbnail, its −15%/−10% badge, its `0N` index, and its real price. The progress rail is
visible on the right, on **Camera**. At **8.74** a cursor taps **Vela Pro**: the card border goes
gold, the on-stage body swaps, the spec pill re-reads **33MP Stacked CMOS · 8K**, and the price rolls
$348.50 → $414.00. At **9.80** the cursor returns to **Aurora X7** and the price rolls back to
$348.50, so the ad's hero price is the one the viewer last sees.
Sequential/interaction: yes — four cards snap in on the beat grid, each held ≥0.5s and the full set
held from 7.09 onward (3.3s), then two cursor taps are simulated with a real price roll each.
Audio intent: tactile — this is the app responding to a real input.
Audio-coupled idea: a select click exactly on the 8.74 tap; the 9.80 return is silent so the second
interaction does not double up on the first.
Music: steady with a touch more presence.
Transition mood: clean → Scene 4

### Scene 4 — The kit flight — 4.6s (`10.4 → 15.0`)
The signature moment. Progress rail advances to **Kit**. The real accessory grid: **Leather Wrist
Keychain $19**, **Locking Lens Cap $12**, **Woven Shoulder Strap $29**, **Vintage Leather Backpack
$149**, arriving on beats 10.93 / 11.46 / 12.02 / 12.55. At 12.98 the cursor adds the **Woven
Shoulder Strap**: the chip peels off its card, arcs up over the frame, and drops into the bag, which
bumps at **13.11**; badge → 2, `Kit $29`. At 13.60 the cursor adds a **Locking Lens Cap**; its chip
flies the same arc and lands on beat 14.20; badge → 3, `Kit $41`.
Sequential/interaction: yes — this scene is entirely interaction. Two full chip flights, each
landing exactly on its landing sound and on a beat.
Audio intent: satisfaction. This is the product's personality — the flight should feel like the app
enjoying itself.
Audio-coupled idea: each chip's landing sound fires on the exact frame the chip lands; the badge
increment lands with it.
Music: steady, slightly lifted.
Transition mood: soft → Scene 5

### Scene 5 — The invoice — 3.0s (`15.0 → 18.0`)
The canvas dims to 0.16, the real review card rises: eyebrow **The order**, display-serif
**Invoice**, a real order id, the camera row **Aurora X7 · Matte Black** with its **−15%** badge, two
accessory rows, a drawn hairline, **Subtotal $451.00**, **Discount −$61.50** in gold, and
**Total $389.50** in the gold gradient serif at display scale. Beneath it, the real gold CTA with its
slow halo pulse: **Send to shop chat**. The cursor presses it at 17.85.
Sequential/interaction: yes — the rows stagger in as a group (15.54 / 15.70 / 15.86) and hold, then
the Total lands at 16.93 and scales once (1 → 1.06 → 1). The line items appear together, not one
per beat — they are read as a set. The Total holds 1.07s.
Audio intent: resolution.
Audio-coupled idea: the Total's scale pulse is the one accent that takes a beat (16.93); the line
items are not beat-snapped.
Music: present, beginning to duck.
Transition mood: soft → Scene 6

### Scene 6 — Order ready + lockup — 3.0s (`18.0 → 21.0`)
The invoice recedes into the dark stage. The progress rail completes to **Sent**. A gold ring draws
itself from 18.20, the checkmark lands inside it, and at **18.56** the product's real handoff
headline sets in the display serif: **Order *ready***. It holds to 19.60. Then the ad lockup
crossfades in at **19.66**: **MIRAGE** · **From $280** between two gold hairlines, settled 1.09s,
then a long fade to black by 21.0.
Sequential/interaction: yes — ring draws, check lands, headline, then the lockup crossfades in. The
lockup settles a full 1.09s before the fade so it is readable under TikTok's caption and Shop
button, and it sits above the bottom 300px overlay zone.
Audio intent: one deep bell on the ring draw, then the music fades to silence under the lockup.
Audio-coupled idea: the bell is the only celebration; the lockup lands in near-silence.
Music: fading to zero.

**Music mood for this video:** steady, clean, restrained — the `polished` bed at low volume.
**Audio summary:** a low, steady business bed carries the whole ad; five motion-matched cues do the
work — a soft impact on the hook arrival, one select click on the Vela Pro tap, one drop per
accessory landing, and one deep bell resolving the handoff before the bed fades out under the lockup.
The two price numbers land in silence.

**Duration total: 2.6 + 2.6 + 5.2 + 4.6 + 3.0 + 3.0 = 21.0s** ✓ (within 15–25s)

**Readability check (sound-off):** every text line gets its settled floor — the hook's three lines hold
1.5s together, the $348.50 hero 1.38s, the $414.00 swap 1.06s, the invoice Total 1.07s, the lockup
1.09s. The model rail's four cards are held ~0.65s each and the full set stays on screen 3.3s after
the last one, so no card is revealed-and-gone. The invoice's line items arrive as a group and hold,
never one-per-beat.

**Data corrections carried into this cut** (the earlier reference composition got these wrong — do
not reintroduce them):
- Vela Pro is **−10%** (`$460 → $414.00`), not −15%.
- The fourth model card is **Nova Lite**, **Sand**, **$199**, with **no** discount badge.
- The accessory grid order is the real `accessories.json` order: keychain, lens cap, shoulder strap,
  leather backpack — at **$19 / $12 / $29 / $149**.
- The progress rail labels are the real ones: **Stage, Camera, Kit, Review, Sent**.
- The discount is the body's. The `Was $410` / `You save $61.50` pair is the app's own line-item math
  and is labelled as such, never as a kit discount.

**Copy that must appear verbatim (all from the real app):**
- `MIRAGE · Camera Atelier`
- `High afford.`
- `Pretty price, pretty quality.` *(gold gradient italic)*
- `$348.50`
- `24MP Full-Frame Sensor`
- `Aurora X7`
- `Vela Pro` · `33MP Stacked CMOS · 8K` · `$414.00`
- `Woven Shoulder Strap` · `$29` · `Locking Lens Cap` · `$12`
- `The order` · `Invoice` · `Subtotal $451.00` · `Discount −$61.50` · `Total $389.50`
- `Send to shop chat`
- `Order ready`
- `Stage` · `Camera` · `Kit` · `Review` · `Sent`
- `MIRAGE` · `From $280`
