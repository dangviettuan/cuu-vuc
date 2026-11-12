# Flag Registry v0.1

Status: **generated index.** Rebuild it whenever a chapter spec changes. The spec files are the source of truth for each flag's meaning and values.

This page lists every story flag and axis mentioned in `docs/04-chapters/`, with the spec that **owns** it (the one that writes it) and the specs that **reference** it (mostly the ones that read it).

- **Naming:** `PRO_*` belongs to the Prologue; `CHn_*` belongs to Chapter n; `MA_*` is the global Mạch Ấn tracker; `AX_*` are the ending axes (ADR-0007).
- **Rule:** every choice must declare its axes, and every flag must have at least one consumer. A flag with no references is either a missing payoff or dead weight.

| Flag | Owner | Referenced in |
|---|---|---|
| `CH1_CLASS` | chapter-01-thanh-moc | chapter-05-bien-loan |
| `CH1_HOLAM_STANDING` | chapter-01-thanh-moc | chapter-02-trung-vuc, chapter-11-cuu-mach |
| `CH1_KHE_VISITED` | chapter-01-thanh-moc | chapter-09-u-minh |
| `CH1_SE_FATE` | chapter-01-thanh-moc | chapter-02-trung-vuc, chapter-04-loi-trach, chapter-05-bien-loan, chapter-09-u-minh, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH1_TU_FAMILY` | chapter-01-thanh-moc | chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH2_FATHER_FILE` | chapter-02-trung-vuc | chapter-09-u-minh |
| `CH2_HOUSE_CONTACT` | chapter-02-trung-vuc | chapter-05-bien-loan |
| `CH2_KHE_PAGE` | chapter-02-trung-vuc | chapter-04-loi-trach, chapter-09-u-minh |
| `CH2_MAC_CAPTURED` | chapter-02-trung-vuc | chapter-05-bien-loan |
| `CH2_RECORDS` | chapter-02-trung-vuc | chapter-03-xich-sa, chapter-04-loi-trach, chapter-05-bien-loan, chapter-12-quy-nguyen |
| `CH3_CAT_ALIVE` | chapter-03-xich-sa | chapter-11-cuu-mach |
| `CH3_FATHER_NUMBERS` | chapter-03-xich-sa | chapter-05-bien-loan |
| `CH3_HAO_STATE` | chapter-03-xich-sa | chapter-11-cuu-mach |
| `CH3_WATER` | chapter-03-xich-sa | chapter-04-loi-trach, chapter-09-u-minh, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH4_FRACTURE` | chapter-04-loi-trach | chapter-05-bien-loan, chapter-08-van-hai, chapter-12-quy-nguyen |
| `CH4_LOINHA_KILLED` | chapter-04-loi-trach | chapter-09-u-minh |
| `CH4_SAVED` | chapter-04-loi-trach | chapter-05-bien-loan, chapter-09-u-minh, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH4_SPEAR` | chapter-04-loi-trach | chapter-08-van-hai, chapter-11-cuu-mach |
| `CH5_CIVILIAN_HARM` | chapter-05-bien-loan | chapter-09-u-minh |
| `CH5_FATHER_DEMAND` | chapter-05-bien-loan | chapter-06-han-son, chapter-09-u-minh, chapter-10-thien-khuyet, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH5_KHAI` | chapter-05-bien-loan | chapter-06-han-son, chapter-09-u-minh, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH5_MAC` | chapter-05-bien-loan | chapter-11-cuu-mach |
| `CH5_TMN_SEEN` | chapter-05-bien-loan | *story-state marker (always true)* |
| `CH6_ABSORBED` | chapter-06-han-son | chapter-07-huyen-hai, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH6_CHARTER` | chapter-06-han-son | chapter-07-huyen-hai, chapter-11-cuu-mach |
| `CH6_CLAN_TRUST` | chapter-06-han-son | chapter-11-cuu-mach |
| `CH6_TMN_KNOWN` | chapter-06-han-son | *story-state marker (always true)* |
| `CH7_ABSORBED` | chapter-07-huyen-hai | *feeds `MA_REFUSED`* |
| `CH7_CHOICE` | chapter-07-huyen-hai | chapter-08-van-hai, chapter-09-u-minh, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH7_COUNG_TRUST` | chapter-07-huyen-hai | chapter-08-van-hai, chapter-11-cuu-mach |
| `CH7_RECORD` | chapter-07-huyen-hai | chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH8_ABSORBED` | chapter-08-van-hai | *feeds `MA_REFUSED`* |
| `CH8_CHARM` | chapter-08-van-hai | chapter-11-cuu-mach |
| `CH8_DIEP_FRAGMENT` | chapter-08-van-hai | chapter-12-quy-nguyen |
| `CH8_SAVED` | chapter-08-van-hai | chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH8_STATE` | chapter-08-van-hai | chapter-09-u-minh, chapter-10-thien-khuyet, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH9_ABSORBED` | chapter-09-u-minh | *feeds `MA_REFUSED`* |
| `CH9_FATHER_VERDICT` | chapter-09-u-minh | chapter-10-thien-khuyet, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH9_KNOWS` | chapter-09-u-minh | *story-state marker (always true)* |
| `CH9_MOTHER` | chapter-09-u-minh | chapter-10-thien-khuyet, chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH9_NAMED` | chapter-09-u-minh | chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH10_ABSORBED` | chapter-10-thien-khuyet | chapter-12-quy-nguyen; *feeds `MA_REFUSED`; Gluttony score* |
| `CH10_COMMAND` | chapter-10-thien-khuyet | chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH10_MIRROR` | chapter-10-thien-khuyet | chapter-12-quy-nguyen |
| `CH10_STELE` | chapter-10-thien-khuyet | chapter-11-cuu-mach, chapter-12-quy-nguyen |
| `CH10_TRUTH` | chapter-10-thien-khuyet | *story-state marker (always true)* |
| `CH11_ALLIANCE` | chapter-11-cuu-mach | chapter-12-quy-nguyen |
| `CH11_CUU_AN` | chapter-11-cuu-mach | chapter-12-quy-nguyen |
| `CH11_DIEP_ROLE` | chapter-11-cuu-mach | chapter-12-quy-nguyen |
| `CH11_FATHER_SCENE` | chapter-11-cuu-mach | chapter-12-quy-nguyen |
| `CH11_HELPED` | chapter-11-cuu-mach | chapter-12-quy-nguyen |
| `CH12_DIEP_UNBOUND` | chapter-12-quy-nguyen | *terminal (epilogue)* |
| `CH12_FATHER_HELD` | chapter-12-quy-nguyen | *terminal (epilogue; Vĩnh Sinh eligibility)* |
| `CH12_FINAL_ACT` | chapter-12-quy-nguyen | *terminal (epilogue)* |
| `AX_ACT` | global | chapter-12-quy-nguyen |
| `AX_ATTACH` | global | chapter-12-quy-nguyen |
| `AX_CONTROL` | global | chapter-12-quy-nguyen |
| `AX_MANY` | global | chapter-12-quy-nguyen |
| `AX_ORDER` | global | chapter-12-quy-nguyen |
| `AX_POWER` | global | chapter-12-quy-nguyen |
| `AX_PUNISH` | global | chapter-12-quy-nguyen |
| `MA_REFUSED` | global | chapter-07-huyen-hai, chapter-08-van-hai, chapter-09-u-minh, chapter-10-thien-khuyet, chapter-12-quy-nguyen |
| `PRO_KEEPER_HINT` | prologue-an-moc | chapter-09-u-minh |
| `PRO_SOW_SPARED` | prologue-an-moc | chapter-01-thanh-moc, chapter-09-u-minh, chapter-11-cuu-mach |
| `PRO_STATION_READ` | prologue-an-moc | chapter-05-bien-loan |
| `PRO_VILLAGE_TOLD` | prologue-an-moc | chapter-01-thanh-moc, chapter-09-u-minh, chapter-11-cuu-mach, chapter-12-quy-nguyen |
