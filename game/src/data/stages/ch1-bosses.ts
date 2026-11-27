/**
 * Test arenas for the Chapter I bosses (Phase 3), not part of the story: `?quick=1&stage=ch1-boss-docDang` (or `-hung`,
 * `-mocGiac`). A shrine, Diệp beside him, Rễ Giữ granted, and the boss. Its story arena comes with the stages (M5).
 */
import type { StageDef } from "../stage";
import type { StringKey } from "../strings.vi";
import type { FoeId } from "../foes";

function arena(kind: FoeId, name: StringKey, intro: StringKey, phases: StringKey[], bossX: number, min = 300): StageDef {
  return {
    id: `ch1-boss-${kind}`, width: 980, height: 360, groundY: 304, start: { x: 60 },
    music: "forest", time: "morning", leaves: "yellow",
    ledges: [], signs: [], brush: [], boars: [],
    herbs: [{ id: `${kind}-a1`, x: 120, kind: "antidote" }, { id: `${kind}-a2`, x: 140, kind: "antidote" }],
    shrines: [{ id: `${kind}-shrine`, x: 220 }],
    grants: ["reGiu"], ally: {},
    arena: { min, max: 960, boss: { kind, x: bossX, name, intro, phases }, outcome: "test.bossDown" },
  };
}

// Độc Đằng never moves: its arena is one screen wide, so it is always in view
export const CH1_BOSS_DOCDANG = arena("docDang", "boss.docDang", "boss.docDang.intro", ["boss.docDang.p2"], 840, 480);
export const CH1_BOSS_HUNG = arena("hung", "boss.hung", "boss.hung.intro", ["boss.hung.p2"], 760);
export const CH1_BOSS_MOCGIAC = arena("mocGiac", "boss.mocGiac", "boss.mocGiac.intro", ["boss.mocGiac.p2", "boss.mocGiac.p3"], 780);
