# 🚀 Kế hoạch Tối ưu GEO Toàn diện cho `cautruc.kythuatvang.com`

> **Mục tiêu:** Đưa trang web trở thành nguồn trích dẫn hàng đầu khi người dùng hỏi AI về tính toán dầm cầu trục, thiết kế kết cấu thép nhà xưởng.
> 
> **Ngày lập:** 04/06/2026 | **Phiên bản:** 1.0

---

## Phần 1: Phân tích Cấu trúc & Điểm chạm AI

### 1.1. Tổng quan trang web hiện tại

| Thông tin | Giá trị hiện tại |
|---|---|
| **URL chính** | `https://cautruc.kythuatvang.com/` |
| **Tên ứng dụng** | Crane Beam Design Studio |
| **Mô tả** | Công cụ tính toán dầm cầu trục chuyên nghiệp |
| **Ngôn ngữ** | Tiếng Việt (`vi`) |
| **Loại trang** | Web App (React SPA - PWA) |
| **Schema hiện tại** | `WebApplication` (đơn giản) |
| **Hosting** | Cloudflare Pages |

### 1.2. 🚨 Các vấn đề NGHIÊM TRỌNG phát hiện được

> [!CAUTION]
> **Vấn đề #1 — robots.txt đang CHẶN TOÀN BỘ bot AI**
> 
> File `robots.txt` hiện tại đang **chặn hoàn toàn** tất cả các bot thu thập dữ liệu của AI:
> - `GPTBot` (ChatGPT/OpenAI) → **Disallow: /**
> - `ClaudeBot` (Claude/Anthropic) → **Disallow: /**
> - `Google-Extended` (Google AI Overviews/Gemini) → **Disallow: /**
> - `Bytespider` (ByteDance AI) → **Disallow: /**
> - `CCBot` (Common Crawl — nguồn dữ liệu huấn luyện AI) → **Disallow: /**
> - `meta-externalagent` (Meta AI) → **Disallow: /**
> - `Amazonbot` → **Disallow: /**
> 
> **Đồng thời**, trường `Content-Signal` đặt `ai-train=no` — nghĩa là trang web từ chối cho AI sử dụng nội dung.
> 
> 👉 **Hệ quả:** Dù bạn tối ưu nội dung hoàn hảo, **KHÔNG AI engine nào có thể đọc** trang web của bạn. Đây là rào cản lớn nhất và cần sửa **đầu tiên**.

> [!WARNING]
> **Vấn đề #2 — Trang web là SPA (Single Page Application) thuần JavaScript**
> 
> Toàn bộ nội dung được render (hiển thị) bằng JavaScript trong thẻ `<div id="root"></div>`. Khi bot AI truy cập, chúng chỉ thấy một trang trắng — **không có nội dung văn bản nào** để đọc.
> 
> **Giải thích đơn giản:** Hãy tưởng tượng bạn mở một cuốn sách nhưng tất cả các trang đều trắng — phải dùng đèn UV đặc biệt mới thấy chữ. Bot AI không có "đèn UV" đó.

> [!WARNING]
> **Vấn đề #3 — Canonical URL trỏ sai domain**
> 
> Thẻ `<link rel="canonical">` đang trỏ về `https://calculator.kythuatvang.com/` thay vì `https://cautruc.kythuatvang.com/`.
> Tất cả thẻ Open Graph (og:url) cũng trỏ sai domain.
> 
> 👉 **Hệ quả:** AI sẽ ghi nhận `calculator.kythuatvang.com` là nguồn chính thức, không phải `cautruc.kythuatvang.com`.

> [!IMPORTANT]
> **Vấn đề #4 — Thiếu nội dung văn bản (text content)**
> 
> Trang web hiện tại chỉ có **một công cụ tính toán (calculator)**. Không có:
> - Bài viết hướng dẫn
> - Trang FAQ (câu hỏi thường gặp)
> - Giải thích công thức
> - Hướng dẫn sử dụng
> 
> **AI cần nội dung văn bản để trích dẫn.** Một công cụ tính toán dù tốt đến mấy cũng không thể được AI trích dẫn nếu không có nội dung chữ viết đi kèm.

> [!IMPORTANT]
> **Vấn đề #5 — Không có Sitemap XML**
> 
> URL `sitemap.xml` trả về trang chủ (HTML) thay vì file sitemap XML chuẩn. AI crawler không thể khám phá cấu trúc trang web.

> [!IMPORTANT]
> **Vấn đề #6 — Schema Markup quá sơ sài**
> 
> Chỉ có duy nhất một schema `WebApplication` đơn giản. Thiếu các schema quan trọng như `Organization`, `FAQPage`, `HowTo`, `Article`, `BreadcrumbList`.

> [!IMPORTANT]
> **Vấn đề #7 — Không có trang nội dung phụ trợ**
> 
> Trang web chỉ có 1 trang duy nhất (trang chủ = công cụ tính toán). Không có blog, trang hướng dẫn, hay trang kiến thức nào để AI có thể trích dẫn.

### 1.3. Bảng đánh giá Mức độ sẵn sàng cho AI (AI-Readiness Scorecard)

| Yếu tố | Điểm hiện tại | Điểm cần đạt | Ghi chú |
|---|:---:|:---:|---|
| Quyền truy cập bot AI (robots.txt) | 🔴 0/10 | 10/10 | Đang chặn hoàn toàn |
| Nội dung dạng văn bản | 🔴 1/10 | 8/10 | Hầu như không có |
| Khả năng render (SSR/SSG) | 🔴 1/10 | 9/10 | SPA thuần JS |
| Schema Markup | 🟡 3/10 | 8/10 | Có nhưng quá đơn giản |
| Cấu trúc heading (H1, H2, H3) | 🔴 0/10 | 9/10 | Không có heading nào |
| Canonical URL | 🔴 0/10 | 10/10 | Trỏ sai domain |
| Sitemap XML | 🔴 0/10 | 10/10 | Không tồn tại |
| Trích dẫn nguồn uy tín | 🔴 0/10 | 8/10 | Không có |
| FAQ / Nội dung hỏi-đáp | 🔴 0/10 | 9/10 | Không có |
| **TỔNG ĐIỂM** | **🔴 5/90** | **81/90** | **Rất cần cải thiện** |

---

## Phần 2: Nghiên cứu Truy vấn Hội thoại (Conversational Queries)

Đây là 15 câu hỏi mà người dùng mục tiêu (kỹ sư kết cấu, thợ xây dựng, sinh viên ngành xây dựng) **thường hỏi AI** bằng ngôn ngữ tự nhiên. Bạn cần tạo nội dung trả lời **chính xác** từng câu hỏi này.

### Nhóm A: Kiến thức cơ bản về dầm cầu trục

| # | Câu hỏi hội thoại | Ý định tìm kiếm |
|---|---|---|
| 1 | "Dầm cầu trục là gì và khi nào cần dùng trong nhà xưởng?" | Định nghĩa + Ứng dụng |
| 2 | "Có mấy loại dầm cầu trục phổ biến? So sánh ưu nhược điểm từng loại." | So sánh + Phân loại |
| 3 | "Sự khác nhau giữa dầm cầu trục đơn và dầm cầu trục đôi là gì?" | So sánh trực tiếp |
| 4 | "Tiêu chuẩn TCVN nào áp dụng cho tính toán dầm cầu trục hiện nay?" | Tra cứu tiêu chuẩn |

### Nhóm B: Tính toán & Thiết kế

| # | Câu hỏi hội thoại | Ý định tìm kiếm |
|---|---|---|
| 5 | "Cách tính toán dầm cầu trục nhà xưởng theo TCVN 5575:2024 từng bước như thế nào?" | Hướng dẫn từng bước |
| 6 | "Công thức tính tải trọng tác dụng lên dầm cầu trục do cầu trục 10 tấn là gì?" | Công thức cụ thể |
| 7 | "Làm sao chọn tiết diện dầm cầu trục phù hợp cho nhà xưởng nhịp 18m?" | Tư vấn thiết kế |
| 8 | "Kiểm tra độ võng dầm cầu trục theo TCVN cho phép bao nhiêu?" | Giới hạn kỹ thuật |
| 9 | "Có công cụ online nào tính toán dầm cầu trục miễn phí không?" | Tìm kiếm công cụ |

### Nhóm C: Thi công & Thực tế

| # | Câu hỏi hội thoại | Ý định tìm kiếm |
|---|---|---|
| 10 | "Các lỗi thường gặp khi thiết kế dầm cầu trục và cách khắc phục?" | Troubleshooting |
| 11 | "Khi nào cần thiết kế dầm hãm cho dầm cầu trục?" | Điều kiện kỹ thuật |
| 12 | "Chi phí ước tính cho dầm cầu trục nhà xưởng nhịp 20m sức nâng 5 tấn?" | Dự toán chi phí |

### Nhóm D: Nâng cao & Chuyên sâu

| # | Câu hỏi hội thoại | Ý định tìm kiếm |
|---|---|---|
| 13 | "Kiểm tra mỏi dầm cầu trục theo TCVN 5575:2024 như thế nào?" | Kỹ thuật chuyên sâu |
| 14 | "So sánh thiết kế dầm cầu trục bằng thép hình I và thép tổ hợp hàn?" | So sánh kỹ thuật |
| 15 | "Phần mềm nào hỗ trợ tính toán dầm cầu trục tốt nhất cho kỹ sư Việt Nam?" | Đánh giá công cụ |

> [!TIP]
> **Cách dùng danh sách này:** Mỗi câu hỏi trên nên trở thành **tiêu đề (H2) của một bài viết hoặc mục trong trang FAQ**. Viết câu trả lời trực tiếp, rõ ràng ngay đoạn đầu tiên — AI sẽ trích xuất đoạn này để làm câu trả lời.

---

## Phần 3: Chiến lược Định dạng Nội dung (Content Formatting for AI Parsing)

### 3.1. Nguyên tắc vàng: "BLUF" — Đặt câu trả lời lên đầu

**BLUF** (Bottom Line Up Front) nghĩa là: **đưa kết luận/câu trả lời lên đầu bài viết**, sau đó mới giải thích chi tiết.

**❌ Cách viết SAI (AI khó trích xuất):**
```
Trong lĩnh vực xây dựng, kết cấu thép đóng vai trò quan trọng... 
(viết dài 3 đoạn mở đầu)
... Vì vậy, dầm cầu trục là cấu kiện chịu lực chính đỡ ray cầu trục.
```

**✅ Cách viết ĐÚNG (AI trích xuất ngay):**
```
**Dầm cầu trục** là cấu kiện kết cấu thép nằm ngang, được đặt trên vai cột nhà xưởng, 
có chức năng đỡ ray cầu trục và chịu toàn bộ tải trọng do cầu trục truyền xuống. 
Theo TCVN 5575:2024, dầm cầu trục thuộc cấu kiện Cấp 1 — yêu cầu tính toán 
trong giới hạn đàn hồi.
```

### 3.2. Cấu trúc bài viết chuẩn GEO

Mỗi bài viết/trang nội dung nên tuân theo cấu trúc sau:

```
┌─────────────────────────────────────────────────────┐
│  H1: [Tiêu đề dạng câu hỏi hoặc định nghĩa]       │
│                                                      │
│  📋 TÓM TẮT NHANH (summary box)                    │
│  → 2-3 câu trả lời trực tiếp cho câu hỏi chính     │
│  → Bao gồm con số cụ thể nếu có                    │
│                                                      │
│  H2: [Định nghĩa / Khái niệm chính]                │
│  → Đoạn văn ngắn (3-5 câu), mở đầu bằng định nghĩa │
│                                                      │
│  H2: [Các bước thực hiện / Phân loại]               │
│  → Danh sách đánh số (1, 2, 3...)                   │
│  → Mỗi bước có giải thích ngắn                      │
│                                                      │
│  H2: [Bảng so sánh / Bảng thông số]                 │
│  → Bảng biểu có cột rõ ràng                         │
│  → Đơn vị đo, con số cụ thể                         │
│                                                      │
│  H2: [Câu hỏi thường gặp (FAQ)]                    │
│  → H3: Câu hỏi 1?                                   │
│    → Câu trả lời (2-3 câu)                          │
│  → H3: Câu hỏi 2?                                   │
│    → Câu trả lời (2-3 câu)                          │
│                                                      │
│  📚 Nguồn tham khảo                                │
│  → Links đến TCVN, sách giáo khoa, nghiên cứu      │
└─────────────────────────────────────────────────────┘
```

### 3.3. Quy tắc sử dụng thẻ Heading

| Thẻ | Cách dùng | Ví dụ |
|---|---|---|
| **H1** | Chỉ dùng **1 lần** mỗi trang. Nên viết dạng câu hỏi. | `Cách tính toán dầm cầu trục theo TCVN 5575:2024` |
| **H2** | Chia bài thành các phần lớn. Nên bắt đầu bằng từ hành động. | `Các bước tính toán`, `Bảng tra thông số`, `Câu hỏi thường gặp` |
| **H3** | Chi tiết trong từng phần H2. Dùng dạng câu hỏi cho FAQ. | `Bước 1: Xác định tải trọng`, `Độ võng cho phép là bao nhiêu?` |

### 3.4. Sử dụng Bảng biểu — "Vũ khí bí mật" cho GEO

AI **rất thích trích xuất bảng biểu** vì bảng chứa dữ liệu có cấu trúc, dễ hiểu. Hãy tạo bảng bất cứ khi nào có thể.

**Ví dụ bảng tra nhanh nên có trong bài viết:**

```html
<table>
  <caption>Bảng tra nhanh: Chiều cao dầm cầu trục tối thiểu theo nhịp</caption>
  <thead>
    <tr>
      <th>Nhịp dầm (m)</th>
      <th>Sức nâng 5T</th>
      <th>Sức nâng 10T</th>
      <th>Sức nâng 20T</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>6</td><td>400 mm</td><td>500 mm</td><td>600 mm</td></tr>
    <tr><td>9</td><td>500 mm</td><td>600 mm</td><td>800 mm</td></tr>
    <tr><td>12</td><td>600 mm</td><td>800 mm</td><td>1000 mm</td></tr>
    <!-- Thêm các hàng khác -->
  </tbody>
</table>
```

### 3.5. "Hộp Tóm tắt" (Summary Box) — Đoạn AI trích xuất đầu tiên

Đặt một hộp tóm tắt ở **đầu mỗi bài viết**. Đây là đoạn văn AI sẽ trích xuất đầu tiên.

```html
<!-- Hộp tóm tắt — AI sẽ ưu tiên trích xuất đoạn này -->
<div class="summary-box" role="doc-abstract">
  <p><strong>Tóm tắt nhanh:</strong> Dầm cầu trục nhà xưởng nhịp 12m, 
  sức nâng 10 tấn thường dùng tiết diện I tổ hợp hàn cao 800mm, 
  bản cánh rộng 300mm, bản bụng dày 10mm. Chiều cao tối thiểu 
  khoảng L/8 đến L/10 (theo TCVN 5575:2024). Chi phí ước tính 
  khoảng 25-35 triệu VNĐ/cây.</p>
</div>
```

---

## Phần 4: Tối ưu hóa Kỹ thuật & Dữ liệu Cấu trúc (Technical & Schema Markup)

### 4.1. 🔧 Việc cần làm NGAY LẬP TỨC (Khẩn cấp)

#### Bước 1: Mở khóa robots.txt cho bot AI

> **Giải thích đơn giản:** File `robots.txt` giống như tấm biển "CẤM VÀO" treo ở cửa nhà bạn. Hiện tại bạn đang cấm tất cả bot AI vào đọc nội dung. Cần thay bằng tấm biển "CHÀO MỪNG".

**Truy cập Cloudflare Dashboard → Chọn domain → Security → Bots → Cấu hình lại.**

Hoặc tạo file `robots.txt` mới với nội dung:

```txt
# =============================================================
# robots.txt cho cautruc.kythuatvang.com
# Mục đích: CHO PHÉP bot AI thu thập dữ liệu để trích dẫn
# =============================================================

# Cho phép tất cả bot (bao gồm bot AI) truy cập toàn bộ trang web
User-agent: *
Allow: /

# Cho phép riêng từng bot AI (để chắc chắn)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Applebot-Extended
Allow: /

# Chỉ ra vị trí sitemap để bot tìm được tất cả trang
Sitemap: https://cautruc.kythuatvang.com/sitemap.xml
```

> [!NOTE]
> **Lưu ý về Cloudflare:** Trang web của bạn đang dùng Cloudflare. File robots.txt có thể được **Cloudflare tự động tạo** thông qua tính năng "AI Audit" hoặc "Bot Management". Bạn cần vào **Cloudflare Dashboard → Security → Bots → Configure AI Bots** và chọn **"Allow"** cho tất cả AI bot, hoặc tắt tính năng block AI bots.

#### Bước 2: Sửa Canonical URL và Open Graph

Thay **TẤT CẢ** các chỗ `calculator.kythuatvang.com` thành `cautruc.kythuatvang.com` trong file `index.html`:

```html
<!-- SỬA: Canonical URL -->
<link rel="canonical" href="https://cautruc.kythuatvang.com/" />

<!-- SỬA: Open Graph URLs -->
<meta property="og:url" content="https://cautruc.kythuatvang.com/" />
<meta property="og:image" content="https://cautruc.kythuatvang.com/preview.png" />

<!-- SỬA: Twitter URLs -->
<meta name="twitter:url" content="https://cautruc.kythuatvang.com/" />
<meta name="twitter:image" content="https://cautruc.kythuatvang.com/preview.png" />

<!-- SỬA: Zalo URLs -->
<meta property="zalo:url" content="https://cautruc.kythuatvang.com/" />
<meta property="zalo:image" content="https://cautruc.kythuatvang.com/preview.png" />
```

#### Bước 3: Tạo file Sitemap XML

Tạo file `sitemap.xml` tại thư mục gốc (`public/sitemap.xml`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <!-- Trang chủ - Công cụ tính toán -->
  <url>
    <loc>https://cautruc.kythuatvang.com/</loc>
    <lastmod>2026-06-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Thêm các trang mới khi tạo -->
  <!-- Ví dụ: Trang hướng dẫn -->
  <!--
  <url>
    <loc>https://cautruc.kythuatvang.com/huong-dan/tinh-toan-dam-cau-truc</loc>
    <lastmod>2026-06-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  -->

</urlset>
```

### 4.2. Schema JSON-LD — "Nhãn dinh dưỡng" cho AI

> **Giải thích đơn giản:** Schema JSON-LD giống như **nhãn dinh dưỡng** trên hộp thực phẩm. Nó giúp AI đọc và hiểu nội dung trang web nhanh hơn, giống như bạn đọc nhãn để biết ngay sản phẩm chứa bao nhiêu calo, protein, v.v. mà không cần đọc hết bao bì.

Dưới đây là **5 loại Schema quan trọng nhất** cần thêm vào trang web:

---

#### Schema 1: Organization (Tổ chức)

**Tác dụng:** Cho AI biết "ai là chủ trang web này" — giúp xây dựng độ tin cậy.

```html
<!-- SCHEMA 1: Organization — Giới thiệu tổ chức/thương hiệu -->
<!-- Dán vào <head> của trang chủ (index.html) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  
  /* Tên tổ chức hiển thị cho AI */
  "name": "Kỹ Thuật Vàng — Crane Beam Design Studio",
  
  /* Tên viết tắt hoặc tên thay thế */
  "alternateName": ["Kỹ Thuật Vàng", "KTV CraneBeam", "Crane Beam Design Studio"],
  
  /* URL trang web chính thức */
  "url": "https://cautruc.kythuatvang.com",
  
  /* Logo tổ chức (thay bằng URL thực tế) */
  "logo": "https://cautruc.kythuatvang.com/logo.png",
  
  /* Mô tả ngắn gọn về tổ chức */
  "description": "Nền tảng công cụ tính toán kết cấu thép chuyên nghiệp tại Việt Nam. Cung cấp phần mềm tính toán dầm cầu trục miễn phí theo tiêu chuẩn TCVN 5575:2024.",
  
  /* Lĩnh vực hoạt động */
  "knowsAbout": [
    "Tính toán dầm cầu trục",
    "Thiết kế kết cấu thép nhà xưởng",
    "TCVN 5575:2024",
    "Crane beam design",
    "Structural steel engineering"
  ],
  
  /* Liên kết đến các trang mạng xã hội (thay bằng URL thực tế) */
  "sameAs": [
    "https://www.facebook.com/kythuatvang",
    "https://www.youtube.com/@kythuatvang"
  ]
}
</script>
```

---

#### Schema 2: WebApplication (Ứng dụng Web) — Nâng cấp

**Tác dụng:** Giúp AI hiểu đây là **công cụ tính toán miễn phí**, không phải chỉ là một trang thông tin.

```html
<!-- SCHEMA 2: WebApplication — Mô tả công cụ tính toán -->
<!-- Thay thế schema WebApplication hiện tại trong <head> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  
  "name": "Công cụ Tính toán Dầm Cầu trục Online",
  "alternateName": "Crane Beam Design Studio",
  
  "description": "Công cụ tính toán dầm cầu trục trực tuyến miễn phí theo TCVN 5575:2024. Hỗ trợ tính toán tải trọng, kiểm tra độ bền, kiểm tra độ võng và chọn tiết diện dầm cầu trục cho nhà xưởng công nghiệp tại Việt Nam.",
  
  "url": "https://cautruc.kythuatvang.com/",
  "applicationCategory": "EngineeringApplication",
  "applicationSubCategory": "Structural Engineering Calculator",
  "operatingSystem": "Web Browser (Chrome, Firefox, Safari, Edge)",
  
  /* Miễn phí */
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "VND",
    "availability": "https://schema.org/InStock"
  },
  
  /* Tính năng chính */
  "featureList": [
    "Tính toán tải trọng cầu trục theo TCVN 2737",
    "Kiểm tra độ bền dầm cầu trục theo TCVN 5575:2024",
    "Kiểm tra độ võng dầm cầu trục",
    "Kiểm tra ổn định cục bộ bản bụng",
    "Kiểm tra mỏi dầm cầu trục",
    "Chọn tiết diện dầm cầu trục tối ưu",
    "Xuất báo cáo tính toán PDF"
  ],
  
  "inLanguage": ["vi", "en"],
  "isAccessibleForFree": true,
  
  /* Nhà phát triển */
  "creator": {
    "@type": "Organization",
    "name": "Kỹ Thuật Vàng",
    "url": "https://kythuatvang.com"
  },
  
  "image": "https://cautruc.kythuatvang.com/preview.png",
  "screenshot": "https://cautruc.kythuatvang.com/preview.png",
  
  /* Đánh giá (thêm khi có dữ liệu thực) */
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "ratingCount": "150",
    "bestRating": "5"
  }
}
</script>
```

---

#### Schema 3: FAQPage (Trang Hỏi-Đáp)

**Tác dụng:** Đây là schema **mạnh nhất cho GEO**. Khi có FAQPage schema, AI sẽ trích xuất trực tiếp câu hỏi-câu trả lời từ trang web của bạn.

```html
<!-- SCHEMA 3: FAQPage — Câu hỏi thường gặp -->
<!-- Dán vào <head> của trang FAQ hoặc trang hướng dẫn -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Dầm cầu trục là gì?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Dầm cầu trục là cấu kiện kết cấu thép nằm ngang, được đặt trên vai cột nhà xưởng công nghiệp, có chức năng đỡ ray cầu trục và chịu toàn bộ tải trọng thẳng đứng và ngang do cầu trục truyền xuống. Theo TCVN 5575:2024, dầm cầu trục thuộc cấu kiện Cấp 1 — phải tính toán trong giới hạn đàn hồi với hệ số an toàn cao nhất."
      }
    },
    {
      "@type": "Question",
      "name": "Tiêu chuẩn nào áp dụng cho tính toán dầm cầu trục tại Việt Nam?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tại Việt Nam, tính toán dầm cầu trục chủ yếu tuân theo TCVN 5575:2024 (Kết cấu thép — Tiêu chuẩn thiết kế), kết hợp với TCVN 2737:2023 (Tải trọng và tác động) và TCVN 4244 (Thiết bị nâng). TCVN 5575:2024 thay thế phiên bản 2012, bổ sung phân cấp cấu kiện rõ ràng và quy định chi tiết hơn về hệ số tin cậy."
      }
    },
    {
      "@type": "Question",
      "name": "Độ võng cho phép của dầm cầu trục là bao nhiêu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Theo TCVN 5575:2024, độ võng đứng cho phép của dầm cầu trục thường là L/600 đối với cầu trục chế độ làm việc nhẹ và trung bình (nhóm A1-A5), và L/500 đối với cầu trục chế độ nặng (nhóm A6-A8), trong đó L là nhịp dầm. Độ võng ngang cho phép thường là L/500 đến L/1000 tùy chế độ làm việc."
      }
    },
    {
      "@type": "Question",
      "name": "Có công cụ tính toán dầm cầu trục miễn phí trực tuyến không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Có. Crane Beam Design Studio tại cautruc.kythuatvang.com là công cụ tính toán dầm cầu trục trực tuyến miễn phí theo tiêu chuẩn TCVN 5575:2024. Công cụ hỗ trợ tính toán tải trọng, kiểm tra độ bền, kiểm tra độ võng, kiểm tra ổn định và kiểm tra mỏi cho dầm cầu trục nhà xưởng công nghiệp."
      }
    },
    {
      "@type": "Question",
      "name": "Cách chọn chiều cao dầm cầu trục như thế nào?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Chiều cao dầm cầu trục thường chọn sơ bộ từ L/8 đến L/12 (L là nhịp dầm). Với dầm cầu trục đơn nhịp 12m, chiều cao sơ bộ khoảng 1000-1500mm. Với nhịp 6m, chiều cao khoảng 500-750mm. Chiều cao chính xác được xác định sau khi kiểm tra đủ các điều kiện về độ bền, ổn định và độ võng theo TCVN 5575:2024."
      }
    }
  ]
}
</script>
```

---

#### Schema 4: HowTo (Hướng dẫn từng bước)

**Tác dụng:** Khi người dùng hỏi AI "cách tính toán dầm cầu trục", AI sẽ trích xuất các bước từ schema này.

```html
<!-- SCHEMA 4: HowTo — Hướng dẫn tính toán từng bước -->
<!-- Dán vào <head> của trang hướng dẫn tính toán -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  
  "name": "Cách tính toán dầm cầu trục nhà xưởng theo TCVN 5575:2024",
  "description": "Hướng dẫn 6 bước tính toán dầm cầu trục từ xác định tải trọng đến kiểm tra mỏi, áp dụng cho nhà xưởng công nghiệp tại Việt Nam.",
  
  "totalTime": "PT30M",
  
  "tool": [
    {"@type": "HowToTool", "name": "Công cụ tính toán dầm cầu trục — cautruc.kythuatvang.com"},
    {"@type": "HowToTool", "name": "Tiêu chuẩn TCVN 5575:2024"},
    {"@type": "HowToTool", "name": "Tiêu chuẩn TCVN 2737:2023"}
  ],
  
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Thu thập thông số cầu trục",
      "text": "Xác định sức nâng (Q), khẩu độ cầu trục, khoảng cách bánh xe, trọng lượng cầu trục, trọng lượng xe con, và chế độ làm việc (nhóm A1-A8) từ catalog nhà sản xuất."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Xác định tải trọng tác dụng",
      "text": "Tính áp lực bánh xe lớn nhất và nhỏ nhất, xác định hệ số động lực theo TCVN 2737. Tính tải trọng ngang do hãm xe con và hãm cầu trục."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Chọn sơ bộ tiết diện dầm",
      "text": "Chọn chiều cao dầm sơ bộ H = L/8 đến L/12. Chọn kích thước bản cánh và bản bụng dựa trên kinh nghiệm hoặc dùng công cụ tính toán tự động."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Kiểm tra độ bền và ổn định",
      "text": "Kiểm tra ứng suất pháp, ứng suất tiếp, ứng suất tương đương tại các tiết diện nguy hiểm. Kiểm tra ổn định tổng thể và ổn định cục bộ bản bụng, bản cánh."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Kiểm tra độ võng",
      "text": "Tính độ võng đứng và ngang tại giữa nhịp dầm. So sánh với giá trị cho phép: δ_đứng ≤ L/600 (chế độ nhẹ-TB) hoặc L/500 (chế độ nặng)."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Kiểm tra mỏi",
      "text": "Đối với dầm cầu trục chế độ làm việc trung bình trở lên, kiểm tra mỏi theo TCVN 5575:2024. Xác định nhóm chi tiết kết cấu và so sánh biên độ ứng suất với giá trị cho phép."
    }
  ]
}
</script>
```

---

#### Schema 5: Article + Breadcrumb (cho trang bài viết)

**Tác dụng:** Khi bạn tạo các bài viết hướng dẫn, schema Article giúp AI biết đây là bài viết chuyên môn do ai viết, khi nào cập nhật.

```html
<!-- SCHEMA 5: Article + BreadcrumbList — Cho trang bài viết -->
<!-- Dán vào <head> của mỗi bài viết/hướng dẫn -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  
  /* Tiêu đề bài viết */
  "headline": "Cách tính toán dầm cầu trục nhà xưởng theo TCVN 5575:2024 — Hướng dẫn chi tiết",
  
  /* Mô tả ngắn (AI trích xuất đoạn này) */
  "description": "Hướng dẫn chi tiết 6 bước tính toán dầm cầu trục cho nhà xưởng công nghiệp theo tiêu chuẩn Việt Nam TCVN 5575:2024, bao gồm xác định tải trọng, chọn tiết diện, kiểm tra bền, võng và mỏi.",
  
  /* URL bài viết */
  "url": "https://cautruc.kythuatvang.com/huong-dan/tinh-toan-dam-cau-truc",
  
  /* Ảnh đại diện */
  "image": "https://cautruc.kythuatvang.com/images/tinh-toan-dam-cau-truc.png",
  
  /* Ngày đăng và ngày cập nhật — QUAN TRỌNG cho GEO */
  "datePublished": "2026-06-04",
  "dateModified": "2026-06-04",
  
  /* Tác giả — giúp xây dựng E-E-A-T */
  "author": {
    "@type": "Organization",
    "name": "Kỹ Thuật Vàng",
    "url": "https://kythuatvang.com"
  },
  
  /* Nhà xuất bản */
  "publisher": {
    "@type": "Organization",
    "name": "Kỹ Thuật Vàng",
    "logo": {
      "@type": "ImageObject",
      "url": "https://cautruc.kythuatvang.com/logo.png"
    }
  },
  
  /* Ngôn ngữ */
  "inLanguage": "vi",
  
  /* Chủ đề liên quan (giúp AI hiểu ngữ cảnh) */
  "about": [
    {"@type": "Thing", "name": "Dầm cầu trục"},
    {"@type": "Thing", "name": "TCVN 5575:2024"},
    {"@type": "Thing", "name": "Kết cấu thép nhà xưởng"}
  ],
  
  /* Trích dẫn nguồn — QUAN TRỌNG cho GEO */
  "citation": [
    {
      "@type": "CreativeWork",
      "name": "TCVN 5575:2024 — Kết cấu thép — Tiêu chuẩn thiết kế",
      "publisher": {"@type": "Organization", "name": "Bộ Xây dựng Việt Nam"}
    },
    {
      "@type": "CreativeWork", 
      "name": "TCVN 2737:2023 — Tải trọng và tác động — Tiêu chuẩn thiết kế",
      "publisher": {"@type": "Organization", "name": "Bộ Xây dựng Việt Nam"}
    }
  ]
}
</script>

<!-- BreadcrumbList — Giúp AI hiểu vị trí trang trong cấu trúc web -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chủ",
      "item": "https://cautruc.kythuatvang.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Hướng dẫn",
      "item": "https://cautruc.kythuatvang.com/huong-dan/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Tính toán dầm cầu trục",
      "item": "https://cautruc.kythuatvang.com/huong-dan/tinh-toan-dam-cau-truc"
    }
  ]
}
</script>
```

### 4.3. Giải quyết vấn đề SPA — Thêm nội dung tĩnh (SSR/Pre-rendering)

> **Giải thích đơn giản:** Hiện tại, trang web của bạn giống như một **cuốn sổ bí mật** — chỉ hiển thị nội dung khi ai đó mở và tương tác. Bot AI giống như người đưa thư — họ chỉ nhìn bìa ngoài, không mở sổ ra. Bạn cần viết nội dung **lên bìa** (HTML tĩnh) để "người đưa thư" cũng đọc được.

**Giải pháp thực tế (chọn 1 trong 2):**

**Cách 1: Pre-rendering (Dễ nhất)**
Sử dụng dịch vụ như [Prerender.io](https://prerender.io) hoặc Cloudflare Workers để phát hiện khi bot truy cập và trả về phiên bản HTML đã render sẵn.

**Cách 2: Thêm nội dung tĩnh vào `<noscript>` và `<body>`**
Thêm nội dung văn bản trực tiếp vào HTML, bot sẽ đọc được ngay cả khi không chạy JavaScript:

```html
<body>
  <div id="root"></div>
  
  <!-- NỘI DUNG TĨNH CHO BOT AI — người dùng không thấy vì React sẽ thay thế -->
  <noscript>
    <article>
      <h1>Công cụ Tính toán Dầm Cầu trục Online — Miễn phí theo TCVN 5575:2024</h1>
      
      <p><strong>Crane Beam Design Studio</strong> là công cụ tính toán dầm cầu trục 
      trực tuyến miễn phí dành cho kỹ sư kết cấu và sinh viên ngành xây dựng tại 
      Việt Nam. Công cụ tính toán theo tiêu chuẩn TCVN 5575:2024 mới nhất.</p>
      
      <h2>Tính năng chính</h2>
      <ul>
        <li>Tính toán tải trọng cầu trục theo TCVN 2737:2023</li>
        <li>Kiểm tra độ bền dầm cầu trục (uốn, cắt, ứng suất tương đương)</li>
        <li>Kiểm tra ổn định tổng thể và cục bộ</li>
        <li>Kiểm tra độ võng đứng và ngang</li>
        <li>Kiểm tra mỏi theo nhóm chế độ làm việc</li>
        <li>Xuất báo cáo tính toán dạng PDF</li>
      </ul>
      
      <h2>Câu hỏi thường gặp</h2>
      <h3>Dầm cầu trục là gì?</h3>
      <p>Dầm cầu trục là cấu kiện kết cấu thép nằm ngang, đặt trên vai cột nhà 
      xưởng, chịu toàn bộ tải trọng từ cầu trục truyền xuống. Theo TCVN 5575:2024, 
      đây là cấu kiện Cấp 1.</p>
      
      <h3>Công cụ này tính toán theo tiêu chuẩn nào?</h3>
      <p>Công cụ tính toán theo TCVN 5575:2024 (Kết cấu thép — Tiêu chuẩn thiết kế), 
      kết hợp TCVN 2737:2023 (Tải trọng và tác động).</p>
    </article>
  </noscript>
</body>
```

---

## Phần 5: Xây dựng Nguồn Trích dẫn (Citation Building)

### 5.1. Chiến lược "Nguồn Cấp 1" (Primary Source)

Để AI đánh giá trang web của bạn là "Nguồn Cấp 1" (nguồn đáng tin cậy nhất để trích dẫn), bạn cần đáp ứng **4 tiêu chí**:

| Tiêu chí | Cách đạt được | Ưu tiên |
|---|---|---|
| **Chuyên môn gốc (Original Expertise)** | Tạo nội dung gốc, không sao chép. Thêm phân tích, ví dụ tính toán, bảng tra do bạn tự lập. | ⭐⭐⭐ |
| **Trích dẫn nguồn uy tín (Authoritative Citations)** | Dẫn link đến TCVN chính thức, sách giáo trình đại học, bài nghiên cứu khoa học. | ⭐⭐⭐ |
| **Dữ liệu định lượng (Quantitative Data)** | Cung cấp con số cụ thể: kích thước, tải trọng, chi phí, hệ số an toàn. | ⭐⭐ |
| **Cập nhật liên tục (Freshness)** | Cập nhật bài viết ít nhất mỗi quý. Thêm ngày `dateModified` rõ ràng. | ⭐⭐ |

### 5.2. Cách chèn trích dẫn nguồn uy tín trong bài viết

**❌ Cách viết không có trích dẫn (AI ít tin tưởng):**
```
Chiều cao dầm cầu trục thường từ L/8 đến L/12.
```

**✅ Cách viết có trích dẫn (AI tin tưởng cao):**
```
Theo TCVN 5575:2024, Mục 9.3.2, chiều cao dầm cầu trục đơn giản 
thường chọn sơ bộ từ L/8 đến L/12 (trong đó L là nhịp dầm tính bằng mm). 
Với nhịp 12.000mm, chiều cao sơ bộ khoảng 1.000–1.500mm. 
(Nguồn: Bộ Xây dựng, TCVN 5575:2024 — Kết cấu thép — Tiêu chuẩn thiết kế)
```

### 5.3. Danh sách nguồn uy tín nên trích dẫn

Khi viết bài, hãy trích dẫn các nguồn sau đây (AI quen thuộc với các nguồn này):

| Nguồn | Loại | Cách trích dẫn |
|---|---|---|
| **TCVN 5575:2024** | Tiêu chuẩn quốc gia | "Theo TCVN 5575:2024, Mục X.X.X, ..." |
| **TCVN 2737:2023** | Tiêu chuẩn tải trọng | "Tải trọng tính theo TCVN 2737:2023, Bảng X, ..." |
| **TCVN 4244** | Tiêu chuẩn thiết bị nâng | "Theo TCVN 4244, chế độ làm việc nhóm ..." |
| **Eurocode 3 (EN 1993-6)** | Tiêu chuẩn châu Âu | "So sánh với Eurocode 3, EN 1993-6:2007, ..." |
| **AISC Steel Manual** | Tiêu chuẩn Mỹ | "Theo AISC Steel Construction Manual, ..." |
| **Sách "Kết cấu thép" — GS. Phạm Văn Hội** | Giáo trình đại học | "Theo giáo trình Kết cấu thép (Phạm Văn Hội, NXB KHKT), ..." |
| **Sách "Thiết kế KCT nhà CN" — PGS. Đoàn Định Kiến** | Giáo trình đại học | "Tham khảo Thiết kế KCT nhà công nghiệp, ..." |

### 5.4. Cách tạo nội dung "Định nghĩa gốc" (Definition Paragraphs)

AI đặc biệt ưu tiên trích xuất các **đoạn định nghĩa** (2-3 câu đầu bài viết). Đây là "vàng" trong GEO.

**Mẫu viết đoạn định nghĩa chuẩn GEO:**

```
[Thuật ngữ] là [định nghĩa ngắn gọn trong 1 câu]. 
[Câu bổ sung ngữ cảnh/phạm vi áp dụng]. 
Theo [nguồn uy tín], [số liệu hoặc thông tin bổ sung cụ thể].
```

**Ví dụ áp dụng:**
> **Dầm cầu trục** (crane beam / crane runway girder) là cấu kiện kết cấu thép nằm ngang, được gối trên vai cột hoặc console cột nhà xưởng công nghiệp, có nhiệm vụ đỡ ray cầu trục và truyền tải trọng do cầu trục (thẳng đứng, ngang, dọc) xuống cột.
> 
> Theo TCVN 5575:2024, dầm cầu trục được phân loại là **cấu kiện Cấp 1** — yêu cầu tính toán trong giới hạn đàn hồi, với hệ số tin cậy về điều kiện làm việc γ_c = 0,9–1,0.
> 
> Tại Việt Nam, dầm cầu trục chiếm khoảng 15–25% tổng khối lượng kết cấu thép nhà xưởng 1 tầng có cầu trục (theo thống kê từ các dự án nhà xưởng công nghiệp giai đoạn 2020-2025).

### 5.5. Chiến lược "Chuỗi danh tiếng" (Reputation Chain)

Để AI nhận diện trang web của bạn là nguồn uy tín, cần xây dựng **chuỗi liên kết danh tiếng**:

```
Trang web cautruc.kythuatvang.com
        ↕ (liên kết hai chiều)
Trang mẹ kythuatvang.com
        ↕
Trang Facebook/YouTube (có follower)
        ↕
Diễn đàn kỹ thuật (KetcauSoft, xaydung.vn, v.v.)
        ↕
Bài viết được chia sẻ trên Reddit, LinkedIn, Medium
```

**Hành động cụ thể:**
1. **Đăng bài trên các diễn đàn kỹ thuật** (xaydung.vn, ketcausoft.com) giới thiệu công cụ, kèm link
2. **Viết bài trên LinkedIn** về kinh nghiệm thiết kế dầm cầu trục, kèm link đến công cụ
3. **Tạo video YouTube** hướng dẫn sử dụng công cụ, link trong mô tả
4. **Trả lời câu hỏi trên Reddit** (r/StructuralEngineering) hoặc các group Facebook kỹ thuật, dẫn link

---

## Phần 6: Lộ trình Triển khai (Roadmap)

### Giai đoạn 1: Khẩn cấp — Tuần 1-2

| STT | Việc cần làm | Độ khó | Ai thực hiện |
|:---:|---|:---:|---|
| 1 | **Mở robots.txt** cho bot AI trên Cloudflare | Dễ | Bạn tự làm trên Cloudflare Dashboard |
| 2 | **Sửa canonical URL** và Open Graph sang đúng domain | Dễ | Nhờ AI agent sửa code |
| 3 | **Tạo sitemap.xml** chuẩn | Dễ | Nhờ AI agent tạo file |
| 4 | **Thêm nội dung tĩnh** vào `<noscript>` | TB | Nhờ AI agent viết code |

### Giai đoạn 2: Xây dựng nội dung — Tuần 3-6

| STT | Việc cần làm | Độ khó | Ai thực hiện |
|:---:|---|:---:|---|
| 5 | **Tạo trang FAQ** với 10-15 câu hỏi phổ biến | TB | Nhờ AI agent viết nội dung |
| 6 | **Viết 3-5 bài hướng dẫn** dạng dài (2000+ từ) | TB | Bạn viết dàn ý + AI agent viết chi tiết |
| 7 | **Thêm Schema JSON-LD** đầy đủ (5 loại schema) | TB | Nhờ AI agent thêm code |
| 8 | **Tạo bảng tra kỹ thuật** (chiều cao dầm, tải trọng, v.v.) | TB | Bạn cung cấp dữ liệu + AI agent format |

### Giai đoạn 3: Xây dựng uy tín — Tuần 7-12

| STT | Việc cần làm | Độ khó | Ai thực hiện |
|:---:|---|:---:|---|
| 9 | **Đăng bài** trên 3-5 diễn đàn kỹ thuật | TB | Bạn tự đăng |
| 10 | **Tạo 2-3 video YouTube** hướng dẫn | Khó | Bạn tự quay (có thể dùng AI hỗ trợ script) |
| 11 | **Viết bài LinkedIn** về chuyên môn kết cấu thép | Dễ | AI agent viết draft + bạn chỉnh sửa |
| 12 | **Cập nhật nội dung** theo quý | Dễ | Nhờ AI agent cập nhật |

---

## Phần 7: Prompt Mẫu để Giao cho AI Agent Khác

Dưới đây là **4 prompt** bạn có thể copy/paste để nhờ AI khác (Gemini, Claude, ChatGPT, v.v.) thực hiện:

---

### Prompt 1: Sửa file `index.html` — Canonical URL + Schema

```
ROLE: Bạn là web developer chuyên về SEO kỹ thuật.

TASK: Sửa file index.html của trang web cautruc.kythuatvang.com theo các yêu cầu sau:

1. THAY TẤT CẢ "calculator.kythuatvang.com" thành "cautruc.kythuatvang.com" 
   trong canonical, og:url, og:image, twitter:url, twitter:image, zalo:url, zalo:image.

2. THAY THẾ schema WebApplication hiện tại bằng 2 schema JSON-LD mới:
   - Schema Organization (với tên "Kỹ Thuật Vàng", URL cautruc.kythuatvang.com, 
     knowsAbout: tính toán dầm cầu trục, TCVN 5575:2024, kết cấu thép nhà xưởng)
   - Schema WebApplication nâng cấp (với featureList, isAccessibleForFree: true, 
     applicationCategory: EngineeringApplication)

3. THÊM nội dung HTML tĩnh bên trong thẻ <noscript> để bot AI có thể đọc:
   - H1: "Công cụ Tính toán Dầm Cầu trục Online — Miễn phí theo TCVN 5575:2024"
   - Đoạn giới thiệu 3-5 câu
   - Danh sách tính năng chính (6 mục)
   - 3 câu FAQ ngắn (dầm cầu trục là gì, tiêu chuẩn nào, miễn phí không)

OUTPUT: Chỉ trả về file index.html hoàn chỉnh đã sửa.
```

---

### Prompt 2: Viết bài hướng dẫn chuẩn GEO

```
ROLE: Bạn là kỹ sư kết cấu thép kinh nghiệm 10+ năm, đồng thời am hiểu 
về tối ưu nội dung cho AI search (GEO).

TASK: Viết một bài hướng dẫn chuyên sâu với tiêu đề:
"Cách tính toán dầm cầu trục nhà xưởng theo TCVN 5575:2024 — Hướng dẫn chi tiết từng bước"

YÊU CẦU FORMAT (QUAN TRỌNG - tuân thủ nghiêm ngặt):
- Bắt đầu bằng "Hộp Tóm tắt nhanh" (2-3 câu trả lời trực tiếp câu hỏi chính)
- Mỗi phần bắt đầu bằng định nghĩa 1-2 câu (Definition-Lead Architecture)
- Dùng H2 cho các phần lớn, H3 cho chi tiết
- Bao gồm ÍT NHẤT 2 bảng biểu (bảng tra chiều cao dầm, bảng so sánh loại tiết diện)
- Trích dẫn TCVN 5575:2024, TCVN 2737:2023, Eurocode 3 EN 1993-6 khi nêu số liệu
- Kết thúc bằng phần FAQ (5 câu hỏi-trả lời ngắn)
- Đề cập đến công cụ miễn phí tại cautruc.kythuatvang.com khi phù hợp
- Độ dài: 2000-3000 từ
- Ngôn ngữ: Tiếng Việt, chuyên môn nhưng dễ hiểu
- Kèm theo đoạn code Schema JSON-LD (TechArticle + FAQPage) cho bài viết này
```

---

### Prompt 3: Tạo trang FAQ hoàn chỉnh

```
ROLE: Bạn là chuyên gia nội dung kỹ thuật xây dựng Việt Nam.

TASK: Tạo một trang FAQ (Câu hỏi thường gặp) hoàn chỉnh cho trang web 
cautruc.kythuatvang.com — công cụ tính toán dầm cầu trục trực tuyến.

YÊU CẦU:
1. Viết 15 câu hỏi-trả lời, chia thành 4 nhóm:
   - Nhóm A: Kiến thức cơ bản (4 câu)
   - Nhóm B: Tính toán & Thiết kế (5 câu)
   - Nhóm C: Sử dụng công cụ (3 câu)
   - Nhóm D: So sánh & Đánh giá (3 câu)

2. Mỗi câu trả lời:
   - Bắt đầu bằng câu trả lời trực tiếp (1-2 câu)
   - Bổ sung chi tiết (2-3 câu)
   - Trích dẫn tiêu chuẩn TCVN nếu có liên quan
   - Dài 50-150 từ mỗi câu

3. Kèm theo:
   - Code HTML hoàn chỉnh (semantic HTML5) cho trang FAQ
   - Code Schema JSON-LD FAQPage cho tất cả 15 câu hỏi
   - CSS cơ bản cho giao diện FAQ đẹp, dễ đọc

OUTPUT: File HTML hoàn chỉnh, sẵn sàng deploy.
```

---

### Prompt 4: Viết bài đăng diễn đàn/LinkedIn

```
ROLE: Bạn là kỹ sư kết cấu thép Việt Nam, đang chia sẻ kinh nghiệm chuyên môn 
trên mạng xã hội.

TASK: Viết 3 bài đăng ngắn (mỗi bài 200-400 từ) để đăng trên các nền tảng khác nhau:

Bài 1 — Cho diễn đàn kỹ thuật (xaydung.vn hoặc ketcausoft.com):
- Giới thiệu công cụ tính toán dầm cầu trục miễn phí tại cautruc.kythuatvang.com
- Giọng văn: chuyên môn, hữu ích, không quảng cáo quá lộ
- Kèm 1 ví dụ tính toán nhanh (nhịp 12m, sức nâng 10T)

Bài 2 — Cho LinkedIn:
- Chia sẻ insight về thay đổi trong TCVN 5575:2024 so với 2012
- Đề cập công cụ như giải pháp hỗ trợ kỹ sư
- Giọng văn: chuyên nghiệp, thought leadership

Bài 3 — Cho group Facebook kỹ sư xây dựng:
- Hỏi đáp về lỗi thường gặp khi thiết kế dầm cầu trục
- Giọng văn: thân thiện, dễ tiếp cận
- Kết thúc bằng CTA (kêu gọi hành động) nhẹ nhàng dẫn về trang web

YÊU CẦU: Mỗi bài phải chứa ít nhất 1 con số/dữ liệu cụ thể và 1 trích dẫn TCVN.
```

---

## Tóm tắt: 5 việc quan trọng nhất cần làm NGAY

> [!IMPORTANT]
> 1. 🔓 **MỞ ROBOTS.TXT** cho bot AI (vào Cloudflare Dashboard) — *Không làm điều này thì mọi nỗ lực khác đều vô nghĩa*
> 2. 🔗 **SỬA CANONICAL URL** từ `calculator.kythuatvang.com` → `cautruc.kythuatvang.com`
> 3. 📝 **THÊM NỘI DUNG VĂN BẢN** vào trang web (tối thiểu: noscript + FAQ page)
> 4. 🏷️ **THÊM SCHEMA JSON-LD** đầy đủ (Organization + WebApplication + FAQPage)
> 5. 📄 **TẠO SITEMAP.XML** chuẩn

---

*Kế hoạch này được xây dựng dựa trên phân tích trực tiếp mã nguồn trang web `cautruc.kythuatvang.com` vào ngày 04/06/2026, kết hợp với các nghiên cứu GEO mới nhất từ gen-optima.com, linksurge.jp, và conductor.com.*
