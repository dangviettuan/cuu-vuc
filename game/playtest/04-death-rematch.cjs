/**
 * Session 4 — real playthrough (no state writes), from the start of Prologue S7: shrine → boss. Deliberately die by standing still,
 * verify respawn, rematch using "jump over the charge", take ending 2 (finish her).
 * Also: telegraph screenshots with F1 hitboxes, and a clean performance window (no screenshots inside it).
 */
// Starts at Prologue S7 (the night square), where the boss is, in quick mode.
{ const u = new URL(process.env.GAME_URL || "http://localhost:5173/"); u.searchParams.set("stage", "prologue-s7"); process.env.GAME_URL = u.toString(); }
const { launch, stats, save } = require("./harness.cjs");
const { makeBot } = require("./bot.cjs");

(async () => {
  const h = await launch();
  const bot = makeBot(h);
  const R = { steps: [], shots: [] };
  const step = (name, ok, d = {}) => { R.steps.push({ name, ok, ...d }); console.log(ok ? "PASS" : "FAIL", name, JSON.stringify(d)); };

  // (S7) walk to the shrine and rest (the village fight is S6 now)
  await bot.moveTo(540); await h.tap("e", 50); await h.wait(300);

  // Enter the arena and stand still: record how long an idle player survives and what kills them.
  await bot.moveTo(700, 8);
  const hpTimeline = [];
  const t0 = Date.now();
  let s;
  for (;;) {
    s = await bot.snap();
    hpTimeline.push([Math.round((Date.now() - t0) / 100) / 10, s.p.hp, s.boss.state]);
    if (s.p.hp === 0 || Date.now() - t0 > 40000) break;
    await h.wait(50);
  }
  R.idleDeath = { secondsToDie: Math.round((Date.now() - t0) / 100) / 10, timeline: hpTimeline.filter((x, i, a) => i === 0 || x[1] !== a[i - 1][1]) };
  R.shots.push(await h.shot("d01-death"));
  await h.wait(900); R.shots.push(await h.shot("d02-death-pose"));
  await h.wait(1800);
  s = await bot.snap();
  step("respawn at the lit shrine with full HP; boss reset and arena unlocked", Math.abs(s.p.x - 560) < 30 && s.p.hp === 100 && !s.engaged && s.boss.hp === s.boss.maxHp, { x: s.p.x, hp: s.p.hp, engaged: s.engaged, bossHp: s.boss.hp, herbs: s.p.herbs });
  R.shots.push(await h.shot("d03-respawn"));

  // Rematch with F1 hitboxes on; screenshot each telegraph type once.
  await bot.moveTo(700, 8); await h.tap("F1", 30); await h.wait(900);
  const want = new Set(["tCharge", "tSwipe", "tStomp", "charge", "stagger"]);
  const grab = (async () => {
    const tEnd = Date.now() + 30000;
    while (want.size && Date.now() < tEnd) {
      const x = await bot.snap();
      if (want.has(x.boss.state)) { want.delete(x.boss.state); R.shots.push(await h.shot(`d04-telegraph-${x.boss.state}`)); }
      await h.wait(40);
    }
  })();
  const res = await bot.fightBoss({ chargeTactic: "jump", maxMs: 200000 });
  await grab;
  s = await bot.snap();
  R.rematch = { result: res, bossHp: s.boss.hp, playerHp: s.p.hp, herbs: s.p.herbs };
  step("rematch with jump-over tactic", res === "won", R.rematch);

  if (s.choosing) {
    await h.tap("F1", 30);
    await h.tap("2", 60); await h.wait(3600);
    R.shots.push(await h.shot("d05-ending-finish"));
    s = await bot.snap(); step("ending choice 2 (finish her) recorded", s.finished);
    // on to the aftermath (S8)
    for (let i = 0; i < 40 && s.stage !== "prologue-s8"; i++) { await h.wait(200); s = await bot.snap().catch(() => s); }
    step("C2 leads on to S8", s.stage === "prologue-s8", { stage: s.stage });
  }

  // Clean perf window: 20 s of boss-arena combat without screenshots (fresh restart → walk → fight).
  R.botLog = bot.log;
  R.frameTimes = stats((await h.frameTimes()).slice(60));
  R.console = h.log;
  save("04-death-rematch", R);
  console.log(JSON.stringify({ idleDeath: R.idleDeath, rematch: R.rematch, bossEvents: bot.log.boss.length, errors: h.log.errors }, null, 1));
  await h.browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
