import Phaser from "phaser";
import { Player, Controls, PlayerEvent } from "../player";
import { Boar, Bush, EnemyEvent, NanhRe, RootSpike, configureEnemies, setEnemyDifficulty } from "../enemies";
import { EnemyHit, Hittable, PlayerHit, overlaps } from "../combat";
import { Animator } from "../anim";
import { HERB_GLINT, SHRINE_LIT } from "../clips";
import { Fx } from "../fx";
import { sfx } from "../sfx";
import { music } from "../music";
import { KIT, PLAYER, VIEW, WORLD } from "../tuning";
import { input } from "../core/input";
import { t, StringKey } from "../core/i18n";
import { Rng, runSeed } from "../core/rng";
import { onSettings, settings } from "../core/settings";
import { enterStage, markDone, save, saveAtCheckpoint } from "../core/save";
import { DIFFICULTY } from "../data/difficulty";
import { FIRST_STAGE, STAGES } from "../data/stages";
import type { StageDef } from "../data/stage";
import { SCRIPTS } from "../data/dialogue";
import { CUTSCENES, Step } from "../data/cutscenes";
import { Npc } from "../npc";
import { text } from "../ui/text";
import type { UIScene } from "./UI";

/** Arena walls sit *inside* the camera bounds so the hero's drawn sprite (wider than its 10 px body) is never cut off at the edge. */
const ARENA_WALL = 16;
/** Same idea at the two ends of the world. */
const EDGE = 12;

/** new: a fresh game · continue: from the save's checkpoint · enter: arriving from the previous stage · quick: test tools. */
export type StageMode = "new" | "continue" | "enter" | "quick";
export interface StageInit { mode: StageMode }

interface Herb { id: string; img: Phaser.GameObjects.Image; anim: Animator; baseY: number; phase: number; taken: boolean; }
interface Drift { img: Phaser.GameObjects.Image; x: number; y: number; vx: number; vy: number; phase: number; }
interface Sign { x: number; key: StringKey; label: Phaser.GameObjects.Text; }
/** Something the interact key does when the hero stands near it: rest at a shrine, look at a thing, talk to someone. */
interface Interactable { x: number; range: number; y: number; act: () => void; when?: () => boolean; quiet?: () => boolean; priority?: number; }

/**
 * A playable stage, built from data (src/data/stages). The Prologue greybox runs S1 (morning chores) → S3 (lunch, a
 * cutscene) → S7 (Nanh Rễ at night, then C2); exits carry the hero on, with narration cards for the stages between.
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
  bushes: Bush[] = [];
  boss: NanhRe | null = null;
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
  private props = new Map<string, Phaser.GameObjects.Image>();
  private interactables: Interactable[] = [];
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
    // what was used up and the pouch carry across stages (the save holds them; a fresh game starts empty)
    this.taken = new Set(sv?.taken ?? []);
    this.checkpoint = { x: def.start.x, y: def.groundY };
    this.seed = runSeed();
    configureEnemies(new Rng(this.seed), DIFFICULTY[settings().difficulty]);

    const camY = def.height - VIEW.height; // ADR-0009: the view is shorter than the world; the camera keeps to the ground lane
    this.physics.world.setBounds(EDGE, -200, def.width - EDGE * 2, def.height + 200);
    this.cameras.main.setBounds(0, camY, def.width, VIEW.height).setRoundPixels(true).setBackgroundColor("#1b2a1e");

    // Parallax: Thanh Mộc mood A (concept pick), drawn at ×4.
    this.bg = this.add.tileSprite(0, 0, VIEW.width, VIEW.height, "bg_thanhmoc").setOrigin(0).setScrollFactor(0).setTileScale(4, 4).setDepth(-10);
    this.bg.tilePositionY = Math.round(camY / 4); // keep the backdrop aligned with the world as it was at 640×360
    const mid = this.add.graphics().setScrollFactor(0.5).setDepth(-5);
    const night = def.time === "night";
    for (let i = 0; i < 18; i++) {
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
    }
    for (const pr of def.props ?? []) {
      const img = this.add.image(pr.x, pr.y ?? def.groundY, pr.key).setOrigin(pr.left ? 0 : 0.5, 1).setDepth(pr.depth ?? -3);
      if (pr.id) this.props.set(pr.id, img);
    }

    // Ground and ledges.
    this.solids = this.physics.add.staticGroup();
    this.platform(0, def.groundY, def.width, def.height - def.groundY);
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
    for (const h of def.herbs) if (!this.taken.has(h.id)) this.addHerb(h.id, h.x, h.y ?? def.groundY - 6);
    this.spawnBoars();

    // Shrine checkpoint (ADR-0006).
    const sh = def.shrines[0];
    this.shrine = null; this.shrineAnim = null; this.shrineLit = false;
    if (sh) {
      this.shrine = this.add.image(sh.x, def.groundY, "shrine_off").setOrigin(0.5, 1).setDepth(5);
      this.shrineAnim = new Animator(this.shrine);
      if (sh.sign) this.sign(sh.x - 40, sh.sign);
      this.interactables.push({ x: sh.x, range: 30, y: def.groundY - 42, act: () => this.rest(), quiet: () => this.shrineLit });
      if (cont && sv!.checkpoint === sh.id) {
        this.lightShrine(false);
        this.checkpoint = { x: sh.x + 20, y: def.groundY };
        this.player.setPosition(this.checkpoint.x, def.groundY);
      }
    }
    this.player.herbCap = sv?.herbCap ?? 0;
    this.player.refillHerbs();

    // People and things to look at (S3).
    for (const n of def.npcs ?? []) this.npcs.set(n.id, new Npc(this, n.x, def.groundY, n.id, n.clip, n.facing ?? 1));
    for (const ex of def.examine ?? []) {
      this.interactables.push({ x: ex.x, range: 16, y: def.groundY - 50, act: () => this.ui.line(null, ex.text), when: () => !ex.while || !!this.props.get(ex.while)?.visible });
    }
    for (const tk of def.talk ?? []) {
      const npc = this.npcs.get(tk.npc);
      if (npc) this.interactables.push({ x: npc.x, range: 30, y: def.groundY - 56, priority: 1, act: () => void this.runCutscene(tk.cutscene), when: () => !this.cutscene && !this.leaving && npc.clip === "sit" });
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
      const boss = new NanhRe(this, ar.boss.x, ar.min, ar.max);
      boss.facing = -1;
      this.boss = boss;
      this.physics.add.collider(boss, this.solids);
      // Registered once: the walls group is filled on engage and emptied on reset (review B1).
      this.physics.add.collider(this.player, this.walls);
      this.physics.add.collider(boss, this.walls);
      boss.onRoots = (xs, warn, dmg) => xs.forEach((x, i) => this.roots.push(new RootSpike(this, x, this.sim, warn + i * 40, dmg)));
      boss.onDown = () => this.bossDown();
      boss.onPhase = (p) => { sfx.roar(); music.setIntensity(p); this.ui.toast(t(p === 2 ? "boss.nanhRe.p2" : "boss.nanhRe.p3")); this.cameras.main.shake(220, 0.006 * settings().shake); };
      boss.onFx = (e, ex, ey) => this.onEnemyFx(e, ex, ey, boss.facing, 2.2);
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

  private spawnBoars(): void {
    for (const b of this.def.boars) {
      const boar = new Boar(this, b.x, b.min, b.max, b.tellMs);
      this.physics.add.collider(boar, this.solids);
      boar.onFx = (e, ex, ey) => this.onEnemyFx(e, ex, ey, boar.facing, 1);
      this.boars.push(boar);
    }
  }

  private platform(x: number, y: number, w: number, h: number, oneWay = false): void {
    this.add.tileSprite(x, y, w, Math.min(h, 16), "ground").setOrigin(0).setDepth(2);
    if (h > 16) this.add.tileSprite(x, y + 16, w, h - 16, "dirt").setOrigin(0).setDepth(2);
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
    for (let x = 8; x < def.width; x += 17 + ((x * 7) % 13)) {
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
    for (let i = 0; i < (leafKind === "none" ? 0 : 5); i++) {
      const img = this.add.image(0, 0, this.leafKey + "0").setDepth(4);
      this.leaves.push({ img, x: Math.random() * VIEW.width, y: -Math.random() * 300, vx: 8, vy: 22 + Math.random() * 14, phase: Math.random() * 6 });
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
      l.x += (l.vx + Math.sin(now / 400 + l.phase) * 18) * sec; l.y += l.vy * sec;
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

  private addHerb(id: string, x: number, y: number): void {
    const img = this.add.image(x, y, "herb0").setOrigin(0.5, 1).setDepth(6);
    const anim = new Animator(img); anim.play(HERB_GLINT); anim.update(Math.random() * 1500);
    this.herbs.push({ id, img, anim, baseY: y, phase: Math.random() * 6, taken: false });
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
    const missing = this.def.boars.length - this.boars.filter((b) => b.active && b.isAlive()).length;
    if (missing > 0) { this.boars.forEach((b) => b.destroy()); this.boars = []; this.spawnBoars(); }
    saveAtCheckpoint(this.def.id, sh.id, this.player.herbCap, this.taken);
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
    enterStage(to, this.player.herbCap, this.taken);
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
    for (const st of steps) {
      if (this.gone) return; // the stage was left (title, restart) mid-scene
      await this.step(st);
    }
    this.cutscene = null; this.skipping = false;
  }

  /** Skip (pause menu): every pending wait, walk and line completes at once; the remaining steps run instantly. */
  skipCutscene(): void {
    if (!this.cutscene) return;
    this.skipping = true;
    this.ui.closeLine();
    for (const n of this.npcs.values()) n.finishWalk();
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
      const n = this.npcs.get(st.walk); if (!n) return done;
      if (fast) { n.x = st.to; n.pose("idle"); return done; }
      return n.walkTo(st.to);
    }
    if ("face" in st) { if (st.face === "player") this.player.facing = st.dir; else { const n = this.npcs.get(st.face); if (n) n.facing = st.dir; } return done; }
    if ("pose" in st) { this.npcs.get(st.pose)?.pose(st.clip); return done; }
    if ("wait" in st) return fast ? done : this.delay(st.wait);
    if ("leaf" in st) return this.leafFall(st.leaf);
    if ("hideProp" in st) { this.props.get(st.hideProp)?.setVisible(false); return done; }
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
    return done;
  }

  /* ------------------------------------------------------------ events */

  private onPlayerEvent(k: PlayerEvent): void {
    const p = this.player, f = p.facing;
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
      case "perfectDodge": if (KIT.classKit) { this.ui.toast(t("toast.perfectDodge"), 700); this.fx.sparkle(p.x, p.y - 24, 6, 0x9fd0c0); } break;
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
  }

  private respawn(): void {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(260, () => {
      this.player.respawn(this.checkpoint.x, this.checkpoint.y);
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
      this.ui.toast(t(this.shrineLit ? "toast.wakeShrine" : "toast.wakeStart"));
    });
  }

  private engage(): void {
    const ar = this.def.arena!;
    this.engaged = true;
    for (const x of [ar.min + ARENA_WALL / 2, ar.max - ARENA_WALL / 2]) this.walls.add(this.add.rectangle(x, this.def.groundY / 2, 16, this.def.groundY + 200).setVisible(false));
    this.cameras.main.setBounds(ar.min, this.def.height - VIEW.height, ar.max - ar.min, VIEW.height);
    this.ui.showBoss(t(ar.boss.name));
    music.play("boss", 1);
    this.ui.toast(t(ar.boss.intro), 2000);
    this.time.delayedCall(900, () => { this.boss?.wake(); sfx.roar(); });
  }

  private bossDown(): void {
    const ar = this.def.arena!, boss = this.boss!;
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
    const epilogue = t(spared ? "c2.spared.end" : "c2.killed.end");
    this.time.delayedCall(3200, () => this.ui.endCard(epilogue));
  }

  /* ------------------------------------------------------------ frame */

  update(time: number, delta: number): void {
    const t0 = performance.now();
    if (input.consume("debug")) { this.showDebug = !this.showDebug; this.debugText.setVisible(this.showDebug); }

    // Real-time systems (run during hit-stop too).
    this.fx.update(delta);
    this.updateAmbience(time, delta);
    this.shrineAnim?.update(delta);
    if (this.shrine && this.shrineLit && Math.random() < delta / 260) this.fx.motes(this.shrine.x, this.shrine.y - 30, 1);
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
    const exit = this.def.exit;
    if (exit && !this.leaving && !locked && this.player.x > exit.x) this.leave(exit.to, exit.card);
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.15 / 4;

    // Camera look-ahead: lean ~32 px toward the facing direction, eased.
    this.lookAhead += (-this.player.facing * 32 - this.lookAhead) * Math.min(1, dt / 400);
    this.cameras.main.setFollowOffset(Math.round(this.lookAhead), 40);

    // Pickups and interactions (with feedback).
    for (const h of this.herbs) {
      if (!h.taken && Math.abs(h.img.x - this.player.x) < 12 && Math.abs(h.img.y - this.player.y) < 30) {
        h.taken = true; this.taken.add(h.id); h.img.destroy(); this.player.addHerb(); sfx.pickup();
        this.fx.sparkle(h.img.x, h.baseY - 6, 8); this.float(h.img.x, h.baseY - 14, t("toast.herb"));
      }
    }
    // The interact key acts on the nearest thing in reach: rest at a shrine, look at something, talk to someone.
    let near: Interactable | null = null;
    for (const it of this.interactables) {
      const d = Math.abs(it.x - this.player.x);
      if (d >= it.range || (it.when && !it.when())) continue;
      // talking to someone beats looking at a thing beside them; otherwise the nearest wins
      const better = !near || (it.priority ?? 0) > (near.priority ?? 0) || ((it.priority ?? 0) === (near.priority ?? 0) && d < Math.abs(near.x - this.player.x));
      if (better) near = it;
    }
    this.keyHint.setVisible(!!near && !locked && !near.quiet?.());
    if (near) this.keyHint.setText(input.label("interact")).setPosition(near.x, near.y - Math.round(Math.sin(time / 250)));
    if (!locked && near && input.pressed("interact")) near.act();
    const ar = this.def.arena;
    if (ar && this.boss && !this.engaged && !this.finished && this.boss.isAlive() && this.player.x > ar.min + 30) this.engage();

    // Enemies and hazards (simulation time).
    const px = this.player.x;
    this.boars = this.boars.filter((b) => b.active);
    for (const b of this.boars) b.tick(now, dt, px);
    if (this.boss?.active) {
      if (this.engaged && this.player.state === "heal") this.boss.punishHeal(Math.abs(px - this.boss.x));
      this.boss.tick(now, dt, px);
    }
    for (const b of this.bushes) b.tick(time);
    this.separate();
    for (const r of this.roots) {
      if (r.tick(now)) { this.fx.dust(r.x, this.def.groundY, 2, 0, 0.8); sfx.roots(); }
      else if (r.warning(now) && Math.random() < dt / 110) this.fx.dust(r.x + (Math.random() - 0.5) * 10, this.def.groundY, 1, 0, 0.35); // low dirt specks: "this spot"
    }
    this.roots = this.roots.filter((r) => !r.done);

    // Player → targets.
    const ph = this.player.currentHit();
    if (ph) {
      this.targets.length = 0;
      this.targets.push(...this.bushes, ...this.boars);
      if (this.boss) this.targets.push(this.boss);
      for (const tg of this.targets) {
        if (!tg.isAlive() || !overlaps(ph.rect, tg.hurtbox())) continue;
        const before = tg.hp;
        tg.takeHit(ph);
        if (tg.hp !== before) this.onLanded(ph, tg);
      }
    }
    // Enemies → player.
    const inc = this.incoming; inc.length = 0;
    for (const b of this.boars) for (const h of b.hits()) inc.push(h);
    if (this.boss?.active) for (const h of this.boss.hits()) inc.push(h);
    for (const r of this.roots) { const h = r.hitbox(now); if (h) inc.push(h); }
    const hb = this.player.hurtbox();
    for (const h of inc) if (overlaps(h.rect, hb)) this.player.receive(h);

    this.syncOutline();
    const rip = this.player.riposteReady(now) && !locked;
    this.jHint.setVisible(rip);
    if (rip) this.jHint.setText(input.label("light")).setPosition(this.player.x, this.player.y - 56 - (Math.floor(time / 120) % 2));
    this.drawDebug(ph?.rect ?? null, inc);
    this.frameMs = this.frameMs * 0.95 + (performance.now() - t0) * 0.05;
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
    const bodies: (Boar | NanhRe)[] = this.boss ? [...this.boars, this.boss] : this.boars;
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
    const bodies: (Boar | NanhRe)[] = this.boss ? [...this.boars, this.boss] : this.boars;
    for (const e of bodies) if (e.isAlive()) { const r = e.hurtbox(); g.lineStyle(1, 0x9aa1ad, 1).strokeRect(r.x, r.y, r.width, r.height); }
    for (const h of incoming) g.lineStyle(1, h.parryable ? 0xe8b04a : 0xff5050, 1).strokeRect(h.rect.x, h.rect.y, h.rect.width, h.rect.height);
  }

  /** For automated checks: average CPU ms spent in update() (smoothed). */
  get updateCostMs(): number { return this.frameMs; }
}

