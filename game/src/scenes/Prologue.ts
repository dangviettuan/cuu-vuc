import Phaser from "phaser";
import { registerTextures } from "../art";
import { Player, Controls, PlayerEvent } from "../player";
import { Boar, Bush, EnemyEvent, NanhRe, RootSpike } from "../enemies";
import { EnemyHit, Hittable, PlayerHit, overlaps } from "../combat";
import { Animator } from "../anim";
import { HERB_GLINT, SHRINE_LIT } from "../clips";
import { Fx } from "../fx";
import { buildOutlines } from "../outline";
import { sfx, unlockAudio } from "../sfx";
import { PLAYER, VIEW, WORLD } from "../tuning";

const ARENA = { min: 1520, max: 2160 };
/** Arena walls sit *inside* the camera bounds so the hero's drawn sprite (wider than its 10 px body) is never cut off at the edge. */
const ARENA_WALL = 16;
const FLAG_KEY = "cuu-vuc-flags";

interface Herb { img: Phaser.GameObjects.Image; anim: Animator; baseY: number; phase: number; taken: boolean; }
interface Drift { img: Phaser.GameObjects.Image; x: number; y: number; vx: number; vy: number; phase: number; }

/**
 * Greybox slice: Prologue S1 (forest-edge chores as tutorial) → shrine checkpoint → Nanh Rễ (S7) → choice C2.
 * Sources: docs/04-chapters/prologue-an-moc-v0.1.md, docs/05-gameplay/combat-class-bible-v0.1.md §11.
 *
 * Time model: `sim` is gameplay time. Hit-stop freezes `sim` (and physics, and character animation)
 * while FX, camera shake and UI keep running on real time, so impacts read as heavy.
 */
export class PrologueScene extends Phaser.Scene {
  private player!: Player;
  /** Dark 1 px outline drawn just under the hero, above enemies (outline.ts). */
  private playerOutline!: Phaser.GameObjects.Image;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private bg!: Phaser.GameObjects.TileSprite;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private fx!: Fx;
  private boars: Boar[] = [];
  private bush!: Bush;
  private boss!: NanhRe;
  private roots: RootSpike[] = [];
  private herbs: Herb[] = [];
  private piglets: Phaser.GameObjects.Sprite[] = [];
  private tufts: Phaser.GameObjects.Image[] = [];
  private motes: Drift[] = [];
  private leaves: Drift[] = [];
  private shrine!: Phaser.GameObjects.Image;
  private shrineAnim!: Animator;
  private shrineLit = false;
  private checkpoint = { x: 60, y: WORLD.groundY };
  private engaged = false;
  private finished = false;
  private choosing = false;
  private hud!: Phaser.GameObjects.Graphics;
  private debug!: Phaser.GameObjects.Graphics;
  private showDebug = false;
  private toastText!: Phaser.GameObjects.Text;
  private hudText!: Phaser.GameObjects.Text;
  private bossName!: Phaser.GameObjects.Text;
  private prompt!: Phaser.GameObjects.Text;
  private keyHint!: Phaser.GameObjects.Text;
  private floatText!: Phaser.GameObjects.Text;
  private floatUntil = 0;
  private toastUntil = 0;
  /** Gameplay (simulation) time in ms; does not advance during hit-stop. */
  private sim = 0;
  private hitstopLeft = 0;
  private hpTrail: number = PLAYER.maxHp;
  private bossTrail = 1;
  private lookAhead = 0;
  private windAt = 0;
  private frameMs = 0;
  /** Key codes pressed since the last simulated update. Phaser clears justDown on key-up, so sub-frame taps would be lost. */
  private pressed = new Set<string>();
  private readonly incoming: EnemyHit[] = [];
  private readonly targets: Hittable[] = [];

  constructor() { super("Prologue"); }

  create(): void {
    registerTextures(this);
    buildOutlines(this, "p_");
    this.sim = 0; this.hitstopLeft = 0; this.engaged = false; this.finished = false; this.choosing = false;
    this.checkpoint = { x: 60, y: WORLD.groundY }; // R must restart from the beginning, not the last shrine (playtest I-06)
    this.boars = []; this.roots = []; this.herbs = []; this.piglets = []; this.tufts = []; this.motes = []; this.leaves = [];
    this.physics.world.setBounds(0, -200, WORLD.width, WORLD.height + 200);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height).setRoundPixels(true).setBackgroundColor("#1b2a1e");

    // Parallax: Thanh Mộc mood A (concept pick), drawn at ×4.
    this.bg = this.add.tileSprite(0, 0, VIEW.width, VIEW.height, "bg_thanhmoc").setOrigin(0).setScrollFactor(0).setTileScale(4, 4).setDepth(-10);
    const mid = this.add.graphics().setScrollFactor(0.5).setDepth(-5);
    for (let i = 0; i < 18; i++) {
      const x = i * 90 + (i % 3) * 23, w = 18 + (i % 4) * 6;
      mid.fillStyle(0x2c3a26, 1).fillRect(x, 0, w, WORLD.groundY);
      mid.fillStyle(0x354630, 1).fillRect(x + 3, 0, 2, WORLD.groundY);
    }

    // Ground and ledges.
    this.solids = this.physics.add.staticGroup();
    this.platform(0, WORLD.groundY, WORLD.width, VIEW.height - WORLD.groundY);
    // Ledges are one-way (land from above, walk underneath, jump up through) and sit
    // ≤ 42 px above the ground so a full 48 px jump clears them.
    this.platform(300, 270, 96, 10, true);
    this.platform(640, 264, 64, 10, true);
    this.platform(1040, 266, 80, 10, true);

    this.fx = new Fx(this, 180);
    this.ambience();

    // Player.
    this.player = new Player(this, this.checkpoint.x, this.checkpoint.y);
    this.playerOutline = this.add.image(0, 0, "p_idle0_ol").setOrigin(0.5, 1).setDepth(9.5);
    this.player.body2.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.solids);
    this.player.onEvent = (k) => this.onPlayerEvent(k);

    // S1 tutorial content.
    this.sign(110, "A/D hoặc ←/→: chạy\nSpace: nhảy (giữ để nhảy cao)");
    this.sign(420, "Bụi rậm chắn lối.\nJ: chém (3 nhát liên hoàn)");
    this.bush = new Bush(this, 470);
    this.physics.add.collider(this.player, this.bush.img);
    this.bush.onHit = (x, y) => { this.fx.leaves(x, y, 5); };
    this.bush.onCleared = () => { this.toast("Đã phát quang lối mòn."); this.fx.leaves(this.bush.img.x, WORLD.groundY - 12, 12); };
    this.addHerb(672, 262);
    this.addHerb(560, WORLD.groundY - 6);
    this.sign(600, "Thảo dược rừng.\nQ: dùng (hồi máu)");
    this.sign(790, "Lợn rừng hoảng loạn!\nShift: lướt né\nI: đỡ đúng lúc, rồi J: phản đòn\nK (giữ): chém mạnh");
    for (const [x, a, b] of [[930, 860, 1010], [1240, 1150, 1330]] as const) {
      const boar = new Boar(this, x, a, b);
      this.physics.add.collider(boar, this.solids);
      boar.onFx = (e, ex, ey) => this.onEnemyFx(e, ex, ey, boar.facing, 1);
      this.boars.push(boar);
    }

    // Shrine checkpoint (ADR-0006).
    this.shrine = this.add.image(1420, WORLD.groundY, "shrine_off").setOrigin(0.5, 1).setDepth(5);
    this.shrineAnim = new Animator(this.shrine);
    this.shrineLit = false;
    this.sign(1380, "Miếu Mạch.\nE: thắp (điểm hồi sinh)");

    // Arena + boss.
    this.walls = this.physics.add.staticGroup();
    this.boss = new NanhRe(this, 1960, ARENA.min, ARENA.max);
    this.boss.facing = -1;
    this.physics.add.collider(this.boss, this.solids);
    this.boss.onRoots = (xs, warn) => xs.forEach((x, i) => this.roots.push(new RootSpike(this, x, this.sim, warn + i * 40)));
    this.boss.onDown = () => this.bossDown();
    this.boss.onPhase = (p) => { sfx.roar(); this.toast(p === 2 ? "Nanh Rễ gào lên. Rễ mọc dày hơn." : "Nanh Rễ liều mạng!"); this.cameras.main.shake(220, 0.006); };
    this.boss.onFx = (e, ex, ey) => this.onEnemyFx(e, ex, ey, this.boss.facing, 2.2);
    this.add.image(2130, WORLD.groundY, "bush0").setOrigin(0.5, 1).setDepth(7);
    for (let i = 0; i < 3; i++) {
      const p = this.add.sprite(2112 + i * 12, WORLD.groundY, "piglet0").setOrigin(0.5, 1).setDepth(9);
      p.play({ key: "piglet", delay: i * 120 }); this.piglets.push(p);
    }

    // Camera: restrained smoothing, a small deadzone, and look-ahead in the facing direction.
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 40);
    this.cameras.main.setDeadzone(40, 36);

    // Input.
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard!.addKeys({ left: K.A, right: K.D, left2: K.LEFT, right2: K.RIGHT, jump: K.SPACE, jump2: K.W, jump3: K.UP, heavy: K.K }) as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture([K.SPACE, K.UP, K.DOWN, K.LEFT, K.RIGHT, K.F1]);
    this.input.keyboard!.on("keydown", (e: KeyboardEvent) => { unlockAudio(); if (!e.repeat) this.pressed.add(e.code); });
    this.pressed.clear();

    // HUD.
    this.hud = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.debug = this.add.graphics().setDepth(99);
    const txt = (x: number, y: number, s: string, size = 9, color = "#ebe6dc", extra: Phaser.Types.GameObjects.Text.TextStyle = {}) =>
      this.label(x, y, s, size, color, extra).setScrollFactor(0).setDepth(101);
    this.hudText = txt(10, 31, "", 9);
    this.toastText = txt(VIEW.width / 2, 50, "", 11, "#f6e7a0", { backgroundColor: "#0b0d11cc", padding: { x: 6, y: 3 } }).setOrigin(0.5, 0);
    this.bossName = txt(VIEW.width / 2, VIEW.height - 40, "NANH RỄ", 10, "#ebe6dc").setOrigin(0.5, 0).setVisible(false);
    this.prompt = txt(VIEW.width / 2, 110, "", 12, "#ebe6dc", { align: "center", backgroundColor: "#0b0d11dd", padding: { x: 10, y: 8 } }).setOrigin(0.5, 0).setVisible(false);
    // Controls strip: its own dark band and near-white text (cloud playtest: the old 8 px grey line was the hardest text to read).
    this.add.rectangle(0, VIEW.height - 15, VIEW.width, 15, 0x0b0d11, 0.86).setOrigin(0).setScrollFactor(0).setDepth(100);
    txt(VIEW.width / 2, VIEW.height - 13, "A/D chạy · Space nhảy · J chém · K giữ: chém mạnh · Shift né · I đỡ · Q thảo dược · E tương tác · F1 hitbox", 9, "#e4e7ec").setOrigin(0.5, 0);
    this.keyHint = this.label(0, 0, "E", 9, "#0b0d11", { backgroundColor: "#f6e7a0", padding: { x: 3, y: 1 } }).setOrigin(0.5, 1).setDepth(50).setVisible(false);
    this.floatText = this.label(0, 0, "", 9, "#f6e7a0").setOrigin(0.5, 1).setDepth(50).setVisible(false);
    this.toast("Việc sáng: phát quang lối mòn cho trưởng làng.");
  }

  /* ------------------------------------------------------------ helpers */

  /**
   * Text helper. pixelArt mode makes every texture NEAREST, which shreds high-resolution text when it is
   * downscaled; text textures alone are switched back to LINEAR so labels stay readable.
   */
  private label(x: number, y: number, s: string, size: number, color = "#ebe6dc", extra: Phaser.Types.GameObjects.Text.TextStyle = {}): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, s, { fontFamily: "Verdana, 'Segoe UI', Arial, sans-serif", fontSize: `${size}px`, color, resolution: 3, ...extra });
    t.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return t;
  }

  private platform(x: number, y: number, w: number, h: number, oneWay = false): void {
    this.add.tileSprite(x, y, w, Math.min(h, 16), "ground").setOrigin(0).setDepth(2);
    if (h > 16) this.add.tileSprite(x, y + 16, w, h - 16, "dirt").setOrigin(0).setDepth(2);
    const r = this.add.rectangle(x + w / 2, y + h / 2, w, h).setVisible(false);
    this.solids.add(r);
    if (oneWay) {
      const cc = (r.body as Phaser.Physics.Arcade.StaticBody).checkCollision;
      cc.down = false; cc.left = false; cc.right = false;
    }
  }

  /** Living-world details: swaying grass tufts, drifting light motes, falling Linh Suy leaves. */
  private ambience(): void {
    for (let x = 8; x < WORLD.width; x += 17 + ((x * 7) % 13)) {
      const t = this.add.image(x, WORLD.groundY + 1, "tuft1").setOrigin(0.5, 1).setDepth(3);
      t.setData("p", (x * 0.013) % (Math.PI * 2));
      this.tufts.push(t);
    }
    for (let i = 0; i < 22; i++) {
      const img = this.add.image(0, 0, "mote").setDepth(-4).setScrollFactor(0.7).setAlpha(0.7);
      this.motes.push({ img, x: Math.random() * VIEW.width * 1.5, y: 40 + Math.random() * 240, vx: 4 + Math.random() * 6, vy: -3 - Math.random() * 4, phase: Math.random() * 6 });
    }
    for (let i = 0; i < 6; i++) {
      const img = this.add.image(0, 0, "leaf0").setDepth(4);
      this.leaves.push({ img, x: Math.random() * VIEW.width, y: -Math.random() * 300, vx: 8, vy: 22 + Math.random() * 14, phase: Math.random() * 6 });
    }
  }

  private updateAmbience(now: number, dt: number): void {
    const cam = this.cameras.main, sec = dt / 1000;
    // grass: a travelling gust across the field, frames chosen from a shared wind phase (cheap: only every 120 ms)
    if (now - this.windAt > 120) {
      this.windAt = now;
      const px = this.player.x;
      for (const t of this.tufts) {
        if (t.x < cam.scrollX - 20 || t.x > cam.scrollX + VIEW.width + 20) continue;
        let w = Math.sin(now / 700 - t.x / 90 + (t.getData("p") as number));
        if (Math.abs(t.x - px) < 10 && Math.abs(this.player.body2.velocity.x) > 20) w = this.player.facing; // brushed aside
        const key = w > 0.45 ? "tuft2" : w < -0.45 ? "tuft0" : "tuft1";
        if (t.texture.key !== key) t.setTexture(key);
      }
    }
    for (const m of this.motes) {
      m.x += m.vx * sec; m.y += m.vy * sec + Math.sin(now / 900 + m.phase) * 0.15;
      if (m.y < 20) m.y = 300;
      const sx = cam.scrollX * 0.7;
      if (m.x < sx - 10) m.x += VIEW.width + 20; else if (m.x > sx + VIEW.width + 10) m.x -= VIEW.width + 20;
      m.img.setPosition(m.x, m.y).setAlpha(0.35 + 0.35 * Math.sin(now / 500 + m.phase));
    }
    for (const l of this.leaves) {
      l.x += (l.vx + Math.sin(now / 400 + l.phase) * 18) * sec; l.y += l.vy * sec;
      if (l.y > WORLD.groundY - 2 || l.x > cam.scrollX + VIEW.width + 20) { l.y = -10 - Math.random() * 120; l.x = cam.scrollX + Math.random() * VIEW.width; }
      l.img.setPosition(l.x, l.y);
      const key = Math.floor(now / 160 + l.phase) % 2 ? "leaf0" : "leaf1";
      if (l.img.texture.key !== key) l.img.setTexture(key);
    }
  }

  private sign(x: number, text: string): void {
    this.add.image(x, WORLD.groundY, "sign").setOrigin(0.5, 1).setDepth(4);
    // panel floats above head height so the hero never runs behind it (playtest I-12)
    this.add.rectangle(x, WORLD.groundY - 30, 1, 40, 0x4a3524).setOrigin(0.5, 0).setDepth(3);
    this.label(x, WORLD.groundY - 66, text, 9, "#ebe6dc", { align: "center", backgroundColor: "#0b0d11cc", padding: { x: 4, y: 3 } }).setOrigin(0.5, 1).setDepth(4);
  }

  private addHerb(x: number, y: number): void {
    const img = this.add.image(x, y, "herb0").setOrigin(0.5, 1).setDepth(6);
    const anim = new Animator(img); anim.play(HERB_GLINT); anim.update(Math.random() * 1500);
    this.herbs.push({ img, anim, baseY: y, phase: Math.random() * 6, taken: false });
  }

  private toast(s: string, ms = 1800): void { this.toastText.setText(s); this.toastUntil = this.time.now + ms; }

  private float(x: number, y: number, s: string): void {
    this.floatText.setText(s).setPosition(x, y).setVisible(true).setAlpha(1);
    this.floatUntil = this.time.now + 800;
  }

  /** Freeze gameplay briefly on impact. Scales with the hit; does not stack. */
  private hitstop(ms: number): void {
    if (ms <= this.hitstopLeft) return;
    this.hitstopLeft = ms;
    this.physics.world.pause();
  }

  private shake(strength: number): void {
    // strength ~ damage: light 10 → small, heavy 44 → strong; capped to keep pixels readable
    this.cameras.main.shake(40 + strength * 2.2, Math.min(0.009, 0.0012 + strength * 0.00016));
  }

  /* ------------------------------------------------------------ events */

  private onPlayerEvent(k: PlayerEvent): void {
    const p = this.player, f = p.facing;
    switch (k) {
      case "step": this.fx.dust(p.x - f * 4, p.y, 1, -f, 0.6); sfx.step(); break;
      case "skid": this.fx.dust(p.x + f * 6, p.y, 3, f, 0.8); sfx.step(); break;
      case "jump": this.fx.dust(p.x, p.y, 2, 0, 0.7); sfx.jump(); break;
      case "land": this.fx.dust(p.x, p.y, 4, 0, 1); sfx.land(); break;
      case "dodge": this.fx.dust(p.x, p.y, 3, -f, 1); sfx.dodge(); break;
      case "ghost": this.fx.afterimage(p.texture.key, p.x, p.y, p.flipX); break;
      case "swing": sfx.swing(p.slashLevel); this.fx.slash(p.x + f * 4, p.y - 32 + (p.slashLevel > 0 ? 2 : 0), p.slashLevel, f, p.rising); break;
      case "slam": this.fx.dust(p.x + f * 18, p.y, 3, f, 0.8); break;
      case "thud": this.fx.dust(p.x, p.y, 4, 0, 0.8); break;
      case "parry":
        sfx.parry();
        this.toast("Đỡ! Bấm J để phản đòn.", 900);
        this.fx.sparks(p.x + f * 12, p.y - 28, f, 10, 1.1); this.fx.impact(p.x + f * 12, p.y - 28, true);
        this.shake(18); this.hitstop(110);
        break;
      case "perfectDodge": this.toast("Né hoàn hảo!", 700); this.fx.sparkle(p.x, p.y - 24, 6, 0x9fd0c0); break;
      case "riposte": this.toast("Phản đòn!", 600); break;
      case "heal": sfx.heal(); this.float(p.x, p.y - 50, `+${PLAYER.herbHeal}`); this.fx.sparkle(p.x, p.y - 30, 8, 0x9cf0a4); break;
      case "hurt": sfx.hurt(); this.shake(16); this.hitstop(70); this.fx.sparks(p.x, p.y - 26, -f as 1 | -1, 6, 0.8); break;
      case "dead": sfx.death(); this.shake(24); this.hitstop(140); if (this.engaged) this.boss.stand(); this.time.delayedCall(1400, () => this.respawn()); break;
    }
  }

  private onEnemyFx(e: EnemyEvent, x: number, y: number, facing: 1 | -1, size: number): void {
    if (e === "step") this.fx.dust(x - facing * 10 * size, y, 1, -facing, 0.5);
    if (e === "paw") this.fx.dust(x + facing * 8 * size, y, 1, -facing, 0.9);
    if (e === "stomp") { this.fx.dust(x + facing * 30, y, 6, 0, 1.4); this.shake(20); sfx.stomp(); }
    if (e === "thud" || e === "dead") this.fx.dust(x, y, 5, 0, 1);
    if (e === "skid") { this.fx.dust(x + facing * 8, y, 4, facing, 1.2); sfx.step(); }
    // Localised telegraph cues (playtest I-03): where the attack comes from, plus a distinct sound per attack.
    if (e === "tellBoar") { sfx.tellBoar(); this.fx.dust(x + facing * 10, y, 2, -facing, 0.8); }
    if (e === "tellCharge") { sfx.tellCharge(); this.fx.dust(x - facing * 26, y, 5, -facing, 1.3); }
    if (e === "tellSwipe") sfx.tellSwipe();
    if (e === "glint") this.fx.sparkle(x, y, 6, 0xfff6d8);
    if (e === "tellStomp") { sfx.tellStomp(); for (let i = -2; i <= 2; i++) this.fx.dust(x + i * 14, y, 1, 0, 0.5); }
  }

  private respawn(): void {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(260, () => {
      this.player.respawn(this.checkpoint.x, this.checkpoint.y);
      this.player.clearHitMemory();
      this.roots.forEach((r) => r.destroy()); this.roots = [];
      this.hpTrail = PLAYER.maxHp;
      if (this.engaged && this.boss.isAlive()) {
        this.engaged = false; this.walls.clear(true, true);
        this.boss.reset(1960); this.boss.facing = -1; this.bossTrail = 1;
        this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
        this.bossName.setVisible(false);
      }
      this.cameras.main.fadeIn(300);
      this.toast(this.shrineLit ? "Tỉnh lại ở miếu Mạch." : "Tỉnh lại ở bìa rừng.");
    });
  }

  private engage(): void {
    this.engaged = true;
    for (const x of [ARENA.min + ARENA_WALL / 2, ARENA.max - ARENA_WALL / 2]) this.walls.add(this.add.rectangle(x, WORLD.groundY / 2, 16, WORLD.groundY + 200).setVisible(false));
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.boss, this.walls);
    this.cameras.main.setBounds(ARENA.min, 0, ARENA.max - ARENA.min, WORLD.height);
    this.bossName.setVisible(true);
    this.toast("Nanh Rễ: rễ cây mọc xuyên qua da thịt nó.", 2000);
    this.time.delayedCall(900, () => { this.boss.wake(); sfx.roar(); });
  }

  private bossDown(): void {
    this.choosing = true;
    this.shake(30); this.hitstop(160); sfx.bossDown();
    // frame the moment on her, not the arena edge (playtest I-14)
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.pan(Phaser.Math.Clamp(this.boss.x, ARENA.min + VIEW.width / 2, ARENA.max - VIEW.width / 2), cam.midPoint.y, 900, "Sine.easeInOut");
    this.roots.forEach((r) => r.destroy()); this.roots = [];
    this.piglets.forEach((p, i) => this.tweens.add({ targets: p, x: this.boss.x + 30 + i * 10, duration: 900, delay: 300 + i * 100 }));
    this.prompt.setText("Bầy con kêu ré từ bụi rậm.\n\n[1] Đuổi nó đi (tha)      [2] Kết liễu").setVisible(true);
  }

  private choose(spared: boolean): void {
    this.choosing = false; this.finished = true;
    this.prompt.setVisible(false);
    try {
      const flags = JSON.parse(localStorage.getItem(FLAG_KEY) || "{}");
      flags.PRO_SOW_SPARED = spared;
      localStorage.setItem(FLAG_KEY, JSON.stringify(flags));
    } catch { /* storage unavailable: the flag still lives in the registry */ }
    this.registry.set("PRO_SOW_SPARED", spared);
    if (spared) {
      this.walls.clear(true, true);
      this.boss.leave();
      this.piglets.forEach((p, i) => this.tweens.add({ targets: p, x: "+=440", duration: 6200, delay: 200 + i * 120 }));
      this.toast("Nó lết đi, bầy con chạy theo. Về phía nam.", 3000);
    } else {
      this.tweens.add({ targets: this.boss, alpha: 0, duration: 1400 });
      this.piglets.forEach((p) => p.anims.stop());
      this.toast("Làng an toàn. Bầy con nằm im trong bụi rậm.", 3000);
    }
    const epilogue = spared ? "Nó lết đi về phía nam. Bầy con chạy theo." : "Làng an toàn. Trong bụi rậm, bầy con nằm im.";
    this.time.delayedCall(3200, () => this.prompt.setText(`${epilogue}\n\n— Hết bản thử nghiệm —\nR: chơi lại`).setVisible(true));
  }

  /* ------------------------------------------------------------ frame */

  update(time: number, delta: number): void {
    const t0 = performance.now();
    const tap = (...codes: string[]) => codes.some((c) => this.pressed.has(c));
    if (tap("F1")) { this.showDebug = !this.showDebug; this.pressed.delete("F1"); }
    if (this.finished && tap("KeyR")) { this.pressed.clear(); this.scene.restart(); return; }
    if (this.choosing) {
      if (tap("Digit1", "Numpad1")) this.choose(true);
      else if (tap("Digit2", "Numpad2")) this.choose(false);
    }

    // Real-time systems (run during hit-stop too).
    this.fx.update(delta);
    this.updateAmbience(time, delta);
    this.shrineAnim.update(delta);
    if (this.shrineLit && Math.random() < delta / 260) this.fx.motes(this.shrine.x, this.shrine.y - 30, 1);
    for (const h of this.herbs) if (!h.taken) { h.anim.update(delta); h.img.y = Math.round(h.baseY - 1.5 - Math.sin(time / 380 + h.phase) * 1.5); }

    // Hit-stop: hold simulation, keep buffered input for the next simulated frame.
    let dt = delta;
    if (this.hitstopLeft > 0) {
      this.hitstopLeft -= delta;
      if (this.hitstopLeft > 0) { this.drawHud(time, delta); return; }
      this.physics.world.resume();
      dt = Math.min(delta, -this.hitstopLeft);
      this.hitstopLeft = 0;
    }
    this.sim += dt;
    const now = this.sim;

    const k = this.keys;
    const c: Controls = {
      left: k.left.isDown || k.left2.isDown, right: k.right.isDown || k.right2.isDown,
      jumpHeld: k.jump.isDown || k.jump2.isDown || k.jump3.isDown,
      jumpPressed: tap("Space", "KeyW", "ArrowUp"),
      lightPressed: tap("KeyJ"), heavyHeld: k.heavy.isDown,
      dodgePressed: tap("ShiftLeft", "ShiftRight", "KeyL"), parryPressed: tap("KeyI"),
      herbPressed: tap("KeyQ"),
    };
    if (this.choosing || this.finished) { c.lightPressed = false; c.heavyHeld = false; c.parryPressed = false; c.dodgePressed = false; }
    this.player.update(now, dt, c);
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.15 / 4;

    // Camera look-ahead: lean ~32 px toward the facing direction, eased.
    this.lookAhead += (-this.player.facing * 32 - this.lookAhead) * Math.min(1, dt / 400);
    this.cameras.main.setFollowOffset(Math.round(this.lookAhead), 40);

    // Pickups and interactions (with feedback).
    for (const h of this.herbs) {
      if (!h.taken && Math.abs(h.img.x - this.player.x) < 12 && Math.abs(h.img.y - this.player.y) < 30) {
        h.taken = true; h.img.destroy(); this.player.herbs++; sfx.pickup();
        this.fx.sparkle(h.img.x, h.baseY - 6, 8); this.float(h.img.x, h.baseY - 14, "+1 thảo dược");
      }
    }
    const nearShrine = Math.abs(this.player.x - this.shrine.x) < 30;
    this.keyHint.setVisible(nearShrine && !this.shrineLit).setPosition(this.shrine.x, this.shrine.y - 42 - Math.round(Math.sin(time / 250)));
    if (tap("KeyE") && nearShrine) {
      this.checkpoint = { x: this.shrine.x + 20, y: WORLD.groundY };
      this.player.hp = PLAYER.maxHp;
      if (!this.shrineLit) { sfx.shrine(); this.shrineLit = true; this.shrineAnim.play(SHRINE_LIT); this.fx.ring(this.shrine.x, this.shrine.y - 20); this.fx.motes(this.shrine.x, this.shrine.y - 30, 8); }
      this.toast("Miếu Mạch đã thắp. Máu hồi đầy.");
    }
    if (!this.engaged && !this.finished && this.boss.isAlive() && this.player.x > ARENA.min + 30) this.engage();

    // Enemies and hazards (simulation time).
    const px = this.player.x;
    this.boars = this.boars.filter((b) => b.active);
    for (const b of this.boars) b.tick(now, dt, px);
    if (this.boss.active) this.boss.tick(now, dt, px);
    this.bush.tick(time);
    this.separate();
    for (const r of this.roots) if (r.tick(now)) { this.fx.dust(r.x, WORLD.groundY, 2, 0, 0.8); sfx.roots(); }
    this.roots = this.roots.filter((r) => !r.done);

    // Player → targets.
    const ph = this.player.currentHit();
    if (ph) {
      this.targets.length = 0;
      this.targets.push(this.bush, ...this.boars, this.boss);
      for (const tg of this.targets) {
        if (!tg.isAlive() || !overlaps(ph.rect, tg.hurtbox())) continue;
        const before = tg.hp;
        tg.takeHit(ph);
        if (tg.hp !== before) this.onLanded(ph, tg);
      }
    }
    // Enemies → player.
    const inc = this.incoming; inc.length = 0;
    for (const b of this.boars) for (const h of b.hits()) inc.push(h);
    if (this.boss.active) for (const h of this.boss.hits()) inc.push(h);
    for (const r of this.roots) { const h = r.hitbox(now); if (h) inc.push(h); }
    const hb = this.player.hurtbox();
    for (const h of inc) if (overlaps(h.rect, hb)) this.player.receive(h);

    this.pressed.clear();
    this.syncOutline();
    this.drawHud(time, delta);
    this.drawDebug(ph?.rect ?? null, inc);
    this.frameMs = this.frameMs * 0.95 + (performance.now() - t0) * 0.05;
  }

  private syncOutline(): void {
    const p = this.player, o = this.playerOutline, key = p.texture.key + "_ol";
    if (o.texture.key !== key && this.textures.exists(key)) o.setTexture(key);
    o.setPosition(p.x, p.y).setFlipX(p.flipX).setVisible(p.visible).setAlpha(p.alpha);
  }

  /**
   * Soft push-out between the player and living enemies (playtest I-02: the player could stand inside the boss).
   * Half the overlap is resolved per frame, so it feels like bodies, not walls. Dodging passes through (i-frames).
   */
  private separate(): void {
    const p = this.player;
    if (p.state === "dodge" || p.isDead()) return;
    const pb = p.body2;
    for (const e of [...this.boars, this.boss]) {
      if (!e.active || !e.isAlive() || !(e.body as Phaser.Physics.Arcade.Body).enable) continue;
      const eb = e.body as Phaser.Physics.Arcade.Body;
      if (pb.bottom <= eb.y + 4 || pb.y >= eb.bottom) continue; // above it (e.g. jumping over a charge)
      const overlap = Math.min(pb.right, eb.right) - Math.max(pb.x, eb.x);
      if (overlap <= 0) continue;
      const side = p.x !== e.x ? Math.sign(p.x - e.x) : -e.facing;
      let push = side * Math.min(overlap, Math.max(2, overlap * 0.5));
      if (this.engaged) {
        // Never push the player into an arena wall (a large push could tunnel past Arcade's 4 px overlap bias and
        // leave the hero half off-screen). Whatever the wall absorbs moves the enemy away instead.
        const half = pb.width / 2;
        const target = Phaser.Math.Clamp(p.x + push, ARENA.min + ARENA_WALL + half, ARENA.max - ARENA_WALL - half);
        const rest = p.x + push - target;
        if (rest !== 0) { e.x -= rest; eb.x -= rest; }
        push = target - p.x;
      }
      p.x += push; pb.x += push;
    }
  }

  /** Impact feedback for a hit that actually dealt damage: sparks, burst, shake and hit-stop by strength. */
  private onLanded(ph: PlayerHit, tg: Hittable): void {
    const r = tg.hurtbox();
    const x = ph.direction > 0 ? Math.max(r.x, ph.rect.x) + 2 : Math.min(r.right, ph.rect.right) - 2;
    const y = Math.max(r.y + 6, Math.min(r.bottom - 6, ph.rect.centerY));
    if (tg === this.bush) { this.fx.sparks(x, y, ph.direction, 3, 0.6); this.hitstop(30); sfx.roots(); return; }
    const big = ph.guardBreak;
    sfx.hit(ph.damage);
    this.fx.sparks(x, y, ph.direction, big ? 12 : 6, big ? 1.3 : 1);
    this.fx.impact(x, y, big);
    this.shake(ph.damage);
    this.hitstop(big ? 70 + ph.damage : 40 + ph.damage);
  }

  private drawHud(now: number, dtMs: number): void {
    const g = this.hud, p = this.player;
    // damage trail: the white part of the bar drains after a short delay so the size of a hit is readable
    this.hpTrail = this.hpTrail > p.hp ? Math.max(p.hp, this.hpTrail - (dtMs / 1000) * 60) : p.hp;
    g.clear();
    g.fillStyle(0x0b0d11, 0.8).fillRect(8, 8, 124, 20);
    g.fillStyle(0x3a2a2a, 1).fillRect(10, 10, 120, 6);
    g.fillStyle(0xebe6dc, 1).fillRect(10, 10, Math.round(120 * (this.hpTrail / PLAYER.maxHp)), 6);
    g.fillStyle(0xb8574a, 1).fillRect(10, 10, Math.round(120 * (p.hp / PLAYER.maxHp)), 6);
    g.fillStyle(0x2a3a34, 1).fillRect(10, 19, 120, 4);
    g.fillStyle(0x62d3c3, 1).fillRect(10, 19, Math.round(120 * (p.stamina / PLAYER.maxStamina)), 4);
    for (let i = 0; i < PLAYER.maxThe; i++) g.fillStyle(i < p.the ? 0xf6e7a0 : 0x3a3f48, 1).fillRect(136 + i * 8, 10, 6, 6);
    this.hudText.setText(`Thảo dược × ${p.herbs}`);
    const boss = this.boss;
    if (this.engaged && boss.isAlive()) {
      const ratio = boss.hp / boss.maxHp;
      this.bossTrail = this.bossTrail > ratio ? Math.max(ratio, this.bossTrail - (dtMs / 1000) * 0.35) : ratio;
      const w = 300, x = (VIEW.width - w) / 2, y = VIEW.height - 22;
      g.fillStyle(0x0b0d11, 0.8).fillRect(x - 2, y - 2, w + 4, 8);
      g.fillStyle(0x3a2a2a, 1).fillRect(x, y, w, 4);
      g.fillStyle(0xebe6dc, 1).fillRect(x, y, Math.round(w * this.bossTrail), 4);
      g.fillStyle(0x7fa65a, 1).fillRect(x, y, Math.round(w * ratio), 4);
    } else if (!boss.isAlive()) this.bossName.setVisible(false);
    this.toastText.setVisible(now < this.toastUntil);
    if (this.floatText.visible) {
      const left = this.floatUntil - now;
      if (left <= 0) this.floatText.setVisible(false);
      else this.floatText.setY(this.floatText.y - dtMs * 0.02).setAlpha(Math.min(1, left / 300));
    }
  }

  private drawDebug(ph: Phaser.Geom.Rectangle | null, incoming: EnemyHit[]): void {
    const g = this.debug;
    g.clear();
    if (!this.showDebug) return;
    const hb = this.player.hurtbox();
    g.lineStyle(1, 0x62d3c3, 1).strokeRect(hb.x, hb.y, hb.width, hb.height);
    if (ph) g.lineStyle(1, 0xf6e7a0, 1).strokeRect(ph.x, ph.y, ph.width, ph.height);
    for (const t of [...this.boars, this.boss]) if (t.isAlive()) { const r = t.hurtbox(); g.lineStyle(1, 0x9aa1ad, 1).strokeRect(r.x, r.y, r.width, r.height); }
    for (const h of incoming) g.lineStyle(1, h.parryable ? 0xe8b04a : 0xff5050, 1).strokeRect(h.rect.x, h.rect.y, h.rect.width, h.rect.height);
  }

  /** For automated checks: average CPU ms spent in update() (smoothed). */
  get updateCostMs(): number { return this.frameMs; }
}
