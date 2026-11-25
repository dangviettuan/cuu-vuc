/**
 * CI smoke test: the slice's spine, deterministic enough to gate every push.
 *
 * DEBUG-ASSISTED: teleports and one forced boss defeat replace the bot's fights, so the result does not depend on
 * random boss moves or frame timing. It checks the game boots, runs and finishes without errors:
 * movement, the brush chore, a herb, the shrine, the arena lock, a block, the C2 choice and its flag, and R restart.
 * The real-input playthrough (03-full-run.cjs) stays the tuning tool; this is the regression gate.
 *
 * Usage: GAME_URL=http://localhost:4173/ node playtest/ci-smoke.cjs   (add ?kit=kiem, or NO_WEBGL=1, for variants)
 * Exit code 1 on any failed step or console error.
 */
const { launch } = require("./harness.cjs");

(async () => {
  const h = await launch();
  const { page } = h;
  const fails = [];
  const step = (name, ok, info = {}) => { console.log(`${ok ? "PASS" : "FAIL"} ${name} ${JSON.stringify(info)}`); if (!ok) fails.push(name); };
  const scene = (fn, arg) => page.evaluate(fn, arg);
  const until = async (pred, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { const s = await h.snap(); if (pred(s)) return s; await h.wait(50); } return h.snap(); };

  let s = await h.snap();
  step("boots into the Prologue at the start", s && s.p.x < 100, { x: s && s.p.x });

  await h.down("d"); await h.wait(700); await h.up("d");
  s = await h.snap();
  step("runs right", s.p.x > 90, { x: s.p.x }); // starts at 60; 700 ms of D reaches ~115–125
  await h.tap("Space", 200);
  s = await until((x) => x.p.vy < -50 || !x.p.grounded, 500);
  step("jumps", !s.p.grounded || s.p.vy < 0, { vy: s.p.vy });

  // Brush chore: stand at the bush and swing until it clears.
  await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.x = 440; p.facing = 1; });
  await h.wait(300);
  for (let i = 0; i < 6; i++) { await h.tap("j", 40); await h.wait(260); }
  const brush = await scene(() => window.__cuuVuc.scene.getScene("Stage").bush.hp);
  step("light attacks clear the brush", brush <= 0, { brushHp: brush });

  // Herb pickup fills the pouch.
  await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.x = 552; });
  s = await until((x) => x.p.herbs >= 1, 2000);
  step("herb pickup adds to the pouch", s.p.herbs === 1, { herbs: s.p.herbs });

  // Shrine: light it, then a death respawns there with the pouch refilled.
  await scene(() => { const sc = window.__cuuVuc.scene.getScene("Stage"); sc.boars.forEach((b) => b.destroy()); const p = sc.player; p.x = 1425; p.herbs = 0; });
  await h.wait(300); await h.tap("e", 60); await h.wait(300);
  s = await h.snap();
  step("shrine lights and refills the pouch", s.shrineLit && s.p.herbs === 1, { lit: s.shrineLit, herbs: s.p.herbs });

  // Arena: walking in locks it and wakes the boss.
  await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.x = 1600; });
  s = await until((x) => x.engaged && x.boss.state !== "dormant", 3000);
  step("arena locks and the boss wakes", s.engaged && s.boss.state !== "dormant", { engaged: s.engaged, boss: s.boss.state });

  // Guard: hold I; after the parry window the player is blocking.
  await h.down("i"); await h.wait(300);
  s = await h.snap();
  step("holding I guards (block)", s.p.state === "block", { state: s.p.state });
  await h.up("i"); await h.wait(250);

  // Death in the arena: respawn at the shrine, boss reset, pouch refilled.
  await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.herbs = 0; p.receive({ id: "ci-kill", rect: p.hurtbox(), damage: 999, knockback: 0, parryable: false }); });
  s = await until((x) => x.p.hp === 100 && !x.engaged, 4000);
  step("death respawns at the shrine with the boss reset", Math.abs(s.p.x - 1440) < 30 && !s.engaged && s.boss.hp === s.boss.maxHp && s.p.herbs === 1,
    { x: s.p.x, engaged: s.engaged, bossHp: s.boss.hp, herbs: s.p.herbs });

  // Boss down → choice C2 → flag stored.
  await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.x = 1600; });
  await until((x) => x.engaged, 3000);
  await scene(() => { const sc = window.__cuuVuc.scene.getScene("Stage"); sc.boss.takeHit({ id: 99999, rect: null, damage: 9999, guardBreak: false, poise: 0, direction: 1 }); });
  s = await until((x) => x.choosing, 3000);
  step("boss down opens the C2 choice", !!s.choosing, { boss: s.boss.state });
  await h.tap("1", 60); await h.wait(400);
  const flag = await scene(() => window.__cuuVucSave().flags.PRO_SOW_SPARED);
  step("choice 1 saves PRO_SOW_SPARED = true", flag === true, { flag });

  await h.wait(3400); await h.tap("r", 60);
  s = await until((x) => x.p.x < 100 && !x.finished, 4000);
  step("R restarts from the beginning", s.p.x < 100 && !s.shrineLit, { x: s.p.x });

  step("no console errors", h.log.errors.length === 0, { errors: h.log.errors.slice(0, 5) });
  await h.browser.close();
  console.log(fails.length ? `\n${fails.length} step(s) failed` : "\nall steps passed");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
