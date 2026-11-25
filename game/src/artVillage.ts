/**
 * Greybox art for the village stages (Phase 2: Prologue S3–S7): the Father, the villagers, the house inside and out,
 * the village by afternoon and by night, and the small living things (dogs, birds).
 * Generated at boot like src/art.ts, from the locked concept pick (docs/06-art/concept-v0.1/picks.md: the Father A,
 * "scholar's robe") and the Father bible (F6): fifties and looks older, a slight stoop, grey hair and beard, a white
 * burn on the left hand, the Dẫn Mạch bag with three copper rods and a red-thread spool.
 * Authored frames replace these by key, as for the hero (ADR-0011).
 */
import Phaser from "phaser";
import { Px, RED, rng, shade } from "./art";

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
  /** a hand raised to the brow, looking (the villagers at the shrine, S4) */
  brow: { e: [4, 1], h: [3, -6] },
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

/** A village house at night: dark thatch, a warm lit window (the village is awake: something is coming). */
export function nightHouse(variant: number): Px {
  const P = new Px(96, 76), r = rng(91 + variant);
  const wall = "#2a2a34", roof = "#1d1c24";
  P.rect(8, 34, 80, 42, wall);
  P.tri(0, 36, 48, 6 + variant * 2, 96, 36, roof);
  for (let x = 2; x < 94; x += 3) P.rect(x, 33 + Math.round(r() * 2), 2, 4, "#25242e");
  const wx = 20 + variant * 30;
  P.rect(wx, 46, 14, 12, "#e0a24a"); P.rect(wx, 46, 14, 2, "#a8742e"); P.rect(wx + 6, 46, 2, 12, "#3a2a20");
  P.rect(60 - variant * 20, 50, 12, 26, "#1a1a20");
  return P.outline();
}


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
}

export const LOOKS = {
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
  const leg = (dx: number, lift: number, col: string) => {
    if (p.kneel) { P.rect(X(-3) + dx, base - 10, 7, 3, col); P.rect(X(-5) + dx, base - 4, 9, 3, col); P.rect(X(-6) + dx, base - 2, 3, 2, shade(col, 0.7)); return; }
    const x = X(-2) + dx, len = Math.max(4, base - hip + 1 - lift);
    P.rect(x, hip, 3, len, col); P.rect(x, hip + len - 2, 4, 2, "#4a3a2e"); // bare feet or sandals
  };
  const sx = X(0) + ln, sy = Y(13) + b;
  const arm = (a: Arm, col: string, hand: string) => {
    const ex = sx + a.e[0], ey = sy + a.e[1], hx = sx + a.h[0], hy = sy + a.h[1];
    P.line(sx, sy, ex, ey, col, 2); P.line(ex, ey, hx, hy, col, 2); P.rect(hx, hy, 2, 2, hand);
    return [hx, hy] as const;
  };
  leg((p.back?.dx ?? 0) - 1, p.back?.lift ?? 0, shade(L.pants, 0.78));
  arm(FA[p.backArm ?? "rest"], topS, skinS);
  // tunic: a short áo to the hip, or the headman's long one to the knee
  const hemY = L.long ? Math.min(base - 8, Y(38) + b) : Y(27) + b;
  P.rect(X(-5) + ln, Y(11) + b, 10, hemY - (Y(11) + b), L.top);
  if (L.long) { P.tri(X(-5) + ln, Y(24) + b, X(-7), hemY, X(-5) + ln, hemY, L.top); P.tri(X(5) + ln, Y(24) + b, X(7), hemY, X(5) + ln, hemY, L.top); }
  P.rect(X(-5) + ln, hemY - 1, 10, 1, topS);
  P.line(X(1) + ln, Y(11) + b, X(1) + ln, hemY - 2, topS); // the button line
  leg(p.front?.dx ?? 0, p.front?.lift ?? 0, L.pants);
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

/** A village house by day: thatch, wattle-and-daub walls, a dark doorway. Three variants. */
export function dayHouse(variant: number): Px {
  const P = new Px(96, 76), r = rng(191 + variant);
  const wall = ["#8a7658", "#7f6e54", "#8e7a5c"][variant % 3], roof = "#6a5a34", thatch = "#8a7444";
  P.rect(8, 34, 80, 42, wall);
  for (let y = 36; y < 76; y += 4) for (let x = 8; x < 88; x += 3) if (r() < 0.07) P.set(x, y, shade(wall, 0.86));
  P.tri(0, 36, 48, 6 + variant * 2, 96, 36, roof);
  for (let x = 2; x < 94; x += 3) P.rect(x, 33 + Math.round(r() * 2), 2, 4, thatch);
  const wx = 20 + variant * 30;
  P.rect(wx, 46, 14, 12, "#3a2e22"); P.rect(wx, 46, 14, 2, "#5a4632"); P.rect(wx + 6, 46, 2, 12, "#5a4632");
  P.rect(60 - variant * 20, 50, 12, 26, "#2a2018");
  return P.outline();
}

/**
 * The old tree beside the miếu Mạch, in the afternoon it drops its leaves (Ch1: "Không phải một chiếc. Hàng trăm
 * chiếc."): the canopy is thinning and yellowed, the ground under it gold.
 */
export function greatTree(): Px {
  const P = new Px(170, 200), r = rng(303);
  const bark = "#4a3a2a", hi = "#6a523a";
  P.rect(74, 80, 22, 120, bark); P.rect(74, 80, 4, 120, hi);
  P.tri(60, 200, 74, 170, 78, 200, bark); P.tri(92, 200, 96, 170, 112, 200, bark);
  P.line(84, 100, 40, 60, bark, 4); P.line(86, 96, 132, 56, bark, 4); P.line(84, 90, 86, 40, bark, 3);
  for (const [cx, cy, rx, ry, c] of [[85, 50, 70, 40, "#6a7a3a"], [44, 62, 34, 24, "#7a7a34"], [128, 60, 36, 24, "#727a36"], [86, 30, 46, 26, "#7e8a3e"]] as const) P.ell(cx, cy, rx, ry, c);
  for (let i = 0; i < 260; i++) { const x = 18 + r() * 134, y = 10 + r() * 78; if (P.get(x, y)) P.set(x, y, r() < 0.55 ? "#d4b04a" : r() < 0.5 ? "#b8902e" : "#5a6a2e"); }
  for (let i = 0; i < 40; i++) { const x = 20 + r() * 130, y = 16 + r() * 70; if (P.get(x, y)) P.set(x, y, "#3a3020"); } // bare twigs showing
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
  const P = new Px(10, 10);
  P.ell(5, 5, 4.4, 4.4, "#1a1614");
  for (let y = 0; y < 10; y++) for (let x = 6; x < 10; x++) if (x - 6 > (y - 5) * 0.6 + 1) P.d[y * P.w + x] = null; // the broken half
  P.line(2, 3, 5, 5, f ? "#ff6a3a" : "#3a302a"); P.line(2, 7, 5, 5, f ? "#c84a2a" : "#3a302a"); P.line(5, 1, 5, 5, f ? "#ff8a4a" : "#3a302a");
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
export function danHouse(broken: number): Px {
  const P = new Px(120, 80), r = rng(707);
  const wall = "#2e2c34", roof = "#1d1c24";
  P.rect(10, 34, 80, 46, wall);
  P.tri(2, 36, 50, 8, 98, 36, roof);
  for (let x = 4; x < 96; x += 3) P.rect(x, 33 + Math.round(r() * 2), 2, 4, "#25242e");
  P.rect(26, 48, 14, 12, "#e0a24a"); P.rect(32, 48, 2, 12, "#3a2a20");
  P.rect(60, 52, 12, 28, "#1a1a20");
  if (!broken) { // the porch: two posts and an eave
    P.rect(90, 40, 28, 3, "#3a2e24"); P.rect(114, 40, 3, 40, "#3a2e24"); P.rect(92, 40, 3, 40, "#3a2e24");
  } else { // the eave down at an angle, a post snapped, the bamboo frame across the step
    P.line(90, 40, 118, 74, "#3a2e24", 3); P.rect(92, 40, 3, 22, "#3a2e24"); P.line(94, 62, 99, 66, "#3a2e24", 2);
  }
  return P.outline();
}

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
    [0, 1].forEach((i) => v(`idle${i}`, { bob: i }));
    for (let i = 0; i < 4; i++) {
      const dx = [5, 0, -5, 0][i], lift = [0, 2, 0, 2][i];
      v(`walk${i}`, { front: { dx, lift: i === 1 ? lift : 0 }, back: { dx: -dx, lift: i === 3 ? lift : 0 }, arm: dx > 0 ? "swingB" : dx < 0 ? "swingF" : "rest", backArm: dx > 0 ? "swingF" : dx < 0 ? "swingB" : "rest" });
    }
    [0, 1].forEach((i) => v(`kneel${i}`, { kneel: true, arm: "pull", backArm: "pull", bob: i }));
    v("brow", { arm: "brow" });
    [0, 1].forEach((i) => v(`torch${i}`, { arm: "torch", torch: i, bob: i }));
    add(`v_${id}_lie`, villagerLying(L));
  }
  [0, 1, 2].forEach((v) => add(`day_house${v}`, dayHouse(v)));
  add("great_tree", greatTree());
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

