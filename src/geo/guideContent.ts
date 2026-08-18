export type GuideTable = {
  caption: string;
  note?: string;
  headers: string[];
  rows: string[][];
};

export type GuideSubsection = {
  heading: string;
  paragraphs: string[];
};

export type GuideFormula = {
  title: string;
  equation: string;
  note: string;
  variables?: string[];
};

export type GuideSection = {
  heading: string;
  bluf?: string;
  paragraphs?: string[];
  bullets?: string[];
  orderedSteps?: string[];
  subsections?: GuideSubsection[];
  formulas?: GuideFormula[];
  table?: GuideTable;
};

export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideReference = {
  label: string;
  note: string;
};

export type GuideArticle = {
  title: string;
  slug: string;
  description: string;
  summary: string;
  updatedAt: string;
  readingTime: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  references: GuideReference[];
};

export const guideArticles: GuideArticle[] = [
  {
    title: 'Dầm cầu trục là gì? Cấu tạo và phân loại theo thiết kế nhà xưởng',
    slug: '/huong-dan/dam-cau-truc-la-gi',
    description:
      'Giải thích dầm cầu trục là gì, dầm gồm những bộ phận nào, thường dùng dạng tiết diện nào và khi nào cần tính toán kiểm tra.',
    summary:
      'BLUF: Dầm cầu trục là dầm thép đỡ ray để cầu trục di chuyển trong nhà xưởng và truyền tải bánh xe xuống hệ cột hoặc khung chính. Khi thiết kế, cần kiểm tra tải đứng, tải ngang, ứng suất, ổn định và độ võng theo TCVN 5575:2024, đồng thời xác định tải trọng theo TCVN 2737:2023 và dữ liệu thiết bị.',
    updatedAt: '2026-06-05',
    readingTime: '7 phút đọc',
    sections: [
      {
        heading: 'Dầm cầu trục là gì?',
        bluf:
          'Dầm cầu trục là cấu kiện thép nằm dọc nhà xưởng, đỡ ray chạy của cầu trục và nhận tải từ bánh xe cầu trục.',
        paragraphs: [
          'Trong nhà xưởng công nghiệp, cầu trục di chuyển trên ray để nâng hạ vật nặng. Ray đó không đặt trực tiếp lên tường hoặc mái, mà thường đặt trên dầm cầu trục. Dầm này nhận tải bánh xe, tải va đập, lực ngang khi cầu trục phanh hoặc lệch tải, rồi truyền xuống vai cột, console hoặc hệ khung chính.',
          'Với thiết kế kết cấu thép, TCVN 5575:2024 là tiêu chuẩn cần tham chiếu khi kiểm tra cấu kiện thép. TCVN 2737:2023 là tài liệu cần tham chiếu khi xác định tải trọng và tác động. Hai tiêu chuẩn này không thay thế catalogue cầu trục; dữ liệu bánh xe và chế độ vận hành vẫn phải lấy từ hồ sơ thiết bị.'
        ],
      },
      {
        heading: 'Cấu tạo chính của dầm cầu trục gồm những bộ phận nào?',
        bluf:
          'Một dầm cầu trục thường gồm bản cánh, bản bụng, ray, sườn tăng cứng, liên kết gối và có thể có dầm hãm nếu tải ngang lớn.',
        bullets: [
          'Bản cánh trên: vị trí thường đỡ ray, chịu nén uốn và tải tập trung từ bánh xe.',
          'Bản bụng: phần truyền lực cắt, giữ chiều cao dầm và cần kiểm tra ổn định cục bộ.',
          'Bản cánh dưới: làm việc cùng bản cánh trên để tạo khả năng chịu uốn của tiết diện.',
          'Sườn tăng cứng: bố trí tại gối, vị trí tải tập trung hoặc vùng cần chống ổn định bản bụng.',
          'Ray và liên kết ray: truyền tải bánh xe xuống dầm, đồng thời ảnh hưởng đến vận hành cầu trục.',
          'Liên kết vào cột: truyền tải từ dầm sang vai cột, console hoặc khung chính.'
        ],
      },
      {
        heading: 'Các dạng dầm cầu trục phổ biến trong nhà xưởng',
        bluf:
          'Dầm thép hình phù hợp tải nhẹ đến vừa; dầm tổ hợp hàn phù hợp khi cần tối ưu theo nhịp và tải bánh xe; dầm hộp phù hợp khi cần tăng độ cứng xoắn.',
        table: {
          caption: 'Bảng phân loại sơ bộ dầm cầu trục theo dạng tiết diện',
          note:
            'Bảng này dùng để định hướng lựa chọn ban đầu. Không dùng bảng này để chốt kích thước thi công nếu chưa có tính toán chi tiết.',
          headers: ['Dạng dầm', 'Tình huống thường gặp', 'Điểm cần kiểm tra'],
          rows: [
            ['Thép hình I/H cán nóng', 'Cầu trục tải nhẹ đến vừa, nhịp không quá lớn, cần thi công nhanh', 'Độ võng, ổn định cánh nén, ép cục bộ dưới ray'],
            ['Dầm I tổ hợp hàn', 'Nhịp vừa đến lớn hoặc tải bánh xe lớn cần tiết diện riêng', 'Mối hàn, sườn tăng cứng, ổn định bản bụng và bản cánh'],
            ['Dầm hộp', 'Trường hợp có xoắn hoặc lực ngang đáng kể', 'Chế tạo, kiểm tra mối hàn kín, bảo trì bên trong hộp'],
            ['Dầm kèm dầm hãm', 'Cầu trục có tải ngang lớn hoặc yêu cầu ổn định ray cao', 'Đường truyền lực ngang, liên kết với cột và hệ giằng']
          ],
        },
      },
      {
        heading: 'Ví dụ thực tế khi nhận dữ liệu cầu trục',
        bluf:
          'Nếu chỉ biết sức nâng 5 tấn thì chưa đủ để chọn dầm; cần thêm nhịp, tải bánh xe, khoảng cách bánh và chế độ làm việc.',
        paragraphs: [
          'Ví dụ một nhà xưởng có cầu trục 5 tấn, bước cột 6 m và ray chạy dọc nhà. Người thiết kế cần biết dầm cầu trục đặt trên từng bước cột hay liên tục qua nhiều cột, tải bánh xe lớn nhất là bao nhiêu, khoảng cách bánh xe thế nào và có lực ngang do phanh hay không.',
          'Nếu chỉ chọn thép I theo kinh nghiệm, dầm có thể đủ bền nhưng võng lớn, ray chạy không êm hoặc bản cánh trên bị ép cục bộ. Cách làm tốt hơn là nhập dữ liệu vào công cụ tính, kiểm tra ứng suất, độ võng, ổn định rồi mới so sánh phương án tiết diện.'
        ],
      },
      {
        heading: 'Khi nào cần kỹ sư kết cấu kiểm tra dầm cầu trục?',
        bluf:
          'Bất kỳ dầm cầu trục dùng cho vận hành thật đều cần người có chuyên môn kiểm tra trước khi thi công hoặc nghiệm thu.',
        bullets: [
          'Khi cầu trục có tải nâng lớn, vận hành thường xuyên hoặc làm việc trong môi trường khắc nghiệt.',
          'Khi phải sửa đổi dầm hiện hữu, nâng tải cầu trục hoặc thay đổi ray.',
          'Khi kết quả tính nhanh cho thấy ứng suất, độ võng hoặc ổn định gần giới hạn.',
          'Khi hồ sơ cần nộp cho chủ đầu tư, đơn vị kiểm định hoặc cơ quan quản lý.'
        ],
      },
    ],
    faq: [
      {
        question: 'Dầm cầu trục có giống dầm sàn thông thường không?',
        answer:
          'Không giống hoàn toàn. Dầm cầu trục chịu tải bánh xe di động, tải động và lực ngang khi thiết bị vận hành. Vì vậy ngoài kiểm tra uốn và cắt, cần xem thêm độ võng, ổn định, ép cục bộ dưới ray và chi tiết liên kết.'
      },
      {
        question: 'Có thể chọn dầm cầu trục chỉ theo sức nâng không?',
        answer:
          'Không nên. Sức nâng chỉ là một phần dữ liệu. Cùng sức nâng nhưng nhịp, số bánh xe, khoảng cách bánh, tự trọng xe con và chế độ làm việc khác nhau sẽ cho tải lên dầm khác nhau.'
      },
      {
        question: 'Dầm cầu trục nên dùng thép hình hay dầm tổ hợp hàn?',
        answer:
          'Thép hình phù hợp khi tải và nhịp không lớn, còn dầm tổ hợp hàn phù hợp khi cần tối ưu chiều cao, bản cánh và bản bụng. Quyết định cuối cùng phải dựa trên tính toán bền, độ võng, ổn định và khả năng chế tạo.'
      },
    ],
    references: [
      {
        label: 'TCVN 5575:2024',
        note: 'Tiêu chuẩn thiết kế kết cấu thép, dùng để kiểm tra cấu kiện thép của dầm cầu trục.'
      },
      {
        label: 'TCVN 2737:2023',
        note: 'Tiêu chuẩn tải trọng và tác động, dùng khi xác định tải đưa vào bài toán thiết kế.'
      },
      {
        label: 'Catalogue cầu trục',
        note: 'Nguồn cần có để xác định phản lực bánh xe, khoảng cách bánh xe và điều kiện vận hành.'
      },
    ],
  },
  {
    title: 'Cách tính tải trọng dầm cầu trục theo TCVN 2737:2023',
    slug: '/huong-dan/tai-trong-dam-cau-truc',
    description:
      'Hướng dẫn xác định tải đứng, tải ngang, tải động và dữ liệu bánh xe cần chuẩn bị trước khi tính dầm cầu trục.',
    summary:
      'BLUF: Tải trọng dầm cầu trục không chỉ là sức nâng danh nghĩa. Cần quy đổi hàng nâng, tự trọng xe con, tự trọng cầu trục, tải bánh xe, tải động và lực ngang thành các trường hợp tác dụng bất lợi; TCVN 2737:2023 dùng để đối chiếu nguyên tắc tải trọng, còn TCVN 5575:2024 dùng cho kiểm tra cấu kiện thép.',
    updatedAt: '2026-06-05',
    readingTime: '8 phút đọc',
    sections: [
      {
        heading: 'Tải trọng dầm cầu trục gồm những thành phần nào?',
        bluf:
          'Tải trên dầm cầu trục thường gồm tải đứng từ bánh xe, tải ngang do vận hành, tải động và tự trọng các cấu kiện liên quan.',
        bullets: [
          'Tải nâng danh nghĩa: khối lượng hàng lớn nhất mà cầu trục được phép nâng.',
          'Tự trọng xe con hoặc pa lăng: tải đi cùng hàng nâng và thay đổi vị trí theo xe con.',
          'Tự trọng cầu trục: tải của dầm chính cầu trục, dầm đầu, cơ cấu di chuyển và phụ kiện.',
          'Tải bánh xe: phản lực truyền xuống ray và dầm cầu trục tại từng bánh xe.',
          'Tải động: phần tăng thêm do nâng hạ, khởi động, phanh hoặc rung động.',
          'Lực ngang và lực dọc: tác động do phanh, lệch ray, xô ngang hoặc chuyển động của cầu trục.'
        ],
      },
      {
        heading: 'Quy trình xác định tải trọng theo từng bước',
        bluf:
          'Cách làm dễ kiểm soát là đi từ dữ liệu thiết bị, tính tải bánh xe, rồi tổ hợp các trường hợp bất lợi trước khi kiểm tra dầm.',
        orderedSteps: [
          'Thu thập catalogue hoặc hồ sơ cầu trục: sức nâng, tự trọng cầu, tự trọng xe con, số bánh xe, khoảng cách bánh xe và tốc độ vận hành.',
          'Xác định phản lực bánh xe lớn nhất khi xe con ở vị trí bất lợi. Không dùng tải trung bình nếu bài toán yêu cầu kiểm tra vị trí nguy hiểm nhất.',
          'Tách tải đứng và tải ngang để tránh nhầm lẫn giữa kiểm tra uốn đứng, uốn ngang và liên kết ray.',
          'Áp dụng nguyên tắc tải trọng và tổ hợp tải theo TCVN 2737:2023, đồng thời đối chiếu yêu cầu riêng của thiết bị nâng.',
          'Đưa nội lực bất lợi sang bước kiểm tra cấu kiện thép theo TCVN 5575:2024.',
          'Ghi rõ giả thiết và nguồn dữ liệu trong thuyết minh để người kiểm tra biết số nào đã xác nhận, số nào chỉ là tạm tính.'
        ],
      },
      {
        heading: 'Bảng dữ liệu đầu vào cần chuẩn bị',
        bluf:
          'Thiếu dữ liệu bánh xe là nguyên nhân rất thường làm kết quả tính dầm cầu trục sai hướng.',
        table: {
          caption: 'Bảng dữ liệu tải trọng nên có trước khi tính dầm cầu trục',
          note:
            'Nếu chưa có catalogue thiết bị, chỉ nên dùng số liệu ước tính để so sánh sơ bộ, không dùng làm hồ sơ thiết kế cuối cùng.',
          headers: ['Dữ liệu', 'Đơn vị thường dùng', 'Nguồn nên lấy', 'Ảnh hưởng đến tính toán'],
          rows: [
            ['Sức nâng', 'tấn hoặc kN', 'Yêu cầu thiết bị, catalogue cầu trục', 'Tạo tải chính khi nâng hàng'],
            ['Tự trọng xe con/pa lăng', 'kN', 'Catalogue nhà sản xuất', 'Làm tăng phản lực bánh xe bất lợi'],
            ['Tải bánh xe lớn nhất', 'kN/bánh', 'Catalogue hoặc bảng phân phối tải', 'Quyết định mô men, lực cắt và ép cục bộ'],
            ['Khoảng cách bánh xe', 'mm hoặc m', 'Bản vẽ thiết bị', 'Quyết định vị trí nội lực lớn nhất'],
            ['Lực ngang khi phanh/lệch ray', 'kN', 'Tiêu chuẩn và dữ liệu thiết bị', 'Ảnh hưởng dầm hãm, liên kết ray và cột'],
            ['Chế độ làm việc', 'A1-A8 hoặc mô tả vận hành', 'Yêu cầu khai thác, hồ sơ thiết bị', 'Ảnh hưởng kiểm tra mỏi và cấu tạo']
          ],
        },
      },
      {
        heading: 'Ví dụ sơ bộ về cách đọc tải bánh xe',
        bluf:
          'Nếu catalogue ghi tải bánh xe lớn nhất 65 kN/bánh, người tính nên dùng hệ bánh xe và khoảng cách bánh để tìm vị trí nội lực bất lợi trên dầm.',
        paragraphs: [
          'Giả sử cầu trục có hai bánh trên một ray, tải bánh xe lớn nhất là 65 kN/bánh và khoảng cách hai bánh là 2.500 mm. Khi kiểm tra dầm theo phương đứng, không nên cộng đơn giản thành 130 kN đặt giữa nhịp nếu vị trí thực tế của bánh xe có thể tạo mô men hoặc lực cắt khác.',
          'Người tính nên quét vị trí cụm bánh xe dọc theo nhịp dầm để tìm mô men và lực cắt lớn nhất. Sau đó mới dùng kết quả nội lực để kiểm tra ứng suất, ổn định và độ võng theo TCVN 5575:2024. Cách này giúp tránh trường hợp kết quả nhìn có vẻ hợp lý nhưng bỏ sót vị trí bất lợi.'
        ],
      },
      {
        heading: 'Những lỗi cần tránh khi tính tải trọng',
        bluf:
          'Sai tải trọng đầu vào thường nguy hiểm hơn sai vài phần trăm trong công thức kiểm tra vì toàn bộ kết quả phía sau đều phụ thuộc tải.',
        bullets: [
          'Chỉ lấy sức nâng mà bỏ qua tự trọng xe con và tự trọng cầu trục.',
          'Dùng tải bánh xe trung bình thay cho tải bánh xe lớn nhất.',
          'Không xét lực ngang khi cầu trục phanh hoặc di chuyển lệch.',
          'Nhầm đơn vị tấn, kN, kg hoặc kgf trong quá trình nhập liệu.',
          'Không ghi rõ nguồn dữ liệu nên người kiểm tra không biết tải nào đã được xác nhận.'
        ],
      },
    ],
    faq: [
      {
        question: 'Có thể tự tính tải bánh xe nếu không có catalogue không?',
        answer:
          'Có thể ước tính sơ bộ để so sánh phương án, nhưng không nên dùng làm hồ sơ cuối cùng. Tải bánh xe phụ thuộc bố trí cầu trục, xe con, dầm đầu và nhà sản xuất, nên cần catalogue hoặc xác nhận của đơn vị thiết bị.'
      },
      {
        question: 'TCVN 2737:2023 có đủ để tính hết tải cầu trục không?',
        answer:
          'TCVN 2737:2023 là cơ sở quan trọng về tải trọng và tác động, nhưng dữ liệu thiết bị vẫn phải lấy từ catalogue, bản vẽ cầu trục và yêu cầu vận hành. Không nên thay dữ liệu nhà sản xuất bằng giả định chung.'
      },
      {
        question: 'Tải ngang có quan trọng với dầm cầu trục nhỏ không?',
        answer:
          'Vẫn cần xem xét. Với cầu trục nhỏ, tải ngang có thể không chi phối tiết diện chính nhưng ảnh hưởng đến ray, liên kết, dầm hãm và cột. Bỏ qua tải ngang có thể làm chi tiết liên kết thiếu an toàn.'
      },
    ],
    references: [
      {
        label: 'TCVN 2737:2023',
        note: 'Tiêu chuẩn tải trọng và tác động, dùng để đối chiếu nguyên tắc xác định và tổ hợp tải.'
      },
      {
        label: 'TCVN 5575:2024',
        note: 'Tiêu chuẩn thiết kế kết cấu thép, dùng sau khi đã xác định nội lực từ tải trọng.'
      },
      {
        label: 'Catalogue cầu trục và hồ sơ thiết bị',
        note: 'Nguồn chính cho tải bánh xe, khoảng cách bánh xe, tự trọng và tốc độ vận hành.'
      },
    ],
  },
  {
    title: 'Cách tính toán dầm cầu trục theo TCVN 5575:2024',
    slug: '/huong-dan/tinh-toan-dam-cau-truc',
    description:
      'Quy trình tính toán dầm cầu trục nhà xưởng theo hướng dễ hiểu: xác định tải, lập sơ đồ, kiểm tra bền, ổn định, độ võng và hoàn thiện hồ sơ.',
    summary:
      'BLUF: Tính dầm cầu trục nên bắt đầu từ tải bánh xe và tổ hợp tải, sau đó kiểm tra ứng suất, ổn định, độ võng và chi tiết liên kết. TCVN 5575:2024 dùng cho kết cấu thép; TCVN 2737:2023 dùng để xác định tác động và tổ hợp tải, nhưng cần đọc bản tiêu chuẩn gốc cho dự án cụ thể.',
    updatedAt: '2026-06-04',
    readingTime: '8 phút đọc',
    sections: [
      {
        heading: 'Dầm cầu trục cần kiểm tra những gì?',
        bluf:
          'Một dầm cầu trục đạt yêu cầu khi vừa đủ khả năng chịu lực, vừa đủ cứng, vừa ổn định trong quá trình cầu trục di chuyển.',
        paragraphs: [
          'Khác với dầm sàn thông thường, dầm cầu trục chịu tải tập trung từ bánh xe, tải thay đổi vị trí và lực ngang do hãm hoặc lệch ray. Vì vậy bài toán không chỉ là “dầm có gãy không”, mà còn là “dầm có võng, rung, xoắn hoặc mất ổn định không”.',
          'Với nhà xưởng dùng kết cấu thép, TCVN 5575:2024 là tiêu chuẩn nền để kiểm tra cấu kiện thép. TCVN 2737:2023 được dùng khi xác định tải trọng, tác động và tổ hợp tải. Không nên tự gán số điều khoản nếu chưa mở bản tiêu chuẩn chính thức.'
        ],
        bullets: [
          'Kiểm tra bền: ứng suất uốn, cắt, ép cục bộ và tương tác nếu có.',
          'Kiểm tra ổn định: mất ổn định tổng thể, cục bộ bản cánh, bản bụng và ảnh hưởng xoắn.',
          'Kiểm tra độ võng: bảo đảm ray làm việc ổn định và cầu trục vận hành êm.',
          'Kiểm tra cấu tạo: sườn tăng cứng, liên kết ray, liên kết vào cột, dầm hãm khi cần.'
        ]
      },
      {
        heading: 'Quy trình tính toán từng bước',
        bluf:
          'Cách làm an toàn là đi từ dữ liệu cầu trục đến mô hình tải, rồi mới chọn tiết diện và kiểm tra.',
        orderedSteps: [
          'Thu thập dữ liệu đầu vào: sức nâng, khẩu độ, nhịp dầm, số bánh xe, khoảng cách bánh xe, trọng lượng xe con, trọng lượng cầu trục, tốc độ di chuyển và loại chế độ làm việc.',
          'Xác định tải bánh xe lớn nhất: quy đổi tải nâng, tự trọng cầu trục và vị trí xe con bất lợi về phản lực bánh xe trên ray.',
          'Lập sơ đồ tính: thường xem dầm cầu trục như dầm đơn giản hoặc dầm liên tục tùy cấu tạo gối và hệ cột thực tế.',
          'Tổ hợp tải: xét tải đứng, tải ngang do hãm, tải ngang do lệch ray và các tác động khác theo TCVN 2737:2023.',
          'Tính nội lực: tìm mô men uốn, lực cắt, xoắn nếu có và vị trí bất lợi do tải bánh xe di động.',
          'Chọn tiết diện sơ bộ: thép hình I, tổ hợp hàn hoặc dầm hộp tùy nhịp, sức nâng và yêu cầu chế tạo.',
          'Kiểm tra theo TCVN 5575:2024: bền, ổn định, độ mảnh bản, sườn tăng cứng và liên kết.',
          'Kiểm tra độ võng và cấu tạo ray: nếu độ võng hoặc dao động lớn, cần tăng độ cứng thay vì chỉ tăng cường độ thép.',
          'Hoàn thiện bản vẽ và thuyết minh: ghi rõ giả thiết, tải trọng, tiêu chuẩn áp dụng và giới hạn sử dụng.'
        ]
      },
      {
        heading: 'Bảng kiểm nhanh dữ liệu đầu vào',
        bluf:
          'Trước khi bấm máy tính, cần chắc rằng dữ liệu cầu trục không bị thiếu; thiếu một thông số bánh xe có thể làm kết quả lệch nhiều.',
        table: {
          caption: 'Bảng kiểm dữ liệu đầu vào cho tính dầm cầu trục',
          note:
            'Bảng này là checklist sơ bộ để chuẩn bị hồ sơ, không thay thế dữ liệu catalogue cầu trục hoặc thuyết minh thiết kế.',
          headers: ['Nhóm dữ liệu', 'Cần có', 'Vì sao quan trọng'],
          rows: [
            ['Cầu trục', 'Sức nâng, tự trọng cầu, tự trọng xe con', 'Dùng để xác định tải đứng lên bánh xe'],
            ['Bánh xe', 'Số bánh, khoảng cách bánh, đường kính bánh', 'Quyết định phản lực tập trung và vùng ép cục bộ'],
            ['Nhà xưởng', 'Nhịp dầm, bước cột, cao trình ray', 'Quyết định sơ đồ tính và độ võng'],
            ['Vận hành', 'Tốc độ, tần suất, chế độ làm việc', 'Ảnh hưởng tải động, mỏi và yêu cầu cấu tạo'],
            ['Tiêu chuẩn', 'TCVN 5575:2024, TCVN 2737:2023, hồ sơ thiết bị', 'Làm cơ sở chọn tổ hợp và kiểm tra']
          ]
        }
      },
      {
        heading: 'Những lỗi thường gặp khi tính dầm cầu trục',
        bluf:
          'Lỗi hay gặp nhất là chỉ kiểm tra uốn đứng mà bỏ qua tải ngang, độ võng, ép cục bộ và ổn định bản bụng.',
        subsections: [
          {
            heading: 'Chỉ lấy tải nâng mà quên tự trọng cầu trục',
            paragraphs: [
              'Tải nâng chỉ là một phần. Tải lên bánh xe còn phụ thuộc tự trọng cầu trục, xe con và vị trí xe con bất lợi.'
            ]
          },
          {
            heading: 'Không xét tải di động',
            paragraphs: [
              'Tải bánh xe di chuyển dọc dầm nên vị trí mô men và lực cắt lớn nhất không cố định. Cần quét nhiều vị trí bánh xe hoặc dùng công cụ tính phù hợp.'
            ]
          },
          {
            heading: 'Chọn dầm đủ bền nhưng không đủ cứng',
            paragraphs: [
              'Thép cường độ cao có thể giúp giảm ứng suất, nhưng độ võng phụ thuộc nhiều vào mô men quán tính. Nếu ray bị võng quá, cầu trục vẫn vận hành kém dù ứng suất đạt.'
            ]
          }
        ]
      }
    ],
    faq: [
      {
        question: 'Có thể tính dầm cầu trục chỉ bằng công thức dầm đơn giản không?',
        answer:
          'Có thể dùng công thức dầm đơn giản để ước tính sơ bộ, nhưng thiết kế thật cần xét tải bánh xe di động, tổ hợp tải, tải ngang, ổn định và cấu tạo. Với cầu trục lớn hoặc chế độ làm việc nặng, nên dùng mô hình tính chi tiết hơn.'
      },
      {
        question: 'TCVN 5575:2024 có thay thế việc kiểm tra tải trọng không?',
        answer:
          'Không. TCVN 5575:2024 chủ yếu dùng cho thiết kế kết cấu thép, còn tải trọng và tổ hợp tải cần tham chiếu TCVN 2737:2023 cùng catalogue thiết bị.'
      },
      {
        question: 'Khi nào cần kiểm tra mỏi dầm cầu trục?',
        answer:
          'Nên xem xét mỏi khi cầu trục làm việc thường xuyên, tải lặp lớn, chế độ vận hành nặng hoặc có yêu cầu tuổi thọ rõ ràng. Đây là phần cần kỹ sư kết cấu kiểm tra theo hồ sơ vận hành thực tế.'
      }
    ],
    references: [
      {
        label: 'TCVN 5575:2024',
        note: 'Tiêu chuẩn thiết kế kết cấu thép, dùng làm cơ sở kiểm tra cấu kiện dầm thép.'
      },
      {
        label: 'TCVN 2737:2023',
        note: 'Tiêu chuẩn tải trọng và tác động, dùng khi xác định tải và tổ hợp tải cho công trình.'
      },
      {
        label: 'Catalogue nhà sản xuất cầu trục',
        note: 'Nguồn chính xác cho tải bánh xe, khoảng cách bánh xe, tự trọng cầu và xe con.'
      }
    ]
  },
  {
    title: 'Công thức tính toán dầm cầu trục chi tiết',
    slug: '/huong-dan/cong-thuc-tinh-dam-cau-truc',
    description:
      'Tổng hợp các công thức cốt lõi để tính tải trọng, nội lực, ứng suất, độ võng, đặc trưng tiết diện và hệ số kiểm tra dầm cầu trục.',
    summary:
      'BLUF: Công thức tính dầm cầu trục thường đi theo chuỗi: xác định tải bánh xe, tính nội lực bất lợi, tính đặc trưng tiết diện, kiểm tra ứng suất, kiểm tra độ võng và kiểm tra ổn định. Các công thức dưới đây dùng cho kiểm tra sơ bộ; khi lập hồ sơ thật cần đối chiếu TCVN 5575:2024, TCVN 2737:2023 và dữ liệu cầu trục của nhà sản xuất.',
    updatedAt: '2026-06-05',
    readingTime: '9 phút đọc',
    sections: [
      {
        heading: 'Các ký hiệu chính trong công thức dầm cầu trục',
        bluf:
          'Trước khi thay số, cần thống nhất đơn vị. Sai đơn vị giữa mm, cm, kg và kN là nguyên nhân rất thường làm kết quả sai.',
        table: {
          caption: 'Bảng ký hiệu thường dùng trong tính dầm cầu trục',
          note:
            'Bảng dùng cho cách đọc công thức sơ bộ. Khi dùng trong hồ sơ thiết kế, hãy ghi rõ hệ đơn vị đang áp dụng.',
          headers: ['Ký hiệu', 'Ý nghĩa', 'Đơn vị hay dùng'],
          rows: [
            ['L', 'Nhịp tính toán của dầm cầu trục', 'm, cm hoặc mm'],
            ['P_nang', 'Tải nâng danh nghĩa của cầu trục', 'kg hoặc kN'],
            ['P_thietbi', 'Tự trọng xe con, pa lăng hoặc thiết bị nâng', 'kg hoặc kN'],
            ['q', 'Tải phân bố do tự trọng dầm hoặc tải phụ', 'kg/m, kN/m'],
            ['Mmax', 'Mô men uốn lớn nhất tại tiết diện nguy hiểm', 'kg.cm hoặc kN.m'],
            ['Qmax', 'Lực cắt lớn nhất tại tiết diện nguy hiểm', 'kg hoặc kN'],
            ['Jx, Jy', 'Mô men quán tính tiết diện theo trục x và y', 'cm4 hoặc mm4'],
            ['Wx, Wy', 'Mô đun chống uốn của tiết diện', 'cm3 hoặc mm3'],
            ['sigma', 'Ứng suất uốn tính toán', 'kg/cm2 hoặc MPa'],
            ['f', 'Độ võng lớn nhất của dầm', 'cm hoặc mm']
          ],
        },
      },
      {
        heading: 'Công thức tải trọng và nội lực dùng để tính dầm cầu trục',
        bluf:
          'Tải trọng đưa vào dầm cần gồm tải nâng, tải thiết bị, tự trọng dầm và các hệ số động hoặc lực ngang khi có yêu cầu.',
        table: {
          caption: 'Nhóm công thức tải trọng và nội lực sơ bộ',
          note:
            'Các công thức này dùng để kiểm tra nhanh dầm đơn giản. Với tải bánh xe di động, cần quét vị trí bánh xe để tìm Mmax và Qmax bất lợi.',
          headers: ['Nội dung', 'Công thức sơ bộ', 'Ghi chú sử dụng'],
          rows: [
            ['Tải đứng quy đổi', 'P = P_nang + P_thietbi', 'Cần cộng thêm hệ số động nếu tiêu chuẩn hoặc hồ sơ thiết bị yêu cầu.'],
            ['Tải phân bố do tự trọng', 'q = gamma_thep x A', 'A là diện tích tiết diện; gamma_thep thường lấy theo trọng lượng riêng thép.'],
            ['Mô men do tải tập trung giữa nhịp', 'Mmax = P x L / 4', 'Dùng cho dầm đơn giản có một tải tập trung ở giữa nhịp.'],
            ['Lực cắt do tải tập trung giữa nhịp', 'Qmax = P / 2', 'Dùng cho kiểm tra cắt sơ bộ ở gối.'],
            ['Mô men do tải phân bố đều', 'Mmax = q x L^2 / 8', 'Dùng cho tự trọng dầm hoặc tải phân bố đều.'],
            ['Lực cắt do tải phân bố đều', 'Qmax = q x L / 2', 'Dùng cho dầm đơn giản chịu tải phân bố đều.']
          ],
        },
        paragraphs: [
          'Với cầu trục thật, tải bánh xe không đứng yên ở giữa nhịp. Cụm bánh xe di chuyển dọc dầm nên vị trí tạo mô men lớn nhất và vị trí tạo lực cắt lớn nhất có thể khác nhau.',
          'Cách làm thận trọng là đặt cụm bánh xe tại nhiều vị trí, tính M và Q cho từng vị trí, sau đó lấy giá trị bất lợi nhất để kiểm tra tiết diện.'
        ],
      },
      {
        heading: 'Công thức đặc trưng tiết diện dầm thép',
        bluf:
          'Ứng suất và độ võng phụ thuộc mạnh vào Jx, Jy, Wx và Wy. Dầm đủ bền nhưng thiếu Jx vẫn có thể không đạt độ võng.',
        table: {
          caption: 'Công thức đặc trưng tiết diện thường dùng',
          note:
            'Với dầm tổ hợp hàn hoặc tiết diện phức tạp, nên chia tiết diện thành các hình chữ nhật nhỏ rồi dùng định lý chuyển trục.',
          headers: ['Đại lượng', 'Công thức', 'Ý nghĩa'],
          rows: [
            ['Diện tích tiết diện', 'A = tổng Ai', 'Tổng diện tích các bản cánh, bản bụng và chi tiết tham gia chịu lực.'],
            ['Trọng tâm tiết diện', 'yc = tổng(Ai x yi) / tổng Ai', 'Dùng để xác định khoảng cách từ trọng tâm đến mép chịu kéo/nén.'],
            ['Mô men quán tính chuyển trục', 'Jx = tổng(Jxi + Ai x di^2)', 'di là khoảng cách từ trọng tâm phần tử đến trọng tâm toàn tiết diện.'],
            ['Mô đun chống uốn trên', 'Wx_tren = Jx / y_tren', 'Dùng kiểm tra ứng suất mép trên.'],
            ['Mô đun chống uốn dưới', 'Wx_duoi = Jx / y_duoi', 'Dùng kiểm tra ứng suất mép dưới.'],
            ['Bán kính quán tính', 'i = sqrt(J / A)', 'Dùng trong một số kiểm tra ổn định và độ mảnh.']
          ],
        },
      },
      {
        heading: 'Công thức kiểm tra ứng suất, độ võng và hệ số an toàn',
        bluf:
          'Ba chỉ số cần đọc cùng nhau là ứng suất, độ võng và ổn định; không nên kết luận dầm đạt chỉ vì một chỉ số đạt.',
        table: {
          caption: 'Bảng công thức kiểm tra chính',
          note:
            'Ký hiệu sigma_allow, f_allow và các điều kiện ổn định phải lấy theo tiêu chuẩn, yêu cầu dự án hoặc dữ liệu thiết bị phù hợp.',
          headers: ['Kiểm tra', 'Công thức', 'Cách đọc kết quả'],
          rows: [
            ['Ứng suất uốn', 'sigma_u = Mmax / Wx', 'So sánh sigma_u với sigma_allow.'],
            ['Ứng suất cắt sơ bộ', 'tau = Qmax / A_web', 'A_web là diện tích chịu cắt chính của bản bụng.'],
            ['Hệ số ứng suất', 'K_sigma = sigma_allow / sigma_u', 'K_sigma >= 1 thường nghĩa là đạt theo kiểm tra ứng suất sơ bộ.'],
            ['Độ võng do tải tập trung giữa nhịp', 'f = P x L^3 / (48 x E x Jx)', 'Dùng cho dầm đơn giản, tải tập trung giữa nhịp.'],
            ['Độ võng do tải phân bố đều', 'f = 5 x q x L^4 / (384 x E x Jx)', 'Dùng cho dầm đơn giản chịu tải phân bố đều.'],
            ['Hệ số độ võng', 'n_f = f_allow / f', 'n_f >= 1 thường nghĩa là đạt theo điều kiện độ võng sơ bộ.'],
            ['Kiểm tra ổn định sơ bộ', 'K_buckling = sigma_cr / sigma_u', 'Cần đối chiếu công thức ổn định theo TCVN 5575:2024 cho trường hợp cụ thể.']
          ],
        },
      },
      {
        heading: 'Ví dụ tính nhanh để hiểu cách thay số',
        bluf:
          'Ví dụ dưới đây chỉ minh họa cách đọc công thức; không dùng để chốt thiết kế thi công.',
        orderedSteps: [
          'Giả sử dầm đơn giản có nhịp L = 6 m, tải tập trung quy đổi P = 50 kN đặt gần giữa nhịp để ước tính nhanh.',
          'Mô men uốn sơ bộ: Mmax = P x L / 4 = 50 x 6 / 4 = 75 kN.m.',
          'Nếu tiết diện có Wx = 800 cm3, cần đổi đơn vị nhất quán trước khi tính sigma_u = Mmax / Wx.',
          'Nếu ứng suất gần giới hạn cho phép, không nên chỉ tăng mác thép; cần kiểm tra thêm độ võng vì f phụ thuộc E và Jx.',
          'Nếu độ võng không đạt, hướng xử lý thường là tăng chiều cao dầm hoặc chọn tiết diện có Jx lớn hơn.'
        ],
      },
      {
        heading: 'Những lỗi thường gặp khi dùng công thức',
        bluf:
          'Công thức đúng nhưng đơn vị sai hoặc tải đầu vào sai vẫn cho kết quả sai.',
        bullets: [
          'Dùng kg, kN, cm, mm lẫn lộn nhưng không đổi đơn vị trước khi thay số.',
          'Lấy tải nâng P_nang mà quên tự trọng xe con, tự trọng cầu trục và hệ số động.',
          'Dùng công thức tải giữa nhịp cho trường hợp cụm bánh xe thực tế không nằm giữa nhịp.',
          'Chỉ kiểm tra sigma_u mà bỏ qua tau, độ võng, ổn định và cấu tạo sườn tăng cứng.',
          'Dùng bảng tra tiết diện nhưng không kiểm tra lại trọng tâm, Jx, Wx theo kích thước thực tế.'
        ],
      },
    ],
    faq: [
      {
        question: 'Có thể dùng một công thức duy nhất để tính dầm cầu trục không?',
        answer:
          'Không nên. Dầm cầu trục cần nhiều nhóm công thức: tải trọng, nội lực, đặc trưng tiết diện, ứng suất, độ võng và ổn định. Một công thức đơn lẻ không đủ để kết luận dầm đạt.'
      },
      {
        question: 'Công thức M = P x L / 4 có dùng được cho mọi cầu trục không?',
        answer:
          'Không. Công thức này chỉ phù hợp kiểm tra sơ bộ dầm đơn giản với một tải tập trung ở giữa nhịp. Cầu trục thật có tải bánh xe di động nên phải xét vị trí bất lợi của cụm bánh xe.'
      },
      {
        question: 'Vì sao dầm đủ ứng suất nhưng vẫn không đạt?',
        answer:
          'Vì dầm còn phải đạt độ võng, ổn định và cấu tạo ray. Ứng suất phụ thuộc Wx, còn độ võng phụ thuộc Jx; hai điều kiện này không thay thế cho nhau.'
      },
    ],
    references: [
      {
        label: 'TCVN 5575:2024',
        note: 'Cơ sở kiểm tra cấu kiện thép, ứng suất, ổn định và điều kiện cấu tạo.'
      },
      {
        label: 'TCVN 2737:2023',
        note: 'Cơ sở xác định tải trọng, tác động và nguyên tắc tổ hợp tải.'
      },
      {
        label: 'Cơ học kết cấu và sức bền vật liệu',
        note: 'Nguồn nền tảng cho công thức nội lực, ứng suất, độ võng và đặc trưng tiết diện.'
      }
    ]
  },
  {
    title: 'Cách chọn tiết diện dầm cầu trục phù hợp',
    slug: '/huong-dan/chon-tiet-dien-dam-cau-truc',
    description:
      'Hướng dẫn chọn sơ bộ tiết diện dầm cầu trục: thép hình I, dầm tổ hợp hàn, dầm hộp và các tiêu chí kiểm tra trước khi chốt bản vẽ.',
    summary:
      'BLUF: Chọn tiết diện dầm cầu trục không nên chỉ dựa vào nhịp và sức nâng. Cần chọn sơ bộ theo độ cứng, tải bánh xe, chế độ làm việc và khả năng chế tạo, rồi kiểm tra lại theo TCVN 5575:2024 và tải trọng theo TCVN 2737:2023.',
    updatedAt: '2026-06-04',
    readingTime: '7 phút đọc',
    sections: [
      {
        heading: 'Nguyên tắc chọn tiết diện',
        bluf:
          'Tiết diện tốt là tiết diện đủ bền, đủ cứng, dễ chế tạo, dễ lắp ray và không gây khó cho bảo trì.',
        paragraphs: [
          'Dầm cầu trục thường dùng thép hình I, dầm tổ hợp hàn dạng I, dầm hộp hoặc hệ dầm chính kèm dầm hãm. Với nhịp nhỏ và tải nhẹ, thép hình có thể kinh tế. Với nhịp lớn hoặc tải bánh xe lớn, dầm tổ hợp hàn giúp chủ động tăng chiều cao và chiều dày bản.',
          'Không có một bảng tra chung dùng được cho mọi công trình. Các bảng trong bài này chỉ giúp định hướng sơ bộ trước khi tính toán chi tiết.'
        ]
      },
      {
        heading: 'So sánh các dạng tiết diện phổ biến',
        bluf:
          'Thép hình phù hợp bài toán nhỏ và nhanh; dầm tổ hợp hàn phù hợp khi cần tối ưu; dầm hộp phù hợp khi xoắn và tải ngang đáng kể.',
        table: {
          caption: 'So sánh sơ bộ các dạng tiết diện dầm cầu trục',
          note:
            'Đây là hướng dẫn lựa chọn ban đầu. Quyết định cuối cùng phải dựa trên tính toán bền, ổn định, độ võng và cấu tạo liên kết.',
          headers: ['Dạng tiết diện', 'Phù hợp sơ bộ', 'Ưu điểm', 'Điểm cần kiểm tra kỹ'],
          rows: [
            ['Thép hình I/H', 'Nhịp ngắn, tải nhẹ đến vừa', 'Dễ mua, thi công nhanh', 'Độ võng, ổn định cánh nén, ép cục bộ dưới ray'],
            ['Dầm I tổ hợp hàn', 'Nhịp vừa đến lớn, tải bánh xe lớn', 'Tùy chỉnh chiều cao và bản cánh', 'Chất lượng hàn, sườn tăng cứng, ổn định bản mỏng'],
            ['Dầm hộp', 'Cần chống xoắn tốt hoặc tải ngang lớn', 'Độ cứng xoắn tốt, hình dạng gọn', 'Chi phí chế tạo, kiểm tra mối hàn kín, thoát nước và bảo trì'],
            ['Dầm I kèm dầm hãm', 'Cầu trục có lực ngang đáng kể', 'Tăng khả năng chịu tải ngang', 'Liên kết với cột, hệ giằng và truyền lực ngang']
          ]
        }
      },
      {
        heading: 'Quy trình chọn tiết diện sơ bộ',
        bluf:
          'Nên chọn 2 hoặc 3 phương án tiết diện, tính nhanh từng phương án rồi so sánh trọng lượng, độ võng và cấu tạo.',
        orderedSteps: [
          'Xác định nhóm bài toán: tải nhẹ, tải vừa, tải nặng hoặc có lực ngang lớn.',
          'Chọn dạng tiết diện ban đầu: thép hình, tổ hợp hàn, hộp hoặc dầm có dầm hãm.',
          'Ước lượng chiều cao dầm theo nhịp và yêu cầu độ cứng, sau đó chọn bản cánh và bản bụng phù hợp.',
          'Kiểm tra sơ bộ mô men quán tính để tránh tiết diện đủ bền nhưng võng lớn.',
          'Kiểm tra vùng đặt ray: bản cánh trên, sườn tăng cứng, ép cục bộ và đường truyền tải vào bản bụng.',
          'So sánh phương án theo khối lượng thép, độ khó chế tạo, vận chuyển, lắp dựng và bảo trì.'
        ]
      },
      {
        heading: 'Bảng định hướng chọn tiết diện theo tình huống',
        bluf:
          'Nếu chưa có đủ dữ liệu, hãy dùng bảng này như bộ lọc ban đầu, không dùng để chốt kích thước cuối cùng.',
        table: {
          caption: 'Định hướng sơ bộ chọn dạng dầm cầu trục',
          note:
            'Các mức “nhẹ, vừa, nặng” chỉ là mô tả định tính vì tải bánh xe phụ thuộc catalogue cầu trục, không chỉ phụ thuộc sức nâng danh nghĩa.',
          headers: ['Tình huống', 'Dạng tiết diện nên cân nhắc', 'Lý do'],
          rows: [
            ['Nhịp ngắn, cầu trục nhỏ, ít vận hành', 'Thép hình I/H', 'Đơn giản, dễ mua, giảm thời gian chế tạo'],
            ['Nhịp vừa, cần tối ưu khối lượng', 'Dầm I tổ hợp hàn', 'Điều chỉnh được chiều cao và bản cánh theo nội lực'],
            ['Có tải ngang hoặc xoắn đáng kể', 'Dầm hộp hoặc dầm I kèm dầm hãm', 'Tăng độ cứng ngang và độ cứng xoắn'],
            ['Cầu trục vận hành thường xuyên', 'Tổ hợp hàn có cấu tạo kiểm soát mỏi tốt', 'Dễ bố trí sườn, mối nối và chi tiết ray hợp lý']
          ]
        }
      },
      {
        heading: 'Các kiểm tra không được bỏ qua',
        bluf:
          'Sau khi chọn tiết diện, ít nhất phải kiểm tra bền, độ võng, ổn định và cấu tạo ray trước khi đưa vào bản vẽ.',
        bullets: [
          'Ứng suất uốn và cắt theo nội lực bất lợi.',
          'Ổn định cánh nén và bản bụng, nhất là với dầm tổ hợp hàn bản mỏng.',
          'Ép cục bộ và sườn tăng cứng dưới vị trí ray hoặc bánh xe.',
          'Độ võng đứng của dầm và độ lệch ray cho phép theo yêu cầu vận hành.',
          'Liên kết dầm vào cột, dầm hãm, giằng và các chi tiết chống xô lệch ray.'
        ]
      }
    ],
    faq: [
      {
        question: 'Nhịp 18 m nên dùng thép hình hay dầm tổ hợp hàn?',
        answer:
          'Không thể chốt chỉ từ nhịp 18 m. Nếu tải bánh xe nhỏ, thép hình có thể đủ; nếu tải lớn hoặc yêu cầu độ võng chặt, dầm tổ hợp hàn thường linh hoạt hơn. Cần có tải bánh xe và chế độ vận hành để kiểm tra.'
      },
      {
        question: 'Dầm cao hơn có luôn tốt hơn không?',
        answer:
          'Dầm cao thường tăng độ cứng uốn, nhưng không tự động tốt hơn. Dầm quá cao có thể khó chế tạo, vướng kiến trúc, tăng yêu cầu ổn định bản bụng và làm phức tạp liên kết.'
      },
      {
        question: 'Có nên dùng thép cường độ cao để giảm kích thước dầm?',
        answer:
          'Có thể, nhưng phải kiểm tra độ võng. Cường độ thép giúp phần bền, còn độ võng phụ thuộc chủ yếu vào độ cứng tiết diện và mô đun đàn hồi.'
      }
    ],
    references: [
      {
        label: 'TCVN 5575:2024',
        note: 'Cơ sở kiểm tra khả năng chịu lực, ổn định và cấu tạo của cấu kiện thép.'
      },
      {
        label: 'TCVN 2737:2023',
        note: 'Cơ sở xác định tải trọng, tác động và tổ hợp tải khi thiết kế công trình.'
      },
      {
        label: 'Hồ sơ chế tạo và catalogue cầu trục',
        note: 'Cung cấp tải bánh xe và dữ liệu vận hành để chọn tiết diện sát thực tế.'
      }
    ]
  },
  {
    title: 'Cách kiểm tra độ võng dầm cầu trục',
    slug: '/huong-dan/kiem-tra-do-vong-dam-cau-truc',
    description:
      'Giải thích độ võng dầm cầu trục, cách tính sơ bộ, dữ liệu cần có và vì sao phải kiểm tra độ cứng bên cạnh kiểm tra ứng suất.',
    summary:
      'BLUF: Độ võng dầm cầu trục phải được kiểm tra vì ray cần giữ ổn định để cầu trục chạy êm và an toàn. Không nên dùng một giới hạn truyền miệng cho mọi dự án; hãy kiểm tra theo tiêu chuẩn, hồ sơ thiết bị và yêu cầu vận hành cụ thể.',
    updatedAt: '2026-06-04',
    readingTime: '6 phút đọc',
    sections: [
      {
        heading: 'Độ võng dầm cầu trục là gì?',
        bluf:
          'Độ võng là độ chuyển vị xuống của dầm khi chịu tải; với dầm cầu trục, độ võng ảnh hưởng trực tiếp đến ray và vận hành của thiết bị.',
        paragraphs: [
          'Một dầm có thể đủ bền nhưng vẫn không phù hợp nếu võng quá nhiều. Khi dầm võng lớn, ray có thể không còn đúng cao trình, bánh xe chạy không êm, phát sinh rung, mài mòn và tải phụ.',
          'TCVN 5575:2024 và các yêu cầu thiết kế liên quan cần được dùng để kiểm tra cấu kiện thép. Tải trọng đưa vào bài toán độ võng cần xác định từ TCVN 2737:2023 và dữ liệu thiết bị.'
        ]
      },
      {
        heading: 'Cần dữ liệu gì để kiểm tra độ võng?',
        bluf:
          'Muốn kiểm tra độ võng đúng, cần biết tải bánh xe, vị trí bánh xe, sơ đồ dầm và mô men quán tính tiết diện.',
        bullets: [
          'Nhịp dầm và loại gối tựa: dầm đơn giản, liên tục hoặc có liên kết đặc biệt.',
          'Tải bánh xe lớn nhất và khoảng cách giữa các bánh xe.',
          'Vị trí xe con bất lợi để tạo phản lực bánh xe lớn.',
          'Mô men quán tính của tiết diện dầm theo phương chịu uốn.',
          'Mô đun đàn hồi của thép và điều kiện làm việc của ray.'
        ]
      },
      {
        heading: 'Quy trình kiểm tra độ võng',
        bluf:
          'Kiểm tra độ võng là bài toán độ cứng: đặt tải ở vị trí bất lợi, tính chuyển vị lớn nhất rồi so với giới hạn cho phép.',
        orderedSteps: [
          'Xác định tải dùng cho kiểm tra độ võng, phân biệt với tải dùng cho kiểm tra bền nếu tiêu chuẩn hoặc hồ sơ thiết bị yêu cầu.',
          'Đặt hệ bánh xe tại các vị trí gây võng lớn nhất trên dầm.',
          'Tính độ võng bằng công thức dầm, mô hình phần tử hữu hạn hoặc công cụ tính đã kiểm chứng.',
          'So sánh với giới hạn cho phép trong tiêu chuẩn, yêu cầu chủ đầu tư và khuyến cáo của nhà sản xuất cầu trục.',
          'Nếu không đạt, tăng mô men quán tính tiết diện, đổi dạng dầm, bổ sung cấu tạo hoặc thay đổi sơ đồ chịu lực.'
        ]
      },
      {
        heading: 'Bảng chẩn đoán khi độ võng không đạt',
        bluf:
          'Khi độ võng vượt giới hạn, giải pháp thường hiệu quả nhất là tăng độ cứng tiết diện hoặc thay đổi sơ đồ chịu lực.',
        table: {
          caption: 'Chẩn đoán sơ bộ nguyên nhân độ võng lớn',
          note:
            'Bảng này dùng để định hướng xử lý ban đầu. Phương án cuối cùng cần tính lại toàn bộ bền, ổn định, liên kết và cấu tạo.',
          headers: ['Dấu hiệu', 'Nguyên nhân thường gặp', 'Hướng xử lý sơ bộ'],
          rows: [
            ['Ứng suất đạt nhưng võng không đạt', 'Tiết diện thiếu độ cứng', 'Tăng chiều cao dầm hoặc chọn tiết diện có mô men quán tính lớn hơn'],
            ['Võng lớn tại vùng giữa nhịp', 'Tải bánh xe đặt bất lợi, nhịp dài', 'Tối ưu tiết diện, xem xét dầm liên tục hoặc bổ sung gối nếu hợp lý'],
            ['Ray rung hoặc bánh xe mòn nhanh', 'Độ võng, lệch ray hoặc tải ngang chưa được kiểm soát', 'Kiểm tra lại cao trình ray, dầm hãm và liên kết ray'],
            ['Dầm tổ hợp hàn bị biến dạng cục bộ', 'Bản bụng mảnh hoặc thiếu sườn', 'Bổ sung sườn tăng cứng và kiểm tra ổn định cục bộ']
          ]
        }
      },
      {
        heading: 'Không nên chốt giới hạn độ võng bằng một con số duy nhất',
        bluf:
          'Các tỷ số như L/600 hoặc L/700 chỉ nên xem như kinh nghiệm tham khảo nếu chưa đối chiếu tiêu chuẩn và hồ sơ thiết bị.',
        paragraphs: [
          'Trong thực tế, giới hạn độ võng phụ thuộc loại cầu trục, chế độ vận hành, yêu cầu ray, tiêu chuẩn áp dụng và yêu cầu của chủ đầu tư. Vì vậy bài viết này không đưa một con số duy nhất như giá trị thiết kế bắt buộc.',
          'Cách làm thận trọng là ghi rõ nguồn giới hạn đã dùng trong thuyết minh: tiêu chuẩn, chỉ dẫn thiết bị hoặc yêu cầu dự án. Nếu dùng giá trị kinh nghiệm để ước tính sơ bộ, cần ghi rõ đó chưa phải kết quả thiết kế cuối cùng.'
        ]
      }
    ],
    faq: [
      {
        question: 'Dầm cầu trục đủ bền rồi có cần kiểm tra độ võng nữa không?',
        answer:
          'Có. Kiểm tra bền cho biết dầm có chịu lực được không, còn kiểm tra độ võng cho biết dầm có đủ cứng để ray và cầu trục vận hành ổn định không.'
      },
      {
        question: 'Có thể giảm độ võng bằng cách tăng mác thép không?',
        answer:
          'Không hiệu quả trong đa số trường hợp. Độ võng phụ thuộc nhiều vào mô đun đàn hồi và mô men quán tính tiết diện; tăng mác thép chủ yếu giúp phần ứng suất cho phép, không làm dầm cứng hơn đáng kể.'
      },
      {
        question: 'Nên kiểm tra độ võng ở vị trí tải nào?',
        answer:
          'Nên kiểm tra vị trí hệ bánh xe gây chuyển vị lớn nhất, thường cần quét nhiều vị trí dọc dầm. Không nên chỉ đặt tải ở giữa nhịp nếu khoảng cách bánh xe và phản lực không đối xứng.'
      }
    ],
    references: [
      {
        label: 'TCVN 5575:2024',
        note: 'Dùng để kiểm tra cấu kiện thép, bao gồm yêu cầu về khả năng chịu lực và điều kiện làm việc.'
      },
      {
        label: 'TCVN 2737:2023',
        note: 'Dùng để xác định tải trọng và tác động đưa vào bài toán kiểm tra.'
      },
      {
        label: 'Tài liệu kỹ thuật cầu trục',
        note: 'Nguồn cần có để xác định phản lực bánh xe, yêu cầu ray và điều kiện vận hành.'
      }
    ]
  }
];

export const guideArticleSlugs = guideArticles.map((article) => article.slug);

export const getGuideArticleBySlug = (slug: string): GuideArticle | undefined => {
  const normalizedSlug = slug.endsWith('/') && slug.length > 1 ? slug.slice(0, -1) : slug;
  return guideArticles.find((article) => article.slug === normalizedSlug);
};
