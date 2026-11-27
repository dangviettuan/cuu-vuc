import Phaser from "phaser";
import { Player, Controls, PlayerEvent } from "../player";
import { Boar, Bush, EnemyEvent, NanhRe, RootSpike, Runner, configureEnemies, setEnemyDifficulty } from "../enemies";
import { EnemyHit, Hittable, PlayerHit, overlaps } from "../combat";
import { Animator } from "../anim";
import { ANTIDOTE_GLINT, HERB_GLINT, SHRINE_LIT } from "../clips";
import { Fx } from "../fx";
import { sfx } from "../sfx";
import { music } from "../music";
import { KIT, KitId, PLAYER, VIEW, WORLD, kitOverride, setKit } from "../tuning";
import { rebuildHero } from "../art";
import { buildOutlines } from "../outline";
import { input } from "../core/input";
import { t, StringKey } from "../core/i18n";
import { Rng, runSeed } from "../core/rng";
import { onSettings, settings } from "../core/settings";
import { addItem, addMachAn, enterStage, getFlag, hasMachAn, markDone, removeItem, save, saveAtCheckpoint, setFlag } from "../core/save";
import { DIFFICULTY } from "../data/difficulty";
import { FIRST_STAGE, STAGES } from "../data/stages";
import type { StageDef, When } from "../data/stage";
import { RE_GIU, STAMPEDE } from "../data/enemies";
import { SCRIPTS } from "../data/dialogue";
import { CUTSCENES, CutSfx, Step } from "../data/cutscenes";
import { Npc } from "../npc";
import { Ally } from "../ally";
import { Fighter, Shot } from "../foe";
import { FOES } from "../data/foes";
import type { DiepClip } from "../clips";
import { text } from "../ui/text";
import type { UIScene } from "./UI";

/** Arena walls sit *inside* the camera bounds so the hero's drawn sprite (wider than its 10 px body) is never cut off at the edge. */
const ARENA_WALL = 16;
/** Same idea at the two ends of the world. */
const EDGE = 12;

/** new: a fresh game · continue: from the save's checkpoint · enter: arriving from the previous stage · quick: test tools. */
export type StageMode = "new" | "continue" | "enter" | "quick";
export interface StageInit { mode: StageMode }

interface Herb { id: string; img: Phaser.GameObjects.Image; anim: Animator; baseY: number; phase: number; taken: boolean; kind: "herb" | "antidote"; }
interface Mist { x: number; w: number; rate: number; puffs: { img: Phaser.GameObjects.Image; x: number; y: number; phase: number }[]; until: number; haze: Phaser.GameObjects.Rectangle[] }
interface Drift { img: Phaser.GameObjects.Image; x: number; y: number; vx: number; vy: number; phase: number; }
interface Sign { x: number; key: StringKey; label: Phaser.GameObjects.Text; }
/** Something the interact key does when the hero stands near it: rest at a shrine, look at a thing, talk to someone. */
interface Interactable { x: number; range: number; y: number; act: () => void; when?: () => boolean; quiet?: () => boolean; priority?: number; at?: () => number; }
/** A prop that cycles frames (a barking dog, a bird beating its wings), with an optional sound on its second frame. */
interface PropAnim { img: Phaser.GameObjects.Image; frames: string[]; ms: number; t: number; i: number; sound?: CutSfx; heardAt: number; }
interface Block { x: number; prop?: string; until?: string; wall: Phaser.GameObjects.Rectangle | null; }
interface Bird { img: Phaser.GameObjects.Image; vx: number; vy: number; phase: number; }

/**
 * A playable stage, built from data (src/data/stages). The Prologue greybox runs S1 (morning chores) → S3 (lunch) →
 * S4 (the afternoon, C1) → S5 (the Father's room) → S6 (the village at night) → S7 (Nanh Rễ, C2); exits and cutscenes
 * carry the hero on, with narration cards between. The story layer (marks, triggers, flag conditions) is `updateStory`.
 * Sources: docs/04-chapters/prologue-an-moc-v0.1.md, docs/05-gameplay/combat-class-bible-v0.1.md.
 *
 * - **Time model:** `sim` is gameplay time. Hit-stop freezes `sim` (and physics, and character animation) while FX,
 *   camera shake and UI keep running on real time, so impacts read as heavy.
 * - **UI** (HUD, toasts, dialogue, pause) is the parallel `UI` scene, so it is unaffected by the world camera.
 * - **Saving** happens at shrines and on choices (src/core/save.ts, ADR-0006).
 */
export class StageScene extends Phaser.Scene {
  def!: StageDef;
  mode: StageMode = "new";
  player!: Player;
  /** Dark 1 px outline drawn just under the hero, above enemies (outline.ts). */
  private playerOutline!: Phaser.GameObjects.Image;
  private bg!: Phaser.GameObjects.TileSprite;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private fx!: Fx;
  boars: Boar[] = [];
  /** Ch. I enemies (the data-driven fighter, src/foe.ts). */
  foes: Fighter[] = [];
  private shots: Shot[] = [];
  bushes: Bush[] = [];
  boss: NanhRe | Fighter | null = null;
  private roots: RootSpike[] = [];
  private herbs: Herb[] = [];
  private signs: Sign[] = [];
  private piglets: Phaser.GameObjects.Sprite[] = [];
  private tufts: Phaser.GameObjects.Image[] = [];
  private motes: Drift[] = [];
  private leaves: Drift[] = [];
  private shrine: Phaser.GameObjects.Image | null = null;
  private shrineAnim: Animator | null = null;
  npcs = new Map<string, Npc>();
  /** Diệp, when she fights beside him (Ch. I). */
  ally: Ally | null = null;
  private props = new Map<string, Phaser.GameObjects.Image>();
  private interactables: Interactable[] = [];
  /** Story marks set in this visit to the stage (cutscenes, things used): they open `after` gates in the stage data. */
  marks = new Set<string>();
  /** Cutscenes already played in this visit (triggers and one-time talks run once). */
  private played = new Set<string>();
  private propAnims: PropAnim[] = [];
  private blocks: Block[] = [];
  private runners: Runner[] = [];
  private stampedeAt = 0;
  private stampedeCue = 0;
  private birds: Bird[] = [];
  private stageRng = new Rng(1);
  /** I-2 training: the defences counted so far. */
  trained = 0;
  private mists: Mist[] = [];
  /** Rễ Giữ: the hero carries it, and when it can fire again (sim time). */
  reGiu = false;
  reGiuReady = 0;
  /** The cutscene playing, if any (gameplay input is locked; the pause menu can skip it). */
  cutscene: string | null = null;
  private skipping = false;
  /** A scripted walk for the hero (cutscenes): the target x and what to call on arrival. */
  private heroWalk: { to: number; done: () => void } | null = null;
  private leaving = false;
  /** Set when the scene shuts down, so a cutscene still awaiting a step stops instead of acting on a dead stage. */
  private gone = false;
  private leafKey = "leaf";
  shrineLit = false;
  /** One-time world changes used up in this playthrough (herbs, brush): saved at the shrine. */
  private taken = new Set<string>();
  private checkpoint: { x: number; y: number } = { x: 60, y: WORLD.groundY };
  engaged = false;
  finished = false;
  choosing = false;
  private debugG!: Phaser.GameObjects.Graphics;
  private debugText!: Phaser.GameObjects.Text;
  private showDebug = false;
  private keyHint!: Phaser.GameObjects.Text;
  /** Counter cue over the hero just after a parry (cloud playtest: the parry → strike needed a clear cue). */
  private jHint!: Phaser.GameObjects.Text;
  private floatText!: Phaser.GameObjects.Text;
  private floatUntil = 0;
  /** Gameplay (simulation) time in ms; does not advance during hit-stop. */
  sim = 0;
  private hitstopLeft = 0;
  private lookAhead = 0;
  private windAt = 0;
  private frameMs = 0;
  seed = 0;
  private readonly incoming: EnemyHit[] = [];
  private readonly targets: Hittable[] = [];
  private unsub: (() => void)[] = [];

  constructor() { super("Stage"); }

  init(data: StageInit): void { this.mode = data?.mode ?? "new"; }

  get ui(): UIScene { return this.scene.get("UI") as UIScene; }
  /** For tests: the first brush on the path. */
  get bush(): Bush | undefined { return this.bushes[0]; }
  get arena(): StageDef["arena"] { return this.def.arena; }

  create(): void {
    const sv = save();
    this.def = STAGES[sv?.stage ?? FIRST_STAGE] ?? STAGES[FIRST_STAGE];
    const def = this.def, cont = this.mode === "continue" && !!sv;
    this.sim = 0; this.hitstopLeft = 0; this.engaged = false; this.finished = false; this.choosing = false;
    this.boars = []; this.bushes = []; this.roots = []; this.herbs = []; this.signs = []; this.piglets = []; this.tufts = []; this.motes = []; this.leaves = [];
    this.gone = false;
    this.npcs = new Map(); this.props = new Map(); this.interactables = []; this.cutscene = null; this.skipping = false; this.heroWalk = null; this.leaving = false; this.boss = null;
    this.mists = []; this.reGiuReady = 0; this.ally = null; this.foes = []; this.shots = []; this.trained = 0;
    this.marks = new Set(); this.played = new Set(); this.propAnims = []; this.blocks = []; this.runners = []; this.birds = []; this.stampedeAt = 0; this.stampedeCue = 0; this.inChoice = false;
    // what was used up and the pouch carry across stages (the save holds them; a fresh game starts empty)
    this.taken = new Set(sv?.taken ?? []);
    // The class chosen in Ch. I (CH1_CLASS) sets the kit, and with it the weapon the hero is drawn with.
    const cls = getFlag("CH1_CLASS");
    setKit(kitOverride() ?? (cls === "kiem" || cls === "anh" ? (cls as KitId) : "prologue"));
    if (rebuildHero(this, KIT.weapon)) buildOutlines(this, "p_");
    this.checkpoint = { x: def.start.x, y: def.groundY };
    this.seed = runSeed();
    configureEnemies(new Rng(this.seed), DIFFICULTY[settings().difficulty]);
    this.stageRng = new Rng(this.seed + 7);

    const camY = def.height - VIEW.height; // ADR-0009: the view is shorter than the world; the camera keeps to the ground lane
    this.physics.world.setBounds(EDGE, -200, def.width - EDGE * 2, def.height + 200);
    this.cameras.main.setBounds(0, camY, def.width, VIEW.height).setRoundPixels(true).setBackgroundColor("#1b2a1e");

    // Parallax: Thanh Mộc mood A (concept pick), drawn at ×4.
    this.bg = this.add.tileSprite(0, 0, VIEW.width, VIEW.height, "bg_thanhmoc").setOrigin(0).setScrollFactor(0).setTileScale(4, 4).setDepth(-10);
    this.bg.tilePositionY = Math.round(camY / 4); // keep the backdrop aligned with the world as it was at 640×360
    const mid = this.add.graphics().setScrollFactor(0.5).setDepth(-5);
    const night = def.time === "night", indoor = def.time === "indoor";
    if (indoor) { this.bg.setVisible(false); this.cameras.main.setBackgroundColor("#120d09"); }
    for (let i = 0; i < (indoor ? 0 : 18); i++) {
      const x = i * 90 + (i % 3) * 23, w = 18 + (i % 4) * 6;
      mid.fillStyle(night ? 0x141a1c : 0x2c3a26, 1).fillRect(x, 0, w, def.groundY);
      mid.fillStyle(night ? 0x1c2426 : 0x354630, 1).fillRect(x + 3, 0, 2, def.groundY);
    }
    if (night) {
      // Night (S7): only the backdrop darkens; the ground lane, characters and tells keep their colours, so combat
      // stays as readable as by day. A cold wash over the sky and trunks, and a faint moon glow high up.
      this.add.rectangle(0, 0, VIEW.width, VIEW.height, 0x070b18, 0.62).setOrigin(0).setScrollFactor(0).setDepth(-4.5);
      this.add.circle(VIEW.width * 0.78, 34, 14, 0xdfe6f0, 0.55).setScrollFactor(0).setDepth(-4.4);
      this.cameras.main.setBackgroundColor("#0a0e14");
    } else if (def.time === "noon") {
      this.add.rectangle(0, 0, VIEW.width, VIEW.height, 0xfff2c8, 0.08).setOrigin(0).setScrollFactor(0).setDepth(-4.5);
    } else if (def.time === "deep") {
      // Rừng Sâu (Ch. I): the canopy closes; green-black over the backdrop, the lane still lit enough to fight in
      this.add.rectangle(0, 0, VIEW.width, VIEW.height, 0x0a1a10, 0.55).setOrigin(0).setScrollFactor(0).setDepth(-4.5);
      this.cameras.main.setBackgroundColor("#0c160e");
    } else if (def.time === "dawn") {
      // S8: the cold grey before the sun, the sky paling (the lane keeps its colours)
      this.add.rectangle(0, 0, VIEW.width, VIEW.height, 0x2a3a52, 0.42).setOrigin(0).setScrollFactor(0).setDepth(-4.5);
      for (let i = 0; i < 8; i++) this.add.rectangle(0, VIEW.height * (0.5 + i * 0.0625), VIEW.width, VIEW.height * 0.0625, 0xc8a080, 0.012 * (i + 1)).setOrigin(0).setScrollFactor(0).setDepth(-4.45);
      this.cameras.main.setBackgroundColor("#1a2230");
    } else if (def.time === "afternoon") {
      // S4: a low sun, the light going amber over the backdrop (the lane keeps its colours)
      this.add.rectangle(0, 0, VIEW.width, VIEW.height, 0xff9a40, 0.16).setOrigin(0).setScrollFactor(0).setDepth(-4.5);
      this.add.circle(VIEW.width * 0.86, 70, 16, 0xffd08a, 0.55).setScrollFactor(0).setDepth(-4.4);
    }
    for (const pr of def.props ?? []) {
      if (!this.ok(pr.when)) continue;
      const img = this.add.image(pr.x, pr.y ?? def.groundY, pr.key).setOrigin(pr.left ? 0 : 0.5, 1).setDepth(pr.depth ?? -3).setVisible(!pr.hidden);
      if (pr.id) this.props.set(pr.id, img);
      if (pr.frames) this.propAnims.push({ img, frames: pr.frames, ms: pr.ms ?? 300, t: Math.random() * 300, i: 0, sound: pr.id === "dog" ? "bark" : undefined, heardAt: 0 });
    }
    if (indoor) { // the lamp's warmth in the middle of the house, the corners dark
      for (let i = 0; i < 7; i++) this.add.circle(110, def.groundY - 40, 36 + i * 18, 0xffb060, 0.03).setDepth(-2.5);
    }

    // Ground and ledges.
    this.solids = this.physics.add.staticGroup();
    this.platform(0, def.groundY, def.width, def.height - def.groundY, false, def.floor === "wood");
    for (const l of def.ledges) this.platform(l.x, l.y, l.w, 10, true);

    this.fx = new Fx(this, 180);
    this.ambience();

    // Player.
    this.player = new Player(this, def.start.x, def.groundY);
    this.playerOutline = this.add.image(0, 0, "p_idle0_ol").setOrigin(0.5, 1).setDepth(9.5);
    this.player.body2.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.solids);
    this.player.onEvent = (k) => this.onPlayerEvent(k);
    this.applyDifficulty();

    // Tutorial signs (string keys: their key labels follow rebinding and the device in use).
    for (const s of def.signs) this.sign(s.x, KIT.classKit && s.kiem ? s.kiem : s.text);
    for (const b of def.brush) {
      const bush = new Bush(this, b.x, b.id);
      this.physics.add.collider(this.player, bush.img);
      bush.onHit = (x, y) => { this.fx.leaves(x, y, 5); };
      bush.onCleared = () => { this.taken.add(bush.id); this.ui.toast(t("toast.brushCleared")); this.fx.leaves(bush.img.x, def.groundY - 12, 12); };
      if (this.taken.has(b.id)) bush.clear(false);
      this.bushes.push(bush);
    }
    for (const h of def.herbs) if (!this.taken.has(h.id)) this.addHerb(h.id, h.x, h.y ?? def.groundY - 6, h.kind ?? "herb");
    for (const m of def.mists ?? []) this.addMist(m.x, m.w, m.rate ?? 40);
    for (const id of def.grants ?? []) addMachAn(id);
    this.reGiu = hasMachAn("reGiu") || (typeof location !== "undefined" && new URLSearchParams(location.search).get("ma") === "regiu");
    this.spawnBoars();
    this.spawnFoes();

    // Shrine checkpoint (ADR-0006).
    const sh = def.shrines[0];
    this.shrine = null; this.shrineAnim = null; this.shrineLit = false;
    if (sh) {
      // a building the hero stands in front of (depth below the hero, above the backdrop props)
      this.shrine = this.add.image(sh.x, def.groundY + 2, "shrine_off").setOrigin(0.5, 1).setDepth(1);
      this.shrineAnim = new Animator(this.shrine);
      if (sh.sign) this.sign(sh.x - 92, sh.sign); // far enough left that its panel clears the shrine's key prompt
      this.interactables.push({ x: sh.x, range: 30, y: def.groundY - 66, act: () => this.rest(), quiet: () => this.shrineLit });
      if (cont && sv!.checkpoint === sh.id) {
        this.lightShrine(false);
        this.checkpoint = { x: sh.x + 20, y: def.groundY };
        this.player.setPosition(this.checkpoint.x, def.groundY);
      }
    }
    this.player.herbCap = sv?.herbCap ?? 0;
    this.player.antidoteCap = sv?.antidoteCap ?? 0;
    this.player.refillHerbs();

    // Diệp, fighting beside him (Ch. I–IV).
    if (def.ally) {
      const a = new Ally(this, def.ally.x ?? this.player.x - 30, def.groundY);
      this.physics.add.collider(a, this.solids);
      a.onEvent = (e) => {
        if (e === "down") { this.ui.toast(t("toast.diepDown"), 1600); sfx.hurt(); }
        else if (e === "up") this.ui.toast(t("toast.diepUp"), 1200);
        else if (e === "swing") sfx.swing(0);
      };
      this.ally = a;
    }

    // People, and things to look at or use.
    for (const n of def.npcs ?? []) {
      if (!this.ok(n.when)) continue;
      const npc = new Npc(this, n.x, n.y ?? def.groundY, n.id, n.clip, n.facing ?? 1, n.kind === "villager" ? n.look : undefined, n.rest);
      if (n.bag) { npc.bag = true; npc.pose(n.clip); }
      if (n.hidden) npc.setVisible(false);
      this.npcs.set(n.id, npc);
    }
    for (const ex of def.examine ?? []) {
      if (!this.ok(ex.when)) continue;
      const use = () => { this.marks.add(ex.id); if (ex.cutscene) void this.runCutscene(ex.cutscene); else if (ex.text) this.ui.line(null, ex.text); };
      this.interactables.push({ x: ex.x, range: ex.range ?? 16, y: def.groundY - 50, act: use,
        when: () => (!ex.while || !!this.props.get(ex.while)?.visible) && this.has(ex.after) && !(ex.unless ?? []).some((m) => this.marks.has(m))
          && !(ex.once && this.marks.has(ex.id)) && !this.cutscene });
    }
    for (const tk of def.talk ?? []) {
      const npc = this.npcs.get(tk.npc) ?? (tk.npc === "diep" ? this.ally : undefined);
      if (!npc || !this.ok(tk.when)) continue;
      // Diệp following keeps a step behind him (DIEP.followGap): her reach is wider, or she could never be talked to
      this.interactables.push({ x: npc.x, range: npc === this.ally ? 52 : 30, y: def.groundY - 56, priority: 1, act: () => void this.runCutscene(tk.cutscene),
        when: () => !this.cutscene && !this.leaving && this.has(tk.after) && !(tk.unless ?? []).some((m) => this.marks.has(m)) && !(tk.once && this.played.has(tk.cutscene)), at: () => npc.x });
    }
    // Ways shut until something happens.
    for (const bl of def.blocks ?? []) {
      const wall = this.add.rectangle(bl.x, def.groundY / 2, 8, def.groundY + 200).setVisible(false);
      this.physics.add.existing(wall, true);
      this.physics.add.collider(this.player, wall);
      this.blocks.push({ x: bl.x, prop: bl.until ? undefined : bl.id, until: bl.until, wall });
    }

    // Arena + boss.
    this.walls = this.physics.add.staticGroup();
    const ar = def.arena;
    if (ar) {
      if (ar.grove) {
        // Nanh Rễ's grove (cloud playtest): darker behind the combat lane so the bright light shafts stop competing
        // with combat flashes, faded in over the approach.
        const grove = this.add.graphics().setDepth(-7);
        for (let i = 0; i < 8; i++) grove.fillStyle(0x0c1710, 0.06 * (i + 1)).fillRect(ar.min - 160 + i * 20, 0, 20, def.groundY);
        grove.fillStyle(0x0c1710, 0.48).fillRect(ar.min, 0, def.width - ar.min, def.groundY);
      }
      // at the entrance, so its dark roots frame the way in rather than sitting behind the fight
      if (ar.landmark) this.add.image(ar.landmark.x, def.groundY + 3, ar.landmark.key).setOrigin(0.5, 1).setDepth(-3);
      const boss = ar.boss.kind === "nanhRe" ? new NanhRe(this, ar.boss.x, ar.min, ar.max) : new Fighter(this, ar.boss.x, FOES[ar.boss.kind], ar.min + 20, ar.max - 20);
      boss.facing = -1;
      this.boss = boss;
      if (boss instanceof Fighter) {
        boss.onShot = (kind, x, y, vx, vy, hit, g) => this.shots.push(new Shot(this, kind, x, y, vx, vy, hit, g));
        boss.onDeath = () => {};
      }
      this.physics.add.collider(boss, this.solids);
      // Registered once: the walls group is filled on engage and emptied on reset (review B1).
      this.physics.add.collider(this.player, this.walls);
      if (this.ally) this.physics.add.collider(this.ally, this.walls);
      this.physics.add.collider(boss, this.walls);
      boss.onRoots = (xs, warn, dmg) => xs.forEach((x, i) => this.roots.push(new RootSpike(this, x, this.sim, warn + i * 40, dmg)));
      boss.onDown = () => this.bossDown();
      boss.onPhase = (p) => {
        sfx.roar(); music.setIntensity(p); this.cameras.main.shake(220, 0.006 * settings().shake);
        const msg = ar.boss.kind === "nanhRe" ? (p === 2 ? "boss.nanhRe.p2" : "boss.nanhRe.p3") : ar.boss.phases?.[p - 2];
        const scene = ar.phaseScenes?.[p - 2];
        if (scene) void this.runCutscene(scene); else if (msg) this.ui.toast(t(msg), 2400);
        // Mộc Giác's recognition: it lowers its head to his chest, and the half Mạch Ấn pulses wildly (spec §8)
        if (boss instanceof Fighter && boss.def.phaseBeat?.[p]) { this.hitstop(120); void this.pulse(4); }
      };
      boss.onFx = (e, ex, ey) => { if (e === "burst" && boss instanceof Fighter) { sfx.stomp(); this.addMist(boss.x - boss.b.width / 2 - 50, boss.b.width + 100, 60, 3500); return; } this.onEnemyFx(e, ex, ey, boss.facing, 2.2); };
      if (ar.litter) {
        this.add.image(ar.litter.bushX, def.groundY, "bush0").setOrigin(0.5, 1).setDepth(7);
        for (let i = 0; i < ar.litter.n; i++) {
          const p = this.add.sprite(ar.litter.x + i * 12, def.groundY, "piglet0").setOrigin(0.5, 1).setDepth(9);
          p.play({ key: "piglet", delay: i * 120 }); this.piglets.push(p);
        }
      }
    }

    // Camera: restrained smoothing, a small deadzone, and look-ahead in the facing direction.
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 40);
    this.cameras.main.setDeadzone(40, 36);

    this.debugG = this.add.graphics().setDepth(99);
    this.debugText = text(this, 4, VIEW.height - 44, "", { fixed: true, depth: 99, color: "#9aa1ad" }).setVisible(false);
    this.keyHint = text(this, 0, 0, "", { color: "#0b0d11", bg: "#f6e7a0", pad: 3, ox: 0.5, oy: 1, depth: 50 }).setVisible(false);
    this.jHint = text(this, 0, 0, "", { color: "#0b0d11", bg: "#ffc860", pad: 3, ox: 0.5, oy: 1, depth: 50 }).setVisible(false);
    this.floatText = text(this, 0, 0, "", { color: "#f6e7a0", ox: 0.5, oy: 1, depth: 50 }).setVisible(false);

    // Labels follow the device in use and the player's bindings.
    this.unsub.push(input.onDevice(() => this.refreshLabels()));
    this.unsub.push(onSettings(() => { this.refreshLabels(); this.applyDifficulty(); }));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.gone = true; this.waits.clear(); this.unsub.forEach((u) => u()); this.unsub = []; });

    music.play(def.music ?? "forest");
    // The UI scene runs for the whole session (launched in Boot); it draws the HUD for whichever stage is attached.
    this.scene.bringToTop("UI");
    this.ui.attach(this);
    if (cont && this.shrineLit) this.ui.toast(t("toast.wakeShrine"));
    else if (def.intro) this.ui.toast(t(def.intro));
    if (def.opening) void this.runCutscene(def.opening);
  }

  /* ------------------------------------------------------------ helpers */

  private applyDifficulty(): void {
    const d = DIFFICULTY[settings().difficulty];
    this.player.windowBonus = d.windowBonus; this.player.damageScale = d.damageTaken;
    setEnemyDifficulty(d);
  }

  /** Boars that belong in the stage right now: their flag condition holds, their `after` mark is set, not yet beaten. */
  private boarDue(b: StageDef["boars"][number]): boolean {
    return this.ok(b.when) && (!b.after || this.marks.has(b.after)) && !(b.id && this.marks.has(`${b.id}.down`));
  }

  private spawnBoars(only?: StageDef["boars"][number]): void {
    for (const b of only ? [only] : this.def.boars) {
      if (!this.boarDue(b) || (!only && b.after)) continue; // `after` boars arrive when their mark is set (update)
      const boar = new Boar(this, b.x, b.min, b.max, { tellMs: b.tellMs, rooted: b.rooted });
      this.physics.add.collider(boar, this.solids);
      boar.onFx = (e, ex, ey) => this.onEnemyFx(e, ex, ey, boar.facing, 1);
      if (b.id) boar.onDeath = () => { this.marks.add(`${b.id}.down`); };
      this.boars.push(boar);
    }
  }

  private foeDue(f: NonNullable<StageDef["foes"]>[number]): boolean {
    return this.ok(f.when) && (!f.after || this.marks.has(f.after)) && !(f.id && this.marks.has(`${f.id}.down`));
  }

  /** Ch. I fighters from the stage data (`only`: one that arrives on a mark). */
  private spawnFoes(only?: NonNullable<StageDef["foes"]>[number]): void {
    for (const f of only ? [only] : this.def.foes ?? []) {
      if (!this.foeDue(f) || (!only && f.after)) continue;
      const foe = new Fighter(this, f.x, FOES[f.kind], f.min ?? f.x - 80, f.max ?? f.x + 80);
      this.physics.add.collider(foe, this.solids);
      foe.onFx = (e, ex, ey) => this.onEnemyFx(e, ex, ey, foe.facing, 1);
      foe.onShot = (kind, x, y, vx, vy, hit, g) => this.shots.push(new Shot(this, kind, x, y, vx, vy, hit, g));
      foe.onRoots = (xs, warn, dmg) => xs.forEach((x, i) => this.roots.push(new RootSpike(this, x, this.sim, warn + i * 40, dmg)));
      if (f.id) foe.onDeath = () => { this.marks.add(`${f.id}.down`); };
      foe.setData("spawn", f);
      this.foes.push(foe);
    }
  }

  /** Every living enemy body the hero, Diệp and Rễ Giữ deal with. */
  private get fighters(): (Boar | NanhRe | Fighter)[] {
    const out: (Boar | NanhRe | Fighter)[] = [...this.boars, ...this.foes];
    if (this.boss) out.push(this.boss);
    return out;
  }

  /** A scene that plays the first time something happens in a fight (stage `cues`), once. */
  private cue(on: "reGiu" | "snared" | "poisoned"): void {
    const c = this.def.cues?.find((x) => x.on === on);
    if (c && !this.played.has(c.cutscene) && !this.cutscene) this.time.delayedCall(250, () => void this.runCutscene(c.cutscene));
  }

  /** A flag condition from the stage data (C1 shapes S6). An unset flag counts as false: the prose branch. */
  ok(w?: When): boolean { return !w || (getFlag(w.flag) ?? (w.flag === "CH1_CLASS" ? "kiem" : false)) === w.is; } // unset: the prose's branch
  private has(marks?: string[]): boolean { return !marks || marks.every((m) => this.marks.has(m)); }

  private platform(x: number, y: number, w: number, h: number, oneWay = false, wood = false): void {
    this.add.tileSprite(x, y, w, Math.min(h, 16), wood ? "floor_wood" : "ground").setOrigin(0).setDepth(2);
    if (h > 16) this.add.tileSprite(x, y + 16, w, h - 16, wood ? "floor_under" : "dirt").setOrigin(0).setDepth(2);
    const r = this.add.rectangle(x + w / 2, y + h / 2, w, h).setVisible(false);
    this.solids.add(r);
    if (oneWay) {
      const cc = (r.body as Phaser.Physics.Arcade.StaticBody).checkCollision;
      cc.down = false; cc.left = false; cc.right = false;
    }
  }

  /** Living-world details: swaying grass tufts, drifting light motes, falling Linh Suy leaves. */
  private ambience(): void {
    const def = this.def;
    for (let x = 8; def.time !== "indoor" && x < def.width; x += 17 + ((x * 7) % 13)) {
      const tf = this.add.image(x, def.groundY + 1, "tuft1").setOrigin(0.5, 1).setDepth(3);
      tf.setData("p", (x * 0.013) % (Math.PI * 2));
      this.tufts.push(tf);
    }
    for (let i = 0; i < 18; i++) {
      const img = this.add.image(0, 0, "mote").setDepth(-4).setScrollFactor(0.7).setAlpha(0.7);
      this.motes.push({ img, x: Math.random() * VIEW.width * 1.5, y: 100 + Math.random() * 200, vx: 4 + Math.random() * 6, vy: -3 - Math.random() * 4, phase: Math.random() * 6 });
    }
    const leafKind = def.leaves ?? "yellow";
    this.leafKey = leafKind === "green" ? "leafg" : "leaf";
    // "storm" (S4): many leaves falling straight down, no wind ("Lá rơi không có gió", Ch1)
    const storm = leafKind === "storm", n = leafKind === "none" ? 0 : storm ? def.leafCount ?? 26 : 5;
    for (let i = 0; i < n; i++) {
      const img = this.add.image(0, 0, this.leafKey + "0").setDepth(i % 3 ? 4 : -2);
      this.leaves.push({ img, x: Math.random() * VIEW.width, y: -Math.random() * 300, vx: storm ? 0 : 8, vy: storm ? 12 + Math.random() * 10 : 22 + Math.random() * 14, phase: Math.random() * 6 });
    }
  }

  private updateAmbience(now: number, dt: number): void {
    const cam = this.cameras.main, sec = dt / 1000;
    // grass: a travelling gust across the field, frames chosen from a shared wind phase (cheap: only every 120 ms)
    if (now - this.windAt > 120) {
      this.windAt = now;
      const px = this.player.x;
      for (const tf of this.tufts) {
        if (tf.x < cam.scrollX - 20 || tf.x > cam.scrollX + VIEW.width + 20) continue;
        let w = Math.sin(now / 700 - tf.x / 90 + (tf.getData("p") as number));
        if (Math.abs(tf.x - px) < 10 && Math.abs(this.player.body2.velocity.x) > 20) w = this.player.facing; // brushed aside
        const key = w > 0.45 ? "tuft2" : w < -0.45 ? "tuft0" : "tuft1";
        if (tf.texture.key !== key) tf.setTexture(key);
      }
    }
    for (const m of this.motes) {
      m.x += m.vx * sec; m.y += m.vy * sec + Math.sin(now / 900 + m.phase) * 0.15;
      if (m.y < 80) m.y = 300;
      const sx = cam.scrollX * 0.7;
      if (m.x < sx - 10) m.x += VIEW.width + 20; else if (m.x > sx + VIEW.width + 10) m.x -= VIEW.width + 20;
      m.img.setPosition(m.x, m.y).setAlpha(0.35 + 0.35 * Math.sin(now / 500 + m.phase));
    }
    for (const l of this.leaves) {
      l.x += (l.vx + Math.sin(now / 400 + l.phase) * (l.vx ? 18 : 6)) * sec; l.y += l.vy * sec;
      if (l.y > this.def.groundY - 2 || l.x > cam.scrollX + VIEW.width + 20) { l.y = cam.scrollY - 10 - Math.random() * 120; l.x = cam.scrollX + Math.random() * VIEW.width; }
      l.img.setPosition(l.x, l.y);
      const key = this.leafKey + (Math.floor(now / 160 + l.phase) % 2 ? "0" : "1");
      if (l.img.texture.key !== key) l.img.setTexture(key);
    }
  }

  private sign(x: number, key: StringKey): void {
    const gy = this.def.groundY;
    this.add.image(x, gy, "sign").setOrigin(0.5, 1).setDepth(4);
    // panel floats above head height so the hero never runs behind it (playtest I-12)
    this.add.rectangle(x, gy - 30, 1, 40, 0x4a3524).setOrigin(0.5, 0).setDepth(3);
    const label = text(this, x, gy - 64, t(key), { align: "center", bg: "#0b0d11cc", pad: 4, ox: 0.5, oy: 1, depth: 4 });
    this.signs.push({ x, key, label });
  }

  private refreshLabels(): void {
    for (const s of this.signs) s.label.setText(t(s.key));
    this.keyHint.setText(input.label("interact"));
    this.jHint.setText(input.label("light"));
  }

  private addHerb(id: string, x: number, y: number, kind: "herb" | "antidote"): void {
    const img = this.add.image(x, y, kind === "antidote" ? "antidote0" : "herb0").setOrigin(0.5, 1).setDepth(6);
    const anim = new Animator(img); anim.play(kind === "antidote" ? ANTIDOTE_GLINT : HERB_GLINT); anim.update(Math.random() * 1500);
    this.herbs.push({ id, img, anim, baseY: y, phase: Math.random() * 6, taken: false, kind });
  }

  /** Poison mist over ground (độc thảo): a low haze and drifting spore puffs, so the danger is visible before it is felt. */
  private addMist(x: number, w: number, rate: number, lifeMs = 0): void {
    const gy = this.def.groundY, haze: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < 4; i++) haze.push(this.add.rectangle(x + w / 2, gy - 6 - i * 7, w - i * 10, 8, 0x9ab84a, 0.17 - i * 0.035).setDepth(7));
    const puffs: Mist["puffs"] = [];
    for (let i = 0; i < Math.max(4, Math.round(w / 14)); i++) {
      const img = this.add.image(0, 0, i % 3 ? "spore0" : "spore1").setDepth(7).setAlpha(0.7);
      puffs.push({ img, x: x + Math.random() * w, y: gy - 4 - Math.random() * 30, phase: Math.random() * 6 });
    }
    // a cloud (a burst pod, a spore gob) thins out and is gone; a mist over ground stays
    this.mists.push({ x, w, rate, puffs, until: lifeMs ? this.sim + lifeMs : 0, haze });
  }

  /**
   * Rễ Giữ (Ch. I Mạch Ấn, Bible §5.2 #1): a perfect defence makes roots erupt and bind the enemies near him. Each class
   * triggers it with its own defence: Kiếm Khách (and the classless kit) a parry, Ảnh Vệ a perfect dodge.
   */
  private rootsBind(): void {
    const p = this.player;
    if (!this.reGiu || this.sim < this.reGiuReady) return;
    this.reGiuReady = this.sim + RE_GIU.cooldownMs;
    const near = this.fighters.filter((e) => e.active && e.isAlive() && Math.abs(e.x - p.x) < RE_GIU.radius);
    for (const e of near) {
      e.bind(e instanceof NanhRe ? RE_GIU.bossMs : RE_GIU.bindMs, this.sim);
      for (let i = -1; i <= 1; i++) {
        const r = this.add.image(e.x + i * 10, this.def.groundY + 2, i ? "root0" : "root1").setOrigin(0.5, 1).setDepth(9).setScale(1, 0.1);
        this.tweens.add({ targets: r, scaleY: i ? 0.6 : 0.9, duration: 120, ease: "Back.easeOut" });
        this.time.delayedCall((e instanceof NanhRe ? RE_GIU.bossMs : RE_GIU.bindMs) - 150, () => this.tweens.add({ targets: r, scaleY: 0, alpha: 0, duration: 200, onComplete: () => r.destroy() }));
      }
      this.fx.sparkle(e.x, e.y - 14, 6, 0x7ee08a);
    }
    sfx.roots(); this.fx.ring(p.x, p.y - 20);
    this.ui.toast(t(near.length ? "toast.reGiu" : "toast.reGiu.none"), 700);
    if (near.length) this.cue("reGiu");
  }

  private float(x: number, y: number, s: string): void {
    this.floatText.setText(s).setPosition(x, y).setVisible(true).setAlpha(1);
    this.floatUntil = this.time.now + 800;
  }

  /** Freeze gameplay briefly on impact. Scales with the hit; does not stack. */
  private hitstop(ms: number): void {
    if (ms <= this.hitstopLeft) return;
    this.hitstopLeft = ms;
    this.physics.world.pause();
  }

  private shake(strength: number): void {
    const k = settings().shake;
    if (k <= 0) return;
    // strength ~ damage: light 10 → small, heavy 44 → strong; capped to keep pixels readable
    this.cameras.main.shake(40 + strength * 2.2, Math.min(0.009, 0.0012 + strength * 0.00016) * k);
  }

  private lightShrine(fx: boolean): void {
    const sh = this.shrine; if (!sh) return;
    this.shrineLit = true;
    this.shrineAnim?.play(SHRINE_LIT);
    if (fx) { sfx.shrine(); this.fx.ring(sh.x, sh.y - 20); this.fx.motes(sh.x, sh.y - 30, 8); }
  }

  /** Resting at a Mạch shrine (Combat Bible §10): full heal, pouch refilled, enemies respawn, progress saved. */
  private rest(): void {
    const sh = this.def.shrines[0]; if (!sh) return;
    this.checkpoint = { x: sh.x + 20, y: this.def.groundY };
    this.player.hp = PLAYER.maxHp;
    this.player.refillHerbs();
    if (!this.shrineLit) this.lightShrine(true);
    const missing = this.def.boars.filter((b) => this.boarDue(b) && !b.after).length - this.boars.filter((b) => b.active && b.isAlive()).length;
    if (missing > 0) { this.boars.forEach((b) => b.destroy()); this.boars = []; this.spawnBoars(); }
    // Ch. I enemies come back too (Bible §10), except humans who broke off and story enemies (`id`)
    const foesMissing = (this.def.foes ?? []).filter((f) => this.foeDue(f) && !f.after && !f.id).length - this.foes.filter((f) => f.active && f.isAlive() && !(f.getData("spawn") as { id?: string }).id).length;
    if (foesMissing > 0) { this.foes.filter((f) => !(f.getData("spawn") as { id?: string }).id).forEach((f) => f.destroy()); this.foes = this.foes.filter((f) => f.active); this.spawnFoes(); }
    saveAtCheckpoint(this.def.id, sh.id, this.player.herbCap, this.taken, this.player.antidoteCap);
    this.ui.toast(t("toast.shrine"));
  }

  /* ------------------------------------------------------------ stage exits */

  /**
   * Leave for the next stage: the save moves on (the pouch and used-up things carry over), the screen fades, the
   * narration cards play, and the stage restarts as the next one.
   */
  private leave(to: string, card?: StringKey[]): void {
    if (this.leaving) return;
    this.leaving = true;
    enterStage(to, this.player.herbCap, this.taken, this.player.antidoteCap);
    music.stop(1.2);
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => this.ui.narrate(card ?? [], () => this.scene.restart({ mode: this.mode === "quick" ? "quick" : "enter" })));
  }

  /* ------------------------------------------------------------ cutscenes */

  private waits = new Set<() => void>();
  private delay(ms: number): Promise<void> {
    return new Promise((res) => {
      const done = () => { this.waits.delete(done); res(); };
      this.waits.add(done);
      this.time.delayedCall(ms, done);
    });
  }

  /** Play a cutscene (src/data/cutscenes.ts): its steps in order. Gameplay input is locked until it ends. */
  async runCutscene(id: string): Promise<void> {
    const steps = CUTSCENES[id];
    if (!steps || this.cutscene) return;
    this.cutscene = id; this.skipping = false;
    this.played.add(id);
    const ok = await this.runSteps(steps);
    if (!ok) return;
    this.cutscene = null; this.skipping = false;
  }

  /** Steps in order; false if the stage went away mid-scene. A choice step plays its chosen branch inline. */
  private async runSteps(steps: Step[]): Promise<boolean> {
    for (const st of steps) {
      if (this.gone) return false; // the stage was left (title, restart) mid-scene
      if ((st.when && !this.ok(st.when)) || (st.marks && !this.has(st.marks))) continue;
      if ("play" in st) { const inner = CUTSCENES[st.play]; if (inner && !(await this.runSteps(inner))) return false; continue; }
      if ("choose" in st) {
        // A choice is never skipped: skipping stops here, and the branch after it plays normally.
        this.skipping = false; this.inChoice = true;
        const outcome = await new Promise<string>((res) => this.ui.runScript(SCRIPTS[st.choose], res));
        this.inChoice = false;
        const branch = CUTSCENES[st.then[outcome]];
        if (branch && !(await this.runSteps(branch))) return false;
        continue;
      }
      await this.step(st);
    }
    return true;
  }

  /** True while a cutscene's choice is on screen (the pause menu can't skip past it). */
  inChoice = false;

  /** Skip (pause menu): every pending wait, walk and line completes at once; the remaining steps run instantly. */
  skipCutscene(): void {
    if (!this.cutscene || this.inChoice) return;
    this.skipping = true;
    this.ui.closeLine();
    for (const n of this.npcs.values()) n.finishWalk();
    this.ally?.finishWalk();
    if (this.heroWalk) this.finishHeroWalk();
    for (const f of [...this.waits]) f();
  }

  private walkHero(to: number): Promise<void> {
    return new Promise((res) => {
      this.heroWalk = { to, done: res };
      if (this.skipping) this.finishHeroWalk();
    });
  }
  private finishHeroWalk(): void {
    const w = this.heroWalk; if (!w) return;
    this.heroWalk = null;
    this.player.x = w.to; this.player.body2.reset(w.to, this.player.y - this.player.body2.height - 4); this.player.body2.setVelocity(0, 0);
    w.done();
  }

  /** The yellow leaf (S3): it drifts down from the evergreen into the yard, turning as it falls. */
  private leafFall(l: { from: number; to: number; top: number }): Promise<void> {
    const gy = this.def.groundY;
    const img = this.add.image(l.from, l.top, "big_leaf0").setDepth(8);
    this.props.set("leaf", img);
    if (this.skipping) { img.setPosition(l.to, gy - 3); return Promise.resolve(); }
    return new Promise((res) => {
      const t0 = this.time.now, dur = 2600;
      const ev = this.time.addEvent({ delay: 16, loop: true, callback: () => {
        const u = Math.min(1, (this.time.now - t0) / dur);
        img.setPosition(l.from + (l.to - l.from) * u + Math.sin(u * 9) * 10, l.top + (gy - 3 - l.top) * u);
        img.setTexture(Math.floor(u * 14) % 2 ? "big_leaf1" : "big_leaf0");
        if (u >= 1 || this.skipping) { img.setPosition(l.to, gy - 3).setTexture("big_leaf0"); ev.remove(); res(); }
      } });
    });
  }

  private step(st: Step): Promise<void> {
    const done = Promise.resolve(), fast = this.skipping, cam = this.cameras.main;
    if ("say" in st) return fast ? done : new Promise((res) => this.ui.line(st.who ?? null, st.say, res));
    if ("walk" in st) {
      if (st.walk === "player") return this.walkHero(st.to);
      if (st.walk === "diep" && this.ally) {
        if (fast) { this.ally.reset(st.to, this.def.groundY); this.ally.scripted = true; return done; }
        const w = this.ally.walkTo(st.to);
        return st.nowait ? done : w;
      }
      const n = this.npcs.get(st.walk); if (!n) return done;
      if (fast) { n.x = st.to; n.pose("idle"); return done; }
      return n.walkTo(st.to);
    }
    if ("face" in st) {
      if (st.face === "player") this.player.facing = st.dir;
      else if (st.face === "diep" && this.ally) { this.ally.facing = st.dir; this.ally.setFlipX(st.dir < 0); }
      else { const n = this.npcs.get(st.face); if (n) n.facing = st.dir; }
      return done;
    }
    if ("pose" in st) { if (st.pose === "diep") this.ally?.pose(st.clip as unknown as DiepClip); else this.npcs.get(st.pose)?.pose(st.clip); return done; }
    if ("wait" in st) return fast ? done : this.delay(st.wait);
    if ("leaf" in st) return this.leafFall(st.leaf);
    if ("hideProp" in st && st.hideProp === "boss") { this.boss?.setVisible(false); return done; }
    if ("hideProp" in st) { (this.props.get(st.hideProp) ?? this.npcs.get(st.hideProp))?.setVisible(false); return done; }
    if ("bag" in st) { const n = this.npcs.get(st.bag); if (n) { n.bag = true; n.pose(n.clip === "walk" ? "walk" : "idle"); } return done; }
    if ("camera" in st) {
      if (st.camera === "follow") { cam.startFollow(this.player, true, 0.1, 0.1, Math.round(this.lookAhead), 40); return done; }
      cam.stopFollow();
      if (fast) { cam.centerOnX(st.camera); return done; }
      cam.pan(st.camera, cam.midPoint.y, 800, "Sine.easeInOut");
      return this.delay(800);
    }
    if ("toast" in st) { if (!fast) this.ui.toast(t(st.toast), 3200); return done; }
    if ("goto" in st) { this.leave(st.goto, st.card); return done; }
    if ("mark" in st) { this.marks.add(st.mark); return done; }
    if ("sfx" in st) { if (!fast) sfx[st.sfx](); return done; }
    if ("shake" in st) { if (!fast) this.shake(st.shake); return done; }
    if ("pulse" in st) return fast ? done : this.pulse(st.pulse, st.heart !== false);
    if ("tween" in st) {
      const tw = st.tween, o = this.props.get(tw.id) ?? this.npcs.get(tw.id);
      if (!o) return done;
      const end = () => { if (tw.hide) o.setVisible(false); };
      if (fast) { o.x += tw.dx ?? 0; o.y += tw.dy ?? 0; end(); return done; }
      return new Promise((res) => this.tweens.add({ targets: o, x: o.x + (tw.dx ?? 0), y: o.y + (tw.dy ?? 0), duration: tw.ms, ease: "Sine.easeInOut", onComplete: () => { end(); res(); } }));
    }
    if ("setProp" in st) {
      const img = this.props.get(st.setProp.id);
      if (img) { img.setTexture(st.setProp.key); const a = this.propAnims.find((p) => p.img === img); if (a) a.frames = [st.setProp.key]; }
      return done;
    }
    if ("showProp" in st) { (this.props.get(st.showProp) ?? this.npcs.get(st.showProp))?.setVisible(true); return done; }
    if ("place" in st) {
      const pl = st.place, x = pl.at === "player" ? this.player.x + this.player.facing * 8 : pl.at;
      const y = pl.at === "player" ? this.player.y + (pl.dy ?? -30) : this.def.groundY + (pl.dy ?? 0);
      this.props.get(pl.id)?.destroy();
      this.props.set(pl.id, this.add.image(x, y, pl.key).setDepth(11));
      return done;
    }
    if ("flock" in st) { if (!fast) this.flock(st.flock); return done; }
    if ("item" in st) { addItem(st.item); if (!fast) this.ui.toast(t("toast.item", { item: t(`item.${st.item}` as StringKey) }), 2400); return done; }
    if ("music" in st) { music.play(st.music); return done; }
    if ("flag" in st) { setFlag(st.flag, st.value); return done; }
    if ("pouch" in st) {
      this.player.herbCap += st.pouch; this.player.refillHerbs();
      if (!fast) this.ui.toast(t("toast.pouch", { cap: this.player.herbCap }), 2400);
      return done;
    }
    if ("shiver" in st) {
      const img = this.props.get(st.shiver); if (!img || fast) return done;
      sfx.rod();
      const x0 = img.x;
      return new Promise((res) => this.tweens.add({ targets: img, x: x0 + 1, duration: 45, yoyo: true, repeat: 4, onComplete: () => { img.x = x0; res(); } }));
    }
    if ("machAn" in st) { addMachAn(st.machAn); if (st.machAn === "reGiu") this.reGiu = true; if (!fast) this.ui.toast(t("toast.machAn", { item: t(`ma.${st.machAn}` as StringKey) }), 3000); return done; }
    if ("dropItem" in st) { removeItem(st.dropItem); return done; }
    if ("antidotes" in st) { this.player.antidoteCap = Math.max(this.player.antidoteCap, st.antidotes); this.player.refillHerbs(); if (!fast) this.ui.toast(t("toast.antidotes", { n: st.antidotes }), 2400); return done; }
    if ("end" in st) {
      this.finished = true; markDone(this.def.id);
      this.ui.endCard(t(st.end));
      return done;
    }
    return done;
  }

  /** The scar flares with the Mạch Ấn (S5): `n` beats, a warm ring at his chest and his heartbeat. */
  private pulse(n: number, heart = true): Promise<void> {
    return new Promise((res) => {
      let k = 0;
      const beat = () => {
        if (this.gone) { res(); return; }
        const p = this.player, x = p.x + p.facing * 1, y = p.y - 30;
        if (heart) sfx.heartbeat(); // not his heart: the glow only, its beat is the roar or the forest
        const ring = this.add.circle(x, y, 3, settings().reduceFlashes ? 0x8a3a20 : 0xff6a3a, 0.8).setDepth(12);
        this.tweens.add({ targets: ring, scale: 5, alpha: 0, duration: 600, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
        const m = this.props.get("machAn"); if (m) { m.setTexture("mach_an1"); this.time.delayedCall(260, () => m.active && m.setTexture("mach_an0")); }
        if (++k === n) { if (n > 1) this.shake(8); this.time.delayedCall(700, res); }
        else this.time.delayedCall(k === n - 1 ? 560 : 700, beat); // the last beat comes on his own heart
      };
      beat();
    });
  }

  /** A flock of panicked birds across the sky, right to left ("chim bay ra khỏi rừng", Ch1). */
  private flock(n: number): void {
    const cam = this.cameras.main;
    for (let i = 0; i < n; i++) {
      const img = this.add.image(cam.scrollX + VIEW.width + 20 + i * (18 + Math.random() * 26), cam.scrollY + 26 + Math.random() * 90, "bird0").setDepth(-2);
      this.birds.push({ img, vx: -(150 + Math.random() * 90), vy: (Math.random() - 0.5) * 20, phase: Math.random() * 6 });
    }
    sfx.tellBoar();
  }

  /* ------------------------------------------------------------ events */

  private onPlayerEvent(k: PlayerEvent): void {
    const p = this.player, f = p.facing;
    // I-2 training: the class's own defence, counted (Kiếm Khách parries; Ảnh Vệ perfect dodges)
    const tr = this.def.training;
    if (tr && !this.marks.has(tr.mark) && ((k === "parry" && KIT.id !== "anh") || (k === "perfectDodge" && KIT.id === "anh"))) {
      this.trained++;
      this.ui.toast(t("toast.trained", { n: this.trained, of: tr.count }), 900);
      if (this.trained >= tr.count) this.marks.add(tr.mark);
    }
    switch (k) {
      case "step": this.fx.dust(p.x - f * 4, p.y, 1, -f, 0.6); sfx.step(); break;
      case "skid": this.fx.dust(p.x + f * 6, p.y, 3, f, 0.8); sfx.step(); break;
      case "jump": this.fx.dust(p.x, p.y, 2, 0, 0.7); sfx.jump(); break;
      case "land": this.fx.dust(p.x, p.y, 4, 0, 1); sfx.land(); break;
      case "dodge": this.fx.dust(p.x, p.y, 3, -f, 1); sfx.dodge(); break;
      case "ghost": this.fx.afterimage(p.texture.key, p.x, p.y, p.flipX); break;
      case "swing": sfx.swing(p.slashLevel); this.fx.slash(p.x + f * 4, p.y - 32 + (p.slashLevel > 0 ? 2 : 0), p.slashLevel, f, p.rising); break;
      case "slam": this.fx.dust(p.x + f * 18, p.y, 3, f, 0.8); break;
      case "thud": this.fx.dust(p.x, p.y, 4, 0, 0.8); break;
      case "parry": {
        if (KIT.id !== "anh") this.rootsBind();
        sfx.parry();
        this.ui.toast(t(KIT.classKit ? "toast.parry.kiem" : "toast.parry"), 900);
        // Compact, warm burst at the blade (cloud playtest: pale flashes were lost against the light shafts).
        const bx = p.x + f * 14, by = p.y - 34;
        this.fx.sparks(bx, by, f, 7, 0.75); this.fx.impact(bx, by, false); this.fx.sparkle(bx, by, 6, 0xffc860);
        this.shake(18); this.hitstop(110);
        break;
      }
      case "block": { // a duller, lower burst than a parry: it held, but it cost something
        sfx.block();
        this.fx.sparks(p.x + f * 12, p.y - 30, f, 4, 0.6); this.fx.dust(p.x - f * 6, p.y, 2, -f, 0.8);
        this.shake(10); this.hitstop(50);
        break;
      }
      case "guardBreak": sfx.guardBreak(); this.ui.toast(t("toast.guardBreak"), 800); break;
      case "phaThe": sfx.phaThe(); this.ui.toast(t("toast.phaThe"), 700); this.fx.sparkle(p.x + f * 10, p.y - 34, 8, 0xffc860); break;
      case "perfectDodge":
        if (KIT.id === "anh") this.rootsBind();
        if (KIT.id === "anh") { this.ui.toast(t("toast.perfectDodge.anh"), 800); this.fx.sparkle(p.x, p.y - 24, 8, 0xb8a0f0); sfx.parry(); this.hitstop(60); }
        else if (KIT.classKit) { this.ui.toast(t("toast.perfectDodge"), 700); this.fx.sparkle(p.x, p.y - 24, 6, 0x9fd0c0); }
        break;
      case "blink": sfx.dodge(); sfx.swing(2); this.ui.toast(t("toast.anhKich"), 600); this.fx.dust(p.x, p.y, 4, -f, 1.2); break;
      case "anh": this.float(p.x, p.y - 52, t("toast.anhGain")); this.fx.sparkle(p.x, p.y - 30, 5, 0xb8a0f0); break;
      case "crit": this.float(p.x, p.y - 58, t("toast.crit")); break;
      case "snared": this.cue("snared"); sfx.block(); this.ui.toast(t("toast.snared"), 1000); this.fx.dust(p.x, p.y, 4, 0, 0.8); break;
      case "poisoned": this.cue("poisoned"); sfx.hurt(); this.ui.toast(t("toast.poisoned"), 1600); this.fx.sparkle(p.x, p.y - 30, 8, 0x9ab84a); break;
      case "cured": sfx.heal(); this.ui.toast(t("toast.cured"), 1200); this.fx.sparkle(p.x, p.y - 30, 8, 0xb8a0f0); break;
      case "riposte": this.ui.toast(t("toast.riposte"), 600); break;
      case "heal": sfx.heal(); this.float(p.x, p.y - 50, `+${PLAYER.herbHeal}`); this.fx.sparkle(p.x, p.y - 30, 8, 0x9cf0a4); break;
      case "hurt": sfx.hurt(); this.shake(16); this.hitstop(70); this.fx.sparks(p.x, p.y - 26, -f as 1 | -1, 6, 0.8); break;
      case "dead": sfx.death(); this.shake(24); this.hitstop(140); if (this.engaged) this.boss?.stand(); this.time.delayedCall(1400, () => this.respawn()); break;
    }
  }

  private onEnemyFx(e: EnemyEvent, x: number, y: number, facing: 1 | -1, size: number): void {
    if (e === "step") this.fx.dust(x - facing * 10 * size, y, 1, -facing, 0.5);
    if (e === "paw") this.fx.dust(x + facing * 8 * size, y, 1, -facing, 0.9);
    if (e === "stomp") { this.fx.dust(x + facing * 30, y, 6, 0, 1.4); this.shake(20); sfx.stomp(); }
    if (e === "thud" || e === "dead") this.fx.dust(x, y, 5, 0, 1);
    if (e === "skid") { this.fx.dust(x + facing * 12 * size, y, 3 + Math.round(size * 2), facing, 1 + size * 0.2); sfx.step(); }
    // Localised telegraph cues (playtest I-03): where the attack comes from, plus a distinct sound per attack.
    if (e === "tellBoar") { sfx.tellBoar(); this.fx.dust(x + facing * 10, y, 2, -facing, 0.8); }
    if (e === "tellCharge") { sfx.tellCharge(); this.fx.dust(x - facing * 26, y, 5, -facing, 1.3); }
    if (e === "tellSwipe") sfx.tellSwipe();
    if (e === "glint") this.fx.sparkle(x, y, 6, 0xfff6d8);
    if (e === "tellStomp") { sfx.tellStomp(); for (let i = -2; i <= 2; i++) this.fx.dust(x + i * 14, y, 1, 0, 0.5); }
    // Ch. I cues: each attack family sounds different (playtest I-03: a localised cue per attack)
    if (e === "tellBlade") { sfx.tellSwipe(); this.fx.sparkle(x, y - 30, 3, 0xb8c4cc); }
    if (e === "tellThrow") sfx.tellBoar();
    if (e === "tellAntler") { sfx.tellBoar(); this.fx.dust(x, y, 2, -facing, 0.8); }
    if (e === "tellPounce") { sfx.tellSwipe(); this.fx.dust(x - facing * 6, y, 3, -facing, 0.9); }
    if (e === "tellSpore") { sfx.roots(); this.fx.sparkle(x - facing * 16, y - 14, 4, 0xc8d870); }
    if (e === "burst") { sfx.stomp(); this.addMist(x - 40, 80, 70, 3000); }
  }

  private respawn(): void {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(260, () => {
      this.player.respawn(this.checkpoint.x, this.checkpoint.y);
      this.ally?.reset(this.checkpoint.x - 30, this.checkpoint.y);
      this.player.clearHitMemory();
      this.roots.forEach((r) => r.destroy()); this.roots = [];
      const ar = this.def.arena;
      if (ar && this.boss && this.engaged && this.boss.isAlive()) {
        this.engaged = false; this.walls.clear(true, true);
        this.boss.reset(ar.boss.x); this.boss.facing = -1;
        this.cameras.main.setBounds(0, this.def.height - VIEW.height, this.def.width, VIEW.height);
        this.ui.hideBoss();
        music.play(this.def.music ?? "forest");
      }
      this.cameras.main.fadeIn(300);
      this.ui.toast(t(this.shrineLit ? "toast.wakeShrine" : this.def.wake ?? "toast.wakeStart"));
    });
  }

  private engage(): void {
    const ar = this.def.arena!;
    this.engaged = true;
    for (const x of [ar.min + ARENA_WALL / 2, ar.max - ARENA_WALL / 2]) this.walls.add(this.add.rectangle(x, this.def.groundY / 2, 16, this.def.groundY + 200).setVisible(false));
    this.cameras.main.setBounds(ar.min, this.def.height - VIEW.height, ar.max - ar.min, VIEW.height);
    // she comes in with him, never shut outside the arena
    if (this.ally && this.ally.x < ar.min + ARENA_WALL + 8) this.ally.reset(ar.min + ARENA_WALL + 20, this.def.groundY);
    this.ui.showBoss(t(ar.boss.name));
    music.play("boss", 1);
    const wake = () => this.time.delayedCall(900, () => { this.boss?.wake(); sfx.roar(); });
    if (ar.introScene) void this.runCutscene(ar.introScene).then(wake); // the boss waits the scene out
    else { this.ui.toast(t(ar.boss.intro), 2000); wake(); }
  }

  private bossDown(): void {
    const ar = this.def.arena!, boss = this.boss!;
    if (!SCRIPTS[ar.outcome]) { this.bossDefeated(); return; }
    this.choosing = true;
    this.shake(30); this.hitstop(160); sfx.bossDown();
    music.play("aftermath");
    // frame the moment on her, not the arena edge (playtest I-14)
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.pan(Phaser.Math.Clamp(boss.x, ar.min + VIEW.width / 2, ar.max - VIEW.width / 2), cam.midPoint.y, 900, "Sine.easeInOut");
    this.roots.forEach((r) => r.destroy()); this.roots = [];
    this.piglets.forEach((p, i) => this.tweens.add({ targets: p, x: boss.x + 30 + i * 10, duration: 900, delay: 300 + i * 100 }));
    this.ui.hideBoss();
    // The choice opens with the fall (the camera pans behind it), so `choosing` always means the choice is on screen.
    this.ui.runScript(SCRIPTS[ar.outcome], (outcome) => this.resolve(outcome));
  }

  /**
   * A Ch. I boss beaten: the arena opens, the camera comes back to him, and its outcome cutscene plays (Mộc Giác's
   * absorption, Hùng's escape). The mark `<kind>.down` opens anything waiting on it.
   */
  private bossDefeated(): void {
    const ar = this.def.arena!, boss = this.boss!;
    this.shake(30); this.hitstop(160); sfx.bossDown();
    music.play("aftermath");
    this.roots.forEach((r) => r.destroy()); this.roots = [];
    this.shots.forEach((s) => s.spend()); this.shots = [];
    this.ui.hideBoss();
    this.engaged = false; this.walls.clear(true, true);
    this.cameras.main.setBounds(0, this.def.height - VIEW.height, this.def.width, VIEW.height);
    this.marks.add(`${ar.boss.kind}.down`);
    boss.b.enable = false;
    if (CUTSCENES[ar.outcome]) this.time.delayedCall(900, () => void this.runCutscene(ar.outcome));
  }

  /** Carry out the C2 outcome; its flags were saved by the dialogue runner. */
  private resolve(outcome: string): void {
    const boss = this.boss!;
    this.choosing = false; this.finished = true;
    markDone(this.def.id);
    const spared = outcome === "spare";
    if (spared) {
      this.walls.clear(true, true);
      boss.leave();
      this.piglets.forEach((p, i) => this.tweens.add({ targets: p, x: "+=440", duration: 6200, delay: 200 + i * 120 }));
      this.ui.toast(t("c2.spared.toast"), 3000);
    } else {
      this.tweens.add({ targets: boss, alpha: 0, duration: 1400 });
      this.piglets.forEach((p) => p.anims.stop());
      this.ui.toast(t("c2.killed.toast"), 3000);
    }
    // on to the aftermath (S8), or the closing card if the stage is the last one built
    const next = this.def.arena?.next;
    if (next) this.time.delayedCall(3600, () => this.leave(next.to, next.card));
    else this.time.delayedCall(3200, () => this.ui.endCard(t(spared ? "c2.spared.end" : "c2.killed.end")));
  }

  /* ------------------------------------------------------------ frame */

  update(time: number, delta: number): void {
    const t0 = performance.now();
    if (input.consume("debug")) { this.showDebug = !this.showDebug; this.debugText.setVisible(this.showDebug); }

    // Real-time systems (run during hit-stop too).
    this.fx.update(delta);
    this.updateAmbience(time, delta);
    this.shrineAnim?.update(delta);
    if (this.shrine && this.shrineLit && Math.random() < delta / 260) this.fx.motes(this.shrine.x, this.shrine.y - 22, 1);
    for (const h of this.herbs) if (!h.taken) { h.anim.update(delta); h.img.y = Math.round(h.baseY - 1.5 - Math.sin(time / 380 + h.phase) * 1.5); }
    this.updateFloat(delta);

    // Hit-stop: hold simulation, keep presses for the next simulated frame.
    let dt = delta;
    if (this.hitstopLeft > 0) {
      this.hitstopLeft -= delta;
      if (this.hitstopLeft > 0) { input.keepPresses = true; return; }
      this.physics.world.resume();
      dt = Math.min(delta, -this.hitstopLeft);
      this.hitstopLeft = 0;
    }
    this.sim += dt;
    const now = this.sim;

    const locked = this.choosing || this.finished || this.ui.busy || !!this.cutscene || this.leaving;
    const c: Controls = {
      left: input.held("left"), right: input.held("right"),
      jumpHeld: input.held("jump"), jumpPressed: input.pressed("jump"),
      lightPressed: input.pressed("light"), heavyHeld: input.held("heavy"), heavyPressed: input.pressed("heavy"),
      dodgePressed: input.pressed("dodge"), parryPressed: input.pressed("parry"), parryHeld: input.held("parry"),
      herbPressed: input.pressed("herb"),
    };
    if (locked) { c.left = c.right = c.jumpHeld = c.jumpPressed = c.lightPressed = c.heavyHeld = c.heavyPressed = c.dodgePressed = c.parryPressed = c.parryHeld = c.herbPressed = false; }
    if (this.heroWalk) { // a cutscene walks the hero
      const d = this.heroWalk.to - this.player.x;
      if (Math.abs(d) < 3) { this.player.body2.setVelocityX(0); const w = this.heroWalk; this.heroWalk = null; w.done(); }
      else { c.left = d < 0; c.right = d > 0; }
    }
    this.player.update(now, dt, c);
    for (const n of this.npcs.values()) n.tick(dt);
    if (this.ally) {
      const waiting = !!this.def.ally?.waitFor && !this.marks.has(this.def.ally.waitFor);
      this.ally.scripted = waiting || !!this.cutscene || this.leaving || this.choosing || this.finished;
      this.ally.tick(now, dt, this.player.x, this.player.facing, this.boss && this.engaged ? [...this.boars, ...this.foes, this.boss] : [...this.boars, ...this.foes]);
    }
    const exit = this.def.exit;
    if (exit && !this.leaving && !locked && this.player.x > exit.x) this.leave(exit.to, exit.card);
    this.updateStory(time, delta, locked);
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.15 / 4;

    // Camera look-ahead: lean ~32 px toward the facing direction, eased.
    this.lookAhead += (-this.player.facing * 32 - this.lookAhead) * Math.min(1, dt / 400);
    this.cameras.main.setFollowOffset(Math.round(this.lookAhead), 40);

    // Pickups and interactions (with feedback).
    for (const h of this.herbs) {
      if (!h.taken && Math.abs(h.img.x - this.player.x) < 12 && Math.abs(h.img.y - this.player.y) < 30) {
        h.taken = true; this.taken.add(h.id); h.img.destroy(); sfx.pickup();
        if (h.kind === "antidote") this.player.addAntidote(); else this.player.addHerb();
        this.fx.sparkle(h.img.x, h.baseY - 6, 8); this.float(h.img.x, h.baseY - 14, t(h.kind === "antidote" ? "toast.antidote" : "toast.herb"));
      }
    }
    // The interact key acts on the nearest thing in reach: rest at a shrine, look at something, talk to someone.
    let near: Interactable | null = null;
    let nearD = 0;
    for (const it of this.interactables) {
      if (it.at) it.x = it.at();
      const d = Math.abs(it.x - this.player.x);
      if (d >= it.range || (it.when && !it.when())) continue;
      // talking to someone beats looking at a thing beside them; otherwise the nearest wins
      const better = !near || (it.priority ?? 0) > (near.priority ?? 0) || ((it.priority ?? 0) === (near.priority ?? 0) && d < nearD);
      if (better) { near = it; nearD = d; }
    }
    this.keyHint.setVisible(!!near && !locked && !near.quiet?.());
    if (near) this.keyHint.setText(input.label("interact")).setPosition(near.x, near.y - Math.round(Math.sin(time / 250)));
    if (!locked && near && input.pressed("interact")) near.act();
    const ar = this.def.arena;
    if (ar && this.boss && !this.engaged && !this.finished && this.boss.isAlive() && this.player.x > ar.min + 30) this.engage();

    // Enemies and hazards (simulation time).
    const px = this.player.x;
    this.boars = this.boars.filter((b) => b.active);
    // While a scene plays, the fight holds: enemies stand where they are and nothing strikes (Ch. I: a boss's phase
    // scene must never cost him a hit he could not answer).
    const frozen = !!this.cutscene;
    this.foes = this.foes.filter((f) => f.active);
    const view = { x: px, guarding: this.player.state === "parry" || this.player.state === "block" };
    if (frozen) { for (const e of this.fighters) if (e.active && e.body) (e.body as Phaser.Physics.Arcade.Body).setVelocityX(0); }
    else {
      for (const b of this.boars) b.tick(now, dt, px);
      for (const f of this.foes) f.tick(now, dt, px, view);
      for (const s of this.shots) s.tick(dt, this.def.groundY, this.cameras.main.scrollX, this.cameras.main.scrollX + VIEW.width);
      for (const s of this.shots) if (s.done && s.landedAt !== null && s.kind === "spore") this.addMist(s.landedAt - 24, 48, 60, 2400);
      this.shots = this.shots.filter((s) => !s.done);
    }
    if (this.boss?.active && !frozen) {
      if (this.engaged && this.player.state === "heal") this.boss.punishHeal(Math.abs(px - this.boss.x));
      if (this.boss instanceof Fighter) this.boss.tick(now, dt, px, view); else this.boss.tick(now, dt, px);
    }
    for (const b of this.bushes) b.tick(time);
    this.separate();
    for (const r of frozen ? [] : this.roots) {
      if (r.tick(now)) { this.fx.dust(r.x, this.def.groundY, 2, 0, 0.8); sfx.roots(); }
      else if (r.warning(now) && Math.random() < dt / 110) this.fx.dust(r.x + (Math.random() - 0.5) * 10, this.def.groundY, 1, 0, 0.35); // low dirt specks: "this spot"
    }
    this.roots = this.roots.filter((r) => !r.done);

    // Player → targets.
    const ph = this.player.currentHit();
    if (ph) {
      this.targets.length = 0;
      this.targets.push(...this.bushes, ...this.boars, ...this.foes);
      if (this.boss) this.targets.push(this.boss);
      for (const tg of this.targets) {
        if (!tg.isAlive() || !overlaps(ph.rect, tg.hurtbox())) continue;
        const before = tg.hp;
        tg.takeHit(ph);
        if (tg.hp !== before) this.onLanded(ph, tg);
      }
    }
    // Diệp → enemies (never the brush: the chores are his).
    const ah = this.ally?.currentHit();
    if (ah) {
      const foes: Hittable[] = [...this.boars, ...this.foes, ...(this.boss && this.engaged ? [this.boss] : [])];
      for (const tg of foes) {
        if (!tg.isAlive() || !overlaps(ah.rect, tg.hurtbox())) continue;
        const before = tg.hp; tg.takeHit(ah);
        if (tg.hp !== before) { const r = tg.hurtbox(); this.fx.sparks(ah.direction > 0 ? r.x + 2 : r.right - 2, ah.rect.centerY, ah.direction, 4, 0.7); sfx.hit(ah.damage * 0.6); }
      }
    }
    // Enemies → player.
    const inc = this.incoming; inc.length = 0;
    if (!frozen) for (const b of this.boars) for (const h of b.hits()) inc.push(h);
    if (!this.cutscene) for (const r of this.runners) for (const h of r.hits()) inc.push(h);
    if (!frozen) { for (const f of this.foes) if (f.active) for (const h of f.hits()) inc.push(h); for (const s of this.shots) inc.push(s.hits()); }
    if (this.boss?.active && !frozen) for (const h of this.boss.hits()) inc.push(h);
    if (!frozen) for (const r of this.roots) { const h = r.hitbox(now); if (h) inc.push(h); }
    const hb = this.player.hurtbox();
    for (const h of inc) if (overlaps(h.rect, hb)) { const r = this.player.receive(h); if (r !== "ignored") this.shots.find((s) => s.hit === h)?.spend(); }
    if (this.ally) { const abx = this.ally.hurtbox(); for (const h of inc) if (overlaps(h.rect, abx)) this.ally.receive(h); }

    this.syncOutline();
    const rip = this.player.riposteReady(now) && !locked;
    this.jHint.setVisible(rip);
    if (rip) this.jHint.setText(input.label("light")).setPosition(this.player.x, this.player.y - 56 - (Math.floor(time / 120) % 2));
    this.drawDebug(ph?.rect ?? null, inc);
    this.frameMs = this.frameMs * 0.95 + (performance.now() - t0) * 0.05;
  }

  /**
   * The story layer, per frame: animated props, the flock, triggers, ways that open, boars that arrive on a mark, and
   * the stampede (S6). Runs on real time except the stampede, which follows the hero's position and gameplay time.
   */
  private updateStory(time: number, delta: number, locked: boolean): void {
    const cam = this.cameras.main, px = this.player.x;
    for (const a of this.propAnims) {
      if (a.frames.length < 2 || !a.img.visible) continue;
      a.t += delta;
      if (a.t < a.ms) continue;
      a.t = 0; a.i = (a.i + 1) % a.frames.length; a.img.setTexture(a.frames[a.i]);
      if (a.sound && a.i === 1 && time - a.heardAt > 900 && Math.abs(a.img.x - px) < 260 && Math.random() < 0.5) { a.heardAt = time; sfx[a.sound](); }
    }
    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      b.img.x += b.vx * delta / 1000; b.img.y += (b.vy + Math.sin(time / 90 + b.phase) * 8) * delta / 1000;
      b.img.setTexture(Math.floor(time / 90 + b.phase) % 2 ? "bird1" : "bird0").setFlipX(true);
      if (b.img.x < cam.scrollX - 30) { b.img.destroy(); this.birds.splice(i, 1); }
    }
    for (const bl of this.blocks) {
      if (!bl.wall) continue;
      const open = bl.prop ? !this.props.get(bl.prop)?.visible : !!bl.until && this.marks.has(bl.until);
      if (open) { bl.wall.destroy(); bl.wall = null; }
    }
    for (const b of this.def.boars) {
      if (b.after && this.boarDue(b) && this.marks.has(b.after) && !this.marks.has(`spawned.${b.after}`)) { this.marks.add(`spawned.${b.after}`); this.spawnBoars(b); }
    }
    for (const f of this.def.foes ?? []) {
      const key = `spawned.foe.${f.after}.${f.x}`;
      if (f.after && this.foeDue(f) && this.marks.has(f.after) && !this.marks.has(key)) { this.marks.add(key); this.spawnFoes(f); }
    }
    if (!this.cutscene && !this.leaving && !this.ui.busy) {
      for (const tr of this.def.triggers ?? []) {
        if (this.played.has(tr.cutscene) || !this.ok(tr.when) || !this.has(tr.after)) continue;
        if (tr.x !== undefined && px < tr.x) continue;
        void this.runCutscene(tr.cutscene);
        break;
      }
    }
    // The stampede: one panicked animal at a time from the right, its sound first (the cue is the tell).
    const st = this.def.stampede, sec = this.sim;
    if (st && !locked && !(st.until && this.marks.has(st.until)) && px > st.min && px < st.max) {
      if (this.stampedeAt === 0) this.stampedeAt = sec + 900;
      if (sec >= this.stampedeAt && !this.stampedeCue) {
        this.stampedeCue = sec; sfx.tellBoar(); sfx.stomp();
        this.fx.dust(cam.scrollX + VIEW.width - 6, this.def.groundY, 4, -1, 1.2);
      }
      if (this.stampedeCue && sec - this.stampedeCue >= STAMPEDE.leadMs) {
        this.runners.push(new Runner(this, cam.scrollX + VIEW.width + 24, -1));
        this.stampedeCue = 0;
        this.stampedeAt = sec + STAMPEDE.every[0] + this.stageRng.next() * (STAMPEDE.every[1] - STAMPEDE.every[0]);
      }
    }
    // poison mist: the puffs drift; standing in it builds poison (gameplay time, and not while dodging through)
    const p = this.player;
    for (const m of this.mists) if (m.until && this.sim > m.until) { m.puffs.forEach((pf) => pf.img.destroy()); m.haze.forEach((r) => r.destroy()); m.until = -1; }
    this.mists = this.mists.filter((m) => m.until !== -1);
    for (const m of this.mists) {
      for (const pf of m.puffs) {
        pf.x += Math.sin(time / 800 + pf.phase) * 0.15; pf.y -= delta * 0.006;
        if (pf.y < this.def.groundY - 40) { pf.y = this.def.groundY - 3; pf.x = m.x + Math.random() * m.w; }
        pf.img.setPosition(pf.x, pf.y).setAlpha(0.35 + 0.35 * Math.sin(time / 600 + pf.phase));
      }
      if (!locked && p.x > m.x && p.x < m.x + m.w && p.state !== "dodge") p.addPoison(m.rate * delta / 1000);
    }
    if (p.poisoned && Math.random() < delta / 300) this.fx.motes(p.x, p.y - 24, 1);
    for (const r of this.runners) r.tick(delta, cam.scrollX, cam.scrollX + VIEW.width);
    this.runners = this.runners.filter((r) => !r.done);
  }

  private updateFloat(dtMs: number): void {
    if (!this.floatText.visible) return;
    const left = this.floatUntil - this.time.now;
    if (left <= 0) this.floatText.setVisible(false);
    else this.floatText.setY(this.floatText.y - dtMs * 0.02).setAlpha(Math.min(1, left / 300));
  }

  private syncOutline(): void {
    const p = this.player, o = this.playerOutline, key = p.texture.key + "_ol";
    if (o.texture.key !== key && this.textures.exists(key)) o.setTexture(key);
    o.setPosition(p.x, p.y).setFlipX(p.flipX).setVisible(p.visible).setAlpha(p.alpha);
  }

  /**
   * Soft push-out between the player and living enemies (playtest I-02: the player could stand inside the boss).
   * Half the overlap is resolved per frame, so it feels like bodies, not walls. Dodging passes through (i-frames).
   */
  private separate(): void {
    const p = this.player, ar = this.def.arena;
    if (p.state === "dodge" || p.isDead()) return;
    const pb = p.body2;
    const bodies = this.fighters;
    for (const e of bodies) {
      if (!e.active || !e.isAlive() || !(e.body as Phaser.Physics.Arcade.Body).enable) continue;
      const eb = e.body as Phaser.Physics.Arcade.Body;
      if (pb.bottom <= eb.y + 4 || pb.y >= eb.bottom) continue; // above it (e.g. jumping over a charge)
      const overlap = Math.min(pb.right, eb.right) - Math.max(pb.x, eb.x);
      if (overlap <= 0) continue;
      const side = p.x !== e.x ? Math.sign(p.x - e.x) : -e.facing;
      let push = side * Math.min(overlap, Math.max(2, overlap * 0.5));
      if (this.engaged && ar) {
        // Never push the player into an arena wall (a large push could tunnel past Arcade's 4 px overlap bias and
        // leave the hero half off-screen). Whatever the wall absorbs moves the enemy away instead.
        const half = pb.width / 2;
        const target = Phaser.Math.Clamp(p.x + push, ar.min + ARENA_WALL + half, ar.max - ARENA_WALL - half);
        const rest = p.x + push - target;
        if (rest !== 0) { e.x -= rest; eb.x -= rest; }
        push = target - p.x;
      }
      p.x += push; pb.x += push;
    }
  }

  /** Impact feedback for a hit that actually dealt damage: sparks, burst, shake and hit-stop by strength. */
  private onLanded(ph: PlayerHit, tg: Hittable): void {
    const r = tg.hurtbox();
    const x = ph.direction > 0 ? Math.max(r.x, ph.rect.x) + 2 : Math.min(r.right, ph.rect.right) - 2;
    const y = Math.max(r.y + 6, Math.min(r.bottom - 6, ph.rect.centerY));
    if (tg instanceof Bush) { this.fx.sparks(x, y, ph.direction, 3, 0.6); this.hitstop(30); sfx.roots(); return; }
    this.player.landed();
    const big = ph.guardBreak;
    sfx.hit(ph.damage);
    this.fx.sparks(x, y, ph.direction, big ? 12 : 6, big ? 1.3 : 1);
    this.fx.impact(x, y, big);
    this.shake(ph.damage);
    this.hitstop(big ? 70 + ph.damage : 40 + ph.damage);
  }

  private drawDebug(ph: Phaser.Geom.Rectangle | null, incoming: EnemyHit[]): void {
    const g = this.debugG;
    g.clear();
    if (!this.showDebug) return;
    this.debugText.setText(`seed ${this.seed} · ${settings().difficulty} · ${KIT.id} · ${this.frameMs.toFixed(2)} ms`);
    const hb = this.player.hurtbox();
    g.lineStyle(1, 0x62d3c3, 1).strokeRect(hb.x, hb.y, hb.width, hb.height);
    if (ph) g.lineStyle(1, 0xf6e7a0, 1).strokeRect(ph.x, ph.y, ph.width, ph.height);
    const bodies = this.fighters;
    for (const e of bodies) if (e.isAlive()) { const r = e.hurtbox(); g.lineStyle(1, 0x9aa1ad, 1).strokeRect(r.x, r.y, r.width, r.height); }
    for (const h of incoming) g.lineStyle(1, h.parryable ? 0xe8b04a : 0xff5050, 1).strokeRect(h.rect.x, h.rect.y, h.rect.width, h.rect.height);
  }

  /** For automated checks: average CPU ms spent in update() (smoothed). */
  get updateCostMs(): number { return this.frameMs; }
}

