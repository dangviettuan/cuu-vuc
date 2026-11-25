/**
 * Prologue S5 "Căn phòng của cha" (the Father's room), night. Spec: docs/04-chapters/prologue-an-moc-v0.1.md §3 (S5),
 * §13 beat 3; the night at home as written in prose Chương 1. An interaction puzzle, no combat.
 *
 * Inside the house: the front door (bolt it, as he was told), the table with the Father's bowl, the knife rack, and
 * through a doorway the Father's room. The room stays shut until the door is bolted and the knife taken down; then
 * the sound from the forest sends him in. Search: the map, the desk, the box under the bed (empty), which shows the
 * dust trace; push the bed; lift the newer board: the half Mạch Ấn.
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S5 = {
  id: "prologue-s5",
  width: 560,
  height: 360,
  groundY: 304,
  start: { x: 50 },
  music: "indoor",
  time: "indoor",
  leaves: "none",
  floor: "wood",
  ledges: [],
  signs: [],
  herbs: [],
  brush: [],
  boars: [],
  shrines: [],
  props: [
    { key: "interior", x: 0, left: true, depth: -4 },
    { key: "front_door0", x: 22, id: "door", depth: -3 },
    { key: "table_bare", x: 92, depth: 4 },
    { key: "bowl", x: 88, y: 296, id: "bowl", depth: 5 },
    { key: "lamp", x: 108, y: 296, depth: 5 },
    { key: "rack1", x: 186, y: 262, id: "rack", depth: -2 },
    { key: "room_door", x: 231, id: "roomDoor", depth: 3 },
    { key: "wall_map", x: 268, y: 270, depth: -2 },
    { key: "low_desk", x: 318, depth: 4 },
    { key: "bed", x: 446, id: "bed", depth: 4 },
    { key: "clothes_box", x: 446, y: 305, id: "box", depth: 5, hidden: true },
    { key: "dust_trace", x: 444, y: 305, id: "dust", depth: 3, hidden: true },
    { key: "board0", x: 446, y: 305, id: "board", depth: 3, hidden: true },
  ],
  examine: [
    { id: "bowl", x: 90, cutscene: "s5.bowl", while: "bowl", once: true },
    { id: "bolt", x: 26, cutscene: "s5.bolt", once: true, range: 22 },
    { id: "knife", x: 186, cutscene: "s5.knife", once: true },
    { id: "roomDoorLook", x: 218, text: "s5.ex.roomDoor", while: "roomDoor" },
    { id: "map", x: 268, text: "s5.ex.map", after: ["room"] },
    { id: "desk", x: 318, cutscene: "s5.desk", after: ["room"], once: true },
    { id: "shelf", x: 334, text: "s5.ex.shelf", after: ["room", "desk"] },
    { id: "box", x: 420, cutscene: "s5.box", after: ["room"], once: true, range: 20 },
    { id: "dust", x: 470, cutscene: "s5.dust", after: ["box"], once: true, range: 20 },
    { id: "bed", x: 420, cutscene: "s5.bed", after: ["dust"], once: true, range: 20 },
    { id: "board", x: 446, cutscene: "s5.board", after: ["bed"], once: true, range: 20 },
  ],
  // the Father's room is shut until the sound from the forest sends him in
  blocks: [{ id: "roomDoor", x: 228 }],
  triggers: [{ id: "sound", cutscene: "s5.sound", after: ["bolt", "knife"] }],
  opening: "s5.open",
} satisfies StageDef;
