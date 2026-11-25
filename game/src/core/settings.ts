/**
 * Player settings, kept apart from the save (they belong to the player, not to a playthrough).
 * Stored in localStorage under `cuu-vuc-settings`, versioned. Anything unreadable falls back to the defaults.
 */
import type { BindingOverrides } from "./input";

export type Difficulty = "story" | "standard" | "hard";

export interface Settings {
  v: 1;
  /** Master volume, 0–1. */
  volume: number;
  /** Screen-shake strength, 0–1 (0 turns it off). */
  shake: number;
  /** Reduced flashes: hit flashes darken instead of flashing white, and the Canvas additive glow is skipped. */
  reduceFlashes: boolean;
  /** Combat & Class Bible §10. The narrative is identical across all three. */
  difficulty: Difficulty;
  /** Integer scaling with letterboxing (sharp pixels) instead of fit-to-window. */
  pixelPerfect: boolean;
  /** The two-line controls strip at the bottom of the screen (the signs and the pause menu also teach the keys). */
  showControls: boolean;
  bindings: BindingOverrides;
}

const KEY = "cuu-vuc-settings";
export const DEFAULT_SETTINGS: Settings = { v: 1, volume: 0.8, shake: 1, reduceFlashes: false, difficulty: "standard", pixelPerfect: true, showControls: true, bindings: {} };

type Listener = (s: Settings) => void;
let current: Settings = load();
const listeners: Listener[] = [];

function load(): Settings {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const s = JSON.parse(raw) as Partial<Settings>;
    if (s.v !== 1) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...s, bindings: s.bindings ?? {} };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function settings(): Readonly<Settings> { return current; }

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch, v: 1 };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* storage unavailable: settings last for this session */ }
  for (const f of listeners) f(current);
}

export function onSettings(fn: Listener): () => void {
  listeners.push(fn);
  return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
}
