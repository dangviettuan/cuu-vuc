/**
 * Diệp, greybox frames (Phase 3, Ch. I ally). Concept pick A, "short-haired warden" (docs/06-art/concept-v0.1/picks.md;
 * DB N7): a little taller than him (51 px), upright and composed, short practical black hair, a green-grey layered coat
 * to mid-thigh, wrapped forearms, the warden's spear (~56 px), and the small wooden charm on a cord at her throat.
 * Her two moves are the ones her Ch. VIII duel will echo (DB N6): a long thrust and a wide, controlled sweep.
 */
import Phaser from "phaser";
import { Px, shade } from "./art";

const D = {
  skin: "#c99372", hair: "#171312", coat: "#56685a", shirt: "#7d8a74", pants: "#3d4640", wrap: "#b6ab8f",
  boot: "#2e2620", shaft: "#6e5233", head: "#b9c2c4", headHi: "#e3eaec", charm: "#a57a46",
};

export interface DiepPose {
  bob?: number;
  front?: { dx: number; lift?: number };
  back?: { dx: number; lift?: number };
  /** Spear angle in degrees from pointing forward (0), negative is up. `grip` slides the spear along the hands. */
  spear?: { angle: number; grip?: number };
  /** both hands on the shaft (fighting), or the front hand only (carrying) */
  twoHand?: boolean;
  lean?: number;
  coat?: number;
  /** down on one knee, leaning on the spear (knocked down) */
  kneel?: boolean;
  /** a smear along the spearhead's path (active frames) */
  smear?: "thrust" | "sweep";
}

/** 96×80 cell: feet at y = 76, centred at x = 48, facing right. */
export function diep(p: DiepPose): Px {
  const P = new Px(96, 80), base = 76, cx = 48, top = base - 50;
  const b = (p.bob ?? 0) + (p.kneel ? 12 : 0), ln = p.lean ?? 0;
  const Y = (v: number) => top + v, X = (v: number) => cx + v;
  const hip = Y(30) + b, skinS = shade(D.skin, 0.82), coatS = shade(D.coat, 0.78);
  const leg = (dx: number, lift: number, col: string, front: boolean) => {
    if (p.kneel) {
      const hx = X(0);
      if (front) { P.line(hx, hip, hx + 7, hip, col, 3); P.line(hx + 7, hip, hx + 7, base - 2, col, 3); P.rect(hx + 7, base - 2, 4, 2, D.boot); }
      else { P.line(hx, hip, hx - 1, base - 3, col, 3); P.line(hx - 1, base - 3, hx - 9, base - 2, col, 2); }
      return;
    }
    const x = X(-2) + dx, len = Math.max(4, base - hip + 1 - lift);
    P.rect(x, hip, 3, len, col); P.rect(x, hip + len - 3, 4, 3, D.boot);
    P.rect(x, hip + Math.floor(len * 0.55), 3, 1, D.wrap);
  };
  leg((p.back?.dx ?? -2) - 1, p.back?.lift ?? 0, shade(D.pants, 0.78), false);
  // coat to mid-thigh, layered: an outer panel and an inner one
  const hemY = Math.min(base - 10, Y(38) + b), fl = p.coat ?? 0;
  P.rect(X(-5) + ln, Y(12) + b, 10, hemY - (Y(12) + b), D.coat);
  P.rect(X(-6) - Math.min(fl, 1), Y(24) + b, 2, hemY - (Y(24) + b) - 2, coatS); // the coat's back panel, lifting a little in motion
  P.rect(X(-4) + ln, Y(12) + b, 7, 10, D.shirt);
  P.rect(X(-5) + ln, Y(22) + b, 10, 1, shade(D.coat, 0.65)); // belt
  leg(p.front?.dx ?? 2, p.front?.lift ?? 0, D.pants, true);
  // head: short black hair, a straight look forward
  const hx0 = ln + 1;
  P.rect(X(0) + hx0, Y(10) + b, 3, 2, skinS);
  P.rect(X(-3) + hx0, Y(3) + b, 7, 8, D.skin);
  P.rect(X(4) + hx0, Y(6) + b, 1, 2, D.skin);
  P.rect(X(-3) + hx0, Y(2) + b, 8, 3, D.hair); P.rect(X(-3) + hx0, Y(4) + b, 2, 4, D.hair); P.set(X(4) + hx0, Y(4) + b, D.hair);
  P.set(X(2) + hx0, Y(6) + b, "#1b1714");
  P.set(X(1) + ln, Y(13) + b, D.charm); P.set(X(0) + ln, Y(12) + b, "#3a2a1c"); // the wooden charm on its cord
  // arms and the spear
  const sx = X(0) + ln, sy = Y(14) + b;
  const sp = p.spear ?? { angle: -84 }, a = (sp.angle * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a);
  // the front hand on the shaft; a spear held upright stands clear in front of her face, not through it
  const upright = Math.abs(sp.angle) > 60, gx = sx + (upright ? 9 : 5) + ux * 2, gy = sy + 6 + uy * 2;
  const grip = sp.grip ?? 0, L = 56;
  const tailX = gx - ux * (20 + grip), tailY = gy - uy * (20 + grip), tipX = tailX + ux * L, tipY = tailY + uy * L;
  if (p.twoHand) { // back hand further down the shaft
    const bx = gx - ux * 12, by = gy - uy * 12;
    P.line(sx - 1, sy, bx, by, coatS, 2); P.rect(bx, by, 2, 2, skinS);
  }
  P.line(tailX, tailY, tipX - ux * 6, tipY - uy * 6, D.shaft, 1);
  P.line(tipX - ux * 6, tipY - uy * 6, tipX, tipY, D.head, 2); P.set(tipX, tipY, D.headHi);
  P.set(tipX - ux * 7 - uy, tipY - uy * 7 + ux, D.wrap); // binding under the head
  P.line(sx, sy, gx, gy, D.coat, 2); P.rect(gx - 1, gy - 1, 2, 2, D.skin);
  P.rect(gx - 3 - Math.round(ux * 2), gy - 1, 2, 2, D.wrap); // the forearm wrap
  P.outline();
  if (p.smear) { // a pale arc behind the spearhead
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const k = i / steps;
      if (p.smear === "thrust") P.set(tipX - ux * (18 * (1 - k)), tipY - uy * (18 * (1 - k)) + (i % 2), k > 0.5 ? "#e3eaec" : "#9fb0b6");
      else { const aa = a - 1.3 * (1 - k), r = L - 22; if (!P.get(sx + Math.cos(aa) * r, sy + Math.sin(aa) * r)) P.set(sx + Math.cos(aa) * r, sy + Math.sin(aa) * r, k > 0.5 ? "#e3eaec" : "#9fb0b6"); }
    }
  }
  return P;
}

/** Diệp's frames, keyed `d_*` (authored frames replace them by key, ADR-0011). */
export function registerDiepTextures(scene: Phaser.Scene): void {
  const add = (key: string, p: DiepPose) => { if (!scene.textures.exists(key)) scene.textures.addCanvas(key, diep(p).toCanvas()); };
  [0, 1].forEach((i) => add(`d_idle${i}`, { bob: i, spear: { angle: -84 } }));
  for (let i = 0; i < 4; i++) { // running, the spear carried low and level
    const dx = [5, 0, -5, 0][i], lift = [0, 2, 0, 2][i];
    add(`d_run${i}`, { front: { dx, lift: i === 1 ? lift : 0 }, back: { dx: -dx, lift: i === 3 ? lift : 0 }, spear: { angle: -12, grip: 4 }, lean: 1, coat: i % 2 });
    add(`d_walk${i}`, { front: { dx: dx * 0.6, lift: i === 1 ? 1 : 0 }, back: { dx: -dx * 0.6, lift: i === 3 ? 1 : 0 }, spear: { angle: -84 } });
  }
  add("d_guard", { twoHand: true, spear: { angle: -18, grip: 6 }, front: { dx: 4 }, back: { dx: -4 } });
  add("d_thrustW", { twoHand: true, spear: { angle: -6, grip: 16 }, front: { dx: 3 }, back: { dx: -5 }, lean: -2, bob: 1 });
  add("d_thrustA", { twoHand: true, spear: { angle: -2, grip: -4 }, front: { dx: 7 }, back: { dx: -6 }, lean: 3, bob: 2, coat: 2, smear: "thrust" });
  add("d_thrustR", { twoHand: true, spear: { angle: -10, grip: 6 }, front: { dx: 4 }, back: { dx: -4 }, lean: 1 });
  add("d_sweepW", { twoHand: true, spear: { angle: -70, grip: 8 }, front: { dx: 3 }, back: { dx: -4 }, lean: -2 });
  add("d_sweepA", { twoHand: true, spear: { angle: 18, grip: 2 }, front: { dx: 7 }, back: { dx: -6 }, lean: 3, bob: 3, coat: 2, smear: "sweep" });
  add("d_hurt", { spear: { angle: -50 }, lean: -3, front: { dx: -1 }, back: { dx: -4 } });
  add("d_down", { kneel: true, spear: { angle: -80, grip: 10 } });
}
