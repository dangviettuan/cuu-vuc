/**
 * Greybox art for Chapter I's places (Phase 3): Mộc Thành, the tree-built town ("không được xây trên mặt đất", prose
 * Ch. 3); the mentors' spots; the Outer Forest (streams, the hollow tree, a rockslide); the Làng Khê ruins; the grove's
 * Mạch node; and the Cut (the severed node, Mạch stone, scaffolds). Thanh Mộc palette (concept pick A): deep greens,
 * moss, warm wood; Mạch light is green; a cut Mạch is lit upstream and dark downstream (Art Bible §4).
 * Backgrounds carry no outline (Art Bible §2); props that stand in the lane do.
 */
import Phaser from "phaser";
import { Px, machGrooves, rng, shade } from "./art";

const BARK = "#4a3a28", BARK_HI = "#5e4a34", BARK_S = "#352a1e", WOOD = "#7a5a3a", WOOD_S = "#5a4028", ROPE = "#a8946a";

/** A giant tree of Mộc Thành: a trunk wider than a house, buttress roots, the town built onto it. */
export function giantTrunk(v: number): Px {
  const W = 150, H = 300, P = new Px(W, H), r = rng(300 + v), cx = 75;
  for (let y = 0; y < H; y++) {
    const u = y / H, half = 34 + Math.pow(u, 4) * 40;
    P.rect(cx - half, y, half * 2, 1, BARK);
    for (const f of [-0.7, -0.25, 0.3, 0.75]) P.set(cx + f * half, y, BARK_S);
    P.set(cx - half + 2, y, BARK_HI);
  }
  for (let i = 0; i < 60; i++) P.set(cx - 30 + r() * 60, r() * H, r() < 0.5 ? "#4f6a3a" : BARK_S); // moss, knots
  for (const [ex, lift] of [[4, 30], [24, 18], [126, 18], [146, 30]] as const) P.line(cx + (ex < cx ? -30 : 30), H - lift - 20, ex, H - 1, BARK, 6);
  return P;
}

/** A wooden deck built out from a trunk, with a rail and its brackets: the town's floors. */
export function deck(w: number): Px {
  const P = new Px(w, 26);
  P.rect(0, 10, w, 4, WOOD); P.rect(0, 10, w, 1, shade(WOOD, 1.2)); P.rect(0, 14, w, 2, WOOD_S);
  for (let x = 2; x < w; x += 14) { P.rect(x, 0, 2, 10, WOOD_S); P.line(x + 1, 16, x + 7, 25, WOOD_S, 2); }
  P.rect(0, 0, w, 2, WOOD);
  return P;
}

/** A hut on a deck: plank walls, a bark-shingled roof, a lit doorway. */
export function treeHut(v: number): Px {
  const P = new Px(64, 56), r = rng(400 + v);
  P.rect(8, 22, 48, 34, WOOD); for (let x = 8; x < 56; x += 5) P.rect(x, 22, 1, 34, WOOD_S);
  P.tri(2, 24, 32, 2, 62, 24, BARK_S); for (let i = 0; i < 30; i++) P.set(6 + r() * 52, 8 + r() * 16, BARK_HI);
  P.rect(v % 2 ? 14 : 36, 34, 12, 22, "#2a1e14"); P.rect(v % 2 ? 34 : 14, 32, 10, 8, "#e0a24a");
  return P;
}

/** A rope bridge between trunks, sagging. */
export function ropeBridge(w: number): Px {
  const P = new Px(w, 24);
  for (let x = 0; x < w; x++) {
    const sag = Math.round(Math.sin((x / w) * Math.PI) * 10);
    P.set(x, 2 + sag, ROPE); P.set(x, 12 + sag, ROPE);
    if (x % 6 === 0) { P.rect(x, 12 + sag, 4, 2, WOOD); P.line(x, 2 + sag, x, 12 + sag, shade(ROPE, 0.8)); }
  }
  return P;
}

/** A hanging lantern, lit (Mộc Thành at night is never dark, Ch. 3). */
export function lantern(): Px {
  const P = new Px(8, 18);
  P.line(4, 0, 4, 6, ROPE); P.rect(1, 6, 6, 9, "#e0a24a"); P.rect(1, 6, 6, 1, WOOD_S); P.rect(1, 14, 6, 1, WOOD_S); P.rect(3, 8, 2, 4, "#fff2c8");
  return P.outline();
}

/** A ladder of lashed poles. */
export function ladder(h: number): Px {
  const P = new Px(14, h);
  P.rect(1, 0, 2, h, WOOD); P.rect(11, 0, 2, h, WOOD);
  for (let y = 4; y < h; y += 8) P.rect(1, y, 12, 2, WOOD_S);
  return P;
}

/** Bà Rêu's ring of white mushrooms. */
export function mushroomRing(): Px {
  const P = new Px(70, 12), r = rng(77);
  for (let i = 0; i < 11; i++) { const x = 3 + i * 6 + r() * 2, h = 3 + r() * 4; P.rect(x + 1, 11 - h, 1, h, "#e8e0d0"); P.ell(x + 1, 11 - h, 2.5, 1.5, "#f2ece0"); }
  return P.outline();
}

/** Toản's lean-to, full of rope, pulleys, springs "and things he couldn't name" (Ch. 4). */
export function shed(): Px {
  const P = new Px(90, 70), r = rng(55);
  P.rect(6, 20, 4, 50, WOOD_S); P.rect(80, 30, 4, 40, WOOD_S); P.line(4, 20, 86, 30, BARK_S, 3);
  for (let i = 0; i < 6; i++) { const x = 16 + i * 11; P.line(x, 24 + i, x + (r() - 0.5) * 6, 40 + r() * 10, ROPE); P.ell(x, 40 + r() * 10, 3, 3, "#8a8a7a"); }
  for (let i = 0; i < 3; i++) { const x = 20 + i * 22; for (let k = 0; k < 6; k++) P.set(x + (k % 2), 54 + k, "#9a9a8a"); } // springs
  P.rect(12, 60, 66, 10, WOOD); P.rect(30, 52, 14, 8, "#6a6a5a");
  return P.outline();
}

/** Lão Trụ's practice post: a wrapped wooden pole, nicked by years of strikes. */
export function practicePost(): Px {
  const P = new Px(16, 56), r = rng(33);
  P.rect(5, 0, 6, 56, WOOD); P.rect(3, 12, 10, 18, ROPE); P.rect(2, 52, 12, 4, WOOD_S);
  for (let i = 0; i < 10; i++) P.set(5 + r() * 6, 2 + r() * 48, WOOD_S);
  return P.outline();
}

/** The branch Én sits on, out from a trunk. */
export function perch(): Px {
  const P = new Px(70, 12);
  P.line(0, 8, 69, 3, BARK, 4); P.line(40, 5, 60, -2, BARK, 2); P.ell(62, 0, 6, 3, "#4f7a40");
  return P.outline();
}

/** A forest stream (running) or its bed gone dry and cracked (Làng Khê: "Linh Suy lấy hết, trong một mùa"). */
export function stream(w: number, dry: boolean): Px {
  const P = new Px(w, 8), r = rng(dry ? 9 : 8);
  P.rect(0, 2, w, 6, dry ? "#6a5e48" : "#3a6a7a");
  for (let i = 0; i < w / 3; i++) P.set(r() * w, 2 + r() * 6, dry ? "#4a4030" : "#6aa0b0");
  if (dry) for (let i = 0; i < w / 8; i++) { const x = r() * w; P.line(x, 3, x + (r() - 0.5) * 6, 7, "#3a3020"); }
  return P;
}

/** The hollow tree where the Tư mother and child hid (Ch. I §12, if the village was told). */
export function hollowTree(): Px {
  const P = new Px(80, 110), r = rng(66);
  P.rect(18, 0, 44, 110, BARK); for (let y = 0; y < 110; y += 3) P.set(20 + r() * 40, y, BARK_S);
  P.ell(40, 86, 14, 22, "#140f0a"); P.ell(40, 66, 10, 6, "#140f0a");
  for (const ex of [4, 76]) P.line(ex < 40 ? 20 : 60, 96, ex, 109, BARK, 4);
  return P.outline();
}

/** A rockslide across the stone route (the way the herd or the rocks block, I-3). */
export function rockslide(): Px {
  const P = new Px(110, 60), r = rng(44);
  for (let i = 0; i < 18; i++) { const x = 10 + r() * 90, y = 58 - r() * 40, rr = 6 + r() * 10; P.ell(x, y, rr, rr * 0.8, ["#6a6a66", "#5a5a56", "#7a7a72"][i % 3]); }
  return P.outline();
}

/** A piglet lying dead on the trail (I-3, if Nanh Rễ was finished: "only the sight of it"). */
export function pigletDead(): Px {
  const P = new Px(14, 6);
  P.ell(7, 4, 5, 2, "#8a7a68"); P.set(12, 4, "#2a211c"); P.line(3, 2, 1, 0, "#6a5a4c");
  return P.outline();
}

/** A ruined house at Làng Khê: the roof fallen in, the walls standing empty. */
export function ruinHouse(v: number): Px {
  const P = new Px(100, 70), r = rng(500 + v), wall = "#7a6e58";
  P.rect(10, 30, 80, 40, wall); for (let i = 0; i < 40; i++) P.set(10 + r() * 80, 30 + r() * 40, shade(wall, 0.85));
  P.line(6, 34, 44 + v * 8, 14, "#5a4a30", 3); P.line(44 + v * 8, 14, 70, 40, "#5a4a30", 2); // the roof's bones
  for (let i = 0; i < 14; i++) P.line(20 + r() * 60, 30, 20 + r() * 60, 26 + r() * 6, "#7a6a3a");
  P.rect(v % 2 ? 24 : 58, 44, 14, 26, "#1e1810"); P.rect(v % 2 ? 60 : 24, 42, 12, 10, "#1e1810");
  return P.outline();
}

/**
 * The grove's Mạch node (I-5): a grey slab carved with the Mạch grooves, weeping black sap from every groove into a
 * pool at its foot ("Không phải máu. Nhựa đen. Đặc", Ch. 5). After the absorption, it is dry.
 */
export function nodeStone(weeping: boolean): Px {
  const P = new Px(60, 80), r = rng(88);
  P.rect(14, 10, 32, 66, "#7a7a74"); P.rect(14, 10, 32, 2, "#9a9a92"); P.tri(14, 10, 30, 0, 46, 10, "#6a6a64");
  machGrooves(P, 30, 34, 10, "#4a4a44", 6, 1.4);
  if (weeping) {
    for (let i = 0; i < 6; i++) { const x = 18 + r() * 24; P.line(x, 30 + r() * 10, x, 70 + r() * 6, "#0e0a08", 1); }
    P.ell(30, 77, 26, 3, "#0e0a08");
  }
  return P.outline();
}

/**
 * The Cut (I-6): a Mạch node severed clean, the face mirror-smooth; upstream still faintly lit green, downstream dark
 * (Art Bible §4).
 */
export function cutNode(): Px {
  const P = new Px(90, 90);
  P.rect(4, 20, 38, 70, "#6a7a74"); P.rect(48, 20, 38, 70, "#4a504e");
  P.rect(40, 18, 2, 72, "#d8e8e4"); P.rect(48, 18, 1, 72, "#2a302e"); // the mirror face, and the dark one
  for (let y = 26; y < 86; y += 6) P.rect(8, y, 30, 1, "#7ee08a");   // upstream: the light still in it
  machGrooves(P, 22, 52, 9, "#5ab070", 5, 1.3);
  return P.outline();
}

/** Bundles of Mạch stone cut and stacked by the trench (Ch. 6: "những bó đá Mạch"), a cold faint green inside. */
export function machBundle(): Px {
  const P = new Px(50, 30), r = rng(21);
  for (let i = 0; i < 7; i++) { const x = 4 + i * 6, h = 14 + r() * 12; P.rect(x, 30 - h, 5, h, i % 2 ? "#6a7a74" : "#5a6a64"); P.rect(x + 2, 30 - h + 3, 1, h - 6, "#5ab070"); }
  P.rect(0, 18, 50, 2, ROPE);
  return P.outline();
}

/** A scaffold frame of dark metal over the trench, a hoist on it (Cương's cell works in iron, not wood). */
export function scaffold(): Px {
  const P = new Px(80, 90), m = "#4a4e52";
  P.rect(6, 0, 4, 90, m); P.rect(70, 0, 4, 90, m); P.rect(6, 0, 68, 4, m); P.rect(6, 44, 68, 3, m);
  P.line(10, 4, 70, 44, m, 2); P.line(40, 4, 40, 30, ROPE); P.ell(40, 32, 4, 4, "#8a8a7a");
  return P.outline();
}

/** A cell's tent: plain, earth-coloured, pegged tight. */
export function tent(): Px {
  const P = new Px(60, 34);
  P.tri(0, 34, 30, 0, 60, 34, "#6a5a3e"); P.tri(22, 34, 30, 12, 38, 34, "#2a2016"); P.line(30, 0, 30, 34, "#4a3a28");
  return P.outline();
}

export function registerCh1Textures(scene: Phaser.Scene): void {
  const add = (key: string, px: Px) => { if (!scene.textures.exists(key)) scene.textures.addCanvas(key, px.toCanvas()); };
  [0, 1].forEach((v) => add(`giant_trunk${v}`, giantTrunk(v)));
  add("deck160", deck(160)); add("deck100", deck(100));
  [0, 1].forEach((v) => add(`tree_hut${v}`, treeHut(v)));
  add("rope_bridge", ropeBridge(120)); add("lantern", lantern()); add("ladder", ladder(120));
  add("mushroom_ring", mushroomRing()); add("shed", shed()); add("practice_post", practicePost()); add("perch", perch());
  add("stream", stream(140, false)); add("stream_dry", stream(200, true));
  add("hollow_tree", hollowTree()); add("rockslide", rockslide()); add("piglet_dead", pigletDead());
  [0, 1, 2].forEach((v) => add(`ruin_house${v}`, ruinHouse(v)));
  add("node_weeping", nodeStone(true)); add("node_dry", nodeStone(false));
  add("cut_node", cutNode()); add("mach_bundle", machBundle()); add("scaffold", scaffold()); add("tent", tent());
}
