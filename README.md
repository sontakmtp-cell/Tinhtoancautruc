# Trình Tính Toán Dầm Cầu Trục Thông Minh

Ứng dụng web hiện đại để tính toán và phân tích dầm cầu trục với khả năng tạo báo cáo PDF chuyên nghiệp.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Tính Năng Chính

### 🔧 Tính Toán Kỹ Thuật
- **Phân tích mặt cắt dầm**: Tính toán diện tích, mô-men quán tính, mô-men kháng uốn
- **Kiểm tra an toàn**: Ứng suất, độ võng, ổn định cục bộ
- **Biểu đồ phân tích**: Nội lực, phân bố ứng suất, hình dạng võng

### 📊 Trực Quan Hóa Dữ Liệu
- Biểu đồ mô-men uốn và lực cắt
- Phân bố ứng suất trên mặt cắt
- Hình dạng võng của dầm
- Sơ đồ mặt cắt tương tác

### 📄 Báo Cáo PDF Chuyên Nghiệp
- **Tạo báo cáo tự động**: Xuất toàn bộ kết quả tính toán ra file PDF
- **Tùy chỉnh thông tin**: Tên dự án, kỹ sư thiết kế
- **Bao gồm biểu đồ**: Tích hợp các biểu đồ phân tích vào báo cáo
- **Định dạng chuẩn**: Báo cáo có cấu trúc rõ ràng, dễ đọc

### 🤖 AI Hỗ Trợ
- Đề xuất thiết kế thông minh khi không đạt yêu cầu an toàn
- Powered by Google Gemini AI

## Hướng Dẫn Sử Dụng

### Cài Đặt và Chạy

**Yêu cầu:** Node.js

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Thiết lập Environment Variables:**
   - Copy file `.env.example` thành `.env`
   - Cập nhật các giá trị trong `.env`:
     ```
     GEMINI_API_KEY=  # Lấy API key từ: https://makersuite.google.com/app/apikey
     ```
   - ⚠️ Lưu ý: KHÔNG commit file `.env` lên git

3. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```

4. **Truy cập:** http://localhost:5173

### Sử Dụng Tính Năng PDF

1. **Thực hiện tính toán:**
   - Nhập các thông số đầu vào
   - Nhấn "Kiểm tra & Tính toán"

2. **Tạo báo cáo PDF:**
   - Nhấn nút "Xuất báo cáo PDF" (màu xanh lá)
   - Điền thông tin dự án và kỹ sư
   - Chọn có/không bao gồm biểu đồ
   - Nhấn "Tạo PDF"

3. **Nội dung báo cáo:**
   - Thông tin dự án
   - Thông số đầu vào chi tiết
   - Kết quả tính toán
   - Kiểm tra an toàn
   - Đánh giá tổng quát
   - Biểu đồ phân tích (nếu được chọn)

## Cấu Trúc Dự Án

```
├── components/
│   ├── CraneBeamCalculator.tsx    # Component chính
│   ├── PDFReport.tsx              # Xử lý xuất PDF
│   ├── InternalForceDiagram.tsx   # Biểu đồ nội lực
│   ├── StressDistributionDiagram.tsx  # Biểu đồ ứng suất
│   └── DeflectedShapeDiagram.tsx  # Biểu đồ võng
├── services/
│   ├── calculationService.ts      # Logic tính toán
│   ├── geminiService.ts          # Tích hợp AI
│   └── pdfService.ts             # Dịch vụ tạo PDF
└── types.ts                      # Định nghĩa types
```

## Công Nghệ Sử Dụng

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **PDF Generation**: jsPDF, html2canvas
- **AI**: Google Gemini API
- **Build Tool**: Vite
- **Icons**: Lucide React

## Tính Năng Mới - Báo Cáo PDF

### Thư Viện Sử Dụng
- **jsPDF**: Tạo file PDF
- **html2canvas**: Chụp biểu đồ thành hình ảnh

### Đặc Điểm
- ✅ Hỗ trợ tiếng Việt
- ✅ Tự động phân trang
- ✅ Bao gồm biểu đồ SVG
- ✅ Định dạng chuyên nghiệp
- ✅ Kiểm tra an toàn với màu sắc
- ✅ Thông tin chi tiết đầy đủ

View your app in AI Studio: https://ai.studio/apps/drive/1VBNgzTkxjGHc-jsQ_yiUzfeIhoC3O_1a
