/**
 * Prologue S1 "Việc sáng" (forest-edge chores as the tutorial), ending at the miếu Mạch at the village entrance.
 * Spec: docs/04-chapters/prologue-an-moc-v0.1.md §3. Walking on into An Mộc leads to S3 (lunch); the S2 well scene is
 * carried by a narration card until it is built.
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S1 = {
  id: "prologue-s1",
  width: 1640,
  height: 360,
  groundY: 304,
  start: { x: 60 },
  music: "forest",
  time: "morning",
  leaves: "green",
  intro: "s1.intro",
  ledges: [
    { x: 300, y: 270, w: 96 },
    { x: 640, y: 264, w: 64 },
    { x: 1040, y: 266, w: 80 },
  ],
  signs: [
    { x: 110, text: "sign.move" },
    { x: 420, text: "sign.brush" },
    { x: 600, text: "sign.herb" },
    // one lesson per boar (cloud playtest: three new actions on one sign was too much at once)
    { x: 790, text: "sign.boar1", kiem: "sign.boar1.kiem" },
    { x: 1105, text: "sign.boar2" },
    { x: 1380, text: "sign.shrine" },
    { x: 1530, text: "sign.village" },
  ],
  herbs: [
    { id: "s1-herb-ground", x: 560, y: 298 },
    { id: "s1-herb-ledge", x: 672, y: 262 },
  ],
  brush: [{ id: "s1-brush", x: 470 }],
  boars: [
    { x: 930, min: 860, max: 1010, tellMs: 800 }, // the teaching boar: a longer, easier-to-read notice
    { x: 1230, min: 1160, max: 1300 },
  ],
  shrines: [{ id: "s1-shrine", x: 1420 }],
  exit: { x: 1590, to: "prologue-s3", card: ["card.s1s3.a", "card.s1s3.b"] },
} satisfies StageDef;

