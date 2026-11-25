/**
 * Cutscenes (Phase 2): a scene is a list of steps the stage plays in order (src/scenes/Stage.ts runCutscene).
 * Lines are string-table keys; actors are "player" or an NPC id from the stage. Any cutscene can be skipped from the
 * pause menu: walks and waits complete at once, lines are dropped, and the final state is the same.
 */
import type { StringKey } from "./strings.vi";
import type { NpcClip } from "../clips";
import type { Track } from "../music";
import type { When } from "./stage";
import type { FlagName, FlagValue } from "../core/flags";

/** Sounds a cutscene can play (src/sfx.ts). */
export type CutSfx = "roar" | "far" | "heartbeat" | "peck" | "bark" | "door" | "bolt" | "creak" | "board" | "crash" | "hush" | "roots" | "rod";

/**
 * One step of a scene. Any step can be conditional: `when` on a story flag (C1, C2 shape the aftermath), `marks` on
 * stage marks (what the player has looked at). A step whose condition fails is passed over.
 */
export type Step = StepBody & { when?: When; marks?: string[] };
type StepBody =
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
  /** Write a story flag (saved at once). */
  | { flag: FlagName; value: FlagValue }
  /** Grow the herb pouch by `n` slots and refill it (the Father's spare satchel, S8). */
  | { pouch: number }
  /** A prop trembles (the third rod on the well, S2). */
  | { shiver: string }
  /** The end of the playable slice: the closing card with this text. */
  | { end: StringKey }
  | { wait: number }
  | { leaf: { from: number; to: number; top: number } }
  | { hideProp: string }
  | { bag: string }
  | { camera: number | "follow" }
  | { toast: StringKey }
  | { goto: string; card?: StringKey[] };

const P = "who.player", F = "who.father", DAN = "who.baDan", HM = "who.headman", M1 = "who.man1", VL = "who.villager", K = "who.keeper", VL2 = "who.villager2";
const SPARED = { flag: "PRO_SOW_SPARED", is: true } as const, KILLED = { flag: "PRO_SOW_SPARED", is: false } as const;
const TOLD = { flag: "PRO_VILLAGE_TOLD", is: true } as const, KEPT = { flag: "PRO_VILLAGE_TOLD", is: false } as const;

export const CUTSCENES: Record<string, Step[]> = {
  /* ---------------- S2 "Cái giếng cạn" (Ch1; spec §3 S2, §13 beat 1) ---------------- */

  "s2.open": [
    { wait: 400 },
    { say: "s2.n1" }, { say: "s2.n2" }, { say: "s2.n3" }, { say: "s2.n4" },
    { toast: "s2.hint" },
  ],
  "s2.dan": [{ face: "player", dir: 1 }, { say: "s2.d1", who: DAN }, { say: "s2.d2", who: DAN }],
  "s2.headman": [{ say: "s2.h1", who: HM }, { say: "s2.h2", who: P }, { say: "s2.h3", who: HM }],
  "s2.keeper": [{ say: "s2.k0" }, { say: "s2.k1", who: K }],
  "s2.crowd": [
    { say: "s2.c1" }, { say: "s2.c2" }, { say: "s2.c3" },
    { say: "s2.c4", who: VL }, { say: "s2.c5", who: VL2 }, { say: "s2.c6", who: VL },
    { say: "s2.c7" },
  ],
  /** The well: the rods, the third one trembles, "Không." The keeper: "Đất không còn giữ được nó nữa." */
  "s2.well": [
    { walk: "player", to: 524 }, { face: "player", dir: 1 },
    { say: "s2.w1" }, { say: "s2.w2" }, { say: "s2.w3" },
    { say: "s2.w4", who: VL },
    { say: "s2.w5" },
    { walk: "keeper", to: 452, nowait: true },
    { walk: "player", to: 580 }, { face: "player", dir: -1 },
    { showProp: "father" }, { walk: "father", to: 518 }, { face: "father", dir: 1 },
    { say: "s2.w6" }, { say: "s2.w7" },
    { say: "s2.w8" },
    { pose: "father", clip: "kneel" },
    { say: "s2.w9" },
    { say: "s2.w10" }, { say: "s2.f1", who: F },
    { showProp: "rod" },
    { say: "s2.w11" }, { say: "s2.w12" },
    { wait: 700 },
    { say: "s2.w13" },
    { shiver: "rod" },
    { say: "s2.w14" },
    { say: "s2.p1", who: P }, { face: "father", dir: 1 }, { say: "s2.f2", who: F },
    { say: "s2.w15" }, { say: "s2.w16" },
    { face: "keeper", dir: 1 },
    { say: "s2.k2", who: K },
    { say: "s2.w17" },
    { say: "s2.k3", who: K },
    { say: "s2.w18" },
    { hideProp: "rod" }, { pose: "father", clip: "idle" },
    { say: "s2.f3", who: F },
    { say: "s2.d3", who: DAN },
    { say: "s2.f4", who: F },
    { say: "s2.d4", who: DAN },
    { say: "s2.f5", who: F },
    { say: "s2.w19" },
    { wait: 400 },
    { goto: "prologue-s3" },
  ],

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
  /* ---------------- S8 "Lối rễ" (prose Ch. 2; spec §3 S8, §12, §13 beats 4–5) ---------------- */

  /** After C2, at the square: what the village says, and the two decisions of one day (C1 and C2 both shape it). */
  "s8.open": [
    { wait: 500 },
    { say: "s8.sp1", who: VL, when: SPARED }, { say: "s8.sp2", who: P, when: SPARED },
    { say: "s8.sp3", who: VL, when: SPARED }, { say: "s8.sp4", who: VL2, when: SPARED }, { say: "s8.sp5", when: SPARED },
    { say: "s8.kl1", who: VL, when: KILLED }, { say: "s8.kl2", when: KILLED }, { say: "s8.kl3", when: KILLED },
    { say: "s8.c1kept", when: KEPT }, { say: "s8.c1told", when: TOLD },
    { say: "s8.c2spared", when: SPARED }, { say: "s8.c2killed", when: KILLED },
    { say: "s8.two" }, { say: "s8.why" },
    { toast: "s8.hint" },
  ],
  /** The keeper's hint (spec §13 beat 4): optional; speaking to him sets PRO_KEEPER_HINT. */
  "s8.keeper": [
    { flag: "PRO_KEEPER_HINT", value: true },
    { face: "player", dir: -1 },
    { say: "s8.k1" }, { say: "s8.k2" }, { say: "s8.k3" },
    { say: "s8.k4", who: K }, { say: "s8.k5", who: P },
    { say: "s8.k6" },
    { say: "s8.k7", who: K }, { say: "s8.k8", who: P },
    { say: "s8.k9" },
    { say: "s8.k10", who: K },
    { say: "s8.k11" },
    { say: "s8.k12", who: K },
    { say: "s8.k13", who: P },
    { say: "s8.k14", who: K },
    { say: "s8.k15" },
    { face: "keeper", dir: -1 },
    { say: "s8.k16" },
    { say: "s8.k17", who: K },
    { say: "s8.k18" },
  ],
  "s8.home": [{ say: "s8.h1" }, { say: "s8.h2" }],
  /** The Father's spare satchel and the red thread (PB L1): the silhouette anchors; the pouch grows by one. */
  "s8.satchel": [
    { say: "s8.s1" }, { say: "s8.s2" },
    { hideProp: "satchel" },
    { say: "s8.s3" },
    { say: "s8.s4", who: P }, { say: "s8.s5", who: F },
    { say: "s8.s6" }, { say: "s8.s7" }, { say: "s8.s8" },
    { item: "spareSatchel" }, { pouch: 1 },
  ],
  "s8.diep": [{ say: "s8.dp1" }, { say: "s8.dp2" }, { say: "s8.dp3" }, { say: "s8.dp4" }, { say: "s8.dp5" }],
  /** The roots part for the half Mạch Ấn (FB F3). */
  "s8.roots": [
    { say: "s8.r1" }, { say: "s8.r2" }, { say: "s8.r3" },
    { say: "s8.r4" }, { sfx: "roots" },
    { say: "s8.r5" }, { say: "s8.r6", who: P },
    { say: "s8.r7" },
    { place: { id: "machAn", key: "mach_an0", at: "player", dy: -30 } },
    { pulse: 2 },
    { say: "s8.r8" },
    { walk: "player", to: 1262 }, { face: "player", dir: 1 },
    { say: "s8.r9" },
    { say: "s8.r10" },
    { sfx: "roots" }, { setProp: { id: "rootWall", key: "root_wall1" } }, { mark: "parted" },
    { say: "s8.r11" },
    { hideProp: "machAn" },
    { say: "s8.r12", who: P },
    { say: "s8.r13" },
  ],
  "s8.forest": [{ wait: 400 }, { say: "s8.f1" }, { say: "s8.f2" }],
  "s8.deer": [{ say: "s8.e1" }, { say: "s8.e2" }, { say: "s8.e3" }, { say: "s8.e4" }],
  "s8.clearing": [{ say: "s8.t1" }, { say: "s8.t2" }, { toast: "s8.t.hint" }],
  "s8.housing": [{ say: "s8.t3" }, { say: "s8.t4" }, { say: "s8.t5" }],
  "s8.prints": [{ say: "s8.t6" }, { say: "s8.t7" }],
  "s8.ground": [{ say: "s8.t8" }, { say: "s8.t9" }, { say: "s8.t10" }],
  /**
   * The dropped rod (spec §13 beat 5): "Họ bắt cha đi." Then the camera shows the undisturbed ground he does not look
   * at. Having read every clue first (housing, prints, ground) sets PRO_STATION_READ.
   */
  "s8.rod": [
    { walk: "player", to: 884 }, { face: "player", dir: 1 },
    { say: "s8.t11" }, { say: "s8.t12" },
    { hideProp: "rod" },
    { say: "s8.t13" }, { say: "s8.t14" },
    { flag: "PRO_STATION_READ", value: true, marks: ["housing", "prints", "ground"] },
    { say: "s8.t15", who: P },
    { camera: 812 }, { wait: 2200 }, { camera: "follow" },
    { say: "s8.t16" }, { say: "s8.t17" },
    { item: "thirdRod" },
    { say: "s8.t18" }, { say: "s8.t19" }, { say: "s8.t20" }, { say: "s8.t21" },
    { say: "s8.t22" }, { say: "s8.t23" },
    { walk: "player", to: 960 },
    { end: "end.prologue" },
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

