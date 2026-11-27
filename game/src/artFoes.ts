/**
 * Greybox art for the Chapter I enemies (Phase 3): the rooted deer and great cat (thú hóa rễ), the spore pod (độc thảo),
 * Cương's operatives (người cắt mạch), and the nets they throw. Linh Suy reads the same everywhere (Art Bible §4):
 * black roots with green tips breaking through hide, dark veins. Amber eyes on beasts; red stays reserved.
 * Each animal faces right; feet on the bottom row. Authored frames replace these by key (ADR-0011).
 */
import Phaser from "phaser";
import { Px, mix, rng, shade } from "./art";

const ROOT = "#2c2420", TIP = "#7fa65a";
/** A clump of Linh Suy roots breaking out at (x, y), leaning back. */
function roots(P: Px, x: number, y: number, n: number, h: number, seed: number): void {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x0 = x + i * 2 - n, len = h * (0.6 + r() * 0.5), lean = -1 - r() * 2;
    P.line(x0, y, x0 + lean, y - len, ROOT); P.set(x0 + lean, y - len - 1, TIP);
  }
}

/* ---------------- rooted deer ---------------- */
interface DeerPose { legs?: number; run?: boolean; head?: "up" | "low" | "lunge"; bob?: number; squint?: boolean; down?: boolean; recoil?: number; paw?: boolean }
export function deer(p: DeerPose = {}): Px {
  const P = new Px(56, 48), hide = "#8a6a48", dark = shade(hide, 0.75), belly = mix(hide, "#e0cfb0", 0.4), g = 47;
  if (p.down) { // lying on its side
    P.ell(26, g - 6, 15, 5, hide); P.ell(42, g - 6, 6, 4, hide); P.set(44, g - 7, "#2a211c");
    for (const x of [16, 22, 30]) P.line(x, g - 9, x - 4, g - 14, dark);
    roots(P, 26, g - 10, 4, 6, 5);
    return P.outline();
  }
  const bd = p.bob ?? 0, rx = -(p.recoil ?? 0), k = p.legs ?? 0;
  const walk = [[0, 2, 0, -2], [2, 0, -2, 0], [0, -2, 0, 2], [-2, 0, 2, 0]][k % 4];
  const gal = k % 2 === 0 ? [4, 4, -4, -4] : [-2, -2, 3, 3];
  const off = p.run ? gal : walk;
  [[18, 1], [22, 0], [32, 1], [36, 0]].forEach(([x, back], i) => {
    const lift = p.paw && i === 3 ? 3 : 0;
    P.rect(x + off[i] + rx, g - 18 + bd, 2, 18 - bd - lift, back ? dark : hide); P.set(x + off[i] + rx, g - lift, "#2a211c");
  });
  P.ell(27 + rx, g - 22 + bd, 13, 7, hide); P.ell(27 + rx, g - 18 + bd, 10, 3, belly);
  P.rect(13 + rx, g - 25 + bd, 3, 4, "#e0cfb0"); // the white tail
  // neck and head: up (watching), low (antlers forward: the tell), lunge (driving forward)
  const hd = p.head ?? "up";
  const [nx, ny] = hd === "up" ? [39, g - 36] : hd === "low" ? [44, g - 22] : [47, g - 23];
  P.line(37 + rx, g - 24 + bd, nx + rx, ny + bd, hide, 4);
  P.ell(nx + 3 + rx, ny + 1 + bd, 4, 3, hide); P.rect(nx + 6 + rx, ny + 1 + bd, 3, 2, belly);
  P.set(nx + 3 + rx, ny + bd, p.squint ? dark : "#e8b04a");
  // antlers: living-tree branches, pointing up, or forward when lowered
  const ax = nx + 1 + rx, ay = ny - 2 + bd, fwd = hd !== "up";
  const tine = (dx: number, dy: number) => P.line(ax, ay, ax + dx, ay + dy, "#5a4a36", 1);
  if (!fwd) { tine(-3, -10); tine(-6, -7); tine(1, -11); tine(4, -8); P.set(ax - 3, ay - 11, TIP); P.set(ax + 1, ay - 12, TIP); }
  else { tine(10, -3); tine(8, -7); tine(11, 1); tine(6, -9); P.set(ax + 11, ay - 3, TIP); P.set(ax + 12, ay + 1, TIP); }
  roots(P, 27 + rx, g - 28 + bd, 5, 8, 9); // roots through the back
  return P.outline();
}

/* ---------------- great cat ---------------- */
interface CatPose { legs?: number; crouch?: boolean; leap?: boolean; paw?: boolean; claw?: boolean; squint?: boolean; down?: boolean; recoil?: number; bob?: number }
export function cat(p: CatPose = {}): Px {
  const P = new Px(48, 30), fur = "#8a7a52", dark = shade(fur, 0.7), spot = "#4a3e2a", g = 29;
  if (p.down) {
    P.ell(22, g - 4, 14, 4, fur); P.ell(37, g - 4, 5, 4, fur); P.line(8, g - 3, 2, g - 6, fur, 2);
    roots(P, 20, g - 7, 3, 5, 3);
    return P.outline();
  }
  const rx = -(p.recoil ?? 0), low = p.crouch ? 4 : 0, k = p.legs ?? 0, bd = (p.bob ?? 0) + low;
  const off = [[0, 2, 0, -2], [2, 0, -2, 0], [0, -2, 0, 2], [-2, 0, 2, 0]][k % 4];
  if (p.leap) { // stretched out in the air, forepaws reaching
    P.ell(24, 13, 15, 5, fur);
    P.line(35, 13, 44, 17, fur, 2); P.line(14, 14, 6, 19, dark, 2); P.line(10, 12, 2, 9, fur, 2);
    P.ell(39, 10, 5, 4, fur); P.set(41, 9, "#e8b04a"); P.rect(42, 11, 3, 1, "#e9e1cf");
    for (const x of [18, 24, 30]) P.set(x, 11, spot);
    roots(P, 22, 9, 3, 5, 7);
    return P.outline();
  }
  [[13, 1], [17, 0], [30, 1], [34, 0]].forEach(([x, back], i) => P.rect(x + off[i] + rx, g - 9 + Math.floor(bd / 2), 2, 9 - Math.floor(bd / 2), back ? dark : fur));
  P.ell(24 + rx, g - 12 + bd, 14, 5, fur);
  for (const x of [16, 22, 28]) P.set(x + rx, g - 14 + bd, spot);
  P.line(10 + rx, g - 12 + bd, 3 + rx, g - 17 + bd, fur, 2); P.set(2 + rx, g - 18 + bd, dark); // the tail, raised
  const hx = 38 + rx + (p.crouch ? 1 : 0), hy = g - 16 + bd + (p.crouch ? 2 : 0);
  P.ell(hx, hy, 5, 4, fur); P.rect(hx - 3, hy - 5, 2, 2, fur); P.rect(hx + 1, hy - 5, 2, 2, fur);
  P.set(hx + 2, hy - 1, p.squint ? dark : "#e8b04a");
  if (p.claw) P.rect(hx + 4, hy + 2, 3, 1, "#e9e1cf"); // bared teeth
  if (p.paw || p.claw) { const lift = p.claw ? 6 : 3; P.line(36 + rx, g - 10 + bd, 42 + rx, g - 10 - lift + bd, fur, 2); for (let i = 0; i < 3; i++) P.set(43 + rx + i * 0, g - 11 - lift + bd + i, "#e9e1cf"); }
  roots(P, 22 + rx, g - 16 + bd, 3, 5, 4);
  return P.outline();
}

/* ---------------- spore pod ---------------- */
export function pod(state: "idle0" | "idle1" | "swell" | "burst" | "spent" | "hurt" | "dead"): Px {
  const P = new Px(22, 22), stalk = "#5a6a3a", skin = "#7a8a3e", vein = "#3a4a24", g = 21;
  if (state === "dead") { P.rect(9, g - 3, 4, 3, stalk); P.ell(11, g - 2, 6, 2, "#5a5a2a"); return P.outline(); }
  P.rect(10, g - 6, 2, 6, stalk); P.line(10, g - 1, 6, g, stalk); P.line(12, g - 1, 16, g, stalk);
  const big = state === "swell" ? 1.35 : state === "idle1" ? 1.06 : state === "spent" ? 0.7 : 1;
  const rx = 6 * big, ry = 5.5 * big, cy = g - 7 - ry;
  if (state === "burst") { // split open, spores out
    P.ell(11, cy + 2, rx, ry * 0.6, skin); P.ell(11, cy + 1, rx - 2, 2, "#c8d870");
    for (let i = 0; i < 10; i++) P.set(11 + Math.cos(i) * (rx + 3), cy - 2 + Math.sin(i * 1.7) * (ry + 2), "#c8d870");
    return P.outline();
  }
  P.ell(11, cy, rx, ry, state === "spent" ? "#5a6a30" : skin);
  for (let i = -2; i <= 2; i += 2) P.line(11 + i, cy - ry + 1, 11 + i * 1.4, cy + ry - 1, vein);
  if (state === "swell") { P.set(9, cy - 2, "#e0f090"); P.set(13, cy + 1, "#e0f090"); P.set(11, cy - 4, "#e0f090"); }
  if (state === "hurt") P.rect(8, cy - 1, 6, 2, "#c8d870");
  return P.outline();
}

/* ---------------- Cương's operatives ---------------- */
/**
 * Người cắt mạch: an earth-coloured coat, a cloth wrapped over the lower face, a short blade of dull grey-blue Ty alloy
 * (Ch. I: the cutting tools are Thiên Kinh-grade), a coiled net at the hip. They move like soldiers, not bandits.
 */
type OpArm = "rest" | "cutW" | "cutA" | "cutA2" | "cutR" | "thrustW" | "thrustA" | "throwW" | "throwA" | "hurt";
interface OpPose { bob?: number; front?: number; back?: number; arm?: OpArm; down?: boolean; stun?: boolean; kick?: 0 | 1;
  /** Hùng, the squad leader: no face cloth, the burn scar down cheek and neck, a longer, brighter Ty-alloy blade */
  leader?: boolean }
export function operative(p: OpPose = {}): Px {
  const P = new Px(72, 76), base = 72, top = base - 46, cx = 36;
  const L = !!p.leader;
  const skin = "#b9845f", coat = L ? "#5a4a34" : "#6a5a3e", coatS = shade(coat, 0.75), pants = "#3a342a", mask = "#5a5446", blade = L ? "#8a9aa8" : "#7a8a96", bladeHi = "#d0dae0";
  const scar = "#d8b8a0";
  if (p.down) { // sitting down hard, beaten
    P.rect(24, base - 6, 16, 6, coat); P.rect(38, base - 14, 7, 8, coat); P.rect(39, base - 21, 6, 7, skin); P.rect(39, base - 18, 6, 3, mask); P.rect(39, base - 22, 6, 2, "#2a2420");
    P.rect(14, base - 3, 12, 3, pants);
    return P.outline();
  }
  const b = p.bob ?? 0, Y = (v: number) => top + v + b, X = (v: number) => cx + v;
  const hip = Y(28);
  const leg = (dx: number, col: string, kickLift = 0) => {
    if (kickLift) { P.line(X(0) + dx, hip, X(8) + dx, hip + 6 - kickLift, col, 3); P.rect(X(8) + dx, hip + 4 - kickLift, 4, 3, "#2a221c"); return; }
    P.rect(X(-2) + dx, hip, 3, base - hip, col); P.rect(X(-2) + dx, base - 3, 4, 3, "#2a221c");
  };
  leg((p.back ?? -2) - 1, shade(pants, 0.78));
  P.rect(X(-5), Y(11), 10, 20, coat); P.rect(X(-6), Y(24), 12, 9, coat); P.rect(X(-6), Y(32), 12, 1, coatS);
  P.rect(X(-5), Y(21), 10, 1, "#3a2a1c");
  P.ell(X(-6), Y(25), 3, 3, "#8a7a5a"); // the coiled net at the hip
  leg(p.front ?? 2, pants, p.kick === 1 ? 6 : p.kick === 0 ? 2 : 0);
  // head: cloth over the lower face, eyes only (Hùng: bare face, the burn down his cheek and neck)
  P.rect(X(-2), Y(2), 7, 8, skin); P.rect(X(-3), Y(1), 8, 3, "#2a2420");
  if (L) { P.rect(X(0), Y(5), 2, 5, scar); P.rect(X(-1), Y(9), 3, 3, scar); P.set(X(2), Y(6), scar); P.rect(X(1), Y(8), 3, 1, "#3a2a22"); }
  else P.rect(X(-2), Y(6), 7, 4, mask);
  P.set(X(3), Y(4), "#1b1714");
  // arm and blade
  const A: Record<OpArm, [number, number, number, number]> = { // elbow dx,dy · hand dx,dy (from the shoulder)
    rest: [1, 7, 2, 13], cutW: [-4, 2, -6, -4], cutA: [6, 4, 13, 6], cutA2: [6, 0, 12, -5], cutR: [4, 7, 7, 11],
    thrustW: [-5, 5, -7, 8], thrustA: [7, 2, 15, 2], throwW: [-5, 3, -8, 0], throwA: [6, -1, 12, -4], hurt: [-3, 6, -5, 10],
  };
  const [ex, ey, hx, hy] = A[p.arm ?? "rest"], sx = X(0), sy = Y(13);
  P.line(sx, sy, sx + ex, sy + ey, coatS, 2); P.line(sx + ex, sy + ey, sx + hx, sy + hy, coatS, 2); P.rect(sx + hx, sy + hy, 2, 2, skin);
  const bladeDir: Record<OpArm, [number, number]> = { rest: [3, 9], cutW: [-6, -9], cutA: [12, 1], cutA2: [10, -7], cutR: [8, 6], thrustW: [8, 0], thrustA: [14, 0], throwW: [-2, 6], throwA: [3, 8], hurt: [-6, 6] };
  const bk = L ? 1.35 : 1, [bdx0, bdy0] = bladeDir[p.arm ?? "rest"], bdx = Math.round(bdx0 * bk), bdy = Math.round(bdy0 * bk);
  if (p.arm !== "throwA" && p.arm !== "throwW") { P.line(sx + hx + 1, sy + hy, sx + hx + 1 + bdx, sy + hy + bdy, blade, 1); P.set(sx + hx + 1 + bdx, sy + hy + bdy, bladeHi); }
  else if (p.arm === "throwW") P.ell(sx + hx, sy + hy - 2, 3, 3, "#8a7a5a"); // the net, wound up
  if (p.stun) { P.set(X(1), Y(-2), "#f6e7a0"); P.set(X(4), Y(-3), "#f6e7a0"); }
  return P.outline();
}

/** The thrown net, spinning open in flight. */
export function net(f: number): Px {
  const P = new Px(16, 12), c = "#9a8a62";
  if (f === 0) { P.ell(8, 6, 5, 4, c); P.line(4, 4, 12, 8, shade(c, 0.7)); P.line(4, 8, 12, 4, shade(c, 0.7)); }
  else { for (let x = 1; x < 15; x += 3) P.line(x, 1, x + 1, 10, c); for (let y = 2; y < 11; y += 3) P.line(1, y, 14, y, c); }
  return P;
}

/* ---------------- Độc Đằng, the poison vine colossus ---------------- */
type DdPose = "idle0" | "idle1" | "lashW" | "lashA" | "lashR" | "lowW" | "lowA" | "sporeW" | "sporeA" | "hurt" | "open" | "down";
/**
 * A mass of vine coiled round two trunks, three men tall, bones caught in it (a deer's skull with its antlers), yellow
 * spore sacs swelling over it (prose Ch. 5). 320×160 cell, the mass centred, facing right: a lash reaches ~130 px out.
 * "open": a lash wrapped round a trunk, the core showing (it can be hurt properly now).
 */
export function docDang(pose: DdPose): Px {
  const W = 320, H = 160, P = new Px(W, H), r = rng(2024), cx = 160, g = H - 1;
  const vine = "#3e5a2e", vineHi = "#5a7a3e", vineS = "#2a3e22", trunk = "#3a2c20", sac = "#c8b040", sacHi = "#f0d860", bone = "#d8d0b8";
  // the two trunks it leans on
  P.rect(cx - 52, 0, 14, H, trunk); P.rect(cx + 40, 0, 14, H, trunk);
  // the mass: coils of vine
  const swell = pose === "sporeW" ? 1.25 : pose === "idle1" ? 1.06 : 1;
  for (let i = 0; i < 140; i++) {
    const a = r() * Math.PI * 2, rr = 18 + r() * 46, x0 = cx + Math.cos(a) * rr * 0.75, y0 = g - 60 + Math.sin(a) * rr;
    P.line(x0, y0, x0 + (r() - 0.5) * 22, y0 + (r() - 0.5) * 22, i % 3 ? vine : vineS, 2);
  }
  for (let i = 0; i < 40; i++) P.set(cx - 40 + r() * 80, g - 110 + r() * 100, vineHi);
  // bones caught in it
  P.ell(cx - 18, g - 40, 5, 4, bone); P.line(cx - 22, g - 44, cx - 28, g - 54, bone); P.line(cx - 14, g - 44, cx - 10, g - 54, bone); P.set(cx - 20, g - 40, "#2a2420");
  P.line(cx + 10, g - 80, cx + 22, g - 74, bone, 1); P.line(cx + 6, g - 20, cx + 16, g - 26, bone, 1);
  // spore sacs (the biggest where the vines meet); the core under them glows when open
  if (pose === "open" || pose === "hurt") { P.ell(cx, g - 64, 12, 12, "#a8c040"); P.ell(cx, g - 64, 6, 6, "#e0f090"); }
  for (const [x, y, rad] of [[cx + 4, g - 70, 9], [cx - 26, g - 96, 6], [cx + 24, g - 40, 6], [cx - 8, g - 118, 5], [cx + 30, g - 102, 5]] as const) {
    if (pose === "sporeA") { P.ell(x, y, rad * 0.8, rad * 0.5, "#8a8030"); continue; }
    P.ell(x, y, rad * swell, rad * swell, sac); P.set(x - 2, y - 2, sacHi);
  }
  if (pose === "sporeA") for (let i = 0; i < 24; i++) P.set(cx - 50 + r() * 100, g - 140 + r() * 80, "#e0f090");
  // the lashing vine: raised and drawn back (tell), across at chest height (active), low over the ground (low)
  const lash = (pts: [number, number][], c: string) => { for (let i = 1; i < pts.length; i++) P.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c, 3); };
  if (pose === "lashW") lash([[cx + 20, g - 80], [cx + 30, g - 120], [cx + 10, g - 150], [cx - 20, g - 140]], vine);
  if (pose === "lashA") lash([[cx + 24, g - 70], [cx + 70, g - 40], [cx + 130, g - 36], [cx + 160, g - 32]], vineHi);
  if (pose === "lashR") lash([[cx + 24, g - 70], [cx + 50, g - 50], [cx + 70, g - 30]], vine);
  if (pose === "lowW") lash([[cx + 22, g - 40], [cx + 30, g - 10], [cx + 10, g - 4]], vine);
  if (pose === "lowA") lash([[cx + 22, g - 30], [cx + 70, g - 8], [cx + 130, g - 6], [cx + 160, g - 6]], vineHi);
  if (pose === "open") lash([[cx + 24, g - 70], [cx + 44, g - 90], [cx + 48, g - 60], [cx + 44, g - 30]], vine); // wrapped round the trunk
  if (pose === "down") { // collapsed, seeping
    const Q = new Px(W, H); Q.rect(cx - 52, 0, 14, H, trunk); Q.rect(cx + 40, 0, 14, H, trunk);
    for (let i = 0; i < 70; i++) { const x0 = cx - 60 + r() * 120, y0 = g - 4 - r() * 26; Q.line(x0, y0, x0 + (r() - 0.5) * 20, y0 + 4, i % 2 ? vine : vineS, 2); }
    for (let i = 0; i < 14; i++) Q.set(cx - 50 + r() * 100, g - r() * 6, "#8a8030");
    return Q.outline();
  }
  return P.outline();
}

/* ---------------- Mộc Giác ---------------- */
type MgPose = "idle0" | "idle1" | "walk0" | "walk1" | "walk2" | "walk3" | "low" | "sweep" | "rear" | "stomp" | "charge" | "bleed" | "bow" | "hurt" | "stun" | "down";
/**
 * The guardian of Thanh Mộc's Mạch (spec §8; prose Ch. 5): as long as three buffalo, legs slender like a deer's but each
 * the size of a temple pillar, old moss-coloured coat fallen away in patches over hide cracked like a dry field, a dark
 * vein in every crack. Its antlers are two living trees: one still green, one bare, branches black as charcoal. Eyes the
 * size of a winnowing basket, amber. 300×170 cell, facing right.
 */
/** Draw into a bigger canvas with every x shifted right by `dx` (room for antlers that reach past the first sketch's edge). */
function shifted(Q: Px, dx: number): Px {
  return {
    set: (x: number, y: number, c: string) => Q.set(x + dx, y, c),
    get: (x: number, y: number) => Q.get(x + dx, y),
    rect: (x: number, y: number, w: number, h: number, c: string) => Q.rect(x + dx, y, w, h, c),
    ell: (cx: number, cy: number, rx: number, ry: number, c: string) => Q.ell(cx + dx, cy, rx, ry, c),
    line: (x0: number, y0: number, x1: number, y1: number, c: string, t?: number) => Q.line(x0 + dx, y0, x1 + dx, y1, c, t),
    tri: (ax: number, ay: number, bx: number, by: number, cx: number, cy: number, c: string) => Q.tri(ax + dx, ay, bx + dx, by, cx + dx, cy, c),
    outline: () => Q.outline(),
  } as unknown as Px;
}

export function mocGiac(pose: MgPose): Px {
  // 400×270 cell (the sketch below is laid out 320 wide; it is shifted 30 px right): antlers reach up and forward
  const Q = new Px(400, 270), P = shifted(Q, 30), H = 270, r = rng(909), g = H - 1;
  const moss = "#5a6a3e", mossHi = "#6e7e4a", mossS = "#44522e", hide = "#6a5a44", vein = "#1a1410", leg = "#4a3e2e", hoof = "#2a221a";
  const bark = "#4a3a28", charred = "#1e1814";
  if (pose === "down") { // collapsed, the antlers driven into the ground before it, the green one stripped bare
    P.ell(150, g - 22, 96, 22, moss); for (let i = 0; i < 40; i++) P.set(60 + r() * 180, g - 36 + r() * 28, vein);
    P.ell(258, g - 18, 24, 14, moss); P.set(270, g - 22, "#8a7a4a"); P.rect(276, g - 16, 12, 8, mossS);
    for (const [dx, c] of [[0, charred], [10, bark]] as const) { P.line(244 + dx, g - 28, 290 + dx, g - 2, c, 4); for (let i = 0; i < 6; i++) P.line(260 + dx + i * 5, g - 18 + i * 2, 262 + dx + i * 5 + (r() - 0.5) * 10, g - 40 - r() * 20, c, 1); }
    return Q.outline();
  }
  const low = pose === "low" || pose === "sweep" || pose === "charge", bow = pose === "bow", rear = pose === "rear";
  const bob = pose === "idle1" ? 1 : pose === "stun" ? 5 : pose === "stomp" ? 3 : 0;
  const k = pose.startsWith("walk") ? Number(pose.slice(4)) : pose === "charge" ? 1 : 0, lift = rear ? 26 : 0;
  // legs: slender like a deer's, each the size of a pillar
  const off = [[0, 6, 0, -6], [6, 0, -6, 0], [0, -6, 0, 6], [-6, 0, 6, 0]][k % 4];
  const legs: [number, number][] = [[86, 1], [104, 0], [196, 1], [214, 0]];
  legs.forEach(([x, back], i) => {
    const front = i >= 2, top = g - 66 + bob - (front ? lift : 0), len = front && rear ? 40 : 66 - bob;
    const c = back ? shade(leg, 0.8) : leg;
    P.rect(x + off[i], top, 10, len, c); P.rect(x + off[i] - 1, top + len - 5, 12, 5, hoof);
  });
  // body: a long, heavy barrel; old moss coat fallen away in patches; cracked hide with a dark vein in every crack
  const by = g - 92 + bob - (rear ? 14 : 0);
  P.ell(152, by, 94, 34, moss); P.ell(152, by - 14, 80, 14, mossHi); P.ell(152, by + 16, 80, 12, mossS);
  for (const [x, y, rx, ry] of [[110, by - 4, 22, 12], [168, by + 6, 26, 11], [200, by - 14, 14, 8], [80, by + 8, 12, 8]] as const) {
    P.ell(x, y, rx, ry, hide);
    for (let i = 0; i < 12; i++) { const x0 = x - rx + r() * rx * 2, y0 = y - ry + r() * ry * 2; P.line(x0, y0, x0 + (r() - 0.5) * 9, y0 + (r() - 0.5) * 7, vein); }
  }
  P.rect(56, by - 10, 8, 12, mossS); // a short tail
  if (pose === "bleed") for (let i = 0; i < 40; i++) { const x0 = 70 + r() * 160, y0 = by - 30 + r() * 50; P.set(x0, y0, "#9ab84a"); P.set(x0, y0 - 1, "#c8d870"); }
  // neck: thick, from the shoulders; head: a great deer's head, muzzle forward, amber eye
  const [hx, hy] = rear ? [262, by - 74] : bow ? [266, g - 56] : low ? [270, by - 4] : [258, by - 56];
  P.line(214, by - 14, hx - 14, hy + 8, moss, 22); P.line(214, by - 6, hx - 12, hy + 14, mossS, 10);
  P.ell(hx, hy, 18, 13, moss); P.ell(hx + 16, hy + 6, 11, 8, mossHi); P.rect(hx + 22, hy + 6, 6, 5, hide);
  P.tri(hx - 10, hy - 10, hx - 18, hy - 22, hx - 4, hy - 12, mossS); // the ear
  const eyeC = pose === "stun" || pose === "hurt" ? "#6a5a2a" : "#e8b04a";
  P.ell(hx + 4, hy - 3, 3, 3, eyeC); P.set(hx + 4, hy - 3, "#3a2a10");
  // the antlers: two living trees from the brow. Upright, they spread like a banyan's crown; lowered, they reach forward
  // like a rake. The far one is bare, charred black; the near one still green.
  const ax = hx - 4, ay = hy - 12;
  const tree = (near: boolean) => {
    const c = near ? bark : charred, sp = near ? 1 : -1;
    const [tx, ty] = low || bow ? [ax + 66, ay + (bow ? 26 : 4) - (near ? 0 : 8)] : [ax + 12 * sp, ay - 84];
    P.line(ax, ay, tx, ty, c, 5);
    const branches: [number, number, number][] = [];
    for (let i = 0; i < 7; i++) {
      const t = 0.35 + i * 0.1, px = ax + (tx - ax) * t, py = ay + (ty - ay) * t;
      const [ex, ey] = low || bow ? [px + 6 + r() * 18, py - 14 - r() * 24 + (i % 2) * 30] : [px + (i % 2 ? 1 : -1) * (22 + r() * 34), py - 8 - r() * 22];
      P.line(px, py, ex, ey, c, i < 3 ? 3 : 2);
      for (let j = 0; j < 2; j++) P.line(ex, ey, ex + (r() - 0.5) * 16, ey - 6 - r() * 10, c, 1);
      branches.push([ex, ey, i]);
    }
    if (near) for (const [ex, ey, i] of branches) { P.ell(ex, ey - 2, 12 + (i % 3) * 3, 8, i % 2 ? "#4a7a3a" : "#5a8a44"); P.ell(ex - 3, ey - 5, 6, 4, "#6a9a52"); }
    else for (const [ex, ey] of branches) P.set(ex, ey - 2, "#3a2e22");
  };
  tree(false); tree(true);
  if (pose === "sweep") for (let i = 0; i < 18; i++) P.set(280 + r() * 38, by - 50 + r() * 70, r() < 0.5 ? "#5a8a44" : "#4a7a3a"); // leaves torn loose
  return Q.outline();
}

export function registerFoeTextures(scene: Phaser.Scene): void {
  const add = (key: string, px: Px) => { if (!scene.textures.exists(key)) scene.textures.addCanvas(key, px.toCanvas()); };
  [0, 1].forEach((i) => add(`deer_idle${i}`, deer({ bob: i })));
  for (let i = 0; i < 4; i++) add(`deer_walk${i}`, deer({ legs: i }));
  add("deer_low", deer({ head: "low", bob: 1 })); add("deer_lunge", deer({ head: "lunge", legs: 1 }));
  add("deer_paw", deer({ head: "low", paw: true, bob: 1 })); add("deer_run", deer({ head: "lunge", run: true }));
  add("deer_hurt", deer({ recoil: 2, squint: true })); add("deer_stun", deer({ head: "low", squint: true, bob: 2 })); add("deer_down", deer({ down: true }));

  [0, 1].forEach((i) => add(`cat_idle${i}`, cat({ bob: i })));
  for (let i = 0; i < 4; i++) add(`cat_walk${i}`, cat({ legs: i }));
  add("cat_crouch", cat({ crouch: true })); add("cat_leap", cat({ leap: true }));
  add("cat_paw", cat({ paw: true, crouch: true })); add("cat_claw", cat({ claw: true }));
  add("cat_hurt", cat({ recoil: 2, squint: true })); add("cat_stun", cat({ squint: true, crouch: true })); add("cat_down", cat({ down: true }));

  for (const st of ["idle0", "idle1", "swell", "burst", "spent", "hurt", "dead"] as const) add(`pod_${st}`, pod(st));

  [0, 1].forEach((i) => add(`op_idle${i}`, operative({ bob: i })));
  for (let i = 0; i < 4; i++) { const dx = [4, 0, -4, 0][i]; add(`op_walk${i}`, operative({ front: dx, back: -dx })); }
  for (const a of ["cutW", "cutA", "cutR", "throwW", "throwA"] as const) add(`op_${a}`, operative({ arm: a, front: a === "cutA" || a === "throwA" ? 5 : 2, back: a === "cutA" ? -5 : -2 }));
  add("op_hurt", operative({ arm: "hurt", back: -4 })); add("op_stun", operative({ arm: "hurt", stun: true, bob: 1 })); add("op_down", operative({ down: true }));
  add("net0", net(0)); add("net1", net(1));

  [0, 1].forEach((i) => add(`hung_idle${i}`, operative({ bob: i, leader: true })));
  for (let i = 0; i < 4; i++) { const dx = [4, 0, -4, 0][i]; add(`hung_walk${i}`, operative({ front: dx, back: -dx, leader: true })); }
  for (const a of ["cutW", "cutA", "cutA2", "cutR", "thrustW", "thrustA", "throwW", "throwA"] as const)
    add(`hung_${a}`, operative({ arm: a, leader: true, front: a.endsWith("A") || a === "cutA2" ? 5 : 2, back: a.endsWith("A") ? -5 : -2 }));
  add("hung_kickW", operative({ leader: true, arm: "cutR", kick: 0 })); add("hung_kickA", operative({ leader: true, arm: "cutR", kick: 1 }));
  add("hung_hurt", operative({ arm: "hurt", back: -4, leader: true })); add("hung_stun", operative({ arm: "hurt", stun: true, bob: 1, leader: true }));
  add("hung_down", operative({ down: true, leader: true }));

  for (const st of ["idle0", "idle1", "lashW", "lashA", "lashR", "lowW", "lowA", "sporeW", "sporeA", "hurt", "open", "down"] as const) add(`dd_${st}`, docDang(st));
  for (const st of ["idle0", "idle1", "walk0", "walk1", "walk2", "walk3", "low", "sweep", "rear", "stomp", "charge", "bleed", "bow", "hurt", "stun", "down"] as const) add(`mg_${st}`, mocGiac(st));
}
