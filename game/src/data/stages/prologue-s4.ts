/**
 * Prologue S4 "Buổi chiều lệch" (the afternoon goes wrong). Spec: docs/04-chapters/prologue-an-moc-v0.1.md §3 (S4),
 * §7 (C1), §8; the afternoon as written in prose Chương 1. No combat.
 *
 * Left to right: the Father's yard (the wounded bird falls here), the village road (bà Dần by her house, a dog facing
 * the forest), the miếu Mạch under the old tree dropping its leaves (villagers keep their distance), and the road to
 * the station, where the headman waits. Talking to him, or walking past him, brings the four men back from the
 * station road: "Chúng mọc lại." Then he asks the hero what his father said (C1).
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S4 = {
  id: "prologue-s4",
  width: 1300,
  height: 360,
  groundY: 304,
  start: { x: 150 },
  music: "dusk",
  time: "afternoon",
  leaves: "storm",
  leafCount: 28,
  ledges: [],
  signs: [],
  herbs: [],
  brush: [],
  boars: [],
  shrines: [{ id: "s4-shrine", x: 960, sign: "sign.shrine.night" }],
  props: [
    { key: "house", x: 0, left: true, depth: -3 },
    { key: "yard_tree", x: 360, depth: -3 },
    { key: "fence", x: 470, depth: -2 },
    { key: "bird_down0", x: 300, id: "bird", depth: 6, hidden: true, frames: ["bird_down0", "bird_down1"], ms: 110 },
    { key: "day_house0", x: 620, depth: -3 },
    { key: "day_house1", x: 800, depth: -3 },
    { key: "dog0", x: 706, id: "dog", depth: 4, frames: ["dog0", "dog1"], ms: 260 },
    { key: "great_tree", x: 1030, depth: -3 },
    { key: "leaf_carpet", x: 1030, y: 306, depth: 3 },
    { key: "day_house2", x: 1240, depth: -4 },
  ],
  npcs: [
    { id: "baDan", kind: "villager", look: "baDan", x: 650, clip: "idle", facing: -1 },
    { id: "villagerA", kind: "villager", look: "woman1", x: 900, clip: "brow", facing: 1 },
    { id: "villagerB", kind: "villager", look: "man2", x: 922, clip: "idle", facing: 1 },
    { id: "headman", kind: "villager", look: "headman", x: 1150, clip: "idle", facing: -1 },
    // the four men, out on the station road (off the right edge) until they come back
    { id: "man1", kind: "villager", look: "man1", x: 1330, clip: "idle", facing: -1 },
    { id: "man2", kind: "villager", look: "man3", x: 1356, clip: "idle", facing: -1 },
    { id: "man3", kind: "villager", look: "man4", x: 1380, clip: "idle", facing: -1 },
    { id: "man4", kind: "villager", look: "man2", x: 1404, clip: "idle", facing: -1 },
  ],
  examine: [
    { id: "bird", x: 300, cutscene: "s4.bird", while: "bird", once: true, range: 20 },
    { id: "dogs", x: 706, text: "s4.ex.dogs" },
    { id: "crowd", x: 880, text: "s4.ex.crowd" },
    { id: "tree", x: 1030, text: "s4.ex.tree", range: 24 },
  ],
  talk: [
    { npc: "baDan", cutscene: "s4.dan" },
    { npc: "headman", cutscene: "s4.men", once: true },
  ],
  // walking on past the headman toward the station road brings the men back too
  triggers: [{ id: "men", cutscene: "s4.men", x: 1180 }],
  opening: "s4.open",
} satisfies StageDef;
