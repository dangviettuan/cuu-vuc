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
  /** Độc Đằng: damage taken is multiplied by this unless it is open (stunned or staggered) */
  armor?: number;
  /** a story beat on entering a phase (Mộc Giác's recognition): it stops for `ms` holding `frame`, then fights on */
  phaseBeat?: Record<number, { ms: number; frame: string }>;
  /** a fixed point it never leaves (Độc Đằng, rooted between two trunks) */
  anchored?: boolean;
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

/**
 * Mini-boss Độc Đằng (I-4), the poison vine colossus: a mass of vine as tall as three men, rooted between two trunks
 * (prose Ch. 5). Its core is armoured by the vines (a third of each hit gets through) until a parried lash wraps a
 * trunk and leaves it open: the fight teaches cutting at the right moment, and poison (spore gobs, a bloom of mist).
 * A low lash must be jumped. It never moves, so its spores reach the whole arena (probe: out of its lash's reach, it
 * otherwise did nothing).
 */
export const DOC_DANG: FoeDef = {
  id: "docDang", hp: 200, body: [60, 110, 130, 50], boss: true, anchored: true, armor: 0.35, kbResist: 99,
  frames: { idle: ["dd_idle0", "dd_idle1"], walk: ["dd_idle0", "dd_idle1"], hurt: "dd_hurt", stun: "dd_open", down: "dd_down" },
  walkSpeed: 0, keepDist: 0, sight: 700, idleMs: 900, stunMs: 1500, parriedStunMs: 1900, poiseMax: 90, staggerMs: 1500,
  phaseAt: [0.5], phaseSpeed: [1, 0.8], wakeHoldMs: 700, maxRepeat: 2,
  moves: [
    { id: "lash", range: [0, 160], weight: 1, tell: 650, active: 220, recovery: 600, box: [-20, 132, 18, 16], damage: 16, knockback: 230, parryable: true,
      cue: "tellSwipe", frames: fr("dd", "lashW", "lashA", "lashR") },
    { id: "low", range: [0, 160], weight: 0.8, tell: 700, active: 240, recovery: 620, box: [-20, 132, 0, 12], damage: 14, knockback: 180, parryable: false,
      cue: "tellStomp", frames: fr("dd", "lowW", "lowA", "lashR") },
    { id: "spores", range: [0, 700], weight: 0.7, tell: 850, active: 200, recovery: 900, damage: 6, knockback: 60, parryable: false, poison: 45,
      shot: { kind: "spore", speed: 120, y: 90, lift: 230, gravity: 420, count: 3 }, cue: "tellSpore", frames: fr("dd", "sporeW", "sporeA", "idle0") },
    { id: "bloom", range: [0, 110], weight: 0.6, minPhase: 2, tell: 900, active: 160, recovery: 1200, damage: 0, knockback: 0, parryable: false,
      burst: true, cue: "tellSpore", frames: fr("dd", "sporeW", "sporeA", "idle1") },
  ],
};

/**
 * Mini-boss Hùng (I-6), the cell's squad leader: a burn-scarred man with a Ty-alloy blade who reads parries. A cut held
 * a beat longer when the hero is already guarding (parry the swing, not the windup); a three-cut string; a lunge from
 * range; a kick that goes through a block; a net. Beaten, he escapes into the trench (prose Ch. 6).
 */
export const HUNG: FoeDef = {
  id: "hung", hp: 220, body: [10, 44, 31, 28], boss: true,
  frames: { idle: ["hung_idle0", "hung_idle1"], walk: ["hung_walk0", "hung_walk1", "hung_walk2", "hung_walk3"], hurt: "hung_hurt", stun: "hung_stun", down: "hung_down" },
  walkSpeed: 78, keepDist: 58, sight: 420, idleMs: 520, stunMs: 600, parriedStunMs: 800, poiseMax: 70, staggerMs: 1000,
  phaseAt: [0.5], phaseSpeed: [1, 0.85], wakeHoldMs: 700, maxRepeat: 2, punishHeal: "lunge",
  moves: [
    { id: "cut", range: [0, 68], weight: 1, tell: 420, active: 140, recovery: 420, box: [-2, 32, 12, 26], damage: 14, knockback: 170, parryable: true,
      feintOnGuard: 380, motion: { during: "active", vx: 60 }, cue: "tellBlade", frames: fr("hung", "cutW", "cutA", "cutR") },
    { id: "string", range: [0, 68], weight: 0.8, tell: 380, active: 130, recovery: 140, box: [-2, 32, 12, 26], damage: 10, knockback: 120, parryable: true,
      chain: "string2", cue: "tellBlade", frames: fr("hung", "cutW", "cutA", "cutR") },
    { id: "string2", range: [0, 90], weight: 0, chainOnly: true, tell: 300, active: 130, recovery: 140, box: [-2, 32, 14, 26], damage: 10, knockback: 120, parryable: true,
      chain: "string3", frames: fr("hung", "cutR", "cutA2", "cutR") },
    { id: "string3", range: [0, 110], weight: 0, chainOnly: true, tell: 360, active: 180, recovery: 620, box: [-2, 40, 10, 26], damage: 16, knockback: 200, parryable: true,
      motion: { during: "active", vx: 140 }, frames: fr("hung", "thrustW", "thrustA", "cutR") },
    { id: "kick", range: [0, 50], weight: 0.6, tell: 300, active: 120, recovery: 520, box: [-4, 22, 8, 24], damage: 8, knockback: 320, parryable: false,
      cue: "tellAntler", frames: fr("hung", "kickW", "kickA", "cutR") },
    { id: "lunge", range: [70, 170], weight: 0.8, tell: 520, active: 240, recovery: 520, box: [-4, 34, 12, 26], damage: 16, knockback: 220, parryable: true,
      motion: { during: "active", vx: 260 }, cue: "tellBlade", frames: fr("hung", "thrustW", "thrustA", "cutR") },
    { id: "net", range: [100, 240], weight: 0.5, tell: 520, active: 160, recovery: 600, damage: 0, knockback: 0, parryable: false, snare: 900,
      shot: { kind: "net", speed: 250, y: 34, lift: 100, gravity: 420 }, cue: "tellThrow", frames: fr("hung", "throwW", "throwA", "cutR") },
  ],
};

/**
 * The boss Mộc Giác (I-5): the vast antlered guardian of Thanh Mộc's Mạch, antlers that are living trees (one green,
 * one bare and black), hide cracked with dark veins (spec §8; prose Ch. 5). It is after what is in his chest.
 * 1. Guardian: antler sweeps (parryable, as in the prose), a charge across the grove, roots under him.
 * 2. Wounded Mạch: its veins burst into poison mist; the roots come thicker.
 * 3. Recognition: it stops, lowers its head to his chest (a beat), then fights faster, every blow at his chest.
 * It dies of its wounds and the Linh Suy, not a killing blow: beaten down, it collapses.
 */
export const MOC_GIAC: FoeDef = {
  id: "mocGiac", hp: 420, body: [150, 100, 107, 170], boss: true, kbResist: 8,
  frames: { idle: ["mg_idle0", "mg_idle1"], walk: ["mg_walk0", "mg_walk1", "mg_walk2", "mg_walk3"], hurt: "mg_hurt", stun: "mg_stun", down: "mg_down" },
  walkSpeed: 50, keepDist: 120, sight: 700, idleMs: 760, stunMs: 900, parriedStunMs: 950, poiseMax: 120, staggerMs: 1600,
  phaseAt: [0.6, 0.3], phaseSpeed: [1, 0.85, 0.7], wakeHoldMs: 900, maxRepeat: 2, punishHeal: "sweep",
  phaseBeat: { 3: { ms: 3200, frame: "mg_bow" } },
  moves: [
    { id: "sweep", range: [0, 180], weight: 1, tell: 720, active: 240, recovery: 700, box: [-60, 150, 0, 44], damage: 20, knockback: 240, parryable: true,
      cue: "tellAntler", frames: fr("mg", "low", "sweep", "low") },
    { id: "charge", range: [150, 520], weight: 0.8, tell: 850, active: 900, recovery: 900, box: [-20, 60, 0, 70], damage: 22, knockback: 280, parryable: false,
      motion: { during: "active", vx: 260 }, cue: "tellCharge", frames: fr("mg", "low", "charge", "idle1") },
    { id: "roots", range: [0, 620], weight: 0.8, tell: 650, active: 200, recovery: 700, damage: 0, knockback: 0, parryable: false,
      roots: { n: 3, spread: 46, warn: 560, damage: 14 }, cue: "tellStomp", frames: fr("mg", "rear", "stomp", "idle0") },
    { id: "bleed", range: [0, 620], weight: 0.6, minPhase: 2, tell: 900, active: 200, recovery: 900, damage: 0, knockback: 0, parryable: false,
      burst: true, cue: "tellSpore", frames: fr("mg", "bleed", "bleed", "idle0") },
    { id: "roots2", range: [0, 620], weight: 0.7, minPhase: 2, tell: 600, active: 200, recovery: 650, damage: 0, knockback: 0, parryable: false,
      roots: { n: 5, spread: 38, warn: 500, damage: 14 }, cue: "tellStomp", frames: fr("mg", "rear", "stomp", "idle0") },
    { id: "fury", range: [0, 200], weight: 1, minPhase: 3, tell: 520, active: 240, recovery: 240, box: [-60, 150, 0, 44], damage: 20, knockback: 240, parryable: true,
      chain: "furyRoots", cue: "tellAntler", frames: fr("mg", "low", "sweep", "low") },
    { id: "furyRoots", range: [0, 620], weight: 0, chainOnly: true, tell: 380, active: 200, recovery: 760, damage: 0, knockback: 0, parryable: false,
      roots: { n: 3, spread: 40, warn: 460, damage: 14 }, frames: fr("mg", "rear", "stomp", "idle0") },
  ],
};

export const FOES = { rootDeer: ROOT_DEER, greatCat: GREAT_CAT, sporePod: SPORE_POD, operative: OPERATIVE, docDang: DOC_DANG, hung: HUNG, mocGiac: MOC_GIAC } satisfies Record<string, FoeDef>;
export type FoeId = keyof typeof FOES;
