# Human playtests — Prologue slice

The log of real people playing the greybox, collected with the playtest guide and form (a private claude.ai page shared by the project owner). Answers are copied in **without names**: each tester is T1, T2… in the order their answers arrived.

**Builds under test** (live at https://dangviettuan.github.io/cuu-vuc/):
- **v0.5** (`1a39941`), played by **T1**: the short slice (S1 forest edge → shrine → Nanh Rễ → C2) with the Prologue kit (brush-knife, 8-frame parry, block), Nanh Rễ at 260 HP, and the Phase 1 shell (title, name entry, saves, options).
- **v0.6** (Phase 2, merged 2026-11-25), for **T2 onward**: the **whole Prologue, S1 → S8** (about 20–30 minutes, much of it story), placeholder music, and the reworked village art.
  - Nanh Rễ's numbers are unchanged (260 HP). Two combat changes can still move her rating: the **air slash** (a downward chop after jumping her charge) and her **heal punish** (healing near her while she's idle draws an attack).
  - Players now reach her after the S6 village fight, so they arrive warmed up.
  - Answers from v0.6 are read separately from T1's for boss difficulty. "Minutes played" now means the whole Prologue.
**Target** (REVIEW-2026-11-23 §1, PLAYTEST_REPORT I-01): a skilled first-time player dies **1–3 times** at Nanh Rễ. The boss should rate **about 3/5**, and no hit should feel unfair.

## What we are deciding

| Question | Decide when | Change if |
|---|---|---|
| Nanh Rễ's HP and recovery windows | 3–5 responses | Most rate her **≤ 2/5** with **≤ 1 death**: raise her HP back toward 300 or shorten her recovery. Most rate her **≥ 4/5**, or report unfair hits: the reverse. |
| Swipe-parry window | 3–5 responses | Most answer "hầu như không" (almost never): delay the swipe's active frames by about 60 ms, or widen its parry window (PLAYTEST_REPORT I-13). |
| Whether block matters | After the window changes | Nobody uses it: give an attack a reason to block (a multi-hit or a sweep you can't dodge through). |
| Parry tutorial | 3–5 responses | Several answer "đến trận Nanh Rễ mới hiểu" (only understood at the boss) or "vẫn chưa hiểu" (still don't): rework boar 1's sign or its timing. |
| Name entry with an input method | Every response | Any "có lỗi" (it had errors) |
| Frame pacing at 120 Hz and above | Responses from high-refresh screens | Any report of judder: cap rendering at 60 fps or match the physics rate (REVIEW §2) |

## Summary so far (1 response)

| | T1 |
|---|---|
| Input | Keyboard |
| Machine | Mac, Chrome, 120 Hz+ |
| Difficulty | Standard |
| Reached | Won, chose |
| Deaths at Nanh Rễ | 1 |
| Minutes played | 2 (unclear: may mean the boss only) |
| Parry understood | After a few tries |
| Swipe parry | Almost never |
| Block | Knew of it, didn't use it |
| Boss difficulty (1–5) | **2** |
| Unfair hits | None |
| Jump feel | Right |
| Name typing | Correct (OpenKey) |
| C2 | Spared |
| Wants more | Yes |

**Signals (not yet decisions):**
- The boss may be too easy for humans as well as for the bot: rated 2/5, 1 death.
- The swipe parry is rarely landed, and isn't needed to win.
- Block goes unused.
- No unfair hits; the jump feels right.
- **Confirmed:** Vietnamese name entry works with a real input method (OpenKey on macOS and Chrome).
- No judder was reported on a high-refresh screen, but the form doesn't ask directly, so this is weak evidence.

## Responses

### T1 — 2026-11-25
- **Setup:** Mac, Chrome · keyboard · high refresh (120 Hz+) · Standard
- **Progress:** won and chose · 1 death at Nanh Rễ · 2 minutes played
- **Combat:**
  - Parry understood after a few tries.
  - Swipe parry: almost never.
  - Block: knew of it, didn't use it.
  - Boss difficulty 2/5.
  - No unfair hits.
  - Jump: right.
- **Name entry:** correct, with OpenKey.
- **C2:** spared. Their reason: *"Cho cơ hội hoàn lương và chăm con"* ("to give her a chance to reform and care for her young").
- **Would keep playing:** yes.
- **Follow-up to ask:** were the 2 minutes the whole slice or only the boss fight?
