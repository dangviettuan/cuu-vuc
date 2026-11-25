/**
 * Story flags known to the game, typed from docs/04-chapters/flags-registry-v0.1.md (the specs own the meanings).
 * Only flags the playable build can write are listed; add each flag here when the stage that owns it is built.
 * Writing an unknown flag, or a value of the wrong type, is a bug and is reported (not silently stored).
 */
export const FLAG_TYPES = {
  /** Prologue C1: told the village it is Linh Suy. Owner: prologue-an-moc §7. */
  PRO_VILLAGE_TOLD: "bool",
  /** Prologue C2: drove Nanh Rễ off instead of finishing her. Owner: prologue-an-moc §7. */
  PRO_SOW_SPARED: "bool",
  /** Prologue S8: spoke to the shrine keeper. Owner: prologue-an-moc §12. */
  PRO_KEEPER_HINT: "bool",
  /** Prologue S8: examined every clue at the station. Owner: prologue-an-moc §12. */
  PRO_STATION_READ: "bool",
} as const;

export type FlagName = keyof typeof FLAG_TYPES;
export type FlagValue = boolean | number | string;

export function isFlag(name: string): name is FlagName { return name in FLAG_TYPES; }

export function checkFlag(name: string, value: FlagValue): string | null {
  if (!isFlag(name)) return `unknown flag ${name} (add it to src/core/flags.ts from the flag registry)`;
  const want = FLAG_TYPES[name];
  const got = typeof value === "boolean" ? "bool" : typeof value === "number" ? "int" : "enum";
  return want === got ? null : `flag ${name} expects ${want}, got ${got}`;
}
