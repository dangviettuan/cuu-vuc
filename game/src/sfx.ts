/**
 * Placeholder sound effects, synthesised with Web Audio (no asset files).
 * Playtest I-16: without audio, hit-stop reads as lag and telegraphs are visual-only.
 * Every sound is short and cheap; real SFX can replace these one call at a time.
 *
 * The AudioContext is created on the first key press (browsers require a user gesture).
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let lastStep = 0;
/** Mix level at full volume; the player's volume setting (0–1) scales it. */
const MASTER = 0.4;
let volume = 0.8;
export function setVolume(v: number): void { volume = Math.max(0, Math.min(1, v)); if (master) master.gain.value = MASTER * volume; }

const unlockListeners: ((c: AudioContext) => void)[] = [];
/** The shared AudioContext once a user gesture has created it (music uses it too), else null. */
export function audioContext(): AudioContext | null { return ctx; }
/** One second of white noise, shared by effects and the music's wind layer. */
export function noiseBuffer(): AudioBuffer | null { return noiseBuf; }
/** Called once, when the first user gesture creates the AudioContext (immediately if it already exists). */
export function onAudioUnlock(fn: (c: AudioContext) => void): void { if (ctx) fn(ctx); else unlockListeners.push(fn); }

export function unlockAudio(): void {
  if (ctx) { if (ctx.state === "suspended") void ctx.resume(); return; }
  try {
    ctx = new AudioContext();
    master = ctx.createGain(); master.gain.value = MASTER * volume; master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch { ctx = null; return; }
  for (const f of unlockListeners.splice(0)) f(ctx);
}

function env(g: GainNode, t: number, a: number, peak: number, dur: number): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function tone(type: OscillatorType, f0: number, f1: number, dur: number, peak = 0.5, delay = 0): void {
  if (!ctx || !master) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  env(g, t, 0.005, peak, dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
}

function noise(filter: BiquadFilterType, f0: number, f1: number, dur: number, peak = 0.4, q = 1, delay = 0): void {
  if (!ctx || !master || !noiseBuf) return;
  const t = ctx.currentTime + delay, s = ctx.createBufferSource(), bq = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; bq.type = filter; bq.Q.value = q;
  bq.frequency.setValueAtTime(f0, t); bq.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  env(g, t, 0.004, peak, dur);
  s.connect(bq).connect(g).connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}

export const sfx = {
  swing(level: number): void { noise("bandpass", 900 + level * 300, 2600, 0.09 + level * 0.03, 0.22 + level * 0.06, 1.2); },
  hit(strength: number): void { tone("sine", 140, 55, 0.12 + strength * 0.002, 0.55); noise("lowpass", 2400, 400, 0.06, 0.3); },
  parry(): void { tone("triangle", 1850, 1700, 0.32, 0.35); tone("sine", 2780, 2600, 0.26, 0.18); noise("highpass", 4000, 6000, 0.04, 0.25); },
  /** Menu cursor move, and a menu choice. */
  ui(): void { tone("triangle", 660, 660, 0.05, 0.12); },
  uiConfirm(): void { tone("triangle", 880, 1320, 0.09, 0.15); },
  /** Blocked hit: a dull wooden-metal knock, lower and shorter than the parry ring. */
  block(): void { tone("triangle", 620, 480, 0.12, 0.3); noise("bandpass", 1400, 700, 0.07, 0.3, 2); },
  guardBreak(): void { tone("square", 220, 70, 0.22, 0.22); noise("lowpass", 1800, 200, 0.16, 0.35); },
  phaThe(): void { tone("sawtooth", 180, 90, 0.2, 0.2); tone("triangle", 1500, 1300, 0.25, 0.2, 0.05); },
  hurt(): void { tone("square", 160, 90, 0.14, 0.18); noise("lowpass", 1200, 300, 0.1, 0.3); },
  dodge(): void { noise("highpass", 600, 2400, 0.16, 0.18, 0.7); },
  step(): void {
    if (!ctx || ctx.currentTime - lastStep < 0.12) return;
    lastStep = ctx.currentTime; noise("lowpass", 700, 300, 0.03, 0.08);
  },
  land(): void { tone("sine", 110, 60, 0.09, 0.3); noise("lowpass", 900, 200, 0.06, 0.15); },
  jump(): void { noise("bandpass", 500, 1100, 0.06, 0.08, 1); },
  pickup(): void { tone("triangle", 880, 880, 0.09, 0.2); tone("triangle", 1320, 1320, 0.14, 0.2, 0.08); },
  shrine(): void { [523, 659, 784].forEach((f, i) => tone("sine", f, f, 0.9, 0.15, i * 0.06)); },
  heal(): void { tone("sine", 600, 900, 0.25, 0.18); },
  /** Telegraph cues: each attack has its own warning so it can be learned by ear. */
  tellCharge(): void { tone("sawtooth", 70, 95, 0.45, 0.16); noise("lowpass", 300, 500, 0.4, 0.15); },
  tellSwipe(): void { tone("triangle", 1300, 2100, 0.18, 0.12); },
  tellStomp(): void { tone("sine", 55, 45, 0.35, 0.3); noise("lowpass", 200, 120, 0.3, 0.15); },
  tellBoar(): void { noise("bandpass", 1200, 2400, 0.12, 0.12, 4); },
  stomp(): void { tone("sine", 70, 30, 0.35, 0.7); noise("lowpass", 600, 80, 0.3, 0.4); },
  roots(): void { noise("bandpass", 1800, 900, 0.08, 0.25, 3); },
  roar(): void { tone("sawtooth", 110, 60, 0.7, 0.25); noise("bandpass", 500, 250, 0.6, 0.2, 2); },
  death(): void { tone("triangle", 330, 110, 0.8, 0.25); },
  bossDown(): void { tone("sawtooth", 90, 40, 1.2, 0.25); },
  // ---- the village scenes (Prologue S4–S6)
  /** His heart, and the Mạch Ấn beating with it (S5): lub-dub, low. */
  heartbeat(): void { tone("sine", 62, 40, 0.16, 0.7); tone("sine", 58, 38, 0.14, 0.5, 0.2); },
  /** A bird's beak on his hand (S4). */
  peck(): void { noise("highpass", 3200, 4200, 0.03, 0.3); tone("triangle", 2400, 1800, 0.05, 0.12); },
  bark(): void { noise("bandpass", 700, 500, 0.09, 0.18, 3); noise("bandpass", 650, 480, 0.08, 0.14, 3, 0.16); },
  door(): void { tone("sawtooth", 180, 140, 0.5, 0.05); noise("bandpass", 600, 400, 0.4, 0.08, 6); },
  bolt(): void { tone("triangle", 300, 220, 0.06, 0.3); noise("lowpass", 1500, 400, 0.06, 0.25); },
  /** Wood under weight: the door, the bed pushed, the bamboo frame. */
  creak(): void { tone("sawtooth", 140, 110, 0.6, 0.06); noise("bandpass", 420, 300, 0.5, 0.07, 8); },
  board(): void { tone("triangle", 220, 120, 0.1, 0.35); noise("lowpass", 1200, 300, 0.12, 0.3); },
  crash(): void { noise("lowpass", 2200, 150, 0.7, 0.45); tone("sine", 90, 40, 0.5, 0.4); },
  /** The long sound from the forest (S5): "Không giống tiếng thú. Cũng không giống gió." Low, far, the windows hum. */
  far(): void { tone("sawtooth", 48, 42, 2.6, 0.12); tone("sine", 96, 84, 2.4, 0.08, 0.1); noise("lowpass", 160, 90, 2.4, 0.12); },
  /** Silence falling (the dogs stop): nothing to play; the cue is there so scripts read as written. */
  hush(): void {},
};
