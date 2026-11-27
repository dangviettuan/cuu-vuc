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
interface OpPose { bob?: number; front?: number; back?: number; arm?: "rest" | "cutW" | "cutA" | "cutR" | "throwW" | "throwA" | "hurt"; down?: boolean; stun?: boolean }
export function operative(p: OpPose = {}): Px {
  const P = new Px(72, 76), base = 72, top = base - 46, cx = 36;
  const skin = "#b9845f", coat = "#6a5a3e", coatS = shade(coat, 0.75), pants = "#3a342a", mask = "#5a5446", blade = "#7a8a96", bladeHi = "#b8c4cc";
  if (p.down) { // sitting down hard, beaten
    P.rect(24, base - 6, 16, 6, coat); P.rect(38, base - 14, 7, 8, coat); P.rect(39, base - 21, 6, 7, skin); P.rect(39, base - 18, 6, 3, mask); P.rect(39, base - 22, 6, 2, "#2a2420");
    P.rect(14, base - 3, 12, 3, pants);
    return P.outline();
  }
  const b = p.bob ?? 0, Y = (v: number) => top + v + b, X = (v: number) => cx + v;
  const hip = Y(28);
  const leg = (dx: number, col: string) => { P.rect(X(-2) + dx, hip, 3, base - hip, col); P.rect(X(-2) + dx, base - 3, 4, 3, "#2a221c"); };
  leg((p.back ?? -2) - 1, shade(pants, 0.78));
  P.rect(X(-5), Y(11), 10, 20, coat); P.rect(X(-6), Y(24), 12, 9, coat); P.rect(X(-6), Y(32), 12, 1, coatS);
  P.rect(X(-5), Y(21), 10, 1, "#3a2a1c");
  P.ell(X(-6), Y(25), 3, 3, "#8a7a5a"); // the coiled net at the hip
  leg(p.front ?? 2, pants);
  // head: cloth over the lower face, eyes only
  P.rect(X(-2), Y(2), 7, 8, skin); P.rect(X(-2), Y(6), 7, 4, mask); P.rect(X(-3), Y(1), 8, 3, "#2a2420");
  P.set(X(3), Y(4), "#1b1714");
  // arm and blade
  const A: Record<string, [number, number, number, number]> = { // elbow dx,dy · hand dx,dy (from the shoulder)
    rest: [1, 7, 2, 13], cutW: [-4, 2, -6, -4], cutA: [6, 4, 13, 6], cutR: [4, 7, 7, 11], throwW: [-5, 3, -8, 0], throwA: [6, -1, 12, -4], hurt: [-3, 6, -5, 10],
  };
  const [ex, ey, hx, hy] = A[p.arm ?? "rest"], sx = X(0), sy = Y(13);
  P.line(sx, sy, sx + ex, sy + ey, coatS, 2); P.line(sx + ex, sy + ey, sx + hx, sy + hy, coatS, 2); P.rect(sx + hx, sy + hy, 2, 2, skin);
  const bladeDir: Record<string, [number, number]> = { rest: [3, 9], cutW: [-6, -9], cutA: [12, 1], cutR: [8, 6], throwW: [-2, 6], throwA: [3, 8], hurt: [-6, 6] };
  const [bdx, bdy] = bladeDir[p.arm ?? "rest"];
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
}
