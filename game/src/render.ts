import Phaser from "phaser";

/**
 * Renderer capability checks. The game runs on WebGL when available and falls back to Canvas (main.ts, Phaser.AUTO).
 * The Canvas renderer ignores tints, so tint-based effects (hit flash, telegraph glow, dodge afterimage)
 * use an additive blend instead there: less exact, but the cue is never lost.
 */
export function canTint(obj: Phaser.GameObjects.GameObject): boolean {
  return obj.scene.sys.renderer.type === Phaser.WEBGL;
}
