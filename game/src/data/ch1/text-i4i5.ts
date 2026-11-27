/** Ch. I scene text for Rừng Sâu and Mộc Giác: prose Ch. 5 "Mộc Giác" → spec stages I-4 (Độc Đằng) and I-5 (the absorption). */
//
// Notes against the prose (story/drafts/chapter-05-moc-giac.md, written on the Kiếm Khách branch):
// - Lines that name the sword, a parry or Lão Trụ have an Ảnh Vệ twin (twin blades, dodging, Én's teaching from
//   prose Ch. 4: "Sức mạnh là không ở chỗ đòn đánh rơi xuống." / "Thì đánh sau. Khi nó hụt."). The pair is gated on
//   CH1_CLASS "kiem" / "anh"; with the class unset neither plays.
// - Làng Khê is optional (spec §4), so the two prose lines that assume it ("Lần đầu tiên từ Làng Khê", "trước bảy
//   vạch khắc trên khung cửa") are gated on CH1_KHE_VISITED, with a new line for the unvisited branch.
// - The prose says the roots parted "như đêm hôm ấy trên con đường tới trạm"; in prose Ch. 2 and the Prologue (S8)
//   that happened in the morning, so the line says "buổi sáng hôm ấy".
export const STRINGS = {
  /* ---- I-4 Rừng Sâu ---- */
  "i4.open.n1": "Rừng sâu không có buổi sáng.",
  "i4.open.n2": "Chỉ có lúc tối hơn và lúc bớt tối.",
  "i4.open.n3": "Họ đi trong lúc bớt tối. Diệp đi trước, giáo cầm ngang, mũi giáo thỉnh thoảng gạt một tấm màng nhện to bằng cái nong.",
  "i4.open.n4k": "Anh đi sau, tay đặt trên chuôi kiếm, cố nhớ Lão Trụ dặn gì.",
  "i4.open.n4a": "Anh đi sau, tay đặt trên hai chuôi dao, cố nhớ Én dặn gì.",
  "i4.open.n5k": "Đừng nắm chặt. Nắm chặt là đã quyết định trước rồi.",
  "i4.open.n5a": "Đừng đứng chờ. Đứng chờ là đã chọn chỗ cho đòn đánh rơi xuống rồi.",
  "i4.open.n6k": "Anh nới tay ra. Rồi lại nắm chặt.",
  "i4.open.n6a": "Anh nhún gối. Rồi lại đứng thẳng đơ.",
  "i4.open.n7": "Ở đây cây không còn xanh nữa. Lá vẫn còn trên cành, nhưng là thứ màu xám ngả nâu, như lá đã chết từ lâu mà quên rụng.",
  "i4.open.n8": "Thân cây chằng chịt những đường gân đen, nổi lên dưới lớp vỏ như mạch máu trên mu bàn tay người già.",
  "i4.open.n9": "Và có sương.",
  "i4.open.n10": "Không phải sương trắng của buổi sớm ở An Mộc. Sương vàng.",
  "i4.open.n11": "Nó nằm sát mặt đất, dày đến đầu gối, có mùi ngọt như mật ong để lâu.",
  "i4.open.n12": "Diệp xé một mảnh vải, nhúng vào bình nước, buộc ngang mũi miệng. Rồi xé thêm một mảnh, ném cho anh.",
  "i4.open.d1": "Đừng hít sâu.",
  "i4.open.p1": "Nếu hít sâu thì sao?",
  "i4.open.d2": "Thì chị phải cõng em về. Mà em nặng.",

  "i4.roots.n1": "Rễ chặn đường ở khắp nơi.",
  "i4.roots.n2": "Không giống bức tường rễ ở An Mộc. Ở đây chúng không mọc ngang lối đi. Lối đi đã biến mất từ lâu.",
  "i4.roots.n3": "Chúng mọc thành rừng, đan vào nhau từ đất lên tới tán lá, thành những vách tường xoắn xuýt mà ánh sáng cũng không lọt qua.",
  "i4.roots.n4": "Diệp dừng lại trước bức vách đầu tiên. Chị rút con dao ngắn bên hông, ước lượng.",
  "i4.roots.d1": "Phải chặt cả buổi.",
  "i4.roots.n5": "Anh đứng sau chị.",
  "i4.roots.n6": "Trong áo, vật cháy đen bắt đầu ấm lên.",
  "i4.roots.n7": "Anh biết nếu anh bước tới, chuyện gì sẽ xảy ra.",
  "i4.roots.n8": "Anh cũng biết Diệp đang đứng ngay đó.",
  "i4.roots.p1": "Để em thử.",
  "i4.roots.n9": "Anh bước lên trước, chìa tay ra như thể định đẩy.",
  "i4.roots.n10": "Những sợi rễ gần nhất khựng lại.",
  "i4.roots.n11": "Rồi tách ra.",
  "i4.roots.n12": "Chậm rãi. Lặng lẽ. Như buổi sáng hôm ấy trên con đường tới trạm.",
  "i4.roots.n13": "Một lối đi mở ra, vừa đủ cho một người.",
  "i4.roots.n14": "Diệp không nói gì.",
  "i4.roots.n15": "Anh không quay lại nhìn chị.",
  "i4.roots.p2": "Chắc chúng quen người An Mộc.",
  "i4.roots.n16": "Một lúc lâu sau, anh mới nghe thấy tiếng chân chị bước theo.",

  "i4.docDang.n1": "Thứ đầu tiên muốn giết họ không phải thú.",
  "i4.docDang.n2": "Là một bụi dây leo.",
  "i4.docDang.n3": "Nó treo lơ lửng giữa hai thân cây lớn, rủ xuống như một tấm rèm xanh thẫm. Đẹp. Gần như đẹp.",
  "i4.docDang.n4": "Cho đến khi anh nhìn kỹ thì thấy giữa những sợi dây là xương. Xương chim. Xương khỉ. Một cái sọ hươu còn nguyên cặp sừng.",
  "i4.docDang.n5": "Rồi tấm rèm cử động.",
  "i4.docDang.n6": "Nó không rủ xuống từ cây. Nó là thứ đang ôm lấy cây.",
  "i4.docDang.n7": "Một khối dây leo khổng lồ, cuộn tròn, cao gấp ba người, mà hai thân cây chỉ là chỗ nó tựa lưng.",
  "i4.docDang.n8": "Những túi bào tử vàng phồng lên khắp thân nó.",
  "i4.docDang.n9": "Rồi vỡ. Sương vàng phụt ra, dày đặc.",
  "i4.docDang.d1": "Lùi lại!",

  "i4.docDang.a1": "Hai người không cần nói với nhau một lời nào.",
  "i4.docDang.a2k": "Anh đỡ. Chị đâm. Anh đỡ. Chị đâm.",
  "i4.docDang.a2a": "Anh né. Chị đâm. Anh né. Chị đâm.",
  "i4.docDang.a3": "Như hồi nhỏ, ở bờ suối An Mộc. Anh kéo lưới, chị cầm xiên.",
  "i4.docDang.a4": "Khi khối dây leo cuối cùng cũng sụp xuống, cả hai đều thở dốc, mặt vàng khè bào tử.",
  "i4.docDang.a5": "Diệp lấy một nắm lá giải độc trong túi, nhét vào tay anh.",
  "i4.docDang.d2": "Nhai.",
  "i4.docDang.a6": "Đắng. Đắng đến mức chảy nước mắt.",
  "i4.docDang.p1": "Chị ơi.",
  "i4.docDang.d3": "Gì?",
  "i4.docDang.p2k": "Lão Trụ nói đúng.",
  "i4.docDang.d4k": "Lão Trụ nói gì?",
  "i4.docDang.p3k": "Đỡ là quyết định đòn đánh kết thúc ở đâu.",
  "i4.docDang.p2a": "Én nói đúng.",
  "i4.docDang.d4a": "Én nói gì?",
  "i4.docDang.p3a": "Không ở chỗ đòn đánh rơi xuống.",
  "i4.docDang.a7": "Diệp nhìn anh. Nhìn đống dây leo đang rỉ nhựa.",
  "i4.docDang.d5k": "Thế lần đầu em đỡ, đòn đánh kết thúc ở đâu?",
  "i4.docDang.p4k": "Ở cái cây sau lưng em.",
  "i4.docDang.d5a": "Thế lần đầu em né, đòn đánh rơi xuống đâu?",
  "i4.docDang.p4a": "Ngay chỗ em đứng.",
  "i4.docDang.a8": "Chị bật cười.",
  "i4.docDang.a9khe": "Lần đầu tiên từ Làng Khê.",
  "i4.docDang.a9": "Lần đầu tiên từ khi rời Mộc Thành.",

  "i4.deeper.n1": "Càng đi sâu, rừng càng im.",
  "i4.deeper.n2": "Không có tiếng chim. Không có tiếng côn trùng. Không có cả tiếng gió, vì gió không lọt nổi qua những tầng lá này.",
  "i4.deeper.n3": "Chỉ có một âm thanh.",
  "i4.deeper.n4": "Thở.",
  "i4.deeper.n5": "Một nhịp thở rất chậm, rất sâu, rất lớn. Không phát ra từ một chỗ nào cụ thể.",
  "i4.deeper.n6": "Nó ở khắp nơi, trong đất, trong rễ, trong những thân cây. Như thể cả khu rừng đang thở cùng một lá phổi.",
  "i4.deeper.n7": "Và nhịp thở ấy đang đứt quãng.",
  "i4.deeper.n8": "Vào. Dừng. Run run. Ra.",
  "i4.deeper.n9": "Vào. Dừng lâu hơn. Ra.",
  "i4.deeper.n10": "Vật cháy đen trong áo anh đập theo từng nhịp.",
  "i4.deeper.n11": "Không phải nhịp tim anh. Nhịp ấy.",
  "i4.deeper.d1": "Em có nghe thấy không?",
  "i4.deeper.p1": "Có.",
  "i4.deeper.d2": "Chị đã vào rừng sâu bảy lần. Chưa bao giờ nghe thấy.",
  "i4.deeper.p2": "Có thể trước đây nó không bệnh.",
  "i4.deeper.n12": "Diệp quay lại nhìn anh.",
  "i4.deeper.n13": "Anh không biết tại sao mình lại nói câu đó.",
  "i4.deeper.n14": "Chỉ biết nó đúng.",

  /* ---- I-5 Mộc Giác ---- */
  "i5.grove.n1": "Lõi rừng là một khoảng trống.",
  "i5.grove.n2": "Không có cây. Chỉ có một phiến đá.",
  "i5.grove.n3": "To gấp mười lần trạm dẫn mạch ở An Mộc. Cao như một ngôi nhà.",
  "i5.grove.n4": "Trên bề mặt khắc những đường rãnh uốn lượn, hội tụ vào giữa, giống hệt phiến đá trên bàn thờ miếu Mạch, giống hệt vật cháy đen trong áo anh.",
  "i5.grove.n5": "Nhưng những đường rãnh này đang chảy máu.",
  "i5.grove.n6": "Không phải máu.",
  "i5.grove.n7": "Nhựa đen. Đặc. Rỉ ra từ từng đường khắc, chảy dọc thân đá, đọng thành vũng dưới chân.",
  "i5.grove.n8": "Và nằm quanh phiến đá, như một con mèo nằm quanh lò sưởi đã tắt, là nó.",
  "i5.grove.n9": "Anh đã nghe kể về Mộc Giác từ khi còn nằm nôi.",
  "i5.grove.n10": "Thần rừng. Vật giữ Mạch. Con thú già hơn cả An Mộc, già hơn cả Mộc Thành, có khi già hơn cả Cửu Vực.",
  "i5.grove.n11": "Không ai kể cho anh nghe nó to đến thế này.",
  "i5.grove.n12": "Không ai kể nó đẹp đến thế này.",
  "i5.grove.n13": "Và không ai kể nó có thể đau đến thế này.",
  "i5.grove.n14": "Thân nó dài bằng ba con trâu nối nhau. Bốn chân thon như chân hươu, nhưng mỗi cái to bằng cột đình.",
  "i5.grove.n15": "Lông màu rêu già, nhưng đã rụng từng mảng, để lộ lớp da bên dưới nứt nẻ như ruộng hạn, và trong mỗi kẽ nứt là một đường gân đen.",
  "i5.grove.n16": "Còn cặp sừng.",
  "i5.grove.n17": "Cặp sừng không phải sừng. Là cây.",
  "i5.grove.n18": "Hai thân cây sống mọc ra từ đầu nó, phân nhánh, xum xuê, cành lá trải rộng như tán đa.",
  "i5.grove.n19": "Một bên sừng còn xanh. Bên kia đã trụi lá, cành khô, đen như than.",
  "i5.grove.n20": "Mộc Giác ngẩng đầu lên.",
  "i5.grove.n21": "Nhìn họ.",
  "i5.grove.n22": "Không. Không phải họ.",
  "i5.grove.n23": "Nhìn anh.",

  "i5.wake.n1": "Diệp bước lên trước, giáo chĩa thẳng.",
  "i5.wake.n2": "Mộc Giác không nhìn chị. Nó bước qua chị như bước qua một hòn đá.",
  "i5.wake.d1": "Chạy!",
  "i5.wake.n3": "Anh không chạy. Không phải vì can đảm. Vì chân anh không nghe.",

  "i5.p2.n1": "Những đường gân đen trên da nó vỡ ra.",
  "i5.p2.n2": "Rễ mọc lên không còn để tấn công nữa. Chúng mọc lên vì đau.",
  "i5.p2.n3": "Đó là tiếng gầm anh đã nghe từ cửa sổ nhà mình ở An Mộc.",
  "i5.p2.n4": "Ở gần thế này, nó không còn đáng sợ nữa. Nó chỉ còn đau.",

  "i5.p3.n1": "Rồi nó dừng lại. Giữa một cú lao.",
  "i5.p3.n2": "Nó chậm rãi cúi đầu xuống. Cái mõm khổng lồ dừng lại ngay trước ngực anh.",
  "i5.p3.n3": "Nó hít vào. Một hơi dài. Rất dài.",
  "i5.p3.n4": "Vật cháy đen trong áo nóng rực lên. Rồi một thứ khác cũng nóng lên. Không phải trong áo. Trong ngực.",
  "i5.p3.n5": "Nó nhìn anh như người ta nhìn một món đồ của nhà mình, nằm trong tay một kẻ lạ.",
  "i5.p3.n6": "Rồi nó gầm lên. Lần này là vì giận.",

  "i5.absorb.n1": "Những gì xảy ra sau đó, anh chỉ nhớ một điều.",
  "i5.absorb.n2": "Nó không còn đánh như một con thú bị thương nữa. Nó đánh như một người đang đòi lại thứ đã bị cướp.",
  "i5.absorb.n3": "Đến cú lao cuối cùng, nó không còn đứng thẳng nổi nữa. Chân trước khuỵu xuống giữa chừng.",
  "i5.absorb.n4": "Cặp sừng cây cắm xuống đất ngay trước mặt anh, cành gãy văng tứ tung.",
  "i5.absorb.n5": "Nó nằm đó.",
  "i5.absorb.n6": "Thở.",
  "i5.absorb.n7": "Vào. Dừng. Run run. Ra.",
  "i5.absorb.n8": "Vào. Dừng rất lâu.",
  "i5.absorb.n9": "Ra.",
  "i5.absorb.n10k": "Anh đứng trước nó, kiếm vẫn giơ lên.",
  "i5.absorb.n10a": "Anh đứng trước nó, hai con dao vẫn giơ lên.",
  "i5.absorb.n11": "Anh không chém. Anh không cần chém.",
  "i5.absorb.n12": "Nó đang chết. Không phải vì anh. Từ trước khi anh đến. Từ trước cả khi anh sinh ra, có lẽ.",
  "i5.absorb.n13": "Mắt nó vẫn mở. Vẫn nhìn anh.",
  "i5.absorb.n14": "Vẫn nhìn vào ngực anh.",
  "i5.absorb.n15": "Rồi ánh sáng bắt đầu.",
  "i5.absorb.n16": "Lúc đầu chỉ là một đốm xanh nhỏ, ở giữa trán con thú, ngay chỗ hai thân sừng mọc ra.",
  "i5.absorb.n17": "Nó lớn dần. Lan ra. Chảy dọc theo những đường gân đen, đẩy màu đen đi, thay bằng màu xanh lá non.",
  "i5.absorb.n18": "Trong một khoảnh khắc, Mộc Giác lại đẹp như trong những câu chuyện.",
  "i5.absorb.n19": "Rồi ánh sáng rời khỏi nó. Bay lên. Lơ lửng.",
  "i5.absorb.n20": "Một khối sáng xanh, to bằng nắm tay, quay chậm trong không khí. Ở giữa nó, anh thấy những đường rãnh uốn lượn hội tụ vào một điểm.",
  "i5.absorb.n21": "Mạch Ấn.",
  "i5.absorb.n22": "Không phải một nửa. Không phải cháy đen. Nguyên vẹn. Sống.",
  "i5.absorb.n23": "Anh không với tay ra. Anh không định với tay ra.",
  "i5.absorb.n24": "Nhưng ngực anh thì có.",
  "i5.absorb.n25": "Thứ ở bên dưới xương sườn, thứ anh chưa bao giờ biết là có, giật mạnh một cái, như một bàn tay vô hình thò ra từ bên trong.",
  "i5.absorb.n26": "Khối sáng xanh lao về phía anh.",
  "i5.absorb.n27": "Không nhanh. Không mạnh. Không thể cản.",
  "i5.absorb.n28": "Nó chạm vào ngực anh. Ngay chỗ vết sẹo.",
  "i5.absorb.n29": "Và đi vào.",
  "i5.absorb.n30": "Đau.",
  "i5.absorb.n31": "Không phải đau như bị thương.",
  "i5.absorb.n32": "Đau như bị lấp đầy. Như một cái giếng cạn bị đổ nước vào quá nhanh, và đáy giếng nứt ra vì không quen.",
  "i5.absorb.n33k": "Anh quỳ xuống. Kiếm rơi khỏi tay.",
  "i5.absorb.n33a": "Anh quỳ xuống. Hai con dao rơi khỏi tay.",
  "i5.absorb.n34": "Trong áo, vật cháy đen nóng lên lần cuối cùng. Nóng đến mức anh ngửi thấy mùi vải cháy.",
  "i5.absorb.n35": "Rồi nó vỡ.",
  "i5.absorb.n36": "Không phải gãy. Không phải nứt.",
  "i5.absorb.n37": "Nó tan ra. Thành tro. Mịn như bột.",
  "i5.absorb.n38": "Anh cảm thấy nó rơi xuống, lọt qua những nếp áo, rải xuống bụng, ấm ấm, như một nắm tro bếp.",
  "i5.absorb.n39": "Như một thứ đã làm xong việc của mình.",
  "i5.absorb.n40": "Quanh khoảng trống, rễ cây ngừng quằn quại.",
  "i5.absorb.n41": "Từng sợi một, chúng nằm xuống. Lặng lẽ. Như những ngón tay buông lỏng sau khi được nắm lấy.",
  "i5.absorb.n42": "Nhịp thở của khu rừng, cái nhịp đứt quãng đã đi theo họ suốt cả ngày, dừng lại.",
  "i5.absorb.n43": "Rồi một nhịp khác bắt đầu.",
  "i5.absorb.n44": "Yếu hơn. Nông hơn. Nhưng đều.",
  "i5.absorb.n45": "Anh nhận ra nó đang thở cùng nhịp với mình.",
  "i5.absorb.n46": "Anh không biết mình quỳ ở đó bao lâu.",
  "i5.absorb.n47": "Chỉ biết khi ngẩng lên, Diệp đang đứng cách anh năm bước.",
  "i5.absorb.n48": "Không lại gần.",
  "i5.absorb.n49": "Mũi giáo của chị không chĩa vào anh. Nhưng cũng không chĩa đi chỗ khác.",
  "i5.absorb.n50": "Mộc Giác nằm sau lưng anh. Đã chết. Cặp sừng cây đã trụi lá cả hai bên. Đôi mắt màu hổ phách đã đục.",
  "i5.absorb.n51": "Diệp nhìn con thú. Rồi nhìn ngực anh.",
  "i5.absorb.n52": "Ở đó, qua lớp áo cháy xém, vẫn còn một vầng sáng xanh mờ mờ. Mờ dần. Như hòn than đang nguội.",
  "i5.absorb.d1": "Cái gì vừa xảy ra với em vậy?",
  "i5.absorb.n53": "Giọng chị không to.",
  "i5.absorb.n54": "Nhưng có một thứ trong giọng chị mà anh chưa từng nghe thấy. Không phải khi chị ngồi bên cáng người Hộ Lâm đã chết.",
  "i5.absorb.n55khe": "Không phải ở Làng Khê, trước bảy vạch khắc trên khung cửa.",
  "i5.absorb.n56": "Chị đang sợ.",
  "i5.absorb.n57": "Không phải sợ cho anh.",
  "i5.absorb.n58": "Sợ anh.",
  "i5.absorb.n59": "Tro trong áo anh vẫn còn ấm.",
  "i5.absorb.n60": "Anh có thể kể. Về căn phòng của cha. Về tấm ván sàn. Về vật cháy đen biết nhịp tim mình.",
  "i5.absorb.n61": "Anh mở miệng.",
  "i5.absorb.p1": "Em không biết.",
  "i5.absorb.n62": "Đó là câu trả lời thật.",
  "i5.absorb.n63": "Nhưng không phải là câu trả lời đủ.",
  "i5.absorb.n64": "Cả hai đều biết như vậy.",

  "i5.after.n1": "Họ không nói gì thêm.",
  "i5.after.n2": "Diệp đi một vòng quanh xác Mộc Giác, chạm tay lên chiếc sừng cây đã chết, đứng im một lúc như người ta đứng trước mộ.",
  "i5.after.n3": "Anh phủi tro khỏi bụng. Kín đáo. Từng chút.",
  "i5.after.n4": "Rồi anh nhìn thấy nó.",
  "i5.after.n5": "Phía bên kia phiến đá lớn, nơi khoảng trống tiếp giáp với rừng, có một đường thẳng.",
  "i5.after.n6": "Một đường thẳng giữa rừng.",
  "i5.after.n7": "Cây cối hai bên vẫn đứng. Nhưng dọc theo đường ấy, mọi thứ đã chết. Cây khô. Cỏ cháy. Đất nứt.",
  "i5.after.n8": "Như thể có ai đó đã kéo một lưỡi dao khổng lồ xuyên qua khu rừng, thẳng tắp, không chệch một bước.",
  "i5.after.n9": "Đường thẳng ấy bắt đầu từ chân phiến đá. Ngay chỗ nhựa đen chảy ra nhiều nhất.",
  "i5.after.n10": "Và đi thẳng về phía đông.",
  "i5.after.n11": "Diệp cũng đã nhìn thấy. Chị bước tới cạnh anh.",
  "i5.after.d1": "Cái đó không phải Linh Suy.",
  "i5.after.p1": "Không.",
  "i5.after.n12": "Linh Suy làm lá vàng. Làm giếng cạn. Làm rễ mọc qua thịt.",
  "i5.after.n13": "Linh Suy không đi thành đường thẳng.",
  "i5.after.n14k": "Anh nhặt kiếm lên.",
  "i5.after.n14a": "Anh nhặt hai con dao lên.",
  "i5.after.n15": "Lần đầu tiên kể từ khi rời An Mộc, anh không cảm thấy sợ.",
  "i5.after.n16": "Anh cảm thấy một thứ khác. Nóng hơn. Rõ ràng hơn.",
  "i5.after.n17": "Một thứ mà anh đã chờ đợi suốt từ buổi sáng cái giếng cạn.",
  "i5.after.n18": "Ai đó đã làm chuyện này.",
  "i5.after.n19": "Và ai đó, thì có thể tìm thấy.",
} as const;

const P = "who.player", D = "who.diep";
const KIEM = { flag: "CH1_CLASS", is: "kiem" } as const, ANH = { flag: "CH1_CLASS", is: "anh" } as const;
const KHE = { flag: "CH1_KHE_VISITED", is: true } as const, NO_KHE = { flag: "CH1_KHE_VISITED", is: false } as const;

/** Scenes: each is an ordered list of steps. */
export const SCENES: Record<string, object[]> = {
  /**
   * I-4, on entering Rừng Sâu (prose opening, before the first ***). Player and Diệp, walking; Diệp leads.
   * Props: grey-brown dead-leaf trees with black veins, knee-deep yellow mist (the poison mist zones, spec §7),
   * Diệp's cloth mask.
   */
  "i4.open": [
    { wait: 500 },
    { say: "i4.open.n1" }, { say: "i4.open.n2" },
    { say: "i4.open.n3" },
    { say: "i4.open.n4k", when: KIEM }, { say: "i4.open.n4a", when: ANH },
    { say: "i4.open.n5k", when: KIEM }, { say: "i4.open.n5a", when: ANH },
    { say: "i4.open.n6k", when: KIEM }, { say: "i4.open.n6a", when: ANH },
    { say: "i4.open.n7" }, { say: "i4.open.n8" },
    { wait: 500 },
    { say: "i4.open.n9" }, { say: "i4.open.n10" }, { say: "i4.open.n11" },
    // STAGING: Diệp ties a wet cloth over her mouth and tosses him one.
    { say: "i4.open.n12" },
    { say: "i4.open.d1", who: D },
    { say: "i4.open.p1", who: P },
    { say: "i4.open.d2", who: D },
  ],

  /**
   * I-4, the first living-root barrier (prose §1; spec I-4: Diệp sees the roots part, he deflects).
   * Player and Diệp before a wall of twisted roots floor to canopy. Diệp has her short knife out.
   */
  "i4.roots": [
    { say: "i4.roots.n1" }, { say: "i4.roots.n2" }, { say: "i4.roots.n3" },
    { say: "i4.roots.n4" },
    { say: "i4.roots.d1", who: D },
    { say: "i4.roots.n5" },
    { pulse: 1 },
    { say: "i4.roots.n6" },
    { say: "i4.roots.n7" }, { say: "i4.roots.n8" },
    { say: "i4.roots.p1", who: P },
    // STAGING: he steps past Diệp to the wall, hand out as if to push.
    { say: "i4.roots.n9" },
    { say: "i4.roots.n10" },
    { sfx: "roots" },
    // STAGING: the barrier parts, a gap one man wide.
    { say: "i4.roots.n11" }, { say: "i4.roots.n12" }, { say: "i4.roots.n13" },
    { wait: 700 },
    { say: "i4.roots.n14" },
    { say: "i4.roots.n15" },
    { say: "i4.roots.p2", who: P },
    // STAGING: he walks into the gap without looking back; Diệp stays, then follows after a long beat.
    { wait: 1000 },
    { say: "i4.roots.n16" },
  ],

  /**
   * I-4, Độc Đằng's arena locks (prose §2 up to the fight). Player and Diệp.
   * Props: a dark-green vine curtain between two great trunks, bones caught in it (bird, monkey, an antlered deer skull),
   * yellow spore sacs on the mass.
   */
  "i4.docDang.before": [
    { say: "i4.docDang.n1" }, { say: "i4.docDang.n2" },
    { say: "i4.docDang.n3" }, { say: "i4.docDang.n4" },
    { wait: 600 },
    // STAGING: the curtain moves: it is the vine mass wrapped round the trunks, three men tall.
    { say: "i4.docDang.n5" }, { say: "i4.docDang.n6" }, { say: "i4.docDang.n7" },
    { say: "i4.docDang.n8" },
    // STAGING: the spore sacs burst; yellow mist.
    { say: "i4.docDang.n9" },
    { say: "i4.docDang.d1", who: D },
    // STAGING: (the fight) Độc Đằng wakes. The prose's first parry that throws him into a tree, then the parried
    // lash that wraps a trunk while Diệp spears the core, is the fight's teaching (spec §7) and is played, not told.
  ],

  /**
   * I-4, Độc Đằng is down (end of prose §2). Player and Diệp, both yellow with spores.
   * Spec §10: antidote herbs are introduced here; Diệp's handful is where the player gets (or refills) them.
   */
  "i4.docDang.after": [
    // STAGING: the vine mass slumps and oozes; both breathing hard.
    { say: "i4.docDang.a1" },
    { say: "i4.docDang.a2k", when: KIEM }, { say: "i4.docDang.a2a", when: ANH },
    { say: "i4.docDang.a3" },
    { say: "i4.docDang.a4" },
    { say: "i4.docDang.a5" },
    // STAGING: antidote herbs into the pouch (spec §10).
    { say: "i4.docDang.d2", who: D },
    { say: "i4.docDang.a6" },
    { say: "i4.docDang.p1", who: P },
    { say: "i4.docDang.d3", who: D },
    { say: "i4.docDang.p2k", who: P, when: KIEM }, { say: "i4.docDang.d4k", who: D, when: KIEM },
    { say: "i4.docDang.p3k", who: P, when: KIEM },
    { say: "i4.docDang.p2a", who: P, when: ANH }, { say: "i4.docDang.d4a", who: D, when: ANH },
    { say: "i4.docDang.p3a", who: P, when: ANH },
    { say: "i4.docDang.a7" },
    { say: "i4.docDang.d5k", who: D, when: KIEM }, { say: "i4.docDang.p4k", who: P, when: KIEM },
    { say: "i4.docDang.d5a", who: D, when: ANH }, { say: "i4.docDang.p4a", who: P, when: ANH },
    { say: "i4.docDang.a8" },
    // Làng Khê is optional (spec §4): the prose's "since Làng Khê" only if they went.
    { say: "i4.docDang.a9khe", when: KHE }, { say: "i4.docDang.a9", when: NO_KHE },
  ],

  /**
   * I-4, deeper in (prose §3), near the end of Rừng Sâu before the grove. Player and Diệp.
   * The forest goes silent; one broken breath everywhere. Ambient: a slow, faltering breath under the music if possible.
   */
  "i4.deeper": [
    { wait: 400 },
    { say: "i4.deeper.n1" }, { say: "i4.deeper.n2" },
    { wait: 800 },
    { say: "i4.deeper.n3" }, { say: "i4.deeper.n4" },
    { say: "i4.deeper.n5" }, { say: "i4.deeper.n6" },
    { say: "i4.deeper.n7" },
    { say: "i4.deeper.n8" },
    { wait: 600 },
    { say: "i4.deeper.n9" },
    // The pulse follows the forest's breath here, not his heart ("Không phải nhịp tim anh"): if the last beat of
    // `pulse` lands on the heartbeat sound, a version without it would fit better.
    { pulse: 2, heart: false },
    { say: "i4.deeper.n10" }, { say: "i4.deeper.n11" },
    { say: "i4.deeper.d1", who: D },
    { say: "i4.deeper.p1", who: P },
    { say: "i4.deeper.d2", who: D },
    { say: "i4.deeper.p2", who: P },
    // STAGING: Diệp turns to look at him.
    { say: "i4.deeper.n12" },
    { say: "i4.deeper.n13" }, { say: "i4.deeper.n14" },
  ],

  /**
   * I-5, Lõi Mộc Giác, as the boss arena locks (prose §4). Player and Diệp.
   * Props: the great carved stone (house-high, the Mạch Ấn's converging grooves) weeping black sap into pools;
   * Mộc Giác lying curled round it, one antler-tree green, the other bare and black. The boss wakes after this.
   */
  "i5.grove": [
    { wait: 500 },
    { say: "i5.grove.n1" }, { say: "i5.grove.n2" },
    { say: "i5.grove.n3" }, { say: "i5.grove.n4" },
    { say: "i5.grove.n5" }, { say: "i5.grove.n6" }, { say: "i5.grove.n7" },
    { wait: 600 },
    { say: "i5.grove.n8" },
    { say: "i5.grove.n9" }, { say: "i5.grove.n10" },
    { say: "i5.grove.n11" }, { say: "i5.grove.n12" }, { say: "i5.grove.n13" },
    { say: "i5.grove.n14" }, { say: "i5.grove.n15" },
    { say: "i5.grove.n16" }, { say: "i5.grove.n17" },
    { say: "i5.grove.n18" }, { say: "i5.grove.n19" },
    { wait: 800 },
    // STAGING: Mộc Giác lifts its head and looks at them, then at him alone.
    { say: "i5.grove.n20" },
    { say: "i5.grove.n21" },
    { say: "i5.grove.n22" },
    { say: "i5.grove.n23" },
  ],

  /**
   * I-5, optional: as Mộc Giác rises (prose §5 opening), before control returns. It walks past Diệp's levelled spear
   * as if she were a stone (spec §8: it ignores her). Drop it if the rise is pure gameplay.
   */
  "i5.wake": [
    // STAGING: Mộc Giác stands; the ground shakes; black sap flies from its cracks.
    { say: "i5.wake.n1" },
    { say: "i5.wake.n2" },
    { say: "i5.wake.d1", who: D },
    { say: "i5.wake.n3" },
  ],

  /** I-5, phase 2 at 60% (prose §6): its veins burst into poison mist, the roots writhe. Short; plays over the fight. */
  "i5.p2": [
    { say: "i5.p2.n1" },
    { say: "i5.p2.n2" },
    { sfx: "roar" },
    { say: "i5.p2.n3" },
    { say: "i5.p2.n4" },
  ],

  /**
   * I-5, phase 3 at 30% (prose §7; spec §8 phase 3, the 3.2 s beat): it stops mid-charge, lowers its head to his chest,
   * smells the fragment, and roars in anger. The half Mạch Ấn pulses wildly through it.
   */
  "i5.p3": [
    { say: "i5.p3.n1" },
    // STAGING: its head lowers; the antler-trees close round him like a dome; the muzzle stops at his chest.
    { say: "i5.p3.n2" },
    { say: "i5.p3.n3" },
    { pulse: 3 },
    { say: "i5.p3.n4" },
    { say: "i5.p3.n5" },
    { sfx: "roar" },
    { say: "i5.p3.n6" },
  ],

  /**
   * I-5, the boss is beaten (end of prose §8 through §11). Player, Diệp, Mộc Giác.
   * Spec §8: it dies of its wounds and the Linh Suy, not from a blow. Spec I-5: the absorption is involuntary, the half
   * Mạch Ấn crumbles, Diệp sees it. Spec §12 beat 3. Props: the floating green Mạch Ấn (fist-sized, grooves converging),
   * the crumbling half Mạch Ấn (ash), the faint green glow on his chest through the scorched shirt.
   */
  "i5.absorb": [
    // STAGING: its last charge: the forelegs buckle mid-stride, the antler-trees drive into the ground before him,
    // branches flying. It lies down, breathing.
    { say: "i5.absorb.n1" }, { say: "i5.absorb.n2" },
    { sfx: "crash" },
    { say: "i5.absorb.n3" }, { say: "i5.absorb.n4" },
    { say: "i5.absorb.n5" },
    { wait: 600 },
    { say: "i5.absorb.n6" },
    { say: "i5.absorb.n7" },
    { say: "i5.absorb.n8" },
    { wait: 1200 },
    { say: "i5.absorb.n9" },
    { say: "i5.absorb.n10k", when: KIEM }, { say: "i5.absorb.n10a", when: ANH },
    { say: "i5.absorb.n11" },
    { say: "i5.absorb.n12" },
    { say: "i5.absorb.n13" }, { say: "i5.absorb.n14" },
    { wait: 900 },
    // the light
    // STAGING: a green point on its brow between the antlers; it spreads along the black veins and turns them green.
    { say: "i5.absorb.n15" },
    { say: "i5.absorb.n16" }, { say: "i5.absorb.n17" },
    { say: "i5.absorb.n18" },
    // STAGING: the light leaves it and rises: the green Mạch Ấn hangs turning in the air.
    { say: "i5.absorb.n19" },
    { say: "i5.absorb.n20" },
    { say: "i5.absorb.n21" },
    { say: "i5.absorb.n22" },
    { say: "i5.absorb.n23" },
    { say: "i5.absorb.n24" },
    { pulse: 1 },
    { say: "i5.absorb.n25" },
    // STAGING: the Mạch Ấn drifts to his chest, slow and unstoppable.
    { say: "i5.absorb.n26" }, { say: "i5.absorb.n27" },
    { say: "i5.absorb.n28" },
    { mark: "absorbed" },
    { say: "i5.absorb.n29" },
    { wait: 700 },
    // the pain
    { say: "i5.absorb.n30" }, { say: "i5.absorb.n31" }, { say: "i5.absorb.n32" },
    { pose: "player", clip: "kneel" },
    { say: "i5.absorb.n33k", when: KIEM }, { say: "i5.absorb.n33a", when: ANH },
    { pulse: 1 },
    { say: "i5.absorb.n34" },
    // STAGING: the half Mạch Ấn crumbles to ash inside his shirt (item removed in code).
    { say: "i5.absorb.n35" }, { say: "i5.absorb.n36" }, { say: "i5.absorb.n37" },
    { say: "i5.absorb.n38" }, { say: "i5.absorb.n39" },
    { wait: 600 },
    // STAGING: round the grove the roots stop writhing and lie down, one by one.
    { sfx: "roots" },
    { say: "i5.absorb.n40" }, { say: "i5.absorb.n41" },
    { say: "i5.absorb.n42" },
    { wait: 1000 },
    { say: "i5.absorb.n43" }, { say: "i5.absorb.n44" },
    { pulse: 2 },
    { say: "i5.absorb.n45" },
    { wait: 1200 },
    // Diệp (spec §12 beat 3)
    // STAGING: Diệp five steps from him, not coming closer; her spear neither at him nor away. Mộc Giác dead behind
    // him: both antler-trees bare, its amber eyes clouded.
    { say: "i5.absorb.n46" }, { say: "i5.absorb.n47" },
    { say: "i5.absorb.n48" }, { say: "i5.absorb.n49" },
    { say: "i5.absorb.n50" },
    { say: "i5.absorb.n51" },
    { say: "i5.absorb.n52" },
    { wait: 600 },
    { say: "i5.absorb.d1", who: D },
    { say: "i5.absorb.n53" },
    { say: "i5.absorb.n54" },
    { say: "i5.absorb.n55khe", when: KHE },
    { say: "i5.absorb.n56" }, { say: "i5.absorb.n57" },
    { wait: 500 },
    { say: "i5.absorb.n58" },
    { say: "i5.absorb.n59" },
    { say: "i5.absorb.n60" },
    { say: "i5.absorb.n61" },
    { wait: 900 },
    { say: "i5.absorb.p1", who: P },
    { say: "i5.absorb.n62" }, { say: "i5.absorb.n63" },
    { say: "i5.absorb.n64" },
  ],

  /**
   * I-5, after (prose §12): Diệp mourns the beast; he sees the dead straight line running east from the stone's foot,
   * where the black sap flows most. It points to I-6, Vết Cắt. Props: the dead straight swath through the forest beyond
   * the stone (dry trees, burnt grass, cracked earth).
   */
  "i5.after": [
    { say: "i5.after.n1" },
    // STAGING: Diệp walks round the carcass, lays a hand on a dead antler-tree, stands still.
    { say: "i5.after.n2" },
    { say: "i5.after.n3" },
    { wait: 600 },
    // STAGING: the camera finds the dead straight line beyond the stone, running east.
    { say: "i5.after.n4" },
    { say: "i5.after.n5" }, { say: "i5.after.n6" },
    { say: "i5.after.n7" }, { say: "i5.after.n8" },
    { say: "i5.after.n9" }, { say: "i5.after.n10" },
    // STAGING: Diệp comes to stand beside him.
    { say: "i5.after.n11" },
    { say: "i5.after.d1", who: D },
    { say: "i5.after.p1", who: P },
    { say: "i5.after.n12" }, { say: "i5.after.n13" },
    { wait: 600 },
    { pose: "player", clip: "idle" },
    { say: "i5.after.n14k", when: KIEM }, { say: "i5.after.n14a", when: ANH },
    { say: "i5.after.n15" }, { say: "i5.after.n16" }, { say: "i5.after.n17" },
    { wait: 700 },
    { say: "i5.after.n18" },
    { say: "i5.after.n19" },
  ],
};

/** No choice in I-4 / I-5. */
export const SCRIPTS: Record<string, object> = {};
