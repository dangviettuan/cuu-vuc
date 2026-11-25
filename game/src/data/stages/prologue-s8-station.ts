/**
 * Prologue S8 "Lối rễ", part 2: the silent forest and the Dẫn Mạch station, dawn. Spec:
 * docs/04-chapters/prologue-an-moc-v0.1.md §3 (the ending at the station), §12 (PRO_STATION_READ), §13 beat 5.
 *
 * A rooted deer that no longer runs. Then the station on its mound: the casing prised open, the boot prints, and (for
 * the attentive) the undisturbed ground and a pair of worn cloth sandals walking in step. Picking up the dropped third
 * rod ends it: "Họ bắt cha đi." Read every clue first and PRO_STATION_READ is set. The Prologue ends here.
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S8_STATION = {
  id: "prologue-s8-station",
  width: 1000,
  height: 360,
  groundY: 304,
  start: { x: 40 },
  music: "indoor",
  time: "dawn",
  leaves: "none",
  ledges: [],
  signs: [],
  herbs: [],
  brush: [],
  boars: [],
  shrines: [],
  props: [
    { key: "rooted_deer", x: 330, depth: -2 },
    { key: "station", x: 800, y: 306, depth: -2 },
    { key: "boot_prints", x: 730, y: 306, depth: 3 },
    { key: "dropped_rod", x: 900, y: 305, id: "rod", depth: 5 },
  ],
  examine: [
    { id: "housing", x: 800, cutscene: "s8.housing", once: true, range: 20 },
    { id: "prints", x: 732, cutscene: "s8.prints", once: true, range: 20 },
    { id: "ground", x: 850, cutscene: "s8.ground", once: true, range: 14 },
    { id: "rod", x: 900, cutscene: "s8.rod", while: "rod", once: true, range: 16 },
  ],
  triggers: [
    { id: "deer", cutscene: "s8.deer", x: 250 },
    { id: "clearing", cutscene: "s8.clearing", x: 600 },
  ],
  opening: "s8.forest",
} satisfies StageDef;
