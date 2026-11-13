/** DEBUG-ASSISTED setup (teleport); real input. Repeated parry → riposte on one boar, traced per cycle. */
const { launch } = require("./harness.cjs");
(async () => {
  const h = await launch(); await h.debugTeleport(760); await h.wait(300);
  for (let n = 0; n < 5; n++) {
    let s; const t0 = Date.now();
    for (;;) { s = await h.snap(); const b = s.boars[0]; if (!b) break; const gap = (b.x - 13) - (s.p.x + 5); const g2 = b.x > s.p.x ? (b.x - 13) - (s.p.x + 5) : (s.p.x - 5) - (b.x + 13); const coming = (b.x > s.p.x ? -1 : 1) === b.facing; if (b.state === "charge" && coming && g2 < 24) break; if (Date.now() - t0 > 9000) break; await h.wait(6); }
    const rec = h.rec(1300);
    await h.tap("i", 35); await h.wait(180); await h.tap("j", 35);
    const r = await rec;
    const keys = await h.keyTimes(); const kJ = keys.filter((k) => k.code === "KeyJ").pop();
    const atJ = r.find((x) => x.t >= kJ.t);
    const rip = r.filter((x) => x.p.anim === "riposte");
    console.log(JSON.stringify({ cycle: n, theBefore: r[0].p.the, stateAtJ: atJ && `${atJ.p.state}/${atJ.p.anim}/grounded:${atJ.p.grounded}/the:${atJ.p.the}`, riposte: rip.length > 0, parried: r.some((x) => x.p.anim === "parry"), activeGaps: rip.filter((x) => x.p.hit).map((x) => Math.round(x.boars[0] ? (x.boars[0].x > x.p.x ? (x.boars[0].x - 13) - (x.p.x + 5) : (x.p.x - 5) - (x.boars[0].x + 13)) : 0)), facingAtRip: rip.length ? [rip[0].p.facing, rip[0].boars[0] && Math.sign(rip[0].boars[0].x - rip[0].p.x)] : null, boarHp: [r[0].boars[0] && r[0].boars[0].hp, r[r.length - 1].boars[0] && r[r.length - 1].boars[0].hp], playerX: [r[0].p.x, r[r.length - 1].p.x], boarX: r.filter((_, i) => i % 8 === 0).map((x) => x.boars[0] && x.boars[0].x) }));
    await h.wait(400);
  }
  await h.browser.close();
})();
