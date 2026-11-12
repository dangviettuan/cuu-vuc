# ADR-0006 — Mạch shrines and stations as checkpoints

Status: **Accepted**

## Decision

Checkpoints (save, rest and respawn points) are **Mạch shrines (miếu Mạch)** and **Người Dẫn Mạch stations (trạm Dẫn Mạch)** placed in the world.

## Reason

- It ties the save system to the world's infrastructure, which is exactly the system Linh Suy is breaking.
- It gives the protagonist's origin (son of a Người Dẫn Mạch) a constant gameplay presence.
- It lets the narrative act on the system: stations can be damaged, cut or seized by factions, changing checkpoint access as a visible consequence.

## Constraints

- Damage to a checkpoint must never soft-lock progress. A critical-path stage must always keep at least one reachable checkpoint.
- Exact rest and respawn rules (healing, enemy respawn, fast travel) belong to the Gameplay Bible.

## First use

Prologue — An Mộc: the village miếu Mạch and the Father's station.
