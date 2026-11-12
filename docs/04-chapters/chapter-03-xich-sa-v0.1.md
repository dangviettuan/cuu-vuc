# Chapter Spec — Chapter III: Xích Sa (v0.1)

Status: **v0.1 locked.** Exact tuning (encounters, boss patterns, text) is refined in production.

> Source tags: **[NB]** Narrative Bible, **[WB]** World Bible, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[FF]** Factions & Figures, **[CH2]** Chapter II spec, **[TB]** Thủ Mạch Nhân, **[new]** a new invention.

## Inputs (already canon)

- Xích Sa depends on **Mạch wells** for water. As the region fails, its ruler diverts Linh resources away from small settlements to keep the central city alive. Thousands survive; others are knowingly abandoned. **This is the first major moral choice with no solution that saves everyone.** Xích Vương may become a boss or remain an ally. **[NB Ch.III]**
- **Xích Sa:** desert, heat, an ancient buried civilization. Gameplay: fire, stamina pressure, environmental hazards. **[WB]**
- **Arc state:** Doubt. Entering: confident he can find the option that saves everyone. Leaving: shaken, because no option saved everyone and he still had to choose. **[PB L10]**
- **Xích Vương Hạo** rules from **Xích Thành** and keeps the **Tường Tên** (Wall of Names): *"A king who tries to save everyone saves no one."* He mirrors the Father (one life vs many). The choice is to enforce, break, or overthrow. **[FF K4]**
- **The Father crossed into Xích Sa.** **[CH2 II-9]**
- **Flags consumed:** `CH2_RECORDS`. **[CH2]**

---

## 1. Narrative objective

**Take away the option that saves everyone, and show him the Father's hand in the arithmetic.** Every option in this chapter is defensible, and every option kills someone. The player should feel that the problem is the numbers, not the villain, and then discover who wrote the numbers.

## 2. Realm and locations

| Location | Function |
|---|---|
| **Cổng Cát** (Sand Gate) | The border post. Migrant caravans if `CH2_RECORDS = published`. |
| **Đồng Muối** (Salt Flats) | An outer settlement whose well is marked for closure with red cloth. **The chapter's human face.** |
| **The Crossing** | Open desert between Đồng Muối and the city. Heat, stamina pressure, water raiders. Travel at night or by day, with trade-offs. |
| **Xích Thành** | The central city, built in rings around the **Great Well**. The palace holds the **Tường Tên**. |
| **Thành Vùi** (the Buried City) | The ruins of the ancient civilization **beneath** Xích Thành. The Great Well's shaft cuts through it. |
| **Đáy Giếng** (Well Floor) | The deep Mạch chamber. Boss arena. |

## 3. Critical path stages

| # | Stage | Content |
|---|---|---|
| III-1 | **Cổng Cát** | Arrival. Heat and stamina systems are introduced. Consumes `CH2_RECORDS` (§13). |
| III-2 | **Đồng Muối** | The well has red cloth on it. **Ông Khảm**, the settlement's elder, and his granddaughter **Cát** take them in. Water is rationed by the cup. The people here know what the cloth means. |
| III-3 | **The Crossing** | A desert stage: heat, sand-burrowers, water raiders. Shade, water skins and night travel are tools. |
| III-4 | **Xích Thành** | An audience with **Xích Vương Hạo** at the **Tường Tên**. Reveal (§12, beat 2): **the Father's numbers**. The Great Well is failing because something below is *drinking* it. Hạo asks for his help. |
| III-5 | **Thành Vùi** | The descent through the buried civilization's ruins: fire hazards, ember floors, glass-shell enemies. **Mini-boss: Lính Canh Thủy Tinh** (the Glass Sentinel). |
| III-6 | **Xích Hạt** | Boss (§8). The Mạch Ấn is absorbed (§9). The Great Well stabilizes. |
| III-7 | **Con số** (The numbers) | The water returns: **enough for the city, or barely more.** The Father's numbers were right. Hạo shows him the ledger. **Choice C1** (§11). |
| III-8 | **Hệ quả** (Consequence) | Plays out by branch (§11): closing Đồng Muối's well alongside Hạo, fighting Hạo to reopen the outer wells, or joining General Đan's coup. |
| III-9 | **Lôi Trạch** | Exit. Among the Father's notes left in Xích Thành: *"Lôi Trạch — Ty thử phục hồi — sẽ thất bại."* The Ty is about to attempt a great restoration in the storm wetlands. He goes to witness it and to find the Father. This leads into Ch. IV. |

## 4. Optional areas

- **The Tường Tên:** read the carved names. Each one is a codex entry on a settlement Hạo abandoned and when, with Hạo's own note: *"Đã đến. Đã nói. Đã cắt."* (Came. Told them. Cut.)
- **Thành Vùi murals:** the buried civilization also rationed water and also kept a list. This is the first hint that the problem is older than any king. **[new; WB]**
- **Đồng Muối side requests:** carry water and mend the windbreak. These make the fate of the settlement personal.

## 5. NPC cast

| NPC | Role |
|---|---|
| **Diệp** | AI ally. **Her flaw shows** (DB N3): she supports the diversion on the arithmetic and says so (§12, beat 3). This seeds the Ch. IV fracture. |
| **Xích Vương Hạo** | Ruler. Ally or boss depending on C1. **[FF K4]** |
| **Ông Khảm** | **New.** Elder of Đồng Muối, about 70. Dignified. Has buried two wells already. Refuses to leave ancestral land. |
| **Cát** | **New.** Khảm's granddaughter, about 10. Measures water in cups and keeps a tally in the sand. The human face of the numbers. |
| **Tướng Đan** | **New.** A royal general, female, about 50, born in an outer settlement. She leads the faction that wants Hạo gone, and is the alternative ruler in branch C. |

## 6. Enemies and mini-bosses

- **Sand-burrowers:** ambush predators beneath the sand.
- **Water raiders:** desperate humans from settlements that have already been cut off. **Some are from names on the Tường Tên.** **[new]**
- **Glass-shell beasts:** creatures of the Buried City, with carapaces of fused Mạch-glass.
- **Mini-boss: Lính Canh Thủy Tinh** (the Glass Sentinel): an ancient guardian statue in the Buried City, still enforcing a ration gate that no longer guards anything.

## 7. Heat and stamina system (realm mechanic)

- A **heat meter** fills in direct sun and on ember floors. While it is high, **stamina regeneration slows**.
- **Shade, water skins and night travel** reduce heat.
- This is the stamina pressure the World Bible asks for **[WB]**, and it makes water a resource the player physically feels, which is the chapter's theme.

## 8. Main boss — Xích Hạt

- **Form:** a colossal scorpion whose carapace is fused Mạch-glass, glowing red-orange from within. **[new]**
- **Origin and worldview:** the buried civilization placed it in the Great Well as its **regulator**. It drank the excess of the Mạch's water so that the well never flooded. Centuries later it is still doing its job. As Linh Suy thins the Mạch, there is no excess left, so it is drinking *everything*. **It is not attacking the city. It is still keeping an old promise in a world that changed**, a small mirror of Thủ Mạch Nhân **[TB T2; NB rule 2]**.
- **Phases:**
  1. **The Regulator:** methodical tail strikes, sand flooding, water drained from the arena.
  2. **The Thirst:** it drinks the arena's water channels and becomes faster and hotter. Heat management becomes the fight.
  3. **The Dry Shell:** a burned-out final phase, glass cracking, desperate.
- **Ending:** it collapses with its shell empty. The absorption happens. Diệp watches without speaking. This is the third time.

## 9. Mạch Ấn reward — Mạch Ấn Xích Hạt

| | |
|---|---|
| **Name** | Mạch Ấn Xích Hạt — *Hỏa Tích* (Banked Fire) |
| **Build effect** | Damage taken is **stored as heat**. The next heavy or charged attack **releases it as fire damage**, scaling with the stored heat. While heat is stored, stamina regeneration is slowed. This is a risk-and-reward mechanic, where taking hits becomes ammunition. |
| **Passive** | He can cross **ember floors and hot glass** without heat gain. This opens Xích Sa's ember routes on revisits. |
| **Theme** | The first Mạch Ấn that rewards *storing* power. A quiet seed for the Gluttony path (PB L12). |

## 10. Items, materials and unlocks

- **Water skins:** a consumable that reduces heat.
- **Tier 3 materials:** Mạch-glass, desert hide, salt iron.
- **Codex:** the buried civilization's ration murals; Tường Tên entries.

## 11. Major choice — C1: the water (III-7 → III-8)

The stabilized Great Well can sustain **Xích Thành, or the outer settlements, but not both for long**.

| Option | III-8 plays out | Immediate | Delayed | Axes |
|---|---|---|---|---|
| **A. Enforce** (help Hạo keep the diversion) | He rides with Hạo to Đồng Muối. Hạo tells the villagers in person and offers passage to the city. **The protagonist closes the well with his own hands.** Ông Khảm refuses to leave. Cát leaves. **Hạo hands the protagonist the chisel** (*"lần này, cậu đã chọn"*), and **the protagonist carves "Đồng Muối. Một." himself.** **[Prose Ch.10]** | The city survives. Hạo remains an **ally**. | **Ch. XI:** Xích Thành sends aid. The outer settlements are gone. Cát is alive in the city, and Khảm died on his land. | Many over one; order |
| **B. Break** (reopen the outer wells) | He sabotages the diversion valves in the well's distribution chambers. Hạo confronts him: **boss fight, Xích Vương Hạo** (§11a). | Water is shared. Everyone is at risk. | **Ch. XI:** the city is half-empty and the outer settlements are in long decline. *No one was saved; everyone was given time.* Hạo, if spared, carves **his own name** on the Wall. | Freedom; one over many |
| **C. Overthrow** (back Tướng Đan's coup) | Đan's soldiers and Khảm's people storm the palace. **Boss fight, Xích Vương Hạo.** Đan takes the throne and shares the water. | The outer wells open. Hạo is imprisoned. | **Ch. XI:** Đan has had to divert again, by the same arithmetic, but **without the Wall**: the Tường Tên has been plastered over. *The ruler changed. The numbers didn't. The remembering stopped.* | Punishment; control |

**Weighting:** high. This is the first major moral choice of the game **[NB]**.

### 11a. Conditional boss — Xích Vương Hạo (branches B and C)

- A royal duelist with a **Mạch-glass blade**. He uses his city's heat as a weapon: his strikes add to the player's heat meter.
- **Worldview, mid-fight:** *"Ngươi nghĩ ta chưa từng thử cách của ngươi sao? Tên đầu tiên trên bức tường là tên làng ta."* (You think I never tried your way? The first name on that wall is my own village.) **[new]**
- **After his defeat:** in B he is spared and stays as a diminished ruler; in C he is imprisoned by Đan. The player cannot kill him in Ch. III. Whether he is killed is decided in Ch. XI **[new]**.

## 12. Key beats and dialogue

1. **III-2, Cát:** she shows him the tally in the sand. *"Mỗi vạch là một cốc. Hết vạch thì hết giếng."*
2. **III-4, the Father's numbers:** Hạo hands him a ledger. The handwriting is **the Father's**, the same hand as the notebook in An Mộc. *"Một Người Dẫn Mạch từ phương bắc đưa ta những con số này. Hắn nói giếng nào còn sống được bao lâu. Ta chỉ là người ký."* **Timeline:** the Father measured Xích Sa's wells two years before the game, during a three-month absence from An Mộc that he called "measuring stations in the south". He returned last month, after leaving An Mộc, to re-check the numbers, then went east. **[Prose Ch.9]** The Father's numbers decided which villages would die. This is the second time, after Thanh Mộc (FB F4), though the protagonist doesn't know about the first. **[new; FB F4]**
3. **III-7, Diệp:** *"Em muốn cứu tất cả. Chị cũng muốn. Nhưng nước không biết em muốn gì."* He: *"Vậy chị chọn để cái làng đó chết?"* She: *"Chị chọn để ít người chết hơn. Em gọi nó là gì cũng được."* **[DB N3]**
4. **Branch A, at the well:** Khảm puts his hand over the protagonist's on the valve wheel. *"Để ta. Giếng này ta đào, ta đóng."* He turns it himself.
5. **III-9, the note:** in the Father's handwriting, *"Lôi Trạch — Ty thử phục hồi — sẽ thất bại."* The protagonist: *"Thì mình đến trước khi nó thất bại."* Certainty is cracked, but still holding.

## 13. Branch flags

| Flag | Written | Consumed |
|---|---|---|
| `CH3_WATER` (enforced / broken / overthrown) | C1 | Ch. XI Xích Sa world state; Hạo's and Đan's fates; Ch. IX U Minh (Khảm or the cut-off dead) |
| `CH3_HAO_STATE` (ally / diminished / imprisoned) | III-8 | Ch. XI |
| `CH3_FATHER_NUMBERS` (always true) | III-4 | Ch. V confrontation line: *"Cha viết con số. Người khác ký."* |
| `CH3_CAT_ALIVE` (true in A and B; branch-dependent in C) | III-8 | Ch. XI |

**Flags consumed:**
- `CH2_RECORDS = published`: migrant caravans at Cổng Cát. Xích Thành is overloaded, so the arithmetic in III-7 is **worse**: in A, two settlements must be cut, not one. Đồng Muối is half-empty because many left early, and they survived.
- `CH2_RECORDS = kept`: he can show Hạo the records. Hạo: *"Ta biết. Ta đã đọc những thứ còn tệ hơn."* No material change; it is humbling.
- `CH2_RECORDS = returned`: a Ty envoy in Xích Thành offers Ty support, at the price of Xích Sa's Mạch-emblem quota. This is flavour plus a codex entry.

**Ending axes influenced (high weight):** one life vs many; freedom vs order; forgiveness vs punishment (in C).
