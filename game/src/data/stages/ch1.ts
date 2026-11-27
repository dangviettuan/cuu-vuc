/**
 * Chapter I "Thanh Mộc" (Phase 3): the stages. Spec docs/04-chapters/chapter-01-thanh-moc-v0.1.md §3; scenes from prose
 * Chương 3–6 (src/data/ch1/text-*.ts), staged in src/data/ch1/staging.ts.
 *
 * ch1-road (I-1) → ch1-mocthanh (I-1, I-2) → ch1-training (I-2) → ch1-trail (I-3) [→ ch1-khe, optional] → ch1-deep
 * (I-4, Độc Đằng) → ch1-grove (I-5, Mộc Giác) → ch1-cut (I-6, Hùng, Cương, Sẻ) → ch1-return (I-7) → the end card.
 */
import type { StageDef, When } from "../stage";

const G = 304;
const TOLD: When = { flag: "PRO_VILLAGE_TOLD", is: true };
const SPARED: When = { flag: "PRO_SOW_SPARED", is: true }, KILLED: When = { flag: "PRO_SOW_SPARED", is: false };
const base = { height: 360, groundY: G, ledges: [], signs: [], herbs: [], brush: [], boars: [], shrines: [] };

/** Mộc Thành, built on giant trunks: decks and huts up the trees, rope bridges, lanterns; the big miếu Mạch at the top. */
const mocThanhProps: NonNullable<StageDef["props"]> = [
  { key: "giant_trunk0", x: 150, depth: -5 }, { key: "giant_trunk1", x: 700, depth: -5 },
  { key: "giant_trunk0", x: 1300, depth: -5 }, { key: "giant_trunk1", x: 1850, depth: -5 },
  { key: "deck160", x: 700, y: G - 112, depth: -4.6 }, { key: "tree_hut0", x: 700, y: G - 122, depth: -4.7 },
  { key: "deck100", x: 1300, y: G - 84, depth: -4.6 }, { key: "tree_hut1", x: 1300, y: G - 94, depth: -4.7 },
  { key: "rope_bridge", x: 1000, y: G - 110, depth: -4.8 }, { key: "ladder", x: 770, depth: -4.5 },
  { key: "lantern", x: 420, y: G - 70, depth: -2 }, { key: "lantern", x: 860, y: G - 80, depth: -2 },
  { key: "lantern", x: 1500, y: G - 74, depth: -2 }, { key: "lantern", x: 1680, y: G - 66, depth: -2 },
  { key: "perch", x: 925, y: G - 28, depth: -2 }, { key: "mushroom_ring", x: 1080, depth: 3 },
  { key: "shed", x: 1250, depth: -3 }, { key: "practice_post", x: 1460, depth: -2 },
];

/** I-1: from the station's trail to the foot of Mộc Thành; the boot prints vanish at the third stream. */
export const CH1_ROAD: StageDef = {
  ...base, id: "ch1-road", width: 1600, start: { x: 60 }, music: "forest", time: "morning", leaves: "yellow",
  props: [{ key: "stream", x: 150, y: G + 1, depth: 3 }, { key: "boot_prints", x: 100, y: G + 2, depth: 3 }, { key: "giant_trunk0", x: 760, depth: -5 }, { key: "giant_trunk1", x: 1180, depth: -5 }],
  foes: [{ kind: "rootDeer", x: 1300, min: 1240, max: 1380 }],
  triggers: [{ id: "giants", cutscene: "ch1.road.giants", x: 620 }, { id: "sow", cutscene: "ch1.road.sow", x: 980 }],
  exit: { x: 1560, to: "ch1-mocthanh", card: ["card.ch1.mt"] },
  opening: "ch1.road.open",
};

/** I-1 and I-2 in Mộc Thành: Diệp, Ngàn, the night; the next morning the four mentors and the class. */
export const CH1_MOCTHANH: StageDef = {
  ...base, id: "ch1-mocthanh", width: 2000, start: { x: 60 }, music: "home", time: "morning", leaves: "none", floor: "wood",
  shrines: [{ id: "mt-shrine", x: 1830 }],
  props: mocThanhProps,
  npcs: [
    { id: "warden", kind: "villager", look: "warden", x: 236, clip: "idle", facing: -1 },
    { id: "warden2", kind: "villager", look: "warden2", x: 266, clip: "idle", facing: -1 },
    { id: "ref1", kind: "villager", look: "woman1", x: 330, clip: "idle", facing: -1 },
    { id: "ref2", kind: "villager", look: "man2", x: 356, clip: "idle", facing: 1 },
    { id: "ref3", kind: "villager", look: "man3", x: 388, clip: "kneel", facing: -1 },
    { id: "en", kind: "villager", look: "en", x: 935, y: G - 30, clip: "idle", facing: -1 },
    { id: "baReu", kind: "villager", look: "baReu", x: 1080, clip: "idle", facing: -1 },
    { id: "toan", kind: "villager", look: "toan", x: 1226, clip: "idle", facing: -1 },
    { id: "laoTru", kind: "villager", look: "laoTru", x: 1436, clip: "idle", facing: -1 },
    { id: "ngan", kind: "villager", look: "ngan", x: 1760, clip: "idle", facing: -1 },
  ],
  ally: { x: 600, waitFor: "diep" },
  talk: [
    { npc: "diep", cutscene: "ch1.mt.diep", once: true },
    { npc: "ngan", cutscene: "ch1.mt.ngan", once: true, after: ["diep"] },
    { npc: "en", cutscene: "ch1.mt.en", after: ["morning"], unless: ["met.en"] },
    { npc: "en", cutscene: "i2.en.again", after: ["met.en"] },
    { npc: "baReu", cutscene: "ch1.mt.baReu", after: ["morning"], unless: ["met.baReu"] },
    { npc: "baReu", cutscene: "i2.baReu.again", after: ["met.baReu"] },
    { npc: "toan", cutscene: "ch1.mt.toan", after: ["morning"], unless: ["met.toan"] },
    { npc: "toan", cutscene: "i2.toan.again", after: ["met.toan"] },
    { npc: "laoTru", cutscene: "ch1.mt.laoTru", after: ["morning"], unless: ["met.laoTru"] },
    { npc: "laoTru", cutscene: "i2.laoTru.again", after: ["met.laoTru"] },
    // having heard all four, Diệp asks him which way (the class choice, I-2)
    { npc: "diep", cutscene: "ch1.mt.choose", once: true, after: ["met.en", "met.baReu", "met.toan", "met.laoTru"] },
  ],
  triggers: [{ id: "night", cutscene: "ch1.mt.night", after: ["ngan"] }],
  opening: "ch1.mt.arrive",
};

/** I-2: the day of training. Diệp spars; the class's own defence is counted (Kiếm Khách parries, Ảnh Vệ perfect dodges). */
export const CH1_TRAINING: StageDef = {
  ...base, id: "ch1-training", width: 700, start: { x: 120 }, music: "home", time: "morning", leaves: "none", floor: "wood",
  props: [{ key: "giant_trunk1", x: 90, depth: -5 }, { key: "practice_post", x: 600, depth: -2 }, { key: "lantern", x: 300, y: G - 70, depth: -2 }],
  foes: [{ kind: "sparDiep", x: 420, min: 260, max: 600 }],
  training: { count: 3, mark: "i2.trained" },
  triggers: [{ id: "trained", cutscene: "ch1.train.done", after: ["i2.trained"] }],
  opening: "ch1.train.open",
};

/** I-3: back to the third stream with Diệp; the boot prints; the Prologue's choices meet him on the trail. */
export const CH1_TRAIL: StageDef = {
  ...base, id: "ch1-trail", width: 2300, start: { x: 60 }, music: "forest", time: "morning", leaves: "yellow",
  props: [
    { key: "stream", x: 170, y: G + 1, depth: 3 }, { key: "boot_prints", x: 320, y: G + 2, depth: 3 }, { key: "boot_prints", x: 560, y: G + 2, depth: 3 },
    { key: "giant_trunk0", x: 880, depth: -5 },
    { key: "hollow_tree", x: 1060, depth: -2, when: TOLD },
    { key: "rockslide", x: 1840, depth: -2 },
    { key: "boar_idle0", x: 1760, id: "herd1", depth: 4, frames: ["boar_idle0", "boar_idle1"], ms: 320, when: SPARED },
    { key: "boar_idle1", x: 1792, id: "herd2", depth: 4, frames: ["boar_idle1", "boar_idle0"], ms: 360, when: SPARED },
    { key: "nanh_fall3", x: 1836, depth: 3, when: SPARED },
    { key: "piglet_dead", x: 1770, y: G + 1, depth: 4, when: KILLED }, { key: "piglet_dead", x: 1788, y: G + 1, depth: 4, when: KILLED },
    { key: "piglet_dead", x: 1806, y: G + 1, depth: 4, when: KILLED },
  ],
  npcs: [
    { id: "tuWife", kind: "villager", look: "tuWife", x: 1044, clip: "kneel", facing: 1, when: TOLD, hidden: true },
    { id: "tuChild", kind: "villager", look: "tuChild", x: 1066, clip: "idle", facing: -1, when: TOLD, hidden: true },
    { id: "warden", kind: "villager", look: "warden", x: 1370, clip: "lie", facing: -1 },
    { id: "warden2", kind: "villager", look: "warden2", x: 1400, clip: "kneel", facing: -1 },
  ],
  ally: {},
  foes: [{ kind: "rootDeer", x: 720, min: 640, max: 800 }, { kind: "greatCat", x: 1560, min: 1480, max: 1640 }],
  triggers: [
    { id: "tu", cutscene: "ch1.trail.tu", x: 990, when: TOLD },
    { id: "warden", cutscene: "ch1.trail.warden", x: 1290 },
    { id: "route", cutscene: "ch1.trail.route", x: 1680 },
    { id: "khe", cutscene: "ch1.trail.khe", x: 2120 },
  ],
  opening: "ch1.trail.open",
};

/** Làng Khê (optional): Diệp's dead home settlement; the dry stream; the station with a hollow twice the size. */
export const CH1_KHE: StageDef = {
  ...base, id: "ch1-khe", width: 1300, start: { x: 60 }, music: "aftermath", time: "afternoon", leaves: "none",
  props: [
    { key: "ruin_house0", x: 250, depth: -3 }, { key: "ruin_house1", x: 520, depth: -3 }, { key: "ruin_house2", x: 760, depth: -3 },
    { key: "great_tree_bare", x: 600, depth: -4 }, { key: "stream_dry", x: 960, y: G + 1, depth: 3 }, { key: "station", x: 1160, y: G + 2, depth: -2 },
  ],
  ally: {},
  examine: [
    { id: "house", x: 262, cutscene: "khe.house", once: true, range: 20 },
    { id: "stream", x: 960, cutscene: "khe.stream", once: true, range: 24 },
    { id: "station", x: 1150, cutscene: "ch1.khe.station", once: true, range: 22 },
  ],
  opening: "ch1.khe.open",
};

/** I-4: Rừng Sâu. Roots that part for him; poison; the waystation shrine; Độc Đằng between its two trunks. */
export const CH1_DEEP: StageDef = {
  ...base, id: "ch1-deep", width: 2600, start: { x: 60 }, music: "night", time: "deep", leaves: "yellow",
  props: [{ key: "root_wall0", x: 530, id: "wall1", depth: 6 }, { key: "root_wall0", x: 1960, id: "wall2", depth: 6 }, { key: "giant_trunk1", x: 1400, depth: -5 }],
  mists: [{ x: 780, w: 160 }],
  shrines: [{ id: "deep-shrine", x: 1760 }],
  foes: [
    { kind: "sporePod", x: 990, min: 990, max: 990 }, { kind: "sporePod", x: 1040, min: 1040, max: 1040 },
    { kind: "greatCat", x: 1260, min: 1190, max: 1330 }, { kind: "rootDeer", x: 1580, min: 1500, max: 1660 },
  ],
  ally: {},
  examine: [
    { id: "roots1", x: 506, cutscene: "ch1.deep.roots", once: true, range: 24 },
    { id: "roots2", x: 1936, cutscene: "ch1.deep.roots2", once: true, range: 24 },
  ],
  blocks: [{ id: "w1", x: 520, until: "parted1" }, { id: "w2", x: 1950, until: "parted2" }],
  arena: { min: 2120, max: 2600, boss: { kind: "docDang", x: 2510, name: "boss.docDang", intro: "boss.docDang.intro", phases: ["boss.docDang.p2"] }, introScene: "i4.docDang.before", outcome: "ch1.deep.after" },
  opening: "ch1.deep.open",
};

/** I-5: the grove, the weeping node, Mộc Giác. */
export const CH1_GROVE: StageDef = {
  ...base, id: "ch1-grove", width: 1100, start: { x: 60 }, music: "night", time: "deep", leaves: "yellow",
  props: [{ key: "node_weeping", x: 1010, id: "node", depth: -3 }],
  ally: {},
  arena: {
    min: 300, max: 1090, boss: { kind: "mocGiac", x: 820, name: "boss.mocGiac", intro: "boss.mocGiac.intro" },
    introScene: "ch1.grove.intro", phaseScenes: ["i5.p2", "i5.p3"], outcome: "ch1.grove.after",
  },
};

/** I-6: the Cut. The cell at work over the severed node; the gauntlet; Hùng; Cương; Sẻ. */
export const CH1_CUT: StageDef = {
  ...base, id: "ch1-cut", width: 2500, start: { x: 60 }, music: "night", time: "afternoon", leaves: "none",
  props: [
    { key: "tent", x: 340, depth: -3 }, { key: "mach_bundle", x: 640, depth: -2 }, { key: "scaffold", x: 900, depth: -3 },
    { key: "tent", x: 1180, depth: -3 }, { key: "mach_bundle", x: 1290, depth: -2 }, { key: "scaffold", x: 1700, depth: -3 },
    { key: "cut_node", x: 2420, depth: -3 },
  ],
  npcs: [
    { id: "cuong", kind: "villager", look: "cuong", x: 2440, clip: "idle", facing: -1, hidden: true },
    { id: "se", kind: "villager", look: "se", x: 2200, clip: "lie", facing: -1, hidden: true },
  ],
  ally: {},
  foes: [
    { kind: "operative", x: 700, id: "op1" }, { kind: "operative", x: 770, id: "op2" },
    { kind: "operative", x: 1100, id: "op3" }, { kind: "operative", x: 1170, id: "op4" },
  ],
  cues: [{ on: "reGiu", cutscene: "i6.roots" }, { on: "snared", cutscene: "i6.net" }],
  triggers: [{ id: "cleared", cutscene: "ch1.cut.cleared", after: ["op1.down", "op2.down", "op3.down", "op4.down"] }],
  blocks: [{ id: "gauntlet", x: 1420, until: "gauntlet" }],
  arena: { min: 1900, max: 2380, boss: { kind: "hung", x: 2250, name: "boss.hung", intro: "boss.hung.intro", phases: ["boss.hung.p2"] }, introScene: "i6.hung", outcome: "ch1.cut.after" },
  opening: "ch1.cut.open",
};

/** I-7: back in Mộc Thành. Ngàn, the evidence, Toản's hook, the last night of the chapter. */
export const CH1_RETURN: StageDef = {
  ...base, id: "ch1-return", width: 2000, start: { x: 1500 }, music: "home", time: "night", leaves: "none", floor: "wood",
  shrines: [{ id: "ret-shrine", x: 1830 }],
  props: mocThanhProps,
  npcs: [
    { id: "ngan", kind: "villager", look: "ngan", x: 1760, clip: "idle", facing: -1 },
    { id: "toan", kind: "villager", look: "toan", x: 1640, clip: "idle", facing: 1 },
    { id: "warden", kind: "villager", look: "warden", x: 1580, clip: "idle", facing: 1 },
  ],
  ally: { x: 1470 },
  opening: "ch1.ret.open",
};

export const CH1_STAGES = [CH1_ROAD, CH1_MOCTHANH, CH1_TRAINING, CH1_TRAIL, CH1_KHE, CH1_DEEP, CH1_GROVE, CH1_CUT, CH1_RETURN];
