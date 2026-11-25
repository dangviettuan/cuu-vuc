import Phaser from "phaser";
import { Animator } from "./anim";
import { FC, FatherClip } from "./clips";

/**
 * A non-combat character driven by cutscenes (Phase 2: the Father in Prologue S3). It walks to a point, holds a pose,
 * and carries the bag once he takes it (his idle and walk switch to the bag versions). No physics: it stands on the
 * stage's ground line.
 */
export class Npc extends Phaser.GameObjects.Sprite {
  readonly anim: Animator;
  facing: 1 | -1 = 1;
  bag = false;
  private target: number | null = null;
  private arrive: (() => void) | null = null;
  private clipName: FatherClip = "idle";
  /** An unhurried walk (he stoops, he is in his fifties) that still keeps a cutscene moving. */
  static readonly SPEED = 62;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly id: string, clip: FatherClip, facing: 1 | -1 = 1) {
    super(scene, x, y, "f_idle0");
    scene.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(9);
    this.anim = new Animator(this);
    this.facing = facing;
    this.pose(clip);
  }

  /** Hold a clip (idle and walk follow whether he carries the bag). */
  pose(c: FatherClip): void {
    this.clipName = c;
    const clip = c === "idle" && this.bag ? FC.bidle : c === "walk" && this.bag ? FC.bwalk : FC[c];
    this.anim.play(clip, true, true);
  }

  /** Walk to `x`; resolves on arrival. */
  walkTo(x: number): Promise<void> {
    return new Promise((res) => {
      if (Math.abs(x - this.x) < 1) { res(); return; }
      this.target = x; this.arrive = res;
      this.facing = x > this.x ? 1 : -1;
      this.pose("walk");
    });
  }

  /** Cutscene skipped: finish any walk at once. */
  finishWalk(): void {
    if (this.target === null) return;
    this.x = this.target; this.target = null; this.pose("idle");
    const f = this.arrive; this.arrive = null; f?.();
  }

  tick(dt: number): void {
    if (this.target !== null) {
      const step = Npc.SPEED * dt / 1000, d = this.target - this.x;
      if (Math.abs(d) <= step) { this.x = this.target; this.target = null; this.pose("idle"); const f = this.arrive; this.arrive = null; f?.(); }
      else this.x += Math.sign(d) * step;
    }
    this.setFlipX(this.facing < 0);
    this.anim.update(dt);
  }

  get clip(): FatherClip { return this.clipName; }
}
