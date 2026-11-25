/**
 * CI smoke test: the Prologue's spine, deterministic enough to gate every push.
 *
 * DEBUG-ASSISTED: teleports and one forced boss defeat replace the bot's fights, so the result does not depend on
 * random boss moves or frame timing. Three parts, each started in quick mode at its stage:
 * - S1 (morning): movement, the brush chore, a herb, the shrine, the exit into the village.
 * - S3 (lunch): the opening lines, looking at a thing, talking to the Father, skipping the scene from the pause menu,
 *   the narration cards, arriving in S7.
 * - S7 (night): the shrine, the arena lock, a block, death and respawn, Nanh Rễ down, the C2 choice and its flag,
 *   and the end card.
 * Any console error fails it. The real-input playthrough (03-full-run.cjs) stays the tuning tool; this is the gate.
 *
 * Usage: GAME_URL=http://localhost:4173/ node playtest/ci-smoke.cjs   (add ?kit=kiem, or NO_WEBGL=1, for variants)
 * Exit code 1 on any failed step or console error.
 */
const { launch, withQuick } = require("./harness.cjs");

(async () => {
  const h = await launch();
  const { page } = h;
  const fails = [];
  const step = (name, ok, info = {}) => { console.log(`${ok ? "PASS" : "FAIL"} ${name} ${JSON.stringify(info)}`); if (!ok) fails.push(name); };
  const scene = (fn, arg) => page.evaluate(fn, arg);
  const until = async (pred, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { const s = await h.snap(); if (s && pred(s)) return s; await h.wait(50); } return h.snap(); };
  const stageState = () => scene(() => { const s = window.__cuuVuc.scene.getScene("Stage"), ui = window.__cuuVuc.scene.getScene("UI");
    return { id: s.def && s.def.id, x: Math.round(s.player.x), cut: s.cutscene, narr: !!ui.narration, dlg: !!ui.dialogue, paused: window.__cuuVuc.scene.isPaused("Stage") }; });
  const waitStage = async (id, ms = 8000) => { const t = Date.now(); while (Date.now() - t < ms) { const st = await stageState().catch(() => null); if (st && st.id === id && !st.narr) return st; await h.wait(100); } return stageState(); };
  const openAt = async (stage) => {
    const u = new URL(withQuick(process.env.GAME_URL || "http://localhost:5173/")); u.searchParams.set("stage", stage);
    await page.goto(u.toString(), { waitUntil: "load" });
    await page.waitForFunction(() => window.__snap && window.__snap() !== null, null, { timeout: 15000 });
    await h.wait(400);
  };

  /* ---------------- S1: morning chores ---------------- */
  let s = await h.snap();
  step("S1: boots at the start of the trail", s && s.p.x < 100, { x: s && s.p.x });
  await h.down("d"); await h.wait(700); await h.up("d");
  s = await h.snap();
  step("S1: runs right", s.p.x > 90, { x: s.p.x }); // starts at 60; 700 ms of D reaches ~115–125
  await h.tap("Space", 200);
  s = await until((x) => x.p.vy < -50 || !x.p.grounded, 500);
  step("S1: jumps", !s.p.grounded || s.p.vy < 0, { vy: s.p.vy });

  await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.x = 440; p.facing = 1; });
  await h.wait(300);
  for (let i = 0; i < 6; i++) { await h.tap("j", 40); await h.wait(260); }
  const brush = await scene(() => window.__cuuVuc.scene.getScene("Stage").bush.hp);
  step("S1: light attacks clear the brush", brush <= 0, { brushHp: brush });

  await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.x = 552; });
  s = await until((x) => x.p.herbs >= 1, 2000);
  step("S1: herb pickup adds to the pouch", s.p.herbs === 1, { herbs: s.p.herbs });

  await scene(() => { const sc = window.__cuuVuc.scene.getScene("Stage"); sc.boars.forEach((b) => b.destroy()); const p = sc.player; p.x = 1425; p.herbs = 0; });
  await h.wait(300); await h.tap("e", 60); await h.wait(300);
  s = await h.snap();
  step("S1: the shrine lights and refills the pouch", s.shrineLit && s.p.herbs === 1, { lit: s.shrineLit, herbs: s.p.herbs });

  await h.down("d"); await h.wait(1800); await h.up("d");
  const tNarr = Date.now(); let st = await stageState();
  while (!st.narr && Date.now() - tNarr < 3000) { await h.wait(100); st = await stageState(); } // the card follows a short fade
  step("S1: walking on into the village leaves the stage (narration card)", st.narr, st);
  for (let i = 0; i < 3; i++) { await h.tap("Enter", 60); await h.wait(500); }
  st = await waitStage("prologue-s3");
  const carried = await scene(() => window.__cuuVuc.scene.getScene("Stage").player.herbCap);
  step("S1 → S3: arrives at the house with the pouch carried over", st.id === "prologue-s3" && carried === 1, { stage: st.id, herbCap: carried });

  /* ---------------- S3: lunch ---------------- */
  await openAt("prologue-s3");
  const tOpen = Date.now(); st = await stageState();
  while (!st.dlg && Date.now() - tOpen < 3000) { await h.wait(100); st = await stageState(); } // it opens after a short beat
  step("S3: the opening plays", st.cut === "s3.open" && st.dlg, st);
  for (let i = 0; i < 6 && st.cut; i++) { await h.tap("Enter", 60); await h.wait(300); st = await stageState(); }
  step("S3: the opening ends and the hero is free", !st.cut && !st.dlg, st);
  await h.tap("e", 60); await h.wait(250); // beside the table
  st = await stageState();
  step("S3: interact beside the table shows a line", st.dlg && !st.cut, st);
  await h.tap("Enter", 60); await h.wait(200);
  await scene(() => { window.__cuuVuc.scene.getScene("Stage").player.x = 205; }); await h.wait(250);
  await h.tap("e", 60); await h.wait(1500);
  st = await stageState();
  step("S3: talking to the Father starts the scene", st.cut === "s3.main", st);
  await h.tap("Escape", 60); await h.wait(200);
  await h.tap("ArrowDown", 50); await h.wait(150); await h.tap("Enter", 60); // pause → Bỏ qua cảnh
  const tSkip = Date.now(); st = await stageState();
  while (!st.narr && Date.now() - tSkip < 4000) { await h.wait(100); st = await stageState(); }
  step("S3: skipping from the pause menu ends the scene in its cards", st.narr && !st.paused, st);
  for (let i = 0; i < 4; i++) { await h.tap("Enter", 60); await h.wait(600); }
  st = await waitStage("prologue-s7");
  step("S3 → S7: the cards lead to the night square", st.id === "prologue-s7", st);

  /* ---------------- S7: Nanh Rễ ---------------- */
  await openAt("prologue-s7");
  await scene(() => { const sc = window.__cuuVuc.scene.getScene("Stage"); sc.boars.forEach((b) => b.destroy()); sc.player.x = 545; sc.player.herbs = 0; });
  await h.wait(300); await h.tap("e", 60); await h.wait(300);
  s = await h.snap();
  const cp = await scene(() => window.__cuuVucSave().checkpoint);
  step("S7: resting at the shrine refills the pouch and saves", s.shrineLit && s.p.herbs === 2 && cp === "s7-shrine", { lit: s.shrineLit, herbs: s.p.herbs, checkpoint: cp });

  await scene(() => { window.__cuuVuc.scene.getScene("Stage").player.x = 700; });
  s = await until((x) => x.engaged && x.boss.state !== "dormant", 3000);
  step("S7: the arena locks and the boss wakes", s.engaged && s.boss.state !== "dormant", { engaged: s.engaged, boss: s.boss.state });

  await h.down("i"); await h.wait(300);
  s = await h.snap();
  step("S7: holding I guards (block)", s.p.state === "block", { state: s.p.state });
  await h.up("i"); await h.wait(250);

  await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.herbs = 0; p.receive({ id: "ci-kill", rect: p.hurtbox(), damage: 999, knockback: 0, parryable: false }); });
  s = await until((x) => x.p.hp === 100 && !x.engaged, 4000);
  step("S7: death respawns at the shrine with the boss reset", Math.abs(s.p.x - 560) < 30 && !s.engaged && s.boss.hp === s.boss.maxHp && s.p.herbs === 2,
    { x: s.p.x, engaged: s.engaged, bossHp: s.boss.hp, herbs: s.p.herbs });

  await scene(() => { window.__cuuVuc.scene.getScene("Stage").player.x = 700; });
  await until((x) => x.engaged, 3000);
  await scene(() => { const sc = window.__cuuVuc.scene.getScene("Stage"); sc.boss.takeHit({ id: 99999, rect: null, damage: 9999, guardBreak: false, poise: 0, direction: 1 }); });
  s = await until((x) => x.choosing, 3000);
  step("S7: Nanh Rễ down opens the C2 choice", !!s.choosing, { boss: s.boss.state });
  await h.tap("1", 60); await h.wait(400);
  const flag = await scene(() => window.__cuuVucSave().flags.PRO_SOW_SPARED);
  step("S7: choice 1 saves PRO_SOW_SPARED = true", flag === true, { flag });
  await h.wait(3400);
  const card = await scene(() => !!window.__cuuVuc.scene.getScene("UI").card);
  step("S7: the end card shows", card, {});

  step("no console errors", h.log.errors.length === 0, { errors: h.log.errors.slice(0, 5) });
  await h.browser.close();
  console.log(fails.length ? `\n${fails.length} step(s) failed` : "\nall steps passed");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
