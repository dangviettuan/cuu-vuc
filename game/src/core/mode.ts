/**
 * Quick mode (`?quick=1`): for the playtest tools and quick iteration. Boots straight into the stage with a throwaway
 * save under its own storage key, so it never touches the player's real save.
 */
export function isQuick(): boolean {
  return typeof location !== "undefined" && new URLSearchParams(location.search).get("quick") === "1";
}

/** Quick mode can start at a later stage (`?quick=1&stage=prologue-s7`), so tests reach it without replaying the rest. */
export function quickStage(): string | null {
  return typeof location === "undefined" ? null : new URLSearchParams(location.search).get("stage");
}
