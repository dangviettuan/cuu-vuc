/**
 * CI: Chapter I end to end (Phase 3). DEBUG-ASSISTED like ci-smoke: scenes are skipped from the pause menu (choices
 * are answered), teleports set up each beat, and enemies fall to a forced hit, so the result does not depend on fights.
 * It walks I-1 → I-7: the road; Mộc Thành (Diệp, Ngàn, the night, the four mentors); the class choice and training;
 * the trail and the optional Làng Khê; Rừng Sâu (the roots part, Độc Đằng, the antidotes); the grove (Mộc Giác, the
 * absorption grants Rễ Giữ); the Cut (the gauntlet, Hùng, Cương, C1); the return and the end card.
 *
 * Usage: GAME_URL=http://localhost:4173/ node playtest/ci-ch1.cjs   (CLASS=1 Kiếm Khách | 2 Ảnh Vệ; C1=1 | 2 | 3)
 * Exit code 1 on any failed step or console error.
 */
const { launch, withQuick } = require("./harness.cjs");
const BASE = process.env.GAME_URL || "http://localhost:5173/", CLASS = process.env.CLASS || "1", C1 = process.env.C1 || "1";

(async () => {
  const h = await launch(); const { page } = h;
  const fails = [];
  const check = (name, ok, info = {}) => { console.log(`${ok ? "PASS" : "FAIL"} ${name} ${JSON.stringify(info)}`); if (!ok) fails.push(name); };
  const ev = (f, a) => page.evaluate(f, a);
  const st = () => ev(() => { const s = window.__cuuVuc.scene.getScene("Stage"), ui = window.__cuuVuc.scene.getScene("UI"); return { id: s.def && s.def.id, x: Math.round(s.player.x), cut: s.cutscene, narr: !!ui.narration, dlg: !!ui.dialogue, menu: !!(ui.dialogue && ui.dialogue.menu), card: !!ui.card, marks: [...s.marks], ally: s.ally ? Math.round(s.ally.x) : null }; });
  const save = () => ev(() => window.__cuuVucSave());
  /** Pause → "Bỏ qua cảnh". If the scene ended as the pause opened, the item is disabled: close the pause instead. */
  const skip = async () => {
    await h.tap("Escape", 60); await h.wait(200);
    const still = await ev(() => { const s = window.__cuuVuc.scene.getScene("Stage"); return !!s.cutscene && !s.inChoice; });
    if (!still) { await h.tap("Escape", 60); await h.wait(250); return; }
    await h.tap("ArrowDown", 50); await h.wait(150); await h.tap("Enter", 60); await h.wait(300);
  };
  /** Skip scenes to their end; a choice on screen is answered with `pick` (a skip never passes a choice). */
  const skipAll = async (pick) => {
    for (let i = 0; i < 40; i++) {
      const s = await st(), inChoice = await ev(() => window.__cuuVuc.scene.getScene("Stage").inChoice);
      if (inChoice) { await h.wait(650); await h.tap(s.menu ? pick || "1" : "Enter", 60); await h.wait(400); continue; }
      if (s.narr) { await h.wait(400); await h.tap("Enter", 60); await h.wait(300); continue; }
      if (!s.cut) return s;
      await skip();
    }
    return st();
  };
  const tp = (x) => ev((xx) => { const p = window.__cuuVuc.scene.getScene("Stage").player; p.x = xx; p.body.reset(xx, p.y - p.body.height - 4); }, x);
  const use = async (x) => { await tp(x); await h.wait(250); await h.tap("e", 60); await h.wait(300); };
  const waitStage = async (id, ms = 15000) => {
    const t = Date.now();
    for (;;) {
      const s = await st().catch(() => null);
      if (s && s.narr) { await h.wait(400); await h.tap("Enter", 60); }
      if (s && s.id === id && !s.narr) return s;
      if (Date.now() - t > ms) return s || {};
      await h.wait(200);
    }
  };
  const open = async (stage) => {
    const u = new URL(withQuick(BASE)); u.searchParams.set("stage", stage);
    await page.goto(u.toString()); await page.waitForFunction(() => window.__snap && window.__snap() !== null, null, { timeout: 15000 }); await h.wait(600);
  };
  const killFoes = () => ev(() => { const s = window.__cuuVuc.scene.getScene("Stage"); for (const f of [...s.foes]) f.takeHit({ id: Math.random() * 1e9, rect: null, damage: 9999, guardBreak: false, poise: 0, direction: 1 }); });
  const bossHp = (frac) => ev((f) => { const b = window.__cuuVuc.scene.getScene("Stage").boss; b.hp = Math.round(b.maxHp * f); }, frac);
  const killBoss = () => ev(() => { const b = window.__cuuVuc.scene.getScene("Stage").boss; b.takeHit({ id: Math.random() * 1e9, rect: null, damage: 99999, guardBreak: false, poise: 0, direction: 1 }); });

  // I-1: the road
  await open("ch1-road"); let s = await skipAll();
  await tp(640); await h.wait(400); s = await skipAll(); await tp(1000); await h.wait(500); s = await skipAll();
  await killFoes(); await h.wait(300); await tp(1540); await h.down("d"); await h.wait(800); await h.up("d");
  s = await waitStage("ch1-mocthanh"); check("I-1: the road leads to Mộc Thành", s.id === "ch1-mocthanh");
  // I-1 / I-2: Mộc Thành
  s = await skipAll();
  await use(585); s = await skipAll(); check("I-1: Diệp found (the half Mạch Ấn withheld)", s.marks.includes("diep") && s.marks.includes("withheld"), { marks: s.marks });
  await use(1748); s = await skipAll(); check("I-1: Ngàn heard", s.marks.includes("ngan"));
  await h.wait(800); s = await skipAll(); check("I-1: the night, then the morning of the mentors", s.marks.includes("morning"));
  for (const x of [935, 1080, 1226, 1436]) { await use(x); s = await skipAll(); }
  check("I-2: all four mentors met", ["met.en", "met.baReu", "met.toan", "met.laoTru"].every((m) => s.marks.includes(m)), { marks: s.marks });
  await use(s.ally); s = await skipAll(CLASS);
  const cls = (await save()).flags.CH1_CLASS;
  check("I-2: the class is chosen and saved", cls === (CLASS === "2" ? "anh" : "kiem"), { cls });
  s = await waitStage("ch1-training"); check("I-2: on to training", s.id === "ch1-training");
  await h.wait(600); s = await skipAll();
  for (let i = 0; i < 3; i++) await ev((e) => { window.__cuuVuc.scene.getScene("Stage").player.onEvent(e); }, CLASS === "2" ? "perfectDodge" : "parry");
  await h.wait(800); s = await st(); check("I-2: three of the class's own defences complete the training", s.marks.includes("i2.trained"), { marks: s.marks });
  s = await skipAll(); s = await waitStage("ch1-trail"); check("I-3: on to the trail", s.id === "ch1-trail");
  // I-3: the trail, then Làng Khê
  s = await skipAll(); await killFoes(); await h.wait(300);
  for (const x of [1300, 1690]) { await tp(x); await h.wait(500); s = await skipAll(); }
  await tp(2130); await h.wait(500); s = await skipAll("1");
  s = await waitStage("ch1-khe"); check("I-3: the Làng Khê detour taken", s.id === "ch1-khe");
  s = await skipAll(); await use(262); s = await skipAll(); await use(960); s = await skipAll(); await use(1150); s = await skipAll();
  check("Làng Khê: CH1_KHE_VISITED saved", (await save()).flags.CH1_KHE_VISITED === true);
  // I-4: Rừng Sâu and Độc Đằng
  s = await waitStage("ch1-deep"); check("I-4: on into Rừng Sâu", s.id === "ch1-deep");
  s = await skipAll(); await use(506); s = await skipAll();
  await killFoes(); await h.wait(300); await use(1936); s = await skipAll();
  check("I-4: both root walls part for him", s.marks.includes("parted1") && s.marks.includes("parted2"), { marks: s.marks });
  await tp(2200); await h.wait(1200); s = await skipAll();
  check("I-4: Độc Đằng's arena locks", await ev(() => window.__cuuVuc.scene.getScene("Stage").engaged));
  await killBoss(); await h.wait(1500); s = await skipAll();
  check("I-4: Diệp's leaves: two antidote slots", (await ev(() => window.__cuuVuc.scene.getScene("Stage").player.antidoteCap)) === 2);
  // I-5: the grove
  s = await waitStage("ch1-grove"); check("I-5: on to the grove", s.id === "ch1-grove");
  await tp(420); await h.wait(1200); s = await skipAll();
  await bossHp(0.5); await h.wait(600); s = await skipAll();
  await bossHp(0.25); await h.wait(600); s = await skipAll();
  await killBoss(); await h.wait(1500); s = await skipAll();
  const ma = (await save()).machAn || [];
  check("I-5: Mộc Giác falls; the absorption grants Rễ Giữ", ma.includes("reGiu"), { ma });
  // I-6: the Cut
  s = await waitStage("ch1-cut"); check("I-6: on to the Cut", s.id === "ch1-cut");
  s = await skipAll(); await killFoes(); await h.wait(800); s = await skipAll();
  check("I-6: the gauntlet cleared (the operatives run)", s.marks.includes("gauntlet"), { marks: s.marks });
  await tp(1950); await h.wait(1200); s = await skipAll();
  await killBoss(); await h.wait(1500); s = await skipAll(C1);
  const fate = (await save()).flags.CH1_SE_FATE;
  check("I-6: Hùng beaten, Cương, then C1 saved", fate === ["handed", "released", "forced"][Number(C1) - 1], { fate });
  // I-7: the return
  s = await waitStage("ch1-return"); check("I-7: back to Mộc Thành", s.id === "ch1-return");
  s = await skipAll(); await h.wait(1500); s = await st();
  check("I-7: the Móc Câu, and Chapter I's end card", s.card && (await save()).items.includes("mocCau"), { card: s.card });

  check("no console errors", h.log.errors.length === 0, { errors: h.log.errors.slice(0, 5) });
  await h.browser.close();
  console.log(fails.length ? `\n${fails.length} step(s) failed` : "\nall steps passed");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
