/**
 * Dialogue and choice scripts (review Phase 1). A script is a few lines, then optionally a choice; each option names
 * an outcome the stage carries out and the flags it sets. Text is string-table keys (src/data/strings.vi.ts).
 * The runner and its UI are in src/ui/dialogue.ts.
 */
import type { StringKey } from "./strings.vi";
import type { FlagName, FlagValue } from "../core/flags";
import { SCRIPTS as CH1_I2I3 } from "./ch1/text-i2i3";
import { SCRIPTS as CH1_I6I7 } from "./ch1/text-i6i7";

export interface Line { who?: StringKey; text: StringKey }
/** `locked`: shown greyed with a "not yet open" note and cannot be picked (Ngự Linh and Cơ Sư in this build). */
export interface Option { text: StringKey; outcome: string; flags?: Partial<Record<FlagName, FlagValue>>; locked?: boolean }
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

/** Ch. I I-3: going down into the Làng Khê ruins is optional (spec §4). */
SCRIPTS["ch1.khe"] = {
  id: "ch1.khe",
  lines: [{ text: "ch1.khe.ask" }],
  options: [{ text: "ch1.khe.visit", outcome: "visit" }, { text: "ch1.khe.skip", outcome: "skip" }],
};

// Chapter I's choices: the class (ch1.class) and Sẻ (ch1.c1).
Object.assign(SCRIPTS, CH1_I2I3, CH1_I6I7);

