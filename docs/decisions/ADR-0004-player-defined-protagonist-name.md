# ADR-0004 — Player-defined protagonist name

Status: **Accepted**

## Decision

The protagonist of Cửu Vực has no fixed canonical personal name.

When starting a new game, the player types the protagonist's name into a text field. That value is stored in save data and used dynamically in dialogue, UI and narrative references where a personal name is needed.

## Narrative constraint

This does **not** make the protagonist a blank-slate avatar.

The protagonist retains authored:

- childhood and family history;
- relationship with the father;
- relationship with Người Đồng Hành;
- personality foundation;
- initial worldview;
- emotional wounds and fears;
- major character-development arc.

Player agency primarily affects choices, relationships, class/build, consequences and endings.

## Documentation convention

Design documents must refer to the protagonist as `PLAYER_NAME` or **Protagonist** rather than inventing a canonical name.

## Implementation note

The eventual name-entry system should support Unicode so Vietnamese names and other writing systems are not artificially excluded. Exact length, filtering and validation rules will be finalized during UI/save-system design.
