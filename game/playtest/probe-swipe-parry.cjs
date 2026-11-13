/** DEBUG-ASSISTED setup (teleport into the arena; page reloaded when HP is low); real input for every press. */
const { launch, save } = require("./harness.cjs");
(async () => {
  const out = [];
  const offsets = [-180, -120, -60, 0, 60, -180, -120, -60, 0, 60];
  let h = await launch(), i = 0;
  const T0 = Date.now();
  const fresh = async () => { await h.browser.close(); h = await launch(); await h.debugTeleport(1600); await h.wait(1400); };
  await h.debugTeleport(1600); await h.wait(1400);
  while (i < offsets.length && Date.now() - T0 < 170000) {
    let s = await h.snap();
    if (s.p.hp <= 45 || s.p.state === "dead") { await fresh(); continue; }
    const B = s.boss; const g = B.x - 33 - (s.p.x + 5); // gap to her near edge (player must stay on her left)
    if (s.p.x > B.x - 30) { await h.down("a"); await h.tap("Shift", 30); await h.wait(260); await h.up("a"); continue; } // got inside/behind her: get out
    if (B.state === "tCharge" || B.state === "charge") { await h.down("a"); await h.tap("Space", 300); await h.up("a"); await h.wait(150); continue; }
    if (s.roots.some((r) => Math.abs(r.x - s.p.x) < 24)) { await h.down("a"); await h.tap("Shift", 30); await h.wait(250); await h.up("a"); continue; }
    if (B.state !== "tSwipe") {
      if (g > 30) await h.tap("d", 40); else if (g < 15) await h.tap("a", 40);
      await h.wait(25); continue;
    }
    if (s.p.state !== "move" || g < 10 || g > 35) { await h.wait(20); continue; } // only clean trials
    const k = B.phase === 1 ? 1 : B.phase === 2 ? 0.8 : 0.7, off = offsets[i];
    const rec = h.rec(900);
    await h.wait(Math.max(0, 450 * k + off - 20));
    await h.tap("i", 35);
    const r = await rec;
    const kI = (await h.keyTimes()).filter((x) => x.code === "KeyI").pop();
    const sw = r.find((x) => x.boss.state === "swipe");
    const drop = r.find((x, j) => j > 0 && x.p.hp < r[j - 1].p.hp);
    const row = { phase: B.phase, plannedOffsetMs: off, pressMinusSwipeStartMs: sw ? Math.round(kI.t - sw.t) : null, parried: r.some((x) => x.p.anim === "parry"), hit: !!drop, gapAtSwipe: sw ? Math.round(sw.boss.x - 33 - (sw.p.x + 5)) : null };
    out.push(row); console.log(JSON.stringify(row)); i++;
    await h.wait(1300);
  }
  save("probe-swipe-parry", out);
  await h.browser.close();
})();
