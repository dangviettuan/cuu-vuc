/**
 * Save data (one slot for the greybox), versioned and migrated on load.
 *
 * What is saved, and when (ADR-0006: Mạch shrines and stations are the save points):
 * - **Resting at a checkpoint** saves the checkpoint, the herb pouch and the one-time world changes (`taken`).
 * - **Choices** save their flags immediately, so a flag is never lost to a crash before the next rest.
 * - **Name entry** creates the save (ADR-0004: the protagonist's name is player-defined, Unicode).
 *
 * Stored in localStorage under `cuu-vuc-save`. The pre-save build wrote flags to `cuu-vuc-flags`; they are imported.
 */
import { FlagName, FlagValue, checkFlag } from "./flags";
import { isQuick } from "./mode";

export interface SaveData {
  v: 1;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Stage id (src/data/stages). */
  stage: string;
  /** Checkpoint id within the stage, or null for the stage start. */
  checkpoint: string | null;
  herbCap: number;
  /** Ids of one-time world objects already used up: picked herbs, cleared brush. */
  taken: string[];
  flags: Partial<Record<FlagName, FlagValue>>;
  /** Stages finished (their boss beaten and choice made). */
  done: string[];
  /** Key items (Prologue: the half Mạch Ấn, S5). */
  items: string[];
  /** Antidote slots found (Ch. I), refilled at checkpoints like the herb pouch. */
  antidoteCap?: number;
  /** Mạch Ấn absorbed (Ch. I: Rễ Giữ, from Mộc Giác). Combat Bible §5. */
  machAn?: string[];
}

/** Quick mode (playtest tools) keeps its throwaway save apart from the player's. */
const KEY = isQuick() ? "cuu-vuc-save-quick" : "cuu-vuc-save";
const LEGACY_FLAGS = "cuu-vuc-flags";
export const NAME_MAX = 16;

let current: SaveData | null = null;

export function newSave(name: string, stage: string): SaveData {
  const now = Date.now();
  current = { v: 1, name: cleanName(name), createdAt: now, updatedAt: now, stage, checkpoint: null, herbCap: 0, taken: [], flags: {}, done: [], items: [] };
  write();
  return current;
}

/** Trims, collapses spaces, strips control characters; keeps any script (ADR-0004). Empty → null. */
export function cleanName(raw: string): string {
  // eslint-disable-next-line no-control-regex
  const s = raw.normalize("NFC").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  return Array.from(s).slice(0, NAME_MAX).join("");
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as SaveData;
      if (s && s.v === 1 && typeof s.name === "string") { current = { ...s, taken: s.taken ?? [], done: s.done ?? [], flags: s.flags ?? {}, items: s.items ?? [] }; return current; }
    }
  } catch { /* corrupt or unavailable: treated as no save */ }
  current = null;
  return null;
}

export function save(): SaveData | null { return current; }
export function hasSave(): boolean { return current !== null || loadSave() !== null; }

export function write(): void {
  if (!current) return;
  current.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* storage unavailable: progress lasts for this session */ }
}

export function setFlag(name: FlagName, value: FlagValue): void {
  const err = checkFlag(name, value);
  if (err) { console.warn(`[save] ${err}`); return; }
  if (!current) newSave("", "prologue-s1");
  current!.flags[name] = value;
  write();
}

export function getFlag(name: FlagName): FlagValue | undefined { return current?.flags[name]; }

/** Rest at a checkpoint: record where, the pouch and what has been used up. */
export function saveAtCheckpoint(stage: string, checkpoint: string, herbCap: number, taken: Iterable<string>, antidoteCap = 0): void {
  if (!current) return;
  current.stage = stage; current.checkpoint = checkpoint; current.herbCap = herbCap; current.taken = [...new Set(taken)]; current.antidoteCap = antidoteCap;
  write();
}

/** Moving on to the next stage: it starts from its beginning; the pouch and the used-up things carry over. */
export function enterStage(stage: string, herbCap: number, taken: Iterable<string>, antidoteCap = 0): void {
  if (!current) return;
  current.stage = stage; current.checkpoint = null; current.herbCap = herbCap; current.taken = [...new Set(taken)]; current.antidoteCap = antidoteCap;
  write();
}

/** A Mạch Ấn absorbed (saved at once, like a choice's flags). */
export function addMachAn(id: string): void {
  if (!current) return;
  current.machAn = current.machAn ?? [];
  if (!current.machAn.includes(id)) current.machAn.push(id);
  write();
}
export function hasMachAn(id: string): boolean { return !!current?.machAn?.includes(id); }

export function addItem(id: string): void {
  if (!current) return;
  if (!current.items.includes(id)) current.items.push(id);
  write();
}

export function markDone(stage: string): void {
  if (!current) return;
  if (!current.done.includes(stage)) current.done.push(stage);
  write();
}

/** One-time import of flags written by builds before the save system (`cuu-vuc-flags`). */
export function migrateLegacy(): void {
  try {
    const raw = localStorage.getItem(LEGACY_FLAGS);
    if (!raw) return;
    const old = JSON.parse(raw) as Record<string, FlagValue>;
    if (current) for (const [k, v] of Object.entries(old)) if (!checkFlag(k, v) && current.flags[k as FlagName] === undefined) current.flags[k as FlagName] = v;
    if (current) write();
    localStorage.removeItem(LEGACY_FLAGS);
  } catch { /* ignore */ }
}

/** For tests and "New game": forget the slot. */
export function clearSave(): void {
  current = null;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
