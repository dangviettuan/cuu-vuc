/** Every stage, by id. The Prologue greybox runs S1 → S3 → S7 (src/data/stages/*). */
import type { StageDef } from "../stage";
import { PROLOGUE_S1 } from "./prologue-s1";
import { PROLOGUE_S3 } from "./prologue-s3";
import { PROLOGUE_S7 } from "./prologue-s7";

export const STAGES: Record<string, StageDef> = {
  [PROLOGUE_S1.id]: PROLOGUE_S1,
  [PROLOGUE_S3.id]: PROLOGUE_S3,
  [PROLOGUE_S7.id]: PROLOGUE_S7,
};
export const FIRST_STAGE = PROLOGUE_S1.id;
