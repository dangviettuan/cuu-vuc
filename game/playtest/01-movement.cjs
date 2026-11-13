/** Session 1 — movement & platforming, measured frame-by-frame with real key input. */
const { launch, filmstrip, stats, save } = require("./harness.cjs");

(async () => {
  const h = await launch();
  const R = {};
  const shots = [];

  // A. Start: idle, then acceleration from rest (hold D 600 ms), then release (deceleration / stop).
  shots.push(await h.shot("m00-start"));
  const recA = h.rec(1100);
  await h.wait(30); await h.down("d"); await h.wait(600); await h.up("d");
  const a = await recA;
  const first = a.findIndex((s) => s.p.vx > 0);
  const full = a.findIndex((s) => s.p.vx >= 96);
  const rel = a.findIndex((s, i) => i > full && s.p.vx < 96);
  const stop = a.findIndex((s, i) => i > rel && s.p.vx === 0);
  R.accel = {
    framesToFirstMotion: first, msToFullSpeed: +(a[full].t - a[first].t).toFixed(0), msToStop: stop > 0 ? +(a[stop].t - a[rel].t).toFixed(0) : null,
    animsDuringRun: [...new Set(a.map((s) => s.p.anim))], runTimeScaleNote: "timeScale read separately",
  };

  // B. Run-cycle foot sliding: sample the run frame + x every frame while running at full speed.
  await h.down("d"); await h.wait(250);
  const b = await h.rec(1200); await h.up("d"); await h.wait(300);
  const runFrames = b.filter((s) => s.p.anim === "run");
  // distance travelled per full 8-frame cycle
  const cycleStarts = runFrames.filter((s, i) => i > 0 && s.p.frame === "p_run0" && runFrames[i - 1].p.frame !== "p_run0");
  const cyc = cycleStarts.length >= 2 ? cycleStarts[1].p.x - cycleStarts[0].p.x : null;
  const cycMs = cycleStarts.length >= 2 ? cycleStarts[1].t - cycleStarts[0].t : null;
  R.runCycle = { pxPerCycle: cyc && +cyc.toFixed(1), msPerCycle: cycMs && +cycMs.toFixed(0), speed: runFrames.length ? runFrames[runFrames.length - 1].p.vx : 0,
    // generated legs swing ±6 px about the hip → a planted foot can sweep at most 12 px per half-cycle
    plantedFootSweepPx: 12, expectedGroundTravelPerHalfCycle: cyc && +(cyc / 2).toFixed(1) };

  // Filmstrip of the run cycle (clipped around the player, one shot per ~70 ms frame)
  const rf = [];
  await h.down("d"); await h.wait(300);
  for (let i = 0; i < 8; i++) { rf.push(await h.shot(`m-run-${i}`, true)); await h.wait(35); }
  await h.up("d");
  shots.push(await filmstrip(h, rf, "m01-run-filmstrip", 8, rf.map((_, i) => `t+${i}`)));

  // C. Direction change: run right, then hold A (skid?) — record anims & velocity.
  await h.down("d"); await h.wait(400);
  const recC = h.rec(500); await h.up("d"); await h.down("a"); await h.wait(400); await h.up("a");
  const c = await recC;
  R.turn = { anims: c.map((s) => s.p.anim).filter((v, i, arr) => arr[i - 1] !== v), msToReverse: (() => { const i0 = c.findIndex((s) => s.p.vx < 96 && s.p.vx > 0); const i1 = c.findIndex((s) => s.p.vx <= -96); return i0 >= 0 && i1 > 0 ? +(c[i1].t - c[i0].t).toFixed(0) : null; })(), facingFlipsAtFrame: c.findIndex((s) => s.p.facing === -1) };
  await h.wait(400);

  // D. Jump: tap vs hold — apex height and air time.
  const jump = async (hold) => {
    const y0 = (await h.snap()).p.y;
    const rec = h.rec(900); await h.wait(20); await h.tap("Space", hold); const r = await rec;
    const minY = Math.min(...r.map((s) => s.p.y));
    const air = r.filter((s) => !s.p.grounded);
    return { heightPx: +(y0 - minY).toFixed(1), airMs: air.length ? +(air[air.length - 1].t - air[0].t).toFixed(0) : 0, anims: r.map((s) => s.p.anim).filter((v, i, arr) => arr[i - 1] !== v) };
  };
  R.jumpTap = await jump(40); await h.wait(300);
  R.jumpHold = await jump(500); await h.wait(300);

  // Jump arc filmstrip
  const jf = []; await h.tap("Space", 400);
  for (let i = 0; i < 8; i++) { jf.push(await h.shot(`m-jump-${i}`, true)); await h.wait(50); }
  shots.push(await filmstrip(h, jf, "m02-jump-filmstrip", 8));
  await h.wait(400);

  // E. Air control: jump while holding D, measure horizontal distance.
  const x0 = (await h.snap()).p.x;
  await h.down("d"); await h.tap("Space", 400); await h.wait(700); await h.up("d"); await h.wait(300);
  R.airControl = { dxWhileJumpingRight: +((await h.snap()).p.x - x0).toFixed(1) };

  // F. Ledge: walk to the first ledge (x≈300–396, top y=270), jump onto it, walk off the far edge.
  //    Coyote time: press jump ~60 ms after leaving the edge. Jump buffer: press jump ~70 ms before landing.
  // walk back left to x≈250 first
  let s = await h.snap();
  await h.down(s.p.x > 250 ? "a" : "d");
  for (let i = 0; i < 80; i++) { s = await h.snap(); if (Math.abs(s.p.x - 250) < 6) break; await h.wait(15); }
  await h.up("a"); await h.up("d"); await h.wait(300);
  await h.down("d"); await h.tap("Space", 300); await h.wait(500);
  s = await h.snap();
  R.ledgeLand = { onLedge: s.p.y < 290, y: s.p.y, x: s.p.x };
  // run to the right edge (396) and detect leaving it, then press jump 60 ms later
  let leftAt = null;
  for (let i = 0; i < 200; i++) { s = await h.snap(); if (!s.p.grounded && s.p.vy > 0) { leftAt = Date.now(); break; } await h.wait(8); }
  await h.wait(55);
  const recF = h.rec(700); await h.tap("Space", 200); const f = await recF;
  await h.up("d");
  R.coyote = { leftEdgeDetected: !!leftAt, jumpedAfterLeaving: f.some((x) => x.p.vy < -200), minVy: Math.min(...f.map((x) => x.p.vy)) };
  await h.wait(600);
  // jump buffer: jump, then press jump again ~70 ms before landing → expect an immediate re-jump
  await h.tap("Space", 300);
  for (let i = 0; i < 100; i++) { s = await h.snap(); if (s.p.vy > 150 && s.p.y > 285) break; await h.wait(8); }
  const recG = h.rec(600); await h.tap("Space", 150); const g = await recG;
  const landIdx = g.findIndex((x) => x.p.grounded);
  const rejump = g.findIndex((x, i) => i >= landIdx && landIdx >= 0 && x.p.vy < -200);
  R.jumpBuffer = { landedFrame: landIdx, rejumpFrame: rejump, buffered: rejump >= 0 && rejump - landIdx <= 2 };
  await h.wait(800);

  // G. Input latency: key → first visible response (position or pose) for jump & light attack.
  const lat = async (key) => {
    await h.wait(300);
    const rec = h.rec(250); await h.wait(30); await h.tap(key, 50); const r = await rec;
    const kt = (await h.keyTimes()).slice(-1)[0].t;
    const base = r.find((x) => x.t < kt) || r[0];
    const resp = r.find((x) => x.t >= kt && (x.p.frame !== base.p.frame || Math.abs(x.p.y - base.p.y) > 0.5));
    return resp ? +(resp.t - kt).toFixed(1) : null;
  };
  R.latencyMs = { jump: await lat("Space"), light: await lat("j"), dodge: await lat("Shift"), parry: await lat("i") };

  // H. Idle liveliness: record 4 s of idle frames.
  await h.wait(1200);
  const idle = await h.rec(4000);
  R.idle = { distinctFrames: [...new Set(idle.map((x) => x.p.frame))], blinked: idle.some((x) => x.p.anim === "blink") };
  const idf = []; for (let i = 0; i < 6; i++) { idf.push(await h.shot(`m-idle-${i}`, true)); await h.wait(200); }
  shots.push(await filmstrip(h, idf, "m03-idle-filmstrip", 6));

  const ft = await h.frameTimes();
  R.frameTimes = stats(ft.slice(60));
  R.console = h.log;
  R.shots = shots;
  save("01-movement", R);
  console.log(JSON.stringify(R, null, 1));
  await h.browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
