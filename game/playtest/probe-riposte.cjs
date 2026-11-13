/** DEBUG-ASSISTED probe (teleport for setup only): parry a boar charge, riposte, record every frame. */
const { launch, save } = require("./harness.cjs");
(async () => {
  const h = await launch();
  const runs = [];
  for (let n = 0; n < 4; n++) {
    await h.debugTeleport(760); await h.wait(400);
    let s, phase = "wait";
    const t0 = Date.now();
    for (;;) {
      s = await h.snap();
      const b = s.boars[0];
      const gap = (b.x - 13) - (s.p.x + 5);
      if (b.state === "charge" && gap < 26) { await h.tap("i", 40); break; }
      if (Date.now() - t0 > 8000) { phase = "timeout"; break; }
      await h.wait(8);
    }
    const rec = h.rec(1100);
    await h.wait(120 + n * 120); // riposte delay varies per run: 120, 240, 360, 480 ms after the parry
    await h.tap("j", 40);
    const r = await rec;
    const parried = r.find((x) => x.p.anim === "parry");
    const rip = r.filter((x) => x.p.anim === "riposte");
    const act = rip.filter((x) => x.p.hit);
    runs.push({
      delayAfterParryMs: 120 + n * 120, phase,
      the: r[0].p.the, ripostePlayed: rip.length > 0,
      gapAtActive: act.map((x) => Math.round((x.boars[0].x - 13) - (x.p.x + 5))),
      boarHp: [r[0].boars[0].hp, r[r.length - 1].boars[0].hp],
      boarStates: [...new Set(r.map((x) => x.boars[0].state))],
      boarXTrail: r.filter((_, i) => i % 6 === 0).map((x) => x.boars[0].x),
      playerAnims: r.map((x) => x.p.anim).filter((v, i, a) => a[i - 1] !== v),
    });
    await h.wait(1500);
  }
  console.log(JSON.stringify(runs, null, 1));
  save("probe-riposte", runs);
  await h.browser.close();
})();
