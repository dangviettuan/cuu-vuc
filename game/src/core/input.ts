/**
 * Input service (review Phase 1): one source of input for every scene, keyboard and gamepad, rebindable.
 *
 * - **Actions, not keys.** Gameplay and menus ask for actions (`light`, `confirm`, …). Each action has keyboard codes
 *   (`KeyboardEvent.code`) and gamepad buttons (W3C "standard" mapping), merged from defaults and the player's
 *   overrides in Settings.
 * - **Presses survive sub-frame taps.** Phaser's JustDown loses a tap that starts and ends within one frame, so key
 *   presses are queued from DOM events. The queue is cleared after each game step, unless a scene asks to keep it
 *   (hit-stop keeps presses for the next simulated frame).
 * - **Gamepads are polled once per step** (before any scene updates); button edges become presses, and the left stick
 *   counts as the d-pad.
 * - **Prompts follow the last device used:** `label("light")` is "J" after keyboard input and "X" after gamepad input.
 * - **Text fields win:** while an HTML input has focus (name entry), keyboard events are ignored.
 */
export type Action =
  | "left" | "right" | "up" | "down"
  | "jump" | "light" | "heavy" | "dodge" | "parry" | "herb" | "interact"
  | "pause" | "confirm" | "cancel" | "debug";

/** Actions the player can rebind in Options (menu and debug keys stay fixed so menus can never be locked out). */
export const REBINDABLE: readonly Action[] = ["jump", "light", "heavy", "dodge", "parry", "herb", "interact"];

export type Device = "keyboard" | "gamepad";
export type KeyMap = Record<Action, string[]>;
export type PadMap = Record<Action, number[]>;
export interface BindingOverrides { keyboard?: Partial<KeyMap>; gamepad?: Partial<PadMap> }

export const DEFAULT_KEYS: KeyMap = {
  left: ["KeyA", "ArrowLeft"], right: ["KeyD", "ArrowRight"], up: ["ArrowUp", "KeyW"], down: ["ArrowDown", "KeyS"],
  jump: ["Space", "KeyW", "ArrowUp"], light: ["KeyJ"], heavy: ["KeyK"], dodge: ["ShiftLeft", "ShiftRight", "KeyL"],
  parry: ["KeyI"], herb: ["KeyQ"], interact: ["KeyE"],
  pause: ["Escape", "KeyP"], confirm: ["Enter", "Space", "KeyJ"], cancel: ["Escape", "Backspace", "KeyK"], debug: ["F1"],
};

/** Standard mapping: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 Back, 9 Start, 12–15 d-pad up/down/left/right. */
export const DEFAULT_PAD: PadMap = {
  left: [14], right: [15], up: [12], down: [13],
  jump: [0], light: [2], heavy: [3], dodge: [1], parry: [5], herb: [4], interact: [7],
  pause: [9], confirm: [0], cancel: [1], debug: [],
};

const PAD_NAMES = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "Back", "Start", "LS", "RS", "↑", "↓", "←", "→", "Home"];
const KEY_NAMES: Record<string, string> = {
  Space: "Space", Enter: "Enter", Escape: "Esc", Backspace: "⌫", ShiftLeft: "Shift", ShiftRight: "Shift R",
  ControlLeft: "Ctrl", ControlRight: "Ctrl R", AltLeft: "Alt", AltRight: "Alt R", Tab: "Tab",
  ArrowLeft: "←", ArrowRight: "→", ArrowUp: "↑", ArrowDown: "↓",
};
export function keyName(code: string): string {
  if (KEY_NAMES[code]) return KEY_NAMES[code];
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return "Num" + code.slice(6);
  return code;
}
export const padName = (b: number): string => PAD_NAMES[b] ?? `B${b}`;

const STICK = 0.5;
/** Keys whose browser default (page scroll, focus moves) must not fire while playing. */
const PREVENT = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", "F1", "Backspace"]);

type Listener = (d: Device) => void;

export class InputService {
  keys: KeyMap = clone(DEFAULT_KEYS);
  pad: PadMap = clone(DEFAULT_PAD);
  device: Device = "keyboard";
  /** Set by a scene for this step to keep presses for the next one (hit-stop). Reset after every step. */
  keepPresses = false;
  private down = new Set<string>();
  private presses = new Set<Action>();
  private padDown = new Set<number>();
  private padPrev = new Set<number>();
  private axes = { x: 0, y: 0 };
  private deviceListeners: Listener[] = [];
  /** While set, the next key or button press is captured for rebinding instead of being handled. */
  private capture: ((d: Device, code: string | number) => void) | null = null;
  /** Every pressed key code since the last step, for text-free menus that need raw keys (e.g. 1/2 shortcuts). */
  readonly rawPresses = new Set<string>();

  constructor() {
    if (typeof window === "undefined") return;
    window.addEventListener("keydown", (e) => this.onKey(e, true), true);
    window.addEventListener("keyup", (e) => this.onKey(e, false), true);
    window.addEventListener("blur", () => { this.down.clear(); this.padDown.clear(); });
  }

  /** Apply the player's overrides on top of the defaults (Settings). */
  setBindings(o: BindingOverrides | undefined): void {
    this.keys = { ...clone(DEFAULT_KEYS), ...(o?.keyboard ?? {}) } as KeyMap;
    this.pad = { ...clone(DEFAULT_PAD), ...(o?.gamepad ?? {}) } as PadMap;
  }

  onDevice(fn: Listener): () => void {
    this.deviceListeners.push(fn);
    return () => { this.deviceListeners = this.deviceListeners.filter((f) => f !== fn); };
  }

  /** Rebinding: the next press on either device is passed to `fn` and not handled as input. */
  captureNext(fn: (d: Device, code: string | number) => void): void { this.capture = fn; }
  cancelCapture(): void { this.capture = null; }
  get capturing(): boolean { return this.capture !== null; }

  /** Pressed since the last step (non-destructive: several systems may read the same press). */
  pressed(a: Action): boolean { return this.presses.has(a); }
  /** Pressed since the last step, and removed so nothing else handles it (menus). */
  consume(a: Action): boolean { const had = this.presses.delete(a); return had; }
  held(a: Action): boolean {
    for (const c of this.keys[a]) if (this.down.has(c)) return true;
    for (const b of this.pad[a]) if (this.padDown.has(b)) return true;
    if (a === "left") return this.axes.x < -STICK;
    if (a === "right") return this.axes.x > STICK;
    if (a === "up") return this.axes.y < -STICK;
    if (a === "down") return this.axes.y > STICK;
    return false;
  }
  clearPresses(): void { this.presses.clear(); this.rawPresses.clear(); }

  /** Prompt label for an action on the current device ("J", "X", "Shift"…). */
  label(a: Action, device: Device = this.device): string {
    if (device === "gamepad") { const b = this.pad[a][0]; return b === undefined ? "—" : padName(b); }
    const c = this.keys[a][0];
    return c === undefined ? "—" : keyName(c);
  }

  /** Called once per game step, before scenes update. */
  poll(): void {
    const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = Array.from(pads).find((p) => p && p.connected && p.mapping === "standard") ?? Array.from(pads).find((p) => p && p.connected);
    this.padPrev = new Set(this.padDown);
    this.padDown.clear();
    this.axes.x = 0; this.axes.y = 0;
    if (!pad) return;
    pad.buttons.forEach((b, i) => { if (b.pressed || b.value > 0.5) this.padDown.add(i); });
    const ax = pad.axes[0] ?? 0, ay = pad.axes[1] ?? 0;
    this.axes.x = Math.abs(ax) > 0.25 ? ax : 0; this.axes.y = Math.abs(ay) > 0.25 ? ay : 0;
    // stick flicks count as d-pad presses, so menus can be driven with the stick
    const prevX = this.stickPrev.x, prevY = this.stickPrev.y;
    const sx = ax < -STICK ? -1 : ax > STICK ? 1 : 0, sy = ay < -STICK ? -1 : ay > STICK ? 1 : 0;
    if (sx && sx !== prevX) this.press(sx < 0 ? "left" : "right", "gamepad");
    if (sy && sy !== prevY) this.press(sy < 0 ? "up" : "down", "gamepad");
    this.stickPrev = { x: sx, y: sy };
    for (const b of this.padDown) {
      if (this.padPrev.has(b)) continue;
      if (this.capture) { const f = this.capture; this.capture = null; f("gamepad", b); continue; }
      for (const a of Object.keys(this.pad) as Action[]) if (this.pad[a].includes(b)) this.press(a, "gamepad");
    }
  }
  private stickPrev = { x: 0, y: 0 };

  /** Called once per game step, after scenes update. */
  endStep(): void {
    if (!this.keepPresses) this.clearPresses();
    this.keepPresses = false;
  }

  private press(a: Action, d: Device): void { this.presses.add(a); this.setDevice(d); }
  private setDevice(d: Device): void {
    if (this.device === d) return;
    this.device = d;
    for (const f of this.deviceListeners) f(d);
  }

  private onKey(e: KeyboardEvent, isDown: boolean): void {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return; // text entry owns the keyboard
    if (isDown) {
      if (e.repeat) { if (PREVENT.has(e.code)) e.preventDefault(); return; }
      if (this.capture) { e.preventDefault(); const f = this.capture; this.capture = null; f("keyboard", e.code); return; }
      this.down.add(e.code);
      this.rawPresses.add(e.code);
      for (const a of Object.keys(this.keys) as Action[]) if (this.keys[a].includes(e.code)) this.press(a, "keyboard");
      this.setDevice("keyboard");
      if (PREVENT.has(e.code)) e.preventDefault();
    } else this.down.delete(e.code);
  }
}

function clone<T>(o: T): T { return JSON.parse(JSON.stringify(o)) as T; }

/** The game-wide instance. */
export const input = new InputService();
