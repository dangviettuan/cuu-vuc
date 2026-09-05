# Cửu Vực

Working repository for **Cửu Vực**, an offline single-player 2D side-scrolling action RPG with handcrafted stages, class-based character building, boss-focused combat, equipment/skill/attribute progression, branching narrative, and multiple endings.

## Project pillars

1. **Story first, but playable**: narrative, bosses, levels, classes and progression must reinforce one another.
2. **Moral ambiguity**: no simple good/evil meter; choices are judged through consequences.
3. **Human limitation**: power does not automatically grant moral authority; some encounters intentionally cannot be won.
4. **Build identity**: classes, attributes, skills, equipment and Mạch Ấn create distinct play styles.
5. **Handcrafted journey**: no open world and no roguelike structure. The game progresses through authored stages and revisits a changing world.

## Canon status

The documents in `docs/decisions/` record decisions already accepted as project canon unless explicitly superseded by a later ADR.

Current canonical foundation:

- Working title: **Cửu Vực**
- Offline single-player
- 2D side-scrolling action RPG
- Nine realms: Thanh Mộc, Xích Sa, Hàn Sơn, Vân Hải, Lôi Trạch, U Minh, Huyền Hải, Thiên Khuyết, Trung Vực
- Branching narrative with seven endings inspired by the Seven Deadly Sins and an eighth ending, **Nhân Gian**
- Central theme: having the power to choose does not automatically grant the right to choose for everyone

## Documentation map

- `docs/00-project-vision.md` — high-level game direction
- `docs/01-world/world-bible-v0.1.md` — world skeleton and the Nine Realms
- `docs/02-narrative/narrative-bible-v0.1.md` — connected main narrative
- `docs/03-characters/` — protagonist and major character bible, next design target
- `docs/04-chapters/` — chapter/quest implementation specs
- `docs/05-gameplay/` — classes, combat, stats, items, skills, progression
- `docs/06-art/` — art direction and production rules
- `docs/decisions/` — project ADRs and canonical decisions
- `docs/PROJECT_STATUS.md` — current status and next work

## Contributing

The project is public by design. Contributions, discussion, critique, lore proposals, gameplay ideas, tooling improvements, and implementation PRs are welcome.

Before proposing major changes to canon, read `docs/decisions/` and `docs/PROJECT_STATUS.md`. New ideas that alter accepted canon should be discussed before implementation so the project does not fragment into incompatible directions.
