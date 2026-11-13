/**
 * Playtest harness: drives the real game in Chromium with real (CDP-dispatched, trusted) keyboard input.
 *
 * "Eyes": screenshots + read-only snapshots of what is on screen (positions, HP, animation names).
 * "Hands": page.keyboard (Chrome DevTools Input.dispatchKeyEvent → trusted KeyboardEvents).
 * Nothing here writes game state, except helpers explicitly named debug*() — any test using them is
 * labelled DEBUG-ASSISTED in the report.
 *
 * Requires playwright-core and a Chromium (headless shell). Usage: node playtest/<script>.cjs
 */
const path = require("path");
const fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright-core")); }
catch { ({ chromium } = require(process.env.PW_CORE || "playwright-core")); }

const URL = process.env.GAME_URL || "http://localhost:5173/";
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

function chromiumPath() {
  const base = path.join(process.env.HOME, "Library/Caches/ms-playwright");
  const dirs = fs.existsSync(base) ? fs.readdirSync(base).filter((d) => d.startsWith("chromium_headless_shell")).sort() : [];
  if (!dirs.length) return undefined;
  const d = path.join(base, dirs[dirs.length - 1]);
  const sub = fs.readdirSync(d).find((s) => s.startsWith("chrome-headless-shell"));
  return path.join(d, sub, "chrome-headless-shell");
}

async function launch({ width = 960, height = 540 } = {}) {
  const browser = await chromium.launch({
    executablePath: chromiumPath(),
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-precise-memory-info"],
  });
  const page = await browser.newPage({ viewport: { width, height } });
  const log = { errors: [], warnings: [] };
  page.on("pageerror", (e) => log.errors.push(String(e.message)));
  page.on("console", (m) => {
    if (m.type() === "error") log.errors.push(m.text());
    else if (m.type() === "warning" && !/GPU stall/.test(m.text())) log.warnings.push(m.text());
  });
  // Frame-time logger + per-frame recorder (read-only observation).
  await page.addInitScript(() => {
    window.__ft = []; let last = performance.now();
    const loop = (t) => { window.__ft.push(t - last); last = t; if (window.__ft.length > 20000) window.__ft.splice(0, 10000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    window.__keys = [];
    window.addEventListener("keydown", (e) => { if (!e.repeat) window.__keys.push({ code: e.code, t: performance.now() }); }, true);
    window.__snap = () => {
      const g = window.__cuuVuc; if (!g) return null;
      const s = g.scene.getScene("Prologue"); if (!s || !s.player) return null;
      const p = s.player, b = p.body;
      const en = (e) => ({ x: Math.round(e.x), state: e.state, hp: e.hp, facing: e.facing, anim: e.anim ? e.anim.name : "", alive: e.hp > 0 });
      return {
        t: performance.now(), sim: s.sim,
        p: { x: +p.x.toFixed(1), y: +p.y.toFixed(1), vx: Math.round(b.velocity.x), vy: Math.round(b.velocity.y), state: p.state, anim: p.anim.name, tag: p.anim.tag || "", frame: p.texture.key, hp: p.hp, st: Math.round(p.stamina), the: p.the, herbs: p.herbs, facing: p.facing, grounded: p.grounded, hit: !!p.currentHit() },
        boars: s.boars.filter((x) => x.active).map(en),
        boss: s.boss ? { ...en(s.boss), phase: s.boss.phase } : null,
        roots: s.roots.map((r) => ({ x: Math.round(r.x), warnLeft: Math.round(r.bornAt + r.warn - s.sim) })),
        bush: s.bush.isAlive(), engaged: s.engaged, choosing: s.choosing, finished: s.finished, shrineLit: s.shrineLit,
        hitstop: s.hitstopLeft > 0, camX: Math.round(s.cameras.main.scrollX), fps: g.loop.actualFps,
      };
    };
    window.__rec = (ms) => new Promise((res) => { const out = []; const t0 = performance.now(); const f = () => { const s = window.__snap(); if (s) out.push(s); if (performance.now() - t0 < ms) requestAnimationFrame(f); else res(out); }; requestAnimationFrame(f); });
  });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForFunction(() => window.__snap && window.__snap() !== null, null, { timeout: 15000 });
  await page.waitForTimeout(600);
  const h = {
    browser, page, log,
    snap: () => page.evaluate(() => window.__snap()),
    rec: (ms) => page.evaluate((m) => window.__rec(m), ms),
    down: (k) => page.keyboard.down(k),
    up: (k) => page.keyboard.up(k),
    tap: async (k, hold = 60) => { await page.keyboard.down(k); await page.waitForTimeout(hold); await page.keyboard.up(k); },
    wait: (ms) => page.waitForTimeout(ms),
    shot: async (name, clipAroundPlayer = false) => {
      const file = path.join(SHOTS, name + ".png");
      if (clipAroundPlayer) {
        const s = await h.snap();
        const scale = width / 640;
        const x = Math.max(0, Math.min(width - 300, (s.p.x - s.camX) * scale - 150)), y = Math.max(0, Math.min(height - 200, (s.p.y) * scale - 170));
        await page.screenshot({ path: file, clip: { x, y, width: 300, height: 200 } });
      } else await page.screenshot({ path: file });
      return "shots/" + name + ".png";
    },
    frameTimes: () => page.evaluate(() => window.__ft.slice()),
    resetFrameTimes: () => page.evaluate(() => { window.__ft = []; }),
    memory: () => page.evaluate(() => (performance.memory ? { used: performance.memory.usedJSHeapSize, total: performance.memory.totalJSHeapSize } : null)),
    objects: () => page.evaluate(() => window.__cuuVuc.scene.getScene("Prologue").children.length),
    keyTimes: () => page.evaluate(() => window.__keys.slice()),
    /** DEBUG-ASSISTED: teleport (used only to set up isolated measurements; labelled in the report). */
    debugTeleport: (x) => page.evaluate((xx) => { const s = window.__cuuVuc.scene.getScene("Prologue"); s.player.setPosition(xx, 300); s.player.body.reset(xx, 300 - 72); }, x),
  };
  return h;
}

/** Stitch PNG files into one filmstrip using a blank page's canvas (no native image libs needed). */
async function filmstrip(h, files, out, cols = files.length, labels = []) {
  const datas = files.map((f) => "data:image/png;base64," + fs.readFileSync(path.join(__dirname, f)).toString("base64"));
  const ctx = await h.browser.newPage();
  const url = await ctx.evaluate(async ([datas, cols, labels]) => {
    const imgs = await Promise.all(datas.map((d) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = d; })));
    const w = imgs[0].width, hh = imgs[0].height, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement("canvas"); cv.width = cols * w; cv.height = rows * (hh + 16);
    const c = cv.getContext("2d"); c.fillStyle = "#0b0d11"; c.fillRect(0, 0, cv.width, cv.height);
    imgs.forEach((im, i) => { const x = (i % cols) * w, y = Math.floor(i / cols) * (hh + 16); c.drawImage(im, x, y); c.fillStyle = "#ebe6dc"; c.font = "12px sans-serif"; c.fillText(labels[i] || String(i), x + 4, y + hh + 12); });
    return cv.toDataURL("image/png");
  }, [datas, cols, labels]);
  fs.writeFileSync(path.join(SHOTS, out + ".png"), Buffer.from(url.split(",")[1], "base64"));
  await ctx.close();
  return "shots/" + out + ".png";
}

function stats(arr) {
  const a = arr.slice().sort((x, y) => x - y), n = a.length;
  if (!n) return {};
  const avg = a.reduce((s, v) => s + v, 0) / n;
  return { n, avg: +avg.toFixed(2), p50: +a[Math.floor(n * 0.5)].toFixed(2), p95: +a[Math.floor(n * 0.95)].toFixed(2), p99: +a[Math.floor(n * 0.99)].toFixed(2), max: +a[n - 1].toFixed(2) };
}

function save(name, data) {
  fs.writeFileSync(path.join(__dirname, "shots", name + ".json"), JSON.stringify(data, null, 1));
}

module.exports = { launch, filmstrip, stats, save };
