# Combat & Class Bible v0.1

Status: **v0.1 locked.** All numbers are **starting targets for the greybox prototype**, not final tuning.

> Source tags: **[GB]** Gameplay README, **[WB]** World Bible, **[PB]** Protagonist Bible, **[CH*]** chapter specs, **[ADR-0006/0007]**, **[new]** a new invention.

## 1. Combat pillars

1. **Readable, then punishing.** Every enemy action has a tell, and every hit the player takes is one they could have read. (Souls-lite pressure without copying Souls structure.) **[Vision]**
2. **Defence is expression.** Each class has a different *perfect defence*, and most Mạch Ấn hook into it. The game's thesis (*"đỡ là quyết định đòn đánh kết thúc ở đâu"*) is mechanical first. **[CH1 §5]**
3. **Power is visible, and so is its absence.** Mạch Ấn change *how* you fight. Refusing them must change it too. **[ADR-0007]**
4. **Some fights are not won by damage.** At least six major encounters have alternative win conditions (§8). **[NB; CH5, CH7, CH8, CH9, CH10, CH12]**

## 2. Core verbs (all classes)

| Verb | Spec (prototype target) |
|---|---|
| **Move** | Run speed of 6 tiles/s. Brief acceleration so the character has weight but never feels slippery. |
| **Jump** | About 3 tiles high, variable by holding. Coyote time 6 frames, jump buffer 6 frames. |
| **Light attack** | A 3-hit string; each hit is cancellable into dodge after its active frames. |
| **Heavy attack** | Chargeable (2 levels). Breaks guards. Costs stamina. |
| **Dodge** | A short dash with **10 i-frames** (at 60 FPS). Costs stamina. A **perfect dodge** (enemy hit lands within the first 4 frames) triggers the perfect-defence state for classes that use dodge (§3). |
| **Parry** | **Every class can parry** (window of 8 frames). A successful parry staggers lighter enemies. **Kiếm Khách** has a wider window and gains counters (§3). |
| **Interact / Use item** | Healing herbs (CH-P), antidotes (CH-I), water skins (CH-III) and so on. Use animations are short and can be punished. |
| **Traversal (gear)** | **Móc Câu** (grapple, CH-I/II) and **Áo Gió** (Air Dash, CH-VIII). **Never gated by optional Mạch Ấn.** **[GB]** |

**Resources:**
- **Health:** restored by consumables and checkpoints.
- **Stamina:** regenerates when not spending; drained by dodge, heavy attacks and blocking. Heat (CH-III) and cold (CH-VI) slow its regeneration.
- **No mana bar.** Class abilities run on **cooldowns** plus a per-class **charge resource** (§3).

## 3. The four classes

Classes are chosen in early Ch. I from four mentors. The class is **the path he learns**, not a new identity. **[PB L9; CH1 §5]** The three silhouette anchors (hair tail, satchel strap, red thread) are always visible. **[PB L1]**

| | **Kiếm Khách** | **Ảnh Vệ** | **Ngự Linh** | **Cơ Sư** |
|---|---|---|---|---|
| **Mentor and line** | Lão Trụ: *"…để đứng chắn giữa."* | Én: *"…không ở chỗ đòn đánh rơi xuống."* | Bà Rêu: *"…vay mượn. Phải trả."* | Toản: *"…chuẩn bị."* |
| **Fantasy** | Stand your ground and turn the blow. | Never be there. Punish the miss. | Borrow the world's spirits, and pay them back. | Decide the fight before it starts. |
| **Weapon** | Straight sword (one-hand) + off-hand guard | Twin short blades | Staff + spirit focus | Crossbow + toolkit (traps, devices) |
| **Perfect defence** | **Perfect parry** (wider window: 12 frames) | **Perfect dodge** (window: 6 frames) | **Ward timing**: a spirit ward raised just before impact | **Trap trigger**: an enemy entering a primed trap |
| **Charge resource** | **Thế** (stance): built by blocks and parries, spent on counters | **Ảnh** (shadow): built by perfect dodges and combos, spent on blink strikes | **Linh** (spirit debt): abilities *borrow* Linh; the debt repays over time, and **if over-borrowed, healing is reduced until it is repaid** | **Linh kiện** (parts): crafted at checkpoints and from drops; traps consume them |
| **Signature abilities (v0.1)** | Riposte (parry → heavy counter); Đứng Chắn (a stance that absorbs a hit for an ally or object, used in escort and boss beats); Phá Thế (guard break) | Blink Strike (dash through and behind); Ảnh Phân (afterimage feint); Cửu Liên (9-hit finisher spending Ảnh) | Mộc Linh (a root spirit that binds); Phong Linh (a gust that knocks back); Trả Nợ (repays debt for a burst of power) | Bẫy Kẹp (clamp trap); Nỏ Ba (triple bolt); Ròng Rọc (pulls an enemy or object); Chốt (a turret device) |
| **Primary attributes** | STR, VIT | DEX | SPI, WIL | DEX, WIL |
| **Thủ Mạch Nhân counter (CH-V)** | Never attacks into a parry; he waits. | Area attacks with no dodge window. | Summons and spells are sealed as they are cast. | Traps and devices are deactivated as they are placed. |
| **Prose reference class** | ✔ (Chương 4 onward) | | | |

**Balance target:** every class can finish the game without any optional Mạch Ấn (`MA_REFUSED` = maximum). Kiếm Khách is the baseline difficulty. Ảnh Vệ is higher-skill. Ngự Linh trades burst for the debt mechanic. Cơ Sư is best at bosses it can prepare for and weakest in ambushes.

## 4. Attributes

The working set of five **[GB]**:

| Attribute | Effects |
|---|---|
| **STR** (Sức) | Physical damage for heavy weapons; guard break; stamina cost reduction on heavy attacks |
| **VIT** (Thể) | Max health; poison, heat and cold resistance buildup |
| **DEX** (Khéo) | Light weapon damage; dodge recovery speed; crossbow handling |
| **SPI** (Linh) | Spirit ability power; Linh debt capacity; Mạch Ấn effect potency |
| **WIL** (Chí) | **Seal resistance** (shortens seal windows: Ty seal-wardens, Hằng, Lạc Quân; **not** Thủ Mạch Nhân); Lạnh Hồn resistance (CH-IX); **Mạch Ấn slot count** (§5) |

Levelling grants **1 attribute point per level**. The soft cap per attribute is 40 at v0.1.

## 5. Mạch Ấn system

### 5.1 Rules
- Mạch Ấn are **absorbed from defeated beings** and **change build behaviour**, not just stats. **[GB]**
- **Through Ch. V, absorption is involuntary. From Ch. VI onward, every absorption is a choice.** Refusals are tracked in `MA_REFUSED`. **[CH6 §11; ADR-0007]**
- **Slots:** equip up to **2** at the start, **+1 at WIL 15, +1 at WIL 30** (4 maximum). Unequipped Mạch Ấn are still *carried*; they count for the narrative and ending weights and in the Thiên Cơ Tướng and final-reflection fights.
- **Interactions are designed in:** for example, *Triều Dâng* (wet) combined with *Liên Lôi* (chain).

### 5.2 Catalogue (v0.1)

| # | Mạch Ấn | Source (chapter) | Effect | Passive / note |
|---|---|---|---|---|
| 1 | **Rễ Giữ** | Mộc Giác (I) | Perfect defence → roots bind nearby enemies | Root passage in Thanh Mộc |
| 2 | **Ấn Ty: Phong Tỏa** | Hằng's seal (II) | A charged or finishing hit seals one enemy ability | Reveals that Ty seals are carved from Mạch |
| 3 | **Hỏa Tích** | Xích Hạt (III) | Damage taken is stored as heat, then released as fire by a heavy attack | Stored heat slows stamina regen; ember-floor immunity |
| 4 | **Liên Lôi** | Lôi Nha (IV) | Hits on wet or charged enemies chain to others and spread status | Conductive-water immunity |
| 5 | **Băng Giáp** | Bạch Tướng (VI, optional) | Perfect defences stack frost armour, which bursts into an AoE slow | Cold resistance; frozen passages |
| 6 | **Triều Dâng** | Huyền Kình (VII, optional) | Perfect defences build "tide", released as a wave that wets and knocks back | Underwater breath and diving |
| 7 | **Phong Dực** | Thiên Điểu (VIII, optional) | Launchers, plus gale built in the air released as a downward strike | Carries the leak's "second breath" |
| 8 | **Trường Thương** | Diệp (VIII, only in Tử, optional) | Extended reach; perfect defences counter at range | **Heaviest Gluttony weight** |
| 9 | **Thiên Diện** | Vô Diện (IX, optional) | Perfect dodge leaves a decoy that enemies target | — |
| 10 | **Cơ Quan** | Thiên Cơ Tướng (X, offered) | Perfect defence deploys a construct drone | — |
| 11 | **Cửu Ấn** (nine fragments) | Lạc Quân (XI, optional) | A large flat boost to all Mạch Ấn potency **and +1 slot** | **Largest Gluttony weight**; alternatively the fragments can be *returned* (Nhân Gian) |

### 5.3 The cost of refusing, and its small compensation
- **Cost:** a weaker build in raw terms. Encounters from Ch. VII onward are tuned for **4 to 9 carried Mạch Ấn**.
- **Compensation:** each refusal grants a stack of **Tĩnh Tâm** (stillness): +3% stamina regeneration and +2% seal resistance per stack, up to 5 stacks. **It is small by design.** Refusal must remain a sacrifice, not a hidden optimal path. **[new]**
- **Narrative payoff:** a weaker Thiên Cơ Tướng (X) and weaker final reflections (XII), and the Nhân Gian gate. **[CH10, CH12; ADR-0007]**

## 6. Realm status systems

| Realm | System | Counterplay |
|---|---|---|
| Thanh Mộc | **Poison** (buildup → damage over time) | Antidote herbs; VIT |
| Trung Vực | **Seal** (Ty batons, Hằng, Lạc Quân lock one Mạch Ấn or ability) | WIL; *Ấn Ty* |
| Xích Sa | **Heat meter** (slows stamina regen) | Shade, water skins, night travel; *Hỏa Tích* |
| Lôi Trạch | **Charge / wet → shock** (status chaining) | Ground on hummocks; *Liên Lôi* |
| Hàn Sơn | **Cold meter** (slow; attrition, scarce healing) | Fires, shrines; *Băng Giáp* |
| Huyền Hải | **Breath / tide** (timed routes) | Air pockets; *Triều Dâng* |
| Vân Hải | **Wind currents** (push, lift) | Áo Gió; *Phong Dực* |
| U Minh | **Unreliable perception** + **Lạnh Hồn** (reduced healing) | The pulse tell (heart-sync = true); WIL |
| Thiên Khuyết | **Mechanisms** (rotating halls, conduits) | Timing and puzzle-reading |

## 7. Progression and equipment

- **Level:** experience comes from enemies and story beats. **Respec** of attributes is available at Lão Trụ's dojo (or the player's mentor's) on revisits, at a material cost.
- **Skill tree:** per class, **3 branches × about 8 nodes** (for example, Kiếm Khách: Chắn, guarding; Phản, countering; Trụ, endurance). Nodes unlock through story milestones plus skill points.
- **Equipment:** weapon, off-hand or focus, armour (3 pieces), and 2 trinkets. **Passives are meaningful, not just numbers** **[Vision]**: for example, Hộ Lâm wrappings (poison buildup slower), Bến Sét copper (a shock-immune moment after a perfect dodge), or Trúc's clan gift (frost-resistant armour, CH-VI).
- **Material tiers 0–9** follow the chapters (T0 village → T9 sky-brass and will-glass). Smiths are in Mộc Thành, Thiên Kinh, Xích Thành, Cảng Triều and Ưng Trại.

## 8. Boss design rules

1. **Every boss has a worldview** (NB rule 2) and **a mechanical expression of it.** For example, Xích Hạt drinking the arena, Lôi Nha drawing strikes, Thiên Điểu's grip.
2. **Phases read as story beats.** Each boss has 3 phases, and each transition carries a visible story change.
3. **Alternative win conditions.** The catalogue v0.1:

| Encounter | Condition |
|---|---|
| Thủ Mạch Nhân (V) | Scripted loss; the fight ends on health zero or a timer; **no Game Over** |
| Huyền Kình (VII) | Strike the parasites, not the whale; hitting the whale floods the archive |
| Thiên Điểu, Phase 3 (VIII) | Break its grip without hitting the nest |
| Vô Diện, Phase 3 (IX) | **Defend without attacking** for a sustained window; hits are reflected |
| Thiên Cơ Tướng, Phase 3 (X) | Break the apparatus conduits, not the general |
| Final reflections (XII) | Vĩnh Sinh: keep holding. Thế Giới Cũ: lower your weapon. Nhân Gian: break its connection to the Seat. |

4. **The scripted loss must feel fair.** The player should survive Phase 2 for a while and feel skilled doing it. **[TB T5]**
5. **Bosses with a reflected or copied kit** (Thiên Cơ Tướng; the final reflections) read **the player's actual carried Mạch Ấn** and class kit.

## 9. Enemy design rules

- **Every realm has 3–4 enemy families plus hazards** (specified per chapter spec §6/§7).
- **Human enemies retreat or surrender** more often than beasts. Rioters (CH-V) are non-lethal by default, and killing them is tracked.
- **No enemy is "evil decoration".** Even the fodder is fleeing, starving, ordered or afraid. **[NB rule 3]**

## 10. Death, checkpoints and difficulty

- **Checkpoints:** Mạch shrines and stations (ADR-0006). Resting restores health and resets status meters. **Enemies respawn** (except story enemies and humans who surrendered).
- **On death:** the player respawns at the last checkpoint. **No currency is dropped.** Souls-lite pressure comes from encounters, not from punishing loss.
- **Difficulty options:** **Story** (more forgiving timing windows, reduced damage), **Standard**, and **Hard** (tighter windows; Thủ Mạch Nhân's Phase 1 is also hard). **The narrative is identical across all three.**

## 11. Greybox prototype scope

This maps the Gameplay README's prototype target **[GB]** to actual content:

| Target | Content |
|---|---|
| Run, jump, light and heavy attacks, dodge, hitbox/hurtbox | **Prologue S1** (forest-edge chores) |
| One class ability | **Kiếm Khách Riposte** (the prose reference class) |
| One enemy | **A startled boar** (thú hoảng) |
| One boss pattern | **Nanh Rễ**: charge, root-burst, desperate phase |
| **Stretch goal** | Rễ Giữ (the first Mạch Ấn) + Độc Đằng (poison) as a second slice |
