import Phaser from "phaser";
import { Animator, Clip } from "./anim";
import { FC, NpcClip, villagerClips } from "./clips";
import type { LookId } from "./artVillage";

/**
 * A non-combat character driven by cutscenes: the Father (S3) and the villagers (S4, S6). It walks to a point, holds a
 * pose, and the Father carries the bag once he takes it (his idle and walk switch to the bag versions). No physics: it
 * stands on the stage's ground line.
 */
export class Npc extends Phaser.GameObjects.Sprite {
  readonly anim: Animator;
  facing: 1 | -1 = 1;
  bag = false;
  private target: number | null = null;
  private arrive: (() => void) | null = null;
  private clipName: NpcClip = "idle";
  private readonly clips: Partial<Record<NpcClip, Clip>>;
  /** The pose it returns to after a walk: "idle", or "torch" for the headman at night. */
  rest: NpcClip;
  /** An unhurried walk (the Father stoops, he is in his fifties) that still keeps a cutscene moving. */
  static readonly SPEED = 62;
  speed = Npc.SPEED;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly id: string, clip: NpcClip, facing: 1 | -1 = 1, readonly look?: LookId, rest?: NpcClip) {
    super(scene, x, y, look ? `v_${look}_idle0` : "f_idle0");
    scene.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(9);
    this.anim = new Animator(this);
    this.clips = look ? villagerClips(look) : FC;
    if (look) this.speed = 74;
    this.rest = rest ?? "idle";
    this.facing = facing;
    this.pose(clip);
  }

  /** Hold a clip (the Father's idle and walk follow whether he carries the bag). */
  pose(c: NpcClip): void {
    this.clipName = c;
    const clip = !this.look && c === "idle" && this.bag ? FC.bidle : !this.look && c === "walk" && this.bag ? FC.bwalk : this.clips[c] ?? this.clips.idle!;
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
    this.x = this.target; this.target = null; this.pose(this.rest);
    const f = this.arrive; this.arrive = null; f?.();
  }

  tick(dt: number): void {
    if (this.target !== null) {
      const step = this.speed * dt / 1000, d = this.target - this.x;
      if (Math.abs(d) <= step) { this.x = this.target; this.target = null; this.pose(this.rest); const f = this.arrive; this.arrive = null; f?.(); }
      else this.x += Math.sign(d) * step;
    }
    this.setFlipX(this.facing < 0);
    this.anim.update(dt);
  }

  get clip(): NpcClip { return this.clipName; }
}
