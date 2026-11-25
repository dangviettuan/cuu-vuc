/**
 * Difficulty modes (Combat & Class Bible §10): Story, Standard and Hard. **The narrative is identical across all three.**
 * Story widens the timing windows and softens damage; Hard narrows the windows and hits harder. Telegraphs stay
 * readable on every mode ("readable, then punishing": Hard makes the punishment harsher, not the tell shorter).
 */
import { f } from "../tuning";
import type { Difficulty } from "../core/settings";

export interface DifficultyDef {
  /** Multiplier on damage the player takes. */
  damageTaken: number;
  /** Multiplier on enemy and boss max HP. */
  enemyHp: number;
  /** Added to the parry window and to the dodge's i-frames (ms). */
  windowBonus: number;
  /** Multiplier on enemy windup (telegraph) durations. */
  telegraph: number;
}

export const DIFFICULTY: Record<Difficulty, DifficultyDef> = {
  story: { damageTaken: 0.6, enemyHp: 0.85, windowBonus: f(4), telegraph: 1.15 },
  standard: { damageTaken: 1, enemyHp: 1, windowBonus: 0, telegraph: 1 },
  hard: { damageTaken: 1.3, enemyHp: 1.15, windowBonus: -f(2), telegraph: 1 },
};
