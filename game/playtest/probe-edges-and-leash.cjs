/**
 * Real input only, no state writes. Cloud playtest follow-ups:
 *  (1) world left edge: hold A against the starting boundary, release, and measure the drawn sprite vs the view;
 *  (2) boar leash: clear the brush, then run straight through both boars to the boss arena without fighting,
 *      and record where the boars are while the boss fight is on.
 */
const { launch, save } = require("./harness.cjs");
(async () => {
  const h = await launch();
  await h.page.evaluate(() => {
    const sc = window.__cuuVuc.scene.scenes[0], ext = {};
    for (const k of sc.textures.getTextureKeys()) {
      if (!k.startsWith("p_") || k.endsWith("_ol")) continue;
      const img = sc.textures.get(k).getSourceImage(), c = document.createElement("canvas");
      c.width = img.width; c.height = img.height; const g = c.getContext("2d"); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; let lo = 1e9, hi = -1;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
      ext[k] = [lo, hi, c.width];
    }
    window.__ext = ext;
  });
  const sample = () => h.page.evaluate(() => {
    const sc = window.__cuuVuc.scene.scenes[0], p = sc.player, cam = sc.cameras.main, [lo, hi, w] = window.__ext[p.texture.key];
    const left0 = p.x - w / 2, a = p.flipX ? left0 + (w - 1 - hi) : left0 + lo, b = p.flipX ? left0 + (w - 1 - lo) : left0 + hi;
    return { px: p.x, drawnL: a, drawnR: b + 1, viewL: cam.scrollX, viewR: cam.scrollX + cam.width, engaged: sc.engaged, boars: sc.boars.filter((x) => x.active && x.isAlive()).map((x) => Math.round(x.x)), hp: p.hp };
  });
  const R = {};
  // (1) left edge
  const rows = [];
  await h.down("a");
  for (let i = 0; i < 60; i++) { rows.push(await sample()); await h.wait(16); }
  await h.up("a");
  for (let i = 0; i < 60; i++) { rows.push(await sample()); await h.wait(16); }
  await h.shot("g01-left-edge");
  R.leftEdge = { minPx: Math.min(...rows.map((r) => r.px)), worstLeftMarginPx: +Math.min(...rows.map((r) => r.drawnL - r.viewL)).toFixed(1), clippedFrames: rows.filter((r) => r.drawnL < r.viewL).length, samples: rows.length };
  console.log("leftEdge", JSON.stringify(R.leftEdge));

  // (2) leash: walk to the brush, clear it, then hold D (jump now and then) all the way into the arena
  await h.down("d"); for (;;) { const s = await sample(); if (s.px > 440) break; await h.wait(30); } await h.up("d");
  for (let i = 0; i < 3; i++) { await h.tap("j", 40); await h.wait(220); }
  await h.wait(400);
  const trail = []; const t0 = Date.now(); let engagedAt = null;
  await h.down("d");
  while (Date.now() - t0 < 25000) {
    const s = await sample(); trail.push(s);
    if (s.hp <= 0) break;
    if (s.engaged && engagedAt === null) engagedAt = trail.length;
    if (engagedAt !== null && trail.length - engagedAt > 150) break; // ~5 s into the fight
    if (trail.length % 20 === 0) await h.tap("Space", 120);
    await h.wait(16);
  }
  await h.up("d");
  await h.shot("g02-arena-after-run");
  const fight = engagedAt === null ? [] : trail.slice(engagedAt);
  R.leash = {
    reachedArena: engagedAt !== null, playerDied: trail.some((s) => s.hp <= 0),
    boarsAlive: trail[trail.length - 1].boars,
    maxBoarXDuringFight: fight.length ? Math.max(-1, ...fight.flatMap((s) => s.boars)) : null,
    boarsInsideArenaFrames: fight.filter((s) => s.boars.some((x) => x >= 1520)).length, fightFrames: fight.length,
  };
  console.log("leash", JSON.stringify(R.leash));
  R.errors = h.log.errors;
  save("probe-edges-and-leash", R);
  await h.browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
