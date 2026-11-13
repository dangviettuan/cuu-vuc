/**
 * Every animation clip in the greybox, in one place.
 * Attack clips are *built from tuning.ts*: the windup/active/recovery frame runs sum exactly to the
 * AttackDef timings, and gameplay reads the frame tag to open the hitbox (animation-driven hitboxes).
 */
import { AttackDef, DODGE, HEAVY, LIGHT, PARRY, PLAYER, RIPOSTE } from "./tuning";
import { Clip, PRI, clip, loop, phase } from "./anim";

type Set3 = { w: [string, number][]; a: [string, number, string?][]; r: [string, number][] };
const SWING_A: Set3 = { w: [["p_aW1", 0.45], ["p_aW2", 0.55]], a: [["p_aS", 0.5, "swing"], ["p_aH", 0.5]], r: [["p_aF", 0.45], ["p_aR", 0.35], ["p_idle0", 0.2]] };
const SWING_B: Set3 = { w: [["p_bW1", 0.45], ["p_bW2", 0.55]], a: [["p_bS", 0.5, "swing"], ["p_bH", 0.5]], r: [["p_bF", 0.45], ["p_bR", 0.35], ["p_idle0", 0.2]] };
const OVERHEAD: Set3 = { w: [["p_oW1", 0.4], ["p_oW2", 0.6]], a: [["p_oS", 0.45, "swing"], ["p_oH", 0.55, "slam"]], r: [["p_oF", 0.5], ["p_oR", 0.5]] };
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
  heavy: attack("heavy", HEAVY.def, HEAVY_REL),
  riposte: attack("riposte", RIPOSTE, OVERHEAD),
  charge: loop("charge", ["p_charge0", "p_charge1"], 70, PRI.ACTION),
  dodge: clip("dodge", phase(DODGE.duration, "dodge", [["p_d0", 0.14], ["p_d1", 0.3], ["p_d2", 0.3], ["p_d3", 0.26]]), PRI.ACTION),
  guard: clip("guard", phase(PARRY.window + PARRY.recovery, "guard", [["p_g0", 0.1], ["p_g1", 0.9]]), PRI.ACTION),
  parry: clip("parry", [{ key: "p_parry", ms: 100 }, { key: "p_g1", ms: 110 }], PRI.ACTION),
  heal: clip("heal", phase(PLAYER.herbUseTime, "heal", [["p_heal0", 0.4], ["p_heal1", 0.6]]), PRI.ACTION),
  hurt: clip("hurt", phase(PLAYER.hurtStun, "hurt", [["p_hurt0", 0.45], ["p_hurt1", 0.55]]), PRI.HURT),
  death: clip("death", [{ key: "p_death0", ms: 160 }, { key: "p_death1", ms: 200 }, { key: "p_death2", ms: 150, event: "thud" }, { key: "p_death3", ms: 99999 }], PRI.DEAD),
};

/** Light string: 1 down-diagonal, 2 rising, 3 overhead slam. */
export const lightClip = (combo: number): Clip => PC.light[Math.min(combo, 2)];

export const BC = {
  idle: loop("idle", ["boar_idle0", "boar_idle1"], 320),
  walk: loop("walk", ["boar_walk0", "boar_walk1", "boar_walk2", "boar_walk3"], 110, PRI.LOCO, { 0: "step" }),
  paw: loop("paw", ["boar_paw0", "boar_paw1"], 90, PRI.ACTION, { 1: "paw" }),
  gallop: loop("gallop", ["boar_gal0", "boar_gal1"], 60, PRI.ACTION, { 0: "step" }),
  stun: loop("stun", ["boar_stun0", "boar_stun1"], 200, PRI.ACTION),
  hurt: clip("hurt", [{ key: "boar_hurt", ms: 130 }], PRI.HURT),
  death: clip("death", [{ key: "boar_dead0", ms: 150 }, { key: "boar_dead1", ms: 99999, event: "thud" }], PRI.DEAD),
};

export const NC = {
  idle: loop("idle", ["nanh_idle0", "nanh_idle1", "nanh_idle2", "nanh_idle3"], 260),
  walk: loop("walk", ["nanh_walk0", "nanh_walk1", "nanh_walk2", "nanh_walk3"], 130, PRI.LOCO, { 0: "step", 2: "step" }),
  low: loop("low", ["nanh_low0", "nanh_low1"], 70, PRI.ACTION, { 0: "paw" }),
  gallop: loop("gallop", ["nanh_gal0", "nanh_gal1"], 55, PRI.ACTION, { 0: "step" }),
  rear: clip("rear", [{ key: "nanh_rear0", ms: 180 }, { key: "nanh_rear1", ms: 99999 }], PRI.ACTION),
  slam: clip("slam", [{ key: "nanh_slam", ms: 160, event: "stomp" }, { key: "nanh_idle0", ms: 200 }], PRI.ACTION),
  toss: clip("toss", [{ key: "nanh_toss", ms: 120 }, { key: "nanh_idle0", ms: 150 }], PRI.ACTION),
  daze: loop("daze", ["nanh_daze0", "nanh_daze1"], 180, PRI.ACTION),
  flinch: clip("flinch", [{ key: "nanh_flinch", ms: 90 }], PRI.SETTLE),
  collapse: clip("collapse", [{ key: "nanh_fall1", ms: 170 }, { key: "nanh_fall2", ms: 170 }, { key: "nanh_fall3", ms: 99999, event: "thud" }], PRI.DEAD),
};

export const ROOT = ["root0", "root1", "root2"] as const;
export const SHRINE_LIT = loop("lit", ["shrine_on0", "shrine_on1", "shrine_on2", "shrine_on1"], 110);
export const HERB_GLINT = clip("glint", [{ key: "herb0", ms: 1400 }, { key: "herb1", ms: 90 }, { key: "herb2", ms: 90 }, { key: "herb0", ms: 600 }], 0, true);
