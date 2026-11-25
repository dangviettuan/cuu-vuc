/**
 * Stage data format (review Phase 1): everything about a stage's layout lives in data, not in scene code.
 * `src/scenes/Stage.ts` builds any stage from a StageDef. Positions are world pixels; `y` defaults to the ground.
 */
import type { StringKey } from "./strings.vi";
import type { Track } from "../music";
import type { FatherClip } from "../clips";

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
  shrines: { id: string; x: number; sign?: StringKey }[];
  /**
   * Drifting leaves. Story-bound (Ch1): green in the morning; none at lunch, where one yellow leaf is the whole beat;
   * yellow only once the forest has changed (night).
   */
  leaves?: "green" | "yellow" | "none";
  /** Time of day: night darkens the backdrop (the world and characters stay readable). */
  time?: "morning" | "noon" | "night";
  /** Walking right past `x` leaves for stage `to`, after its cards. */
  exit?: { x: number; to: string; card?: StringKey[] };
  /** Static scenery: `key` is a texture; `x` its centre, `y` its bottom (default: the ground). An `id` lets a cutscene hide it. */
  props?: { key: string; x: number; y?: number; depth?: number; id?: string; left?: boolean }[];
  /** Characters the stage places (the Father in S3). */
  npcs?: { id: string; kind: "father"; x: number; clip: FatherClip; facing?: 1 | -1 }[];
  /** Things to look at: interact nearby shows a narration line. `while` hides it once a prop is gone. */
  examine?: { id: string; x: number; text: StringKey; while?: string }[];
  /** Interacting near an NPC runs a cutscene (src/data/cutscenes.ts). */
  talk?: { npc: string; cutscene: string; hint?: StringKey }[];
  /** A cutscene that runs when the stage starts. */
  opening?: string;
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
