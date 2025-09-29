Mục Tiêu

Tính toán dầm đôi thực tế: hình học, tải, nội lực, ứng suất, võng, gân cứng; không dùng mock.
Sơ đồ nội lực/võng chạy từ dữ liệu tính thật.
Kết quả nhất quán, đơn vị đúng, có i18n.
Giả Định Kỹ Thuật (bản 1)

Hai dầm giống nhau, liên kết ngang đủ cứng ⇒ tải chia đều lên hai dầm (mỗi dầm nhận 50% tải tập trung và phân bố).
Bỏ qua xoắn do lệch tâm Tr ≠ Td ở bản 1; sẽ nâng cấp ở bản 2.
Sử dụng lại công thức/logic single-girder hiện có để tính “mỗi dầm”, rồi tổng hợp “hệ dầm đôi”.
Kế Hoạch Tổng Quan

Confirm requirements and data model (in progress)
Extend types for double girder
Implement calculation service
Wire UI to service
Add diagram generation
Validate units and inputs
Update i18n strings
QA with sample cases
Polish UX and export
TODO Theo File

tinh toan cau truc/types.ts

Thêm 'double-girder' vào CalculationResults['calculationMode'].
Tạo DoubleBeamInputs chia sẻ (mở rộng BeamInputs): Td, Tr, transversalLoad.
Đảm bảo chú thích đơn vị: Td, Tr (mm); transversalLoad (kg/m) hoặc đổi về kg/cm trong service.
tinh toan cau truc/services/calculationService.ts

Tạo hàm calculateDoubleBeamProperties(inputs: DoubleBeamInputs): CalculationResults.
B1: Chuẩn hóa đơn vị (mm→cm; kg/m → kg/cm).
B2: Tạo “per-beam inputs” bằng cách chia tải đều:
P_nang_each = P_nang/2, P_thietbi_each = P_thietbi/2.
q_each = q + transversalLoad_cm/2 (nếu q đang là tự trọng quy đổi, cộng thêm phần phân bố ngang).
B3: Gọi calculateBeamProperties(perBeam, 'single-girder') để lấy kết quả mỗi dầm.
B4: Tổng hợp hệ dầm đôi:
Diện tích: F_total = 2 * F_beam.
Trục x (uốn đứng): Jx_total = 2 * Jx_beam, Wx_total ≈ 2 * Wx_beam.
Trục y (uốn ngang): Jy_total = 2 * (Jy_beam + A_beam * (Td_cm/2)^2).
M_x_total = 2 * M_x_beam; P_total = 2 * P_each = P_nang + P_thietbi.
Ứng suất/độ võng đánh giá theo mỗi dầm (vì dầm hoạt động song song): lấy từ per-beam.
Gân cứng: lấy recommendation từ per-beam; tổng khối lượng gân: x2.
calculationMode = 'double-girder'.
Tạo generateDoubleBeamDiagramData(inputs: DoubleBeamInputs, results: CalculationResults): DiagramData
Dùng cùng công thức như generateDiagramData nhưng dựa trên tải tổng/moment tổng, hoặc đơn giản là nhân đôi từ per-beam nếu tải chia đều.
tinh toan cau truc/components/DoubleBeamCalculator.tsx:243

Bỏ mock; import thật:
import { calculateDoubleBeamProperties, generateDoubleBeamDiagramData } from '../services/calculationService'
Trong handleSubmit:
Gọi calculateDoubleBeamProperties(inputs) → setResults.
Gọi generateDoubleBeamDiagramData(inputs, results) → setDiagramData.
Xóa toàn bộ mockResults/mockDiagramData/mock recommendation.
Kiểm tra ánh xạ vào DoubleBeamCrossSection (đã có memo doubleBeamCrossSectionInputs) và stiffenerLayout dùng results.stiffener.
tinh toan cau truc/components/InternalForceDiagram.tsx, StressDistributionDiagram.tsx, DeflectedShapeDiagram.tsx

Xác thực props đang dùng DiagramData và CalculationResults không phụ thuộc chế độ cũ. Nếu có nhãn, thêm “double-girder” khi hiển thị.
tinh toan cau truc/components/PDFReport.tsx

Hiển thị calculationMode: 'double-girder'.
Bổ sung thông tin Td, Tr, transversalLoad trong phần input và kết quả.
tinh toan cau truc/src/locales/en/translation.json, tinh toan cau truc/src/locales/vi/translation.json

Thêm:
calculator.beamCenterDistance: Khoảng cách tâm dầm (Td)
calculator.railCenterDistance: Khoảng cách tâm ray (Tr)
calculator.transversalLoad: Tải phân bố ngang
Bất kỳ nhãn mới cho cảnh báo/xác nhận dầm đôi.
tinh toan cau truc/components/CraneBeamCalculator.tsx:632

Chỉ kiểm tra luồng render đã ổn khi chọn dầm đôi; không cần đổi.
Luồng Dữ Liệu

UI nhập DoubleBeamInputs → gọi calculateDoubleBeamProperties → lưu results → gọi generateDoubleBeamDiagramData → sơ đồ nội lực/độ võng.
Cross-section hiển thị từ inputs (không phụ thuộc results), gân hiển thị từ results.stiffener.
Chi Tiết Thuật Toán (bản 1)

Chuẩn hóa đơn vị:
mm → cm, kg/m → kg/cm (transversalLoad_cm = transversalLoad / 100).
Chia tải trên mỗi dầm:
P_each = 0.5*(P_nang + P_thietbi)
q_each = q (tự trọng từ inputs) + transversalLoad_cm/2
Gọi calculateBeamProperties(perBeam, 'single-girder') ⇒ lấy:
F_beam, Jx_beam, Jy_beam, Wx_beam, Wy_beam, ... và stiffener_beam.
Hợp nhất hệ:
F = 2*F_beam; Jx = 2*Jx_beam; Jy = 2*(Jy_beam + F_beam*(Td_cm/2)^2);
Wx ≈ 2*Wx_beam; Wy ≈ 2*Wy_beam (hoặc tính lại từ J/W nếu cần chính xác)
M_x = 2*M_x_beam; P = P_nang + P_thietbi; q = 2*q_each? (hiển thị q hệ thống có thể giữ theo mỗi dầm để tránh hiểu nhầm; đề xuất hiển thị “q mỗi dầm”)
Ứng suất/độ võng dùng kết quả mỗi dầm để kiểm tra điều kiện (vì là phần tử chịu lực chính).
stiffener.totalWeight = 2 * perBeam.totalWeight; positions: tái sử dụng pattern theo nhịp.
Nâng cấp bản 2 (sau): xét lệch Tr/Td → mô men xoắn, phân bố bánh xe không đều, tổ hợp vị trí xe con.
Kiểm Tra/Validation

Đơn vị nhất quán:
Đầu vào mm, cm, kg/m → service đổi đúng như single-girder.
Kiểm tra nhanh:
Khi Td tăng, Jy tăng đáng kể (do 2A(Td/2)^2).
Khi Tr thay đổi (bản 1 không tác động nội lực), không đổi kết quả; cảnh báo “chưa xét xoắn do lệch tâm”.
M_x_total ≈ 2 × M_x_beam từ single-girder với tải đã chia.
Không còn log “mock” và banner “Development Phase” có thể giữ hoặc đổi “Beta”.
Tiêu Chí Hoàn Thành

Nhấn “Tính toán” tạo results thực (không mock).
Sơ đồ cắt/uốn/độ võng cập nhật theo inputs.
Thay đổi Td làm đổi Jy/Wy, không làm đổi Jx/Wx.
Kết quả không NaN/∞; validation cảnh báo nhập sai.
PDF chứa mode “double-girder” và các tham số đặc thù (Td/Tr/transversalLoad).
Rủi Ro/Cần Quyết Định

Định nghĩa “q” hiển thị: theo mỗi dầm hay tổng? (Đề xuất: mỗi dầm, rõ ràng cho kiểm tra ứng suất).
Bản 1 bỏ qua xoắn do Tr ≠ Td; cần roadmap cho bản 2.
Nếu có yêu cầu mô phỏng tải bánh xe (vị trí rời rạc), cần bổ sung sơ đồ theo tổ hợp vị trí.