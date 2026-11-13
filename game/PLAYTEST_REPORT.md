# Cửu Vực — Playtest Report (Greybox v0.3, Prologue slice)

**Date:** 2026-11-13. **Build:** `main` @ `5f6abfb`, running from source with the Vite dev server.
**Tester:** Claude, acting as QA, game designer and game-feel reviewer. **Time in game:** about 25 minutes over 6 automated sessions and 4 isolated probes.
**Evidence:** `game/playtest/shots/` holds 40+ screenshots and per-session JSON logs. `game/playtest/*.cjs` holds the scripts, which can be re-run.
**Update:** sections A–G describe the baseline build. **Section H** covers the fix pass made afterwards, and the re-test results.

---

## How this was tested, and its limits

- **Real game, real input.** Chromium (Playwright, headless shell) loaded the dev build. Every action was a **real keyboard event** sent through Chrome DevTools (`page.keyboard`), so the game received genuine `KeyboardEvent`s.
- **Eyes = screenshots plus read-only snapshots** of what is on screen (positions, HP, the animation playing), sampled every frame where timing mattered. **No game state was written** in sessions 1–5.
- **Debug-assisted runs are labelled.** Three probes used a teleport *only to set up* an isolated measurement (`probe-riposte*.cjs`, `probe-swipe-parry.cjs`, a 20 s boss-state diagnostic). Their results are marked **DEBUG-ASSISTED** below.
- **A bot played the game.** I can't hold a controller, so a scripted "player" (`playtest/bot.cjs`) makes decisions from what is on screen.
  - It uses **learned timings**: it parries at the end of a telegraph it has learned, rather than on the frame the attack starts.
  - Its **reaction to positions is 10–30 ms**, while a human's is about 150–250 ms. Every difficulty statement accounts for that: **if anything, a human will find dodging the boss harder than these numbers show**, but the boss's damage output and the pacing of the fight are what they are.
- **I cannot hear or physically feel the game.** Judgements about "feel" are inferred from measured timings, frame captures and established practice in the genre. A short human playtest should confirm them (see §G).
- **Headless Chromium uses software WebGL** (SwiftShader). CPU costs are representative; GPU frame pacing is not.
- **The dev server:** your own server on `:5173` was already running. One test page on it reloaded unexpectedly mid-run, so sessions 4–5 and the later probes ran on a **separate server I started on `:5174`** (same source, no code changes).
- **Not tested:** audio (there is none), gamepad (not supported), different window sizes, a real GPU, a real human's perception.

---

## A. Executive summary

**First impression.** It opens quickly and the controls respond immediately: a key press shows on screen within 1 frame (8–14 ms measured). The forest has life: swaying grass, light motes, falling yellow-veined leaves. Within 30 seconds you're clearing brush with a 3-hit combo that has hit-stop, sparks and a slash arc. As a 5-minute prototype it's competent, and better than most greyboxes.

**What works well**
- **Responsiveness.** Input-to-pixel latency is about 1 frame. Full speed is reached in 66 ms and you stop in 50 ms. Coyote time and the jump buffer both work. Variable jump height works (21 px tap, 46 px hold).
- **Impact feedback.** Hit-stop scaled to damage, directional sparks, the white hurt-silhouette, and the HP bar's white damage trail all make hits readable.
- **Animation structure.** Separate windup, active and recovery phases; three distinct swing arcs; landing and skid frames. Attack hitboxes open exactly on the animation's active frames (verified frame by frame).
- **Technical health.** The game logic costs 0.05–0.4 ms per frame, there are no object leaks over repeated fights, and no console errors in any session.

**What disappoints**
- **There is no challenge.** The bot cleared the whole slice **on its first attempt, in 1.5 minutes, with zero deaths and 4 unused healing herbs**. A player who stands completely still survives **16.3 seconds** against the boss.
- **One loop solves everything.** Bait a charge, dodge or jump it, do a 3-hit combo during her 750 ms recovery (36 damage), repeat about 9 times. Against boars, parry → riposte **one-shots them** (40 damage vs 40 HP).
- **Nothing pushes you apart.** The player **walks into and through enemies**, and after the boss's charge you end up standing *inside* her while her swipes keep hitting you.
- **It still looks like a rig, not drawn animation.** The 48 px hero fills only 13% of the screen's height. **Feet slide about 15 px every step.** Telegraphs are a full-body amber flash that erases the creature's silhouette half the time.
- **The ending moment is buried.** She collapses behind a decorative bush at the edge of the arena, and the ending card shows a debug flag (`PRO_SOW_SPARED = true`).

**The biggest obstacle to fun:** **combat has no decisions in it.** Every enemy has one way to be beaten, the boss forgives everything (low damage, generous healing, long recovery windows), and nothing ever forces you to choose between attacking and defending. Feel and polish are on the right track; **the encounter design is what makes it a toy instead of a game.**

---

## B. Playthrough evidence

The result legend is PASS / FAIL / BLOCKED / NOT TESTED. **INFO** means a measured observation with no pass/fail criterion.

### B1. Movement and platforming (session 1, `01-movement.cjs`)

| Scenario | Actions | Observed | Expected | Result | Evidence |
|---|---|---|---|---|---|
| Acceleration | Hold D from rest | First motion on frame 2; **full speed (96 px/s) in 66 ms**; `idle → runStart → run` | Snappy and readable | PASS | `01-movement.json` |
| Deceleration and stop | Release D at full speed | **Stops in 50 ms**; the `stop` settle frame plays | Short, no slide | PASS | same |
| Change direction | Run right, press A | `skid` plays and the direction reverses in **133 ms**; the sprite faces the new way immediately | Clear turn | PASS (see I-11) | same |
| Jump: tap vs hold | Space for 40 ms vs 500 ms | **20.8 px** (367 ms airtime) vs **45.6 px** (450 ms); `takeoff → rise → apex → fall → land` | Variable height | PASS | `m02-jump-filmstrip.png` |
| Air control | Jump while holding D | Travels 83 px per full jump | Controllable | PASS | json |
| Land on ledge | Run and jump onto the ledge at x 300–396 | Lands at y=274 on top of it | Reachable | PASS | json |
| Coyote time | Walk off the ledge, press jump about 55 ms later | Jump fires (vy −294) | Grace jump | PASS | json |
| Jump buffer | Press jump about 70 ms before landing | Re-jumps on the landing frame | Buffered | PASS | json |
| Input latency | Key → first visible change | **Jump 7.7 ms, light 13.6 ms, dodge 13.2 ms, parry 13.5 ms** | ≤ 2 frames | PASS | json |
| Idle | Stand for 4 s | 6 breathing frames plus a blink | Alive, not busy | PASS | `m03-idle-filmstrip.png` |
| Run-cycle foot sliding | Run at full speed | **54.4 px travelled per 567 ms cycle. The rig's planted foot sweeps at most 12 px per half-cycle while the body moves 27 px, so each foot slides about 15 px per step.** | Feet stay planted | **FAIL** | json; I-07 |

### B2. Tutorial (sessions 2–4)

| Scenario | Observed | Result | Evidence |
|---|---|---|---|
| Brush blocks the trail | Player stops at x=457 | PASS | `t02-sign-brush.png` |
| 3-hit light combo | `light1 → light2 → light3` chains; whole string 1,050 ms; brush cleared | PASS | `t03-brush-cleared.png` |
| Ground herb pickup | Collected by walking over it | PASS | json |
| Ledge herb | Run, jump onto the ledge, collect it | PASS | `t04-ledge.png` |
| Tutorial signs | All readable, but **the sign panels sit at the hero's head and torso height**, so you run behind black boxes | PASS / issue I-12 | `m02-jump-filmstrip.png`, `t05-sign-boar.png` |

### B3. Combat and boars

| Scenario | Actions | Observed | Result |
|---|---|---|---|
| Take a boar charge (baseline) | Stand still | −15 HP | INFO |
| Dodge *through* the charge | Shift toward the boar when the gap is under 22 px | **Avoided 17/17** (sessions 2 and 4) | PASS |
| …then punish the boar | Turn and combo | **0 damage in 16/16 tries.** The boar keeps charging for the rest of its 1.1 s run and stops about 150 px away | **FAIL (design)**; I-04 |
| Jump over the charge | Space when close | Avoided 1/1 | PASS |
| Parry the charge | I when the gap is under 24 px | **Parried every time** (session 3: 2/2; probes: 5/5) | PASS |
| Riposte | J 124–527 ms after the parry (**DEBUG-ASSISTED setup**) | **Riposte fired 5/5 at every delay and dealt 40 = boar dead** | PASS; I-04 (balance) |
| Heavy, charge levels 0/1/2 | Hold K 150 / 500 / 950 ms on a stunned boar | L1 hit for 32. **L0 whiffed, and L2 only finished a boar that was already hurt, because by the time it released the stun window was nearly over** (parried stun ≈ 400 ms) | INFO; I-09 |
| Mashing J | 12 presses at 80/120/160/220/300 ms intervals | **2 / 5 / 5 / 7 / 8 swings started.** Presses during the first windup and during light 3 are thrown away | **FAIL**; I-05 |
| Attack in the air | Jump, then J | The ground swing `light1` plays mid-air and its hitbox is live in the air | INFO; I-10 |
| Turn and attack | Run right, press A+J | Swing faces the new direction | PASS |
| Stamina | Combos, dodges, heavies | Never ran dry while mashing (minimum 47); the boss fight drained it near 0 | INFO |
| Both boars defeated | Session 3 (parry), session 4 (dodge, then parry) | Both dead; herbs dropped | PASS |

### B4. Shrine, boss, death, ending

| Scenario | Observed | Result | Evidence |
|---|---|---|---|
| Shrine | "E" prompt appears; lights on E (ring and motes); heals to 100 | PASS | `t10-shrine-prompt.png`, `t11-shrine-lit.png` |
| Boss intro | Walls close, name and bar appear, "rễ cây mọc xuyên qua da thịt nó." toast | PASS | `f03-boss-intro-a1.png` |
| Boss fight, run 1 (dodge charges) | **Won on attempt 1 in 61 s.** Phase 2 at 36 s, phase 3 at 52 s. Charges avoided **5/5**, roots **29/29**, damage taken 78, **0 herbs used** | PASS | `f04-phase2-a1.png`, `f04-phase3-a1.png` |
| Boss fight, run 2 (jump charges) | Won; charges avoided **4/4**, roots **12/12**, parries **3/3**; ended on 84 HP | PASS | `d04-telegraph-*.png` |
| Soak (2 min, alternating tactics) | 4 boss fights, 1 death | INFO | `05-mash-soak.json` |
| Tusk-swipe parry, in fights | Run 1: **1/7 parried, 3/7 hit**. Run 2: **3/3 parried** | INCONCLUSIVE | see I-13 |
| Isolated swipe-parry timing (**DEBUG-ASSISTED**) | Two probe designs failed to set up clean trials in 7 minutes (the hero kept ending up *inside* the boss) | BLOCKED | `probe-swipe-parry.cjs` |
| Stand still in the arena | **Dies in 16.3 s** (charge −22, then swipes −16 every ~2.5 s, all while overlapping her body) | INFO; I-02, I-03 | `d01-death.png` |
| Death animation | 4-frame fall; the body ends up lying *under* the boss | PASS / issue I-15 | `d02-death-pose.png` |
| Respawn | At the lit shrine, 100 HP, boss reset to 320, arena unlocked | PASS | `d03-respawn.png` |
| Ending choice 1 (spare) | She walks off south; the piglets follow; flag stored | PASS | `f06-choice.png`, `f07-ending-spare.png` |
| Ending choice 2 (finish) | She fades; the piglets stop; flag stored | PASS | `d05-ending-finish.png` |
| **R to restart** | **The player respawns at the shrine (x=1440), not at the start**, and the shrine is shown unlit | **FAIL**; I-06 | `04-death-rematch.json` |

---

## C. Scorecard

These scores are for a prototype, but measured against shipped indie action games, because that's the bar a player will hold it to.

| Area | Score | Why |
|---|---|---|
| **Movement** | **6/10** | Excellent latency (1 frame), coyote time and jump buffer work, variable jump. But the run is slow (96 px/s means **6.7 s to cross one screen**), there's no dash beyond the combat dodge, and the feet visibly slide. Dead Cells or Katana ZERO movement is a toy in itself; this is a solid, plain baseline. |
| **Combat** | **5/10** | The impact feedback is good and the inputs are crisp. But there's **one dominant loop per enemy**, riposte one-shots boars, mashing eats inputs, there's no body collision with enemies, and the air "attack" is a ground swing. The combat exists; it doesn't yet *ask* anything of you. |
| **Animation** | **4/10** | The *structure* is right (anticipation, smear frames, settle frames, frame-tagged hitboxes). The *art* is a procedural stick-and-block rig: feet slide about 15 px per step, the 48 px figure reads as a twig, the coat behaves like a rigid skirt, and enemy legs are sliding rectangles. Far below Blasphemous or Hollow Knight, as expected for generated frames. |
| **Game feel** | **5/10** | Hit-stop, sparks, shake scaled to damage and the HP trail all land. But there's no audio at all (half of game feel), the hero is too small to feel heavy, and the telegraph flash and damage flash are both flat full-body fills, which makes moments look cheap. |
| **Enemy AI** | **3/10** | Boars do exactly one thing (bait → paw → charge → stun) and never chase, flank or react to being hit mid-charge. The boss picks randomly from three moves based on distance, with no combos, feints, cooldown logic or answer to the player hugging her. |
| **Boss design** | **5/10** | The phase escalation is legible (more roots, faster telegraphs, double charge), and root spikes are a genuinely good spacing test. But she's **too easy** (a still player survives 16 s, first-try clear, herbs unused), the long recovery windows make the fight rhythmic rather than tense, and the arena is the same flat corridor with no identity. |
| **Visual readability** | **4/10** | Sprites take up 13% of screen height, tutorial boxes cover the hero's head, telegraphs replace the silhouette with flat amber, the ground is dark-on-dark, the boss's collapse is hidden by a bush, and the piglets are 12 px specks. The forest *mood* is lovely; the *gameplay layer* is hard to read at a glance. |
| **UX** | **5/10** | Clear key hints, toasts, an interaction prompt and a damage trail. But the ending card shows a debug flag, R restarts at the wrong place, there's no pause, menu, rebinding or gamepad, and no audio cues. |
| **Performance** | **9/10** | Update cost 0.05–0.4 ms per frame; frame time p95 16.7 ms in 4 of 5 sessions; no object leaks (348 → 350 objects across repeated fights); heap stable at 31–38 MB. One soak session had p95 33 ms and a single 750 ms hitch (unexplained; possibly software GL or the restart, see I-17). |
| **Overall enjoyment** | **4/10** | A pleasant, responsive 5-minute demo. Not yet fun to replay: no tension, no mastery curve, no reason to try a second tactic. |

---

## D. Prioritised issues

Each issue lists **repro**, **evidence**, **impact**, **suspected cause** (checked in source *after* it was observed) and **fix**.

### P0: game-breaking
**None found.** The slice can be completed every time, there were no crashes, and no console errors or warnings appeared in any session.

### P1: major gameplay or game-feel problems

**I-01. The boss (and the whole slice) is far too easy.**
- **Repro:** play normally; or stand still in the arena.
- **Evidence:**
  - First-attempt clear in 61 s, then a second clear on 84 HP. Over two fights the bot took **5 hits** and used **0 of 4 herbs**.
  - **An idle player dies only after 16.3 s.**
  - One full combo during her recovery does 36 damage (11% of her HP), and she spends 750 ms recovering after every charge and stomp.
- **Impact:** no tension, no learning curve, nothing to master. This is the main reason the slice isn't fun.
- **Cause:** damage of 14–22 against 100 HP; long `recover` windows (750 / 750 / 450 ms by phase); healing generous (3 placed herbs plus a 60% drop per boar, +35 HP each); no attacks punish greed.
- **Fix:**
  - Cut recovery to about 450 / 350 / 250 ms.
  - Add a **follow-up** to the charge (a turn-around tusk sweep in phase 2+) so the dodge-then-punish rhythm sometimes gets punished.
  - Raise the swipe to about 22 damage.
  - Limit herbs to 2 placed and no drops.
  - Target: a skilled first-time player dies 1–3 times.

**I-02. No body collision between the player and enemies, so the player ends up standing inside the boss.**
- **Repro:** let the boss charge you, or walk into her.
- **Evidence:** in the 20 s diagnostic run (**DEBUG-ASSISTED setup**), the gap to the player measured **−57 to −85 px**, meaning the player stayed inside her body after her charge while her swipes kept connecting (`d01-death.png`, `d02-death-pose.png`).
- **Impact:** you can't read your position or decide on a direction, and dodging out of her becomes guesswork. It looks broken.
- **Cause:** `Prologue.ts` only adds colliders for player↔terrain/bush/walls and boss↔terrain/walls; there is no player↔enemy separation.
- **Fix:** add a soft push-out (separate horizontally by overlap × 0.5 per frame, not a solid wall), let dodges pass through enemies with i-frames, and push the player out on the side they entered from.

**I-03. Telegraphs erase the creature.**
- **Repro:** watch any boss windup.
- **Evidence:** `d04-telegraph-tStomp.png` shows the boss as a **flat amber silhouette**. `d04-telegraph-tSwipe.png` and `d04-telegraph-tCharge.png`, taken in the "off" half of the blink, show **almost no telegraph at all**; the rearing pose barely differs from idle at this scale.
- **Impact:** half the frames carry no warning, and the other half lose the pose information the warning should be showing. Players will feel hits are unfair once difficulty rises (I-01).
- **Cause:** `enemies.ts` `telegraph()` toggles a full-body FILL tint every 90 ms.
- **Fix:**
  - Keep the windup pose untinted and add **a localised cue**: a glint on the tusks for the swipe, a dust plume under the hooves for the charge, the roots lifting for the stomp.
  - Use at most a rim or additive tint, and **ramp it up instead of blinking**.
  - Make each windup pose more extreme (see E).

**I-04. Each enemy has exactly one correct answer.**
- **Repro:** fight a boar with each technique.
- **Evidence:**
  - Dodging *through* the charge works **17/17** but gives **0 punish in 16/16** tries.
  - Parry → riposte does **40 damage to a 40-HP boar, a guaranteed one-shot every time.**
  - Against the boss, nearly all damage came from the post-charge combo (36 per recovery).
- **Impact:** after one boar, the player has nothing left to learn, and there's never a moment where you must choose.
- **Cause:** boar HP equals riposte damage; the boar's charge carries on past the player; the boss's recovery is long and safe.
- **Fix:**
  - Give the boar about 60 HP so a riposte leaves it at 20.
  - Make dodging a charge cause a **skid-stop turn** that leaves the boar vulnerable for 500 ms near the player. Dodge then becomes a *riskier, more positional* alternative to parry.
  - Give the boss a punishable but dangerous follow-up so you can't always attack after a charge.

**I-05. Mashing attack loses inputs.**
- **Repro:** tap J rapidly.
- **Evidence:** 12 presses at 80 ms intervals gave **2 swings**; at 120–160 ms, **5**; at 300 ms, **8** (`05-mash-soak.json`). Slower, deliberate presses give *more* attacks than mashing.
- **Impact:** the classic "my attack didn't come out" frustration, the opposite of the snappy feel the latency numbers promise.
- **Cause:** in `player.ts`, `comboQueued` is only set when `tag !== "windup"`, so presses during the first windup are ignored. Nothing buffers a press across the end of light 3 into a new string.
- **Fix:** a **150 ms input buffer** for J (and for dodge and parry): remember the last press time and consume it on the first frame the action becomes legal, including starting a new string right after light 3's recovery ends.

**I-06. R restarts at the shrine instead of the beginning.**
- **Repro:** finish the slice, press R.
- **Evidence:** the player spawns at x=1440 next to an *unlit* shrine.
- **Impact:** broken replay flow and an inconsistent world state.
- **Cause:** `PrologueScene.checkpoint` is a class field set once and never reset in `create()`, so `scene.restart()` reuses the old checkpoint.
- **Fix:** reset `this.checkpoint = { x: 60, y: WORLD.groundY }` at the top of `create()`.

**I-07. The feet slide during the run.**
- **Repro:** run at full speed and watch the feet.
- **Evidence:** 54.4 px per 567 ms cycle; each planted foot sweeps at most 12 px while the body moves 27 px, so it **slides about 15 px per step** (55% of the contact time). `m01-run-filmstrip.png`.
- **Impact:** the character looks like it's skating. Players notice this immediately even without being able to name it.
- **Cause:** the art rig's leg swing (±6 px in `art.ts`, `RUN` poses) is too small for 96 px/s at 70 ms per frame.
- **Fix:**
  - **Code (stopgap):** set the run frame duration from speed so stride and travel match: about 8 frames × 28 ms. That's too fast to read; better to raise the stride to ±10 px and shorten the cycle to 6 frames × 50 ms.
  - **Art (real fix):** hand-drawn run frames with a proper contact → down → passing → up cycle, planted feet, and more forward lean.

### P2: noticeable polish and usability issues

**I-08. The hero is too small and thin to read.**
- **Evidence:** 48 px tall in a 360 px view (13%), with a 1–2 px sword. In every screenshot the hero is the weakest-reading object on screen.
- **Fix:** zoom the camera to about 480×270 for the slice, or draw the hero at 56–64 px. Thicken the silhouette (coat edge, shoulders), and add a 1 px lighter rim on the side facing the camera.

**I-09. Charged heavy attacks (L1/L2) don't fit any real opening.**
- **Evidence:** L1 needs 400 ms of holding plus 167 ms startup; L2 needs 900 + 167 ms. A parried boar is stunned for about 400 ms, and the boss's recovery is 450–750 ms. In practice L0 missed, L1 landed once, and L2 only landed on a boar already almost dead.
- **Fix:** let you hold the charge *during a dodge or a parry*, or cut L1 and L2 to 300 and 600 ms. Give a fully charged L2 a reward (a guaranteed stagger or poise break).

**I-10. The "air attack" is a ground swing.**
- **Evidence:** jump + J plays `light1` with ground poses mid-air, and the hitbox is live (`t09-air-attack.png`).
- **Fix:** add a dedicated air slash (one drawn arc), or block attacks in the air for now.

**I-11. Turning snaps instantly.**
- **Evidence:** the sprite faces the new direction on the very first frame (`facingFlipsAtFrame: 0`); the skid pose then plays already facing the new way.
- **Fix:** play the skid *still facing the old direction*, then flip on the last skid frame. Ideally, draw a 2-frame turn.

**I-12. Tutorial panels overlap the hero.**
- **Evidence:** sign panels at y ≈ 270–300 overlap the hero's head in `m02-jump-filmstrip.png` and `t05-sign-boar.png`.
- **Fix:** float the panels higher (above head height, y ≤ 230), or show them as a HUD prompt while near the sign.

**I-13. Boss-swipe parry reliability is unproven.**
- **Evidence:** 1/7 in run 1, 3/3 in run 2; the isolated probe was blocked by I-02. Boar parries were 100%.
- **Fix:** fix I-02 first, then re-measure. If parries still fail, widen the parry window against the swipe or delay its active frames by about 60 ms after the windup pose peaks.

**I-14. The ending is visually buried, and the end card shows debug text.**
- **Evidence:** in `f06-choice.png` she collapses at the arena's right edge, **behind the decorative bush** (bush depth 9 is drawn over boss depth 8), with tiny piglets. `f07-ending-spare.png` reads **"PRO_SOW_SPARED = true"**.
- **Fix:** frame the moment: centre the camera on her, slow down or freeze, and bring the piglets out in front of the bush. Replace the flag text with narrative text ("Nó lết đi về phía nam." / "Làng an toàn.").

**I-15. The death pose is hidden under the boss,** and she keeps attacking a corpse.
- **Fix:** separate the bodies (I-02); she should return to idle when the player dies.

**I-16. No audio at all.**
- **Impact:** the biggest missing layer of feel. Hit-stop without a hit *sound* reads as lag.
- **Fix:** add even 8 placeholder sounds: swing, hit, parry "ting", hurt, dodge whoosh, footstep, boss roar, roots cracking.

### P3: minor improvements

- **I-17. Frame-time hitches in the 2-minute soak:** p95 33 ms and one 750 ms spike, likely during **R → `scene.restart()`**, which rebuilds the 180-image FX pool and all the ambience; possibly a software-GL artefact. *Not confirmed.* Re-measure on a GPU. Fix: pre-build pools once and reset them on restart.
- **I-18. The dodge during Nanh Rễ's charge is easy** even with a jump: no other attack ever makes jumping unsafe. Consider a stomp that punishes landings.
- **I-19. The run is slow** (6.7 s per screen) for an action RPG; try 120–130 px/s with the stride fix from I-07.
- **I-20. Boars never chase or retreat;** they pace inside their territory and wait for you.
- **I-21. Herbs are bobbed by code but have only 3 glint frames;** fine, but the pickup float text sits behind the sign panels.

---

## E. Animation deep dive and roadmap

### Problems found (what's wrong → why → cause → fix → files)

| # | What looks wrong | Why it feels unnatural | Likely cause | Fix | Files | Code or art? |
|---|---|---|---|---|---|---|
| A1 | **Feet slide** about 15 px per step | Feet must stay locked to the ground during contact | Stride ±6 px vs 27 px of ground travel per step | Larger stride and faster cycle as a stopgap; real drawn run cycle | `art.ts` `RUN`; `clips.ts` `PC.run` | **Both (art for the real fix)** |
| A2 | Hero reads as a twig | No mass, so hits and recoils can't look heavy | 48 px rig of 1–3 px lines; no shading volume | Bigger sprite or camera zoom; drawn silhouette with shoulders and coat volume | `art.ts` `protagonist()`; Art Bible §2 | **Art** (plus a camera-zoom code option) |
| A3 | The coat is a rigid skirt | Cloth should lag and settle (follow-through) | The hem is a rectangle offset per frame (`coat`) | Draw the coat as 2–3 overlapping shapes that trail by one frame; hand-drawn secondary motion | `art.ts` | **Art** |
| A4 | The turn snaps | No anticipation of the direction change | `setFlipX` on the input frame | Skid in the old facing, flip at the end; 2 drawn turn frames | `player.ts` `present()`; `clips.ts` `skid` | Code + 2 frames |
| A5 | The air attack uses ground poses | Legs planted in mid-air | No air clip; `light` allowed while airborne | A drawn air-slash clip (3 frames) | `player.ts`; `clips.ts` | Code + art |
| A6 | Telegraph flash flattens the pose | Telegraphs should *exaggerate* the pose, not hide it | Full-body FILL tint blinking at 90 ms | Localised glint and dust, ramped tint; more extreme windup poses | `enemies.ts` `telegraph()`; `art.ts` `nanhRe` poses | Code + art |
| A7 | Boss legs are sliding rectangles | Quadrupeds have a gait (lift, plant, push) | Leg offsets of ±2 px with no lift | Drawn 4-beat walk and 2-beat gallop with real lift | `art.ts` `nanhRe` / `boar` | **Art** |
| A8 | Rearing barely reads | Only the head and front legs move 5–7 px | Rig limits | Draw a real rear: body tilted, front legs off the ground, roots flared | `art.ts` | **Art** |
| A9 | Enemies barely react to hits | Hits should rock the target | A 1-frame flinch only when the boss is idle or recovering; boars recoil 2 px | A 2-frame hit reaction aimed away from the hit; for the boss, a head jerk plus shaking roots | `enemies.ts` `onDamaged`; `art.ts` | Code + art |
| A10 | Death pose under the boss | Undermines the death | No separation; she keeps attacking | Push-out plus the boss resetting to idle on player death | `Prologue.ts`, `enemies.ts` | **Code** |
| A11 | No sound | Half of "impact" is audio | — | SFX on the existing animation events (`step`, `swing`, `slam`, `stomp`, `thud`) | `clips.ts` events → a new audio module | **Code** |
| A12 | The hurt flash and the telegraph use the same flat fill | Two different meanings share one look | Both use `TintModes.FILL` | Hurt: white for 1 frame then a red-orange rim; telegraph: a local cue | `combat.ts` `flash`; `enemies.ts` | **Code** |

**What already works and shouldn't be thrown away:**
- the frame-tagged `Animator`, with gameplay hitboxes opening on `active` frames;
- the speed-synced run `timeScale`;
- the separate takeoff / rise / apex / fall / land clips;
- smear frames on the active frame;
- simulation-time hit-stop.

The *timing system* is professional; the *frames* are placeholders.

### Roadmap, in order

1. **(Code, 1 day)** Separate the bodies (I-02), stop the boss attacking a corpse, turn in the old facing (A4), and use a localised telegraph cue (A6).
2. **(Code, ½ day)** An audio pass on the existing animation events (A11).
3. **(Decision)** Lock the hero's on-screen size: camera zoom to 480×270, or a 56–64 px sprite. Every frame drawn after this depends on it.
4. **(Art, highest value)** Hand-draw the **hero run (8 frames), idle (4), the 3 light swings (5 frames each), dodge (4), hurt (2) and death (4)** at the locked size. Keep the clip names and tags in `clips.ts`, so only `registerTextures` changes.
5. **(Art)** Nanh Rễ: walk (4), gallop (4), windups (rear 3, low 3), swipe (3), stomp (3), hit reaction (2), collapse (4).
6. **(Art)** The boar's full set at its current scale.
7. **(Art + code)** Cloth and hair as a drawn secondary-motion layer (A3), or an overlay sprite that lags by one frame.
8. **(Polish)** Hit reactions (A9) and the air slash (A5).

---

## F. Top 10 improvements (player impact ÷ effort)

| Rank | Change | Impact | Effort |
|---|---|---|---|
| 1 | **Player↔enemy push-out**; dodge passes through with i-frames (I-02) | Very high | Low |
| 2 | **150 ms input buffer** for attack, dodge and parry (I-05) | High | Low |
| 3 | **Re-tune difficulty:** shorter boss recovery, a charge follow-up, swipe damage up, fewer herbs (I-01) | Very high | Low |
| 4 | **Placeholder audio** on animation events (I-16) | Very high | Low–medium |
| 5 | **Localised, ramped telegraphs** instead of full-body blinking (I-03) | High | Low |
| 6 | **Break the single-answer loops:** boar HP 60, dodge-skid punish window, boss follow-ups (I-04) | High | Medium |
| 7 | **Fix R restart and the debug end text; frame the ending moment** (I-06, I-14) | Medium | Low |
| 8 | **Bigger hero on screen** (camera zoom or larger sprite) (I-08) | High | Low (zoom) / high (redraw) |
| 9 | **Hand-drawn hero run and attack frames** (A1–A3) | Very high | High |
| 10 | **Give the arena an identity:** the shrine tree, roots in the background, a clearing (B4) | Medium | Medium |

---

## G. Final verdict

1. **Is the game genuinely fun right now?** **Not yet.** It's *pleasant* for about five minutes: responsive, good-looking for a greybox, with impacts that land. But there's no tension and no mastery, so nothing makes you want a second run. The bot finished it in 1.5 minutes without dying.
2. **Does combat feel satisfying?** **Moment to moment, partly yes**: hit-stop, sparks, smears, the damage trail and 1-frame input latency are a strong base. **Over a whole encounter, no**: one solution per enemy, a boss that forgives everything, and mashing that loses inputs.
3. **What makes it feel amateurish?**
   - Walking into and standing inside the boss.
   - A tiny stick-figure hero whose feet slide.
   - Telegraphs that are flat blinking amber.
   - Silence.
   - A dramatic ending framed off-screen behind a bush, with a debug flag on the end card.
4. **What already feels professional?** Input latency (about 1 frame), coyote time and jump buffering, landing and skid frames, hitboxes tied to animation frames, hit-stop scaled to damage that keeps effects moving, the HP damage trail, and clean CPU and memory behaviour.
5. **Would a new player keep going after 10 minutes?** There *are* only about 5 minutes of content. As a pitch slice, a new player would say "nice feel, too easy, too quiet" and would not replay it. With difficulty, audio and push-out fixed (items 1–5 above), the same slice could hold a player for 20–30 minutes of trying to master it.
6. **What should be fixed before adding more content?** **I-01 through I-06, plus audio.** Every new chapter will inherit these systems; adding Ch. I content now would multiply a combat loop that has no decisions in it.

### Ask a human playtester to confirm
These are things automation can't judge:
- whether the 46 px full jump feels floaty or snappy with real hands;
- whether the boss's tusk-swipe parry *feels* fair at human reaction speed (≈ 200 ms);
- whether the hit-stop durations (30–115 ms) read as weight or as lag without audio;
- whether the green-on-green ground band hides root markers on a real monitor.

---

## H. Fix pass and re-test (2026-11-13)

After the report, I was asked to make the first five fixes from §F plus the quick fixes. This section lists what changed and what the same scripts measured afterwards.
- **Before/after JSON** is kept side by side in `game/playtest/after/` (`*.before.json` is the baseline, `*.after.json` is the re-test).
- **Same conditions as before:** real keyboard input, no state writes in sessions 1–5, and the separate `:5174` server.
- **Probes are DEBUG-ASSISTED,** as before: a teleport sets up the test only.

### What changed

| Issue | Change | Files |
|---|---|---|
| I-01 difficulty | **Boss:** recovery after a charge or stomp is 600 / 450 / 320 ms by phase (was 750 / 750 / 450). **Phase 2+:** 45% of charges turn into a tusk-swipe follow-up. **Swipe damage:** 22 (was 16). **Herbs:** only the 2 tutorial herbs remain; there are no boar drops and no herb before the boss. | `enemies.ts`, `scenes/Prologue.ts` |
| I-02, I-15 bodies | **Soft push-out:** the player is pushed out of any live boar or boss by half the overlap each frame, and a dodge passes through. **On player death:** the boss returns to idle (`stand()`) and stops attacking the body. | `scenes/Prologue.ts`, `enemies.ts` |
| I-03 telegraphs | **Windups:** the full-body blink is replaced by an additive warm tint that **ramps up** over the windup, so the silhouette and pose stay readable. **Local cues:** a tusk glint at 55% of the swipe windup, dust for the charge, a sparkle for the boar's notice. **Sound:** each attack has its own warning sound. | `enemies.ts`, `scenes/Prologue.ts` |
| I-04 single answer | **Boar:** HP is 60 (was 40), so one riposte no longer kills it. **Dodge through a boar's charge:** the boar skid-stops about 27 px past you and stays stunned for 800 ms, inside sword reach. **Boar back-off:** a boar that wanders within 80 px backs off instead of re-charging point-blank. | `enemies.ts` |
| I-05 input | **150 ms buffer** for attack, dodge and parry; a combo press is kept from the end of the windup onward. | `player.ts` |
| I-06 restart | `create()` resets the checkpoint, so **R** restarts at the beginning. | `scenes/Prologue.ts` |
| I-07 foot slide | **Run stride:** ±9 px (was ±6). **Run frames:** 60 ms (was 70). | `art.ts`, `clips.ts` |
| I-09 heavy | **Charge times:** L1 at 300 ms, L2 at 600 ms (were 400 / 900). | `tuning.ts` |
| I-10 air attack | Attacks now require the ground (the stop-gap fix the report suggested). | `player.ts` |
| I-11 turning | The skid pose keeps the *old* facing, then flips. | `player.ts` |
| I-12 signs | Sign panels now float above head height, on a post. | `scenes/Prologue.ts` |
| I-14 ending | **Camera:** stops following the player and pans to the boss when she falls. **Draw order:** the decorative bush is drawn behind her, and the piglets in front. **End card:** narrative text instead of the flag name. | `scenes/Prologue.ts` |
| I-16 audio | **About 20 placeholder sounds**, synthesised at runtime with Web Audio: swing, hit, parry, hurt, dodge, steps, land, jump, pickup, shrine, heal, four attack warnings, stomp, roots, roar, death and boss-down. They start on the first key press. | `sfx.ts` (new) |
| *new* parry facing | Found during the re-test: a parry made while facing **away** from the attacker succeeds, but the riposte then swings the wrong way and misses. **Fix:** a successful parry now turns the player toward what was parried. | `player.ts` |

### Re-test results

| Measure | Before | After | Source |
|---|---|---|---|
| Full run (session 3) | 1st-attempt clear in 61 s; 78 damage taken; **0 of 4 herbs used** | 1st-attempt clear in 146 s; **158 damage taken; both herbs used** (0 left; the bot's log counts 4 heal key presses, but only 2 herbs exist); every step passes | `03.*.json` |
| Same script, during tuning | — | With harder values (recovery 450 / 350 / 250, follow-up 60%): **2 deaths, then a clear on attempt 3**; one death came with the boss on 4 HP | earlier run in this pass |
| Idle player survives | 16.3 s | 19.3 s (also 12.5 s at the harder tuning) | `04.*.json` |
| Jump-over-the-charge rematch | Won on 84 HP | **Died, with the boss on 24 HP** | `04.*.json` |
| Boar: parry → riposte | One-shot (40 vs 40 HP) | 60 → 20 → 0: **needs two parries** | 03 log; `probe-riposte3.cjs` |
| Boar: dodge through the charge | 0 punish in 16/16 | Boar skid-stuns in **3/3**; damage taken 0 | `probe-boar-dodge.cjs` (DEBUG-ASSISTED) |
| Boss swipe parry | Unmeasurable (blocked by I-02) | **4/4** when pressed 0–60 ms before the predicted swipe; 0/6 when 180 ms early or 60 ms late. The usable window is narrow but consistent. | `probe-swipe-parry.*.json` (DEBUG-ASSISTED) |
| Restart with R | Spawned at the shrine, x=1440 | Spawns at the start, x=60 | session 3 |
| Run cycle | 54.4 px / 567 ms; foot slides about 15 px per step | 46.4 px / 486 ms; about 5 px per step (see note 1) | `01-movement.*.json` |
| Mashing at 80 ms | 2 swings from 12 presses | 3 swings | `05.*.json` |
| Mashing at 120–300 ms | 5 / 5 / 7 / 8 swings | 5 / 5 / 7 / 8 swings (unchanged) | `05.*.json` |
| Soak frame time | p95 33.2 ms, max 750 ms | p95 16.7 ms, max 50 ms; heap 30–37 MB; objects flat at 351 | `05.*.json` |
| Console errors | 0 | 0 in every session | all |

**Notes.**
1. **The foot-slide figure is derived, not measured from pixels.** It is half the cycle's travel minus the rig's stride (2 × 9 px). The script previously hard-coded the old stride; it now uses the new one. The slide should be checked by eye in `m01-run-filmstrip.png`.
2. **The boss is still easy for the bot,** which reacts in 10–30 ms. A human at about 200 ms should die once or twice: the bot had to use both herbs and took 158 damage (1.6× its HP), and at slightly harder values it died twice. I settled between the two tunings because this is the Prologue's first boss. Confirm with a human (§G).
3. **The input buffer barely changes mashing.** A press made within 150 ms of an action becoming legal now fires. Most mash presses, though, fall inside light 3's long recovery, more than 150 ms before a new string can start, so they are still dropped. **That's deliberate:** it keeps mashing from becoming a strategy. If it still feels like dropped input to a human, buffer the *first* press during light 3's recovery.
4. **I-11 is not re-verified.** The snapshot reads the gameplay `facing` value, which still flips on frame 0. Only the drawn sprite was changed, and it needs a visual check.
5. **The latency sample for jump was 26 ms in this run** (7.7 ms before). It's a single sample of 1–2 frames and nothing in the jump code changed, so I count it as noise.
6. **The soak's frame times look better** (the 750 ms spike didn't recur), but this soak ran only one fight instead of four, so I-17 stays *not confirmed*.

### Still open
- **I-08:** the hero is still small.
- **I-13:** the swipe-parry window is narrow at human reaction speed.
- **I-17 to I-21:** the P3 items.
- **The art roadmap in §E.**

Next step: a 10-minute human playtest focused on the notes above.

---

## Appendix: re-running the tests

```bash
cd game
npm run dev                      # or: npx vite --port 5174
npm i --no-save playwright-core  # plus a Chromium (Playwright's headless shell)
GAME_URL=http://localhost:5173/ node playtest/03-full-run.cjs
```

| Script | What it does |
|---|---|
| `01-movement.cjs` | Movement, jump, coyote time, jump buffer, latency, idle (real input) |
| `02-tutorial-boars.cjs` | Tutorial plus boar techniques (real input; early version, see the notes below) |
| `03-full-run.cjs` | Complete run from spawn to ending with no state writes |
| `04-death-rematch.cjs` | Death, respawn, jump tactic, ending 2, telegraph shots (real input) |
| `05-mash-and-soak.cjs` | Input mashing plus a 2-minute combat soak (real input) |
| `probe-*.cjs` | **DEBUG-ASSISTED** isolated measurements (teleport for setup only); `probe-riposte3` (boar takes two ripostes) and `probe-boar-dodge` (skid-stop) were added in the fix pass |

**Notes on `02-tutorial-boars.cjs` (early version):**
- Its first pass had bugs in the script itself: walk timeouts, plus a riposte check that read the meter before the parry had resolved.
- Those results were **not** used. The riposte was re-measured cleanly in `probe-riposte2.cjs` (5/5 success).
