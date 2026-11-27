import Phaser from "phaser";
import { Enemy, ctx, nextId, tell } from "./enemies";
import { EnemyHit, PlayerHit, flash } from "./combat";
import { Clip, PRI, clip, loop } from "./anim";
import { WORLD } from "./tuning";
import type { FoeDef, FoeMove, ShotKind } from "./data/foes";

const NONE: EnemyHit[] = [];
type FoeState = "dormant" | "idle" | "tell" | "active" | "recover" | "stun" | "stagger" | "beat" | "dead" | "flee" | "down" | "leave";

/** What the stage tells a fighter about the hero each frame (Hùng reads guards; some moves care where he stands). */
export interface HeroView { x: number; guarding: boolean; }

/**
 * A data-driven fighter (Phase 3, Ch. I): every new enemy is a table of moves (src/data/foes.ts) read by this one AI,
 * so beasts, Cương's operatives, the mini-bosses and Mộc Giác share the same rules the Prologue taught:
 * a readable tell that ramps up, a strike, a recovery that is the opening; parryable moves stagger on a parry; poise
 * damage staggers; Rễ Giữ's roots freeze it mid-tell (the Enemy base).
 *
 * Moves are chosen by distance and weight from the seeded RNG, with anti-repeat, and can need a phase (bosses). A move
 * can lunge or back off, leap, throw a shot (a net, spores), raise roots under the hero, or chain into another.
 * Humans with `fleeAt` break off and retreat instead of dying (Bible §9); `flees` beasts bolt when beaten.
 */
export class Fighter extends Enemy {
  state: FoeState = "idle";
  private move: FoeMove | null = null;
  private swing = nextId("foe");
  private poise = 0;
  private history: string[] = [];
  private lastPhase = 1;
  private cued = false;
  private shot = false;
  private feinted = false;
  private readonly hit: EnemyHit;
  private readonly hitList: EnemyHit[];
  private readonly clips: { idle: Clip; walk: Clip; hurt: Clip; stun: Clip; down: Clip };
  private home: number;
  onDeath: (x: number) => void = () => {};
  onDown: () => void = () => {};
  onPhase: (phase: number) => void = () => {};
  onRoots: (xs: number[], warn: number, damage: number) => void = () => {};
  onShot: (kind: ShotKind, x: number, y: number, vx: number, vy: number, hit: EnemyHit, gravity: number) => void = () => {};

  constructor(scene: Phaser.Scene, x: number, readonly def: FoeDef, private minX = -1e9, private maxX = 1e9) {
    super(scene, x, WORLD.groundY, def.frames.idle[0], Math.round(def.hp * ctx.diff.enemyHp));
    const [w, h, ox, oy] = def.body;
    this.b.setSize(w, h).setOffset(ox, oy);
    this.kbResist = def.kbResist ?? 1;
    this.home = x;
    this.hit = { id: this.swing, rect: new Phaser.Geom.Rectangle(), damage: 0, knockback: 0, parryable: true };
    this.hitList = [this.hit];
    const f = def.frames;
    this.clips = {
      idle: loop("idle", f.idle, 320), walk: loop("walk", f.walk, 130, PRI.LOCO, { 0: "step" }),
      hurt: clip("hurt", [{ key: f.hurt, ms: 140 }], PRI.HURT), stun: loop("stun", [f.stun], 99999, PRI.ACTION),
      down: clip("down", [{ key: f.hurt, ms: 140 }, { key: f.down, ms: 99999, event: "thud" }], PRI.DEAD),
    };
    if (def.boss) this.state = "dormant";
    this.facing = -1;
    this.show(this.clips.idle);
  }

  get phase(): number {
    const at = this.def.phaseAt; if (!at) return 1;
    const r = this.hp / this.maxHp; let p = 1;
    for (const a of at) if (r <= a) p++;
    return p;
  }
  private speedK(): number { return this.def.phaseSpeed?.[this.phase - 1] ?? 1; }
  private enter(s: FoeState): void { this.state = s; this.enterAt(); if (s !== "tell") flash(this, false); this.setBlendMode(Phaser.BlendModes.NORMAL); }
  /** Hold one drawing (a move's tell, strike or recovery frame), as a cached one-frame clip so the animator agrees. */
  private pose(key: string): void {
    let c = Fighter.held.get(key);
    if (!c) { c = clip(`hold:${key}`, [{ key, ms: 99999 }], PRI.ACTION, true); Fighter.held.set(key, c); }
    this.anim.play(c, false, true);
  }
  private static held = new Map<string, Clip>();

  /* ---------------- boss hooks (the same as Nanh Rễ's, so the stage treats both alike) ---------------- */
  stand(): void { if (this.isAlive() && this.state !== "leave" && this.state !== "flee") { this.enter(this.def.boss ? "dormant" : "idle"); this.show(this.clips.idle, true); } }
  wake(): void { if (this.state === "dormant") { this.enter("idle"); this.stateAt += this.def.wakeHoldMs ?? 600; } }
  reset(x: number): void {
    this.maxHp = Math.round(this.def.hp * ctx.diff.enemyHp); this.hp = this.maxHp; this.poise = 0; this.lastPhase = 1; this.kb = 0; this.history = [];
    this.setPosition(x, WORLD.groundY); this.b.enable = true; this.setAlpha(1); this.move = null;
    this.enter(this.def.boss ? "dormant" : "idle"); flash(this, false); this.show(this.clips.idle, true);
  }
  leave(): void { this.enter("leave"); this.facing = 1; this.b.checkCollision.left = this.b.checkCollision.right = false; this.show(this.clips.walk, true); }
  /** He started healing in reach while it idles: it answers with its fastest move that reaches him. */
  punishHeal(dist: number): void {
    if (this.state !== "idle" || !this.def.punishHeal) return;
    const m = this.def.moves.find((mm) => mm.id === this.def.punishHeal && dist >= mm.range[0] && dist <= mm.range[1]);
    if (m) this.begin(m);
  }

  /* ---------------- the AI ---------------- */
  tick(now: number, dt: number, playerX: number, hero?: HeroView): void {
    this.now = now;
    if (this.holdIfBound(dt)) return;
    if (this.def.phaseAt && this.phase !== this.lastPhase && this.isAlive()) {
      this.lastPhase = this.phase; this.onPhase(this.phase);
      if (this.def.phaseBeat?.[this.phase] && this.state !== "down") { this.move = null; this.enter("beat"); }
    }
    const d = this.def, t = now - this.stateAt, dx = playerX - this.x, dist = Math.abs(dx), k = this.speedK();
    let vx = 0;
    this.anim.timeScale = 1;
    switch (this.state) {
      case "dormant": this.show(this.clips.idle); break;
      case "idle": {
        const lo = this.minX - (d.leash ?? 60), hi = this.maxX + (d.leash ?? 60);
        const sees = dist < d.sight && playerX > lo - d.sight * 0.5 && playerX < hi + d.sight * 0.5;
        if (!sees) { // nothing to fight: drift home
          const toHome = this.home - this.x;
          if (Math.abs(toHome) > 8 && d.walkSpeed > 0) { this.facing = toHome > 0 ? 1 : -1; vx = this.facing * d.walkSpeed * 0.6; this.show(this.clips.walk); }
          else this.show(this.clips.idle);
          break;
        }
        this.facing = dx > 0 ? 1 : -1;
        const want = dist > d.keepDist + 10 ? 1 : dist < d.keepDist - 14 ? -1 : 0;
        const nx = this.x + want * this.facing * 20;
        if (want !== 0 && d.walkSpeed > 0 && nx > lo && nx < hi) { vx = want * this.facing * d.walkSpeed * (want < 0 ? 0.7 : 1); this.show(this.clips.walk); }
        else this.show(this.clips.idle);
        if (t > d.idleMs * k) this.choose(dist);
        break;
      }
      case "tell": {
        const m = this.move!, len = tell(m.tell * k) + (this.feinted ? m.feintOnGuard ?? 0 : 0);
        if (!this.cued) { this.cued = true; if (m.cue) this.onFx(m.cue, this.x + this.facing * 16, this.y); }
        // Hùng reads parries: if he is already guarding at the end of the tell, the strike waits him out (once)
        if (m.feintOnGuard && !this.feinted && hero?.guarding && t > len * 0.7) { this.feinted = true; }
        this.pose(m.frames.tell); this.telegraph(t / len);
        if (m.motion?.during === "tell") vx = this.facing * m.motion.vx;
        if (t > len) this.strike(m, playerX);
        break;
      }
      case "active": {
        const m = this.move!;
        this.pose(m.frames.active);
        if (m.motion?.during === "active") vx = this.facing * m.motion.vx;
        if (m.leap && this.b.blocked.down && t > 60) vx = 0; else if (m.leap) vx = this.facing * m.leap.vx;
        if (d.anchored) vx = 0;
        if (t > m.active) {
          if (m.chain) { const next = d.moves.find((mm) => mm.id === m.chain); if (next) { this.facing = dx > 0 ? 1 : -1; this.begin(next, 0.5); break; } }
          this.enter("recover");
        }
        break;
      }
      case "recover": {
        const m = this.move;
        if (m) this.pose(m.frames.recovery);
        if (t > (m?.recovery ?? 300) * k) { this.move = null; this.enter("idle"); this.show(this.clips.idle, true); }
        break;
      }
      case "stun":
        this.pose(d.frames.stun);
        if (t > (this.stunFor || d.stunMs)) { this.enter("idle"); this.show(this.clips.idle, true); }
        break;
      case "beat": { // a story beat (Mộc Giác lowers its head to his chest): no attack, then it fights on
        const bt = d.phaseBeat![this.phase];
        this.pose(bt.frame); this.facing = dx > 0 ? 1 : -1;
        if (t > bt.ms) { this.enter("idle"); this.show(this.clips.idle, true); }
        break;
      }
      case "stagger":
        this.pose(d.frames.stun);
        if (t > (d.staggerMs ?? 1200)) { this.poise = 0; this.enter("idle"); this.show(this.clips.idle, true); }
        break;
      case "flee":
        vx = this.facing * (d.fleeSpeed ?? 200); this.show(this.clips.walk); this.anim.timeScale = 1.4;
        if (t > 900) this.setAlpha(Math.max(0, 1 - (t - 900) / 500));
        if (t > 1400) { this.destroy(); return; }
        break;
      case "dead":
        if (t > 700) this.setAlpha(Math.max(0, 1 - (t - 700) / 500));
        if (t > 1200) { this.destroy(); return; }
        break;
      case "down": break;
      case "leave": vx = 60; this.show(this.clips.walk); this.anim.timeScale = 0.6; break;
    }
    if (this.def.anchored) { vx = 0; this.kb = 0; }
    this.finish(dt, vx);
  }
  private stunFor = 0;

  private begin(m: FoeMove, tellK = 1): void {
    this.move = m; this.cued = false; this.shot = false; this.feinted = false;
    this.history.push(m.id); if (this.history.length > 6) this.history.shift();
    this.enter("tell");
    if (tellK !== 1) this.stateAt -= tell(m.tell) * (1 - tellK);
  }

  private strike(m: FoeMove, playerX: number): void {
    flash(this, false); this.setBlendMode(Phaser.BlendModes.NORMAL);
    this.swing = nextId("foe");
    this.enter("active");
    if (m.leap) this.b.setVelocityY(-m.leap.vy);
    if (m.shot && !this.shot) {
      this.shot = true;
      const n = m.shot.count ?? 1;
      for (let i = 0; i < n; i++) {
        const h: EnemyHit = { id: nextId("shot"), rect: new Phaser.Geom.Rectangle(), damage: m.damage, knockback: this.facing * m.knockback, parryable: m.parryable, poison: m.poison, snare: m.snare };
        const spread = (i - (n - 1) / 2) * 30;
        this.onShot(m.shot.kind, this.x + this.facing * 18, this.y - (m.shot.y ?? 26), this.facing * m.shot.speed + spread, -(m.shot.lift ?? 0), h, m.shot.gravity ?? 0);
      }
    }
    if (m.roots) {
      const xs: number[] = [];
      for (let i = 0; i < m.roots.n; i++) xs.push(playerX + (i - (m.roots.n - 1) / 2) * m.roots.spread);
      this.onRoots(xs.map((x) => Phaser.Math.Clamp(x, this.minX - 200, this.maxX + 200)), tell(m.roots.warn), m.roots.damage);
    }
    if (m.burst) this.onFx("burst", this.x, this.y);
  }

  /** Weighted by distance, from the seeded RNG; a move used `maxRepeat` times in a row sits out the next draw. */
  private choose(dist: number): void {
    const d = this.def, ph = this.phase;
    let pool = d.moves.filter((m) => m.weight > 0 && dist >= m.range[0] && dist <= m.range[1] && (m.minPhase ?? 1) <= ph && !m.chainOnly);
    const n = d.maxRepeat ?? 2, last = this.history[this.history.length - 1];
    if (pool.length > 1 && this.history.length >= n && this.history.slice(-n).every((x) => x === last)) pool = pool.filter((m) => m.id !== last);
    if (!pool.length) { this.stateAt = this.now - d.idleMs * 0.5; return; } // nothing reaches: keep moving, look again soon
    let r = ctx.rng.next() * pool.reduce((s, m) => s + m.weight, 0);
    for (const m of pool) { r -= m.weight; if (r <= 0) { this.begin(m); return; } }
    this.begin(pool[pool.length - 1]);
  }

  hits(): EnemyHit[] {
    const m = this.move;
    if (this.state !== "active" || !m || !m.box || this.bound) return NONE;
    const [ox, w, yFeet, h] = m.box, b = this.b;
    const x = this.facing > 0 ? b.right + ox : b.x - ox - w;
    const hit = this.hit;
    hit.id = this.swing; hit.damage = m.damage; hit.knockback = this.facing * m.knockback; hit.parryable = m.parryable;
    hit.poison = m.poison; hit.snare = m.snare;
    hit.onParried = m.parryable ? () => this.parried() : undefined;
    hit.rect.setTo(x, this.y - yFeet - h, w, h);
    return this.hitList;
  }

  /** Armoured (Độc Đằng): only a fraction of a hit gets through unless it is open (stunned, staggered). */
  takeHit(hit: PlayerHit): void {
    const a = this.def.armor;
    super.takeHit(a && this.state !== "stun" && this.state !== "stagger" ? { ...hit, damage: Math.max(1, Math.round(hit.damage * a)) } : hit);
  }
  /** Open to full damage right now (for feedback). */
  get open(): boolean { return !this.def.armor || this.state === "stun" || this.state === "stagger"; }

  private parried(): void { this.stunFor = this.def.parriedStunMs; this.enter("stun"); this.kb = -this.facing * 120 / this.kbResist; }

  protected onDamaged(hit: PlayerHit): void {
    const d = this.def;
    if (this.state === "dormant") this.wake();
    if (this.hp <= 0) {
      if (d.boss) { this.enter("down"); this.kb = 0; this.show(this.clips.down, true); this.b.setVelocity(0, 0); this.onDown(); return; }
      this.onDeath(this.x);
      if (d.flees) { this.facing = hit.direction > 0 ? 1 : -1; this.enter("flee"); this.b.checkCollision.left = this.b.checkCollision.right = false; return; }
      this.enter("dead"); this.show(this.clips.down, true); this.onFx("dead", this.x, this.y);
      this.kb = hit.direction * 100; this.b.checkCollision.left = this.b.checkCollision.right = false;
      return;
    }
    if (d.fleeAt && this.hp / this.maxHp <= d.fleeAt) { // humans break off and run (they don't die, Bible §9)
      this.hp = 0; this.onDeath(this.x);
      this.facing = hit.direction > 0 ? 1 : -1;
      this.enter("flee"); this.b.checkCollision.left = this.b.checkCollision.right = false; return;
    }
    this.poise += hit.poise;
    if (d.poiseMax && this.poise >= d.poiseMax && this.state !== "active") { this.poise = 0; this.enter("stagger"); return; }
    if (this.state === "idle" || this.state === "recover") { this.facing = hit.direction > 0 ? -1 : 1; this.show(this.clips.hurt, true); }
  }
}

/**
 * Something thrown or spat (an operative's net, a spore gob): it flies, falls under gravity, and is spent on the hero,
 * on the ground, or off the screen. A spore that lands leaves a short poison cloud (the stage makes it).
 */
export class Shot {
  readonly img: Phaser.GameObjects.Image;
  done = false;
  landedAt: number | null = null;
  private readonly rect = new Phaser.Geom.Rectangle();
  private spin = 0;
  constructor(scene: Phaser.Scene, readonly kind: import("./data/foes").ShotKind, public x: number, public y: number, private vx: number, private vy: number, readonly hit: EnemyHit, private g: number) {
    this.img = scene.add.image(x, y, kind === "net" ? "net0" : "spore1").setDepth(11);
  }
  tick(dt: number, groundY: number, viewL: number, viewR: number): void {
    if (this.done) return; // spent on the hero this frame: its image is gone
    const s = dt / 1000;
    this.vy += this.g * s; this.x += this.vx * s; this.y += this.vy * s;
    this.spin += dt;
    this.img.setPosition(this.x, this.y).setTexture(this.kind === "net" ? (Math.floor(this.spin / 90) % 2 ? "net1" : "net0") : "spore1");
    if (this.y >= groundY - 4) { this.landedAt = this.x; this.done = true; }
    if (this.x < viewL - 40 || this.x > viewR + 40) this.done = true;
    if (this.done) this.img.destroy();
  }
  hits(): EnemyHit { this.hit.rect = this.rect.setTo(this.x - 7, this.y - 6, 14, 12); return this.hit; }
  /** It struck something: spent. */
  spend(): void { if (!this.done) { this.done = true; this.img.destroy(); } }
}
