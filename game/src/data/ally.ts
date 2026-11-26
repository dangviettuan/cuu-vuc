/**
 * Diệp as an AI ally (Ch. I–IV, DB N6): her tuning. She fights beside him without taking the fight from him: her hits
 * are light and slow next to his (a sword light is 10), she gives way to every tell, and she cannot die (knocked down,
 * she gets up). Enemies keep their eyes on him. Times in ms, distances in px.
 */
export const DIEP = {
  hp: 80,
  runSpeed: 112,
  /** far behind: she runs faster to catch up; very far (a cut, a teleport): she is placed beside him */
  catchUpSpeed: 150,
  catchUpBeyond: 130,
  teleportBeyond: 420,
  /** where she keeps to, behind him, when nothing is near */
  followGap: 34,
  /** she joins a fight when an enemy is this close to him */
  engageRange: 170,
  /** the distance she holds from her target: the spear's reach */
  standOff: 50,
  /** an enemy winding up or attacking this close: she backs off for `retreatMs` */
  retreatRange: 84,
  retreatMs: 450,
  thrust: { windup: 300, active: 120, recovery: 380, damage: 7, reach: 46, poise: 6 },
  sweep: { windup: 380, active: 160, recovery: 420, damage: 6, reach: 38, poise: 10 },
  /** the time between her attacks */
  cooldownMs: 1500,
  hurtMs: 300,
  /** knocked down, she is out this long, then back up with half her health */
  downMs: 6000,
} as const;
