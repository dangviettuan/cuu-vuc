/**
 * Session 3 — complete playthrough from spawn with NO state manipulation: S1 (tutorial, boars, shrine) → S2 (the well)
 * → S3 (lunch) → S4 (the afternoon, C1) → S5 (the Father's room) → S6 (the village fight) → S7 (shrine, boss, C2) →
 * S8 (the keeper, the satchel, the roots, the station) → the end card.
 * C1 takes the prose branch (keep the Father's word) unless C1=1.
 */
const { launch, stats, save } = require("./harness.cjs");
const { makeBot } = require("./bot.cjs");

(async () => {
  const h = await launch();
  const bot = makeBot(h);
  const R = { steps: [], attempts: [], shots: [] };
  const step = (name, ok, d = {}) => { R.steps.push({ name, ok, ...d }); console.log(ok ? "PASS" : "FAIL", name, JSON.stringify(d)); };
  const mem0 = await h.memory(); const obj0 = await h.objects();
  const t0 = Date.now();

  // Tutorial
  await bot.moveTo(520, 5, 8000);
  let s = await bot.snap(); step("brush blocks", s.p.x < 462, { x: s.p.x });
  for (let i = 0; i < 3; i++) { await h.tap("j", 40); await h.wait(220); }
  await h.wait(300); s = await bot.snap(); step("brush cleared by combo", !s.bush);
  await bot.moveTo(560); await bot.moveTo(612);
  await h.down("d"); await h.tap("Space", 320); await h.wait(260); await h.up("d"); await h.wait(500);
  s = await bot.snap(); step("both herbs collected (one on the ledge)", s.p.herbs === 2, { herbs: s.p.herbs });

  // Boars
  await bot.moveTo(780);
  const b1 = await bot.fightBoar(930, "parry");
  s = await bot.snap(); step("boar 1 defeated (parry → counter)", b1, { hp: s.p.hp, herbs: s.p.herbs });
  R.shots.push(await h.shot("f01-after-boar1"));
  await bot.moveTo(1120);
  const b2 = await bot.fightBoar(1240, "dodge");
  s = await bot.snap(); step("boar 2 defeated (dodge-through → combo)", b2, { hp: s.p.hp, herbs: s.p.herbs });

  // Shrine
  await bot.moveTo(1420);
  await h.tap("e", 50); await h.wait(300);
  s = await bot.snap(); step("shrine lit", s.shrineLit, { hp: s.p.hp });
  R.shots.push(await h.shot("f02-shrine"));

  // Into the village: the card, then S2 (the well) and S3 (lunch) played line by line.
  // Lines that lead to a choice ignore confirm for 550 ms, so the pace here is a reader's, not a masher's.
  const advance = async (until, ms = 120000) => {
    const t1 = Date.now();
    for (;;) { const x = await bot.snap(); if (until(x) || Date.now() - t1 > ms) return x; if (x.dlg || x.narr) await h.tap("Enter", 50); await h.wait(220); }
  };
  await h.down("d"); await h.wait(2200); await h.up("d");
  s = await advance((x) => x.stage === "prologue-s2" && !x.narr && !x.cut);
  step("S1 → S2: the village, the opening played", s.stage === "prologue-s2", { stage: s.stage });
  await bot.moveTo(540, 6); await h.tap("e", 50); await h.wait(400);
  s = await bot.snap(); step("S2: looking into the well starts the scene", s.cut === "s2.well", { cut: s.cut });
  R.shots.push(await h.shot("s2-well"));
  s = await advance((x) => x.stage === "prologue-s3" && !x.narr && x.cut === "s3.open");
  s = await advance((x) => !x.cut && !x.dlg);
  step("S3: arrived home; the opening played", s.stage === "prologue-s3", { stage: s.stage });
  await bot.moveTo(205, 6);
  await h.tap("e", 50); await h.wait(400);
  s = await bot.snap(); step("S3: talking to the Father starts the scene", s.cut === "s3.main", { cut: s.cut });
  R.shots.push(await h.shot("s3-talk"));
  s = await advance((x) => x.stage === "prologue-s4" && !x.narr);
  step("S3 → S4: the scene played out to the afternoon", s.stage === "prologue-s4", { stage: s.stage });

  // S4: the leaves, the birds; the wounded bird; then the headman, the four men and C1
  s = await advance((x) => !x.cut && !x.dlg);
  await bot.moveTo(290, 6); await h.tap("e", 50); await h.wait(300);
  s = await advance((x) => !x.cut && !x.dlg);
  step("S4: the wounded bird scene played", s.marks.includes("bird"), { marks: s.marks });
  await bot.moveTo(1130, 6); await h.tap("e", 50); await h.wait(300);
  s = await advance((x) => x.menu);
  R.shots.push(await h.shot("s4-c1"));
  step("S4: the four men come back and the headman asks (C1)", s.menu, { cut: s.cut });
  await h.tap(process.env.C1 || "2", 60); await h.wait(400);
  const told = await h.page.evaluate(() => window.__cuuVucSave().flags.PRO_VILLAGE_TOLD);
  step("S4: C1 saved PRO_VILLAGE_TOLD", told === (process.env.C1 === "1"), { told });
  s = await advance((x) => x.stage === "prologue-s5" && !x.narr);

  // S5: bolt the door, take down the knife; the sound; then search the Father's room for the half Mạch Ấn
  s = await advance((x) => !x.cut && !x.dlg);
  for (const x of [36, 186]) { await bot.moveTo(x, 6); await h.tap("e", 50); await h.wait(300); s = await advance((y) => !y.cut && !y.dlg); }
  s = await advance((x) => x.marks.includes("room") && !x.cut && !x.dlg);
  step("S5: the sound from the forest opens the Father's room", s.marks.includes("room"), { x: s.p.x });
  for (const x of [318, 420, 470, 420]) { await bot.moveTo(x, 6); await h.tap("e", 50); await h.wait(300); s = await advance((y) => !y.cut && !y.dlg); }
  await bot.moveTo(446, 6); await h.tap("e", 50); await h.wait(300);
  s = await advance((x) => x.stage === "prologue-s6" && !x.narr);
  const items = await h.page.evaluate(() => window.__cuuVucSave().items);
  step("S5: the half Mạch Ấn found and saved; on into the night", s.stage === "prologue-s6" && items.includes("halfMachAn"), { items });

  // S6: out of the house, through the stampede (jump the runners), bà Dần's, the rooted boar, the square
  s = await advance((x) => !x.cut && !x.dlg);
  const hp6 = s.p.hp; let jumps = 0;
  for (const t1 = Date.now(); Date.now() - t1 < 40000;) {
    s = await bot.snap();
    if (s.marks.includes("rboar") && !s.cut && !s.dlg) break;
    if (s.cut || s.dlg) { await bot.hold(null); if (s.dlg) await h.tap("Enter", 50); await h.wait(220); continue; }
    if (s.runners.some((rx) => rx > s.p.x && rx - s.p.x < 64) && s.p.grounded) { await h.tap("Space", 150); jumps++; }
    await bot.hold("d"); await h.wait(20);
  }
  await bot.hold(null);
  step("S6: through the stampede to bà Dần's", s.marks.includes("dan"), { jumps, hpLost: hp6 - s.p.hp });
  const rb = await bot.fightBoar(880, "dodge", 90000);
  s = await advance((x) => x.marks.includes("rb.down") && !x.cut && !x.dlg);
  step("S6: the rooted boar bolts", rb && s.marks.includes("rb.down"), { hp: s.p.hp, herbs: s.p.herbs });
  await bot.moveTo(1060, 8);
  s = await advance((x) => x.stage === "prologue-s7" && !x.narr);
  step("S6 → S7: the square, then the gate breaks", s.stage === "prologue-s7", { stage: s.stage });
  R.shots.push(await h.shot("s7-start"));

  // S7: the shrine
  await bot.moveTo(540);
  await h.tap("e", 50); await h.wait(300);
  s = await bot.snap(); step("S7: shrine rested", s.shrineLit, { hp: s.p.hp, herbs: s.p.herbs });

  // Boss, retry from the shrine after deaths (real respawn + walk back)
  for (let attempt = 1; attempt <= 5; attempt++) {
    await bot.moveTo(700, 8);
    await h.wait(1000);
    R.shots.push(await h.shot(`f03-boss-intro-a${attempt}`));
    const startHp = (await bot.snap()).p.hp;
    const ta = Date.now();
    const res = await bot.fightBoss({ chargeTactic: "dodge", onPhase: async (p) => { R.shots.push(await h.shot(`f04-phase${p}-a${attempt}`)); } });
    s = await bot.snap();
    R.attempts.push({ attempt, result: res, seconds: Math.round((Date.now() - ta) / 1000), bossHpLeft: s.boss.hp, bossPhase: s.boss.phase, startHp, herbsLeft: s.p.herbs });
    console.log("attempt", attempt, res, "boss hp", s.boss.hp);
    if (res === "won") break;
    if (res === "died") {
      R.shots.push(await h.shot(`f05-death-a${attempt}`));
      await h.wait(2600); // death anim + fade + respawn
      s = await bot.snap();
      step(`respawn at shrine after death #${attempt}`, Math.abs(s.p.x - 560) < 30 && s.p.hp === 100 && !s.engaged, { x: s.p.x, hp: s.p.hp, bossHp: s.boss.hp, bossState: s.boss.state });
    }
    if (res === "timeout") break;
  }

  // C2, then S8: the square, the keeper, home for the satchel, the roots, the station
  s = await bot.snap();
  if (s.choosing) {
    R.shots.push(await h.shot("f06-choice"));
    await h.tap("1", 60); await h.wait(1500);
    R.shots.push(await h.shot("f07-ending-spare"));
    s = await bot.snap(); step("C2: choice 1 (spare) recorded", s.finished, {});
    s = await advance((x) => x.stage === "prologue-s8" && !x.cut && !x.dlg && !x.narr);
    step("C2 → S8: the aftermath at the square", s.stage === "prologue-s8", { stage: s.stage });
    // walk there (scenes on the way play out), settle on the spot, then interact
    const useAt = async (x, tol = 4) => {
      for (let i = 0; i < 12; i++) { // a trigger on the way stops the walk: play it out, walk on
        const y = await bot.moveTo(x, tol, 4000);
        await advance((z) => !z.cut && !z.dlg);
        if (Math.abs(y.p.x - x) <= tol) break;
      }
      await h.tap("e", 50); await h.wait(300);
      return advance((y) => !y.cut && !y.dlg);
    };
    await useAt(250);
    s = await useAt(560);
    step("S8: the keeper's hint and the Father's satchel", s.p.herbs === 3, { herbs: s.p.herbs });
    s = await useAt(1284);
    step("S8: the roots part for the half Mạch Ấn", s.marks.includes("parted"), {});
    await bot.moveTo(1460, 6, 6000);
    s = await advance((x) => x.stage === "prologue-s8-station" && !x.cut && !x.dlg && !x.narr);
    for (const x of [800, 732, 850, 900]) s = await useAt(x);
    await h.wait(400);
    s = await advance((x) => x.stage === "ch1-road" && !x.narr, 20000);
    const fin = await h.page.evaluate(() => ({ flags: window.__cuuVucSave().flags, items: window.__cuuVucSave().items, stage: window.__cuuVucSave().stage }));
    R.shots.push(await h.shot("f08-end"));
    step("S8: the station read, the rod taken, on into Chapter I", fin.stage === "ch1-road" && fin.flags.PRO_STATION_READ === true && fin.flags.PRO_KEEPER_HINT === true, fin);
  } else step("reached ending choice", false, { bossHp: s.boss.hp });

  R.minutes = +((Date.now() - t0) / 60000).toFixed(1);
  R.botLog = bot.log;
  R.frameTimes = stats((await h.frameTimes()).slice(60));
  R.memory = { start: mem0, end: await h.memory() }; R.objects = { start: obj0, end: await h.objects() };
  R.console = h.log;
  save("03-full-run", R);
  console.log(JSON.stringify({ attempts: R.attempts, minutes: R.minutes, deaths: bot.log.deaths, ft: R.frameTimes, mem: R.memory, obj: R.objects, errors: h.log.errors }, null, 1));
  await h.browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
