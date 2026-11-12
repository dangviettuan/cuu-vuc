# Chapter Spec — Chapter XI: Cửu Mạch (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[TB]** Thủ Mạch Nhân, **[CH1–10]**, **[PRO]** chapter specs, **[new]** a new invention.

## Inputs (already canon)

- Linh Suy reaches a point where **collapse can no longer be hidden.** **All nine realms enter crisis.** Earlier choices return as world state:
  - NPCs previously saved may appear again;
  - people who were spared may help or betray;
  - communities sacrificed earlier may simply no longer exist;
  - former allies may refuse help because of what the player did.

  **The Father, Người Đồng Hành and the protagonist each have to commit to what they believe.** **[NB Ch.XI]**
- **Arc state:** self-awareness, with the branch now forming. Entering: he faces the consequences of his choices as world state. Leaving: he has committed to a belief. **[PB L10]**
- **Quy Nguyên's convergence has begun.** **[CH10 X-9]** Diệp is the Hội's intended Bearer, and the protagonist is the accidental one. **[CH10 §2]**
- **Diệp's role follows `CH8_STATE`** (Đồng Hành: may fight beside him; Tôn Trọng: may help or hinder; Đoạn Tuyệt: opponent; Tử: absent). **[DB N8]**

---

## 1. Narrative objective

**Make the player pay for and collect on the whole game, then make him choose a side.**
- The world becomes a map of the player's decisions.
- He can't save every realm before Thiên Tâm closes, the same as every chapter before.
- At the end he decides **who he walks into Thiên Tâm with**. That is a statement of what he believes, not an ending selector.

## 2. The crisis

- The convergence **pulls the nine Mạch toward Thiên Tâm**. Every realm's Mạch strains. Stations crack, the land shifts, and Linh Suy accelerates everywhere at once. **[new]**
- **The Cửu Gia mobilize.** The Charter's heirs march their House armies to seize Thiên Tâm and **take the source for themselves**, as the Charter always intended. **[CH6; FF G1]**
- **The boundary of U Minh thins.** The dead are seen in the living realms: the Gallery (CH9) walks the roads. **[new]**

## 3. Structure: the convergence clock

- The chapter is a **hub map of all nine realms**, reached by Mạch-station fast travel (ADR-0006) wherever stations still stand.
- **The Đồng Hồ Hội Tụ** (convergence clock) advances with each realm crisis he resolves. **He can resolve four of the eight outer crises** before the road to Thiên Tâm closes. Trung Vực is always the final stage.
- **Each realm he does not help suffers its worst outcome** and appears that way in the epilogues.
- This is deliberately the game's final lesson in limitation: *even now, he cannot save everyone.* **[NB rule 5; PB L5]**

## 4. Realm crises (pick four)

Each crisis consumes earlier flags. Allies gained here appear at Thiên Tâm (Ch. XII).

| Realm | Crisis | What earlier flags change | Ally gained if helped |
|---|---|---|---|
| **Thanh Mộc** | The forest's cut Mạch is torn wider. An Mộc and Mộc Thành are threatened by a root-tide. | `PRO_VILLAGE_TOLD` (An Mộc trusts or resents him: *"giống hệt cha mày"*); `CH1_TU_FAMILY`; `CH1_HOLAM_STANDING` (whether Ngàn will fight beside him); `PRO_SOW_SPARED` (Nanh Rễ's grown litter, now root-beasts, either clear a path or block it) | **The Hộ Lâm** (Ngàn) |
| **Xích Sa** | The Great Well starts to fail early. Xích Thành riots. | `CH3_WATER` (enforced: Hạo holds the city and asks for help; broken: a half-empty city; overthrown: **Đan diverting again, and the Wall plastered over**); `CH3_CAT_ALIVE` (Cát, now counting people); `CH3_HAO_STATE` (whether Hạo is the one who asks) | **Xích Vương Hạo** or **Đan's army** |
| **Lôi Trạch** | The marsh's storms have no sink left (CH4). Lightning walks the land. | `CH4_SAVED` (survivors, Bà Lành); `CH4_SPEAR` | **Bến Sét survivors** (guides through the storm at Thiên Tâm's edge) |
| **Hàn Sơn** | The glacier breaks, and the frozen dead of both armies rise. | `CH6_ABSORBED` (thawed: the clans are scattered but the truth is public; refused: **Trúc and the clans hold the ice and march**); `CH6_CLAN_TRUST` (how many clans march) | **The Hàn Sơn clans** |
| **Huyền Hải** | Huyền Kình's body has sunk, and tidal surges hit the coast. | `CH7_CHOICE` (port: Cảng Triều sends ships; record: **the port is in ruins**, and Rạn may refuse to speak to him; pact: the port and the Hội cooperate) | **Cảng Triều's fleet** |
| **Vân Hải** | The joined isle holds, but every other isle falls faster. | `CH8_SAVED`; `CH8_STATE` (Bà Gió trusts or mourns) | **The sky-folk** (wind-kites over Thiên Tâm) |
| **U Minh** | The dead cross over. The Gallery walks. | `CH9_*`; the Gallery cast. **Helping here means letting the dead go**: guiding them back across Bến Vong. | **No ally.** Instead, **remembrance**: the Nhân Gian ending requires `CH9_NAMED` or helping here. |
| **Thiên Khuyết** | Constructs wake everywhere, unsure whom to serve. | `CH10_COMMAND` (commanded: they are already his and the crisis is skipped at no cost; released: dormant, quiet; tmn: they march to the seal) | **The construct army** (if not already commanded) |

**The Trung Vực final stage is always played** (§6).

## 5. Encounters with people from earlier chapters

| Who | Condition | What happens |
|---|---|---|
| **Khải** | `CH5_KHAI = freed` | Brings what is left of the Ty's knowledge and stations to Thiên Tâm. He helps stabilize the field. |
| **Khải** | `executed` | Appears among the walking dead (U Minh crisis). |
| **Khải** | `tried` | The public trial broke the Ty. Its seal-wardens defect to the Houses. |
| **Sẻ** | `CH1_SE_FATE = released` | A Hội squad leader now. He gives the protagonist a secret route into Thiên Tâm. |
| **Sẻ** | `forced` | Leads a Hội ambush against him. |
| **Sẻ** | `handed` | Among the walking dead. |
| **Mặc** | `CH5_MAC = alive` | Tells him the Hội is split: Uyên's patience against Cương's urgency (and Diệp, if alive). Uyên means to **force a Bearer into the seat**, whoever is available. |
| **Cương** | `CH7_COUNG_TRUST` high | Warns him: *"Hội Chủ không cần chị ngươi đồng ý. Cũng không cần ngươi đồng ý."* |
| **Cương** | low | Hostile at Thiên Tâm's edge. |
| **Hằng** | always | Commands the Ty remnant beside House Lạc. She is one of the Houses' commanders at the gate. |
| **Rạn, Trúc, Cát, Bà Lành, Lão Trụ and the other mentors** | per realm crises helped | Cameos and lines. |

## 6. Final stage — Trung Vực: Cổng Hội Tụ (the Convergence Gate)

| # | Stage | Content |
|---|---|---|
| XI-F1 | **Thiên Kinh in ruins** | The capital has emptied toward Thiên Tâm, which lies past Trung Vực's heartland. The Houses' armies march. |
| XI-F2 | **The Father** | He finds the Father one last time before Thiên Tâm, at a roadside station (§7). |
| XI-F3 | **Diệp** | Her scene, set by `CH8_STATE` (§8). |
| XI-F4 | **The alliance** | **Choice C1** (§10). |
| XI-F5 | **Cổng Hội Tụ** | The Houses hold the Gate. **Main boss: Lạc Quân** (§9). His forces are opposed by the protagonist's allies from §4. |
| XI-F6 | **Thiên Tâm** | Through the Gate. This leads into Ch. XII. |

## 7. The Father, before Thiên Tâm (XI-F2)

| `CH5_FATHER_DEMAND` × `CH9_FATHER_VERDICT` | The scene |
|---|---|
| home × understand | The Father **hesitates**. For a moment he considers not going on. He goes on anyway: *"Nếu cha dừng lại bây giờ, những người đã chết vì cha sẽ chết vô ích."* He touches his son's shoulder **for the first time in the game**. **[Ch1 prose: the hand that pulls back]** |
| answer (any) | **No meeting.** The Father has kept his word: he answers only at Thiên Tâm. The protagonist finds his station empty, with the **second copper rod** left on the bench. |
| why × understand | They talk as equals for the first time. The Father gives *his own* reason at last: *"Cha đã nhìn xuống cái làng đó. Cha đã cắt. Cha sẽ không giả vờ là cha không nhìn."* |
| any × refuse | The Father says nothing in his own defence. *"Con nói đúng."* That is all he says. |
| any × diep | The protagonist asks why her. The Father: *"Vì nó đồng ý. Con thì không bao giờ được hỏi."* The Envy wound is answered with the one thing he can't argue with. |

## 8. Diệp, before Thiên Tâm (XI-F3)

| `CH8_STATE` | Scene |
|---|---|
| **Đồng Hành** | She **fights beside him** for the rest of the chapter. She is still the Hội's intended Bearer and still means to sit. *"Chị sẽ ngồi. Em sẽ đứng cạnh. Nếu chị sai, em kéo chị ra."* The echo of *"có gì thì chị kéo em ra"* from Bến Sét. |
| **Tôn Trọng** | She meets him on the road and tells him the Hội's plan honestly. She will not stop him and will not help him. *"Đến Thiên Tâm, ta làm điều mình tin."* |
| **Đoạn Tuyệt** | She leads a Hội force against his allies in one realm crisis of the player's choosing (whichever he does third). **Mini-boss: Diệp**, reprising her Ch. VIII kit, with more fragment power. She does not die here. |
| **Tử** | Absent. If `CH8_CHARM`: her charm appears in his inventory as a memento. If `CH9_MOTHER = kept`, the Mother's voice: *"Con bé đó… mẹ nhớ nó lúc bảy tuổi."* |

## 9. Main boss — Lạc Quân, Lord of House Lạc

- **Who:** **new.** The head of House Lạc and leader of the Cửu Gia coalition marching on Thiên Tâm. The first Cửu Gia lord met in person. Male, about 60.
- **Weapon:** **Cửu Ấn** (the Nine Seals), the nine Houses' emblems fused into one. Each holds a Mạch fragment cut centuries ago under the Charter. **He is a counterfeit Bearer**: nine stolen fragments worn on a chain, not bonded. **[CH2 Ấn Ty reveal; CH6 Charter]**
- **Worldview:** *"Tổ tiên ta chia thế giới để cứu nó. Bọn ta giữ nó để không ai phá. Ngươi gọi đó là ăn cắp. Ta gọi đó là thừa kế."* (My ancestors divided the world to save it. We keep it so that no one breaks it. You call it theft. I call it inheritance.) He sincerely believes order is a gift his family has given everyone for centuries. **[NB rule 2]**
- **Phases:**
  1. **The Lord:** a duelist with House guards and seal-wardens (Hằng commands them).
  2. **The Nine Seals:** he uses one House seal at a time, each sealing a different category of the player's tools. A human imitation of Thủ Mạch Nhân. **[TB T5]**
  3. **The Inheritance:** he tries to channel all nine at once. They are not bonded to him, and they begin to burn him. The player can end it by destroying the seals or by tearing them free.
- **Proof modifier:** if `CH7_RECORD = full | shared` and `CH6_CHARTER`, the protagonist can **lay the Nine's own record and the Charter before the House armies** before the fight. Half of the House soldiers desert, and Phase 1 is shorter. **[CH6–7]**
- **Ending:** Lạc Quân falls, and the nine fragments in Cửu Ấn lie loose (§9a).

### 9a. The nine fragments of Cửu Ấn (optional)

- **Absorb all nine:** a massive power gain. **The single largest Gluttony weight in the game.** Thủ Mạch Nhân or Diệp, whoever is present: *"Người đầu tiên cũng đã cần thêm."*
- **Refuse:** he leaves them.
- **Return:** a Nhân Gian–leaning option, available only with `CH10_STELE`. He gives one fragment each to the allied factions present (the Hộ Lâm, Hàn Sơn clans, sky-folk, Cảng Triều, and so on). It is a first, small act of **distribution**.

## 10. Major choice — C1: the alliance (XI-F4)

Before the Gate, every faction wants him. He chooses who he walks into Thiên Tâm *with*.

| Alliance | Who | Meaning | Ending weights |
|---|---|---|---|
| **The Hội** | Uyên, the Father, Cương, Diệp (if alive and not Đoạn Tuyệt) | The convergence should happen. The question is who sits. | Pride, Envy, Gluttony, Desire (depending on other weights) |
| **The Seal** | Thủ Mạch Nhân, the Hàn Sơn clans (if allied), Khải (if freed); the constructs (if tmn) | The convergence must be stopped and the old promise kept. | Greed, Sloth |
| **His own** | The realm allies he gathered in §4 | No faction decides for everyone. He walks in with the people who came. | Nhân Gian, Wrath (depending on other weights) |

**Not an ending selector.** The alliance sets **which forces are present** at Thiên Tâm and **adds weight** to the profile (see Ch. XII §3). Every ending stays reachable from every alliance if the rest of the profile supports it.

## 11. Checkpoints (ADR-0006)

- **Many stations are cracking.** Fast travel is lost to realms whose crisis he didn't resolve. This is ADR-0006's damage clause at full scale.
- The Convergence Gate has a forward camp checkpoint run by his allies, so it always exists.

## 12. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH11_HELPED` (set of 4 realms) | §3–4 | Ch. XII forces; epilogues |
| `CH11_ALLIANCE` (hoi / seal / own) | C1 | Ch. XII forces; ending weights |
| `CH11_CUU_AN` (absorbed / refused / returned) | §9a | Ch. XII Gluttony / Nhân Gian weights |
| `CH11_FATHER_SCENE` (hesitated / absent / equals / silent / why_her) | §7 | Ch. XII Father fate |
| `CH11_DIEP_ROLE` (beside / neutral / opposed / dead) | §8 | Ch. XII Diệp fate |

**Ending axes influenced:** every axis receives a final, moderate push from C1 and §9a. The heaviest are trust vs control (alliance) and more power (Cửu Ấn).
