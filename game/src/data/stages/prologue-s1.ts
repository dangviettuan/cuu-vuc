/**
 * Prologue S1 "Việc sáng" (forest-edge chores as the tutorial) running into S7, the Nanh Rễ fight.
 * Spec: docs/04-chapters/prologue-an-moc-v0.1.md §3 and §9. Greybox layout: the S7 square is placed at the end of the
 * S1 trail until the village stages (S2–S6) exist.
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S1 = {
  id: "prologue-s1",
  width: 2200,
  height: 360,
  groundY: 304,
  start: { x: 60 },
  music: "forest",
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
  arena: {
    min: 1520,
    max: 2160,
    boss: { kind: "nanhRe", x: 1960, name: "boss.nanhRe", intro: "boss.nanhRe.intro" },
    grove: true,
    landmark: { x: 1550, key: "split_tree" },
    litter: { bushX: 2130, x: 2112, n: 3 },
    outcome: "c2",
  },
} satisfies StageDef;

export const STAGES: Record<string, StageDef> = { [PROLOGUE_S1.id]: PROLOGUE_S1 };
