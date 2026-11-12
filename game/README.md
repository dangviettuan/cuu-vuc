# Cửu Vực — Greybox Prototype v0.1

The first playable slice, built to the scope of the Combat & Class Bible §11:

**Prologue S1** (forest-edge chores as the tutorial) → **shrine checkpoint** → **Nanh Rễ** (Prologue boss) → **choice C2** (spare or finish her). The choice sets `PRO_SOW_SPARED`.

Engine: **Phaser 4.2.1 + TypeScript + Vite** ([ADR-0008](../docs/decisions/ADR-0008-engine-phaser.md)).

## Run

```bash
cd game
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## Controls

| Action | Keys |
|---|---|
| Run | A / D or ← / → |
| Jump (hold for higher) | Space, W or ↑ |
| Light attack (3-hit string) | J |
| Heavy attack (hold to charge, 2 levels) | K |
| Dodge (i-frames) | Shift or L |
| Parry (then J within the window to **Riposte**) | I |
| Use herb (heals 35) | Q |
| Light the shrine (checkpoint, full heal) | E |
| Choice after the boss | 1 (spare) / 2 (finish her) |
| Restart after the ending | R |
| Show hitboxes | F1 |

## What is implemented

| System | Spec | Where |
|---|---|---|
| Move, jump with coyote time and jump buffer (6 frames each), variable jump height | Combat Bible §2 | `src/player.ts` |
| Light 3-hit string, heavy attack with 2 charge levels, dodge with 10 i-frames and a perfect window, parry (Kiếm Khách 12-frame window) | §2–3 | `src/player.ts`, `src/tuning.ts` |
| **Thế** stance pips (gained from parries) and **Riposte** (the Kiếm Khách signature) | §3 | `src/player.ts` |
| Stamina (the Souls-lite rule: you may act while above zero) | §2 | `src/player.ts` |
| Startled boar: telegraph, charge, stun; its charge is parryable | §9; Prologue §9 | `src/enemies.ts` |
| **Nanh Rễ**: three phases; charge (dodge only), tusk swipe (parryable, causes a stagger), root-burst (telegraphed spikes); poise break from heavy hits and ripostes | Prologue §9; §8 | `src/enemies.ts` |
| Shrine checkpoint; respawn resets the boss | ADR-0006; §10 | `src/scenes/Prologue.ts` |
| Choice C2 → `PRO_SOW_SPARED`, stored in `localStorage` and the scene registry | Prologue §7 | `src/scenes/Prologue.ts` |
| Generated pixel art from the locked concept picks (protagonist B, Nanh Rễ A, Thanh Mộc A) | Art Bible; concept v0.1 | `src/art.ts` |

## Animation & game feel (v0.3)

### Architecture
- **`src/anim.ts`: `Animator`.** A frame-timed clip player.
  - Each frame has its own duration, an optional **tag** (`windup` / `active` / `recovery`) and an optional **event** (`step`, `swing`, `slam`, `stomp`, `thud`, …).
  - **Priorities:** LOCO < SETTLE < ACTION < HURT < DEAD. A lower-priority request cannot interrupt a running clip of higher priority.
  - Re-requesting the clip that is already playing is a no-op, so there is no flicker.
- **`src/clips.ts`: every clip in one place.** Attack clips are **built from `tuning.ts`**: the windup, active and recovery frame runs add up exactly to each attack's startup/active/recovery timings.
- **Animation-driven hitboxes:** `Player.currentHit()` is open only on `active`-tagged frames.
- **Gameplay and presentation are separate.** `Player.update()` runs the gameplay state machine; `Player.present()` only chooses clips.
- **`src/fx.ts`: a pooled effects system** of 180 reusable images, stepped manually (no tweens, no per-frame allocation). It provides dust, directional sparks, impact bursts, slash arcs, afterimages, leaves, sparkles, rings and motes.
- **Hit-stop on simulation time:** gameplay time, physics and character animation freeze, while effects, camera shake and UI keep running in real time.

### What changed and why

| Problem (v0.2) | Fix (v0.3) |
|---|---|
| Feet slid: a fixed 12 fps run on a ramping velocity | An 8-frame run whose `timeScale` follows ground speed; `runStart`, `skid` (on reversing) and `stop` settle frames |
| Squash-and-stretch used fractional `setScale` and blurred the pixels | Removed. Drawn **takeoff / rise / apex / fall / land** frames instead |
| Attacks had one pose per phase and swings didn't vary | 2 windup → smear + hit → follow → settle frames per swing. Three distinct swings (down-diagonal, rising, overhead slam) with smear frames; you can re-aim during windup |
| Hit-stop paused physics but animation kept moving | Simulation-time hit-stop scaled to damage (30–115 ms); effects keep moving |
| Weak impacts | Directional sparks, impact bursts, white flash, eased knockback (≈0.2 s ease-out), shake scaled to damage, HP and boss bars with a draining damage trail |
| Enemies had 2 frames | Boar: idle, walk, paw (telegraph), gallop, stun, hurt, death. Nanh Rễ: idle (root sway), walk, head-down windup, gallop, rear, slam, toss, daze, flinch (only when not committed to an attack), 3-frame collapse |
| A static world | Grass that sways in a travelling gust and is brushed aside by the player; drifting light motes; falling yellow-veined leaves; a flickering shrine with rising motes and a light ring; herbs that glint and bob; pickup sparkle with floating text; an `E` prompt; footstep dust on run contact frames; the camera leans toward the facing direction |
| Allocations every frame | Hurtboxes, hitboxes and hit lists are reused; effects are pooled |

### Measured (headless Chromium, software WebGL, 10 s of continuous boss combat)
- **59.3 fps average, 58.1 minimum.** `update()` costs about **0.08 ms** per frame (0.24 ms peak).
- Object count stays constant (350 → 350): **no leaks**.

### What still needs real artwork
Code can't add what isn't drawn. Every frame here is **generated from a stick-and-block pose rig**, so the following need hand-drawn pixel art to reach professional indie quality:
1. **Protagonist turn-around and 3/4 poses.** Facing is a mirror flip; a real turn needs 2–3 drawn frames.
2. **Coat cloth simulation.** The coat hem is a rectangle offset per frame; proper drape and flutter need hand-drawn secondary motion.
3. **Faces and expressions.** The face is one eye pixel; hurt, effort and death need drawn faces.
4. **Weapon and arm foreshortening** in the overhead slam and the rising slash: the rig draws straight lines.
5. **Dodge.** A roll or slide with real body compression; the rig can only crouch.
6. **Death fall.** A drawn tumble between the kneel and lying frames (frames 2 and 3).
7. **Nanh Rễ.** Leg articulation (the rig slides rectangles), a real rearing pose (only the head and front legs move), and roots that react to hits.
8. **Boar.** Gallop with spine flex, and a hit reaction from the direction of the blow.

Clip timings, tags and events are already in place, so authored frames can replace generated textures one key at a time (`src/art.ts`) without touching gameplay.

## Level notes

- **Ledges are one-way platforms.** You can walk under them and jump up through them, and each sits within a full jump's reach (≤ 42 px).
- **Input uses an event-driven press queue** in `Prologue.ts`. Phaser's `JustDown` loses a tap that starts and ends within one frame. Presses made during hit-stop are kept until the next simulated frame.

## Known greybox simplifications

- **The class kit is merged into the Prologue.** In the final game the Prologue has no class (PB L9); Riposte is here only to test the Kiếm Khách loop.
- No audio, no gamepad, and no save system beyond the one flag.
- Arcade physics. Final collision feel will be decided after playtesting (ADR-0008).
- Tuning values are the Bible's starting targets. Expect to change them after the first playtest.

## Testing

Headless Chromium checks (Playwright) were run for v0.3. They are not yet in the repo, to avoid adding a dependency. Each check passed with no runtime errors:
- **Smoke:** clear the bush, meet the boars, damage the boss, take the C2 choice.
- **Walk-through:** walk under both ledges, land on a ledge, clear the bush with quick taps.
- **Timing:** stride `timeScale` matches ground speed; the hitbox is open only on `active` frames.
- **Stress:** the performance figures above.
