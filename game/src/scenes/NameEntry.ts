import Phaser from "phaser";
import { VIEW } from "../tuning";
import { input } from "../core/input";
import { t } from "../core/i18n";
import { NAME_MAX, cleanName, newSave } from "../core/save";
import { FONT, PALETTE, text } from "../ui/text";

/**
 * Name entry (ADR-0004): the protagonist's name is typed by the player and stored in the save.
 *
 * It is a real HTML text field laid over the canvas, because Vietnamese is typed through an input method
 * (Telex/VNI composition) that a canvas cannot receive. Any script is accepted; the name is NFC-normalised,
 * trimmed and capped at NAME_MAX characters (src/core/save.ts). Enter (or a gamepad's confirm) accepts; Esc goes back.
 */
export class NameEntryScene extends Phaser.Scene {
  private field: HTMLInputElement | null = null;
  private error!: Phaser.GameObjects.Text;
  private onResize = () => this.place();

  constructor() { super("NameEntry"); }

  create(): void {
    this.add.tileSprite(0, 0, VIEW.width, VIEW.height, "bg_thanhmoc").setOrigin(0).setTileScale(4, 4).setDepth(-10).tilePositionY = 22;
    this.add.rectangle(0, 0, VIEW.width, VIEW.height, PALETTE.panel, 0.7).setOrigin(0);
    text(this, VIEW.width / 2, 78, t("name.prompt"), { size: 32, ox: 0.5, color: PALETTE.gold });
    text(this, VIEW.width / 2, 178, t("name.hint"), { ox: 0.5, color: PALETTE.dim });
    this.error = text(this, VIEW.width / 2, 196, "", { ox: 0.5, color: PALETTE.accent });

    const f = document.createElement("input");
    f.type = "text"; f.maxLength = NAME_MAX * 2; f.autocomplete = "off"; f.spellcheck = false;
    f.setAttribute("aria-label", t("name.prompt"));
    Object.assign(f.style, {
      position: "fixed", zIndex: "10", textAlign: "center", fontFamily: `${FONT}, monospace`, color: PALETTE.text,
      background: "#0b0d11", border: "2px solid #f6e7a0", outline: "none", padding: "0", boxSizing: "border-box",
    } as CSSStyleDeclaration);
    f.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); this.submit(); }
      else if (e.key === "Escape") { e.preventDefault(); this.back(); }
    });
    document.body.appendChild(f);
    this.field = f;
    this.place();
    window.addEventListener("resize", this.onResize);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize);
    setTimeout(() => f.focus(), 0);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  /** Lay the field over the canvas at game coordinates (it follows the canvas's scale and position). */
  private place(): void {
    const f = this.field; if (!f) return;
    const r = this.game.canvas.getBoundingClientRect(), k = r.width / VIEW.width;
    const w = 220 * k, h = 26 * k;
    Object.assign(f.style, { left: `${r.left + (VIEW.width / 2) * k - w / 2}px`, top: `${r.top + 128 * k}px`, width: `${w}px`, height: `${h}px`, fontSize: `${Math.round(20 * k)}px` });
  }

  private submit(): void {
    const name = cleanName(this.field?.value ?? "");
    if (!name) { this.error.setText(t("name.empty")); return; }
    newSave(name, "prologue-s1");
    this.scene.start("Stage", { mode: "new" });
  }

  private back(): void { this.scene.start("Title"); }

  update(): void {
    // A gamepad can't type, but its confirm/cancel still work here (the keyboard goes to the field).
    if (input.consume("confirm")) this.submit();
    else if (input.consume("cancel")) this.back();
  }

  private cleanup(): void {
    window.removeEventListener("resize", this.onResize);
    this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize);
    this.field?.remove(); this.field = null;
  }
}
