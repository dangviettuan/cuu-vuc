/**
 * Combat tuning for the greybox, from docs/05-gameplay/combat-class-bible-v0.1.md.
 * The Bible specifies frames at 60 FPS; values here are milliseconds (1 frame ≈ 16.67 ms).
 */
export const FRAME = 1000 / 60;
export const f = (frames: number): number => Math.round(frames * FRAME);

export const VIEW = { width: 640, height: 360 } as const;
export const TILE = 16;

export const WORLD = {
  width: 2200,
  height: 360,
  groundY: 304,
  gravity: 900,
} as const;

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
}

export const LIGHT: AttackDef[] = [
  { name: "light1", startup: f(5), active: f(4), recovery: f(10), damage: 10, stamina: 6, reach: 20, height: 16, guardBreak: false, lunge: 30 },
  { name: "light2", startup: f(5), active: f(4), recovery: f(10), damage: 10, stamina: 6, reach: 20, height: 16, guardBreak: false, lunge: 30 },
  { name: "light3", startup: f(7), active: f(5), recovery: f(16), damage: 16, stamina: 8, reach: 24, height: 18, guardBreak: false, lunge: 60 },
];

/** Heavy attack: chargeable, 2 levels (Bible §2). */
export const HEAVY = {
  levelTimes: [0, 400, 900], // hold time to reach level 0/1/2
  damage: [22, 32, 44],
  stamina: [18, 24, 30],
  def: { name: "heavy", startup: f(10), active: f(5), recovery: f(18), damage: 0, stamina: 0, reach: 26, height: 22, guardBreak: true, lunge: 80 } as AttackDef,
  chargeMoveFactor: 0.25,
} as const;

/** Riposte: Kiếm Khách signature (parry → heavy counter). */
export const RIPOSTE: AttackDef = { name: "riposte", startup: f(4), active: f(5), recovery: f(14), damage: 40, stamina: 0, reach: 26, height: 22, guardBreak: true, lunge: 120 };
export const RIPOSTE_WINDOW = 650;

export const DODGE = {
  duration: 230,
  iframes: f(10),
  perfectWindow: f(4),
  speed: 230,
  stamina: 20,
  recoveryLock: 80,
} as const;

/** Kiếm Khách parry window is wider (12 frames) than the universal 8 (Bible §2–3). */
export const PARRY = {
  window: f(12),
  recovery: 260,
  stamina: 8,
} as const;

export const ENEMY_FLASH = 90;
