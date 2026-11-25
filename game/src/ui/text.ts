import Phaser from "phaser";

/**
 * Text in the game's pixel font: VT323 (SIL OFL 1.1, public/fonts/), chosen for its full Vietnamese coverage
 * (stacked diacritics: ặ, ẩ, ữ…). Loaded in Boot before any text is drawn.
 *
 * VT323 is drawn on a pixel grid; at `size` 16 (and multiples) its pixels land on screen pixels, so text stays crisp
 * at the 480×270 view with nearest-neighbour scaling. Sizes: 16 for body text and the HUD, 32 for titles.
 */
export const FONT = "VT323";
export const PALETTE = {
  text: "#ebe6dc",
  dim: "#9aa1ad",
  gold: "#f6e7a0",
  accent: "#ffc860",
  dark: "#0b0d11",
  panel: 0x0b0d11,
} as const;

export interface TextOpts {
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  /** Origin: 0 = left/top, 0.5 = centre, 1 = right/bottom. */
  ox?: number;
  oy?: number;
  /** Background panel colour (CSS) with padding, for toasts and signs. */
  bg?: string;
  pad?: number;
  /** Wrap width in px. */
  wrap?: number;
  depth?: number;
  /** Screen-fixed (HUD) rather than placed in the world. */
  fixed?: boolean;
}

export function text(scene: Phaser.Scene, x: number, y: number, s: string, o: TextOpts = {}): Phaser.GameObjects.Text {
  const style: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: `${FONT}, monospace`,
    fontSize: `${o.size ?? 16}px`,
    color: o.color ?? PALETTE.text,
    align: o.align ?? "left",
    lineSpacing: -2,
    // Phaser sizes the text box from this sample's ascent; capitals with stacked Vietnamese marks (Ễ, Ặ, Ữ) reach
    // higher than its default "|MÉqgy", and their top marks were clipped (seen on the boss name "NANH RỄ").
    testString: "|MÉqgyỄẶỮ",
  };
  if (o.bg) { style.backgroundColor = o.bg; style.padding = { x: o.pad ?? 4, y: Math.max(1, (o.pad ?? 4) - 2) }; }
  if (o.wrap) style.wordWrap = { width: o.wrap, useAdvancedWrap: true };
  const t = scene.add.text(Math.round(x), Math.round(y), s, style).setOrigin(o.ox ?? 0, o.oy ?? 0);
  if (o.depth !== undefined) t.setDepth(o.depth);
  if (o.fixed) t.setScrollFactor(0);
  return t;
}

/** Waits until the pixel font is usable (it is loaded from public/fonts by a CSS @font-face in index.html). */
export async function loadFont(): Promise<void> {
  try {
    await document.fonts.load(`16px ${FONT}`, "Cửu Vực ặẩữ");
  } catch { /* falls back to monospace */ }
}
