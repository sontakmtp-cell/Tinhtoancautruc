Dưới đây là kế hoạch chi tiết (kèm TODO cụ thể) để nâng cấp mô-đun Dầm đôi, tập trung bổ sung tính xoắn khi Tr ≠ Td. Kế hoạch ưu tiên tính toán đúng, tích hợp mượt với code hiện tại, và có thể triển khai từng bước.

1) Phạm Vi + Công Thức

Mục tiêu
Thêm xoắn do lệch tâm giữa tim ray và tim dầm: Tr ≠ Td.
Tính ứng suất cắt do xoắn, góc xoay, và ảnh hưởng đến kiểm tra bền.
Mô hình và công thức
Lệch tâm mỗi bên: e = (Tr − Td)/2 (đơn vị cm, mm tùy nội bộ; chuẩn hóa trước khi tính).
Lực đặt lên ray mỗi bên: dùng phản lực dọc gối R_side hoặc phân bố tải theo per-beam đã có; mô-men xoắn trên mỗi dầm: T = R_side × e.
Với tiết diện kín thành mỏng (dầm hộp hàn 2 sườn, 2 cánh), dùng Bredt–Batho:
Diện tích kín theo đường trung bình: A_m ≈ (b1 + t3) × (h − t1 − t2) (mm²).
Tổng chu vi “l_i/t_i”: Σ(l/t) ≈ (b3/t2) + (b/t1) + 2×((h − t1 − t2)/t3).
Hằng số xoắn St Venant: J_t ≈ 4 A_m² / Σ(l/t) (mm⁴).
Lưu lượng cắt do xoắn: q = T / (2 A_m) (N/mm); Ứng suất cắt: τ_t,i = q / t_i (MPa quy đổi hoặc kg/cm² theo hệ hiện tại).
Góc xoay: θ' = T / (G J_t) (rad/cm), G = E/(2(1+ν)).
Kiểm tra kết hợp: có 2 lựa chọn
Đơn giản: kiểm tra τ_t ≤ τ_allow (ví dụ 0.6 σ_allow) và báo cáo riêng.
Nâng cao: quy về Von Mises: σ_vm = sqrt(σ_bend² + 3 τ_total²) ≤ σ_allow. Ở bản 1, giữ đơn giản, chỉ ảnh hưởng badge “Buckling”/“Stress check” nếu vượt ngưỡng cắt.
TODO
Chốt hệ đơn vị nội bộ: hiện service đang dùng cm và kg/cm; đảm bảo T quy về kg.cm, A_m sang cm², J_t sang cm⁴, q/τ về kg/cm² hoặc chuyển sang MPa nhất quán với hiển thị.
2) Mở Rộng Kiểu Dữ Liệu

File: tinh toan cau truc/types.ts
TODO
Mở rộng CalculationResults:
T_torsion?: number // mô-men xoắn cực đại (kg.cm)
theta?: number // góc xoay cực đại (rad hoặc mrad)
tau_t_top?: number, tau_t_bottom?: number, tau_t_web?: number // ứng suất cắt do xoắn theo tấm (kg/cm²)
torsion_check?: 'pass' | 'fail'
Tùy chọn: thêm railDifferential?: number // chênh cao giữa 2 tim ray do xoay: Δz ≈ θ × (Tr/2).
3) Tính Toán Trong Service

File: tinh toan cau truc/services/calculationService.ts
TODO
Thêm helper chuẩn hóa đơn vị: mm↔cm, kg/m↔kg/cm, giữ đồng nhất với module hiện tại.
Tính thông số dầm hộp theo đường trung bình:
A_m_mm2 = (b1 + t3) * (h - t1 - t2); sum_l_over_t = (b3/t2) + (b/t1) + 2 * ((h - t1 - t2)/t3).
Jt_mm4 = 4*A_m_mm2*A_m_mm2 / sum_l_over_t.
Quy đổi về cm nếu phần còn lại dùng cm.
Tính lệch tâm: e_cm = (Tr - Td) / 20 (mm → cm, rồi chia 2).
Xác định lực R_side cho mỗi dầm:
Dùng phản lực hiện tại trong generateDiagramData (R = P/2 + qL/2) cho per-beam.
T = R_side * e_cm (kg × cm).
Tính τ và θ:
q = T / (2 * A_m); tau_top = q / t2, tau_bottom = q / t1, tau_web = q / t3.
G = E / (2 * (1 + nu)) (cùng đơn vị với E hiện tại).
theta = T / (G * Jt).
railDifferential ≈ theta * (Tr/20) (Tr mm → cm).
Kiểm tra:
tau_allow = 0.6 * sigma_allow (hoặc cấu hình).
torsion_check = tau_max <= tau_allow ? 'pass' : 'fail'.
Tổng hợp kết quả:
Với double-girder: giữ kiểm tra bền/độ võng theo per-beam như hiện; thêm các trường xoắn vào object trả về.
Không thay đổi Jx/Jy đã tính; đây bổ sung thêm “stress due to torsion” riêng.
Phần nâng cao sau (đặt TODO):
Phân bố T theo nội lực dọc dầm (biểu đồ theo x), thay vì giá trị đại diện tại giữa nhịp.
Tính tương tác Von Mises nếu cần.
4) Cập Nhật UI

File: tinh toan cau truc/components/DoubleBeamCalculator.tsx
TODO
Khi Tr ≠ Td, hiển thị badge cảnh báo “Có xoắn do lệch tim ray (Tr ≠ Td)”.
Thêm mục “Torsion” trong “Calculation summary”:
T_torsion, theta (mrad), τ_top/τ_web/τ_bottom.
railDifferential (mm) cho người dùng dễ hình dung.
Thêm badge kiểm tra: torsion_check bên cạnh Stress/Deflection/Buckling.
5) Biểu Đồ

File: tinh toan cau truc/components/DeflectedShapeDiagram.tsx và InternalForceDiagram.tsx
TODO
Giữ nguyên biểu đồ lực uốn/cắt hiện có.
Optional (để sau): thêm trục phụ hiển thị “góc xoay dọc nhịp” (đơn giản: đường thẳng ở giá trị θ_max) hoặc box “Torsion summary” phía trên biểu đồ.
6) Xuất PDF

File: tinh toan cau truc/services/pdfService.ts
TODO
Thêm hàng trong Inputs: Tr, Td, highlight “Mode: Double girder” (đã thêm).
Thêm mục “Torsion results”:
T, θ, τ_top/τ_web/τ_bottom, rail differential, torsion check.
i18n: thêm key pdf.torsionResults, pdf.torsionCheck, pdf.angleOfTwist, pdf.railDifferential.
7) i18n

Files:
tinh toan cau truc/src/locales/en/translation.json
tinh toan cau truc/src/locales/vi/translation.json
tinh toan cau truc/src/i18n.ts (fallback runtime)
TODO
Thêm các key:
calculator.torsionWarning, calculator.torsionTitle, calculator.torsionCheck, calculator.angleOfTwist, calculator.railDifferential.
Bản EN + VI tương ứng.
8) Validation + Đơn Vị

TODO
Đảm bảo tất cả đại lượng xoắn dùng cùng hệ đơn vị như phần uốn/cắt hiện tại (kg, cm).
Normal hóa E, G theo kg/cm²; nếu hiện đang hiển thị MPa, chuyển đổi tương thích.
Nếu A_m hoặc J_t không khả dụng (kích thước bất thường), đặt cờ cảnh báo và không làm fail toàn bộ.

Phân Rã TODO Theo File

types.ts
 Add torsion fields to CalculationResults.
services/calculationService.ts
 Helper normalize units for torsion.
 Compute A_m, J_t for box girder (from inputs).
 Compute T from e = (Tr − Td)/2 and reactions; τ, θ, railDifferential.
 Add torsion_check and merge into double-girder results.
components/DoubleBeamCalculator.tsx
 Warning banner when Tr ≠ Td.
 Show torsion results in “Calculation summary”.
 Add torsion check badge.
components/DeflectedShapeDiagram.tsx
 Optional: annotate θ, or add small torsion summary card above.
services/pdfService.ts
 New “Torsion results” section with fields.
src/locales/en/translation.json and src/locales/vi/translation.json
 Add all new keys (UI + PDF).
src/i18n.ts
 Add runtime fallbacks for new keys to avoid dev MIME/encoding issues.