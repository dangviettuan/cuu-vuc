/**
 * Seeded random numbers for gameplay decisions (boss move choice, charge follow-ups).
 * With `?seed=N` a run is reproducible, so a playtest finding can be replayed. Presentation randomness (dust, motes,
 * leaves) keeps using Math.random: it never changes gameplay.
 */
export class Rng {
  private s: number;
  constructor(readonly seed: number) { this.s = seed >>> 0; }
  /** Uniform in [0, 1). mulberry32. */
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

/** The run's seed: `?seed=N` if given, otherwise random (and shown in the debug overlay so it can be reused). */
export function runSeed(): number {
  const q = typeof location === "undefined" ? null : new URLSearchParams(location.search).get("seed");
  const n = q === null ? NaN : Number(q);
  return Number.isFinite(n) ? n >>> 0 : (Math.random() * 2 ** 32) >>> 0;
}
