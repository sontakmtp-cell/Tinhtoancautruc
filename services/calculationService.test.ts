import { describe, expect, it } from 'vitest';
import {
  calculateBeamProperties,
  calculateDoubleBeamProperties,
  calculateVBeamProperties,
  generateDiagramData,
  generateDoubleBeamDiagramData,
} from './calculationService';
import type { BeamInputs, DoubleBeamInputs, VBeamInputs } from '../types';

/**
 * Bộ test tham chiếu cho calculationService.
 *
 * Mọi giá trị kỳ vọng (expected) trong file này đều được tính TAY độc lập với code,
 * từ các công thức kết cấu cơ bản:
 *   - F = Σ A_i ;  Yc = Σ(A_i·y_i)/F
 *   - Jx = Σ [I_local + A·d²]  (định lý trục song song, d = khoảng cách tới trục trung tâm)
 *   - I_local hình chữ nhật: b·h³/12
 *   - M_vn = P·L/4 ;  M_bt = q·L²/8 ;  M_x = 1.05·(M_bt + 1.25·M_vn)
 *   - f = 5·q·L⁴/(384·E·Jx) + P·L³/(48·E·Jx)
 *   - K_sigma = σ_allow/σ_u ;  n_f = f_allow/f ;  f_allow = L/1000 (dầm đơn) hoặc L/800 (I)
 *   - ε = √(235/σ_y(MPa)) với σ_y(MPa) = σ_y(kg/cm²) × 0.0980665
 * Các con số trung gian được ghi lại ở mỗi case để đối chiếu.
 */

// ---- Bộ input nền: dầm I cán nóng đối xứng, không tải ----
// Đơn vị mm → cm: b_flange=20, t_flange=2, t_web=1, H=40, h_web=36.
// F = 2·(20·2) + 1·36 = 116 cm² ;  Yc = H/2 = 20 cm.
// Jx = 2·(20·2³/12 + 40·19²) + 1·36³/12 = 2·14453.3333 + 3888 = 32794.6667 cm⁴
// Jy = 2·(2·20³/12) + 36·1³/12 = 2666.6667 + 3 = 2669.6667 cm⁴
// Wx = Jx/20 = 1639.7333 ;  Wy = Jy/10 = 266.9667
const iBeamInputs: BeamInputs = {
  b: 200, h: 400, t1: 20, t2: 20, t3: 10, b1: 0, b3: 200,
  L: 800, A: 0, C: 0,
  P_nang: 0, P_thietbi: 0,
  sigma_allow: 1600, sigma_yield: 2400, E: 2100000, nu: 0.3, q: 0,
};

describe('calculateBeamProperties - mode i-beam (dầm I đối xứng)', () => {
  const results = calculateBeamProperties(iBeamInputs, 'i-beam');

  it('tính đúng đặc trưng hình học của tiết diện I đối xứng', () => {
    expect(results.F).toBe(116);
    expect(results.Yc).toBe(20);
    expect(results.Jx).toBeCloseTo(32794.6667, 2);
    expect(results.Jy).toBeCloseTo(2669.6667, 2);
    expect(results.Wx).toBeCloseTo(1639.7333, 2);
    expect(results.Wy).toBeCloseTo(266.9667, 2);
  });

  it('tính đúng tải trọng bản thân và mô men', () => {
    // q_auto = F·7850/1e6 = 116·7850/1e6 = 0.9106 kg/cm
    expect(results.q).toBeCloseTo(0.9106, 4);
    expect(results.beamSelfWeight).toBeCloseTo(0.9106 * 800, 1);
    // M_bt = q·L²/8 = 0.9106·640000/8 = 72848 ; M_vn = 0 (không tải)
    expect(results.M_bt).toBeCloseTo(72848, 0);
    expect(results.M_vn).toBe(0);
    // M_x = 1.05·72848 = 76490.4 ; M_y = 0.05·72848 = 3642.4
    expect(results.M_x).toBeCloseTo(76490.4, 2);
    expect(results.M_y).toBeCloseTo(3642.4, 2);
  });

  it('tính đúng ứng suất và hệ số an toàn', () => {
    // σ_u = M_x/Wx + M_y/Wy = 76490.4/1639.7333 + 3642.4/266.9667 = 46.6481 + 13.6437 = 60.2917
    expect(results.sigma_u).toBeCloseTo(60.2917, 2);
    expect(results.K_sigma).toBeCloseTo(1600 / 60.2917, 1);
    expect(results.stress_check).toBe('pass');
  });

  it('tính đúng độ võng và giới hạn cho phép L/800', () => {
    expect(results.f_allow).toBe(800 / 800); // = 1.0 cm (mode i-beam)
    // f = 5·q·L⁴/(384·E·Jx) = 1.8649088e12 / 2.64456192e13 = 0.0705187 cm
    expect(results.f).toBeCloseTo(0.07052, 4);
    expect(results.n_f).toBeCloseTo(1 / 0.0705187, 1);
    expect(results.deflection_check).toBe('pass');
  });

  it('kiểm tra ổn định cục bộ cánh nén theo giới hạn class 3', () => {
    // ε = √(235/(2400·0.0980665)) = √(235/235.3596) = 0.9992357
    // cánh nhô ra: c = (b - tw)/2 = (20-1)/2 = 9.5 cm ; t = 2 cm
    // λ_actual = 9.5/2 = 4.75 ; λ_limit = 14·ε = 13.9893 → K = 2.9451
    expect(results.K_buckling).toBeCloseTo(2.9451, 3);
    expect(results.buckling_check).toBe('pass');
  });

  it('không đề xuất sườn tăng cứng khi sườn đủ mảnh giới hạn', () => {
    // h_w = 360 mm, t_w = 10 mm → 360/10 = 36 < 72·ε/1.2 = 59.954
    expect(results.stiffener.required).toBe(false);
    expect(results.stiffener.count).toBe(0);
    expect(results.stiffener.positions).toEqual([]);
  });
});

describe('calculateBeamProperties - mode single-girder (dầm tổ hợp hai sườn)', () => {
  // cm: b_bot=30, t_bot=1.6, b_top=15, t_top=1.0, t_web=0.8, H=50, h_web=47.4, b_body=0
  // A_top=15, A_bot=48, A_web=2·37.92=75.84 → F = 138.84
  // Yc = (15·49.5 + 48·0.8 + 75.84·25.3)/138.84 = 2699.652/138.84 = 19.4443
  const inputs: BeamInputs = {
    ...iBeamInputs,
    b: 300, h: 500, t1: 16, t2: 10, t3: 8, b1: 0, b3: 150,
    L: 600, P_nang: 20000, P_thietbi: 5000,
  };
  const results = calculateBeamProperties(inputs);

  it('tính đúng diện tích và vị trí trọng tâm tiết diện bất đối xứng', () => {
    expect(results.F).toBeCloseTo(138.84, 4);
    expect(results.Yc).toBeCloseTo(19.4443, 3);
    // Cánh dưới dày hơn (t1=16 > t2=10) kéo trọng tâm xuống dưới H/2 = 25
    expect(results.Yc).toBeLessThan(25);
  });

  it('tính đúng mô men do tải tập trung P·L/4', () => {
    expect(results.P).toBe(25000);
    expect(results.M_vn).toBe(25000 * 150); // = 3,750,000 kg·cm (chính xác)
    // M_x = 1.05·(q_auto·L²/8 + 1.25·M_vn), q_auto = 138.84·7850/1e6 = 1.089894
    // M_bt = 1.089894·45000 = 49045.23 → M_x = 1.05·(49045.23 + 4687500) = 4973372.4915
    expect(results.M_x).toBeCloseTo(4973372.49, 1);
  });

  it('áp dụng giới hạn độ võng L/1000 cho dầm đơn', () => {
    expect(results.f_allow).toBe(0.6); // 600/1000
  });

  it('không áp dụng kiểm tra cánh nén khi khoảng cách sườn b1 = 0', () => {
    expect(results.K_buckling).toBe(Infinity);
    expect(results.buckling_check).toBe('pass');
  });

  it('sườn 474/8 = 59.25 vẫn dưới ngưỡng 59.954 → không cần tăng cứng', () => {
    expect(results.stiffener.required).toBe(false);
    expect(results.stiffener.count).toBe(0);
  });
});

describe('calculateBeamProperties - kiểm tra fail ổn định cục bộ và sườn tăng cứng', () => {
  // b1 = 600 mm → b_body = 60 cm ; t1 = 8 mm → 0.8 cm → λ_actual = 75
  // λ_limit = 42·ε = 41.9679 → K_buckling = 0.5596 → fail
  // Sườn: h_w = 384 mm, t_w = 4 mm → 384/4 = 96 > 59.954 → cần tăng cứng
  const inputs: BeamInputs = {
    ...iBeamInputs,
    b: 200, h: 400, t1: 8, t2: 8, t3: 4, b1: 600, b3: 200,
    P_nang: 10000,
  };
  const results = calculateBeamProperties(inputs);

  it('phát hiện cánh nén quá mảnh (K_buckling < 1)', () => {
    expect(results.K_buckling).toBeCloseTo(0.5596, 3);
    expect(results.buckling_check).toBe('fail');
  });

  it('đề xuất sườn tăng cứng với thông số hợp lệ', () => {
    const { stiffener } = results;
    expect(stiffener.required).toBe(true);
    expect(stiffener.effectiveWebHeight).toBe(384);
    expect(stiffener.count).toBeGreaterThanOrEqual(1);
    // width = max(0.1·h_w, 80) = 80 ; thickness tối thiểu 8 mm
    expect(stiffener.width).toBe(80);
    expect(stiffener.thickness).toBe(8);
    // optimalSpacing = clamp(utilisation·h_w, 0.5·h_w, 3·h_w) = 1150 mm
    expect(stiffener.optimalSpacing).toBe(1150);
    // 6 vị trí đặt được trong nhịp 800 cm (115, 230, ..., 690; 805 vượt mép dầm)
    expect(stiffener.positions).toEqual([115, 230, 345, 460, 575, 690]);
    // count phải khớp số vị trí thực tế, không dùng ceil(span/spacing) để tránh lệch
    expect(stiffener.count).toBe(stiffener.positions.length);
    expect(stiffener.count).toBe(6);
    // Vị trí sườn tăng dần và nằm trong nhịp
    for (let i = 1; i < stiffener.positions.length; i++) {
      expect(stiffener.positions[i]).toBeGreaterThan(stiffener.positions[i - 1]);
    }
    for (const pos of stiffener.positions) {
      expect(pos).toBeGreaterThan(0);
      expect(pos).toBeLessThan(inputs.L);
    }
  });

  it('không crash khi mọi thông số về 0', () => {
    const zeros: BeamInputs = { ...iBeamInputs, b: 0, h: 0, t1: 0, t2: 0, t3: 0, b1: 0, b3: 0, L: 0, P_nang: 0, P_thietbi: 0, q: 0, sigma_allow: 0, sigma_yield: 0, E: 0 };
    const r = calculateBeamProperties(zeros);
    expect(r.F).toBe(0);
    expect(typeof r.stress_check).toBe('string');
    expect(typeof r.deflection_check).toBe('string');
    expect(typeof r.buckling_check).toBe('string');
  });
});

describe('generateDiagramData - biểu đồ nội lực dầm đơn giản', () => {
  // P = 20000, q_auto = 0.9106, L = 800 → R = 10000 + 0.9106·400 = 10364.24
  const inputs: BeamInputs = { ...iBeamInputs, P_nang: 20000 };
  const results = calculateBeamProperties(inputs, 'i-beam');
  const data = generateDiagramData(inputs, results);

  it('tạo đúng 101 điểm từ x=0 đến x=L', () => {
    expect(data).toHaveLength(101);
    expect(data[0].x).toBe(0);
    expect(data[100].x).toBe(800);
    expect(data[50].x).toBe(400);
  });

  it('lực cắt tại gối bằng phản lực, đổi dấu quanh giữa nhịp', () => {
    expect(data[0].shear).toBeCloseTo(10364.24, 1);
    expect(data[50].shear).toBeCloseTo(-10000, 1); // R - q·L/2 - P = -10000
    expect(data[0].shear).toBeGreaterThan(0);
    expect(data[50].shear).toBeLessThan(0);
  });

  it('mô men bằng 0 tại hai gối và đạt M_x tại giữa nhịp', () => {
    expect(data[0].moment).toBe(0);
    expect(data[100].moment).toBe(0);
    // scaleFactor = M_x/M_max_simple → moment tại x=L/2 = M_x = 5326490.4
    expect(data[50].moment / 5326490.4).toBeCloseTo(1, 9);
  });
});

describe('calculateDoubleBeamProperties - dầm kép', () => {
  // Mỗi dầm chịu nửa tải: P_nang=10000, P_thietbi=2500 → P=12500
  // Per-beam (mode single-girder, 2 sườn): A_top=A_bot=20·2=40, A_web=2·(36·1)=72 → F=152
  // Jx = 2·14453.3333 + 2·3888 = 36682.6667 ; Wx = 1834.1333
  // Jy = 2666.6667 + 2·(3 + 36·15.5²) = 2666.6667 + 17304 = 19970.6667
  // q_auto = 152·7850/1e6 = 1.1932
  const inputs: DoubleBeamInputs = {
    ...iBeamInputs,
    b1: 300, // khoảng cách 2 sườn, dùng cho kiểm tra ổn định dầm kép
    P_nang: 20000, P_thietbi: 5000,
    Td: 400, Tr: 500, transversalLoad: 0,
  };
  const results = calculateDoubleBeamProperties(inputs);

  it('gấp đôi diện tích và tổng tải giữ nguyên', () => {
    expect(results.F).toBeCloseTo(304, 2);
    expect(results.P).toBe(25000);
    expect(results.M_vn).toBe(2 * (12500 * 200)); // = 5,000,000
  });

  it('gấp đôi mô đun chống uốn và cộng định lý trục song song cho Jy', () => {
    expect(results.Wx).toBeCloseTo(2 * 1834.1333, 2);
    // Jy_total = 2·(Jy + F·(Td_cm/2)²) = 2·(19970.6667 + 152·400) = 161541.3333
    expect(results.Jy).toBeCloseTo(161541.33, 1);
  });

  it('kiểm tra ổn định cánh trên giữa hai sườn (b1/t2)', () => {
    // c = 300 mm, t = 20 mm → λ = 15 ; K = 41.9679/15 = 2.7979 → pass
    expect(results.K_buckling).toBeCloseTo(2.7979, 3);
    expect(results.buckling_check).toBe('pass');
  });

  it('tính mô men xoắn do lệch ray Tr ≠ Td', () => {
    // e = (500-400)/20 = 5 cm ; R_side = 12500/2 + 1.1932·400 = 6727.28
    // T_torsion = 6727.28·5 = 33636.4 kg·cm
    expect(results.T_torsion).toBeCloseTo(33636.4, 1);
    expect(results.theta).toBeGreaterThan(0);
    expect(results.theta).toBeLessThan(1e-4);
    expect(results.railDifferential).toBeGreaterThan(0);
    expect(results.torsion_check).toBe('pass');
  });
});

describe('generateDoubleBeamDiagramData - nhân đôi nội lực', () => {
  const inputs: DoubleBeamInputs = {
    ...iBeamInputs,
    b1: 300,
    P_nang: 20000, P_thietbi: 5000,
    Td: 400, Tr: 500, transversalLoad: 0,
  };
  const results = calculateDoubleBeamProperties(inputs);
  const data = generateDoubleBeamDiagramData(inputs, results);

  it('lực cắt hệ dầm kép gấp đôi dầm đơn', () => {
    expect(data).toHaveLength(101);
    // R = 6250 + 1.1932·400 = 6727.28 → shear[0] = 13454.56
    expect(data[0].shear).toBeCloseTo(13454.56, 1);
  });

  it('mô men giữa nhịp gấp đôi mô men một dầm', () => {
    // M_x per beam = 1.05·(1.1932·80000 + 1.25·2500000) = 3381478.8 → ×2 = 6762957.6
    expect(data[50].moment / 6762957.6).toBeCloseTo(1, 8);
  });
});

describe('calculateVBeamProperties - dầm V', () => {
  // cm: b1=30, t1=1, t2=2, h1=20, t3=0.8, h3=40, t4=0.6 ; a1=30°, alpha=10°
  // yJunc = 21 ; x_web_in = 1 + 40·sin30° = 21 ; H2 = 21 + 40·cos30° = 55.6410
  // H3 = tan10°·21 = 3.7029 ; yApexIn = 59.3439 ; H_total = 59.9439
  // A_bottom=30, A_central=40, A_vweb=2·32=64, A_roof=2·(21/cos10°·0.6)=25.5887 → F=159.5887
  // Yc = (30·0.5 + 40·11 + 64·38.3205 + 25.5887·59.6439)/159.5887 = 4433.7212/159.5887 = 27.7822
  const inputs: VBeamInputs = {
    t3: 8, h3: 400, t4: 6, b1: 300, t1: 10, t2: 20, h1: 200,
    L: 800, A: 0,
    P_nang: 20000, P_thietbi: 5000,
    sigma_allow: 1600, sigma_yield: 2400, E: 2100000, nu: 0.3, q: 0,
  };
  const results = calculateVBeamProperties(inputs);

  it('tính đúng diện tích và trọng tâm tiết diện V', () => {
    expect(results.F).toBeCloseTo(159.5887, 2);
    expect(results.Yc).toBeCloseTo(27.7822, 2);
  });

  it('đặc trưng hình học dương và nhất quán', () => {
    expect(results.Jx).toBeGreaterThan(0);
    expect(results.Jy).toBeGreaterThan(0);
    expect(results.Wx).toBeGreaterThan(0);
    expect(results.Wy).toBeGreaterThan(0);
  });

  it('tổng tải và giới hạn võng L/850', () => {
    expect(results.P).toBe(25000);
    expect(results.f_allow).toBeCloseTo(800 / 850, 5);
    expect(results.sigma_u).toBeGreaterThan(0);
    expect(typeof results.stress_check).toBe('string');
  });
});
