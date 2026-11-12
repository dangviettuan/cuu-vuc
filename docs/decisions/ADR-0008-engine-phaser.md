# ADR-0008 — Engine: Phaser 4 + TypeScript + Vite

Status: **Accepted**

## Decision

Cửu Vực is built with **Phaser 4** (4.2.1 at adoption), **TypeScript** (strict) and **Vite**. The game lives in `game/`.

- **Renderer:** WebGL. Phaser 4 deprecates the Canvas renderer.
- **Display:** **640×360** logical resolution, `pixelArt: true`, `roundPixels: true` (v4 defaults it to false), and `Scale.FIT` with centring (Art Bible §2).
- **Physics:** **Arcade** for the greybox. Whether to move to custom collision for final combat feel will be decided after the greybox.
- **Art pipeline (greybox):** sprites are **generated at boot** from the same pixel builders as the concept generator (`docs/06-art/concept-v0.1/`), using the locked palettes. They are replaced by authored pixel art later, frame by frame.
- **Platforms:** web first. Desktop packaging (e.g. Tauri or Electron) will be decided before the vertical slice.

## Reason

- The project owner chose Phaser.
- It fits a 2D, side-scrolling pixel-art game with fast iteration and web distribution for a public project.
- The Phaser 4 package ships v3→v4 migration notes (`node_modules/phaser/skills/`). The API used here (Arcade physics, sprites, scenes, input, cameras) is stable across both.

## Consequences

- Combat timing from the Combat & Class Bible is expressed in **milliseconds** (frames × 16.67) in `game/src/tuning.ts`.
- Flags (ADR-0007) and saves will be plain TypeScript and JSON. There is no engine lock-in for narrative data.
- If Phaser 4 proves unstable for a needed feature, **3.90** is the fallback. The prototype avoids v4-only APIs except `setTintMode`.
