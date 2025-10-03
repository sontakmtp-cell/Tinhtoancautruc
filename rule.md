Cải thiện logic tính toán trong VBeamCalculator.tsx và calculationService.ts

Mục tiêu
Thay thế phương pháp tính toán xấp xỉ hiện tại (quy đổi dầm V về dầm I) bằng một hàm tính toán chuyên biệt, phân tích trực tiếp mặt cắt hình học phức tạp của dầm V để cho ra kết quả chính xác.

Kế hoạch chi tiết
Bước 1: Phân tích và Chuẩn bị
Trước khi viết code, chúng ta cần hiểu rõ cấu trúc hình học của dầm V và công thức tính toán cho các mặt cắt phức hợp.

Mặt cắt dầm V được cấu thành từ các hình đơn giản:

Cánh dưới (Bottom Flange): 1 hình chữ nhật.
Thân giữa (Central Web): 1 hình chữ nhật.
Web nghiêng (V-Webs): 2 hình bình hành (hoặc hình chữ nhật nếu tính theo phương nghiêng).
Mái nghiêng (Roofs): 2 hình bình hành.
Chúng ta sẽ sử dụng phương pháp cộng gộp và định lý chuyển trục song song (Steiner) để tính các đặc trưng hình học của toàn bộ mặt cắt.

Công thức cốt lõi:

Tổng diện tích: F = Σ F_i
Vị trí trọng tâm (Yc): Yc = (Σ (F_i * y_i)) / F
Mô-men quán tính (Jx): Jx = Σ (Jx_i + F_i * d_i^2)
y_i: Tọa độ trọng tâm của hình i so với trục tham chiếu (ví dụ: đáy dầm).
Jx_i: Mô-men quán tính của hình i đối với trục đi qua trọng tâm của chính nó.
d_i: Khoảng cách từ trọng tâm hình i đến trọng tâm chung Yc của cả mặt cắt (d_i = |y_i - Yc|).
Bước 2: Tạo hàm tính toán mới cho Dầm V
Chúng ta sẽ tạo một hàm mới trong calculationService.ts để xử lý riêng cho dầm V.

TODO List:

[ ] Tạo hàm calculateVBeamProperties trong services/calculationService.ts:

Hàm này sẽ nhận inputs: VBeamInputs làm đầu vào.
Nó sẽ trả về một đối tượng có cấu trúc tương tự CalculationResults.
[ ] Triển khai tính toán đặc trưng hình học bên trong calculateVBeamProperties:

Xác định các hằng số: Góc nghiêng của V-web (a1) và mái (alpha). Dựa trên file VBeamCrossSection.tsx, các góc này đang được hardcode là 30° và 10°.
Chia mặt cắt: Định nghĩa 5-6 hình học cơ bản (cánh dưới, thân giữa, 2 web nghiêng, 2 mái nghiêng).
Tính toán cho từng hình:
Tạo một mảng các đối tượng, mỗi đối tượng đại diện cho một hình đơn giản và chứa: area (diện tích), centroid_y (tọa độ y của trọng tâm), và inertia_x (mô-men quán tính riêng).
Lưu ý quan trọng: Đối với các hình nghiêng (web và mái), công thức tính mô-men quán tính sẽ phức tạp hơn. Bạn cần sử dụng công thức cho hình bình hành hoặc chia chúng thành hình chữ nhật và tam giác.
Tổng hợp kết quả:
Tính tổng diện tích F.
Tính vị trí trọng tâm chung Yc.
Sử dụng định lý Steiner để tính tổng mô-men quán tính Jx.
Tính mô-men kháng uốn Wx = Jx / (H - Yc) và Wx_bottom = Jx / Yc.
[ ] Sao chép và điều chỉnh các phép tính còn lại:

Phần lớn các phép tính về tải trọng, mô-men uốn (M_x), ứng suất (sigma_u), độ võng (f), và các kiểm tra an toàn (stress_check, deflection_check...) từ hàm calculateBeamProperties có thể được tái sử dụng.
Copy các logic này vào calculateVBeamProperties và đảm bảo chúng sử dụng các giá trị F, Jx, Wx... vừa được tính toán chính xác cho dầm V.
Bước 3: Tích hợp hàm mới vào Component VBeamCalculator.tsx
Sau khi đã có hàm tính toán chính xác, chúng ta cần cập nhật component UI để gọi nó.

TODO List:

[ ] Import hàm mới:

Trong components/VBeamCalculator.tsx, import calculateVBeamProperties từ calculationService.ts.
[ ] Cập nhật hàm handleSubmit:

Xóa bỏ hàm convertVBeamToBeamInputs và các lệnh gọi liên quan.
Thay thế lời gọi calculateBeamProperties(beamInputs, 'single-girder') bằng calculateVBeamProperties(inputs).
Hàm generateDiagramData có thể vẫn cần BeamInputs. Nếu vậy, hãy tạo một hàm chuyển đổi đơn giản chỉ để phục vụ cho việc vẽ biểu đồ, hoặc tốt hơn là tạo một generateVBeamDiagramData riêng.
[ ] Cập nhật các component con (nếu cần):

Các biểu đồ như StressDistributionDiagram và DeflectedShapeDiagram hiện đang nhận BeamInputs. Bạn cần điều chỉnh chúng để có thể hoạt động với VBeamInputs hoặc truyền các giá trị đã được tính toán một cách phù hợp. Cách đơn giản nhất là vẫn truyền một đối tượng BeamInputs đã được chuyển đổi (như convertVBeamToBeamInputs) cho các component con này để tránh phải viết lại chúng.

Tóm tắt TODO List
[ ] services/calculationService.ts:
[ ] Tạo hàm calculateVBeamProperties(inputs: VBeamInputs): CalculationResults.
[ ] Implement logic tính toán đặc trưng hình học (F, Yc, Jx) cho mặt cắt V.
[ ] Tái sử dụng logic tính toán ứng suất, độ võng, kiểm tra an toàn.
[ ] components/VBeamCalculator.tsx:
[ ] Import calculateVBeamProperties.
[ ] Trong handleSubmit, thay thế lời gọi hàm tính toán cũ bằng hàm mới.
[ ] Xóa hoặc vô hiệu hóa convertVBeamToBeamInputs (trừ khi cần cho các component con).
