import Phaser from "phaser";
import { BootScene } from "./scenes/Boot";
import { PrologueScene } from "./scenes/Prologue";
import { setWeapon } from "./art";
import { KIT, VIEW, WORLD } from "./tuning";

// ADR-0008 / ADR-0009: Phaser 4, 480×270 logical resolution, pixel art, FIT scaling.
// Renderer: WebGL when the browser supports it, otherwise Canvas (AUTO). Tint-based effects have Canvas fallbacks (render.ts).
// `?renderer=canvas` or `?renderer=webgl` forces one, for testing.
// `?kit=kiem` loads the Kiếm Khách kit instead of the canon Prologue kit (ADR-0010); the drawn weapon follows it.
const forced = new URLSearchParams(location.search).get("renderer");
setWeapon(KIT.weapon);
const game = new Phaser.Game({
  type: forced === "canvas" ? Phaser.CANVAS : forced === "webgl" ? Phaser.WEBGL : Phaser.AUTO,
  parent: "game",
  width: VIEW.width,
  height: VIEW.height,
  backgroundColor: "#0b0d11",
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: "arcade", arcade: { gravity: { x: 0, y: WORLD.gravity }, debug: false } },
  scene: [BootScene, PrologueScene],
});

// Exposed for automated smoke tests and console debugging.
(window as unknown as { __cuuVuc: Phaser.Game }).__cuuVuc = game;
