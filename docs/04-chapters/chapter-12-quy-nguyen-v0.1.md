# Chapter Spec — Chapter XII: Quy Nguyên (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text, score thresholds) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[TB]** Thủ Mạch Nhân, **[CH1–11]**, **[PRO]** chapter specs, **[ADR-0003]**, **[ADR-0007]**, **[new]** a new invention.

## Inputs (already canon)

- **The Cửu Mạch converge at Thiên Tâm.** No purely good or purely evil faction remains. The protagonist finally has enough power to influence the future of civilization. The final question: ***"Ngươi tin điều gì đủ sâu để bắt người khác sống với hậu quả của niềm tin đó?"*** **Nguyên Linh reflects his accumulated worldview.** **The final boss changes according to the player's choices** and is the extreme form of the philosophy he has built: *the destination of his own convictions when pushed beyond restraint.* **[NB Ch.XII]**
- **Endings:** seven sin-aligned endings plus Nhân Gian. They are **not selected by one final dialogue choice**. The final state should feel like the logical result of who he became. **[NB §7–8; ADR-0003]**
- **Fates already designed:** the Father (FB F8), Diệp (DB N9), Thủ Mạch Nhân (TB T8). In Nhân Gian, Thủ Mạch Nhân asks the final question.
- **Thiên Tâm:** whoever is bonded and present can channel the source and become the next Bearer. Diệp is the Hội's Bearer; the protagonist is the accidental one. **[CH10]**
- **The stele rubbing** (`CH10_STELE`) makes unbonding possible. **[CH10 §10]**

---

## 1. Narrative objective

**Show him the end of the road he walked.** Everything converges: the factions, the people he loves, the dead, the source. Then the game asks the final question and lets him answer only with what he has *already become*.

## 2. Locations

| Location | Function |
|---|---|
| **Vành Thiên Tâm** (the Rim) | The crater's edge, where the nine Mạch bundles break the surface and slope down toward the centre. **Battle stage.** |
| **Trận Hội Tụ** (the Convergence Array) | The Hội's array on the inner slope, built to the Father's design. |
| **Ghế Nguồn** (the Source Seat) | The original confluence seat at the centre. The Tenth Seat at Thiên Khuyết was built as a copy of it. |
| **Trong Nguồn** (Within the Source) | Nguyên Linh itself. The final arena, shaped by the protagonist's will. |

## 3. Ending resolution model

The full rule is in **[ADR-0007](../decisions/ADR-0007-ending-resolution.md)**. It is summarized here.

### 3.1 Axes

Each tracked axis is a **signed integer** **[NB §7]**. Every "Axes" column in the chapter specs adds to one or more of them.

| Axis | Positive (+) | Negative (−) |
|---|---|---|
| `AX_MANY` | many over one | one over many |
| `AX_ORDER` | order | freedom |
| `AX_PUNISH` | punishment | forgiveness |
| `AX_ATTACH` | attachment | letting go |
| `AX_ACT` | action / intervention | refusal to intervene |
| `AX_POWER` | seeking more power | accepting limitation |
| `AX_CONTROL` | controlling others | trusting others |

### 3.2 Ending profiles

Each ending has a **score** computed from axes plus **key flags**. The weights are indicative; production tunes them.

| Ending | Score drivers | Hard requirement |
|---|---|---|
| **I. Nhân Hoàng** (Pride) | `+AX_ORDER`, `+AX_CONTROL`, `+AX_ACT`; `CH10_COMMAND = commanded`; `CH11_ALLIANCE ∈ {hoi, own}` | None |
| **II. Kẻ Giữ Mạch** (Greed) | `+AX_CONTROL`, `+AX_ATTACH`, `−AX_ACT`; `CH2_RECORDS = kept`; `CH10_COMMAND ∈ {commanded, tmn}`; `CH11_ALLIANCE = seal` | None |
| **III. Ngày Không Còn Thần** (Wrath) | `+AX_PUNISH`, `+AX_ACT`; `CH1_SE_FATE = handed`; `CH4_FRACTURE = condemned`; `CH5_KHAI = executed`; `CH9_FATHER_VERDICT = refuse`; `CH8_STATE ∈ {doan_tuyet, tu}` | None |
| **IV. Kẻ Thay Thế** (Envy) | `CH9_FATHER_VERDICT = diep` (heavy); `CH4_FRACTURE = condemned`; `CH8_STATE ∈ {ton_trong, doan_tuyet}`; `CH11_ALLIANCE = hoi` | **Diệp alive** (`CH8_STATE ≠ tu`) |
| **V. Vĩnh Sinh** (Desire) | `+AX_ATTACH` (heavy); `CH4_FRACTURE = asked`; `CH5_FATHER_DEMAND = home`; `CH9_MOTHER = kept` | **An eligible beloved**: Diệp dead (`tu`), the Mother kept (`CH9_MOTHER = kept`), or the Father dead in XII-4 |
| **VI. Vạn Mạch Chi Thân** (Gluttony) | `+AX_POWER` (heavy); `MA_REFUSED = 0`; `CH8_DIEP_FRAGMENT = absorbed`; `CH11_CUU_AN = absorbed`; `CH10_ABSORBED` | None |
| **VII. Thế Giới Cũ** (Sloth) | `−AX_ACT` (heavy); `CH7_CHOICE = record`; `CH10_COMMAND = tmn`; `CH11_ALLIANCE = seal`; few realms helped in XI | None |
| **VIII. Nhân Gian** | Not scored; **gated** (§3.3) | §3.3 |

### 3.3 The Nhân Gian gate

All of the following must be true:
- **Remembrance:** `CH9_NAMED` **or** U Minh helped in Ch. XI.
- **Proof or distribution:** `CH7_RECORD ∈ {full, shared}` **or** `CH11_CUU_AN = returned`.
- **Restraint:** `MA_REFUSED ≥ 2`, `AX_POWER ≤ 0`, `AX_CONTROL ≤ 0`.
- **Understanding:** `CH9_FATHER_VERDICT = understand`.
- `CH10_STELE`, which is always true.

### 3.4 The final act (XII-6)

At the Source, **available final acts** are:
- the **top two** sin endings by score; **or** only the top one, if it **dominates** (score ≥ 1.5× the second);
- **plus Nhân Gian**, if its gate is met.

The player chooses among them. **The last choice is real, but it only chooses between destinations the player has already made plausible.** **[NB §7: "the logical result of the person the protagonist became"]**

The **Mirror of Will** (Ch. X, `CH10_MIRROR`) showed the then-leading ending. If the final act matches it, he gets an extra line: *"Mình đã thấy chỗ này rồi."* (I've seen this place before.)

## 4. Critical path stages

| # | Stage | Content |
|---|---|---|
| XII-1 | **Vành** | The Rim. **A battle**: his alliance and his Ch. XI allies against the factions he didn't side with. Allies from `CH11_HELPED` appear in waves, each with a line. Realms he didn't help are **absent**, and the player feels that absence. |
| XII-2 | **Uyên** | At the array's edge (§6). |
| XII-3 | **Thủ Mạch Nhân** | His position follows `CH10_COMMAND` and `CH11_ALLIANCE` (§8). |
| XII-4 | **Người giữ** (The one who holds) | The Father at the array (§5). **Choice C1** (if not Hội). |
| XII-5 | **Ghế Nguồn** | Diệp at the Seat (§7). If Envy is in the available acts, **the Envy duel happens here**. |
| XII-6 | **Câu hỏi** (The question) | The Source opens. **Nguyên Linh speaks**, in two voices at once: the first Bearer's echo and **his own**. *"Ngươi tin điều gì đủ sâu để bắt người khác sống với hậu quả của niềm tin đó?"* **The final act** (§3.4). |
| XII-7 | **Trong Nguồn** | **The final boss**: the reflection of the chosen act (§9). |
| XII-8 | **Kết** (Ending) | Epilogue (§10). |

## 5. The Father at the array (XII-4)

The array works by the same principle as the procedure: **someone must hold it**, and whoever holds it takes the backlash. **[FB F2; CH9 §6]**

- **`CH11_ALLIANCE = hoi`:** the Father holds the array. The convergence completes. **He survives, and his left hand burns again.** No choice.
- **Otherwise:** the protagonist's side breaks the array. The Father holds it as it fails. **Choice C1:**

| Option | Line | Result | Axes |
|---|---|---|---|
| **"Để con giữ."** (Let me hold it) | The exact echo of *"Để anh giữ nó"* at the Node. | **He takes the backlash.** His fragment can bear it, and it grows (`AX_POWER +`). **The Father lives**, and his fate follows FB F8 for the ending. | Attachment; more power |
| **Let the Father hold it** | The Father: *"Lần này đến lượt cha."* (This time it's my turn.) | **The Father dies** holding the array, as the Mother died holding the child. **He becomes eligible for Vĩnh Sinh.** | Letting go |

**`CH11_FATHER_SCENE = hesitated`:** in either branch, before the backlash, the Father puts his unburned right hand on his son's shoulder. **The hand does not pull back.**

## 6. Uyên (XII-2)

- **`CH11_ALLIANCE = hoi`:** she welcomes him. She intends a Bearer in the Seat: **Diệp if alive and willing, otherwise him.** *"Ai ngồi không quan trọng. Quan trọng là có người ngồi."* (It doesn't matter who sits. It matters that someone does.)
- **Otherwise:** she tries to **force a Bearer into the Seat**, using the Father's array to pull the nearest bonded will (the protagonist, or Diệp). The fight with her forces is a gauntlet. She is not a boss; she is a frail woman of seventy.
- **Her fate:**
  - In **Nhân Gian**, she lives to see the distributed system and calls it *"thận trọng hơn ta"* (more careful than I was).
  - In **Wrath**, she dies in the destruction.
  - In **Pride**, she is the first to kneel, and the first to plot.
  - Otherwise she lives, diminished.

## 7. Diệp at the Seat (XII-5)

| `CH11_DIEP_ROLE` | At the Seat |
|---|---|
| **beside** | She reaches the Seat with him. *"Chị ngồi, hay em?"* (Me, or you?) The answer follows the final act: she sits in Envy (and he takes her place), steps aside in Pride or Gluttony, or accepts **unbonding** in Nhân Gian (§10). |
| **neutral** | She reaches the Seat first and sits. He must persuade her, fight her (Envy), or let her be (Greed, Sloth). |
| **opposed** | She is already seated when he arrives, channelling. **She must be fought.** This is the Envy duel if Envy is available, otherwise a shorter fight. She lives after it unless the final act is Wrath. |
| **dead** | The Seat is empty. If `CH9_MOTHER = kept`, the Mother's voice: *"Ghế trống. Con có thể đi qua."* (The seat is empty. You can walk past it.) |

**The Envy duel** (if Envy is available and Diệp is present): a full boss fight, the strongest version of her kit with the Source channelling through her. He defeats her and **takes the Seat from her**. *"Em đến để thay chị."* (I came to take your place.) If Envy is then chosen as the final act, it becomes the climax of that ending.

## 8. Thủ Mạch Nhân (XII-3)

| Condition | Position |
|---|---|
| `CH10_COMMAND = tmn` or `CH11_ALLIANCE = seal` | He holds the Rim with the construct army or the clans. **He is an ally.** |
| `CH11_ALLIANCE = hoi` | **He opposes the convergence.** A **branch confrontation**: in Pride and Gluttony he can be defeated now (TB T7), and winning is staged as disturbing; in other branches he withdraws. |
| `CH11_ALLIANCE = own` | **He waits at the Seat** to see what the protagonist will do. In Nhân Gian he asks the final question (§10). |

## 9. The final bosses: Nguyên Linh's reflections

Each final act summons a different reflection. **Every reflection is built from the player's own build**: absorbed Mạch Ấn, class kit and earlier boss patterns. **Refused Mạch Ấn are missing from it.**

| Final act | Reflection | Form and mechanic |
|---|---|---|
| **Nhân Hoàng** | **Hoàng Đế** (the Emperor) | Himself, crowned, on a throne of nine Mạch. Attacks are **decrees** that rewrite arena rules (no dodging, no healing, no retreat). He commands perfect copies of the player's allies. |
| **Kẻ Giữ Mạch** | **Kẻ Giữ** (the Keeper) | Himself as a keeper of the seal, with a door at his back. Attacks **seal and grab**, like Thủ Mạch Nhân's sealing and Thiên Điểu's grip (CH5, CH8). He never pursues; he only guards. |
| **Ngày Không Còn Thần** | **Kẻ Đốt** (the Burner) | Himself in fire and lightning. **Every hit destroys arena terrain permanently**, so the battlefield shrinks to nothing. Echoes of Bến Sét. |
| **Kẻ Thay Thế** | **Hai Mặt** (Two Faces) | After the Envy duel: a figure wearing **Diệp's face and his own**, using both kits. It speaks in turns. *"Người ta tin chị."* / *"Người ta tin em."* |
| **Vĩnh Sinh** | **Người Thương** (the Beloved) | The beloved (Mother, Diệp or Father) in light. **It does not attack.** While he holds it, the arena's edges die: forests, then seas, then sky. **The "fight" is choosing to keep holding.** He wins by not letting go. |
| **Vạn Mạch Chi Thân** | **Vạn Mạch** (Ten Thousand Mạch) | A devouring mass of every Mạch Ấn he absorbed (Cửu Ấn and Diệp's included). **He wins by consuming it.** |
| **Thế Giới Cũ** | **Kẻ Đứng Yên** (the One Who Stands Still) | A still figure that **never attacks**. Time passes in the arena: seasons, years, the world aging outside. **He cannot damage it.** He wins by lowering his weapon, the despairing mirror of Vô Diện. |
| **Nhân Gian** | **Người Đầu Tiên** (the First) | **The first Bearer's echo**: a radiant, kind will that offers to remove all loss. It **heals his enemies, shields his allies and undoes his hits.** He is fighting goodness itself. He wins by **breaking its connection to the Seat** (Thiên Cơ Tướng's lesson), not by damaging it. |

## 10. Epilogues

Each ending follows its NB description **[NB §8]**, with variations drawn from the bibles and flags.

### I. Nhân Hoàng
- Linh Suy is halted and war ends: peace under one will.
- **The Father** (FB F8): lives under his son's order, spared and overruled.
- **Diệp** (N9): refuses and leaves, or resists. If she resists, he must decide whether to overrule her too, shown in one last scene.
- **Thủ Mạch Nhân:** defeated if confronted; he dies still keeping the seal. Otherwise he walks away.
- **Realms:** the ones he helped prosper and the others are rebuilt "efficiently". **The Tường Tên is moved to his palace.**

### II. Kẻ Giữ Mạch
- He seals the Source and keeps it. Protection becomes possession.
- **The Father** is kept away from Nguyên Linh "for safety".
- **Diệp** is shut out, the way he was shut out of the truth.
- **Thủ Mạch Nhân** is **replaced**: the protagonist becomes the new keeper, of a promise *he* chose.
- **Final image:** the protagonist, years later, before a door, **telling a child nothing**.

### III. Ngày Không Còn Thần
- He destroys the system: the Cửu Mạch, the seal and all access. Many die in the transition.
- **The Father** dies in the destruction, possibly by his hand.
- **Diệp** accepts the cost: the one ending where they agree, too late.
- **Thủ Mạch Nhân** dies, released.
- **Final image:** generations later, children grow up in a world without spiritual power, **and no one can say whether it was destruction or liberation**.

### IV. Kẻ Thay Thế
- He takes Diệp's place in the Hội and completes the convergence as its Bearer.
- **The Father** chose Diệp's path over his son's and watches his son take it.
- **Diệp** is defeated and alive, and stays at the edge of the Hội he now leads.
- **Thủ Mạch Nhân** dies opposing the Hội that the protagonist now leads in Diệp's place. **[TB T8]**
- **Final image:** he signs a ledger of numbers, **in his own handwriting**, deciding which villages come first.

### V. Vĩnh Sinh
- Resurrection of the beloved (Mother, Diệp or Father) **succeeds**. The cost is drawn from the world's spiritual future.
- **Thủ Mạch Nhân** warns him and is ignored. His seal marks go dark.
- **Final image:** the beloved alive beside him, **and far-off ecosystems beginning to die**. If it is the Mother: *"Mẹ đã chọn rồi mà con."* (I already made my choice, son.)

### VI. Vạn Mạch Chi Thân
- He absorbs Nguyên Linh itself and becomes unmatched, but cannot stop consuming.
- **The Father** recognizes his fragment as the hunger.
- **Diệp's** bonded fragment is part of what was consumed (if she lived, she is now unbonded and diminished).
- **Thủ Mạch Nhân** is absorbed.
- **Final image:** the strongest being in the world, **alone, still hungry**.

### VII. Thế Giới Cũ
- He refuses to impose any decision and goes home to An Mộc.
- **The Father** comes too, and they live in the same house in silence.
- **Diệp** keeps fighting Linh Suy without him.
- **Thủ Mạch Nhân** keeps the seal, dying slowly.
- **Final image:** years later, by **the dry well**, a child asks whether he could have changed it. He doesn't answer. **The man who called waiting the stupidest human invention ends the game waiting.** **[PB L12]**

### VIII. Nhân Gian
- He **unbonds himself** using the stele (`CH10_STELE`) and **distributes** the Source's access across many keepers: the realm allies he gathered and the factions he trusted. **No one will sits alone.**
- He becomes an ordinary man, weaker, and once again at risk from the Linh Suy that once almost killed him. **[new]**
- **Diệp:** he offers her unbonding, **and asks her consent**, the thing he was never given.
  - **Đồng Hành:** she accepts.
  - **Tôn Trọng or Đoạn Tuyệt:** she refuses and becomes one of the keepers.
  - **[DB N9]**
- **The Father** faces judgment under the new order and accepts it without asking forgiveness.
- **Uyên** lives to see it.
- **Diệp** is the first to ask him whether the new order is truly his to impose. **[DB N9]**
- **Final image:**
  - **Thủ Mạch Nhân**, released, asks: ***"Ai cho ngươi quyền quyết định rằng không ai được quyền quyết định?"*** **[TB T8]**
  - The protagonist has no answer.
  - **Tội Thứ Tám — Phán Xét.**

### Common to all epilogues
- **The state of each realm** comes from `CH11_HELPED`, `CH3_WATER`, `CH7_CHOICE`, `CH6_ABSORBED`, `CH4_SAVED` and `CH8_SAVED`.
- **An Mộc:** `PRO_VILLAGE_TOLD` and `CH1_TU_FAMILY`. The dry well always appears in the last shot of An Mộc.
- **Cát** (if alive) appears grown, still counting.

## 11. Checkpoints (ADR-0006)

- A Rim camp checkpoint, run by his allies.
- **The Source Seat is the last checkpoint in the game**, the original Mạch node. It is lit once, at the end.

## 12. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH12_FATHER_HELD` (son / father / hoi) | §5 | Vĩnh Sinh eligibility; Father epilogue |
| `CH12_FINAL_ACT` (ending id) | §3.4 | Epilogue |
| `CH12_DIEP_UNBOUND` (bool) | §10 VIII | Nhân Gian epilogue |

## 13. Design constraints

1. **No ending may be presented as the correct one.** **[NB rule 4; ADR-0003]**
2. **Nhân Gian must not play as a reward.** Its final line is a question with no answer.
3. **Every final boss must feel like a self-portrait,** and must use the player's real build.
4. **A player who refused power must feel it** in the reflection's weakness, in Thiên Cơ Tướng (Ch. X), and in the Nhân Gian gate.
