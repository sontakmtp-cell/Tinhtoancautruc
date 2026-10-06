# Thay đổi nội dung SEO

- Vai trò: `content-writer`; model được giao: `gpt-6.1-sol`, reasoning `medium`.
- Ngày: 06/10/2026 UTC. Đọc đầy đủ keyword brief, editor review và link review trước khi sửa.
- Phạm vi: copy trang chủ, metadata/schema, FAQ và sáu bài hướng dẫn; không sửa công thức hoặc thuật toán.

## Thay đổi

| File | Nội dung |
|---|---|
| `App.tsx` | Giới thiệu tính sơ bộ dầm chính và mô đun dầm biên; phân biệt dầm đỡ ray; bỏ câu crawler/AI bot; sửa q thành tự trọng tự tính; thu hẹp lời hứa ổn định thành độ mảnh bản cánh và nêu kiểm tra chưa có. Giữ cấu trúc và liên kết do lead triển khai. |
| `src/geo/seo.ts` | Title/description trang chủ không tuyên bố tuân thủ TCVN; phân biệt ý định bài tải/quy trình dầm đỡ ray; SoftwareApplication bỏ mỏi và bảo chứng TCVN, dùng tính năng đang có. Ngày Article chỉ xuất khi được cung cấp, bỏ mặc định ngày chưa xác minh. |
| `src/geo/faqContent.ts` | Phân biệt ba bộ phận; mô tả đầu vào và tải giữa nhịp; nhãn đạt chỉ áp dụng kiểm tra hiện có, không xác nhận thiết kế đầy đủ. |
| `src/geo/guideContent.ts` | Thêm phạm vi dầm đỡ ray và giới hạn calculator ở sáu bài; sửa định nghĩa đồng nhất dầm cầu trục với dầm đỡ ray; bỏ nhãn BLUF; ghi số liệu ví dụ là giả định; chú thích q tự tính cạnh nhóm công thức. Cả sáu bài có thay đổi nội dung đáng kể nên cập nhật `updatedAt` thành 2026-10-06. Giữ các công thức. |
| `components/GeoGuidePage.tsx` | Đổi nhãn nguồn thành “Tài liệu cần tham khảo”; không dùng ngày sửa bài làm ngày xuất bản. |

## Kiểm tra và giới hạn

- `npm run typecheck`: đạt sau sửa copy và sau điều chỉnh ngày schema.
- `git diff --check`: đạt tại thời điểm kiểm tra.
- Kiểm tra tự động chuỗi công thức trong bảng so với HEAD: giữ nguyên; sáu ngày cập nhật khớp; không còn câu crawler hoặc nhãn BLUF trong nội dung đã sửa.
- PDF có mã xuất file và nội dung đầu vào/kết quả/biểu đồ (`services/pdfService.ts`); chưa kiểm thử thao tác tải PDF trên trình duyệt trong lượt writer.
- Năm chiều biên tập: tiếng Việt kỹ thuật trực tiếp, ví dụ có nhãn, giữ cấu trúc bảng/heading, metadata thống nhất nhiệm vụ, bỏ nhãn nội bộ. Đây là đánh giá định tính; không chấm tổng điểm hoặc dùng Flesch tiếng Anh cho tiếng Việt.
- Chưa kiểm định công thức theo bản tiêu chuẩn gốc. Công thức minh họa K_buckling đã được sửa theo mã thực tế trong rà soát cuối dưới đây; đây không phải chứng nhận kiểm tra ổn định hoặc tuân thủ tiêu chuẩn.
- Nội dung PDF đang có các chuỗi tiêu chuẩn áp dụng trong bản dịch; ngoài phạm vi file writer, cần rà soát riêng nếu muốn đồng nhất toàn bộ sản phẩm.
- Build, HTML xuất ra, sitemap, điều hướng, triển khai và kiểm tra live chuyển cho lead/optimizer; báo cáo này không chứng nhận tuân thủ tiêu chuẩn hay kết quả xếp hạng.

## Rà soát cuối đã xử lý

- Thay ba điểm tóm tắt của bài quy trình dầm đỡ ray bằng “Hồ sơ cầu trục”, “Các mục cần rà soát” và “Thuyết minh tính toán”. Bỏ số nhóm/lớp tùy ý và lời hứa đầu ra PDF của calculator khỏi tóm tắt hướng dẫn. Nêu rõ các kiểm tra cần mô hình dầm đỡ ray riêng. Chỉ sửa copy trong `calculationProofPoints`.

- Theo yêu cầu sửa tài liệu ở rà soát cuối, thay duy nhất công thức minh họa `K_buckling = sigma_cr / sigma_u` bằng `K_buckling = lambda_limit / (c / t)` và ghi rõ ý nghĩa độ mảnh bản cánh. Bằng chứng: `services/calculationService.ts` phần tính `lambda_actual = representative_b / representative_t` rồi `K_buckling = lambda_limit / lambda_actual`. Đây là ngoại lệ có chủ đích cho nguyên tắc giữ công thức ban đầu, chỉ đồng bộ tài liệu với mã; không đổi thuật toán, hệ số hoặc giá trị số. Không còn sigma_cr trong bài. Bullet trang chủ chỉ hứa kiểm tra ứng suất uốn theo mô hình dầm chính.
