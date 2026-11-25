/**
 * Prologue S8 "Lối rễ" (the root path), part 1: the village, before dawn. Spec: docs/04-chapters/prologue-an-moc-v0.1.md
 * §3 (S8), §12 (PRO_KEEPER_HINT), §13 beat 4; prose Chương 2 after the fight.
 *
 * At the square under the bare old tree: what the village says about C2, and the two decisions of one day (C1 and C2
 * both shape the lines). The keeper's hint is optional (talk to him: PRO_KEEPER_HINT). Home for the last time: the
 * Father's spare satchel and the red thread (the pouch grows by one), Diệp's letters (optional). Then the bamboo at the
 * western edge and the wall of living roots, which parts for the half Mạch Ấn. Then the forest (part 2).
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S8 = {
  id: "prologue-s8",
  width: 1500,
  height: 360,
  groundY: 304,
  wake: "toast.wakeVillage",
  start: { x: 300 },
  music: "aftermath",
  time: "dawn",
  leaves: "yellow",
  ledges: [],
  signs: [],
  herbs: [],
  brush: [],
  boars: [],
  shrines: [{ id: "s8-shrine", x: 200 }],
  props: [
    { key: "great_tree_bare", x: 140, depth: -3 },
    { key: "night_house1", x: 40, depth: -4 },
    { key: "house", x: 520, left: true, depth: -3 },
    { key: "satchel", x: 560, id: "satchel", depth: 5 },
    { key: "bamboo0", x: 920, depth: -3 },
    { key: "bamboo1", x: 1000, depth: -3 },
    { key: "bamboo2", x: 1100, depth: -2 },
    { key: "bamboo0", x: 1190, depth: -3 },
    { key: "root_wall0", x: 1310, id: "rootWall", depth: 6 },
  ],
  npcs: [
    { id: "keeper", kind: "villager", look: "keeper", x: 236, clip: "idle", facing: 1 },
    { id: "villagerA", kind: "villager", look: "man3", x: 350, clip: "idle", facing: -1 },
    { id: "villagerB", kind: "villager", look: "man1", x: 376, clip: "idle", facing: -1 },
  ],
  examine: [
    { id: "satchel", x: 560, cutscene: "s8.satchel", while: "satchel", once: true },
    { id: "diep", x: 678, cutscene: "s8.diep", once: true },
    { id: "roots", x: 1284, cutscene: "s8.roots", after: ["satchel"], once: true, range: 22 },
    { id: "rootsEarly", x: 1284, text: "s8.ex.rootsEarly", unless: ["satchel"], range: 22 },
  ],
  talk: [{ npc: "keeper", cutscene: "s8.keeper", once: true }],
  triggers: [{ id: "home", cutscene: "s8.home", x: 500 }],
  blocks: [{ id: "roots", x: 1300, until: "parted" }],
  exit: { x: 1440, to: "prologue-s8-station", card: ["card.s8.forest"] },
  opening: "s8.open",
} satisfies StageDef;
