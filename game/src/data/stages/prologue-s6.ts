/**
 * Prologue S6 "Đêm rừng đổi" (the night the forest changes). Spec: docs/04-chapters/prologue-an-moc-v0.1.md §3 (S6),
 * §8 (C1's same-night consequences); the night as written in prose Chương 2.
 *
 * Out of the house into the village: panicked animals stream through (the stampede: jump over or dodge through; they
 * are not fighting, only running). At bà Dần's the night depends on C1:
 * - **kept the Father's word** (PRO_VILLAGE_TOLD false; the prose's branch): her porch is down and ông Dần is pinned
 *   under the frame; he lifts it, then the rooted boar turns on him.
 * - **told the village**: her gate is stoned up and the house stands; the rooted boar comes through the next fence.
 * The rooted boar bolts when beaten (it does not die). Then the square: the headman with his torch, and either the
 * wrecked homes (kept) or the Tư family gone into the forest (told). The gate breaks: S7.
 */
import type { StageDef } from "../stage";

const KEPT = { flag: "PRO_VILLAGE_TOLD", is: false } as const;
const TOLD = { flag: "PRO_VILLAGE_TOLD", is: true } as const;

export const PROLOGUE_S6 = {
  id: "prologue-s6",
  width: 1320,
  height: 360,
  groundY: 304,
  wake: "toast.wakeVillage",
  start: { x: 44 },
  music: "indoor",
  time: "night",
  leaves: "yellow",
  ledges: [],
  signs: [{ x: 196, text: "sign.stampede" }],
  herbs: [],
  brush: [],
  boars: [{ id: "rb", x: 880, min: 820, max: 960, rooted: true, after: "rboar", tellMs: 650 }],
  shrines: [],
  props: [
    { key: "night_house0", x: 40, depth: -3 },
    { key: "night_house1", x: 330, depth: -3 },
    { key: "night_house2", x: 520, depth: -3 },
    // bà Dần's house: down (kept) or standing behind its stoned-up gate (told)
    { key: "dan_house1", x: 800, depth: -3, when: KEPT },
    { key: "bamboo_frame", x: 830, id: "frame", depth: 10, when: KEPT },
    { key: "dan_house0", x: 800, depth: -3, when: TOLD },
    { key: "stones", x: 724, depth: 4, when: TOLD },
    { key: "night_house1", x: 1060, depth: -4 },
    { key: "night_house0", x: 1250, depth: -4 },
  ],
  npcs: [
    { id: "ongDan", kind: "villager", look: "ongDan", x: 834, clip: "lie", facing: 1, when: KEPT },
    { id: "baDan", kind: "villager", look: "baDan", x: 806, clip: "kneel", facing: 1, when: KEPT },
    { id: "baDan", kind: "villager", look: "baDan", x: 770, clip: "idle", facing: -1, when: TOLD },
    { id: "ongDan", kind: "villager", look: "ongDan", x: 792, clip: "idle", facing: -1, when: TOLD },
    { id: "headman", kind: "villager", look: "headman", x: 1160, clip: "torch", rest: "torch", facing: -1 },
    { id: "villagerA", kind: "villager", look: "man3", x: 1196, clip: "idle", facing: -1 },
    { id: "villagerB", kind: "villager", look: "woman1", x: 1222, clip: "idle", facing: -1 },
  ],
  stampede: { min: 150, max: 690, until: "dan" },
  // the square opens once the rooted boar has run
  blocks: [{ id: "square", x: 1000, until: "rb.down" }],
  triggers: [
    { id: "stampede", cutscene: "s6.stampede", x: 150 },
    { id: "trapped", cutscene: "s6.trapped", x: 700, when: KEPT },
    { id: "ready", cutscene: "s6.ready", x: 700, when: TOLD },
    { id: "after", cutscene: "s6.after", after: ["rb.down"] },
    { id: "squareKept", cutscene: "s6.square.kept", x: 1040, after: ["rb.down"], when: KEPT },
    { id: "squareTold", cutscene: "s6.square.told", x: 1040, after: ["rb.down"], when: TOLD },
  ],
  opening: "s6.open",
} satisfies StageDef;
