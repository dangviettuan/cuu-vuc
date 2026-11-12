# Art Bible v0.1

Status: **v0.1 locked** for the pixel production rules and visual keys. These should be revised after the first concept-art pass and the greybox prototype.

> Source tags: **[AR]** Art README, **[PB]** Protagonist, **[FB]** Father, **[DB]** Diệp, **[TB]** Thủ Mạch Nhân, **[WB]** World Bible, **[CH*]** chapter specs, **[new]** a new invention.

## 1. Direction (already established)

- 2D pixel art, side-scrolling.
- Strong silhouettes by class and boss.
- Handcrafted environments.
- **Every realm must be identifiable without UI labels.** **[AR]**

## 2. Pixel production rules

The Art README's items that must be locked before large-scale asset production **[AR]**:

| Item | Decision |
|---|---|
| **Reference resolution** | **640 × 360** (16:9), integer-scaled: ×3 for 1920×1080 and ×6 for 4K. Ultrawide shows extra side view, never a stretch. |
| **Tile size** | **16 × 16 px** |
| **Base character height** | **Protagonist: 48 px** (3 tiles), standing, including the hair tail. Diệp is 51 px (slightly taller, DB N7). The Father is 46 px (stooped, FB F6). Thủ Mạch Nhân is 72 px (very tall, TB T6). |
| **Camera** | A side view with gentle look-ahead in the direction of movement. Vertical framing opens up in Vân Hải and Thiên Khuyết. **Boss arenas lock the camera** unless the boss is larger than the screen. |
| **Boss scale bands** | **S** 1–2× player (Hằng, Cương, Lạc Quân, Diệp) · **M** 2–4× (Nanh Rễ, Độc Đằng, Glass Sentinel) · **L** 4–8×, fills the arena (Mộc Giác, Xích Hạt, Bạch Tướng, Thiên Cơ Tướng) · **XL** larger than the screen, fought in parts or from inside (Lôi Nha, Huyền Kình, Thiên Điểu) |
| **Game FPS** | **60** |
| **Animation FPS** | Characters are animated **on 12s**, with key combat frames (anticipation, impact) held for readability. Idle animations run at 8 fps. Effects (VFX) can run at 24. |
| **Outline rules** | **Characters and enemies:** a 1 px **coloured** outline (a darkened local hue, never pure black). **Backgrounds:** no outlines. **Interactables:** a 1 px light rim on approach. |
| **Lighting rules** | Each scene has **one key light plus at most two accents.** **Mạch light is always an accent** (§4). Characters get a simple rim light from the key light. There is no dynamic lighting on sprites in v0.1. |
| **Palette policy** | **Per-realm master palette of 32 colours** (§5) plus **a shared character palette of 24**. **Reserved red** (§3) is never used in environments. |
| **Weapon scale** | One-hand sword ≈ 22 px; twin blades ≈ 12 px each; staff ≈ 40 px; crossbow ≈ 20 px. Diệp's spear ≈ 56 px, longer than she is tall. **[DB N6]** |
| **VFX scale** | Hit sparks ≤ 16 px. Mạch Ấn effects ≤ 2 tiles from the player, except bursts (frost burst, wave), which are ≤ 6 tiles. **VFX must never hide an enemy's tell.** |
| **Hitbox consistency** | Hurtbox = body silhouette inset by 2 px. Attack hitboxes must match the drawn weapon arc on its **active frames**. Telegraph frames are drawn and timed **before** the hitbox becomes active. |

## 3. Reserved colour: the red thread

- One saturated red (working value **#C8323C**) is **reserved**. It may appear on:
  - **the protagonist's red thread** (PB L1);
  - **the Father's red-thread spool** (FB F6);
  - **Bến Sét's flames at the moment of the disaster** (Ch. IV), the one deliberate exception.
- **Never** in environments, enemies or UI. When the player sees that red, it means *him*, or the Father's tie to him. **[new]**

## 4. Mạch visual language

| State | Look |
|---|---|
| **Living Mạch** (underground fibres, WB) | Translucent stone, **green-blue** inner light, slow pulse |
| **Cut Mạch** | A mirror-smooth face. Faintly lit upstream, **dark** downstream. |
| **Linh Suy** | **Dark veins** along leaves, hides and stone, *"burned from inside"* (Ch1) |
| **Mạch Ấn (in the world)** | A floating disc of converging grooves, glowing in the **source realm's accent colour** |
| **Absorption** | The light travels into the chest, at the scar. Only the protagonist's chest-glow fades over three seconds. |
| **Ty seals** | Bronze discs; when broken, they reveal a small green-blue shard. **[CH2]** |
| **Nguyên Linh leak** (Ch. VIII onward) | Green-blue edged with **white-gold**. It reads as "too much", and is never shown as evil. |
| **Thủ Mạch Nhân's seals** | Pale grey glyphs. **Health bars dissolve into these glyphs** (Ch. V). |

## 5. Realm visual keys

| Realm | Palette and light | Motifs | Mạch accent |
|---|---|---|---|
| **Thanh Mộc** | Deep greens, moss, warm wood. Dappled light from far above, *"đáy một cái giếng"*. | Roots as architecture, tree-towns, yellowing leaves with dark veins | Green |
| **Trung Vực** | Red, grey and blue roof tiles; gold in Thượng Thành; cool stone. Hazy daylight. | Endless roofs, 31 windows, canals, notices on walls | Blue-green (official, "clean") |
| **Xích Sa** | Ochres, rust, salt white; red Mạch-glass below. Hard noon light, starry nights. | Concentric city rings, the Great Well, the Wall of Names | Red-orange |
| **Lôi Trạch** | Slate, silver water, black stilts; Ty blue flags. Storm light. | Copper towers, stilt-houses with copper rods | White-violet |
| **Hàn Sơn** | Blue-whites, granite, the clans' dyed reds (muted, never the reserved red) | Glacier with frozen armies, banners in ice | Ice-cyan |
| **Huyền Hải** | Teal, sand, shell-white; deep indigo below. Tidal light. | Stilted harbour, the whale's back as a city | Deep teal |
| **Vân Hải** | Pale sky blues, cloud whites, sun-gold. Strong backlight. | Floating isles, rope villages, wind chimes | Pale gold-green |
| **U Minh** | Desaturated greys, mist. **Colour returns only in memories** (Làng Khê remembered is the most saturated scene in the game). | The ferry, the Gallery, faceless figures | Grey-silver; memories in their original hue |
| **Thiên Khuyết** | Sky-brass, will-glass, white stone. Cold, clean light. **Magitech, not neon.** **[WB]** | Constructs, the Stele Hall, the Mirror, the Tenth Seat | White-gold |
| **Thiên Tâm** | All nine accents converging. The only scene where they all appear. | The crater, nine Mạch bundles, the Source Seat | All nine |

## 6. Character visual keys (from the bibles)

| Character | Silhouette keys | Source |
|---|---|---|
| **Protagonist** | Lean; **hair tail**, **satchel strap**, **red thread** (left wrist); class gear layered on top; chest scar shown only in cutscenes | PB L1–L2 |
| **The Father** | Slight stoop; **white burn scar on the left hand**; Dẫn Mạch bag and copper rods; Quy Nguyên attire with no bag after Ch. V; thumb-on-index-finger tell as an animation beat | FB F6 |
| **Diệp** | Taller and upright; warden coat; **spear across her back**; **wooden charm** (never removed); a **bonding mark at the collarbone** after Ch. V | DB N7 |
| **Thủ Mạch Nhân** | Very tall and gaunt; archaic armour; **nine seal marks**, some cracked; stillness | TB T6 |
| **Uyên** | Small, seventy, an archivist's robe; ink-stained fingers | FF K1 |
| **Cương** | Thin and dry; the Ty-alloy blade; earth-coloured coat; eyes that "count" | FF K2 |
| **Khải** | Dark blue official robe; the hat only from Ch. IV; greying temples | FF K3 |
| **Hằng** | Black high collar; **bronze seal disc on her chest** | CH2 |
| **Xích Vương Hạo** | Rough cloth, no crown; a mason's hands; chisel and hammer | FF K4 |
| **Ngàn** | Short grey hair; a scar across the bridge of her nose | Prose Ch.3 |

## 7. UI principles

- **No morality meter, ever.** **[NB §7]**
- The HUD is minimal: health, stamina, the class charge resource and the equipped Mạch Ấn icons.
- **Sealing is shown on the HUD:** Mạch Ấn icons **crack** when sealed (Ch. II batons; Ch. V Thủ Mạch Nhân).
- **Boss health bars can lie or disappear** when the story demands it (the Ch. V glyph dissolve; the Ch. IX reflected hits).
- **Diegetic prompts where possible:** the U Minh heart-sync tell is the fragment's pulse on screen, not a UI marker.
- **Name entry** (ADR-0004): Unicode, minimal, one screen. It is the only "character creation" in the game.

## 8. Production order

This revises the Art README's order **[AR]** to follow the greybox prototype:
1. **Protagonist** sprite at 48 px: idle, run, jump, light and heavy attacks, dodge, parry (the Kiếm Khách base)
2. Thanh Mộc forest-edge tile kit (Prologue S1)
3. The startled boar and **Nanh Rễ** (scale M)
4. An Mộc village kit (well, shrine, the Father's house)
5. Then the original order continues: major characters → class silhouettes → realm visual keys → enemy families → bosses → environment kits → weapons and equipment → UI
