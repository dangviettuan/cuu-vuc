/**
 * Stage data format (review Phase 1): everything about a stage's layout lives in data, not in scene code.
 * `src/scenes/Stage.ts` builds any stage from a StageDef. Positions are world pixels; `y` defaults to the ground.
 */
import type { StringKey } from "./strings.vi";
import type { Track } from "../music";
import type { NpcClip } from "../clips";
import type { LookId } from "../artVillage";
import type { FlagName, FlagValue } from "../core/flags";

/** A condition on the save's story flags: the thing exists only when `flag` equals `is` (C1 shapes S6). */
export interface When { flag: FlagName; is: FlagValue }

export interface StageDef {
  id: string;
  width: number;
  height: number;
  groundY: number;
  start: { x: number };
  /** Music while exploring (src/music.ts); an arena switches to its boss track. */
  music?: Track;
  /** Toast on waking after a death, before any shrine is lit (default: the forest edge, S1). */
  wake?: StringKey;
  /** Toast shown when the stage starts fresh. */
  intro?: StringKey;
  /** One-way ledges: land from above, walk underneath, jump up through. Keep them ≤ 42 px above what they're reached from. */
  ledges: { x: number; y: number; w: number }[];
  /** Tutorial signs. `kiem` replaces the text when the Kiếm Khách kit is loaded. */
  signs: { x: number; text: StringKey; kiem?: StringKey }[];
  /** One-time pickups: herbs add a pouch slot, antidotes an antidote slot (Ch. I). `id` is saved once taken. */
  herbs: { id: string; x: number; y?: number; kind?: "herb" | "antidote" }[];
  /** Poison mist (Thanh Mộc độc thảo): standing in it builds poison, `rate` per second (default 40). */
  mists?: { x: number; w: number; rate?: number }[];
  /** Test stages only: Mạch Ấn the hero is given here (the sandbox, so Rễ Giữ can be tried before Mộc Giác exists). */
  grants?: string[];
  /** Brush that blocks the path until cut (3 hits). `id` is saved once cleared. */
  brush: { id: string; x: number }[];
  /**
   * Startled boars with their territory. Respawn when the player rests (Combat Bible §10).
   * `rooted`: the S6 boar with roots through its shoulder (tougher; bolts when beaten). `after`: appears only once that
   * mark is set (by a cutscene). `id`: beating it sets the mark `<id>.down`.
   */
  boars: { x: number; min: number; max: number; tellMs?: number; rooted?: boolean; after?: string; id?: string; when?: When }[];
  /** Mạch shrines: rest, refill, save (ADR-0006). */
  shrines: { id: string; x: number; sign?: StringKey }[];
  /**
   * Drifting leaves. Story-bound (Ch1): green in the morning; none at lunch, where one yellow leaf is the whole beat;
   * yellow only once the forest has changed (night).
   */
  leaves?: "green" | "yellow" | "none" | "storm";
  /** Time of day: night darkens the backdrop (the world and characters stay readable); indoor hides the forest. */
  time?: "morning" | "noon" | "afternoon" | "night" | "dawn" | "indoor";
  /** "storm" (S4): hundreds of yellow leaves falling straight down, with no wind (Ch1). */
  leafCount?: number;
  /** Walking right past `x` leaves for stage `to`, after its cards. */
  exit?: { x: number; to: string; card?: StringKey[] };
  /**
   * Static scenery: `key` is a texture; `x` its centre, `y` its bottom (default: the ground). An `id` lets a cutscene
   * hide, move or swap it. `frames` cycles textures every `ms` (a barking dog, a bird beating its wings). `hidden`
   * starts it hidden (a cutscene shows it).
   */
  props?: { key: string; x: number; y?: number; depth?: number; id?: string; left?: boolean; frames?: string[]; ms?: number; hidden?: boolean; when?: When }[];
  /** Characters the stage places: the Father (S3) or a villager by look (src/artVillage.ts LOOKS). */
  npcs?: { id: string; kind: "father" | "villager"; look?: LookId; x: number; clip: NpcClip; rest?: NpcClip; facing?: 1 | -1; when?: When; bag?: boolean; hidden?: boolean }[];
  /**
   * Things to look at or use: interact nearby shows a line, or runs a cutscene. Using one sets the mark `<id>`.
   * `while`: only while that prop is visible · `after`: only once these marks are set · `unless`: gone once any of
   * these marks is set · `once`: gone after use.
   */
  examine?: { id: string; x: number; text?: StringKey; cutscene?: string; while?: string; after?: string[]; unless?: string[]; once?: boolean; range?: number; when?: When }[];
  /** Interacting near an NPC runs a cutscene (src/data/cutscenes.ts). `once`: only the first time (sets mark `talk.<npc>`). */
  talk?: { npc: string; cutscene: string; hint?: StringKey; once?: boolean; after?: string[]; when?: When }[];
  /** Cutscenes that start by themselves: when the hero passes `x`, or once every mark in `after` is set. Each runs once. */
  triggers?: { id: string; cutscene: string; x?: number; after?: string[]; when?: When }[];
  /**
   * Invisible walls: the way is shut while prop `id` is visible (the Father's door in S5), or until mark `until` is set
   * (S6: the square opens once the rooted boar is beaten).
   */
  blocks?: { id: string; x: number; until?: string }[];
  /** Panicked animals running through (S6): while the hero is between `min` and `max`, until mark `until` is set. */
  stampede?: { min: number; max: number; until?: string };
  /** Diệp fights beside him here (Ch. I–IV ally, DB N6). `x` is where she starts (default: just behind him). */
  ally?: { x?: number };
  /** Floor texture: grass and dirt outdoors, boards indoors. */
  floor?: "ground" | "wood";
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
    /** Where the story goes once the choice is carried out (S7 → S8). */
    next?: { to: string; card?: StringKey[] };
  };
}
