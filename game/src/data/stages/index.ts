/** Every stage, by id. The Prologue runs S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 (village, then the station). */
import type { StageDef } from "../stage";
import { PROLOGUE_S1 } from "./prologue-s1";
import { PROLOGUE_S2 } from "./prologue-s2";
import { PROLOGUE_S3 } from "./prologue-s3";
import { PROLOGUE_S4 } from "./prologue-s4";
import { PROLOGUE_S5 } from "./prologue-s5";
import { PROLOGUE_S6 } from "./prologue-s6";
import { PROLOGUE_S7 } from "./prologue-s7";
import { PROLOGUE_S8 } from "./prologue-s8";
import { PROLOGUE_S8_STATION } from "./prologue-s8-station";
import { CH1_SANDBOX } from "./ch1-sandbox";

export const STAGES: Record<string, StageDef> = Object.fromEntries(
  [PROLOGUE_S1, PROLOGUE_S2, PROLOGUE_S3, PROLOGUE_S4, PROLOGUE_S5, PROLOGUE_S6, PROLOGUE_S7, PROLOGUE_S8, PROLOGUE_S8_STATION, CH1_SANDBOX].map((s) => [s.id, s as StageDef]),
);
export const FIRST_STAGE = PROLOGUE_S1.id;
