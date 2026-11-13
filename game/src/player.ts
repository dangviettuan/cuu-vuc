import Phaser from "phaser";
import { AttackDef, DODGE, HEAVY, LIGHT, PARRY, PLAYER, RIPOSTE, RIPOSTE_WINDOW } from "./tuning";
import { EnemyHit, HitResult, PlayerHit, flash } from "./combat";
import { Animator } from "./anim";
import { PC, lightClip } from "./clips";

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
export type PlayerEvent =
  | "parry" | "perfectDodge" | "hurt" | "riposte" | "heal" | "dead"
  | "jump" | "land" | "dodge" | "step" | "skid" | "swing" | "slam" | "ghost" | "thud";

const ATTACKING: ReadonlySet<State> = new Set(["light", "heavy", "riposte"]);
const clamp = Phaser.Math.Clamp;
/** Presses are remembered this long and consumed when the action becomes legal (playtest I-05). */
const BUFFER_MS = 150;
const NEVER = -1e9;

/**
 * The protagonist with the greybox Kiếm Khách kit (Combat & Class Bible §2–3).
 * Gameplay state (`state`) and presentation (`present()` → Animator clips) are separate:
 * gameplay decides what is happening, presentation decides which frames show it.
 * Attack hit windows are read from the animation's frame tags (src/clips.ts).
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number = PLAYER.maxHp;
  stamina: number = PLAYER.maxStamina;
  the = 0; // Thế: Kiếm Khách stance charge
  herbs = 0;
  facing: 1 | -1 = 1;
  state: State = "move";
  readonly anim: Animator;
  /** Simulation time (frozen during hit-stop), set every update. */
  now = 0;
  private stateAt = 0;
  private combo = 0;
  private comboQueued = false;
  private attack: AttackDef | null = null;
  private attackDamage = 0;
  slashLevel = 0;
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
  private wasGrounded = true;
  private fallSpeed = 0;
  private ghostAt = 0;
  private jumpAt = -1000;
  private landUntil = 0;
  private lastSpeed = 0;
  private nextBlink = 3000;
  private bufLight = NEVER;
  private bufDodge = NEVER;
  private bufParry = NEVER;
  private readonly hb = new Phaser.Geom.Rectangle();
  private readonly hit: PlayerHit = { id: 0, rect: new Phaser.Geom.Rectangle(), damage: 0, guardBreak: false, direction: 1 };
  onEvent: (kind: PlayerEvent, data?: number) => void = () => {};

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "p_idle0");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 44).setOffset(31, 28); // 72×76 frame: body centred at x=36, feet at y=72
    body.setMaxVelocityY(600);
    this.setOrigin(0.5, 1).setDepth(10);
    this.anim = new Animator(this, (e) => this.onEvent(e as PlayerEvent));
    this.anim.play(PC.idle);
  }

  /** True while a parry has opened the riposte window and a Thế pip is available (drives the on-screen J prompt). */
  riposteReady(now: number): boolean { return now < this.riposteUntil && this.the > 0 && !this.isDead(); }
  get body2(): Phaser.Physics.Arcade.Body { return this.body as Phaser.Physics.Arcade.Body; }
  get grounded(): boolean { return this.body2.blocked.down || this.body2.touching.down; }
  isDead(): boolean { return this.state === "dead"; }
  /** Rising slash for the second hit of the light string (used to flip the slash FX). */
  get rising(): boolean { return this.anim.name === "light2"; }

  hurtbox(): Phaser.Geom.Rectangle {
    const b = this.body2;
    return this.hb.setTo(b.x, b.y, b.width, b.height);
  }

  respawn(x: number, y: number): void {
    this.hp = PLAYER.maxHp; this.stamina = PLAYER.maxStamina; this.the = 0;
    this.setPosition(x, y); this.body2.setVelocity(0, 0);
    this.setAlpha(1); flash(this, false);
    this.attack = null;
    this.enter("move");
    this.anim.play(PC.idle, true, true);
  }

  private enter(s: State): void { this.state = s; this.stateAt = this.now; }

  private spend(cost: number): boolean {
    // Souls-lite rule: any action is allowed while stamina is above zero; it can then dip to zero.
    if (cost > 0 && this.stamina <= 0) return false;
    this.stamina = Math.max(0, this.stamina - cost);
    this.staminaRegenAt = this.now + PLAYER.staminaRegenDelay;
    return true;
  }

  private startAttack(def: AttackDef, damage: number, s: State, slashLevel: number): void {
    this.attack = def; this.attackDamage = damage; this.swingId++; this.slashLevel = slashLevel;
    this.enter(s);
    const c = s === "heavy" ? PC.heavy : s === "riposte" ? PC.riposte : lightClip(this.combo);
    this.anim.play(c, true, true);
  }

  update(now: number, dt: number, c: Controls): void {
    this.now = now;
    const body = this.body2;
    const sec = dt / 1000;
    if (this.state !== "dead" && now > this.staminaRegenAt && this.state !== "charge" && this.state !== "dodge")
      this.stamina = Math.min(PLAYER.maxStamina, this.stamina + PLAYER.staminaRegenPerSec * sec);
    const grounded = this.grounded;
    if (grounded) { this.coyoteUntil = now + PLAYER.coyote; this.jumpCut = false; }
    if (grounded && !this.wasGrounded && this.fallSpeed > 160) { this.landUntil = now + 130; this.onEvent("land"); }
    this.wasGrounded = grounded;
    this.fallSpeed = body.velocity.y;
    if (c.jumpPressed) this.jumpBufferUntil = now + PLAYER.jumpBuffer;
    if (c.lightPressed) this.bufLight = now;
    if (c.dodgePressed) this.bufDodge = now;
    if (c.parryPressed) this.bufParry = now;
    const light = now - this.bufLight <= BUFFER_MS, dodge = now - this.bufDodge <= BUFFER_MS, parry = now - this.bufParry <= BUFFER_MS;
    if (now > this.flashUntil) flash(this, false);
    const t = now - this.stateAt;
    const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);

    switch (this.state) {
      case "move": {
        this.horizontal(dir, sec, 1);
        if (this.jumpBufferUntil > now && this.coyoteUntil > now) {
          body.setVelocityY(-PLAYER.jumpVelocity);
          this.jumpBufferUntil = 0; this.coyoteUntil = 0; this.jumpAt = now;
          this.onEvent("jump");
        }
        if (!c.jumpHeld && body.velocity.y < -60 && !this.jumpCut) { body.setVelocityY(body.velocity.y * PLAYER.jumpCutFactor); this.jumpCut = true; }
        if (light && grounded && now < this.riposteUntil && this.the > 0) {
          this.the--; this.riposteUntil = 0; this.bufLight = NEVER;
          this.startAttack(RIPOSTE, RIPOSTE.damage, "riposte", 2); this.onEvent("riposte");
        } else if (light && grounded && this.spend(LIGHT[0].stamina)) { // no ground swing in mid-air (playtest I-10)
          this.bufLight = NEVER;
          this.combo = 0; this.comboQueued = false; this.startAttack(LIGHT[0], LIGHT[0].damage, "light", 0);
        } else if (c.heavyHeld && grounded && this.stamina > HEAVY.stamina[0] * 0.5) {
          this.chargeAt = now; this.enter("charge"); this.anim.play(PC.charge, true, true);
        } else if (dodge && this.spend(DODGE.stamina)) {
          this.bufDodge = NEVER;
          this.startDodge(dir);
        } else if (parry && this.spend(PARRY.stamina)) {
          this.bufParry = NEVER;
          this.parryAt = now; this.enter("parry"); body.setVelocityX(0); this.anim.play(PC.guard, true, true);
        } else if (c.herbPressed && this.herbs > 0 && this.hp < PLAYER.maxHp && grounded) {
          this.enter("heal"); body.setVelocityX(0); this.anim.play(PC.heal, true, true);
        }
        break;
      }
      case "light":
      case "heavy":
      case "riposte": {
        const a = this.attack!, tag = this.anim.tag;
        // Allow re-aiming during the windup: responsive without cancelling the commitment of the swing.
        if (tag === "windup" && dir !== 0) this.facing = dir > 0 ? 1 : -1;
        if (tag === "windup") body.setVelocityX(this.facing * a.lunge * 0.25);
        else if (tag === "active") body.setVelocityX(this.facing * a.lunge);
        else this.horizontal(0, sec, 0.2);
        // a press during the windup stays buffered and queues the next hit once the swing is active
        if (this.state === "light" && light && tag !== "windup") { this.comboQueued = true; this.bufLight = NEVER; }
        // dodge-cancel in recovery (Bible §2)
        if (tag === "recovery" && dodge && this.spend(DODGE.stamina)) { this.bufDodge = NEVER; this.attack = null; this.startDodge(dir); break; }
        const rp = this.anim.tagProgress();
        if (this.state === "light" && this.comboQueued && this.combo < 2 && tag === "recovery" && rp.t >= rp.len * 0.35) {
          if (this.spend(LIGHT[this.combo + 1].stamina)) {
            this.combo++; this.comboQueued = false;
            const next = LIGHT[this.combo];
            this.startAttack(next, next.damage, "light", this.combo === 2 ? 1 : 0);
            break;
          }
        }
        if (this.anim.finished) { this.attack = null; this.enter("move"); }
        break;
      }
      case "charge": {
        this.horizontal(dir, sec, HEAVY.chargeMoveFactor, false);
        const held = now - this.chargeAt;
        const level = held >= HEAVY.levelTimes[2] ? 2 : held >= HEAVY.levelTimes[1] ? 1 : 0;
        if (now > this.flashUntil && level > 0 && Math.floor(held / 120) % 2 === 0) { flash(this, true, level === 2 ? 0xf0e6c8 : 0x9fd0c0); this.flashUntil = now + 40; }
        if (!c.heavyHeld) {
          this.spend(HEAVY.stamina[level]);
          this.startAttack({ ...HEAVY.def }, HEAVY.damage[level], "heavy", level);
        }
        break;
      }
      case "dodge": {
        body.setVelocityX(this.facing * DODGE.speed * (t < DODGE.duration * 0.7 ? 1 : 0.4));
        this.setAlpha(t < DODGE.iframes ? 0.6 : 1);
        if (now - this.ghostAt > 38 && t < DODGE.duration * 0.75) { this.ghostAt = now; this.onEvent("ghost"); }
        if (t >= DODGE.duration) { this.setAlpha(1); this.enter("move"); }
        break;
      }
      case "parry":
        if (t >= PARRY.window + PARRY.recovery) this.enter("move");
        break;
      case "heal":
        if (t >= PLAYER.herbUseTime) {
          this.herbs--; this.hp = Math.min(PLAYER.maxHp, this.hp + PLAYER.herbHeal);
          this.onEvent("heal"); this.enter("move");
        }
        break;
      case "hurt":
        this.horizontal(0, sec, 0.3); // knockback eases out through deceleration
        if (t >= PLAYER.hurtStun) this.enter("move");
        break;
      case "dead":
        body.setVelocityX(body.velocity.x * 0.85);
        break;
    }
    this.present(now, dir);
    this.anim.update(dt);
  }

  /** Presentation only: choose the clip for the current gameplay state. Never changes gameplay. */
  private present(now: number, dir: number): void {
    const a = this.anim, b = this.body2, speed = Math.abs(b.velocity.x);
    a.timeScale = 1;
    if (this.state === "move") {
      if (!this.grounded) {
        if (now - this.jumpAt < 80) a.play(PC.takeoff);
        else if (b.velocity.y < -110) a.play(PC.rise);
        else if (b.velocity.y < 110) a.play(PC.apex);
        else a.play(PC.fall);
      } else if (now < this.landUntil) {
        a.play(PC.land);
      } else if (dir !== 0 && speed > 50 && Math.sign(b.velocity.x) !== dir) {
        a.play(PC.skid);
      } else if (speed > 8 || dir !== 0) {
        const n = a.name;
        if (n === "idle" || n === "blink" || n === "stop" || n === "land") a.play(PC.runStart);
        if (a.play(PC.run)) a.timeScale = clamp(speed / PLAYER.runSpeed, 0.45, 1.25); // stride matches ground speed
      } else {
        if (a.name === "run" && this.lastSpeed > 20) a.play(PC.stop); // decel takes ~3 frames, so the last sampled speed is low
        else if (a.name === "idle" && now > this.nextBlink) { a.play(PC.blink); this.nextBlink = now + 2500 + Math.random() * 3000; }
        else if (!(a.name === "blink" && !a.finished)) a.play(PC.idle);
      }
    } else if (this.state === "dodge") a.play(PC.dodge);
    else if (this.state === "charge") a.play(PC.charge);
    else if (this.state === "hurt") a.play(PC.hurt);
    else if (this.state === "dead") a.play(PC.death);
    this.lastSpeed = speed;
    // skid plays still facing the old direction, then turns (playtest I-11)
    this.setFlipX(a.name === "skid" ? b.velocity.x < 0 : this.facing < 0);
  }

  private startDodge(dir: number): void {
    if (dir !== 0) this.facing = dir > 0 ? 1 : -1;
    this.dodgeAt = this.now; this.enter("dodge");
    this.anim.play(PC.dodge, true, true);
    this.onEvent("dodge");
  }

  private horizontal(dir: number, sec: number, factor: number, turn = true): void {
    const body = this.body2;
    const target = dir * PLAYER.runSpeed * factor;
    if (dir !== 0 && turn) this.facing = dir > 0 ? 1 : -1;
    const v = body.velocity.x;
    const rate = (dir !== 0 ? PLAYER.accel : PLAYER.decel) * sec;
    body.setVelocityX(Math.abs(target - v) <= rate ? target : v + Math.sign(target - v) * rate);
  }

  /** The player's damaging area this frame: open only on "active"-tagged animation frames. */
  currentHit(): PlayerHit | null {
    const a = this.attack;
    if (!a || !ATTACKING.has(this.state) || this.anim.tag !== "active") return null;
    const b = this.body2;
    const x = this.facing > 0 ? b.right : b.x - a.reach;
    const h = this.hit;
    h.id = this.swingId; h.damage = this.attackDamage; h.guardBreak = a.guardBreak; h.direction = this.facing;
    // Cover chest to shins so low targets (brush, boars) are hittable; a.height sets a minimum.
    h.rect.setTo(x, b.y + 8, a.reach, Math.max(a.height, b.height - 10));
    return h;
  }

  /** Resolve an incoming enemy hit (Bible §2: dodge i-frames, perfect dodge, parry). */
  receive(hit: EnemyHit): HitResult {
    const now = this.now;
    if (this.state === "dead" || this.hitIds.has(hit.id)) return "ignored";
    if (this.state === "dodge" && now - this.dodgeAt < DODGE.iframes) {
      this.hitIds.add(hit.id);
      if (now - this.dodgeAt < DODGE.perfectWindow) { this.onEvent("perfectDodge"); return "perfectDodge"; }
      return "dodged";
    }
    if (this.state === "parry" && now - this.parryAt < PARRY.window && hit.parryable) {
      this.hitIds.add(hit.id);
      // turn to face what was parried, so the riposte goes toward it (fix-pass finding: backwards parries whiffed the riposte)
      const toward = Math.sign(hit.rect.centerX - this.x);
      if (toward !== 0) this.facing = toward > 0 ? 1 : -1;
      this.the = Math.min(PLAYER.maxThe, this.the + 1);
      this.riposteUntil = now + RIPOSTE_WINDOW;
      this.stamina = Math.min(PLAYER.maxStamina, this.stamina + PARRY.stamina);
      this.enter("move");
      this.anim.play(PC.parry, true, true);
      hit.onParried?.();
      this.onEvent("parry");
      return "parried";
    }
    if (now < this.invulnUntil) return "ignored";
    this.hitIds.add(hit.id);
    this.hp = Math.max(0, this.hp - hit.damage);
    this.invulnUntil = now + PLAYER.hurtInvuln;
    this.attack = null;
    this.body2.setVelocity(hit.knockback, -150);
    flash(this, true, 0xffffff); this.flashUntil = now + 70;
    if (this.hp <= 0) {
      this.enter("dead"); this.anim.play(PC.death, true, true);
      this.onEvent("dead");
    } else {
      this.enter("hurt"); this.anim.play(PC.hurt, true, true);
      this.onEvent("hurt", hit.damage);
    }
    return "hit";
  }

  /** Forget hit ids so long-lived hazards can hit again on a new activation. */
  clearHitMemory(): void { this.hitIds.clear(); }
}
