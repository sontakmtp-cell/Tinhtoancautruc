import type { BeamInputs, CalculationResults, DiagramData } from '../types';

const KG_TO_KN = 9.80665 / 1000; // Chuyển đổi kilogram-lực sang kilonewton
const KG_CM2_TO_MPA = 0.0980665; // Chuyển đổi kg/cm^2 sang MPa

type CalcMode = 'single-girder' | 'i-beam';

export const calculateBeamProperties = (inputs: BeamInputs, mode: CalcMode = 'single-girder'): CalculationResults => {
  const {
    b: b_bottom_mm,      // Chiều rộng cánh dưới b1
    h: h_mm,               // Chiều cao dầm H
    t1: t_bottom_input_mm, // Chiều dày cánh dưới t1
    t2: t_top_input_mm,    // Chiều dày cánh trên t2
    t3: t_web_input_mm,    // Chiều dày sườn dầm t3
    b1: b_body_input_mm,   // Khoảng cách giữa sườn dầm b2
    b3: b_top_mm,
    L,
    P_nang,
    P_thietbi,
    sigma_allow,
    sigma_yield,
    E,
    nu,
    q,
  } = inputs;

  // Chuyển đổi đầu vào từ milimet sang centimet để tính toán
  const H = h_mm / 10; // chiều cao tiết diện, ký hiệu là H
  // Bí danh nội bộ mới để khớp với các ký hiệu/nhãn được yêu cầu trong khi giữ ổn định hình dạng đầu vào
  const t_top = t_top_input_mm / 10;         // chiều dày cánh trên
  const t_bottom = t_bottom_input_mm / 10;   // chiều dày cánh dưới
  const t_web = t_web_input_mm / 10;         // chiều dày sườn dầm
  const b_body = b_body_input_mm / 10;       // chiều rộng (lọt lòng) giữa các sườn dầm cho dầm tổ hợp
  const b_top = (b_top_mm ?? b_bottom_mm) / 10; // chiều rộng cánh trên (cm). fallback để tương thích ngược
  const b_bottom = b_bottom_mm / 10;            // chiều rộng cánh dưới (cm)

  // --- 1. Tính toán đặc trưng hình học ---
  let F: number;
  let Yc: number;
  const Xc = 0; // Đối xứng qua trục tung trong cả hai chế độ (gốc tọa độ ở giữa theo chiều ngang)

  let Ix_top: number;
  let Ix_bottom: number;
  let Ix_webs_or_web: number; // cho một sườn dầm trong dầm I, hoặc hai sườn dầm trong dầm tổ hợp
  let Jx: number;

  let Iy_top: number;
  let Iy_bottom: number;
  let Iy_webs_or_web: number; // cho một sườn dầm trong dầm I, hoặc hai sườn dầm trong dầm tổ hợp
  let Jy: number;

  let Wx: number;
  let Wy: number;

  if (mode === 'i-beam') {
    // Dầm I cán nóng tiêu chuẩn: tiết diện đối xứng với các cánh bằng nhau
    const b_flange = b_bottom; // chiều rộng cánh (như nhau cho cả trên và dưới)
    const t_flange = t_bottom; // chiều dày cánh (như nhau cho cả hai cánh, t1=t2)
    const t_web_thickness = t_web; // chiều dày sườn dầm (t3)
    
    // Tính diện tích các thành phần
    const A_top_flange = b_flange * t_flange;
    const A_bottom_flange = b_flange * t_flange;
    const h_web = Math.max(H - 2 * t_flange, 0); // chiều cao sườn dầm = tổng chiều cao - 2 * chiều dày cánh
    const A_web = t_web_thickness * h_web;

    // Tổng diện tích mặt cắt ngang
    F = A_top_flange + A_bottom_flange + A_web;

    // Tính khoảng cách trọng tâm từ thớ dưới cùng
    const y_top_flange = H - t_flange / 2;
    const y_bottom_flange = t_flange / 2;
    const y_web = t_flange + h_web / 2;
    
    // Vị trí trọng tâm (nên ở H/2 đối với dầm I đối xứng)
    Yc = (A_top_flange * y_top_flange + A_bottom_flange * y_bottom_flange + A_web * y_web) / (F || 1);

    // Mô men quán tính đối với trục x (trục mạnh) sử dụng định lý trục song song
    // I = I_local + A * d²
    Ix_top = (b_flange * t_flange ** 3) / 12 + A_top_flange * (y_top_flange - Yc) ** 2;
    Ix_bottom = (b_flange * t_flange ** 3) / 12 + A_bottom_flange * (y_bottom_flange - Yc) ** 2;
    Ix_webs_or_web = (t_web_thickness * h_web ** 3) / 12 + A_web * (y_web - Yc) ** 2;
    Jx = Ix_top + Ix_bottom + Ix_webs_or_web;

    // Mô men quán tính đối với trục y (trục yếu)
    Iy_top = (t_flange * b_flange ** 3) / 12;
    Iy_bottom = (t_flange * b_flange ** 3) / 12;
    Iy_webs_or_web = (h_web * t_web_thickness ** 3) / 12;
    Jy = Iy_top + Iy_bottom + Iy_webs_or_web;

    // Mô đun mặt cắt
    const c_max_x = Math.max(Yc, H - Yc);
    Wx = Jx / c_max_x;
    Wy = Jy / (b_flange / 2);
  } else {
    // Dầm đơn tổ hợp với hai sườn dầm cách nhau b_body
    const A_top = b_top * t_top;
    const A_bottom = b_bottom * t_bottom;
    const h_web = Math.max(H - t_top - t_bottom, 0);
    const A_one_web = h_web * t_web;

    F = A_top + A_bottom + 2 * A_one_web;

    const y_top = H - t_top / 2;
    const y_bottom = t_bottom / 2;
    const y_webs = t_bottom + h_web / 2;
    Yc = (A_top * y_top + A_bottom * y_bottom + 2 * A_one_web * y_webs) / (F || 1);

    Ix_top = (b_top * t_top ** 3) / 12 + A_top * (y_top - Yc) ** 2;
    Ix_bottom = (b_bottom * t_bottom ** 3) / 12 + A_bottom * (y_bottom - Yc) ** 2;
    Ix_webs_or_web = 2 * ((t_web * h_web ** 3) / 12 + A_one_web * (y_webs - Yc) ** 2);
    Jx = Ix_top + Ix_bottom + Ix_webs_or_web;

    Iy_top = (t_top * b_top ** 3) / 12;
    Iy_bottom = (t_bottom * b_bottom ** 3) / 12;
    const web_dist_from_center = b_body / 2 + t_web / 2;
    Iy_webs_or_web = 2 * ((h_web * t_web ** 3) / 12 + A_one_web * web_dist_from_center ** 2);
    Jy = Iy_top + Iy_bottom + Iy_webs_or_web;

    Wx = Jx / Math.max(Yc, H - Yc);
    Wy = Jy / (Math.max(b_top, b_bottom) / 2);
  }

  // --- 2. Tính toán tải trọng và ứng suất ---
  const P = P_nang + P_thietbi;
  // Tải trọng bản thân dầm (kg/cm)
  const q_auto = F * 7850 / 1_000_000;
  
  // Mô men cho dầm đơn giản
  const M_bt = (q_auto * L ** 2) / 8; // Mô men từ tải trọng phân bố (tự động)
  const M_vn = (P * L) / 4;      // Mô men từ tải trọng tập trung ở giữa

  // Tổng mô men với các hệ số an toàn/động
  const M_x = 1.05 * (M_bt + 1.25 * M_vn);
  const M_y = 0.05 * (M_bt + M_vn);

  const sigma_u = (M_x / Wx) + (M_y / Wy);

  // Ứng suất riêng tại các thớ trên và dưới do M_x
  const sigma_top_compression = (M_x * (H - Yc)) / Jx;
  const sigma_bottom_tension = (M_x * Yc) / Jx;

  // Độ võng (kết hợp tải trọng phân bố và tải trọng điểm trung tâm)
  const f = (5 * q_auto * L ** 4) / (384 * E * Jx) + (P * L ** 3) / (48 * E * Jx);
  const f_allow = mode === 'i-beam' ? L / 800 : L / 1000;

  // --- 3. Kiểm tra an toàn ---
  const K_sigma = sigma_allow / sigma_u;
  const n_f = f_allow / f;

  // --- 4. Kiểm tra nâng cao (Oằn cục bộ & Độ mảnh của sườn dầm) ---

  // Chuyển đổi ứng suất chảy sang MPa cho các công thức Eurocode
  const sigma_yield_mpa = sigma_yield * KG_CM2_TO_MPA;
  // Hệ số Epsilon dựa trên cường độ chảy, theo EN 1993-1-1, 5.2.2(6)
  const epsilon = sigma_yield_mpa > 0 ? Math.sqrt(235 / sigma_yield_mpa) : 0;

  // 4a. Oằn cục bộ của cánh dầm chịu nén (theo EN 1993-1-1, Bảng 5.2)
  // Việc kiểm tra này xác định loại tiết diện. Chúng tôi đang kiểm tra theo giới hạn Loại 3
  // để tránh tính toán chiều rộng hiệu quả cho các tiết diện Loại 4.
  let representative_b: number; // Tương ứng với 'c' trong bảng Eurocode
  let representative_t: number; // Tương ứng với 't' trong bảng Eurocode
  let lambda_limit: number;
  
  if (mode === 'i-beam') {
    // Dầm I: Kiểm tra cánh ngoài (phần cánh từ mặt sườn dầm ra mép)
    // Giả sử là dầm I cán nóng tiêu chuẩn không có dữ liệu bán kính lượn
    representative_b = (b_bottom - t_web) / 2; // c = phần cánh nhô ra
    representative_t = t_top;                  // t_f = chiều dày cánh
    // Giới hạn cho cánh ngoài chịu nén Loại 3 (Bảng 5.2, sheet 2)
    lambda_limit = 14 * epsilon;
  } else {
    // Dầm tổ hợp: Kiểm tra bộ phận nén bên trong (bản cánh trên giữa hai sườn dầm)
    representative_b = b_body; // c = chiều rộng lọt lòng giữa các sườn dầm
    representative_t = t_top;  // t_f = chiều dày cánh
    // Giới hạn cho bộ phận nén bên trong chịu uốn Loại 3 (Bảng 5.2, sheet 1)
    lambda_limit = 42 * epsilon;
  }
  
  // Tỷ số chiều rộng/chiều dày thực tế
  const lambda_actual = representative_b > 0 && representative_t > 0 ? representative_b / representative_t : 0;
  // Hệ số an toàn oằn
  const K_buckling = lambda_actual > 0 ? lambda_limit / lambda_actual : Infinity;

  // --- 5. Đề xuất sườn tăng cường theo EN 1993-1-5 ---
  // Tính chiều cao thực của sườn dầm (h_w)
  const h_w_mm = Math.max(h_mm - t_top_input_mm - t_bottom_input_mm, 0);

  // Khởi tạo các biến cần thiết
  let needsStiffeners = false;
  // When stiffeners are not required, keep spacing at 0 to avoid misleading UI
  let optimalSpacing_mm = 0;
  let stiffenerWidth_mm = 0;
  let stiffenerThickness_mm = 0;
  let stiffenerInertia_mm4 = 0;
  let stiffenerCount = 0;
  let stiffenersTotalWeight_kg = 0;
  const stiffenerPositions_cm: number[] = [];
  const span_mm = L * 10;  // Chuyển đổi chiều dài từ cm sang mm
  
  // Validation input theo yêu cầu 4
  if (h_w_mm <= 0 || t_web_input_mm <= 0) {
    console.warn("Chiều cao hoặc độ dày sườn không hợp lệ, bỏ qua gân tăng cường.");
  } else {
    // Tính tỉ số mảnh của sườn dầm
    const slendernessRatio = h_w_mm / t_web_input_mm;
    
    // Tính giới hạn mất ổn định cắt theo EN 1993-1-5, 5.3
    const eta = 1.2; // Hệ số hiệu quả cắt theo EN 1993-1-5, 5.1(2)
    const slendernessLimit = 72 * epsilon / eta; // Công thức mới theo yêu cầu 1
    
    // Kiểm tra nhu cầu gân tăng cường
    needsStiffeners = Number.isFinite(slendernessRatio) && slendernessRatio > slendernessLimit;

    if (needsStiffeners) {
      const gammaM1 = 1.1;
      const supportShear_kg = P / 2 + (q_auto * L) / 2;
      const supportShear_kN = supportShear_kg * KG_TO_KN;
      const supportShear_N = supportShear_kN * 1000;

      // Tính khoảng cách tối ưu giữa các gân (theo yêu cầu 5)
      if (sigma_yield_mpa > 0 && supportShear_N > 0) {
        // Ước lượng đơn giản hóa từ EN 1993-1-5, không sử dụng trực tiếp χ_w
        const plasticShearCapacity_N = (h_w_mm * t_web_input_mm * sigma_yield_mpa) / (Math.sqrt(3) * gammaM1);
        const utilisation = plasticShearCapacity_N / supportShear_N;
        optimalSpacing_mm = utilisation * h_w_mm;
      }

      if (!Number.isFinite(optimalSpacing_mm) || optimalSpacing_mm <= 0) {
        optimalSpacing_mm = h_w_mm;
      }

      if (h_w_mm > 0) {
        const a_min = 0.5 * h_w_mm;
        // Cập nhật giới hạn khoảng cách gân theo EN 1993-1-5, 9.2 (yêu cầu 2)
        const a_limit_aspect = 3 * h_w_mm; // Giới hạn tỉ số a/h_w ≤ 3
        optimalSpacing_mm = Math.max(a_min, Math.min(optimalSpacing_mm, a_limit_aspect));
      }
      optimalSpacing_mm = Math.max(10, Math.round(optimalSpacing_mm / 10) * 10);

      // Tính toán kích thước gân tăng cường
      if (h_w_mm > 0 && t_web_input_mm > 0) {
        stiffenerWidth_mm = Math.round(Math.max(0.1 * h_w_mm, 80) / 10) * 10;
        const rawThickness = Math.max(0.6 * Math.sqrt(Math.max(sigma_yield_mpa, 1) / 235) * t_web_input_mm, 8);
        stiffenerThickness_mm = Math.max(8, Math.round(rawThickness));
        stiffenerInertia_mm4 = stiffenerWidth_mm * Math.pow(stiffenerThickness_mm, 3) / 12;

        // Kiểm tra mômen quán tính tối thiểu theo EN 1993-1-5, 9.3 (yêu cầu 3)
        const requiredInertia_mm4 = (Math.pow(h_w_mm, 3) * t_web_input_mm) / (10.5 * optimalSpacing_mm);
        if (stiffenerInertia_mm4 < requiredInertia_mm4) {
          console.warn("Mômen quán tính của gân không đủ theo EN 1993-1-5, 9.3");
        }
      }

      if (needsStiffeners && optimalSpacing_mm > 0 && span_mm > 0) {
        // Tính số lượng gân trước khi kiểm tra điều kiện dừng
        stiffenerCount = Math.ceil(span_mm / optimalSpacing_mm);
        
        if (optimalSpacing_mm >= span_mm) {
          // Nếu khoảng cách gân lớn hơn chiều dài dầm, không cần gân
          needsStiffeners = false;
          stiffenerCount = 0;
          stiffenersTotalWeight_kg = 0;
          optimalSpacing_mm = span_mm;
        } else {
          // Tính vị trí các gân (đơn vị cm)
          const spacing_cm = optimalSpacing_mm / 10;
          let currentPosition = spacing_cm;
          let guard = 0;
          while (currentPosition < L && guard < 500) { // L là chiều dài dầm (cm)
            stiffenerPositions_cm.push(Number(currentPosition.toFixed(2)));
            currentPosition += spacing_cm;
            guard += 1;
          }
          // Tính tổng trọng lượng sườn tăng cường
          const singleStiffenerVolume_mm3 = h_w_mm * stiffenerWidth_mm * stiffenerThickness_mm;
          const singleStiffenerWeight_kg = (singleStiffenerVolume_mm3 * 7850) / 1e9;
          stiffenersTotalWeight_kg = stiffenerCount * singleStiffenerWeight_kg;
        }
      }
    }
  }

  const beamSelfWeight_kg = q_auto * L;

  return {
    F, Yc, Xc, Jx, Jy, Wx, Wy,
    Jx_top: Ix_top, Jx_bottom: Ix_bottom, Jx_webs: Ix_webs_or_web,
    Jy_top: Iy_top, Jy_bottom: Iy_bottom, Jy_webs: Iy_webs_or_web,
    P, M_bt, M_vn, M_x, M_y,
    beamSelfWeight: beamSelfWeight_kg,
    q: q_auto,
    sigma_u, sigma_top_compression, sigma_bottom_tension, f, f_allow,
    K_sigma, n_f, K_buckling,
    stress_check: K_sigma >= 1 ? 'pass' : 'fail',
    deflection_check: n_f >= 1 ? 'pass' : 'fail',
    buckling_check: K_buckling >= 1 ? 'pass' : 'fail',
    calculationMode: mode,
    stiffener: {
      required: needsStiffeners,
      effectiveWebHeight: h_w_mm,
      epsilon,
      optimalSpacing: optimalSpacing_mm,
      count: needsStiffeners ? stiffenerCount : 0,
      width: stiffenerWidth_mm,
      thickness: stiffenerThickness_mm,
      requiredInertia: stiffenerInertia_mm4,
      positions: needsStiffeners ? stiffenerPositions_cm : [],
      totalWeight: stiffenersTotalWeight_kg,
    },
  };
};

export const generateDiagramData = (inputs: BeamInputs, results: CalculationResults): DiagramData => {
  const { L } = inputs;
  const { P, M_x, q } = results;
  const points = 101; // Số điểm để tính toán dọc theo dầm
  const data: DiagramData = [];

  const R = P / 2 + (q * L) / 2; // Lực phản lực tại gối tựa
  
  const M_max_simple = (P * L) / 4 + (q * L**2) / 8;
  const scaleFactor = M_max_simple > 0 ? M_x / M_max_simple : 1;


  for (let i = 0; i < points; i++) {
    const x = (L / (points - 1)) * i;
    let shear: number;
    let moment: number;

    // Lực cắt
    if (x < L / 2) {
      shear = R - q * x;
    } else {
      shear = R - q * x - P;
    }

    // Mô men uốn
    if (x <= L / 2) {
      moment = (R * x - (q * x ** 2) / 2);
    } else {
      moment = (R * x - (q * x ** 2) / 2 - P * (x - L / 2));
    }
    
    data.push({ x, shear, moment: moment * scaleFactor });
  }

  if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const simpleMomentEnd = (R * lastPoint.x - (q * lastPoint.x ** 2) / 2 - P * (lastPoint.x - L / 2));
      data[data.length - 1].moment = Math.abs(simpleMomentEnd) < 1e-9 ? 0 : simpleMomentEnd * scaleFactor;
  }

  return data;
};
