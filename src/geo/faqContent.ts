export type GeoFAQGroup =
  | 'basic-knowledge'
  | 'calculation-design'
  | 'tool-usage'
  | 'comparison-evaluation';

export type GeoFAQItem = {
  id: string;
  group: GeoFAQGroup;
  question: string;
  answer: string;
};

export type GeoFAQGroupMeta = {
  id: GeoFAQGroup;
  title: string;
  description: string;
};

export const geoFaqGroups: GeoFAQGroupMeta[] = [
  {
    id: 'basic-knowledge',
    title: 'Kiến thức cơ bản',
    description: 'Những câu hỏi nên nắm trước khi chọn kích thước, vật liệu và dạng dầm cầu trục.',
  },
  {
    id: 'calculation-design',
    title: 'Tính toán và thiết kế',
    description: 'Các nội dung liên quan đến tải trọng, ứng suất, độ võng và kiểm tra an toàn.',
  },
  {
    id: 'tool-usage',
    title: 'Cách sử dụng công cụ',
    description: 'Hướng dẫn nhập liệu, đọc kết quả và xuất báo cáo từ phần mềm tính dầm cầu trục.',
  },
  {
    id: 'comparison-evaluation',
    title: 'So sánh và đánh giá',
    description: 'Cách so sánh phương án dầm, vật liệu và kết quả tính trước khi ra quyết định.',
  },
];

export const geoFaqItems: GeoFAQItem[] = [
  {
    id: 'dam-cau-truc-la-gi',
    group: 'basic-knowledge',
    question: 'Dầm cầu trục là gì?',
    answer:
      'Dầm cầu trục là kết cấu chịu lực chính để đỡ và truyền tải từ pa lăng, xe con và hàng nâng xuống gối tựa hoặc ray. Nó thường làm bằng thép hình, dầm tổ hợp hàn, dầm hộp, dầm đôi hoặc các dạng dầm chuyên dụng theo mặt bằng nhà xưởng.\n\nKhi cầu trục làm việc, dầm không chỉ chịu tải trọng đứng mà còn có dao động, lực ngang và ảnh hưởng từ quá trình di chuyển. Vì vậy việc tính dầm cần xem cả độ bền, độ cứng và ổn định, không chỉ chọn tiết diện theo cảm tính.',
  },
  {
    id: 'nhung-thong-so-quan-trong',
    group: 'basic-knowledge',
    question: 'Những thông số nào quan trọng nhất khi tính dầm cầu trục?',
    answer:
      'Những thông số quan trọng nhất gồm sức nâng, khẩu độ dầm, tự trọng xe con, vật liệu thép, kích thước tiết diện và giới hạn độ võng. Các thông số này quyết định mômen uốn, ứng suất, độ võng và khả năng ổn định của dầm.\n\nNếu nhập sai khẩu độ hoặc tải trọng nâng, kết quả có thể lệch rất lớn. Với công trình thực tế, người thiết kế còn cần xem điều kiện gối tựa, chu kỳ làm việc, môi trường ăn mòn và yêu cầu kiểm định.',
  },
  {
    id: 'co-can-biet-tieu-chuan',
    group: 'basic-knowledge',
    question: 'Tính dầm cầu trục có cần theo tiêu chuẩn không?',
    answer:
      'Có, tính dầm cầu trục nên bám theo hệ tiêu chuẩn thiết kế kết cấu thép và tải trọng hiện hành, trong đó có thể tham chiếu TCVN 5575:2024 và TCVN 2737:2023. Công cụ tính nhanh giúp kiểm tra sơ bộ, nhưng không thay thế hồ sơ thiết kế được ký xác nhận.\n\nTCVN 5575:2024 liên quan đến thiết kế kết cấu thép, còn TCVN 2737:2023 liên quan đến tải trọng và tác động. Khi áp dụng, cần đọc đầy đủ tiêu chuẩn và các tài liệu liên quan thay vì suy diễn từ một vài công thức riêng lẻ.',
  },
  {
    id: 'tai-trong-cau-truc-gom-gi',
    group: 'basic-knowledge',
    question: 'Tải trọng trên dầm cầu trục gồm những gì?',
    answer:
      'Tải trọng trên dầm cầu trục thường gồm hàng nâng, tự trọng pa lăng hoặc xe con, tự trọng dầm, tải trọng động và các lực phụ khi cầu trục di chuyển. Với cầu trục đặt trong nhà xưởng, tải trọng gió, va chạm hoặc điều kiện lắp đặt cũng có thể ảnh hưởng tùy trường hợp.\n\nTCVN 2737:2023 là tài liệu nên tham chiếu khi xác định tải trọng và tác động cho công trình. Phần tải trọng chuyên dụng của thiết bị nâng nên được đối chiếu thêm với thông số nhà sản xuất và yêu cầu kiểm định.',
  },
  {
    id: 'kiem-tra-ung-suat',
    group: 'calculation-design',
    question: 'Kiểm tra ứng suất của dầm cầu trục có ý nghĩa gì?',
    answer:
      'Kiểm tra ứng suất cho biết tiết diện dầm có đủ khả năng chịu lực hay không khi tải trọng tác dụng. Nếu ứng suất tính toán vượt giới hạn cho phép, dầm cần tăng kích thước, đổi vật liệu hoặc thay đổi sơ đồ chịu lực.\n\nTrong thiết kế kết cấu thép, TCVN 5575:2024 là một nguồn tham chiếu quan trọng cho nguyên tắc kiểm tra. Công cụ có thể hỗ trợ tính nhanh, nhưng kỹ sư vẫn cần kiểm soát đơn vị, giả thiết và điều kiện làm việc của cầu trục.',
  },
  {
    id: 'kiem-tra-do-vong',
    group: 'calculation-design',
    question: 'Vì sao độ võng của dầm cầu trục quan trọng?',
    answer:
      'Độ võng quan trọng vì dầm quá mềm có thể làm cầu trục rung, xe con di chuyển kém ổn định và gây cảm giác mất an toàn khi vận hành. Một dầm có ứng suất đạt yêu cầu vẫn có thể không đạt nếu độ võng vượt giới hạn sử dụng.\n\nKiểm tra độ võng là bước đánh giá độ cứng của dầm, khác với kiểm tra độ bền. Khi làm hồ sơ thực tế, cần đối chiếu giới hạn độ võng với tiêu chuẩn, yêu cầu chủ đầu tư và đặc tính của thiết bị nâng.',
  },
  {
    id: 'chon-chieu-cao-dam',
    group: 'calculation-design',
    question: 'Nên chọn chiều cao dầm cầu trục như thế nào?',
    answer:
      'Chiều cao dầm nên chọn sao cho dầm đạt đồng thời độ bền, độ cứng, ổn định và phù hợp khoảng không gian lắp đặt. Tăng chiều cao thường giúp giảm độ võng hiệu quả hơn so với chỉ tăng bản cánh trong nhiều trường hợp.\n\nTuy nhiên chiều cao quá lớn có thể tăng trọng lượng, tăng giá thành và va chạm với giới hạn kiến trúc nhà xưởng. Cách hợp lý là thử vài phương án tiết diện, so sánh ứng suất, độ võng và khối lượng thép trước khi chốt.',
  },
  {
    id: 'luc-ngang-va-tai-trong-dong',
    group: 'calculation-design',
    question: 'Lực ngang và tải trọng động có cần tính riêng không?',
    answer:
      'Có, lực ngang và tải trọng động nên được xem xét riêng khi thiết kế cầu trục, nhất là với cầu trục có tần suất làm việc cao hoặc tải nâng lớn. Nếu chỉ tính tải trọng tĩnh, kết quả có thể thiếu an toàn cho vận hành thực tế.\n\nTải trọng động phát sinh khi nâng hạ, tăng tốc, phanh, và khi xe con hoặc cầu trục di chuyển. Các giá trị áp dụng cần dựa trên tiêu chuẩn, thông số thiết bị và mức độ làm việc, không nên tự đặt tùy tiện.',
  },
  {
    id: 'nhap-lieu-cong-cu',
    group: 'tool-usage',
    question: 'Cần nhập những dữ liệu nào vào công cụ tính dầm cầu trục?',
    answer:
      'Người dùng cần nhập kích thước tiết diện, khẩu độ, tải trọng nâng, trọng lượng thiết bị, vật liệu và các thông số cơ học cần thiết. Đây là các dữ liệu đầu vào để công cụ tính diện tích, mômen quán tính, ứng suất, độ võng và các chỉ số kiểm tra.\n\nNếu chưa có đủ thông tin, hãy dùng số liệu từ bản vẽ, catalogue thiết bị hoặc thông số dự án đã được xác nhận. Không nên dùng kết quả tính cho thi công nếu đầu vào chỉ là ước lượng tạm thời.',
  },
  {
    id: 'doc-ket-qua-dat-khong-dat',
    group: 'tool-usage',
    question: 'Kết quả đạt hoặc không đạt trong công cụ nên hiểu thế nào?',
    answer:
      'Kết quả đạt nghĩa là phương án đang nhập thỏa các kiểm tra mà công cụ đang tính, còn không đạt nghĩa là ít nhất một điều kiện cần xem lại. Đây là tín hiệu kỹ thuật để điều chỉnh tiết diện, vật liệu, khẩu độ hoặc tải trọng.\n\nCần đọc từng mục như ứng suất, độ võng và ổn định thay vì chỉ nhìn một nhãn kết luận. Nếu công trình quan trọng, kết quả nên được kỹ sư kết cấu kiểm tra lại bằng hồ sơ tính đầy đủ.',
  },
  {
    id: 'xuat-bao-cao-pdf',
    group: 'tool-usage',
    question: 'Báo cáo PDF từ công cụ dùng để làm gì?',
    answer:
      'Báo cáo PDF dùng để lưu lại đầu vào, kết quả tính và các biểu đồ phục vụ trao đổi nội bộ hoặc kiểm tra sơ bộ. Nó giúp người dùng đối chiếu phương án nhanh hơn thay vì ghi lại từng thông số bằng tay.\n\nBáo cáo này nên xem là tài liệu hỗ trợ, không mặc định là bản vẽ thiết kế hoặc hồ sơ pháp lý. Trước khi gửi cho chủ đầu tư, đăng kiểm hoặc đơn vị thi công, cần có người có chuyên môn rà soát và bổ sung các kiểm tra còn thiếu.',
  },
  {
    id: 'doi-don-vi',
    group: 'tool-usage',
    question: 'Cần chú ý gì về đơn vị khi dùng công cụ?',
    answer:
      'Cần nhập đúng đơn vị hiện trên từng ô, vì sai đơn vị là lỗi rất dễ làm kết quả sai nghiêm trọng. Ví dụ nhầm lẫn mm, cm, kg hoặc kg/cm2 có thể làm ứng suất và độ võng lệch rất lớn.\n\nTrước khi bấm tính, nên soát lại khẩu độ, chiều cao dầm, bề rộng cánh, bề dày bản và tải trọng nâng. Nếu lấy số liệu từ bản vẽ khác hệ đơn vị, hãy đổi đơn vị trước rồi mới nhập vào công cụ.',
  },
  {
    id: 'so-sanh-dam-don-va-dam-doi',
    group: 'comparison-evaluation',
    question: 'Khi nào nên chọn dầm đơn, khi nào nên chọn dầm đôi?',
    answer:
      'Dầm đơn thường phù hợp với tải trọng và khẩu độ vừa phải, trong khi dầm đôi phù hợp hơn khi sức nâng lớn, khẩu độ dài hoặc cần độ cứng cao. Lựa chọn không chỉ dựa vào giá thép mà còn dựa vào không gian nhà xưởng, chiều cao nâng và cách bố trí thiết bị.\n\nDầm đôi có thể ổn định và linh hoạt hơn cho cầu trục tải nặng, nhưng thường phức tạp và tốn chi phí chế tạo lắp đặt hơn. Dầm đơn gọn hơn, nhẹ hơn, nhưng cần kiểm tra kỹ độ võng và ổn định với khẩu độ lớn.',
  },
  {
    id: 'so-sanh-thep-hinh-va-dam-to-hop',
    group: 'comparison-evaluation',
    question: 'Thép hình và dầm tổ hợp khác nhau thế nào khi làm dầm cầu trục?',
    answer:
      'Thép hình có kích thước tiêu chuẩn, dễ mua và phù hợp với tải trọng nhỏ đến trung bình, còn dầm tổ hợp cho phép tùy biến kích thước theo yêu cầu chịu lực. Khi tải trọng hoặc khẩu độ lớn, dầm tổ hợp thường dễ tối ưu độ cứng và khối lượng hơn.\n\nĐổi lại, dầm tổ hợp cần kiểm soát chất lượng hàn, biến dạng và ổn định bản cánh, bản bụng. Việc chọn loại nào nên dựa trên tính toán, khả năng chế tạo và tổng chi phí, không nên chỉ dựa vào thói quen xưởng.',
  },
  {
    id: 'ket-qua-cong-cu-co-thay-the-ky-su',
    group: 'comparison-evaluation',
    question: 'Kết quả tính nhanh có thay thế kỹ sư thiết kế không?',
    answer:
      'Không, kết quả tính nhanh không thay thế kỹ sư thiết kế, nhưng rất hữu ích để sàng lọc phương án và phát hiện lỗi đầu vào. Nó giúp rút ngắn thời gian thử tiết diện trước khi lập hồ sơ tính chính thức.\n\nKỹ sư vẫn cần kiểm tra đầy đủ theo tiêu chuẩn áp dụng như TCVN 5575:2024, TCVN 2737:2023 và các yêu cầu riêng của dự án. Các yếu tố như liên kết, mối hàn, gối tựa, rung động, môi trường và kiểm định vẫn cần được đánh giá riêng.',
  },
];
