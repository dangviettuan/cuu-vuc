/**
 * Frame-timed animation controller.
 *
 * Why not Phaser's AnimationManager for characters: combat needs per-frame durations, frame tags
 * ("windup" / "active" / "recovery") that gameplay can read, named events on exact frames, clip
 * priorities so low-priority clips cannot interrupt critical ones, and freezing during hit-stop
 * (the controller only advances when the scene gives it simulation time).
 * Presentation only: gameplay state machines decide *what* to play; this decides *how*.
 */
import Phaser from "phaser";

export interface Frame {
  key: string; // texture key
  ms: number; // duration at timeScale 1
  tag?: string; // gameplay-readable phase (e.g. "windup" | "active" | "recovery")
  event?: string; // fired once when the frame is entered
}

export interface Clip {
  name: string;
  frames: Frame[];
  loop?: boolean;
  priority: number;
}

/** Clip priorities: a playing clip can only be replaced by an equal or higher priority clip unless it has finished. */
export const PRI = { LOCO: 0, SETTLE: 1, ACTION: 2, HURT: 3, DEAD: 4 } as const;

export function clip(name: string, frames: Frame[], priority: number = PRI.LOCO, loop = false): Clip {
  return { name, frames, priority, loop };
}

/** Evenly timed looping clip. */
export function loop(name: string, keys: string[], ms: number, priority: number = PRI.LOCO, events: Record<number, string> = {}): Clip {
  return clip(name, keys.map((key, i) => ({ key, ms, event: events[i] })), priority, true);
}

/** Split a phase duration across frames by weight (keeps gameplay timings exact). */
export function phase(total: number, tag: string, frames: [string, number, string?][]): Frame[] {
  const sum = frames.reduce((s, f) => s + f[1], 0);
  let used = 0;
  return frames.map(([key, w, event], i) => {
    const ms = i === frames.length - 1 ? total - used : Math.max(1, Math.round((total * w) / sum));
    used += ms;
    return { key, ms, tag, event };
  });
}

export class Animator {
  current: Clip | null = null;
  index = 0;
  finished = false;
  timeScale = 1;
  /** Milliseconds elapsed in the current clip (scaled). */
  elapsed = 0;
  private t = 0;

  constructor(private sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, private onEvent: (e: string) => void = () => {}) {}

  get name(): string { return this.current?.name ?? ""; }
  get tag(): string | undefined { return this.current?.frames[this.index].tag; }
  get frameKey(): string { return this.current?.frames[this.index].key ?? ""; }
  get total(): number { return this.current ? this.current.frames.reduce((s, f) => s + f.ms, 0) : 0; }
  /** Elapsed ms within the run of frames sharing the current tag, and that run's length. */
  tagProgress(): { t: number; len: number } {
    const c = this.current;
    if (!c) return { t: 0, len: 0 };
    const tag = c.frames[this.index].tag;
    let start = this.index, end = this.index;
    while (start > 0 && c.frames[start - 1].tag === tag) start--;
    while (end < c.frames.length - 1 && c.frames[end + 1].tag === tag) end++;
    let t = this.t, len = 0;
    for (let i = start; i <= end; i++) { len += c.frames[i].ms; if (i < this.index) t += c.frames[i].ms; }
    return { t, len };
  }

  /**
   * Request a clip. Returns false if refused because a higher-priority clip is still running.
   * The same clip is not restarted unless `restart` is true (prevents flicker from per-frame requests).
   */
  play(c: Clip, restart = false, force = false): boolean {
    if (this.current === c && !restart && !this.finished) return true;
    if (this.current === c && !restart && this.finished && !c.loop) return true;
    if (!force && this.current && !this.finished && this.current.priority > c.priority) return false;
    this.current = c; this.index = 0; this.t = 0; this.elapsed = 0; this.finished = false;
    this.apply(true);
    return true;
  }

  update(dt: number): void {
    const c = this.current;
    if (!c || dt <= 0 || (this.finished && !c.loop)) return;
    this.t += dt * this.timeScale;
    this.elapsed += dt * this.timeScale;
    let changed = false;
    while (this.t >= c.frames[this.index].ms) {
      this.t -= c.frames[this.index].ms;
      if (this.index + 1 >= c.frames.length) {
        if (c.loop) { this.index = 0; this.elapsed = this.t; }
        else { this.finished = true; this.t = 0; break; }
      } else this.index++;
      changed = true;
      this.fire();
    }
    if (changed) this.apply(false);
  }

  private apply(fireFirst: boolean): void {
    const key = this.current!.frames[this.index].key;
    if (this.sprite.texture.key !== key) this.sprite.setTexture(key);
    if (fireFirst) this.fire();
  }

  private fire(): void {
    const e = this.current!.frames[this.index].event;
    if (e) this.onEvent(e);
  }
}
