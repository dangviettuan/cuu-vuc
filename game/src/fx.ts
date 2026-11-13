import Phaser from "phaser";

/**
 * Pooled visual effects: dust, directional sparks, impact bursts, slash arcs, afterimages,
 * leaf bursts, sparkles and light rings.
 * - A fixed pool of Images is created once; spawning reuses the oldest free slot.
 * - Motion and frame stepping are done here manually (no tweens, no per-frame allocation).
 * - FX run on *real* time so sparks still fly during hit-stop, which sells the impact.
 */
interface Particle {
  img: Phaser.GameObjects.Image;
  alive: boolean;
  x: number; y: number; vx: number; vy: number;
  gravity: number; drag: number;
  age: number; life: number;
  frames: readonly string[];
  fade: boolean;
}

export class Fx {
  private pool: Particle[] = [];
  private cursor = 0;
  /** False on the Canvas renderer, which ignores tints (see render.ts). */
  private readonly tints: boolean;

  constructor(scene: Phaser.Scene, size = 160) {
    this.tints = scene.sys.renderer.type === Phaser.WEBGL;
    for (let i = 0; i < size; i++) {
      const img = scene.add.image(0, 0, "dust0").setVisible(false).setActive(false);
      this.pool.push({ img, alive: false, x: 0, y: 0, vx: 0, vy: 0, gravity: 0, drag: 0, age: 0, life: 1, frames: [], fade: false });
    }
  }

  private take(): Particle {
    for (let n = 0; n < this.pool.length; n++) {
      const p = this.pool[(this.cursor + n) % this.pool.length];
      if (!p.alive) { this.cursor = (this.cursor + n + 1) % this.pool.length; return p; }
    }
    const p = this.pool[this.cursor]; // pool exhausted: recycle the oldest slot
    this.cursor = (this.cursor + 1) % this.pool.length;
    return p;
  }

  /** Generic spawn. Returns the image so callers can set flip/origin/tint. */
  spawn(frames: readonly string[], x: number, y: number, life: number, opt: { vx?: number; vy?: number; gravity?: number; drag?: number; fade?: boolean; depth?: number; alpha?: number } = {}): Phaser.GameObjects.Image {
    const p = this.take();
    p.alive = true; p.x = x; p.y = y; p.vx = opt.vx ?? 0; p.vy = opt.vy ?? 0;
    p.gravity = opt.gravity ?? 0; p.drag = opt.drag ?? 0; p.age = 0; p.life = life; p.frames = frames; p.fade = opt.fade ?? false;
    p.img.setTexture(frames[0]).setPosition(x, y).setVisible(true).setActive(true).setAlpha(opt.alpha ?? 1)
      .setDepth(opt.depth ?? 12).setOrigin(0.5).setFlip(false, false).setScrollFactor(1);
    p.img.clearTint().setTintMode(Phaser.TintModes.MULTIPLY).setBlendMode(Phaser.BlendModes.NORMAL);
    return p.img;
  }

  update(dtMs: number): void {
    const dt = dtMs / 1000;
    for (const p of this.pool) {
      if (!p.alive) continue;
      p.age += dtMs;
      if (p.age >= p.life) { p.alive = false; p.img.setVisible(false).setActive(false); continue; }
      if (p.drag) { const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy *= k; }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.img.setPosition(p.x, p.y);
      const f = Math.min(p.frames.length - 1, Math.floor((p.age / p.life) * p.frames.length));
      if (p.img.texture.key !== p.frames[f]) p.img.setTexture(p.frames[f]);
      if (p.fade) p.img.setAlpha(1 - p.age / p.life);
    }
  }

  /* -------- presets -------- */
  private static DUST = ["dust0", "dust1", "dust2"] as const;
  private static SPARK = ["spark0", "spark1", "spark2"] as const;
  private static IMPACT = ["impact0", "impact1", "impact2"] as const;
  private static LEAF = ["leaf0", "leaf1"] as const;
  private static RING = ["ring0", "ring1", "ring2"] as const;
  private static GLINT = ["mote"] as const;

  /** Footstep / landing / takeoff dust. dir: -1/1 pushes the puffs that way; 0 spreads both ways. */
  dust(x: number, y: number, n: number, dir = 0, strength = 1): void {
    for (let i = 0; i < n; i++) {
      const spread = dir === 0 ? (i - (n - 1) / 2) * 22 : dir * (16 + i * 10);
      this.spawn(Fx.DUST, x + (i - (n - 1) / 2) * 3, y - 3, 300 + i * 50, { vx: spread * strength, vy: -12 - i * 5, drag: 4, depth: 9 });
    }
  }

  /** Directional hit sparks: fly away from the attacker along `dir`. */
  sparks(x: number, y: number, dir: 1 | -1, n: number, power = 1): void {
    for (let i = 0; i < n; i++) {
      const a = (Math.random() - 0.5) * 1.6, sp = (120 + Math.random() * 160) * power;
      const img = this.spawn(Fx.SPARK, x, y, 160 + Math.random() * 120, { vx: Math.cos(a) * sp * dir, vy: Math.sin(a) * sp - 40, gravity: 420, drag: 3, depth: 13 });
      img.setRotation(Math.atan2(Math.sin(a) * sp - 40, Math.cos(a) * sp * dir));
    }
  }

  impact(x: number, y: number, big = false): void {
    this.spawn(Fx.IMPACT, x, y, big ? 170 : 120, { depth: 13 });
  }

  slash(x: number, y: number, level: number, facing: 1 | -1, rising: boolean): void {
    const img = this.spawn([`slash${level}_0`, `slash${level}_1`, `slash${level}_2`], x, y, 120 + level * 20, { depth: 11 });
    img.setOrigin(facing > 0 ? 0.15 : 0.85, 0.5).setFlip(facing < 0, rising);
  }

  /** Dodge afterimage: a fading teal silhouette of the current frame. */
  afterimage(key: string, x: number, y: number, flipX: boolean): void {
    const img = this.spawn([key], x, y, 220, { fade: true, alpha: 0.5, depth: 9 });
    img.setOrigin(0.5, 1).setFlipX(flipX).setTint(0x62d3c3).setTintMode(Phaser.TintModes.FILL);
    if (!this.tints) img.setBlendMode(Phaser.BlendModes.ADD); // Canvas: no teal fill, so a bright additive ghost instead
  }

  leaves(x: number, y: number, n: number): void {
    for (let i = 0; i < n; i++)
      this.spawn(Fx.LEAF, x + (Math.random() - 0.5) * 12, y - Math.random() * 14, 600 + Math.random() * 300,
        { vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 60, gravity: 220, drag: 2.5, depth: 12 });
  }

  sparkle(x: number, y: number, n: number, color = 0xf6e7a0): void {
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      const img = this.spawn(Fx.GLINT, x, y, 420, { vx: Math.cos(a) * 50, vy: Math.sin(a) * 50 - 30, drag: 4, fade: true, depth: 13 });
      img.setTint(color);
    }
  }

  ring(x: number, y: number): void { this.spawn(Fx.RING, x, y, 360, { depth: 6 }); }

  /** Rising light motes (shrine). */
  motes(x: number, y: number, n: number): void {
    for (let i = 0; i < n; i++)
      this.spawn(Fx.GLINT, x + (Math.random() - 0.5) * 14, y, 900 + Math.random() * 500, { vy: -24 - Math.random() * 18, vx: (Math.random() - 0.5) * 8, fade: true, depth: 6 }).setTint(0x9cf0a4);
  }
}
