import Phaser from "phaser";
import { Animator } from "./anim";
import { DiepClip, diepClips } from "./clips";
import { EnemyHit, PlayerHit, flash } from "./combat";
import { DIEP } from "./data/ally";

/** What she can see of an enemy: where it is, whether it is alive, and whether it is winding up or striking. */
export interface AllyTarget {
  x: number;
  active: boolean;
  isAlive(): boolean;
  state: string;
  /** held by roots (Rễ Giữ): frozen mid-tell, it cannot strike, so it is an opening, not a threat */
  bound?: boolean;
  hurtbox(): Phaser.Geom.Rectangle;
}

/** Enemy states she reads as danger and gives way to (the boar's tell and charge; Nanh Rễ's windups and attacks). */
const DANGER = new Set(["notice", "charge", "tCharge", "tSwipe", "tStomp", "swipe", "stomp"]);

type AllyState = "follow" | "engage" | "thrust" | "sweep" | "retreat" | "hurt" | "down" | "scripted";
export type AllyEvent = "down" | "up" | "swing" | "step";

/**
 * Diệp, the Ch. I ally (DB N6; tuning in src/data/ally.ts). She follows a little behind him; when an enemy comes near
 * him she closes to spear's reach and thrusts or sweeps, on a slow cadence; she backs out of every tell; knocked down,
 * she gets up. In a cutscene the stage drives her instead (`scripted`): walks, facings and poses, like any NPC.
 */
export class Ally extends Phaser.Physics.Arcade.Sprite {
  hp: number = DIEP.hp;
  state: AllyState = "follow";
  facing: 1 | -1 = 1;
  readonly anim: Animator;
  private readonly clips = diepClips({
    thrust: [DIEP.thrust.windup, DIEP.thrust.active, DIEP.thrust.recovery],
    sweep: [DIEP.sweep.windup, DIEP.sweep.active, DIEP.sweep.recovery],
  });
  private now = 0;
  private stateAt = 0;
  private readyAt = 0;
  private swingId = 0;
  private hitIds = new Set<string>();
  private walkTarget: number | null = null;
  private walkDone: (() => void) | null = null;
  private readonly hb = new Phaser.Geom.Rectangle();
  private readonly hit: PlayerHit = { id: 0, rect: new Phaser.Geom.Rectangle(), damage: 0, guardBreak: false, poise: 0, direction: 1 };
  onEvent: (e: AllyEvent) => void = () => {};

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "d_idle0");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.b.setSize(10, 46).setOffset(43, 30); // 96×80 frame, body centred at x=48, feet at y=76
    this.setOrigin(0.5, 1).setDepth(9.6);
    this.anim = new Animator(this, (e) => this.onEvent(e as AllyEvent));
    this.anim.play(this.clips.idle);
  }

  get b(): Phaser.Physics.Arcade.Body { return this.body as Phaser.Physics.Arcade.Body; }
  get downed(): boolean { return this.state === "down"; }
  hurtbox(): Phaser.Geom.Rectangle { const b = this.b; return this.hb.setTo(b.x, b.y, b.width, b.height); }
  private enter(s: AllyState): void { this.state = s; this.stateAt = this.now; }
  private show(c: DiepClip, force = false): void { this.anim.play(this.clips[c], force, force); }

  /** Back beside him after a respawn or a stage cut. */
  reset(x: number, y: number): void {
    this.hp = DIEP.hp; this.setPosition(x, y); this.b.reset(x, y - 46); this.b.setVelocity(0, 0);
    this.hitIds.clear(); flash(this, false); this.enter("follow"); this.show("idle", true);
  }

  /* ------------------------------------------------------------ cutscenes */

  set scripted(on: boolean) {
    if (on && this.state !== "scripted" && this.state !== "down") { this.enter("scripted"); this.b.setVelocityX(0); this.show("idle"); }
    else if (!on && this.state === "scripted") { this.walkTarget = null; this.enter("follow"); }
  }
  walkTo(x: number): Promise<void> {
    return new Promise((res) => { this.walkTarget = x; this.walkDone = res; this.facing = x > this.x ? 1 : -1; });
  }
  finishWalk(): void {
    if (this.walkTarget === null) return;
    this.x = this.walkTarget; this.b.reset(this.x, this.y - 46); this.walkTarget = null;
    const f = this.walkDone; this.walkDone = null; f?.();
  }
  pose(c: DiepClip): void { this.show(c, true); }

  /* ------------------------------------------------------------ the fight */

  tick(now: number, dt: number, heroX: number, heroFacing: 1 | -1, enemies: AllyTarget[]): void {
    this.now = now;
    const t = now - this.stateAt;
    let vx = 0;
    const live = enemies.filter((e) => e.active && e.isAlive());
    const near = live.filter((e) => Math.abs(e.x - heroX) < DIEP.engageRange)
      .sort((a, c) => Math.abs(a.x - this.x) - Math.abs(c.x - this.x))[0];
    const threat = live.find((e) => DANGER.has(e.state) && !e.bound && Math.abs(e.x - this.x) < DIEP.retreatRange);

    switch (this.state) {
      case "scripted":
        if (this.walkTarget !== null) {
          const d = this.walkTarget - this.x;
          if (Math.abs(d) < 2) { this.x = this.walkTarget; this.walkTarget = null; const f = this.walkDone; this.walkDone = null; f?.(); this.show("idle"); }
          else { vx = Math.sign(d) * 70; this.facing = d > 0 ? 1 : -1; this.show("walk"); }
        }
        break;
      case "follow":
      case "engage": {
        if (Math.abs(heroX - this.x) > DIEP.teleportBeyond) { this.reset(heroX - heroFacing * DIEP.followGap, this.y); break; }
        if (threat) { this.facing = threat.x > this.x ? 1 : -1; this.enter("retreat"); this.show("run"); break; }
        let goal: number, speed: number = DIEP.runSpeed;
        if (near) {
          this.state = "engage";
          const side = this.x <= near.x ? -1 : 1; // keep to the side she is on
          goal = near.x + side * DIEP.standOff;
          this.facing = near.x > this.x ? 1 : -1;
          if (Math.abs(goal - this.x) < 10 && now >= this.readyAt) {
            const close = Math.abs(near.x - this.x) < DIEP.sweep.reach + 6;
            this.swingId++;
            const move = close && Math.random() < 0.5 ? "sweep" : "thrust";
            this.enter(move); this.show(move, true);
            break;
          }
        } else {
          this.state = "follow";
          goal = heroX - heroFacing * DIEP.followGap;
          if (Math.abs(heroX - this.x) > DIEP.catchUpBeyond) speed = DIEP.catchUpSpeed;
        }
        const d = goal - this.x;
        if (Math.abs(d) > 6) { vx = Math.sign(d) * speed; if (!near) this.facing = d > 0 ? 1 : -1; this.show("run"); }
        else this.show(near ? "guard" : "idle");
        break;
      }
      case "retreat": // give way to the tell, facing it
        vx = -this.facing * DIEP.runSpeed;
        this.show("run");
        if (t > DIEP.retreatMs) this.enter("follow");
        break;
      case "thrust":
      case "sweep": {
        const m = this.state === "thrust" ? DIEP.thrust : DIEP.sweep;
        if (this.anim.tag === "active") vx = this.facing * (this.state === "thrust" ? 60 : 20);
        if (threat && this.anim.tag === "windup") { this.enter("retreat"); this.show("run"); break; } // a tell beats her swing
        if (this.anim.finished || t > m.windup + m.active + m.recovery + 50) { this.readyAt = now + DIEP.cooldownMs; this.enter("follow"); }
        break;
      }
      case "hurt":
        if (t > DIEP.hurtMs) this.enter("follow");
        break;
      case "down":
        if (t > DIEP.downMs) { this.hp = Math.round(DIEP.hp / 2); this.enter("follow"); this.show("idle", true); this.onEvent("up"); }
        break;
    }
    this.b.setVelocityX(vx);
    this.setFlipX(this.facing < 0);
    this.anim.update(dt);
  }

  /** Her spear's damaging area this frame, or null. */
  currentHit(): PlayerHit | null {
    if ((this.state !== "thrust" && this.state !== "sweep") || this.anim.tag !== "active") return null;
    const m = this.state === "thrust" ? DIEP.thrust : DIEP.sweep, b = this.b, h = this.hit;
    const x = this.facing > 0 ? b.right : b.x - m.reach;
    h.id = 100000 + this.swingId; h.damage = m.damage; h.poise = m.poise; h.direction = this.facing; h.guardBreak = false;
    // chest to shins, like his swings: low beasts (boars) must be hittable
    h.rect.setTo(x, b.y + 12, m.reach, b.height - 14);
    return h;
  }

  /** An enemy hit that reached her: she staggers, or goes down (never dies). */
  receive(hit: EnemyHit): void {
    if (this.state === "down" || this.state === "scripted" || this.hitIds.has(hit.id)) return;
    this.hitIds.add(hit.id);
    this.hp = Math.max(0, this.hp - hit.damage);
    flash(this, true, 0xffffff);
    this.scene.time.delayedCall(70, () => flash(this, false));
    this.b.setVelocityX(hit.knockback * 0.6);
    if (this.hp <= 0) { this.enter("down"); this.show("down", true); this.onEvent("down"); }
    else { this.enter("hurt"); this.show("hurt", true); }
  }
}
