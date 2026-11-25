/**
 * Strings: `t(key, vars)` looks a key up in the string table and fills its placeholders (src/data/strings.vi.ts).
 * Vietnamese is the source language; another table can be added later behind the same keys.
 */
import { vi, StringKey } from "../data/strings.vi";
import { Action, input } from "./input";
import { save } from "./save";

const ACTIONS: ReadonlySet<string> = new Set<Action>([
  "left", "right", "up", "down", "jump", "light", "heavy", "dodge", "parry", "herb", "interact", "pause", "confirm", "cancel", "debug",
]);

export type { StringKey };

export function t(key: StringKey, vars: Record<string, string | number> = {}): string {
  const s: string = vi[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => {
    if (k in vars) return String(vars[k]);
    if (ACTIONS.has(k)) return input.label(k as Action);
    if (k === "name") return save()?.name || "…";
    return m;
  });
}
