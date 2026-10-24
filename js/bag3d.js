/**
 * SPARSH 3D paper-bag engine (three.js, self-hosted in assets/vendor).
 *
 * Everything is procedural: kraft paper texture, folded gussets, bottom creases,
 * twisted-rope handles, soft shadows. Your logo is printed onto the front/back
 * as a texture, so replacing assets/logo/logo-mark.png (or uploading a logo in the
 * Bag Studio) changes every bag.
 *
 *   BagStage      live canvas (drag to rotate) or off-screen renderer
 *   renderSnapshots(list)  -> blob URLs (used for product cards)
 *   loadLogo(url | File)   -> prepared logo canvas
 */
import * as THREE from "../assets/vendor/three.module.min.js";

/* ------------------------------------------------------------------ */
/*  Presets (all edit-in-one-place)                                    */
/* ------------------------------------------------------------------ */
export const PAPERS = {
  kraft: { label: "Natural Kraft", base: "#C69A68", inner: "#8f6a41", rope: "#B58450", multiply: true },
  white: { label: "Ivory White", base: "#EDE5D6", inner: "#cfc6b4", rope: "#E2D9C6", multiply: true },
  forest: { label: "Forest Green", base: "#17382A", inner: "#0c2017", rope: "#C79F62", multiply: false, ink: "#D7AE70" },
};

export const BAG_TYPES = {
  handle:   { label: "Paper Handle Bag", W: 1.0,  H: 1.12, D: 0.46, handle: "rope",   crease: "flat", rise: 0.36 },
  sos:      { label: "SOS Paper Bag",    W: 0.74, H: 1.3,  D: 0.42, handle: null,     crease: "flat" },
  vbottom:  { label: "V-Bottom Bag",     W: 0.68, H: 1.26, D: 0.34, handle: null,     crease: "v" },
  boutique: { label: "Boutique Bag",     W: 1.08, H: 0.9,  D: 0.42, handle: "ribbon", crease: "flat", rise: 0.3 },
};

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
const rngFor = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

/** Kraft-like paper: mottling, fibres, flecks */
function paperCanvas(base, w, h, seed, flecks = 1) {
  const c = makeCanvas(w, h), g = c.getContext("2d"), r = rngFor(seed);
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const s = Math.max(w, h);
  for (let i = 0; i < 70; i++) {
    const x = r() * w, y = r() * h, rad = s * (0.05 + r() * 0.12);
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, r() < 0.5 ? "rgba(255,240,215,.025)" : "rgba(60,34,8,.025)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.lineWidth = 1;
  const n = Math.round((w * h) / 120);
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, len = 5 + r() * 24, a = (r() - 0.5) * 2.6;
    g.strokeStyle = r() < 0.55 ? `rgba(70,40,12,${0.04 + r() * 0.07})` : `rgba(255,246,228,${0.05 + r() * 0.09})`;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  for (let i = 0; i < 280 * flecks; i++) {
    g.fillStyle = `rgba(55,30,8,${0.1 + r() * 0.22})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 1.4);
  }
  return c;
}

function crease(g, y, w, strength = 1) {
  g.fillStyle = `rgba(45,25,5,${0.16 * strength})`; g.fillRect(0, y, w, 2.2);
  g.fillStyle = `rgba(255,243,222,${0.2 * strength})`; g.fillRect(0, y + 2.2, w, 2);
  const sh = g.createLinearGradient(0, y - 22, 0, y);
  sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, `rgba(40,22,4,${0.07 * strength})`);
  g.fillStyle = sh; g.fillRect(0, y - 22, w, 22);
}

/* ---------- logo preparation (upload or file) ---------- */
export function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("image failed"));
    i.src = src;
  });
}

/** Makes any logo usable: downsizes and removes a plain light background. */
export async function loadLogo(source) {
  let url = source, revoke = false;
  if (source instanceof Blob) { url = URL.createObjectURL(source); revoke = true; }
  const img = await loadImage(url);
  if (revoke) URL.revokeObjectURL(url);
  const max = 900, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(2, Math.round(img.naturalWidth * k)), h = Math.max(2, Math.round(img.naturalHeight * k));
  const c = makeCanvas(w, h), g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h), px = d.data;
  const corner = (x, y) => { const i = (y * w + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
  const cs = [corner(0, 0), corner(w - 1, 0), corner(0, h - 1), corner(w - 1, h - 1)];
  const hasAlpha = cs.some((p) => p[3] < 200);
  if (!hasAlpha) {
    const bg = [0, 1, 2].map((i) => cs.reduce((a, p) => a + p[i], 0) / 4);
    if (Math.min(...bg) > 170) {
      for (let i = 0; i < px.length; i += 4) {
        // colour-to-alpha against the light background
        let a = 0;
        for (let k2 = 0; k2 < 3; k2++) a = Math.max(a, Math.min(1, Math.max(0, (bg[k2] - px[i + k2]) / bg[k2])));
        a = Math.min(1, Math.max(0, (a - 0.05) / 0.45));
        if (a > 0.01) for (let k2 = 0; k2 < 3; k2++) px[i + k2] = Math.max(0, Math.min(255, bg[k2] - (bg[k2] - px[i + k2]) / a));
        px[i + 3] = a * 255;
      }
      g.putImageData(d, 0, 0);
    }
  }
  return c;
}

function tinted(logo, color) {
  const c = makeCanvas(logo.width, logo.height), g = c.getContext("2d");
  g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = "destination-in"; g.drawImage(logo, 0, 0);
  return c;
}

function printLogo(g, w, h, logo, paper, cfg) {
  if (!logo) return;
  const maxW = w * (cfg.scale ?? 0.6), maxH = h * (cfg.maxH ?? 0.46);
  let lw = maxW, lh = (maxW * logo.height) / logo.width;
  if (lh > maxH) { lh = maxH; lw = (maxH * logo.width) / logo.height; }
  const x = (w - lw) / 2, y = h * (cfg.y ?? 0.5) - lh / 2;
  g.save();
  if (paper.multiply) { g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.95; g.drawImage(logo, x, y, lw, lh); }
  else { g.globalAlpha = 0.97; g.drawImage(tinted(logo, paper.ink), x, y, lw, lh); }
  g.restore();
}

/* ------------------------------------------------------------------ */
/*  Geometry                                                           */
/* ------------------------------------------------------------------ */
function panelGeom(W, H, D, bulge, back) {
  const g = new THREE.PlaneGeometry(W, H, 32, 44), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / W + 0.5, v = p.getY(i) / H + 0.5;
    const ramp = Math.min(1, v / 0.14);                    // flat at the base
    const b = bulge * Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.85) * ramp * (0.8 + 0.5 * v);
    p.setXYZ(i, p.getX(i), v * H, D / 2 + b);
  }
  g.computeVertexNormals();
  if (back) g.rotateY(Math.PI);
  return g;
}

function sideGeom(W, H, D, depth, sign) {
  const ny = 36, pos = [], uv = [], idx = [];
  for (let j = 0; j <= ny; j++) {
    const v = j / ny, y = v * H;
    const c = depth * (1 - 0.38 * v) * (0.82 + 0.18 * Math.sin(Math.PI * Math.min(1, v * 1.3)));
    const xe = (sign * W) / 2;
    pos.push(xe, y, D / 2, xe - sign * c, y, 0, xe, y, -D / 2);
    uv.push(0, v, 0.5, v, 1, v);
  }
  for (let j = 0; j < ny; j++) {
    const a = j * 3, b = (j + 1) * 3;
    const q = [[a, a + 1, b + 1], [a, b + 1, b], [a + 1, a + 2, b + 2], [a + 1, b + 2, b + 1]];
    for (const t of q) idx.push(...(sign > 0 ? t : [t[0], t[2], t[1]]));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function ropeTexture(color) {
  const c = makeCanvas(64, 64), g = c.getContext("2d");
  g.fillStyle = color; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = "rgba(60,34,8,.38)"; g.lineWidth = 7;
  for (let i = -64; i < 128; i += 21) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); }
  g.strokeStyle = "rgba(255,244,222,.28)"; g.lineWidth = 3;
  for (let i = -54; i < 128; i += 21) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36, 1);
  return t;
}

function ribbonGeom(curve, width) {
  const pts = curve.getPoints(90), pos = [], idx = [], uv = [];
  pts.forEach((p, i) => {
    pos.push(p.x, p.y, p.z - width / 2, p.x, p.y, p.z + width / 2);
    uv.push(i / 90, 0, i / 90, 1);
    if (i < pts.length - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/*  Bag builder                                                        */
/* ------------------------------------------------------------------ */
export function buildBag(spec, aniso = 8) {
  const T = BAG_TYPES[spec.type] || BAG_TYPES.handle;
  const P = PAPERS[spec.paper] || PAPERS.kraft;
  const { W, H, D } = T;
  const group = new THREE.Group();
  const tex = (canvas, srgb = true) => {
    const t = new THREE.CanvasTexture(canvas);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    return t;
  };

  // --- front/back texture
  const cw = 1024, ch = Math.min(1500, Math.round((1024 * H) / W));
  const front = paperCanvas(P.base, cw, ch, 11);
  const fg = front.getContext("2d");
  crease(fg, ch * (T.crease === "v" ? 0.9 : 0.935), cw, 1);
  if (T.crease === "v") {
    fg.strokeStyle = "rgba(45,25,5,.18)"; fg.lineWidth = 2.4;
    fg.beginPath(); fg.moveTo(0, ch * 0.9); fg.lineTo(cw / 2, ch * 0.965); fg.lineTo(cw, ch * 0.9); fg.stroke();
    fg.strokeStyle = "rgba(255,243,222,.22)"; fg.lineWidth = 2;
    fg.beginPath(); fg.moveTo(0, ch * 0.9 + 3); fg.lineTo(cw / 2, ch * 0.965 + 3); fg.lineTo(cw, ch * 0.9 + 3); fg.stroke();
  }
  crease(fg, ch * 0.055, cw, 0.55);                         // top cuff fold
  const bumpC = makeCanvas(cw, ch); bumpC.getContext("2d").drawImage(front, 0, 0);
  if (spec.logo) printLogo(fg, cw, ch, spec.logo, P, { scale: spec.logoScale ?? (spec.type === "boutique" ? 0.5 : 0.58), y: spec.logoY ?? 0.5 });
  if (spec.foil) { fg.strokeStyle = "rgba(215,174,112,.9)"; fg.lineWidth = 3; fg.strokeRect(cw * 0.07, ch * 0.08, cw * 0.86, ch * 0.78); }
  const frontMap = tex(front), bump = tex(bumpC, false);
  const mat = (map, b) => new THREE.MeshStandardMaterial({ map, bumpMap: b, bumpScale: 0.9, roughness: 0.93, metalness: 0 });
  const frontMat = mat(frontMap, bump);

  // --- sides
  const sideC = paperCanvas(P.base, 512, ch / 2 | 0, 23);
  crease(sideC.getContext("2d"), (ch / 2) * 0.935, 512, 1);
  const sideBump = makeCanvas(512, ch / 2 | 0); sideBump.getContext("2d").drawImage(sideC, 0, 0);
  const sideMat = mat(tex(sideC), tex(sideBump, false));

  const inner = new THREE.MeshStandardMaterial({ color: P.inner, roughness: 1, side: THREE.BackSide });
  const bulge = 0.03;
  const addShell = (geo, material, innerShrink = true) => {
    const m = new THREE.Mesh(geo, material); m.castShadow = true; m.receiveShadow = true; group.add(m);
    if (innerShrink) { const i = new THREE.Mesh(geo, inner); i.scale.set(0.985, 1, 0.96); i.receiveShadow = true; group.add(i); }
  };
  addShell(panelGeom(W, H, D, bulge, false), frontMat);
  addShell(panelGeom(W, H, D, bulge, true), frontMat);
  const sd = D * 0.2;
  addShell(sideGeom(W, H, D, sd, 1), sideMat);
  addShell(sideGeom(W, H, D, sd, -1), sideMat);

  // bottom
  const bottomC = paperCanvas(P.base, 512, 256, 31);
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex(bottomC), roughness: 1, color: 0xbbbbbb }));
  bm.position.y = 0.002; bm.receiveShadow = true; group.add(bm);

  // --- handles
  if (T.handle) {
    const hw = W * 0.2, rise = T.rise ?? 0.36, z0 = D / 2 - 0.02;
    const make = (z) => new THREE.CatmullRomCurve3([
      new THREE.Vector3(-hw, H - 0.1, z), new THREE.Vector3(-hw * 1.04, H + 0.015, z + Math.sign(z) * 0.02),
      new THREE.Vector3(-hw * 0.78, H + rise * 0.78, z + Math.sign(z) * 0.03), new THREE.Vector3(0, H + rise, z + Math.sign(z) * 0.03),
      new THREE.Vector3(hw * 0.78, H + rise * 0.78, z + Math.sign(z) * 0.03), new THREE.Vector3(hw * 1.04, H + 0.015, z + Math.sign(z) * 0.02),
      new THREE.Vector3(hw, H - 0.1, z),
    ]);
    for (const z of [z0, -z0]) {
      const curve = make(z);
      let mesh;
      if (T.handle === "rope") {
        mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.0125, 10),
          new THREE.MeshStandardMaterial({ map: ropeTexture(P.rope), roughness: 0.95 }));
      } else {
        mesh = new THREE.Mesh(ribbonGeom(curve, 0.032),
          new THREE.MeshStandardMaterial({ color: spec.paper === "forest" ? "#D7AE70" : "#102B20", roughness: 0.55, side: THREE.DoubleSide }));
      }
      mesh.castShadow = true; group.add(mesh);
    }
  }
  group.userData = { W, H, D, total: H + (T.handle ? T.rise ?? 0.36 : 0) };
  return group;
}

function disposeGroup(g) {
  g.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    ms.forEach((m) => { ["map", "bumpMap"].forEach((k) => m[k] && m[k].dispose()); m.dispose(); });
  });
}

/* ------------------------------------------------------------------ */
/*  Stage                                                              */
/* ------------------------------------------------------------------ */
function shadowBlob() {
  const c = makeCanvas(256, 256), g = c.getContext("2d");
  const gr = g.createRadialGradient(128, 128, 10, 128, 128, 126);
  gr.addColorStop(0, "rgba(40,22,6,.5)"); gr.addColorStop(0.5, "rgba(40,22,6,.2)"); gr.addColorStop(1, "rgba(40,22,6,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

export class BagStage {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.opts = { interactive: false, autoRotate: false, preserve: false, ...opts };
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: this.opts.preserve, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30);
    this.aniso = this.renderer.capabilities.getMaxAnisotropy();

    const hemi = new THREE.HemisphereLight(0xfff4e2, 0xb48a5a, 1.15);
    const key = new THREE.DirectionalLight(0xfff0d8, 2.5);
    key.position.set(-1.8, 5.2, 2.6); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 9; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -3.4, right: 3.4, top: 3.4, bottom: -3.4, near: 0.5, far: 16 });
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.45); fill.position.set(3, 1.5, 2.5);
    const rim = new THREE.DirectionalLight(0xffe2b0, 0.9); rim.position.set(1.5, 2.5, -3.5);
    this.scene.add(hemi, key, fill, rim);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.15 }));
    ground.receiveShadow = true; this.scene.add(ground);
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shadowBlob(), transparent: true, depthWrite: false }));
    this.blob.position.y = 0.001; this.scene.add(this.blob);

    this.yaw = this.targetYaw = -0.5; this.pitch = this.targetPitch = 0.16;
    this.dragging = false; this.lastInteract = 0; this.running = false; this.visible = true;
    this.bag = null; this.spec = null;
    this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (this.opts.interactive) this.bindInput();
    if (this.opts.interactive) {
      this.ro = new ResizeObserver(() => { this.resize(); this.renderOnce(); });
      this.ro.observe(canvas.parentElement || canvas);
      this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.syncLoop(); }, { threshold: 0.05 });
      this.io.observe(canvas);
      document.addEventListener("visibilitychange", () => this.syncLoop());
    }
  }

  bindInput() {
    const c = this.canvas; let sx = 0, sy = 0;
    c.style.touchAction = "pan-y"; c.style.cursor = "grab";
    c.tabIndex = 0;
    c.addEventListener("pointerdown", (e) => { this.dragging = true; sx = e.clientX; sy = e.clientY; c.setPointerCapture(e.pointerId); c.style.cursor = "grabbing"; });
    c.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy; sx = e.clientX; sy = e.clientY;
      this.targetYaw += dx * 0.009;
      this.targetPitch = Math.max(-0.05, Math.min(0.5, this.targetPitch + dy * 0.003));
      this.lastInteract = performance.now(); this.syncLoop();
    });
    const up = () => { this.dragging = false; c.style.cursor = "grab"; this.lastInteract = performance.now(); };
    c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up);
    c.addEventListener("keydown", (e) => {
      const k = { ArrowLeft: -0.3, ArrowRight: 0.3 }[e.key];
      if (k) { e.preventDefault(); this.targetYaw += k; this.lastInteract = performance.now(); this.syncLoop(); }
    });
  }

  resize(w, h) {
    const parent = this.canvas.parentElement;
    w = w || (parent ? parent.clientWidth : this.canvas.clientWidth) || 600;
    h = h || (parent ? parent.clientHeight : this.canvas.clientHeight) || 600;
    this.renderer.setSize(w, h, this.opts.interactive ? false : true);
    this.camera.aspect = w / h; this.fit(); this.camera.updateProjectionMatrix();
  }

  fit() {
    if (!this.bag) return;
    const { W, total } = this.bag.userData;
    const tan = Math.tan((this.camera.fov * Math.PI) / 360);
    const rH = (total * 1.14) / (2 * tan);
    const rW = (W * 1.75) / (2 * tan * this.camera.aspect);
    this.dist = Math.max(rH, rW) + 0.4;
    this.tY = total * 0.47;
  }

  setSpec(spec) {
    this.spec = spec;
    if (this.bag) { this.scene.remove(this.bag); disposeGroup(this.bag); }
    this.bag = buildBag(spec, this.aniso);
    this.scene.add(this.bag);
    const { W, D } = this.bag.userData;
    this.blob.scale.set(W * 1.55, 1, D * 2.4);
    this.fit(); this.camera.updateProjectionMatrix();
    this.renderOnce();
  }

  update(dt) {
    const idle = performance.now() - this.lastInteract > 1800;
    if (this.opts.autoRotate && !this.reduce && !this.dragging && idle) this.targetYaw += dt * 0.42;
    const k = 1 - Math.pow(0.0006, dt);
    this.yaw += (this.targetYaw - this.yaw) * k;
    this.pitch += (this.targetPitch - this.pitch) * k;
  }

  renderOnce() {
    if (!this.bag) return;
    this.bag.rotation.y = this.yaw;
    const r = this.dist, p = this.pitch;
    this.camera.position.set(0, this.tY + Math.sin(p) * r, Math.cos(p) * r);
    this.camera.lookAt(0, this.tY, 0);
    this.renderer.render(this.scene, this.camera);
  }

  syncLoop() {
    const want = this.visible && !document.hidden && (this.opts.autoRotate && !this.reduce || this.dragging || Math.abs(this.targetYaw - this.yaw) > 0.002 || Math.abs(this.targetPitch - this.pitch) > 0.002);
    if (want && !this.running) {
      this.running = true; let last = performance.now();
      const tick = (t) => {
        const dt = Math.min(0.05, (t - last) / 1000); last = t;
        this.update(dt); this.renderOnce();
        const keep = this.visible && !document.hidden && (this.opts.autoRotate && !this.reduce || this.dragging || Math.abs(this.targetYaw - this.yaw) > 0.002 || Math.abs(this.targetPitch - this.pitch) > 0.002);
        if (keep) requestAnimationFrame(tick); else this.running = false;
      };
      requestAnimationFrame(tick);
    }
  }

  start() { this.resize(); this.renderOnce(); this.syncLoop(); }

  toBlobURL(type = "image/png", q = 0.92) {
    return new Promise((res) => this.canvas.toBlob((b) => res(URL.createObjectURL(b)), type, q));
  }

  dispose() { if (this.bag) disposeGroup(this.bag); this.renderer.dispose(); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); }
}

/**
 * Render several bag specs to images with one off-screen renderer.
 * list: [{ key, spec, yaw }]  ->  { key: blobURL }
 */
let snapStage = null;
export async function renderSnapshots(list, w = 760, h = 700) {
  if (!snapStage) {
    snapStage = new BagStage(makeCanvas(w, h), { preserve: true });
    snapStage.renderer.setPixelRatio(1);
    snapStage.resize(w, h);
  }
  const stage = snapStage, out = {};
  for (const item of list) {
    stage.setSpec(item.spec);
    stage.yaw = stage.targetYaw = item.yaw ?? -0.55;
    stage.pitch = stage.targetPitch = item.pitch ?? 0.16;
    stage.renderOnce();
    out[item.key] = await stage.toBlobURL("image/png");
  }
  return out;
}
