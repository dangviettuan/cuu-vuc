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

## Level notes

- **Ledges are one-way platforms.** You can walk under them and jump up through them, and each sits within a full jump's reach (≤ 42 px).
- **Input uses an event-driven press queue** in `Prologue.ts`. Phaser's `JustDown` loses a tap that starts and ends within one frame.

## Known greybox simplifications

- **The class kit is merged into the Prologue.** In the final game the Prologue has no class (PB L9); Riposte is here only to test the Kiếm Khách loop.
- **Animation v0.2:** a 6-frame breathing idle; a 6-frame run with arm swing and coat flutter; separate rising and falling jump frames; windup → strike → follow-through for light attacks; overhead → slam for the third light, heavy and riposte; dodge lean, guard, hurt and heal poses; and boss windup poses (head-down before a charge, rearing before a stomp). Feel effects: hit-stop, animated slash arcs, dust puffs, dodge afterimages, and squash-and-stretch on jump and land. Still generated, not hand-drawn.
- No audio, no gamepad, and no save system beyond the one flag.
- Arcade physics. Final collision feel will be decided after playtesting (ADR-0008).
- Tuning values are the Bible's starting targets. Expect to change them after the first playtest.

## Testing

A headless smoke test (Playwright with Chromium) was run during development:
- it drove the inputs, cleared the bush, met the boars, damaged the boss and took the C2 choice;
- it checked for runtime errors, and there were none.

The script is not part of the repo yet. Adding it as `npm run smoke` is a good next step.
