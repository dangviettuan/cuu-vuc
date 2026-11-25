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
  "opt.volume": "Âm lượng",
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
  "sign.move": "{left}/{right}: chạy\n{jump}: nhảy (giữ để nhảy cao)",
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

  // ---- speakers
  "who.player": "{name}",
} as const;

export type StringKey = keyof typeof vi;
