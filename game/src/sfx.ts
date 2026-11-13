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

export function unlockAudio(): void {
  if (ctx) { if (ctx.state === "suspended") void ctx.resume(); return; }
  try {
    ctx = new AudioContext();
    master = ctx.createGain(); master.gain.value = 0.32; master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch { ctx = null; }
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
};
