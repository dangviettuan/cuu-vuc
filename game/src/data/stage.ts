/**
 * Stage data format (review Phase 1): everything about a stage's layout lives in data, not in scene code.
 * `src/scenes/Stage.ts` builds any stage from a StageDef. Positions are world pixels; `y` defaults to the ground.
 */
import type { StringKey } from "./strings.vi";
import type { Track } from "../music";

export interface StageDef {
  id: string;
  width: number;
  height: number;
  groundY: number;
  start: { x: number };
  /** Music while exploring (src/music.ts); an arena switches to its boss track. */
  music?: Track;
  /** Toast shown when the stage starts fresh. */
  intro?: StringKey;
  /** One-way ledges: land from above, walk underneath, jump up through. Keep them ≤ 42 px above what they're reached from. */
  ledges: { x: number; y: number; w: number }[];
  /** Tutorial signs. `kiem` replaces the text when the Kiếm Khách kit is loaded. */
  signs: { x: number; text: StringKey; kiem?: StringKey }[];
  /** One-time pickups: herbs add a pouch slot. `id` is saved once taken. */
  herbs: { id: string; x: number; y?: number }[];
  /** Brush that blocks the path until cut (3 hits). `id` is saved once cleared. */
  brush: { id: string; x: number }[];
  /** Startled boars with their territory. Respawn when the player rests (Combat Bible §10). */
  boars: { x: number; min: number; max: number; tellMs?: number }[];
  /** Mạch shrines: rest, refill, save (ADR-0006). */
  shrines: { id: string; x: number }[];
  arena?: {
    min: number;
    max: number;
    boss: { kind: "nanhRe"; x: number; name: StringKey; intro: StringKey };
    /** Darkens the backdrop behind the arena, faded in over the approach. */
    grove?: boolean;
    /** A landmark image placed at the arena entrance. */
    landmark?: { x: number; key: string };
    /** Decorative bush and the litter behind it (Nanh Rễ's piglets). */
    litter?: { bushX: number; x: number; n: number };
    /** The choice that ends the encounter (src/data/dialogue). */
    outcome: string;
  };
}
