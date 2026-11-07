/* ------------------------------------------------------------------
   The real 3D: the product's own aurora-x7.glb, its own studio.hdr, and
   the same lighting rig, model fit, idle sway and accessory geometry as
   SceneViewer.jsx / CameraModel.jsx / AccessoryModel.jsx.

   Driven purely by composition time from the `hf-seek` event, so a frame
   render and a preview scrub produce identical pixels.
   ------------------------------------------------------------------ */
import * as THREE from 'three';
import { GLTFLoader } from './three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from './three/addons/loaders/DRACOLoader.js';
import { HDRLoader } from './three/addons/loaders/HDRLoader.js';

const W = 1920;
const H = 1080;
const DURATION = 22.4;
const TARGET_SIZE = 3.2;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
const easeOutQuint = (p) => 1 - Math.pow(1 - p, 5);
const easeOutBack = (p, s) => {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);
};
const seg = (t, a, b) => clamp01((t - a) / (b - a));

const canvas = document.getElementById('stage-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
camera.position.set(0, 1.35, 6.4);

/* --- Lights: identical to SceneViewer.jsx, ramped in with the dolly --- */
const hemi = new THREE.HemisphereLight('#ffffff', '#33414f', 0);
const ambient = new THREE.AmbientLight(0xffffff, 0);
const spot = new THREE.SpotLight('#ffffff', 0);
spot.position.set(4, 8, 5);
spot.angle = 0.35;
spot.penumbra = 1;
scene.add(hemi, ambient, spot);

/* --- Baked contact shadow, standing in for drei's multi-frame ContactShadows --- */
function makeContactShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0.0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.34, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.62, 'rgba(0,0,0,0.16)');
  g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.38,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, -0.02, 0);
  mesh.scale.set(7, 7, 1);
  mesh.renderOrder = -1;
  return mesh;
}

const stage = new THREE.Group();
scene.add(stage);
const contactShadow = makeContactShadow();
stage.add(contactShadow);

const sway = new THREE.Group();
stage.add(sway);

const modelRoot = new THREE.Group();
const inner = new THREE.Group();
modelRoot.add(inner);
sway.add(modelRoot);

/* --- Accessory geometry, rebuilt from AccessoryModel.jsx --- */
function buildLensCap(accessoryScale) {
  const g = new THREE.Group();

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.4, 0.08, 40),
    new THREE.MeshStandardMaterial({ color: '#161618', roughness: 0.55, envMapIntensity: 0.6 }),
  );
  cap.rotation.x = Math.PI / 2;
  g.add(cap);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.02, 10, 40),
    new THREE.MeshStandardMaterial({ color: '#d8d4cc', metalness: 0.9, roughness: 0.3 }),
  );
  ring.position.set(0, -0.02, 0);
  g.add(ring);

  const tab = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.05, 0.06),
    new THREE.MeshStandardMaterial({ color: '#161618', roughness: 0.6 }),
  );
  tab.position.set(0.3, 0.01, 0);
  g.add(tab);

  /* wrap carries the app's accessoryScale; pop is reserved for the seat-in. */
  const pop = new THREE.Group();
  pop.add(g);
  const wrap = new THREE.Group();
  wrap.add(pop);
  wrap.scale.setScalar(accessoryScale);
  wrap.userData.pop = pop;
  return wrap;
}

function buildShoulderStrap(lug, accessoryScale) {
  const a = lug.clone();
  const b = new THREE.Vector3(-lug.x, lug.y, lug.z * 0.4);
  const sag = new THREE.Vector3(0, -1.1 * accessoryScale, 0);
  const pts = [
    a,
    a.clone().add(b.clone().sub(a).multiplyScalar(0.3)).add(sag),
    a.clone().add(b.clone().sub(a).multiplyScalar(0.7)).add(sag),
    b,
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 48, 0.06 * accessoryScale, 8, false);
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: '#6b4a28', roughness: 0.9, envMapIntensity: 0.3 }),
  );
}

const state = {
  fit: 1,
  lug: new THREE.Vector3(),
  front: new THREE.Vector3(),
  accessoryScale: 1,
  strap: null,
  cap: null,
};

/* --- Per-frame state, a pure function of t --- */
function renderAt(t) {
  /* Push-through: one continuous dolly from behind the type to the stage. */
  const dolly = seg(t, 3.7, 4.25);
  const de = easeOutQuint(dolly);
  camera.position.z = 15.5 + (6.4 - 15.5) * de;
  camera.position.y = 1.35 + 0.22 * Math.sin(dolly * Math.PI);
  camera.lookAt(0, 1.2, 0);

  /* Stage lights bloom up as the dolly settles. */
  const lightP = easeOutCubic(seg(t, 4.1, 4.6));
  hemi.intensity = 2.2 * lightP;
  ambient.intensity = 0.5 * lightP;
  spot.intensity = 1.6 * lightP;

  /* Model: the app's 0.94 -> 1 pop, plus a short fade out of the dolly. */
  const introP = seg(t, 4.35, 4.7);
  const visible = t >= 4.35;
  modelRoot.visible = visible;
  contactShadow.visible = visible;
  if (visible) {
    modelRoot.scale.setScalar(state.fit * (0.94 + 0.06 * easeOutCubic(introP)));
    modelRoot.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) if (m) m.opacity = introP;
    });

    /* Idle sway — the app's exact coefficients, driven by composition time. */
    sway.rotation.y = Math.sin(t * 0.65) * 0.06;
    sway.rotation.z = Math.sin(t * 0.47 + 1.3) * 0.014;
    sway.position.y = Math.sin(t * 0.9) * 0.03;
  }

  /* Strap swings down onto the lug at 8.96. */
  const strapP = seg(t, 8.96, 9.46);
  if (state.strap) {
    state.strap.visible = strapP > 0;
    if (state.strap.visible) {
      const e = easeOutBack(strapP, 1.5);
      state.strap.position.set(0, (1 - e) * 1.35, 0);
      state.strap.rotation.set(0, 0, (1 - e) * 0.5);
      state.strap.scale.setScalar(0.94 + 0.06 * e);
    }
  }

  /* Lens cap seats on the front at 9.50. */
  const capP = seg(t, 9.5, 9.95);
  if (state.cap) {
    state.cap.visible = capP > 0;
    if (state.cap.visible) {
      const e = easeOutBack(capP, 1.8);
      state.cap.position.copy(state.front);
      state.cap.position.z += (1 - e) * 0.55;
      state.cap.rotation.set(0, (1 - e) * 2.2, 0);
      state.cap.userData.pop.scale.setScalar(0.7 + 0.3 * e);
    }
  }

  /* The product's own dimCanvas beat, as a real scale-down of the stage. */
  const dimP = easeOutCubic(seg(t, 12.1, 12.5));
  stage.scale.setScalar(1 - 0.015 * dimP);
  contactShadow.material.opacity = visible ? 0.38 * (1 - 0.6 * dimP) : 0;

  renderer.render(scene, camera);
}

window.addEventListener('hf-seek', (e) => {
  const t = Math.max(0, Math.min(DURATION, e.detail.time || 0));
  window.__hfThreeTime = t;
  renderAt(t);
});

/* --- Asset load --- */
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

const build = (async () => {
  const draco = new DRACOLoader();
  draco.setDecoderPath('./assets/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  const [gltf, hdr] = await Promise.all([
    loader.loadAsync('./assets/models/aurora-x7.glb'),
    new HDRLoader().loadAsync('./assets/env/studio.hdr'),
  ]);

  const env = pmrem.fromEquirectangular(hdr).texture;
  scene.environment = env;
  hdr.dispose();

  const scene3d = gltf.scene;
  scene3d.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene3d);
  const size = box.getSize(new THREE.Vector3());
  const center = new THREE.Vector3();
  box.getCenter(center);

  const fit = TARGET_SIZE / Math.max(size.x, size.y, size.z, 0.0001);
  /* The app keeps the model inside the stage on narrow viewports. */
  const viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  const viewW = viewH * (W / H);
  const s = Math.min(
    fit,
    (viewW * 0.86) / Math.max(size.x, 0.0001),
    (viewH * 0.62) / Math.max(size.y, 0.0001),
  );
  state.fit = s;

  const world = (p) =>
    new THREE.Vector3((p.x - center.x) * s, (p.y - box.min.y) * s, (p.z - center.z) * s);
  state.lug = world(
    new THREE.Vector3(box.min.x + size.x * 0.92, box.min.y + size.y * 0.96, center.z),
  );
  state.front = world(new THREE.Vector3(center.x, center.y + size.y * 0.12, box.min.z));
  state.accessoryScale = (size.y * s) / TARGET_SIZE;

  scene3d.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) if (m) m.transparent = true;
  });
  inner.add(scene3d);
  /* inner stays at unit scale; modelRoot owns the app's fit scale and pop. */
  inner.position.set(-center.x * s, -box.min.y * s, -center.z * s);
  inner.scale.setScalar(1);
  modelRoot.scale.setScalar(s);

  /* Accessories, hidden until their beat. */
  state.strap = buildShoulderStrap(state.lug, state.accessoryScale);
  state.strap.visible = false;
  sway.add(state.strap);

  state.cap = buildLensCap(state.accessoryScale);
  state.cap.position.copy(state.front);
  state.cap.visible = false;
  sway.add(state.cap);

  draco.dispose();
  pmrem.dispose();
  renderer.compile(scene, camera);
  renderAt(0);
})().catch((err) => {
  console.error('[mirage] stage build failed', err);
});

/* Registered synchronously, in the same script block that starts the build. */
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady['mirage-stage'] = build;
