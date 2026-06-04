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

export type GuideSection = {
  heading: string;
  bluf?: string;
  paragraphs?: string[];
  bullets?: string[];
  orderedSteps?: string[];
  subsections?: GuideSubsection[];
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
