/**
 * Chapter I enemies as data (Phase 3): each is a body, a few drawings and a table of moves, read by the one fighter AI
 * in src/foe.ts. Spec: docs/04-chapters/chapter-01-thanh-moc-v0.1.md §7; Combat Bible §1 (readable, then punishing),
 * §9 (no enemy is evil decoration; humans retreat). Times in ms, distances in px, speeds px/s.
 *
 * A move's `box` is [front offset, width, height above the feet, height]: the strike's area in front of the body.
 * Every enemy's moves must cover its `keepDist` (probe: a deer whose ranges left a gap there stood idle forever).
 * `parryable: false` moves (rushes, nets, spores) must be dodged or jumped; they are also unblockable (Bible §2).
 */
import type { EnemyEvent } from "../enemies";

export type ShotKind = "net" | "spore";

export interface FoeMove {
  id: string;
  /** distance band (body centre to the hero) in which this move may be chosen */
  range: [number, number];
  weight: number;
  minPhase?: number;
  /** only ever reached through another move's `chain` */
  chainOnly?: boolean;
  tell: number; active: number; recovery: number;
  box?: [number, number, number, number];
  damage: number; knockback: number; parryable: boolean;
  poison?: number;
  snare?: number;
  motion?: { during: "tell" | "active"; vx: number };
  leap?: { vy: number; vx: number };
  shot?: { kind: ShotKind; speed: number; y?: number; lift?: number; gravity?: number; count?: number };
  roots?: { n: number; spread: number; warn: number; damage: number };
  /** a burst at the strike (spore pods): the stage makes a poison cloud there */
  burst?: boolean;
  cue?: EnemyEvent;
  frames: { tell: string; active: string; recovery: string };
  chain?: string;
  /** Hùng: if the hero is already guarding near the end of the tell, the strike waits this much longer (once) */
  feintOnGuard?: number;
}

export interface FoeDef {
  id: string;
  hp: number;
  /** arcade body: width, height, offset x, offset y in the frame */
  body: [number, number, number, number];
  frames: { idle: string[]; walk: string[]; hurt: string; stun: string; down: string };
  walkSpeed: number;
  /** the distance it likes to hold from the hero */
  keepDist: number;
  sight: number;
  idleMs: number;
  /** how far past its territory it will follow */
  leash?: number;
  kbResist?: number;
  stunMs: number;
  parriedStunMs: number;
  poiseMax?: number;
  staggerMs?: number;
  phaseAt?: number[];
  phaseSpeed?: number[];
  maxRepeat?: number;
  /** humans: at this share of health they break off and run (they don't die) */
  fleeAt?: number;
  /** beasts that bolt when beaten instead of dying */
  flees?: boolean;
  fleeSpeed?: number;
  boss?: boolean;
  wakeHoldMs?: number;
  /** a move it answers a heal in reach with */
  punishHeal?: string;
  moves: FoeMove[];
}

const fr = (p: string, t: string, a: string, r: string) => ({ tell: `${p}_${t}`, active: `${p}_${a}`, recovery: `${p}_${r}` });

/** Thú hóa rễ: a deer with Linh Suy roots through its back. Antlers forward (parry them), or a rush (dodge it). */
export const ROOT_DEER: FoeDef = {
  id: "rootDeer", hp: 70, body: [24, 26, 16, 22],
  frames: { idle: ["deer_idle0", "deer_idle1"], walk: ["deer_walk0", "deer_walk1", "deer_walk2", "deer_walk3"], hurt: "deer_hurt", stun: "deer_stun", down: "deer_down" },
  walkSpeed: 42, keepDist: 80, sight: 210, idleMs: 750, leash: 70, stunMs: 700, parriedStunMs: 700,
  moves: [
    { id: "antler", range: [0, 100], weight: 1, tell: 520, active: 180, recovery: 520, box: [-4, 30, 4, 30], damage: 14, knockback: 200, parryable: true,
      motion: { during: "active", vx: 150 }, cue: "tellAntler", frames: fr("deer", "low", "lunge", "low") },
    { id: "rush", range: [90, 230], weight: 1, tell: 680, active: 760, recovery: 700, box: [-18, 36, 0, 28], damage: 16, knockback: 240, parryable: false,
      motion: { during: "active", vx: 230 }, cue: "tellCharge", frames: fr("deer", "paw", "run", "idle1") },
  ],
};

/** A great cat, rooted at the shoulder: it keeps its distance, pounces (parryable in the air), claws twice up close. */
export const GREAT_CAT: FoeDef = {
  id: "greatCat", hp: 60, body: [26, 16, 11, 14],
  frames: { idle: ["cat_idle0", "cat_idle1"], walk: ["cat_walk0", "cat_walk1", "cat_walk2", "cat_walk3"], hurt: "cat_hurt", stun: "cat_stun", down: "cat_down" },
  walkSpeed: 70, keepDist: 100, sight: 230, idleMs: 620, leash: 80, stunMs: 650, parriedStunMs: 800,
  moves: [
    { id: "pounce", range: [60, 180], weight: 1, tell: 460, active: 520, recovery: 560, box: [-10, 30, 0, 22], damage: 16, knockback: 200, parryable: true,
      leap: { vy: 230, vx: 210 }, cue: "tellPounce", frames: fr("cat", "crouch", "leap", "crouch") },
    { id: "claw", range: [0, 55], weight: 1, tell: 320, active: 110, recovery: 160, box: [-4, 24, 6, 20], damage: 9, knockback: 140, parryable: true,
      chain: "claw2", cue: "tellSwipe", frames: fr("cat", "paw", "claw", "idle0") },
    { id: "claw2", range: [0, 70], weight: 0, chainOnly: true, tell: 260, active: 110, recovery: 520, box: [-4, 24, 6, 20], damage: 9, knockback: 160, parryable: true,
      frames: fr("cat", "paw", "claw", "crouch") },
    { id: "back", range: [0, 45], weight: 0.5, tell: 90, active: 360, recovery: 200, damage: 0, knockback: 0, parryable: false,
      motion: { during: "active", vx: -190 }, frames: fr("cat", "crouch", "walk1", "idle0") },
  ],
};

/** Độc thảo: a spore pod rooted to the ground. Near it, it swells and bursts into a poison cloud; cut it first. */
export const SPORE_POD: FoeDef = {
  id: "sporePod", hp: 20, body: [14, 16, 4, 6],
  frames: { idle: ["pod_idle0", "pod_idle1"], walk: ["pod_idle0", "pod_idle1"], hurt: "pod_hurt", stun: "pod_spent", down: "pod_dead" },
  walkSpeed: 0, keepDist: 0, sight: 90, idleMs: 300, kbResist: 99, stunMs: 400, parriedStunMs: 400,
  moves: [
    { id: "burst", range: [0, 80], weight: 1, tell: 760, active: 120, recovery: 3200, damage: 0, knockback: 0, parryable: false,
      burst: true, cue: "tellSpore", frames: fr("pod", "swell", "burst", "spent") },
  ],
};

/**
 * Người cắt mạch: one of Cương's operatives, the first human enemies (Ch. I §7). Disciplined: a parryable cut up close;
 * a thrown net at range that holds him if it lands (dodge or jump it). Beaten down to a third, he breaks off and runs.
 */
export const OPERATIVE: FoeDef = {
  id: "operative", hp: 70, body: [10, 44, 31, 28],
  frames: { idle: ["op_idle0", "op_idle1"], walk: ["op_walk0", "op_walk1", "op_walk2", "op_walk3"], hurt: "op_hurt", stun: "op_stun", down: "op_down" },
  walkSpeed: 60, keepDist: 64, sight: 240, idleMs: 700, leash: 90, stunMs: 600, parriedStunMs: 750, fleeAt: 0.3, fleeSpeed: 210,
  moves: [
    { id: "cut", range: [0, 62], weight: 1, tell: 430, active: 140, recovery: 480, box: [-2, 30, 12, 26], damage: 12, knockback: 160, parryable: true,
      motion: { during: "active", vx: 60 }, cue: "tellBlade", frames: fr("op", "cutW", "cutA", "cutR") },
    { id: "net", range: [80, 210], weight: 0.8, tell: 560, active: 160, recovery: 620, damage: 0, knockback: 0, parryable: false, snare: 1100,
      shot: { kind: "net", speed: 230, y: 34, lift: 110, gravity: 420 }, cue: "tellThrow", frames: fr("op", "throwW", "throwA", "cutR") },
    { id: "step", range: [0, 40], weight: 0.4, tell: 80, active: 300, recovery: 160, damage: 0, knockback: 0, parryable: false,
      motion: { during: "active", vx: -150 }, frames: fr("op", "cutR", "walk1", "idle0") },
  ],
};

export const FOES = { rootDeer: ROOT_DEER, greatCat: GREAT_CAT, sporePod: SPORE_POD, operative: OPERATIVE } satisfies Record<string, FoeDef>;
export type FoeId = keyof typeof FOES;
