/** Session 3 — complete playthrough from spawn with NO state manipulation: tutorial → boars → shrine → boss → ending. */
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
  s = await bot.snap(); step("boar 1 defeated (parry → riposte)", b1, { hp: s.p.hp, herbs: s.p.herbs });
  R.shots.push(await h.shot("f01-after-boar1"));
  await bot.moveTo(1120);
  const b2 = await bot.fightBoar(1240, "dodge");
  s = await bot.snap(); step("boar 2 defeated (dodge-through → combo)", b2, { hp: s.p.hp, herbs: s.p.herbs });

  // Shrine
  await bot.moveTo(1420);
  await h.tap("e", 50); await h.wait(300);
  s = await bot.snap(); step("shrine lit", s.shrineLit, { hp: s.p.hp });
  R.shots.push(await h.shot("f02-shrine"));

  // Boss, retry from the shrine after deaths (real respawn + walk back)
  for (let attempt = 1; attempt <= 5; attempt++) {
    await bot.moveTo(1600, 8);
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
      step(`respawn at shrine after death #${attempt}`, Math.abs(s.p.x - 1440) < 30 && s.p.hp === 100 && !s.engaged, { x: s.p.x, hp: s.p.hp, bossHp: s.boss.hp, bossState: s.boss.state });
    }
    if (res === "timeout") break;
  }

  // Ending choice
  s = await bot.snap();
  if (s.choosing) {
    R.shots.push(await h.shot("f06-choice"));
    await h.tap("1", 60); await h.wait(3600);
    R.shots.push(await h.shot("f07-ending-spare"));
    s = await bot.snap(); step("ending choice 1 (spare) recorded", s.finished, {});
    await h.tap("r", 50); await h.wait(1500);
    s = await bot.snap(); step("R restarts from the beginning", s.p.x < 100 && !s.finished && !s.shrineLit, { x: s.p.x });
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
