# Chapter Spec — Chapter IV: Lôi Trạch (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[WB]** World Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[CH1–3]** chapter specs, **[TB]** Thủ Mạch Nhân, **[new]** a new invention.

## Inputs (already canon)

- **A well-intended restoration attempt results in mass casualties.** It becomes harder to ignore that **Quy Nguyên Hội did not create Linh Suy; they are accelerating processes already underway.** Người Đồng Hành starts openly sympathizing with their argument, and **the relationship fractures.** **[NB Ch.IV]**
- **Lôi Trạch:** storm wetlands and conductive terrain. Gameplay: lightning, status chaining, environmental combat. **Major boss: Lôi Nha.** **[WB]**
- **Arc state:** Doubt. Entering: holds on to "intentions matter". Leaving: good intentions killed people, and the relationship with Diệp fractures. **[PB L10]**
- **Chưởng Ty Khải** leads the restoration, with **Giám Mạch Hằng** as his field commander. If `CH2_RECORDS = returned`, Khải uses those records to justify it. **[FF K3; CH2]**
- **Diệp's** sympathy comes from ideology, not revenge. After the fracture she seeks out the Father (between Ch. IV and V). **[DB N4]**
- **Cương** is a recurring rival from Ch. IV to VIII. **[FF K2]**
- **The Father's note:** *"Lôi Trạch — Ty thử phục hồi — sẽ thất bại."* **[CH3 III-9]**
- **Flags consumed:** `CH1_SE_FATE`, `CH2_RECORDS`, `CH2_KHE_PAGE`, `CH3_WATER`. **[CH1–3]**

---

## 1. Narrative objective

**Make the protagonist complicit.** In Ch. III he chose who would lose water. Here, he *helps* kill thousands while trying to save them, and the people he called criminals were the ones trying to stop it. Diệp watches all of it, and leaves.

## 2. Realm and locations

| Location | Function |
|---|---|
| **Bến Sét** (Thunder Landing) | A stilt-town of several thousand on the marsh. Storms have been killing people for years. Chapter hub. **It does not survive the chapter.** |
| **Đầm Dẫn** (the Conducting Marsh) | Open wetland. The Ty has raised **copper conductor towers** in a vast array. Conductive water, lightning strikes, status hazards. |
| **Tổ Lôi** (Storm Nest) | A drowned forest of lightning-scarred trees where Lôi Nha lives. |
| **Trục Giữa** (Central Spindle) | The heart of the array, built over Lôi Trạch's failing Mạch node. Ritual site. |
| **Trại Cương** (Cương's camp) | A hidden Quy Nguyên research camp on a hummock, abandoned in haste. |

## 3. Critical path stages

| # | Stage | Content |
|---|---|---|
| IV-1 | **Bến Sét** | Arrival. Storms kill people in this town every season. The Ty is welcomed as a saviour. Hằng commands the Ty forces. The people are told the town is the **safest place to wait** during the ritual. |
| IV-2 | **Khải** | Khải arrives. The tension from Ch. II is in the air (`CH2_RECORDS`). The protagonist shows him the Father's note. Khải: *"Cha cậu nói câu đó về mọi thứ, từ hai mươi năm trước."* Hằng has reported his absorption in Ch. II, so **Khải asks him to anchor the central node** with his Mạch Ấn. **He agrees**, to prove that intentions matter and to prove the Father wrong. Diệp is uneasy. |
| IV-3 | **Đầm Dẫn** | He activates the conductor towers across the marsh: lightning, conductive water, status chaining. **Cương's cell is sabotaging towers.** A fight, then **mini-boss: Cương** (§7). Cương breaks off: *"Các người sẽ giết cả cái trấn này."* The protagonist hears sabotage. **Diệp hears a warning.** |
| IV-4 | **Lôi Nha** | As the array charges, the storm serpent attacks the towers. Boss (§8). He kills it to protect the ritual. **Lôi Nha was the marsh's lightning sink.** The fourth Mạch Ấn is absorbed. |
| IV-5 | **Đại Phục Mạch** (the Great Restoration) | The ritual. He stands in the Central Spindle as its anchor. The array fires. **The dying Mạch rejects it.** With Lôi Nha gone, the cascade has nowhere to go but the conductive water, and **Bến Sét**. Thousands die. **He survives because of what is in his chest.** |
| IV-6 | **Cứu** (Rescue) | A timed escape-and-rescue through the burning, electrified stilt-town. He saves as many as he can, and it is never most of them. Writes `CH4_SAVED` (an int). |
| IV-7 | **Im lặng lần nữa** (Silence again) | Aftermath. Hằng orders survivors kept from speaking, as she believes silence is mercy. The Ty publicly blames **Quy Nguyên sabotage**. Khải is in shock and sincerely grieving. If `CH2_RECORDS = returned`: *"Những hồ sơ cậu trả cho tôi… chúng nói nếu không làm gì, Lôi Trạch chết trong mười năm."* |
| IV-8 | **Trại Cương** | In the abandoned Quy Nguyên camp, Diệp and the protagonist find the Hội's logs (§12, beat 4). **Quy Nguyên did not create Linh Suy. Their cuts are making it faster.** There is also Cương's note about the restoration. |
| IV-9 | **Rạn** (The fracture) | Diệp argues the Hội's case. **Choice C1** (§11). **She leaves**, in every branch. |
| IV-10 | **Một mình** (Alone) | He leaves Lôi Trạch alone, for the first time since the Prologue. Heading to Thiên Kinh: the Ty's lie is about to meet the public, and every thread (Khải, Mặc, Uyên, the Father) leads to the capital. This leads into Ch. V. |

## 4. Optional areas

- **Bến Sét before the ritual:** side requests among people who will mostly die. **Every named NPC helped here can be found, or not found, in IV-6.** This deliberately makes the player care before the disaster. **[NB rule 5]**
- **Tổ Lôi lore:** the scorch rings on the drowned trees record a century of Lôi Nha drinking the storm. A codex entry: the serpent had been weakening for a hundred years.
- **Hằng after the disaster** (optional confrontation, no fight). Hằng: *"Mười hai năm trước tôi đã thấy một tin đồn giết hàng trăm người. Hôm nay tôi thấy sự thật giết hàng nghìn. Cậu nói tôi nghe, cái nào nên được nói ra?"*

## 5. NPC cast

| NPC | Role |
|---|---|
| **Diệp** | AI ally until IV-9. Watches him kill Lôi Nha, anchor the ritual and survive it. Reads the logs. Leaves. |
| **Chưởng Ty Khải** | Leads the restoration. A sincere man whose good intentions end in a massacre. **[FF K3]** |
| **Giám Mạch Hằng** | Field commander. Enforces silence afterwards. **[CH2 §8]** |
| **Cương** | Saboteur and rival. Tries to stop the ritual for his own reasons. **[FF K2]** |
| **Bà Lành** | **New.** The Bến Sét ferry-woman who carries him across on arrival. A named face of the town. Her fate depends on IV-6. |

## 6. Enemies

- **Storm-touched marsh beasts:** conductive eels, lightning herons, and beasts that carry charge and pass it on through status chaining.
- **Cương's operatives:** saboteurs with grounding nets that discharge the player's lightning status.
- **Ty tower wardens:** after IV-7, they stand between survivors and the outside world.
- **The marsh itself:** strike zones and conductive water. Every pool is a hazard once charged. **[WB]**

## 7. Mini-boss — Cương

- **Fight:** a pragmatic, brutal duelist with a Ty-alloy cutting blade (**[CH2]**: the same alloy). He fights to disable, not to kill. He uses **grounding** to strip charge and Mạch Ấn effects from the protagonist.
- **The break-off:** he doesn't lose. He *leaves*, once the protagonist has damaged enough of his tower sabotage.
- **The irony:** Quy Nguyên's hardliner, the man who ordered the Thanh Mộc cut, is the one trying to **save** Bến Sét here. Urgency cuts both ways. **[FF G4]**

## 8. Main boss — Lôi Nha

- **Form:** a colossal storm serpent of the marsh. Its long fangs are lightning rods and its body is scarred with a century of strikes. **[new; WB]**
- **Worldview:** it has **drunk the storm** for centuries, pulling lightning into itself so that it did not fall on the marsh's people and creatures. As Linh Suy weakened it over the last century, more lightning slipped past, which is why Bến Sét's storms have been killing people. **It attacks the conductor towers because they are pulling the storm toward the people it shields.** **[new; NB rule 2]**
- **Phases:**
  1. **The Sink:** it draws lightning into itself. Fight it while dodging the strikes it attracts.
  2. **The Overflow:** charged past capacity, it discharges into the water. The arena becomes a conductive puzzle.
  3. **The Last Rod:** it coils around a tower, trying to tear it down. The player must stop it.
- **Ending:** he kills it. In that moment, it is the right call by every reading the protagonist has.
- **Payoff in IV-5:** without the sink, the ritual's cascade has nowhere to go. **His victory is part of the massacre.**

## 9. Mạch Ấn reward — Mạch Ấn Lôi Nha

| | |
|---|---|
| **Name** | Mạch Ấn Lôi Nha — *Liên Lôi* (Chain Lightning) |
| **Build effect** | Hits on **charged or wet** enemies **chain** to nearby enemies and spread status effects. This is the realm's status-chaining mechanic, made into a build tool. **[WB]** |
| **Passive** | He is immune to shock from conductive water, which opens Lôi Trạch's flooded routes on revisits. |
| **Weight** | **The first Mạch Ấn he does not want.** In the codex, its entry is written in his voice: *"Thứ này từng giữ cho cả một cái đầm khỏi bị sét đánh."* |

## 10. Items and checkpoints

- **Tier 4 materials:** storm copper, conductive scale, marsh silk.
- **Checkpoints (ADR-0006):**
  - The Bến Sét shrine **is destroyed in IV-5**, a visible consequence of the disaster.
  - Ty tower-stations serve as checkpoints before the ritual, and are dark after it.
  - Cương's camp has a rewired station-shrine.
  - No critical stage is left without a reachable checkpoint.

## 11. Major choice — C1: the fracture (IV-9)

Diệp lays out the Hội's argument **[NB §4]**: *"Không dám hy sinh ai cũng là một quyết định. Quyết định để tất cả cùng chết."* She says she is going to find the Father.

| Option | Her departure | Delayed | Axes |
|---|---|---|---|
| **Ask her to stay** | She hesitates, and leaves anyway. She leaves her **warden's spear** with him: *"Giữ hộ chị."* | Ch. VIII opens warmer: the duel starts with a conversation. Ch. XI: she returns the gesture. | Attachment |
| **Condemn her** (*"Chị đứng về phe những kẻ cắt mạch."*) | She leaves without a word. Takes everything. | Ch. VIII opens cold, and the Đoạn Tuyệt state is easier to reach. | Punishment |
| **Let her go** (say nothing, or *"Đi đi."*) | She looks at him a long time and leaves. | Ch. VIII opens with mutual respect, and the Tôn Trọng state is easier to reach. **[DB N8]** | Letting go |

**Weighting:** high for the relationship; medium for the ending axes.

**Fixed in every branch:** she leaves; she does **not** yet know the truth about the procedure (that comes from the Father, between IV and V **[DB N4]**); she does not tell him where she is going beyond "to find the Father".

## 12. Key beats and dialogue

1. **IV-2, Khải:** *"Cậu muốn chứng minh cha cậu sai. Tôi cũng vậy. Đã hai mươi năm rồi."*
2. **IV-3, Cương, breaking off:** *"Các người sẽ giết cả cái trấn này."* The protagonist: *"Người cắt mạch thì biết gì về cứu người."*
3. **IV-5, the ritual:** standing in the Spindle, he feels the Mạch *refuse*. It is not a breaking but a refusal, like a body rejecting a graft. **(This is a deliberate echo of his own body's history. He doesn't know that yet.)** **[FB F2]**
4. **IV-8, the Hội's logs:**
   - The Lôi Trạch decline was measured over 120 years. Quy Nguyên's first cuts here began 30 years ago and **made it faster**.
   - Cương's note: *"Ty sẽ làm nổ Lôi Trạch. Ta không được phép ngăn. Ta sẽ ngăn."* (I'm not permitted to stop it. I will stop it.)
   - **Someone above Cương forbade it.** (Uyên's patience: let the institution fail in public. This pays off in Ch. V.) **[FF G4]**
5. **IV-9, Diệp:** *"Chị không nói họ đúng. Chị nói chúng ta sai. Cả hai không giống nhau."*
6. **IV-9, if `CH1_SE_FATE = forced`:** *"Em cũng từng làm đau người ta vì một mục đích. Ở Vết Cắt. Chị đã thấy."*
7. **IV-9, if `CH2_KHE_PAGE`:** she takes the sealed Làng Khê page with her. *"Có thứ chị cần hỏi cha."*

## 13. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH4_FRACTURE` (asked / condemned / released) | C1 | Ch. VIII duel opening and state thresholds; Ch. XI |
| `CH4_SAVED` (int) | IV-6 | Ch. IX U Minh (the dead of Bến Sét); Ch. XI Lôi Trạch world state; Bà Lành's fate |
| `CH4_SPEAR` (bool, true if asked) | C1 | Ch. VIII; Ch. XI gesture |
| `CH4_LOINHA_KILLED` (always true) | IV-4 | Ch. IX: Lôi Nha among the remembered dead; Ch. XII Gluttony path |

**Flags consumed:**
- `CH1_SE_FATE` (beat 6).
- `CH2_RECORDS` (returned: Khải's justification in IV-7; published: Bến Sét's people had read the records, and some refused to gather in town, so `CH4_SAVED` starts higher; kept: Hằng demands them in IV-7).
- `CH2_KHE_PAGE` (beat 7).
- `CH3_WATER`: Diệp references Ch. III in the fracture. Enforced: *"Ở Xích Sa em đã đóng một cái giếng."* Broken or overthrown: *"Ở Xích Sa em cho tất cả cùng chờ chết chậm."*

**Ending axes influenced:** attachment vs letting go and forgiveness vs punishment (C1); action vs refusal (implicitly, through his participation).
