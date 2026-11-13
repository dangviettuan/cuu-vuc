/** DEBUG-ASSISTED setup (teleport); real input: parry a boar charge then press J at varying delays. */
const { launch, save } = require("./harness.cjs");
(async () => {
  const out = [];
  for (const delay of [100, 200, 300, 450, 600]) {
    const h = await launch();
    await h.debugTeleport(760); await h.wait(300);
    let s; const t0 = Date.now();
    for (;;) { s = await h.snap(); const b = s.boars[0]; const gap = (b.x - 13) - (s.p.x + 5); if (b.state === "charge" && gap < 26) break; if (Date.now() - t0 > 8000) break; await h.wait(6); }
    const rec = h.rec(1400);
    await h.tap("i", 40);
    await h.wait(delay);
    await h.tap("j", 40);
    const r = await rec;
    const keys = await h.keyTimes();
    const kI = keys.find((k) => k.code === "KeyI"), kJ = keys.find((k) => k.code === "KeyJ");
    const parryF = r.find((x) => x.p.anim === "parry");
    const atJ = r.filter((x) => x.t >= kJ.t).slice(0, 3);
    out.push({
      delayMs: delay,
      parrySucceededMsAfterI: parryF ? +(parryF.t - kI.t).toFixed(0) : null,
      jPressedMsAfterParry: parryF ? +(kJ.t - parryF.t).toFixed(0) : null,
      stateAtJ: atJ.map((x) => `${x.p.state}/${x.p.anim}/hitstop:${x.hitstop}/the:${x.p.the}`),
      riposte: r.some((x) => x.p.anim === "riposte"),
      animsAfter: r.filter((x) => x.t >= kJ.t).map((x) => x.p.anim).filter((v, i, a) => a[i - 1] !== v),
      boarHp: r[r.length - 1].boars[0] ? r[r.length - 1].boars[0].hp : 0,
    });
    await h.browser.close();
  }
  console.log(JSON.stringify(out, null, 1)); save("probe-riposte2", out);
})();
