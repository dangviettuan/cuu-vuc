/**
 * CI smoke test: the Prologue's spine, deterministic enough to gate every push.
 *
 * DEBUG-ASSISTED: teleports and one forced boss defeat replace the bot's fights, so the result does not depend on
 * random boss moves or frame timing. Three parts, each started in quick mode at its stage:
 * - S1 (morning): movement, the brush chore, a herb, the shrine, the exit into the village.
 * - S2 (the dry well): the opening, the well scene skipped to its end, on to S3.
 * - S3 (lunch): the opening lines, looking at a thing, talking to the Father, skipping the scene from the pause menu,
 *   the narration cards, arriving in S4.
 * - S4 (afternoon): the opening, the four men's scene skipped up to C1 (a skip stops at a choice), C1 saved, on to S5.
 * - S5 (the Father's room): his door shut until the bolt and the knife, the sound, the search, the half Mạch Ấn saved.
 * - S6 (the village at night): the stampede, C1's two versions of bà Dần's house, the rooted boar bolting, the square.
 * - S7 (night): the shrine, the arena lock, a block, death and respawn, Nanh Rễ down, the C2 choice and its flag,
 *   on to S8.
 * - S8 (the root path): the keeper's hint (flag), the roots shut until the satchel, the pouch growing, the roots
 *   parting; at the station the clues (PRO_STATION_READ), the rod, and the end card.
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
  let s = await h.snap(), mk = [];
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
  st = await waitStage("prologue-s2");
  const carried = await scene(() => window.__cuuVuc.scene.getScene("Stage").player.herbCap);
  step("S1 → S2: arrives at the village with the pouch carried over", st.id === "prologue-s2" && carried === 1, { stage: st.id, herbCap: carried });

  const skip = async () => { await h.tap("Escape", 60); await h.wait(200); await h.tap("ArrowDown", 50); await h.wait(150); await h.tap("Enter", 60); await h.wait(300); };
  const skipAll = async (ms = 6000) => { const t = Date.now(); let x = await stageState(); while (x.cut && Date.now() - t < ms) { await skip(); x = await stageState(); } return x; };
  const tp = (x) => scene((xx) => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.x = xx; p.body.reset(xx, p.y - p.body.height - 4); }, x);
  const marks = () => scene(() => [...window.__cuuVuc.scene.getScene("Stage").marks]);
  const use = async (x) => { await tp(x); await h.wait(200); await h.tap("e", 60); await h.wait(300); return skipAll(); };

  /* ---------------- S2: the dry well ---------------- */
  await h.wait(800); st = await stageState();
  step("S2: the opening plays", st.cut === "s2.open", st);
  await skipAll();
  await tp(540); await h.wait(200); await h.tap("e", 60); await h.wait(400);
  st = await stageState();
  step("S2: looking into the well starts the scene", st.cut === "s2.well", st);
  await skipAll();
  st = await waitStage("prologue-s3");
  step("S2 → S3: the scene ends at lunch", st.id === "prologue-s3", st);

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
  st = await waitStage("prologue-s4");
  step("S3 → S4: the card leads to the afternoon", st.id === "prologue-s4", st);

  /* ---------------- S4: the afternoon, C1 ---------------- */
  await openAt("prologue-s4");
  st = await stageState();
  const tOpen4 = Date.now(); while (!st.dlg && Date.now() - tOpen4 < 3000) { await h.wait(100); st = await stageState(); }
  step("S4: the opening plays", st.cut === "s4.open", st);
  st = await skipAll();
  const birdShown = await scene(() => window.__cuuVuc.scene.getScene("Stage").props.get("bird").visible);
  step("S4: skipping the opening still drops the wounded bird in the yard", !st.cut && birdShown, { ...st, birdShown });
  await tp(1130); await h.wait(200); await h.tap("e", 60); await h.wait(400);
  st = await stageState();
  step("S4: talking to the headman brings the four men back", st.cut === "s4.men", st);
  await skip();
  s = await until((x) => x.dlg, 3000);
  // the question, then its options (confirm is ignored for the first 550 ms of each: J is also attack)
  if (!s.menu) { await h.wait(650); await h.tap("Enter", 60); s = await until((x) => x.menu, 3000); }
  step("S4: a skip stops at the choice (C1)", s.menu && s.cut === "s4.men", { cut: s.cut, menu: s.menu });
  await h.tap("2", 60); await h.wait(400);
  const c1 = await scene(() => window.__cuuVucSave().flags.PRO_VILLAGE_TOLD);
  step("S4: choice 2 saves PRO_VILLAGE_TOLD = false", c1 === false, { c1 });
  st = await skipAll();
  for (let i = 0; i < 4; i++) { await h.tap("Enter", 60); await h.wait(600); }
  st = await waitStage("prologue-s5");
  step("S4 → S5: the cards lead home at night", st.id === "prologue-s5", st);

  /* ---------------- S5: the Father's room ---------------- */
  await openAt("prologue-s5");
  await h.wait(700); st = await skipAll();
  await tp(200); await h.down("d"); await h.wait(700); await h.up("d");
  st = await stageState();
  step("S5: the Father's room is shut at first", st.x < 228, st);
  await use(30); await use(186);
  await h.wait(600); st = await skipAll(); // the sound from the forest follows on its own
  mk = await marks();
  step("S5: bolting the door and taking the knife bring the sound; the room opens", mk.includes("bolt") && mk.includes("knife") && mk.includes("room"), { marks: mk });
  for (const x of [318, 420, 470, 420]) await use(x);
  await tp(446); await h.wait(200); await h.tap("e", 60); await h.wait(300); await skip();
  const tN5 = Date.now(); st = await stageState(); while (!st.narr && Date.now() - tN5 < 4000) { await h.wait(100); st = await stageState(); }
  const items = await scene(() => window.__cuuVucSave().items);
  step("S5: the search ends in the half Mạch Ấn, saved", st.narr && items.includes("halfMachAn"), { narr: st.narr, items });
  for (let i = 0; i < 3; i++) { await h.tap("Enter", 60); await h.wait(600); }
  st = await waitStage("prologue-s6");
  step("S5 → S6: on into the village", st.id === "prologue-s6", st);

  /* ---------------- S6: the night the forest changes ---------------- */
  await openAt("prologue-s6");
  await h.wait(700); st = await skipAll();
  await tp(170); await h.wait(300); st = await skipAll(); // the stampede's first lines
  await tp(400);
  s = await until((x) => x.runners.length > 0, 5000);
  step("S6: panicked animals run through the village", s.runners.length > 0, { runners: s.runners });
  await tp(710); await h.wait(400); st = await stageState();
  const kept = await scene(() => { const sc = window.__cuuVuc.scene.getScene("Stage"); return { ong: sc.npcs.get("ongDan").clip, frame: !!sc.props.get("frame") }; });
  step("S6 (C1 kept): bà Dần's porch is down, ông Dần under the frame", st.cut === "s6.trapped" && kept.ong === "lie" && kept.frame, { ...st, ...kept });
  await skipAll();
  s = await until((x) => x.boars.length > 0, 2000);
  const rooted = await scene(() => { const b = window.__cuuVuc.scene.getScene("Stage").boars[0]; return b ? b.rooted : null; });
  step("S6: the rooted boar turns on him", rooted === true, { boars: s.boars });
  await scene(() => { const b = window.__cuuVuc.scene.getScene("Stage").boars[0]; b.takeHit({ id: 99998, rect: null, damage: 999, guardBreak: false, poise: 0, direction: 1 }); });
  await h.wait(300);
  mk = await marks();
  const fled = await scene(() => { const b = window.__cuuVuc.scene.getScene("Stage").boars[0]; return b ? b.state : "gone"; });
  step("S6: beaten, it bolts (it does not die)", mk.includes("rb.down") && (fled === "flee" || fled === "gone"), { state: fled });
  st = await skipAll();
  await tp(1050); await h.wait(400); await skipAll();
  const tN6 = Date.now(); st = await stageState(); while (!st.narr && Date.now() - tN6 < 4000) { await h.wait(100); st = await stageState(); }
  step("S6: the square, then the cards", st.narr, st);
  for (let i = 0; i < 3; i++) { await h.tap("Enter", 60); await h.wait(600); }
  st = await waitStage("prologue-s7");
  step("S6 → S7: the gate breaks", st.id === "prologue-s7", st);

  await openAt("prologue-s6");
  await scene(() => { window.__cuuVucSave().flags.PRO_VILLAGE_TOLD = true; window.__cuuVuc.scene.getScene("Stage").scene.restart({ mode: "quick" }); });
  await h.wait(1200); await skipAll();
  await tp(170); await h.wait(300); await skipAll();
  const told = await scene(() => { const sc = window.__cuuVuc.scene.getScene("Stage"); return { ong: sc.npcs.get("ongDan").clip, frame: !!sc.props.get("frame") }; });
  await tp(710); await h.wait(400); st = await stageState();
  step("S6 (C1 told): the house stands, ông Dần is on his feet", st.cut === "s6.ready" && told.ong === "idle" && !told.frame, { ...st, ...told });

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
  st = await waitStage("prologue-s8", 9000);
  step("S7 → S8: after the choice, the aftermath at the square", st.id === "prologue-s8", st);

  /* ---------------- S8: the root path, the station ---------------- */
  await h.wait(600); await skipAll();
  await tp(1284); await h.wait(400); await skipAll(); // passing the house plays its two lines
  await h.tap("e", 60); await h.wait(300);
  st = await stageState(); mk = await marks();
  step("S8: the roots stay shut before the Father's satchel", st.dlg && !st.cut && !mk.includes("parted"), { ...st, marks: mk });
  await h.tap("Enter", 60); await h.wait(200);
  await tp(260); await h.wait(200); await h.tap("e", 60); await h.wait(300); await skipAll();
  const hint = await scene(() => window.__cuuVucSave().flags.PRO_KEEPER_HINT);
  step("S8: speaking to the keeper saves PRO_KEEPER_HINT", hint === true, { hint });
  const cap0 = await scene(() => window.__cuuVuc.scene.getScene("Stage").player.herbCap);
  await use(560); await skipAll();
  const sat = await scene(() => ({ cap: window.__cuuVuc.scene.getScene("Stage").player.herbCap, items: window.__cuuVucSave().items }));
  step("S8: the spare satchel grows the pouch and is saved", sat.cap === cap0 + 1 && sat.items.includes("spareSatchel"), { cap0, ...sat });
  await use(1284); await skipAll();
  await h.down("d"); await h.wait(2600); await h.up("d");
  const tN8 = Date.now(); st = await stageState(); while (!st.narr && st.id === "prologue-s8" && Date.now() - tN8 < 4000) { await h.wait(100); st = await stageState(); }
  step("S8: the roots part for the half Mạch Ấn and the way opens", st.narr || st.id !== "prologue-s8", st);
  for (let i = 0; i < 2; i++) { await h.wait(600); await h.tap("Enter", 60); }
  st = await waitStage("prologue-s8-station");
  step("S8: on into the forest, to the station", st.id === "prologue-s8-station", st);
  await h.wait(600); await skipAll();
  for (let i = 0; i < 2; i++) { await tp(640); await h.wait(400); await skipAll(); } // the deer, then the clearing
  for (const x of [800, 732, 850]) await use(x);
  await tp(900); await h.wait(200); await h.tap("e", 60); await h.wait(300); await skipAll();
  await h.wait(500);
  const fin = await scene(() => ({ read: window.__cuuVucSave().flags.PRO_STATION_READ, items: window.__cuuVucSave().items, card: !!window.__cuuVuc.scene.getScene("UI").card }));
  step("S8: every clue read, then the rod: PRO_STATION_READ, the rod kept, the end card", fin.read === true && fin.items.includes("thirdRod") && fin.card, fin);

  await openAt("prologue-s8-station");
  await h.wait(600); await skipAll();
  for (let i = 0; i < 2; i++) { await tp(640); await h.wait(400); await skipAll(); }
  await use(900); await h.wait(500);
  const unread = await scene(() => window.__cuuVucSave().flags.PRO_STATION_READ);
  step("S8: taking the rod without reading the ground leaves PRO_STATION_READ unset", unread === undefined, { unread });

  /* ---------------- Ch. I systems (the sandbox stage): poison, antidote, Rễ Giữ ---------------- */
  await openAt("ch1-sandbox");
  await tp(520); await h.wait(300); await tp(545); await h.wait(300);
  await tp(680); await h.wait(3500);
  const pz = await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; return { poisoned: p.poisoned, hp: p.hp, anti: p.antidotes }; });
  step("Ch. I: standing in poison mist poisons him (and he picked up antidotes)", pz.poisoned && pz.anti === 2, pz);
  await tp(560); await h.wait(400); await h.tap("q", 60); await h.wait(800);
  const cu = await scene(() => { const p = window.__cuuVuc.scene.getScene("Stage").player; return { poisoned: p.poisoned, anti: p.antidotes }; });
  step("Ch. I: Q while poisoned takes an antidote and cures it", !cu.poisoned && cu.anti === 1, cu);
  const rg = await scene(() => {
    const st = window.__cuuVuc.scene.getScene("Stage"), p = st.player, b = st.boars[0];
    p.x = b.x - 40; p.body.reset(p.x, p.y - p.body.height - 4); p.facing = 1;
    return true;
  });
  await h.wait(100);
  const anh = /[?&]kit=anh/.test(process.env.GAME_URL || "");
  await h.down(anh ? "Shift" : "i"); await h.wait(20);
  const bound = await scene((isAnh) => {
    const st = window.__cuuVuc.scene.getScene("Stage"), p = st.player, b = st.boars[0];
    p.receive({ id: "ci-def", rect: p.hurtbox(), damage: 10, knockback: 0, parryable: true });
    return { bound: b.bound, state: p.state, reGiu: st.reGiu, kit: isAnh };
  }, anh);
  await h.up(anh ? "Shift" : "i");
  step("Ch. I: a perfect defence with Rễ Giữ binds the enemy beside him", rg && bound.bound, bound);

  /* ---------------- Ch. I: the class from the save sets the kit (no ?kit= override) ---------------- */
  if (!/[?&]kit=/.test(process.env.GAME_URL || "")) {
    await openAt("prologue-s1");
    const cls = await scene(async () => {
      const g = window.__cuuVuc, st = g.scene.getScene("Stage");
      window.__cuuVucSave().flags.CH1_CLASS = "anh";
      const before = g.textures.get("p_aS").getSourceImage().toDataURL();
      st.scene.restart({ mode: "quick" });
      await new Promise((r) => setTimeout(r, 900));
      const after = g.textures.get("p_aS").getSourceImage().toDataURL();
      return { strip: g.scene.getScene("UI").stripLines[1].text, redrawn: before !== after, outline: g.textures.exists("p_aS_ol") };
    });
    step("Ch. I: CH1_CLASS = anh switches the kit and redraws the hero with twin blades", /Ảnh Kích/.test(cls.strip) && cls.redrawn && cls.outline, cls);
  }

  step("no console errors", h.log.errors.length === 0, { errors: h.log.errors.slice(0, 5) });
  await h.browser.close();
  console.log(fails.length ? `\n${fails.length} step(s) failed` : "\nall steps passed");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
