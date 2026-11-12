import Phaser from "phaser";
import { ENEMY_FLASH, WORLD } from "./tuning";
import { EnemyHit, Hittable, PlayerHit, flash } from "./combat";

let uid = 0;
const nextId = (p: string) => `${p}-${++uid}`;

abstract class Enemy extends Phaser.Physics.Arcade.Sprite implements Hittable {
  hp: number;
  protected lastSwing = -1;
  protected flashUntil = 0;
  protected stateAt = 0;
  facing: 1 | -1 = -1;

  constructor(scene: Phaser.Scene, x: number, y: number, tex: string, public maxHp: number) {
    super(scene, x, y, tex);
    this.hp = maxHp;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(8);
  }
  get b(): Phaser.Physics.Arcade.Body { return this.body as Phaser.Physics.Arcade.Body; }
  isAlive(): boolean { return this.hp > 0; }
  hurtbox(): Phaser.Geom.Rectangle { const b = this.b; return new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height); }

  takeHit(hit: PlayerHit): void {
    if (!this.isAlive() || hit.id === this.lastSwing) return;
    this.lastSwing = hit.id;
    this.hp = Math.max(0, this.hp - hit.damage);
    flash(this, true); this.flashUntil = this.scene.time.now + ENEMY_FLASH;
    this.onDamaged(hit);
  }
  protected abstract onDamaged(hit: PlayerHit): void;
  abstract hits(): EnemyHit[];
  abstract tick(now: number, playerX: number): void;

  protected baseTick(now: number): void {
    if (now > this.flashUntil && this.flashUntil > 0) { flash(this, false); this.flashUntil = 0; }
    this.setFlipX(this.facing < 0);
  }
  /** Blink amber during telegraphs: the tell must always be readable (Bible §1). */
  protected telegraph(now: number): void {
    if (now < this.flashUntil) return;
    if (Math.floor(now / 90) % 2 === 0) flash(this, true, 0xe8b04a); else flash(this, false);
  }
}

/* ---------------- startled boar (thú hoảng) ---------------- */
type BoarState = "wander" | "notice" | "charge" | "stun" | "dead";
export class Boar extends Enemy {
  state: BoarState = "wander";
  private swing = nextId("boar");
  onDeath: (x: number) => void = () => {};

  constructor(scene: Phaser.Scene, x: number, private minX: number, private maxX: number) {
    super(scene, x, WORLD.groundY, "boar0", 40);
    this.b.setSize(26, 13).setOffset(4, 8);
    this.play("boar_run");
  }

  private enter(s: BoarState): void { this.state = s; this.stateAt = this.scene.time.now; }

  tick(now: number, playerX: number): void {
    this.baseTick(now);
    const t = now - this.stateAt, dx = playerX - this.x;
    switch (this.state) {
      case "wander":
        if (this.x < this.minX) this.facing = 1;
        if (this.x > this.maxX) this.facing = -1;
        this.b.setVelocityX(this.facing * 30);
        if (Math.abs(dx) < 170) { this.facing = dx > 0 ? 1 : -1; this.enter("notice"); this.b.setVelocityX(0); this.play("boar_idle"); }
        break;
      case "notice":
        this.telegraph(now);
        this.x += Math.sin(now / 30) * 0.3; // paw scrape
        if (t > 600) { flash(this, false); this.swing = nextId("boar"); this.enter("charge"); this.play("boar_run"); }
        break;
      case "charge":
        this.b.setVelocityX(this.facing * 210);
        if (t > 1100 || this.b.blocked.left || this.b.blocked.right) { this.enter("stun"); this.b.setVelocityX(0); this.play("boar_idle"); }
        break;
      case "stun":
        this.b.setVelocityX(this.b.velocity.x * 0.9);
        if (t > 800) { this.enter("wander"); this.play("boar_run"); }
        break;
      case "dead":
        this.b.setVelocityX(0);
        this.setAlpha(Math.max(0, 1 - t / 600));
        if (t > 600) this.destroy();
        break;
    }
  }

  hits(): EnemyHit[] {
    if (this.state !== "charge") return [];
    return [{
      id: this.swing, rect: this.hurtbox(), damage: 15, knockback: this.facing * 220, parryable: true,
      onParried: () => { this.enter("stun"); this.stateAt += -400; this.b.setVelocityX(-this.facing * 120); },
    }];
  }

  protected onDamaged(hit: PlayerHit): void {
    this.b.setVelocityX(hit.direction * 90);
    if (this.hp <= 0) { this.enter("dead"); this.b.enable = false; this.onDeath(this.x); }
    else if (this.state !== "charge") { this.facing = hit.direction > 0 ? -1 : 1; this.enter("stun"); this.stateAt -= 400; }
  }
}

/* ---------------- root spike hazard ---------------- */
export class RootSpike {
  sprite: Phaser.GameObjects.Image;
  marker: Phaser.GameObjects.Rectangle;
  private bornAt: number;
  private id = nextId("root");
  done = false;
  constructor(private scene: Phaser.Scene, public x: number, private warn: number, private active = 380) {
    this.bornAt = scene.time.now;
    this.marker = scene.add.rectangle(x, WORLD.groundY - 1, 14, 3, 0x7fa65a, 0.9).setDepth(6);
    this.sprite = scene.add.image(x, WORLD.groundY, "root").setOrigin(0.5, 1).setDepth(7).setScale(1, 0);
  }
  tick(now: number): void {
    const t = now - this.bornAt;
    if (t < this.warn) { this.marker.setAlpha(Math.floor(t / 80) % 2 ? 0.35 : 0.95); return; }
    this.marker.setVisible(false);
    const u = t - this.warn;
    if (u < 70) this.sprite.setScale(1, u / 70);
    else if (u < this.active) this.sprite.setScale(1, 1);
    else if (u < this.active + 200) this.sprite.setScale(1, 1 - (u - this.active) / 200);
    else { this.done = true; this.sprite.destroy(); this.marker.destroy(); }
  }
  hit(now: number): EnemyHit | null {
    const u = now - this.bornAt - this.warn;
    if (u < 40 || u > this.active) return null;
    return { id: this.id, rect: new Phaser.Geom.Rectangle(this.x - 4, WORLD.groundY - 30, 8, 30), damage: 14, knockback: 0, parryable: false };
  }
  get scene_(): Phaser.Scene { return this.scene; }
}

/* ---------------- Nanh Rễ (Prologue boss, scale M) ---------------- */
type BossState = "dormant" | "idle" | "tCharge" | "charge" | "tSwipe" | "swipe" | "tStomp" | "recover" | "stagger" | "down";
export class NanhRe extends Enemy {
  state: BossState = "dormant";
  private swing = nextId("nanh");
  private poise = 0;
  private chargesLeft = 0;
  private chargeTargetX = 0;
  onRoots: (xs: number[], warn: number) => void = () => {};
  onDown: () => void = () => {};
  onPhase: (phase: number) => void = () => {};
  private lastPhase = 1;

  constructor(scene: Phaser.Scene, x: number, private arenaMin: number, private arenaMax: number) {
    super(scene, x, WORLD.groundY, "nanh0", 320);
    this.b.setSize(66, 28).setOffset(15, 26);
    this.play("nanh_idle");
  }

  get phase(): number { const r = this.hp / this.maxHp; return r > 0.55 ? 1 : r > 0.22 ? 2 : 3; }
  private speedK(): number { return this.phase === 1 ? 1 : this.phase === 2 ? 0.8 : 0.7; }
  private enter(s: BossState): void { this.state = s; this.stateAt = this.scene.time.now; if (!s.startsWith("t")) flash(this, false); }

  wake(): void { if (this.state === "dormant") this.enter("idle"); }
  reset(x: number): void {
    this.hp = this.maxHp; this.poise = 0; this.lastPhase = 1; this.setPosition(x, WORLD.groundY);
    this.setTexture("nanh0"); this.play("nanh_idle"); this.b.enable = true; this.enter("dormant"); flash(this, false);
  }

  tick(now: number, playerX: number): void {
    this.baseTick(now);
    if (this.phase !== this.lastPhase && this.isAlive()) { this.lastPhase = this.phase; this.onPhase(this.phase); }
    const t = now - this.stateAt, dx = playerX - this.x, dist = Math.abs(dx);
    const k = this.speedK();
    switch (this.state) {
      case "dormant": this.b.setVelocityX(0); break;
      case "idle": {
        this.facing = dx > 0 ? 1 : -1;
        this.b.setVelocityX(dist > 80 ? this.facing * 45 : 0);
        if (this.anims.currentAnim?.key !== "nanh_idle") this.play("nanh_idle");
        if (t > 650 * k) this.choose(dist);
        break;
      }
      case "tCharge":
        this.b.setVelocityX(-this.facing * 12); this.telegraph(now);
        if (t > 700 * k) {
          this.swing = nextId("nanh"); this.chargeTargetX = Phaser.Math.Clamp(playerX + this.facing * 90, this.arenaMin + 50, this.arenaMax - 50);
          this.enter("charge"); this.play("nanh_run");
        }
        break;
      case "charge": {
        const sp = this.phase === 3 ? 300 : 260;
        this.b.setVelocityX(this.facing * sp);
        const past = this.facing > 0 ? this.x >= this.chargeTargetX : this.x <= this.chargeTargetX;
        if (past || t > 1600 || this.x < this.arenaMin + 40 || this.x > this.arenaMax - 40) {
          this.b.setVelocityX(0);
          if (this.chargesLeft > 0) { this.chargesLeft--; this.facing = dx > 0 ? 1 : -1; this.enter("tCharge"); this.stateAt -= 300; }
          else { this.enter("recover"); this.play("nanh_idle"); }
        }
        break;
      }
      case "tSwipe":
        this.b.setVelocityX(0); this.telegraph(now);
        if (t > 450 * k) { this.swing = nextId("nanh"); this.enter("swipe"); }
        break;
      case "swipe":
        this.b.setVelocityX(this.facing * 40);
        if (t > 170) this.enter("recover");
        break;
      case "tStomp":
        this.b.setVelocityX(0); this.telegraph(now);
        this.y = WORLD.groundY - (t > 450 * k ? 0 : Math.min(4, t / 60));
        if (t > 600 * k) {
          this.y = WORLD.groundY;
          this.scene.cameras.main.shake(140, 0.006);
          const n = this.phase === 1 ? 3 : 5, spread = this.phase === 1 ? 40 : 34;
          const xs: number[] = [];
          for (let i = 0; i < n; i++) xs.push(playerX + (i - (n - 1) / 2) * spread);
          if (this.phase === 3) xs.push(this.x - 70, this.x + 70);
          this.onRoots(xs.map((x) => Phaser.Math.Clamp(x, this.arenaMin + 10, this.arenaMax - 10)), 520 * k);
          this.enter("recover");
        }
        break;
      case "recover":
        this.b.setVelocityX(this.b.velocity.x * 0.85);
        if (t > (this.phase === 3 ? 450 : 750)) this.enter("idle");
        break;
      case "stagger":
        this.b.setVelocityX(0);
        this.x += Math.sin(now / 25) * 0.25;
        if (t > 1100) { this.poise = 0; this.enter("idle"); }
        break;
      case "down":
        this.b.setVelocityX(0);
        break;
    }
  }

  private choose(dist: number): void {
    const r = Math.random();
    if (dist < 75) { if (r < 0.6) this.enter("tSwipe"); else this.enter("tStomp"); return; }
    if (dist > 150) {
      if (r < 0.6) { this.chargesLeft = this.phase === 3 ? 1 : 0; this.enter("tCharge"); } else this.enter("tStomp");
      return;
    }
    if (r < 0.4) { this.chargesLeft = this.phase === 3 ? 1 : 0; this.enter("tCharge"); } else if (r < 0.75) this.enter("tStomp"); else this.enter("tSwipe");
  }

  hits(): EnemyHit[] {
    if (this.state === "charge")
      return [{ id: this.swing, rect: this.hurtbox(), damage: 22, knockback: this.facing * 260, parryable: false }];
    if (this.state === "swipe") {
      const hb = this.hurtbox();
      const x = this.facing > 0 ? hb.right - 6 : hb.x - 34;
      return [{
        id: this.swing, rect: new Phaser.Geom.Rectangle(x, hb.y - 6, 40, 34), damage: 16, knockback: this.facing * 200, parryable: true,
        onParried: () => { this.enter("stagger"); },
      }];
    }
    return [];
  }

  protected onDamaged(hit: PlayerHit): void {
    if (this.state === "dormant") this.wake();
    if (hit.guardBreak) this.poise += hit.damage;
    if (this.hp <= 0) {
      this.enter("down"); this.anims.stop(); this.setTexture("nanh_down"); this.b.setVelocity(0, 0);
      this.onDown(); return;
    }
    if (this.poise >= 60 && this.state !== "charge") { this.poise = 0; this.enter("stagger"); }
  }
}

/* ---------------- brush to clear (Prologue S1 chore) ---------------- */
export class Bush implements Hittable {
  img: Phaser.Physics.Arcade.Image;
  private hp = 3;
  private lastSwing = -1;
  onCleared: () => void = () => {};
  constructor(scene: Phaser.Scene, x: number) {
    this.img = scene.physics.add.staticImage(x, WORLD.groundY, "bush").setOrigin(0.5, 1).setDepth(7);
    // staticImage() already sized the body to the texture; narrow it to the trunk of the bush.
    (this.img.body as Phaser.Physics.Arcade.StaticBody).setSize(16, 24).setOffset(5, 0);
  }
  isAlive(): boolean { return this.hp > 0; }
  hurtbox(): Phaser.Geom.Rectangle { const b = this.img.body as Phaser.Physics.Arcade.StaticBody; return new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height); }
  takeHit(hit: PlayerHit): void {
    if (!this.isAlive() || hit.id === this.lastSwing) return;
    this.lastSwing = hit.id; this.hp--;
    this.img.scene.tweens.add({ targets: this.img, x: this.img.x + hit.direction * 2, yoyo: true, duration: 50 });
    if (this.hp <= 0) {
      (this.img.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      this.img.scene.tweens.add({ targets: this.img, alpha: 0, scaleY: 0.2, duration: 260, onComplete: () => this.img.destroy() });
      this.onCleared();
    }
  }
}
