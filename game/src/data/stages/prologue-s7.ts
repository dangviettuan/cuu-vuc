/**
 * Prologue S7 "Nanh Rễ": the square under the shrine tree, at night. Spec: docs/04-chapters/prologue-an-moc-v0.1.md
 * §3 (S7) and §9. Arrived from S6 (the village fight); the gate has just broken. The miếu Mạch is the checkpoint before
 * the square (ADR-0006).
 */
import type { StageDef } from "../stage";

export const PROLOGUE_S7 = {
  id: "prologue-s7",
  width: 1300,
  height: 360,
  groundY: 304,
  wake: "toast.wakeVillage",
  start: { x: 60 },
  music: "night",
  time: "night",
  leaves: "yellow",
  intro: "s7.intro",
  ledges: [],
  signs: [],
  herbs: [],
  brush: [],
  boars: [],
  shrines: [{ id: "s7-shrine", x: 540, sign: "sign.shrine.night" }],
  props: [
    { key: "night_house0", x: 70, depth: -3 },
    { key: "night_house1", x: 230, depth: -3 },
    { key: "night_house2", x: 430, depth: -3 },
  ],
  arena: {
    min: 620,
    max: 1260,
    boss: { kind: "nanhRe", x: 1060, name: "boss.nanhRe", intro: "boss.nanhRe.intro" },
    grove: true,
    landmark: { x: 650, key: "split_tree" },
    litter: { bushX: 1230, x: 1212, n: 3 },
    outcome: "c2",
    next: { to: "prologue-s8" },
  },
} satisfies StageDef;
