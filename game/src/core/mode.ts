/**
 * Quick mode (`?quick=1`): for the playtest tools and quick iteration. Boots straight into the stage with a throwaway
 * save under its own storage key, so it never touches the player's real save.
 */
export function isQuick(): boolean {
  return typeof location !== "undefined" && new URLSearchParams(location.search).get("quick") === "1";
}
