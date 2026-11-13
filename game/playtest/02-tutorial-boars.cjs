/**
 * Session 2 — real playthrough from spawn: tutorial signs, brush, herbs, ledge, both boars, stamina, shrine.
 * No teleporting. The "player" is a script reacting to what is on screen via read-only snapshots and
 * pressing real keys. Its reaction time is ~20–40 ms (polling), i.e. faster than a human (~200 ms);
 * every timing-based result is reported with that caveat.
 */
const { launch, filmstrip, stats, save } = require("./harness.cjs");

(async () => {
  const h = await launch();
  const R = { tests: [], timeline: [] };
  const shots = {};
  const note = (test, result, detail) => { R.tests.push({ test, result, ...detail }); console.log(result.padEnd(9), test, JSON.stringify(detail)); };
  let held = null;
  const hold = async (k) => { if (held === k) return; if (held) await h.up(held); held = k; if (k) await h.down(k); };
  const moveTo = async (x, tol = 4, maxMs = 30000) => {
    const t0 = Date.now();
    for (;;) {
      const s = await h.snap();
      const d = x - s.p.x;
      if (Math.abs(d) <= tol || Date.now() - t0 > maxMs) { await hold(null); return s; }
      await hold(d > 0 ? "d" : "a");
      await h.wait(12);
    }
  };
  const face = async (dir) => { const s = await h.snap(); if (s.p.facing !== dir) { await h.tap(dir > 0 ? "d" : "a", 20); await h.wait(60); } };

  R.damage = [];
  let lastHp = 100, deaths = 0;
  const watch = setInterval(async () => {
    try {
      const x = await h.snap(); if (!x) return;
      if (x.p.hp < lastHp) R.damage.push({ amount: lastHp - x.p.hp, px: x.p.x, pState: x.p.state, pAnim: x.p.anim, boars: x.boars.map((b) => [b.x, b.state]), boss: x.boss && [x.boss.x, x.boss.state] });
      if (x.p.hp === 0 && lastHp > 0) deaths++;
      lastHp = x.p.hp; R.deaths = deaths;
    } catch {}
  }, 30);
  /* ---- tutorial walk ---- */
  shots.spawn = await h.shot("t00-spawn");
  await moveTo(110);
  shots.sign1 = await h.shot("t01-sign-move");
  // brush: walk into it
  let s = await moveTo(520, 4, 6000);
  note("Brush blocks the path", s.p.x < 462 ? "PASS" : "FAIL", { stoppedAtX: s.p.x });
  shots.sign2 = await h.shot("t02-sign-brush");
  // full light combo on the brush, recording anim + hit frames
  const recC = h.rec(1600);
  await h.tap("j", 50); await h.wait(230); await h.tap("j", 50); await h.wait(230); await h.tap("j", 50);
  const c = await recC;
  const swings = [...new Set(c.map((x) => x.p.anim).filter((a) => a.startsWith("light")))];
  s = await h.snap();
  note("Light combo 1→2→3 chains on input", swings.length === 3 ? "PASS" : "FAIL", { swings, brushCleared: !s.bush });
  const comboMs = (() => { const f = c.find((x) => x.p.anim === "light1"), l = c.filter((x) => x.p.anim === "light3"); return f && l.length ? +(l[l.length - 1].t - f.t).toFixed(0) : null; })();
  R.combo = { totalMs: comboMs, activeFrames: c.filter((x) => x.p.hit).length, staminaAfter: s.p.st };
  shots.brush = await h.shot("t03-brush-cleared");

  /* ---- herbs + ledge ---- */
  await moveTo(560);
  s = await h.snap();
  note("Pick up ground herb by walking over it", s.p.herbs >= 1 ? "PASS" : "FAIL", { herbs: s.p.herbs });
  // ledge herb at x=672 on the ledge (640–704, top 264): run + jump
  await moveTo(612);
  await h.down("d"); await h.tap("Space", 320); await h.wait(260); await h.up("d"); await h.wait(500);
  s = await h.snap();
  note("Jump onto ledge and take the ledge herb", s.p.herbs >= 2 ? "PASS" : "FAIL", { herbs: s.p.herbs, y: s.p.y });
  shots.ledge = await h.shot("t04-ledge");
  await moveTo(760);
  shots.sign3 = await h.shot("t05-sign-boar");

  /* ---- boar fights ---- */
  const gap = (s, b) => (b.x > s.p.x ? (b.x - 13) - (s.p.x + 5) : (s.p.x - 5) - (b.x + 13));
  // Wait for a boar to charge toward us, then apply the technique.
  const meetCharge = async (bi, technique, label) => {
    const t0 = Date.now(); let hp0 = null, result = "NOT TESTED", detail = {};
    for (;;) {
      if (Date.now() - t0 > 12000) { result = "BLOCKED"; detail.reason = "boar never charged in range"; break; }
      s = await h.snap();
      const b = s.boars[bi]; if (!b || !b.alive) { result = "BLOCKED"; detail.reason = "boar dead"; break; }
      const g = gap(s, b), toward = (b.x > s.p.x ? -1 : 1) === b.facing;
      if (hp0 === null) hp0 = s.p.hp;
      if (b.state === "charge" && toward && g < (technique === "parry" ? 26 : technique === "dodge" ? 22 : 30)) {
        const dir = b.x > s.p.x ? "d" : "a";
        if (technique === "parry") { await h.tap("i", 40); }
        if (technique === "dodge") { await h.down(dir); await h.tap("Shift", 40); await h.up(dir); }
        if (technique === "jump") { await h.tap("Space", 350); }
        if (technique === "none") { /* stand still */ }
        await h.wait(technique === "parry" ? 60 : 450);
        const s2 = await h.snap();
        const b2 = s2.boars[bi];
        detail = { hpBefore: hp0, hpAfter: s2.p.hp, boarState: b2 && b2.state, the: s2.p.the };
        if (technique === "parry") await h.wait(0);
        result = s2.p.hp < hp0 ? "HIT" : "AVOIDED";
        if (technique === "parry" && result === "AVOIDED" && s2.p.the > s.p.the) {
          // riposte
          const before = b2 ? b2.hp : 0; await h.wait(90); await h.tap("j", 40); await h.wait(450);
          const s3 = await h.snap(); const b3 = s3.boars[bi];
          detail.riposteDamage = before - (b3 ? b3.hp : 0);
        }
        break;
      }
      // keep ~110 px away so the boar notices and charges
      const want = b.x - (b.x > s.p.x ? 110 : -110);
      if (Math.abs(s.p.x - want) > 20) await hold(s.p.x < want ? "d" : "a"); else await hold(null);
      await h.wait(10);
    }
    await hold(null);
    note(`Boar ${bi + 1}: ${label}`, result, detail);
    return result;
  };
  const punishStun = async (bi, how) => {
    for (let i = 0; i < 200; i++) {
      s = await h.snap(); const b = s.boars[bi]; if (!b || !b.alive) return "dead";
      const g = gap(s, b);
      if (b.state === "stun" && g < 30) {
        await face(b.x > s.p.x ? 1 : -1);
        const hp0 = b.hp;
        if (how === "combo") { for (let k = 0; k < 3; k++) { await h.tap("j", 40); await h.wait(200); } }
        else if (how.startsWith("heavy")) { const lv = +how.slice(5); await h.down("k"); await h.wait([150, 500, 950][lv]); await h.up("k"); await h.wait(450); }
        s = await h.snap(); const b2 = s.boars[bi];
        return { dealt: hp0 - (b2 ? b2.hp : 0) };
      }
      if (b.state === "stun") await hold(b.x > s.p.x ? "d" : "a"); else await hold(null);
      await h.wait(10);
    }
    await hold(null); return "no stun window";
  };

  // Boar 1: (1) take a charge on purpose, (2) dodge-through, (3) parry + riposte, (4) jump over, then punish.
  R.boar1 = [];
  R.boar1.push(await meetCharge(0, "none", "stand still and take the charge (baseline)"));
  R.boar1.push(await meetCharge(0, "dodge", "dodge THROUGH the charge"));
  shots.boarDodge = await h.shot("t06-boar-after-dodge");
  R.boar1.push(await meetCharge(0, "parry", "parry the charge, then riposte"));
  shots.boarParry = await h.shot("t07-boar-after-parry");
  R.boar1.push(await meetCharge(0, "jump", "jump over the charge"));
  // kill it with combos during stun windows
  let kills = 0, guard = 0;
  while (guard++ < 12) {
    s = await h.snap(); if (!s.boars[0] || !s.boars[0].alive || s.boars[0].x > 1400) break;
    if ((await h.snap()).p.hp === 100 && R.deaths) break;
    await meetCharge(0, "parry", "parry the charge (repeat)");
  }
  s = await h.snap();
  note("Boar 1 defeated", !s.boars.find((b) => b.x < 1100 && b.alive) ? "PASS" : "FAIL", { herbs: s.p.herbs, hp: s.p.hp });
  shots.boar1dead = await h.shot("t08-boar1-dead");

  // Heavy charge levels on boar 2's stun windows
  await moveTo(1150, 6);
  const heavyResults = [];
  for (const lv of [0, 1, 2]) {
    // wait for a charge, sidestep it with a dodge, then punish its 800 ms post-charge stun with a heavy of level lv
    await meetCharge(0, "dodge", `boar 2 dodge, then heavy L${lv}`);
    heavyResults.push({ level: lv, r: await punishStun(0, "heavy" + lv) });
  }
  R.heavy = heavyResults;
  note("Heavy attack levels 0/1/2 land inside a boar stun window (parried, 800 ms)", "INFO", { heavyResults });
  // finish boar 2
  guard = 0;
  while (guard++ < 12) {
    s = await h.snap(); if (!s.boars.length || !s.boars[0].alive) break;
    await meetCharge(0, "parry", "boar 2 parry (repeat)");
    await punishStun(0, "combo");
  }
  s = await h.snap();
  note("Boar 2 defeated", !s.boars.some((b) => b.alive) ? "PASS" : "FAIL", { hp: s.p.hp, herbs: s.p.herbs });

  /* ---- stamina, air attack, turn attack ---- */
  await h.wait(800);
  s = await h.snap();
  const st0 = s.p.st;
  const recS = h.rec(2600);
  for (let i = 0; i < 14; i++) { await h.tap("j", 30); await h.wait(110); }
  const ss = await recS;
  const minSt = Math.min(...ss.map((x) => x.p.st));
  const swingsStarted = ss.filter((x, i) => i > 0 && x.p.anim.startsWith("light") && ss[i - 1].p.anim !== x.p.anim).length;
  note("Stamina: mashing J drains stamina and eventually stops attacks", minSt <= 0 ? "PASS" : "FAIL", { st0, minSt, swingsStarted, presses: 14 });
  await h.wait(1500);
  // air attack
  const recA = h.rec(900); await h.tap("Space", 300); await h.wait(80); await h.tap("j", 40); const aa = await recA;
  note("Attack while airborne", "INFO", { anims: [...new Set(aa.map((x) => x.p.anim))], hadActiveFrames: aa.some((x) => x.p.hit), grounded: aa.filter((x) => x.p.hit).map((x) => x.p.grounded) });
  shots.air = await h.shot("t09-air-attack");
  await h.wait(600);
  // reverse + attack immediately
  await h.down("d"); await h.wait(300);
  const recT = h.rec(600); await h.up("d"); await h.down("a"); await h.tap("j", 40); await h.up("a"); const tt = await recT;
  note("Turn and attack: swing faces the new direction", tt.filter((x) => x.p.hit).every((x) => x.p.facing === -1) ? "PASS" : "FAIL", { facingsDuringActive: [...new Set(tt.filter((x) => x.p.hit).map((x) => x.p.facing))] });

  /* ---- shrine ---- */
  await moveTo(1420, 6);
  shots.shrinePrompt = await h.shot("t10-shrine-prompt");
  await h.tap("e", 50); await h.wait(400);
  s = await h.snap();
  note("Shrine lights on E and heals", s.shrineLit && s.p.hp === 100 ? "PASS" : "FAIL", { lit: s.shrineLit, hp: s.p.hp });
  shots.shrineLit = await h.shot("t11-shrine-lit");

  clearInterval(watch);
  R.final = await h.snap();
  R.frameTimes = stats((await h.frameTimes()).slice(60));
  R.memory = await h.memory();
  R.objects = await h.objects();
  R.console = h.log; R.shots = shots;
  save("02-tutorial-boars", R);
  await h.browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
