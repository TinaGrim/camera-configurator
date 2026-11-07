/**
 * Numeric QA for the rendered frames.
 *
 * There is no way to look at these renders, so the timeline is verified against
 * measured luma and variance instead. Each check encodes a specific thing the
 * brief asks for; a failure names the timestamp so it can be re-rendered.
 *
 *   node brag-film/verify.mjs [landscape|portrait]
 */
import fs from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname;
const aspect = process.argv[2] || 'landscape';

const report = JSON.parse(fs.readFileSync(path.join(HERE, 'last-render-report.json'), 'utf8'));
const frames = report[aspect];
if (!frames) {
  console.error(`no metrics for "${aspect}". run: node brag-film/render.mjs --dry`);
  process.exit(1);
}

const F = (a, b) => frames.filter((f) => f.t >= a && f.t < b);
const near = (t) => frames.reduce((best, f) => (Math.abs(f.t - t) < Math.abs(best.t - t) ? f : best), frames[0]);

/* Must match MACRO_CUT_FRAMES in src/film.js. Two of the original cut times
   were not multiples of 1/30, so their dips peaked between two rendered
   frames and no frame was ever black. */
const CUTS = [450, 487, 525, 562, 600].map((f) => f / 30);

/* Metric accessors. Each sample nests whole-frame stats under `all` and the
   two regions of interest under their own keys. */
const meanOf = (arr) => (arr.length ? arr.reduce((s, f) => s + f.all.mean, 0) / arr.length : NaN);
const sdOf = (arr, region) => (arr.length ? arr.reduce((s, f) => s + f[region].sd, 0) / arr.length : NaN);

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const f2 = (n) => n.toFixed(3);

console.log(`\n${aspect}: ${frames.length} samples, t=${frames[0].t}–${frames[frames.length - 1].t}\n`);
console.log('    t     lum   sd   centreSD  lowerSD  hi    lo');
for (const f of frames) {
  console.log(
    `${f2(f.t).padStart(6)}  ${f2(f.all.mean).padStart(5)}  ${f2(f.all.sd).padStart(4)}` +
    `   ${f2(f.centre.sd).padStart(6)}   ${f2(f.lower.sd).padStart(6)}  ${f2(f.all.hi).padStart(4)}  ${f2(f.all.lo).padStart(4)}`
  );
}
console.log('');

/* 1 · every frame carries an image, except the frames that are meant to be
   black. The five cut dips are deliberate, so they are excluded here and
   asserted separately in check 12 rather than reported as dead frames. */
{
  const atCut = (f) => CUTS.some((c) => Math.abs(f.t - c) < 0.02);
  const dead = frames.filter((f) => !atCut(f) && (f.all.mean < 0.004 || !Number.isFinite(f.all.mean)));
  const cutFrames = frames.filter(atCut);
  check('no dead or non-finite frames', dead.length === 0 && cutFrames.length === CUTS.length,
    dead.length
      ? `black at t=${dead.slice(0, 6).map((f) => f2(f.t)).join(', ')}`
      : `${frames.length - cutFrames.length} picture frames carry signal, ${cutFrames.length} cut frames masked`);
}

/* 2 · the film opens in near darkness on the lens */
{
  const open = F(0, 1.2);
  const m = meanOf(open);
  check('opens dark', m < 0.16, `mean luma ${f2(m)} over 0–1.2s`);
}

/* 3 · the lens is actually filling frame 1, not lost in black */
{
  const m = sdOf(F(0, 4), 'centre');
  check('lens macro has subject', m > 0.015, `centre sd ${f2(m)} over 0–4s`);
}

/* 4 · the travel through the aperture peaks white */
{
  const flash = F(6.3, 7.2);
  const peak = Math.max(...flash.map((f) => f.all.mean));
  check('aperture flash peaks white', peak > 0.80, `peak luma ${f2(peak)} in 6.3–7.2s`);
}

/* 5 · the flash is a flash, not a step */
{
  const before = meanOf(F(5.6, 6.3));
  const after = meanOf(F(7.4, 8.6));
  check('flash resolves into the studio', after < before + 0.02,
    `5.6–6.3s ${f2(before)} -> 7.4–8.6s ${f2(after)}`);
}

/* 6 · the orbit reads as a lit product on a plinth, and never goes dark */
{
  const orbit = F(9, 15);
  const centre = sdOf(orbit, 'centre');
  const luma = orbit.map((f) => f.all.mean);
  const mean = luma.reduce((s, v) => s + v, 0) / luma.length;
  const lo = Math.min(...luma);
  const hi = Math.max(...luma);
  check('orbit has subject and depth', centre > 0.05 && mean > 0.30 && mean < 0.90,
    `centre sd ${f2(centre)}, mean luma ${f2(mean)}`);
  // The body's side panels are near-black in the source material, so a frontal
  // rig left the turn at 0.17 luma twice per revolution. Catch that here
  // rather than discovering it as a product that vanishes at the quarter turn.
  check('no part of the turn falls dark', lo > 0.30,
    `darkest point ${f2(lo)} at t=${f2(orbit[luma.indexOf(lo)].t)}s (peak ${f2(hi)})`);
}

/* 7 · the orbit is a full revolution, not a static frame */
{
  const orbit = F(9.5, 14.5);
  const lo = Math.min(...orbit.map((f) => f.all.mean));
  const hi = Math.max(...orbit.map((f) => f.all.mean));
  check('orbit varies across the turn', hi - lo > 0.01, `luma range ${f2(lo)}–${f2(hi)}`);
}

/* 8 · each macro detail is legible at the middle of its shot */
{
  const mids = [15.6, 16.9, 18.1, 19.4];
  const vals = mids.map((t) => near(t));
  const ok = vals.every((f) => f.centre.sd > 0.012);
  check('all four macro details legible', ok,
    vals.map((f) => `t${f2(f.t)}:${f2(f.centre.sd)}`).join(' '));
}

/* 9 · the whole lineup is in frame — a 9:16 crop is far narrower in world
   units at the same distance, so the side cameras fall off the edge unless the
   shot is pulled back for portrait. Image statistics read the same either way,
   so this is read off the projection. */
{
  const line = F(20.6, 22.4);
  const worst = { left: 0, hero: 0, right: 0 };
  const cropped = [];
  for (const f of line) {
    for (const k of ['left', 'hero', 'right']) {
      const b = f.ndc?.[k];
      if (!b) continue;
      // How far past the frame edge, in NDC. 0 means fully inside.
      const over = Math.max(Math.abs(b.x[0]), Math.abs(b.x[1])) - 1;
      worst[k] = Math.max(worst[k], over);
      if (over > 0) cropped.push(`${k}@${f2(f.t)}s`);
    }
  }
  check('whole lineup stays in frame', worst.left <= 0 && worst.hero <= 0 && worst.right <= 0,
    cropped.length
      ? `cropped: ${[...new Set(cropped.map((c) => c.split('@')[0]))].join(', ')} (${cropped.length} frames)`
      : `left/hero/right all inside (worst ${f2(worst.right)} over)`);

  // Backing the camera off enough to fit the lineup can quietly turn the
  // product into a detail, so assert it still reads at a usable size.
  const heroW = line.reduce((s, f) => {
    const b = f.ndc?.hero;
    return b ? Math.max(s, b.x[1] - b.x[0]) : s;
  }, 0);
  check('lineup still reads at size', heroW > 0.22,
    `hero spans ${f2(heroW)} of frame width`);
}

/* 10 · the lineup sits in a lower band, leaving the centre clear for content */
{
  const line = F(20.4, 22.3);
  const lower = { sd: sdOf(line, 'lower') };
  const centre = { sd: sdOf(line, 'centre') };
  check('product in lower band, centre clear', lower.sd > centre.sd * 1.4,
    `lower sd ${f2(lower.sd)} vs centre sd ${f2(centre.sd)}`);
}

/* 10 · the dissolve reaches soft white and holds */
{
  const tail = F(24.0, 25.0);
  const m = meanOf(tail);
  check('dissolves to soft white', m > 0.80, `tail luma ${f2(m)} over 24–25s`);
  const c = sdOf(tail, 'centre');
  check('final frame is clean and empty', c < 0.03, `centre sd ${f2(c)}`);
}

/* 11 · the last 1.5s is genuinely static */
{
  const tail = F(23.5, 25.0001);
  const first = tail[0];
  const drift = Math.max(...tail.map((f) => Math.abs(f.all.mean - first.all.mean)));
  check('tail is a static hold', drift < 1e-6, `luma drift ${drift.toExponential(1)} across 23.5–25s`);
}

/* 12 · the hard cuts are hidden in a dip. Each cut must land on a real frame —
    a cut between frames dips nothing, which is how 16.25 and 18.75 slipped
    through — and the masked frame must actually reach black. */
{
  const missing = CUTS.filter((c) => !frames.some((f) => Math.abs(f.t - c) < 1e-6));
  const bad = CUTS
    .map((c) => frames.find((f) => Math.abs(f.t - c) < 1e-6))
    .filter((f) => f && f.all.mean > 0.10)
    .map((f) => `${f2(f.t)}->${f2(f.all.mean)}`);
  check('cuts land in darkness', missing.length === 0 && bad.length === 0,
    missing.length
      ? `no frame at ${missing.map(f2).join(', ')}s`
      : bad.length
        ? `visible: ${bad.join(' ')}`
        : `${CUTS.length} cuts masked on-frame`);
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('failed: ' + failed.map((f) => f.name).join('; '));
  process.exitCode = 1;
}
