/**
 * Cutscenes (Phase 2): a scene is a list of steps the stage plays in order (src/scenes/Stage.ts runCutscene).
 * Lines are string-table keys; actors are "player" or an NPC id from the stage. Any cutscene can be skipped from the
 * pause menu: walks and waits complete at once, lines are dropped, and the final state is the same.
 */
import type { StringKey } from "./strings.vi";
import type { NpcClip } from "../clips";
import type { Track } from "../music";

/** Sounds a cutscene can play (src/sfx.ts). */
export type CutSfx = "roar" | "far" | "heartbeat" | "peck" | "bark" | "door" | "bolt" | "creak" | "board" | "crash" | "hush";

export type Step =
  | { say: StringKey; who?: StringKey }
  /** `nowait`: start the walk and go straight on (several people moving at once). */
  | { walk: string; to: number; nowait?: boolean }
  | { face: string; dir: 1 | -1 }
  | { pose: string; clip: NpcClip }
  /** A choice (src/data/dialogue.ts): its flags save at once, then the branch for the outcome plays. Skipping stops here. */
  | { choose: string; then: Record<string, string> }
  /** Set a stage mark (unlocks `after` gates in the stage data). */
  | { mark: string }
  | { sfx: CutSfx }
  | { shake: number }
  /** The scar on his chest flares with the Mạch Ấn, `n` beats, the last on his own heartbeat (S5; Ch1). */
  | { pulse: number }
  /** Move a prop by (dx, dy) over `ms`; `hide` it at the end (a bird flying off, the bed pushed aside). */
  | { tween: { id: string; dx?: number; dy?: number; ms: number; hide?: boolean } }
  | { setProp: { id: string; key: string } }
  | { showProp: string }
  /** Put an image at the hero's hands (`at: "player"`) or at x: the Mạch Ấn in his palm. */
  | { place: { id: string; key: string; at: "player" | number; dy?: number } }
  /** A flock of panicked birds across the sky (S4). */
  | { flock: number }
  /** A key item into the save (the half Mạch Ấn). */
  | { item: string }
  | { music: Track }
  | { wait: number }
  | { leaf: { from: number; to: number; top: number } }
  | { hideProp: string }
  | { bag: string }
  | { camera: number | "follow" }
  | { toast: StringKey }
  | { goto: string; card?: StringKey[] };

const P = "who.player", F = "who.father", DAN = "who.baDan", HM = "who.headman", M1 = "who.man1", VL = "who.villager";

export const CUTSCENES: Record<string, Step[]> = {
  /** Prologue S3, on entering: noon at home (Ch1). */
  "s3.open": [
    { wait: 400 },
    { say: "s3.n1" },
    { say: "s3.n2" },
    { toast: "s3.hint" },
  ],
  /** Prologue S3, "Bữa trưa" (spec §3, §13 beat 2; Ch1): the Father leaves. */
  "s3.main": [
    { walk: "player", to: 196 },
    { face: "player", dir: 1 },
    { say: "s3.p1", who: P }, { say: "s3.f1", who: F },
    { say: "s3.p2", who: P }, { say: "s3.f2", who: F },
    { say: "s3.p3", who: P }, { say: "s3.f3", who: F },
    { say: "s3.n3" },
    { say: "s3.p4", who: P },
    { face: "father", dir: -1 },
    { say: "s3.n4" },
    { say: "s3.f4", who: F },
    { say: "s3.p5", who: P }, { say: "s3.f5", who: F },
    { say: "s3.p6", who: P }, { say: "s3.f6", who: F },
    { say: "s3.n5" },
    // the yellow leaf
    { camera: 360 },
    { leaf: { from: 408, to: 372, top: 200 } },
    { say: "s3.n6" },
    { say: "s3.n7" },
    { pose: "father", clip: "stand" },
    { wait: 300 },
    { face: "father", dir: 1 },
    { walk: "father", to: 366 },
    { pose: "father", clip: "crouch" },
    { hideProp: "leaf" },
    { wait: 500 },
    { pose: "father", clip: "hold" },
    { say: "s3.n8" },
    { walk: "player", to: 330 },
    { face: "player", dir: 1 },
    { face: "father", dir: -1 },
    { say: "s3.p7", who: P }, { say: "s3.f7", who: F },
    { say: "s3.p8", who: P }, { say: "s3.f8", who: F },
    { say: "s3.p9", who: P }, { say: "s3.f9", who: F },
    { say: "s3.n9" },
    { say: "s3.f10", who: F },
    { say: "s3.p10", who: P },
    // the hand that pulls back
    { wait: 700 },
    { pose: "father", clip: "offer" },
    { wait: 900 },
    { pose: "father", clip: "drop" },
    { say: "s3.n10" },
    { pose: "father", clip: "idle" },
    { say: "s3.f11", who: F },
    // he takes his bag from the house and stops beside his son on the way out
    { camera: "follow" },
    { walk: "father", to: 192 },
    { bag: "father" },
    { hideProp: "bag" },
    { wait: 400 },
    { walk: "father", to: 352 },
    { face: "father", dir: -1 },
    { say: "s3.f12", who: F },
    { say: "s3.p11", who: P },
    { say: "s3.f13", who: F },
    { say: "s3.f14", who: F },
    { face: "father", dir: 1 },
    { walk: "father", to: 640 },
    { wait: 300 },
    { goto: "prologue-s4", card: ["card.s3s4"] },
  ],

  /* ---------------- S4 "Buổi chiều lệch" (Ch1; spec §3 S4, §7 C1) ---------------- */

  /** The afternoon: the old tree drops its leaves, the birds flee the forest, one falls into the yard. */
  "s4.open": [
    { wait: 500 },
    { say: "s4.n1" }, { say: "s4.n2" }, { say: "s4.n3" },
    { flock: 5 }, { wait: 900 },
    { say: "s4.n4" },
    { flock: 12 }, { wait: 700 },
    { showProp: "bird" }, { sfx: "peck" },
    { say: "s4.n5" },
    { toast: "s4.hint" },
  ],
  "s4.bird": [
    { walk: "player", to: 282 }, { face: "player", dir: 1 },
    { say: "s4.b1" }, { say: "s4.b2" }, { say: "s4.b3" },
    { sfx: "peck" }, { shake: 6 },
    { say: "s4.b4" },
    { setProp: { id: "bird", key: "bird0" } },
    { tween: { id: "bird", dx: -360, dy: -150, ms: 1500, hide: true } },
    { say: "s4.b5" },
  ],
  "s4.dan": [
    { face: "player", dir: 1 }, { face: "baDan", dir: -1 },
    { say: "s4.d1", who: DAN }, { say: "s4.d2", who: P },
    { say: "s4.d3", who: DAN }, { say: "s4.d4", who: DAN },
    { say: "s4.d5" },
  ],
  /** The four men come back from the station road: "Chúng mọc lại." Then the headman asks him (C1). */
  "s4.men": [
    { walk: "player", to: 1096 }, { face: "player", dir: 1 },
    { say: "s4.m0" }, { say: "s4.m1" },
    { camera: 1180 },
    { walk: "man1", to: 1180, nowait: true }, { walk: "man2", to: 1206, nowait: true }, { walk: "man3", to: 1230, nowait: true },
    { walk: "man4", to: 1254 },
    { face: "headman", dir: 1 },
    { say: "s4.m2" },
    { say: "s4.m3", who: M1 }, { say: "s4.m4", who: HM },
    { say: "s4.m5" },
    { say: "s4.m6", who: M1 }, { say: "s4.m7", who: VL }, { say: "s4.m8", who: M1 },
    { say: "s4.m9" },
    { say: "s4.m10", who: M1 }, { say: "s4.m11", who: VL }, { say: "s4.m12", who: M1 },
    { wait: 500 },
    { say: "s4.m13" },
    { camera: "follow" },
    { face: "headman", dir: -1 }, { walk: "headman", to: 1122 }, { face: "headman", dir: -1 },
    { say: "s4.m14" },
    { choose: "c1", then: { told: "s4.told", kept: "s4.kept" } },
  ],
  "s4.told": [
    { say: "s4.t1", who: P },
    { say: "s4.t2" },
    { say: "s4.t3", who: HM },
    { say: "s4.t4" },
    { say: "s4.t5", who: HM }, { say: "s4.t6", who: HM },
    { say: "s4.t7" },
    { goto: "prologue-s5", card: ["card.s4s5.a", "card.s4s5.b"] },
  ],
  "s4.kept": [
    { say: "s4.k1", who: P },
    { say: "s4.k2" },
    { say: "s4.k3", who: HM }, { say: "s4.k4", who: HM },
    { say: "s4.k5" },
    { goto: "prologue-s5", card: ["card.s4s5.a", "card.s4s5.b"] },
  ],

  /* ---------------- S5 "Căn phòng của cha" (Ch1; spec §3 S5, §13 beat 3) ---------------- */

  "s5.open": [
    { wait: 300 }, { sfx: "creak" },
    { say: "s5.n1" }, { say: "s5.n2" },
    { toast: "s5.hint" },
  ],
  "s5.bowl": [{ say: "s5.bowl" }, { hideProp: "bowl" }],
  "s5.bolt": [
    { face: "player", dir: -1 },
    { say: "s5.f13", who: F }, { say: "s5.b1" },
    { sfx: "bolt" }, { setProp: { id: "door", key: "front_door1" } },
    { say: "s5.b2" }, { say: "s5.b3" }, { say: "s5.b4" },
  ],
  "s5.knife": [
    { say: "s5.k1" },
    { setProp: { id: "rack", key: "rack0" } },
    { say: "s5.k2" }, { say: "s5.k3" },
    { say: "s5.k4", who: P }, { say: "s5.k5" },
  ],
  /** Once the door is bolted and the knife taken down: the sound from the forest, the dogs go quiet. */
  "s5.sound": [
    { wait: 900 },
    { sfx: "far" }, { shake: 4 },
    { say: "s5.s1" }, { say: "s5.s2" },
    { wait: 600 }, { sfx: "far" },
    { say: "s5.s3" },
    { sfx: "hush" },
    { say: "s5.s4" }, { say: "s5.s5" },
    { say: "s5.s6" },
    { sfx: "door" }, { hideProp: "roomDoor" },
    { walk: "player", to: 262 },
    { say: "s5.s7" },
    { mark: "room" },
  ],
  "s5.desk": [{ say: "s5.desk1" }, { say: "s5.desk2" }],
  "s5.box": [
    { say: "s5.box1" },
    { sfx: "creak" }, { showProp: "box" },
    { say: "s5.box2" },
    { showProp: "dust" },
  ],
  "s5.dust": [{ say: "s5.dust1" }, { say: "s5.dust2" }, { say: "s5.dust3" }],
  "s5.bed": [
    { say: "s5.bed1" },
    { sfx: "creak" }, { tween: { id: "bed", dx: 46, ms: 1300 } }, { tween: { id: "box", dx: 46, ms: 10 } },
    { say: "s5.bed2" },
    { showProp: "board" },
    { say: "s5.bed3" },
  ],
  /** The half Mạch Ấn (spec §13 beat 3): it pulses three times; the third beat is his heart. */
  "s5.board": [
    { say: "s5.a1" }, { face: "player", dir: -1 }, { say: "s5.a2", who: P }, { face: "player", dir: 1 },
    { sfx: "board" }, { setProp: { id: "board", key: "board1" } },
    { say: "s5.a3" }, { say: "s5.a4" }, { say: "s5.a5" },
    { place: { id: "machAn", key: "mach_an0", at: "player", dy: -30 } },
    { say: "s5.a6" }, { say: "s5.a7" }, { say: "s5.a8" }, { say: "s5.a9" },
    { say: "s5.a10" },
    { setProp: { id: "machAn", key: "mach_an1" } }, { wait: 500 }, { setProp: { id: "machAn", key: "mach_an0" } },
    { say: "s5.a11" },
    { pulse: 1 },
    { say: "s5.a12" }, { say: "s5.a13" },
    { pulse: 3 },
    { say: "s5.a14" }, { say: "s5.a15" },
    { sfx: "roar" }, { shake: 10 },
    { say: "s5.a16" },
    { item: "halfMachAn" }, { hideProp: "machAn" },
    { say: "s5.a17" }, { say: "s5.a18" }, { say: "s5.a19" },
    { goto: "prologue-s6", card: ["card.s5s6.a", "card.s5s6.b"] },
  ],

  /* ---------------- S6 "Đêm rừng đổi" (prose Ch. 2; spec §3 S6, §8 C1 consequences) ---------------- */

  "s6.open": [
    { wait: 300 },
    { say: "s6.o1" }, { say: "s6.o2" }, { say: "s6.f13", who: F },
    { say: "s6.o3", who: P }, { say: "s6.o4", who: P },
    { sfx: "bolt" }, { say: "s6.o5" },
    { music: "night" },
    { toast: "s6.hint" },
  ],
  "s6.stampede": [
    { sfx: "crash" },
    { say: "s6.st1" }, { say: "s6.st2" },
  ],
  /** C1 kept: bà Dần's porch is down and her husband is under the frame. */
  "s6.trapped": [
    { mark: "dan" },
    { walk: "player", to: 748 }, { face: "player", dir: 1 },
    { say: "s6.k1" }, { say: "s6.k2" },
    { say: "s6.k3", who: P },
    { pose: "baDan", clip: "idle" }, { walk: "baDan", to: 726 }, { face: "baDan", dir: 1 },
    { walk: "player", to: 800 },
    { say: "s6.k4" },
    { sfx: "creak" }, { shake: 4 },
    { say: "s6.k5" },
    { sfx: "crash" }, { tween: { id: "frame", dy: -7, ms: 300 } },
    { say: "s6.k6" },
    { tween: { id: "ongDan", dx: -30, ms: 900 } },
    { tween: { id: "frame", dy: 7, ms: 150 } }, { sfx: "crash" },
    { say: "s6.k7" },
    { say: "s6.boar1" },
    { mark: "rboar" },
    { say: "s6.boar2" },
  ],
  /** C1 told: the house stands, the gate is stoned up. The rooted boar comes anyway. */
  "s6.ready": [
    { mark: "dan" },
    { walk: "player", to: 748 }, { face: "player", dir: 1 },
    { say: "s6.r1" },
    { say: "s6.r2", who: DAN },
    { sfx: "crash" },
    { say: "s6.r3" },
    { mark: "rboar" },
    { say: "s6.boar2" },
  ],
  "s6.after": [
    { say: "s6.a1" }, { say: "s6.a2" }, { say: "s6.a3" },
  ],
  "s6.square.kept": [
    { walk: "player", to: 1100 }, { face: "player", dir: 1 },
    { face: "headman", dir: 1 }, // he looks at the roofs, not at him
    { say: "s6.q1" }, { say: "s6.q2" }, { say: "s6.q3" }, { say: "s6.q4" },
    { wait: 400 },
    { goto: "prologue-s7", card: ["card.s6s7.a", "card.s6s7.b"] },
  ],
  "s6.square.told": [
    { walk: "player", to: 1100 }, { face: "player", dir: 1 },
    { say: "s6.qt1" },
    { say: "s6.qt2", who: HM }, { say: "s6.qt3", who: VL },
    { face: "headman", dir: 1 }, { wait: 900 }, { face: "headman", dir: -1 },
    { say: "s6.qt4" },
    { wait: 400 },
    { goto: "prologue-s7", card: ["card.s6s7.a", "card.s6s7.b"] },
  ],
};

