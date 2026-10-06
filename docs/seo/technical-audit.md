# Kiểm tra SEO kỹ thuật — cautruc.kythuatvang.com

Ngày kiểm tra: **06/10/2026 (UTC)**. Vai trò: **seo-optimizer**; phân công GPT-6.1 Sol/high do cần đối chiếu mã ứng dụng, render và định tuyến. Phạm vi: audit trước sửa tại commit `d6c03c9df0bada465b14d3a752b12aac2d6b3282`; báo cáo này không đồng nghĩa bản sửa đã triển khai.

## Kết luận

**Bản live trước sửa chưa sẵn sàng cho mục tiêu SEO các trang hướng dẫn riêng.** HTML ban đầu của trang chủ, FAQ và cả 6 bài giống nhau: 20.975 byte, title trang chủ, canonical `/`, root React rỗng và không có anchor `<a>`. Cả `/huong-dan` và một URL không tồn tại cũng trả cùng HTML với HTTP 200. Mã ứng dụng chỉ cập nhật metadata/nội dung sau khi chạy JavaScript. Google có thể render JavaScript; vấn đề quan sát được là tín hiệu canonical mâu thuẫn và nội dung ban đầu không phân biệt URL, không phải bằng chứng mọi trang đang bị loại khỏi chỉ mục.

## Bằng chứng trực tiếp

| Kiểm tra | Kết quả trước sửa | Căn cứ |
|---|---|---|
| GET `/` | HTTP 200; HTML 20.975 byte | `curl -L`, phản hồi ngày 06/10/2026 |
| GET FAQ + cả 6 bài | Mỗi URL HTTP 200, 20.975 byte; cùng SHA-256 tiền tố `c8a5bcb844a39532`; title/canonical trang chủ | `curl -L` và so sánh HTML ngày 06/10/2026 |
| GET `/huong-dan` và URL lạ | HTTP 200, cùng HTML/hash kể trên | `/seo-audit-path-not-found-20261006` là URL kiểm tra không tồn tại |
| Nội dung phản hồi | `<div id="root"></div>`; mô tả calculator chỉ ở `<noscript>` | HTML live và `index.html` |
| Liên kết trong HTML live | 0 thẻ `<a>` | Đếm trong HTML phản hồi trang chủ |
| Canonical ban đầu | `https://cautruc.kythuatvang.com/` | `index.html`, HTML live |
| Canonical sau render | Theo route, sửa trong `useEffect` | `App.tsx:251–277` tại commit audit |
| Build/định tuyến | Vite build một HTML; catch-all rewrite tới `/index.html` | `package.json`, `vite.config.ts`, `vercel.json` |
| Schema ban đầu | 4 script JSON-LD hợp lệ về cú pháp: WebSite, SoftwareApplication, FAQPage, graph Organization/WebApplication | Parse JSON từ HTML live |
| Cache HTML | `public, max-age=0, must-revalidate`; Vercel HIT qua Cloudflare | Header GET `/`; không suy ra lỗi cache chỉ từ HIT |
| Robots/sitemap live | Cả hai HTTP 200; cho phép crawl, khai báo sitemap; sitemap có 8 URL, khớp source | `curl -L`, `public/robots.txt`, `public/sitemap.xml` |

## Việc cần sửa theo ưu tiên

| Ưu tiên | Vị trí và vấn đề | Cách sửa cụ thể | Tiêu chí nghiệm thu |
|---|---|---|---|
| P0 | `index.html`, `App.tsx`, build: title/canonical/nội dung trang chủ được trả cho các URL bài viết | Prerender 8 route công khai từ dữ liệu hiện có; HTML đầu tiên có nội dung route, title, description, canonical, OG/Twitter và schema phù hợp | GET trực tiếp từng URL có H1/nội dung riêng và đúng 1 canonical trỏ chính nó; JavaScript không đổi canonical sang URL khác |
| P0 | `App.tsx`, `GuideArticleButtons.tsx`, CTA/back ở `GeoGuidePage.tsx`: điều hướng bằng button không có href | Dùng `<a href="…">` cho đi tới URL; giữ button cho tính toán, chọn ngôn ngữ, theme | Trang chủ có anchor tới cả 6 bài và FAQ; điều hướng hoạt động khi tắt JavaScript |
| P0 | `vercel.json` catch-all + `getRouteMetadata(currentPath) ?? homeRoute`: URL không tồn tại biến thành trang chủ | Chỉ phục vụ route hợp lệ bằng HTML đã tạo; trả 404 cho URL lạ; thêm giao diện không tìm thấy nếu cần | GET một URL lạ nhận HTTP 404, không trả calculator có canonical trang chủ |
| P1 | Breadcrumb bài viết dùng `/huong-dan`, nhưng URL này không có `routeMetadata` | Dùng URL hướng dẫn chính đã tồn tại hoặc redirect rõ ràng `/huong-dan` tới URL đó; không tạo trang mỏng chỉ để đủ breadcrumb | Mọi `BreadcrumbList.item` mở được nội dung phù hợp; không trở về homepage ngoài ý định |
| P1 | `index.html` có FAQPage/app/site tĩnh, ứng dụng lại chèn schema mới; FAQ tĩnh còn hiện ở route không khớp | Xuất một bộ JSON-LD theo route từ nguồn dữ liệu thống nhất; Organization/WebSite có nhận diện nhất quán; TechArticle/FAQ chỉ mô tả nội dung thực tế | Parse mọi script JSON-LD, kiểm tra URL/headline/FAQ khớp trang; không lặp FAQ homepage ở bài khác |
| P1 | `SearchAction` khai báo `/?q={search_term_string}` nhưng không có chức năng tìm kiếm đọc `q` | Bỏ action đến khi có tìm kiếm thực sự | Không còn action dẫn tới chức năng không tồn tại |
| P1 | H1 trang chủ chỉ có trong `<noscript>`; giao diện JavaScript không có H1 mô tả công cụ | Thêm H1 người đọc thấy, mô tả đúng công cụ tính dầm cầu trục | Mỗi route có một H1 chính; trang chủ/bài viết cùng thể hiện H1 trong HTML ban đầu |
| P2 | `index.html` có 2 viewport; bài guide lồng `<main>` trong `<main>` App | Giữ một viewport; đổi wrapper trong guide thành phần tử thích hợp | Metadata không trùng; landmark chính rõ ràng |
| P2 | Sitemap/TechArticle ngày cập nhật viết cứng; `datePublished` đang dùng `updatedAt` | Dùng ngày nội dung thực sự xuất bản/cập nhật; không tự gán hôm nay chỉ vì build | `lastmod`, ngày hiển thị, dateModified nhất quán và có căn cứ |
| P2 | Nguồn tham khảo bài viết chỉ là nhãn/note, chưa phải liên kết kiểm tra được | Thêm URL nguồn chính thức sau xác minh; phân biệt công thức minh họa và kết quả tuân thủ tiêu chuẩn | Người đọc mở được tài liệu nguồn; claim tiêu chuẩn qua rà soát kỹ thuật |

Service worker hiện dùng network-first cho navigation và fallback `/index.html` khi offline. Đây không phải nguyên nhân của HTML giống nhau ở GET trực tiếp. Sau prerender, cần bảo đảm fallback chỉ phục vụ trải nghiệm offline, không biến lỗi HTTP/URL lạ thành phản hồi 200 trên mạng. Tài nguyên cache-first có hash từ Vite phù hợp; robots/sitemap nên luôn lấy phiên bản mới và tránh cache phản hồi lỗi.

## Metadata đề xuất

Ưu tiên metadata đã có trong `src/geo/seo.ts` và xuất thẳng vào HTML; không cần viết lại slug đang mô tả đúng chủ đề. Các lựa chọn sau là copy đề xuất, không phải yêu cầu độ dài để xếp hạng.

| Trang | Title đề xuất | Description đề xuất |
|---|---|---|
| Trang chủ | Công cụ tính dầm cầu trục online theo TCVN 5575:2024 | Nhập tiết diện, nhịp, tải trọng và vật liệu để kiểm tra ứng suất, độ võng, ổn định của dầm cầu trục; xem biểu đồ và xuất báo cáo PDF. |
| Bài tính toán | Cách tính toán dầm cầu trục theo TCVN 5575:2024 | Hướng dẫn chuẩn bị dữ liệu cầu trục, xác định tải trọng, chọn tiết diện và đọc kết quả kiểm tra bền, ổn định, độ võng cho dầm nhà xưởng. |
| FAQ | FAQ tính toán dầm cầu trục: tải trọng, độ võng, TCVN | Giải đáp các câu hỏi về dầm cầu trục, dữ liệu đầu vào, tải trọng, tiêu chuẩn và cách đọc kết quả của công cụ tính toán trực tuyến. |

## Điểm và mức sẵn sàng

Chỉ chấm phần kỹ thuật trong rubric 4 × 25 của skill; không quy đổi thành điểm tổng khi chưa audit đủ nội dung/UX.

| Tiêu chí kỹ thuật quan sát được | Điểm trước sửa / 5 | Lý do |
|---|---:|---|
| Nội dung, metadata và canonical theo URL trong HTML | 1 | Có dữ liệu route nhưng chưa xuất HTML riêng; canonical ban đầu mâu thuẫn |
| URL/HTTP/404 | 1 | Slug rõ ràng; URL lạ fallback về trang chủ |
| Liên kết crawl được | 0 | Điều hướng liên trang chủ yếu bằng button |
| Robots/sitemap | 5 | Đã xác nhận source và live có cấu hình cho phép, 8 URL |
| Schema đúng nội dung, nhất quán | 2 | JSON hợp lệ; lặp dữ liệu, FAQ khác trang và action tìm kiếm không tồn tại |
| **Kỹ thuật SEO** | **9/25** | Đánh giá audit trước sửa, không dự báo thứ hạng |

Các chiều từ khóa/cấu trúc/UX: **chưa chấm** trong nhiệm vụ này. Chưa có đối chiếu đầy đủ SERP, số liệu Search Console hay Core Web Vitals; không dùng Flesch tiếng Anh để kết luận độ dễ đọc tiếng Việt. Không đặt mục tiêu mật độ từ khóa hoặc độ dài bài máy móc.

## Checklist kiểm tra bản sửa

- [x] Kiểm tra `dist` tạo đủ 8 HTML canonical; bài viết có nội dung thật trong HTML mà không chạy JavaScript.
- [x] Parse cả 8 HTML: một H1 chính, một main, một viewport, title riêng và một canonical đúng URL.
- [ ] GET bản preview/triển khai từng route: HTTP 200 và nội dung đúng trang.
- [ ] GET URL lạ: HTTP 404; kiểm tra redirect `/huong-dan`, slash và `/index.html` trên host thật.
- [x] HTML sinh ra có anchor href thật: trang chủ 12, FAQ 3, bài hướng dẫn 15–16; kiểm tra file đích/fragment không phát hiện liên kết nội bộ lỗi.
- [x] JSON-LD cả 8 trang parse được; đúng loại route, không có SearchAction giả hoặc FAQ homepage lặp ở trang khác.
- [ ] Robots và sitemap live trả đúng loại nội dung, chứa các URL 200 canonical; cập nhật lastmod khi nội dung thay đổi thực tế.
- [ ] Kiểm tra calculator sau tải JavaScript, theme/ngôn ngữ, PDF và service worker không bị ảnh hưởng bởi prerender.
- [ ] Sau triển khai: đối chiếu URL Inspection, canonical Google chọn và PageSpeed/CrUX; kết quả chỉ mục/thứ hạng cần theo dõi thực tế.

**Đánh giá bản sửa cục bộ:** phần HTML/metadata/liên kết/schema đã đáp ứng các kiểm tra trên. Đây là kiểm tra đọc độc lập trên đầu ra `dist`, chưa thay thế kiểm tra HTTP của Vercel/Cloudflare hay kiểm tra trình duyệt tương tác. Điểm 9/25 ở trên chỉ mô tả bản live trước sửa. Việc phát hành còn cần build/checks của lead và xác nhận route, redirect, 404 trên host; không khẳng định production đã nhận bản mới.

## Nguồn và giới hạn

Nguồn chính thức đã đọc ngày 06/10/2026:

1. [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) — render, prerender, canonical ban đầu và sau render, HTTP/soft 404.
2. [Google: crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) — dùng anchor với href để khám phá URL.
3. [Google: HTTP status codes](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes) — xử lý 200, redirect và 404.
4. [Google Search updates](https://developers.google.com/search/updates) — FAQ rich results ngừng hiển thị từ **07/05/2026**; tài liệu bị gỡ ngày 15/06/2026. Có thể giữ FAQPage đúng nội dung cho ngữ nghĩa, không hứa FAQ rich result.

Đã đọc các hướng dẫn runtime, model-policy, integrations, vai trò seo-optimizer và toàn bộ seo-analysis. Không thay đổi mã ứng dụng trong vai trò audit. HTML/schema hợp lệ không tự bảo đảm đủ điều kiện rich result hay được lập chỉ mục. Chưa chạy URL Inspection/Rich Results Test bằng tài khoản, chưa có dữ liệu GSC/CrUX và chưa chứng minh tính đúng chuyên môn của công thức/việc tuân thủ TCVN. Công cụ web không mở được domain trực tiếp; curl tải được toàn bộ 8 route canonical, URL lạ, robots và sitemap. Yêu cầu urllib riêng nhận 403 nên không dùng kết quả đó để kết luận Cloudflare chặn Googlebot.

## Rà soát kỹ thuật cuối sau cập nhật nội dung

Đã đọc lại `App.tsx`, `scripts/prerender.mjs`, `scripts/render-pages.tsx`, `scripts/check-seo.mjs`, `vercel.json` và đầu ra build cuối ngày 06/10/2026. Đã chạy **`npm run check:seo`: đạt cho cả 8 trang**. Kiểm tra độc lập bằng HTML parser ghi nhận:

- Cả 8 trang có title/description/URL thống nhất giữa metadata thường và OG/Twitter/Zalo; canonical duy nhất, đúng route. Mã cập nhật metadata khi điều hướng SPA đã bổ sung `og:type` và các trường Zalo, khớp logic prerender; chưa kiểm tra hành vi SPA trong trình duyệt ở vai trò này.
- Một H1 và một landmark main trên mỗi trang; nội dung lazy đã xuất đầy đủ. Trang chủ có 12 anchor, FAQ 4, các bài có 16–18; không phát hiện file đích/fragment lỗi hoặc ID trùng.
- Sáu TechArticle không khai báo `datePublished` khi không biết lịch sử xuất bản. `dateModified` của cả sáu bài là `2026-10-06`, khớp `lastmod` sitemap và đợt sửa nội dung thực tế. Trang chủ/FAQ không bị gán ngày cập nhật phỏng đoán trong sitemap.
- Breadcrumb hiển thị đã bổ sung vào bài; liên kết tới route thực có trong build. Copy/schema hiện phân biệt dầm chính, dầm biên và dầm đỡ ray; featureList đã bỏ claim kiểm tra mỏi/ổn định tổng thể ngoài tính năng được xác nhận.

Các đề xuất metadata ở phần audit trước sửa phía trên **đã được thay thế** bằng nội dung cuối của writer; không dùng chúng để khôi phục claim tuân thủ tiêu chuẩn hoặc tính năng chưa có. Metadata cuối quan sát trong `dist`:

| Trang | Title cuối |
|---|---|
| Trang chủ | Tính toán dầm cầu trục online \| Kỹ Thuật Vàng |
| Bài quy trình | Cách tính dầm đỡ ray cầu trục trong nhà xưởng |
| FAQ | Câu hỏi thường gặp về tính dầm cầu trục |

**Định tuyến:** cấu hình có 7 rewrite cụ thể tới các file `…/index.html` đã tạo, không còn catch-all; `cleanUrls` không được bật. Điều này phù hợp [tài liệu Vercel về rewrite](https://vercel.com/docs/project-configuration/vercel-json): destination có `.html` được phép khi không bật `cleanUrls`. `trailingSlash: false` đặt hướng chuẩn không slash; `/huong-dan` có redirect vĩnh viễn tới bài quy trình. `dist/404.html` có noindex và không mount React; [Vercel hướng dẫn static 404](https://vercel.com/kb/guide/custom-404-page) cho phép file này làm trang không tìm thấy. Đây là kiểm tra cấu hình/tài liệu, **chưa chứng minh phản hồi HTTP của bản mới trên Vercel/Cloudflare**.

Cần kiểm tra preview thật cho 8 route, `/huong-dan`, URL lạ, alias `/index.html` và `…/index.html`, các URL có slash và query. Trong source được rà soát, `getCurrentPath` chỉ bỏ slash cuối; nếu alias `…/index.html` được phục vụ trực tiếp mà không redirect, route lookup có thể fallback trang chủ sau khi JavaScript chạy, dù HTML ban đầu thuộc bài viết. Nên xác nhận host đã chuẩn hóa alias hoặc thêm redirect alias tới URL canonical trước khi đánh dấu kiểm tra này đạt. Service worker trả nguyên phản hồi HTTP thành công của fetch, kể cả 404; fallback homepage chỉ chạy khi fetch thất bại do mạng, không che 404 HTTP trong nhánh online hiện có.

**Mức sẵn sàng cuối:** đạt kiểm tra nội dung HTML tĩnh, metadata, schema và liên kết ở build cục bộ; còn chờ kiểm tra host thật và tương tác. Không có preview/deployment mới được xác nhận trong lần rà soát này; bản live audit trước sửa và đầu ra `dist` phải được phân biệt khi báo cáo kết quả cho chủ website.

## Tích hợp cuối bởi lead

Đã thêm redirect vĩnh viễn từ `/index.html` và bảy alias `…/index.html` về URL chuẩn; getCurrentPath cũng chuẩn hóa hậu tố này cho client/offline. check:seo kiểm tra cấu hình alias. Sitemap viết tay được bỏ, sitemap production sinh từ metadata trong bước build. HTTP của bản triển khai mới vẫn chưa xác minh.
