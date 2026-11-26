/**
 * Combat tuning for the greybox, from docs/05-gameplay/combat-class-bible-v0.1.md.
 * The Bible specifies frames at 60 FPS; values here are milliseconds (1 frame ≈ 16.67 ms).
 */
export const FRAME = 1000 / 60;
export const f = (frames: number): number => Math.round(frames * FRAME);

/**
 * Logical resolution 480×270 (ADR-0009, amends the Art Bible's 640×360): sprites keep their sizes, the camera shows
 * less world, so the 48 px hero is 18% of the screen height instead of 13% (review D1). ×4 = 1080p, ×8 = 4K.
 */
export const VIEW = { width: 480, height: 270 } as const;
export const TILE = 16;

export const WORLD = {
  width: 2200,
  height: 360,
  groundY: 304,
  gravity: 900,
} as const;

/**
 * Combat kits (ADR-0010, review D2; Phase 3). Canon: the Prologue has no class; he fights with the brush-knife and the
 * universal kit (8-frame parry, 4-frame perfect dodge, block). The class is chosen in Ch. I (I-2, `CH1_CLASS`):
 * - **Kiếm Khách** (Lão Trụ): straight sword, 12-frame parry, Thế from parries, the Riposte and Phá Thế.
 * - **Ảnh Vệ** (Én): twin short blades, a quicker string, a 6-frame perfect dodge that builds Ảnh and opens a crit
 *   window, and Ảnh Kích (the Bible's Blink Strike): J during a dodge cuts through and turns behind, for 1 Ảnh.
 * Ngự Linh and Cơ Sư are not in the greybox yet (Phase 3 scope: two classes test build identity).
 *
 * `KIT` is one mutable object: the stage applies the save's class with `setKit` (src/scenes/Stage.ts). `?kit=kiem` or
 * `?kit=anh` overrides it for testing.
 */
export type KitId = "prologue" | "kiem" | "anh";
export interface Kit {
  id: KitId;
  weapon: "knife" | "sword" | "twin";
  parryWindow: number;
  /** A dodge whose first frames meet a hit is perfect (Bible §2: 4 frames; Ảnh Vệ 6). */
  perfectDodge: number;
  /** Added to every attack's reach (px): the brush-knife and the twin blades are shorter than the sword. */
  reachDelta: number;
  /** Kiếm Khách: Thế pips from parries, the Riposte, and Phá Thế. */
  classKit: boolean;
}
export const KITS: Record<KitId, Kit> = {
  prologue: { id: "prologue", weapon: "knife", parryWindow: f(8), perfectDodge: f(4), reachDelta: -8, classKit: false },
  kiem: { id: "kiem", weapon: "sword", parryWindow: f(12), perfectDodge: f(4), reachDelta: 0, classKit: true },
  anh: { id: "anh", weapon: "twin", parryWindow: f(8), perfectDodge: f(6), reachDelta: -6, classKit: false },
};
/** A test override from the URL (`?kit=kiem|anh|prologue`), or null. */
export function kitOverride(): KitId | null {
  const q = typeof location === "undefined" ? null : new URLSearchParams(location.search).get("kit");
  return q === "kiem" || q === "anh" || q === "prologue" ? q : null;
}
export const KIT: Kit = { ...KITS[kitOverride() ?? "prologue"] };
/** Switch the kit in place (everything holds this one object). Returns true if it changed. */
export function setKit(id: KitId): boolean {
  if (KIT.id === id) return false;
  Object.assign(KIT, KITS[id]);
  return true;
}

export const PLAYER = {
  maxHp: 100,
  maxStamina: 100,
  staminaRegenPerSec: 32,
  staminaRegenDelay: 500,
  runSpeed: 6 * TILE, // 6 tiles/s
  accel: 1400,
  decel: 1800,
  // ~3 tiles high: v = sqrt(2 * g * h)
  jumpVelocity: Math.sqrt(2 * WORLD.gravity * 3 * TILE),
  jumpCutFactor: 0.5,
  coyote: f(6),
  jumpBuffer: f(6),
  hurtStun: 320,
  hurtInvuln: 600,
  maxThe: 3,
  herbHeal: 35,
  herbUseTime: 420,
  /**
   * Herb pouch (review D4): finding a herb adds a pouch slot, up to this cap in the Prologue. Resting at a shrine and
   * respawning refill the pouch, so healing is a per-attempt budget, not a resource that runs out for good.
   */
  herbCapMax: 2,
} as const;

/**
 * Poison (Combat Bible §6, Thanh Mộc): exposure builds a meter; full, he is poisoned and loses health over time. Poison
 * never kills by itself (it stops at 1 HP): it weakens, the fight is what kills (Phase 3 decision). Antidote herbs
 * cure it; Q takes an antidote first while poisoned. The meter drains once exposure stops.
 */
export const POISON = {
  max: 100,
  durationMs: 8000,
  dps: 3,
  drainDelay: 1200,
  drainPerSec: 14,
  antidoteHeal: 10,
  antidoteCapMax: 2,
} as const;

export interface AttackDef {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  stamina: number;
  reach: number; // px in front of the body edge
  height: number;
  guardBreak: boolean;
  lunge: number; // forward velocity during startup/active
  /** Poise damage to bosses. Defaults to `damage` for guard-breaking attacks, 0 otherwise. */
  poise?: number;
}

/** Reach below is for the sword; the kit's `reachDelta` is added when a hit is made (Player.currentHit). */
export const LIGHT: AttackDef[] = [
  { name: "light1", startup: f(5), active: f(4), recovery: f(10), damage: 10, stamina: 6, reach: 36, height: 20, guardBreak: false, lunge: 30 },
  { name: "light2", startup: f(5), active: f(4), recovery: f(10), damage: 10, stamina: 6, reach: 36, height: 20, guardBreak: false, lunge: 30 },
  { name: "light3", startup: f(7), active: f(5), recovery: f(16), damage: 16, stamina: 8, reach: 40, height: 24, guardBreak: false, lunge: 60 },
];

/** Ảnh Vệ's string (twin blades): quicker in and out, lighter hits; the third hit lands builds Ảnh. */
export const LIGHT_ANH: AttackDef[] = [
  { name: "anh1", startup: f(4), active: f(3), recovery: f(8), damage: 8, stamina: 5, reach: 36, height: 20, guardBreak: false, lunge: 40 },
  { name: "anh2", startup: f(4), active: f(3), recovery: f(8), damage: 8, stamina: 5, reach: 36, height: 20, guardBreak: false, lunge: 40 },
  { name: "anh3", startup: f(5), active: f(4), recovery: f(12), damage: 12, stamina: 6, reach: 38, height: 24, guardBreak: false, lunge: 70 },
];

/**
 * Ảnh Vệ (Bible §3). Ảnh: up to 3, from perfect dodges and from a full string that lands. A perfect dodge also opens a
 * short crit window. Ảnh Kích (Blink Strike): J during a dodge dashes on through, cutting everything on the way, and
 * turns to face back; i-frames throughout.
 */
export const ANH = {
  max: 3,
  critWindow: 900,
  critMultiplier: 1.5,
  blink: { name: "blink", startup: 0, active: 160, recovery: 140, damage: 26, stamina: 0, reach: 70, height: 28, guardBreak: false, lunge: 0, poise: 20 } as AttackDef,
  blinkSpeed: 460,
} as const;

/** Heavy attack: chargeable, 2 levels (Bible §2). */
export const HEAVY = {
  levelTimes: [0, 300, 600], // hold time to reach level 0/1/2 (was 400/900: too slow for any opening, playtest I-09)
  damage: [22, 32, 44],
  stamina: [18, 24, 30],
  def: { name: "heavy", startup: f(10), active: f(5), recovery: f(18), damage: 0, stamina: 0, reach: 44, height: 28, guardBreak: true, lunge: 80 } as AttackDef,
  chargeMoveFactor: 0.25,
} as const;

/**
 * Air slash (Phase 2; playtest I-10 / review A5): one overhead chop per jump, aimed forward and down. It keeps the
 * jump's momentum (no lunge) and resets on landing, so jumping a charge can end in a hit without becoming a juggle.
 */
export const AIR_SLASH: AttackDef = { name: "air", startup: f(4), active: f(5), recovery: f(12), damage: 10, stamina: 8, reach: 30, height: 34, guardBreak: false, lunge: 0 };

/** Riposte: Kiếm Khách signature (parry → heavy counter). Free after a parry (review D5): it costs no Thế. */
export const RIPOSTE: AttackDef = { name: "riposte", startup: f(4), active: f(5), recovery: f(14), damage: 40, stamina: 0, reach: 44, height: 28, guardBreak: true, lunge: 120 };
/** After a parry: the Riposte window (Kiếm Khách), or the "strike now" cue for the universal kit. */
export const RIPOSTE_WINDOW = 650;

/**
 * Phá Thế (Kiếm Khách, review D5): from a held guard, K spends 2 Thế on a guard-breaking strike whose poise damage
 * staggers a boss outright, even mid-windup (not mid-charge). This is what banked Thế is for.
 */
export const PHA_THE: AttackDef = { name: "phaThe", startup: f(8), active: f(5), recovery: f(20), damage: 30, stamina: 10, reach: 44, height: 28, guardBreak: true, lunge: 100, poise: 60 };
export const PHA_THE_COST = 2;

export const DODGE = {
  duration: 230,
  iframes: f(10),
  perfectWindow: f(4),
  speed: 230,
  stamina: 20,
  recoveryLock: 80,
} as const;

/** Parry: the window is the kit's (8 frames universal; Kiếm Khách 12, Bible §2–3), read when the parry is judged. */
export const PARRY = {
  recovery: 260,
  stamina: 8,
} as const;

/**
 * Block (review D6): keep holding the parry key after the parry window and he guards. A blocked parryable hit deals
 * chip damage and drains stamina; if the drain would empty stamina, the guard breaks and the hit lands in full.
 * Unparryable attacks (Nanh Rễ's charge, root spikes) are also unblockable. Stamina does not regenerate while guarding.
 */
export const BLOCK = {
  chip: 0.25,
  staminaPerDamage: 1.6,
  pushback: 0.35, // fraction of the hit's knockback
  releaseRecovery: 120,
} as const;

export const ENEMY_FLASH = 90;
