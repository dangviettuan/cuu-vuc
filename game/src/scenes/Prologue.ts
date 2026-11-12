import Phaser from "phaser";
import { registerTextures } from "../art";
import { Player, Controls } from "../player";
import { Boar, Bush, NanhRe, RootSpike } from "../enemies";
import { EnemyHit, Hittable, overlaps } from "../combat";
import { PLAYER, VIEW, WORLD } from "../tuning";

const ARENA = { min: 1520, max: 2160 };
const FLAG_KEY = "cuu-vuc-flags";

interface Herb { img: Phaser.GameObjects.Image; taken: boolean; }

/**
 * Greybox slice: Prologue S1 (forest-edge chores as tutorial) → shrine checkpoint → Nanh Rễ (S7) → choice C2.
 * Sources: docs/04-chapters/prologue-an-moc-v0.1.md, docs/05-gameplay/combat-class-bible-v0.1.md §11.
 */
export class PrologueScene extends Phaser.Scene {
  private player!: Player;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private bg!: Phaser.GameObjects.TileSprite;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private boars: Boar[] = [];
  private bush!: Bush;
  private boss!: NanhRe;
  private roots: RootSpike[] = [];
  private herbs: Herb[] = [];
  private piglets: Phaser.GameObjects.Sprite[] = [];
  private shrine!: Phaser.GameObjects.Image;
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
  private toastUntil = 0;
  private hitstopUntil = 0;
  /** Key codes pressed since the last update. Phaser clears justDown on key-up, so sub-frame taps would be lost. */
  private pressed = new Set<string>();

  constructor() { super("Prologue"); }

  create(): void {
    registerTextures(this);
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

    // Player.
    this.player = new Player(this, this.checkpoint.x, this.checkpoint.y);
    this.player.body2.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.solids);
    this.player.onEvent = (k) => this.onPlayerEvent(k);

    // S1 tutorial content.
    this.sign(110, "A/D hoặc ←/→: chạy\nSpace: nhảy (giữ để nhảy cao)");
    this.sign(420, "Bụi rậm chắn lối.\nJ: chém (3 nhát liên hoàn)");
    this.bush = new Bush(this, 470);
    this.physics.add.collider(this.player, this.bush.img);
    this.bush.onCleared = () => this.toast("Đã phát quang lối mòn.");
    this.addHerb(672, 262);
    this.addHerb(560, WORLD.groundY - 6);
    this.sign(600, "Thảo dược rừng.\nQ: dùng (hồi máu)");
    this.sign(790, "Lợn rừng hoảng loạn!\nShift: lướt né\nI: đỡ đúng lúc, rồi J: phản đòn\nK (giữ): chém mạnh");
    for (const [x, a, b] of [[930, 860, 1010], [1240, 1150, 1330]] as const) {
      const boar = new Boar(this, x, a, b);
      this.physics.add.collider(boar, this.solids);
      boar.onDeath = (bx) => { if (Math.random() < 0.6) this.addHerb(bx, WORLD.groundY - 6); };
      this.boars.push(boar);
    }
    this.addHerb(1080, 264);

    // Shrine checkpoint (ADR-0006).
    this.shrine = this.add.image(1420, WORLD.groundY, "shrine_off").setOrigin(0.5, 1).setDepth(5);
    this.sign(1380, "Miếu Mạch.\nE: thắp (điểm hồi sinh)");

    // Arena + boss.
    this.walls = this.physics.add.staticGroup();
    this.boss = new NanhRe(this, 1960, ARENA.min, ARENA.max);
    this.boss.facing = -1;
    this.physics.add.collider(this.boss, this.solids);
    this.boss.onRoots = (xs, warn) => xs.forEach((x, i) => this.roots.push(new RootSpike(this, x, warn + i * 40)));
    this.boss.onDown = () => this.bossDown();
    this.boss.onPhase = (p) => this.toast(p === 2 ? "Nanh Rễ gào lên. Rễ mọc dày hơn." : "Nanh Rễ liều mạng!");
    this.add.image(2130, WORLD.groundY, "bush").setOrigin(0.5, 1).setDepth(9).setScale(1.3);
    for (let i = 0; i < 3; i++) {
      const p = this.add.sprite(2112 + i * 12, WORLD.groundY, "piglet0").setOrigin(0.5, 1).setDepth(8);
      p.play({ key: "piglet", delay: i * 120 }); this.piglets.push(p);
    }

    // Camera.
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, 0, 40);
    this.cameras.main.setDeadzone(60, 40);

    // Input.
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard!.addKeys({
      left: K.A, right: K.D, left2: K.LEFT, right2: K.RIGHT,
      jump: K.SPACE, jump2: K.W, jump3: K.UP,
      light: K.J, heavy: K.K, dodge: K.SHIFT, dodge2: K.L, parry: K.I,
      herb: K.Q, interact: K.E, one: K.ONE, two: K.TWO, restart: K.R, debug: K.F1,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture([K.SPACE, K.UP, K.DOWN, K.LEFT, K.RIGHT, K.F1]);
    this.input.keyboard!.on("keydown", (e: KeyboardEvent) => { if (!e.repeat) this.pressed.add(e.code); });
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
    txt(VIEW.width / 2, VIEW.height - 15, "A/D chạy · Space nhảy · J chém · K giữ: chém mạnh · Shift né · I đỡ · Q thảo dược · E tương tác · F1 hitbox", 8, "#9aa1ad").setOrigin(0.5, 0);
    this.toast("Việc sáng: phát quang lối mòn cho trưởng làng.");
  }

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

  /** Short dust puffs at the feet (jump, land, dodge). */
  private puff(x: number, y: number, n = 3, dir = 0): void {
    for (let i = 0; i < n; i++) {
      const d = this.add.image(x + (i - (n - 1) / 2) * 5, y - 2, "dust").setDepth(9).setAlpha(0.8).setScale(0.7);
      this.tweens.add({
        targets: d, x: d.x + (dir || (i - (n - 1) / 2)) * 10, y: d.y - 6 - i * 2, alpha: 0, scale: 1.3,
        duration: 320 + i * 40, ease: "Quad.out", onComplete: () => d.destroy(),
      });
    }
  }

  /** Brief freeze on impact so hits read as heavy. */
  private hitstop(ms: number): void {
    if (this.hitstopUntil > this.time.now) return;
    this.hitstopUntil = this.time.now + ms;
    this.physics.world.pause();
    this.time.delayedCall(ms, () => this.physics.world.resume());
  }

  private sign(x: number, text: string): void {
    this.add.image(x, WORLD.groundY, "sign").setOrigin(0.5, 1).setDepth(4);
    this.label(x, WORLD.groundY - 26, text, 9, "#ebe6dc", { align: "center", backgroundColor: "#0b0d11cc", padding: { x: 4, y: 3 } })
      .setOrigin(0.5, 1).setDepth(4);
  }

  private addHerb(x: number, y: number): void {
    const img = this.add.image(x, y, "herb").setOrigin(0.5, 1).setDepth(6);
    this.tweens.add({ targets: img, y: y - 2, yoyo: true, repeat: -1, duration: 700, ease: "Sine.inOut" });
    this.herbs.push({ img, taken: false });
  }

  private toast(s: string, ms = 1800): void { this.toastText.setText(s); this.toastUntil = this.time.now + ms; }

  private onPlayerEvent(k: string): void {
    const p = this.player;
    if (k === "jump") this.puff(p.x, p.y, 2);
    if (k === "land") this.puff(p.x, p.y, 4);
    if (k === "dodge") this.puff(p.x, p.y, 3, -p.facing);
    if (k === "parry") { this.toast("Đỡ! Bấm J để phản đòn.", 900); this.cameras.main.shake(70, 0.004); this.hitstop(90); }
    if (k === "perfectDodge") this.toast("Né hoàn hảo!", 700);
    if (k === "riposte") this.toast("Phản đòn!", 600);
    if (k === "heal") this.toast(`Dùng thảo dược (+${PLAYER.herbHeal})`, 900);
    if (k === "hurt") this.cameras.main.shake(90, 0.006);
    if (k === "dead") this.time.delayedCall(1100, () => this.respawn());
  }

  private respawn(): void {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(260, () => {
      this.player.respawn(this.checkpoint.x, this.checkpoint.y);
      this.player.clearHitMemory();
      this.roots.forEach((r) => { r.sprite.destroy(); r.marker.destroy(); });
      this.roots = [];
      if (this.engaged && this.boss.isAlive()) {
        this.engaged = false; this.walls.clear(true, true);
        this.boss.reset(1960); this.boss.facing = -1;
        this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
        this.bossName.setVisible(false);
      }
      this.cameras.main.fadeIn(300);
      this.toast("Tỉnh lại ở miếu Mạch.");
    });
  }

  private engage(): void {
    this.engaged = true;
    for (const x of [ARENA.min - 8, ARENA.max + 8]) {
      const r = this.add.rectangle(x, WORLD.groundY / 2, 16, WORLD.groundY + 200).setVisible(false);
      this.walls.add(r);
    }
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.boss, this.walls);
    this.cameras.main.setBounds(ARENA.min, 0, ARENA.max - ARENA.min, WORLD.height);
    this.bossName.setVisible(true);
    this.toast("Nanh Rễ: rễ cây mọc xuyên qua da thịt nó.", 2000);
    this.time.delayedCall(900, () => this.boss.wake());
  }

  private bossDown(): void {
    this.choosing = true;
    this.roots.forEach((r) => { r.sprite.destroy(); r.marker.destroy(); }); this.roots = [];
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
      this.boss.setTexture("nanh0").play("nanh_run"); this.boss.facing = 1;
      this.walls.clear(true, true);
      this.tweens.add({ targets: [this.boss, ...this.piglets], x: "+=420", duration: 2600, ease: "Sine.in" });
      this.toast("Nó lết đi, bầy con chạy theo. Về phía nam.", 3000);
    } else {
      this.tweens.add({ targets: this.boss, alpha: 0, duration: 1400 });
      this.piglets.forEach((p) => p.anims.stop());
      this.toast("Làng an toàn. Bầy con nằm im trong bụi rậm.", 3000);
    }
    this.time.delayedCall(3200, () => {
      this.prompt.setText(`Hết bản greybox.\nPRO_SOW_SPARED = ${spared}\n\nR: chơi lại`).setVisible(true);
    });
  }

  update(time: number, delta: number): void {
    const k = this.keys;
    const tap = (...codes: string[]) => codes.some((c) => this.pressed.has(c));
    if (tap("F1")) this.showDebug = !this.showDebug;
    if (this.finished && tap("KeyR")) { this.pressed.clear(); this.scene.restart(); return; }
    if (this.choosing) {
      if (tap("Digit1", "Numpad1")) this.choose(true);
      else if (tap("Digit2", "Numpad2")) this.choose(false);
    }
    const c: Controls = {
      left: k.left.isDown || k.left2.isDown, right: k.right.isDown || k.right2.isDown,
      jumpHeld: k.jump.isDown || k.jump2.isDown || k.jump3.isDown,
      jumpPressed: tap("Space", "KeyW", "ArrowUp"),
      lightPressed: tap("KeyJ"), heavyHeld: k.heavy.isDown,
      dodgePressed: tap("ShiftLeft", "ShiftRight", "KeyL"), parryPressed: tap("KeyI"),
      herbPressed: tap("KeyQ"),
    };
    if (this.choosing || this.finished) { c.lightPressed = false; c.heavyHeld = false; }
    this.player.update(time, delta, c);
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.15 / 4;

    // Pickups and interactions.
    for (const h of this.herbs) {
      if (!h.taken && Math.abs(h.img.x - this.player.x) < 12 && Math.abs(h.img.y - this.player.y) < 30) {
        h.taken = true; h.img.destroy(); this.player.herbs++; this.toast("Nhặt được thảo dược.", 900);
      }
    }
    if (tap("KeyE") && Math.abs(this.player.x - this.shrine.x) < 30) {
      this.checkpoint = { x: this.shrine.x + 20, y: WORLD.groundY };
      this.shrine.setTexture("shrine_on");
      this.player.hp = PLAYER.maxHp;
      this.toast("Miếu Mạch đã thắp. Máu hồi đầy.");
    }
    if (!this.engaged && !this.finished && this.boss.isAlive() && this.player.x > ARENA.min + 30) this.engage();

    // Enemies.
    const px = this.player.x;
    this.boars = this.boars.filter((b) => b.active);
    this.boars.forEach((b) => b.tick(time, px));
    this.boss.tick(time, px);
    this.roots.forEach((r) => r.tick(time));
    this.roots = this.roots.filter((r) => !r.done);

    // Player → targets.
    const ph = this.player.currentHit();
    if (ph) {
      const targets: Hittable[] = [this.bush, ...this.boars, this.boss];
      for (const t of targets) {
        if (!t.isAlive() || !overlaps(ph.rect, t.hurtbox())) continue;
        const before = (t as { hp?: number }).hp;
        t.takeHit(ph);
        if ((t as { hp?: number }).hp !== before) {
          this.cameras.main.shake(ph.guardBreak ? 90 : 45, ph.guardBreak ? 0.005 : 0.0025);
          this.hitstop(ph.guardBreak ? 80 : 45);
        }
      }
    }
    // Enemies → player.
    const incoming: EnemyHit[] = [...this.boars.flatMap((b) => b.hits()), ...this.boss.hits()];
    for (const r of this.roots) { const h = r.hit(time); if (h) incoming.push(h); }
    const hb = this.player.hurtbox();
    for (const h of incoming) if (overlaps(h.rect, hb)) this.player.receive(h);

    this.pressed.clear();
    this.drawHud(time);
    this.drawDebug(ph?.rect ?? null, incoming);
  }

  private drawHud(now: number): void {
    const g = this.hud, p = this.player;
    g.clear();
    g.fillStyle(0x0b0d11, 0.8).fillRect(8, 8, 124, 20);
    g.fillStyle(0x3a2a2a, 1).fillRect(10, 10, 120, 6);
    g.fillStyle(0xb8574a, 1).fillRect(10, 10, 120 * (p.hp / PLAYER.maxHp), 6);
    g.fillStyle(0x2a3a34, 1).fillRect(10, 19, 120, 4);
    g.fillStyle(0x62d3c3, 1).fillRect(10, 19, 120 * (p.stamina / PLAYER.maxStamina), 4);
    for (let i = 0; i < PLAYER.maxThe; i++) {
      g.fillStyle(i < p.the ? 0xf6e7a0 : 0x3a3f48, 1).fillRect(136 + i * 8, 10, 6, 6);
    }
    this.hudText.setText(`Thảo dược × ${p.herbs}`);
    if (this.engaged && this.boss.isAlive()) {
      const w = 300, x = (VIEW.width - w) / 2, y = VIEW.height - 22;
      g.fillStyle(0x0b0d11, 0.8).fillRect(x - 2, y - 2, w + 4, 8);
      g.fillStyle(0x3a2a2a, 1).fillRect(x, y, w, 4);
      g.fillStyle(0x7fa65a, 1).fillRect(x, y, w * (this.boss.hp / this.boss.maxHp), 4);
    } else if (!this.boss.isAlive()) this.bossName.setVisible(false);
    this.toastText.setVisible(now < this.toastUntil);
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
}
