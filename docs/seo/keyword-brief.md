# Brief từ khóa và phạm vi nội dung

- Vai trò: `keyword-researcher`; model được giao: `gpt-6.1-sol`, reasoning `high`.
- Ngày khảo sát: 06/10/2026 UTC.
- Website: https://cautruc.kythuatvang.com/.
- Thị trường mục tiêu: Việt Nam; nội dung tiếng Việt, `vi-VN`.
- Độc giả giả định theo yêu cầu: kỹ sư và sinh viên cần tính sơ bộ dầm cầu trục.
- Phạm vi: khảo sát kết quả tìm kiếm mẫu, đọc mã tính toán và ánh xạ các URL hiện có; không thay đổi thuật toán.

## Kết luận để triển khai

Giữ từ khóa chính **tính toán dầm cầu trục online** cho trang công cụ `/`, đồng thời nói rõ công cụ đang hỗ trợ **dầm chính cầu trục** và có mô đun dầm biên. Các bài hướng dẫn hiện có phần lớn giải thích **dầm đỡ ray chạy dọc nhà xưởng**, nên cần một đoạn phân biệt phạm vi trước khi dẫn người đọc sang công cụ.

Không đưa “theo TCVN 5575:2024”, “chính xác”, “kiểm tra đầy đủ”, “đạt tiêu chuẩn” vào lời hứa chính của công cụ. Mã hiện dùng mô hình giản lược và có kiểm tra tham chiếu Eurocode; nghiên cứu này chưa xác nhận sự phù hợp đầy đủ với TCVN hoặc thiết kế thiết bị nâng. Có thể nhắc tên tiêu chuẩn trong nội dung giáo dục với phạm vi và nguồn rõ ràng.

## Bằng chứng phạm vi từ repository

| Nguồn hiện có | Quan sát | Hệ quả cho nội dung |
|---|---|---|
| `services/calculationService.ts`, `calculateBeamProperties` | Nhập tải nâng `P_nang`, tự trọng xe con `P_thietbi`, khẩu độ `L`; gộp tải tập trung giữa nhịp; có mô men tự trọng phân bố | Mô hình sơ bộ dầm chính, không phải bộ giải hệ tải bánh xe di động trên dầm đường chạy |
| `services/calculationService.ts`, `calculateDoubleBeamProperties` | Chia tải nâng và tự trọng thiết bị cho hai dầm | Phù hợp mô tả tính sơ bộ dầm chính cấu hình dầm đôi |
| `components/CraneBeamCalculator.tsx` và bản dịch tiếng Việt | Các tab dầm đơn, dầm đôi, I, V, dầm biên; ô tải nâng, tự trọng xe con | Viết lời giới thiệu theo chức năng thực tế; không tạo landing page riêng cho mỗi tab khi chưa có URL riêng |
| `services/calculationService.ts` | Có giới hạn độ võng theo chế độ trong mã; kiểm tra tiết diện/cánh và sườn tham chiếu EN 1993 | Chỉ nói “kiểm tra sơ bộ ứng suất, độ võng và ổn định cục bộ”; không tự gán các giới hạn trong mã cho TCVN |
| `src/geo/guideContent.ts`, bài định nghĩa, tải trọng, quy trình | Nhấn mạnh dầm cố định đỡ ray, bánh xe, vai cột, dầm hãm | Các bài này phải nêu rõ phạm vi dầm đỡ ray; không đổi toàn bộ sang dầm chính chỉ để khớp công cụ |
| `src/geo/faqContent.ts` và `src/geo/seo.ts` | Định nghĩa, metadata và mô tả tính năng chưa đồng nhất | Đồng bộ title, description, intro, FAQ và schema với lời giới thiệu đã chọn |

Nhận định về mô hình công cụ là suy luận từ mã đã đọc, không phải chứng nhận thiết kế. Không sửa công thức hoặc giá trị kiểm tra trong đợt SEO này.

## Phương pháp và kết quả tìm kiếm mẫu

Đã tìm bằng công cụ web với các truy vấn tiếng Việt: `tính toán dầm cầu trục online`, `tính toán dầm chính cầu trục dầm hộp`, `tính dầm đỡ ray cầu trục tải bánh xe`, `"tính toán dầm cầu trục" online`, `"tính toán" "dầm chính" "cầu trục"`, `"dầm cầu trục" "đỡ ray"`, `"tính toán dầm chính cầu trục"`, `"tính dầm cầu trục" "online"`, `"tính dầm cầu trục" "Excel"`. Dùng cả hai nguồn tìm kiếm để kiểm tra chéo vì lần tìm ban đầu trả nhiều kết quả không liên quan.

Locale ở đây là **thị trường nội dung mục tiêu**. Công cụ tìm kiếm không cung cấp cấu hình vị trí Google Việt Nam, loại thiết bị hoặc ảnh SERP có thứ hạng; đây không phải báo cáo Top 10 hay vị trí website trên Google.

Các URL dưới đây thực sự xuất hiện trong mẫu. Những trang đánh dấu “đã mở” được đọc thêm; các trang khác chỉ dùng làm bằng chứng loại nội dung trong kết quả tìm kiếm. Không dùng công thức trên trang đối thủ để xác nhận tiêu chuẩn của công cụ.

| URL mẫu | Loại và chủ đề quan sát | Cách dùng trong brief |
|---|---|---|
| https://etdcrane.com/tinh-toan-dam-do-ray-cho-cau-truc-cong-truc/ | Nhà cung cấp; tính dầm đỡ ray, sơ đồ và tải di động; đã mở | Bằng chứng ý định runway khác dầm chính |
| https://hattesale.com/san-pham/tinh-dam-cau-truc-theo-tcvn-5575-2024.htm | Nhà phát triển phần mềm; Excel, thuyết minh và video; đã mở | Người tìm “phần mềm/tính dầm” có thể muốn công cụ, file và quy trình kiểm tra |
| https://thuvienketcau.com/tinh-dam-cau-truc-55752024/ | Bài hướng dẫn và file PDF/Excel; quan sát qua kết quả tìm kiếm | Ý định kiến thức kèm tải file; không hứa cung cấp Excel nếu sản phẩm chỉ xuất PDF |
| https://cautructhailong.com.vn/dam-cau-truc-dinh-nghia-phan-loai-cau-tao-va-cach-tinh.html | Nhà sản xuất; định nghĩa, phân loại, tính toán và ảnh các bộ phận | Truy vấn rộng trộn nội dung thiết bị với kết cấu nhà xưởng |
| https://banquyensoftware.com/dam-do-ray-cau-truc.html | Bài giới thiệu dầm ray và phần mềm thiết kế | Biến thể “dầm đỡ ray cầu trục” nên thuộc bài hướng dẫn về đường chạy |
| https://lilama18-1.com.vn/cau-truc-tong-quan-phan-loai-va-ung-dung-trong-thuc-te.html | Nhà sản xuất; phân biệt dầm chính, dầm biên; đã mở | Nguồn gốc về cấu tạo để hỗ trợ cách gọi bộ phận |
| https://jmst.vimaru.edu.vn/index.php/jmst/article/download/181/179 | Bài nghiên cứu 2021 về thiết kế tối ưu dầm chính cầu trục; đã mở PDF | Nguồn nghiên cứu gốc phân biệt dầm chính với dầm dọc và mô hình dầm chính sơ bộ |
| https://www.youtube.com/watch?v=XESNBsI9aiU | Video tính dầm cầu trục TCVN 5575:2024 | Mẫu có nội dung học qua video; không xác nhận vị trí/rich result |

Suy luận từ mẫu: kết quả bao gồm bài giải thích của nhà sản xuất, tài liệu kỹ thuật, file Excel và video. Trang có công cụ dùng ngay, chỉ rõ giả thiết và nối với hướng dẫn đọc đầu vào có khác biệt hữu ích. Chưa thể kết luận công cụ online ít cạnh tranh, lượng tìm lớn hoặc thứ hạng dễ đạt. Chưa đo đầy đủ độ dài bài đối thủ, People Also Ask hoặc featured snippet.

## Ánh xạ từ khóa và ý định vào URL hiện có

Không tạo URL mới trong đợt này. Giữ slug hiện có; tiêu đề và đoạn mở đầu xác định rõ nội dung để giảm cạnh tranh nội bộ.

| URL | Từ khóa chính đề xuất | Biến thể hỗ trợ | Ý định và nhiệm vụ riêng |
|---|---|---|---|
| `/` | tính toán dầm cầu trục online | công cụ tính dầm cầu trục, tính sơ bộ dầm chính cầu trục, tính dầm hộp cầu trục | Dùng công cụ: nhập liệu, đọc ứng suất/độ võng, xuất PDF |
| `/faq` | câu hỏi thường gặp về tính dầm cầu trục | cách dùng công cụ tính dầm, đơn vị nhập liệu | Hỗ trợ dùng công cụ; trả lời ngắn và dẫn đến bài sâu |
| `/huong-dan/dam-cau-truc-la-gi` | dầm cầu trục là gì | dầm chính cầu trục, dầm đỡ ray cầu trục, dầm biên | Kiến thức cơ bản: phân biệt bộ phận trước khi tính |
| `/huong-dan/tai-trong-dam-cau-truc` | tải trọng dầm đỡ ray cầu trục | tải bánh xe cầu trục, tải ngang dầm cầu trục | Chuẩn bị dữ liệu đường chạy; phân biệt tải nâng với phản lực bánh xe |
| `/huong-dan/tinh-toan-dam-cau-truc` | cách tính dầm đỡ ray cầu trục | quy trình tính dầm cầu trục nhà xưởng | Hướng dẫn quy trình đường chạy; không sao chép landing công cụ |
| `/huong-dan/cong-thuc-tinh-dam-cau-truc` | công thức tính dầm cầu trục | mô men dầm, ứng suất uốn, đặc trưng tiết diện | Tra ký hiệu/công thức và giới hạn mô hình; chỉ rõ công thức dầm đơn giản khác bài toán tải bánh xe di động |
| `/huong-dan/chon-tiet-dien-dam-cau-truc` | chọn tiết diện dầm cầu trục | thép I cầu trục, dầm hộp, dầm tổ hợp hàn | So sánh phương án sơ bộ; nêu loại bộ phận được xét |
| `/huong-dan/kiem-tra-do-vong-dam-cau-truc` | kiểm tra độ võng dầm cầu trục | độ võng dầm chính, độ võng dầm đỡ ray | Giải thích độ cứng và điều kiện áp dụng giới hạn; tránh một giới hạn chung |

Từ khóa dài là **đề xuất theo ý định**, không phải danh sách từ khóa đã có lượng tìm xác nhận. Không tối ưu cho “báo giá cầu trục”, “mua cầu trục”, “kiểm định cầu trục”, “file Excel miễn phí” khi sản phẩm không thực hiện các nhiệm vụ đó. Không mở hàng loạt trang 5 tấn/10 tấn/20 tấn khi chưa có ví dụ, giả thiết và dữ liệu riêng.

## Bản nháp metadata và intro để writer triển khai

### Trang chủ

- Title khuyến nghị: **Tính toán dầm cầu trục online | Kỹ Thuật Vàng**.
- Description: **Tính sơ bộ dầm chính cầu trục với dữ liệu tiết diện, tải nâng và xe con. Xem ứng suất, độ võng, ổn định cục bộ và xuất báo cáo PDF.**
- H1: **Công cụ tính toán dầm cầu trục online**.
- Intro: **Nhập kích thước tiết diện, khẩu độ, tải nâng và tự trọng xe con để tính sơ bộ dầm chính cầu trục. Công cụ hiển thị đặc trưng tiết diện, ứng suất, độ võng, kiểm tra ổn định cục bộ và hỗ trợ xuất báo cáo PDF.**
- Scope note ngay gần intro: **Dầm chính đi cùng cầu trục và nhận tải từ pa lăng hoặc xe con. Dầm đỡ ray chạy dọc nhà xưởng là cấu kiện khác, nhận phản lực bánh xe cầu trục; các bài hướng dẫn về tải bánh xe cần được đọc theo phạm vi này.**
- CTA chính: **Nhập dữ liệu tính dầm** hoặc giữ nút tính toán hiện có. CTA hướng dẫn: **Phân biệt dầm chính và dầm đỡ ray**.

Kiểm tra chức năng export PDF trước khi giữ claim PDF trong tất cả metadata. Độ dài title/description là hướng dẫn hiển thị, không phải điều kiện xếp hạng. Không lặp “online”, “miễn phí”, “TCVN” chỉ để đạt mật độ từ khóa.

### Bài định nghĩa

- Title: **Dầm cầu trục là gì? Dầm chính, dầm biên và dầm đỡ ray**.
- Description: **Phân biệt dầm chính, dầm biên và dầm đỡ ray cầu trục; hiểu đường truyền tải và dữ liệu cần chuẩn bị trước khi tính toán.**
- Đoạn mở đầu đề xuất: **Cần xác định bộ phận đang xét khi dùng tên “dầm cầu trục”. Dầm chính đỡ pa lăng hoặc xe con và đi cùng cầu trục; dầm biên nối với dầm chính và mang bánh xe di chuyển; dầm đỡ ray là cấu kiện cố định dọc nhà xưởng. Phần hướng dẫn kết cấu nhà xưởng dưới đây tập trung vào dầm đỡ ray. Công cụ trên trang chủ hỗ trợ tính sơ bộ dầm chính và có mô đun dầm biên.**
- Đổi riêng H2/định nghĩa đang nói “dầm cầu trục là dầm đỡ ray” thành **Dầm đỡ ray cầu trục là gì?**; giữ nội dung kỹ thuật còn phù hợp với phạm vi đó.

### Các bài hướng dẫn và FAQ

- Tải trọng: title **Tải trọng dầm đỡ ray cầu trục: dữ liệu cần chuẩn bị**; intro nói rõ tải bánh xe là dữ liệu của dầm đường chạy, khác tải nâng/xe con nhập vào mô hình dầm chính.
- Quy trình: title **Cách tính dầm đỡ ray cầu trục trong nhà xưởng**; mở đầu “Bài này trình bày quy trình cho dầm đỡ ray cố định của nhà xưởng. Công cụ trang chủ dùng mô hình sơ bộ dầm chính; không tự động thay thế bài toán hệ tải bánh xe di động của dầm đường chạy.”
- Công thức: giữ từ khóa rộng; thêm chú thích phạm vi cạnh công thức tải tập trung giữa nhịp. Không thay các công thức hoặc hệ số vì lý do SEO.
- FAQ “Dầm cầu trục là gì?”: dùng phân biệt ba bộ phận ở trên. FAQ tiêu chuẩn: mô tả là công cụ tính sơ bộ, cần đối chiếu giả thiết và tài liệu gốc; tránh tuyên bố toàn bộ kiểm tra theo TCVN.
- Khi đổi copy, đồng bộ metadata trong `src/geo/seo.ts`, nội dung `guideContent.ts`, `faqContent.ts`, trang chủ và HTML/schema tĩnh. Không để schema tiếp tục mô tả trang chủ là máy tính dầm đỡ ray.

## Nội dung, liên kết và kiểm tra chất lượng

Ưu tiên sửa sự rõ ràng của phạm vi trước khi thêm bài hoặc tăng độ dài. Trang công cụ chỉ cần intro ngắn, chú thích đơn vị/giả thiết và liên kết đến các bài phục vụ đầu vào. Các bài hiện có không cần kéo dài đến 2.000–3.000 từ vì một heuristic. Nên dùng bảng ba loại dầm ở bài định nghĩa và bảng đầu vào/kết quả thật ở trang chủ.

Liên kết ưu tiên: trang chủ → bài phân biệt loại dầm, bài công thức và bài độ võng; bài tải trọng đường chạy → bài quy trình đường chạy và định nghĩa; FAQ → đúng bài giải quyết câu hỏi. Anchor nêu nhiệm vụ cụ thể, ví dụ “dữ liệu tải bánh xe cho dầm đỡ ray”, không dùng một anchor giống nhau cho mọi URL.

Nguồn kỹ thuật chính có thể dẫn: bài nghiên cứu gốc trên `jmst.vimaru.edu.vn` cho mô hình dầm chính; nội dung nhà sản xuất ETD và LILAMA cho cấu tạo/phạm vi sản phẩm. Các trang thương mại/đối thủ trong mẫu không phải nguồn xác nhận điều khoản TCVN. Khi cần công bố hệ số hoặc giới hạn tiêu chuẩn, cần bản gốc đã kiểm tra; tìm kiếm lần này chưa xác nhận từng điều khoản.

Áp dụng năm mô đun SEO analysis:

| Mô đun | Kết quả / giới hạn |
|---|---|
| Ý định | Đã phân biệt trang công cụ với hướng dẫn kết cấu đường chạy |
| Từ khóa | Có ánh xạ một nhiệm vụ chính mỗi URL; chưa đo mật độ và không áp mục tiêu 1–2% bắt buộc |
| Độ sâu | Có khảo sát chủ đề đối thủ mẫu; chưa đo đầy đủ độ dài nội dung đối thủ |
| Khả năng đọc | Ưu tiên tiếng Việt rõ, giải thích tên bộ phận và đơn vị; Flesch/English grade N/A |
| Rubric | Không chấm tổng 100 điểm từ nghiên cứu từ khóa vì chưa kiểm tra kỹ thuật SEO/UX sau triển khai |

Volume, KD, CTR, tốc độ tăng trưởng và thứ hạng hiện tại: **chưa có dữ liệu**. Không tính điểm ưu tiên tám yếu tố trên dữ liệu thiếu. Thứ tự công việc dựa trên sai lệch phạm vi quan sát được: (1) thống nhất trang chủ/định nghĩa/schema, (2) gắn nhãn phạm vi hướng dẫn, (3) phân biệt ý định và liên kết, (4) đo hiệu quả bằng dữ liệu tìm kiếm thật khi có quyền truy cập.

Handoff cho writer: thực hiện copy ngắn và chú thích phạm vi ở các vị trí trên; giữ nguyên công thức/nội dung kỹ thuật đã phù hợp với dầm đỡ ray. Handoff cho optimizer/lead: đọc lại HTML phát ra của từng URL để title, description, H1 và schema cùng phạm vi; xác minh tính năng PDF và đường dẫn. Brief này không chứng nhận publication readiness, tiêu chuẩn thiết kế hoặc kết quả xếp hạng.
