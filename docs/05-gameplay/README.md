# Gameplay Bible

Status: high-level direction accepted. **Detailed systems: see [Combat & Class Bible v0.1](combat-class-bible-v0.1.md).**

## Planned systems

### Classes
Initial design direction:
- Kiếm Khách — parry/counter melee
- Ảnh Vệ — dodge/combo/critical melee
- Ngự Linh — magic/summon
- Cơ Sư — ranged/device/trap

Class is the protagonist's chosen combat path, not a different protagonist identity.

### Primary attributes
Working set:
- Strength
- Vitality
- Dexterity
- Spirit
- Will

### Progression layers
- Character level
- Attribute allocation
- Skill tree
- Equipment
- Weapon scaling
- Equipment upgrades
- Boss Mạch Ấn

### Combat prototype target
Before production art, prove that these are fun:
- run
- jump
- normal attack
- heavy attack
- dodge
- hitbox/hurtbox interaction
- one class ability
- one enemy
- one boss pattern

### Traversal unlocks (gear, not Mạch Ấn)
Traversal unlocks never depend on optional Mạch Ấn, so players who refuse them never lose access:
- Móc Câu (grappling hook): Ch. I–II
- Áo Gió (Air Dash): Ch. VIII

### Checkpoints
Mạch shrines and Người Dẫn Mạch stations are the checkpoints ([ADR-0006](../decisions/ADR-0006-mach-checkpoints.md)).

### Mạch Ấn
Boss rewards that alter build behavior rather than merely increasing stats.

**Absorption rule:** through Ch. V, absorption is involuntary. **From Ch. VI onward, every absorption is a choice.** Refusals are tracked (`MA_REFUSED`) and weight the *accepting limitation vs more power* axis. Encounters from Ch. VII onward must be tuned for a variable number of Mạch Ấn.

The narrative meaning is important: protagonist progressively carries the power of beings they defeat, reinforcing the question of whether accumulating power changes the person using it.
