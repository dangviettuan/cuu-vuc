import Phaser from "phaser";
import { AttackDef, DODGE, HEAVY, LIGHT, PARRY, PLAYER, RIPOSTE, RIPOSTE_WINDOW } from "./tuning";
import { EnemyHit, HitResult, PlayerHit, flash } from "./combat";

export interface Controls {
  left: boolean; right: boolean;
  jumpHeld: boolean; jumpPressed: boolean;
  lightPressed: boolean;
  heavyHeld: boolean;
  dodgePressed: boolean;
  parryPressed: boolean;
  herbPressed: boolean;
}

type State = "move" | "light" | "charge" | "heavy" | "riposte" | "dodge" | "parry" | "heal" | "hurt" | "dead";

/**
 * The protagonist with the greybox Kiếm Khách kit (Combat & Class Bible §2–3).
 * Note: in the final game the Prologue has no class (PB L9); the greybox merges them to test Riposte.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number = PLAYER.maxHp;
  stamina: number = PLAYER.maxStamina;
  the = 0; // Thế: Kiếm Khách stance charge
  herbs = 0;
  facing: 1 | -1 = 1;
  state: State = "move";
  private stateAt = 0;
  private combo = 0;
  private comboQueued = false;
  private attack: AttackDef | null = null;
  private attackDamage = 0;
  private swingId = 0;
  private hitIds = new Set<string>();
  private chargeAt = 0;
  private dodgeAt = 0;
  private parryAt = 0;
  private riposteUntil = 0;
  private invulnUntil = 0;
  private staminaRegenAt = 0;
  private coyoteUntil = 0;
  private jumpBufferUntil = 0;
  private jumpCut = false;
  private flashUntil = 0;
  slashFx: Phaser.GameObjects.Image;
  /** Event hooks for the scene (HUD text, camera shake). */
  onEvent: (kind: "parry" | "perfectDodge" | "hurt" | "riposte" | "heal" | "dead", data?: number) => void = () => {};

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "p_idle0");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 44).setOffset(11, 10);
    body.setMaxVelocityY(600);
    this.setOrigin(0.5, 1);
    this.setDepth(10);
    this.slashFx = scene.add.image(x, y, "slash0").setVisible(false).setDepth(11).setOrigin(0.1, 0.5);
    this.play("p_idle");
  }

  get body2(): Phaser.Physics.Arcade.Body { return this.body as Phaser.Physics.Arcade.Body; }
  get grounded(): boolean { return this.body2.blocked.down || this.body2.touching.down; }
  isDead(): boolean { return this.state === "dead"; }

  hurtbox(): Phaser.Geom.Rectangle {
    const b = this.body2;
    return new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
  }

  respawn(x: number, y: number): void {
    this.hp = PLAYER.maxHp; this.stamina = PLAYER.maxStamina; this.the = 0;
    this.setPosition(x, y); this.body2.setVelocity(0, 0);
    this.setAlpha(1); flash(this, false);
    this.enter("move", this.scene.time.now);
  }

  private enter(s: State, now: number): void {
    this.state = s; this.stateAt = now;
  }

  private spend(cost: number, now: number): boolean {
    // Souls-lite rule: any action is allowed while stamina is above zero; it can then dip to zero.
    if (cost > 0 && this.stamina <= 0) return false;
    this.stamina = Math.max(0, this.stamina - cost);
    this.staminaRegenAt = now + PLAYER.staminaRegenDelay;
    return true;
  }

  private startAttack(def: AttackDef, damage: number, now: number, s: State): void {
    this.attack = def; this.attackDamage = damage; this.swingId++;
    this.enter(s, now);
    this.setTexture("p_attack"); this.anims.stop();
  }

  update(now: number, dt: number, c: Controls): void {
    const body = this.body2;
    const sec = dt / 1000;
    if (this.state !== "dead" && now > this.staminaRegenAt && this.state !== "charge" && this.state !== "dodge")
      this.stamina = Math.min(PLAYER.maxStamina, this.stamina + PLAYER.staminaRegenPerSec * sec);
    if (this.grounded) { this.coyoteUntil = now + PLAYER.coyote; this.jumpCut = false; }
    if (c.jumpPressed) this.jumpBufferUntil = now + PLAYER.jumpBuffer;
    if (now > this.flashUntil) flash(this, false);
    const t = now - this.stateAt;
    const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);

    switch (this.state) {
      case "move": {
        this.horizontal(dir, sec, 1);
        if (this.jumpBufferUntil > now && this.coyoteUntil > now) {
          body.setVelocityY(-PLAYER.jumpVelocity);
          this.jumpBufferUntil = 0; this.coyoteUntil = 0;
        }
        if (!c.jumpHeld && body.velocity.y < -60 && !this.jumpCut) { body.setVelocityY(body.velocity.y * PLAYER.jumpCutFactor); this.jumpCut = true; }
        if (c.lightPressed && now < this.riposteUntil && this.the > 0) {
          this.the--; this.riposteUntil = 0;
          this.startAttack(RIPOSTE, RIPOSTE.damage, now, "riposte"); this.onEvent("riposte");
        } else if (c.lightPressed && this.spend(LIGHT[0].stamina, now)) {
          this.combo = 0; this.comboQueued = false; this.startAttack(LIGHT[0], LIGHT[0].damage, now, "light");
        } else if (c.heavyHeld && this.grounded && this.stamina > HEAVY.stamina[0] * 0.5) {
          this.chargeAt = now; this.enter("charge", now);
        } else if (c.dodgePressed && this.spend(DODGE.stamina, now)) {
          this.startDodge(dir, now);
        } else if (c.parryPressed && this.spend(PARRY.stamina, now)) {
          this.parryAt = now; this.enter("parry", now); body.setVelocityX(0);
          this.setTexture("p_guard"); this.anims.stop();
        } else if (c.herbPressed && this.herbs > 0 && this.hp < PLAYER.maxHp && this.grounded) {
          this.enter("heal", now); body.setVelocityX(0);
        }
        this.animateMove();
        break;
      }
      case "light":
      case "heavy":
      case "riposte": {
        const a = this.attack!;
        const end = a.startup + a.active + a.recovery;
        if (t < a.startup + a.active) body.setVelocityX(this.facing * a.lunge);
        else this.horizontal(0, sec, 0.2);
        if (this.state === "light" && c.lightPressed && t > a.startup) this.comboQueued = true;
        // dodge-cancel after the active frames (Bible §2)
        if (t >= a.startup + a.active && c.dodgePressed && this.spend(DODGE.stamina, now)) { this.endAttack(); this.startDodge(dir, now); break; }
        this.showSlash(t >= a.startup && t < a.startup + a.active);
        if (t >= end || (this.state === "light" && this.comboQueued && t >= a.startup + a.active + a.recovery * 0.4)) {
          if (this.state === "light" && this.comboQueued && this.combo < 2 && this.spend(LIGHT[this.combo + 1].stamina, now)) {
            this.combo++; this.comboQueued = false;
            const next = LIGHT[this.combo];
            this.startAttack(next, next.damage, now, "light");
          } else this.endAttack();
        }
        break;
      }
      case "charge": {
        this.horizontal(dir, sec, HEAVY.chargeMoveFactor, false);
        const held = now - this.chargeAt;
        const level = held >= HEAVY.levelTimes[2] ? 2 : held >= HEAVY.levelTimes[1] ? 1 : 0;
        this.setTexture("p_guard"); this.anims.stop();
        if (now > this.flashUntil && level > 0 && Math.floor(held / 120) % 2 === 0) { flash(this, true, level === 2 ? 0xf0e6c8 : 0x9fd0c0); this.flashUntil = now + 40; }
        if (!c.heavyHeld) {
          const cost = HEAVY.stamina[level];
          this.spend(cost, now);
          this.startAttack({ ...HEAVY.def }, HEAVY.damage[level], now, "heavy");
          this.slashFx.setTexture(`slash${level}`);
        }
        break;
      }
      case "dodge": {
        body.setVelocityX(this.facing * DODGE.speed * (t < DODGE.duration * 0.7 ? 1 : 0.4));
        this.setAlpha(t < DODGE.iframes ? 0.45 : 0.8);
        if (t >= DODGE.duration) { this.setAlpha(1); this.enter("move", now); }
        break;
      }
      case "parry": {
        if (t >= PARRY.window + PARRY.recovery) this.enter("move", now);
        break;
      }
      case "heal": {
        if (t >= PLAYER.herbUseTime) {
          this.herbs--; this.hp = Math.min(PLAYER.maxHp, this.hp + PLAYER.herbHeal);
          this.onEvent("heal"); this.enter("move", now);
        }
        break;
      }
      case "hurt": {
        this.horizontal(0, sec, 0.3);
        if (t >= PLAYER.hurtStun) this.enter("move", now);
        break;
      }
      case "dead":
        body.setVelocityX(0);
        break;
    }
    this.setFlipX(this.facing < 0);
    this.slashFx.setPosition(this.x + this.facing * 6, this.y - 26).setFlipX(this.facing < 0).setOrigin(this.facing > 0 ? 0.1 : 0.9, 0.5);
  }

  private startDodge(dir: number, now: number): void {
    if (dir !== 0) this.facing = dir > 0 ? 1 : -1;
    this.dodgeAt = now; this.enter("dodge", now);
    this.setTexture("p_jump"); this.anims.stop();
  }

  private endAttack(): void {
    this.attack = null; this.showSlash(false);
    this.enter("move", this.scene.time.now);
    this.slashFx.setTexture("slash0");
  }

  private showSlash(on: boolean): void {
    this.slashFx.setVisible(on);
    if (on && this.state === "riposte") this.slashFx.setTexture("slash2");
    else if (on && this.state === "light") this.slashFx.setTexture(this.combo === 2 ? "slash1" : "slash0");
  }

  private horizontal(dir: number, sec: number, factor: number, turn = true): void {
    const body = this.body2;
    const target = dir * 96 * factor;
    if (dir !== 0 && turn) this.facing = dir > 0 ? 1 : -1;
    const v = body.velocity.x;
    const rate = (dir !== 0 ? PLAYER.accel : PLAYER.decel) * sec;
    body.setVelocityX(Math.abs(target - v) <= rate ? target : v + Math.sign(target - v) * rate);
  }

  private animateMove(): void {
    if (!this.grounded) { this.anims.stop(); this.setTexture("p_jump"); return; }
    const moving = Math.abs(this.body2.velocity.x) > 8;
    const key = moving ? "p_run" : "p_idle";
    if (this.anims.currentAnim?.key !== key || !this.anims.isPlaying) this.play(key, true);
  }

  /** The player's damaging area this frame, if any. */
  currentHit(): PlayerHit | null {
    const a = this.attack;
    if (!a || (this.state !== "light" && this.state !== "heavy" && this.state !== "riposte")) return null;
    const t = this.scene.time.now - this.stateAt;
    if (t < a.startup || t >= a.startup + a.active) return null;
    const b = this.body2;
    const x = this.facing > 0 ? b.right : b.x - a.reach;
    return {
      id: this.swingId,
      // Cover chest to shins so low targets (brush, boars) are hittable; a.height sets a minimum.
      rect: new Phaser.Geom.Rectangle(x, b.y + 8, a.reach, Math.max(a.height, b.height - 10)),
      damage: this.attackDamage,
      guardBreak: a.guardBreak,
      direction: this.facing,
    };
  }

  /** Resolve an incoming enemy hit (Bible §2: dodge i-frames, perfect dodge, parry). */
  receive(hit: EnemyHit): HitResult {
    const now = this.scene.time.now;
    if (this.state === "dead" || this.hitIds.has(hit.id)) return "ignored";
    if (this.state === "dodge" && now - this.dodgeAt < DODGE.iframes) {
      this.hitIds.add(hit.id);
      if (now - this.dodgeAt < DODGE.perfectWindow) { this.onEvent("perfectDodge"); return "perfectDodge"; }
      return "dodged";
    }
    if (this.state === "parry" && now - this.parryAt < PARRY.window && hit.parryable) {
      this.hitIds.add(hit.id);
      this.the = Math.min(PLAYER.maxThe, this.the + 1);
      this.riposteUntil = now + RIPOSTE_WINDOW;
      this.stamina = Math.min(PLAYER.maxStamina, this.stamina + PARRY.stamina);
      this.enter("move", now);
      hit.onParried?.();
      this.onEvent("parry");
      return "parried";
    }
    if (now < this.invulnUntil) return "ignored";
    this.hitIds.add(hit.id);
    this.hp = Math.max(0, this.hp - hit.damage);
    this.invulnUntil = now + PLAYER.hurtInvuln;
    this.attack = null; this.showSlash(false);
    this.body2.setVelocity(hit.knockback, -160);
    flash(this, true, 0xffffff); this.flashUntil = now + 90;
    if (this.hp <= 0) {
      this.enter("dead", now); this.setTexture("p_jump"); this.anims.stop(); this.setAlpha(0.6);
      this.onEvent("dead");
    } else {
      this.enter("hurt", now); this.onEvent("hurt", hit.damage);
    }
    return "hit";
  }

  /** Forget hit ids so long-lived hazards can hit again on a new activation. */
  clearHitMemory(): void { this.hitIds.clear(); }
}
