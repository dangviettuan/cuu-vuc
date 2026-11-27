/**
 * A test stage for Chapter I systems (Phase 3), not part of the story: `?quick=1&stage=ch1-sandbox`. It grants Rễ Giữ and
 * lays out what the systems need: boars to parry and dodge (Rễ Giữ, Ảnh Vệ's perfect dodge), a rooted boar, a patch of
 * poison mist with antidotes beside it, a shrine to reset. New Ch. I enemies and hazards are added here first.
 */
import type { StageDef } from "../stage";

export const CH1_SANDBOX = {
  id: "ch1-sandbox",
  width: 3000,
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
  // Ch. I enemies, left to right: a rooted deer, a great cat, two spore pods, two of Cương's operatives
  foes: [
    { kind: "rootDeer", x: 1640, min: 1560, max: 1720 },
    { kind: "greatCat", x: 1960, min: 1880, max: 2040 },
    { kind: "sporePod", x: 2180, min: 2180, max: 2180 },
    { kind: "sporePod", x: 2230, min: 2230, max: 2230 },
    { kind: "operative", x: 2560, min: 2480, max: 2640 },
    { kind: "operative", x: 2640, min: 2560, max: 2720 },
  ],
  grants: ["reGiu"],
  ally: {},
} satisfies StageDef;
