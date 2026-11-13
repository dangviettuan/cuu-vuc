/**
 * DEBUG-ASSISTED setup (teleport into the arena); real input for every press.
 * Cloud playtest P1: the hero was once partly cut off at the right edge of Nanh Rễ's arena.
 * Hold right into the wall and dodge into it while the boss attacks; every frame, measure how much of the
 * hero's *drawn* sprite (opaque pixel bounds of its current frame) is inside the camera view.
 */
const { launch, save } = require("./harness.cjs");
(async () => {
  const h = await launch();
  await h.debugTeleport(1600); await h.wait(1300);
  // Opaque horizontal extent of every player frame, measured from the textures themselves.
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
    const left0 = p.x - w / 2;               // origin 0.5
    const a = p.flipX ? left0 + (w - 1 - hi) : left0 + lo, b = p.flipX ? left0 + (w - 1 - lo) : left0 + hi;
    return { t: performance.now(), px: p.x, key: p.texture.key, drawnL: a, drawnR: b + 1, viewL: cam.scrollX, viewR: cam.scrollX + cam.width, bossX: sc.boss.x, bossState: sc.boss.state, hp: p.hp };
  });
  const rows = []; let stop = false, shotWall = false, shotOverlap = false;
  const sampler = (async () => {
    while (!stop) {
      const s = await sample(); rows.push(s);
      if (!shotWall && s.px > 2120 && s.bossState !== "dormant") { shotWall = true; await h.shot("e01-right-wall"); }
      if (!shotOverlap && Math.abs(s.px - s.bossX) < 22) { shotOverlap = true; await h.shot("e02-overlap"); }
      await h.wait(16);
    }
  })();
  const T = Date.now();
  await h.down("d");
  while (Date.now() - T < 14000) {
    await h.wait(650); await h.tap("Shift", 30);
    if ((await sample()).hp < 40) break;
  }
  await h.up("d"); stop = true; await sampler;
  const worstR = Math.min(...rows.map((r) => r.viewR - r.drawnR)), worstL = Math.min(...rows.map((r) => r.drawnL - r.viewL));
  const clipped = rows.filter((r) => r.drawnR > r.viewR || r.drawnL < r.viewL);
  const R = { samples: rows.length, maxPx: Math.max(...rows.map((r) => r.px)), worstRightMarginPx: +worstR.toFixed(1), worstLeftMarginPx: +worstL.toFixed(1), clippedFrames: clipped.length, clippedExamples: clipped.slice(0, 5), shots: { wall: shotWall, overlap: shotOverlap }, errors: h.log.errors };
  save("probe-arena-edge", R);
  console.log(JSON.stringify(R, null, 1));
  await h.browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
