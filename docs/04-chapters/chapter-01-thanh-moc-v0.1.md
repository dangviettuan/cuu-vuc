# Chapter Spec — Chapter I: Thanh Mộc (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[WB]** World Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[PRO]** Prologue spec, **[GB]** Gameplay Bible, **[new]** a new invention.

## Inputs (already canon)

- The protagonist enters the forest to look for the Father. **Main boss: Mộc Giác**, an ancient guardian beast suffering because the local Linh Mạch has been damaged. After defeating it, he discovers that **the Linh Mạch was deliberately cut**, and he absorbs the first Mạch Ấn. **[NB Ch.I]**
- **Thanh Mộc gameplay:** poison, root effects, beasts, a living environment. **[WB]**
- **Arc state:** Certainty. Entering: single-minded, find the Father. Leaving: angry, because someone *cut* the Mạch, so there is a villain to stop. **[PB L10]**
- **Class choice:** at Mộc Thành, from four mentors, before Mộc Giác. Diệp makes the introductions. **[PB L9, DB N6]**
- **Diệp** is an AI ally in Ch. I–IV, fighting with a warden's spear. **[DB N6]**
- **Mộc Giác** recognizes the fragment in his chest. The half Mạch Ấn crumbles at the first absorption. **[FB F3]**
- **Cương's cell** is at the cut site. Cương is the first human face of Quy Nguyên and walks away without a fight. **[FF K2]**
- **Quy Nguyên Hội is not named until Ch. II.** **[NB Ch.II]**
- **Prologue flags consumed:** `PRO_VILLAGE_TOLD`, `PRO_SOW_SPARED`. **[PRO]**

---

## 1. Narrative objective

Turn the search for the Father into a **hunt for a culprit**. The player should finish Ch. I believing the story is simple, *someone did this*, while the game has quietly planted every crack that later breaks that belief:
- Diệp's doubts;
- Cương's honest line;
- Làng Khê;
- Mộc Giác recognizing the fragment in him.

## 2. Realm and locations

| Location | Function |
|---|---|
| **Mộc Thành** | A tree-built town on the trunks and roots of giant trees. Chapter hub. Home of the Hộ Lâm, Lâm Trưởng Ngàn, the four mentors, a smith and the Mạch shrine checkpoint. **[WB; FF G3]** |
| **Rừng Ngoài** (Outer Forest) | The trail from the station to Mộc Thành, then the first search routes. |
| **Rừng Sâu** (Deep Forest) | Poisoned, root-choked, where the corruption is densest. |
| **Làng Khê ruins** | Optional. Diệp's dead home settlement. **[FB F2, DB N1]** |
| **Lõi Mộc Giác** (Mộc Giác's Grove) | The boss arena, built around an ancient Mạch node. |
| **Vết Cắt** (The Cut) | The cut site beyond the grove, where Cương's cell is finishing its work. |

## 3. Critical path stages

| # | Stage | Content |
|---|---|---|
| I-1 | **Mộc Thành** | He arrives with the Father's dropped rod. **Reunion with Diệp.** He reports to Ngàn, who is short of wardens because the forest is turning. Diệp says the hard thing (§12, beat 1). **He does not tell Diệp about the half Mạch Ấn**, the first time he withholds something from her. She finds out only when she witnesses the absorption in I-5. **[Prose Ch.3]** |
| I-2 | **Bốn Con Đường** (Four Paths) | Diệp introduces the four mentors (§5). **The player chooses a class**, followed by a short training stage that teaches the class kit. |
| I-3 | **Dấu giày** (Boot prints) | He follows the boot prints from the station into the Outer Forest with Diệp. Consumes `PRO_VILLAGE_TOLD` (the lost family) and `PRO_SOW_SPARED` (the herd blocking a route, or the dead litter). |
| I-4 | **Rừng Sâu** | The corrupted forest: poison, root hazards, root-corrupted beasts. Living-root barriers open with the half Mạch Ấn. **Mini-boss: Độc Đằng.** |
| I-5 | **Mộc Giác** | Boss (§8). After the fight, the absorption is **involuntary**: the fragment in his chest *pulls* the Mạch Ấn into him. **The half Mạch Ấn crumbles.** **Diệp sees it happen.** |
| I-6 | **Vết Cắt** | The node beyond the grove has been cleanly severed: **the Mạch was cut deliberately.** A gauntlet against the cell's operatives, then a mini-boss: the cell's squad leader. **Cương** speaks (§12, beat 4) and withdraws. A wounded operative, **Sẻ**, is left behind. **Choice C1.** |
| I-7 | **Về Mộc Thành** | Report and evidence: a cutting tool made of Thiên Kinh–grade alloy. Ngàn: the Hộ Lâm cannot fight what Thiên Kinh made. **Decision:** take the evidence to Thiên Kinh. Ngàn gives Diệp leave to go with him. This leads into Ch. II. |

## 4. Optional areas

- **Làng Khê ruins** (Diệp's yearly visit; offered after I-3):
  - She shows him the dry stream bed and the empty houses. *"Linh Suy lấy hết, trong một mùa."*
  - **The half Mạch Ấn pulses harder here than anywhere else.** He doesn't understand why. She doesn't notice. The player may.
  - Writes `CH1_KHE_VISITED`, which Ch. IX uses for a recognition beat. **[new; FB F2–F3]**
- **Hộ Lâm side requests** in Mộc Thành: escorts, herb runs, a cut station. These build `CH1_HOLAM_STANDING`.
- **A dark station:** a Người Dẫn Mạch station in the Outer Forest that the cut has knocked out. It is *not* a checkpoint until he reignites it with Diệp's help. This is the first demonstration of ADR-0006. **[new]**

## 5. The four mentors (resolves the open mentor question)

Each mentor briefly states a view on *what strength is for* **[PB L9]**, as a light hint toward one of the decision axes.

| Class **[GB]** | Mentor | Who | "Strength is…" | Axis hint |
|---|---|---|---|---|
| **Kiếm Khách** (parry/counter) | **Lão Trụ** | An old ex-soldier from Trung Vực who settled in Mộc Thành after decades of border wars | *"…để đứng chắn giữa."* (to stand in between) | One life vs many |
| **Ảnh Vệ** (dodge/combo/crit) | **Én** | A young Hộ Lâm scout, Diệp's former trainee | *"…để không ở chỗ đòn đánh rơi xuống."* (to not be where the blow lands) | Freedom vs order |
| **Ngự Linh** (magic/summon) | **Bà Rêu** | An herbalist hermit who speaks with forest spirits | *"…là thứ vay mượn. Phải trả."* (borrowed, and must be repaid) | Accepting limitation vs more power |
| **Cơ Sư** (ranged/devices/traps) | **Toản** | A former Thiên Mạch Ty craftsman who quit and now builds traps for the Hộ Lâm | *"…là chuẩn bị. Cái bẫy tốt quyết định trước khi kẻ địch kịp chọn."* (preparation: a good trap decides before the enemy can choose) | Trust vs control |

- **Toản** gives Ch. II an early thread: he recognizes the alloy of the cutting tool in I-7.
- The unchosen mentors remain in Mộc Thành as NPCs.

## 6. NPC cast

| NPC | Role |
|---|---|
| **Diệp** | AI ally. Introduces the mentors. Takes the protagonist to Làng Khê (optional). Witnesses the absorption. |
| **Lâm Trưởng Ngàn** | Hub authority. Applies forest law in C1. Grants Diệp leave. **[FF K5]** |
| **The four mentors** | §5. |
| **Cương** | Seen once, at the Cut. Unnamed in Ch. I: the protagonist knows him only as "the man at the Cut". **[FF K2]** |
| **Sẻ** | A wounded young operative of Cương's cell, about 19, left behind at the Cut. The subject of C1. **[new]** |
| **Nhà Tư** | The An Mộc family lost in the forest (only if `PRO_VILLAGE_TOLD`). **[PRO]** |

## 7. Enemies and mini-bosses

- **Thú hóa rễ:** beasts with Linh Suy roots growing through them (boars, deer, great cats). The next stage beyond the Prologue's panicked animals.
- **Độc thảo:** poison flora: spore pods, grasping vines, poison mist zones.
- **Rễ sống:** living-root hazards that regrow after being cut.
- **Người cắt mạch:** Cương's operatives, the **first human enemies**. They use disciplined pairs and nets, and they retreat rather than die.
- **Mini-boss: Độc Đằng (Poison Vine Colossus),** in I-4. A mass of corrupted vine that teaches poison management and cutting off its weak points.
- **Mini-boss: the cell's squad leader,** in I-6. A human duel that teaches the class kit against a thinking opponent.

## 8. Main boss — Mộc Giác

- **Form:** a vast antlered guardian beast. Its antlers are living trees, and its hide is cracked with dark veins (Linh Suy). **[WB; Ch1 leaf imagery]**
- **Worldview:** it guards Thanh Mộc's Mạch. It is in agony, and when it smells the stolen fragment in the protagonist's chest **it sees a thief**. It is not wrong. **[FB F3; NB rule 2]**
- **Phases:**
  1. **Guardian:** antler sweeps, root eruptions and charges. A readable, fair fight.
  2. **Wounded Mạch:** poison bleeds from its veins and the arena's roots turn hostile. It focuses on the protagonist and ignores Diệp: *it is after what is in him*.
  3. **Recognition:** it stops attacking for a moment and lowers its head toward his chest, then attacks with desperate force. The half Mạch Ấn pulses wildly through this phase.
- **Ending:** Mộc Giác dies of its wounds and the Linh Suy, not from a killing blow. The absorption happens *to* him.

## 9. Mạch Ấn reward — Mạch Ấn Mộc Giác

| | |
|---|---|
| **Name** | Mạch Ấn Mộc Giác — *Rễ Giữ* (Holding Roots) |
| **Build effect** | A perfect defence (parry, perfect dodge, a well-timed trap or ward, depending on class) makes roots erupt and **bind nearby enemies** briefly. This changes how each class plays defence. |
| **Passive** | **Root passage:** living-root barriers in Thanh Mộc open for him permanently. The forest recognizes the one who carries its guardian. This replaces the half Mạch Ấn, which has crumbled. |
| **Narrative** | His first absorption. It is involuntary and witnessed by Diệp. **[FB F3; DB]** |

## 10. Items, materials and unlocks

- **Class starter weapon** from the chosen mentor. The brush-knife is kept as a keepsake.
- **Tier 1 materials:** Thanh Mộc hardwood, beast hide, resin, spore sacs.
- **First smith upgrades** in Mộc Thành.
- **Antidote herbs:** poison management, introduced at Độc Đằng.
- **Móc Câu (grappling hook):** Toản's parting gift in I-7, used from Ch. II onward. **[Ch. II spec §10]**

## 11. Checkpoints (ADR-0006)

- The Mộc Thành shrine (hub).
- Two Người Dẫn Mạch stations in the Outer Forest. **One is dark** until reignited (§4).
- A Hộ Lâm waystation shrine in the Deep Forest.
- The grove's node is **not** a checkpoint: it has been cut.

## 12. Key beats and dialogue

1. **I-1, Diệp says the hard thing:** *"Nếu họ bắt cha, họ cần ông ấy còn sống. Còn nếu không ai bắt… thì ông ấy có lý do của ông ấy."* The protagonist rejects the second half outright. **[DB N2; FB F4]**
2. **I-3, the lost family (if `PRO_VILLAGE_TOLD`):** the mother and child of nhà Tư are found alive in a hollow tree. **The husband is dead** from a beast attack. Telling the truth saved the village's homes and cost this family a father. **[PRO §8; NB rule 5]**
3. **I-5, after the absorption:** Diệp, quietly: *"Cái gì vừa xảy ra với em vậy?"* He has no answer. This is the first time she is afraid *of* something in him. **[new]**
4. **I-6, Cương:** the protagonist holds up the Father's rod. *"Ông ấy đâu?"* Cương looks at the rod a moment too long. *"Không ai bắt ai cả, nhóc."* He leaves. **The protagonist hears a villain's lie. It is the truth.** **[FF K2; FB F4]**
5. **I-7, Ngàn:** *"Thiên Kinh làm ra cái này. Thì để Thiên Kinh trả lời."* This sets up Ch. II's belief that institutions will act on evidence. **[NB Ch.II]**

## 13. Major choice — C1: Sẻ, the one left behind (I-6)

Sẻ is wounded, frightened and silent about his organization.

| Option | Immediate | Delayed | Axes |
|---|---|---|---|
| **Hand him to the Hộ Lâm** | Ngàn applies forest law: those who cut the forest hang. It happens off-screen at dawn, and Diệp tells him. `CH1_HOLAM_STANDING` rises. | Sẻ is dead. In Ch. IX (U Minh) he is among the dead whose fate the protagonist decided. | Punishment; order |
| **Let him go** | Ngàn is cold. Hộ Lâm standing drops. Diệp says nothing, but she approves. | **Ch. V:** in the Thiên Kinh chaos, Sẻ (now openly Quy Nguyên) repays the debt by getting the protagonist and Diệp out of a mob. | Forgiveness; trust |
| **Force answers** | He gets a Thiên Kinh safehouse location, an alternative lead in Ch. II. Diệp sees him hurt a wounded boy. | Sẻ survives and hates him. **Ch. IV:** Diệp cites this when the fracture comes: *"Em cũng từng làm đau người ta vì một mục đích."* | Control; punishment |

**Weighting:** low to medium. This is the first choice with a human life at stake.

## 14. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH1_CLASS` (enum) | I-2 | Combat systems; mentor dialogue on revisits; T5 counters in Ch. V |
| `CH1_SE_FATE` (handed / released / forced) | C1 | Ch. II alternative lead; Ch. IV Diệp argument; Ch. V rescue; Ch. IX U Minh |
| `CH1_KHE_VISITED` (bool) | §4 | Ch. IX recognition beat |
| `CH1_HOLAM_STANDING` (int) | C1, side requests | Thanh Mộc revisits; Ch. XI Hộ Lâm aid |
| `CH1_TU_FAMILY` (rescued, father dead) | I-3 if `PRO_VILLAGE_TOLD` | An Mộc revisit |

**Prologue flags consumed:** `PRO_VILLAGE_TOLD` (I-3), `PRO_SOW_SPARED` (I-3: the herd blocks the main route and the detour uses the herd's hidden trail; Ngàn reports a gored warden. If not spared, the dead litter lies on the trail.)

**Ending axes influenced:** forgiveness vs punishment and trust vs control (C1); accepting limitation vs more power (lightly, through the class mentor's framing only).
