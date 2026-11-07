/**
 * MIRAGE — 25s cinematic brand film.
 *
 * Deterministic: every value is a pure function of the frame time `t`.
 * There is no requestAnimationFrame, no clock, and no unseeded randomness, so
 * frame N is byte-identical whether it is rendered first or last. That is what
 * lets us shard the render across processes and still get a clean encode.
 *
 * Timeline
 *   0.0 – 4.0  macro on the lens, procedural iris opening in near darkness
 *   4.0 – 9.0  travelling through the aperture, landing in the studio
 *   9.0 – 15.0 full 360° product orbit
 *  15.0 – 20.0 four designed macro details, racking cuts between them
 *  20.0 – 25.0 three-camera wide, travelling light, dissolve to soft white
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
import { makeIris, makeFocusRing, makeModeDial, makeSensor, makeShutter } from './props.js';

/* ================================================================== *
 * CONFIG — every creative knob lives here.
 * ================================================================== */
export const CONFIG = {
  duration: 25.0,
  fps: 30,

  // Where the hero model's lens actually ended up, filled in at load time.
  heroSize: 1.70,

  /**
   * The GLBs have the shoulder strap baked in, and it is longer than the camera
   * is wide. Left in, it dominates the bounding box, shrinks the body to a
   * speck during normalisation, and trails a thin ribbon across every orbit
   * frame. The configurator models the strap as a separate accessory anyway, so
   * the film shows the bare body. Flip this on if you want it back.
   */
  showStrap: false,

  // Scene boundaries, in seconds.
  t: { iris: [0, 4], travel: [4, 9], orbit: [9, 15], macro: [15, 20], wide: [20, 25] },

  // The frame stops moving here, guaranteeing a perfectly static tail.
  freeze: 23.5,

  // Soft white the film dissolves into. Not pure #fff — pure white is harsh.
  white: '#f6f4f0',
  whiteCeiling: 0.94,

  aspect: {
    landscape: { w: 1920, h: 1080 },
    portrait: { w: 1080, h: 1920 },
  },
};

/* ================================================================== *
 * Math helpers
 * ================================================================== */
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

/** Normalised progress through [a, b], clamped at both ends. */
const seg = (t, a, b) => clamp((t - a) / (b - a));

const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const smoother = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x) => 1 - Math.pow(1 - x, 3);

/** Rise then fall across [a, b], peaking at `peak` (0..1 of the span). */
const bump = (t, a, b, peak = 0.5) => {
  const u = seg(t, a, b);
  if (u <= 0 || u >= 1) return 0;
  return u < peak
    ? smooth(u / peak)
    : smooth((1 - u) / (1 - peak));
};

/**
 * A dip to near-black centred on each hard cut, so cutting between the model
 * and the designed props happens while nothing is legible.
 */
  /*
   * A dip to black over every hard cut, deep enough that the outgoing and
   * incoming shots are unrecognisable at the splice. This also blows the focus
   * out, so the prop scale swap underneath it cannot show either.
   */
  const cutDip = (t, at, width = 0.26) => bump(t, at - width / 2, at + width / 2, 0.5);

/*
 * The macro cuts, defined in FRAMES and converted to seconds. Two of the
 * original times — 16.25 and 18.75 — are not multiples of 1/30, so the dip
 * peaked exactly between two rendered frames and no frame was ever dark. The
 * cuts have to land on frame boundaries or the dip is invisible.
 */
const MACRO_CUT_FRAMES = [450, 487, 525, 562, 600];
const MACRO_CUTS = MACRO_CUT_FRAMES.map((f) => f / CONFIG.fps);

/**
 * The four designed details. `frame` is the half-height of the shot in world
 * units, and the camera distance is derived from it, so changing a prop's size
 * never silently crops it. `arc` is the sweep in radians across the shot.
 */
const MACRO_SHOTS = [
  { key: 'ring',    frame: 0.62, fov: 26, arc: 0.34, tilt: 0.14, roll: [-0.12, 0.09], ev: 1.00 },
  { key: 'dial',    frame: 0.55, fov: 26, arc: -0.30, tilt: 0.16, roll: [0.10, -0.08], ev: 1.00 },
  { key: 'sensor',  frame: 0.28, fov: 22, arc: 0.20, tilt: 0.10, roll: [-0.05, 0.09], ev: 1.45 },
  { key: 'shutter', frame: 0.34, fov: 24, arc: -0.24, tilt: 0.13, roll: [0.07, -0.06], ev: 1.15 },
];

/* ================================================================== *
 * Final display-space pass: anamorphic streak, radial flare, grain,
 * vignette, and the dissolve to soft white.
 * ================================================================== */
const FinishShader = {
  uniforms: {
    tDiffuse: { value: null },
    uStreak: { value: 0 },
    uFlare: { value: 0 },
    uGrain: { value: 0.016 },
    uFrame: { value: 0 },
    uVignette: { value: 1 },
    uWhite: { value: 0 },
    uWhiteColor: { value: new THREE.Color(CONFIG.white) },
    uAspect: { value: 1 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float uStreak, uFlare, uGrain, uFrame, uVignette, uWhite, uAspect;
    uniform vec3  uWhiteColor;

    // Deterministic hash — grain must be a function of the frame index only.
    float hash(vec2 p) {
      p = fract(p * vec2(443.897, 441.423));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }

    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      vec2 px = 1.0 / vec2(textureSize(tDiffuse, 0));

      // Anamorphic streak: wide horizontal taps of the highlights only.
      if (uStreak > 0.001) {
        vec3 s = vec3(0.0);
        float wsum = 0.0;
        for (int i = 1; i <= 10; i++) {
          float o = float(i) * 5.0;
          float w = 1.0 / (1.0 + o * 0.16);
          s += (texture2D(tDiffuse, vUv + vec2( o * px.x, 0.0)).rgb
              + texture2D(tDiffuse, vUv + vec2(-o * px.x, 0.0)).rgb) * w;
          wsum += w * 2.0;
        }
        s /= wsum;
        // Threshold well clear of the studio's own whites, otherwise the
        // streak stops being a highlight and becomes a full-frame wash.
        float hi = smoothstep(0.80, 1.0, dot(s, vec3(0.333)));
        col += vec3(0.72, 0.84, 1.0) * hi * uStreak;
      }

      // Radial flare arms through the centre of frame.
      if (uFlare > 0.001) {
        vec2 d = (vUv - 0.5) * vec2(uAspect, 1.0);
        float r = length(d);
        float a = atan(d.y, d.x);
        float arms = pow(abs(cos(a * 3.0)), 18.0) + pow(abs(cos(a * 3.0 + 0.5236)), 18.0) * 0.6;
        float falloff = exp(-r * 3.4);
        col += vec3(1.0, 0.97, 0.92) * arms * falloff * uFlare * 0.55;
        col += vec3(1.0, 0.98, 0.94) * exp(-r * 20.0) * uFlare * 0.35;
      }

      // Corner falloff, kept off the white tail so the hold stays clean.
      if (uVignette > 0.001) {
        vec2 q = (vUv - 0.5) * 2.0;
        float vig = 1.0 - dot(q, q) * 0.16;
        col *= mix(1.0, vig, uVignette);
      }

      // Grain, faded out as the frame washes to white.
      if (uGrain > 0.0001) {
        float n = hash(vUv * 1024.0 + uFrame * 7.13) - 0.5;
        col += n * uGrain * (1.0 - uWhite);
      }

      col = mix(col, uWhiteColor, uWhite);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

/* ================================================================== *
 * Film
 * ================================================================== */
class Film {
  constructor(canvas) {
    this.canvas = canvas;
    this.diag = {};
    this.aspectKey = 'landscape';
    this._buildRenderer();
    this._buildScene();
    this._buildPost();
    this._load();
  }

  /* ---------------------------------------------------------------- */
  _buildRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,          // FXAA handles this, and bokeh wants raw
      preserveDrawingBuffer: true, // so we can read pixels back per frame
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _buildScene() {
    const scene = new THREE.Scene();
    this.scene = scene;
    this.bg = new THREE.Color('#07080a');
    scene.background = this.bg;

    this.camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.04, 120);
    this.camera.position.set(0, 1.35, 6.4);

    // --- environment ------------------------------------------------
    // studio.hdr stands in for the soft sweep of a large overhead scrim.
    this.envTexture = null;
    new RGBELoader().load('/environment/studio.hdr', (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      pmrem.compileEquirectangularShader();
      this.envRT = pmrem.fromEquirectangular(tex);
      scene.environment = this.envRT.texture;
      pmrem.dispose();
      this.diag.env = 'loaded';
    }, undefined, () => { this.diag.env = 'missing'; });

    this.envIntensity = { value: 1 };
    scene.environmentIntensity = 0.2;

    // --- backdrop ---------------------------------------------------
    // A soft vertical gradient that stands in for a photo cyclorama. It is the
    // dark studio for the first four scenes and the bright one for the closing
    // wide, crossfaded by lerping its gradient. Keeping the centre band smooth
    // is what lets website content sit on top of the last five seconds.
    this.studio = {
      dark: { top: '#141821', bottom: '#080a0d' },
      light: { top: '#f4f2ee', bottom: '#d9d5cf' },
    };
    // Pre-resolved pairs so the per-frame lerp does not allocate a Color.
    this.studioPairs = {
      dark: [new THREE.Color(this.studio.dark.top), new THREE.Color(this.studio.dark.bottom)],
      light: [new THREE.Color(this.studio.light.top), new THREE.Color(this.studio.light.bottom)],
    };
    this.backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 34),
      new THREE.ShaderMaterial({
        uniforms: {
          uTop: { value: this.studioPairs.dark[0].clone() },
          uBottom: { value: this.studioPairs.dark[1].clone() },
          uOpacity: { value: 1 },
        },
        vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: `
          precision highp float; varying vec2 vUv; uniform vec3 uTop, uBottom; uniform float uOpacity;
          void main(){
            float g = pow(clamp(vUv.y,0.0,1.0), 1.35);
            vec3 c = mix(uBottom, uTop, g);
            // Very gentle horizontal falloff, no visible seam or banding.
            float h = 1.0 - 0.05 * pow(abs(vUv.x - 0.5) * 2.0, 2.0);
            gl_FragColor = vec4(c * h, uOpacity);
          }`,
        transparent: true,
        depthWrite: false,
      })
    );
    this.backdrop.position.set(0, 8, -16);
    this.backdrop.visible = false;
    scene.add(this.backdrop);

    // --- floor ------------------------------------------------------
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({
        color: '#121418', metalness: 0.18, roughness: 0.42,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    this.floor = floor;
    this.floorDark = new THREE.Color('#121418');
    this.floorLight = new THREE.Color('#d9d6d1');

    // --- lighting ---------------------------------------------------
    // Matched to the configurator's rig, then art-directed for the film.
    this.hemi = new THREE.HemisphereLight('#dfe6f2', '#3a3630', 2.2);
    scene.add(this.hemi);

    this.ambient = new THREE.AmbientLight('#ffffff', 0.5);
    scene.add(this.ambient);

    this.key = new THREE.SpotLight('#fff6e8', 1.6, 40, 0.35, 0.75, 1.4);
    this.key.position.set(4, 8, 5);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.camera.near = 1;
    this.key.shadow.camera.far = 30;
    this.key.shadow.bias = -0.0006;
    this.key.shadow.normalBias = 0.02;
    scene.add(this.key);
    scene.add(this.key.target);

    this.rim = new THREE.DirectionalLight('#cfe0ff', 1.1);
    this.rim.position.set(-5, 3.5, -6);
    scene.add(this.rim);

    /*
     * A soft fill that rides the camera. Without it the orbit swings between a
     * blown highlight and an unlit body, because the key alone has to travel
     * all the way round. Product photographers use exactly this trick: one
     * moving key for shape, one camera-side fill to hold the exposure.
     */
    this.fill = new THREE.DirectionalLight('#ffffff', 0.6);
    scene.add(this.fill);
    scene.add(this.fill.target);

    // A travelling highlight for the macro rack and the final sweep.
    this.sweep = new THREE.SpotLight('#ffffff', 0, 26, 0.5, 1.0, 1.6);
    this.sweep.position.set(-3, 2.2, 3);
    scene.add(this.sweep);
    scene.add(this.sweep.target);

    // --- contents ---------------------------------------------------
    this.models = {};
    this.stage5 = new THREE.Group();
    scene.add(this.stage5);

    this.iris = makeIris({ blades: 9, radius: 0.5 });
    this.iris.visible = false;
    scene.add(this.iris);

    this.props = this._buildProps();
    scene.add(this.props);
  }

  _buildPedestal() {
    const g = new THREE.Group();
    // Sized from the measured body, so a plinth never ends up wider than the
    // camera standing on it.
    const radius = this.dim.w * 0.42;
    const height = this.dim.plinth;
    const side = new THREE.MeshStandardMaterial({ color: '#2a2b2e', metalness: 0.35, roughness: 0.55 });
    const top = new THREE.MeshStandardMaterial({ color: '#33353a', metalness: 0.5, roughness: 0.35 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.05, height, 96), [side, top, side]);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);
    g.visible = false;
    return g;
  }

  _buildProps() {
    const g = new THREE.Group();
    g.position.set(0, 0.62, 0);
    g.visible = false;

    const ring = makeFocusRing({ radius: 0.42, width: 0.16, ridges: 110 });
    const dial = makeModeDial({ radius: 0.36, height: 0.13, ticks: 24 });
    const sensor = makeSensor({ w: 0.5, h: 0.33 });
    const shutter = makeShutter({ radius: 0.2 });

    // The props are the only subject in scene 4, so they are the sole
    // recipients of the raking light during that window.
    g.add(ring, dial, sensor, shutter);

    // Small stand so the parts do not float mid-air during the rack.
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.09, 0.62, 48),
      new THREE.MeshStandardMaterial({ color: '#1c1e22', metalness: 0.6, roughness: 0.5 })
    );
    stand.position.y = -0.31;
    g.add(stand);

    this.propParts = { ring, dial, sensor, shutter, stand };

    /*
     * A soft glow on a plane behind the parts. Without it each part floats in
     * pure black, which reads as an unlit render rather than a macro; this also
     * gives the razor-thin depth of field something to blur against.
     */
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 7),
      new THREE.ShaderMaterial({
        uniforms: {
          uCentre: { value: new THREE.Color('#2b323d') },
          uEdge: { value: new THREE.Color('#07080a') },
        },
        vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: `
          precision highp float; varying vec2 vUv;
          uniform vec3 uCentre, uEdge;
          void main(){
            float d = length((vUv - vec2(0.5, 0.54)) * vec2(1.25, 1.0));
            gl_FragColor = vec4(mix(uCentre, uEdge, smoothstep(0.05, 0.62, d)), 1.0);
          }`,
        depthWrite: false,
      })
    );
    glow.position.set(0, 0, -1.6);
    g.add(glow);
    this.propGlow = glow;

    return g;
  }

  _buildPost() {
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(this.scene, this.camera));

    this.bokeh = new BokehPass(this.scene, this.camera, {
      focus: 3, aperture: 0.0002, maxblur: 0.01,
    });
    composer.addPass(this.bokeh);

    this.bloom = new UnrealBloomPass(new THREE.Vector2(1920, 1080), 0.42, 0.62, 0.82);
    composer.addPass(this.bloom);

    composer.addPass(new OutputPass());
    composer.addPass(new FXAAPass());

    this.finish = new ShaderPass(FinishShader);
    composer.addPass(this.finish);

    this.composer = composer;
  }

  /* ---------------------------------------------------------------- */
  async _load() {
    // Every shipped model is Draco-compressed, so decode locally rather than
    // pulling a decoder off a CDN — the render has to be reproducible offline.
    const draco = new DRACOLoader().setDecoderPath('/draco/');
    draco.setDecoderConfig({ type: 'wasm' });
    const loader = new GLTFLoader().setDRACOLoader(draco);

    const entries = [
      ['hero', '/models/aurora-x7.glb'],
      ['left', '/models/vela-pro.glb'],
      ['right', '/models/drift-mini.glb'],
    ];

    const loaded = await Promise.all(entries.map(async ([key, url]) => {
      try {
        const gltf = await loader.loadAsync(url);
        return [key, this._adopt(gltf.scene, key)];
      } catch (err) {
        console.error('failed to load', url, err);
        return [key, null];
      }
    }));

    this.diag.lens = null;
    for (const [key, holder] of loaded) {
      this.models[key] = holder;
      if (holder) this.scene.add(holder);
    }

    // Find the hero's lens so scene 1 can actually look into it instead of
    // guessing where the front of the body is.
    this.lens = this._findLens(this.models.hero);
    this.diag.lens = this.lens
      ? {
          centre: this.lens.centre.toArray().map((n) => +n.toFixed(4)),
          radius: +this.lens.radius.toFixed(4),
          source: this.lens.source,
        }
      : null;

    this.diag.models = Object.fromEntries(
      Object.entries(this.models).map(([k, v]) => [k, v ? 'ok' : 'FAILED'])
    );

    /*
     * Framing metrics. Every camera position below is derived from the measured
     * body rather than hard-coded, so swapping a model does not silently break
     * the composition.
     */
    const body = this._bodyBounds(this.models.hero);
    this.dim = {
      w: body.max.x - body.min.x,
      h: body.max.y - body.min.y,
      d: body.max.z - body.min.z,
    };
    this.dim.mid = this.dim.h * 0.56;          // aim just above centre
    this.dim.orbitR = this.dim.w * 1.85;       // body fills ~55% of frame width
    this.dim.gap = this.dim.w * 1.18;          // spacing for the closing lineup
    // No wideR: the closing shot's distance is solved from the frame's aspect
    // and the lineup's outer edge, because a single hard-coded radius cannot
    // hold a three-camera lineup in both 16:9 and 9:16.

    this.diag.framing = Object.fromEntries(
      Object.entries(this.dim).map(([k, v]) => [k, +v.toFixed(3)])
    );
    // Where the lens sits, as a fraction of the body, to prove the macro is
    // aimed at glass and not at a corner of the shell.
    this.diag.lensInBody = {
      x: +(((this.lens.centre.x - body.min.x) / this.dim.w)).toFixed(3),
      y: +(((this.lens.centre.y - body.min.y) / this.dim.h)).toFixed(3),
      z: +(((this.lens.centre.z - body.min.z) / this.dim.d)).toFixed(3),
      radiusVsHeight: +((this.lens.radius * 2) / this.dim.h).toFixed(3),
    };

    this.dim.plinth = this.dim.h * 0.22;

    // The plinth is sized from the body, so it can only be built now.
    this.pedestal = this._buildPedestal();
    this.scene.add(this.pedestal);

    // The macro parts read as details of the same camera, so their bay sits at
    // the height the body was framed at, and the stand reaches the floor.
    this.props.position.y = this.dim.plinth + this.dim.mid;
    const stand = this.propParts.stand;
    stand.scale.y = this.props.position.y / 0.62;
    stand.position.y = -this.props.position.y / 2;

    this.diag.ready = true;
    if (window.__filmReady) window.__filmReady();
  }

  /**
   * Sit a model on the floor, centred, and scale it so the *body* — everything
   * except the shoulder strap — reaches a target size. Normalising on the full
   * bounding box instead would be dominated by the strap and would leave the
   * camera itself tiny.
   */
  _adopt(model, key) {
    const holder = new THREE.Group();
    holder.name = `model-${key}`;

    const isStrap = (o) => {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      return /strap/i.test(mats.map((m) => (m && m.name) || '').join(' '));
    };

    model.traverse((o) => {
      if (!o.isMesh) return;
      if (isStrap(o)) {
        o.visible = CONFIG.showStrap;
        o.castShadow = false;
        o.receiveShadow = false;
        return;
      }
      o.castShadow = true;
      o.receiveShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) if (m.envMapIntensity !== undefined) m.envMapIntensity = 1.15;
    });

    holder.add(model);
    holder.updateMatrixWorld(true);

    const bodyBox = new THREE.Box3();
    const bodyMeshes = [];
    model.traverse((o) => {
      if (!o.isMesh || isStrap(o)) return;
      bodyBox.expandByObject(o);
      bodyMeshes.push(o);
    });
    if (bodyMeshes.length === 0) {
      model.traverse((o) => { if (o.isMesh) bodyMeshes.push(o); });
      bodyBox.setFromObject(model);
    }

    const size = bodyBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const target = key === 'hero' ? CONFIG.heroSize : CONFIG.heroSize * (key === 'left' ? 0.9 : 0.86);
    const s = target / maxDim;
    const centre = bodyBox.getCenter(new THREE.Vector3());

    holder.scale.setScalar(s);
    holder.position.set(-centre.x * s, -bodyBox.min.y * s, -centre.z * s);
    holder.updateMatrixWorld(true);

    // Remember which meshes are body, because Box3.setFromObject() walks
    // invisible meshes too and would quietly re-inflate the box with the strap.
    holder.userData.bodyMeshes = bodyMeshes;
    this.diag[`body_${key}`] = this._bodyBounds(holder).getSize(new THREE.Vector3())
      .toArray().map((n) => +n.toFixed(3));
    return holder;
  }

  /** World-space bounds of a holder's body meshes, ignoring the strap. */
  _bodyBounds(holder) {
    const box = new THREE.Box3();
    const meshes = holder.userData.bodyMeshes;
    holder.updateMatrixWorld(true);
    if (meshes) for (const m of meshes) box.expandByObject(m);
    else box.setFromObject(holder);
    return box;
  }

  /**
   * Locate the lens barrel.
   *
   * The GLB has two lens-named primitives and neither name is reliable: the one
   * called `*_lens` turns out to be a wide front glazing panel spanning most of
   * the body, and the one called `*_lens_body` is the actual cylindrical barrel.
   * The barrel is the smaller, rounder of the two, so choose on measured
   * footprint instead of on the name.
   */
  _findLens(holder) {
    if (!holder) {
      return { centre: new THREE.Vector3(0, 0.8, 0.4), radius: 0.28, source: 'fallback-nomodel' };
    }
    const cands = [];
    holder.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const name = mats.map((m) => (m && m.name) || '').join(' ');
      if (!/lens|glass|optic/i.test(name)) return;
      const b = new THREE.Box3().setFromObject(o);
      const s = b.getSize(new THREE.Vector3());
      cands.push({
        b, s, name,
        // A real element is a disc: near-equal across x and y, and short in z.
        disc: Math.min(s.x, s.y) / Math.max(Math.max(s.x, s.y), 1e-6),
        // Footprint across the body. The front glazing scores near 1 while a
        // real barrel stays well under 0.5, so this is what separates them.
        foot: Math.max(s.x, s.y),
        isGlass: /(^|_)lens$/i.test(name.trim()),
      });
    });
    this.diag.lensCandidates = cands.map((c) => ({
      name: c.name,
      min: c.b.min.toArray().map((n) => +n.toFixed(3)),
      max: c.b.max.toArray().map((n) => +n.toFixed(3)),
      disc: +c.disc.toFixed(3),
      foot: +c.foot.toFixed(3),
      isGlass: c.isGlass,
    }));

    if (!cands.length) {
      const b = this._bodyBounds(holder);
      const size = b.getSize(new THREE.Vector3());
      return {
        centre: new THREE.Vector3(0, size.y * 0.62, b.max.z - size.z * 0.12),
        radius: Math.min(size.x, size.y) * 0.28,
        source: 'fallback-body',
      };
    }

    // Smallest footprint wins; ties break toward the rounder, then the larger,
    // so the choice stays stable if a model is ever re-exported.
    cands.sort((a, c) => {
      if (Math.abs(a.foot - c.foot) > 0.01) return a.foot - c.foot;
      if (Math.abs(c.disc - a.disc) > 0.05) return c.disc - a.disc;
      return Math.min(c.s.x, c.s.y) - Math.min(a.s.x, a.s.y);
    });
    const pick = cands[0];

    /*
     * The barrel can face either way along z, so put the aperture on the side
     * of its own box that sits further from the body centre.
     */
    const body = this._bodyBounds(holder);
    const bodyZ = (body.min.z + body.max.z) / 2;
    const centre = pick.b.getCenter(new THREE.Vector3());

    return {
      centre: new THREE.Vector3(centre.x, centre.y, centre.z >= bodyZ ? pick.b.max.z : pick.b.min.z),
      radius: Math.min(pick.s.x, pick.s.y) * 0.5,
      source: pick.name || 'unnamed-lens',
    };
  }

  /* ================================================================ *
   * THE DIRECTOR — a pure function of time.
   *
   * Exactly one scene method runs per frame. That matters: an earlier version
   * let all five blocks write into a shared state object unconditionally, so
   * whichever block ran last silently won and the whole film was one shot.
   * Dispatching on a single scene index makes that class of bug impossible.
   */
  renderFrame(tRaw) {
    const t = Math.min(Math.max(tRaw, 0), CONFIG.duration);
    // Past the freeze point the clock stops feeding the director, which is what
    // makes the final 1.5s a genuinely static hold.
    const a = Math.min(t, CONFIG.freeze);
    const C = CONFIG.t;

    const scene = a < C.iris[1] ? 0
      : a < C.travel[1] ? 1
      : a < C.orbit[1] ? 2
      : a < C.macro[1] ? 3
      : 4;

    const s = {
      pos: new THREE.Vector3(0, this.dim.plinth + this.dim.mid, this.dim.w * 2),
      target: new THREE.Vector3(0, this.dim.plinth + this.dim.mid, 0),
      fov: 32,
      exposure: 1.0,
      envI: 0.2,
      aperture: 0.0002,
      maxblur: 0.008,
      focus: 4,
      keyI: 1.6, keyPos: new THREE.Vector3(4, 8, 5),
      rimI: 1.1, rimPos: new THREE.Vector3(-5, 3.5, -6),
      hemiI: 2.2, ambI: 0.5, fillI: 0.5,
      sweepI: 0, sweepX: -this.dim.w,
      white: 0, streak: 0, flare: 0,
      studioLight: 0,
      roll: 0,
    };

    this._stageVisibility(scene);

    if (scene === 0) this._sceneIris(a, s);
    else if (scene === 1) this._sceneTravel(a, s);
    else if (scene === 2) this._sceneOrbit(a, s);
    else if (scene === 3) this._sceneMacro(a, s);
    else this._sceneWide(a, s);

    /*
     * Hard cuts are hidden in a dip to black. The dip also blows the focus out,
     * so even the prop scale pop underneath it is invisible.
     */
    if (scene === 3 || scene === 4) {
      for (const at of MACRO_CUTS) {
        const d = cutDip(a, at);
        if (d <= 0) continue;
        // To exactly zero, not to 0.03. Fading exposure to a small residual
        // still left the lit studio floor reading 0.14 luma at the splice,
        // which is bright enough to see the cut through.
        s.exposure *= 1 - d;
        s.aperture = lerp(s.aperture, 0.006, d);
      }
    }

    this._apply(a, t, s);
    this.composer.render();
  }

  /**
   * Decide what exists in the world this frame. The lens macro and the orbit
   * share the hero, the macro section swaps it for the designed parts, and the
   * closing wide needs all three bodies.
   */
  _stageVisibility(scene) {
    const { hero, left, right } = this.models;

    // Scene 0, 1: hero only, and the hero is not on the plinth.
    // Scene 2: hero on the plinth.
    // Scene 3: designed parts only.
    // Scene 4: all three bodies on the floor.
    this.iris.visible = scene === 0 || (scene === 1 && this._travelUnderLens);
    this.pedestal.visible = scene === 2;
    this.props.visible = scene === 3;

    if (hero) {
      hero.visible = scene !== 3;
      hero.position.y = scene === 2 ? this.dim.plinth : 0;
    }
    if (left) left.visible = scene === 4;
    if (right) right.visible = scene === 4;
  }

  /* ---------------------------------------------------------------- *
   * Shared geometry helpers
   * ---------------------------------------------------------------- */

  /**
   * Geometry for the lens macro. `dEnd` is the distance at which the lens front
   * exactly fills the frame height, so the opening push lands on a composed
   * shot rather than an arbitrary number.
   */
  _irisDims(fovEnd) {
    const r = this.lens.radius;
    const front = this.lens.centre.z + r;
    const dEnd = (r * 1.6) / Math.tan(THREE.MathUtils.degToRad(fovEnd) * 0.5);
    return { r, front, dEnd };
  }

  /**
   * The 360° orbit, as a pure function of progress through the scene. Starts
   * and ends head-on so the travel scene can hand over to it and the macro
   * section can cut away from it without a jump.
   */
  _orbitPose(u) {
    const angle = easeInOut(u) * Math.PI * 2;
    const radius = lerp(this.dim.orbitR * 1.06, this.dim.orbitR, u);
    return {
      angle,
      pos: new THREE.Vector3(
        Math.sin(angle) * radius,
        lerp(this.dim.plinth + this.dim.h * 1.35, this.dim.plinth + this.dim.h * 1.85, u),
        Math.cos(angle) * radius
      ),
      target: new THREE.Vector3(0, this.dim.plinth + this.dim.mid, 0),
    };
  }

  /* ---------------------------------------------------------------- *
   * Scene 0 · 0–4s — macro on the lens, iris opening in near darkness
   * ---------------------------------------------------------------- */
  _sceneIris(a, s) {
    const u = easeInOut(seg(a, ...CONFIG.t.iris));
    const FOV_A = 30, FOV_B = 25;
    const { r, front, dEnd } = this._irisDims(FOV_B);
    const L = this.lens.centre;

    // Slow push straight down the optical axis with a long-lens compression,
    // plus a small deterministic drift so the frame is never dead still.
    const dist = lerp(dEnd * 2.8, dEnd, easeOut(u));
    s.pos.set(
      L.x + 0.018 * Math.sin(a * 0.9),
      L.y + 0.014 * Math.cos(a * 0.7),
      front + dist
    );
    s.target.set(L.x, L.y, front);
    s.fov = lerp(FOV_A, FOV_B, u);

    this.iris.position.set(L.x, L.y, front + r * 0.06);
    this.iris.scale.setScalar(r * 1.05);
    this.iris.userData.uniforms.uOpen.value = lerp(0.08, 0.82, smoother(u));
    this.iris.userData.uniforms.uAA.value = 0.02;

    s.envI = lerp(0.05, 0.34, u);
    s.keyI = lerp(1.4, 3.0, u);
    s.keyPos = new THREE.Vector3(lerp(-r * 2.4, r * 1.8, u), r * 1.9, r * 4.2);
    s.rimI = lerp(0.2, 1.1, u);
    s.hemiI = lerp(0.25, 0.9, u);
    s.ambI = lerp(0.05, 0.30, u);
    s.fillI = lerp(0.05, 0.45, u);
    s.exposure = lerp(0.72, 1.06, u);

    // Very shallow: only the front element is legible, the body falls away.
    s.aperture = lerp(0.00055, 0.0016, u);
    s.maxblur = 0.014;
    s.focus = dist;
    // A single raking glint sliding across the glass.
    s.streak = bump(a, 1.4, 4.0, 0.62) * 0.5;
  }

  /* ---------------------------------------------------------------- *
   * Scene 1 · 4–9s — travelling through the aperture into the studio
   * ---------------------------------------------------------------- */
  _sceneTravel(a, s) {
    const C = CONFIG.t;
    const L = this.lens.centre;
    const { r, front, dEnd } = this._irisDims(25);
    const orbitStart = this._orbitPose(0);

    const FLASH_A = 6.4, FLASH_B = 7.0;

    s.keyI = 2.0;
    s.keyPos = new THREE.Vector3(this.dim.w * 2.4, this.dim.h * 6, this.dim.w * 3);
    s.rimI = 1.0; s.hemiI = 1.1; s.ambI = 0.35; s.fillI = 0.7;

    if (a < FLASH_A) {
      // Keep pushing, and pass through the opening.
      const p = easeInOut(seg(a, C.travel[0], FLASH_A));
      const dist = lerp(dEnd, -r * 0.9, p);
      s.pos.set(L.x, L.y, front + dist);
      s.target.set(L.x, L.y, front - r * 2.0);
      s.fov = lerp(25, 46, p);

      this.iris.position.set(L.x, L.y, front + r * 0.06);
      this.iris.scale.setScalar(r * lerp(1.05, 7.0, p));
      this.iris.userData.uniforms.uOpen.value = lerp(0.82, 1.0, p);
      this.iris.userData.uniforms.uAA.value = 0.014;

      s.envI = lerp(0.34, 1.1, p);
      s.exposure = lerp(1.06, 1.16, p);
      s.aperture = lerp(0.0016, 0.0004, p);
      s.maxblur = lerp(0.014, 0.006, p);
      s.focus = Math.max(0.08, Math.abs(dist));
      s.streak = 0.15 + bump(a, 4.2, FLASH_A, 0.55) * 0.35;
      s.flare = bump(a, 4.3, FLASH_A, 0.62) * 0.45;
      this._travelUnderLens = true;
    } else if (a < FLASH_B) {
      // The flash that hides the cut out of the lens interior.
      const p = seg(a, FLASH_A, FLASH_B);
      s.pos.set(L.x, L.y, front - r * 0.9);
      s.target.set(L.x, L.y, front - r * 4.0);
      s.fov = 46;
      this.iris.scale.setScalar(r * 7.0);
      this.iris.userData.uniforms.uOpen.value = 1.0;
      s.white = Math.sin(p * Math.PI) * 0.85;
      s.streak = 0.55 * (1 - p * 0.4);
      s.flare = 0.5 * (1 - p * 0.3);
      s.exposure = 1.16;
      s.aperture = 0.0003;
      s.focus = 1.2;
      this._travelUnderLens = false;
    } else {
      // Arrive in the studio and settle into the orbit's opening frame, so the
      // 9s cut into the orbit is invisible.
      const p = smoother(seg(a, FLASH_B, C.travel[1]));
      s.pos.lerpVectors(new THREE.Vector3(L.x, L.y, front - r * 0.9), orbitStart.pos, p);
      s.target.lerpVectors(new THREE.Vector3(L.x, L.y, front - r * 4.0), orbitStart.target, p);
      s.fov = lerp(46, 32, p);

      s.envI = lerp(1.1, 0.85, p);
      s.exposure = lerp(1.16, 1.0, p);
      s.aperture = lerp(0.0003, 0.00012, p);
      s.maxblur = 0.006;
      s.focus = s.pos.distanceTo(s.target);
      s.white = (1 - p) * 0.30;
      s.streak = (1 - p) * 0.2;
      s.flare = (1 - p) * 0.15;
      this._travelUnderLens = false;
    }

    // Keep the kicker behind the camera for the whole move, so the reveal does
    // not swing from lit to unlit as the camera swings from the lens to the set.
    const rel = s.pos.clone().sub(s.target);
    const relA = Math.atan2(rel.x, rel.z);
    s.rimPos = new THREE.Vector3(
      Math.sin(relA + 1.78) * this.dim.orbitR * 0.85,
      this.dim.plinth + this.dim.h * 2.2,
      Math.cos(relA + 1.78) * this.dim.orbitR * 0.85
    );
  }

  /* ---------------------------------------------------------------- *
   * Scene 2 · 9–15s — the full 360° orbit
   * ---------------------------------------------------------------- */
  _sceneOrbit(a, s) {
    const u = seg(a, ...CONFIG.t.orbit);
    const pose = this._orbitPose(u);
    s.pos.copy(pose.pos);
    s.target.copy(pose.target);
    s.fov = 32;

    s.envI = 1.0;
    s.exposure = 1.0;
    s.aperture = 0.00012;
    s.maxblur = 0.006;
    s.focus = s.pos.distanceTo(s.target);

    /*
     * The whole rig travels with the camera. A world-fixed key has to swing a
     * full revolution to keep the body lit, and at that speed the near side
     * blows out while the far side goes black — the measured turn swung between
     * 0.17 and 0.99 luma. Holding the rig at fixed offsets from the camera
     * keeps the exposure even while the highlights still travel across the
     * body, because the body turns.
     *
     * The offsets matter as much as the travel. A fill straight down the lens
     * axis lights the front and back of the body and nothing at all at 90°,
     * where the turn measured 0.16 luma against 0.8 head-on. So the kicker sits
     * at ~100°, close to where the measured collapse was, and the ambient and
     * hemisphere carry a floor so no face can fall to black.
     */
    const camA = pose.angle;
    const R = this.dim.orbitR;
    // (sin, cos) to match the orbit's own azimuth convention, atan2(x, z).
    // Mixing conventions here makes the kicker swing against the turn, which is
    // what left the 90° and 270° faces at 0.21 luma.
    const rig = (off, dist, height) => new THREE.Vector3(
      Math.sin(camA + off) * dist,
      height,
      Math.cos(camA + off) * dist
    );

    s.keyPos = rig(-0.70, R * 0.95, this.dim.h * 4.2);   // high, near, off to one side
    s.rimPos = rig(1.78, R * 0.85, this.dim.h * 2.2);    // side kicker, wraps the 90° faces
    s.keyI = 5.0;
    s.rimI = 3.0;
    s.hemiI = 2.8;
    s.ambI = 1.1;
    s.fillI = 1.0;
    s.streak = bump(a, 9.2, 10.4, 0.5) * 0.16;

    /*
     * Lift the exposure through the side passages. The source model's side
     * panels are near-black, so even a well-placed rig leaves the turn at a
     * quarter of its head-on luma. Riding the exposure with the angle is the
     * cinematographic equivalent of stopping down on the dark side of a real
     * body, and it is a smooth function of t so it stays deterministic.
     */
    const sidePass = Math.pow(1 - Math.abs(Math.cos(pose.angle)), 0.7);
    s.envI = lerp(1.0, 2.7, sidePass);
    s.exposure = lerp(1.0, 1.34, sidePass);
    s.ambI = lerp(1.1, 1.5, sidePass);
  }

  /* ---------------------------------------------------------------- *
   * Scene 3 · 15–20s — four designed macro details, racking cuts
   * ---------------------------------------------------------------- */
  _sceneMacro(a, s) {
    const u = seg(a, ...CONFIG.t.macro);
    const shotIndex = Math.min(3, Math.max(0, Math.floor(u * 4)));
    const local = clamp(u * 4 - shotIndex);

    /*
     * Which part is legible. The outgoing part scales away and the incoming one
     * scales up, both inside the cut dip where the frame is too dark to show it.
     */
    const { ring, dial, sensor, shutter } = this.propParts;
    const visible = (i) =>
      Math.max(0.001,
        (1 - bump(a, MACRO_CUTS[i], MACRO_CUTS[i] + 0.22, 0.5)) *
        (1 - bump(a, MACRO_CUTS[i + 1] - 0.22, MACRO_CUTS[i + 1], 0.5)));
    ring.scale.setScalar(visible(0));
    dial.scale.setScalar(visible(1));
    sensor.scale.setScalar(visible(2));
    shutter.scale.setScalar(visible(3));

    // Per-part motion.
    ring.userData.spin(lerp(0, 0.55, smooth(local)));
    dial.userData.spin(lerp(-0.7, 0.5, smooth(local)));
    sensor.userData.uniforms.uSweep.value = lerp(-0.45, 0.5, smooth(local));
    sensor.userData.uniforms.uReveal.value = smooth(seg(local, 0.05, 0.4));
    const press = bump(local, 0.28, 0.62, 0.45);
    shutter.userData.press(press);
    shutter.userData.ping(press * (1 - seg(local, 0.45, 0.8)) * 0.8);

    /*
     * Per-shot camera. The distance is solved from the shot's frame height, so
     * each part is composed rather than arbitrarily cropped, and every cut gets
     * its own move instead of four identical locked-off frames.
     */
    const spec = MACRO_SHOTS[shotIndex];
    const k = 1 / Math.tan(THREE.MathUtils.degToRad(spec.fov) * 0.5);
    const halfH = lerp(spec.frame * 1.45, spec.frame, smooth(local));
    const dist = halfH * k;
    const ang = spec.arc * (local * 2 - 1);
    const R = this.props.position;
    s.pos.set(
      R.x + Math.sin(ang) * dist,
      R.y + spec.tilt * dist,
      R.z + Math.cos(ang) * dist
    );
    s.target.set(R.x, R.y, R.z);
    s.roll = lerp(spec.roll[0], spec.roll[1], smooth(local));
    s.fov = spec.fov;

    s.envI = 0.55;
    s.exposure = 1.02 * spec.ev;
    s.aperture = 0.0022;   // razor thin: only a sliver of each part is sharp
    s.maxblur = 0.024;
    s.focus = dist;

    // A raking bar crossing each part as it appears.
    s.sweepI = 9 * smooth(seg(local, 0, 0.25)) * (1 - smooth(seg(local, 0.8, 1)));
    s.sweepX = lerp(-this.dim.w * 0.94, this.dim.w * 0.94, local);
    s.keyI = 1.1;
    s.keyPos = new THREE.Vector3(this.dim.w * 1.5, this.dim.h * 2.7, this.dim.w * 1.1);
    s.rimI = 1.1; s.hemiI = 1.1; s.ambI = 0.45; s.fillI = 0.7;
    s.streak = 0.12 * (1 - seg(local, 0.6, 1));
  }

  /* ---------------------------------------------------------------- *
   * Scene 4 · 20–25s — three cameras, light sweep, dissolve to soft white
   * ---------------------------------------------------------------- */
  _sceneWide(a, s) {
    const u = seg(a, ...CONFIG.t.wide);
    const portrait = this.aspectKey === 'portrait';

    /*
     * Solve the dolly distance from the frame instead of hard-coding it. A 9:16
     * frame is roughly a third as wide as 16:9 at the same distance and fov, so
     * the landscape distance cropped the outer cameras right off the sides —
     * measured with NDC, all three bodies left the frame in portrait. The gap
     * tightens for the vertical layout, then the camera backs off by exactly
     * enough to hold the outer edge plus a margin.
     */
    const vFov = 34;
    const gap = this.dim.gap * (portrait ? 0.62 : 1);
    const halfSpan = gap + this.dim.w * 0.5;
    const aspect = portrait ? 9 / 16 : 16 / 9;
    // `need` is the *closest* the camera may get. Dollying in past it cropped
    // the outer camera for the first 54 frames of the landscape shot.
    const need = (halfSpan / (Math.tan(THREE.MathUtils.degToRad(vFov) * 0.5) * aspect)) * 1.15;
    const g = gap;

    const layout = [
      { m: this.models.left, x: -g, z: -0.16, yaw: 0.26 },
      { m: this.models.hero, x: 0.0, z: 0.06, yaw: 0.0 },
      { m: this.models.right, x: g, z: -0.10, yaw: -0.24 },
    ];
    for (const L of layout) {
      if (!L.m) continue;
      L.m.position.set(L.x, 0, L.z);
      L.m.rotation.y = L.yaw;
    }

    /*
     * A wide, low, near-level frame. The aim point sits well above the bodies,
     * which drops the lineup into the bottom quarter of frame and leaves the
     * middle band empty for website content — that is the reason this shot is
     * framed this way and not from a normal eye-level product angle.
     */
    const dolly = easeInOut(u);
    const R = need;
    s.pos.set(0, R * 0.14, lerp(R, R * 1.10, dolly));
    s.target.set(0, R * 0.17, 0);
    s.fov = vFov;

    s.envI = lerp(0.85, 1.05, u);
    s.exposure = lerp(1.0, 1.06, u);
    s.aperture = 0.0001;
    s.maxblur = 0.005;
    s.focus = s.pos.distanceTo(s.target);

    // The light sweep: a hard highlight travelling across all three.
    s.sweepI = 11 * bump(a, 20.0, 23.0, 0.5) * (1 - seg(a, 22.6, 23.1));
    s.sweepX = lerp(-R * 0.5, R * 0.5, easeInOut(seg(a, 20.0, 22.9)));
    s.keyI = 1.0;
    s.keyPos = new THREE.Vector3(lerp(-R * 0.47, R * 0.38, u), R * 0.76, R * 0.65);
    s.rimI = 0.8; s.hemiI = 1.5; s.ambI = 0.45; s.fillI = 0.75;
    s.rimPos = new THREE.Vector3(-R * 0.66, R * 0.42, -R * 0.74);

    // The studio opens from a dark cyclorama to a bright one.
    s.studioLight = smoother(seg(a, 19.6, 20.6));
    this.backdrop.position.z = lerp(-16, -R * 1.3, s.studioLight);
    this.backdrop.scale.setScalar(lerp(0.6, Math.max(1, R / 6.8), s.studioLight));

    // Dissolve to soft white, finishing early enough to leave a long static hold.
    s.white = smoother(seg(a, 22.5, 24.0)) * CONFIG.whiteCeiling;
    s.streak = bump(a, 20.0, 21.6, 0.45) * 0.30 * (1 - seg(a, 22.4, 23.0));
  }

  /* ---------------------------------------------------------------- *
   * Apply the solved state to the renderer.
   * ---------------------------------------------------------------- */
  _apply(a, t, s) {
    const cam = this.camera;
    cam.fov = s.fov;
    cam.aspect = this.aspectKey === 'portrait' ? 9 / 16 : 16 / 9;
    cam.updateProjectionMatrix();
    cam.up.set(0, 1, 0);
    cam.position.copy(s.pos);
    cam.lookAt(s.target);
    cam.rotation.z += s.roll;

    // The cyclorama is always present; only its colour and the floor's change.
    const bu = this.backdrop.material.uniforms;
    this.backdrop.visible = true;
    bu.uOpacity.value = 1;
    bu.uTop.value.lerpColors(this.studioPairs.dark[0], this.studioPairs.light[0], s.studioLight);
    bu.uBottom.value.lerpColors(this.studioPairs.dark[1], this.studioPairs.light[1], s.studioLight);
    this.floor.material.color.lerpColors(this.floorDark, this.floorLight, s.studioLight);

    this.scene.environmentIntensity = s.envI;
    this.key.intensity = s.keyI;
    this.key.position.copy(s.keyPos);
    this.key.target.position.set(0, this.dim.plinth + this.dim.mid, 0);
    this.rim.intensity = s.rimI;
    this.rim.position.copy(s.rimPos);
    this.hemi.intensity = s.hemiI;
    this.ambient.intensity = s.ambI;
    this.fill.intensity = s.fillI;
    // The fill always comes from where the camera is, so the subject keeps a
    // constant exposure through the whole orbit.
    this.fill.position.copy(cam.position);
    this.fill.target.position.copy(s.target);
    this.sweep.intensity = s.sweepI;
    this.sweep.position.set(s.sweepX, this.dim.plinth + this.dim.h * 1.4, this.dim.w * 0.4);
    this.sweep.target.position.set(s.sweepX, this.dim.mid, 0);

    this.renderer.toneMappingExposure = s.exposure;

    this.bokeh.uniforms.focus.value = s.focus;
    this.bokeh.uniforms.aperture.value = s.aperture;
    this.bokeh.uniforms.maxblur.value = s.maxblur;

    this.bloom.strength = lerp(0.42, 0.75, clamp(s.streak));
    this.bloom.threshold = lerp(0.82, 0.62, clamp(s.streak));

    const f = this.finish.uniforms;
    f.uStreak.value = clamp(s.streak, 0, 1.4);
    f.uFlare.value = clamp(s.flare, 0, 1.4);
    f.uWhite.value = s.white;
    f.uVignette.value = 1 - s.white;
    /*
     * Grain is a function of the frame index, never of elapsed wall-clock time.
     * It is keyed off the *frozen* clock, not `t`: the white tail does not
     * reach full white until 24s, so a little grain survived the freeze and the
     * last second still shimmered instead of holding.
     */
    f.uFrame.value = Math.round(a * CONFIG.fps);
    f.uGrain.value = a >= CONFIG.freeze ? 0 : 0.016 * (1 - s.white);
    f.uAspect.value = cam.aspect;
  }

  /* ---------------------------------------------------------------- */
  /**
   * Project each visible body's bounding box to normalised device coordinates
   * for the frame that was just drawn. NDC is [-1,1], so a body is fully in
   * frame when |x| and |y| stay inside 1.
   *
   * This exists because image statistics cannot answer the question. A single
   * camera in the middle of a 9:16 frame and a full three-camera lineup both
   * read as "something in the lower band", and a column-detail scan just finds
   * the horizon. Asking the projection directly is exact and cheap.
   */
  ndcBounds() {
    const v = new THREE.Vector3();
    const out = {};
    for (const [k, holder] of Object.entries(this.models)) {
      if (!holder || !holder.visible) { out[k] = null; continue; }
      const box = new THREE.Box3();
      for (const mesh of holder.userData.bodyMeshes || []) box.expandByObject(mesh);
      if (box.isEmpty()) { out[k] = null; continue; }
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < 8; i++) {
        v.set(i & 1 ? box.max.x : box.min.x,
              i & 2 ? box.max.y : box.min.y,
              i & 4 ? box.max.z : box.min.z);
        v.project(this.camera);
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
      }
      out[k] = {
        x: [+minX.toFixed(3), +maxX.toFixed(3)],
        y: [+minY.toFixed(3), +maxY.toFixed(3)],
        inFrame: maxX <= 1 && minX >= -1 && maxY <= 1 && minY >= -1,
      };
    }
    return out;
  }

  setAspect(key, width, height) {
    this.aspectKey = key;
    const native = CONFIG.aspect[key];
    const w = width || native.w;
    const h = height || native.h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w, h);
  }

  toDataURL(quality = 0.96) {
    return this.canvas.toDataURL('image/jpeg', quality);
  }
}

/* ================================================================== */
const canvas = document.getElementById('stage');
const film = new Film(canvas);
film.setAspect('landscape');

window.__filmReady = false;
window.mirageFilm = {
  film,
  config: CONFIG,
  ready: () => film.diag.ready === true,
  diagnostics: () => film.diag,
  setAspect: (k, w, h) => film.setAspect(k, w, h),
  renderFrame: (t) => film.renderFrame(t),
  ndcBounds: () => film.ndcBounds(),
  toDataURL: (q) => film.toDataURL(q),
};
