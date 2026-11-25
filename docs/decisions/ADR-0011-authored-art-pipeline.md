# ADR-0011 — Authored art pipeline: Aseprite atlases over generated frames

Status: **Accepted** (2026-11-25). **Amends** ADR-0008 "Art pipeline (greybox)".

## Decision

Authored pixel art is drawn in **Aseprite** and replaces the generated greybox frames **one frame at a time**, with no gameplay changes.

- **Sources:** `.aseprite` files live in `game/art/src/` (one file per character or prop).
- **Export:** a sprite sheet PNG plus a **Hash-format JSON** to `game/public/art/<name>.png` and `<name>.json`.
  - Example: `aseprite -b hero.aseprite --sheet ../../public/art/hero.png --data ../../public/art/hero.json --format json-hash --trim --filename-format "{tag}{tagframe}"`
  - Trimming is allowed; the loader restores the trim offset.
- **Registration:** each atlas name is listed in `game/public/art/manifest.json` (`{ "atlases": ["hero"] }`).
- **Frame names are the clip keys** in `game/src/clips.ts`, such as `p_run0`…`p_run7`, `p_aW1`, `nanh_rear0` or `boar_gal1`.
  - With Aseprite tags named after the key stems (`p_run`), `{tag}{tagframe}` produces `p_run0`… directly.
  - Single-frame keys without a number (`p_skid`, `p_parry`) need the exported name edited, or the key renamed in `clips.ts` and `art.ts` in the same change. At boot, every frame becomes a texture under its name (`game/src/scenes/Boot.ts`). The generator skips any key that already exists, so **an authored frame wins and anything not yet drawn stays generated.**
- **Cells keep the generated frames' geometry:**
  - protagonist: 72×76 with the feet at y = 72, centred at x = 36;
  - boar: 36×24;
  - Nanh Rễ: 100 px wide.
  - Hitboxes and the 1 px outline pass depend on this, so new sizes need a code change.
- **Timing stays in code.** Frame durations, the windup / active / recovery tags and events stay in `clips.ts`, built from `tuning.ts`. An artist changes how a frame **looks**, never how long it lasts. Timing changes are made in `tuning.ts`, and the review checks gameplay against them.

## Reason

- **The gameplay-timing layer is already professional; the frames are placeholders** (PLAYTEST_REPORT §E). This pipeline lets art land incrementally, starting with the highest-value set, without touching combat code:
  - hero run (8), idle (6), the three light swings, dodge (4), hurt (2) and death (4);
  - then Nanh Rễ;
  - then the boar.
- **Aseprite** is the standard tool for pixel animation, and its JSON export is supported directly by Phaser.

## Open

- **Who draws.** The project is public; a call for pixel artists goes into the README and the art docs. Until then, generated frames remain.
- **The art must follow the locked silhouettes and palettes:** concept picks v0.1, Art Bible §2–§5, and the reserved red.
