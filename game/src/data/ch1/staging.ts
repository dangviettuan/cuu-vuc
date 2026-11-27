/**
 * Chapter I staging (Phase 3): the scenes the stages play. The words are in the text files beside this one (written from
 * prose Chương 3–6); these add what the stage does around them: walks, props shown and swapped, the choices that
 * branch, marks that open the next beat, and the way on to the next stage.
 */
const D = "diep";

export const STAGING: Record<string, object[]> = {
  /* ---- the Prologue's station leads on into Ch. I ---- */

  /* ---- ch1-road: the Outer Forest, the station to Mộc Thành (I-1) ---- */
  "ch1.road.open": [{ wait: 400 }, { play: "i1.road.open" }, { toast: "ch1.road.hint" }],
  "ch1.road.giants": [{ play: "i1.road.giants" }],
  "ch1.road.sow": [{ walk: "player", to: 1040 }, { play: "i1.road.sow" }],

  /* ---- ch1-mocthanh: Mộc Thành, I-1 then I-2 ---- */
  "ch1.mt.arrive": [{ wait: 400 }, { play: "i1.arrive" }, { toast: "ch1.mt.hint" }],
  "ch1.mt.diep": [{ walk: "player", to: 572 }, { face: "player", dir: 1 }, { play: "i1.diep" }],
  "ch1.mt.ngan": [{ walk: "player", to: 1720 }, { face: "player", dir: 1 }, { face: "ngan", dir: -1 }, { play: "i1.ngan" }],
  "ch1.mt.night": [{ wait: 600 }, { play: "i1.night" }, { wait: 500 }, { mark: "morning" }, { walk: D, to: 980, nowait: true }, { play: "i2.intro" }, { toast: "ch1.mentors.hint" }],
  "ch1.mt.en": [{ face: "player", dir: 1 }, { play: "i2.en" }, { mark: "met.en" }],
  "ch1.mt.baReu": [{ face: "player", dir: 1 }, { play: "i2.baReu" }, { mark: "met.baReu" }],
  "ch1.mt.toan": [{ face: "player", dir: 1 }, { play: "i2.toan" }, { mark: "met.toan" }],
  "ch1.mt.laoTru": [{ face: "player", dir: 1 }, { play: "i2.laoTru" }, { mark: "met.laoTru" }],
  "ch1.mt.choose": [{ play: "i2.choose" }, { play: "i2.train" }, { goto: "ch1-training" }],

  /* ---- ch1-training: the day of training (I-2) ---- */
  "ch1.train.open": [
    { wait: 300 },
    { toast: "ch1.train.hint.kiem", when: { flag: "CH1_CLASS", is: "kiem" } },
    { toast: "ch1.train.hint.anh", when: { flag: "CH1_CLASS", is: "anh" } },
  ],
  "ch1.train.done": [{ wait: 300 }, { play: "i2.trained" }, { play: "i2.evening" }, { goto: "ch1-trail", card: ["card.ch1.trail"] }],

  /* ---- ch1-trail: the boot prints, the Outer Forest (I-3) ---- */
  "ch1.trail.open": [{ wait: 400 }, { play: "i3.stream" }],
  "ch1.trail.tu": [{ walk: "player", to: 1010 }, { face: "player", dir: 1 }, { showProp: "tuWife" }, { showProp: "tuChild" }, { play: "i3.tu" }],
  "ch1.trail.warden": [{ walk: "player", to: 1320 }, { face: "player", dir: 1 }, { play: "i3.warden" }],
  "ch1.trail.route": [{ walk: "player", to: 1700 }, { face: "player", dir: 1 }, { play: "i3.route" }],
  "ch1.trail.khe": [{ play: "khe.offer" }, { choose: "ch1.khe", then: { visit: "ch1.khe.go", skip: "ch1.khe.skip" } }],
  "ch1.khe.go": [{ goto: "ch1-khe" }],
  "ch1.khe.skip": [{ play: "khe.skip" }, { play: "i3.camp" }, { goto: "ch1-deep", card: ["card.ch1.deep"] }],

  /* ---- ch1-khe: the Làng Khê ruins (optional) ---- */
  "ch1.khe.open": [{ wait: 400 }, { play: "khe.enter" }],
  "ch1.khe.station": [{ play: "khe.station" }, { play: "i3.camp" }, { goto: "ch1-deep", card: ["card.ch1.deep"] }],

  /* ---- ch1-deep: Rừng Sâu and Độc Đằng (I-4) ---- */
  "ch1.deep.open": [{ wait: 400 }, { play: "i4.open" }],
  "ch1.deep.roots": [{ walk: "player", to: 492 }, { face: "player", dir: 1 }, { play: "i4.roots" }, { sfx: "roots" }, { setProp: { id: "wall1", key: "root_wall1" } }, { mark: "parted1" }],
  "ch1.deep.roots2": [{ pulse: 1, heart: false }, { sfx: "roots" }, { setProp: { id: "wall2", key: "root_wall1" } }, { mark: "parted2" }],
  "ch1.deep.after": [{ wait: 600 }, { play: "i4.docDang.after" }, { antidotes: 2 }, { play: "i4.deeper" }, { goto: "ch1-grove", card: ["card.ch1.grove"] }],

  /* ---- ch1-grove: Mộc Giác and the absorption (I-5) ---- */
  "ch1.grove.intro": [{ play: "i5.grove" }, { play: "i5.wake" }],
  "ch1.grove.after": [
    { wait: 900 },
    { play: "i5.absorb" },
    { machAn: "reGiu" }, { dropItem: "halfMachAn" },
    { setProp: { id: "node", key: "node_dry" } },
    { play: "i5.after" },
    { goto: "ch1-cut", card: ["card.ch1.cut"] },
  ],

  /* ---- ch1-cut: Vết Cắt, Hùng, Cương, Sẻ (I-6) ---- */
  "ch1.cut.open": [{ wait: 400 }, { play: "i6.road" }, { play: "i6.open" }, { play: "i6.cut" }, { play: "i6.watch" }, { play: "i6.fight" }],
  "ch1.cut.cleared": [{ wait: 500 }, { play: "i6.fight.end" }, { mark: "gauntlet" }],
  "ch1.cut.after": [
    { wait: 700 },
    { play: "i6.hung.after" },
    { showProp: "cuong" }, { walk: "cuong", to: 2280 },
    { play: "i6.cuong" },
    { hideProp: "boss" }, { walk: "cuong", to: 2560 }, { hideProp: "cuong" },
    { showProp: "se" },
    { play: "i6.se" },
    { play: "i6.carry" },
    { goto: "ch1-return", card: ["card.ch1.return"] },
  ],

  /* ---- ch1-return: back to Mộc Thành, on to Thiên Kinh (I-7) ---- */
  "ch1.ret.open": [{ wait: 500 }, { walk: "player", to: 1700 }, { face: "player", dir: 1 }, { play: "i7.ngan" }, { play: "i7.toan" }, { item: "mocCau" }, { play: "i7.night" }, { end: "end.ch1" }],
};
