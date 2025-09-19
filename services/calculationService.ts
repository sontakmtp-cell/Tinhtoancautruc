import type { BeamInputs, CalculationResults, DiagramData, DiagramPoint } from '../types';

export const calculateBeamProperties = (inputs: BeamInputs): CalculationResults => {
  const {
    b: b_bottom_mm,
    h: h_mm,
    t1: t1_mm,
    t2: t2_mm,
    t3: t3_mm,
    b1: b1_mm,
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
  const b_bottom = b_bottom_mm / 10; // bottom flange width (cm)
  const h = h_mm / 10;
  const t1 = t1_mm / 10;
  const t2 = t2_mm / 10;
  const t3 = t3_mm / 10;
  const b1 = b1_mm / 10;
  const b_top = (b_top_mm ?? b_bottom_mm) / 10; // fallback for backward compatibility

  // --- 1. Geometric Properties Calculation ---
  const topFlangeArea = b_top * t1;
  const bottomFlangeArea = b_bottom * t2;
  const webHeight = h - t1 - t2;
  const singleWebArea = webHeight * t3;
  
  const F = topFlangeArea + bottomFlangeArea + 2 * singleWebArea;

  const y_top = h - t1 / 2;
  const y_bottom = t2 / 2;
  const y_webs = t2 + webHeight / 2;
  const Yc = (topFlangeArea * y_top + bottomFlangeArea * y_bottom + 2 * singleWebArea * y_webs) / F;
  // Horizontal centroid lies on the symmetry centerline between webs
  // We report Xc relative to that centerline as 0 for clarity (not used elsewhere)
  const Xc = 0;

  // Rectangular flange local inertia uses its own width (b_top/b_bottom)
  const Ix_top = (b_top * t1 ** 3) / 12 + topFlangeArea * (y_top - Yc) ** 2;
  const Ix_bottom = (b_bottom * t2 ** 3) / 12 + bottomFlangeArea * (y_bottom - Yc) ** 2;
  const Ix_webs = 2 * ((t3 * webHeight ** 3) / 12 + singleWebArea * (y_webs - Yc) ** 2);
  const Jx = Ix_top + Ix_bottom + Ix_webs;

  const Iy_top = (t1 * b_top ** 3) / 12;
  const Iy_bottom = (t2 * b_bottom ** 3) / 12;
  const web_dist_from_center = b1 / 2 + t3 / 2;
  const Iy_webs = 2 * ((webHeight * t3 ** 3) / 12 + singleWebArea * web_dist_from_center ** 2);
  const Jy = Iy_top + Iy_bottom + Iy_webs;
  
  const Wx = Jx / Math.max(Yc, h - Yc);
  const Wy = Jy / (Math.max(b_top, b_bottom) / 2);

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
  const sigma_top_compression = (M_x * (h - Yc)) / Jx;
  const sigma_bottom_tension = (M_x * Yc) / Jx;

  // Deflection (combining distributed load and central point load)
  const f = (5 * q_auto * L ** 4) / (384 * E * Jx) + (P * L ** 3) / (48 * E * Jx);
  // Allowable deflection per requirement: f_allow = L / 1000
  const f_allow = L / 1000;

  // --- 3. Safety Checks ---
  const K_sigma = sigma_allow / sigma_u;
  const n_f = f_allow / f;

  // --- 4. Advanced Checks (Local Buckling) ---
  // Simplified check for local buckling of the top flange panel between webs.
  // This compares the width/thickness ratio to a material-dependent limit.
  const lambda_actual = b1 / t1;
  // The constant 1.9 is an example value for stiffened elements.
  const lambda_limit = 1.9 * Math.sqrt(E / sigma_yield); 
  const K_buckling = lambda_actual > 0 ? lambda_limit / lambda_actual : Infinity;

  return {
    F, Yc, Xc, Jx, Jy, Wx, Wy,
    Jx_top: Ix_top, Jx_bottom: Ix_bottom, Jx_webs: Ix_webs,
    Jy_top: Iy_top, Jy_bottom: Iy_bottom, Jy_webs: Iy_webs,
    P, M_bt, M_vn, M_x, M_y,
    q: q_auto,
    sigma_u, sigma_top_compression, sigma_bottom_tension, f, f_allow,
    K_sigma, n_f, K_buckling,
    stress_check: K_sigma >= 1 ? 'pass' : 'fail',
    deflection_check: n_f >= 1 ? 'pass' : 'fail',
    buckling_check: K_buckling >= 1 ? 'pass' : 'fail',
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
