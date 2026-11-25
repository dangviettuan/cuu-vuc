import Phaser from "phaser";
import { input } from "../core/input";
import { sfx } from "../sfx";
import { PALETTE, text } from "./text";

/**
 * A vertical menu driven by actions (keyboard or gamepad): up/down move, left/right change a value, confirm selects,
 * cancel goes back. Used by the title screen, pause, options and controls. Rendered as a column of pixel-font labels
 * with a cursor; screen-fixed, at a given depth.
 */
export interface MenuItem {
  label: () => string;
  /** Shown dimmed and skipped by the cursor. */
  disabled?: () => boolean;
  onConfirm?: () => void;
  /** Left/right: -1 or +1. */
  onChange?: (dir: -1 | 1) => void;
}

export interface MenuOpts {
  x: number;
  y: number;
  /** Line height in px. */
  step?: number;
  align?: "left" | "center";
  depth?: number;
  onCancel?: () => void;
  /** A line under the menu, refreshed with it (descriptions, hints). */
  footer?: () => string;
  width?: number;
}

export class Menu {
  index = 0;
  private texts: Phaser.GameObjects.Text[] = [];
  private cursor: Phaser.GameObjects.Text;
  private footer?: Phaser.GameObjects.Text;
  private alive = true;

  constructor(scene: Phaser.Scene, private items: MenuItem[], private o: MenuOpts) {
    const step = o.step ?? 18, d = o.depth ?? 200, center = o.align === "center";
    items.forEach((it, i) => this.texts.push(text(scene, o.x, o.y + i * step, it.label(), { ox: center ? 0.5 : 0, depth: d, fixed: true })));
    this.cursor = text(scene, 0, 0, "▸", { color: PALETTE.accent, depth: d, fixed: true, oy: 0 });
    if (o.footer) this.footer = text(scene, center ? o.x : o.x, o.y + items.length * step + 8, "", { ox: center ? 0.5 : 0, depth: d, fixed: true, color: PALETTE.dim, wrap: o.width ?? 380, align: center ? "center" : "left" });
    while (this.index < items.length - 1 && items[this.index].disabled?.()) this.index++;
    this.refresh();
  }

  /** Call every frame while the menu is active. Returns false once destroyed. */
  update(): boolean {
    if (!this.alive) return false;
    if (input.capturing) return true;
    const n = this.items.length;
    const move = (d: number) => {
      for (let k = 1; k <= n; k++) { const j = (this.index + d * k + n) % n; if (!this.items[j].disabled?.()) { this.index = j; break; } }
      sfx.ui(); this.refresh();
    };
    if (input.consume("up")) move(-1);
    else if (input.consume("down")) move(1);
    const it = this.items[this.index];
    if (it.onChange && input.consume("left")) { it.onChange(-1); sfx.ui(); this.refresh(); }
    else if (it.onChange && input.consume("right")) { it.onChange(1); sfx.ui(); this.refresh(); }
    if (input.consume("confirm")) {
      if (it.onConfirm && !it.disabled?.()) { sfx.uiConfirm(); it.onConfirm(); }
      else if (it.onChange) { it.onChange(1); sfx.ui(); this.refresh(); }
      return this.alive;
    }
    if (this.o.onCancel && input.consume("cancel")) { sfx.ui(); this.o.onCancel(); }
    return this.alive;
  }

  refresh(): void {
    if (!this.alive) return;
    this.items.forEach((it, i) => {
      const t = this.texts[i];
      t.setText(it.label()).setColor(it.disabled?.() ? "#5a606b" : i === this.index ? PALETTE.gold : PALETTE.text);
    });
    const t = this.texts[this.index];
    const left = t.x - t.originX * t.width;
    this.cursor.setPosition(Math.round(left - 10), t.y);
    this.footer?.setText(this.o.footer!());
  }

  setVisible(v: boolean): void { [...this.texts, this.cursor, this.footer].forEach((t) => t?.setVisible(v)); }

  destroy(): void {
    this.alive = false;
    [...this.texts, this.cursor, this.footer].forEach((t) => t?.destroy());
  }
}
