/**
 * A test stage for Chapter I systems (Phase 3), not part of the story: `?quick=1&stage=ch1-sandbox`. It grants Rễ Giữ and
 * lays out what the systems need: boars to parry and dodge (Rễ Giữ, Ảnh Vệ's perfect dodge), a rooted boar, a patch of
 * poison mist with antidotes beside it, a shrine to reset. New Ch. I enemies and hazards are added here first.
 */
import type { StageDef } from "../stage";

export const CH1_SANDBOX = {
  id: "ch1-sandbox",
  width: 1600,
  height: 360,
  groundY: 304,
  start: { x: 60 },
  music: "forest",
  time: "morning",
  leaves: "yellow",
  ledges: [],
  signs: [{ x: 470, text: "sign.mist" }],
  herbs: [
    { id: "sb-herb1", x: 140 }, { id: "sb-herb2", x: 170 },
    { id: "sb-anti1", x: 520, kind: "antidote" }, { id: "sb-anti2", x: 545, kind: "antidote" },
  ],
  mists: [{ x: 600, w: 160 }],
  brush: [],
  boars: [
    { x: 330, min: 260, max: 420, tellMs: 650 },
    { x: 980, min: 900, max: 1060 },
    { x: 1300, min: 1220, max: 1380, rooted: true },
  ],
  shrines: [{ id: "sb-shrine", x: 820 }],
  grants: ["reGiu"],
} satisfies StageDef;
