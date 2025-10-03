Dưới đây là kế hoạch chi tiết để bổ sung “Tính toán dầm biên” (cụm truyền động dầm biên, gồm tải trọng – tốc độ – chọn động cơ/hộp số – bộ truyền bánh răng – bánh xe di chuyển). Kế hoạch bám sát cấu trúc repo hiện tại (React + Vite + TS), có phân rã kỹ thuật, công thức chính, và TODO rõ ràng.

Mục Tiêu & Phạm Vi

Thêm module “Dầm biên” tính:
Khả năng chịu tải và phân bố tải bánh xe.
Tốc độ di chuyển và hệ số làm việc.
Chọn động cơ – hộp số theo tải và tốc độ.
Thiết kế/Chọn bộ truyền bánh răng (tỷ số, kiểm tra sơ bộ bền uốn/tiếp xúc).
Tính toán bánh xe di chuyển (đường kính, tải bánh, ứng suất tiếp xúc, vòng bi).
Bổ sung UI calculator, PDF report, i18n, cache PWA.
Kiến Trúc & Phân Rã

Types/domain: mở rộng tinh toan cau truc/types.ts cho input/output dầm biên.
Services:
services/endBeamDriveService.ts: tính lực cản, công suất, mô-men, chọn động cơ/hộp số.
services/gearSelectionService.ts: chọn/záp tỷ số, module, kiểm tra sơ bộ.
services/wheelSelectionService.ts: chọn bánh xe, kiểm tra tiếp xúc Hertz, vòng bi.
Components:
components/EndBeamDriveCalculator.tsx: UI chính, tab/steps.
components/DriveTrainDiagram.tsx: sơ đồ truyền động (tùy chọn).
Data chuẩn/lookup:
data/standards/motors.json, gearboxes.json, gears.json, wheels.json, coefficients.json.
Tích hợp:
Route/entry trong App.tsx.
Report: cập nhật components/PDFReport.tsx + components/LazyPDFExport.tsx.
i18n: cập nhật src/locales/vi/translation.json và src/locales/en/translation.json.
PWA: cập nhật public/service-worker.js nếu thêm asset lớn.
Thông Số & Công Thức Chính

Phân bố tải bánh xe dầm biên:
Tổng tải di chuyển W gồm: tự trọng dầm biên + tải truyền từ dầm chính (nếu cần) + tải động (hệ số Kduty).
Bánh xe: 2 hoặc 4 bánh/xe; tải bánh: Qi ≈ W/nb ± ảnh hưởng lệch tâm (xác định theo vị trí CG).
Lực cản di chuyển F (N):
F = μ·W + Fresist_phụ (ổ lăn, lệch đường ray, gió nếu ngoài trời).
Dữ liệu μ theo ray/bánh (thép–thép điển hình 0.02–0.03), thêm hệ số an toàn Ks.
Tốc độ v (m/min) → m/s: v_ms = v/60.
Mô-men trục bánh xe: T_wheel = F·D_wheel/2.
Tỷ số truyền tổng i_tot để đạt tốc độ:
i_tot ≈ (n_motor · π · D_wheel)/(60 · v_ms) · (1/η_truyền).
Công suất động cơ yêu cầu:
P_req (kW) = F · v_ms /(η_truyền · 1000) · Kduty.
Chọn P_motor ≥ P_req; n_motor gần chuẩn; i_hộp số ≈ i_tot.
Kiểm tra hộp số:
T2 ≥ T_wheel/η_stage · Ks, với T2 là mô-men trục ra hộp số.
Bộ truyền bánh răng (thiết kế nhanh):
Chọn z1,z2 theo i gần nhất; module m theo tải; kiểm tra nhanh Lewis (σF) và tiếp xúc (σH) với hệ số an toàn mục tiêu (≥1.3–1.5 cho M5/M6).
Bánh xe:
D_wheel theo yêu cầu ray và tốc độ; kiểm tra Hertz tiếp xúc bánh–ray; chọn vật liệu (45# thép tôi, gang cầu, polyamide tùy duty).
Vòng bi: C ≥ feq dựa trên tải động và hệ số tuổi thọ.
Phanh (tùy chọn):
M_brake ≥ 1.5·T_wheel, thời gian dừng theo quy chuẩn.
Luồng UI

Tab 1: Thông số đầu vào
Trọng lượng + tải ~ W, số bánh/xe, đường kính bánh gợi ý hoặc chọn, điều kiện ray, môi trường, duty class (M4/M5/...).
Tab 2: Tốc độ & Công suất
Nhập v, tính F, P_req, i_tot, gợi ý list động cơ phù hợp.
Tab 3: Hộp số & Bánh răng
Chọn hộp số thương mại hoặc cấu hình gear pair; hiển thị kiểm tra sơ bộ.
Tab 4: Bánh xe
Chọn/thiết kế bánh xe, kiểm tra tiếp xúc và vòng bi.
Tab 5: Kết quả & PDF
Tổng hợp, cảnh báo, export PDF.
Định Nghĩa Type (đề xuất)

types.ts
EndBeamInputs { W, nWheels, wheelBase?, CGOffset?, v, dutyClass, mu, env, D_wheel?, railType, etaDrive }
MotorOption { id, power, speed, efficiency, frame }
GearboxOption { id, ratio, maxTorque, efficiency, stages }
GearPairOption { z1, z2, module, width, material }
WheelOption { id, D, width, material, bearingSet }
EndBeamResults { F, v_ms, i_tot, P_req, motorSelected, gearboxSelected, gearPairSelected, wheelSelected, wheelLoads, checks }
Giữ phong cách đặt tên và generic giống calculationService.ts.
Service APIs (phác thảo)

services/endBeamDriveService.ts
calcTravelResistance(inputs): { F, wheelLoads }
calcSpeedAndPower(inputs, F): { v_ms, P_req, i_tot }
suggestMotors(P_req, v, i_tot): MotorOption[]
suggestGearboxes(i_tot, T_wheel): GearboxOption[]
services/gearSelectionService.ts
proposeGearPair(i_target, T2, constraints): GearPairOption[]
quickCheckLewis(gearPair, T2): { sigmaF, ok }
quickCheckContact(gearPair, T2): { sigmaH, ok }
services/wheelSelectionService.ts
proposeWheel(W, nWheels, railType, v): WheelOption[]
checkHertz(wheel, load): { sigma, ok }
checkBearing(load, life): { Creq, ok }
Tích Hợp Giao Diện

components/EndBeamDriveCalculator.tsx
Form + state + gọi services; hiển thị warning/kết quả theo pattern đang có ở VBeamCalculator.tsx và CraneBeamCalculator.tsx.
Router/entry
Thêm entry vào App.tsx để điều hướng đến “Dầm biên”.
PDF
Cập nhật components/PDFReport.tsx để in kết quả dầm biên (tối ưu: section riêng).
components/LazyPDFExport.tsx: thêm case/prop cho EndBeam.
i18n
Thêm key mới trong src/locales/vi/translation.json và src/locales/en/translation.json.
PWA cache
Nếu thêm ảnh/sơ đồ: cập nhật public/service-worker.js và script scripts/update-cache-version.js.
TODO Theo Giai Đoạn

Giai đoạn 0 – Chuẩn bị
 Xác nhận phạm vi: dầm biên cho cầu trục trong nhà/ngoài trời, số bánh/xe mặc định.
 Định dạng đơn vị: kN/N, m/min, m/s, kW; hiển thị chuyển đổi.
Giai đoạn 1 – Domain & Data
 Mở rộng types.ts với EndBeamInputs, EndBeamResults, options mới.
 Tạo data/standards/*.json (động cơ tiêu chuẩn, hộp số tỉ số, module bánh răng, bánh xe, hệ số μ/Kduty).
Giai đoạn 2 – Services
 Tạo services/endBeamDriveService.ts với hàm tính F, v_ms, P_req, i_tot.
 Tạo services/gearSelectionService.ts với gợi ý i, module, kiểm tra sơ bộ.
 Tạo services/wheelSelectionService.ts với chọn bánh xe + kiểm tra Hertz, vòng bi.
 Unit test nhỏ cho các công thức cốt lõi (nếu repo có pattern test).
Giai đoạn 3 – UI Components
 Tạo components/EndBeamDriveCalculator.tsx gồm 4–5 tab.
 (Tùy chọn) components/DriveTrainDiagram.tsx cho hình minh họa.
 Kết nối vào App.tsx điều hướng/route.
Giai đoạn 4 – Export & i18n
 Cập nhật components/PDFReport.tsx để hỗ trợ EndBeam.
 Cập nhật components/LazyPDFExport.tsx lấy dữ liệu EndBeam.
 Bổ sung key mới trong src/locales/*/translation.json.
Giai đoạn 5 – PWA & Hiệu Năng
 Cập nhật public/service-worker.js nếu thêm asset tĩnh.
 Dùng debounce cho input, memo hóa service nặng.
 Lưu phiên bằng localStorage.
Giai đoạn 6 – QA & Nghiệm Thu
 So sánh kết quả với 1–2 case mẫu nội bộ.
 Kiểm tra cảnh báo: quá tải bánh xe, i không khả thi, mô-đun quá nhỏ.
 In PDF kiểm tra format và i18n.
Tiêu Chí Hoàn Thành

Nhập thông số tối thiểu → ra: F, v_ms, P_req, i_tot, đề xuất motor/hộp số/gear pair/bánh xe.
Có cảnh báo khi không thỏa: công suất thiếu, i không khả thi, ứng suất vượt giới hạn.
Export PDF đầy đủ, i18n đầy đủ VI/EN.
Không làm chậm UI khi nhập liệu (đáp ứng <100ms cho thay đổi cơ bản).
Rủi Ro & Giả Định

Hệ số μ, Kduty, η truyền động phụ thuộc tiêu chuẩn; tạm dùng giá trị mặc định bảo thủ và cho phép người dùng chỉnh.
Kiểm tra bánh răng theo AGMA/ISO đầy đủ là phức tạp; giai đoạn đầu dùng kiểm tra sơ bộ + hệ số an toàn.
Cần xác nhận loại ray, vật liệu bánh để tính Hertz chính xác.
Mở Rộng Tương Lai

Thêm thư viện thiết bị chuẩn (Siemens/Nord/SEW…) để map thực tế.
Tối ưu chọn đa mục tiêu (giảm công suất/khối lượng).
Tính phanh và gia tốc/giảm tốc theo đồ thị thời gian.
Lưu và so sánh phương án.