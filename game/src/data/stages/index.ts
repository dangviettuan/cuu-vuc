/** Every stage, by id. The Prologue greybox runs S1 → S3 → S4 → S5 → S6 → S7 (src/data/stages/*); S2 and S8 are cards. */
import type { StageDef } from "../stage";
import { PROLOGUE_S1 } from "./prologue-s1";
import { PROLOGUE_S3 } from "./prologue-s3";
import { PROLOGUE_S4 } from "./prologue-s4";
import { PROLOGUE_S5 } from "./prologue-s5";
import { PROLOGUE_S6 } from "./prologue-s6";
import { PROLOGUE_S7 } from "./prologue-s7";

export const STAGES: Record<string, StageDef> = {
  [PROLOGUE_S1.id]: PROLOGUE_S1,
  [PROLOGUE_S3.id]: PROLOGUE_S3,
  [PROLOGUE_S4.id]: PROLOGUE_S4,
  [PROLOGUE_S5.id]: PROLOGUE_S5,
  [PROLOGUE_S6.id]: PROLOGUE_S6,
  [PROLOGUE_S7.id]: PROLOGUE_S7,
};
export const FIRST_STAGE = PROLOGUE_S1.id;
