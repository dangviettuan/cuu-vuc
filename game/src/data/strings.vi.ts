/**
 * Vietnamese string table: the game's source language. Every on-screen string lives here, keyed.
 *
 * Placeholders in braces:
 * - **An action name** (`{light}`, `{parry}`, `{jump}`…) becomes that action's key or button on the device the player
 *   used last, so prompts stay correct after rebinding and when switching to a gamepad.
 * - **`{name}`** is the protagonist's name (ADR-0004).
 * - **Anything else** is passed in by the caller.
 * A missing key shows the key itself, so gaps are visible rather than blank.
 */
export const vi = {
  // ---- title, onboarding
  "title.game": "CỬU VỰC",
  "title.sub": "Bản thử nghiệm: Mở đầu · An Mộc",
  "title.continue": "Tiếp tục",
  "title.new": "Bắt đầu mới",
  "title.options": "Tùy chỉnh",
  "title.hint": "{up}/{down}: chọn · {confirm}: xác nhận",
  "title.overwrite": "Bắt đầu mới sẽ xóa bản lưu hiện tại. {confirm}: đồng ý · {cancel}: thôi",
  "name.prompt": "Tên anh là gì?",
  "name.hint": "Gõ tên (có dấu được) · Enter: xong · Esc: quay lại",
  "name.empty": "Hãy nhập một cái tên.",

  // ---- pause and options
  "pause.title": "Tạm dừng",
  "pause.resume": "Tiếp tục",
  "pause.options": "Tùy chỉnh",
  "pause.title.menu": "Về màn hình chính",
  "opt.title": "Tùy chỉnh",
  "opt.volume": "Âm lượng hiệu ứng",
  "opt.music": "Âm lượng nhạc",
  "opt.shake": "Rung màn hình",
  "opt.flashes": "Giảm nháy sáng",
  "opt.difficulty": "Độ khó",
  "opt.pixel": "Điểm ảnh sắc nét (phóng nguyên lần)",
  "opt.controls": "Phím điều khiển",
  "opt.strip": "Dải gợi ý phím",
  "opt.back": "Quay lại",
  "opt.on": "Bật",
  "opt.off": "Tắt",
  "opt.hint": "{left}/{right}: đổi · {cancel}: quay lại",
  "diff.story": "Truyện",
  "diff.standard": "Chuẩn",
  "diff.hard": "Khó",
  "diff.story.desc": "Cửa sổ đỡ và né rộng hơn, nhận ít sát thương hơn. Cốt truyện như nhau.",
  "diff.standard.desc": "Độ khó thiết kế.",
  "diff.hard.desc": "Cửa sổ hẹp hơn, đòn đánh đau hơn. Cốt truyện như nhau.",
  "ctl.title": "Phím điều khiển ({device})",
  "ctl.keyboard": "bàn phím",
  "ctl.gamepad": "tay cầm",
  "ctl.press": "Nhấn phím hoặc nút mới… (Esc: hủy)",
  "ctl.reset": "Khôi phục mặc định",
  "ctl.hint": "{confirm}: đổi phím · {cancel}: quay lại",
  "act.jump": "Nhảy",
  "act.light": "Chém",
  "act.heavy": "Chém mạnh (giữ)",
  "act.dodge": "Né",
  "act.parry": "Đỡ / giữ: chặn",
  "act.herb": "Dùng thảo dược",
  "act.interact": "Tương tác",

  // ---- HUD
  "hud.herbs": "Thảo dược {n}/{cap}",
  "hud.strip1": "{left}/{right} chạy · {jump} nhảy · {light} chém · {heavy} giữ: chém mạnh · {dodge} né",
  "hud.strip2": "{parry} đỡ · giữ {parry}: chặn · {herb} thảo dược · {interact} tương tác · {pause} tạm dừng",
  "hud.strip2.kiem": "{parry} đỡ · giữ {parry}: chặn · giữ {parry} + {heavy}: Phá Thế · {herb} thảo dược · {pause} tạm dừng",

  // ---- Prologue S1: signs and toasts
  "s1.intro": "Việc sáng: phát quang lối mòn cho trưởng làng.",
  "sign.move": "{left}/{right}: chạy\n{jump}: nhảy (giữ để nhảy cao)\nĐang nhảy, {light}: chém xuống",
  "sign.brush": "Bụi rậm chắn lối.\n{light}: chém (3 nhát liên hoàn)",
  "sign.herb": "Thảo dược rừng.\n{herb}: dùng (hồi máu)",
  "sign.boar1": "Lợn rừng hoảng loạn!\n{parry}: đỡ ngay lúc nó lao tới\nrồi {light}: chém khi nó choáng",
  "sign.boar1.kiem": "Lợn rừng hoảng loạn!\n{parry}: đỡ ngay lúc nó lao tới\nrồi {light}: phản đòn",
  "sign.boar2": "Thêm một con.\n{dodge}: lướt né xuyên qua nó\nrồi {light}: chém khi nó khựng lại",
  "sign.shrine": "Miếu Mạch.\n{interact}: thắp (điểm hồi sinh)",
  "toast.brushCleared": "Đã phát quang lối mòn.",
  "toast.herb": "+1 thảo dược",
  "toast.shrine": "Miếu Mạch đã thắp. Máu và thảo dược hồi đầy.",
  "toast.wakeShrine": "Tỉnh lại ở miếu Mạch.",
  "toast.wakeStart": "Tỉnh lại ở bìa rừng.",
  "toast.parry": "Đỡ được! {light}: chém",
  "toast.parry.kiem": "Đỡ được! {light}: phản đòn",
  "toast.guardBreak": "Thủ bị phá!",
  "toast.phaThe": "Phá Thế!",
  "toast.perfectDodge": "Né hoàn hảo!",
  "toast.riposte": "Phản đòn!",
  "toast.saved": "Đã lưu.",

  // ---- Nanh Rễ (S7)
  "boss.nanhRe": "NANH RỄ",
  "boss.nanhRe.intro": "Nanh Rễ: rễ cây mọc xuyên qua da thịt nó.",
  "boss.nanhRe.p2": "Nanh Rễ gào lên. Rễ mọc dày hơn.",
  "boss.nanhRe.p3": "Nanh Rễ liều mạng!",

  // ---- dialogue: C2 (prologue §7)
  "c2.cry": "Bầy con kêu ré từ bụi rậm.",
  "c2.think": "Nó không còn sức đứng dậy. Rễ vẫn quằn quại dưới da nó.",
  "c2.spare": "Đuổi nó đi (tha)",
  "c2.kill": "Kết liễu",
  "c2.spared.toast": "Nó lết đi, bầy con chạy theo. Về phía nam.",
  "c2.killed.toast": "Làng an toàn. Bầy con nằm im trong bụi rậm.",
  "c2.spared.end": "Nó lết đi về phía nam. Bầy con chạy theo.",
  "c2.killed.end": "Làng an toàn. Trong bụi rậm, bầy con nằm im.",
  "end.card": "{epilogue}\n\n— Hết bản thử nghiệm —\n{confirm}: về màn hình chính",
  "dlg.next": "{confirm} ▸",

  // ---- Prologue: stage bridges (S2, S4–S6 are not built yet; these cards carry the story across, from [Ch1])
  "sign.village": "An Mộc ▸",
  "card.s1s3.a": "Sáng hôm ấy, giếng làng cạn khô.",
  "card.s1s3.b": "Cha cắm ba thanh đồng quanh miệng giếng. Thanh thứ ba rung lên.\nAi hỏi, cha cũng chỉ đáp: “Không.”",
  "card.s3s7.a": "Đó là lần cuối cùng anh nhìn thấy cha mình trong căn nhà ấy.",
  "card.s3s7.b": "Chiều hôm đó, cây cổ thụ cạnh miếu Mạch bắt đầu rụng lá.\nTrời tối. Cha không về.",
  "card.s3s7.c": "Đêm ấy, rừng đổi.",
  "card.next": "{confirm} ▸",

  // ---- Prologue S3 "Bữa trưa" (Ch1, the lunch scene; lines as in the prose)
  "s3.n1": "Bữa trưa hôm đó nhạt hơn mọi ngày.",
  "s3.n2": "Cha anh gần như không ăn. Ông ngồi bên cửa, trước mặt là bát cơm nguội dần.",
  "s3.hint": "{interact}: nói chuyện với cha",
  "s3.ex.table": "Mâm cơm hai người. Phần của cha gần như còn nguyên.",
  "s3.ex.bag": "Túi của cha. Ba thanh đồng dẫn Mạch, một cuộn chỉ đỏ.",
  "s3.ex.diep": "Phòng của Diệp. Mọi thứ vẫn y như lúc chị đi Mộc Thành.",
  "s3.p1": "Con đi cùng.",
  "s3.f1": "Không.",
  "s3.p2": "Con biết đường tới trạm.",
  "s3.f2": "Cha biết.",
  "s3.p3": "Con cũng biết dùng dao.",
  "s3.f3": "Cha cũng biết.",
  "s3.n3": "Anh nhíu mày.",
  "s3.p4": "Vậy lý do?",
  "s3.n4": "Cha anh cuối cùng cũng nhìn sang.",
  "s3.f4": "Lý do là cha đi làm việc của cha.",
  "s3.p5": "Còn con?",
  "s3.f5": "Ở nhà.",
  "s3.p6": "Con hai mươi lăm rồi.",
  "s3.f6": "Cha biết. Cha có mặt hôm con sinh.",
  "s3.n5": "Anh suýt bật cười. Cha không cười.",
  "s3.n6": "Ngoài cửa, một chiếc lá vàng rơi xuống sân.",
  "s3.n7": "Đang giữa mùa mưa. Và cái cây trước sân là loại quanh năm xanh.",
  "s3.n8": "Mặt dưới chiếc lá có một đường nâu đen chạy dọc theo gân chính, như thể bị đốt từ bên trong.",
  "s3.p7": "Linh Suy?",
  "s3.f7": "Đừng nói từ đó ngoài đường.",
  "s3.p8": "Vì sao?",
  "s3.f8": "Vì người ta sẽ sợ.",
  "s3.p9": "Nếu là thật thì họ nên biết.",
  "s3.f9": "Biết cái gì?",
  "s3.n9": "Anh im lặng.",
  "s3.f10": "Con thấy một cái giếng cạn và một chiếc lá chết. Chừng đó chưa đủ để biết chuyện gì đang xảy ra.",
  "s3.p10": "Nhưng đủ để cha nói thật với con.",
  "s3.n10": "Ông đưa tay, như muốn đặt lên vai con trai, nhưng giữa chừng lại đổi ý. Bàn tay hạ xuống.",
  "s3.f11": "Cha sẽ về trước khi trời tối.",
  "s3.f12": "Nếu tối cha chưa về, khóa cửa.",
  "s3.p11": "Rừng này con chạy từ hồi chưa biết mặc quần.",
  "s3.f13": "Khóa cửa.",
  "s3.f14": "Và dù nghe thấy gì ngoài rừng cũng đừng đi tìm cha.",

  // ---- Prologue S7 (night)
  "s7.intro": "Có thứ gì đó từ rừng tràn vào làng.",
  "sign.shrine.night": "Miếu Mạch.\n{interact}: nghỉ (điểm hồi sinh)",

  // ---- pause during a scene
  "pause.skip": "Bỏ qua cảnh",

  // ---- speakers
  "who.player": "{name}",
  "who.father": "Cha",
} as const;

export type StringKey = keyof typeof vi;
