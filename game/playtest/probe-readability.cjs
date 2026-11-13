/**
 * Screenshots of the cloud-playtest readability changes, taken during play driven by the bot (real input).
 * Part 1 plays from spawn (no state writes) and grabs the parry burst + J prompt at boar 1.
 * Part 2 is DEBUG-ASSISTED (teleport to the arena) and grabs each boss tell: charge windup, skid, winded, root warning.
 */
const { launch, save } = require("./harness.cjs");
const { makeBot } = require("./bot.cjs");
(async () => {
  const h = await launch(); const bot = makeBot(h); const got = {};
  const peek = () => h.page.evaluate(() => {
    const sc = window.__cuuVuc.scene.scenes[0], b = sc.boss;
    return { j: sc.jHint.visible, boss: b.state, anim: b.anim.name, roots: sc.roots.filter((r) => !r.done && r.marker.visible).length };
  });
  let stop = false;
  const grab = (async () => {
    while (!stop) {
      const s = await peek();
      const want = s.j ? "h01-parry-j-prompt" : s.anim === "low" ? "h02-charge-windup" : s.anim === "skid" ? "h03-charge-skid"
        : s.anim === "winded" ? "h04-winded" : s.roots > 0 ? "h05-root-warning" : null;
      if (want && !got[want]) { got[want] = true; await h.shot(want); }
      await h.wait(20);
    }
  })();
  await bot.moveTo(520, 5, 8000);
  for (let i = 0; i < 3; i++) { await h.tap("j", 40); await h.wait(220); }
  await bot.moveTo(780);
  const b1 = await bot.fightBoar(930, "parry");
  await h.debugTeleport(1600); await h.wait(1500);
  await h.shot("h00-arena-grove");
  const res = await bot.fightBoss({ chargeTactic: "dodge", maxMs: 60000 });
  stop = true; await grab;
  const R = { boar1: b1, boss: res, shots: got, errors: h.log.errors };
  save("probe-readability", R); console.log(JSON.stringify(R));
  await h.browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
