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
/** Arm pose: elbow and hand offsets from the shoulder; optional blade end (from the hand). */
type ArmPose = { e: [number, number]; h: [number, number]; blade?: [number, number] };
const ARMS: Record<string, ArmPose> = {
  rest: { e: [0, 7], h: [0, 13] },
  swingF: { e: [2, 6], h: [5, 11] },
  swingB: { e: [-2, 6], h: [-4, 11] },
  tuck: { e: [3, 4], h: [6, 5] },
  windup: { e: [-3, 3], h: [-6, 0], blade: [-9, -9] },
  strike: { e: [5, 2], h: [10, 3], blade: [21, 2] },
  follow: { e: [4, 6], h: [8, 10], blade: [15, 17] },
  overhead: { e: [1, -5], h: [1, -11], blade: [-7, -18] },
  slam: { e: [5, 3], h: [10, 7], blade: [19, 15] },
  guard: { e: [3, 4], h: [6, 3], blade: [7, -9] },
  hurt: { e: [-3, 3], h: [-5, 8] },
  reach: { e: [3, 3], h: [5, -2] },
};
export interface Pose {
  bob?: number; // body drop in px (crouch)
  lean?: number; // upper-body forward shift
  front?: { dx: number; lift?: number }; // front (near) leg
  back?: { dx: number; lift?: number };
  arm?: keyof typeof ARMS; // front arm (left; carries the red thread)
  backArm?: keyof typeof ARMS;
  coat?: number; // hem flutter: px pushed back
}

const PRO = {
  skin: "#d9a27c", boot: "#3a2a20", belt: "#4a3424",
  shirt: "#8a6a45", sleeve: "#4b5f45", pants: "#3f3a33", wrap: "#a99a78",
  coat: "#4b5f45", hair: "#1f1a19", strap: "#5e3f27", bag: "#7a5534",
  blade: "#b4bec2", bladeHi: "#e3eaec", grip: "#5a3b25",
};

/** 48×56 frame, figure centred at x=24 so flipX is symmetric; feet at y=54; faces right. */
export function protagonist(p: Pose): Px {
  const P = new Px(48, 56), base = 54, top = base - 47, cx = 24;
  const b = p.bob ?? 0, ln = p.lean ?? 0;
  const Y = (v: number) => top + v;
  const X = (v: number) => cx + v;
  const skinS = shade(PRO.skin, 0.82);
  const front = p.front ?? { dx: 0 }, back = p.back ?? { dx: 0 };
  const hip = Y(29) + b;

  // legs: column from hip to ground; a lifted leg is shortened and its foot raised
  const leg = (dx: number, lift: number, col: Color, bootC: Color, w: number) => {
    const x = X(-2) + dx, len = base - hip + 1 - lift;
    P.rect(x, hip, 3, len, col);
    P.rect(x, hip + len - 3, w, 3, bootC);
    for (const v of [33, 37, 41]) { const yy = Y(v) + b; if (yy < hip + len - 3) P.rect(x, yy, 3, 1, PRO.wrap); }
  };
  leg(back.dx - 1, back.lift ?? 0, shade(PRO.pants, 0.78), shade(PRO.boot, 0.8), 3);

  // back arm (behind torso)
  const sx = X(0) + ln, sy = Y(13) + b;
  const drawArm = (a: ArmPose, col: Color, hand: Color, isFront: boolean) => {
    const ex = sx + a.e[0], ey = sy + a.e[1], hx2 = sx + a.h[0], hy = sy + a.h[1];
    P.line(sx, sy, ex, ey, col, 2);
    P.line(ex, ey, hx2, hy, col, 2);
    if (a.blade) {
      const bx = sx + a.blade[0], by = sy + a.blade[1];
      const dx = bx - hx2, dy = by - hy, L = Math.hypot(dx, dy) || 1;
      P.line(hx2 - (dx / L) * 2, hy - (dy / L) * 2, hx2, hy, PRO.grip, 1);
      P.line(hx2, hy, bx, by, PRO.blade, 1);
      P.set(hx2 + dx * 0.6, hy + dy * 0.6, PRO.bladeHi);
    }
    if (isFront) P.set(hx2 - Math.sign(a.h[0] - a.e[0] || 0.0001) , hy - Math.sign(a.h[1] - a.e[1] || 0.0001), RED);
    P.rect(hx2, hy, 2, 2, hand);
  };
  drawArm(ARMS[p.backArm ?? "rest"], shade(PRO.sleeve, 0.72), skinS, false);

  // coat (knee length) behind the front leg
  const coatTop = Y(11) + b, coatEnd = Y(38) + b;
  const flutter = p.coat ?? 0;
  P.rect(X(-5) + ln, coatTop, 10, Y(22) - Y(11), PRO.coat);
  P.tri(X(-5) + ln, Y(22) + b, X(5) + ln, Y(22) + b, X(-5) - flutter, coatEnd, PRO.coat);
  P.rect(X(-5) - flutter, Y(22) + b, 10 + flutter, coatEnd - Y(22) - b, PRO.coat);
  P.rect(X(-5) - flutter, Y(22) + b, 1, coatEnd - Y(22) - b, shade(PRO.coat, 0.8));
  if (flutter > 0) P.rect(X(-6) - flutter, coatEnd - 4, 2, 4, shade(PRO.coat, 0.85));
  P.rect(X(-4) + ln, Y(11) + b, 8, Y(22) - Y(11), PRO.shirt);
  P.rect(X(-5) + ln, Y(11) + b, 2, Y(22) - Y(11), PRO.coat);
  P.rect(X(3) + ln, Y(11) + b, 2, Y(22) - Y(11), PRO.coat);
  P.rect(X(-4) + ln, Y(22) + b, 9, 1, PRO.belt);

  leg(front.dx, front.lift ?? 0, PRO.pants, PRO.boot, 4);

  // satchel strap + bag (anchor)
  P.line(X(3) + ln, Y(11) + b, X(-4) + ln, Y(21) + b, PRO.strap);
  P.rect(X(-8) + ln, Y(19) + b, 4, 5, PRO.bag);
  P.rect(X(-8) + ln, Y(19) + b, 4, 1, shade(PRO.bag, 0.75));

  // head + hair with tied tail (anchor)
  const hx0 = ln + (ln > 1 ? 1 : 0);
  P.rect(X(0) + hx0, Y(9) + b, 3, 2, skinS);
  P.rect(X(-3) + hx0, Y(2) + b, 7, 8, PRO.skin);
  P.rect(X(4) + hx0, Y(5) + b, 1, 2, PRO.skin);
  P.rect(X(-3) + hx0, Y(1) + b, 8, 3, PRO.hair);
  P.rect(X(-3) + hx0, Y(3) + b, 2, 4, PRO.hair);
  P.rect(X(-6) + hx0 - (flutter > 1 ? 1 : 0), Y(4) + b, 3, 2, PRO.hair);
  P.set(X(-7) + hx0 - (flutter > 1 ? 1 : 0), Y(5 + (flutter > 1 ? 0 : 1)) + b, PRO.hair);
  P.set(X(-4) + hx0, Y(4) + b, "#6b4a2f");
  P.set(X(4) + hx0, Y(3) + b, PRO.hair); P.set(X(4) + hx0, Y(4) + b, PRO.hair);
  P.set(X(2) + hx0, Y(5) + b, "#1b1714");

  // brush-knife at the hip when not in hand
  const arm = ARMS[p.arm ?? "rest"];
  if (!arm.blade) { P.rect(X(4) + ln, Y(21) + b, 1, 3, PRO.grip); P.rect(X(4) + ln, Y(24) + b, 2, 6, PRO.blade); }
  // front arm (left; red thread at the wrist)
  drawArm(arm, PRO.sleeve, PRO.skin, true);
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
/** pose: "low" = head down, tusks forward (charge windup); "rear" = head up, front lifted (stomp windup). */
export function nanhRe(frame: number, collapsed = false, pose: "normal" | "low" | "rear" = "normal"): Px {
  const P = new Px(96, 58), r = rng(11), b = frame ? 1 : 0;
  const body = "#6b5a4c", belly = mix(body, "#d0b89a", 0.35), root = "#2c2420", tip = "#7fa65a";
  const dy = collapsed ? 8 : 0;
  const hy = pose === "low" ? 6 : pose === "rear" ? -7 : 0, hx = pose === "low" ? 2 : 0;
  if (!collapsed) for (const [x, back] of [[26, 1], [36, 0], [58, 1], [68, 0]] as const) {
    const lift = pose === "rear" && x > 50 ? 5 : 0;
    P.rect(x, 42 - lift, 5, 12, back ? shade(body, 0.8) : body);
    P.rect(x, 52 - lift, 6, 3, "#2a211c");
  }
  P.ell(46, 33 + b + dy, 32, collapsed ? 12 : 14, body);
  P.ell(46, 39 + b + dy, 26, 6, belly);
  P.ell(78 + hx, 36 + b + dy + hy, 12, 10, body);
  P.rect(86 + hx, 38 + b + dy + hy, 7, 7, mix(body, "#d0b89a", 0.25));
  P.set(92 + hx, 41 + b + dy + hy, "#2a211c"); P.set(92 + hx, 43 + b + dy + hy, "#2a211c");
  P.tri(72 + hx, 25 + b + dy + hy, 77 + hx, 18 + b + dy + hy, 79 + hx, 27 + b + dy + hy, shade(body, 0.85));
  P.set(81 + hx, 33 + b + dy + hy, collapsed ? "#6b5a4c" : "#e8b04a"); P.set(82 + hx, 33 + b + dy + hy, collapsed ? "#2a211c" : "#e8b04a");
  P.line(88 + hx, 45 + b + dy + hy, 95 + hx, 36 + b + dy + hy, "#e9e1cf", 2);
  P.line(86 + hx, 46 + b + dy + hy, 92 + hx, 40 + b + dy + hy, "#e9e1cf", 1);
  for (const [x, y] of [[90, 42], [92, 39], [94, 37]]) P.set(x + hx, y + b + dy + hy, root);
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

/** Slash arc, 3 frames: leading edge sweeps (0), full arc (1), thinning tail (2). */
export function slash(level: number, frame: number): Px {
  const w = 34 + level * 6, h = 30 + level * 6, P = new Px(w, h);
  const c = level >= 2 ? "#f6eccc" : "#e3eaec";
  const from = frame === 2 ? 12 : 0, to = frame === 0 ? 14 : 24;
  for (let t = from; t <= to; t++) {
    const a = -Math.PI * 0.45 + (Math.PI * 0.9 * t) / 24;
    const rx = w * 0.45, ry = h * 0.45;
    P.set(w * 0.2 + Math.cos(a) * rx, h / 2 + Math.sin(a) * ry, c);
    if (frame < 2 || t % 2 === 0) P.set(w * 0.2 + Math.cos(a) * (rx - 2), h / 2 + Math.sin(a) * (ry - 2), shade(c, 0.75));
    if (level > 0 && frame === 1) P.set(w * 0.2 + Math.cos(a) * (rx - 4), h / 2 + Math.sin(a) * (ry - 4), shade(c, 0.55));
  }
  return P;
}

export function dust(): Px {
  const P = new Px(7, 7);
  P.ell(3, 3, 3, 3, "#8a8670"); P.ell(2, 2, 1.5, 1.5, "#a8a48c");
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
  const pose = (key: string, p: Pose) => add(key, protagonist(p));
  // idle: breathing
  pose("p_idle0", { arm: "rest" });
  pose("p_idle1", { arm: "rest" });
  pose("p_idle2", { bob: 1, arm: "rest" });
  pose("p_idle3", { bob: 1, arm: "rest", coat: 1 });
  // run: 6-frame cycle (contact, down, pass, contact, down, pass) with opposite arm swing
  const RUN: Pose[] = [
    { front: { dx: 6 }, back: { dx: -6 }, arm: "swingB", backArm: "swingF", coat: 2 },
    { bob: 1, front: { dx: 3 }, back: { dx: -3, lift: 3 }, arm: "rest", backArm: "rest", coat: 3 },
    { front: { dx: -1 }, back: { dx: 2, lift: 5 }, arm: "swingF", backArm: "swingB", coat: 2 },
    { front: { dx: -6 }, back: { dx: 6 }, arm: "swingF", backArm: "swingB", coat: 2 },
    { bob: 1, front: { dx: -3, lift: 3 }, back: { dx: 3 }, arm: "rest", backArm: "rest", coat: 3 },
    { front: { dx: 2, lift: 5 }, back: { dx: -1 }, arm: "swingB", backArm: "swingF", coat: 2 },
  ];
  RUN.forEach((p, i) => pose(`p_run${i}`, { lean: 1, ...p }));
  pose("p_jumpUp", { front: { dx: 3, lift: 5 }, back: { dx: -2, lift: 1 }, arm: "reach", backArm: "swingB", coat: 1 });
  pose("p_jumpFall", { front: { dx: 2, lift: 2 }, back: { dx: -3 }, arm: "tuck", backArm: "swingF", coat: 4 });
  pose("p_dodge", { bob: 4, lean: 3, front: { dx: 4, lift: 4 }, back: { dx: -5 }, arm: "tuck", backArm: "swingB", coat: 5 });
  // light attack: windup → strike → follow-through
  pose("p_atkWind", { lean: -1, front: { dx: 2 }, back: { dx: -3 }, arm: "windup", backArm: "swingF" });
  pose("p_atkStrike", { lean: 2, front: { dx: 5 }, back: { dx: -4 }, arm: "strike", backArm: "swingB", coat: 2 });
  pose("p_atkFollow", { bob: 1, lean: 2, front: { dx: 4 }, back: { dx: -4 }, arm: "follow", backArm: "swingB", coat: 1 });
  // heavy / third light / riposte: overhead → slam
  pose("p_hvyWind", { bob: 1, lean: -2, front: { dx: 3 }, back: { dx: -4 }, arm: "overhead", backArm: "reach" });
  pose("p_hvySlam", { bob: 2, lean: 3, front: { dx: 6 }, back: { dx: -5 }, arm: "slam", backArm: "swingB", coat: 3 });
  pose("p_guard", { bob: 1, front: { dx: 3 }, back: { dx: -3 }, arm: "guard", backArm: "tuck" });
  pose("p_hurt", { lean: -2, front: { dx: -1, lift: 1 }, back: { dx: -3 }, arm: "hurt", backArm: "swingB", coat: 1 });
  pose("p_heal", { bob: 4, front: { dx: 3, lift: 1 }, back: { dx: -4 }, arm: "reach", backArm: "tuck" });
  add("boar0", boar(0));
  add("boar1", boar(1));
  add("nanh0", nanhRe(0));
  add("nanh1", nanhRe(1));
  add("nanh_down", nanhRe(0, true));
  add("nanh_low", nanhRe(0, false, "low"));
  add("nanh_rear", nanhRe(1, false, "rear"));
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
  for (let lv = 0; lv < 3; lv++) for (let fr = 0; fr < 3; fr++) add(`slash${lv}_${fr}`, slash(lv, fr));
  add("dust", dust());
  add("bg_thanhmoc", thanhMocBackground());

  const anim = (key: string, frames: string[], frameRate: number, repeat = -1) => {
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: frames.map((k) => ({ key: k })), frameRate, repeat });
  };
  anim("p_idle", ["p_idle0", "p_idle1", "p_idle2", "p_idle3", "p_idle2", "p_idle1"], 6);
  anim("p_run", ["p_run0", "p_run1", "p_run2", "p_run3", "p_run4", "p_run5"], 12);
  anim("boar_run", ["boar0", "boar1"], 12);
  anim("boar_idle", ["boar0"], 1);
  anim("nanh_idle", ["nanh0", "nanh1"], 3);
  anim("nanh_run", ["nanh0", "nanh1"], 12);
  anim("piglet", ["piglet0", "piglet1"], 6);
}
