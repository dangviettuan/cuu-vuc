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

/* =====================================================================================
 * PROTAGONIST — concept pick B (knee-length grey-green coat). 48×56 frames, figure centred
 * at x=24 (flipX stays symmetric), feet on y=54, facing right. Every pose is a drawn frame;
 * nothing relies on rotating or scaling a single sprite.
 * ===================================================================================== */
type ArmPose = { e: [number, number]; h: [number, number]; blade?: [number, number] };
const ARMS = {
  rest: { e: [0, 7], h: [0, 13] },
  lowHold: { e: [1, 7], h: [3, 12], blade: [8, 17] },
  swingF: { e: [2, 6], h: [5, 11] },
  swingB: { e: [-2, 6], h: [-4, 11] },
  tuck: { e: [3, 4], h: [6, 5] },
  reach: { e: [3, 3], h: [5, -2] },
  mouth: { e: [3, 0], h: [4, -6] },
  hurt: { e: [-3, 3], h: [-5, 8] },
  fall: { e: [3, 8], h: [6, 13] },
  // light A: downward diagonal
  wind1: { e: [-2, 4], h: [-4, 2], blade: [-7, -6] },
  wind2: { e: [-3, 3], h: [-6, -1], blade: [-9, -10] },
  strike: { e: [5, 2], h: [10, 3], blade: [21, 2] },
  follow: { e: [4, 6], h: [8, 10], blade: [15, 17] },
  settle: { e: [2, 6], h: [5, 11], blade: [10, 16] },
  // light B: rising
  low1: { e: [-1, 7], h: [-3, 12], blade: [-8, 16] },
  low2: { e: [-2, 7], h: [-5, 11], blade: [-11, 14] },
  upStrike: { e: [5, 1], h: [9, -3], blade: [18, -12] },
  upFollow: { e: [3, -4], h: [5, -9], blade: [0, -18] },
  // overhead: third light, heavy, riposte
  over1: { e: [0, -2], h: [0, -7], blade: [-5, -15] },
  over2: { e: [1, -5], h: [1, -11], blade: [-7, -18] },
  chop: { e: [5, -1], h: [10, 0], blade: [20, 5] },
  slam: { e: [5, 3], h: [10, 7], blade: [19, 15] },
  // defence
  guard: { e: [3, 4], h: [6, 3], blade: [7, -9] },
  guardPush: { e: [4, 3], h: [8, 2], blade: [10, -10] },
} satisfies Record<string, ArmPose>;
type ArmKey = keyof typeof ARMS;

export interface Pose {
  bob?: number; // crouch depth in px
  lean?: number; // upper-body forward shift
  front?: { dx: number; lift?: number };
  back?: { dx: number; lift?: number };
  arm?: ArmKey; // front (left) arm, carries the red thread
  backArm?: ArmKey;
  coat?: number; // hem pushed back (secondary motion)
  hair?: number; // tail pushed back/up (secondary motion)
  eyes?: "open" | "closed";
  smear?: "down" | "up" | "over"; // motion smear drawn on the active frame
}

const PRO = {
  skin: "#d9a27c", boot: "#3a2a20", belt: "#4a3424",
  shirt: "#8a6a45", sleeve: "#4b5f45", pants: "#3f3a33", wrap: "#a99a78",
  coat: "#4b5f45", hair: "#1f1a19", strap: "#5e3f27", bag: "#7a5534",
  blade: "#b4bec2", bladeHi: "#e3eaec", grip: "#5a3b25",
};

export function protagonist(p: Pose): Px {
  const P = new Px(48, 56), base = 54, top = base - 47, cx = 24;
  const b = p.bob ?? 0, ln = p.lean ?? 0, hairK = p.hair ?? 0;
  const Y = (v: number) => top + v;
  const X = (v: number) => cx + v;
  const skinS = shade(PRO.skin, 0.82);
  const front = p.front ?? { dx: 0 }, back = p.back ?? { dx: 0 };
  const hip = Y(29) + b;

  const leg = (dx: number, lift: number, col: Color, bootC: Color, w: number) => {
    const x = X(-2) + dx, len = Math.max(4, base - hip + 1 - lift);
    P.rect(x, hip, 3, len, col);
    P.rect(x, hip + len - 3, w, 3, bootC);
    for (const v of [33, 37, 41]) { const yy = Y(v) + b; if (yy < hip + len - 3) P.rect(x, yy, 3, 1, PRO.wrap); }
  };
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
    if (isFront) {
      const fx = a.h[0] - a.e[0], fy = a.h[1] - a.e[1], L = Math.hypot(fx, fy) || 1;
      P.set(hx2 - Math.round(fx / L), hy - Math.round(fy / L), RED); // red thread at the wrist
    }
    P.rect(hx2, hy, 2, 2, hand);
  };

  leg(back.dx - 1, back.lift ?? 0, shade(PRO.pants, 0.78), shade(PRO.boot, 0.8), 3);
  drawArm(ARMS[p.backArm ?? "rest"], shade(PRO.sleeve, 0.72), skinS, false);

  // coat: knee length; hem flutter is secondary motion
  const flutter = p.coat ?? 0;
  // crouching shortens the visible coat so deep poses keep a readable leg silhouette
  const coatEnd = Math.min(base - 2 - Math.floor(b / 2), Y(38) + b - Math.floor(b / 2));
  P.rect(X(-5) + ln, Y(11) + b, 10, Y(22) - Y(11), PRO.coat);
  P.tri(X(-5) + ln, Y(22) + b, X(5) + ln, Y(22) + b, X(-5) - flutter, coatEnd, PRO.coat);
  P.rect(X(-5) - flutter, Y(22) + b, 10 + flutter, coatEnd - Y(22) - b, PRO.coat);
  P.rect(X(-5) - flutter, Y(22) + b, 1, coatEnd - Y(22) - b, shade(PRO.coat, 0.8));
  if (flutter > 0) P.rect(X(-6) - flutter, coatEnd - 4, 2, 4, shade(PRO.coat, 0.85));
  P.rect(X(-4) + ln, Y(11) + b, 8, Y(22) - Y(11), PRO.shirt);
  P.rect(X(-5) + ln, Y(11) + b, 2, Y(22) - Y(11), PRO.coat);
  P.rect(X(3) + ln, Y(11) + b, 2, Y(22) - Y(11), PRO.coat);
  P.rect(X(-4) + ln, Y(22) + b, 9, 1, PRO.belt);

  leg(front.dx, front.lift ?? 0, PRO.pants, PRO.boot, 4);

  // satchel strap + bag (silhouette anchor)
  P.line(X(3) + ln, Y(11) + b, X(-4) + ln, Y(21) + b, PRO.strap);
  P.rect(X(-8) + ln, Y(19) + b, 4, 5, PRO.bag);
  P.rect(X(-8) + ln, Y(19) + b, 4, 1, shade(PRO.bag, 0.75));

  // head + hair tail (silhouette anchor); the tail trails behind motion
  const hx0 = ln + (ln > 1 ? 1 : ln < -1 ? -1 : 0);
  P.rect(X(0) + hx0, Y(9) + b, 3, 2, skinS);
  P.rect(X(-3) + hx0, Y(2) + b, 7, 8, PRO.skin);
  P.rect(X(4) + hx0, Y(5) + b, 1, 2, PRO.skin);
  P.rect(X(-3) + hx0, Y(1) + b, 8, 3, PRO.hair);
  P.rect(X(-3) + hx0, Y(3) + b, 2, 4, PRO.hair);
  const tailUp = hairK >= 2 ? 1 : 0;
  P.rect(X(-6) + hx0 - Math.min(hairK, 2), Y(4) + b - tailUp, 3, 2, PRO.hair);
  P.set(X(-7) + hx0 - Math.min(hairK, 2), Y(hairK >= 2 ? 3 : 6) + b, PRO.hair);
  P.set(X(-4) + hx0, Y(4) + b, "#6b4a2f");
  P.set(X(4) + hx0, Y(3) + b, PRO.hair); P.set(X(4) + hx0, Y(4) + b, PRO.hair);
  if (p.eyes === "closed") { P.set(X(2) + hx0, Y(5) + b, skinS); P.set(X(1) + hx0, Y(6) + b, "#3b2a22"); P.set(X(2) + hx0, Y(6) + b, "#3b2a22"); }
  else P.set(X(2) + hx0, Y(5) + b, "#1b1714");

  const arm = ARMS[p.arm ?? "rest"] as ArmPose;
  if (!arm.blade) { P.rect(X(4) + ln, Y(21) + b, 1, 3, PRO.grip); P.rect(X(4) + ln, Y(24) + b, 2, 6, PRO.blade); }
  drawArm(arm, PRO.sleeve, PRO.skin, true);
  P.outline();

  // smear: a 2-tone arc along the blade path, drawn after the outline so it reads as motion, not form
  if (p.smear) {
    const [a0, a1, r] = p.smear === "down" ? [-1.15, 0.95, 15] : p.smear === "up" ? [0.9, -1.25, 15] : [-2.0, 0.45, 17];
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const a = a0 + ((a1 - a0) * i) / steps, fade = i / steps;
      const px = sx + 2 + Math.cos(a) * r, py = sy + Math.sin(a) * r;
      if (!P.get(px, py)) P.set(px, py, fade > 0.55 ? PRO.bladeHi : "#9fb0b6");
      const px2 = sx + 2 + Math.cos(a) * (r - 2), py2 = sy + Math.sin(a) * (r - 2);
      if (fade > 0.35 && !P.get(px2, py2)) P.set(px2, py2, "#c9d4d8");
    }
  }
  return P;
}

/** Lying on the ground (death, last frame). Drawn separately because it is not a standing pose. */
export function protagonistLying(): Px {
  const P = new Px(48, 56), g = 54;
  P.rect(6, g - 4, 12, 3, PRO.pants); P.rect(4, g - 4, 3, 3, PRO.boot); P.rect(9, g - 2, 2, 1, PRO.wrap);
  P.rect(16, g - 6, 16, 5, PRO.coat); P.rect(18, g - 6, 12, 2, PRO.shirt); P.line(18, g - 6, 29, g - 2, PRO.strap);
  P.rect(31, g - 7, 7, 6, PRO.skin); P.rect(31, g - 8, 7, 3, PRO.hair); P.rect(38, g - 8, 3, 2, PRO.hair);
  P.rect(24, g - 2, 8, 2, PRO.sleeve); P.set(32, g - 2, RED); P.rect(33, g - 2, 2, 2, PRO.skin);
  P.line(36, g - 1, 43, g - 1, PRO.blade);
  return P.outline();
}

/* ---------------- startled boar (thú hoảng) ---------------- */
export interface BoarPose { legs?: number; gallop?: boolean; headDy?: number; bodyDy?: number; side?: boolean; squint?: boolean; recoil?: number; }
export function boar(p: BoarPose = {}): Px {
  const P = new Px(36, 24);
  const body = "#5a4a3c", belly = mix(body, "#c9a78a", 0.35), dark = shade(body, 0.78);
  const bd = p.bodyDy ?? 0, hd = p.headDy ?? 0, rx = -(p.recoil ?? 0);
  if (p.side) {
    P.ell(17, 18, 13, 5, body); P.ell(17, 20, 10, 2, belly); P.ell(29, 19, 5, 4, body);
    for (const x of [9, 13, 20, 24]) P.line(x, 14, x - 2, 9, dark);
    P.set(30, 18, "#2a211c"); P.line(33, 21, 35, 19, "#e9e1cf");
    return P.outline();
  }
  // leg cycle: walk (4 phases) or gallop (2 phases: stretched / gathered)
  const k = p.legs ?? 0;
  const walk = [[0, 1, 0, -1], [1, 0, -1, 0], [0, -1, 0, 1], [-1, 0, 1, 0]][k % 4];
  const gal = k % 2 === 0 ? [3, 3, -3, -3] : [-1, -1, 2, 2];
  const off = p.gallop ? gal : walk;
  const lift = p.gallop && k % 2 === 1 ? 2 : 0;
  [[8, 1], [12, 0], [22, 1], [26, 0]].forEach(([x, back], i) => P.rect(x + off[i] + rx, 15 + bd + (i < 2 ? 0 : 0), 3, 6 - bd - lift, back ? dark : body));
  P.ell(17 + rx, 12 + bd, 12, 6, body);
  P.ell(17 + rx, 15 + bd, 9, 2, belly);
  P.ell(28 + rx, 13 + bd + hd, 5, 4, body);
  P.rect(31 + rx, 13 + bd + hd, 3, 3, mix(body, "#c9a78a", 0.25));
  P.set(33 + rx, 14 + bd + hd, "#2a211c");
  P.set(29 + rx, 11 + bd + hd, p.squint ? dark : "#e8b04a");
  P.line(32 + rx, 16 + bd + hd, 34 + rx, 13 + bd + hd, "#e9e1cf");
  P.tri(25 + rx, 8 + bd + hd, 27 + rx, 5 + bd + hd, 28 + rx, 9 + bd + hd, shade(body, 0.85));
  for (let i = 0; i < 6; i++) P.set(9 + i * 2 + rx, 6 + bd + (i % 2) - (p.gallop ? 1 : 0), dark);
  return P.outline();
}

/* ---------------- Nanh Rễ (concept pick A, living roots) ---------------- */
export interface NanhPose {
  bob?: number;
  legs?: number; // walk phase 0–3
  gallop?: boolean;
  pose?: "normal" | "low" | "rear" | "toss" | "slam" | "daze" | "flinch";
  collapse?: number; // 0 standing … 3 down
  sway?: number; // root sway (secondary motion)
}
export function nanhRe(p: NanhPose = {}): Px {
  const P = new Px(100, 60), r = rng(11);
  const body = "#6b5a4c", belly = mix(body, "#d0b89a", 0.35), root = "#2c2420", tip = "#7fa65a";
  const b = p.bob ?? 0, pose = p.pose ?? "normal", col = p.collapse ?? 0, sway = p.sway ?? 0;
  const ox = pose === "flinch" ? -3 : 0;
  const dy = col >= 3 ? 8 : col === 2 ? 5 : col === 1 ? 2 : pose === "slam" ? 2 : 0;
  const hy = col >= 3 ? 1 : col >= 1 ? 2 + col : pose === "low" ? 6 : pose === "rear" ? -7 : pose === "toss" ? -5 : pose === "slam" ? 4 : pose === "daze" ? 5 : 0;
  const hx = pose === "low" ? 2 : pose === "toss" ? 3 : pose === "daze" ? -1 : 0;
  // legs
  if (col < 3) {
    const k = p.legs ?? 0;
    const walk = [[0, 2, 0, -2], [2, 0, -2, 0], [0, -2, 0, 2], [-2, 0, 2, 0]][k % 4];
    const gal = k % 2 === 0 ? [-4, -4, 4, 4] : [2, 2, -2, -2];
    const off = p.gallop ? gal : walk;
    ([[26, 1], [36, 0], [58, 1], [68, 0]] as const).forEach(([x, back], i) => {
      const frontLeg = x > 50;
      const lift = (pose === "rear" && frontLeg ? 5 : 0) + (col === 1 && frontLeg ? 4 : 0) + (col === 2 ? 5 : 0);
      const lh = Math.max(3, 12 - lift);
      P.rect(x + off[i] + ox, 54 - lh - 1 + 0, 5, lh, back ? shade(body, 0.8) : body);
      P.rect(x + off[i] + ox, 52, 6, 3, "#2a211c");
    });
  }
  P.ell(46 + ox, 33 + b + dy, 32, col >= 3 ? 12 : 14, body);
  P.ell(46 + ox, 39 + b + dy, 26, 6, belly);
  const H = (x: number) => x + hx + ox, V = (y: number) => y + b + dy + hy;
  P.ell(H(78), V(36), 12, 10, body);
  P.rect(H(86), V(38), 7, 7, mix(body, "#d0b89a", 0.25));
  P.set(H(92), V(41), "#2a211c"); P.set(H(92), V(43), "#2a211c");
  P.tri(H(72), V(25), H(77), V(18), H(79), V(27), shade(body, 0.85));
  const eyeOpen = col < 3 && pose !== "daze" && pose !== "flinch";
  P.set(H(81), V(33), eyeOpen ? "#e8b04a" : shade(body, 0.7)); P.set(H(82), V(33), eyeOpen ? "#e8b04a" : "#2a211c");
  const tuskUp = pose === "toss" ? -3 : 0;
  P.line(H(88), V(45), H(95), V(36) + tuskUp, "#e9e1cf", 2);
  P.line(H(86), V(46), H(92), V(40) + tuskUp, "#e9e1cf", 1);
  for (const [x, y] of [[90, 42], [92, 39], [94, 37]]) P.set(H(x), V(y) + (tuskUp ? -1 : 0), root);
  // roots through the back, swaying (secondary motion); droop when dazed or collapsing
  const droop = pose === "daze" || col > 0 ? 3 : 0;
  for (let i = 0; i < 16; i++) {
    const x = 18 + i * 3.6 + r() * 2 + ox, y = 22 + Math.abs(i - 8) * 0.6 + b + dy, h = 5 + r() * 9 - droop;
    const ex = x + (r() - 0.5) * 6 + sway * (1 + (i % 3)) - droop;
    P.line(x, y, ex, y - h, root, 1);
    P.set(ex, y - h - 1, tip);
  }
  for (let k2 = 0; k2 < 6; k2++) { const sx = 26 + k2 * 8 + ox; P.line(sx, 30 + b + dy, sx + 6, 36 + b + dy, shade(root, 1.4)); }
  return P.outline();
}

export function piglet(frame: number): Px {
  const P = new Px(12, 9), body = mix("#6b5a4c", "#c9a78a", 0.4);
  P.ell(5, 5 - (frame === 1 ? 1 : 0), 4, 3, body);
  P.rect(2 + frame, 7, 1, 2, body); P.rect(7 - frame, 7, 1, 2, body);
  P.set(9, 4 - (frame === 1 ? 1 : 0), "#2a211c");
  for (let s = -2; s <= 2; s += 2) P.set(5 + s, 3 - (frame === 1 ? 1 : 0), "#e6d3b4");
  return P.outline();
}

export function rootSpike(stage: number): Px {
  // stage 0: tip breaking ground, 1: full, 2: cracking/withdrawing
  const P = new Px(12, 36), h = stage === 0 ? 10 : 34;
  P.tri(1, 35, 6, 36 - h, 11, 35, stage === 2 ? "#3a302a" : "#2c2420");
  P.line(6, 35, 6, 37 - h + 2, "#3e332c");
  if (stage !== 2) { P.set(6, 36 - h - 1, "#7fa65a"); P.set(5, 37 - h, "#7fa65a"); P.set(7, 38 - h, "#9cc76a"); }
  else for (let i = 0; i < 4; i++) P.set(3 + i * 2, 20 + i * 4, "#1a1512");
  P.rect(0, 33, 12, 3, "#3e332c");
  return P.outline();
}

export function bush(shake: number): Px {
  const P = new Px(28, 24), o = shake;
  P.ell(14, 15, 12, 9, "#3e6a3a"); P.ell(9 + o, 11, 6, 6, "#4f7f45"); P.ell(18 + o, 10, 7, 6, "#4a7840");
  for (let i = 0; i < 8; i++) P.set(5 + i * 2.5 + o, 8 + (i % 3) * 4, "#7aa45c");
  P.rect(12, 20, 4, 4, "#4a3524");
  return P.outline();
}

export function herb(glint: number): Px {
  const P = new Px(11, 12);
  P.line(5, 11, 5, 4, "#4f7f45"); P.ell(3, 5, 2, 1.4, "#7aa45c"); P.ell(7, 4, 2, 1.4, "#7aa45c"); P.set(5, 2, "#d4b04a");
  P.outline();
  if (glint === 1) { P.set(8, 1, "#f6e7a0"); P.set(9, 1, "#fffbe6"); P.set(8, 0, "#f6e7a0"); }
  if (glint === 2) { P.set(2, 2, "#fffbe6"); }
  return P;
}

export function shrine(lit: boolean, flicker = 0): Px {
  const P = new Px(26, 38);
  P.rect(3, 32, 20, 6, "#6f6a5c");
  P.rect(6, 8, 14, 25, "#8a8576"); P.rect(6, 8, 1, 25, "#6f6a5c");
  P.tri(4, 9, 13, 3, 22, 9, "#6f6a5c");
  const g = lit ? ["#7ee08a", "#9cf0a4", "#6fd07c"][flicker % 3] : "#5d6a5a";
  for (let a = 0; a < 5; a++) { P.line(8 + a * 2, 13, 13, 20, g); P.line(18 - a * 2, 28, 13, 20, g); }
  P.set(13, 20, lit ? "#e8ffd0" : "#7a8676");
  P.outline();
  if (lit) { // flame-like Mạch glow on the cap
    const fh = [3, 4, 2][flicker % 3];
    P.rect(12, 3 - fh, 3, fh, ["#cfffd6", "#b6f5c0", "#e8ffe8"][flicker % 3]); P.set(13, 2 - fh, "#ffffff");
  }
  return P;
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

/* ---------------- FX sprites ---------------- */
/** Slash arc, 3 frames: leading edge (0), full arc (1), thinning tail (2). */
export function slash(level: number, frame: number): Px {
  const w = 34 + level * 6, h = 30 + level * 6, P = new Px(w, h);
  const c = level >= 2 ? "#f6eccc" : "#e3eaec";
  const from = frame === 2 ? 12 : 0, to = frame === 0 ? 14 : 24;
  for (let t = from; t <= to; t++) {
    const a = -Math.PI * 0.45 + (Math.PI * 0.9 * t) / 24, rx = w * 0.45, ry = h * 0.45;
    P.set(w * 0.2 + Math.cos(a) * rx, h / 2 + Math.sin(a) * ry, c);
    if (frame < 2 || t % 2 === 0) P.set(w * 0.2 + Math.cos(a) * (rx - 2), h / 2 + Math.sin(a) * (ry - 2), shade(c, 0.75));
    if (level > 0 && frame === 1) P.set(w * 0.2 + Math.cos(a) * (rx - 4), h / 2 + Math.sin(a) * (ry - 4), shade(c, 0.55));
  }
  return P;
}
export function dustFrame(f: number): Px {
  const P = new Px(8, 8), rr = [3.4, 2.8, 1.8][f];
  P.ell(4, 4, rr, rr, ["#8a8670", "#7a7662", "#6a6654"][f]);
  if (f === 0) P.ell(3, 3, 1.5, 1.5, "#a8a48c");
  return P;
}
export function sparkFrame(f: number): Px {
  const P = new Px(5, 3);
  if (f === 0) P.rect(0, 1, 5, 1, "#fff6d8");
  if (f === 1) { P.rect(1, 1, 3, 1, "#f6e7a0"); }
  if (f === 2) P.set(2, 1, "#e8b04a");
  return P;
}
export function impactFrame(f: number): Px {
  const P = new Px(21, 21), c = 10;
  const len = [6, 9, 10][f], col = ["#ffffff", "#f6e7a0", "#e8b04a"][f];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8 + (f === 1 ? 0.2 : 0), inner = f === 2 ? 6 : f === 1 ? 3 : 0;
    P.line(c + Math.cos(a) * inner, c + Math.sin(a) * inner, c + Math.cos(a) * len, c + Math.sin(a) * len, col);
  }
  if (f === 0) P.ell(c, c, 3, 3, "#ffffff");
  return P;
}
export function moteFrame(): Px { const P = new Px(2, 2); P.rect(0, 0, 2, 2, "#d9f0b0"); P.set(1, 1, "#a9c98a"); return P; }
export function leafFrame(f: number): Px {
  // yellowing leaf with a dark vein: the first sign of Linh Suy (Ch1)
  const P = new Px(6, 5);
  if (f === 0) { P.ell(3, 2, 2.6, 1.6, "#d4b04a"); P.line(1, 2, 5, 2, "#3a2a18"); }
  else { P.rect(2, 0, 2, 5, "#c9a040"); P.line(3, 0, 3, 4, "#3a2a18"); }
  return P;
}
export function tuftFrame(f: number): Px {
  const P = new Px(9, 7), lean = f - 1;
  const g1 = "#4f7f45", g2 = "#6a9a52";
  P.line(1, 6, 1 + lean, 2, g1); P.line(4, 6, 4 + lean * 2, 0, g2); P.line(7, 6, 7 + lean, 3, g1);
  return P;
}
export function ringFrame(f: number): Px {
  const s = 15 + f * 8, P = new Px(s, s);
  for (let i = 0; i < 28; i++) { const a = (Math.PI * 2 * i) / 28; P.set(s / 2 + Math.cos(a) * (s / 2 - 1), s / 2 + Math.sin(a) * (s / 2 - 1), ["#e8ffd0", "#9cf0a4", "#5fae6a"][f]); }
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
  for (let t = 0; t < 3; t++) { const tx = 15 + t * 55 + r() * 10, tw = 12 + r() * 5; P.rect(tx, 0, tw, 90, mix(p.mid, p.far, 0.4)); }
  return P;
}

/* =====================================================================================
 * Registration: every frame becomes its own texture key. Clips (src/clips.ts) reference keys.
 * ===================================================================================== */
export function registerTextures(scene: Phaser.Scene): void {
  const add = (key: string, px: Px) => { if (!scene.textures.exists(key)) scene.textures.addCanvas(key, px.toCanvas()); };
  const pose = (key: string, p: Pose) => add(key, protagonist(p));

  // idle: breathing (bob), coat and hair settle; plus a blink frame
  [[0, 0, 0], [0, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0], [0, 0, 0]].forEach(([bob, coat, hair], i) => pose(`p_idle${i}`, { bob, coat, hair }));
  pose("p_blink", { eyes: "closed" });
  // run: 8 frames (contact, down, pass, up) × 2 with opposite arm swing; bob is lowest just after contact
  for (let i = 0; i < 8; i++) {
    const ph = (i / 8) * Math.PI * 2, c = Math.cos(ph), s = Math.sin(ph);
    const fdx = Math.round(6 * c);
    pose(`p_run${i}`, {
      lean: 2, bob: [1, 2, 1, 0][i % 4],
      front: { dx: fdx, lift: s > 0.3 ? Math.round(5 * s) : 0 },
      back: { dx: -fdx, lift: s < -0.3 ? Math.round(-5 * s) : 0 },
      arm: fdx > 2 ? "swingB" : fdx < -2 ? "swingF" : "rest",
      backArm: fdx > 2 ? "swingF" : fdx < -2 ? "swingB" : "rest",
      coat: 2 + (i % 2), hair: 1 + (i % 2),
    });
  }
  pose("p_runStart", { lean: 3, bob: 1, front: { dx: 4 }, back: { dx: -4, lift: 2 }, arm: "swingB", backArm: "swingF", coat: 1, hair: 1 });
  pose("p_skid", { lean: -3, bob: 2, front: { dx: 6 }, back: { dx: -3 }, arm: "swingF", backArm: "tuck", coat: 4, hair: 2 });
  pose("p_stop", { lean: -1, bob: 1, front: { dx: 2 }, back: { dx: -2 }, coat: 2, hair: 1 });
  // air
  pose("p_takeoff", { lean: 1, front: { dx: 2, lift: 4 }, back: { dx: -3 }, arm: "reach", backArm: "swingB", coat: 0, hair: 0 });
  pose("p_rise", { front: { dx: 3, lift: 5 }, back: { dx: -2, lift: 1 }, arm: "reach", backArm: "swingB", coat: 1, hair: 0 });
  pose("p_apex", { bob: 1, front: { dx: 3, lift: 4 }, back: { dx: -2, lift: 3 }, arm: "tuck", backArm: "swingF", coat: 3, hair: 2 });
  pose("p_fall0", { front: { dx: 2, lift: 1 }, back: { dx: -3 }, arm: "swingF", backArm: "swingF", coat: 4, hair: 2 });
  pose("p_fall1", { front: { dx: 2, lift: 2 }, back: { dx: -3 }, arm: "tuck", backArm: "swingF", coat: 5, hair: 2 });
  pose("p_land0", { bob: 5, lean: 1, front: { dx: 5 }, back: { dx: -5 }, arm: "swingF", backArm: "swingB", coat: 2, hair: 1 });
  pose("p_land1", { bob: 2, front: { dx: 3 }, back: { dx: -3 }, coat: 1 });
  // light A (downward diagonal)
  pose("p_aW1", { lean: -1, front: { dx: 2 }, back: { dx: -3 }, arm: "wind1", backArm: "swingF" });
  pose("p_aW2", { lean: -2, bob: 1, front: { dx: 2 }, back: { dx: -4 }, arm: "wind2", backArm: "swingF", hair: 0 });
  pose("p_aS", { lean: 3, front: { dx: 5 }, back: { dx: -4 }, arm: "strike", backArm: "swingB", coat: 2, hair: 2, smear: "down" });
  pose("p_aH", { lean: 3, front: { dx: 5 }, back: { dx: -4 }, arm: "follow", backArm: "swingB", coat: 2, hair: 2 });
  pose("p_aF", { lean: 2, bob: 1, front: { dx: 4 }, back: { dx: -4 }, arm: "follow", backArm: "swingB", coat: 1, hair: 1 });
  pose("p_aR", { lean: 1, bob: 1, front: { dx: 3 }, back: { dx: -3 }, arm: "settle", backArm: "rest", coat: 1 });
  // light B (rising)
  pose("p_bW1", { lean: -1, bob: 1, front: { dx: 3 }, back: { dx: -3 }, arm: "low1", backArm: "swingF" });
  pose("p_bW2", { lean: -2, bob: 2, front: { dx: 3 }, back: { dx: -4 }, arm: "low2", backArm: "swingF" });
  pose("p_bS", { lean: 3, front: { dx: 5 }, back: { dx: -4, lift: 1 }, arm: "upStrike", backArm: "swingB", coat: 2, hair: 2, smear: "up" });
  pose("p_bH", { lean: 2, front: { dx: 5 }, back: { dx: -4 }, arm: "upFollow", backArm: "swingB", coat: 2, hair: 2 });
  pose("p_bF", { lean: 1, front: { dx: 4 }, back: { dx: -3 }, arm: "upFollow", backArm: "rest", coat: 1, hair: 1 });
  pose("p_bR", { bob: 1, front: { dx: 2 }, back: { dx: -2 }, arm: "lowHold", backArm: "rest" });
  // overhead (third light, heavy, riposte)
  pose("p_oW1", { lean: -1, bob: 1, front: { dx: 3 }, back: { dx: -3 }, arm: "over1", backArm: "reach" });
  pose("p_oW2", { lean: -3, bob: 2, front: { dx: 3 }, back: { dx: -5 }, arm: "over2", backArm: "reach", coat: 1 });
  pose("p_oW3", { lean: -3, bob: 3, front: { dx: 3 }, back: { dx: -5 }, arm: "over2", backArm: "reach", coat: 2 });
  pose("p_oS", { lean: 4, bob: 1, front: { dx: 6 }, back: { dx: -5 }, arm: "chop", backArm: "swingB", coat: 3, hair: 2, smear: "over" });
  pose("p_oH", { lean: 4, bob: 3, front: { dx: 6 }, back: { dx: -5 }, arm: "slam", backArm: "swingB", coat: 3, hair: 2 });
  pose("p_oF", { lean: 3, bob: 3, front: { dx: 5 }, back: { dx: -5 }, arm: "slam", backArm: "swingB", coat: 2, hair: 1 });
  pose("p_oR", { lean: 1, bob: 1, front: { dx: 3 }, back: { dx: -3 }, arm: "lowHold", backArm: "rest", coat: 1 });
  // dodge
  pose("p_d0", { lean: 2, bob: 3, front: { dx: 4 }, back: { dx: -4 }, arm: "tuck", backArm: "swingB", coat: 2, hair: 1 });
  pose("p_d1", { lean: 4, bob: 6, front: { dx: 6, lift: 4 }, back: { dx: -7 }, arm: "tuck", backArm: "swingB", coat: 3, hair: 2 });
  pose("p_d2", { lean: 4, bob: 5, front: { dx: 5, lift: 3 }, back: { dx: -6, lift: 1 }, arm: "tuck", backArm: "swingB", coat: 3, hair: 2 });
  pose("p_d3", { lean: 1, bob: 2, front: { dx: 3 }, back: { dx: -3 }, arm: "swingF", backArm: "swingB", coat: 3, hair: 1 });
  // guard / parry
  pose("p_g0", { bob: 1, front: { dx: 3 }, back: { dx: -3 }, arm: "guard", backArm: "tuck" });
  pose("p_g1", { bob: 1, front: { dx: 3 }, back: { dx: -3 }, arm: "guard", backArm: "tuck", coat: 1 });
  pose("p_parry", { lean: -2, bob: 2, front: { dx: 3 }, back: { dx: -4 }, arm: "guardPush", backArm: "tuck", coat: 2, hair: 2 });
  pose("p_charge0", { lean: -3, bob: 2, front: { dx: 3 }, back: { dx: -5 }, arm: "over2", backArm: "reach", coat: 1 });
  pose("p_charge1", { lean: -3, bob: 3, front: { dx: 3 }, back: { dx: -5 }, arm: "over2", backArm: "reach", coat: 2, hair: 1 });
  // hurt / death / heal
  pose("p_hurt0", { lean: -3, bob: 1, front: { dx: -1, lift: 1 }, back: { dx: -3 }, arm: "hurt", backArm: "swingB", coat: 0, hair: 0, eyes: "closed" });
  pose("p_hurt1", { lean: -1, bob: 1, front: { dx: 1 }, back: { dx: -3 }, arm: "hurt", backArm: "swingB", coat: 1 });
  pose("p_death0", { lean: -3, bob: 2, front: { dx: -1 }, back: { dx: -3 }, arm: "hurt", backArm: "swingB", eyes: "closed" });
  pose("p_death1", { lean: 2, bob: 7, front: { dx: 4, lift: 4 }, back: { dx: -3 }, arm: "fall", backArm: "rest", eyes: "closed" });
  pose("p_death2", { lean: 5, bob: 11, front: { dx: 5, lift: 6 }, back: { dx: -4, lift: 2 }, arm: "fall", backArm: "fall", eyes: "closed" });
  add("p_death3", protagonistLying());
  pose("p_heal0", { bob: 4, front: { dx: 3, lift: 1 }, back: { dx: -4 }, arm: "reach", backArm: "tuck" });
  pose("p_heal1", { bob: 4, front: { dx: 3, lift: 1 }, back: { dx: -4 }, arm: "mouth", backArm: "tuck", eyes: "closed" });

  // boar
  for (let i = 0; i < 2; i++) add(`boar_idle${i}`, boar({ bodyDy: i }));
  for (let i = 0; i < 4; i++) add(`boar_walk${i}`, boar({ legs: i }));
  for (let i = 0; i < 2; i++) add(`boar_paw${i}`, boar({ headDy: 2, legs: i * 2, bodyDy: 1 }));
  for (let i = 0; i < 2; i++) add(`boar_gal${i}`, boar({ gallop: true, legs: i }));
  for (let i = 0; i < 2; i++) add(`boar_stun${i}`, boar({ headDy: 3, squint: true, bodyDy: i }));
  add("boar_hurt", boar({ recoil: 2, squint: true }));
  add("boar_dead0", boar({ headDy: 3, bodyDy: 2, squint: true }));
  add("boar_dead1", boar({ side: true }));
  // Nanh Rễ
  for (let i = 0; i < 4; i++) add(`nanh_idle${i}`, nanhRe({ bob: i === 1 || i === 2 ? 1 : 0, sway: [0, 1, 0, -1][i] }));
  for (let i = 0; i < 4; i++) add(`nanh_walk${i}`, nanhRe({ legs: i, bob: i % 2, sway: i % 2 ? -1 : 1 }));
  for (let i = 0; i < 2; i++) add(`nanh_gal${i}`, nanhRe({ gallop: true, legs: i, bob: i, sway: -2 }));
  for (let i = 0; i < 2; i++) add(`nanh_low${i}`, nanhRe({ pose: "low", legs: i * 2, bob: i, sway: -1 }));
  add("nanh_rear0", nanhRe({ pose: "rear", sway: 1 }));
  add("nanh_rear1", nanhRe({ pose: "rear", bob: 1, sway: 2 }));
  add("nanh_slam", nanhRe({ pose: "slam", sway: -2 }));
  add("nanh_toss", nanhRe({ pose: "toss", sway: 2 }));
  for (let i = 0; i < 2; i++) add(`nanh_daze${i}`, nanhRe({ pose: "daze", bob: i, sway: i ? -1 : 1 }));
  add("nanh_flinch", nanhRe({ pose: "flinch", sway: -2 }));
  for (let i = 1; i <= 3; i++) add(`nanh_fall${i}`, nanhRe({ collapse: i }));
  add("piglet0", piglet(0)); add("piglet1", piglet(1));
  // hazards, props, environment
  for (let i = 0; i < 3; i++) add(`root${i}`, rootSpike(i));
  for (let i = 0; i < 3; i++) add(`bush${i}`, bush([0, 1, -1][i]));
  for (let i = 0; i < 3; i++) add(`herb${i}`, herb(i));
  add("shrine_off", shrine(false));
  for (let i = 0; i < 3; i++) add(`shrine_on${i}`, shrine(true, i));
  add("sign", sign());
  add("ground", groundTile());
  add("dirt", dirtTile());
  add("bg_thanhmoc", thanhMocBackground());
  // FX
  for (let lv = 0; lv < 3; lv++) for (let fr = 0; fr < 3; fr++) add(`slash${lv}_${fr}`, slash(lv, fr));
  for (let i = 0; i < 3; i++) { add(`dust${i}`, dustFrame(i)); add(`spark${i}`, sparkFrame(i)); add(`impact${i}`, impactFrame(i)); add(`ring${i}`, ringFrame(i)); add(`tuft${i}`, tuftFrame(i)); }
  add("mote", moteFrame());
  add("leaf0", leafFrame(0)); add("leaf1", leafFrame(1));
  if (!scene.anims.exists("piglet")) scene.anims.create({ key: "piglet", frames: [{ key: "piglet0" }, { key: "piglet1" }], frameRate: 6, repeat: -1 });
}
