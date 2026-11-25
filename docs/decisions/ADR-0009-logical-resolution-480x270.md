# ADR-0009 — Logical resolution 480×270

Status: **Accepted** (2026-11-25). **Amends** the Art Bible §2 "Reference resolution" (640×360) and ADR-0008 "Display".

## Decision

The game renders at a **480×270** logical resolution (16:9). Sprite and tile sizes do **not** change: the tile is still 16 px, the protagonist 48 px, and the boss scale bands stay as they are. The camera simply shows less of the world, so everything reads larger.

- **Integer scales:** ×4 for 1920×1080, ×8 for 4K, ×2 for 960×540. On 2560×1440 the integer scale is ×5 with a thin letterbox (2400×1350).
- **Vertical framing:** worlds can be taller than the view. The camera is placed so the main lane's ground sits at roughly **75–80%** of the screen height. Vân Hải and Thiên Khuyết open the framing up, as before.
- **Boss arenas** can be wider than the view. The camera is bounded to the arena and scrolls inside it; the arena lock rule is unchanged.

## Reason

- **The playtest's readability problem.** In the greybox at 640×360, the 48 px hero filled 13% of the screen height and all the action sat in the bottom ~20% of the frame (PLAYTEST_REPORT I-08; REVIEW-2026-11-23 §4). At 480×270 the hero is about **18%** of the height, without redrawing a single sprite.
- **It is decided before any hand-drawn frame.** Every authored frame depends on how big a pixel appears on screen, so this had to be locked first (review D1).
- **Comparable games** in the genre frame their heroes at 15–20% of the screen height.

## Consequences

- **UI is laid out for 480×270.** The greybox HUD and the controls strip were re-laid out (`game/src/scenes/Prologue.ts`).
- **Text gets less room.** Labels must stay short; this matters for the pixel font choice, which must include full Vietnamese diacritics.
- **Levels show about 30 tiles across instead of 40.** Encounter spacing (telegraph distances, root-spike spreads, charge lengths) is tuned for what the player can see, so new encounters must be checked at this view width.
- **Implementation:** `VIEW` in `game/src/tuning.ts`; world-space sizes use `WORLD`, never `VIEW`.
