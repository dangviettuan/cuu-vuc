import Phaser from "phaser";
import { registerTextures } from "../art";
import { buildOutlines } from "../outline";
import { loadSave, migrateLegacy, newSave } from "../core/save";
import { isQuick } from "../core/mode";
import { loadFont } from "../ui/text";

/**
 * Boot: everything the session needs once, before the first screen.
 * 1. **Authored art** (ADR-0011): `public/art/manifest.json` lists atlases exported from Aseprite. Each frame becomes
 *    its own texture under its frame name (a clip key such as `p_run3`); `registerTextures()` skips keys that already
 *    exist, so an authored frame replaces its generated one and anything not yet drawn stays generated.
 * 2. **Generated greybox art** and the hero's outline textures.
 * 3. **The pixel font** (VT323, Vietnamese glyphs), so no text is drawn in a fallback font.
 * 4. **The save** (and the one-time import of pre-save flags).
 * Then it launches the UI layer and opens the title screen, or the stage directly in quick mode (`?quick=1`, used by
 * the playtest tools: a throwaway save, no title).
 */
export class BootScene extends Phaser.Scene {
  constructor() { super("Boot"); }

  preload(): void { this.load.json("artManifest", "art/manifest.json"); }

  create(): void {
    const manifest = this.cache.json.get("artManifest") as { atlases?: string[] } | undefined;
    const atlases = manifest?.atlases ?? [];
    const go = () => void this.finish();
    if (!atlases.length) { go(); return; }
    for (const a of atlases) this.load.atlas(`atlas:${a}`, `art/${a}.png`, `art/${a}.json`);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => { for (const a of atlases) this.split(`atlas:${a}`); go(); });
    this.load.start();
  }

  private async finish(): Promise<void> {
    registerTextures(this);
    buildOutlines(this, "p_");
    await loadFont();
    if (isQuick()) newSave("Thử nghiệm", "prologue-s1");
    else { loadSave(); migrateLegacy(); }
    this.scene.launch("UI");
    if (isQuick()) this.scene.start("Stage", { mode: "quick" });
    else this.scene.start("Title");
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
