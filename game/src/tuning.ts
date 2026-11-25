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
 * Combat kits (ADR-0010, review D2). Canon: the Prologue has no class; he fights with the brush-knife and the
 * universal kit (8-frame parry, block). Kiếm Khách (12-frame parry, Thế, Riposte, Phá Thế) arrives in Ch. I.
 * The greybox defaults to the canon Prologue kit; `?kit=kiem` loads the Kiếm Khách kit for testing that loop.
 */
export interface Kit {
  id: "prologue" | "kiem";
  weapon: "knife" | "sword";
  parryWindow: number;
  /** Added to every attack's reach (px): the brush-knife is shorter than the sword. */
  reachDelta: number;
  /** Kiếm Khách only: Thế pips from parries, the Riposte, and Phá Thế. */
  classKit: boolean;
}
export const KITS: Record<Kit["id"], Kit> = {
  prologue: { id: "prologue", weapon: "knife", parryWindow: f(8), reachDelta: -8, classKit: false },
  kiem: { id: "kiem", weapon: "sword", parryWindow: f(12), reachDelta: 0, classKit: true },
};
function resolveKit(): Kit {
  const q = typeof location === "undefined" ? null : new URLSearchParams(location.search).get("kit");
  return q === "kiem" ? KITS.kiem : KITS.prologue;
}
export const KIT: Kit = resolveKit();

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

const R = KIT.reachDelta;
export const LIGHT: AttackDef[] = [
  { name: "light1", startup: f(5), active: f(4), recovery: f(10), damage: 10, stamina: 6, reach: 36 + R, height: 20, guardBreak: false, lunge: 30 },
  { name: "light2", startup: f(5), active: f(4), recovery: f(10), damage: 10, stamina: 6, reach: 36 + R, height: 20, guardBreak: false, lunge: 30 },
  { name: "light3", startup: f(7), active: f(5), recovery: f(16), damage: 16, stamina: 8, reach: 40 + R, height: 24, guardBreak: false, lunge: 60 },
];

/** Heavy attack: chargeable, 2 levels (Bible §2). */
export const HEAVY = {
  levelTimes: [0, 300, 600], // hold time to reach level 0/1/2 (was 400/900: too slow for any opening, playtest I-09)
  damage: [22, 32, 44],
  stamina: [18, 24, 30],
  def: { name: "heavy", startup: f(10), active: f(5), recovery: f(18), damage: 0, stamina: 0, reach: 44 + R, height: 28, guardBreak: true, lunge: 80 } as AttackDef,
  chargeMoveFactor: 0.25,
} as const;

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

/** Parry: the universal window is 8 frames; Kiếm Khách's is 12 (Bible §2–3). Set by the kit. */
export const PARRY = {
  window: KIT.parryWindow,
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
