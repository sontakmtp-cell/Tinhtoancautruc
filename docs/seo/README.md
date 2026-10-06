# SEO cho cautruc.kythuatvang.com — 06/10/2026

## Kết quả

Đã sửa mã nguồn để tám URL có nội dung HTML, H1, title, description, canonical và schema riêng trước khi JavaScript chạy. Trước sửa, trang chủ, FAQ, sáu bài hướng dẫn và cả URL không tồn tại đều trả cùng HTML trang chủ với HTTP 200.

- Sinh HTML từ chính các component React đang hiển thị, giữ công cụ tính toán tương tác khi JavaScript tải xong.
- Chuyển điều hướng thành liên kết có `href`, thêm breadcrumb và liên kết giữa bài hướng dẫn.
- Sinh sitemap từ metadata và ngày sửa nội dung, bỏ sitemap viết tay; bỏ schema trùng và SearchAction không có chức năng tương ứng.
- Chỉ rewrite các URL có nội dung, thêm trang 404 và chuyển alias `index.html` về URL chuẩn trên Vercel.
- Nội dung phân biệt dầm chính, dầm biên và dầm đỡ ray; mô tả đúng giới hạn mô hình tính sơ bộ. Không sửa thuật toán tính toán.

## Kiểm tra

```bash
npm ci
npm run typecheck
npm run build
npm run check:seo
npm test
```

`build` tạo tám trang trong `dist`, cùng `sitemap.xml` và `404.html`. Không dùng thư mục `public` làm thư mục triển khai. GitHub Pages workflow kiểm tra SEO sau build và giữ trang 404 thật. Website được kiểm tra hiện phản hồi qua Cloudflare/Vercel; cấu hình route trong `vercel.json` áp dụng cho Vercel.

- Typecheck, build và `check:seo`: đạt. Kiểm tra tám trang bao gồm HTML, metadata riêng, schema JSON hợp lệ, liên kết nội bộ, sitemap và ánh xạ route/alias.
- Kiểm tra DOM bằng jsdom: gửi form tính toán, chuyển trang hướng dẫn/FAQ, canonical/metadata sau điều hướng và Ctrl-click đều đạt. Đây là kiểm tra DOM, chưa phải kiểm tra hiển thị/PDF trong Chromium.
- Bộ 26 test tính toán đều báo đạt từng case; Vitest không kết thúc tiến trình trong môi trường làm việc này nên đã dừng runner. Không tuyên bố toàn bộ lệnh `npm test` thoát thành công. Thuật toán và test tính toán không thay đổi.
- Chưa kiểm chứng HTTP 404/redirect trên bản triển khai mới, chưa kiểm tra tải PDF bằng trình duyệt, chưa có dữ liệu Google Search Console/CrUX hoặc lượng tìm kiếm từ khóa.

## Báo cáo và người thực hiện

| Vai trò thực tế | Model được giao | Tài liệu |
|---|---|---|
| Keyword researcher | GPT-6.1 Sol / high | [keyword-brief.md](keyword-brief.md) |
| SEO optimizer | GPT-6.1 Sol / high, nâng mức do chẩn đoán mã và route | [technical-audit.md](technical-audit.md) |
| Content editor | GPT-6 Luna / high | [editor-review.md](editor-review.md) |
| Link strategist | GPT-6 Luna / high | [link-review.md](link-review.md) |
| Content writer | GPT-6.1 Sol / medium | [content-changes.md](content-changes.md) |

Lead điều phối, triển khai phần kỹ thuật và tích hợp các kết quả; không tạo lead khác. Model ghi trong bảng là cấu hình phân công quan sát được, không phải xác nhận độc lập từ nhà cung cấp.

## Triển khai và theo dõi

Trạng thái: **Needs Minor Fixes — cần kiểm tra bản triển khai trên host trước khi xác nhận Ready to Publish**. Mã đã chuẩn bị để review, chưa merge hoặc triển khai production trong đợt này.

Sau khi merge/triển khai, kiểm tra trực tiếp `/`, `/faq`, sáu URL trong sitemap; mỗi URL phải có canonical của chính nó ngay trong HTML. `/huong-dan` và alias `index.html` phải redirect về URL đã chọn; một URL lạ phải trả HTTP 404. Xác nhận form tính và xuất PDF hoạt động, rồi gửi `https://cautruc.kythuatvang.com/sitemap.xml` trong Google Search Console và dùng URL Inspection cho các trang chính. Không thêm mã xác minh hoặc dữ liệu analytics khi chưa có ID thật.

Theo dõi lượt hiển thị, lượt nhấp, truy vấn và tình trạng lập chỉ mục sau triển khai; báo cáo hiện không đặt mục tiêu tăng trưởng từ số liệu chưa có. Các nguồn tiêu chuẩn chính thức được đề xuất trong báo cáo link, nhưng HTTP chưa xác minh nên chưa thêm liên kết ra ngoài. Nội dung PDF/thuật toán vẫn cần đợt kiểm định kỹ thuật riêng nếu muốn công bố tuân thủ đầy đủ TCVN.
