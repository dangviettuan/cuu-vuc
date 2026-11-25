/**
 * Enemy tuning tables: every number the enemy AI uses, in one place (review §3.6). The AI code in src/enemies.ts reads
 * these; difficulty multipliers (src/data/difficulty.ts) apply on top. Times are ms, speeds px/s, distances px.
 * Comments note the playtest finding behind a value where there is one (PLAYTEST_REPORT, REVIEW-2026-11-23).
 */
export const BOAR = {
  hp: 60, // a riposte (40) no longer one-shots it (I-04)
  damage: 15,
  knockback: 220,
  /** Notice windup: the first (teaching) boar uses a longer one (stage data overrides it). */
  tellMs: 600,
  /** Leash (cloud playtest: boars followed the player into the boss arena). */
  leash: 50,
  noticeRange: 120,
  chargeLimit: 140,
  sight: 170,
  /** Too close to charge: back off first, so every charge starts from a readable distance. */
  backOff: 80,
  walkSpeed: 30,
  homeSpeed: 60,
  backOffSpeed: 80,
  chargeSpeed: 210,
  chargeMaxMs: 1100,
  /** Dodged through: it skids to a stop just past the player (I-04). */
  skidNear: 26,
  skidPast: 18,
  stunMs: 800,
  /** A parried boar is stunned this long (shorter than a dodge skid: parry is the safer answer). */
  parriedStunMs: 400,
  hurtStunMs: 400,
} as const;

export const NANH_RE = {
  hp: 260, // tuned for the classless Prologue kit (ADR-0010; was 320 with the Riposte)
  kbResist: 4,
  /** Phase thresholds by HP ratio: above the first is phase 1, above the second phase 2, else phase 3. */
  phaseAt: [0.55, 0.22],
  /** Per-phase speed factor on telegraphs and idle time (faster as she weakens). Index 0 = phase 1. */
  phaseSpeed: [1, 0.8, 0.7],
  wakeHoldMs: 700,
  idleMs: 650,
  walkSpeed: 45,
  keepDistance: 80,
  /** Distances that pick her move set. */
  nearDist: 75,
  farDist: 150,
  charge: { tellMs: 700, speed: [260, 260, 300], overshoot: 90, maxMs: 1600, damage: 22, knockback: 260, arenaMargin: 40, doubleInPhase3: true },
  /** Phase 2+: a charge sometimes whips into a quick tusk sweep, so "dodge, then combo" is not free (I-01). */
  swipe: { tellMs: 450, activeMs: 170, damage: 22, knockback: 200, followUpChance: 0.45, glintAt: 0.55 },
  stomp: { tellMs: 450, eruptAt: 600, roots: [3, 5, 5], spread: [40, 34, 34], flankInPhase3: 70, rootWarnMs: 520, rootStaggerMs: 40, rootDamage: 14, recoverAfterMs: 160 },
  /** Recovery after a charge or stomp, by phase (I-01: was 750/750/450). */
  recoverMs: [600, 450, 320],
  stagger: { poise: 60, ms: 1100 },
  /** Anti-repeat (review §3.5): never the same move three times in a row. */
  maxRepeat: 2,
} as const;
