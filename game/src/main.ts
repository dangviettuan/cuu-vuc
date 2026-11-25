import Phaser from "phaser";
import { BootScene } from "./scenes/Boot";
import { TitleScene } from "./scenes/Title";
import { NameEntryScene } from "./scenes/NameEntry";
import { StageScene } from "./scenes/Stage";
import { UIScene } from "./scenes/UI";
import { setWeapon } from "./art";
import { setVolume, unlockAudio } from "./sfx";
import { input } from "./core/input";
import { onSettings, settings } from "./core/settings";
import { save } from "./core/save";
import { KIT, VIEW, WORLD } from "./tuning";

// ADR-0008 / ADR-0009: Phaser 4, 480×270 logical resolution, pixel art.
// Renderer: WebGL when the browser supports it, otherwise Canvas (AUTO). Tint-based effects have Canvas fallbacks (render.ts).
// `?renderer=canvas` or `?renderer=webgl` forces one, for testing. `?kit=kiem` loads the Kiếm Khách kit (ADR-0010).
// `?quick=1` skips the title (playtest tools); `?seed=N` makes the boss's choices reproducible.
const forced = new URLSearchParams(location.search).get("renderer");
setWeapon(KIT.weapon);
input.setBindings(settings().bindings);
setVolume(settings().volume);

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
  // UI last: it updates after the stage and draws on top of every scene.
  scene: [BootScene, TitleScene, NameEntryScene, StageScene, UIScene],
});

// Input: gamepads are polled before any scene updates; presses are cleared after all of them (src/core/input.ts).
game.events.on(Phaser.Core.Events.PRE_STEP, () => input.poll());
game.events.on(Phaser.Core.Events.POST_STEP, () => input.endStep());

// Audio needs a user gesture: unlock it from the first real key, click or touch.
for (const ev of ["keydown", "pointerdown", "touchstart"]) window.addEventListener(ev, () => unlockAudio(), { capture: true });

/**
 * Scaling. "Pixel-perfect" (default): the largest whole-number zoom that fits the window, letterboxed, so every game
 * pixel is the same size on screen. Otherwise: fit the window (any scale; pixels may shimmer as the camera moves).
 */
function applyScale(): void {
  const sm = game.scale;
  if (settings().pixelPerfect) {
    const z = Math.max(1, Math.floor(Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height)));
    if (sm.scaleMode !== Phaser.Scale.NONE) sm.scaleMode = Phaser.Scale.NONE;
    sm.setZoom(z);
  } else {
    if (sm.scaleMode !== Phaser.Scale.FIT) { sm.scaleMode = Phaser.Scale.FIT; sm.setZoom(1); }
    sm.refresh();
  }
}
game.events.once(Phaser.Core.Events.READY, applyScale);
window.addEventListener("resize", applyScale);
onSettings((s) => { setVolume(s.volume); applyScale(); });

// Exposed for automated smoke tests and console debugging.
(window as unknown as { __cuuVuc: Phaser.Game }).__cuuVuc = game;
(window as unknown as { __cuuVucSave: typeof save }).__cuuVucSave = save;
