# ADR-0007 — Ending resolution model

Status: **Accepted**

## Decision

Endings are resolved by an **accumulated profile**, not by a final dialogue choice.

1. **Seven signed axes** track the recurring decision patterns from Narrative Bible §7:
   - `AX_MANY` (one vs many)
   - `AX_ORDER` (freedom vs order)
   - `AX_PUNISH` (forgiveness vs punishment)
   - `AX_ATTACH` (attachment vs letting go)
   - `AX_ACT` (action vs refusal to intervene)
   - `AX_POWER` (accepting limitation vs more power)
   - `AX_CONTROL` (trusting vs controlling)

   Every choice in every chapter spec lists the axes it moves. The weights are tuned in production.
2. **Seven sin endings** each have a **score** made of axis terms plus key flags. **Hard requirements** apply where the story demands them: Envy needs Diệp alive; Vĩnh Sinh needs an eligible beloved.
3. **Nhân Gian is gated, not scored.** It needs remembrance, proof or distribution, restraint (`MA_REFUSED ≥ 2`, non-positive power and control), and understanding of the Father.
4. **At the Source** (Ch. XII), the player chooses a final act from:
   - the **top two** sin endings, or only the top one if it dominates (≥ 1.5× the second);
   - **plus Nhân Gian** if its gate is met.
5. **No visible meter.** The **Mirror of Will** (Ch. X) is the only diegetic preview.

## Reason

- Narrative Bible §7: endings must feel like "the logical result of the person the protagonist became", and must "not be selected by one final dialogue choice".
- A final act chosen among *plausible* destinations keeps player agency without letting one late choice override 12 chapters.
- Gating Nhân Gian, instead of scoring it, keeps it from becoming the "high score" or correct ending (ADR-0003; NB rule 4).

## Consequences

- Every new choice added to a chapter spec **must declare its axes**.
- `MA_REFUSED` (from Ch. VI, the first refusable absorption) is a first-class input. Encounter tuning must support variable Mạch Ấn counts.
- Full specification: `docs/04-chapters/chapter-12-quy-nguyen-v0.1.md` §3.
