/** DEBUG-ASSISTED setup (teleport); real input. Dodge through a boar charge and trace what the boar does. */
const { launch } = require("./harness.cjs");
(async () => {
  const h = await launch(); await h.debugTeleport(760); await h.wait(300);
  for (let n = 0; n < 3; n++) {
    let s; const t0 = Date.now();
    for (;;) { s = await h.snap(); const b = s.boars[0]; const coming = (b.x > s.p.x ? -1 : 1) === b.facing; const g = b.x > s.p.x ? (b.x - 13) - (s.p.x + 5) : (s.p.x - 5) - (b.x + 13); if (b.state === "charge" && coming && g < 20) break; if (Date.now() - t0 > 9000) break; await h.wait(6); }
    const key = s.boars[0].x > s.p.x ? "d" : "a";
    const rec = h.rec(1200);
    await h.down(key); await h.tap("Shift", 30); await h.up(key);
    const r = await rec;
    const trail = r.filter((_, i) => i % 4 === 0).map((x) => `${Math.round(x.p.x)}|${x.boars[0].x}:${x.boars[0].state[0]}`);
    console.log(JSON.stringify({ n, hpDrop: r[0].p.hp - r[r.length - 1].p.hp, boarStates: [...new Set(r.map((x) => x.boars[0].state))], trail: trail.join(" ") }));
    await h.wait(1500);
  }
  await h.browser.close();
})();
