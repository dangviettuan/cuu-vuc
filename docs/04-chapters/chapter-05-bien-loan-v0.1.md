# Chapter Spec — Chapter V: Trung Vực — Biến Loạn (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[TB]** Thủ Mạch Nhân, **[CH1–4]** chapter specs, **[PRO]** Prologue spec, **[new]** a new invention.

## Inputs (already canon)

- **Linh Suy becomes public and Thiên Kinh enters political chaos.** He finds the Father and learns he joined Quy Nguyên Hội **voluntarily**. Neither can persuade the other. Then he meets **Thủ Mạch Nhân**: the **scripted loss**. **[NB Ch.V]**
- **Arc state:** Conviction (tested). Entering: hardened, determined to confront the Father. Leaving: betrayed by the Father, defeated by Thủ Mạch Nhân, helpless. **[PB L10]**
- **Thủ Mạch Nhân** comes to kill the Father. The protagonist steps between them and loses. The Father escapes. *"Ngươi vừa quyết định thay cả thế gian rằng ông ta được sống."* The fight follows the T5 design: Phase 1 is beatable, Phase 2 seals his tools, there is no Game Over, and everything is restored afterwards. **[TB T3–T5]**
- **The Father** meets his son openly. He doesn't defend himself, doesn't ask him to join, and doesn't reveal the procedure. **[FB F7]**
- **Uyên** is met in person for the first time. She knows the procedure worked, and since his absorptions she knows the child survived. **[FF K1]**
- **Khải** is scapegoated by the Cửu Gia. **[FF K3]** The rivalries between the Houses drive the chaos. **[FF G1]**
- **Diệp** has already learned the truth from the Father (between Ch. IV and V) and keeps it from her brother. **[DB N4]**
- **Flags consumed:** `PRO_STATION_READ`, `CH1_CLASS`, `CH1_SE_FATE`, `CH2_RECORDS`, `CH2_HOUSE_CONTACT`, `CH2_MAC_CAPTURED`, `CH3_FATHER_NUMBERS`, `CH4_SAVED`, `CH4_FRACTURE`.

---

## 1. Narrative objective

**The hinge of the game.** Every certainty from Ch. I–IV is cashed in at once.
- The Father was not taken.
- The "villains" were sometimes right.
- The institution failed.
- His strength, which has grown with every Mạch Ấn, means nothing against the ceiling.

He leaves the chapter **with nothing to stand on except what he decides to believe**. That is the start of the Conviction phase.

## 2. Realm and locations

| Location | State in Ch. V |
|---|---|
| **Cổng Nam** | Bến Sét survivors and outer-realm refugees. The Ty's notices have been torn down. |
| **Thiên Mạch Ty headquarters** | Under siege by rioters. Hằng holds it. |
| **Hạ Thành** | Mobs hunting "người cắt mạch". Anyone glowing with a Mạch Ấn is a target. |
| **Thượng Thành** | **Entered for the first time.** The Cửu Gia's house guards fight one another in the streets. |
| **Học Phường: Uyên's old classroom** | Where the Father, Khải and Uyên once shared one room. **The site of the meeting with the Father** and of the Thủ Mạch Nhân fight. |
| **Ngục Cửu Gia** (the Nine Houses' prison) | Where Khải is held. |

## 3. Critical path stages

| # | Stage | Content |
|---|---|---|
| V-1 | **Thành sôi** (The city boils) | He returns alone. News of Bến Sét is everywhere. The Ty blames Quy Nguyên, the Cửu Gia blame the Ty, and **Linh Suy is now public**: through the Bến Sét survivors and, if `CH2_RECORDS = published`, the records. **Khải has been arrested.** |
| V-2 | **Ty thất thủ** (The Ty falls) | Rioters storm Ty headquarters, and Hằng holds the inner archive. **Mặc** is in its cells (`CH2_MAC_CAPTURED`). He frees Mặc, or finds him already executed (§13). **Mini-boss: Hằng's last stand**, if he forces the archive; or he can fight beside her against the mob. **[new]** |
| V-3 | **Hạ Thành** | A mob turns on him for the Mạch Ấn glowing through his clothes. If `CH1_SE_FATE = released`, **Sẻ** gets him out. Otherwise he fights his way clear, against ordinary frightened people, and takes no reward for it. |
| V-4 | **Hội Chủ** | Through Mặc or Sẻ, or in their absence through a Hội messenger, **Uyên** receives him in a hidden Hội archive under Hạ Thành (§12, beats 1–2). She arranges the meeting with the Father. |
| V-5 | **Lớp học cũ** (The old classroom) | **The Father.** **Diệp is with him.** The conversation (§12, beats 3–6). **Choice C1** (§11). Neither persuades the other. |
| V-6 | **Thủ Mạch Nhân** | The city's Mạch tremors. He arrives to kill the Father. The protagonist steps between them. **Diệp takes the Father and runs.** The fight follows TB T5 (§8). Scripted loss. The spoken line. He is spared. |
| V-7 | **Tro** (Ashes) | He wakes in the ruined classroom. The city is burning. Thủ Mạch Nhân is gone. So are the Father and Diệp. |
| V-8 | **Ngục** (The prison) | He reaches **Khải** in the Cửu Gia prison. Khải gives him the lead to Ch. VI regardless of anything else (§12, beat 9). **Choice C2** (§11). |
| V-9 | **Hàn Sơn** | Exit. He leaves Thiên Kinh for the frozen north, to find out what the being who beat him is guarding. This leads into Ch. VI. |

## 4. Optional areas

- **Thượng Thành house conflicts:**
  - If `CH2_HOUSE_CONTACT = accepted`, that House offers him protection, at the price of naming the Ty officers responsible for Bến Sét.
  - If refused, the same House's guards hunt him.
- **Bến Sét survivors at Cổng Nam:** if `CH4_SAVED` was high, survivors he rescued recognize him. Some thank him. **Some know he anchored the ritual**, and spit.
- **Học Phường library:** a student who has read the published records (`CH2_RECORDS = published`) asks him whether it is all true.

## 5. NPC cast

| NPC | Role |
|---|---|
| **The Father** | Met at last. **[FB]** |
| **Diệp** | At the Father's side and already a Hội member. Keeps the secret. Takes the Father to safety in V-6. Her posture depends on `CH4_FRACTURE` (§12, beat 3). **[DB]** |
| **Hội Chủ Uyên** | First meeting. **[FF K1]** |
| **Thủ Mạch Nhân** | First appearance. **[TB]** |
| **Chưởng Ty Khải** | Scapegoat, imprisoned. **[FF K3]** |
| **Giám Mạch Hằng** | Holding the fallen Ty. |
| **Thư Lại Mặc** | Freed or dead. |
| **Sẻ** | Present only if released in Ch. I. |

## 6. Enemies and mini-bosses

- **Rioters:** ordinary people. They are non-lethal by default, with a "subdue" interaction. Killing them is possible and is tracked (`CH5_CIVILIAN_HARM`). **[new]**
- **Cửu Gia house guards:** heavy, disciplined, House colours.
- **Ty remnants:** seal-wardens fighting for their lives.
- **Mini-boss (conditional): Hằng's last stand** (V-2). It reuses her Ch. II kit with Phase 2 only; she is exhausted and desperate.

## 7. Weighting note

This chapter **consumes more flags than it writes**. Its purpose is for the player to feel the accumulated weight of Ch. I–IV in one place.

## 8. Main boss — Thủ Mạch Nhân (the scripted loss)

Implemented exactly as in **TB T5**:
- **Phase 1:** fair and beatable.
- **Transition:** his health bar **dissolves into seal glyphs**.
- **Phase 2, "Sealing":** he locks the player's tools away in order:
  1. equipped Mạch Ấn: *Rễ Giữ*, *Ấn Ty*, *Hỏa Tích*, *Liên Lôi*, one by one, each one's icon cracking as it is sealed;
  2. the class counter for `CH1_CLASS` (Kiếm Khách: he never attacks into a parry; he waits);
  3. stamina regeneration.
- **End:** a cutscene. **No Game Over.** Everything is restored.

**Chapter-specific staging:**
- **Diệp leaves with the Father at the transition**, as the health bar dissolves. **The protagonist tells them to go.** This is his decision, and it is the one Thủ Mạch Nhân names.
- **The fight takes place in Uyên's old classroom.** One classroom, three paths, and now a fourth person on its floor.

## 9. Rewards

- **No Mạch Ấn.** This is the first chapter without one, and the absence is the point.
- **Codex: "Thủ Mạch Nhân".** One line, in the protagonist's voice: *"Không thắng được."*
- **Tier 5 materials:** Thượng Thành steel and House silk, from optional content.

## 10. Checkpoints (ADR-0006)

- **Thiên Kinh's public shrines are contested.** Some are seized by rioters or House guards and become unusable while their faction controls the district.
- Uyên's Hội archive has a rewired station-shrine.
- The old classroom has **no checkpoint**. The checkpoint for the Thủ Mạch Nhân fight is the Học Phường station outside. **[ADR-0006 constraint]**

## 11. Major choices

### C1 — What he demands of the Father (V-5)

| Option | The Father's answer | Delayed | Axes |
|---|---|---|---|
| **"Về nhà với con."** (Come home) | *"Không còn cái nhà nào để về đâu con. Cái giếng cạn rồi."* | Ch. IX: the Father's memory-echo in U Minh is gentlest. Ch. XI: he hesitates before committing. | Attachment |
| **"Cha phải trả lời cho Bến Sét, cho Xích Sa."** (Answer for it) | *"Cha sẽ trả lời. Không phải trước con. Trước những người đã chết."* | Ch. XI: he will not meet his son again before Thiên Tâm. FB F8: confrontation fates become reachable. | Punishment |
| **"Nói cho con biết tại sao."** (Tell me why) | He tells him **the Hội's why** (the decline, the seal, the certainty of collapse), **not his own**. He does not mention the procedure. | Ch. IX: the gap between the reason given and the real one is the knife. Ch. X: the protagonist recognizes the same reasoning in the Nine. | Understanding (trust) |

**Fixed in every branch:**
- The Father does **not** ask him to join.
- He does **not** reveal the procedure.
- Diệp does **not** contradict him. **[FB F7; DB N4]**

### C2 — Khải (V-8)

| Option | Result | Delayed | Axes |
|---|---|---|---|
| **Break him out** | Khải becomes a fugitive, broken and grateful. | Ch. XI: he brings what is left of the Ty's knowledge to the crisis. | Forgiveness |
| **Leave him** | The Cửu Gia execute him publicly as the face of Bến Sét. The Houses' own sins stay hidden. | Ch. IX: he is among the dead in U Minh, and still sincere. | Punishment |
| **Force a fair trial** (requires `CH2_RECORDS = kept`) | He gives the records to a rival House on the condition of a public trial. The trial exposes the Ty **and** the Cửu Gia's centuries of suppression, which makes the chaos worse. | Ch. XI: Trung Vực is more unstable but less deceived. | Control; freedom |

## 12. Key beats and dialogue

1. **V-4, Uyên, on Bến Sét:** *"Ta đã để Ty thất bại trước mắt thiên hạ. Nếu ta ngăn, họ sẽ thử lại ở nơi khác, lớn hơn, và lần đó sẽ không ai biết là ai làm."* He: *"Bà để cả một cái trấn chết để làm bài học."* She: *"Ta để một cái trấn chết để không phải mười cái. Cha ngươi hiểu phép tính đó."*
2. **V-4, Uyên, on him:** she looks at the light under his skin. *"Ngươi sống được tới hôm nay là nhờ một quyết định. Không phải của ngươi. Hỏi cha ngươi."* This is the first open crack. She will say nothing more. **[FF K1; FB F4 "last lie" broken]**
3. **V-5, Diệp's posture (by `CH4_FRACTURE`):**
   - *Asked:* she cannot meet his eyes.
   - *Condemned:* she meets them, coldly.
   - *Released:* she nods once.
4. **V-5, the Father:** *"Cha biết con sẽ đến. Cha để lại thanh đồng thứ ba cho con."* **[FB F7]**
5. **V-5, if `PRO_STATION_READ`:** *"Con đã thấy. Không có dấu vết giằng co. Con đã thấy, và con không nhìn."*
6. **V-5, `CH3_FATHER_NUMBERS`:** *"Ở Xích Sa, con đã thấy chữ cha trong sổ của Xích Vương."* The Father: *"Cha viết con số. Người khác ký."* The protagonist: *"Và người ta chết theo con số của cha."* The Father: *"Người ta chết theo Linh Suy. Con số chỉ cho biết ai chết trước."*
7. **V-6, as the health bar dissolves:** the protagonist, to Diệp: *"Đưa cha đi."* Diệp hesitates for a heartbeat, then takes the Father by the arm and runs. **(Envy seed: she chose to save the Father; he chose to let her.)** **[DB N3; PB L12]**
8. **V-6, Thủ Mạch Nhân over him:** *"Ngươi vừa quyết định thay cả thế gian rằng ông ta được sống."* Then, quieter, looking at his chest: *"Ta từng thấy thứ này một lần."* **[TB T3–T4]**
9. **V-8, Khải:** *"Hồ sơ thật về Đại Phân Ly không ở Thiên Kinh. Ty đã đốt hết những gì đốt được. Thứ duy nhất Ty không đốt được là Hàn Sơn, vì băng giữ chúng."*

## 13. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH5_FATHER_DEMAND` (home / answer / why) | C1 | Ch. IX echo; Ch. X recognition; Ch. XI–XII Father fates |
| `CH5_KHAI` (freed / executed / tried) | C2 | Ch. IX, Ch. XI |
| `CH5_MAC` (alive / dead) | V-2 | Ch. XI Hội internal politics |
| `CH5_CIVILIAN_HARM` (int) | V-1–V-3 | Ch. IX U Minh; Ch. XI Trung Vực world state; ending axes (control) |
| `CH5_TMN_SEEN` (always true) | V-6 | Ch. VI–X |

**Flags consumed:**
- `PRO_STATION_READ` (beat 5).
- `CH1_CLASS` (§8).
- `CH1_SE_FATE` (V-3: released → Sẻ's rescue; forced → Sẻ is among the mob's ringleaders against him).
- `CH2_RECORDS`:
  - published: the chaos is larger, Mặc is freed by rioters before V-2, and C2's trial is unavailable but moot, because everything is already public;
  - kept: C2 option 3, and he may show them to Uyên, who says *"Ta viết những tờ đó"*;
  - returned: Khải's guilt is deeper, because he used them.
- `CH2_HOUSE_CONTACT` (§4).
- `CH2_MAC_CAPTURED`: Mặc is alive if `CH2_RECORDS = published` or if he reaches the cells before Hằng's purge. Otherwise he is dead.
- `CH4_SAVED` (§4).
- `CH4_FRACTURE` (beat 3).

**Ending axes influenced:** attachment and punishment (C1); forgiveness, punishment and control (C2); control (civilian harm).

## 14. Note on Diệp's procedure

The Father performs Diệp's consented bonding procedure **after** Ch. V, before Ch. VIII **[DB N5]**. In Ch. V she is still unbonded. Her charm is visible, and there is no bonding mark yet.
