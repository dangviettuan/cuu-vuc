import Phaser from "phaser";
import { PrologueScene } from "./scenes/Prologue";
import { VIEW, WORLD } from "./tuning";

// ADR-0008: Phaser 4, WebGL, 640×360 logical resolution, pixel art, FIT scaling.
const game = new Phaser.Game({
  type: Phaser.WEBGL,
  parent: "game",
  width: VIEW.width,
  height: VIEW.height,
  backgroundColor: "#0b0d11",
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: "arcade", arcade: { gravity: { x: 0, y: WORLD.gravity }, debug: false } },
  scene: [PrologueScene],
});

// Exposed for automated smoke tests and console debugging.
(window as unknown as { __cuuVuc: Phaser.Game }).__cuuVuc = game;
