import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=metal','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const p = await b.newPage();
await p.setContent('<canvas id="c" width="64" height="64"></canvas>');
const info = await p.evaluate(() => {
  const c = document.getElementById('c');
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  if (!gl) return { ok: false };
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  return { ok: true, version: gl.getParameter(gl.VERSION),
    renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    floatLinear: !!gl.getExtension('OES_texture_float_linear'),
    colorBufferFloat: !!gl.getExtension('EXT_color_buffer_float') };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
