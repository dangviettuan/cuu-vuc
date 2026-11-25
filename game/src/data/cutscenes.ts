/**
 * Cutscenes (Phase 2): a scene is a list of steps the stage plays in order (src/scenes/Stage.ts runCutscene).
 * Lines are string-table keys; actors are "player" or an NPC id from the stage. Any cutscene can be skipped from the
 * pause menu: walks and waits complete at once, lines are dropped, and the final state is the same.
 */
import type { StringKey } from "./strings.vi";
import type { FatherClip } from "../clips";

export type Step =
  | { say: StringKey; who?: StringKey }
  | { walk: string; to: number }
  | { face: string; dir: 1 | -1 }
  | { pose: string; clip: FatherClip }
  | { wait: number }
  | { leaf: { from: number; to: number; top: number } }
  | { hideProp: string }
  | { bag: string }
  | { camera: number | "follow" }
  | { toast: StringKey }
  | { goto: string; card?: StringKey[] };

const P = "who.player", F = "who.father";

export const CUTSCENES: Record<string, Step[]> = {
  /** Prologue S3, on entering: noon at home (Ch1). */
  "s3.open": [
    { wait: 400 },
    { say: "s3.n1" },
    { say: "s3.n2" },
    { toast: "s3.hint" },
  ],
  /** Prologue S3, "Bữa trưa" (spec §3, §13 beat 2; Ch1): the Father leaves. */
  "s3.main": [
    { walk: "player", to: 196 },
    { face: "player", dir: 1 },
    { say: "s3.p1", who: P }, { say: "s3.f1", who: F },
    { say: "s3.p2", who: P }, { say: "s3.f2", who: F },
    { say: "s3.p3", who: P }, { say: "s3.f3", who: F },
    { say: "s3.n3" },
    { say: "s3.p4", who: P },
    { face: "father", dir: -1 },
    { say: "s3.n4" },
    { say: "s3.f4", who: F },
    { say: "s3.p5", who: P }, { say: "s3.f5", who: F },
    { say: "s3.p6", who: P }, { say: "s3.f6", who: F },
    { say: "s3.n5" },
    // the yellow leaf
    { camera: 360 },
    { leaf: { from: 408, to: 372, top: 200 } },
    { say: "s3.n6" },
    { say: "s3.n7" },
    { pose: "father", clip: "stand" },
    { wait: 300 },
    { face: "father", dir: 1 },
    { walk: "father", to: 366 },
    { pose: "father", clip: "crouch" },
    { hideProp: "leaf" },
    { wait: 500 },
    { pose: "father", clip: "hold" },
    { say: "s3.n8" },
    { walk: "player", to: 330 },
    { face: "player", dir: 1 },
    { face: "father", dir: -1 },
    { say: "s3.p7", who: P }, { say: "s3.f7", who: F },
    { say: "s3.p8", who: P }, { say: "s3.f8", who: F },
    { say: "s3.p9", who: P }, { say: "s3.f9", who: F },
    { say: "s3.n9" },
    { say: "s3.f10", who: F },
    { say: "s3.p10", who: P },
    // the hand that pulls back
    { wait: 700 },
    { pose: "father", clip: "offer" },
    { wait: 900 },
    { pose: "father", clip: "drop" },
    { say: "s3.n10" },
    { pose: "father", clip: "idle" },
    { say: "s3.f11", who: F },
    // he takes his bag from the house and stops beside his son on the way out
    { camera: "follow" },
    { walk: "father", to: 192 },
    { bag: "father" },
    { hideProp: "bag" },
    { wait: 400 },
    { walk: "father", to: 352 },
    { face: "father", dir: -1 },
    { say: "s3.f12", who: F },
    { say: "s3.p11", who: P },
    { say: "s3.f13", who: F },
    { say: "s3.f14", who: F },
    { face: "father", dir: 1 },
    { walk: "father", to: 640 },
    { wait: 300 },
    { goto: "prologue-s7", card: ["card.s3s7.a", "card.s3s7.b", "card.s3s7.c"] },
  ],
};
