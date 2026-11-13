/** Session 5 — (a) input mashing: which presses become swings; (b) 2-minute combat soak: perf + memory. Real input only. */
const { launch, stats, save } = require("./harness.cjs");
const { makeBot } = require("./bot.cjs");
(async () => {
  const R = {};
  // (a) mash J at several human rates, standing in the open at spawn
  {
    const h = await launch();
    R.mash = [];
    for (const interval of [80, 120, 160, 220, 300]) {
      await h.wait(1200);
      const rec = h.rec(14 * interval + 900);
      for (let i = 0; i < 12; i++) { await h.tap("j", 30); await h.wait(interval - 30); }
      const r = await rec;
      const keys = (await h.keyTimes()).filter((k) => k.code === "KeyJ").slice(-12);
      const starts = r.filter((x, i) => i > 0 && x.p.anim.startsWith("light") && (r[i - 1].p.anim !== x.p.anim));
      const dropped = keys.filter((k) => { const at = r.find((x) => x.t >= k.t); return at && at.p.anim === "light3" && at.p.tag !== "windup"; }).length;
      R.mash.push({ intervalMs: interval, presses: 12, swingsStarted: starts.length, sequence: starts.map((x) => x.p.anim.replace("light", "L")).join(""), pressesLandingInL3: dropped, minStamina: Math.min(...r.map((x) => x.p.st)) });
    }
    await h.browser.close();
  }
  // (b) soak: real route to the boss, then 2 minutes of fighting (restarting the slice when it ends)
  {
    const h = await launch({ width: 960, height: 540 });
    const bot = makeBot(h);
    const samples = [];
    const t0 = Date.now();
    await bot.moveTo(520, 5, 8000); for (let i = 0; i < 3; i++) { await h.tap("j", 40); await h.wait(220); }
    await bot.moveTo(780); await bot.fightBoar(930, "dodge"); await bot.moveTo(1120); await bot.fightBoar(1240, "parry");
    await bot.moveTo(1420); await h.tap("e", 50); await h.wait(300);
    await h.resetFrameTimes();
    const sampler = setInterval(async () => { try { const m = await h.memory(); const o = await h.objects(); const c = await h.page.evaluate(() => window.__cuuVuc.scene.getScene("Prologue").updateCostMs); samples.push({ s: Math.round((Date.now() - t0) / 1000), heapMB: m && +(m.used / 1048576).toFixed(1), objects: o, updateMs: +c.toFixed(3) }); } catch {} }, 10000);
    const tEnd = Date.now() + 120000; let fights = 0;
    while (Date.now() < tEnd) {
      await bot.moveTo(1600, 8);
      const res = await bot.fightBoss({ chargeTactic: fights % 2 ? "jump" : "dodge", maxMs: Math.max(5000, tEnd - Date.now()) });
      fights++;
      const s = await bot.snap();
      if (s.choosing) { await h.tap("1", 50); await h.wait(3500); await h.tap("r", 50); await h.wait(1500); await bot.moveTo(1600, 8, 30000); }
      if (res === "died") await h.wait(2600);
    }
    clearInterval(sampler);
    R.soak = { fights, frameTimes: stats(await h.frameTimes()), samples, deaths: bot.log.deaths, errors: h.log.errors, warnings: h.log.warnings.slice(0, 5) };
    await h.browser.close();
  }
  save("05-mash-soak", R);
  console.log(JSON.stringify(R, null, 1));
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
