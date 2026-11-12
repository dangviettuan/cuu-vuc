# Chapter Spec — Chapter II: Trung Vực (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[WB]** World Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[CH1]** Chapter I spec, **[TB]** Thủ Mạch Nhân, **[new]** a new invention.

## Inputs (already canon)

- He travels to **Thiên Kinh** believing powerful institutions will fix the problem once shown evidence. He meets bureaucracy, competing factions, political interests, schools and attempts to suppress the truth. **Quy Nguyên Hội enters the story.** A dangerous possibility appears: **cutting the Linh Mạch may not have caused Linh Suy.** **[NB Ch.II]**
- **Arc state:** Certainty. Entering: trusts that institutions will act on evidence. Leaving: disillusioned with institutions, but his moral map is intact. **[PB L10]**
- **The Thiên Mạch Ty** suppresses his evidence. **Chưởng Ty Khải** knew the Father, is warm toward the son, and suppresses the evidence anyway: the first institutional betrayal. **Uyên** is only a voice and a rumour in this chapter. **[FF G2, K1, K3]**
- He finds traces of the Father's past: old records, the former teacher (Uyên, by reputation), and the Father's own reputation. **[FB F1]**
- **Diệp** travels with him as an AI ally. **[DB N6]**
- **The evidence:** a cutting tool made of Thiên Kinh–grade alloy, which Toản recognized. **[CH1 §5, I-7]**
- **Flags consumed:** `CH1_SE_FATE`, `CH1_HOLAM_STANDING`. **[CH1]**

---

## 1. Narrative objective

**Break his faith in institutions without breaking his faith in right and wrong.** He leaves Thiên Kinh sure that the powerful are liars and that Quy Nguyên are criminals, while holding a record that says the story is not that simple.

## 2. Realm and locations

Trung Vực's identity is **humanity rather than a natural element** **[WB]**. Its stages are urban and vertical, full of crowds and human enemies.

| Location | Function |
|---|---|
| **Cổng Nam** (South Gate market) | Arrival. Crowds, trade, Ty notices calling Linh Suy "local and seasonal". |
| **Học Phường** (School Quarter) | Ty academies where Người Dẫn Mạch students recite the public history. The Father's reputation lives here. |
| **Thiên Mạch Ty** headquarters | Khải's office. The bureaucracy stage: queues, seals, petitions. |
| **Tàng Thư Cấm** (Restricted Archive) | The core set piece: an infiltration under the Ty headquarters. Boss arena. |
| **Hạ Thành** (Lower City) | Slums along the canals, with a Quy Nguyên safehouse. |
| **Thượng Thành** (Upper City) | The Cửu Gia palace district. Seen and felt, not entered, in Ch. II. |

## 3. Critical path stages

| # | Stage | Content |
|---|---|---|
| II-1 | **Thiên Kinh** | Arrival. The scale and indifference of the capital. The Ty's public notices. Diệp is uneasy in crowds and he is dazzled by them. |
| II-2 | **Đơn trình** (The petition) | A bureaucracy gauntlet as gameplay: queues, the wrong window, a clerk who wants a fee. It ends when **Khải** hears the name of the Father's village and receives them himself (§12, beat 1). He takes the evidence and promises action. |
| II-3 | **Học Phường** | While they wait, they explore the School Quarter. Old lecturers remember the Father as the best student of his year, *"lẽ ra đã ngồi ghế Chưởng Ty"*, and his teacher **Uyên**, *"người đã bỏ đi"*. His name is carved three years running on the class honours board. An old sweeper mentions Uyên's three best students: Khải, the Father, *"và một con bé bỏ học năm thứ hai"* (the Mother, unrecognized; FB F1). The public history is taught as doctrine. |
| II-4 | **Im lặng** (Silence) | Days pass. A Ty notice declares the Thanh Mộc incident "a seasonal collapse" and blames "unlicensed woodcutters". The evidence has been buried. **The first institutional betrayal.** |
| II-5 | **Hạ Thành** | Following the alloy trail, they reach the canals and meet **Thư Lại Mặc**, a Ty archivist secretly working for Quy Nguyên. **He names the Hội. Quy Nguyên enters the story.** He offers a way into the Restricted Archive, *"để cậu tự thấy"*. |
| II-6 | **Tàng Thư Cấm** | An infiltration into the Restricted Archive (§4). They find **the Father's file** and **the suppressed decline records** (§12, beat 3). Diệp finds a sealed entry for **Làng Khê**. |
| II-7 | **Giám Mạch Hằng** | Ty enforcement catches them in the archive. Boss fight (§8). Mặc stays behind to burn the archive index so the Ty cannot trace what was taken, and he is captured. |
| II-8 | **Hồ sơ** (The records) | They escape to the rooftops of Hạ Thành holding the suppressed records. **Choice C1.** |
| II-9 | **Đường Xích Sa** (The road to Xích Sa) | Two leads point the same way: Mặc's last message, and a Ty border-gate log. The Father crossed into **Xích Sa**. They leave Thiên Kinh. This leads into Ch. III. |

## 4. The Restricted Archive (II-6)

- **Gameplay:** an infiltration stage. **Ty seal-wardens** carry batons that briefly **seal one Mạch Ấn** on hit. This is a small, mortal echo of Thủ Mạch Nhân's power, foreshadowing Ch. V **[TB T5]**. Detection is not instant failure: it triggers a fight, and the alarm level escalates.
- **What they find:**
  1. **The Father's file.** A brilliant student record. An entry in the archive log from about 20 years ago shows him reading **"Phép Ghép Mạch"** (the Bonding Method) in the restricted stacks. **The page is torn out of the archive's copy.** The protagonist doesn't understand what this means; it pays off in Ch. IX **[FB F2]**.
  2. **The decline records.** Linh Suy symptoms are logged across several realms **150 years before the first known Quy Nguyên cut**, and successive Chưởng Ty sealed them. This is the dangerous possibility **[NB Ch.II; FF K1: what Uyên found]**.
  3. **The alloy.** Ty forge marks on cutting tools reported "stolen" over decades, with no investigation. The Ty has been leaking tools to the Hội, or someone inside it has.
  4. **(Optional, Diệp)** A sealed entry: *"Làng Khê — sụp Mạch cục bộ."* Why would a tiny village's collapse be sealed? She keeps the page. **[DB N1, N4 seed]** Writes `CH2_KHE_PAGE`.

## 5. Optional areas

- **Học Phường lectures:** sit in on a class and argue with the doctrine. This leads to codex entries on the public history of Đại Phân Ly.
- **The Cửu Gia envoy:** a well-dressed envoy from one of the Nine Houses offers to "help" use the evidence against a rival House. Accepting or refusing changes nothing material in Ch. II and sets `CH2_HOUSE_CONTACT` for Ch. V's chaos. It shows that the truth is merely ammunition here. **[FF G1]**
- **The Hạ Thành clinic:** refugees from early Linh Suy in the outer realms, ignored by the capital. Side requests.

## 6. NPC cast

| NPC | Role |
|---|---|
| **Diệp** | AI ally. Uncomfortable in the city. Finds the Làng Khê page. |
| **Chưởng Ty Khải** | Warm, sincere, and buries the evidence. **[FF K3]** |
| **Thư Lại Mặc** | **New.** A middle-aged Ty archivist and Quy Nguyên mole. Mild, precise, frightened, brave once. He names the Hội. He is captured in II-7, and his fate carries into Ch. V. |
| **Giám Mạch Hằng** | **New.** The Ty's Inspector-General of enforcement and Khải's loyal lieutenant. Boss of II-7. |
| **The Cửu Gia envoy** | Optional. Unnamed in Ch. II. |
| **Uyên** | Not met. Heard of in II-3 and through Mặc: *"Hội Chủ biết cha cậu."* |
| **Sẻ** | Only if `CH1_SE_FATE = forced`: the safehouse location he gave up leads straight to Mặc, shortening II-5. Mặc's people now know the protagonist hurt one of theirs. |

## 7. Enemies and mini-bosses

- **Ty guards:** shields and pikes, fighting in formation.
- **Ty seal-wardens:** seal-batons that seal a Mạch Ấn on hit (§4).
- **Lower City thugs:** opportunists in Hạ Thành.
- **Cửu Gia house guards:** optional; heavily armoured, seen in the envoy side content.
- **Mini-boss: Đội Trưởng Cổng Nam** (the South Gate Watch Captain), in II-1 or II-2 when a market riot over Ty notices spills over. **[new]**

## 8. Main boss — Giám Mạch Hằng

- **Who:** female, about 40. Inspector-General of Ty enforcement. **[new]**
- **Worldview:** *"Một tin đồn giết nhiều người hơn một trận dịch. Tôi đã thấy."* (A rumour kills more people than an epidemic. I have seen it.) Twelve years ago, a panic over a false Linh Suy report caused a stampede in a provincial city and killed hundreds. She believes silence is mercy. **[new; NB rule 2]**
- **Fight:** a disciplined duelist with **seal techniques**. She seals his Mạch Ấn *Rễ Giữ* for timed windows, forcing him to fight on class skill alone. This teaches him not to over-rely on Mạch Ấn before Ch. V. Phase 2: she draws on her **Ty seal-emblem** and briefly turns the archive's warding against him.
- **Outcome:** defeated, **not killed**. When he strikes the seal-emblem, the fragment in his chest **absorbs it** (§9).
- **She survives.** She reappears in Ch. IV as Khải's field commander at Lôi Trạch.

## 9. Mạch Ấn reward — Ấn Ty (Ty Seal)

| | |
|---|---|
| **Name** | **Ấn Ty — *Phong Tỏa*** (Lockdown) |
| **Build effect** | A charged or finishing hit **seals** one enemy ability for a short window, depending on class: it interrupts a spell, jams a mechanism or locks a special move. |
| **Narrative reveal** | **The Ty's seal-emblems are made from Mạch fragments.** The institution that forbids cutting the Mạch has been carving it into badges for centuries. This is the sharpest point of his disillusionment. **[new; FF G2]** |
| **Note** | His first Mạch Ấn absorbed from a human-held source. Diệp watches it happen a second time and says nothing. |

## 10. Items, materials and unlocks

- **Móc Câu (grappling hook):** Toản's parting gift at the end of Ch. I. Grapple points in Thiên Kinh open up rooftop routes. **Traversal unlock.**
- **Tier 2 materials:** city alloy, cloth, ink, Ty steel. A Thiên Kinh smith offers the first weapon reforge.
- **Codex:** the public history of Đại Phân Ly (the official version), the Father's student record, and the decline records.

## 11. Checkpoints (ADR-0006)

- A public Mạch shrine at Cổng Nam.
- A Ty station-shrine in Học Phường (open to licensed users; Khải grants access in II-2).
- **A Quy Nguyên safehouse shrine in Hạ Thành:** a stolen station core rewired as a shrine. Using it is itself a small complicity. **[new]**
- No checkpoint inside the Restricted Archive, for tension. There is one at its exit.

## 12. Key beats and dialogue

1. **II-2, Khải:** *"An Mộc? Cậu là con trai anh ấy?"* He looks at the protagonist for a long moment. *"Lẽ ra người ngồi ghế này là cha cậu."*
2. **II-4, after the notice:** the protagonist confronts Khải. *"Tôi tin cậu. Đó là lý do tôi không thể để ai khác tin cậu."* (I believe you. That is exactly why I cannot let anyone else believe you.) **[FF K3]**
3. **II-6, the decline records:** he reads the dates twice. Diệp: *"Một trăm năm mươi năm trước. Trước cả khi có cái Hội đó."* He replies: *"Thì họ cắt từ lâu hơn thế."* Certainty bends the evidence again. **[PB L10]**
4. **II-7, Hằng, defeated:** *"Cậu nghĩ cậu là người đầu tiên muốn nói cho cả thành biết à?"*
5. **II-8, Mặc's last message** (delivered by a canal child): *"Hội Chủ biết cha cậu. Cha cậu đã đi về phía Xích Sa. Đừng tin Ty. Cũng đừng tin chúng tôi quá."*

## 13. Major choice — C1: the records (II-8)

This is the Prologue's C1 at the scale of a capital city: *who should know the truth?*

| Option | Immediate | Delayed | Axes |
|---|---|---|---|
| **Return them to Khải** (trust the institution to act quietly) | Khải keeps his word in his own way: he quietly sends Ty resources to Thanh Mộc. | Thanh Mộc revisits are better supplied and the Hộ Lâm has help. **Ch. IV:** Khải uses these very records to justify the Lôi Trạch restoration, which kills. The protagonist's trust enabled it. | Order; trust |
| **Make them public** (through a Học Phường printing press and the canal criers) | Thiên Kinh stirs. The Ty denies everything and the Cửu Gia crack down. | **Ch. III:** some peripheral Xích Sa settlements hear the news and migrate early. Fewer are left to die, but there is refugee pressure on Xích Thành. **Ch. V:** the Biến Loạn is larger and bloodier. | Freedom; trust |
| **Keep them** | They become a key item. Diệp: *"Em giống cha thật đấy."* | **Ch. V:** he can use them as leverage with Khải or with Uyên. No one else benefits. | Control |

**Weighting:** medium. This is the first choice whose consequences reach other realms.

## 14. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH2_RECORDS` (returned / published / kept) | C1 | Ch. III migrations; Ch. IV restoration justification; Ch. V scale and leverage |
| `CH2_KHE_PAGE` (bool) | §4 optional | Ch. IV–V: Diệp brings the page when she seeks out the Father **[DB N4]** |
| `CH2_HOUSE_CONTACT` (accepted / refused / none) | §5 | Ch. V factional chaos |
| `CH2_MAC_CAPTURED` (always true) | II-7 | Ch. V: freed or executed in the chaos, depending on world state |
| `CH2_FATHER_FILE` (bool) | II-6 | Ch. IX: the "Phép Ghép Mạch" torn page connects |

**Flags consumed:** `CH1_SE_FATE` (forced → shortcut to Mặc, and the Hội distrusts him); `CH1_HOLAM_STANDING` (high → Ngàn's letter of introduction gets a faster audience with Khải in II-2).

**Ending axes influenced:** freedom vs order and trust vs control (C1); medium weight.
