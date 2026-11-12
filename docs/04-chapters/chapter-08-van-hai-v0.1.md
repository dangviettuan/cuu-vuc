# Chapter Spec — Chapter VIII: Vân Hải (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[WB]** World Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[CH1–7]** chapter specs, **[new]** a new invention.

## Inputs (already canon)

- **Người Đồng Hành has become a major figure aligned with Quy Nguyên Hội.** The reunion is not driven by hatred. Both still care for each other, but they no longer believe in the same future. **An ideological duel occurs.** Depending on prior state, the player may **cooperate, refuse, fight, spare or permanently sever** the relationship. **This choice has major endgame consequences.** **[NB Ch.VIII]**
- **Vân Hải:** floating landmasses, a cloud sea, suspended settlements. Gameplay: verticality, aerial enemies, wind currents, mobility. **Major boss: Thiên Điểu.** Potential unlock: **Air Dash**. **[WB]**
- **Arc state:** Conviction. Entering: ready to argue Diệp out of her position. Leaving: the conviction duel is over and the relationship state is locked. **[PB L10]**
- **Diệp** leads the Hội's operations in Vân Hải. She is **bonded** now: the Father performed her consented procedure between Ch. V and VIII. She has a visible bonding mark and has kept her charm. Her duel uses her warden spear amplified by the fragment, and some patterns echo her ally moves. **[DB N5–N7]**
- **The duel resolves into one of four states:** Đồng Hành, Tôn Trọng, Đoạn Tuyệt or Tử. **[DB N8]**
- **Cương:** Quy Nguyên is preparing its first **convergence test** in Vân Hải, and Diệp now outranks him. **[CH7 VII-9]**
- **Flags consumed:** `CH4_FRACTURE`, `CH4_SPEAR`, `CH5_*`, `CH7_CHOICE`, `CH7_COUNG_TRUST`, `MA_REFUSED`.

---

## 1. Narrative objective

**Let the player love Diệp's side before they have to fight it.** Vân Hải shows Quy Nguyên at its best: evacuating people from falling islands while the Houses do nothing, and a test that *partly works*. It also shows the danger: a leak of Nguyên Linh turns a creature's will into a monster. Then the two of them have to decide what they are to each other.

## 2. Realm and locations

| Location | Function |
|---|---|
| **Bến Mây** (Cloud Landing) | The edge of the cloud sea. Wind-kites and sky-ferries go up from here. |
| **Làng Treo** (the Hanging Village) | Houses slung under a floating isle on chains and ropes. Its people are the **sky-folk**. The hub. **The isle is sinking.** |
| **Quần Đảo Trôi** (the Drifting Isles) | Islands of every size in slow orbit. Wind currents, verticality and aerial enemies. |
| **Đảo Nối** (the Joining Isle) | Two broken isles that once were one. The Hội's convergence array is built across the gap between them. |
| **Tổ Trời** (the Sky Nest) | The highest isle. Thiên Điểu's nest. Boss arena. |
| **Mỏm Cuối** (the Last Ledge) | A narrow spur of rock over the cloud sea. **The duel.** |

## 3. Critical path stages

| # | Stage | Content |
|---|---|---|
| VIII-1 | **Bến Mây** | Arrival. Vân Hải's isles are falling, one every few weeks. Refugees on the ground at Bến Mây came down **on Quy Nguyên ropes**, because **the Houses sent nothing**. |
| VIII-2 | **Làng Treo** | Up on a sky-ferry. The sky-folk are evacuating. Everyone here speaks of *"chị Diệp"*: who led the ropes, who carried the children. **People trust her.** **[DB N2]** |
| VIII-3 | **Gặp lại** (Reunion) | Diệp, with the bonding mark showing at her collarbone and the charm still on its cord. Her tone depends on `CH4_FRACTURE` and `CH7_CHOICE` (§12, beat 1). **She gives him a sky-folk wind cloak, the Áo Gió (Air Dash, §10)**, in every branch: *"Ở đây không có cái này thì chết."* |
| VIII-4 | **Quần Đảo Trôi** | Traversal and combat across the drifting isles, alone or alongside Diệp's people. Cương is preparing the array. Tension between Cương and Diệp: **she wants to wait until the last villagers are off Đảo Nối, and he wants to fire before the isle falls.** **[FF G4]** |
| VIII-5 | **Thử nghiệm** (The test) | The test fires. **Some villagers are still on the isle, and Diệp approves firing** (her flaw: she accepts costs too readily, DB N3). The protagonist objects. **The two broken isles pull together and hold.** It is a partial success, and it is real. Then a **leak of Nguyên Linh** escapes through the joined Mạch. |
| VIII-6 | **Thiên Điểu** | The leak reaches the Sky Nest. **Thiên Điểu's will is magnified** (§8). **Diệp fights beside him one last time**, as an AI ally with Ch. I–IV patterns. |
| VIII-7 | **Sau thử nghiệm** (After the test) | The joined isle holds. The villagers who stayed: some died, some were saved (by player performance). Diệp: *"Nó hoạt động."* The protagonist: *"Và nó biến con chim đó thành quái vật."* Both are right. |
| VIII-8 | **Mỏm Cuối** | **The ideological duel.** **Choice C1**, in two steps (§11). |
| VIII-9 | **U Minh** | Exit (§12, beats 6–7). |

## 4. Optional areas

- **Làng Treo evacuation:** carry people across rope bridges under time pressure. These rescues count toward `CH8_SAVED`.
- **Sky-folk shrines:** wind-chime shrines whose songs map the wind currents. They hold codex entries on the sky-folk, who have no Charter House, because no one could claim a sky.
- **Cương's tent:** his notes on Diệp (*"Cô ta đi chậm. Cô ta đếm người."*) and on the Father (*"Hắn không còn ngủ."*).

## 5. NPC cast

| NPC | Role |
|---|---|
| **Diệp** | Hội commander, bonded. Ally in VIII-6, opponent in VIII-8. |
| **Cương** | Pushes for urgency and is now under Diệp's command. |
| **Bà Gió** | **New.** Elder of Làng Treo, blind, and reads wind by sound. She speaks for the sky-folk. She trusts Diệp completely. |
| **The Father** | **Absent.** He is at Thiên Tâm, preparing the convergence. Diệp carries his words. |

## 6. Enemies

- **Aerial beasts:** wind-hawks, cloud rays, swarms riding the currents.
- **Falling-isle hazards:** crumbling ground and debris in the wind.
- **House Lạc sky-skiffs** (only if `CH7_CHOICE = record`): after the port fell, House Lạc moved on to Vân Hải and attacks Hội rope-lines. **[CH7]**
- No Hội enemies by default. **In Vân Hải, the Hội are not the enemy.**

## 7. Weighting note

This is the **most important relationship scene in the game.** The duel must be written and tuned like a final boss, emotionally and mechanically.

## 8. Main boss — Thiên Điểu

- **Form:** a vast sky-bird with wings like weather fronts. It has always nested on the highest isle. **[WB]**
- **What it always did:** its wingbeats drove the circling winds that helped keep the isles turning and aloft. As the isles began to fall, it tried to **hold them up**. **[new]**
- **What the leak does:** Nguyên Linh **magnifies will** **[WB]**. Thiên Điểu's will (*hold on, don't let them fall*) is magnified until it **grips everything it can reach**, crushing isles together and tearing people from rope-lines to keep them "safe" in the nest. **Protection becomes possession.** This is the first time the player sees what Nguyên Linh does, and a mirror of the Greed ending (*Kẻ Giữ Mạch*). **[PB L12]**
- **Phases:**
  1. **The Holder:** it grapples isles and creates wind walls. Mid-air combat with the Áo Gió.
  2. **The Grip:** it pulls the arena's isles together. Terrain closes in.
  3. **The Nest:** it shields captured villagers in the nest. **Hitting the nest hurts them.** The player has to break its grip without breaking what it holds.
- **Ending:** the magnified will burns out, and the bird falls into the cloud sea. Its Mạch Ấn rises.

## 9. Mạch Ấn reward — Mạch Ấn Thiên Điểu (optional)

| | |
|---|---|
| **Name** | Mạch Ấn Thiên Điểu — *Phong Dực* (Wind Wing) |
| **Build effect** | Attacks can launch enemies into the air. Air-combo hits build **gale**, which releases as a downward strike. This is the realm's aerial and mobility identity as a build. **[WB]** |
| **If refused** | Bà Gió: *"Để gió giữ nó."* (Let the wind keep it.) The sky-folk sing it into the cloud sea. |
| **Note** | Mạch Ấn absorbed here are tainted by the leak. The codex notes a faint second pulse in them: *"như có ai khác cùng thở."* This seeds Ch. X. |

## 10. Unlocks

- **Áo Gió (wind cloak): Air Dash.** Given by Diệp in every branch. This is a **gear unlock, not a Mạch Ấn**, so players who refuse Mạch Ấn are never locked out of traversal. **[WB "potential progression unlock: Air Dash"]**
- **Tier 7 materials:** cloud-silk, wind-bone, sky-iron.

## 11. Major choice — C1: the duel (VIII-8)

### Step 1: the argument

Diệp makes her case **[NB §4; DB]**: the record from Ch. VII proves the system is dying; the test proves rejoining *can* work; the leak proves it is dangerous, *"nên càng phải có người đủ cẩn thận đứng ra làm"* (so someone careful enough must be the one to do it). She asks him to **stand with the Hội**, or at least not to stand in its way.

| Option | Meaning |
|---|---|
| **Cooperate** (*"Em sẽ đi cùng chị đến Thiên Tâm."*) | He agrees to stand with her. He does not join the Hội; he stands with *her*. |
| **Refuse** (*"Em sẽ ngăn các người."*) | He will oppose the convergence. |

### Step 2: the duel

- **If Cooperate:** they still fight, *"như hồi nhỏ, ở bờ suối"* (like when they were kids, by the stream). It is a full-kit sparring duel. No one can die and nothing is at stake except pride. **Result: state Đồng Hành.**
- **If Refuse:** she will not let him walk off to wreck the convergence. A **real duel**: her spear amplified by the bonding, with patterns from Ch. I–IV turned against him. After he defeats her, she is down on the Last Ledge with the cloud sea below.

| After the Refuse duel | Result | State **[DB N8]** |
|---|---|---|
| **Spare her** (help her up) | *"Chị không đồng ý với em. Nhưng chị vẫn là chị em."* | **Tôn Trọng** |
| **Sever** (walk away; if `CH4_SPEAR`, drop her spear into the cloud sea) | She watches the spear fall. She says nothing. | **Đoạn Tuyệt** |
| **Kill her** (an explicit, deliberate action that requires holding confirm) | She dies on the Last Ledge. Her bonded fragment rises as a **Mạch Ấn** (§11a). | **Tử** |

### 11a. If Tử: Diệp's Mạch Ấn

- **Absorb:** *Mạch Ấn Diệp: Trường Thương* (Long Spear). His reach extends and perfect defences counter at range. **The heaviest Gluttony weight of any choice in the game.** **[DB N9]**
- **Refuse:** the fragment falls into the cloud sea.
- **In either case her charm stays with her.** It is never removed (DB N7). He may kneel and close her hand around it (`CH8_CHARM`).

**Footing modifiers:** these change dialogue and tone only. All options always remain available.
- `CH4_FRACTURE`: asked → warmer; condemned → colder; released → measured.
- `CH7_CHOICE = pact`: she opens with *"Em đã đưa bản ghi cho Cương. Vậy là em hiểu."*

**Weighting:** maximum on the relationship. High on attachment vs letting go and on forgiveness vs punishment. Tử adds heavy weight to punishment and to more power (if absorbed).

## 12. Key beats and dialogue

1. **VIII-3, reunion, by `CH4_FRACTURE`:**
   - *Asked:* *"Em còn giữ cây giáo không?"*
   - *Condemned:* *"Em đến để nói chị đứng về phe kẻ cắt mạch lần nữa à?"*
   - *Released:* *"Em lớn rồi."*
2. **VIII-5, the protagonist:** *"Còn người trên đảo."* Diệp: *"Chị biết. Chị đã đếm."* Her flaw, made visible. **[DB N3]**
3. **VIII-6, fighting Thiên Điểu side by side:** in the middle of the fight, she covers his opening exactly as she did against Độc Đằng. Neither says anything. **[CH1]**
4. **VIII-7, after the test:** *"Nó hoạt động."* — *"Và nó biến con chim đó thành quái vật."* — *"Thì lần sau phải cẩn thận hơn."* — *"Lần sau là Thiên Tâm, chị."*
5. **VIII-8, the hardest line:** *"Em ghét cha vì ông ấy quyết định thay người khác. Rồi em làm y như thế ở Xích Sa, ở Lôi Trạch, ở Thiên Kinh. Chị chỉ làm khi đã đếm."* **[CH2–4]**
6. **VIII-9, exit (if Diệp is alive):** *"Nếu em muốn biết cha giấu gì, thì đi U Minh. Người chết không biết nói dối."* She knows. She can't say it, but she can point. **[DB N4]**
7. **VIII-9, exit (in every branch):** in the leak's aftermath, the fragment in his chest shows him a vision: a child in a fever, a woman's arms, a forest node burning. *"Không phải ký ức của mình."* Or it is, and he never kept it. **The pull to U Minh begins.** **[FB F2]**

## 13. Checkpoints (ADR-0006)

- Bến Mây shrine.
- Wind-chime shrines on the isles (sky-folk checkpoints that ADR-0006 counts as Mạch shrines).
- **The convergence array becomes a checkpoint after the test.** It is the first Hội-built checkpoint that genuinely works. **[new]**
- A checkpoint sits before the Last Ledge.

## 14. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH8_STATE` (dong_hanh / ton_trong / doan_tuyet / tu) | C1 | Ch. IX U Minh; Ch. XI–XII Diệp's fate and role; Vĩnh Sinh eligibility (tu); Envy path |
| `CH8_SAVED` (int) | §4, VIII-5 | Ch. XI Vân Hải state |
| `CH8_ABSORBED` (bool) | §9 | `MA_REFUSED`; Ch. XII |
| `CH8_DIEP_FRAGMENT` (absorbed / refused / n/a) | §11a | Ch. XII Gluttony (heavy) |
| `CH8_CHARM` (bool: he closed her hand around it) | §11a | Ch. IX, XII Vĩnh Sinh |

**Ending axes influenced:** attachment vs letting go, forgiveness vs punishment, trusting others vs controlling them (all high); more power (Tử + absorb).
