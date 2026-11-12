// The Lens: Privaini's hero image as a 3D world.
// Left, what a company emits (signals and statutes) streams as light into the lens; the lens resolves it;
// out the other side comes a risk briefing on a laptop, then the decisions it enables.
// A camera rig flies through it, driven by scroll progress 0..1 (see LensHero.astro).
//
// Sharpness: the frame renders at the display's full pixel density (adaptive, up to 2×) through a 4×
// MSAA target. Bloom is selective — only light sources (streams, particles, lens rings, core) sit on the
// BLOOM layer — so text, cards, the screen and the decisions are never smeared by glow. All text is drawn
// into high-resolution canvases (paint.ts) and composited with premultiplied alpha to avoid dark fringes.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { signals, capabilities, decisions, type Signal } from './data';
import * as P from './paint';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const LENS = V(0, 0.15, 0);
const AXIS = V(0.89, 0, 0.45).normalize();
const AX_U = V(0, 1, 0);
const AX_W = new THREE.Vector3().crossVectors(AXIS, AX_U).normalize();
const LAPTOP = V(5.9, -1.25, -0.5);
const LAPTOP_YAW = -0.4;
const LAPTOP_SCALE = 1.32;
const DECIDE = V(11.9, 0.45, 0.6);
const SPREAD = 0.8;
const BG = new THREE.Color('#061923');
const BLOOM = 1;
// light-source strength per theme (see the ink pass)
const NO_DIM = { streams: 1, dots: 1, core: 1, bloom: 1, haze: 1, ground: 1 };
const LIGHT_GLOW = { streams: 0.6, dots: 0.6, core: 0.55, bloom: 0.18, haze: 0.1, ground: 0.25 };

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const jitter = (r: number) => (rand() * 2 - 1) * r;
const inPlane = (u: number, w: number) => AX_U.clone().multiplyScalar(u).add(AX_W.clone().multiplyScalar(w));
const bez = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number, out = new THREE.Vector3()) => {
  const u = 1 - t;
  return out.set(0, 0, 0)
    .addScaledVector(p0, u * u * u).addScaledVector(p1, 3 * u * u * t)
    .addScaledVector(p2, 3 * u * t * t).addScaledVector(p3, t * t * t);
};

// ---------- shaders ----------
const PLAIN_VS = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// premultiplied canvas text: un-premultiply, decode sRGB, re-premultiply — exact edges at every mip level
const GLYPH_FS = /* glsl */ `
  uniform sampler2D map; uniform float uOpacity; varying vec2 vUv;
  void main() {
    vec4 t = texture2D(map, vUv);
    vec3 c = t.a > 0.0001 ? t.rgb / t.a : vec3(0.0);
    c = pow(c, vec3(2.2));
    gl_FragColor = vec4(c * t.a, t.a) * uOpacity;
  }`;
// light theme: the same world printed as ink on paper. The last pass flips lightness and keeps hue and chroma,
// so the navy ground turns to paper, cyan light to brand teal, and white type to deep-teal ink (#0a3d47).
// It runs after OutputPass, on display-encoded colour.
const INK_FS = /* glsl */ `
  uniform sampler2D tDiffuse; varying vec2 vUv;
  const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
  const vec3 INK = vec3(0.039, 0.239, 0.278);
  void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    float y = dot(c, LUMA);
    float t = clamp((y - 0.06) / 0.9, 0.0, 1.0);
    float ink = dot(INK, LUMA);
    vec3 o = vec3(mix(0.985, ink, t)) + (c - y) * mix(0.25, 1.1, t) + (INK - ink) * t;
    gl_FragColor = vec4(clamp(o, 0.0, 1.0), 1.0);
  }`;
const STREAM_VS = /* glsl */ `
  attribute float aT; attribute float aSeed; attribute float aGroup;
  uniform float uHover;
  varying float vT; varying float vSeed; varying float vHot; varying float vDepth;
  void main() {
    vT = aT; vSeed = aSeed;
    vHot = 1.0 - step(0.5, abs(aGroup - uHover));
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const STREAM_FS = /* glsl */ `
  uniform float uTime; uniform float uIntensity; uniform float uReverse;
  uniform vec3 uColA; uniform vec3 uColB; uniform float uFogNear; uniform float uFogFar;
  varying float vT; varying float vSeed; varying float vHot; varying float vDepth;
  void main() {
    float t = mix(vT, 1.0 - vT, uReverse);
    float ends = smoothstep(0.0, 0.22, vT) * (1.0 - smoothstep(0.88, 1.0, vT) * uReverse);
    float flow = pow(clamp(0.5 + 0.5 * sin(vT * 22.0 - uTime * (1.6 + vSeed * 1.8) + vSeed * 40.0), 0.0, 1.0), 10.0);
    float base = 0.08 + 0.92 * pow(max(t, 1e-4), 2.4);
    vec3 col = mix(uColA, uColB, pow(max(t, 1e-4), 3.0));
    float fog = 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
    float near = smoothstep(0.6, 2.2, vDepth);
    float converge = 1.0 - 0.95 * smoothstep(0.78, 1.0, vT) * (1.0 - uReverse) - 0.9 * (1.0 - smoothstep(0.0, 0.2, vT)) * uReverse;
    float a = ends * converge * near * (base * 0.32 + flow * (0.2 + 0.45 * t)) * uIntensity * (1.0 + vHot * 3.0) * fog;
    gl_FragColor = vec4(min(col * a, vec3(1.2)), 1.0);
  }`;
const PARTICLE_VS = /* glsl */ `
  attribute vec3 aP0; attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3;
  attribute float aPhase; attribute float aSpeed; attribute float aGroup;
  uniform float uTime; uniform float uScale; uniform float uHover;
  varying float vT; varying float vHot; varying float vNear;
  void main() {
    float t = fract(uTime * aSpeed + aPhase);
    float u = 1.0 - t;
    vec3 p = aP0 * u*u*u + aP1 * 3.0*u*u*t + aP2 * 3.0*u*t*t + aP3 * t*t*t;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vT = t;
    vHot = 1.0 - step(0.5, abs(aGroup - uHover));
    vNear = smoothstep(2.0, 6.0, -mv.z);
    gl_PointSize = clamp((1.0 + 1.8 * t * t + vHot * 1.2) * uScale / -mv.z, 1.4, 6.0 * uScale / 34.0);
    gl_Position = projectionMatrix * mv;
  }`;
const PARTICLE_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uIntensity; uniform float uEnd;
  varying float vT; varying float vHot; varying float vNear;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float disc = smoothstep(0.5, 0.3, d);
    float a = disc * smoothstep(0.0, 0.15, vT) * (1.0 - smoothstep(uEnd, uEnd + 0.2, vT)) * (0.35 + vT) * uIntensity * (1.0 + vHot * 2.0) * vNear;
    gl_FragColor = vec4(min(uColor * a, vec3(1.5)), 1.0);
  }`;
const RING_VS = /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RING_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; uniform float uDash; uniform float uDuty; uniform float uArcs; uniform float uArcDuty;
  varying vec2 vP;
  void main() {
    float ang = atan(vP.y, vP.x) / 6.2831853 + 0.5;
    float a = uOpacity;
    if (uDash > 0.0) a *= step(fract(ang * uDash), uDuty);
    if (uArcs > 0.0) a *= smoothstep(0.0, 0.015, uArcDuty - fract(ang * uArcs));
    gl_FragColor = vec4(uColor * a, 1.0);
  }`;
const CORE_FS = /* glsl */ `
  uniform float uIntensity; uniform float uTime; varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float pulse = 0.92 + 0.08 * sin(uTime * 1.7);
    float core = exp(-d * d * 70.0) * 1.4 * pulse;
    float halo = exp(-d * d * 12.0) * 0.1;
    float ring = smoothstep(0.035, 0.0, abs(d - 0.34)) * 0.6 + smoothstep(0.022, 0.0, abs(d - 0.22)) * 0.45;
    vec3 col = vec3(0.8, 0.99, 1.0) * core + vec3(0.18, 0.82, 0.95) * (halo + ring);
    gl_FragColor = vec4(col * uIntensity, 1.0);
  }`;
const BG_FS = /* glsl */ `
  uniform float uAspect; uniform vec2 uRes; uniform float uGlow; varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 p = vUv - 0.5; p.x *= uAspect;
    vec3 base = vec3(0.020, 0.075, 0.100);
    float g1 = exp(-dot(p - vec2(-0.05 * uAspect, 0.05), p - vec2(-0.05 * uAspect, 0.05)) * 3.2) * uGlow;
    float g2 = exp(-dot(p - vec2(0.32 * uAspect, -0.05), p - vec2(0.32 * uAspect, -0.05)) * 4.0) * uGlow;
    float v = smoothstep(1.25, 0.2, length(p * vec2(0.8, 1.2)));
    vec3 col = base + vec3(0.03, 0.15, 0.19) * g1 + vec3(0.02, 0.07, 0.09) * g2;
    col *= mix(0.55, 1.0, v);
    col += (hash(vUv * uRes) - 0.5) / 255.0;   // dither: no banding in the dark gradient
    gl_FragColor = vec4(pow(max(col, vec3(0.0)), vec3(2.2)), 1.0);
  }`;

export interface LensWorld {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  pick(clientX: number, clientY: number): { index: number; signal: Signal } | null;
  setHover(index: number | null): void;
  resize(): void;
  frame(dt: number): void;
  dispose(): void;
}

export async function createLensWorld(canvas: HTMLCanvasElement, opts: { mobile: boolean }): Promise<LensWorld> {
  const mobile = opts.mobile;
  P.setResolution(mobile ? 1.7 : 2.6);
  await P.fontsReady();

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, stencil: false, powerPreference: 'high-performance' });
  const MAX_PR = Math.min(devicePixelRatio || 1, mobile ? 1.75 : 2);
  let pr = MAX_PR;
  renderer.setPixelRatio(pr);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(BG, 1);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const tex = (c: HTMLCanvasElement, premultiplied = true) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = premultiplied ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    t.premultiplyAlpha = premultiplied;
    t.anisotropy = maxAniso;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  };
  const glyphMat = (c: HTMLCanvasElement, opacity = 1, depthTest = true) => new THREE.ShaderMaterial({
    uniforms: { map: { value: tex(c) }, uOpacity: { value: opacity } },
    vertexShader: PLAIN_VS, fragmentShader: GLYPH_FS,
    transparent: true, depthWrite: false, depthTest, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
  // a text card: a plane sized from its canvas; billboards face the camera every frame
  const glyph = (c: HTMLCanvasElement, height: number, opacity = 1, depthTest = true) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry((height * c.width) / c.height, height), glyphMat(c, opacity, depthTest));
    m.userData.baseOpacity = opacity;
    m.userData.baseScale = 1;
    return m;
  };
  const setOpacity = (m: THREE.Mesh, v: number) => { ((m.material as THREE.ShaderMaterial).uniforms.uOpacity.value = v); };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 120);
  camera.layers.enable(BLOOM);
  scene.add(camera);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.8;

  // background (layer 0 only: never blooms)
  const bgMat = new THREE.ShaderMaterial({
    depthWrite: false, depthTest: false,
    uniforms: { uAspect: { value: 1 }, uRes: { value: new THREE.Vector2(1, 1) }, uGlow: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: BG_FS,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -1000;
  scene.add(bg);

  // lights
  scene.add(new THREE.HemisphereLight(0x8fe4f2, 0x081216, 0.7));
  const lensLight = new THREE.PointLight(0x5ee6f5, 36, 16, 1.4);
  lensLight.position.copy(LENS).addScaledVector(AXIS, 1.4);
  scene.add(lensLight);
  const key = new THREE.DirectionalLight(0xd8f6ff, 1.5);
  key.position.set(1, 7, 9);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5ee6f5, 1.2);
  rim.position.set(12, 3, -6);
  scene.add(rim);

  const billboards: THREE.Mesh[] = [];

  // ---------- signals (left) ----------
  const named = signals.map((s, i) => ({ s, i })).filter(({ s }) => s.kind !== 'icon');
  const signalMeshes: THREE.Mesh[] = [];
  const iconMeshes: THREE.Mesh[] = [];
  signals.forEach((s, i) => {
    let c: HTMLCanvasElement;
    let h: number;
    if (s.kind === 'company') { c = P.label(s.text, { size: 60, color: P.C.ink, boxed: true, weight: 500 }); h = 0.95; }
    else if (s.kind === 'icon') { c = P.label('', { size: 64, icon: s.icon, color: 'rgba(170, 210, 220, 0.55)' }); h = 0.8; }
    else if (s.kind === 'statute') { c = P.label(s.text, { size: 56, icon: s.icon, color: s.hot ? P.C.green : 'rgba(214, 234, 239, 0.86)', glow: s.hot ? 'rgba(79, 227, 168, 0.55)' : undefined, weight: s.hot ? 600 : 500 }); h = 0.72; }
    else { c = P.label(s.text, { size: 50, icon: s.icon, color: 'rgba(196, 222, 229, 0.72)' }); h = 0.66; }
    const m = glyph(c, h, s.kind === 'icon' ? 0.5 : 0.95);
    m.position.set(s.at[0] * SPREAD, s.at[1], s.at[2]);
    m.userData.index = i;
    m.userData.phase = rand() * Math.PI * 2;
    (s.kind !== 'icon' ? signalMeshes : iconMeshes).push(m);
    billboards.push(m);
    scene.add(m);
  });

  // ---------- streams into the lens ----------
  // few enough that each strand reads as a line from a signal, not a mass: about seven per signal plus a
  // sparse ambient field (every eighth strand starts somewhere unnamed)
  const SEG = mobile ? 40 : 64;
  const N_IN = mobile ? 60 : 96;
  const inCurves: { p: THREE.Vector3[]; g: number }[] = [];
  for (let i = 0; i < N_IN; i++) {
    const src = named[i % named.length];
    const start = V(src.s.at[0] * SPREAD, src.s.at[1], src.s.at[2]).add(V(jitter(0.8), jitter(0.5), jitter(0.8)));
    if (i % 8 === 0) start.set(-10 + rand() * 6.4, -3.4 + rand() * 6.8, -3 + rand() * 4);
    const rel = start.y - LENS.y;
    const p3 = LENS.clone().addScaledVector(AXIS, -0.08).add(inPlane(jitter(0.16), jitter(0.16)));
    const p2 = LENS.clone().addScaledVector(AXIS, -2.6).add(inPlane(rel * 0.18 + jitter(0.12), (start.z - LENS.z) * 0.12 + jitter(0.12)));
    const p1 = start.clone().lerp(p2, 0.42).add(V(jitter(0.4), rel * 0.18 + jitter(0.3), jitter(0.5)));
    inCurves.push({ p: [start, p1, p2, p3], g: src.i });
  }

  // ---------- laptop (right) ----------
  const laptop = new THREE.Group();
  laptop.position.copy(LAPTOP);
  laptop.rotation.y = LAPTOP_YAW;
  laptop.scale.setScalar(LAPTOP_SCALE);
  scene.add(laptop);
  const metal = new THREE.MeshStandardMaterial({ color: 0x46535a, metalness: 0.86, roughness: 0.44, envMapIntensity: 0.65 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x0d1417, metalness: 0.4, roughness: 0.55 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x1a2328, metalness: 0.2, roughness: 0.7 });
  const occluders: THREE.Mesh[] = [];
  const occlude = <T extends THREE.Mesh>(m: T) => { m.layers.enable(BLOOM); occluders.push(m); return m; };
  const base = occlude(new THREE.Mesh(new RoundedBoxGeometry(4.7, 0.16, 3.15, 4, 0.07), metal));
  base.position.y = 0.08;
  laptop.add(base);
  const well = occlude(new THREE.Mesh(new THREE.PlaneGeometry(4.1, 1.55), deckMat));
  well.rotation.x = -Math.PI / 2;
  well.position.set(0, 0.162, -0.5);
  laptop.add(well);
  const keycaps = occlude(new THREE.InstancedMesh(new RoundedBoxGeometry(0.24, 0.04, 0.22, 2, 0.02), keyMat, 14 * 5));
  const m4 = new THREE.Matrix4();
  for (let r = 0; r < 5; r++) for (let k = 0; k < 14; k++) {
    m4.makeTranslation(-1.82 + k * 0.28, 0.18, -1.08 + r * 0.29);
    keycaps.setMatrixAt(r * 14 + k, m4);
  }
  laptop.add(keycaps);
  const pad = occlude(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), new THREE.MeshStandardMaterial({ color: 0x46535a, metalness: 0.85, roughness: 0.4 })));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.163, 0.85);
  laptop.add(pad);
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.16, -1.52);
  hinge.rotation.x = -0.2;
  laptop.add(hinge);
  const lid = occlude(new THREE.Mesh(new RoundedBoxGeometry(4.7, 3.05, 0.1, 4, 0.05), metal));
  lid.position.set(0, 1.525, 0);
  hinge.add(lid);
  const bezel = occlude(new THREE.Mesh(new THREE.PlaneGeometry(4.56, 2.92), new THREE.MeshStandardMaterial({ color: 0x05080a, metalness: 0.2, roughness: 0.25 })));
  bezel.position.set(0, 1.525, 0.052);
  hinge.add(bezel);
  const screenCanvas = P.briefingScreen();
  const screen = occlude(new THREE.Mesh(
    new THREE.PlaneGeometry(4.3, (4.3 * screenCanvas.height) / screenCanvas.width),
    new THREE.MeshBasicMaterial({ map: tex(screenCanvas, false), toneMapped: false }),
  ));
  screen.position.set(0, 1.56, 0.056);
  hinge.add(screen);
  const screenGlow = new THREE.PointLight(0x5ee6f5, 4, 4, 2);
  screenGlow.position.set(0, 1.4, 0.9);
  hinge.add(screenGlow);
  laptop.updateMatrixWorld(true);

  const screenPoint = (u: number, v: number) => screen.localToWorld(V(u * 2.1, v * 1.34, 0.02));
  const screenNormal = V(0, 0, 1).applyQuaternion(screen.getWorldQuaternion(new THREE.Quaternion()));

  // floating evidence cards, in the laptop's frame
  const cards: THREE.Mesh[] = [];
  const cardDefs: [P.CardKind, number, [number, number, number], number][] = [
    ['risk', 0.86, [-2.75, 2.5, -1.0], 0.12],
    ['vppa', 0.36, [-2.6, 1.15, -0.85], 0.1],
    ['time', 0.3, [-2.3, 0.42, -0.55], 0.08],
    ['events', 0.36, [1.45, 3.45, -1.3], -0.06],
    ['exposure', 0.78, [2.55, 2.15, -0.95], -0.12],
    ['remediation', 1.4, [2.45, 0.8, -0.7], -0.14],
  ];
  cardDefs.forEach(([kind, h, at, yaw]) => {
    const m = glyph(P.card(kind), h);
    m.position.set(...at);
    m.rotation.y = yaw;
    m.userData.base = m.position.clone();
    m.userData.phase = rand() * Math.PI * 2;
    laptop.add(m);
    cards.push(m);
  });

  // ---------- out streams: lens → screen ----------
  const N_OUT = mobile ? 20 : 34;
  const outCurves: { p: THREE.Vector3[]; g: number }[] = [];
  for (let i = 0; i < N_OUT; i++) {
    const p0 = LENS.clone().addScaledVector(AXIS, 0.12).add(inPlane(jitter(0.2), jitter(0.2)));
    const p3 = screenPoint(jitter(0.95), jitter(0.9)).addScaledVector(screenNormal, 0.25);
    const p1 = LENS.clone().addScaledVector(AXIS, 1.8).add(inPlane(jitter(0.45), jitter(0.45)));
    const p2 = p3.clone().addScaledVector(screenNormal, 1.4 + rand()).add(V(jitter(0.4), jitter(0.4), 0));
    outCurves.push({ p: [p0, p1, p2, p3], g: -1 });
  }

  function streamMesh(curves: { p: THREE.Vector3[]; g: number }[], colA: string, colB: string, reverse: number, intensity: number) {
    const pos = new Float32Array(curves.length * SEG * 2 * 3);
    const aT = new Float32Array(curves.length * SEG * 2);
    const aSeed = new Float32Array(curves.length * SEG * 2);
    const aGroup = new Float32Array(curves.length * SEG * 2);
    const tmp = new THREE.Vector3();
    let k = 0;
    curves.forEach(({ p, g }) => {
      const seed = rand();
      for (let s = 0; s < SEG; s++) {
        for (const t of [s / SEG, (s + 1) / SEG]) {
          bez(p[0], p[1], p[2], p[3], t, tmp);
          pos.set([tmp.x, tmp.y, tmp.z], k * 3);
          aT[k] = t; aSeed[k] = seed; aGroup[k] = g;
          k++;
        }
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    geo.setAttribute('aGroup', new THREE.BufferAttribute(aGroup, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: STREAM_VS, fragmentShader: STREAM_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uIntensity: { value: intensity }, uReverse: { value: reverse }, uHover: { value: -99 },
        uColA: { value: new THREE.Color(colA) }, uColB: { value: new THREE.Color(colB) },
        uFogNear: { value: 26 }, uFogFar: { value: 60 },
      },
    });
    const lines = new THREE.LineSegments(geo, mat);
    lines.frustumCulled = false;
    lines.layers.enable(BLOOM);
    scene.add(lines);
    return mat;
  }
  // fewer strands, each a little brighter, so the dark theme keeps its glow without the mass
  const IN_I = mobile ? 0.9 : 0.8;
  const OUT_I = 0.55;
  const inMat = streamMesh(inCurves, '#0a6f86', '#d8fbff', 0, IN_I);
  const outMat = streamMesh(outCurves, '#0b7f96', '#d8fbff', 1, OUT_I);

  // luminous volume along the flow: soft glows that thicken the streams into a sheet of light (no bloom)
  const glowTex = (() => {
    const { c, ctx } = P.canvas(128, 128, 2);
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(150, 240, 255, 1)');
    g.addColorStop(0.35, 'rgba(60, 200, 225, 0.45)');
    g.addColorStop(1, 'rgba(20, 120, 150, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return tex(c, false);
  })();
  const haze: THREE.Sprite[] = [];
  const hazeLine = (from: THREE.Vector3, via: THREE.Vector3, to: THREE.Vector3, n: number, size: [number, number], opacity: number) => {
    const curve = new THREE.QuadraticBezierCurve3(from, via, to);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false }));
      const k = size[0] + (size[1] - size[0]) * t;
      s.scale.set(k * 1.6, k, 1);
      s.position.copy(curve.getPoint(t));
      s.userData.base = s.scale.clone();
      s.userData.phase = rand() * 6.28;
      s.userData.opacity = opacity * (0.35 + 0.9 * Math.sin(Math.PI * t) * (1 - 0.55 * t));
      scene.add(s);
      haze.push(s);
    }
  };
  hazeLine(V(-6.4, 0.2, 0), V(-3.0, 0.1, 0), LENS.clone().addScaledVector(AXIS, -0.5), mobile ? 7 : 12, [4.2, 1.1], 0.08);
  hazeLine(V(-6.8, 1.7, -0.5), V(-3.2, 1.0, -0.4), LENS.clone().addScaledVector(AXIS, -0.7), mobile ? 4 : 8, [3.2, 1.0], 0.055);
  hazeLine(V(-6.6, -1.7, 0.4), V(-3.2, -1.0, 0.3), LENS.clone().addScaledVector(AXIS, -0.7), mobile ? 4 : 8, [3.2, 1.0], 0.055);

  function particles(curves: { p: THREE.Vector3[]; g: number }[], count: number, color: string, intensity: number, end = 0.8) {
    const a = { p0: new Float32Array(count * 3), p1: new Float32Array(count * 3), p2: new Float32Array(count * 3), p3: new Float32Array(count * 3) };
    const phase = new Float32Array(count), speed = new Float32Array(count), group = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const c = curves[i % curves.length];
      c.p[0].toArray(a.p0, i * 3); c.p[1].toArray(a.p1, i * 3); c.p[2].toArray(a.p2, i * 3); c.p[3].toArray(a.p3, i * 3);
      phase[i] = rand(); speed[i] = 0.05 + rand() * 0.09; group[i] = c.g;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('aP0', new THREE.BufferAttribute(a.p0, 3));
    geo.setAttribute('aP1', new THREE.BufferAttribute(a.p1, 3));
    geo.setAttribute('aP2', new THREE.BufferAttribute(a.p2, 3));
    geo.setAttribute('aP3', new THREE.BufferAttribute(a.p3, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    geo.setAttribute('aGroup', new THREE.BufferAttribute(group, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VS, fragmentShader: PARTICLE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uHover: { value: -99 }, uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity }, uEnd: { value: end } },
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.layers.enable(BLOOM);
    scene.add(pts);
    return mat;
  }
  const IN_DOTS = 0.75, OUT_DOTS = 0.55;
  const inDots = particles(inCurves, mobile ? 200 : 420, '#9ff3ff', IN_DOTS);
  const outDots = particles(outCurves, mobile ? 30 : 60, '#bff7ff', OUT_DOTS, 0.5);

  // ---------- the lens ----------
  const lens = new THREE.Group();
  lens.position.copy(LENS);
  lens.quaternion.setFromUnitVectors(V(0, 0, 1), AXIS);
  scene.add(lens);
  const ringMat = (color: string, opacity: number, dash = 0, duty = 1, arcs = 0, arcDuty = 1) => new THREE.ShaderMaterial({
    vertexShader: RING_VS, fragmentShader: RING_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uDash: { value: dash }, uDuty: { value: duty }, uArcs: { value: arcs }, uArcDuty: { value: arcDuty } },
  });
  const rings: { mesh: THREE.Mesh; spin: number }[] = [];
  const ring = (r: number, w: number, mat: THREE.ShaderMaterial, spin: number, z = 0) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(r - w / 2, r + w / 2, 384, 1), mat);
    m.position.z = z;
    m.layers.enable(BLOOM);
    lens.add(m);
    rings.push({ mesh: m, spin });
    return m;
  };
  ring(0.98, 0.04, ringMat('#9ff6ff', 1.5), 0.05);
  ring(1.2, 0.022, ringMat('#5ee6f5', 1.15, 64, 0.55), -0.12);
  ring(1.48, 0.06, ringMat('#5ee6f5', 0.7, 0, 1, 3, 0.22), 0.18);
  ring(1.72, 0.014, ringMat('#7ff0ff', 0.8), 0);
  ring(2.05, 0.036, ringMat('#9ff6ff', 1.15, 0, 1, 4, 0.16), -0.08);
  ring(2.32, 0.012, ringMat('#5ee6f5', 0.6, 120, 0.4), 0.04);
  ring(2.75, 0.01, ringMat('#5ee6f5', 0.36), 0);
  ring(3.15, 0.008, ringMat('#5ee6f5', 0.24, 180, 0.5), -0.02);
  for (let i = 0; i < 9; i++) ring(0.32 + i * 0.045, 0.012, ringMat('#7ff0ff', 0.7 - i * 0.05), 0, -0.12 - i * 0.16);
  const ticks = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.012, 0.1), new THREE.MeshBasicMaterial({ color: 0x5ee6f5, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 120);
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const len = i % 10 === 0 ? 1.8 : 1;
    m4.compose(V(Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0), new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), a - Math.PI / 2), V(1, len, 1));
    ticks.setMatrixAt(i, m4);
  }
  ticks.layers.enable(BLOOM);
  const tickHolder = new THREE.Group();
  tickHolder.add(ticks);
  lens.add(tickHolder);
  const coreMat = new THREE.ShaderMaterial({
    vertexShader: PLAIN_VS, fragmentShader: CORE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uIntensity: { value: 1 }, uTime: { value: 0 } },
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), coreMat);
  core.layers.enable(BLOOM);
  lens.add(core);
  const capDots = new THREE.Group();
  lens.add(capDots);
  const dotGeo = new THREE.CircleGeometry(0.045, 24);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xbff7ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  capabilities.forEach((c) => {
    const a = (c.angle * Math.PI) / 180;
    const d = new THREE.Mesh(dotGeo, dotMat);
    d.position.set(Math.cos(a) * 2.05, Math.sin(a) * 2.05, 0.01);
    d.layers.enable(BLOOM);
    capDots.add(d);
  });

  const capMeshes = capabilities.map((c) => {
    const a = (c.angle * Math.PI) / 180;
    const m = glyph(P.label(c.text, { size: 50, color: 'rgba(120, 236, 250, 0.98)', weight: 500 }), 0.62, 0.9);
    const half = (m.geometry as THREE.PlaneGeometry).parameters.width / 2;
    m.position.set(LENS.x + Math.cos(a) * 2.2 + Math.sign(Math.round(Math.cos(a) * 10)) * half * 0.85, LENS.y + Math.sin(a) * 3.05, 0.4);
    billboards.push(m);
    scene.add(m);
    return m;
  });
  const mark = glyph(P.wordmark(), 0.99, 1, false);
  mark.position.copy(LENS).add(V(-0.35, 0.22, 1.4));
  mark.renderOrder = 20;
  billboards.push(mark);
  scene.add(mark);
  // in the glow pass the wordmark is a black letter mask, so bloom from the core can't wash over it
  mark.layers.enable(BLOOM);
  const markMat = mark.material as THREE.ShaderMaterial;
  const markMask = new THREE.ShaderMaterial({
    uniforms: { map: markMat.uniforms.map, uOpacity: markMat.uniforms.uOpacity },
    vertexShader: PLAIN_VS,
    fragmentShader: 'uniform sampler2D map; uniform float uOpacity; varying vec2 vUv; void main(){ float a = texture2D(map, vUv).a; gl_FragColor = vec4(0.0, 0.0, 0.0, min(1.0, a * 1.4) * uOpacity); }',
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });

  // ---------- decisions (far right) ----------
  const decide = new THREE.Group();
  decide.position.copy(DECIDE);
  decide.rotation.y = -0.22;
  decide.scale.setScalar(1.12);
  scene.add(decide);
  const header = glyph(P.decisionHeader(), 0.5);
  header.position.set(0.15, 1.65, 0);
  decide.add(header);
  const items = decisions.map((d, i) => {
    const m = glyph(P.decisionItem(d), 0.52, 0.9);
    const w = (m.geometry as THREE.PlaneGeometry).parameters.width;
    m.position.set(-0.95 + w / 2, 0.95 - i * 0.68, 0);
    m.userData.x = m.position.x;
    decide.add(m);
    return m;
  });

  // ---------- post: selective bloom + MSAA final ----------
  const clampPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uMax: { value: 1.35 } },
    vertexShader: PLAIN_VS,
    fragmentShader: 'uniform sampler2D tDiffuse; uniform float uMax; varying vec2 vUv; void main(){ vec3 x = max(texture2D(tDiffuse, vUv).rgb, vec3(0.0)); float m = max(max(x.r, x.g), x.b); gl_FragColor = vec4(m > uMax ? x * (uMax / m) : x, 1.0); }',
  });
  const bloomComposer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }));
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(new RenderPass(scene, camera));
  bloomComposer.addPass(clampPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 1.1, 0.38, 0.0);
  bloomComposer.addPass(bloom);

  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: mobile ? 0 : 4 }));
  composer.addPass(new RenderPass(scene, camera));
  const mixPass = new ShaderPass(new THREE.ShaderMaterial({
    uniforms: { baseTexture: { value: null }, bloomTexture: { value: null }, uBloom: { value: 1 } },
    vertexShader: PLAIN_VS,
    fragmentShader: 'uniform sampler2D baseTexture; uniform sampler2D bloomTexture; uniform float uBloom; varying vec2 vUv; void main(){ vec4 b = texture2D(baseTexture, vUv); gl_FragColor = vec4(b.rgb + texture2D(bloomTexture, vUv).rgb * uBloom, 1.0); }',
  }), 'baseTexture');
  composer.addPass(mixPass);
  composer.addPass(new OutputPass());
  const inkPass = new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: PLAIN_VS, fragmentShader: INK_FS });
  composer.addPass(inkPass);
  let light = false;
  const applyTheme = () => {
    light = document.documentElement.dataset.theme === 'light';
    inkPass.enabled = light;
    bgMat.uniforms.uGlow.value = (light ? LIGHT_GLOW : NO_DIM).ground;
  };
  applyTheme();
  addEventListener('privaini:theme', applyTheme);
  const black = new THREE.MeshBasicMaterial({ color: 0x000000 });

  function render(dt: number) {
    // 1. light sources only, with the laptop as a black occluder
    occluders.forEach((m) => { m.userData.mat = m.material; m.material = black; });
    mark.material = markMask;
    camera.layers.set(BLOOM);
    renderer.setClearColor(0x000000, 1);
    bloomComposer.render(dt);
    occluders.forEach((m) => { m.material = m.userData.mat; });
    mark.material = markMat;
    // 2. the full scene, sharp, plus only the glow
    camera.layers.set(0);
    camera.layers.enable(BLOOM);
    renderer.setClearColor(BG, 1);
    mixPass.uniforms.bloomTexture.value = bloom.renderTargetsHorizontal[0].texture;
    composer.render(dt);
  }

  // ---------- camera rig ----------
  type Shot = { target: THREE.Vector3; dir: THREE.Vector3; width: number; fov: number; mWidth?: number; mTarget?: THREE.Vector3 };
  const screenCenter = screen.getWorldPosition(new THREE.Vector3());
  const shots: Shot[] = [
    { target: V(1.7, -0.9, 0), dir: V(0, 0.05, 1).normalize(), width: 25.4, fov: 38, mWidth: 10.5, mTarget: V(-0.6, -1.4, 0) },
    { target: V(-4.9, -0.1, 0), dir: V(0.3, 0.06, 1).normalize(), width: 13.2, fov: 38, mWidth: 7.4, mTarget: V(-6.4, 0.2, 0) },
    { target: LENS.clone(), dir: AXIS.clone().negate().add(V(0, 0.08, 0)).normalize(), width: 7.8, fov: 42, mWidth: 6.6 },
    { target: screenCenter.clone(), dir: AXIS.clone().negate(), width: 0, fov: 60 },
    { target: screenCenter.clone().add(V(0.1, -0.15, 0)), dir: V(-0.4, 0.1, 1).normalize(), width: 11.5, fov: 36, mWidth: 7.2 },
    { target: DECIDE.clone().add(V(-1.3, 0.0, 0)), dir: V(0.1, 0.05, 1).normalize(), width: 10.5, fov: 36, mWidth: 5.6, mTarget: DECIDE.clone().add(V(0.2, 0.9, 0)) },
  ];
  const keys: [number, number][] = [[0, 0], [0.2, 1], [0.42, 2], [0.52, 3], [0.72, 4], [0.9, 5], [1, 5]];
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();
  let aspect = 1;
  const shotPose = (i: number, pos: THREE.Vector3, tgt: THREE.Vector3) => {
    const s = shots[i];
    const narrow = aspect < 0.9;
    tgt.copy(narrow && s.mTarget ? s.mTarget : s.target);
    if (i === 3) { pos.copy(LENS).addScaledVector(AXIS, 0.45); return s.fov; }
    const width = narrow && s.mWidth ? s.mWidth : s.width;
    const fov = narrow ? s.fov + 8 : s.fov;
    const halfV = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const dist = Math.max(width / 2 / (halfV * aspect), 2.5);
    pos.copy(tgt).addScaledVector(s.dir, dist);
    return fov;
  };
  const pA = new THREE.Vector3(), tA = new THREE.Vector3(), pB = new THREE.Vector3(), tB = new THREE.Vector3();
  let progress = 0, smoothP = 0;
  const pointer = new THREE.Vector2(), pointerS = new THREE.Vector2();
  let hover = -99;
  let time = 0;

  function pose(p: number) {
    let k = 0;
    while (k < keys.length - 2 && p > keys[k + 1][0]) k++;
    const [p0, s0] = keys[k], [p1, s1] = keys[k + 1];
    const t = ease(Math.min(1, Math.max(0, (p - p0) / (p1 - p0))));
    const f0 = shotPose(s0, pA, tA), f1 = shotPose(s1, pB, tB);
    camPos.lerpVectors(pA, pB, t);
    camTgt.lerpVectors(tA, tB, t);
    return f0 + (f1 - f0) * t;
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    aspect = w / h;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    bloomComposer.setPixelRatio(pr * (mobile ? 0.5 : 0.6));
    bloomComposer.setSize(w, h);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    bgMat.uniforms.uAspect.value = aspect;
    bgMat.uniforms.uRes.value.set(w * pr, h * pr);
    const scale = (h * pr) / 26;
    inDots.uniforms.uScale.value = scale;
    outDots.uniforms.uScale.value = scale;
  }

  // adaptive resolution: hold the frame rate by trading pixel density, never below 1×
  let sampleT = 0, sampleN = 0, settleFrames = 0;
  const adapt = (dt: number) => {
    if (settleFrames > 0) { settleFrames--; return; }
    sampleT += dt; sampleN++;
    if (sampleN < 90) return;
    const avg = sampleT / sampleN;
    sampleT = 0; sampleN = 0;
    const next = avg > 1 / 40 ? Math.max(1, pr - 0.25) : avg < 1 / 57 ? Math.min(MAX_PR, pr + 0.25) : pr;
    if (next !== pr) { pr = next; resize(); settleFrames = 30; }
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function frame(dt: number) {
    time += dt;
    smoothP += (progress - smoothP) * (1 - Math.exp(-dt / 0.12));
    pointerS.lerp(pointer, 1 - Math.exp(-dt / 0.35));
    const fov = pose(smoothP);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
    const right = V(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = V(0, 1, 0).applyQuaternion(camera.quaternion);
    const amt = 0.35 * (1 - smooth(0.44, 0.52, smoothP) * (1 - smooth(0.52, 0.6, smoothP)));
    camera.position.addScaledVector(right, pointerS.x * amt).addScaledVector(up, pointerS.y * amt * 0.6);
    camera.lookAt(camTgt);
    camera.updateMatrixWorld();

    // act emphasis
    const a1 = smooth(0.08, 0.2, smoothP) * (1 - smooth(0.3, 0.4, smoothP));
    const a2 = smooth(0.3, 0.42, smoothP) * (1 - smooth(0.55, 0.65, smoothP));
    const a3 = smooth(0.58, 0.72, smoothP) * (1 - smooth(0.82, 0.9, smoothP));
    const a4 = smooth(0.82, 0.92, smoothP);
    const through = 1 - Math.min(1, camera.position.distanceTo(LENS) / 1.6);

    inMat.uniforms.uTime.value = time;
    outMat.uniforms.uTime.value = time;
    inDots.uniforms.uTime.value = time;
    outDots.uniforms.uTime.value = time;
    // in the light print the brightest light becomes the darkest ink, so the light sources run softer there:
    // the beam reads as a teal wash rather than a dark mass, while type and cards keep full contrast
    const g = light ? LIGHT_GLOW : NO_DIM;
    inMat.uniforms.uIntensity.value = IN_I * (1 + a1 * 0.4) * g.streams;
    outMat.uniforms.uIntensity.value = OUT_I * (1 - a3 * 0.45) * g.streams;
    inDots.uniforms.uIntensity.value = IN_DOTS * g.dots;
    outDots.uniforms.uIntensity.value = OUT_DOTS * g.dots;
    coreMat.uniforms.uTime.value = time;
    coreMat.uniforms.uIntensity.value = (1 + through * 0.6) * (1 - a2 * 0.3) * g.core;
    mixPass.uniforms.uBloom.value = (0.95 + through * 0.4) * (1 - a2 * 0.4) * g.bloom;

    rings.forEach(({ mesh, spin }) => { mesh.rotation.z += spin * dt * (1 + a2 * 1.5); });
    tickHolder.rotation.z -= dt * 0.05;
    capDots.rotation.z += dt * 0.03;
    lens.quaternion.setFromUnitVectors(V(0, 0, 1), AXIS);
    lens.rotateX(-pointerS.y * 0.05);
    lens.rotateY(pointerS.x * 0.06);

    billboards.forEach((b) => b.quaternion.copy(camera.quaternion));
    const dist = (o: THREE.Object3D) => camera.position.distanceTo(o.getWorldPosition(tmpV));
    const near = (o: THREE.Object3D) => smooth(3.2, 7.5, dist(o));
    iconMeshes.forEach((m) => setOpacity(m, m.userData.baseOpacity * near(m)));
    signalMeshes.forEach((m) => {
      const hot = m.userData.index === hover ? 1 : 0;
      setOpacity(m, Math.min(1, m.userData.baseOpacity * (0.8 + a1 * 0.25) + hot * 0.3) * near(m));
      m.scale.setScalar(1 + hot * 0.12);
      m.position.y = signals[m.userData.index].at[1] + Math.sin(time * 0.6 + m.userData.phase) * 0.05;
    });
    // the lens's own labels belong to the lens: hidden while the camera is among the signals
    capMeshes.forEach((m, i) => setOpacity(m, (0.78 + a2 * 0.22 + Math.sin(time * 1.3 + i) * 0.04) * near(m) * (1 - a1) * (1 - (a3 + a4) * 0.85)));
    setOpacity(mark, smooth(0.8, 2.2, dist(mark)) * (1 - through) * (1 - a1));
    cards.forEach((c) => {
      c.position.y = c.userData.base.y + Math.sin(time * 0.8 + c.userData.phase) * 0.05;
      c.position.z = c.userData.base.z + a3 * 0.25;
    });
    items.forEach((m, i) => {
      const on = smooth(0.8 + i * 0.022, 0.84 + i * 0.022, smoothP);
      setOpacity(m, 0.78 + 0.22 * Math.max(on, 1 - a4));
      m.position.x = m.userData.x + (1 - on) * a4 * 0.15;
    });
    header.position.y = 1.65 + Math.sin(time * 0.7) * 0.03;
    haze.forEach((s) => {
      const k = 1 + Math.sin(time * 0.9 + s.userData.phase) * 0.08;
      s.scale.set(s.userData.base.x * k, s.userData.base.y * k, 1);
      (s.material as THREE.SpriteMaterial).opacity = s.userData.opacity * (1 + a1 * 0.3) * (1 - a2 * 0.85) * (1 - through) * smooth(5, 13, dist(s)) * g.haze;
    });

    render(dt);
    adapt(dt);
  }
  const tmpV = new THREE.Vector3();

  resize();
  frame(0);

  return {
    setProgress(p) { progress = Math.min(1, Math.max(0, p)); },
    setPointer(x, y) { pointer.set(x, y); },
    pick(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(signalMeshes, false)[0];
      if (!hit) return null;
      const index = hit.object.userData.index as number;
      return { index, signal: signals[index] };
    },
    setHover(index) {
      hover = index ?? -99;
      inMat.uniforms.uHover.value = hover;
      inDots.uniforms.uHover.value = hover;
    },
    resize,
    frame,
    dispose() {
      removeEventListener('privaini:theme', applyTheme);
      renderer.dispose();
      pmrem.dispose();
      composer.dispose();
      bloomComposer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
    },
  };
}
