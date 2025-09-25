import type { BeamInputs, CalculationResults, DiagramData, DiagramPoint } from '../types';

const KG_TO_KN = 9.80665 / 1000; // Convert kilogram-force to kilonewtons
const KG_CM2_TO_MPA = 0.0980665; // Convert kg/cm^2 to MPa

type CalcMode = 'single-girder' | 'i-beam';

export const calculateBeamProperties = (inputs: BeamInputs, mode: CalcMode = 'single-girder'): CalculationResults => {
  const {
    b: b_bottom_mm,      // Bottom flange width b1
    h: h_mm,               // Beam height H
    t1: t_bottom_input_mm, // Bottom flange thickness t1
    t2: t_top_input_mm,    // Top flange thickness t2
    t3: t_web_input_mm,    // Web thickness t3
    b1: b_body_input_mm,   // Web spacing b2
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

  // Convert millimetre inputs to centimetres for calculations
  const H = h_mm / 10; // section height, now denoted H
  // New internal aliases to match requested symbols/labels while keeping input shape stable
  const t_top = t_top_input_mm / 10;         // top flange thickness (symbol t1 in I-beam tab)
  const t_bottom = t_bottom_input_mm / 10;   // bottom flange thickness (symbol t2)
  const t_web = t_web_input_mm / 10;         // web thickness
  const b_body = b_body_input_mm / 10;       // body (clear) width between webs (symbol b2) for built-up girder
  const b_top = (b_top_mm ?? b_bottom_mm) / 10; // top flange width (cm). fallback for backward compatibility
  const b_bottom = b_bottom_mm / 10;            // bottom flange width (cm)

  // --- 1. Geometric Properties Calculation ---
  let F: number;
  let Yc: number;
  const Xc = 0; // Symmetric about vertical axis in both modes (coordinate origin centered horizontally)

  let Ix_top: number;
  let Ix_bottom: number;
  let Ix_webs_or_web: number; // for single web in I-beam, or two webs in built-up girder
  let Jx: number;

  let Iy_top: number;
  let Iy_bottom: number;
  let Iy_webs_or_web: number; // for single web in I-beam, or two webs in built-up girder
  let Jy: number;

  let Wx: number;
  let Wy: number;

  if (mode === 'i-beam') {
    // Standard rolled I-beam: symmetric section with equal flanges
    // For standard I-beam: b = flange width, t1 = flange thickness, t3 = web thickness, H = total height
    const b_flange = b_bottom; // flange width (same for both top and bottom)
    const t_flange = t_top;    // flange thickness (same for both flanges)
    const t_web_thickness = t_web; // web thickness
    
    // Calculate component areas
    const A_top_flange = b_flange * t_flange;
    const A_bottom_flange = b_flange * t_flange;
    const h_web = Math.max(H - 2 * t_flange, 0); // web height = total height - 2 * flange thickness
    const A_web = t_web_thickness * h_web;

    // Total cross-sectional area
    F = A_top_flange + A_bottom_flange + A_web;

    // Calculate centroidal distances from bottom fiber
    const y_top_flange = H - t_flange / 2;
    const y_bottom_flange = t_flange / 2;
    const y_web = t_flange + h_web / 2;
    
    // Centroidal position (should be at H/2 for symmetric I-beam)
    Yc = (A_top_flange * y_top_flange + A_bottom_flange * y_bottom_flange + A_web * y_web) / (F || 1);

    // Moment of inertia about x-axis (strong axis) using parallel axis theorem
    // I = I_local + A * d²
    Ix_top = (b_flange * t_flange ** 3) / 12 + A_top_flange * (y_top_flange - Yc) ** 2;
    Ix_bottom = (b_flange * t_flange ** 3) / 12 + A_bottom_flange * (y_bottom_flange - Yc) ** 2;
    Ix_webs_or_web = (t_web_thickness * h_web ** 3) / 12 + A_web * (y_web - Yc) ** 2;
    Jx = Ix_top + Ix_bottom + Ix_webs_or_web;

    // Moment of inertia about y-axis (weak axis)
    // For flanges: I_local = t * b³/12 (about their own centroidal axis)
    // For web: I_local = h * t³/12 (about its own centroidal axis)
    Iy_top = (t_flange * b_flange ** 3) / 12;
    Iy_bottom = (t_flange * b_flange ** 3) / 12;
    Iy_webs_or_web = (h_web * t_web_thickness ** 3) / 12; // web contributes minimal Iy
    Jy = Iy_top + Iy_bottom + Iy_webs_or_web;

    // Section moduli
    const c_max_x = Math.max(Yc, H - Yc); // maximum distance from neutral axis to extreme fiber
    Wx = Jx / c_max_x;
    Wy = Jy / (b_flange / 2); // distance from y-axis to edge of flange
  } else {
    // Built-up single girder with two webs spaced by b_body
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
    const web_dist_from_center = b_body / 2 + t_web / 2; // distance from centroidal axis to each web centerline
    Iy_webs_or_web = 2 * ((h_web * t_web ** 3) / 12 + A_one_web * web_dist_from_center ** 2);
    Jy = Iy_top + Iy_bottom + Iy_webs_or_web;

    Wx = Jx / Math.max(Yc, H - Yc);
    Wy = Jy / (Math.max(b_top, b_bottom) / 2);
  }

  // --- 2. Load and Stress Calculation ---
  const P = P_nang + P_thietbi;
  // Auto-computed distributed load from self-weight: q = F * 7850 / 1e6 (kg/cm)
  const q_auto = F * 7850 / 1_000_000;
  
  // Moments for a simply supported beam
  const M_bt = (q_auto * L ** 2) / 8; // Moment from distributed load (auto)
  const M_vn = (P * L) / 4;      // Moment from point load at center

  // Total moments with safety/dynamic factors
  const M_x = 1.05 * (M_bt + 1.25 * M_vn);
  const M_y = 0.05 * (M_bt + M_vn);

  const sigma_u = (M_x / Wx) + (M_y / Wy);

  // Specific stress at top and bottom fibers due to M_x
  const sigma_top_compression = (M_x * (H - Yc)) / Jx;
  const sigma_bottom_tension = (M_x * Yc) / Jx;

  // Deflection (combining distributed load and central point load)
  const f = (5 * q_auto * L ** 4) / (384 * E * Jx) + (P * L ** 3) / (48 * E * Jx);
  // Allowable deflection per requirement: 
  // I-beam: f_allow = L / 800
  // Single girder: f_allow = L / 1000
  const f_allow = mode === 'i-beam' ? L / 800 : L / 1000;

  // --- 3. Safety Checks ---
  const K_sigma = sigma_allow / sigma_u;
  const n_f = f_allow / f;

  // --- 4. Advanced Checks (Local Buckling) ---
  // Simplified check for local buckling of the compression element.
  // For I-beam: check flange local buckling (b/2t ratio)
  // For built-up girder: check panel buckling between webs
  let representative_b: number;
  let representative_t: number;
  
  if (mode === 'i-beam') {
    // For I-beam flange local buckling: b/2t where b is flange width, t is flange thickness
    representative_b = b_bottom / 2; // half flange width (flange overhang from web)
    representative_t = t_top; // flange thickness
  } else {
    // For built-up girder: panel between webs
    representative_b = b_body;
    representative_t = t_top;
  }
  
  const lambda_actual = representative_b / (representative_t || 1);
  // The constant 1.9 is an example value for stiffened elements (may need adjustment based on standards)
  const lambda_limit = 1.9 * Math.sqrt(E / sigma_yield); 
  const K_buckling = lambda_actual > 0 ? lambda_limit / lambda_actual : Infinity;
  // --- 5. Web Stiffener Recommendation ---
  const sigma_yield_mpa = sigma_yield * KG_CM2_TO_MPA;
  const h_w_mm = Math.max(h_mm - t_top_input_mm - t_bottom_input_mm, 0);
  const epsilon = sigma_yield_mpa > 0 ? Math.sqrt(235 / sigma_yield_mpa) : 0;
  const slendernessRatio = t_web_input_mm > 0 ? h_w_mm / t_web_input_mm : Number.POSITIVE_INFINITY;
  const slendernessLimit = 4.86 * epsilon;
  let needsStiffeners = Number.isFinite(slendernessRatio) && slendernessRatio > slendernessLimit && h_w_mm > 0;

  const gammaM1 = 1.1;
  const supportShear_kg = P / 2 + (q_auto * L) / 2;
  const supportShear_kN = supportShear_kg * KG_TO_KN;
  const supportShear_N = supportShear_kN * 1000;

  let optimalSpacing_mm = h_w_mm;
  if (needsStiffeners && h_w_mm > 0 && t_web_input_mm > 0 && sigma_yield_mpa > 0 && supportShear_N > 0) {
    const plasticShearCapacity_N = (h_w_mm * t_web_input_mm * sigma_yield_mpa) / (Math.sqrt(3) * gammaM1);
    // EN 1993-1-5: plastic shear resistance of the unstiffened web panel
    const utilisation = plasticShearCapacity_N / supportShear_N;
    optimalSpacing_mm = utilisation * h_w_mm;
  }
  if (!Number.isFinite(optimalSpacing_mm) || optimalSpacing_mm <= 0) {
    optimalSpacing_mm = h_w_mm;
  }
  if (h_w_mm > 0) {
    const a_min = 0.5 * h_w_mm;
    const a_limit_aspect = 3 * h_w_mm;
    const a_limit_thickness = t_web_input_mm > 0 && epsilon > 0 ? 260 * epsilon * t_web_input_mm : Number.POSITIVE_INFINITY;
    // EN 1993-1-5 clause 9.2: limit based on plate slenderness
    optimalSpacing_mm = Math.max(a_min, Math.min(optimalSpacing_mm, a_limit_aspect, a_limit_thickness));
  }
  optimalSpacing_mm = Math.max(10, Math.round(optimalSpacing_mm / 10) * 10);

  let stiffenerWidth_mm = 0;
  let stiffenerThickness_mm = 0;
  let stiffenerInertia_mm4 = 0;
  if (h_w_mm > 0 && t_web_input_mm > 0) {
    stiffenerWidth_mm = Math.round(Math.max(0.1 * h_w_mm, 80) / 10) * 10;
    const rawThickness = Math.max(0.6 * Math.sqrt(Math.max(sigma_yield_mpa, 1) / 235) * t_web_input_mm, 8);
    stiffenerThickness_mm = Math.max(8, Math.round(rawThickness));
    stiffenerInertia_mm4 = stiffenerWidth_mm * Math.pow(stiffenerThickness_mm, 3) / 12;
  }

  const span_cm = L;
  const span_mm = span_cm * 10;

  if (needsStiffeners && optimalSpacing_mm >= span_mm) {
    needsStiffeners = false;
    optimalSpacing_mm = span_mm;
  }

  const optimalSpacing_cm = optimalSpacing_mm / 10;
  let stiffenerCount = 0;
  if (needsStiffeners && optimalSpacing_mm > 0 && span_mm > 0) {
    stiffenerCount = Math.ceil(span_mm / optimalSpacing_mm);
  }

  const stiffenerPositions_cm: number[] = [];
  if (needsStiffeners && optimalSpacing_cm > 0 && span_cm > 0) {
    let marker = optimalSpacing_cm;
    let guard = 0;
    while (marker < span_cm && guard < 500) {
      stiffenerPositions_cm.push(Number(marker.toFixed(2)));
      marker += optimalSpacing_cm;
      guard += 1;
    }
  }

  return {
    F, Yc, Xc, Jx, Jy, Wx, Wy,
    Jx_top: Ix_top, Jx_bottom: Ix_bottom, Jx_webs: Ix_webs_or_web,
    Jy_top: Iy_top, Jy_bottom: Iy_bottom, Jy_webs: Iy_webs_or_web,
    P, M_bt, M_vn, M_x, M_y,
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
    },
  };
};

export const generateDiagramData = (inputs: BeamInputs, results: CalculationResults): DiagramData => {
  const { L } = inputs;
  const { P, M_x, q } = results;
  const points = 101; // Number of points to calculate along the beam
  const data: DiagramData = [];

  const R = P / 2 + (q * L) / 2; // Reaction force at support
  
  // The peak moment from the simple formula is M_max_simple = (P*L)/4 + (q*L^2)/8.
  // M_x from results includes safety factors. We'll use this M_x as the peak value and scale the diagram shape to it.
  const M_max_simple = (P * L) / 4 + (q * L**2) / 8;
  const scaleFactor = M_max_simple > 0 ? M_x / M_max_simple : 1;


  for (let i = 0; i < points; i++) {
    const x = (L / (points - 1)) * i;
    let shear: number;
    let moment: number;

    // Shear force
    if (x < L / 2) {
      shear = R - q * x;
    } else {
      shear = R - q * x - P;
    }

    // Bending moment
    if (x <= L / 2) {
      moment = (R * x - (q * x ** 2) / 2);
    } else {
      moment = (R * x - (q * x ** 2) / 2 - P * (x - L / 2));
    }
    
    data.push({ x, shear, moment: moment * scaleFactor });
  }

  // Ensure the moment at the end is exactly 0 after scaling
  if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const simpleMomentEnd = (R * lastPoint.x - (q * lastPoint.x ** 2) / 2 - P * (lastPoint.x - L / 2));
      // This should be near zero, apply scaling and clean up floating point errors
      data[data.length - 1].moment = Math.abs(simpleMomentEnd) < 1e-9 ? 0 : simpleMomentEnd * scaleFactor;
  }

  return data;
};



