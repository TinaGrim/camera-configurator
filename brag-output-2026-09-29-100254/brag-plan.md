# Brag Plan: MIRAGE

Output dir: `brag-output-2026-09-29-100254/`

## What is this app?

MIRAGE is a browser-based 3D camera atelier: you tap in, pick a camera body, snap
accessories onto the real-time model, watch the price recompute as you build, then
send the finished invoice to a shop's Telegram chat — with no spreadsheet and no
cart page anywhere in the product.

## The angle

A fake-luxury boutique camera brand whose entire funnel is one continuous stage. The
video is a single unbroken 3D push-in: it starts on the marketing hero
("High afford. / Pretty price, pretty quality.") and flies straight through the
typography into the live configurator, then keeps going — body, kit, invoice,
sent. The joke is that the marketing claim and the product are the same surface.
You are already in the shop the moment the logo lands.

Specificity that earns this video:
- Real product copy, verbatim: "High afford.", "Pretty price, pretty quality.",
  "From $280", "Tap anywhere to begin", "Aurora X7", "Matte Black",
  "24MP Full-Frame Sensor", "Woven Shoulder Strap", "Locking Lens Cap",
  "The order", "Invoice", "Send to shop chat", "Order ready".
- **Real arithmetic.** Every number on screen is computed the way `pricing.js`
  actually computes it. Aurora X7 $410 − 15% = $348.50; + Woven Shoulder Strap $29 =
  $377.50; + Locking Lens Cap $12 = **$389.50**. Subtotal $451.00, Discount −$61.50.
  The invoice in the video adds up. That is the single most product-specific thing
  we can show.
- Real funnel labels from the progress rail: Stage · Camera · Kit · Review · Sent.
- Real 3D: the shot is a camera body on a lit studio stage with a contact shadow,
  warm gold key light, and the product's own idle sway — not a flat card.

## Hook (first 2-3 seconds)

Black. A single gold hairline draws. Then the hero headline slams in, fast, and
holds: **"High afford."** with **"Pretty price, pretty quality."** in gold italic
beneath it, and "From $280" between two gold hairlines. The bottom line reads
"Tap anywhere to begin" — and it is a promise the video immediately keeps. The tap
lands on the word "anywhere" and the typography does not cut away; the camera flies
*through* it.

## Key moments (the middle)

1. **The push-through (Scene 2).** One continuous camera move from hero into the live
   stage. The Aurora X7 resolves out of black under a warm key light, contact shadow
   pooling beneath it, while the real progress rail slides in with the accent dot on
   "Camera" and the product card reads "The body / Aurora X7 / Matte Black".
2. **The kit snaps on and the price moves (Scene 3).** A cursor adds a Woven
   Shoulder Strap, then a Locking Lens Cap — each one physically attaching to the
   model, and the price counter ticking $348.50 → $377.50 → $389.50 in step. This is
   the product's actual thesis: configuring *is* the interface.
3. **The invoice (Scene 4).** The stage dims to 16% and the real Invoice card springs
   in, line items staggering, the hairline drawing itself, the discount in gold, and
   the total rolling to **$389.50** in gold display serif. The CTA reads
   "Send to shop chat".

## Outro / punchline

The CTA presses, "Opening Telegram…" spins, a gold check ring blooms, and
"Order **ready**" lands with *ready* in gold italic. Final lockup: MIRAGE. between
two gold hairlines, over the deadpan subtitle: **"No spreadsheet required."**
Cut to black on the last hairline.

The subtitle is deliberately three words. It is the only joke in a restrained film,
and a short line can hold long enough to be read while the music is gone. A longer
"From $280. No spreadsheet required." would have needed a 1.5s hold that Scene 5
could not give it without rushing the lockup — and "From $280" has already landed
in Scene 1, so nothing is lost.

## User flow worth showing

Entry → key action → result, straight from `App.jsx` + the zustand store's
`STEPS = ['landing','choose','customize','review','handoff']`:

1. **Entry** — landing hero, "Tap anywhere to begin", which calls `goto('choose')`.
2. **Key action** — choose the Aurora X7 body, then add kit items on the customize
   step; each attach updates the running total.
3. **Result** — the review step's Invoice with real line items and a real total,
   then `completeOrder()` → handoff → "Order ready".

## Tone

- Preset: `polished`
- Creative direction: boutique atelier product film, with one deadpan wink at the
  very end.
- Interpretation: luxury restraint. Fewer scenes, longer holds, soft crossfades and
  slides, Fraunces display type doing the emotional work. The camera move carries the
  energy instead of cuts. Confidence through stillness — and the only joke is the
  deadpan final subtitle, which must land as straight-faced, not as a wink.

## Format: landscape — 1920x1080
## Duration: 22.4s

## Visual identity (from the project)

- Background: `#0a0a0c` (warm-near-black stage), radial warm vignette
  `rgba(226,184,119,0.07)` at 50% 12%
- Accent: `#e2b877`; deep accent `#b98a45`; accent-soft `rgba(226,184,119,0.13)`
- Text: ink `#f4f1ea`, muted `#9d968a`, faint `#6b665e`
- Panel: `#16161a` at 60–80% with `backdrop-blur`
- Hairline: `rgba(255,255,255,0.08)`
- Display font: **Fraunces** (serif, opsz 72) — used for every headline and the total
- Body font: **Inter** — labels, prices, line items, rail
- Gold gradient (real `.gold-text`): `linear-gradient(120deg,#f0d9a8 0%,#e2b877 45%,#b98a45 100%)`
- Strongest visual element: the actual GLB camera body floating on a studio-lit
  stage — warm HDR environment, `ContactShadows` beneath, ACES filmic tone mapping,
  film grain at 5% over everything. Recreate the *lighting and stage*, not a mockup.

## Share copy (draft)

You don't need a spreadsheet to build a camera.

## Audio direction

- Role: warm minimal bed under restrained, motion-matched UI sound. Luxury showroom,
  not trailer.
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (87.6s, ~114.84 BPM)
- Music treatment: fade in from silence over 0.6s under Scene 1's type, held at a
  low, confident level (bed, not driver), duck ~2dB under the invoice's busiest
  moment, final 0.8s fade out. Let the "Order ready" chime ring slightly over the
  music tail.
- Music cue guidance: bundled preset read —
  `assets/music/cues/happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.json`
  (114.84 BPM). Use exactly **3 strong-cue locks**: the push-through at **3.70s**,
  the invoice card at **12.65s**, and the total at **17.91s**. Beat grid for
  sequential reveals: the two kit attaches at **8.96s** and **9.50s** (two beats
  apart, so both items are on screen together), and the four invoice rows at
  **13.18 / 14.22 / 15.28 / 16.34** — every *other* beat, so each row is readable.
  Never put a row on every beat. Metadata is a hint only; readability wins.
- Audio-reactive treatment: subtle. Let the music's low-band energy drive only the
  warmth of the stage vignette and the accent glow behind the product card and the
  total. No waveform bars, no particles, no strobing.
- SFX posture: sparse-to-moderate and motion-matched. A soft mechanical *click* as
  each accessory attaches, a small tick per invoice row, a soft "roll/settle" as the
  total lands, one clean warm resolve on the check ring. Professional restraint — this
  is a luxury film, not a mobile game ad.
- Audio-coupled moments: hero type entrance (soft, no typing — the words should feel
  set in metal, not keyed); the simulated tap that triggers the push-through (tap +
  whoosh of air as the camera moves); kit attach clicks on the beat grid; invoice
  row ticks; the total's roll; the final resolve.
- Restraint rule: audio must never out-punch the product. No risers, no impacts, no
  whooshes on the invoice rows, and no sound on the "no spreadsheet required" line —
  it should land in near-silence, which is what makes it funny.

## Storyboard

Total 22.4s. Beat locks and beat-grid marks are from the bundled vol-11 preset
(114.84 BPM) and are hints, not constraints.

### Scene 1 — Tap anywhere to begin — 0.00 → 3.70 (3.70s)

Black stage. The warm vignette fades up. A gold hairline draws.

- 0.20 — eyebrow "MIRAGE · Camera Atelier" rises in
- 0.40 — **"High afford."** slams in (0.28s), settles 0.68, HOLDS
- 0.80 — "Pretty price, pretty quality." in gold italic rises in, settles 1.10
- 1.20 — two gold hairlines draw outward, "From $280" settles between them
- 1.60 — "Tap anywhere to begin" fades up at the bottom
- 1.60 → 3.35 — clean hold, nothing moves but a barely-there vignette breath
- 3.35 — tap ripple expands from the word "anywhere"; that word brightens
- 3.70 — SCENE ENDS; the push-through begins

All copy verbatim from `Landing` in `src/App.jsx`. Reading floor: the two headline
lines settle at 1.10 and hold uninterrupted until 3.35 — 2.25s for a 6-word read,
which clears the 0.3s/word floor with room.

Sequential/interaction: yes — the type staggers up, then a tap ripple fires on
"anywhere". The tap is the causal event for Scene 2's camera move.
Audio intent: hushed and expectant. The room is quiet before the move.
Audio-coupled idea: the tap is the sound the camera responds to.
Music: warm sparse bed, faded up under the type.
Transition mood: continuous — no cut. The camera moves *through* the type.

### Scene 2 — The stage — 3.70 → 7.60 (3.90s)

The push-through. This is Scene A into Scene B, and it is one camera move.

- 3.70 — `// beat-locked: 3.70s` — the Three.js camera begins its dolly; the hero
  type scales past the lens and dissolves as depth takes over
- 4.10 — the stage resolves: vignette opens, warm key light blooms up
- 4.35 — the Aurora X7 fades in at center, contact shadow pooling, idle sway begins
- 4.75 — the progress rail slides in from the right, accent dot on "Camera"
- 5.10 — the product card flies in from the left: "The body" / "Aurora X7" / "Matte Black"
- 5.45 — the spec pill lands top-right: "24MP Full-Frame Sensor"
- 5.85 — price appears and rolls $410.00 → $348.50 over 0.6s
- 6.45 → 7.60 — hold; the model sways, the dot breathes on "Camera"

Sequential/interaction: yes — the model is established *before* the UI lands, never
alongside it. The card and pill follow in sequence.
Audio intent: the room opens up. Air movement, then warmth.
Audio-coupled idea: push-through locked to the 3.70s strong cue.
Music: bed opens up, low and warm.
Transition mood: soft — the stage settles, UI takes over → Scene 3

### Scene 3 — The kit snaps on — 7.60 → 12.00 (4.40s)

- 7.60 — rail dot moves "Camera" → "Kit"; "Camera" becomes a checked ring
- 8.10 — the cursor enters frame and travels to the strap chip
- 8.96 — `// beat-grid: strap at 8.96s, lens cap at 9.50s` — the strap swings down
  onto the strap lug; the price starts moving
- 9.50 — the lens cap seats on the lens front
- 9.50 → 10.10 — price rolls $348.50 → $377.50 → $389.50
- 10.25 — both kit chips confirm: "Woven Shoulder Strap $29", "Locking Lens Cap $12"
- 10.70 → 12.00 — hold; the configured kit on stage, price reading $389.50

Sequential/interaction: yes — simulated cursor click per chip, two physical
attachments to the 3D model, and a live price counter that moves in lockstep.
Audio intent: precise and mechanical. Two clean clicks — satisfied, not playful.
Audio-coupled idea: two beats apart, so both items are on screen together and the
price can hold before the next scene.
Music: bed sits back for the interaction.
Transition mood: soft — the stage dims, UI takes over → Scene 4

### Scene 4 — The invoice — 12.00 → 18.40 (6.40s)

- 12.10 — the stage dims to 16% and scales to 0.985 (the product's real dimCanvas)
- 12.65 — `// beat-locked: 12.65s` — the invoice card springs up from the bottom
- 13.18 — `// beat-grid: 13.18 / 14.22 / 15.28 / 16.34` — rows arrive one at a time
  and HOLD: Camera $410.00 −15% · Woven Shoulder Strap $29.00 · Locking Lens Cap
  $12.00 · Subtotal $451.00
- 16.70 — Discount −$61.50 in gold
- 16.95 — the hairline draws itself across the card
- 17.91 — `// beat-locked: 17.91s` — **Total $389.50** in gold display serif, with a
  small scale pulse from the right
- 17.95 → 18.40 — the total holds; the gold CTA "Send to shop chat" is readable

Sequential/interaction: yes — four rows stagger in on every *other* beat so each one
is readable, then the total gets its own locked beat as the last thing to arrive.
Audio intent: quiet competence. Numbers arriving in order, nothing rushed.
Audio-coupled idea: row ticks on the beat grid; a warm settle as the total lands.
Music: bed ducks slightly under the card, then lifts.
Transition mood: soft — CTA press, then the check bloom → Scene 5

### Scene 5 — Order ready — 18.40 → 22.40 (4.00s)

- 18.65 — the CTA presses in (scale 0.97)
- 18.90 — its label becomes a spinner reading "Opening Telegram…"
- 19.20 — the card clears to the handoff state
- 19.40 — a gold-ringed check blooms at center, glow behind it
- 19.55 — **"Order ready"** with *ready* in gold italic
- 20.10 — the MIRAGE. lockup settles between two gold hairlines
- 20.70 — the deadpan subtitle "No spreadsheet required." fades up
- 20.95 → 22.10 — everything holds, music already gone
- 22.10 → 22.40 — fade to black

Sequential/interaction: yes — CTA press, spinner, check bloom, headline, lockup,
subtitle. Each lands and holds; nothing is stacked.
Audio intent: one clean warm resolve at 19.40, then near-silence so the subtitle
lands dry. The deadpan is carried by the silence, not by a musical sting.
Audio-coupled idea: the resolve is the only sound in Scene 5; the subtitle is silent.
Music: final ~0.8s fade out, under the resolve.
Transition mood: cut to black.

**Music mood for this video:** polished / warm minimal
**Audio summary:** A hushed warm bed carries the film, opening as the camera enters
the stage, sitting back for the kit interaction, lifting again for the invoice, then
gone before the punchline — with sparse, precise, motion-matched UI clicks doing the
real work.

**Reading-time audit.** Every line that must be read gets its floor: the hero
headline holds 2.25s; "Woven Shoulder Strap" and "Locking Lens Cap" each stay on
screen from their attach until 12.00; the four invoice rows each hold over 2s before
the next arrives; the total holds 0.5s at 17.91 and stays on the card into Scene 5;
"Order ready" holds from 19.55 to 22.10; the subtitle holds 20.95 → 22.10 (1.15s for
3 words, clearing its 0.9s floor). Nothing is fast-in-then-gone.

---

## Assumptions and substitutions

- **No secrets carried.** `src/config/telegram.js` and `src/utils/telegram.js` were
  deliberately **not** read and nothing from them appears anywhere. The handoff is
  shown only as the product's own visible CTA, "Send to shop chat", with no bot,
  chat, or account identity.
- **Order id is fictional.** The real `generateOrderId()` is random per session; the
  video shows a plausible stand-in, `MRG-4K7Q2`.
- **The final tagline is ours, not the product's.** "No spreadsheet required." is
  written for the video. Every other line on screen is verbatim product copy.
- **The handoff's "We'll shipping your order soon." line is omitted.** It is a
  grammatical error in the shipped product; amplifying a typo in a shareable video
  would read as sloppiness rather than as deadpan. The scene uses the real "Order
  ready" heading instead. Flagged for the user, not fixed in code.
- **The 3D is the real 3D.** Not a screen capture and not a mockup: the composition
  loads the product's actual `aurora-x7.glb` and its actual `studio.hdr`, mirrors
  the lighting rig from `SceneViewer.jsx` (hemisphere + ambient + spotlight, ACES
  filmic tone mapping), and rebuilds the strap and lens cap from the same procedural
  geometry `AccessoryModel.jsx` uses, since neither has a GLB. The push-through is
  a real Three.js camera dolly on the `hf-seek` adapter, not a CSS scale.
- **Everything is local.** `three`, the Draco decoder, the GLB, the HDR, the music
  and the SFX are copied into `composition/assets/`, so nothing is fetched over the
  network at render time.
