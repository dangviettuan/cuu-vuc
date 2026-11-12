# Chapter Spec — Chapter IX: U Minh (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[WB]** World Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[PRO]**, **[CH1–8]** chapter specs, **[new]** a new invention.

## Inputs (already canon)

- U Minh forces the protagonist to confront **memory, death and personal responsibility**. He meets memories or remnants of **people who died because of earlier decisions, and of people who survived because of them**. He **discovers the truth of his childhood illness and the Father's forbidden intervention.** **His worldview collapses.** He can no longer honestly claim he would never make the compromises he condemned. **[NB Ch.IX]**
- **U Minh:** the thin boundary between the living world and the memories of the dead. Gameplay: spirits, illusion, curse, **unreliable perception**. **Major boss: Vô Diện.** **[WB]**
- **Arc state: Collapse.** Entering: certain he would never have made the Father's choice. Leaving: his life is the product of that choice. **[PB L10]**
- **The truth comes through U Minh, not through the Father's confession.** **[FB F7]**
- **The procedure:** Làng Khê's node; the fragment split in two; the Mother held the child, knew the risk and chose it; the backlash killed her and burned the Father's left hand; the settlement died over the following season; the Father later found Diệp in her house. **[FB F2–F3]**
- **The Mother** was Uyên's third top student and left the Ty in her second year. **[FB F1]**
- **He learns that Diệp knew** and that the Father told her. **[DB N4]**

---

## 1. Narrative objective

**The collapse.** Every certainty he rebuilt after Ch. V (purpose, evidence, *I would never*) is taken away, not by an enemy but by the dead.
- He learns he is the reason Làng Khê died.
- He learns his mother chose to die for him.
- He learns that Diệp, the person whose family paid for his life, knew all along and kept quiet to protect him.
- He meets everyone **his own** decisions have killed or saved.

He leaves the chapter with no ground under him except what he chooses to stand on.

## 2. Realm and locations

| Location | Function |
|---|---|
| **Bến Vong** (Ferry of the Gone) | The entry: a grey river and a silent ferryman. **The fragment in his chest lets him cross alive.** |
| **Đồng Sương** (the Mist Fields) | Open mist where the dead wander. **The Gallery of his decisions** (§4). |
| **Làng Khê, remembered** | The settlement **as its dead remember it: alive**, on its last good day. |
| **Đêm Ở Nút** (the Night at the Node) | A memory-stage: the procedure, relived. |
| **Mùa Chết** (the Dying Season) | A memory-stage: Làng Khê's decline over one season. |
| **Không Mặt** (the Faceless Hollow) | Vô Diện's domain. Boss arena. |

## 3. Realm mechanic: unreliable perception

- The **mist** shifts what the player sees: paths that aren't there, enemies wearing friendly faces, dialogue that sometimes comes out in the **protagonist's own voice**.
- **The fragment's pulse** is the only reliable guide. When it beats in time with his heart, what he sees is true. When it falls out of sync, it is an illusion. This is a learnable tell. **[new; PB L3: he reads tells]**
- **Curse:** lingering among the dead builds *Lạnh Hồn* (soul-chill), which slows healing. The living world's shrines (§13) clear it.

## 4. The Gallery: people his decisions touched

A **dynamic area** built from flags. The dead and the living-remembered (rendered as memory) appear according to what the player did. **None of them is simply accusing him.** Each says what happened *after*. **[NB Ch.IX; NB rule 10]**

| Flag | Who appears | What they say (examples) |
|---|---|---|
| `PRO_VILLAGE_TOLD = true` | **Ông Tư** (the lost family's father) | *"Anh nói thật. Tôi chạy vào rừng. Anh không có lỗi. Anh chỉ… có phần."* |
| `PRO_VILLAGE_TOLD = false` | **Ông Dần** (alive; seen as a memory of that night) | *"Giá mà có ai nói trước."* |
| `PRO_SOW_SPARED = true` | **Nanh Rễ** and her litter, rooted into the mist | No words. She lowers her head, the way Mộc Giác did. |
| Always | **Mộc Giác** | It does not speak. It smells his chest once more, **and now he knows why.** |
| `CH1_SE_FATE = handed` | **Sẻ** | *"Tôi mười chín tuổi. Tôi không biết cắt Mạch sẽ làm giếng làng anh cạn. Tôi chỉ được bảo là phải cắt."* |
| `CH3_WATER = enforced` | **Ông Khảm** | *"Ta đóng giếng của ta. Đừng mang nó như của cậu."* |
| `CH3_WATER = broken/overthrown` | **The cut-off dead** of the outer settlements, or of Xích Thành's rationing | Names. Only names. |
| Always | **Cát** (alive; seen as one of those who survived because of him) | *"Em vẫn đếm. Giờ em đếm người."* |
| `CH4_SAVED` (low / high) | **Bà Lành** and the Bến Sét dead (fewer or more) | *"Anh đứng ở giữa cái trục. Tôi đứng ở bến. Sét không chọn ai."* |
| Always | **Lôi Nha** | It coils around nothing, still trying to draw the storm. |
| `CH5_KHAI = executed` | **Khải** | *"Tôi tin cậu. Cuối cùng thì cũng có người tin tôi chết vì đúng lý do."* |
| `CH5_CIVILIAN_HARM > 0` | **Rioters** he killed | Faceless. They have no names because he never knew them. *(This links to Vô Diện, §8.)* |
| `CH7_CHOICE = record` | **The Cảng Triều dead** | *"Anh có bản ghi. Chúng tôi có biển."* |
| `CH8_STATE = tu` | **Diệp** | §12, beat 8. |

## 5. Critical path stages

| # | Stage | Content |
|---|---|---|
| IX-1 | **Bến Vong** | Arrival through the vision pull from Ch. VIII. The ferryman takes no fare from him: *"Ngươi đã trả từ hai mươi năm trước."* |
| IX-2 | **Đồng Sương** | The Gallery (§4). Learning the perception tell. |
| IX-3 | **Giọng nói** (The voice) | A woman's voice in the mist with no face, guiding him toward Làng Khê. **The Mother**, not yet recognized. |
| IX-4 | **Làng Khê, remembered** | The village alive. Children by the stream. **Seven-year-old Diệp** at the doorframe, her mother cutting a new height mark, **the eighth**, which never happened. The dead remember it anyway. If `CH1_KHE_VISITED`: he recognizes the doorframe. |
| IX-5 | **Đêm Ở Nút** | The procedure, relived from the Mother's memory (§6). **The truth.** |
| IX-6 | **Mùa Chết** | Làng Khê dies through one season, in fast memory. Then **the Father returns**, alone, to find a seven-year-old girl who has not eaten in three days. |
| IX-7 | **Người biết** (The one who knew) | The Làng Khê dead tell him the last thing (§12, beat 6): **Diệp came back here with the Father, between Lôi Trạch and Thiên Kinh. He told her here.** If `CH2_KHE_PAGE`: the sealed page she took from the Ty archive is lying on the doorframe in the memory. |
| IX-8 | **Vô Diện** | Boss (§8). |
| IX-9 | **Mẹ** (Mother) | The Mother, fully seen at last. **Choices C1 and C2** (§11). |
| IX-10 | **Thiên Khuyết** | Exit. The torn page from the Father's file, shown in the Mother's memory, carries a header: *"Chép từ bia đá Thiên Khuyết."* (Copied from a Thiên Khuyết stele.) The method that made him came from before the division. Thủ Mạch Nhân said *"Ta từng thấy thứ này một lần."* **He goes to find out what he is.** This leads into Ch. X. |

## 6. The Night at the Node (IX-5): what is shown

1. **A boy of five,** burning with Linh Suy fever, carried through the forest by **a woman** (the Mother) and **a man** with an unburned left hand (the Father).
2. **The Làng Khê node** at night. The Father works fast, with the torn page open on a stone. **The page:** *"Mảnh mạch phải chia đôi. Nửa đặt vào người. Nửa còn lại sẽ cháy. Người giữ đứa trẻ chịu dội ngược."* (The fragment must be split. One half goes into the body. The other half will burn. Whoever holds the child takes the backlash.)
3. **The Mother reads it.** The Father says: *"Để anh giữ nó."* (Let me hold him.) She says: *"Anh phải làm. Em không biết làm."* (You have to do it. I don't know how.) **She chose. She knew.** **[FB F2]**
4. The cut, the split, the backlash: light, the Mother's arms, the Father's hand on the burning half.
5. **The Father carrying the boy home, and the Mother not with them.**
6. **The detail that ends the protagonist's certainty:** before the cut, the Father **looks toward the sleeping settlement** in the valley below. He knows. He cuts anyway.

## 7. NPC cast

| NPC | Role |
|---|---|
| **The Mother** | **Introduced.** A remnant held in the fragment, which carries her last moment. Warm, plain-spoken (his directness comes from her), and unafraid. She **does not judge** the Father or the son. She is not a ghost who stays; she is a memory that ends. **[new; FB F1–F2]** |
| **The ferryman** | Silent, then one line. |
| **The Làng Khê dead** | A chorus. Among them, **Diệp's mother**. |
| **The Gallery dead** | §4. |
| **Vô Diện** | Boss. |

## 8. Main boss — Vô Diện (the Faceless)

- **What it is:** a being made from **the dead whom no one remembers by name**: the unnamed of Làng Khê (*"sụp Mạch cục bộ"*), the cut-off dead never carved into any wall, the rioters, the soldiers in the ice. **It has no face because no one kept theirs.** **[new; WB]**
- **Worldview:** *"Ta không muốn trả thù. Ta muốn được nhớ."* (I don't want revenge. I want to be remembered.) It wears faces to feel what having one is like. **[NB rule 2]**
- **Phases:**
  1. **Borrowed faces:** it wears the faces of the Gallery (§4). Perception is unreliable. The player must use the pulse tell to find the true body.
  2. **The Node:** it wears the **Father's** face, then the **Mother's**. Attacks come from both sides of the procedure.
  3. **His own face:** it wears **the protagonist's face** and uses **his own moveset** and Mạch Ấn. *"Ngươi cũng là một trong những người quyết định."* (You are also one of those who decide.)
- **Resolution, as a mechanic:** in Phase 3 **it cannot be beaten by damage.** Any hit on it is reflected. **The player wins by defending without attacking** for a sustained window: parry, dodge and endure. This is Lão Trụ's lesson at its deepest: *the blow ends in himself.* For other classes, the framing is their own mentor's line. **[CH1 §5]**
- **Ending:** it stops. It lowers his face. If the player speaks any name from the Gallery that a flag supports (there is a prompt), it takes that face and goes quiet. Otherwise it fades, still faceless. Its Mạch Ấn rises.

## 9. Mạch Ấn reward — Mạch Ấn Vô Diện (optional)

| | |
|---|---|
| **Name** | Mạch Ấn Vô Diện — *Thiên Diện* (Thousand Faces) |
| **Build effect** | A perfect dodge leaves a **decoy afterimage** that enemies target for a moment. Illusion as a build, from the realm's identity. **[WB]** |
| **If refused** | *"Để họ giữ nó."* The faceless dead keep it. |

## 10. Items and unlocks

- **No traversal unlock.**
- **Codex: "Mẹ"** (Mother), written in his voice after IX-9.
- **Tier 8 materials:** mist-silver and memory-glass. They exist only in U Minh, and it is uncomfortable to use them.

## 11. Major choices (IX-9)

The Mother's remnant can stay only as long as the fragment keeps her memory open. She asks him two things.

### C1 — *"Con muốn giữ mẹ lại không?"* (Do you want to keep me?)

| Option | Result | Axes |
|---|---|---|
| **Keep her** | The fragment holds her memory open. **Her voice remains in him**: rare lines in Ch. X–XII, a comfort that is also a refusal to let go. | Attachment (high). **Vĩnh Sinh eligibility:** the Mother becomes a possible resurrection target alongside the Father and Diệp. |
| **Let her go** | She ends: *"Mẹ đã chọn rồi. Giờ đến lượt con."* (I already chose. Now it's your turn.) | Letting go (high). Self-awareness weight. |

### C2 — The Father

After seeing the Node, he must say something about the man who did it.

| Option | Line | Axes |
|---|---|---|
| **Understand** | *"Con hiểu vì sao cha làm vậy. Con không biết con có làm khác không."* (I understand why. I don't know if I would have done differently.) | Forgiveness. **The NB's central question, answered honestly.** Heavy Nhân Gian weight. |
| **Refuse to forgive** | *"Cha không có quyền đổi một làng lấy con."* (You had no right to trade a village for me.) The Mother: *"Thế con có quyền gì để sống?"* (Then what right do you have to be alive?) He has no answer. | Punishment (high). Wrath and Envy weight. |
| **Turn it on Diệp** | *"Cha nói với chị ấy. Cha không nói với con."* (He told her. He never told me.) | **The Envy seed fully sprouts.** Kẻ Thay Thế weight (high). **[DB N4; PB L12]** |

**Weighting:** these are the highest-weighted choices before Ch. XI. **They are not ending selectors**, but they move the axes more than any choice before them.

## 12. Key beats and dialogue

1. **IX-1, the ferryman:** *"Ngươi đã trả từ hai mươi năm trước."*
2. **IX-4, Làng Khê:** a seven-year-old Diệp runs past him, laughing, and looks straight through him.
3. **IX-5, the Mother:** *"Anh phải làm. Em không biết làm."*
4. **IX-5, the moment:** the Father looks down at the sleeping village. Then he cuts. **Everything the protagonist has said since Chương 1 collapses in that one look.**
5. **IX-6, the Father returning a season later:** he kneels at the doorframe where a girl has not eaten in three days. He does not tell her anything. *"Đi với chú."* (Come with me.)
6. **IX-7, the Làng Khê dead:** *"Con bé đã quay về đây. Với ông ấy. Ông ấy kể hết. Ở ngay chỗ này. Con bé ngồi đúng chỗ ngày xưa nó ngồi."* (The girl came back here, with him. He told her everything, right here. She sat exactly where she used to sit.)
7. **IX-9, the Mother, recognized:** *"Con lớn quá. Mẹ chỉ kịp nhớ con năm tuổi."* (You've grown so much. I only had time to remember you at five.) If the PRO red thread is on his wrist: *"Cha con vẫn buộc chỉ à? Cái đó mẹ bày cho ông ấy."* (Your father still ties the thread? I'm the one who taught him that.) **[PB L1]**
8. **If `CH8_STATE = tu`, Diệp in the Gallery:** she stands at her family's doorframe, charm in hand. *"Em biết rồi à? Chị đã định nói. Ở Vân Hải. Sau trận đấu."* (You know now? I was going to tell you. At Vân Hải. After the fight.)
9. **IX-10, alone at Bến Vong:** *"Mình đã nói mình sẽ không bao giờ…"* (I said I would never…) He can't finish the sentence. **This is the collapse.**

## 13. Checkpoints (ADR-0006)

- **The Bến Vong shrine**, a living-world shrine at the river's edge. It clears Lạnh Hồn.
- Inside U Minh, **memory-anchors** count as checkpoints under ADR-0006. They are Mạch shrines as the dead remember them.
- **The Làng Khê node** (remembered, uncut) is a checkpoint. It is the only time in the game that node works.

## 14. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH9_MOTHER` (kept / released) | C1 | Ch. X–XII voice lines; Vĩnh Sinh eligibility |
| `CH9_FATHER_VERDICT` (understand / refuse / diep) | C2 | Ch. XI Father encounter; Ch. XII ending weights (Nhân Gian / Wrath / Envy) |
| `CH9_NAMED` (bool) | Vô Diện naming prompt | Ch. XII Nhân Gian (remembrance) |
| `CH9_ABSORBED` (bool) | §9 | `MA_REFUSED` |
| `CH9_KNOWS` (always true) | IX-5 | Every later chapter |

**Consumed:** nearly every prior flag (§4), plus `CH1_KHE_VISITED` (IX-4), `CH2_KHE_PAGE` (IX-7), `CH2_FATHER_FILE` (IX-5: he recognizes the torn page), `CH5_FATHER_DEMAND` (adds an inner line at IX-5: *home* → "Cha đã có lúc có nhà"; *answer* → "Cha đã trả lời rồi. Ở đây."; *why* → "Đây là lý do của cha. Không phải lý do của Hội.").

**Ending axes influenced:** attachment vs letting go and forgiveness vs punishment (very high); Envy weighting (C2).
