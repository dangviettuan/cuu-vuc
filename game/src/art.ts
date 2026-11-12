/**
 * Greybox art: pixel sprites generated at boot from the same builders as the
 * concept generator (docs/06-art/concept-v0.1/), using the locked picks:
 * Protagonist B (long coat), Nanh Rễ A (living roots), Thanh Mộc A palette.
 * Replace with authored pixel art frame-by-frame later (ADR-0008).
 */
import Phaser from "phaser";

type Color = string;
export const RED = "#c8323c"; // reserved: red thread only (Art Bible §3)

function hx(c: Color): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function th(a: number[]): Color {
  return "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
export function shade(c: Color, k: number): Color {
  return th(hx(c).map((v) => v * k));
}
export function mix(a: Color, b: Color, t: number): Color {
  const A = hx(a), B = hx(b);
  return th(A.map((v, i) => v + (B[i] - v) * t));
}
function rng(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Px {
  d: (Color | null)[];
  constructor(public w: number, public h: number) {
    this.d = new Array(w * h).fill(null);
  }
  set(x: number, y: number, c: Color): void {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c;
  }
  get(x: number, y: number): Color | null {
    return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.d[y * this.w + x] : null;
  }
  rect(x: number, y: number, w: number, h: number, c: Color): void {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  ell(cx: number, cy: number, rx: number, ry: number, c: Color): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: Color, t = 1): void {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
      this.rect(x0, y0, t, t, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  }
  tri(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, c: Color): void {
    const minx = Math.floor(Math.min(ax, bx, cx)), maxx = Math.ceil(Math.max(ax, bx, cx));
    const miny = Math.floor(Math.min(ay, by, cy)), maxy = Math.ceil(Math.max(ay, by, cy));
    const e = (x0: number, y0: number, x1: number, y1: number, x: number, y: number) => (x1 - x0) * (y - y0) - (y1 - y0) * (x - x0);
    for (let y = miny; y <= maxy; y++)
      for (let x = minx; x <= maxx; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = e(bx, by, cx, cy, px, py), w1 = e(cx, cy, ax, ay, px, py), w2 = e(ax, ay, bx, by, px, py);
        if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) this.set(x, y, c);
      }
  }
  /** Coloured 1 px outline: darkened local hue, never pure black (Art Bible §2). */
  outline(k = 0.42): this {
    const o = this.d.slice();
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.d[y * this.w + x]) continue;
        const n = this.get(x, y + 1) || this.get(x, y - 1) || this.get(x - 1, y) || this.get(x + 1, y);
        if (n) o[y * this.w + x] = shade(n, k);
      }
    this.d = o;
    return this;
  }
  bands(cols: Color[], y0: number, y1: number): void {
    const n = cols.length, h = y1 - y0;
    for (let y = y0; y < y1; y++) {
      const t = ((y - y0) / h) * n, k = Math.floor(t), fr = t - k;
      for (let x = 0; x < this.w; x++) {
        let kk = k;
        if (fr > 0.75 && k < n - 1 && (x + y) % 2 === 0) kk = k + 1;
        this.set(x, y, cols[Math.min(kk, n - 1)]);
      }
    }
  }
  toCanvas(): HTMLCanvasElement {
    const cv = document.createElement("canvas");
    cv.width = this.w; cv.height = this.h;
    const ctx = cv.getContext("2d")!;
    const img = ctx.createImageData(this.w, this.h);
    for (let i = 0; i < this.d.length; i++) {
      const c = this.d[i];
      if (!c) continue;
      const [r, g, b] = hx(c);
      img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }
}

/* ---------------- protagonist (concept pick B, long coat) ---------------- */
type Legs = "stand" | "runA" | "runB" | "jump";
interface Pose { bob: number; legs: Legs; arm?: "rest" | "raise" | "guard"; }

const PRO = {
  skin: "#d9a27c", boot: "#3a2a20", belt: "#4a3424",
  shirt: "#8a6a45", sleeve: "#4b5f45", pants: "#3f3a33", wrap: "#a99a78",
  coat: "#4b5f45", hair: "#1f1a19", strap: "#5e3f27", bag: "#7a5534",
};

/** 32×56 frame; feet at y=54; faces right. Uses the 48-unit body space of the concept builder. */
export function protagonist(p: Pose): Px {
  const P = new Px(32, 56), H = 48, base = 54, top = base - H + 1, cx = 16;
  const Y = (v: number) => top + Math.round(v);
  const X = (v: number) => cx + Math.round(v);
  const b = p.bob;
  const skinS = shade(PRO.skin, 0.82);
  // legs
  const legTop = Y(29) + (p.legs === "jump" ? -2 : 0);
  const legLen = base - legTop + 1 - (p.legs === "jump" ? 4 : 0);
  let backDx = 0, frontDx = 0;
  if (p.legs === "runA") { backDx = -2; frontDx = 2; }
  if (p.legs === "runB") { backDx = 2; frontDx = -2; }
  if (p.legs === "jump") { backDx = -1; frontDx = 2; }
  P.rect(X(-3) + backDx, legTop, 3, legLen, shade(PRO.pants, 0.78));
  P.rect(X(0) + frontDx, legTop, 3, legLen, PRO.pants);
  const feetY = legTop + legLen - 3;
  P.rect(X(-3) + backDx, feetY, 3, 3, shade(PRO.boot, 0.8));
  P.rect(X(0) + frontDx, feetY, 4, 3, PRO.boot);
  for (const v of [33, 37, 41]) {
    const yy = Y(v) + (p.legs === "jump" ? -2 : 0);
    if (yy < feetY) { P.rect(X(-3) + backDx, yy, 3, 1, PRO.wrap); P.rect(X(0) + frontDx, yy, 3, 1, PRO.wrap); }
  }
  // back arm
  P.rect(X(1), Y(12) + b, 2, Y(26) - Y(12), shade(PRO.sleeve, 0.72));
  P.rect(X(1), Y(26) + b, 2, 2, skinS);
  // torso + long coat to knees
  P.rect(X(-4), Y(11) + b, 8, Y(29) - Y(11) - b, PRO.shirt);
  const coatEnd = Y(38) - (p.legs === "jump" ? 3 : 0);
  P.rect(X(-5), Y(11) + b, 10, coatEnd - Y(11) - b, PRO.coat);
  P.rect(X(-5), Y(11) + b, 1, coatEnd - Y(11) - b, shade(PRO.coat, 0.8));
  P.rect(X(3), Y(16) + b, 1, coatEnd - Y(16) - b, shade(PRO.coat, 0.7));
  if (p.legs === "runA" || p.legs === "runB") P.rect(X(-6), Y(30) + b, 2, 6, shade(PRO.coat, 0.85)); // coat tail flutter
  P.rect(X(-4), Y(22) + b, 9, 1, PRO.belt);
  // satchel strap + bag (anchor)
  P.line(X(3), Y(11) + b, X(-4), Y(21) + b, PRO.strap);
  P.rect(X(-7), Y(20) + b, 4, 5, PRO.bag);
  P.rect(X(-7), Y(20) + b, 4, 1, shade(PRO.bag, 0.75));
  // head
  P.rect(X(0), Y(9) + b, 3, 2, skinS);
  P.rect(X(-3), Y(2) + b, 7, Y(10) - Y(2), PRO.skin);
  P.rect(X(3), Y(5) + b, 1, 2, PRO.skin);
  // hair with tied tail (anchor)
  P.rect(X(-3), Y(1) + b, 8, 3, PRO.hair);
  P.rect(X(-3), Y(3) + b, 2, 4, PRO.hair);
  P.rect(X(-6), Y(4) + b, 3, 2, PRO.hair);
  P.set(X(-7), Y(6) + b, PRO.hair);
  P.set(X(-4), Y(4) + b, "#6b4a2f");
  P.set(X(4), Y(3) + b, PRO.hair); P.set(X(4), Y(4) + b, PRO.hair);
  P.set(X(2), Y(5) + b, "#1b1714");
  // front arm (left arm: red thread on the wrist)
  const arm = p.arm ?? "rest";
  if (arm === "rest") {
    P.rect(X(-1), Y(12) + b, 3, Y(26) - Y(12), PRO.sleeve);
    P.rect(X(-1), Y(26) + b, 3, 2, PRO.skin);
    P.rect(X(-1), Y(25) + b, 3, 1, RED);
  } else if (arm === "raise") {
    P.rect(X(0), Y(12) + b, 3, 6, PRO.sleeve);
    P.rect(X(2), Y(15) + b, 6, 3, PRO.sleeve);
    P.rect(X(7), Y(15) + b, 1, 3, RED);
    P.rect(X(8), Y(15) + b, 2, 3, PRO.skin);
  } else {
    P.rect(X(0), Y(12) + b, 3, 6, PRO.sleeve);
    P.rect(X(2), Y(16) + b, 4, 3, PRO.sleeve);
    P.rect(X(5), Y(16) + b, 1, 3, RED);
    P.rect(X(6), Y(15) + b, 2, 4, PRO.skin);
    P.rect(X(8), Y(9) + b, 1, 14, "#aab4b8"); // blade held upright to parry
  }
  // brush-knife at hip when not held
  if (arm === "rest") {
    P.rect(X(4), Y(21) + b, 1, 3, "#5a3b25");
    P.rect(X(4), Y(24) + b, 2, 6, "#aab4b8");
  }
  return P.outline();
}

/* ---------------- startled boar (thú hoảng) ---------------- */
export function boar(frame: number): Px {
  const P = new Px(34, 22);
  const body = "#5a4a3c", belly = mix(body, "#c9a78a", 0.35);
  const legs = frame === 0 ? [[7, 0], [11, 1], [21, 0], [25, 1]] : [[8, 1], [12, 0], [20, 1], [24, 0]];
  for (const [x, back] of legs) P.rect(x, 14, 3, 6, back ? shade(body, 0.8) : body);
  P.ell(16, 11, 12, 6, body);
  P.ell(16, 14, 9, 2, belly);
  P.ell(27, 12, 5, 4, body);
  P.rect(30, 12, 3, 3, mix(body, "#c9a78a", 0.25));
  P.set(32, 13, "#2a211c");
  P.set(28, 10, "#e8b04a");
  P.line(31, 15, 33, 12, "#e9e1cf");
  P.tri(24, 7, 26, 4, 27, 8, shade(body, 0.85));
  for (let i = 0; i < 6; i++) P.set(8 + i * 2, 5 + (i % 2), shade(body, 0.7)); // bristles
  return P.outline();
}

/* ---------------- Nanh Rễ (concept pick A, living roots) ---------------- */
export function nanhRe(frame: number, collapsed = false): Px {
  const P = new Px(96, 58), r = rng(11), b = frame ? 1 : 0;
  const body = "#6b5a4c", belly = mix(body, "#d0b89a", 0.35), root = "#2c2420", tip = "#7fa65a";
  const dy = collapsed ? 8 : 0;
  if (!collapsed) for (const [x, back] of [[26, 1], [36, 0], [58, 1], [68, 0]] as const) {
    P.rect(x, 42, 5, 12, back ? shade(body, 0.8) : body);
    P.rect(x, 52, 6, 3, "#2a211c");
  }
  P.ell(46, 33 + b + dy, 32, collapsed ? 12 : 14, body);
  P.ell(46, 39 + b + dy, 26, 6, belly);
  P.ell(78, 36 + b + dy, 12, 10, body);
  P.rect(86, 38 + b + dy, 7, 7, mix(body, "#d0b89a", 0.25));
  P.set(92, 41 + b + dy, "#2a211c"); P.set(92, 43 + b + dy, "#2a211c");
  P.tri(72, 25 + b + dy, 77, 18 + b + dy, 79, 27 + b + dy, shade(body, 0.85));
  P.set(81, 33 + b + dy, collapsed ? "#6b5a4c" : "#e8b04a"); P.set(82, 33 + b + dy, collapsed ? "#2a211c" : "#e8b04a");
  P.line(88, 45 + b + dy, 95, 36 + b + dy, "#e9e1cf", 2);
  P.line(86, 46 + b + dy, 92, 40 + b + dy, "#e9e1cf", 1);
  for (const [x, y] of [[90, 42], [92, 39], [94, 37]]) P.set(x, y + b + dy, root);
  for (let i = 0; i < 16; i++) {
    const x = 18 + i * 3.6 + r() * 2, y = 22 + Math.abs(i - 8) * 0.6 + b + dy, h = 5 + r() * 9;
    const ex = x + (r() - 0.5) * 6;
    P.line(x, y, ex, y - h, root, 1);
    P.set(ex, y - h - 1, tip);
  }
  for (let k = 0; k < 6; k++) { const sx = 26 + k * 8; P.line(sx, 30 + b + dy, sx + 6, 36 + b + dy, shade(root, 1.4)); }
  return P.outline();
}

export function piglet(frame: number): Px {
  const P = new Px(12, 9), body = mix("#6b5a4c", "#c9a78a", 0.4);
  P.ell(5, 5, 4, 3, body);
  P.rect(2 + frame, 7, 1, 2, body); P.rect(7 - frame, 7, 1, 2, body);
  P.set(9, 4, "#2a211c");
  for (let s = -2; s <= 2; s += 2) P.set(5 + s, 3, "#e6d3b4");
  return P.outline();
}

export function rootSpike(): Px {
  const P = new Px(10, 34);
  P.tri(1, 33, 5, 2, 9, 33, "#2c2420");
  P.line(5, 33, 5, 4, "#3e332c");
  P.set(5, 1, "#7fa65a"); P.set(4, 2, "#7fa65a"); P.set(6, 3, "#9cc76a");
  return P.outline();
}

export function bush(): Px {
  const P = new Px(26, 24);
  P.ell(13, 15, 12, 9, "#3e6a3a"); P.ell(8, 11, 6, 6, "#4f7f45"); P.ell(17, 10, 7, 6, "#4a7840");
  for (let i = 0; i < 8; i++) P.set(4 + i * 2.5, 8 + (i % 3) * 4, "#7aa45c");
  P.rect(11, 20, 4, 4, "#4a3524");
  return P.outline();
}

export function herb(): Px {
  const P = new Px(9, 10);
  P.line(4, 9, 4, 3, "#4f7f45"); P.ell(2, 4, 2, 1.4, "#7aa45c"); P.ell(6, 3, 2, 1.4, "#7aa45c"); P.set(4, 1, "#d4b04a");
  return P.outline();
}

export function shrine(lit: boolean): Px {
  const P = new Px(26, 36);
  P.rect(3, 30, 20, 6, "#6f6a5c");
  P.rect(6, 6, 14, 25, "#8a8576"); P.rect(6, 6, 1, 25, "#6f6a5c");
  P.tri(4, 7, 13, 1, 22, 7, "#6f6a5c");
  const g = lit ? "#7ee08a" : "#5d6a5a";
  for (let a = 0; a < 5; a++) { P.line(8 + a * 2, 11, 13, 18, g); P.line(18 - a * 2, 26, 13, 18, g); }
  P.set(13, 18, lit ? "#e8ffd0" : "#7a8676");
  return P.outline();
}

export function sign(): Px {
  const P = new Px(14, 18);
  P.rect(6, 8, 2, 10, "#4a3524"); P.rect(1, 2, 12, 8, "#7a5a3a"); P.rect(1, 2, 12, 1, "#9a7a52");
  return P.outline();
}

export function groundTile(): Px {
  const P = new Px(16, 16), r = rng(5);
  P.rect(0, 0, 16, 16, "#2a2a1c");
  P.rect(0, 0, 16, 3, "#3e5a2e"); P.rect(0, 3, 16, 1, "#2f4426");
  for (let i = 0; i < 10; i++) P.set(r() * 16, 5 + r() * 11, "#34331f");
  P.set(r() * 16, 0, "#5a7a3e"); P.set(r() * 16, 1, "#5a7a3e");
  return P;
}

export function dirtTile(): Px {
  const P = new Px(16, 16), r = rng(9);
  P.rect(0, 0, 16, 16, "#2a2a1c");
  for (let i = 0; i < 12; i++) P.set(r() * 16, r() * 16, i % 3 ? "#34331f" : "#232317");
  return P;
}

export function slash(level: number): Px {
  const w = 30 + level * 4, h = 26 + level * 4, P = new Px(w, h);
  const c = level >= 2 ? "#f0e6c8" : "#dfe7ea";
  for (let t = 0; t <= 24; t++) {
    const a = -Math.PI * 0.45 + (Math.PI * 0.9 * t) / 24;
    const rx = w * 0.45, ry = h * 0.45;
    P.set(w * 0.2 + Math.cos(a) * rx, h / 2 + Math.sin(a) * ry, c);
    if (t % 2 === 0) P.set(w * 0.2 + Math.cos(a) * (rx - 2), h / 2 + Math.sin(a) * (ry - 2), shade(c, 0.75));
  }
  return P;
}

/** Thanh Mộc mood A background, 160×90 (displayed ×4). */
export function thanhMocBackground(): Px {
  const P = new Px(160, 90), r = rng(101);
  const p = { sky1: "#a9c98a", sky2: "#5f8f55", sky3: "#2f5537", far: "#2c4630", canopy: "#21402a", light: "#cfe6a3", mid: "#4a3524" };
  P.bands([p.sky1, p.sky2, p.sky3], 0, 90);
  for (let i = 0; i < 9; i++) { const x = r() * 160, w = 8 + r() * 10; P.rect(x, 0, w, 90, p.far); }
  for (let c = 0; c < 16; c++) P.ell(r() * 160, r() * 14, 14 + r() * 10, 8 + r() * 5, p.canopy);
  for (let s = 0; s < 5; s++) { const sx = 10 + r() * 140; for (let y = 10; y < 90; y++) if ((y + s) % 3) P.set(sx + y * 0.35, y, p.light); }
  for (let t = 0; t < 3; t++) {
    const tx = 15 + t * 55 + r() * 10, tw = 12 + r() * 5;
    P.rect(tx, 0, tw, 90, mix(p.mid, p.far, 0.4));
  }
  return P;
}

/** Register every generated texture with the scene's texture manager. */
export function registerTextures(scene: Phaser.Scene): void {
  const add = (key: string, px: Px) => {
    if (!scene.textures.exists(key)) scene.textures.addCanvas(key, px.toCanvas());
  };
  add("p_idle0", protagonist({ bob: 0, legs: "stand" }));
  add("p_idle1", protagonist({ bob: 1, legs: "stand" }));
  add("p_run0", protagonist({ bob: 0, legs: "runA" }));
  add("p_run1", protagonist({ bob: 1, legs: "stand" }));
  add("p_run2", protagonist({ bob: 0, legs: "runB" }));
  add("p_run3", protagonist({ bob: 1, legs: "stand" }));
  add("p_jump", protagonist({ bob: 0, legs: "jump" }));
  add("p_attack", protagonist({ bob: 0, legs: "runA", arm: "raise" }));
  add("p_guard", protagonist({ bob: 1, legs: "stand", arm: "guard" }));
  add("boar0", boar(0));
  add("boar1", boar(1));
  add("nanh0", nanhRe(0));
  add("nanh1", nanhRe(1));
  add("nanh_down", nanhRe(0, true));
  add("piglet0", piglet(0));
  add("piglet1", piglet(1));
  add("root", rootSpike());
  add("bush", bush());
  add("herb", herb());
  add("shrine_off", shrine(false));
  add("shrine_on", shrine(true));
  add("sign", sign());
  add("ground", groundTile());
  add("dirt", dirtTile());
  add("slash0", slash(0));
  add("slash1", slash(1));
  add("slash2", slash(2));
  add("bg_thanhmoc", thanhMocBackground());

  const anim = (key: string, frames: string[], frameRate: number, repeat = -1) => {
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: frames.map((k) => ({ key: k })), frameRate, repeat });
  };
  anim("p_idle", ["p_idle0", "p_idle1"], 2.5); // idle at a slow beat (Art Bible: 8 fps idles, 2 key poses here)
  anim("p_run", ["p_run0", "p_run1", "p_run2", "p_run3"], 12);
  anim("boar_run", ["boar0", "boar1"], 12);
  anim("boar_idle", ["boar0"], 1);
  anim("nanh_idle", ["nanh0", "nanh1"], 3);
  anim("nanh_run", ["nanh0", "nanh1"], 12);
  anim("piglet", ["piglet0", "piglet1"], 6);
}
