/**
 * Placeholder music, synthesised at runtime with Web Audio (no asset files), like the sound effects (src/sfx.ts).
 * It is there so the slice has a tone at all (review §4: "a story-first game with no music is missing half its
 * tone"); composed music replaces it track by track.
 *
 * The material is Vietnamese pentatonic (ngũ cung):
 * - **Bắc** (D E G A B), bright: the morning forest, home, the title.
 * - **Oán** (D F G A C), mournful: the afternoon that goes wrong (dusk), the night at home (indoor), the night village,
 *   the fight with Nanh Rễ, the aftermath.
 * Plucked phrases imitate a đàn tranh, with an occasional bent note (nhấn); the fight adds a trống pulse and a mõ.
 *
 * Each track is a generator that schedules notes a little ahead of time (Web Audio's clock, not the game's, so
 * hit-stop never stutters the music). Changing track crossfades. Phrases come from a seeded RNG per track.
 */
import { audioContext, noiseBuffer, onAudioUnlock } from "./sfx";
import { Rng } from "./core/rng";

export type Track = "title" | "forest" | "home" | "dusk" | "indoor" | "night" | "boss" | "aftermath";

const D2 = 73.42;
const semis = (n: number) => D2 * Math.pow(2, n / 12);
/** Scale degrees as semitones above D. */
const BAC = [0, 2, 5, 7, 9];
const OAN = [0, 3, 5, 7, 10];
/** Note `i` of a pentatonic scale, counted from D2 (i = 5 is the octave). */
const note = (scale: number[], i: number) => semis(scale[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5));

/** Mix level at full volume; the player's music setting (0–1) scales it. */
const MIX = 0.9;
let musicVolume = 0.6;
let duck = 1;
let out: GainNode | null = null;
let wanted: { track: Track; intensity: number } | null = null;

interface Runner {
  track: Track;
  gain: GainNode;
  next: number;
  step: number;
  intensity: number;
  rng: Rng;
  layers: AudioScheduledSourceNode[];
  /** Schedules from `t`, returns the time of its next event. */
  gen: (r: Runner, t: number) => number;
  stopAt: number;
}

let current: Runner | null = null;
const fading: Runner[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

/* ------------------------------------------------------------ instruments */

function voice(r: Runner, t: number, dur: number, peak: number): GainNode {
  const c = audioContext()!, g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(r.gain);
  return g;
}

/** A plucked string (đàn tranh-like): triangle plus a quiet octave, fast decay, sometimes a bend (nhấn). */
function pluck(r: Runner, f: number, t: number, peak = 0.16, dur = 1.6, bend = 0): void {
  const c = audioContext()!, g = voice(r, t, dur, peak), lp = c.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(900, t + dur);
  lp.connect(g);
  for (const [type, mul, lvl] of [["triangle", 1, 1], ["sine", 2, 0.25]] as const) {
    const o = c.createOscillator(), og = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f * mul, t);
    if (bend) { o.frequency.setValueAtTime(f * mul, t + 0.18); o.frequency.exponentialRampToValueAtTime(f * mul * Math.pow(2, bend / 12), t + 0.42); o.frequency.exponentialRampToValueAtTime(f * mul, t + 0.7); }
    og.gain.value = lvl; o.connect(og).connect(lp); o.start(t); o.stop(t + dur + 0.05);
  }
}

/** Trống (a low drum): a falling sine and a soft noise thump. */
function drum(r: Runner, t: number, peak = 0.5): void {
  const c = audioContext()!, g = voice(r, t, 0.42, peak), o = c.createOscillator();
  o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.3);
  o.connect(g); o.start(t); o.stop(t + 0.45);
  noiseHit(r, t, 500, 0.05, peak * 0.35, "lowpass");
}

/** Mõ (wooden block): a short, pitched knock. */
function mo(r: Runner, t: number, peak = 0.12): void {
  const c = audioContext()!, g = voice(r, t, 0.07, peak), o = c.createOscillator();
  o.type = "sine"; o.frequency.setValueAtTime(1350, t); o.frequency.exponentialRampToValueAtTime(1100, t + 0.05);
  o.connect(g); o.start(t); o.stop(t + 0.08);
}

function noiseHit(r: Runner, t: number, f: number, dur: number, peak: number, type: BiquadFilterType): void {
  const c = audioContext()!, buf = noiseBuffer(); if (!buf) return;
  const s = c.createBufferSource(), bq = c.createBiquadFilter(), g = voice(r, t, dur, peak);
  s.buffer = buf; bq.type = type; bq.frequency.value = f; s.connect(bq).connect(g); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}

/** A low bass note (filtered sawtooth) for the fight's ostinato. */
function bass(r: Runner, f: number, t: number, dur: number, peak = 0.12): void {
  const c = audioContext()!, g = voice(r, t, dur, peak), o = c.createOscillator(), lp = c.createBiquadFilter();
  o.type = "sawtooth"; o.frequency.value = f; lp.type = "lowpass"; lp.frequency.value = 420;
  o.connect(lp).connect(g); o.start(t); o.stop(t + dur + 0.05);
}

/** Continuous layers: a drone (root and fifth, slowly breathing) and wind (band-passed noise). */
function drone(r: Runner, f: number, level: number): void {
  const c = audioContext()!;
  for (const [mul, lvl] of [[1, 1], [1.5, 0.55]] as const) {
    const o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = "sine"; o.frequency.value = f * mul; g.gain.value = level * lvl;
    lfo.frequency.value = 0.07 + r.rng.next() * 0.05; lg.gain.value = level * lvl * 0.4;
    lfo.connect(lg).connect(g.gain); o.connect(g).connect(r.gain);
    o.start(); lfo.start(); r.layers.push(o, lfo);
  }
}
function wind(r: Runner, level: number): void {
  const c = audioContext()!, buf = noiseBuffer(); if (!buf) return;
  const s = c.createBufferSource(), bq = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
  s.buffer = buf; s.loop = true; bq.type = "bandpass"; bq.frequency.value = 500; bq.Q.value = 0.8; g.gain.value = level;
  lfo.frequency.value = 0.05; lg.gain.value = 260; lfo.connect(lg).connect(bq.frequency);
  s.connect(bq).connect(g).connect(r.gain); s.start(); lfo.start(); r.layers.push(s, lfo);
}

/* ------------------------------------------------------------ tracks */

/** A pentatonic phrase of 3–6 notes, mostly stepwise, then a rest. */
function phrase(r: Runner, t: number, scale: number[], lo: number, span: number, gap: [number, number], peak: number, step: [number, number]): number {
  const n = 3 + Math.floor(r.rng.next() * 4);
  let i = lo + Math.floor(r.rng.next() * span);
  for (let k = 0; k < n; k++) {
    const bend = k === n - 1 && r.rng.next() < 0.35 ? 2 : 0;
    pluck(r, note(scale, i), t, peak * (k === 0 ? 1 : 0.8), 1.8, bend);
    t += step[0] + r.rng.next() * (step[1] - step[0]);
    i = Math.max(lo, Math.min(lo + span, i + (r.rng.next() < 0.75 ? (r.rng.next() < 0.5 ? -1 : 1) : (r.rng.next() < 0.5 ? -2 : 2))));
  }
  return t + gap[0] + r.rng.next() * (gap[1] - gap[0]);
}

const TRACKS: Record<Track, { start: (r: Runner) => void; gen: Runner["gen"] }> = {
  title: { start: (r) => { drone(r, D2, 0.05); wind(r, 0.02); }, gen: (r, t) => phrase(r, t, BAC, 10, 6, [3, 6], 0.13, [0.45, 0.8]) },
  forest: { start: (r) => { drone(r, D2, 0.04); wind(r, 0.025); }, gen: (r, t) => phrase(r, t, BAC, 10, 7, [2.5, 5.5], 0.12, [0.28, 0.55]) },
  home: { start: (r) => { drone(r, D2 * 2, 0.03); }, gen: (r, t) => phrase(r, t, BAC, 10, 5, [4, 8], 0.1, [0.4, 0.7]) },
  dusk: { start: (r) => { drone(r, D2, 0.045); wind(r, 0.015); }, gen: (r, t) => phrase(r, t, OAN, 9, 5, [3.5, 7], 0.1, [0.7, 1.3]) },
  indoor: { start: (r) => { drone(r, D2 * 2, 0.025); }, gen: (r, t) => { pluck(r, note(OAN, 8 + Math.floor(r.rng.next() * 5)), t, 0.07, 2.8); return t + 4 + r.rng.next() * 4; } },
  night: { start: (r) => { drone(r, D2, 0.06); wind(r, 0.04); }, gen: (r, t) => phrase(r, t, OAN, 7, 6, [4, 8], 0.11, [0.5, 0.9]) },
  aftermath: { start: (r) => { drone(r, D2, 0.05); }, gen: (r, t) => { pluck(r, note(OAN, 10 + Math.floor(r.rng.next() * 5)), t, 0.09, 2.6); return t + 3 + r.rng.next() * 3; } },
  /** 104 BPM, 16 sixteenth-note steps per bar. Intensity follows her phase: 1 pulse, 2 adds mõ and lead, 3 doubles. */
  boss: {
    start: (r) => { drone(r, D2, 0.045); },
    gen: (r, t) => {
      const s = r.step % 16, k = r.intensity;
      if (s === 0 || s === 6 || s === 10 || (k >= 2 && s === 14) || (k >= 3 && s === 3)) drum(r, t, s === 0 ? 0.5 : 0.36);
      if (k >= 2 && (s === 4 || s === 12)) mo(r, t);
      if (k >= 3 && s % 2 === 1) mo(r, t, 0.06);
      const BASS = [0, 0, 3, 5, 0, 0, 4, 2]; // oán degrees per eighth note
      if (s % 2 === 0) bass(r, note(OAN, 5 + BASS[(s / 2) | 0]), t, 0.22, 0.1);
      if (k >= 2 && s === 8 && r.rng.next() < 0.6) phrase(r, t, OAN, 12, 5, [0, 0], 0.09, [0.14, 0.29]);
      r.step++;
      return t + 60 / 104 / 4;
    },
  },
};

/* ------------------------------------------------------------ control */

function tick(): void {
  const c = audioContext(); if (!c) return;
  const horizon = c.currentTime + 0.3;
  for (const r of [current, ...fading]) {
    if (!r) continue;
    while (r.next < horizon && (r.stopAt === 0 || r.next < r.stopAt)) r.next = r.gen(r, Math.max(r.next, c.currentTime + 0.02));
  }
  for (let i = fading.length - 1; i >= 0; i--) {
    const r = fading[i];
    if (c.currentTime > r.stopAt + 0.1) { r.layers.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } }); r.gain.disconnect(); fading.splice(i, 1); }
  }
}

function ensureOut(c: AudioContext): GainNode {
  if (!out) { out = c.createGain(); out.gain.value = MIX * musicVolume * duck; out.connect(c.destination); }
  if (!timer) timer = setInterval(tick, 50);
  return out;
}

function start(track: Track, intensity: number): void {
  const c = audioContext(); if (!c) return;
  const o = ensureOut(c), now = c.currentTime;
  if (current) fadeOut(current, 1.4);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(1, now + 1.6); g.connect(o);
  const r: Runner = { track, gain: g, next: now + 0.3, step: 0, intensity, rng: new Rng(track.length * 7919 + 17), layers: [], gen: TRACKS[track].gen, stopAt: 0 };
  TRACKS[track].start(r);
  current = r;
}

function fadeOut(r: Runner, sec: number): void {
  const c = audioContext()!, now = c.currentTime;
  r.gain.gain.cancelScheduledValues(now); r.gain.gain.setValueAtTime(Math.max(0.0001, r.gain.gain.value), now);
  r.gain.gain.exponentialRampToValueAtTime(0.0001, now + sec);
  r.stopAt = now + sec;
  fading.push(r);
  if (current === r) current = null;
}

export const music = {
  /** Switch to a track (crossfade). Before audio is unlocked, it starts with the first key press. */
  play(track: Track, intensity = 1): void {
    wanted = { track, intensity };
    if (current?.track === track) { current.intensity = intensity; return; }
    if (audioContext()) start(track, intensity);
  },
  /** Raise or lower the current track's intensity (the fight follows Nanh Rễ's phase). */
  setIntensity(n: number): void { if (wanted) wanted.intensity = n; if (current) current.intensity = n; },
  stop(sec = 1.4): void { wanted = null; if (current && audioContext()) fadeOut(current, sec); },
  /** Lowers the music under menus. */
  duck(on: boolean): void { duck = on ? 0.35 : 1; if (out) out.gain.setTargetAtTime(MIX * musicVolume * duck, audioContext()!.currentTime, 0.15); },
  get track(): Track | null { return current?.track ?? null; },
};

export function setMusicVolume(v: number): void {
  musicVolume = Math.max(0, Math.min(1, v));
  const c = audioContext();
  if (out && c) out.gain.setTargetAtTime(MIX * musicVolume * duck, c.currentTime, 0.1);
}

onAudioUnlock(() => { if (wanted && !current) start(wanted.track, wanted.intensity); });
