/**
 * Every animation clip in the greybox, in one place.
 * Attack clips are *built from tuning.ts*: the windup/active/recovery frame runs sum exactly to the
 * AttackDef timings, and gameplay reads the frame tag to open the hitbox (animation-driven hitboxes).
 */
import { AIR_SLASH, ANH, AttackDef, DODGE, HEAVY, KIT, LIGHT, LIGHT_ANH, PARRY, PHA_THE, PLAYER, RIPOSTE, f } from "./tuning";
import { Clip, PRI, clip, loop, phase } from "./anim";

type Set3 = { w: [string, number][]; a: [string, number, string?][]; r: [string, number][] };
const SWING_A: Set3 = { w: [["p_aW1", 0.45], ["p_aW2", 0.55]], a: [["p_aS", 0.5, "swing"], ["p_aH", 0.5]], r: [["p_aF", 0.45], ["p_aR", 0.35], ["p_idle0", 0.2]] };
const SWING_B: Set3 = { w: [["p_bW1", 0.45], ["p_bW2", 0.55]], a: [["p_bS", 0.5, "swing"], ["p_bH", 0.5]], r: [["p_bF", 0.45], ["p_bR", 0.35], ["p_idle0", 0.2]] };
const OVERHEAD: Set3 = { w: [["p_oW1", 0.4], ["p_oW2", 0.6]], a: [["p_oS", 0.45, "swing"], ["p_oH", 0.55, "slam"]], r: [["p_oF", 0.5], ["p_oR", 0.5]] };
const AIR: Set3 = { w: [["p_airW", 1]], a: [["p_airS", 0.5, "swing"], ["p_airH", 0.5]], r: [["p_airF", 1]] };
const HEAVY_REL: Set3 = { w: [["p_oW3", 1]], a: OVERHEAD.a, r: OVERHEAD.r };

function attack(name: string, d: AttackDef, s: Set3): Clip {
  return clip(name, [
    ...phase(d.startup, "windup", s.w),
    ...phase(d.active, "active", s.a),
    ...phase(d.recovery, "recovery", s.r),
  ], PRI.ACTION);
}

export const PC = {
  idle: clip("idle", [
    { key: "p_idle0", ms: 200 }, { key: "p_idle1", ms: 160 }, { key: "p_idle2", ms: 240 },
    { key: "p_idle3", ms: 240 }, { key: "p_idle4", ms: 160 }, { key: "p_idle5", ms: 200 },
  ], PRI.LOCO, true),
  blink: clip("blink", [{ key: "p_idle0", ms: 90 }, { key: "p_blink", ms: 90 }, { key: "p_idle0", ms: 90 }], PRI.LOCO),
  // 8 frames at 60 ms ≈ 17 fps at full speed (stride ±9 px); timeScale follows ground speed so feet never slide.
  run: loop("run", ["p_run0", "p_run1", "p_run2", "p_run3", "p_run4", "p_run5", "p_run6", "p_run7"], 60, PRI.LOCO, { 0: "step", 4: "step" }),
  runStart: clip("runStart", [{ key: "p_runStart", ms: 70 }], PRI.SETTLE),
  skid: clip("skid", [{ key: "p_skid", ms: 110, event: "skid" }], PRI.SETTLE),
  stop: clip("stop", [{ key: "p_stop", ms: 90 }], PRI.SETTLE),
  takeoff: clip("takeoff", [{ key: "p_takeoff", ms: 80 }], PRI.SETTLE),
  rise: loop("rise", ["p_rise"], 1000),
  apex: loop("apex", ["p_apex"], 1000),
  fall: loop("fall", ["p_fall0", "p_fall1"], 90),
  land: clip("land", [{ key: "p_land0", ms: 60 }, { key: "p_land1", ms: 70 }], PRI.SETTLE),
  light: [attack("light1", LIGHT[0], SWING_A), attack("light2", LIGHT[1], SWING_B), attack("light3", LIGHT[2], OVERHEAD)],
  /** Ảnh Vệ's quicker string (twin blades), same drawings, shorter holds. */
  lightAnh: [attack("anh1", LIGHT_ANH[0], SWING_A), attack("anh2", LIGHT_ANH[1], SWING_B), attack("anh3", LIGHT_ANH[2], OVERHEAD)],
  /** Ảnh Kích: the dodge carries on into a cut through, then a turn. */
  anhKich: clip("anhKich", [
    ...phase(ANH.blink.active, "active", [["p_d1", 0.3], ["p_aS", 0.35, "swing"], ["p_aH", 0.35]]),
    ...phase(ANH.blink.recovery, "recovery", [["p_aF", 0.6], ["p_aR", 0.4]]),
  ], PRI.ACTION),
  heavy: attack("heavy", HEAVY.def, HEAVY_REL),
  riposte: attack("riposte", RIPOSTE, OVERHEAD),
  phaThe: attack("phaThe", PHA_THE, HEAVY_REL),
  air: attack("air", AIR_SLASH, AIR),
  charge: loop("charge", ["p_charge0", "p_charge1"], 70, PRI.ACTION),
  dodge: clip("dodge", phase(DODGE.duration, "dodge", [["p_d0", 0.14], ["p_d1", 0.3], ["p_d2", 0.3], ["p_d3", 0.26]]), PRI.ACTION),
  guard: clip("guard", phase(f(12) + PARRY.recovery, "guard", [["p_g0", 0.1], ["p_g1", 0.9]]), PRI.ACTION),
  parry: clip("parry", [{ key: "p_parry", ms: 100 }, { key: "p_g1", ms: 110 }], PRI.ACTION),
  /** Held guard (review D6). SETTLE, so a blocked hit's brace (the ACTION `parry` clip) plays over it, then it resumes. */
  block: loop("block", ["p_g1"], 1000, PRI.SETTLE),
  unguard: clip("unguard", [{ key: "p_g0", ms: 120 }], PRI.SETTLE),
  heal: clip("heal", phase(PLAYER.herbUseTime, "heal", [["p_heal0", 0.4], ["p_heal1", 0.6]]), PRI.ACTION),
  hurt: clip("hurt", phase(PLAYER.hurtStun, "hurt", [["p_hurt0", 0.45], ["p_hurt1", 0.55]]), PRI.HURT),
  death: clip("death", [{ key: "p_death0", ms: 160 }, { key: "p_death1", ms: 200 }, { key: "p_death2", ms: 150, event: "thud" }, { key: "p_death3", ms: 99999 }], PRI.DEAD),
};

/** Light string: 1 down-diagonal, 2 rising, 3 overhead slam. */
export const lightClip = (combo: number): Clip => (KIT.id === "anh" ? PC.lightAnh : PC.light)[Math.min(combo, 2)];

/** Boar clips by texture prefix: "boar" (the startled boars) or "rboar" (the rooted boar in S6). */
function boarClips(k: string) {
  return {
    idle: loop("idle", [`${k}_idle0`, `${k}_idle1`], 320),
    walk: loop("walk", [`${k}_walk0`, `${k}_walk1`, `${k}_walk2`, `${k}_walk3`], 110, PRI.LOCO, { 0: "step" }),
    paw: loop("paw", [`${k}_paw0`, `${k}_paw1`], 90, PRI.ACTION, { 1: "paw" }),
    gallop: loop("gallop", [`${k}_gal0`, `${k}_gal1`], 60, PRI.ACTION, { 0: "step" }),
    stun: loop("stun", [`${k}_stun0`, `${k}_stun1`], 200, PRI.ACTION),
    hurt: clip("hurt", [{ key: `${k}_hurt`, ms: 130 }], PRI.HURT),
    death: clip("death", [{ key: `${k}_dead0`, ms: 150 }, { key: `${k}_dead1`, ms: 99999, event: "thud" }], PRI.DEAD),
  };
}
export type BoarClips = ReturnType<typeof boarClips>;
export const BC = boarClips("boar");
export const RBC = boarClips("rboar");

export const NC = {
  idle: loop("idle", ["nanh_idle0", "nanh_idle1", "nanh_idle2", "nanh_idle3"], 260),
  walk: loop("walk", ["nanh_walk0", "nanh_walk1", "nanh_walk2", "nanh_walk3"], 130, PRI.LOCO, { 0: "step", 2: "step" }),
  low: loop("low", ["nanh_low0", "nanh_low1"], 70, PRI.ACTION, { 0: "paw" }),
  gallop: loop("gallop", ["nanh_gal0", "nanh_gal1"], 55, PRI.ACTION, { 0: "step" }),
  rear: clip("rear", [{ key: "nanh_rear0", ms: 180 }, { key: "nanh_rear1", ms: 99999 }], PRI.ACTION),
  slam: clip("slam", [{ key: "nanh_slam", ms: 160, event: "stomp" }, { key: "nanh_idle0", ms: 200 }], PRI.ACTION),
  toss: clip("toss", [{ key: "nanh_toss", ms: 120 }, { key: "nanh_idle0", ms: 150 }], PRI.ACTION),
  /** End of a charge: braced skid (the dodge moment is over) → winded (the counter window). Cloud playtest. */
  skid: clip("skid", [{ key: "nanh_skid", ms: 240, event: "skid" }], PRI.ACTION),
  winded: loop("winded", ["nanh_wind0", "nanh_wind1"], 170, PRI.LOCO), // LOCO: idle replaces it the moment recovery ends
  daze: loop("daze", ["nanh_daze0", "nanh_daze1"], 180, PRI.ACTION),
  flinch: clip("flinch", [{ key: "nanh_flinch", ms: 90 }], PRI.SETTLE),
  collapse: clip("collapse", [{ key: "nanh_fall1", ms: 170 }, { key: "nanh_fall2", ms: 170 }, { key: "nanh_fall3", ms: 99999, event: "thud" }], PRI.DEAD),
};

/** The Father (Prologue S3). Mostly held poses: the scene is acted in stillness, as the prose writes it. */
export const FC = {
  idle: loop("idle", ["f_idle0", "f_idle1"], 420),
  bidle: loop("bidle", ["f_bidle0", "f_bidle1"], 420),
  sit: loop("sit", ["f_sit0", "f_sit1"], 600),
  stand: clip("stand", [{ key: "f_stand", ms: 260 }, { key: "f_idle0", ms: 99999 }]),
  walk: loop("walk", ["f_walk0", "f_walk1", "f_walk2", "f_walk3"], 150, PRI.LOCO, { 0: "step", 2: "step" }),
  bwalk: loop("bwalk", ["f_bwalk0", "f_bwalk1", "f_bwalk2", "f_bwalk3"], 150, PRI.LOCO, { 0: "step", 2: "step" }),
  crouch: clip("crouch", [{ key: "f_crouch", ms: 380 }, { key: "f_crouchLeaf", ms: 99999 }]),
  hold: loop("hold", ["f_hold"], 99999),
  offer: clip("offer", [{ key: "f_offer", ms: 99999 }]),
  drop: clip("drop", [{ key: "f_drop", ms: 99999 }]),
  /** kneeling at the well (S2), no leaf in hand */
  kneel: clip("kneel", [{ key: "f_crouch", ms: 99999 }]),
};
export type FatherClip = keyof typeof FC;

/** A villager's clips (S4, S6), from the textures registered per look in src/artVillage.ts. */
export function villagerClips(look: string) {
  const k = `v_${look}_`;
  return {
    idle: loop("idle", [`${k}idle0`, `${k}idle1`], 480),
    walk: loop("walk", [`${k}walk0`, `${k}walk1`, `${k}walk2`, `${k}walk3`], 140, PRI.LOCO, { 0: "step", 2: "step" }),
    kneel: loop("kneel", [`${k}kneel0`, `${k}kneel1`], 260),
    brow: clip("brow", [{ key: `${k}brow`, ms: 99999 }]),
    torch: loop("torch", [`${k}torch0`, `${k}torch1`], 160),
    lie: clip("lie", [{ key: `${k}lie`, ms: 99999 }]),
  };
}
export type VillagerClip = keyof ReturnType<typeof villagerClips>;
/** Any NPC pose a stage or cutscene can name. An NPC without that clip holds its idle. */
export type NpcClip = FatherClip | VillagerClip;

/** Diệp (Ch. I ally): her thrust and sweep are timed in src/data/ally.ts; the clips carry the frame tags. */
export function diepClips(t: { thrust: [number, number, number]; sweep: [number, number, number] }) {
  return {
    idle: loop("idle", ["d_idle0", "d_idle1"], 420),
    run: loop("run", ["d_run0", "d_run1", "d_run2", "d_run3"], 95, PRI.LOCO, { 0: "step", 2: "step" }),
    walk: loop("walk", ["d_walk0", "d_walk1", "d_walk2", "d_walk3"], 150, PRI.LOCO, { 0: "step", 2: "step" }),
    guard: loop("guard", ["d_guard"], 99999),
    thrust: clip("thrust", [
      ...phase(t.thrust[0], "windup", [["d_thrustW", 1]]),
      ...phase(t.thrust[1], "active", [["d_thrustA", 1, "swing"]]),
      ...phase(t.thrust[2], "recovery", [["d_thrustR", 0.6], ["d_guard", 0.4]]),
    ], PRI.ACTION),
    sweep: clip("sweep", [
      ...phase(t.sweep[0], "windup", [["d_sweepW", 1]]),
      ...phase(t.sweep[1], "active", [["d_sweepA", 1, "swing"]]),
      ...phase(t.sweep[2], "recovery", [["d_thrustR", 0.5], ["d_guard", 0.5]]),
    ], PRI.ACTION),
    hurt: clip("hurt", [{ key: "d_hurt", ms: 260 }], PRI.HURT),
    down: clip("down", [{ key: "d_hurt", ms: 160 }, { key: "d_down", ms: 99999 }], PRI.DEAD),
  };
}
export type DiepClip = keyof ReturnType<typeof diepClips>;

export const ROOT = ["root0", "root1", "root2"] as const;
export const SHRINE_LIT = loop("lit", ["shrine_on0", "shrine_on1", "shrine_on2", "shrine_on1"], 110);
export const HERB_GLINT = clip("glint", [{ key: "herb0", ms: 1400 }, { key: "herb1", ms: 90 }, { key: "herb2", ms: 90 }, { key: "herb0", ms: 600 }], 0, true);
export const ANTIDOTE_GLINT = clip("glint", [{ key: "antidote0", ms: 1400 }, { key: "antidote1", ms: 90 }, { key: "antidote2", ms: 90 }, { key: "antidote0", ms: 600 }], 0, true);
