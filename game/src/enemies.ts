import Phaser from "phaser";
import { ENEMY_FLASH, WORLD } from "./tuning";
import { EnemyHit, Hittable, PlayerHit, flash } from "./combat";
import { canTint } from "./render";
import { Animator, Clip } from "./anim";
import { BC, NC, ROOT } from "./clips";

let uid = 0;
const nextId = (p: string) => `${p}-${++uid}`;
const NONE: EnemyHit[] = [];

export type EnemyEvent = "step" | "paw" | "stomp" | "thud" | "dead" | "skid" | "tellBoar" | "tellCharge" | "tellSwipe" | "tellStomp" | "glint";

abstract class Enemy extends Phaser.Physics.Arcade.Sprite implements Hittable {
  hp: number;
  facing: 1 | -1 = -1;
  readonly anim: Animator;
  protected now = 0;
  protected lastSwing = -1;
  protected flashUntil = 0;
  protected stateAt = 0;
  /** Knockback velocity, eased out exponentially and added on top of AI movement. */
  protected kb = 0;
  protected kbResist = 1;
  private readonly hb = new Phaser.Geom.Rectangle();
  onFx: (e: EnemyEvent, x: number, y: number) => void = () => {};

  constructor(scene: Phaser.Scene, x: number, y: number, tex: string, public maxHp: number) {
    super(scene, x, y, tex);
    this.hp = maxHp;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(8);
    this.anim = new Animator(this, (e) => this.onFx(e as EnemyEvent, this.x, this.y));
  }
  get b(): Phaser.Physics.Arcade.Body { return this.body as Phaser.Physics.Arcade.Body; }
  isAlive(): boolean { return this.hp > 0; }
  hurtbox(): Phaser.Geom.Rectangle { const b = this.b; return this.hb.setTo(b.x, b.y, b.width, b.height); }

  takeHit(hit: PlayerHit): void {
    if (!this.isAlive() || hit.id === this.lastSwing) return;
    this.lastSwing = hit.id;
    this.hp = Math.max(0, this.hp - hit.damage);
    flash(this, true); this.flashUntil = this.now + ENEMY_FLASH;
    this.kb = hit.direction * (hit.guardBreak ? 150 : 90) / this.kbResist;
    this.onDamaged(hit);
  }
  protected abstract onDamaged(hit: PlayerHit): void;
  abstract hits(): EnemyHit[];
  abstract tick(now: number, dt: number, playerX: number): void;

  /** Common per-frame work: flash timeout, knockback easing, facing, animation. */
  protected finish(dt: number, aiVx: number): void {
    if (this.flashUntil > 0 && this.now > this.flashUntil) { flash(this, false); this.flashUntil = 0; }
    this.kb *= Math.exp(-dt / 70); // ease-out over ~0.2 s
    if (Math.abs(this.kb) < 2) this.kb = 0;
    if (this.b.enable) this.b.setVelocityX(aiVx + this.kb);
    this.setFlipX(this.facing < 0);
    this.anim.update(dt);
  }
  protected enterAt(): void { this.stateAt = this.now; }
  /**
   * Telegraph: an additive warm glow that *ramps up* over the windup (slow in, builds to the strike).
   * The pose stays fully readable; localised cues (glint, dust, cracks) and a sound mark the attack type.
   * Playtest I-03: the old full-body 90 ms amber blink erased the silhouette half the time.
   */
  protected telegraph(progress: number): void {
    if (this.now < this.flashUntil) return;
    const p = Phaser.Math.Clamp(progress, 0, 1), k = 0.12 + 0.88 * p * p;
    // Canvas has no tints: glow additively for the last 45% of the windup (cleared by flash(false), as the tint is).
    if (!canTint(this)) { this.setBlendMode(p > 0.55 ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL); return; }
    const r = Math.round(0x78 * k), g = Math.round(0x4c * k), b = Math.round(0x12 * k);
    this.setTint((r << 16) | (g << 8) | b).setTintMode(Phaser.TintModes.ADD);
  }
  protected show(c: Clip, restart = false): void { this.anim.play(c, restart, restart); }
}

/* ---------------- startled boar (thú hoảng) ---------------- */
type BoarState = "wander" | "notice" | "charge" | "stun" | "dead";
export class Boar extends Enemy {
  state: BoarState = "wander";
  private swing = nextId("boar");
  private near = false;
  private readonly hit: EnemyHit;
  private readonly hitList: EnemyHit[];
  onDeath: (x: number) => void = () => {};

  /**
   * Leash (cloud playtest: two boars chased the player into the boss arena). A boar only notices a player near
   * its territory, a charge ends a little past it, and a boar outside its range walks home, ignoring the player.
   */
  private static readonly LEASH = 50;
  private static readonly NOTICE_RANGE = 120;
  private static readonly CHARGE_LIMIT = 140;

  /** `tellMs`: the notice windup. The first (teaching) boar uses a longer one, so its one lesson is easy to read. */
  constructor(scene: Phaser.Scene, x: number, private minX: number, private maxX: number, private tellMs = 600) {
    super(scene, x, WORLD.groundY, "boar_walk0", 60); // 60 HP: a riposte (40) no longer one-shots it (playtest I-04)
    this.b.setSize(26, 13).setOffset(5, 9);
    this.hit = { id: this.swing, rect: new Phaser.Geom.Rectangle(), damage: 15, knockback: 0, parryable: true, onParried: () => this.parried() };
    this.hitList = [this.hit];
    this.show(BC.walk);
  }

  private enter(s: BoarState): void { this.state = s; this.enterAt(); }
  private parried(): void { this.enter("stun"); this.stateAt -= 400; this.kb = -this.facing * 160; this.show(BC.stun); }

  tick(now: number, dt: number, playerX: number): void {
    this.now = now;
    const t = now - this.stateAt, dx = playerX - this.x;
    let vx = 0;
    switch (this.state) {
      case "wander": {
        const home = this.x < this.minX - Boar.LEASH ? 1 : this.x > this.maxX + Boar.LEASH ? -1 : 0;
        if (home) { this.facing = home; vx = home * 60; this.show(BC.walk); this.anim.timeScale = 1; break; }
        // Too close to charge: back off first, so every charge starts from a readable distance
        // (fix-pass finding: after a riposte it recovered beside the player and charged point-blank, unavoidable).
        if (Math.abs(dx) < 80) {
          const away = dx > 0 ? -1 : 1, nx = this.x + away * 24;
          if (nx > this.minX - Boar.LEASH && nx < this.maxX + Boar.LEASH) {
            this.facing = away; vx = away * 80; this.show(BC.walk); this.anim.timeScale = 1.1;
          } else { this.facing = dx > 0 ? 1 : -1; this.show(BC.idle); } // cornered at the leash: stand and face
          break;
        }
        if (this.x < this.minX) this.facing = 1;
        if (this.x > this.maxX) this.facing = -1;
        vx = this.facing * 30;
        this.show(BC.walk);
        this.anim.timeScale = 0.8;
        const inRange = playerX > this.minX - Boar.NOTICE_RANGE && playerX < this.maxX + Boar.NOTICE_RANGE;
        if (inRange && Math.abs(dx) < 170) { this.facing = dx > 0 ? 1 : -1; this.enter("notice"); this.show(BC.paw, true); this.onFx("tellBoar", this.x, this.y); }
        break;
      }
      case "notice": // anticipation: head down, pawing the ground
        this.telegraph(t / this.tellMs);
        if (t > this.tellMs) { flash(this, false); this.swing = nextId("boar"); this.near = false; this.enter("charge"); this.show(BC.gallop, true); }
        break;
      case "charge":
        vx = this.facing * 210;
        // Dodged through: it skids to a stop just past the player, leaving a short punish window (playtest I-04).
        if (Math.abs(dx) < 26) this.near = true;
        if (this.near && dx * this.facing < -18) { this.enter("stun"); this.show(BC.stun, true); this.kb = this.facing * 40; this.onFx("skid", this.x, this.y); break; }
        const runaway = this.x > this.maxX + Boar.CHARGE_LIMIT || this.x < this.minX - Boar.CHARGE_LIMIT;
        if (t > 1100 || runaway || this.b.blocked.left || this.b.blocked.right) { this.enter("stun"); this.show(BC.stun, true); this.kb = this.facing * 60; }
        break;
      case "stun":
        this.show(BC.stun);
        if (t > 800) { this.enter("wander"); this.show(BC.walk); }
        break;
      case "dead":
        if (t > 700) this.setAlpha(Math.max(0, 1 - (t - 700) / 500));
        if (t > 1200) { this.destroy(); return; }
        break;
    }
    if (this.state !== "wander") this.anim.timeScale = 1;
    this.finish(dt, vx);
  }

  hits(): EnemyHit[] {
    if (this.state !== "charge") return NONE;
    this.hit.id = this.swing; this.hit.rect.setTo(this.b.x, this.b.y, this.b.width, this.b.height);
    this.hit.knockback = this.facing * 220;
    return this.hitList;
  }

  protected onDamaged(hit: PlayerHit): void {
    if (this.hp <= 0) {
      this.enter("dead"); this.show(BC.death, true); this.onDeath(this.x); this.onFx("dead", this.x, this.y);
      this.kb = hit.direction * 120; this.b.checkCollision.left = this.b.checkCollision.right = false;
      return;
    }
    if (this.state !== "charge") {
      this.facing = hit.direction > 0 ? -1 : 1;
      this.enter("stun"); this.stateAt -= 400;
      this.show(BC.hurt, true); // HURT outranks the stun loop, so stun resumes only once the flinch has played
    }
  }
}

/* ---------------- root spike hazard ---------------- */
export class RootSpike {
  sprite: Phaser.GameObjects.Image;
  marker: Phaser.GameObjects.Rectangle;
  /** Dark crack under the marker: together they read as "the ground here is about to break". */
  private crack: Phaser.GameObjects.Rectangle;
  done = false;
  private readonly hit: EnemyHit;
  private stage = -1;
  constructor(scene: Phaser.Scene, public x: number, private bornAt: number, private warn: number, private active = 380) {
    // Cloud playtest: the green marker vanished against the grass. A warm amber line flat on the ground now grows and
    // brightens over the warning, then flickers just before the eruption: it marks exactly where *not* to stand.
    this.crack = scene.add.rectangle(x, WORLD.groundY + 1, 12, 3, 0x140f0c, 0.95).setDepth(6);
    this.marker = scene.add.rectangle(x, WORLD.groundY - 1, 12, 3, 0xffc24d, 0.7).setDepth(6);
    this.sprite = scene.add.image(x, WORLD.groundY, ROOT[0]).setOrigin(0.5, 1).setDepth(7).setVisible(false);
    this.hit = { id: nextId("root"), rect: new Phaser.Geom.Rectangle(x - 4, WORLD.groundY - 30, 8, 30), damage: 14, knockback: 0, parryable: false };
  }
  /** Returns true on the frame the spike erupts (for dust/shake). */
  tick(now: number): boolean {
    const t = now - this.bornAt;
    if (t < this.warn) {
      const u = t / this.warn, w = Math.round(12 + u * 12);
      this.marker.setSize(w, u > 0.6 ? 4 : 3).setAlpha(u > 0.75 && Math.floor(t / 60) % 2 ? 0.6 : 0.7 + 0.3 * u);
      this.crack.setSize(w + 4, 3);
      return false;
    }
    const u = t - this.warn;
    const stage = u < 60 ? 0 : u < this.active ? 1 : u < this.active + 160 ? 2 : 3;
    if (stage === this.stage) return false;
    const first = this.stage < 0;
    this.stage = stage;
    this.marker.setVisible(false); this.crack.setVisible(false);
    if (stage === 3) { this.destroy(); return false; }
    this.sprite.setVisible(true).setTexture(ROOT[stage]);
    return first;
  }
  /** True while the ground is still only warning (the scene kicks up low dirt specks from it). */
  warning(now: number): boolean { return !this.done && now - this.bornAt < this.warn; }
  hitbox(now: number): EnemyHit | null {
    const u = now - this.bornAt - this.warn;
    return u >= 40 && u <= this.active ? this.hit : null;
  }
  destroy(): void { this.done = true; this.sprite.destroy(); this.marker.destroy(); this.crack.destroy(); }
}

/* ---------------- Nanh Rễ (Prologue boss, scale M) ---------------- */
type BossState = "dormant" | "idle" | "tCharge" | "charge" | "tSwipe" | "swipe" | "tStomp" | "recover" | "stagger" | "down" | "leave";
export class NanhRe extends Enemy {
  state: BossState = "dormant";
  private swing = nextId("nanh");
  private poise = 0;
  private chargesLeft = 0;
  private chargeTargetX = 0;
  private stomped = false;
  private readonly hit: EnemyHit;
  private readonly hitList: EnemyHit[];
  onRoots: (xs: number[], warn: number) => void = () => {};
  onDown: () => void = () => {};
  onPhase: (phase: number) => void = () => {};
  private lastPhase = 1;

  constructor(scene: Phaser.Scene, x: number, private arenaMin: number, private arenaMax: number) {
    super(scene, x, WORLD.groundY, "nanh_idle0", 320);
    this.b.setSize(66, 28).setOffset(17, 26);
    this.kbResist = 4; // heavy: barely moved by hits
    this.hit = { id: this.swing, rect: new Phaser.Geom.Rectangle(), damage: 0, knockback: 0, parryable: false };
    this.hitList = [this.hit];
    this.show(NC.idle);
  }

  get phase(): number { const r = this.hp / this.maxHp; return r > 0.55 ? 1 : r > 0.22 ? 2 : 3; }
  private speedK(): number { return this.phase === 1 ? 1 : this.phase === 2 ? 0.8 : 0.7; }
  private glinted = false;
  private enter(s: BossState): void {
    this.state = s; this.enterAt(); this.glinted = false;
    if (!s.startsWith("t")) flash(this, false);
    if (s === "tCharge") this.onFx("tellCharge", this.x, this.y);
    if (s === "tSwipe") this.onFx("tellSwipe", this.x, this.y);
    if (s === "tStomp") this.onFx("tellStomp", this.x, this.y);
  }
  /** The player died: stop attacking the body and stand still until the respawn resets the fight. */
  stand(): void { if (this.isAlive() && this.state !== "leave") { this.enter("dormant"); this.show(NC.idle, true); } }

  /** Opening beat: she wakes and holds for a moment before the first attack, so the fight starts clean. */
  wake(): void { if (this.state === "dormant") { this.enter("idle"); this.stateAt += 700; } }
  reset(x: number): void {
    this.hp = this.maxHp; this.poise = 0; this.lastPhase = 1; this.kb = 0; this.stomped = false; this.setPosition(x, WORLD.groundY);
    this.b.enable = true; this.setAlpha(1); this.enter("dormant"); flash(this, false); this.show(NC.idle, true);
  }
  /** Spare branch (C2): she gets up and limps away to the south. */
  leave(): void { this.enter("leave"); this.facing = 1; this.b.enable = true; this.b.checkCollision.left = this.b.checkCollision.right = false; this.show(NC.walk, true); }

  tick(now: number, dt: number, playerX: number): void {
    this.now = now;
    if (this.phase !== this.lastPhase && this.isAlive()) { this.lastPhase = this.phase; this.onPhase(this.phase); }
    const t = now - this.stateAt, dx = playerX - this.x, dist = Math.abs(dx);
    const k = this.speedK();
    let vx = 0;
    this.anim.timeScale = 1;
    switch (this.state) {
      case "dormant": this.show(NC.idle); break;
      case "idle": {
        this.facing = dx > 0 ? 1 : -1;
        vx = dist > 80 ? this.facing * 45 : 0;
        if (vx !== 0) { this.show(NC.walk); this.anim.timeScale = 0.75; } else this.show(NC.idle);
        if (t > 650 * k) this.choose(dist);
        break;
      }
      case "tCharge": // anticipation: head down, tremble, slide back a little
        this.show(NC.low); this.telegraph(t / (700 * k));
        vx = -this.facing * 14;
        if (t > 700 * k) {
          this.swing = nextId("nanh"); this.chargeTargetX = Phaser.Math.Clamp(playerX + this.facing * 90, this.arenaMin + 50, this.arenaMax - 50);
          this.enter("charge"); this.show(NC.gallop, true);
        }
        break;
      case "charge": {
        vx = this.facing * (this.phase === 3 ? 300 : 260);
        const past = this.facing > 0 ? this.x >= this.chargeTargetX : this.x <= this.chargeTargetX;
        if (past || t > 1600 || this.x < this.arenaMin + 40 || this.x > this.arenaMax - 40) {
          vx = 0; this.kb = this.facing * 120; // overshoot, eased out
          if (this.chargesLeft > 0) { this.chargesLeft--; this.facing = dx > 0 ? 1 : -1; this.enter("tCharge"); this.stateAt -= 300; }
          // Phase 2+: sometimes whips round into a quick tusk sweep, so "dodge the charge, then combo" is no longer free.
          else if (this.phase >= 2 && Math.random() < 0.45) { this.facing = dx > 0 ? 1 : -1; this.enter("tSwipe"); this.stateAt -= Math.max(0, 450 * k - 300); }
          else { this.enter("recover"); this.show(NC.skid, true); } // braced skid, then winded: the counter window
        }
        break;
      }
      case "tSwipe":
        this.show(NC.rear); this.telegraph(t / (450 * k));
        if (!this.glinted && t > 450 * k * 0.55) { this.glinted = true; this.onFx("glint", this.x + this.facing * 46, this.y - 20); }
        if (t > 450 * k) { this.swing = nextId("nanh"); this.enter("swipe"); this.show(NC.toss, true); }
        break;
      case "swipe":
        vx = this.facing * 40;
        if (t > 170) this.enter("recover");
        break;
      case "tStomp":
        if (!this.stomped && t <= 450 * k) { this.show(NC.rear); this.telegraph(t / (450 * k)); }
        if (t > 600 * k && !this.stomped) {
          this.stomped = true; flash(this, false); this.show(NC.slam, true);
          const n = this.phase === 1 ? 3 : 5, spread = this.phase === 1 ? 40 : 34;
          const xs: number[] = [];
          for (let i = 0; i < n; i++) xs.push(playerX + (i - (n - 1) / 2) * spread);
          if (this.phase === 3) xs.push(this.x - 70, this.x + 70);
          this.onRoots(xs.map((x) => Phaser.Math.Clamp(x, this.arenaMin + 10, this.arenaMax - 10)), 520 * k);
        }
        if (this.stomped && t > 600 * k + 160) { this.stomped = false; this.enter("recover"); }
        break;
      case "recover":
        if (this.anim.name === "skid" && this.anim.finished) this.show(NC.winded);
        else if (this.anim.name !== "winded" && (this.anim.finished || this.anim.name === "idle")) this.show(NC.idle);
        if (t > [0, 600, 450, 320][this.phase]) this.enter("idle"); // was 750/750/450: punish windows shortened (playtest I-01); tuned for a Prologue boss
        break;
      case "stagger":
        this.show(NC.daze);
        if (t > 1100) { this.poise = 0; this.enter("idle"); this.show(NC.idle, true); } // the daze loop would otherwise outlast the stagger
        break;
      case "down": break;
      case "leave":
        vx = 70; this.show(NC.walk); this.anim.timeScale = 0.6;
        break;
    }
    this.finish(dt, vx);
  }

  private choose(dist: number): void {
    const r = Math.random();
    const charge = () => { this.chargesLeft = this.phase === 3 ? 1 : 0; this.enter("tCharge"); };
    if (dist < 75) { if (r < 0.6) this.enter("tSwipe"); else this.enter("tStomp"); return; }
    if (dist > 150) { if (r < 0.6) charge(); else this.enter("tStomp"); return; }
    if (r < 0.4) charge(); else if (r < 0.75) this.enter("tStomp"); else this.enter("tSwipe");
  }

  hits(): EnemyHit[] {
    const h = this.hit;
    if (this.state === "charge") {
      h.id = this.swing; h.damage = 22; h.knockback = this.facing * 260; h.parryable = false; h.onParried = undefined;
      h.rect.setTo(this.b.x, this.b.y, this.b.width, this.b.height);
      return this.hitList;
    }
    if (this.state === "swipe") {
      const x = this.facing > 0 ? this.b.right - 6 : this.b.x - 34;
      h.id = this.swing; h.damage = 22; h.knockback = this.facing * 200; h.parryable = true;
      h.onParried = () => { this.enter("stagger"); this.show(NC.daze, true); };
      h.rect.setTo(x, this.b.y - 6, 40, 34);
      return this.hitList;
    }
    return NONE;
  }

  protected onDamaged(hit: PlayerHit): void {
    if (this.state === "dormant") this.wake();
    if (hit.guardBreak) this.poise += hit.damage;
    if (this.hp <= 0) {
      this.enter("down"); this.kb = 0; this.show(NC.collapse, true); this.b.setVelocity(0, 0);
      this.onDown(); return;
    }
    if (this.poise >= 60 && this.state !== "charge") { this.poise = 0; this.enter("stagger"); this.show(NC.daze, true); return; }
    // Super armour during attacks; a readable flinch only when she is not committed.
    if (this.state === "idle" || this.state === "recover") this.show(NC.flinch, true);
  }
}

/* ---------------- brush to clear (Prologue S1 chore) ---------------- */
export class Bush implements Hittable {
  img: Phaser.Physics.Arcade.Image;
  hp = 3;
  private lastSwing = -1;
  private shakeUntil = 0;
  private readonly hb = new Phaser.Geom.Rectangle();
  onCleared: () => void = () => {};
  onHit: (x: number, y: number) => void = () => {};
  constructor(scene: Phaser.Scene, x: number) {
    this.img = scene.physics.add.staticImage(x, WORLD.groundY, "bush0").setOrigin(0.5, 1).setDepth(7);
    // staticImage() already sized the body to the texture; narrow it to the trunk of the bush.
    (this.img.body as Phaser.Physics.Arcade.StaticBody).setSize(16, 24).setOffset(6, 0);
  }
  isAlive(): boolean { return this.hp > 0; }
  hurtbox(): Phaser.Geom.Rectangle { const b = this.img.body as Phaser.Physics.Arcade.StaticBody; return this.hb.setTo(b.x, b.y, b.width, b.height); }
  takeHit(hit: PlayerHit): void {
    if (!this.isAlive() || hit.id === this.lastSwing) return;
    this.lastSwing = hit.id; this.hp--;
    this.shakeUntil = this.img.scene.time.now + 160;
    this.onHit(this.img.x, this.img.y - 12);
    if (this.hp <= 0) {
      (this.img.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      this.img.setVisible(false);
      this.onCleared();
    }
  }
  /** Leaf-shake frames while recently hit (drawn frames, not a tween). */
  tick(now: number): void {
    if (!this.img.visible) return;
    const key = now < this.shakeUntil ? (Math.floor(now / 40) % 2 ? "bush1" : "bush2") : "bush0";
    if (this.img.texture.key !== key) this.img.setTexture(key);
  }
}
