/**
 * Prologue S2 "Cái giếng cạn" (the dry well), morning. Spec: docs/04-chapters/prologue-an-moc-v0.1.md §3 (S2), §13
 * beat 1; the morning as written in prose Chương 1. No combat.
 *
 * From the village entrance (the miếu Mạch under the old tree, its keeper) to the well, where half the village stands.
 * Talk to bà Dần, the headman, the keeper; listen to the crowd; then look into the well: the Father comes, lays his
 * rods across it, the third one trembles. "Có chuyện gì à?" "Không." The keeper: "Đất không còn giữ được nó nữa."
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S2 = {
  id: "prologue-s2",
  width: 900,
  height: 360,
  groundY: 304,
  start: { x: 40 },
  music: "home",
  time: "morning",
  leaves: "green",
  ledges: [],
  signs: [],
  herbs: [],
  brush: [],
  boars: [],
  shrines: [{ id: "s2-shrine", x: 110 }],
  props: [
    { key: "great_tree_green", x: 160, depth: -3 },
    { key: "day_house0", x: 330, depth: -3 },
    { key: "day_house2", x: 720, depth: -3 },
    { key: "day_house1", x: 860, depth: -4 },
    { key: "well", x: 540, depth: 4 },
    { key: "rod_on_well", x: 540, y: 287, id: "rod", depth: 5, hidden: true },
  ],
  npcs: [
    { id: "keeper", kind: "villager", look: "keeper", x: 186, clip: "idle", facing: 1 },
    { id: "ongDan", kind: "villager", look: "ongDan", x: 460, clip: "idle", facing: 1 },
    { id: "baDan", kind: "villager", look: "baDan", x: 482, clip: "idle", facing: 1 },
    { id: "villagerA", kind: "villager", look: "man3", x: 590, clip: "idle", facing: -1 },
    { id: "villagerB", kind: "villager", look: "woman1", x: 612, clip: "idle", facing: -1 },
    { id: "villagerC", kind: "villager", look: "man2", x: 634, clip: "brow", facing: -1 },
    { id: "headman", kind: "villager", look: "headman", x: 672, clip: "idle", facing: -1 },
    // the Father comes from home, behind the crowd, once the hero has looked into the well
    { id: "father", kind: "father", x: 300, clip: "idle", facing: 1, bag: true, hidden: true },
  ],
  examine: [
    { id: "well", x: 540, cutscene: "s2.well", once: true, range: 18 },
    { id: "crowd", x: 612, cutscene: "s2.crowd", once: true, range: 14 },
  ],
  talk: [
    { npc: "baDan", cutscene: "s2.dan" },
    { npc: "headman", cutscene: "s2.headman" },
    { npc: "keeper", cutscene: "s2.keeper" },
  ],
  opening: "s2.open",
} satisfies StageDef;
