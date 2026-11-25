import Phaser from "phaser";
import { Action, BindingOverrides, Device, REBINDABLE, input, keyName, padName } from "../core/input";
import { Difficulty, settings, updateSettings } from "../core/settings";
import { t, StringKey } from "../core/i18n";
import { VIEW } from "../tuning";
import { Menu } from "./menu";
import { PALETTE, text } from "./text";

/**
 * Options and controls panels, shared by the title screen and the pause menu. Every change is saved at once
 * (src/core/settings.ts) and applied live: volume, shake, flashes, difficulty, scaling and bindings.
 */
const DIFFS: Difficulty[] = ["story", "standard", "hard"];
const SHAKES = [0, 0.5, 1];

export class OptionsPanel {
  private menu: Menu | null = null;
  private controls: ControlsPanel | null = null;
  private bg: Phaser.GameObjects.Rectangle;
  private title: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene, private onClose: () => void, private depth = 300) {
    this.bg = scene.add.rectangle(0, 0, VIEW.width, VIEW.height, PALETTE.panel, 0.92).setOrigin(0).setScrollFactor(0).setDepth(depth);
    this.title = text(scene, VIEW.width / 2, 22, t("opt.title"), { size: 32, ox: 0.5, depth: depth + 1, fixed: true, color: PALETTE.gold });
    this.open();
  }

  private open(): void {
    const s = () => settings();
    const onOff = (b: boolean) => (b ? t("opt.on") : t("opt.off"));
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    this.menu = new Menu(this.scene, [
      { label: () => `${t("opt.volume")}: ◂ ${pct(s().volume)} ▸`, onChange: (d) => updateSettings({ volume: Math.round(Math.min(1, Math.max(0, s().volume + d * 0.1)) * 10) / 10 }) },
      { label: () => `${t("opt.music")}: ◂ ${pct(s().music)} ▸`, onChange: (d) => updateSettings({ music: Math.round(Math.min(1, Math.max(0, s().music + d * 0.1)) * 10) / 10 }) },
      { label: () => `${t("opt.shake")}: ◂ ${pct(s().shake)} ▸`, onChange: (d) => updateSettings({ shake: SHAKES[(SHAKES.indexOf(s().shake) + d + SHAKES.length) % SHAKES.length] ?? 1 }) },
      { label: () => `${t("opt.flashes")}: ${onOff(s().reduceFlashes)}`, onChange: () => updateSettings({ reduceFlashes: !s().reduceFlashes }) },
      { label: () => `${t("opt.difficulty")}: ◂ ${t(`diff.${s().difficulty}` as StringKey)} ▸`, onChange: (d) => updateSettings({ difficulty: DIFFS[(DIFFS.indexOf(s().difficulty) + d + 3) % 3] }) },
      { label: () => `${t("opt.pixel")}: ${onOff(s().pixelPerfect)}`, onChange: () => updateSettings({ pixelPerfect: !s().pixelPerfect }) },
      { label: () => `${t("opt.strip")}: ${onOff(s().showControls)}`, onChange: () => updateSettings({ showControls: !s().showControls }) },
      { label: () => t("opt.controls"), onConfirm: () => this.openControls() },
      { label: () => t("opt.back"), onConfirm: () => this.close() },
    ], {
      x: VIEW.width / 2, y: 70, align: "center", depth: this.depth + 1, onCancel: () => this.close(),
      footer: () => (this.menu?.index === 3 ? t(`diff.${s().difficulty}.desc` as StringKey) : t("opt.hint")),
    });
  }

  private openControls(): void {
    this.menu?.destroy(); this.menu = null;
    this.title.setVisible(false);
    this.controls = new ControlsPanel(this.scene, () => { this.controls = null; this.title.setVisible(true); this.open(); }, this.depth + 1);
  }

  update(): void { this.controls ? this.controls.update() : this.menu?.update(); }

  close(): void {
    this.menu?.destroy(); this.controls?.destroy();
    this.bg.destroy(); this.title.destroy();
    this.onClose();
  }
}

/**
 * Rebinding (review Phase 1): pick an action, press the new key or button. A key already used by another rebindable
 * action is swapped onto it, so two actions never share a key. Menu, pause and debug keys are fixed.
 */
class ControlsPanel {
  private menu: Menu;
  private device: Device = input.device;
  private title: Phaser.GameObjects.Text;
  private waiting: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private onClose: () => void, depth: number) {
    this.title = text(scene, VIEW.width / 2, 22, "", { size: 32, ox: 0.5, depth, fixed: true, color: PALETTE.gold });
    this.waiting = text(scene, VIEW.width / 2, VIEW.height - 36, t("ctl.press"), { ox: 0.5, depth, fixed: true, color: PALETTE.accent }).setVisible(false);
    const items = REBINDABLE.map((a) => ({
      label: () => `${t(`act.${a}` as StringKey)}: ${this.labelFor(a)}`,
      onConfirm: () => this.rebind(a),
    }));
    this.menu = new Menu(scene, [
      ...items,
      { label: () => t("ctl.reset"), onConfirm: () => { const b = { ...settings().bindings }; delete b[this.device]; this.apply(b); } },
      { label: () => t("opt.back"), onConfirm: () => this.close() },
    ], { x: VIEW.width / 2, y: 62, step: 17, align: "center", depth, onCancel: () => this.close(), footer: () => t("ctl.hint") + ` · ←/→: ${t("ctl.keyboard")}/${t("ctl.gamepad")}` });
    this.refreshTitle();
  }

  private labelFor(a: Action): string {
    return this.device === "gamepad" ? input.pad[a].map(padName).join(" / ") || "—" : input.keys[a].map(keyName).join(" / ") || "—";
  }
  private refreshTitle(): void { this.title.setText(t("ctl.title", { device: this.device === "gamepad" ? t("ctl.gamepad") : t("ctl.keyboard") })); }

  private rebind(a: Action): void {
    this.waiting.setVisible(true);
    input.clearPresses();
    input.captureNext((dev, code) => {
      this.waiting.setVisible(false);
      if (dev === "keyboard" && code === "Escape") return; // cancel
      if (dev !== this.device) { this.device = dev; this.refreshTitle(); }
      const b = JSON.parse(JSON.stringify(settings().bindings)) as BindingOverrides;
      if (dev === "keyboard") {
        const map = { ...input.keys, ...(b.keyboard ?? {}) };
        const old = input.keys[a];
        for (const other of REBINDABLE) if (other !== a && input.keys[other].includes(code as string)) map[other] = input.keys[other].map((c) => (c === code ? old[0] : c)).filter(Boolean);
        map[a] = [code as string];
        b.keyboard = Object.fromEntries(REBINDABLE.map((x) => [x, map[x]]));
      } else {
        const map = { ...input.pad, ...(b.gamepad ?? {}) };
        const old = input.pad[a];
        for (const other of REBINDABLE) if (other !== a && input.pad[other].includes(code as number)) map[other] = input.pad[other].map((c) => (c === code ? old[0] : c)).filter((c) => c !== undefined);
        map[a] = [code as number];
        b.gamepad = Object.fromEntries(REBINDABLE.map((x) => [x, map[x]]));
      }
      this.apply(b);
      input.clearPresses();
    });
  }

  private apply(bindings: BindingOverrides): void {
    updateSettings({ bindings });
    input.setBindings(bindings);
    this.menu.refresh();
  }

  update(): void {
    if (input.capturing) { if (input.consume("cancel")) { input.cancelCapture(); this.waiting.setVisible(false); } return; }
    if (input.consume("left") || input.consume("right")) { this.device = this.device === "keyboard" ? "gamepad" : "keyboard"; this.refreshTitle(); this.menu.refresh(); }
    this.menu.update();
  }

  close(): void { this.destroy(); this.onClose(); }
  destroy(): void { input.cancelCapture(); this.menu.destroy(); this.title.destroy(); this.waiting.destroy(); }
}
