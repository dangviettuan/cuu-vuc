/**
 * Bot player: a scripted "human" that reads the screen (read-only snapshots) and presses real keys.
 * Policy is deliberately human-like:
 *  - Learned timings (it presses parry at the *end* of a telegraph it has learned, not on the frame the
 *    attack starts) — but its reaction to positions is ~10–30 ms (polling), faster than a human.
 *  - It never writes game state.
 * Every encounter outcome is logged so the report can quote rates, not anecdotes.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeBot(h) {
  const log = { boar: [], boss: [], damage: [], deaths: 0, heals: 0, phaseTimes: {} };
  let held = null;
  const hold = async (k) => { if (held === k) return; if (held) await h.up(held); held = k; if (k) await h.down(k); };
  const snap = () => h.snap();
  const half = { boar: 13, boss: 33 };
  const gap = (s, ex, hw) => (ex > s.p.x ? (ex - hw) - (s.p.x + 5) : (s.p.x - 5) - (ex + hw));
  const towardKey = (s, ex) => (ex > s.p.x ? "d" : "a");
  let lastHp = null;
  const track = (s, ctx) => {
    if (lastHp !== null && s.p.hp < lastHp) log.damage.push({ amount: lastHp - s.p.hp, ctx, pState: s.p.state, boss: s.boss && s.boss.state, boars: s.boars.map((b) => b.state), roots: s.roots.length });
    if (lastHp !== null && lastHp > 0 && s.p.hp === 0) log.deaths++;
    lastHp = s.p.hp;
  };

  async function moveTo(x, tol = 5, maxMs = 30000) {
    const t0 = Date.now();
    for (;;) {
      const s = await snap(); track(s, "move");
      if (Math.abs(x - s.p.x) <= tol || Date.now() - t0 > maxMs) { await hold(null); return s; }
      await hold(x > s.p.x ? "d" : "a"); await sleep(10);
    }
  }
  async function face(s, ex) { const want = ex > s.p.x ? 1 : -1; if (s.p.facing !== want) { await h.tap(want > 0 ? "d" : "a", 18); } }
  async function heal(s) { if (s.p.herbs > 0 && s.p.hp < 100) { await hold(null); await h.tap("q", 40); log.heals++; await sleep(450); } }

  /** Boar: bait a charge from ~110 px, then parry (→ riposte) or dodge-through (→ combo on stun). */
  async function fightBoar(target, mode = "parry", maxMs = 40000) {
    const t0 = Date.now(); let ev = null;
    for (;;) {
      const s = await snap(); track(s, "boar");
      const b = s.boars.find((x) => Math.abs(x.x - target) < 400 && x.alive);
      if (!b) { await hold(null); return true; }
      if (s.p.hp === 0 || Date.now() - t0 > maxMs) { await hold(null); return false; }
      target = b.x;
      const g = gap(s, b.x, half.boar), coming = b.state === "charge" && (b.x > s.p.x ? -1 : 1) === b.facing;
      if (s.p.hp < 45 && b.state !== "charge" && g > 70) { await heal(s); continue; }
      if (coming && g < (mode === "parry" ? 24 : 20)) {
        await hold(null);
        const hp0 = s.p.hp;
        if (mode === "parry") {
          await h.tap("i", 35); await sleep(180); // human-ish delay before the riposte press
          const s2 = await snap(); const parried = s2.p.the > s.p.the || s2.p.anim === "parry";
          await h.tap("j", 35); await sleep(420);
          const s3 = await snap(); track(s3, "boar");
          const b3 = s3.boars.find((x) => Math.abs(x.x - b.x) < 120);
          log.boar.push({ mode, parried, riposte: true, hit: s3.p.hp < hp0, boarHpAfter: b3 ? b3.hp : 0 });
        } else {
          await h.down(towardKey(s, b.x)); await h.tap("Shift", 35); await h.up(towardKey(s, b.x)); await sleep(260);
          let s2 = await snap(); track(s2, "boar");
          const hitDuring = s2.p.hp < hp0;
          let b2 = s2.boars.find((x) => Math.abs(x.x - b.x) < 160);
          let dealt = 0;
          if (b2 && b2.state === "stun") { // punish
            for (let i = 0; i < 40; i++) { s2 = await snap(); b2 = s2.boars.find((x) => Math.abs(x.x - b.x) < 160); if (!b2 || b2.state !== "stun") break; if (gap(s2, b2.x, half.boar) < 30) break; await hold(towardKey(s2, b2.x)); await sleep(10); }
            await hold(null);
            if (b2) { await face(s2, b2.x); const hpB = b2.hp; for (let k = 0; k < 3; k++) { await h.tap("j", 35); await sleep(190); } const s3 = await snap(); const b3 = s3.boars.find((x) => Math.abs(x.x - b2.x) < 160); dealt = hpB - (b3 ? b3.hp : 0); }
          }
          log.boar.push({ mode, hitDuringDodge: hitDuring, punishDealt: dealt });
        }
        continue;
      }
      // keep ~110 px so it notices (170 px) and charges
      const want = b.x - (b.x > s.p.x ? 110 : -110);
      if (b.state !== "charge" && Math.abs(s.p.x - want) > 16) await hold(s.p.x < want ? "d" : "a"); else await hold(null);
      await sleep(10);
    }
  }

  /** Boss policy. tactics.charge: "dodge" | "jump". Returns "won" | "died" | "timeout". */
  async function fightBoss({ chargeTactic = "dodge", maxMs = 240000, onPhase } = {}) {
    const t0 = Date.now(); let prev = null, tState = 0, phase = 1;
    const ev = (o) => log.boss.push({ t: Math.round((Date.now() - t0) / 100) / 10, phase, ...o });
    // learned telegraph lengths (ms) per phase: swipe windup = 450 × k, k = 1 / 0.8 / 0.7
    const k = () => (phase === 1 ? 1 : phase === 2 ? 0.8 : 0.7);
    for (;;) {
      const s = await snap(); track(s, "boss");
      const B = s.boss;
      if (s.choosing || (B && B.state === "down")) { await hold(null); return "won"; }
      if (s.p.hp === 0) { await hold(null); ev({ kind: "death" }); return "died"; }
      if (Date.now() - t0 > maxMs) { await hold(null); return "timeout"; }
      if (!B) { await sleep(20); continue; }
      if (B.phase !== phase) { phase = B.phase; log.phaseTimes[phase] = Math.round((Date.now() - t0) / 1000); onPhase && onPhase(phase); }
      if (B.state !== prev) { tState = Date.now(); prev = B.state; }
      const g = gap(s, B.x, half.boss), dirKey = towardKey(s, B.x), awayKey = dirKey === "d" ? "a" : "d";

      // 1) roots under / near me → get out (dodge away from the boss, keep running)
      const danger = s.roots.filter((r) => r.warnLeft > -40 && Math.abs(r.x - s.p.x) < 22);
      if (danger.length) {
        const left = s.roots.filter((r) => r.x < s.p.x).length, right = s.roots.length - left;
        const esc = left > right ? "d" : "a";
        const hp0 = s.p.hp;
        await hold(esc); await h.tap("Shift", 35); await sleep(380); await hold(null);
        const s2 = await snap(); track(s2, "boss");
        ev({ kind: "roots", avoided: s2.p.hp >= hp0, n: s.roots.length });
        continue;
      }
      // 2) charge coming
      if (B.state === "charge" && (B.x > s.p.x ? -1 : 1) === B.facing && g < 34) {
        await hold(null); const hp0 = s.p.hp;
        if (chargeTactic === "jump") await h.tap("Space", 350);
        else { await h.down(dirKey); await h.tap("Shift", 35); await h.up(dirKey); }
        await sleep(420);
        const s2 = await snap(); track(s2, "boss");
        ev({ kind: "charge", tactic: chargeTactic, avoided: s2.p.hp >= hp0 });
        continue;
      }
      // 3) swipe telegraph → parry at the learned moment, then riposte + combo during the stagger
      if (B.state === "tSwipe" && g < 60) {
        await hold(null);
        const wait = 450 * k() - (Date.now() - tState) - 40;
        if (wait > 0) await sleep(wait);
        const hp0 = s.p.hp; const the0 = s.p.the;
        await face(s, B.x); await h.tap("i", 35); await sleep(200);
        let s2 = await snap(); track(s2, "boss");
        const parried = s2.p.the > the0 || (s2.boss && s2.boss.state === "stagger");
        let dealt = 0;
        if (parried) {
          const hpB = s2.boss.hp;
          await h.tap("j", 35); await sleep(380); // riposte
          for (let i = 0; i < 3; i++) { await h.tap("j", 35); await sleep(200); }
          s2 = await snap(); track(s2, "boss"); dealt = hpB - s2.boss.hp;
        }
        ev({ kind: "swipe", parried, hit: s2.p.hp < hp0, dealt });
        continue;
      }
      if (B.state === "swipe" && g < 50) { // late: try to dodge away
        const hp0 = s.p.hp; await hold(awayKey); await h.tap("Shift", 35); await sleep(250); await hold(null);
        const s2 = await snap(); track(s2, "boss"); ev({ kind: "swipe-late-dodge", hit: s2.p.hp < hp0 }); continue;
      }
      // 4) punish windows
      if ((B.state === "recover" || B.state === "stagger") && g < 120) {
        if (g > 28) { await hold(dirKey); await sleep(10); continue; }
        await hold(null); await face(s, B.x);
        const hpB = B.hp;
        for (let i = 0; i < 3; i++) { await h.tap("j", 35); await sleep(190); }
        const s2 = await snap(); track(s2, "boss");
        ev({ kind: "punish", window: B.state, dealt: hpB - (s2.boss ? s2.boss.hp : 0), gotHit: s2.p.hp < s.p.hp });
        // step back out of swipe range
        await hold(awayKey); await sleep(260); await hold(null);
        continue;
      }
      // 5) heal when safe
      if (s.p.hp < 40 && s.p.herbs > 0 && g > 110 && (B.state === "idle" || B.state === "recover")) { await heal(s); ev({ kind: "heal" }); continue; }
      // 6) spacing: hold ~100 px
      if (g < 80) await hold(awayKey); else if (g > 140) await hold(dirKey); else await hold(null);
      await sleep(10);
    }
  }

  return { log, moveTo, fightBoar, fightBoss, hold, snap };
}

module.exports = { makeBot };
