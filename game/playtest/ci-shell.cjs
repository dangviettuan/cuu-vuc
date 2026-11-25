/**
 * CI test of the game shell (Phase 1 foundations): the real boot flow, not quick mode.
 * Title → New game → name entry (a Vietnamese name, typed as text) → stage → pause → options (difficulty, rebinding)
 * → back to the title → Continue from the shrine save. Real key input throughout; one teleport (DEBUG-ASSISTED) moves
 * the hero to the shrine so the save can be tested without replaying the tutorial.
 *
 * Usage: GAME_URL=http://localhost:4173/ node playtest/ci-shell.cjs   (exit code 1 on any failure)
 */
process.env.TITLE = "1"; // keep the real boot flow (see harness.cjs withQuick)
const { launch } = require("./harness.cjs");

(async () => {
  const h = await launch().catch(() => null);
  // launch() waits for the stage; on the title there is none yet, so open the page ourselves if it timed out.
  const ctx = h || (await (async () => { throw new Error("launch failed"); })());
  const { page } = ctx;
  const fails = [];
  const step = (name, ok, info = {}) => { console.log(`${ok ? "PASS" : "FAIL"} ${name} ${JSON.stringify(info)}`); if (!ok) fails.push(name); };
  const active = () => page.evaluate(() => window.__cuuVuc.scene.getScenes(true).map((s) => s.scene.key));
  const until = async (fn, ms = 4000) => { const t = Date.now(); let v; while (Date.now() - t < ms) { v = await fn(); if (v) return v; await page.waitForTimeout(60); } return v; };
  const key = async (k, hold = 50) => { await page.keyboard.down(k); await page.waitForTimeout(hold); await page.keyboard.up(k); await page.waitForTimeout(120); };

  // Fresh start: no save, no settings.
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload({ waitUntil: "load" });
  let scenes = await until(async () => { const a = await active(); return a.includes("Title") ? a : null; }, 8000);
  step("boots to the title screen", !!scenes && scenes.includes("Title"), { scenes });

  // Continue is disabled without a save, so the cursor starts on New game.
  await key("Enter");
  scenes = await until(async () => { const a = await active(); return a.includes("NameEntry") ? a : null; });
  step("New game opens name entry", !!scenes, { scenes });

  await page.waitForTimeout(200);
  await key("Enter");
  const empty = await page.evaluate(() => window.__cuuVuc.scene.getScene("NameEntry").error.text);
  step("an empty name is refused", empty.length > 0, { msg: empty });
  const NAME = "Nguyễn Văn Ặn";
  await page.keyboard.insertText(NAME); // what an IME (Telex/VNI) produces: composed Unicode text
  await page.keyboard.press("Enter");
  scenes = await until(async () => { const a = await active(); return a.includes("Stage") ? a : null; }, 5000);
  const sv = await page.evaluate(() => window.__cuuVucSave());
  step("the name is saved (Unicode) and the stage starts", !!scenes && sv && sv.name === NAME, { name: sv && sv.name });
  const field = await page.evaluate(() => document.querySelectorAll("input").length);
  step("the name field is removed after entry", field === 0, { inputs: field });

  // Pause and resume.
  await page.waitForTimeout(400);
  await key("Escape");
  let paused = await page.evaluate(() => window.__cuuVuc.scene.isPaused("Stage"));
  step("Esc pauses the stage", paused, {});
  // Options → difficulty → Story (cursor: Resume, Options, Title).
  await key("ArrowDown"); await key("Enter");
  for (let i = 0; i < 4; i++) await key("ArrowDown"); // sfx volume, music, shake, flashes → difficulty
  await key("ArrowLeft");
  let st = await page.evaluate(() => JSON.parse(localStorage.getItem("cuu-vuc-settings") || "{}"));
  const wb = await page.evaluate(() => window.__cuuVuc.scene.getScene("Stage").player.windowBonus);
  step("difficulty changes, is saved and applies live", st.difficulty === "story" && wb > 0, { difficulty: st.difficulty, windowBonus: wb });

  // Controls → rebind "Chém" (light) to U.
  await key("ArrowDown"); await key("ArrowDown"); await key("ArrowDown"); await key("Enter"); // pixel → strip → controls → open
  await key("ArrowDown"); await key("Enter"); // jump → light, start capture
  await key("KeyU");
  st = await page.evaluate(() => JSON.parse(localStorage.getItem("cuu-vuc-settings") || "{}"));
  step("rebinding light to U is saved", JSON.stringify(st.bindings && st.bindings.keyboard && st.bindings.keyboard.light) === '["KeyU"]', { light: st.bindings && st.bindings.keyboard && st.bindings.keyboard.light });
  await key("Escape"); await key("Escape"); await key("Escape"); // controls → options → pause menu → resume
  paused = await page.evaluate(() => window.__cuuVuc.scene.isPaused("Stage"));
  step("Esc backs out of the menus and resumes", !paused, { paused });

  await page.waitForTimeout(300);
  await key("KeyU", 40);
  const swung = await until(() => page.evaluate(() => window.__cuuVuc.scene.getScene("Stage").player.state === "light"), 600);
  step("the rebound key swings", !!swung, {});

  // Rest at the shrine (DEBUG-ASSISTED teleport), then quit to the title and Continue.
  await page.evaluate(() => { const s = window.__cuuVuc.scene.getScene("Stage"); s.boars.forEach((b) => b.destroy()); s.player.x = 1425; });
  await page.waitForTimeout(300);
  await key("KeyE");
  const saved = await page.evaluate(() => window.__cuuVucSave().checkpoint);
  step("resting at the shrine saves the checkpoint", saved === "s1-shrine", { checkpoint: saved });
  await key("Escape"); await key("ArrowDown"); await key("ArrowDown"); await key("Enter"); // pause → Title
  scenes = await until(async () => { const a = await active(); return a.includes("Title") && !a.includes("Stage") ? a : null; });
  step("pause → title stops the stage", !!scenes, { scenes });
  await page.waitForTimeout(300);
  await key("Enter"); // Continue is enabled and selected first
  scenes = await until(async () => { const a = await active(); return a.includes("Stage") ? a : null; });
  const snap = await page.evaluate(() => { const s = window.__cuuVuc.scene.getScene("Stage"); return { x: Math.round(s.player.x), lit: s.shrineLit, mode: s.mode }; });
  step("Continue resumes at the lit shrine", !!scenes && snap.lit && Math.abs(snap.x - 1440) < 30 && snap.mode === "continue", snap);

  // Gamepad (a fake standard-mapping pad: headless Chromium has no real one). Start pauses, B backs out, X swings,
  // and prompts switch to button names.
  await page.evaluate(() => {
    const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
    window.__pad = { id: "fake", index: 0, connected: true, mapping: "standard", axes: [0, 0, 0, 0], buttons, timestamp: 0 };
    navigator.getGamepads = () => [window.__pad];
  });
  const btn = async (i, ms = 80) => {
    await page.evaluate((b) => { window.__pad.buttons[b].pressed = true; window.__pad.buttons[b].value = 1; }, i);
    await page.waitForTimeout(ms);
    await page.evaluate((b) => { window.__pad.buttons[b].pressed = false; window.__pad.buttons[b].value = 0; }, i);
    await page.waitForTimeout(120);
  };
  await btn(9);
  paused = await page.evaluate(() => window.__cuuVuc.scene.isPaused("Stage"));
  const label = await page.evaluate(() => window.__cuuVuc.scene.getScene("UI").stripLines[0].text);
  step("gamepad Start pauses, and prompts switch to buttons", paused && /\bX\b/.test(label), { paused, strip: label.slice(0, 40) });
  await btn(1);
  paused = await page.evaluate(() => window.__cuuVuc.scene.isPaused("Stage"));
  step("gamepad B backs out of pause", !paused, { paused });
  await page.waitForTimeout(200);
  await btn(2, 40);
  const padSwing = await until(() => page.evaluate(() => window.__cuuVuc.scene.getScene("Stage").player.state === "light"), 600);
  step("gamepad X swings", !!padSwing, {});

  step("no console errors", ctx.log.errors.length === 0, { errors: ctx.log.errors.slice(0, 5) });
  await ctx.browser.close();
  console.log(fails.length ? `\n${fails.length} step(s) failed` : "\nall steps passed");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
