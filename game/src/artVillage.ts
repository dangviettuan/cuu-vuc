/**
 * Greybox art for the village stages (Phase 2: Prologue S3–S7): the Father, the villagers, the house inside and out,
 * the village by afternoon and by night, and the small living things (dogs, birds).
 * Generated at boot like src/art.ts, from the locked concept pick (docs/06-art/concept-v0.1/picks.md: the Father A,
 * "scholar's robe") and the Father bible (F6): fifties and looks older, a slight stoop, grey hair and beard, a white
 * burn on the left hand, the Dẫn Mạch bag with three copper rods and a red-thread spool.
 * Authored frames replace these by key, as for the hero (ADR-0011).
 */
import Phaser from "phaser";
import { Px, RED, machGrooves, rng, shade } from "./art";

type Arm = { e: [number, number]; h: [number, number] };
const FA = {
  rest: { e: [0, 7], h: [0, 13] },
  swingF: { e: [2, 6], h: [4, 11] },
  swingB: { e: [-2, 6], h: [-3, 11] },
  /** holding the rice bowl at the chest while seated */
  bowl: { e: [3, 5], h: [6, 7] },
  /** the hand that reaches toward his son's shoulder… */
  offer: { e: [5, 3], h: [10, 2] },
  /** …and drops halfway */
  drop: { e: [3, 7], h: [5, 12] },
  /** reaching down for the leaf */
  low: { e: [3, 8], h: [6, 14] },
  /** looking at the leaf held up in front of him */
  look: { e: [4, 4], h: [7, 1] },
  /** a torch held up (the headman, S6) */
  torch: { e: [3, 3], h: [5, -2] },
  /** both hands reaching down (bà Dần pulling at the fallen frame, S6) */
  pull: { e: [5, 6], h: [9, 9] },
  /** a hand raised to the brow, shading the eyes (the villagers at the shrine, S4) */
  brow: { e: [7, -1], h: [5, -8] },
} satisfies Record<string, Arm>;
export type FatherArm = keyof typeof FA;

const FATHER = {
  skin: "#c48f6c", burn: "#efe4d6", robe: "#5d5844", shirt: "#6d6650", pants: "#4b4335", hair: "#8b8680",
  beard: "#9a948c", boot: "#2f2620", belt: "#4a3424", bag: "#6b4b30", strap: "#7b6a5a", rods: "#b87333",
};

export interface FatherPose {
  bob?: number;
  front?: { dx: number; lift?: number };
  back?: { dx: number; lift?: number };
  arm?: FatherArm;
  backArm?: FatherArm;
  /** wearing the Dẫn Mạch bag (after he takes it to leave) */
  bag?: boolean;
  /** seated on the low stool by the door */
  sit?: boolean;
  bowl?: boolean;
  leaf?: boolean;
  /** extra forward lean of the upper body (he stoops by default) */
  lean?: number;
}

/** 72×76 cell like the hero's: feet at y = 72, centred at x = 36, facing right. 46 px tall standing (Art Bible §2). */
export function father(p: FatherPose): Px {
  const C = FATHER, P = new Px(72, 76), base = 72, top = base - 45, cx = 36;
  const b = p.bob ?? 0, ln = 1 + (p.lean ?? 0); // the stoop: shoulders and head a pixel forward
  const Y = (v: number) => top + v, X = (v: number) => cx + v;
  const skinS = shade(C.skin, 0.82), robeS = shade(C.robe, 0.78);
  const hip = Y(28) + b;
  if (p.sit) { // low bamboo stool
    P.rect(X(-6), base - 9, 12, 2, "#7a6a3a"); P.rect(X(-5), base - 7, 1, 7, "#5a4a2a"); P.rect(X(4), base - 7, 1, 7, "#5a4a2a");
  }
  const leg = (dx: number, lift: number, col: string, bootC: string) => {
    if (p.sit) { P.rect(X(1) + dx, base - 10, 6, 3, col); P.rect(X(6) + dx, base - 8, 3, 8, col); P.rect(X(6) + dx, base - 3, 4, 3, bootC); return; }
    const x = X(-2) + dx, len = Math.max(4, base - hip + 1 - lift);
    P.rect(x, hip, 3, len, col); P.rect(x, hip + len - 3, 4, 3, bootC);
  };
  const sx = X(0) + ln, sy = Y(13) + b;
  const arm = (a: Arm, col: string, hand: string) => {
    const ex = sx + a.e[0], ey = sy + a.e[1], hx = sx + a.h[0], hy = sy + a.h[1];
    P.line(sx, sy, ex, ey, col, 2); P.line(ex, ey, hx, hy, col, 2); P.rect(hx, hy, 2, 2, hand);
    return [hx, hy] as const;
  };
  leg((p.back?.dx ?? 0) - 1, p.back?.lift ?? 0, shade(C.pants, 0.78), shade(C.boot, 0.8));
  arm(FA[p.backArm ?? "rest"], robeS, skinS);
  // the robe: shoulders to below the knee (shorter when seated), widening a little at the hem
  const hemY = p.sit ? base - 9 : Math.min(base - 6, Y(40) + b);
  P.rect(X(-5) + ln, Y(11) + b, 10, hemY - (Y(11) + b), C.robe);
  P.tri(X(-5) + ln, Y(24) + b, X(-7), hemY, X(-5) + ln, hemY, C.robe);
  P.tri(X(5) + ln, Y(24) + b, X(7), hemY, X(5) + ln, hemY, C.robe);
  P.rect(X(-6), hemY - 1, 13, 1, robeS);
  P.line(X(-1) + ln, Y(11) + b, X(2) + ln, Y(17) + b, C.shirt); // crossed collar
  P.line(X(0) + ln, Y(11) + b, X(-2) + ln, Y(15) + b, C.shirt);
  P.rect(X(-5) + ln, Y(21) + b, 10, 1, C.belt);
  leg(p.front?.dx ?? 0, p.front?.lift ?? 0, C.pants, C.boot);
  if (p.bag) { // the Dẫn Mạch bag, three copper rods, the red-thread spool
    P.line(X(3) + ln, Y(11) + b, X(-4) + ln, Y(21) + b, C.strap);
    P.rect(X(-9) + ln, Y(18) + b, 6, 7, C.bag); P.rect(X(-9) + ln, Y(18) + b, 6, 2, shade(C.bag, 0.8));
    for (const dx of [0, 2, 4]) P.rect(X(-9) + ln + dx, Y(14) + b, 1, 4, C.rods);
    P.set(X(-5) + ln, Y(22) + b, RED);
  }
  // head: grey hair, beard, stooped forward
  const hx0 = ln + 1;
  P.rect(X(0) + hx0, Y(9) + b, 3, 2, skinS);
  P.rect(X(-3) + hx0, Y(2) + b, 7, 8, C.skin);
  P.rect(X(4) + hx0, Y(5) + b, 1, 2, C.skin);
  P.rect(X(-3) + hx0, Y(1) + b, 7, 2, C.hair); P.rect(X(-3) + hx0, Y(3) + b, 2, 3, C.hair);
  P.rect(X(0) + hx0, Y(7) + b, 5, 3, C.beard); P.rect(X(1) + hx0, Y(10) + b, 3, 1, C.beard);
  P.set(X(2) + hx0, Y(5) + b, "#1b1714");
  P.set(X(2) + hx0, Y(4) + b, shade(C.skin, 0.75)); // a heavy brow
  const [fx, fy] = arm(FA[p.arm ?? "rest"], C.robe, C.burn); // the left hand carries the white burn
  if (p.bowl) { P.ell(fx + 1, fy - 1, 3, 1.6, "#c9c0ae"); P.rect(fx - 1, fy - 2, 5, 1, "#f2efe6"); }
  if (p.leaf) { P.ell(fx + 2, fy - 2, 2.4, 1.4, "#d4b04a"); P.line(fx, fy - 2, fx + 4, fy - 2, "#3a2a18"); }
  return P.outline();
}

/* ---------------- the Father's house (S3) ---------------- */

/** A cutaway of the house: back wall, posts, a window to the forest, a shelf, Diệp's door, and the eave over the doorway. */
export function house(): Px {
  const P = new Px(240, 150), r = rng(31);
  const wall = "#7a6a52", wallS = "#66573f", post = "#4a3524", roof = "#3b2f22", thatch = "#8a7444";
  P.rect(0, 30, 200, 120, wall);
  for (let y = 34; y < 150; y += 6) for (let x = 0; x < 200; x += 2) if (r() < 0.08) P.set(x, y, wallS);
  for (const x of [0, 66, 132, 196]) P.rect(x, 26, 5, 124, post);
  P.rect(0, 26, 200, 4, post); // beam
  // window to the forest
  P.rect(84, 52, 34, 24, "#2f5537"); P.rect(84, 52, 34, 2, post); P.rect(84, 74, 34, 2, post); P.rect(100, 52, 2, 24, post);
  for (let i = 0; i < 10; i++) P.set(86 + r() * 30, 55 + r() * 18, "#4f7f45");
  // shelf with jars
  P.rect(16, 64, 40, 3, post);
  for (const [x, c] of [[20, "#9a7a52"], [30, "#7a8a6a"], [42, "#a08a62"]] as const) P.rect(x, 54, 7, 10, c);
  // Diệp's room: a closed door with a cloth curtain (her room is kept as she left it, Prologue §2)
  P.rect(146, 70, 30, 80, "#5a4632"); P.rect(146, 70, 30, 3, post); P.rect(149, 74, 24, 40, "#6d5a7a"); P.rect(149, 74, 24, 2, "#57476a");
  // thatched roof and the eave reaching over the doorway (right)
  P.tri(-10, 30, 110, 0, 240, 30, roof);
  for (let x = 0; x < 240; x += 3) P.rect(x, 26 + Math.round(r() * 3), 2, 5, thatch);
  P.rect(196, 28, 44, 3, post);
  return P.outline();
}

export function table(): Px {
  const P = new Px(34, 16);
  P.rect(0, 6, 34, 3, "#6a4f34"); P.rect(2, 9, 2, 7, "#4a3524"); P.rect(30, 9, 2, 7, "#4a3524");
  P.ell(10, 5, 4, 1.8, "#c9c0ae"); P.rect(7, 3, 7, 1, "#f2efe6"); // his bowl, untouched
  P.ell(22, 5, 4, 1.8, "#c9c0ae"); // the son's, finished
  P.rect(15, 2, 1, 4, "#a08a62"); P.rect(17, 2, 1, 4, "#a08a62"); // chopsticks
  return P.outline();
}

/** The Dẫn Mạch bag leaning on the wall, three copper rods and the red-thread spool (until he takes it). */
export function bagProp(): Px {
  const P = new Px(12, 16);
  P.rect(1, 6, 9, 10, FATHER.bag); P.rect(1, 6, 9, 2, shade(FATHER.bag, 0.8));
  for (const x of [3, 5, 7]) P.rect(x, 0, 1, 7, FATHER.rods);
  P.set(8, 12, RED);
  return P.outline();
}

/** The yard tree: an evergreen ("loại quanh năm xanh", Ch1), the one that drops a yellow leaf. */
export function yardTree(): Px {
  const P = new Px(90, 130), r = rng(53);
  P.rect(42, 60, 7, 70, "#4a3524"); P.rect(42, 60, 2, 70, "#5d4630");
  P.line(45, 80, 30, 66, "#4a3524", 2); P.line(46, 74, 60, 62, "#4a3524", 2);
  for (const [cx, cy, rx, ry, c] of [[45, 40, 36, 28, "#2f5a34"], [30, 50, 20, 16, "#3a6a3e"], [62, 48, 20, 16, "#356538"], [46, 28, 24, 18, "#447a45"]] as const) P.ell(cx, cy, rx, ry, c);
  for (let i = 0; i < 40; i++) P.set(14 + r() * 62, 16 + r() * 48, r() < 0.5 ? "#5a8f4e" : "#2a4f2e");
  return P.outline();
}

/** A low bamboo fence: past it, the forest rises like a wall (Ch1). */
export function fence(): Px {
  const P = new Px(64, 22);
  P.rect(0, 8, 64, 2, "#9a8a52"); P.rect(0, 15, 64, 2, "#8a7a46");
  for (let x = 1; x < 64; x += 7) { P.rect(x, 2, 3, 20, "#a89a5e"); P.set(x + 1, 2, "#c2b47a"); P.rect(x, 12, 3, 1, "#7a6a3a"); }
  return P.outline();
}

/** The yellow leaf, large enough to read in a cutscene: a burnt dark vein along the midrib (Ch1). */
export function bigLeaf(f: number): Px {
  const P = new Px(10, 8);
  if (f === 0) { P.ell(5, 4, 4.2, 2.6, "#d9b347"); P.line(1, 4, 9, 4, "#3a2a18"); P.set(9, 3, "#8a6a2a"); }
  else { P.ell(5, 4, 2.4, 3.6, "#d0a840"); P.line(5, 0, 5, 7, "#3a2a18"); }
  return P.outline();
}

/** A healthy green leaf, for the morning's drifting leaves (the yellow ones belong to the night the forest changes). */
export function greenLeaf(f: number): Px {
  const P = new Px(6, 5);
  if (f === 0) { P.ell(3, 2, 2.6, 1.6, "#6a9a52"); P.line(1, 2, 5, 2, "#3f6a35"); }
  else { P.rect(2, 0, 2, 5, "#5f8f4a"); P.line(3, 0, 3, 4, "#3f6a35"); }
  return P;
}

/* ---------------- night village (S7) ---------------- */

/** A village house at night (S6–S8): the walls dark, the window lit; the village is awake. */
export function nightHouse(variant: number): Px { return villageHouse(variant, true, variant === 2); }


/* ---------------- villagers (S4, S6) ---------------- */

/** A villager's look: the palette and the few traits that tell them apart at 46 px (Art Bible §2: silhouette first). */
export interface Look {
  skin: string; top: string; pants: string; hair: string;
  /** khăn: a woman's wrapped head-scarf · xep: the headman's folded turban · non: a conical hat · none */
  hat?: "khan" | "xep" | "non" | "none";
  hatC?: string;
  /** a long tunic to the knee (the headman) instead of a short one */
  long?: boolean;
  beard?: string;
  /** shorter figure (px less than 46) */
  short?: number;
  stoop?: number;
  /** a walking staff in the front hand (the shrine keeper) */
  staff?: boolean;
}

export const LOOKS = {
  /** The shrine keeper (cụ trông miếu): very old, back bent, thin white hair, eyes "sáng như hai hạt cườm" (Ch1). */
  keeper: { skin: "#b88462", top: "#5e5a4e", pants: "#3a3630", hair: "#e6e2da", hat: "none", long: true, beard: "#dedad2", short: 6, stoop: 3, staff: true },
  /** Bà Dần: warm, gossipy, sixties. Brown áo bà ba, a dark khăn over a grey bun, a slight stoop. */
  baDan: { skin: "#c08a66", top: "#7a5236", pants: "#2e2a2a", hair: "#a8a39a", hat: "khan", hatC: "#4a3a30", short: 4, stoop: 1 },
  /** Ông Dần, her husband. */
  ongDan: { skin: "#b9805e", top: "#5f6a5a", pants: "#3a3630", hair: "#8e8a84", hat: "none", beard: "#8e8a84", stoop: 1 },
  /** The headman (trưởng làng): practical, worried. An indigo long tunic and a black folded turban. */
  headman: { skin: "#bf8763", top: "#34405c", pants: "#2a2a30", hair: "#2a2622", hat: "xep", hatC: "#1e1c1e", long: true, beard: "#3a3430" },
  /** The four men sent to the station road, and the villagers at the shrine. */
  man1: { skin: "#c28d68", top: "#6b5a3e", pants: "#3e3a32", hair: "#221e1a", hat: "non", hatC: "#c9b27a" },
  man2: { skin: "#b47c58", top: "#4e5e6a", pants: "#3a342c", hair: "#1e1a18", hat: "none" },
  man3: { skin: "#c69270", top: "#7a6a52", pants: "#2e2c28", hair: "#2a2420", hat: "none", beard: "#2a2420" },
  man4: { skin: "#bb855f", top: "#5a4a3a", pants: "#3a3a34", hair: "#1c1a18", hat: "non", hatC: "#b8a26a" },
  woman1: { skin: "#c99572", top: "#6a6a7a", pants: "#2a2626", hair: "#1e1a18", hat: "khan", hatC: "#5a4a5a", short: 3 },
} satisfies Record<string, Look>;
export type LookId = keyof typeof LOOKS;

export interface VPose {
  bob?: number;
  front?: { dx: number; lift?: number };
  back?: { dx: number; lift?: number };
  arm?: FatherArm;
  backArm?: FatherArm;
  /** kneeling (bà Dần beside her husband, S6) */
  kneel?: boolean;
  torch?: number;
}

/** 72×76 cell like the Father's: feet at y = 72, centred at x = 36, facing right. */
export function villager(L: Look, p: VPose): Px {
  const P = new Px(72, 76), base = 72, top = base - 45 + (L.short ?? 0), cx = 36;
  const b = (p.bob ?? 0) + (p.kneel ? 10 : 0), ln = L.stoop ?? 0;
  const Y = (v: number) => top + v, X = (v: number) => cx + v;
  const skinS = shade(L.skin, 0.82), topS = shade(L.top, 0.78);
  const hip = Y(28) + b;
  const leg = (dx: number, lift: number, col: string, front: boolean) => {
    if (p.kneel) { // one knee up in front, the other knee on the ground with the foot tucked behind
      const hx = X(0) + ln, hy = hip;
      if (front) { P.line(hx, hy, hx + 6, hy, col, 3); P.line(hx + 6, hy, hx + 6, base - 2, col, 3); P.rect(hx + 6, base - 2, 4, 2, "#4a3a2e"); }
      else { P.line(hx, hy, hx - 1, base - 3, col, 3); P.line(hx - 1, base - 3, hx - 8, base - 2, col, 2); }
      return;
    }
    const x = X(-2) + dx, len = Math.max(4, base - hip + 1 - lift);
    P.rect(x, hip, 3, len, col); P.rect(x, hip + len - 2, 4, 2, "#4a3a2e"); // bare feet or sandals
  };
  const sx = X(0) + ln, sy = Y(13) + b;
  const arm = (a: Arm, col: string, hand: string) => {
    const ex = sx + a.e[0], ey = sy + a.e[1], hx = sx + a.h[0], hy = sy + a.h[1];
    P.line(sx, sy, ex, ey, col, 2); P.line(ex, ey, hx, hy, col, 2); P.rect(hx, hy, 2, 2, hand);
    return [hx, hy] as const;
  };
  leg((p.back?.dx ?? 0) - 1, p.back?.lift ?? 0, shade(L.pants, 0.78), false);
  arm(FA[p.backArm ?? "rest"], topS, skinS);
  // tunic: a short áo to the hip, or the headman's long one to the knee
  const hemY = L.long ? Math.min(base - 8, Y(38) + b) : Y(27) + b;
  P.rect(X(-5) + ln, Y(11) + b, 10, hemY - (Y(11) + b), L.top);
  if (L.long) { P.tri(X(-5) + ln, Y(24) + b, X(-7), hemY, X(-5) + ln, hemY, L.top); P.tri(X(5) + ln, Y(24) + b, X(7), hemY, X(5) + ln, hemY, L.top); }
  P.rect(X(-5) + ln, hemY - 1, 10, 1, topS);
  P.line(X(1) + ln, Y(11) + b, X(1) + ln, hemY - 2, topS); // the button line
  leg(p.front?.dx ?? 0, p.front?.lift ?? 0, L.pants, true);
  // head
  const hx0 = ln + 1;
  P.rect(X(0) + hx0, Y(9) + b, 3, 2, skinS);
  P.rect(X(-3) + hx0, Y(2) + b, 7, 8, L.skin);
  P.rect(X(4) + hx0, Y(5) + b, 1, 2, L.skin);
  P.set(X(2) + hx0, Y(5) + b, "#1b1714");
  const hat = L.hat ?? "none", hc = L.hatC ?? L.hair;
  if (hat === "khan") { P.rect(X(-4) + hx0, Y(0) + b, 8, 3, hc); P.rect(X(-4) + hx0, Y(3) + b, 2, 4, hc); P.rect(X(-6) + hx0, Y(4) + b, 3, 3, L.hair); }
  else if (hat === "xep") { P.rect(X(-4) + hx0, Y(0) + b, 9, 3, hc); P.rect(X(-4) + hx0, Y(1) + b, 9, 1, shade(hc, 1.4)); }
  else if (hat === "non") { P.tri(X(-8) + hx0, Y(2) + b, X(1) + hx0, Y(-5) + b, X(10) + hx0, Y(2) + b, hc); P.rect(X(-8) + hx0, Y(2) + b, 18, 1, shade(hc, 0.8)); }
  else { P.rect(X(-3) + hx0, Y(1) + b, 7, 2, L.hair); P.rect(X(-3) + hx0, Y(3) + b, 2, 3, L.hair); }
  if (L.beard) { P.rect(X(1) + hx0, Y(8) + b, 4, 2, L.beard); }
  const [fx, fy] = arm(FA[p.arm ?? "rest"], L.top, L.skin);
  if (L.staff && !p.kneel) P.line(fx + 2, fy - 4, fx + 3, base, "#6a5232", 1);
  if (p.torch !== undefined) { // a bamboo torch with a two-frame flame
    P.line(fx + 1, fy + 6, fx + 1, fy - 8, "#7a5a32", 1);
    P.ell(fx + 1, fy - 10, 2.2, 3, p.torch ? "#ffb347" : "#ffd27a"); P.set(fx + 1, fy - 13 - p.torch, "#fff2c8");
  }
  return P.outline();
}

/** Ông Dần pinned under the fallen bamboo frame, one leg caught (S6, C1 kept): drawn lying, head to the right. */
export function villagerLying(L: Look): Px {
  const P = new Px(72, 76), y = 68;
  P.rect(14, y, 16, 3, L.pants); P.rect(10, y + 1, 5, 2, "#4a3a2e");
  P.rect(30, y - 1, 16, 5, L.top);
  P.rect(46, y - 2, 7, 6, L.skin); P.rect(46, y - 3, 7, 2, L.hair); P.rect(52, y + 1, 2, 2, L.beard ?? L.hair);
  P.line(34, y - 1, 40, y - 6, L.top, 2); P.rect(40, y - 7, 2, 2, L.skin); // an arm pushing at the beam
  return P.outline();
}

/* ---------------- An Mộc by afternoon (S4) ---------------- */

/**
 * An An Mộc house (nhà tranh vách đất): a thick thatched roof overhanging the walls, wattle-and-daub walls on bamboo
 * posts, a bamboo blind over the doorway, a small barred window. By night the walls go dark and the window is lit.
 * `porch`: an eave on two posts at the right; `broken`: that porch fallen in (bà Dần's, S6, C1 kept).
 */
function villageHouse(variant: number, night: boolean, porch = false, broken = false): Px {
  const W = 120, H = 84, P = new Px(W, H), r = rng(191 + variant * 13 + (night ? 7 : 0));
  const wall = night ? "#2e2c34" : ["#9a8a66", "#8e7e5e", "#a08e6a"][variant % 3], wallS = shade(wall, 0.82);
  const post = night ? "#22202a" : "#5a4630", thatch = night ? "#25242c" : "#7e6a3c", thatchHi = night ? "#2e2d36" : "#9a844a", thatchS = night ? "#1c1b22" : "#5e4e2c";
  const x0 = 12, x1 = 92, wallTop = 40;
  P.rect(x0, wallTop, x1 - x0, H - wallTop, wall);
  for (let y = wallTop + 3; y < H; y += 5) for (let x = x0; x < x1; x += 2) if (r() < 0.12) P.set(x, y, wallS); // daub over lath
  if (!night) for (let i = 0; i < 4; i++) { const px = x0 + 4 + r() * 60, py = wallTop + 8 + r() * 26; P.rect(px, py, 6 + r() * 6, 3 + r() * 3, "#b4a27a"); } // lime patches
  for (const x of [x0, x1 - 3]) { P.rect(x, wallTop - 2, 3, H - wallTop + 2, post); }
  // door with a bamboo blind, and a window with bars
  const dx = variant % 2 ? 22 : 60;
  P.rect(dx, 52, 14, H - 52, night ? "#141218" : "#2a2018");
  for (let x = dx + 1; x < dx + 14; x += 2) P.rect(x, 52, 1, 18, night ? "#3a3428" : "#a08a52");
  P.rect(dx, 52, 14, 1, post);
  const wx = variant % 2 ? 60 : 26;
  P.rect(wx, 50, 16, 11, night ? "#e0a24a" : "#2a2018");
  for (let x = wx + 2; x < wx + 16; x += 3) P.rect(x, 50, 1, 11, night ? "#8a5a26" : post);
  P.rect(wx - 1, 49, 18, 1, post); P.rect(wx - 1, 61, 18, 1, post);
  // the thatch: thick, layered, ragged at the eave
  const ridgeY = 6 + variant * 2;
  for (let y = ridgeY; y < wallTop + 4; y++) {
    const u = (y - ridgeY) / (wallTop + 4 - ridgeY), half = 10 + u * 46;
    P.rect(52 - half, y, half * 2, 1, (y - ridgeY) % 4 === 0 ? thatchHi : thatch);
  }
  for (let i = 0; i < 160; i++) { const x = 6 + r() * 92, y = ridgeY + 3 + r() * (wallTop - ridgeY); if (P.get(x, y) === thatch) P.set(x, y, r() < 0.5 ? thatchS : thatchHi); }
  for (let x = 6; x < 99; x += 2) P.rect(x, wallTop + 4, 1, 1 + Math.floor(r() * 3), thatchS); // straw ends at the eave
  P.rect(42, ridgeY - 1, 20, 3, thatchS); // the ridge
  if (porch && !broken) { // an eave on two bamboo posts
    P.tri(92, 40, 118, 48, 92, 50, thatch); P.rect(92, 46, 26, 3, thatchS);
    P.rect(114, 48, 3, H - 48, post); P.rect(98, 48, 2, H - 48, post);
  } else if (porch && broken) { // the eave down at an angle, a post snapped (the fallen frame is its own prop)
    P.line(92, 42, 118, 76, thatchS, 4); P.line(94, 44, 116, 74, thatch, 2);
    P.rect(98, 56, 2, H - 56, post); P.line(98, 56, 102, 52, post, 2);
  }
  return P.outline();
}

/** A village house by day (S2, S4). */
export function dayHouse(variant: number): Px { return villageHouse(variant, false, variant === 1); }

/**
 * The old tree beside the miếu Mạch: a cây đa (banyan), as old village shrines have. A fluted trunk of merged stems,
 * buttress roots, wide low limbs, aerial roots hanging from them (a few grown down into pillars), and a broad, uneven
 * canopy. "green" (S2, morning), "yellow" (S4: it drops its leaves, Ch1), "bare" (S8: "gốc cây cổ thụ đã trụi lá").
 */
export function greatTree(state: "green" | "yellow" | "bare" = "yellow"): Px {
  const W = 200, H = 210, P = new Px(W, H), r = rng(303);
  const bark = "#4a3a2a", barkHi = "#66523a", barkS = "#352a1e", aerial = "#5a4836";
  const gy = H - 1, cx = 100;
  // limbs: [start y on trunk, end x, end y, thickness]
  const limbs: [number, number, number, number][] = [[112, 18, 86, 6], [98, 52, 58, 6], [92, 100, 30, 5], [100, 150, 52, 6], [114, 186, 84, 6], [124, 34, 110, 4], [120, 168, 108, 4]];
  const ends: [number, number][] = [];
  for (const [sy, ex, ey, t] of limbs) {
    const sx = cx + (ex < cx ? -8 : ex > cx ? 8 : 0), mx = (sx + ex) / 2, my = Math.min(sy, ey) - 8;
    let px = sx, py = sy;
    for (let k = 1; k <= 12; k++) { // a gently arched limb, tapering
      const u = k / 12, x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * mx + u * u * ex, y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * my + u * u * ey;
      P.line(px, py, x, y, bark, Math.max(2, Math.round(t * (1 - u * 0.6))));
      px = x; py = y;
    }
    ends.push([ex, ey]);
    // twigs
    for (let k = 0; k < 4; k++) { const tx = ex + (r() - 0.5) * 30, ty = ey - 6 - r() * 16; P.line(ex, ey, tx, ty, barkS, 1); ends.push([tx, ty]); }
  }
  // the trunk: several merged stems, fluted, wider at the foot
  for (let y = 80; y <= gy; y++) {
    const u = (y - 80) / (gy - 80), half = 14 + u * u * 16;
    P.rect(cx - half, y, half * 2, 1, bark);
    for (const f of [-0.6, -0.15, 0.35, 0.75]) P.set(cx + f * half, y, barkS);
    P.set(cx - half + 2, y, barkHi); P.set(cx - half * 0.15 + 1, y, barkHi);
  }
  // buttress roots spreading over the ground
  for (const [ex, lift] of [[44, 10], [66, 6], [138, 6], [160, 10], [82, 3], [120, 3]] as const) {
    P.line(cx + (ex < cx ? -18 : 18), gy - 18, ex, gy - 1, bark, 3); P.line(ex, gy - 1, ex + (ex < cx ? -8 : 8), gy, barkS, 2);
    if (lift > 6) P.set(ex, gy - 2, barkHi);
  }
  // aerial roots: hanging from the limbs; a few reach the ground and thicken into pillars
  for (let i = 0; i < 26; i++) {
    const [lx, ly] = ends[Math.floor(r() * 7)]; const x = Math.round(lx + (cx - lx) * r() * 0.7), y0 = Math.round(ly + 6);
    const pillar = i % 7 === 0, len = pillar ? gy - y0 : 18 + r() * 60;
    P.line(x, y0, x + (r() - 0.5) * 3, y0 + len, aerial, pillar ? 2 : 1);
  }
  if (state === "bare") {
    for (const [x, y] of ends) for (let k = 0; k < 3; k++) P.line(x, y, x + (r() - 0.5) * 16, y - 4 - r() * 10, barkS, 1);
    for (let i = 0; i < 14; i++) P.set(20 + r() * 160, 20 + r() * 90, "#b8902e"); // a last few leaves
    return P.outline();
  }
  // canopy: uneven clumps over the limb ends, lit from above-left, dappled
  const pal = state === "green" ? { base: "#3f6a38", hi: "#5a8a48", lo: "#2c5030", dot: ["#6a9a52", "#2a4a2c", "#4f7a40"] }
    : { base: "#6e7438", hi: "#8a8a40", lo: "#4e5a2c", dot: ["#d4b04a", "#b8902e", "#5a6a2e", "#e0c060"] };
  const clumps: [number, number, number, number][] = [];
  for (const [x, y] of ends.slice(0, 7 * 5)) if (r() < 0.75) clumps.push([x, y - 4, 14 + r() * 12, 9 + r() * 7]);
  clumps.push([cx, 40, 40, 22], [cx - 40, 52, 30, 18], [cx + 42, 46, 32, 18]);
  // keep every clump inside the canvas, so the crown is round at its edges, never cut flat
  for (const c of clumps) { c[0] = Math.max(c[2] + 2, Math.min(W - c[2] - 3, c[0])); c[1] = Math.max(c[3] + 2, c[1]); }
  for (const [x, y, rx, ry] of clumps) P.ell(x, y, rx, ry, pal.lo);
  for (const [x, y, rx, ry] of clumps) P.ell(x - 2, y - 2, rx - 2, ry - 2, pal.base);
  for (const [x, y, rx, ry] of clumps) P.ell(x - rx * 0.3, y - ry * 0.35, rx * 0.5, ry * 0.45, pal.hi);
  for (let i = 0; i < 700; i++) { const x = r() * W, y = r() * 130; if (P.get(x, y) === pal.base || P.get(x, y) === pal.hi || P.get(x, y) === pal.lo) P.set(x, y, pal.dot[Math.floor(r() * pal.dot.length)]); }
  if (state === "yellow") for (let i = 0; i < 60; i++) { const x = r() * W, y = 10 + r() * 100; if (P.get(x, y)) P.set(x, y, barkS); } // twigs showing through
  return P.outline();
}

/** Fallen leaves under the old tree: a gold drift on the flagstones. */
export function leafCarpet(): Px {
  const P = new Px(150, 6), r = rng(404);
  for (let i = 0; i < 220; i++) { const x = r() * 150, y = 2 + r() * 4 - (Math.abs(x - 75) < 50 ? 1 : 0); P.set(x, y, r() < 0.6 ? "#d4b04a" : r() < 0.5 ? "#b8902e" : "#e0c060"); }
  return P;
}

/** A village dog, sitting, facing right (toward the forest). Frame 1: barking. */
export function dog(f: number): Px {
  const P = new Px(22, 18), c = "#8a6a44", d = shade(c, 0.75);
  P.ell(9, 12, 6, 4, c); P.rect(5, 14, 2, 4, d); P.rect(12, 13, 2, 5, c);
  P.rect(13, 5, 6, 6, c); P.rect(18, 7 + f, 3, 2, c); P.set(15, 6, "#1b1714"); P.rect(13, 3, 2, 3, d);
  if (f) P.rect(18, 9, 3, 1, "#5a2a2a");
  P.line(3, 11, 1, 7, d);
  return P.outline();
}

/** A small bird in flight: wings up (0) or down (1). */
export function bird(f: number): Px {
  const P = new Px(9, 6), c = "#2e2a26";
  P.rect(3, 3, 4, 2, c); P.set(7, 3, c); P.set(8, 3, "#8a6a2a");
  if (f === 0) { P.line(3, 3, 1, 0, c); P.line(5, 3, 6, 0, c); } else { P.line(3, 4, 0, 5, c); P.line(5, 4, 7, 5, c); }
  return P;
}

/** The wounded bird on the ground in the yard: it beats its wings against the dirt (0, 1). */
export function birdDown(f: number): Px {
  const P = new Px(12, 8), c = "#4a4038";
  P.ell(6, 5, 3, 2, c); P.rect(8, 3, 2, 2, c); P.set(9, 3, "#1b1714"); P.set(10, 4, "#8a6a2a");
  if (f === 0) { P.line(5, 4, 2, 0, c); P.line(7, 4, 8, 0, c); } else { P.line(5, 5, 1, 6, c); P.line(7, 5, 11, 7, c); }
  return P.outline();
}

/* ---------------- the house at night, inside (S5) ---------------- */

/**
 * The house from inside at night: the main room (front door, table, the knife rack) and, through a doorway, the
 * Father's room, small and tidy "đến khó chịu" (Ch1). A lamp's warmth in the middle; the corners go dark.
 */
export function interior(): Px {
  const W = 560, P = new Px(W, 160), r = rng(505);
  const wall = "#3a3026", wallS = "#2c241c", post = "#22190f", floorEdge = "#4a3a2a";
  P.rect(0, 0, W, 160, wall);
  for (let y = 4; y < 160; y += 5) for (let x = 0; x < W; x += 2) if (r() < 0.06) P.set(x, y, wallS);
  for (const x of [0, 120, 236, 380, 556]) P.rect(x, 0, 5, 160, post);
  P.rect(0, 0, W, 6, post); P.rect(0, 156, W, 4, floorEdge);
  // the partition between the rooms, with its doorway (the door itself is a separate prop)
  P.rect(224, 0, 14, 160, post); P.rect(226, 40, 10, 120, "#1a140e");
  // a shuttered window in the main room, the rain season's damp in the corner
  P.rect(140, 50, 30, 24, "#1d1812"); P.rect(140, 50, 30, 2, post); P.rect(154, 50, 2, 24, post);
  for (let i = 0; i < 30; i++) P.set(r() * 20, 120 + r() * 36, "#2a2a22");
  // the Father's room: a shelf of books high on the wall
  P.rect(300, 40, 60, 3, post);
  for (let i = 0; i < 9; i++) P.rect(302 + i * 6, 26 + (i % 3), 4, 14 - (i % 3), ["#5a4a3a", "#4a4036", "#6a5a46"][i % 3]);
  return P;
}

/** The front door, from inside. Bolted (1) or not (0): "Anh gài then." */
export function frontDoor(bolted: number): Px {
  const P = new Px(30, 62);
  P.rect(0, 0, 30, 62, "#2a2016"); P.rect(2, 2, 26, 60, "#5a4430");
  for (let x = 4; x < 28; x += 6) P.rect(x, 2, 1, 60, "#4a3624");
  P.rect(0, 28, 30, 2, "#3a2a1c");
  if (bolted) P.rect(-0, 30, 30, 3, "#8a6a44"); else P.rect(24, 30, 6, 3, "#8a6a44");
  return P.outline();
}

/** The door to the Father's room (closed until the night's sound sends him in). */
export function roomDoor(): Px {
  const P = new Px(14, 120);
  P.rect(0, 0, 14, 120, "#4a3828"); for (let y = 4; y < 120; y += 10) P.rect(1, y, 12, 1, "#3a2a1c");
  P.rect(9, 60, 2, 4, "#8a6a44");
  return P.outline();
}

/** The table, with only the Father's bowl left on it (a separate prop, so it can be cleared). */
export function tableBare(): Px {
  const P = new Px(34, 16);
  P.rect(0, 6, 34, 3, "#6a4f34"); P.rect(2, 9, 2, 7, "#4a3524"); P.rect(30, 9, 2, 7, "#4a3524");
  return P.outline();
}
export function bowl(): Px {
  const P = new Px(10, 4);
  P.ell(5, 2, 4, 1.8, "#c9c0ae"); P.rect(2, 0, 7, 1, "#f2efe6");
  return P.outline();
}

/** The rack on the wall: the Father's short brush-knife on it (1), or taken down (0). */
export function knifeRack(full: number): Px {
  const P = new Px(26, 14);
  P.rect(0, 2, 26, 2, "#4a3524"); P.rect(3, 0, 2, 8, "#4a3524"); P.rect(21, 0, 2, 8, "#4a3524");
  if (full) { P.rect(4, 6, 8, 2, "#5a3a22"); P.rect(12, 6, 11, 2, "#b8c0c4"); P.set(22, 5, "#d8dee2"); }
  return P.outline();
}

/** The old map of Thanh Mộc on the wall, the Mạch lines faded blue ink (Ch1). */
export function wallMap(): Px {
  const P = new Px(36, 26), r = rng(606);
  P.rect(0, 0, 36, 26, "#b8a882"); P.rect(0, 0, 36, 1, "#8a7a5a");
  for (let i = 0; i < 4; i++) { let x = 2, y = 4 + i * 5; for (let k = 0; k < 16; k++) { const nx = x + 2, ny = y + Math.round((r() - 0.5) * 3); P.line(x, y, nx, ny, "#6a8aa0"); x = nx; y = Math.max(2, Math.min(23, ny)); } }
  for (let i = 0; i < 6; i++) P.set(4 + r() * 28, 3 + r() * 20, "#3a4a5a");
  return P.outline();
}

/** The low desk with its drawer. */
export function lowDesk(): Px {
  const P = new Px(40, 16);
  P.rect(0, 2, 40, 3, "#5a4430"); P.rect(2, 5, 3, 11, "#4a3524"); P.rect(35, 5, 3, 11, "#4a3524");
  P.rect(8, 5, 24, 5, "#4e3a28"); P.rect(18, 7, 4, 1, "#8a6a44");
  P.rect(6, 0, 10, 2, "#d8ccb0"); P.rect(26, 0, 4, 2, "#2a2a2a"); // measuring paper, an ink stick
  return P.outline();
}

/** The Father's bed: plain wood, a folded mat. */
export function bed(): Px {
  const P = new Px(64, 20);
  P.rect(0, 6, 64, 5, "#5a4430"); P.rect(0, 4, 64, 2, "#7a6a4a");
  for (const x of [1, 59]) P.rect(x, 11, 4, 9, "#4a3524");
  P.rect(46, 1, 14, 4, "#8a7a5a");
  return P.outline();
}

/** The old clothes box pulled out from under the bed: empty. */
export function clothesBox(): Px {
  const P = new Px(22, 9);
  P.rect(0, 1, 22, 8, "#4a3a28"); P.rect(0, 1, 22, 1, "#6a5438"); P.rect(2, 3, 18, 5, "#2a2016");
  return P.outline();
}

/** The dust on the floor: four leg prints, and a short drag mark at the inner one (Ch1). */
export function dustTrace(): Px {
  const P = new Px(70, 4);
  for (const x of [2, 62]) { P.rect(x, 1, 4, 2, "#5a5046"); }
  P.rect(60, 2, 8, 1, "#6a6056"); // the drag
  return P;
}

/** The floorboard that is newer than the rest; lifted (1) on the knife. */
export function floorBoard(open: number): Px {
  const P = new Px(26, 6);
  if (!open) { P.rect(0, 2, 26, 3, "#6a5a42"); P.rect(0, 2, 26, 1, "#8a7a5a"); }
  else { P.rect(0, 3, 26, 3, "#0c0906"); P.line(2, 2, 22, -6, "#6a5a42", 2); }
  return P;
}

/** An oil lamp, and its glow (drawn soft, behind). */
export function lamp(): Px {
  const P = new Px(8, 12);
  P.rect(1, 8, 6, 4, "#6a5a42"); P.rect(3, 5, 2, 3, "#8a7a5a"); P.rect(3, 1, 2, 4, "#ffcf6a"); P.set(3, 0, "#fff2c8");
  return P;
}

/**
 * The half Mạch Ấn: a little bigger than a coin, burnt black, half of it broken away; grooves curving to a centre.
 * Its inner cracks glow red faintly (1), then go dark (0). Red here is the Mạch's, not the thread's: Art Bible §3
 * allows it for Mạch Ấn glow.
 */
export function machAn(f: number): Px {
  const P = new Px(12, 12);
  P.ell(6, 6, 5.2, 5.2, "#1a1614");
  machGrooves(P, 6, 6, 4.4, f ? "#ff6a3a" : "#3a302a", 5, 1.3);
  for (let y = 0; y < 12; y++) for (let x = 7; x < 12; x++) if (x - 7 > (y - 6) * 0.6 + 1) P.d[y * P.w + x] = null; // the broken half
  return P.outline();
}

/** Floorboards, 16×16, for indoor stages (the ground tiles are grass). */
export function woodFloor(under: number): Px {
  const P = new Px(16, 16);
  if (under) { P.rect(0, 0, 16, 16, "#1e160e"); P.rect(0, 0, 16, 1, "#2a2016"); return P; }
  P.rect(0, 0, 16, 16, "#3e2e1e"); P.rect(0, 0, 16, 2, "#5a4430");
  for (const y of [5, 10]) P.rect(0, y, 16, 1, "#2e2216");
  P.rect(7, 2, 1, 3, "#2e2216"); P.rect(12, 6, 1, 4, "#2e2216"); P.rect(3, 11, 1, 5, "#2e2216");
  return P;
}

/* ---------------- An Mộc at night (S6) ---------------- */

/** Bà Dần's house at night: intact (0), or its porch fallen in (1; the fallen bamboo frame is its own prop). */
export function danHouse(broken: number): Px { return villageHouse(1, true, true, !!broken); }

/** The bamboo porch frame, fallen across the step (separate, so it can be lifted). */
export function bambooFrame(): Px {
  const P = new Px(40, 14);
  for (let i = 0; i < 4; i++) P.line(0, 12 - i, 39, 2 + i * 2, "#7a6a3a", 1);
  P.line(4, 13, 10, 0, "#8a7a46", 2); P.line(26, 13, 32, 0, "#8a7a46", 2);
  return P.outline();
}

/** Stones stacked at a gate (C1 told: the village prepared; Ch. 2 lists what no one did otherwise). */
export function stones(): Px {
  const P = new Px(28, 14), r = rng(808);
  for (let i = 0; i < 7; i++) P.ell(4 + (i % 4) * 7 + (i > 3 ? 3 : 0), 11 - (i > 3 ? 6 : 0), 4 + r() * 1.5, 3, ["#5a5a5e", "#4a4a50", "#6a6a6e"][i % 3]);
  return P.outline();
}


/* ---------------- the dry well (S2) ---------------- */

/** The village well: a round stone rim, a wooden frame with its pulley, the rope and the bucket on the rim. */
export function well(): Px {
  const P = new Px(48, 52), r = rng(909);
  P.rect(4, 34, 40, 18, "#6a6860"); P.rect(4, 34, 40, 3, "#86847a");
  for (let i = 0; i < 26; i++) P.set(5 + r() * 38, 38 + r() * 13, r() < 0.5 ? "#5a5850" : "#7a786e");
  for (const y of [42, 48]) P.rect(4, y, 40, 1, "#54524a");
  P.rect(6, 4, 3, 30, "#5a4430"); P.rect(39, 4, 3, 30, "#5a4430"); P.rect(4, 2, 40, 3, "#4a3524");
  P.ell(24, 7, 3, 3, "#3a2a1c"); P.line(24, 10, 24, 28, "#a89a6a"); // pulley, rope
  P.rect(30, 29, 7, 5, "#6a5232"); P.rect(30, 29, 7, 1, "#8a7044"); // the bucket, set down
  return P.outline();
}

/** One of the Father's copper rods laid across the well's mouth (S2), leaf-vein marks at its tip. */
export function rodOnWell(): Px {
  const P = new Px(44, 3);
  P.rect(0, 1, 44, 1, "#b87333"); P.rect(0, 0, 44, 1, "#d8935a");
  for (const x of [2, 4, 6]) P.set(x, 2, "#7a4a22");
  return P;
}

/* ---------------- the root path and the station (S8) ---------------- */

/**
 * A clump of bamboo at the western edge of the village ("cuối bãi tre phía tây", Ch. 2): tall jointed culms that lean
 * out and arch over at the top, a pale ring at every node, and narrow leaves hanging in sprays from the upper nodes.
 */
export function bamboo(v: number): Px {
  const W = 64, H = 160, P = new Px(W, H), r = rng(1010 + v * 7);
  const culmCols = ["#7a9a3e", "#6a8a36", "#8aa648", "#9aa452"]; // younger green to older yellow-green
  const leafCols = ["#5f8a3a", "#6f9a44", "#4f7a32", "#86ac52"];
  const culms = 5 + (v % 2);
  type Pt = [number, number];
  const tips: { path: Pt[]; col: string }[] = [];
  for (let i = 0; i < culms; i++) {
    const baseX = 18 + i * 5 + Math.round(r() * 3), h = 110 + r() * 46, lean = (i - (culms - 1) / 2) * 7 + (r() - 0.5) * 6;
    const col = culmCols[Math.floor(r() * culmCols.length)], thick = i === 2 || i === 3 ? 3 : 2;
    const path: Pt[] = [];
    for (let y = 0; y <= h; y++) {
      const u = y / h, x = baseX + lean * u * u + (u > 0.85 ? lean * (u - 0.85) * 3 : 0); // the top arches over
      path.push([x, H - 1 - y]);
      P.rect(x, H - 1 - y, u > 0.8 ? thick - 1 : thick, 1, col);
      if (y > 4 && y % 13 === 0) { P.rect(x - 1, H - 1 - y, thick + 2, 1, shade(col, 1.25)); P.rect(x, H - y, thick, 1, shade(col, 0.7)); }
    }
    tips.push({ path, col });
  }
  // twigs and leaf sprays from the upper nodes, hanging down and outward
  for (const { path } of tips) {
    for (let k = Math.floor(path.length * 0.45); k < path.length; k += 9 + Math.floor(r() * 5)) {
      const [x, y] = path[k], side = r() < 0.5 ? -1 : 1, tw = 3 + r() * 5;
      const tx = x + side * tw, ty = y - tw * 0.6;
      P.line(x, y, tx, ty, "#6a7a3a");
      for (let l = 0; l < 3 + Math.floor(r() * 3); l++) {
        const len = 5 + r() * 4, ang = Math.PI / 2 - side * (0.3 + r() * 0.9); // mostly downward, splayed outward
        const ex = tx + Math.cos(ang) * len * side * 0.9, ey = ty + Math.sin(ang) * len;
        const lc = leafCols[Math.floor(r() * leafCols.length)];
        P.line(tx, ty, ex, ey, lc); P.set(ex, ey, shade(lc, 0.75));
      }
    }
  }
  for (let i = 0; i < 8; i++) P.line(10 + r() * 44, H - 1, 10 + r() * 44 + (r() - 0.5) * 6, H - 3, "#8a7a4a"); // fallen sheaths
  return P.outline();
}

/** The living roots across the station road (Ch1: "Chúng mọc lại"): a low wet wall (0), or parted to let him through (1). */
export function rootWall(open: number): Px {
  const P = new Px(70, 60), r = rng(1111);
  const root = "#2c2420", hi = "#4a3a2e", tip = "#7fa65a";
  for (let i = 0; i < 16; i++) {
    let x0 = 4 + r() * 62, y0 = 60;
    const side = open ? (x0 < 35 ? -1 : 1) : 0;
    for (let k = 0; k < 7; k++) {
      const x1 = x0 + (r() - 0.5) * 12 + side * 4, y1 = y0 - 4 - r() * 6;
      P.line(x0, y0, x1, y1, k % 3 ? root : hi, i % 4 === 0 ? 3 : 2);
      x0 = open ? Math.max(open && side < 0 ? 0 : 42, Math.min(side < 0 ? 26 : 70, x1)) : x1; y0 = y1;
    }
    P.set(x0, y0 - 1, tip);
  }
  for (let i = 0; i < 8; i++) P.set(10 + r() * 50, 56 + r() * 3, "#6a4a32"); // fresh-cut stumps sprouting again
  return P.outline();
}

/** A deer with roots grown out of both flanks into the ground: it can no longer run (Ch. 2). Seen from behind. */
export function rootedDeer(): Px {
  const P = new Px(40, 40);
  const c = "#8a6a48", d = shade(c, 0.75);
  P.ell(20, 20, 11, 6, c); P.rect(11, 22, 3, 14, d); P.rect(27, 22, 3, 14, d); P.rect(15, 23, 2, 13, c); P.rect(23, 23, 2, 13, c);
  P.rect(28, 8, 5, 10, c); P.rect(29, 4, 4, 5, c); P.line(30, 4, 27, 0, "#5a4430"); P.line(33, 4, 36, 0, "#5a4430");
  P.rect(8, 16, 3, 3, "#d8ccb0"); // the white tail
  for (const [x0, dir] of [[10, -1], [30, 1], [14, -1], [26, 1]] as const) { P.line(x0, 22, x0 + dir * 6, 34, "#2c2420", 1); P.line(x0 + dir * 6, 34, x0 + dir * 8, 40, "#2c2420", 1); }
  return P.outline();
}

/**
 * The Dẫn Mạch station: a square grey stone, chest-high, cased in tarnished copper, on a low mound inside a ring of flat
 * paving stones ("vòng đá lát", Ch. 2). Its face bears the Mạch grooves. The front copper plate has been prised open
 * along its seam and swung out on its hinge, undamaged ("Không phải đập. Cạy. Gọn gàng"); behind it, where something
 * glowed faintly blue, a dark hollow.
 */
export function station(): Px {
  const W = 130, H = 78, P = new Px(W, H), r = rng(1212);
  const stone = "#7c7c76", stoneHi = "#9a9a92", stoneS = "#5e5e58", cu = "#8a5a32", cuHi = "#b07a46", cuS = "#5e3c22";
  P.ell(65, 80, 64, 16, "#4a5a3a"); P.ell(65, 80, 58, 12, "#56684a"); // the mound, moss
  for (let i = 0; i < 40; i++) P.set(8 + r() * 114, 66 + r() * 11, r() < 0.5 ? "#6a7a50" : "#3e4c32");
  for (let i = 0; i < 9; i++) { const x = 14 + i * 12 + (i > 3 ? 2 : 0); P.rect(x, 66 + (i % 2), 10, 3, "#8a8a80"); P.rect(x, 66 + (i % 2), 10, 1, "#a2a298"); } // paving ring
  // the stone
  P.rect(44, 22, 42, 44, stone); P.rect(44, 22, 42, 2, stoneHi); P.rect(44, 22, 2, 44, stoneHi); P.rect(84, 22, 2, 44, stoneS);
  for (let i = 0; i < 16; i++) P.set(46 + r() * 38, 26 + r() * 38, r() < 0.5 ? stoneS : "#6a7a5a");
  machGrooves(P, 65, 34, 7, stoneS, 6, 1.4);
  // copper casing: corner bands and a top band, dull with age
  for (const x of [41, 86]) { P.rect(x, 20, 3, 46, cu); P.rect(x, 20, 1, 46, cuHi); for (let y = 24; y < 64; y += 8) P.set(x + 1, y, cuS); }
  P.rect(41, 18, 48, 3, cu); P.rect(41, 18, 48, 1, cuHi);
  // the hollow where the plate was
  P.rect(52, 42, 26, 20, "#0e0c0a"); P.rect(52, 42, 26, 1, "#26221c"); P.rect(52, 42, 1, 20, "#26221c");
  // the plate, swung out on its hinge at the right edge: seen edge-on, a narrow parallelogram, rivets intact
  P.tri(89, 42, 104, 46, 89, 62, cu); P.tri(104, 46, 104, 58, 89, 62, cu);
  P.line(89, 42, 104, 46, cuHi); P.line(104, 46, 104, 58, cuS); P.line(104, 58, 89, 62, cuS);
  for (const [x, y] of [[93, 47], [100, 49], [93, 57], [100, 55]]) P.set(x, y, cuHi);
  P.rect(88, 44, 2, 3, "#3a2a1c"); P.rect(88, 56, 2, 3, "#3a2a1c"); // hinges
  return P.outline();
}

/** Boot prints in the wet earth, hard soles, deep treads, all one kind, walking in step (Ch. 2). */
export function bootPrints(): Px {
  const P = new Px(80, 4);
  for (let i = 0; i < 10; i++) { const x = 2 + i * 8, y = i % 2; P.rect(x, y + 1, 4, 2, "#2a2018"); P.set(x + 1, y + 1, "#4a3a2a"); }
  return P;
}

/** The third rod, dropped in the grass at the edge of the mound. */
export function droppedRod(): Px {
  const P = new Px(22, 6);
  P.line(0, 5, 20, 1, "#b87333"); P.line(1, 5, 21, 1, "#d8935a");
  P.set(19, 3, "#6a9a52"); P.set(4, 4, "#6a9a52"); P.set(12, 4, "#5a8a46"); // grass over it
  return P;
}

/** The Father's spare tool bag, on the floor of his room: measuring paper, ink, a bamboo folding rule, red thread. */
export function satchel(): Px {
  const P = new Px(14, 12);
  P.rect(1, 3, 12, 9, "#5a4030"); P.rect(1, 3, 12, 2, "#6e5038"); P.line(3, 3, 7, 0, "#7b6a5a"); P.line(7, 0, 11, 3, "#7b6a5a");
  P.set(10, 8, RED);
  return P.outline();
}

/** Registers every village texture once (called from Boot, beside registerTextures). */
export function registerVillageTextures(scene: Phaser.Scene): void {
  const add = (key: string, px: Px) => { if (!scene.textures.exists(key)) scene.textures.addCanvas(key, px.toCanvas()); };
  const f = (key: string, p: FatherPose) => add(key, father(p));
  [0, 1].forEach((i) => f(`f_idle${i}`, { bob: i, arm: "rest" }));
  [0, 1].forEach((i) => f(`f_sit${i}`, { sit: true, bob: 9 + i, arm: "bowl", backArm: "rest", bowl: true }));
  f("f_stand", { bob: 3, arm: "swingF", backArm: "swingB", lean: 1 });
  for (let i = 0; i < 4; i++) {
    const dx = [5, 0, -5, 0][i], lift = [0, 2, 0, 2][i];
    f(`f_walk${i}`, { front: { dx, lift: i === 1 ? lift : 0 }, back: { dx: -dx, lift: i === 3 ? lift : 0 }, arm: dx > 0 ? "swingB" : dx < 0 ? "swingF" : "rest", backArm: dx > 0 ? "swingF" : dx < 0 ? "swingB" : "rest" });
    f(`f_bwalk${i}`, { bag: true, front: { dx, lift: i === 1 ? lift : 0 }, back: { dx: -dx, lift: i === 3 ? lift : 0 }, arm: dx > 0 ? "swingB" : dx < 0 ? "swingF" : "rest", backArm: dx > 0 ? "swingF" : dx < 0 ? "swingB" : "rest" });
  }
  [0, 1].forEach((i) => f(`f_bidle${i}`, { bag: true, bob: i }));
  f("f_crouch", { bob: 10, lean: 3, front: { dx: 4 }, back: { dx: -3 }, arm: "low" });
  f("f_crouchLeaf", { bob: 10, lean: 3, front: { dx: 4 }, back: { dx: -3 }, arm: "low", leaf: true });
  f("f_hold", { arm: "look", leaf: true });
  f("f_offer", { arm: "offer", leaf: true, backArm: "rest" });
  f("f_drop", { arm: "drop", leaf: true });
  add("house", house());
  add("table", table());
  add("bag_prop", bagProp());
  add("yard_tree", yardTree());
  add("fence", fence());
  add("leafg0", greenLeaf(0));
  add("leafg1", greenLeaf(1));
  add("big_leaf0", bigLeaf(0));
  add("big_leaf1", bigLeaf(1));
  [0, 1, 2].forEach((v) => add(`night_house${v}`, nightHouse(v)));
  // villagers: idle (2), walk (4), and a few held poses
  for (const [id, L] of Object.entries(LOOKS) as [LookId, Look][]) {
    const v = (key: string, p: VPose) => add(`v_${id}_${key}`, villager(L, p));
    // at rest the feet stand a little apart, so two legs read (not one post)
    [0, 1].forEach((i) => v(`idle${i}`, { bob: i, front: { dx: 2 }, back: { dx: -2 } }));
    for (let i = 0; i < 4; i++) {
      const dx = [5, 0, -5, 0][i], lift = [0, 2, 0, 2][i];
      v(`walk${i}`, { front: { dx, lift: i === 1 ? lift : 0 }, back: { dx: -dx, lift: i === 3 ? lift : 0 }, arm: dx > 0 ? "swingB" : dx < 0 ? "swingF" : "rest", backArm: dx > 0 ? "swingF" : dx < 0 ? "swingB" : "rest" });
    }
    [0, 1].forEach((i) => v(`kneel${i}`, { kneel: true, arm: "pull", backArm: "pull", bob: i }));
    v("brow", { arm: "brow", front: { dx: 2 }, back: { dx: -2 } });
    [0, 1].forEach((i) => v(`torch${i}`, { arm: "torch", torch: i, bob: i, front: { dx: 2 }, back: { dx: -2 } }));
    add(`v_${id}_lie`, villagerLying(L));
  }
  [0, 1, 2].forEach((v) => add(`day_house${v}`, dayHouse(v)));
  add("great_tree", greatTree("yellow"));
  add("great_tree_green", greatTree("green"));
  add("great_tree_bare", greatTree("bare"));
  add("well", well());
  add("rod_on_well", rodOnWell());
  [0, 1, 2].forEach((v) => add(`bamboo${v}`, bamboo(v)));
  [0, 1].forEach((i) => add(`root_wall${i}`, rootWall(i)));
  add("rooted_deer", rootedDeer());
  add("station", station());
  add("boot_prints", bootPrints());
  add("dropped_rod", droppedRod());
  add("satchel", satchel());
  add("leaf_carpet", leafCarpet());
  [0, 1].forEach((i) => { add(`dog${i}`, dog(i)); add(`bird${i}`, bird(i)); add(`bird_down${i}`, birdDown(i)); add(`mach_an${i}`, machAn(i)); add(`dan_house${i}`, danHouse(i)); add(`front_door${i}`, frontDoor(i)); add(`rack${i}`, knifeRack(i)); add(`board${i}`, floorBoard(i)); });
  add("interior", interior());
  add("room_door", roomDoor());
  add("table_bare", tableBare());
  add("bowl", bowl());
  add("wall_map", wallMap());
  add("low_desk", lowDesk());
  add("bed", bed());
  add("clothes_box", clothesBox());
  add("dust_trace", dustTrace());
  add("lamp", lamp());
  add("stones", stones());
  add("floor_wood", woodFloor(0));
  add("floor_under", woodFloor(1));
  add("bamboo_frame", bambooFrame());
}

