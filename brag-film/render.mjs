/**
 * Render driver for the MIRAGE film.
 *
 * Boots Vite programmatically (no port guessing, no orphan process), drives the
 * page through a deterministic frame range, and writes JPEGs. Because
 * renderFrame() is a pure function of t, the range can be sharded and every
 * shard still produces identical pixels.
 *
 *   node brag-film/render.mjs                       # both aspects, 25s
 *   node brag-film/render.mjs --aspect landscape
 *   node brag-film/render.mjs --scale 25            # 50 frames, 480x270
 *   node brag-film/render.mjs --times 14,15,19.5    # specific frames only
 *   node brag-film/render.mjs --dry                 # measure, write nothing
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.resolve(import.meta.dirname, 'frames');

/* ---------------------------------------------------------------- args */
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
};
const has = (name) => argv.includes(`--${name}`);

const DUR = 25.0;
const FPS = 30;
const FULL = Math.round(DUR * FPS); // 750

const scalePct = Number(arg('scale', 100)) / 100;
const dry = has('dry');
const quality = Number(arg('quality', 96));
const onlyTimes = arg('times', null);
const aspects = arg('aspect', null) ? [String(arg('aspect'))] : ['landscape', 'portrait'];
const native = { landscape: [1920, 1080], portrait: [1080, 1920] };

/* `--every 1` measures every frame, which is what the cut-dip checks need:
   the dips are 0.18s wide, so a sparse sample series steps straight over them
   and the report describes a cut that the film does not have. */
const every = arg('every', null) ? Number(arg('every')) : null;

const frames = onlyTimes
  ? String(onlyTimes).split(',').map(Number).filter((n) => !Number.isNaN(n))
  : every === 1
    ? Array.from({ length: FULL }, (_, i) => i / FPS)
    : Array.from({ length: Math.max(2, Math.round(FULL * scalePct)) },
      (_, i) => i / (FPS * scalePct));

const SIZES = Object.fromEntries(
  aspects.map((a) => [a, native[a].map((n) => Math.round(n * scalePct) & ~1)])
);

/* ------------------------------------------------------- in-page metrics */
/**
 * Downsamples the live canvas and reports luma statistics. This is the only
 * ground truth available without eyes on the output, so the render is graded
 * against these numbers rather than by feel.
 */
const MEASURE = () => {
  const src = document.getElementById('stage');
  // Match the source aspect, otherwise a 9:16 render is squashed into 16:9 and
  // every column-profile measurement lies about where the subject actually is.
  const W = 192;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = Math.max(2, Math.round((W * src.height) / src.width));
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(src, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;

  const lum = new Float64Array(c.width * c.height);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    lum[p] = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
  }

  const stats = (x0, y0, x1, y1) => {
    let n = 0, sum = 0, sum2 = 0, hi = 0, lo = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const v = lum[y * c.width + x];
        n++; sum += v; sum2 += v * v;
        if (v > 0.97) hi++;
        if (v < 0.03) lo++;
      }
    }
    const mean = sum / n;
    return {
      mean: +mean.toFixed(4),
      sd: +Math.sqrt(Math.max(0, sum2 / n - mean * mean)).toFixed(4),
      hi: +(hi / n).toFixed(3),
      lo: +(lo / n).toFixed(3),
    };
  };

  const H = c.height;
  return {
    all: stats(0, 0, c.width, H),
    // The band website content sits in.
    centre: stats(Math.round(c.width * 0.2), Math.round(H * 0.25),
                  Math.round(c.width * 0.8), Math.round(H * 0.75)),
    // The lower third, where the product lives in the closing wide shot.
    lower: stats(Math.round(c.width * 0.2), Math.round(H * 0.68),
                 Math.round(c.width * 0.8), H),
    /*
     * Where each body actually landed, in NDC. The column-extent scan that used
     * to live here found the horizon rather than the product, so framing is now
     * read straight off the projection.
     */
    ndc: window.mirageFilm.ndcBounds(),
  };
};

/* ------------------------------------------------------------------ main */
let server;
let browser;
const report = {};

try {
  server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: 'error',
    server: { port: 5199, strictPort: true },
  });
  await server.listen();
  const base = `http://localhost:5199/brag-film/film.html`;
  console.log(`serving ${ROOT} -> ${base}`);

  browser = await chromium.launch({
    args: [
      '--use-gl=angle', '--use-angle=metal', '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist', '--disable-frame-rate-limit',
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') console.error('console.error:', m.text());
  });

  await page.goto(base, { waitUntil: 'load' });
  await page.waitForFunction(() => window.mirageFilm?.ready?.() === true, null, { timeout: 60_000 });

  const diag = await page.evaluate(() => window.mirageFilm.diagnostics());
  console.log('diagnostics:', JSON.stringify(diag, null, 2));
  report.diagnostics = diag;

  // Install the measurement probe once; evaluate() args must be serialisable.
  await page.evaluate((src) => {
    window.__mirageMeasure = eval(`(${src})`);
    window.__mirageDry = false;
  }, MEASURE.toString());

  for (const aspect of aspects) {
    const [w, h] = SIZES[aspect];
    await page.evaluate(([a, ww, hh, isDry]) => {
      window.__mirageDry = isDry;
      window.mirageFilm.setAspect(a, ww, hh);
    }, [aspect, w, h, dry]);

    const dir = dry ? null : path.join(OUT, aspect);
    if (dir) fs.mkdirSync(dir, { recursive: true });

    const metrics = [];
    const BATCH = 20;

    for (let i = 0; i < frames.length; i += BATCH) {
      const chunk = frames.slice(i, i + BATCH);
      const out = await page.evaluate(
        ([times, q]) => {
          const film = window.mirageFilm;
          const encoded = [];
          const stats = [];
          for (const t of times) {
            film.renderFrame(t);
            stats.push(window.__mirageMeasure());
            if (!window.__mirageDry) encoded.push(film.toDataURL(q));
          }
          return { encoded, stats };
        },
        [chunk, quality]
      );

      out.stats.forEach((s, k) => metrics.push({ t: chunk[k], ...s }));

      if (!dry) {
        out.encoded.forEach((dataUrl, k) => {
          const idx = String(Math.round(chunk[k] * FPS)).padStart(4, '0');
          const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
          fs.writeFileSync(path.join(dir, `f${idx}.jpg`), Buffer.from(b64, 'base64'));
        });
      }

      if ((i / BATCH) % 5 === 0 || i + BATCH >= frames.length) {
        const pct = Math.round(((i + BATCH) / frames.length) * 100);
        const last = out.stats[out.stats.length - 1];
        console.log(
          `  ${aspect} ${pct}%  t=${chunk[chunk.length - 1].toFixed(2)}s  ` +
          `lum=${last.all.mean.toFixed(3)} centreSD=${last.centre.sd.toFixed(3)}`
        );
      }
    }

    const path_ = dry ? null : path.join(OUT, aspect);
    if (path_) fs.writeFileSync(`${path_}/metrics.json`, JSON.stringify(metrics, null, 1));
    report[aspect] = metrics;
    console.log(`${aspect}: ${frames.length} frames at ${w}x${h}${dry ? ' (dry run)' : ''}`);
  }

  fs.writeFileSync(
    path.resolve(import.meta.dirname, 'last-render-report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('done');
} catch (err) {
  console.error('render failed:', err);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await server?.close();
}
