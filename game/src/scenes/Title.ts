import Phaser from "phaser";
import { VIEW } from "../tuning";
import { input } from "../core/input";
import { t } from "../core/i18n";
import { clearSave, loadSave } from "../core/save";
import { Menu } from "../ui/menu";
import { OptionsPanel } from "../ui/options";
import { PALETTE, text } from "../ui/text";

/**
 * Title screen: Continue (when a playthrough is in progress), New game, Options.
 * New game over an existing save asks first, because there is one slot.
 */
export class TitleScene extends Phaser.Scene {
  private menu: Menu | null = null;
  private options: OptionsPanel | null = null;
  private confirmText: Phaser.GameObjects.Text | null = null;
  private motes: { img: Phaser.GameObjects.Image; x: number; y: number; v: number; p: number }[] = [];

  constructor() { super("Title"); }

  create(): void {
    this.menu = null; this.options = null; this.confirmText = null; this.motes = [];
    this.add.tileSprite(0, 0, VIEW.width, VIEW.height, "bg_thanhmoc").setOrigin(0).setTileScale(4, 4).setDepth(-10).tilePositionY = 22;
    this.add.rectangle(0, 0, VIEW.width, VIEW.height, PALETTE.panel, 0.45).setOrigin(0).setDepth(-9);
    this.add.image(VIEW.width - 90, VIEW.height + 4, "split_tree").setOrigin(0.5, 1).setDepth(-8);
    for (let i = 0; i < 16; i++) {
      const img = this.add.image(0, 0, "mote").setDepth(-7);
      this.motes.push({ img, x: Math.random() * VIEW.width, y: Math.random() * VIEW.height, v: 4 + Math.random() * 8, p: Math.random() * 6 });
    }
    text(this, VIEW.width / 2, 46, t("title.game"), { size: 64, ox: 0.5, color: PALETTE.gold });
    text(this, VIEW.width / 2, 108, t("title.sub"), { ox: 0.5, color: PALETTE.dim });
    this.hint = text(this, VIEW.width / 2, VIEW.height - 22, "", { ox: 0.5, color: PALETTE.dim });
    this.buildMenu();
    this.scene.bringToTop("UI");
  }
  private hint!: Phaser.GameObjects.Text;

  private buildMenu(): void {
    const sv = loadSave();
    const inProgress = !!sv && !sv.done.includes(sv.stage);
    this.menu?.destroy();
    this.menu = new Menu(this, [
      { label: () => t("title.continue"), disabled: () => !inProgress, onConfirm: () => this.scene.start("Stage", { mode: "continue" }) },
      { label: () => t("title.new"), onConfirm: () => (sv ? this.askOverwrite() : this.scene.start("NameEntry")) },
      { label: () => t("title.options"), onConfirm: () => this.openOptions() },
    ], { x: VIEW.width / 2, y: 150, step: 20, align: "center" });
  }

  private askOverwrite(): void {
    this.menu?.setVisible(false);
    this.confirmText = text(this, VIEW.width / 2, 170, t("title.overwrite"), { ox: 0.5, align: "center", wrap: 400, color: PALETTE.accent });
  }

  private openOptions(): void {
    this.menu?.setVisible(false);
    this.options = new OptionsPanel(this, () => { this.options = null; this.menu?.setVisible(true); this.menu?.refresh(); }, 300);
  }

  update(_time: number, delta: number): void {
    for (const m of this.motes) {
      m.y -= m.v * delta / 1000; if (m.y < -4) { m.y = VIEW.height + 4; m.x = Math.random() * VIEW.width; }
      m.img.setPosition(m.x + Math.sin(m.y / 30 + m.p) * 6, m.y).setAlpha(0.3 + 0.3 * Math.sin(m.y / 20 + m.p));
    }
    this.hint.setText(t("title.hint"));
    if (this.options) { this.options.update(); return; }
    if (this.confirmText) {
      if (input.consume("confirm")) { clearSave(); this.scene.start("NameEntry"); }
      else if (input.consume("cancel")) { this.confirmText.destroy(); this.confirmText = null; this.menu?.setVisible(true); }
      return;
    }
    this.menu?.update();
  }
}
