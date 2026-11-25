/**
 * Prologue S3 "Bữa trưa" (lunch): the Father's house at the edge of the village, noon. Spec:
 * docs/04-chapters/prologue-an-moc-v0.1.md §3 (S3) and §13 beat 2; the scene as written in prose Chương 1.
 * No combat. Free to look around (the table, his bag, Diệp's door), then talk to him; the scene plays, he leaves.
 *
 * Layout, left to right: the house in cutaway (table, the bag against the wall, Diệp's door), the doorway where he sits,
 * the yard with its evergreen tree, a low fence, and past it the forest "rising like a green wall".
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S3 = {
  id: "prologue-s3",
  width: 720,
  height: 360,
  groundY: 304,
  start: { x: 72 },
  music: "home",
  time: "noon",
  leaves: "none",
  ledges: [],
  signs: [],
  herbs: [],
  brush: [],
  boars: [],
  shrines: [],
  props: [
    { key: "house", x: 0, left: true, depth: -3 },
    { key: "table", x: 70, depth: 4 },
    { key: "bag_prop", x: 188, depth: 4, id: "bag" },
    { key: "yard_tree", x: 418, depth: -3 },
    { key: "fence", x: 600, depth: -2 },
  ],
  npcs: [{ id: "father", kind: "father", x: 226, clip: "sit", facing: 1 }],
  examine: [
    { id: "table", x: 70, text: "s3.ex.table" },
    { id: "diep", x: 161, text: "s3.ex.diep" },
    { id: "bag", x: 188, text: "s3.ex.bag", while: "bag" },
  ],
  talk: [{ npc: "father", cutscene: "s3.main", hint: "s3.hint" }],
  opening: "s3.open",
} satisfies StageDef;
