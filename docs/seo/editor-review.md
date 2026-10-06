# Báo cáo biên tập nội dung SEO

**Phạm vi:** Rà soát nội dung tiếng Việt trong `src/geo/guideContent.ts`, `src/geo/faqContent.ts`, phần giới thiệu calculator tại `App.tsx`, và cách bài hướng dẫn được trình bày trong `components/GeoGuidePage.tsx`. Đối chiếu các lời mô tả về công cụ với biểu mẫu và phép tính trong `components/CraneBeamCalculator.tsx` và `services/calculationService.ts`.

**Kết luận biên tập:** Nội dung có cấu trúc dễ quét, nhiều lời nhắc thận trọng hữu ích và thường phân biệt ước tính sơ bộ với hồ sơ thiết kế. Cần ưu tiên sửa khoảng cách giữa quy trình tải cầu trục được hướng dẫn và phạm vi phép tính thực tế của calculator. Chưa chấm điểm số: đây là nội dung cấu trúc trong ứng dụng, chưa có thang biên tập được hiệu chuẩn hoặc bản dựng đã kiểm tra để gán điểm đáng tin cậy. Không thể suy ra tác giả hay kết quả của bộ phát hiện AI từ văn bản.

## Ưu tiên cao — đồng bộ lời hứa với chức năng hiện có

1. **Nêu rõ tải đầu vào nào được mô hình hóa.** Bài hướng dẫn tải trọng và FAQ khuyên lấy phản lực bánh xe lớn nhất, khoảng cách bánh, tải động, lực ngang, vị trí xe con bất lợi, tổ hợp tải và chế độ làm việc. Biểu mẫu dầm hiện nhận `P_nang`, `P_thietbi` và hình học tiết diện; phép tính dầm đơn giản hóa hai tải này thành một tải điểm ở giữa nhịp, cộng tự trọng dầm phân bố đều, rồi dùng các hệ số cố định. Không thấy trường cho tải bánh xe và khoảng cách bánh, vị trí di động, tải ngang riêng hay chế độ làm việc. Vì vậy, không nên để người đọc hiểu rằng nhập dữ liệu vào công cụ sẽ thực hiện toàn bộ quy trình quét bánh xe và tổ hợp tải vừa nêu.

   **Wording đề xuất cho FAQ “Cần nhập những dữ liệu nào…”:** “Công cụ hiện nhận hình học tiết diện, nhịp, tải nâng, trọng lượng xe con/pa lăng và thông số vật liệu. Mô hình tải hiện là tải điểm quy đổi ở giữa nhịp cùng tự trọng dầm; công cụ chưa nhận riêng phản lực và khoảng cách bánh xe, tải ngang hoặc chế độ làm việc. Hãy dùng kết quả để tham khảo sơ bộ; với thiết kế thực tế, cần lập các trường hợp tải từ hồ sơ cầu trục và để kỹ sư kiểm tra.” Xác nhận câu mô tả này với chủ sản phẩm sau mỗi thay đổi chức năng.

2. **Thu hẹp từ “ổn định” chung chung.** Phần giới thiệu trang chủ hứa kiểm tra “ổn định tổng thể, ổn định cục bộ” (`App.tsx`, `calculatorChecks`). Trong dịch vụ tính, chỉ số `K_buckling` được suy từ một tỷ số bản cánh rộng/dày với giới hạn phân loại tiết diện; phần tính cũng ghi nhận dùng tiêu chí EN 1993-1-1 và đề xuất sườn theo EN 1993-1-5. Cách gọi hiện tại có thể khiến kỹ sư hiểu là đã kiểm tra đầy đủ ổn định tổng thể/cục bộ theo tiêu chuẩn áp dụng.

   **Wording đề xuất:** “Hiển thị các chỉ số ứng suất, độ võng và kiểm tra độ mảnh bản cánh theo mô hình hiện có; gợi ý sườn tăng cứng khi cần. Các kiểm tra ổn định tổng thể, bản bụng, liên kết, mỏi và tải ngang cần được xác nhận riêng theo bài toán.” Chỉ ghi tên tiêu chuẩn khi đã kiểm định đúng công thức, trường hợp áp dụng và hệ số.

3. **Sửa bảng mô tả input `q`.** Bảng trang chủ ghi `P_nang, P_thietbi, q` như dữ liệu nhóm tải trọng (`App.tsx`, `calculatorInputRows`), nhưng biểu mẫu dầm được rà soát không có ô nhập `q`; trong phép tính `q_auto` là tự trọng dầm tính từ diện tích tiết diện. Gợi ý đổi hàng thành “Tải nâng, trọng lượng thiết bị; tự trọng dầm được tính từ tiết diện”, và không liệt kê `q` như trường người dùng nhập.

4. **Đặt lại ngữ cảnh cho tên bài theo TCVN.** Các tiêu đề “Cách tính… theo TCVN 2737:2023/TCVN 5575:2024” đi cùng hướng dẫn chung và công thức giản lược; trong khi một phần công cụ viện dẫn công thức phân loại tiết diện từ EN. Cần phân biệt rõ “hướng dẫn tham khảo cách tiếp cận” với “phần mềm đã được kiểm chứng đầy đủ theo tiêu chuẩn”. Gắn nguồn tiêu chuẩn chính thức/ấn bản cụ thể và nhờ chuyên gia kết cấu kiểm tra các công thức, hệ số, giới hạn trước khi dùng cụm “theo [tiêu chuẩn]” như một bảo chứng tuân thủ. Báo cáo này không xác nhận nội dung tiêu chuẩn.

## Ưu tiên vừa — làm câu chữ tự nhiên và hữu ích hơn

5. **Bỏ câu hướng tới crawler/AI bot.** Trong `App.tsx`, đoạn “Phần dưới đây mô tả rõ các trường input để crawler và AI bot nhận diện đây là một calculator, không phải trang nội dung mỏng” nói về mục tiêu SEO nội bộ thay vì nhu cầu người dùng. Thay bằng: “Bảng dưới đây cho biết công cụ nhận những dữ liệu nào và hiển thị kết quả gì.” Tiêu đề “Trang này không chỉ là bài giới thiệu…” cũng có thể đổi thành tiêu đề mô tả trực tiếp: “Nhập thông số và xem kết quả tính sơ bộ dầm cầu trục”.

6. **Giảm lặp disclaimer/khung mẫu.** Nhiều mục và FAQ lặp lại gần nguyên ý “không thay thế hồ sơ thiết kế/kỹ sư”, “cần kiểm tra tải, độ võng, ổn định” và gắn nhãn “BLUF” cho từng bài. Giữ một cảnh báo ngắn, dễ thấy ở đầu hoặc cuối mỗi bài; các vị trí khác nên bổ sung thông tin mới (ví dụ: đầu vào nào còn thiếu, bước tiếp theo cụ thể). Với độc giả Việt, thay nhãn nội bộ “BLUF:” bằng câu kết luận dẫn nhập tự nhiên, hoặc bỏ nhãn.

7. **Đánh dấu ví dụ số là giả định.** Bài tải trọng nêu 65 kN/bánh và 2.500 mm; bài cấu tạo nêu cầu trục 5 tấn. Chúng đã mở đầu bằng “giả sử/ví dụ” ở một số đoạn, nhưng nên ghi rõ đây là số minh họa, không phải dữ liệu dự án hay catalogue. Không thêm nguồn/case khách hàng nếu chưa có tài liệu chứng minh.

8. **Tăng khả năng kiểm chứng nguồn.** Các mục “Tài liệu tham khảo” hiện là tên tài liệu và ghi chú, chưa có đường dẫn, số phiên bản/đơn vị ban hành hoặc điểm đối chiếu. Thêm liên kết nguồn gốc có thể xác minh (nếu quyền truy cập cho phép) và ngày rà soát; nếu không có nguồn chính thức thì gọi đó là “tài liệu cần tham khảo”, không trình bày như trích dẫn đã xác thực.

9. **Rà soát FAQ “đạt/không đạt”.** Câu trả lời hiện đã khuyên đọc từng chỉ số, nhưng nên nêu rõ nhãn chỉ phản ánh các kiểm tra mà công cụ hiện tính và giả thiết đang dùng. Có thể nối trực tiếp tới danh sách giới hạn ở đề xuất 1, để tránh người đọc coi “đạt” là phê duyệt thiết kế hoặc xác nhận tuân thủ toàn bộ TCVN.

## Điểm đang làm tốt nên giữ

- Bài viết nhiều lần nói rõ dữ liệu catalogue và giả thiết đầu vào có ảnh hưởng đến kết quả; tránh khuyên chọn dầm chỉ từ sức nâng.
- Bài độ võng không biến tỷ số L/600 hoặc L/700 thành yêu cầu áp dụng chung, và nhắc người đọc tìm giới hạn theo dự án.
- FAQ về PDF mô tả báo cáo như tài liệu trao đổi/kiểm tra sơ bộ, không mặc định là hồ sơ pháp lý.
- Cấu trúc heading, bảng, danh sách và câu hỏi–trả lời giúp quét nhanh. Giữ định dạng này sau khi giảm các đoạn lặp.

## Phạm vi kiểm tra và giới hạn

- Đây là đánh giá biên tập nội dung và đối chiếu có mục tiêu với code calculator, không phải kiểm định kỹ thuật kết cấu hay ý kiến pháp lý.
- Chưa xác thực các mệnh đề về TCVN, giới hạn tải, tiêu chí ổn định hoặc công thức với bản tiêu chuẩn chính thức; cần chuyên gia đủ năng lực rà soát trước khi xuất bản các khẳng định tuân thủ.
- Chưa kiểm tra bản dựng/UX trên trình duyệt, tốc độ đọc thực tế, dữ liệu Search Console, thứ hạng, từ khóa hoặc độ chính xác của ngày cập nhật/thời lượng đọc.

## Re-review sau cập nhật nội dung — 2026-10-06

Các sửa đổi chính đã xử lý tốt những điểm ưu tiên ở lượt trước: phần hướng dẫn nay phân biệt dầm chính/dầm biên/dầm đỡ ray; tải điểm giữa nhịp được mô tả là mô hình sơ bộ, không phải quét bánh xe; bảng input không còn coi `q` là trường nhập; nhãn đạt/không đạt được giới hạn theo các kiểm tra hiện có; câu crawler/AI bot và nhãn BLUF đã bỏ. Metadata cũng không còn tự gán ngày xuất bản mặc định.

**Còn hai mục cần sửa trước khi duyệt copy:**

1. Trong `components/GeoGuidePage.tsx`, `calculationProofPoints` vẫn hiển thị “9 nhóm dữ liệu” và “5 lớp an toàn”, dù ghi chú liệt kê tải bánh xe, chế độ vận hành, cấu tạo ray và liên kết. Các nội dung đó là danh sách dữ liệu/kiểm tra mà bài hướng dẫn khuyên kỹ sư chuẩn bị, không phải phạm vi calculator hiện cung cấp; trang này còn nêu calculator không thực hiện tải bánh xe di động cho dầm đỡ ray. Bỏ hai con số và chuyển thành nội dung hướng dẫn, ví dụ: “Dữ liệu cần chuẩn bị — tải bánh xe, sơ đồ gối, tiết diện, vật liệu, điều kiện vận hành” và “Các kiểm tra cần lập — bền, ổn định, độ võng, ray và liên kết; quy trình tham khảo, ngoài phạm vi calculator hiện có”.

2. `App.tsx` vẫn nói calculator “Kiểm tra ứng suất uốn và ứng suất cắt”. Trong dịch vụ tính dầm chính đã rà soát, nhãn `stress_check` so sánh `K_sigma` (ứng suất tổng hợp từ mô men) và không có kiểm tra sức kháng cắt `Q/A` hoặc ứng suất cắt dầm; biểu đồ lực cắt không đồng nghĩa với kiểm tra ứng suất cắt. Đổi thành “Tính nội lực uốn và lực cắt; kiểm tra ứng suất uốn theo mô hình hiện có” hoặc bỏ “ứng suất cắt”. Mô đun dầm đôi có riêng kiểm tra cắt do xoắn, nhưng không chứng minh tuyên bố chung áp dụng cho mọi dầm.

Đây là các sai khác về phạm vi sản phẩm, không phải vấn đề văn phong. Re-review chỉ đối chiếu nội dung mã nguồn với biểu mẫu và dịch vụ tính hiện có; không kiểm định công thức theo tiêu chuẩn.

## Tích hợp cuối bởi lead

Các blocker trong lượt rà soát cuối đã xử lý: bỏ số nhóm/lớp tùy ý trong ba thẻ quy trình; mục ứng suất trang chủ chỉ nói kiểm tra uốn; công thức tài liệu K_buckling phản ánh tỷ số độ mảnh bản cánh đang dùng trong code, không còn mô tả sai thành tỷ số ứng suất. Thuật toán không đổi.
