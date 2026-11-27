/** Chapter I, stages I-6 (Vết Cắt) and I-7 (Về Mộc Thành): prose Chương 6 "Vết Cắt" (story/drafts/chapter-06-vet-cat.md), spec chapter-01 §3, §12 beats 4–5, §13 C1. */
/*
 * Notes on the cut:
 * - The prose follows CH1_SE_FATE = "handed" and the Kiếm Khách class. The "released" and "forced" branches, and the
 *   memory lines that depend on Prologue flags, are new writing (marked NEW below).
 * - The prose's italics (*quấn*, *định*, *Mình đúng.*) are written plain; the string table has no emphasis markup.
 * - Ông Bảy (the Hộ Lâm squad leader, named in prose Ch. 3) speaks as `who.warden`.
 */

export const STRINGS = {
  /* ---- I-6 approach: the straight dead line from the grove to the Cut ---- */
  "i6.road.n1": "Đường thẳng đi suốt nửa ngày.",
  "i6.road.n2": "Không rẽ. Không vòng. Không tránh một gốc cây, một tảng đá, một con suối. Gặp gì nó đi xuyên qua nấy.",
  "i6.road.n3": "Cây trên đường đi của nó chết đứng. Đá nứt đôi. Suối cạn thành một vệt bùn đen.",
  "i6.road.n4": "Diệp đi bên trái đường thẳng. Anh đi bên phải.",
  "i6.road.n5": "Giữa hai người là một dải đất chết rộng chừng ba sải tay. Không ai bước vào đó.",
  "i6.road.n6": "Từ lúc rời lõi rừng, chị chưa nói với anh câu nào ngoài “nghỉ” và “đi”. Anh cũng không nói gì.",
  "i6.road.n7": "Trong ngực anh, thứ mới đến vẫn còn ấm. Thỉnh thoảng nó động đậy, như một con vật nhỏ đang tìm tư thế nằm.",
  "i6.road.n8": "Mỗi lần như vậy, rễ cây hai bên đường thẳng lại khẽ nghiêng về phía anh.",
  "i6.road.n9": "Anh không nhìn chúng. Anh nhìn về phía trước.",

  /* ---- I-6 §1: hammers, then the trench ---- */
  "i6.open.n1": "Họ nghe thấy tiếng búa trước khi nhìn thấy gì.",
  "i6.open.n2": "Tiếng kim loại gõ vào kim loại. Đều. Chậm. Như thợ rèn đang làm một việc đã quen tay.",
  "i6.open.n3": "Diệp giơ tay ra hiệu. Cả hai nằm rạp xuống sau một gốc cây đổ.",
  "i6.open.n4": "Phía trước, đường thẳng kết thúc. Ở đó, mặt đất bị xẻ ra.",
  "i6.open.n5": "Một rãnh sâu, dài, thẳng tắp, như có người lấy một con dao khổng lồ rạch xuống da đất.",
  "i6.open.n6": "Hai bên rãnh, lộ ra những thứ anh chưa bao giờ nghĩ là nằm dưới chân mình.",
  "i6.open.n7": "Những sợi đá trong suốt, to bằng thân người, xếp sát nhau như bó đũa, chạy từ phía tây sang phía đông.",
  "i6.open.n8": "Mạch.",
  "i6.open.n9": "Anh chưa bao giờ thấy nó. Chưa ai ở An Mộc thấy nó. Nhưng anh biết ngay, như người ta biết mặt người thân trong đám đông.",

  /* ---- I-6 §1: the node, cleanly severed; the frame; the boots ---- */
  "i6.cut.n1": "Bó đá ấy đã bị cắt đứt.",
  "i6.cut.n2": "Gọn gàng. Phẳng lì. Mặt cắt nhẵn bóng như gương.",
  "i6.cut.n3": "Ở phía tây, những sợi đá còn hơi sáng, một thứ ánh xanh nhợt nhạt, yếu ớt. Ở phía đông, chúng tối om.",
  "i6.cut.n4": "Và giữa hai mặt cắt, dựng ngang qua rãnh, là một cái khung.",
  "i6.cut.n5": "Kim loại. Xám bạc. To như cái cổng làng. Những lưỡi mỏng, dài, xếp thành hàng, mắc trong những rãnh trượt.",
  "i6.cut.n6": "Cả cái khung được chằng xuống đất bằng hàng chục sợi xích.",
  "i6.cut.n7": "Bên cạnh khung, chừng hai mươi người đang tháo dỡ.",
  "i6.cut.n8": "Họ mặc áo màu đất. Giày đế cứng, rãnh sâu.",
  "i6.cut.n9": "Anh nhận ra những đôi giày ấy.",

  /* ---- I-6 §2: watching from cover ---- */
  "i6.watch.d1": "Hai mươi. Có thể hơn. Có người đứng gác trên kia.",
  "i6.watch.n1": "Anh không đếm. Anh đang nhìn mặt cắt.",
  "i6.watch.n2": "Anh nghĩ đến cái giếng ở làng. Chiếc gàu rơi lâu hơn bình thường. Tiếng cộc khô khốc dưới đáy.",
  "i6.watch.n3": "Anh nghĩ đến bát cơm nguội của cha.",
  "i6.watch.n4": "Đến con lợn nái với cái lưng toàn rễ.",
  "i6.watch.n5kept": "Đến ông Dần với cái chân gãy.",
  "i6.watch.n5told": "Đến người chồng nhà Tư, không bao giờ về nữa.", // NEW
  "i6.watch.n6spared": "Đến Lộc trên cáng.",
  "i6.watch.n6killed": "Đến lũ lợn con nằm chết trên lối mòn.", // NEW
  "i6.watch.n7": "Đến người Hộ Lâm có tấm vải phủ mặt.",
  "i6.watch.n8": "Đến Mộc Giác nằm chết bên phiến đá chảy nhựa đen.",
  "i6.watch.n9": "Tất cả đều bắt đầu từ đây. Từ cái khung kim loại này.",
  "i6.watch.n10": "Từ những người đang tháo dỡ nó, chậm rãi, cẩn thận, như thợ mộc dọn đồ sau một ngày làm việc.",
  "i6.watch.d2": "Em. Đợi đã…",
  "i6.watch.n11": "Anh đã đứng dậy.",

  /* ---- I-6 §3: the operatives ---- */
  "i6.fight.n1": "Những người áo đất không hoảng loạn.",
  "i6.fight.n2": "Đó là điều anh nhớ nhất về họ, sau này.",
  "i6.fight.n3": "Họ không la hét, không chạy toán loạn. Người đứng gần anh nhất buông cái cờ lê, rút một thanh đoản đao bên hông, và lùi lại một bước.",
  "i6.fight.n4": "Hai người khác lập tức áp sát hai bên người đó. Ba người, thành một mũi nhọn.",
  "i6.fight.n5": "Phía sau họ, những người khác vẫn tiếp tục tháo dỡ. Nhanh hơn.",
  "i6.fight.n6": "Họ đang câu giờ.",
  "i6.roots.n1": "Thứ trong ngực anh giật nhẹ.",
  "i6.roots.n2": "Đất dưới chân người áo đất nứt ra. Rễ phụt lên. Không phải để quất, không phải để đâm. Chúng quấn.",
  "i6.roots.n3": "Quấn chặt hai cổ chân, kéo người đó khuỵu xuống, giữ chặt như hai bàn tay.",
  "i6.roots.n4": "Người đó trợn mắt nhìn xuống chân mình. Anh cũng vậy.",
  "i6.net.o1": "Lưới!",
  "i6.fight.end.n1": "Họ đánh như ở bờ suối An Mộc.",
  "i6.fight.end.n2": "Anh đỡ. Rễ giữ. Chị đâm.",
  "i6.fight.end.n3": "Lần này không ai cười.",

  /* ---- I-6 §4: Hùng ---- */
  "i6.hung.n1": "Người chỉ huy toán cắt mạch là một gã đàn ông vai rộng, mặt có vết bỏng, cầm một thanh đao dài cùng loại kim loại xám bạc với cái khung.",
  "i6.hung.n2": "Gã không lao vào như những người khác.",
  "i6.hung.n3": "Gã đứng đó. Quan sát. Nhìn anh đỡ đòn, nhìn rễ cây phụt lên, nhìn Diệp xoay giáo.",
  "i6.hung.n4": "Rồi gã bước tới.",
  "i6.hung.read.n1": "Gã không đánh vào chỗ anh đỡ được. Gã đánh vào chỗ anh định đỡ.",
  "i6.hung.read.n2": "Mỗi nhát chém đều dừng lại giữa chừng, đổi hướng, như thể gã đã đọc được lưỡi kiếm của anh trước khi anh kịp nhấc nó lên.",
  "i6.hung.read.n3": "Kẻ địch giỏi thì đáng biết.",
  "i6.hung.read.n4kiem": "Anh nhớ lại câu ấy. Của Toản, không phải của Lão Trụ.",
  "i6.hung.read.n4anh": "Anh nhớ lại câu ấy. Của Toản, không phải của Én.", // NEW (class variant)
  "i6.hung.read.n4linh": "Anh nhớ lại câu ấy. Của Toản, không phải của Bà Rêu.", // NEW (class variant)
  "i6.hung.read.n4co": "Anh nhớ lại câu ấy. Của Toản.", // NEW (class variant)
  "i6.hung.read.n5": "Anh ngừng đỡ. Anh đứng yên. Để hở ngực.",
  "i6.hung.after.n1": "Rễ phụt lên, quấn ngang hông gã.",
  "i6.hung.after.n2": "Mũi giáo của Diệp đặt lên cổ gã trước khi gã kịp gỡ.",
  "i6.hung.after.d1": "Bỏ đao.",
  "i6.hung.after.n3": "Gã nhìn mũi giáo. Nhìn rễ cây quanh hông mình.",
  "i6.hung.after.n4": "Gã buông đao.",

  /* ---- I-6 §5: Cương (unnamed) ---- */
  "i6.cuong.c1": "Đủ rồi.",
  "i6.cuong.n1": "Giọng nói không to. Nhưng tất cả những người áo đất còn đứng được đều dừng lại.",
  "i6.cuong.n2": "Một người đàn ông bước ra từ sau cái khung kim loại. Bốn mươi tuổi, có thể hơn. Gầy, khô, như một thanh củi đã phơi đủ nắng.",
  "i6.cuong.n3": "Mặt không có gì đặc biệt. Kiểu mặt mà người ta quên ngay sau khi đi qua.",
  "i6.cuong.n4": "Chỉ trừ đôi mắt. Đôi mắt ấy nhìn mọi thứ như đang đếm.",
  "i6.cuong.n5": "Ông ta nhìn gã chỉ huy đang bị mũi giáo kề cổ. Nhìn rễ cây. Nhìn Diệp.",
  "i6.cuong.n6": "Rồi nhìn anh.",
  "i6.cuong.c2": "Người của Hộ Lâm. Và… cậu.",
  "i6.cuong.n7": "Anh không trả lời.",
  "i6.cuong.n8": "Anh đưa tay vào túi, rút thanh đồng ra. Thanh thứ ba. Vết khía ở đuôi.",
  "i6.cuong.n9": "Anh giơ nó lên.",
  "i6.cuong.p1": "Ông ấy đâu?",
  "i6.cuong.n10": "Người đàn ông nhìn thanh đồng.",
  "i6.cuong.n11": "Lâu. Lâu hơn người ta nhìn một thanh đồng.",
  "i6.cuong.n12": "Anh thấy rất rõ. Một thứ gì đó lướt qua mắt ông ta. Rất nhanh. Rồi biến mất.",
  "i6.cuong.c3": "Không ai bắt ai cả, nhóc.",
  "i6.cuong.n13": "Anh siết chặt thanh đồng.",
  "i6.cuong.p2": "Nói dối.",
  "i6.cuong.n14": "Người đàn ông không cãi. Ông ta chỉ khẽ nghiêng đầu, như thể anh vừa nói đúng một điều mà anh không hiểu mình đã nói.",
  "i6.cuong.n15": "Rồi ông ta quay sang những người áo đất.",
  "i6.cuong.c4": "Đi.",
  "i6.cuong.o1": "Còn Hùng…",
  "i6.cuong.c5": "Hùng biết đường về.",
  "i6.cuong.n16": "Gã chỉ huy, Hùng, nghiến răng. Rồi gã làm một việc anh không ngờ.",
  "i6.cuong.n17": "Gã giật mạnh người, mặc kệ mũi giáo, mặc kệ rễ cây. Lưỡi giáo rạch một đường dài trên cổ gã, không sâu, nhưng máu chảy ròng ròng.",
  "i6.cuong.n18": "Rễ cây đứt tung. Gã lăn xuống rãnh và biến mất giữa những bó đá Mạch.",
  "i6.cuong.n19": "Khi anh nhìn lên, người đàn ông gầy đã đi rồi. Những người áo đất cũng đi rồi.",
  "i6.cuong.n20": "Rừng nuốt họ vào như nuốt một hòn đá ném xuống ao.",
  "i6.cuong.n21": "Chỉ còn cái khung kim loại. Và một người.",

  /* ---- I-6 §6: Sẻ ---- */
  "i6.se.n1": "Cậu ta nằm dưới chân khung, một chân bị một thanh xà kim loại đè lên.",
  "i6.se.n2": "Có lẽ khung bị xô lệch trong lúc hỗn loạn và đổ xuống đúng lúc cậu ta đang tháo dỡ.",
  "i6.se.n3": "Cậu ta không kêu. Cậu ta nhìn họ.",
  "i6.se.n4": "Mười chín tuổi. Có thể ít hơn. Mặt lấm bùn. Môi mím chặt đến trắng bệch.",
  "i6.se.n5": "Trên cổ áo màu đất có thêu một chữ nhỏ mà anh không đọc được.",
  "i6.se.n6": "Diệp quỳ xuống. Xem chân cậu ta. Xem thanh xà.",
  "i6.se.d1": "Gãy. Không chết được. Nhưng không đi được.",
  "i6.se.n7": "Anh đứng nhìn cậu ta. Một trong những người đã cắt Mạch.",
  "i6.se.n8": "Một trong những người mà vì họ, giếng ở làng cạn, cha anh mất tích, Mộc Giác chết.",
  "i6.se.p1": "Tên?",
  "i6.se.n9": "Cậu ta không trả lời.",
  "i6.se.p2": "Các người là ai?",
  "i6.se.n10": "Không trả lời.",
  "i6.se.p3": "Cha tôi ở đâu?",
  "i6.se.n11": "Cậu ta nhìn anh. Mắt đỏ. Nhưng không khóc. Không nói.",
  "i6.se.n12": "Anh cúi xuống gần hơn.",
  "i6.se.p4": "Mày có biết những gì chúng mày vừa làm không? Mày có biết bao nhiêu người…",
  "i6.se.s1": "Sẻ.",
  "i6.se.n13": "Anh dừng lại.",
  "i6.se.n14": "Cậu ta nói lại, khẽ hơn, như thể đó là thứ duy nhất cậu ta được phép nói.",
  "i6.se.s2": "Tôi tên Sẻ.",

  /* ---- C1 (spec §13) — NEW: the prompt; the options ---- */
  "i6.c1.ask": "Hộ Lâm sẽ theo đường thẳng mà tới. Trước chiều.",
  "i6.c1.think": "Sẻ nằm im dưới thanh xà. Cậu ta biết những gì anh cần biết. Và cậu ta sẽ không nói.",
  "i6.c1.handed": "Giao cậu ta cho Hộ Lâm",
  "i6.c1.released": "Thả cậu ta đi",
  "i6.c1.forced": "Ép cậu ta khai",

  /* ---- C1 handed (prose) ---- */
  "i6.se.handed.p1": "Mang nó về Mộc Thành.", // NEW (one line to voice the choice)
  "i6.se.handed.n1": "Họ dựng một cái cáng bằng giáo của Diệp và cành cây.",

  /* ---- C1 released — NEW ---- */
  "i6.se.released.n1": "Anh nhìn cậu ta rất lâu.",
  "i6.se.released.n2": "Rồi anh cúi xuống, đặt hai tay dưới thanh xà.",
  "i6.se.released.n3": "Diệp nhìn anh. Rồi chị cắm cán giáo xuống dưới thanh xà, bẩy cùng.",
  "i6.se.released.n4": "Thanh xà nhích lên một gang tay. Sẻ lôi chân mình ra. Cậu ta không kêu.",
  "i6.se.released.p1": "Đi đi.",
  "i6.se.released.n5": "Sẻ nhìn anh, như nhìn một cái bẫy chưa sập.",
  "i6.se.released.n6": "Rồi cậu ta lết đi, kéo theo cái chân gãy, xuống rãnh, theo lối Hùng đã đi.",
  "i6.se.released.n7": "Ở mép rãnh, cậu ta dừng lại. Không quay đầu.",
  "i6.se.released.s1": "Tôi nhớ mặt anh.",
  "i6.se.released.n8": "Diệp không nói gì. Chị rút giáo lên, lau bùn trên cán.",

  /* ---- C1 forced — NEW ---- */
  "i6.se.forced.n1": "Anh đặt chân lên thanh xà.",
  "i6.se.forced.n2": "Không mạnh. Chỉ đủ để nó đè xuống thêm một chút.",
  "i6.se.forced.n3": "Sẻ thét lên.",
  "i6.se.forced.d1": "Em…",
  "i6.se.forced.p1": "Các người từ đâu tới?",
  "i6.se.forced.s1": "Tôi không biết… Họ không nói với bọn tôi…",
  "i6.se.forced.n4": "Anh dồn thêm sức xuống chân.",
  "i6.se.forced.s2": "Thiên Kinh! Hạ Thành. Bến kênh thứ ba. Cái nhà treo đèn xanh.",
  "i6.se.forced.p2": "Cha tôi?",
  "i6.se.forced.s3": "Tôi không biết cha anh là ai!",
  "i6.se.forced.n5": "Lần này cậu ta khóc.",
  "i6.se.forced.n6": "Anh nhấc chân ra. Rồi anh ghé vai vào thanh xà, nâng nó lên một gang tay. Cậu ta đã nói. Thế là đủ.",
  "i6.se.forced.n7": "Sẻ lôi chân mình ra. Cậu ta lết đi, xuống rãnh, theo lối Hùng đã đi.",
  "i6.se.forced.n8": "Ở mép rãnh, cậu ta quay lại nhìn anh. Chỉ một lần.",
  "i6.se.forced.n9": "Anh nhớ cái nhìn ấy lâu hơn anh muốn.",
  "i6.se.forced.n10": "Diệp đứng sau lưng anh. Anh không biết chị đã đứng đó bao lâu. Chị không nói gì.",

  /* ---- I-6 §7: the Hộ Lâm find them; the walk back ---- */
  "i6.carry.n1": "Đến chiều, một toán Hộ Lâm tìm thấy họ, theo đường thẳng mà ai cũng thấy được từ trên các tầng cây cao nhất của Mộc Thành.",
  "i6.carry.n2": "Người dẫn toán là ông Bảy. Ông nhìn cái khung kim loại. Nhìn mặt cắt Mạch.",
  "i6.carry.n3": "Rồi nhìn Sẻ trên cáng.",
  "i6.carry.n4": "Gương mặt ông Bảy không thay đổi. Nhưng anh thấy bàn tay ông siết lại trên cán giáo.",
  "i6.carry.w1": "Mang nó về. Lâm Trưởng sẽ quyết.",
  "i6.carry.w2": "Gỡ mấy lưỡi này mang về. Lâm Trưởng sẽ xem.", // NEW (released / forced)
  "i6.carry.n5": "Diệp đi chậm lại, ngang hàng với anh.",
  "i6.carry.d1": "Em biết luật rừng không?",
  "i6.carry.p1": "Luật gì?",
  "i6.carry.d2": "Ai cắt rừng thì bị treo.",
  "i6.carry.n6": "Anh nhìn về phía trước. Sẻ nằm trên cáng, mắt nhắm, nhưng anh biết cậu ta không ngủ.",
  "i6.carry.p2": "Thì đó là luật.",
  "i6.carry.n7": "Diệp không nói gì nữa.",
  "i6.carry.n8": "Anh không quay lại nhìn chị.",
  "i6.carry.n9": "Nếu quay lại, anh sợ mình sẽ thấy gương mặt chị lúc ở lõi rừng, lúc nhìn ánh sáng xanh trong ngực anh.",
  "i6.carry.r1": "Chị không nói gì. Nhưng suốt quãng đường về, chị đi ngang hàng với anh.", // NEW
  "i6.carry.f1": "Diệp đi trước. Suốt quãng đường về, chị không đi chậm lại lần nào.", // NEW

  /* ---- I-7 §8: Ngàn, the evidence, the decision ---- */
  "i7.ngan.n1": "Lâm Trưởng Ngàn nghe báo cáo trong im lặng.",
  // handed — NEW (spec §13: Ngàn applies forest law)
  "i7.ngan.h1": "Đứa kia đang ở tầng dưới.",
  "i7.ngan.h2": "Theo luật.",
  "i7.ngan.h3": "Không ai nói gì thêm.",
  // released — NEW (spec §13: Ngàn is cold)
  "i7.ngan.r1": "Có một đứa bị thương, kẹt dưới khung. Cậu ấy thả nó đi.",
  "i7.ngan.r2": "Ngàn quay lại. Lần đầu tiên từ lúc anh bước vào, bà nhìn thẳng vào anh.",
  "i7.ngan.r3": "Ở Mộc Thành, ai cắt rừng thì bị treo.",
  "i7.ngan.r4": "Cậu không phải người Mộc Thành. Ta nhớ rồi.",
  "i7.ngan.r5": "Bà quay lại tấm bản đồ, như thể anh đã ra khỏi phòng.",
  // forced — NEW (spec §13: the safehouse lead; Diệp saw him hurt a wounded boy)
  "i7.ngan.f1": "Hạ Thành. Bến kênh thứ ba. Cái nhà treo đèn xanh.",
  "i7.ngan.f2": "Ai nói với cậu?",
  "i7.ngan.f3": "Một đứa trong bọn chúng.",
  "i7.ngan.f4": "Nó đâu?",
  "i7.ngan.f5": "Nó nói rồi. Tôi để nó đi.",
  "i7.ngan.f6": "Ngàn không nhìn anh. Bà nhìn Diệp.",
  "i7.ngan.f7": "Diệp nhìn xuống sàn.",
  "i7.ngan.f8": "Luật rừng không đổi mạng lấy tin.",
  "i7.ngan.f9": "Nhưng tin thì ta nhận.",
  // all
  "i7.ngan.n2": "Bà nhìn những mảnh kim loại toán Hộ Lâm mang về từ cái khung. Bà nhìn rất lâu.",
  "i7.ngan.n3": "Rồi bà cho gọi Toản.",
  "i7.ngan.n4": "Ông thợ già bước vào, vẫn cúi đầu như đang lắp một cái chốt vô hình.",
  "i7.ngan.n5": "Ông cầm một mảnh lưỡi kim loại lên. Lật qua lật lại. Gõ nhẹ nó vào cạnh bàn, nghiêng tai nghe.",
  "i7.ngan.n6": "Rồi ông đặt nó xuống.",
  "i7.ngan.t1": "Thép Ty.",
  "i7.ngan.g1": "Chắc không?",
  "i7.ngan.t2": "Ba mươi năm ta ngửi mùi lò rèn của Ty.",
  "i7.ngan.n7": "Ông chỉ vào một vết khắc nhỏ ở chân lưỡi.",
  "i7.ngan.t3": "Dấu lò số bảy. Thiên Kinh. Thứ này không được phép rời khỏi kho của Ty.",
  "i7.ngan.n8": "Ngàn im lặng.",
  "i7.ngan.n9": "Anh nhìn mảnh kim loại. Thiên Kinh.",
  "i7.ngan.n10": "Cái tên nghe xa như mặt trăng.",
  "i7.ngan.g2": "Hộ Lâm không đánh được thứ Thiên Kinh làm ra.",
  "i7.ngan.n11": "Bà đặt tay lên tấm bản đồ, nơi những que đen nhiều hơn bao giờ hết.",
  "i7.ngan.g3": "Thiên Kinh làm ra cái này. Thì để Thiên Kinh trả lời.",
  "i7.ngan.n12": "Bà nhìn anh.",
  "i7.ngan.g4": "Cậu sẽ mang nó tới đó.",
  "i7.ngan.n13": "Không phải câu hỏi.",
  "i7.ngan.n14": "Anh gật đầu.",
  "i7.ngan.n15": "Lần đầu tiên từ buổi sáng cái giếng cạn, anh thấy mọi thứ rõ ràng.",
  "i7.ngan.n16": "Có kẻ đã cắt Mạch. Kẻ đó dùng thép của Thiên Kinh. Thiên Kinh có Ty. Ty là nơi giữ Mạch cho cả Cửu Vực.",
  "i7.ngan.n17": "Chỉ cần anh mang bằng chứng tới, người ta sẽ phải làm gì đó.",
  "i7.ngan.n18": "Phải vậy.",
  "i7.ngan.g5": "Diệp.",
  "i7.ngan.n19": "Diệp bước lên.",
  "i7.ngan.g6": "Ba ngày nghỉ của cô hết từ hôm qua.",
  "i7.ngan.d1": "Vâng.",
  "i7.ngan.g7": "Ta cho cô thêm.",
  "i7.ngan.n20": "Ngàn quay lại tấm bản đồ.",
  "i7.ngan.g8": "Bao lâu thì ta không biết. Đến khi nào cậu ta về.",

  /* ---- I-7 §9: Toản at the foot of the stairs ---- */
  "i7.toan.n1": "Toản đợi anh ở chân cầu thang.",
  "i7.toan.n2": "Ông dúi vào tay anh một thứ: một cái móc sắt ba chấu, buộc vào một cuộn dây mảnh, dai, cuộn tròn gọn gàng.",
  "i7.toan.t1": "Thiên Kinh nhiều mái nhà hơn cây.",
  "i7.toan.t2": "Ở đó, ai đứng dưới đất thì chỉ thấy được những gì người ta muốn cho thấy.",
  "i7.toan.p1": "Sao ông giúp cháu?",
  "i7.toan.n3": "Toản nhún vai.",
  "i7.toan.t3": "Ta từng làm thép cho Ty ba mươi năm.",
  "i7.toan.n4": "Ông nhìn mảnh lưỡi kim loại vẫn nằm trên bàn của Lâm Trưởng, ở tầng trên.",
  "i7.toan.t4": "Có lẽ ta muốn biết thép của ta đã cắt những gì.",

  /* ---- I-7 §10: the night ---- */
  "i7.night.n1": "Đêm đó, anh không ngủ được.",
  // handed (prose)
  "i7.night.h1": "Gần sáng, anh nghe tiếng bước chân trên những tầng cây phía dưới. Nhiều người. Chậm. Không ai nói gì.",
  "i7.night.h2": "Rồi im lặng.",
  "i7.night.h3": "Một lúc lâu.",
  "i7.night.h4": "Rồi lại có tiếng bước chân. Lần này đi ngược lại. Vẫn không ai nói gì.",
  "i7.night.h5": "Anh ngồi dậy.",
  "i7.night.door": "Diệp đứng ở cửa phòng. Chị chưa ngủ. Áo khoác Hộ Lâm vẫn mặc nguyên. Chị không bước vào.",
  "i7.night.hd1": "Sẻ.",
  "i7.night.h6": "Anh biết. Anh đã biết từ lúc nghe tiếng bước chân.",
  "i7.night.h7": "Anh đã biết từ lúc nói “thì đó là luật”.",
  "i7.night.hp1": "Nó cắt Mạch.",
  "i7.night.h8": "Giọng anh nghe vững hơn anh tưởng.",
  "i7.night.hp2": "Nó cắt Mạch, chị. Mộc Giác chết vì nó. Cái giếng ở làng cạn vì nó. Cha…",
  "i7.night.hd2": "Nó mười chín tuổi.",
  "i7.night.h9": "Chỉ thế. Rồi chị quay đi.",
  "i7.night.dawn": "Anh ngồi đó cho đến khi trời sáng hẳn.",
  // released — NEW
  "i7.night.r1": "Gần sáng, có tiếng gõ khẽ vào khung cửa.",
  "i7.night.r2": "Chị đặt xuống bậc cửa một bát cháo còn ấm. Rồi chị đi. Không nói gì.",
  "i7.night.r3": "Anh ăn hết bát cháo. Nó vẫn còn ấm.",
  // forced — NEW
  "i7.night.f1": "Mỗi lần nhắm mắt, anh lại nghe tiếng Sẻ thét dưới chân khung kim loại.",
  "i7.night.f2": "Phòng Diệp ở ngay bên kia vách. Cả đêm anh không nghe chị trở mình. Chị cũng không ngủ.",
  "i7.night.f3": "Chị không đến.",
  // all
  "i7.night.n2": "Trong ngực anh, thứ mới đến khẽ động đậy, như một con vật nhỏ đang tìm tư thế nằm.",
  "i7.night.n3": "Anh đặt tay lên đó.",
  "i7.night.h10": "Anh nghĩ: Mình đúng.",
  "i7.night.h11": "Anh nghĩ lại lần nữa, chậm hơn: Mình đúng.",
  "i7.night.r4": "Anh nghĩ đến Sẻ, lết xuống rãnh với cái chân gãy.", // NEW
  "i7.night.r5": "Anh nghĩ: Kẻ đáng treo không phải nó.", // NEW
  "i7.night.r6": "Anh nghĩ lại lần nữa, chậm hơn: Kẻ đáng treo là kẻ đã sai nó tới.", // NEW
  "i7.night.f4": "Anh nghĩ: Mình cần biết.", // NEW
  "i7.night.f5": "Anh nghĩ lại lần nữa, chậm hơn: Mình cần biết.", // NEW
  "i7.night.n4": "Đến lần thứ ba, anh không nghĩ nữa.",
  "i7.night.n5kiem": "Anh đứng dậy, buộc kiếm, buộc dao phát, đeo túi của cha, siết lại sợi chỉ đỏ trên cổ tay.",
  "i7.night.n5": "Anh đứng dậy, buộc dao phát, đeo túi của cha, siết lại sợi chỉ đỏ trên cổ tay.", // other classes: their weapon is not a sword
  "i7.night.n6": "Và đi về phía Thiên Kinh.",
} as const;

const P = "who.player", D = "who.diep", G = "who.ngan", T = "who.toan", C = "who.cuong", S = "who.se", W = "who.warden", O = "who.operative";
const HANDED = { flag: "CH1_SE_FATE", is: "handed" }, RELEASED = { flag: "CH1_SE_FATE", is: "released" }, FORCED = { flag: "CH1_SE_FATE", is: "forced" };
const TOLD = { flag: "PRO_VILLAGE_TOLD", is: true }, KEPT = { flag: "PRO_VILLAGE_TOLD", is: false };
const SPARED = { flag: "PRO_SOW_SPARED", is: true }, KILLED = { flag: "PRO_SOW_SPARED", is: false };
const KIEM = { flag: "CH1_CLASS", is: "kiem" }, ANH = { flag: "CH1_CLASS", is: "anh" }, LINH = { flag: "CH1_CLASS", is: "linh" }, CO = { flag: "CH1_CLASS", is: "co" };

/** Scenes: each is an ordered list of steps. */
export const SCENES: Record<string, object[]> = {
  /* ============================== I-6 Vết Cắt ============================== */

  /**
   * Stage entry, on the walk from the grove. Hero + Diệp, apart, a strip of dead ground between them.
   * Prop: the straight line of dead trees / split rocks / dry stream running the length of the stage.
   */
  "i6.road": [
    { say: "i6.road.n1" }, { say: "i6.road.n2" }, { say: "i6.road.n3" },
    { say: "i6.road.n4" }, { say: "i6.road.n5" },
    { say: "i6.road.n6" },
    { say: "i6.road.n7" }, { pulse: 1 },
    // STAGING: roots on both sides of the dead line lean toward him
    { say: "i6.road.n8" },
    { say: "i6.road.n9" },
  ],

  /**
   * Prose §1. Near the end of the dead line, before the Cut is on screen. Hero + Diệp. Prop: a fallen trunk for cover.
   */
  "i6.open": [
    { sfx: "board" }, // the hammering (metal on metal, slow, even), heard before anything is seen
    { say: "i6.open.n1" }, { say: "i6.open.n2" },
    { say: "i6.open.n3" },
    { pose: "diep", clip: "kneel" }, { pose: "player", clip: "kneel" },
    // STAGING: camera reveals the trench: a long straight cut in the ground, the Mạch bundle exposed in its walls
    { say: "i6.open.n4" }, { say: "i6.open.n5" },
    { say: "i6.open.n6" }, { say: "i6.open.n7" },
    { wait: 600 },
    { say: "i6.open.n8" },
    { say: "i6.open.n9" },
  ],

  /**
   * Prose §1 (cont.): spec I-6 "the node has been cleanly severed: the Mạch was cut deliberately".
   * Hero + Diệp in cover. Props: the severed Mạch bundle (west face faint green, east face dark); the cutting frame
   * (silver-grey, gate-sized, rows of thin blades in sliding grooves, chained down); ~20 operatives dismantling it.
   */
  "i6.cut": [
    { say: "i6.cut.n1" },
    { wait: 500 },
    { say: "i6.cut.n2" },
    { say: "i6.cut.n3" },
    { mark: "machCut" },
    { say: "i6.cut.n4" }, { say: "i6.cut.n5" }, { say: "i6.cut.n6" },
    { say: "i6.cut.n7" },
    { say: "i6.cut.n8" },
    { wait: 400 },
    { say: "i6.cut.n9" }, // the boot prints of I-3
  ],

  /**
   * Prose §2. Still in cover. Hero + Diệp. A guard stands above the trench (prop/NPC). Memory lines branch on Prologue
   * C1/C2: ông Dần's broken leg is the "kept" Prologue; the Tư husband is I-3 "told" (spec §12 beat 2); Lộc gored is
   * the spared sow, the dead litter the killed one (spec §14).
   */
  "i6.watch": [
    { say: "i6.watch.d1", who: D },
    { say: "i6.watch.n1" },
    { say: "i6.watch.n2" },
    { say: "i6.watch.n3" },
    { say: "i6.watch.n4" },
    { say: "i6.watch.n5kept", when: KEPT },
    { say: "i6.watch.n5told", when: TOLD },
    { say: "i6.watch.n6spared", when: SPARED },
    { say: "i6.watch.n6killed", when: KILLED },
    { say: "i6.watch.n7" },
    { say: "i6.watch.n8" },
    { say: "i6.watch.n9" },
    { say: "i6.watch.n10" },
    { say: "i6.watch.d2", who: D },
    { pose: "player", clip: "idle" },
    { say: "i6.watch.n11" },
  ],

  /**
   * Prose §3, up to the fighting. The operatives form a three-man point; the rest keep dismantling, faster.
   */
  "i6.fight": [
    { say: "i6.fight.n1" }, { say: "i6.fight.n2" },
    // STAGING: the nearest operative drops a wrench, draws a short blade, steps back; two close in at his sides
    { say: "i6.fight.n3" }, { say: "i6.fight.n4" },
    { say: "i6.fight.n5" },
    { say: "i6.fight.n6" },
    // STAGING: (the gauntlet) operatives in disciplined pairs/threes, nets; they break off and run at 30%
  ],
  /** Optional, once: the first Rễ Giữ bind in this stage (prose §3). Short enough to play over a hit-stop. */
  "i6.roots": [
    { pulse: 1 },
    { say: "i6.roots.n1" },
    { sfx: "roots" },
    { say: "i6.roots.n2" }, { say: "i6.roots.n3" },
    { say: "i6.roots.n4" },
  ],
  /** Optional bark: the first thrown net. */
  "i6.net": [{ say: "i6.net.o1", who: O }],
  /** After the gauntlet, before Hùng steps up. Hero + Diệp. */
  "i6.fight.end": [
    { say: "i6.fight.end.n1" },
    { say: "i6.fight.end.n2" },
    { say: "i6.fight.end.n3" },
  ],

  /**
   * Prose §4. Hùng: broad-shouldered, burn-scarred face, a long Ty-alloy blade (same silver-grey as the frame).
   * He has watched the gauntlet. Then the duel.
   */
  "i6.hung": [
    { say: "i6.hung.n1" },
    { say: "i6.hung.n2" },
    { say: "i6.hung.n3" },
    { wait: 500 },
    { say: "i6.hung.n4" },
    // STAGING: (the duel) Hùng reads parries: feint, kick through a block, lunge and net at range
  ],
  /**
   * Optional, once, mid-duel (e.g. after Hùng's feint lands twice): the counter hint. Prose §4. The mentor he did not
   * learn this from depends on the class; the line itself is Toản's (prose Ch. 4).
   */
  "i6.hung.read": [
    { say: "i6.hung.read.n1" }, { say: "i6.hung.read.n2" },
    { say: "i6.hung.read.n3" },
    { say: "i6.hung.read.n4kiem", when: KIEM },
    { say: "i6.hung.read.n4anh", when: ANH },
    { say: "i6.hung.read.n4linh", when: LINH },
    { say: "i6.hung.read.n4co", when: CO },
    { say: "i6.hung.read.n5" },
  ],
  /**
   * Hùng beaten: roots round his waist, Diệp's spear at his throat, he drops the blade. He does NOT escape here: in the
   * prose he breaks free during Cương's scene, after "Hùng biết đường về" (see i6.cuong).
   */
  "i6.hung.after": [
    // STAGING: Hùng down on one knee, roots binding his waist; Diệp's spear at his neck
    { pose: "hung", clip: "kneel" },
    { say: "i6.hung.after.n1" }, { sfx: "roots" },
    { pose: "diep", clip: "guard" },
    { say: "i6.hung.after.n2" },
    { say: "i6.hung.after.d1", who: D },
    { say: "i6.hung.after.n3" },
    { say: "i6.hung.after.n4" }, // STAGING: Hùng's blade on the ground
  ],

  /**
   * Prose §5, spec §12 beat 4. Cương (unnamed: "Người đàn ông") steps out from behind the frame; the operatives stop.
   * Present: hero, Diệp (spear at Hùng's neck), Hùng (held), Cương, the remaining operatives. Prop: the Father's third
   * rod (notch at the tail) in the hero's hand. Hùng's escape into the trench happens here, as in the prose.
   */
  "i6.cuong": [
    { say: "i6.cuong.c1", who: C },
    { say: "i6.cuong.n1" },
    // STAGING: Cương walks out from behind the frame
    { say: "i6.cuong.n2" },
    { say: "i6.cuong.n3" },
    { say: "i6.cuong.n4" },
    { say: "i6.cuong.n5" },
    { face: "cuong", dir: -1 }, // toward the hero
    { say: "i6.cuong.n6" },
    { say: "i6.cuong.c2", who: C },
    { say: "i6.cuong.n7" },
    // STAGING: the rod appears in his raised hand
    { say: "i6.cuong.n8" },
    { say: "i6.cuong.n9" },
    { say: "i6.cuong.p1", who: P },
    { say: "i6.cuong.n10" },
    { wait: 1000 },
    { say: "i6.cuong.n11" },
    { say: "i6.cuong.n12" },
    { say: "i6.cuong.c3", who: C },
    { say: "i6.cuong.n13" },
    { say: "i6.cuong.p2", who: P },
    { say: "i6.cuong.n14" },
    { face: "cuong", dir: 1 }, // away, to his people
    { say: "i6.cuong.n15" },
    { say: "i6.cuong.c4", who: C },
    { say: "i6.cuong.o1", who: O },
    { say: "i6.cuong.c5", who: C },
    { say: "i6.cuong.n16" },
    // STAGING: Hùng wrenches free (blood at the neck), the roots snap, he rolls into the trench and is gone
    { sfx: "crash" },
    { say: "i6.cuong.n17" },
    { say: "i6.cuong.n18" },
    // STAGING: while the camera is on the trench, Cương and the operatives leave; when it returns, only the frame
    { pose: "diep", clip: "idle" },
    { say: "i6.cuong.n19" },
    { say: "i6.cuong.n20" },
    { wait: 700 },
    { say: "i6.cuong.n21" },
    { mark: "cuongGone" },
  ],

  /**
   * Prose §6, spec §13. Sẻ (about 19, mud on his face, a small embroidered character on his collar) pinned by one leg
   * under a fallen metal crossbeam at the foot of the frame. Hero + Diệp. Then choice C1.
   */
  "i6.se": [
    { pose: "se", clip: "lie" },
    { say: "i6.se.n1" }, { say: "i6.se.n2" },
    { say: "i6.se.n3" },
    { say: "i6.se.n4" }, { say: "i6.se.n5" },
    { pose: "diep", clip: "kneel" },
    { say: "i6.se.n6" },
    { say: "i6.se.d1", who: D },
    { say: "i6.se.n7" }, { say: "i6.se.n8" },
    { say: "i6.se.p1", who: P }, { say: "i6.se.n9" },
    { say: "i6.se.p2", who: P }, { say: "i6.se.n10" },
    { say: "i6.se.p3", who: P }, { say: "i6.se.n11" },
    { pose: "player", clip: "kneel" },
    { say: "i6.se.n12" },
    { say: "i6.se.p4", who: P },
    { say: "i6.se.s1", who: S },
    { say: "i6.se.n13" },
    { say: "i6.se.n14" },
    { say: "i6.se.s2", who: S },
    { wait: 800 },
    { pose: "player", clip: "idle" }, { pose: "diep", clip: "idle" },
    { choose: "ch1.c1", then: { handed: "i6.se.handed", released: "i6.se.released", forced: "i6.se.forced" } },
  ],
  /** C1 handed (prose). Spec §13: Hộ Lâm standing rises. Then i6.carry. */
  "i6.se.handed": [
    { flag: "CH1_HOLAM_STANDING", value: 1 },
    { say: "i6.se.handed.p1", who: P },
    // STAGING: the beam is lifted; a stretcher of Diệp's spear and branches; Sẻ on it
    { say: "i6.se.handed.n1" },
  ],
  /**
   * C1 released (NEW). Spec §13: "Diệp says nothing, but she approves." Hộ Lâm standing drops (Diệp reports it, I-7).
   * Sẻ crawls into the trench the way Hùng went; his "Tôi nhớ mặt anh" sets up the Ch. V rescue.
   */
  "i6.se.released": [
    { flag: "CH1_HOLAM_STANDING", value: -1 },
    { say: "i6.se.released.n1" },
    { wait: 600 },
    { pose: "player", clip: "kneel" },
    { say: "i6.se.released.n2" },
    { say: "i6.se.released.n3" },
    { sfx: "crash" },
    { say: "i6.se.released.n4" },
    { pose: "player", clip: "idle" },
    { say: "i6.se.released.p1", who: P },
    { say: "i6.se.released.n5" },
    // STAGING: Sẻ drags himself to the trench edge, stops there with his back to them
    { say: "i6.se.released.n6" },
    { say: "i6.se.released.n7" },
    { say: "i6.se.released.s1", who: S },
    // STAGING: Sẻ drops into the trench, gone
    { say: "i6.se.released.n8" },
  ],
  /**
   * C1 forced (NEW). Spec §13: the Thiên Kinh safehouse (Ch. II: Hạ Thành, along the canals); Diệp sees him hurt a
   * wounded boy; Sẻ survives and hates him. He lifts the beam himself, a trade, not a mercy. Standing unchanged.
   */
  "i6.se.forced": [
    { flag: "CH1_HOLAM_STANDING", value: 0 },
    { say: "i6.se.forced.n1" }, // STAGING: his foot on the beam
    { say: "i6.se.forced.n2" },
    { sfx: "crash" },
    { say: "i6.se.forced.n3" },
    { say: "i6.se.forced.d1", who: D },
    { say: "i6.se.forced.p1", who: P },
    { say: "i6.se.forced.s1", who: S },
    { say: "i6.se.forced.n4" },
    { say: "i6.se.forced.s2", who: S },
    { say: "i6.se.forced.p2", who: P },
    { say: "i6.se.forced.s3", who: S },
    { say: "i6.se.forced.n5" },
    { wait: 600 },
    { say: "i6.se.forced.n6" },
    // STAGING: Sẻ drags himself to the trench; at the edge he looks back once; gone
    { say: "i6.se.forced.n7" },
    { face: "se", dir: -1 },
    { say: "i6.se.forced.n8" },
    { say: "i6.se.forced.n9" },
    { face: "player", dir: -1 }, // Diệp is behind him
    { say: "i6.se.forced.n10" },
  ],

  /**
   * Prose §7: by afternoon a Hộ Lâm squad (ông Bảy, `warden`, + 2–3 wardens) finds them at the frame. Then the walk
   * back. handed: Sẻ on the stretcher, the forest-law exchange. released: Diệp walks beside him. forced: ahead of him.
   */
  "i6.carry": [
    // STAGING: Bảy's squad arrives along the dead line
    { say: "i6.carry.n1" },
    { say: "i6.carry.n2" },
    { say: "i6.carry.n3", when: HANDED },
    { say: "i6.carry.n4", when: HANDED },
    { say: "i6.carry.w1", who: W, when: HANDED },
    { say: "i6.carry.w2", who: W, when: RELEASED },
    { say: "i6.carry.w2", who: W, when: FORCED },
    // STAGING: the walk back; wardens carry the frame's blades (and, handed, Sẻ's stretcher)
    { say: "i6.carry.n5", when: HANDED },
    { say: "i6.carry.d1", who: D, when: HANDED },
    { say: "i6.carry.p1", who: P, when: HANDED },
    { say: "i6.carry.d2", who: D, when: HANDED },
    { say: "i6.carry.n6", when: HANDED },
    { say: "i6.carry.p2", who: P, when: HANDED },
    { say: "i6.carry.n7", when: HANDED },
    { say: "i6.carry.n8", when: HANDED },
    { say: "i6.carry.n9", when: HANDED },
    { say: "i6.carry.n5", when: RELEASED },
    { say: "i6.carry.r1", when: RELEASED },
    { say: "i6.carry.f1", when: FORCED },
    { mark: "i6done" },
  ],

  /* ============================== I-7 Về Mộc Thành ============================== */

  /**
   * Prose §8, spec I-7 and §12 beat 5. Ngàn's room in Mộc Thành: the hide map of Thanh Mộc with its bamboo pins
   * (more black ones than ever), a table with the frame's blade fragments (the evidence). Present: hero, Diệp, Ngàn,
   * Bảy (`warden`, handed branch only speaks), then Toản (called in). Branch lines first, by CH1_SE_FATE.
   */
  "i7.ngan": [
    { say: "i7.ngan.n1" },
    // handed: forest law (spec §13); the hanging itself is off-screen, at dawn (i7.night)
    { say: "i7.ngan.h1", who: W, when: HANDED },
    { say: "i7.ngan.h2", who: G, when: HANDED },
    { wait: 600, when: HANDED },
    { say: "i7.ngan.h3", when: HANDED },
    // released: Diệp reports it plainly; Ngàn is cold
    { say: "i7.ngan.r1", who: D, when: RELEASED },
    { face: "ngan", dir: -1, when: RELEASED },
    { say: "i7.ngan.r2", when: RELEASED },
    { say: "i7.ngan.r3", who: G, when: RELEASED },
    { say: "i7.ngan.r4", who: G, when: RELEASED },
    { face: "ngan", dir: 1, when: RELEASED },
    { say: "i7.ngan.r5", when: RELEASED },
    // forced: he reports the lead; Ngàn looks at Diệp, not at him
    { say: "i7.ngan.f1", who: P, when: FORCED },
    { say: "i7.ngan.f2", who: G, when: FORCED },
    { say: "i7.ngan.f3", who: P, when: FORCED },
    { say: "i7.ngan.f4", who: G, when: FORCED },
    { say: "i7.ngan.f5", who: P, when: FORCED },
    { say: "i7.ngan.f6", when: FORCED },
    { say: "i7.ngan.f7", when: FORCED },
    { say: "i7.ngan.f8", who: G, when: FORCED },
    { say: "i7.ngan.f9", who: G, when: FORCED },
    // all: the evidence
    { say: "i7.ngan.n2" },
    { say: "i7.ngan.n3" },
    // STAGING: Toản comes in
    { say: "i7.ngan.n4" },
    { say: "i7.ngan.n5" },
    { say: "i7.ngan.n6" },
    { say: "i7.ngan.t1", who: T },
    { say: "i7.ngan.g1", who: G },
    { say: "i7.ngan.t2", who: T },
    { say: "i7.ngan.n7" },
    { say: "i7.ngan.t3", who: T },
    { say: "i7.ngan.n8" },
    { wait: 600 },
    { say: "i7.ngan.n9" },
    { say: "i7.ngan.n10" },
    { say: "i7.ngan.g2", who: G },
    { say: "i7.ngan.n11" },
    { say: "i7.ngan.g3", who: G },
    { face: "ngan", dir: -1 },
    { say: "i7.ngan.n12" },
    { say: "i7.ngan.g4", who: G },
    { say: "i7.ngan.n13" },
    { say: "i7.ngan.n14" },
    { say: "i7.ngan.n15" },
    { say: "i7.ngan.n16" },
    { say: "i7.ngan.n17" },
    { say: "i7.ngan.n18" },
    { mark: "evidence" },
    { say: "i7.ngan.g5", who: G },
    { say: "i7.ngan.n19" },
    { say: "i7.ngan.g6", who: G },
    { say: "i7.ngan.d1", who: D },
    { say: "i7.ngan.g7", who: G },
    { face: "ngan", dir: 1 },
    { say: "i7.ngan.n20" },
    { say: "i7.ngan.g8", who: G },
  ],

  /**
   * Prose §9, spec §10: Toản's parting gift, the Móc Câu (three-pronged iron hook on a coil of thin tough line).
   * The foot of the stairs below Ngàn's room. Hero + Toản.
   */
  "i7.toan": [
    { say: "i7.toan.n1" },
    { say: "i7.toan.n2" },
    // STAGING: item Móc Câu (grappling hook) into the save; usable from Ch. II
    { say: "i7.toan.t1", who: T },
    { say: "i7.toan.t2", who: T },
    { say: "i7.toan.p1", who: P },
    { say: "i7.toan.n3" },
    { say: "i7.toan.t3", who: T },
    { say: "i7.toan.n4" },
    { say: "i7.toan.t4", who: T },
  ],

  /**
   * Prose §10, the last scene of the chapter. His room in Mộc Thành, night to dawn. Hero; Diệp at the door (handed,
   * released). handed: the prose (the footsteps below at dawn: the hanging, off-screen). released / forced: NEW.
   * Then he leaves for Thiên Kinh.
   */
  "i7.night": [
    { pose: "player", clip: "kneel" }, // sitting up, awake
    { say: "i7.night.n1" },
    // handed
    { say: "i7.night.h1", when: HANDED },
    { say: "i7.night.h2", when: HANDED },
    { wait: 1200, when: HANDED },
    { say: "i7.night.h3", when: HANDED },
    { say: "i7.night.h4", when: HANDED },
    { say: "i7.night.h5", when: HANDED },
    // STAGING: Diệp at the door (handed, released), coat still on; she does not come in
    { say: "i7.night.door", when: HANDED },
    { say: "i7.night.hd1", who: D, when: HANDED },
    { say: "i7.night.h6", when: HANDED },
    { say: "i7.night.h7", when: HANDED },
    { say: "i7.night.hp1", who: P, when: HANDED },
    { say: "i7.night.h8", when: HANDED },
    { say: "i7.night.hp2", who: P, when: HANDED },
    { say: "i7.night.hd2", who: D, when: HANDED },
    { say: "i7.night.h9", when: HANDED },
    // STAGING: Diệp leaves (handed, released)
    { say: "i7.night.dawn", when: HANDED },
    // released
    { say: "i7.night.r1", when: RELEASED },
    { say: "i7.night.door", when: RELEASED },
    { say: "i7.night.r2", when: RELEASED },
    { say: "i7.night.r3", when: RELEASED },
    // forced
    { say: "i7.night.f1", when: FORCED },
    { say: "i7.night.f2", when: FORCED },
    { say: "i7.night.f3", when: FORCED },
    { say: "i7.night.dawn", when: FORCED },
    // all
    { pulse: 1 },
    { say: "i7.night.n2" },
    { say: "i7.night.n3" },
    { say: "i7.night.h10", when: HANDED },
    { say: "i7.night.h11", when: HANDED },
    { say: "i7.night.r4", when: RELEASED },
    { say: "i7.night.r5", when: RELEASED },
    { say: "i7.night.r6", when: RELEASED },
    { say: "i7.night.f4", when: FORCED },
    { say: "i7.night.f5", when: FORCED },
    { wait: 800 },
    { say: "i7.night.n4" },
    { pose: "player", clip: "idle" },
    { say: "i7.night.n5kiem", when: KIEM },
    { say: "i7.night.n5", when: ANH },
    { say: "i7.night.n5", when: LINH },
    { say: "i7.night.n5", when: CO },
    { say: "i7.night.n6" },
    // STAGING: end of Chapter I; into Ch. II
  ],
};

/** Choices. */
export const SCRIPTS: Record<string, object> = {
  /**
   * Ch. I C1 (spec §13): Sẻ, the one left behind. Axes: forgiveness vs punishment, trust vs control (low–medium).
   * The prompt lines are NEW (the prose has no choice point).
   */
  "ch1.c1": {
    id: "ch1.c1",
    lines: [{ who: "who.diep", text: "i6.c1.ask" }, { text: "i6.c1.think" }],
    options: [
      { text: "i6.c1.handed", outcome: "handed", flags: { CH1_SE_FATE: "handed" } },
      { text: "i6.c1.released", outcome: "released", flags: { CH1_SE_FATE: "released" } },
      { text: "i6.c1.forced", outcome: "forced", flags: { CH1_SE_FATE: "forced" } },
    ],
  },
};
