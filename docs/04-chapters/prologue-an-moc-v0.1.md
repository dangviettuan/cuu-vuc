# Chapter Spec — Prologue: An Mộc (v0.1)

Status: **v0.1 locked.** The open question below is still pending.

Prose coverage (ADR-0005): prose **Chương 1 — Cái giếng cạn** covers stages S1–S5. A future prose Chương 2 would cover S6–S8.

## Canon locked (inputs)

- The protagonist begins in ordinary village life. Tutorial mechanics are embedded in routine activities: movement, interaction, basic combat, family and local NPC relationships. The Father leaves to investigate a Linh Mạch station and does not return. That night the forest changes: animals flee, the ecosystem turns violent, and the journey begins. **[NB Prologue]**
- **Arc state:** Certainty. Entering: comfortable, restless, mildly irritated by the Father's secrecy. Leaving: afraid, holding a secret that "knows who he is". **[PB L10]**
- **Tutorial weapon:** the brush-knife only, with no class. The class is chosen in early Ch. I at Mộc Thành. **[PB L9]**
- **The burned half Mạch Ấn** is found in the Father's room. It is a resonator, never absorbed, and it lets him pass the regrowing roots. **[FB F3]**
- **The Father** confirms the cut at the station and leaves with Quy Nguyên. He did not cut it himself; Cương ordered it. **[FB F4, FF K2]**
- **Diệp** is away at Mộc Thành with the Hộ Lâm. **[DB]**
- The silhouette anchors are the Father's spare satchel and a red thread on the left wrist. Both are acquired in the Prologue. **[PB L1]**

---

## Canon locked — detail

> Approved: the structure S1–S8, choices C1–C2 with their flags, the keeper's hint as written, and the checkpoint rule (ADR-0006). Exact tuning (encounters, boss patterns, text) is refined in production. Source tags: **[NB]** Narrative Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[GB]** Gameplay Bible, **[Ch1]** prose, **[new]** a new invention.

### 1. Narrative objective

Make the player **love An Mộc and recognize the Father's silence** before both are taken away. By the end, the player should know three things: something is wrong with the Mạch, the Father knew more than he said, and the protagonist is bound to it in his body.

### 2. Realm and locations

| Location | Function |
|---|---|
| **Làng An Mộc** | The village hub: houses, fields, the well, the headman's house. |
| **The Father's house** | At the edge of the village facing the forest. The Father's tidy room. **Diệp's old room, kept exactly as she left it** (it establishes her before she appears). **[new]** |
| **Miếu Mạch** | The shrine at the village entrance, under the old tree. Its keeper lives here. |
| **Forest edge** | The dawn chore area and the combat tutorial. |
| **Đường trạm** | The root-blocked path to the station. |
| **Trạm Dẫn Mạch** | The Father's station: the Prologue's final location. **[Ch1]** |

### 3. Critical path stages

| # | Stage | Time | Gameplay | Source |
|---|---|---|---|---|
| S1 | **Việc sáng** (Morning chores) | Dawn | Movement, jumping and interaction. He clears brush on the forest-edge trail for the headman (light strike), dodges a startled boar (dodge tutorial), and collects forest herbs (healing-item tutorial). | [new; NB tutorial] |
| S2 | **Cái giếng cạn** (The dry well) | Morning | Village gathering. Talk to bà Dần, the headman and the shrine keeper. Cutscene: the Father's copper rods, the third rod vibrates, the tell, *"Không."* | [Ch1] |
| S3 | **Bữa trưa** (Lunch) | Noon | Dialogue at home. The yellow leaf, *"Đừng nói từ đó ngoài đường"*, the hand that pulls back, *"Khóa cửa."* The Father leaves. | [Ch1] |
| S4 | **Buổi chiều lệch** (The afternoon goes wrong) | Afternoon | Free exploration of the village. The great tree drops its leaves, birds flee, a wounded bird pecks his hand, the dogs face the forest. The four men return: *"Chúng mọc lại."* **Choice C1.** | [Ch1] |
| S5 | **Căn phòng của cha** (The Father's room) | Night | An interaction puzzle: search the room, notice the dust trace on the floor, move the bed, lift the board. Key item: **the half Mạch Ấn**. His chest scar flares in time with his heartbeat. | [Ch1; FB F3] |
| S6 | **Đêm rừng đổi** (The night the forest changes) | Night | A Linh Suy–maddened beast breaks into An Mộc. He fights through the village toward the square by the shrine. | [NB; new] |
| S7 | **Nanh Rễ** | Night | The Prologue boss fight in the square under the shrine tree (§9). **Choice C2.** | [new] |
| S8 | **Lối rễ** (The root path) | Dawn | Aftermath at the shrine with the keeper's hint (§13). He takes the Father's spare satchel (with spare red thread). The regrowing roots part for the half Mạch Ấn. A short forest stage, then the station. | [FB F3; PB L1; new] |

**The ending at the station (S8):**
- The station's instrument housing has been forced open. There are unfamiliar boot prints (Cương's cell) and one of the Father's copper rods lies dropped.
- **There are no signs of a struggle.** An attentive player can read that the Father left on his own.
- **The protagonist reads it as an abduction.** His certainty filters the evidence (PB L4, L10). **[new; FB F4]**
- The trail leads toward **Mộc Thành**. He goes to find Diệp. This leads into Chapter I.

### 4. Optional areas

- **Diệp's old room:** letters she sent from Mộc Thành, which establish her voice and the Hộ Lâm. **[new; DB]**
- **The Father's map and notebook:** examining them unlocks the codex entries "Thanh Mộc Mạch lines" and "Numbers I don't understand" (secretly Quy Nguyên measurements). **[FB F4]**
- **Village side errands in S1 and S4:** small kindnesses that make An Mộc's later state matter. **[new]**

### 5. NPC cast

| NPC | Role | Source |
|---|---|---|
| The Father | Leaves at noon. Seen only in S2–S3. | [Ch1, FB] |
| **Bà Dần** | Finds the dry well. Warm and gossipy. Her household is a measure of the village's later state. | [Ch1] |
| **The headman** (trưởng làng) | Practical and worried. Gives S1's chore. Sends the four men out in S4. Asks the protagonist directly in C1. | [Ch1; new] |
| **The shrine keeper** (cụ trông miếu) | Very old, sharp-eyed. *"Đất không còn giữ được nó nữa."* Knew the Mother and suspects the cover story (FB F7). Gives the S8 hint. | [Ch1; FB F7] |
| The four men | A search party, turned back by the roots. | [Ch1] |
| **Diệp** | Absent. Present only through her old room, her letters and villagers asking "has anyone sent word to Diệp?" | [DB; new] |

### 6. Main conflict

He is torn between **obeying the Father** ("khóa cửa", "đừng đi tìm cha") and **his need to act** (PB L4). The world itself is turning against the village. There is no human antagonist on screen.

### 7. Major choices

**C1 — "Is it Linh Suy?" (S4)**

The headman, seeing the signs, asks the protagonist directly what his father said.

| Option | Meaning | Axis |
|---|---|---|
| **Tell the truth.** It is Linh Suy, and people should prepare. | Trusts the village with the truth (PB L3: "they should know"). | Trust vs control → trust |
| **Keep the Father's word.** "He's checking. Stay calm." | Protects by withholding: the Father's way (PB L6). | Trust vs control → control |

**C2 — Nanh Rễ (end of S7)**

The beast is a sow with roots growing through her flesh. When she is beaten, her litter squeals from the hedge.

| Option | Meaning | Axis |
|---|---|---|
| **Drive her off.** | Mercy toward one creature, at a risk to others. | Forgiveness vs punishment → forgiveness; one vs many → one |
| **Finish her.** | The village's safety first. | Forgiveness vs punishment → punishment; one vs many → many |

**Weighting rule:** Prologue choices carry **low weight** on the axes. They establish patterns and do not decide endings.

### 8. Immediate and delayed consequences

| Flag | Immediate (same night) | Delayed |
|---|---|---|
| **C1 = Told** | The village prepares, and fewer homes are wrecked in S6. But panic means **one family flees into the forest at night and is lost.** A truthful choice causes harm (NB rule 5). | When he revisits An Mộc, the villagers trust him. The lost family's fate is resolved in Ch. I. |
| **C1 = Withheld** | The village is unprepared. More damage is done in S6, and bà Dần's husband is injured. No one flees. | When he revisits, the villagers learn he knew. The headman: *"Mày biết mà không nói, giống hệt cha mày."* This echoes PB L6. |
| **C2 = Spared** | She flees with her litter. | Ch. I: her herd, maddened further, blocks a forest route and gores a Hộ Lâm warden (Ngàn mentions it). The herd's trail also reveals a hidden path. |
| **C2 = Killed** | The village is safe. | Ch. I: he finds the litter dead on the trail. There is no material cost, only the sight of it. |

### 9. Enemies, mini-bosses and boss

- **Enemy family (Prologue):** *thú hoảng*, panicked Thanh Mộc wildlife: boars, monkeys and bird swarms. These are frightened animals, not monsters. **Living roots** act as an environmental hazard. **[new; WB Thanh Mộc]**
- **Mini-bosses:** none.
- **Main boss: Nanh Rễ (Root-Tusk)**
  - A forest sow with Linh Suy roots growing through her flesh, driven out of the forest by pain.
  - **The worldview of a beast:** she protects her litter and flees what is killing her. She is not evil. The fight is a tutorial in reading tells, dodging and punishing (charge, root-burst, a desperate final phase).
  - **[new; NB rule 2]**
- **Mạch Ấn reward: none.** The first absorption is reserved for Mộc Giác in Ch. I **[NB; FB F3]**.

### 10. Items, material tier and unlocks

| Item / unlock | Function |
|---|---|
| **Brush-knife** (dao phát) | The tutorial weapon. Tier 0. |
| **Forest herbs** | The healing consumable, taught in S1. |
| **The Father's spare satchel** | Expands the consumable pouch and adds the silhouette anchor. It holds a **spare spool of red thread**: he ties a loop on his left wrist (PB L1). |
| **Half Mạch Ấn** (key item) | Opens **living-root barriers** in Thanh Mộc and pulses near Mạch features (an environmental hint). It crumbles at the first absorption after Mộc Giác (FB F3). |
| Material tier | Tier 0: village and forest-edge scraps only. |

### 11. Save and checkpoints

- **Global rule ([ADR-0006](../decisions/ADR-0006-mach-checkpoints.md)):** Mạch shrines and Người Dẫn Mạch stations are the game's checkpoints. The miếu Mạch is the first checkpoint, and the station at the end of S8 is the second.
- Prologue checkpoints: the miếu Mạch (S2 onward), the house door (S5), the shrine after S7, and the station (end).

### 12. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `PRO_VILLAGE_TOLD` (bool) | C1 | An Mộc revisit state; Ch. I lost-family thread; Ch. XI world state |
| `PRO_SOW_SPARED` (bool) | C2 | Ch. I herd encounter and warden injury, or the dead litter |
| `PRO_KEEPER_HINT` (bool) | S8, if the player speaks to the keeper | Ch. IX recognition beat ("cụ trông miếu đã biết") |
| `PRO_STATION_READ` (bool) | S8, if the player examines all the clues | Ch. V dialogue option: "Con đã thấy. Không có dấu vết giằng co." |

**Ending axes influenced (low weight):** trust vs control (C1); forgiveness vs punishment and one vs many (C2).

### 13. Key cutscenes and dialogue beats

1. **S2:** the third rod vibrates. *"Có chuyện gì à?" — "Không."* The thumb rubs the index finger. **[Ch1]**
2. **S3:** *"Con hai mươi lăm rồi." — "Cha biết. Cha có mặt hôm con sinh."* The leaf. The hand that pulls back. *"Và dù nghe thấy gì ngoài rừng cũng đừng đi tìm cha."* **[Ch1]**
3. **S5:** the half Mạch Ấn pulses three times; the third beat matches his heart. *"Và bí mật ấy biết anh là ai."* **[Ch1]**
4. **S8, the keeper's hint:** *"Cái đêm cha con bế con từ trong rừng về, hai mươi năm trước… rừng cũng kêu y như đêm nay."* This is the first crack in the cover story. **[new; FB F2, F7]**
5. **S8, at the station:** he kneels by the dropped rod. *"Họ bắt cha đi."* Then the camera shows the undisturbed ground he does not look at. **[new]**

---

## Open questions

1. **The lost family (C1 = Told):** are they found alive by the Hộ Lâm in Ch. I, or dead? This is resolved in the Ch. I spec.
