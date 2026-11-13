import Phaser from "phaser";
import { canTint } from "./render";

/** A damaging area produced by an enemy this frame. */
export interface EnemyHit {
  id: string; // unique per swing; the player is hit at most once per id
  rect: Phaser.Geom.Rectangle;
  damage: number;
  knockback: number; // px/s, signed by direction
  parryable: boolean; // heavy/unblockable attacks must be dodged
  onParried?: () => void;
}

/** A damaging area produced by the player this frame. */
export interface PlayerHit {
  id: number;
  rect: Phaser.Geom.Rectangle;
  damage: number;
  guardBreak: boolean;
  direction: 1 | -1;
}

export type HitResult = "hit" | "dodged" | "perfectDodge" | "parried" | "ignored";

/** Anything the player can strike. */
export interface Hittable {
  hp: number;
  hurtbox(): Phaser.Geom.Rectangle;
  takeHit(hit: PlayerHit): void;
  isAlive(): boolean;
}

export function overlaps(a: Phaser.Geom.Rectangle, b: Phaser.Geom.Rectangle): boolean {
  return Phaser.Geom.Intersects.RectangleToRectangle(a, b);
}

/** White hit-flash using the v4 tint API (ADR-0008). On Canvas (no tints) the sprite is drawn additively instead. */
export function flash(sprite: Phaser.GameObjects.Sprite, on: boolean, color = 0xffffff): void {
  if (!canTint(sprite)) { sprite.setBlendMode(on ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL); return; }
  if (on) sprite.setTint(color).setTintMode(Phaser.TintModes.FILL);
  else sprite.clearTint().setTintMode(Phaser.TintModes.MULTIPLY);
}
