/**
 * Dialogue and choice scripts (review Phase 1). A script is a few lines, then optionally a choice; each option names
 * an outcome the stage carries out and the flags it sets. Text is string-table keys (src/data/strings.vi.ts).
 * The runner and its UI are in src/ui/dialogue.ts.
 */
import type { StringKey } from "./strings.vi";
import type { FlagName, FlagValue } from "../core/flags";

export interface Line { who?: StringKey; text: StringKey }
export interface Option { text: StringKey; outcome: string; flags?: Partial<Record<FlagName, FlagValue>> }
export interface Script { id: string; lines: Line[]; options?: Option[] }

export const SCRIPTS: Record<string, Script> = {
  /** Prologue C1 (§7): the headman asks what his father said. Axis: trust vs control (low weight). */
  c1: {
    id: "c1",
    lines: [{ who: "who.headman", text: "c1.ask" }, { text: "c1.think" }],
    options: [
      { text: "c1.tell", outcome: "told", flags: { PRO_VILLAGE_TOLD: true } },
      { text: "c1.keep", outcome: "kept", flags: { PRO_VILLAGE_TOLD: false } },
    ],
  },
  /** Prologue C2 (§7): spare or finish Nanh Rễ. Axes: forgiveness vs punishment, one vs many (low weight). */
  c2: {
    id: "c2",
    lines: [{ text: "c2.cry" }, { who: "who.player", text: "c2.think" }],
    options: [
      { text: "c2.spare", outcome: "spare", flags: { PRO_SOW_SPARED: true } },
      { text: "c2.kill", outcome: "kill", flags: { PRO_SOW_SPARED: false } },
    ],
  },
};
