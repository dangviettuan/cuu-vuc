import Phaser from "phaser";

/**
 * Boot: loads authored pixel art before the generated greybox art fills the gaps (ADR-0011).
 *
 * `public/art/manifest.json` lists atlases exported from Aseprite: `{ "atlases": ["hero"] }` loads
 * `art/hero.png` + `art/hero.json` (Aseprite "Hash" JSON). Every frame becomes its own texture, named by its frame
 * name, which must be a clip key such as `p_run3` or `nanh_rear0` (src/clips.ts). `registerTextures()` skips keys that
 * already exist, so an authored frame replaces its generated one and anything not yet drawn stays generated.
 */
export class BootScene extends Phaser.Scene {
  constructor() { super("Boot"); }

  preload(): void { this.load.json("artManifest", "art/manifest.json"); }

  create(): void {
    const manifest = this.cache.json.get("artManifest") as { atlases?: string[] } | undefined;
    const atlases = manifest?.atlases ?? [];
    if (!atlases.length) { this.scene.start("Prologue"); return; }
    for (const a of atlases) this.load.atlas(`atlas:${a}`, `art/${a}.png`, `art/${a}.json`);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      for (const a of atlases) this.split(`atlas:${a}`);
      this.scene.start("Prologue");
    });
    this.load.start();
  }

  /** One canvas texture per atlas frame, restoring Aseprite's trim so the feet stay at the cell's anchor. */
  private split(key: string): void {
    if (!this.textures.exists(key)) return;
    const tex = this.textures.get(key);
    for (const name of tex.getFrameNames()) {
      if (this.textures.exists(name)) continue;
      const fr = tex.get(name);
      const c = document.createElement("canvas");
      c.width = fr.realWidth; c.height = fr.realHeight;
      c.getContext("2d")!.drawImage(fr.source.image as CanvasImageSource, fr.cutX, fr.cutY, fr.cutWidth, fr.cutHeight, fr.x, fr.y, fr.cutWidth, fr.cutHeight);
      this.textures.addCanvas(name, c);
    }
  }
}
