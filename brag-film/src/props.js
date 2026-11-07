/**
 * Designed macro props for the Mirage film.
 *
 * The shipped GLBs are static merged meshes with no articulated parts, so the
 * shutter button, mode dial, focus ring and sensor are purpose-built geometry
 * for this film rather than the exact parts from the catalogue models. They are
 * deliberately generic: no badge, no engraving, no maker's mark.
 */
import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * Procedural aperture iris.
 *
 * A real iris is N blades, each a half-plane pivoting about a common
 * centre, whose union leaves a hole. That union is cheap and exact in a
 * fragment shader, and it antialiases for free, so we shade it directly
 * on a disc instead of trying to build overlapping metal leaves.
 * ------------------------------------------------------------------ */
export const IRIS_BLADES = 9;

export function makeIris({ blades = IRIS_BLADES, radius = 0.5 } = {}) {
  const uniforms = {
    uBlades: { value: blades },
    uOpen: { value: 0.12 },   // 0 = shut, 1 = wide
    uAA: { value: 0.014 },    // blade-edge AA width, in disc units
    uMetal: { value: new THREE.Color('#0e0f12') },
    uEdge: { value: new THREE.Color('#6f7784') },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    vertexShader: /* glsl */`
      varying vec2 vP;
      void main() {
        vP = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      varying vec2 vP;
      uniform float uBlades;
      uniform float uOpen;
      uniform float uAA;
      uniform vec3  uMetal;
      uniform vec3  uEdge;

      const float PI = 3.141592653589793;

      void main() {
        float r = length(vP);
        if (r > 1.0) discard;

        // Hole radius: shut at 0.05, wide at 0.78.
        float hole = mix(0.05, 0.78, clamp(uOpen, 0.0, 1.0));

        // Each blade is a half-plane whose normal points at its own angle.
        // A point is covered when it falls behind any blade's plane.
        float ang = atan(vP.y, vP.x);
        float aa = uAA;

        float best = 1e9;      // most-negative plane distance = topmost blade
        float cover = 0.0;
        for (int i = 0; i < 24; i++) {
          if (float(i) >= uBlades) break;
          float a = ang + float(i) * (2.0 * PI / uBlades);
          // distance behind this blade's plane
          float d = r * cos(a) - hole;
          best = min(best, d);
          cover = max(cover, smoothstep(-aa, aa, d));
        }

        // Inside the hole we see straight through to the dark interior.
        vec3 col = mix(vec3(0.012, 0.013, 0.016), uMetal, cover);

        // Brushed sheen along each blade so the leaves read as overlapping metal.
        float sheen = 0.5 + 0.5 * cos(ang * 3.0 + best * 9.0);
        col += uEdge * pow(clamp(sheen, 0.0, 1.0), 6.0) * 0.16 * cover;

        // A thin catch-light on the blade edge nearest the hole.
        float lip = smoothstep(0.10, 0.0, abs(best)) * cover;
        col += uEdge * lip * 0.55;

        // Soften the outer barrel so the iris sits inside a lens, not on a cutout.
        float barrel = smoothstep(1.0, 0.965, r);
        gl_FragColor = vec4(col, barrel);
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 96), material);
  mesh.name = 'iris';
  mesh.userData.uniforms = uniforms;
  return mesh;
}

/* ------------------------------------------------------------------ *
 * Knurled focus ring — real geometry so the knurl catches real specular.
 * ------------------------------------------------------------------ */
export function makeFocusRing({ radius = 0.42, width = 0.16, ridges = 96 } = {}) {
  const group = new THREE.Group();
  group.name = 'focusRing';

  const barrelMat = new THREE.MeshStandardMaterial({
    color: '#15171b', metalness: 0.92, roughness: 0.34,
  });
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, 128, 1, true),
    barrelMat
  );
  barrel.rotation.x = Math.PI / 2;
  group.add(barrel);

  // Knurl: a dense ring of fine ribs. Instanced so it stays one draw call.
  const ribGeo = new THREE.BoxGeometry(0.012, width * 0.86, 0.03);
  const ribMat = new THREE.MeshStandardMaterial({
    color: '#1b1e23', metalness: 0.95, roughness: 0.28,
  });
  const ribs = new THREE.InstancedMesh(ribGeo, ribMat, ridges);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < ridges; i++) {
    const a = (i / ridges) * Math.PI * 2;
    pos.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    q.setFromEuler(new THREE.Euler(0, 0, a));
    ribs.setMatrixAt(i, m.compose(pos, q, scl));
  }
  ribs.instanceMatrix.needsUpdate = true;
  group.add(ribs);

  // Front and rear faces, slightly inset, to close the ring visually.
  const faceMat = new THREE.MeshStandardMaterial({
    color: '#0d0e11', metalness: 0.8, roughness: 0.45,
  });
  for (const z of [width / 2, -width / 2]) {
    const face = new THREE.Mesh(new THREE.RingGeometry(radius * 0.55, radius, 128), faceMat);
    face.position.z = z;
    if (z < 0) face.rotation.y = Math.PI;
    group.add(face);
  }

  group.userData.spin = (angle) => { group.rotation.z = angle; };
  return group;
}

/* ------------------------------------------------------------------ *
 * Mode dial — engraved tick ring and a single index notch. No lettering.
 * ------------------------------------------------------------------ */
export function makeModeDial({ radius = 0.36, height = 0.13, ticks = 24 } = {}) {
  const group = new THREE.Group();
  group.name = 'modeDial';

  const topMat = new THREE.MeshStandardMaterial({
    color: '#191c21', metalness: 0.9, roughness: 0.3,
  });
  const sideMat = new THREE.MeshStandardMaterial({
    color: '#101216', metalness: 0.85, roughness: 0.5,
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 0.96, height, 128),
    [sideMat, topMat, sideMat]
  );
  body.rotation.x = Math.PI / 2;
  group.add(body);

  // Ticks around the rim.
  const tickGeo = new THREE.BoxGeometry(0.008, 0.05, 0.012);
  const tickMat = new THREE.MeshStandardMaterial({
    color: '#8f97a3', metalness: 1.0, roughness: 0.22,
  });
  const tickRing = new THREE.InstancedMesh(tickGeo, tickMat, ticks);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3();
  const s = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < ticks; i++) {
    const a = (i / ticks) * Math.PI * 2;
    const long = i % 6 === 0;
    p.set(Math.cos(a) * radius * 0.78, Math.sin(a) * radius * 0.78, height / 2 + 0.001);
    q.setFromEuler(new THREE.Euler(0, 0, a));
    s.set(1, 1, long ? 1.7 : 1);
    tickRing.setMatrixAt(i, m.compose(p, q, s));
  }
  s.set(1, 1, 1);
  tickRing.instanceMatrix.needsUpdate = true;
  group.add(tickRing);

  // Index notch — the only mark, so the dial's rotation is readable.
  const notch = new THREE.Mesh(
    new THREE.BoxGeometry(0.016, radius * 0.5, 0.014),
    new THREE.MeshStandardMaterial({ color: '#d8d2c6', metalness: 1, roughness: 0.18 })
  );
  notch.position.set(0, radius * 0.52, height / 2 + 0.004);
  group.add(notch);

  const cap = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.52, 96),
    new THREE.MeshStandardMaterial({ color: '#0c0d10', metalness: 0.7, roughness: 0.6 })
  );
  cap.position.z = height / 2 + 0.002;
  group.add(cap);

  group.userData.spin = (angle) => { group.rotation.z = angle; };
  return group;
}

/* ------------------------------------------------------------------ *
 * Sensor — coated silicon catching a raking light.
 * ------------------------------------------------------------------ */
export function makeSensor({ w = 0.5, h = 0.33 } = {}) {
  const uniforms = {
    uSweep: { value: -0.4 },     // position of the raking light, -1..1
    uReveal: { value: 0 },       // overall brightness of the coating
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
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
      uniform float uSweep;
      uniform float uReveal;

      // Interference colours, the way a real sensor coating shifts with angle.
      vec3 coat(float d) {
        return 0.5 + 0.5 * cos(6.28318 * (d + vec3(0.00, 0.33, 0.67)));
      }

      void main() {
        vec2 p = vUv - 0.5;

        // Rectangular active area inside a darker package.
        float active = step(abs(p.x), 0.42) * step(abs(p.y), 0.40);
        float edge   = smoothstep(0.0, 0.02, 0.42 - abs(p.x))
                     * smoothstep(0.0, 0.02, 0.40 - abs(p.y));

        float d = length(p) * 1.4 + uSweep * 0.6;
        vec3 base = mix(vec3(0.020, 0.035, 0.055), coat(d) * 0.55, 0.75);

        // The raking highlight itself.
        float band = exp(-pow((p.x - uSweep) * 2.6, 2.0));
        vec3 col = base * (0.35 + 0.65 * uReveal);
        col += vec3(0.75, 0.86, 1.0) * band * 1.15 * uReveal;

        // Faint microlens grid, only where the light lands.
        float grid = step(0.965, max(
          sin(p.x * 320.0), sin(p.y * 320.0)));
        col += vec3(0.20, 0.30, 0.42) * grid * band * 0.5 * uReveal;

        vec3 pkg = vec3(0.055, 0.058, 0.065);
        gl_FragColor = vec4(mix(pkg, col, active * edge), 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.name = 'sensor';
  mesh.userData.uniforms = uniforms;
  return mesh;
}

/* ------------------------------------------------------------------ *
 * Shutter release — a metal button in a raised collar that depresses.
 * ------------------------------------------------------------------ */
export function makeShutter({ radius = 0.2 } = {}) {
  const group = new THREE.Group();
  group.name = 'shutter';

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.16, radius * 0.13, 24, 96),
    new THREE.MeshStandardMaterial({ color: '#1a1d22', metalness: 0.9, roughness: 0.34 })
  );
  group.add(collar);

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.05, radius * 1.05, radius * 0.16, 96),
    new THREE.MeshStandardMaterial({ color: '#141619', metalness: 0.85, roughness: 0.5 })
  );
  plate.rotation.x = Math.PI / 2;
  plate.position.z = -radius * 0.05;
  group.add(plate);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.62, radius * 0.66, radius * 0.3, 96),
    new THREE.MeshStandardMaterial({ color: '#d9d3c6', metalness: 1.0, roughness: 0.14 })
  );
  cap.rotation.x = Math.PI / 2;
  cap.position.z = radius * 0.16;
  group.add(cap);

  // Centre dimple, so the press has a visible target.
  const dimple = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.2, 32, 16),
    new THREE.MeshStandardMaterial({ color: '#b9b2a4', metalness: 1.0, roughness: 0.2 })
  );
  dimple.position.z = radius * 0.30;
  group.add(dimple);

  group.userData.press = (amount) => { cap.position.z = radius * 0.16 - amount * radius * 0.16; };
  group.userData.ping = (amount) => { dimple.material.emissive.setScalar(amount * 0.9); };
  dimple.material.emissive = new THREE.Color(0x000000);
  return group;
}
