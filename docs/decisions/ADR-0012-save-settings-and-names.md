# ADR-0012 — Saves, settings and the protagonist's name

Status: **Accepted** (2026-11-25). Completes ADR-0004's open "length, filtering and validation" and implements ADR-0006 in code.

## Decision

### 1. Saves
- **One save slot** in the greybox and the vertical slice. Slots are a later decision.
- **When the game saves:**
  - **resting at a checkpoint** (ADR-0006): the checkpoint id, the herb pouch's capacity and the stage's one-time changes (herbs picked, brush cleared);
  - **choosing:** a choice's flags are written **at the moment of the choice**, so no story decision is lost to a crash before the next rest;
  - **finishing a stage** (its boss beaten and choice made).
- **Content:** a versioned JSON object (`v`), holding:
  - the name;
  - the current stage and checkpoint;
  - the herb capacity and the `taken` list;
  - the story **flags**;
  - the finished stages.
- **Storage:** `localStorage` on the web build. The format is engine-independent (ADR-0008), so desktop builds can write the same JSON to a file.
- **Flags are typed and registered.** Only flags listed in `game/src/core/flags.ts`, which mirrors `docs/04-chapters/flags-registry-v0.1.md`, can be written, and only with their declared type. Anything else is reported as a bug instead of being stored. A flag joins the code registry when the stage that owns it is built.
- **Continue** resumes at the last rested checkpoint. Enemies respawn there (Combat Bible §10); one-time pickups do not.
- **New game** over an existing save asks for confirmation first.

### 2. Settings
Settings belong to the player, not to a playthrough, so they are stored separately from the save. They are:
- volume and screen-shake strength;
- **reduced flashes:** hits darken instead of flashing white, and telegraph glows are halved or removed;
- **difficulty:** Story, Standard or Hard (Combat Bible §10). It can be changed at any time, and the narrative is identical across all three;
- **pixel-perfect scaling** (default: integer zoom, letterboxed) or fit-to-window;
- the bottom **controls strip** on or off;
- **key and button bindings.**

### 3. Input
- Every action can be performed on **keyboard or gamepad** (W3C standard mapping), and the seven gameplay actions can be **rebound** on each.
- Menu, pause and debug keys are fixed, so a player can never lock themselves out of the menus.
- A rebind that takes a key already used by another action **swaps** the two.
- **On-screen prompts show the key or button of the device used last,** with the player's bindings.

### 4. The protagonist's name (completes ADR-0004)
- **Typed in a real text field**, because Vietnamese is entered through an input method (Telex, VNI) that a canvas cannot receive. A gamepad can confirm or cancel.
- **Any script is accepted.** The name is **NFC-normalised**; control characters are removed; runs of spaces collapse; it is trimmed. It may be **up to 16 characters** (code points).
- **An empty name is refused**, and **there is no default name.** The protagonist has no canonical name (ADR-0004), so the game never supplies one. Test tools use a throwaway save under a separate storage key.
- **The name appears in text** wherever the string tables use `{name}` (dialogue speaker lines, for example).

## Reason

- **The vertical slice needs real saves:** chapters, flags consumed across chapters, and Continue. The review asked for them as Phase 1 foundations (REVIEW-2026-11-23 §5).
- **Saving flags at choice time** protects the game's central promise that choices persist.
- **Accessibility and comfort options** (flashes, shake, difficulty, rebinding, gamepad) are cheap now and expensive to retrofit.

## Consequences

- **Code:** `game/src/core/` (input, settings, save, flags, i18n, rng, mode), `game/src/scenes/` (Boot, Title, NameEntry, Stage, UI) and `game/src/ui/` (text, menu, options).
- **Strings** are in `game/src/data/strings.vi.ts`. Prompts use action placeholders (`{light}`, `{parry}`…), never literal key names.
- **Tests:** `game/playtest/ci-shell.cjs` checks the title, name entry, pause, options, rebinding and Continue on every push.
