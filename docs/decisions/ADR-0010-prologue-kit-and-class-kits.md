# ADR-0010 — The classless Prologue kit, and class kits on top of it

Status: **Accepted** (2026-11-25). Keeps PB L9 ("the Prologue has no class") and resolves the greybox's merged kit.

## Decision

**1. The Prologue is played with the universal kit and the brush-knife (dao phát).**

| Verb | Prologue kit |
|---|---|
| Light string, heavy attack, dodge | As in Combat & Class Bible §2 |
| **Parry** | The universal **8-frame** window. A successful parry staggers lighter enemies and opens a short "strike now" window. |
| **Block** | Hold the parry button (Combat Bible §2, amended) |
| Healing | The herb pouch (Combat Bible §2, amended) |
| **Not available** | Thế, Riposte, Phá Thế, or any other class ability |
| **Weapon** | The brush-knife: a 15 px broad, hooked blade with **8 px less reach** than the Kiếm Khách sword |

**2. A class kit is added on top of the universal kit when the class is chosen in Ch. I.** Kiếm Khách adds:
- the 12-frame parry window;
- Thế;
- the Riposte;
- Phá Thế;
- the straight sword.

The other classes add their own perfect defence and resource (Combat Bible §3).

**3. Nanh Rễ is tuned for the Prologue kit.** Her HP was lowered from 320 to **260**, because the Riposte's damage is no longer available.

## Reason

- **Canon:** the class is "the path he learns", chosen from four mentors at Mộc Thành (PB L9; Ch. I §5). A Prologue that already plays as Kiếm Khách would undercut that choice and favour one class over the other three.
- **Tutorial design:** the Prologue teaches the verbs every class shares. The class choice then *adds* a fantasy, rather than replacing the controls the player has just learned.
- **The greybox had merged the two kits** to test Riposte early (game README, "Known greybox simplifications"). That was a deliberate shortcut, and it is now resolved without losing the test loop.

## Consequences

- **The greybox defaults to the Prologue kit.** `?kit=kiem` loads the Kiếm Khách kit, so its loop stays testable (`KIT` in `game/src/tuning.ts`; `setWeapon` in `game/src/art.ts`).
- **Teaching moves with the class.** The tutorial teaches parry → strike; the riposte is taught at Lão Trụ's dojo in Ch. I.
- **Balance target unchanged:** Kiếm Khách is the baseline difficulty for Ch. I onward. The Prologue boss must be beatable with the universal kit alone.
