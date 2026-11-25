import Phaser from "phaser";
import { KIT, PHA_THE_COST, PLAYER, VIEW } from "../tuning";
import { input } from "../core/input";
import { music } from "../music";
import { t, StringKey } from "../core/i18n";
import { onSettings, settings } from "../core/settings";
import { setFlag } from "../core/save";
import type { FlagName, FlagValue } from "../core/flags";
import type { Option, Script } from "../data/dialogue";
import { Menu } from "../ui/menu";
import { OptionsPanel } from "../ui/options";
import { PALETTE, text } from "../ui/text";
import type { StageScene } from "./Stage";

/** Bottom controls strip: two lines of the 16 px pixel font. The boss bar and name sit just above it. */
/** Input ignored on each line of a script that ends in a choice, and on its options, after they appear. */
const CHOICE_GUARD_MS = 550;
const STRIP_H = 34;

/**
 * The UI layer: runs for the whole session on top of every other scene (launched in Boot).
 * While a stage is attached it draws the HUD (HP, stamina, Thế, herb pouch, boss bar, controls strip, toasts) and
 * owns everything modal: the dialogue/choice box, the end card and the pause menu with options.
 */
export class UIScene extends Phaser.Scene {
  private stage: StageScene | null = null;
  private hud!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;
  private toastUntil = 0;
  private bossName!: Phaser.GameObjects.Text;
  private bossShown = false;
  private hpTrail: number = PLAYER.maxHp;
  private bossTrail = 1;
  private strip: Phaser.GameObjects.GameObject[] = [];
  private stripLines: Phaser.GameObjects.Text[] = [];
  // modal state
  private dialogue: DialogueBox | null = null;
  private card: { panel: Phaser.GameObjects.Text; onConfirm: () => void } | null = null;
  private pause: { bg: Phaser.GameObjects.Rectangle; title: Phaser.GameObjects.Text; menu: Menu } | null = null;
  private options: OptionsPanel | null = null;
  private narration: Narration | null = null;

  constructor() { super("UI"); }

  /** True while something modal has the input (dialogue, end card, pause, options): gameplay ignores input. */
  get busy(): boolean { return !!(this.dialogue || this.card || this.pause || this.options || this.narration); }

  create(): void {
    this.hud = this.add.graphics().setDepth(100);
    this.hudText = text(this, 10, 30, "", { depth: 101 });
    this.toastText = text(this, VIEW.width / 2, 44, "", { color: PALETTE.gold, bg: "#0b0d11cc", pad: 5, ox: 0.5, depth: 101, wrap: 420, align: "center" }).setVisible(false);
    this.bossName = text(this, VIEW.width / 2, 0, "", { ox: 0.5, depth: 101 }).setVisible(false);
    this.strip.push(this.add.rectangle(0, VIEW.height - STRIP_H, VIEW.width, STRIP_H, PALETTE.panel, 0.86).setOrigin(0).setDepth(100));
    this.stripLines = [0, 15].map((dy) => text(this, VIEW.width / 2, VIEW.height - STRIP_H + dy, "", { ox: 0.5, depth: 101, color: "#e4e7ec" }));
    this.strip.push(...this.stripLines);
    const refresh = () => this.refreshStrip();
    input.onDevice(refresh);
    onSettings(refresh);
    this.setHudVisible(false);
  }

  attach(stage: StageScene): void {
    this.stage = stage;
    this.hpTrail = PLAYER.maxHp; this.bossTrail = 1;
    this.closeAll();
    this.hideBoss();
    this.refreshStrip();
    this.setHudVisible(true);
    stage.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { if (this.stage === stage) this.detach(); });
  }

  detach(): void { this.stage = null; this.closeAll(); this.setHudVisible(false); this.toastText.setVisible(false); this.hideBoss(); }

  private hudOn = false;
  private setHudVisible(v: boolean): void { this.hudOn = v; this.hud.setVisible(v); this.hudText.setVisible(v); this.updateStrip(); }
  /** Bottom space the strip takes right now (0 when hidden), so the boss bar sits just above whatever is there. */
  private get stripH(): number { return this.stripShown ? STRIP_H : 0; }
  /** The combat controls strip is noise in a quiet scene (S3): only stages with fighting show it. */
  private get combatStage(): boolean { const d = this.stage?.def; return !!d && (d.boars.length > 0 || !!d.arena || d.brush.length > 0 || !!d.stampede); }
  private get stripShown(): boolean { return this.hudOn && this.combatStage && settings().showControls && !this.dialogue && !this.card && !this.pause && !this.options; }
  private updateStrip(): void { const v = this.stripShown; this.strip.forEach((o) => (o as Phaser.GameObjects.Text).setVisible(v)); }

  private refreshStrip(): void {
    if (!this.stripLines.length) return;
    this.stripLines[0].setText(t("hud.strip1"));
    this.stripLines[1].setText(t(KIT.classKit ? "hud.strip2.kiem" : "hud.strip2"));
  }

  toast(s: string, ms = 1800): void { this.toastText.setText(s).setVisible(true); this.toastUntil = this.time.now + ms; }
  showBoss(name: string): void { this.bossName.setText(name).setVisible(true); this.bossShown = true; this.bossTrail = 1; }
  hideBoss(): void { this.bossName?.setVisible(false); this.bossShown = false; }

  /** Run a dialogue script; its options' flags are saved at once, then `done(outcome)` is called. */
  runScript(script: Script, done: (outcome: string) => void): void {
    this.dialogue?.destroy();
    this.dialogue = new DialogueBox(this, script, (opt) => {
      this.dialogue = null;
      for (const [k, v] of Object.entries(opt?.flags ?? {})) setFlag(k as FlagName, v as FlagValue);
      done(opt?.outcome ?? "");
    });
  }

  /** One line of dialogue or narration (`who` null): cutscenes and things to look at. `done` runs when it is closed. */
  line(who: StringKey | null, text: StringKey, done?: () => void): void {
    this.dialogue?.destroy();
    const script: Script = { id: "line", lines: [{ who: who ?? undefined, text }] };
    this.dialogue = new DialogueBox(this, script, () => { this.dialogue = null; done?.(); });
  }

  /** Close the current line as if confirmed (skipping a cutscene). */
  closeLine(): void { this.dialogue?.finishNow(); }

  /**
   * Full-screen narration cards between stages (they carry the story across time skips, and stand in for S2).
   * Confirm moves on; after the last card `done` runs.
   */
  narrate(keys: StringKey[], done: () => void): void {
    if (!keys.length) { done(); return; }
    this.narration = new Narration(this, keys, () => { this.narration = null; done(); });
  }

  /** The closing card: confirm returns to the title (quick mode: restarts the stage). */
  endCard(epilogue: string): void {
    const quick = this.stage?.mode === "quick";
    const panel = text(this, VIEW.width / 2, VIEW.height / 2 - 20, t("end.card", { epilogue }), { ox: 0.5, oy: 0.5, align: "center", bg: "#0b0d11ee", pad: 10, depth: 250, wrap: 400 });
    this.card = { panel, onConfirm: () => (quick ? this.restartStage() : this.toTitle()) };
  }

  private restartStage(): void { const st = this.stage; this.closeAll(); st?.scene.restart({ mode: "quick" }); }

  private toTitle(): void {
    this.closeAll();
    music.duck(false);
    if (this.stage) { const st = this.stage; this.detach(); st.scene.stop(); }
    this.scene.run("Title");
    this.scene.bringToTop("UI");
  }

  private openPause(): void {
    if (!this.stage) return;
    this.stage.scene.pause();
    music.duck(true);
    const bg = this.add.rectangle(0, 0, VIEW.width, VIEW.height, PALETTE.panel, 0.7).setOrigin(0).setDepth(200);
    const title = text(this, VIEW.width / 2, 60, t("pause.title"), { size: 32, ox: 0.5, depth: 201, color: PALETTE.gold });
    const menu = new Menu(this, [
      { label: () => t("pause.resume"), onConfirm: () => this.closePause() },
      { label: () => t("pause.skip"), disabled: () => !this.stage?.cutscene || this.stage.inChoice, onConfirm: () => { const st = this.stage; this.closePause(); st?.skipCutscene(); } },
      { label: () => t("pause.options"), onConfirm: () => { menu.setVisible(false); title.setVisible(false); this.options = new OptionsPanel(this, () => { this.options = null; menu.setVisible(true); title.setVisible(true); menu.refresh(); }, 300); } },
      { label: () => t("pause.title.menu"), onConfirm: () => this.toTitle() },
    ], { x: VIEW.width / 2, y: 110, align: "center", depth: 201, onCancel: () => this.closePause() });
    this.pause = { bg, title, menu };
  }

  private closePause(): void {
    if (!this.pause) return;
    this.pause.menu.destroy(); this.pause.bg.destroy(); this.pause.title.destroy(); this.pause = null;
    this.stage?.scene.resume();
    music.duck(false);
    input.clearPresses(); // the key that closed the menu must not also swing the sword
  }

  private closeAll(): void {
    this.options?.close(); this.options = null;
    if (this.pause) { this.pause.menu.destroy(); this.pause.bg.destroy(); this.pause.title.destroy(); this.pause = null; }
    this.dialogue?.destroy(); this.dialogue = null;
    this.card?.panel.destroy(); this.card = null;
    this.narration?.destroy(); this.narration = null;
  }

  update(time: number, delta: number): void {
    // modal input first: options > pause > end card > dialogue
    if (this.options) this.options.update();
    else if (this.pause) { this.pause.menu.update(); if (this.pause && input.consume("pause")) this.closePause(); }
    else if (this.narration) this.narration.update();
    else if (this.card) { if (input.consume("confirm") || (this.stage?.mode === "quick" && input.rawPresses.has("KeyR"))) this.card.onConfirm(); }
    else if (this.stage && input.consume("pause")) this.openPause();
    else if (this.dialogue) this.dialogue.update();

    this.toastText.setVisible(time < this.toastUntil && !!this.stage && !this.dialogue);
    this.updateStrip();
    if (this.stage) this.drawHud(delta);
  }

  private drawHud(dtMs: number): void {
    const g = this.hud, st = this.stage!, p = st.player;
    if (!p) return;
    if (!this.combatStage) { g.clear(); this.hudText.setText(""); return; } // a quiet scene shows no combat HUD
    // damage trail: the white part of the bar drains after a short delay so the size of a hit is readable
    this.hpTrail = this.hpTrail > p.hp ? Math.max(p.hp, this.hpTrail - (dtMs / 1000) * 60) : p.hp;
    g.clear();
    g.fillStyle(PALETTE.panel, 0.8).fillRect(8, 8, 124, 20);
    g.fillStyle(0x3a2a2a, 1).fillRect(10, 10, 120, 6);
    g.fillStyle(0xebe6dc, 1).fillRect(10, 10, Math.round(120 * (this.hpTrail / PLAYER.maxHp)), 6);
    g.fillStyle(0xb8574a, 1).fillRect(10, 10, Math.round(120 * (p.hp / PLAYER.maxHp)), 6);
    g.fillStyle(0x2a3a34, 1).fillRect(10, 19, 120, 4);
    g.fillStyle(0x62d3c3, 1).fillRect(10, 19, Math.round(120 * (p.stamina / PLAYER.maxStamina)), 4);
    // Thế pips (Kiếm Khách only); a gold tick marks the Phá Thế threshold
    if (KIT.classKit) {
      for (let i = 0; i < PLAYER.maxThe; i++) g.fillStyle(i < p.the ? 0xf6e7a0 : 0x3a3f48, 1).fillRect(136 + i * 8, 10, 6, 6);
      g.fillStyle(p.the >= PHA_THE_COST ? 0xffc860 : 0x3a3f48, 1).fillRect(136 + PHA_THE_COST * 8 - 2, 17, 1, 3);
    }
    this.hudText.setText(p.herbCap > 0 ? t("hud.herbs", { n: p.herbs, cap: p.herbCap }) : ""); // the pouch appears with the first herb
    const boss = st.boss;
    if (this.bossShown && boss && boss.isAlive()) {
      const ratio = boss.hp / boss.maxHp;
      this.bossTrail = this.bossTrail > ratio ? Math.max(ratio, this.bossTrail - (dtMs / 1000) * 0.35) : ratio;
      const w = 260, x = (VIEW.width - w) / 2, y = VIEW.height - this.stripH - 9;
      this.bossName.setY(y - 20);
      g.fillStyle(PALETTE.panel, 0.8).fillRect(x - 2, y - 2, w + 4, 8);
      g.fillStyle(0x3a2a2a, 1).fillRect(x, y, w, 4);
      g.fillStyle(0xebe6dc, 1).fillRect(x, y, Math.round(w * this.bossTrail), 4);
      g.fillStyle(0x7fa65a, 1).fillRect(x, y, Math.round(w * ratio), 4);
    }
  }
}

const DLG_TOP = 34;

/**
 * Dialogue and choice box (review Phase 1): lines advance with confirm; a choice is a menu (up/down + confirm),
 * and number keys pick an option directly. Sits at the top of the screen, under the HUD bars.
 */
class DialogueBox {
  private i = 0;
  private bg: Phaser.GameObjects.Rectangle;
  private who: Phaser.GameObjects.Text;
  private body: Phaser.GameObjects.Text;
  private more: Phaser.GameObjects.Text;
  private menu: Menu | null = null;
  private shownAt = 0;

  constructor(private scene: Phaser.Scene, private script: Script, private done: (opt: Option | null) => void) {
    // At the top: the action (and here, the fallen boss) is in the bottom lane (ADR-0009), and must stay in view.
    const top = DLG_TOP;
    this.bg = scene.add.rectangle(12, top, VIEW.width - 24, 92, PALETTE.panel, 0.94).setOrigin(0).setDepth(220).setStrokeStyle(1, 0x3a3f48);
    this.who = text(scene, 22, top + 6, "", { color: PALETTE.gold, depth: 221 });
    this.body = text(scene, 22, top + 22, "", { depth: 221, wrap: VIEW.width - 48 });
    this.more = text(scene, VIEW.width - 22, top + 92 - 16, "", { ox: 1, color: PALETTE.dim, depth: 221 });
    this.show();
  }

  private show(): void {
    this.shownAt = this.scene.time.now;
    const line = this.script.lines[this.i];
    this.who.setText(line.who ? t(line.who) : "");
    this.body.setText(t(line.text));
    const last = this.i === this.script.lines.length - 1;
    if (last && this.script.options?.length) {
      this.more.setText("");
      const opts = this.script.options;
      const top = DLG_TOP;
      // the options sit under the question, however many lines it wraps to
      this.menu = new Menu(this.scene, opts.map((o, k) => ({ label: () => `${k + 1}. ${t(o.text)}`, onConfirm: () => this.finish(o) })),
        { x: 40, y: Math.max(top + 44, Math.ceil(this.body.y + this.body.height + 4)), step: 16, depth: 221 });
    } else this.more.setText(t("dlg.next"));
  }

  update(): void {
    // Number keys pick an option directly, from any line of a script that ends in a choice.
    const opts = this.script.options ?? [];
    // A script that ends in a choice opens right after a fight (C2) or mid-scene: the attack key is also confirm, so a
    // player still mashing it must not read past the question or pick an option unseen (bot full run, 2026-11-25).
    // Number keys are a deliberate pick (nobody mashes them in a fight), so they are honoured at once.
    for (let k = 0; k < opts.length; k++) if (input.rawPresses.has(`Digit${k + 1}`) || input.rawPresses.has(`Numpad${k + 1}`)) { this.finish(opts[k]); return; }
    const guard = opts.length ? CHOICE_GUARD_MS : 150;
    if (this.scene.time.now - this.shownAt < guard) { input.consume("confirm"); return; }
    if (this.menu) { this.menu.update(); return; }
    if (input.consume("confirm")) {
      if (this.i < this.script.lines.length - 1) { this.i++; this.show(); }
      else this.finish(null);
    }
  }

  private finish(opt: Option | null): void { this.destroy(); this.done(opt); }
  finishNow(): void { this.finish(null); }

  destroy(): void { this.menu?.destroy(); this.menu = null; this.bg.destroy(); this.who.destroy(); this.body.destroy(); this.more.destroy(); }
}

/** Narration cards: black screen, one centred paragraph at a time, confirm to move on. */
class Narration {
  private i = 0;
  private bg: Phaser.GameObjects.Rectangle;
  private body: Phaser.GameObjects.Text;
  private next: Phaser.GameObjects.Text;
  private shownAt = 0;

  constructor(private scene: Phaser.Scene, private keys: StringKey[], private done: () => void) {
    this.bg = scene.add.rectangle(0, 0, VIEW.width, VIEW.height, 0x05070a, 1).setOrigin(0).setDepth(260);
    this.body = text(scene, VIEW.width / 2, VIEW.height / 2 - 8, "", { ox: 0.5, oy: 0.5, align: "center", depth: 261, wrap: 400, color: PALETTE.text });
    this.next = text(scene, VIEW.width - 18, VIEW.height - 22, "", { ox: 1, depth: 261, color: PALETTE.dim });
    this.show();
  }

  private show(): void {
    this.shownAt = this.scene.time.now;
    this.body.setText(t(this.keys[this.i])).setAlpha(0);
    this.scene.tweens.add({ targets: this.body, alpha: 1, duration: 500 });
    this.next.setText(t("card.next"));
  }

  update(): void {
    if (this.scene.time.now - this.shownAt < 350) { input.consume("confirm"); return; } // no accidental skips
    if (input.consume("confirm")) {
      if (this.i < this.keys.length - 1) { this.i++; this.show(); }
      else { this.destroy(); this.done(); }
    }
  }

  destroy(): void { this.bg.destroy(); this.body.destroy(); this.next.destroy(); }
}
