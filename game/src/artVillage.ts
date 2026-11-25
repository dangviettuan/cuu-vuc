/**
 * Greybox art for the village stages (Phase 2: Prologue S3 and S7): the Father and the house, yard and night props.
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
}

