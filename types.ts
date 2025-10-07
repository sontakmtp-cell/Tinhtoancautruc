export type Language = 'en' | 'vi';

export type MaterialType = 'SS400' | 'CT3' | 'A36' | 'CUSTOM';

export interface BeamInputs {
  // Geometric properties (mm)
  b: number; // Bottom flange width b1 (mm) for single-girder; Flange width b for I-beam
  h: number; // Beam height H (mm)
  t1: number; // Bottom flange thickness t1 (mm) for single-girder; Flange thickness t for I-beam
  t2: number; // Top flange thickness t2 (mm) for single-girder; (same as t1 for I-beam)
  t3: number; // Web thickness t3 (mm) for single-girder; Web thickness tw for I-beam
  b1: number; // Web spacing b2 (mm)
  b3: number; // Top flange width b2 (mm)

  // Material and Load properties
  L: number; // Beam span (cm)
  A: number; // End carriage wheel center distance (cm)
  C: number; // End inclined segment length (cm)
  P_nang: number; // Lifting load (kg)
  P_thietbi: number; // Equipment load (kg)
  sigma_allow: number; // Allowable stress (kg/cm^2)
  sigma_yield: number; // Yield strength (kg/cm^2)
  E: number; // Modulus of Elasticity (kg/cm^2)
  nu: number; // Poisson's ratio
  q: number; // Distributed load (kg/cm)

  // Selected material type (optional; for UI/reporting)
  materialType?: MaterialType;

  /** Optional V-beam specific geometry used for visualisations (mm and degrees). */
  vBeamParams?: {
    h1: number;
    h3: number;
    t4: number;
    webAngleDeg?: number;
    roofAngleDeg?: number;
  };
}

export interface GeometricProperties {
  F: number;  // Area (cm^2)
  Yc: number; // Centroid from bottom (cm)
  Xc: number; // Centroid from left (cm)
  Jx: number; // Moment of inertia about x-axis (cm^4)
  Jy: number; // Moment of inertia about y-axis (cm^4)
  Wx: number; // Section modulus about x-axis (cm^3)
  Wy: number; // Section modulus about y-axis (cm^3)
}

export interface CalculationResults extends GeometricProperties {
  // Load and Moment results
  P: number; // Total point load (kg)
  M_bt: number; // Moment from distributed load (kg.cm)
  M_vn: number; // Moment from point load (kg.cm)
  M_x: number; // Total moment about x-axis (kg.cm)
  M_y: number; // Total moment about y-axis (kg.cm)
  beamSelfWeight: number; // Self-weight of the beam (kg)
  q: number;   // Auto-computed distributed load (kg/cm)
  
  // Inertia component breakdown (cm^4)
  Jx_top: number;    // Top flange contribution to Jx
  Jx_bottom: number; // Bottom flange contribution to Jx
  Jx_webs: number;   // Two webs contribution to Jx (sum)
  Jy_top: number;    // Top flange contribution to Jy
  Jy_bottom: number; // Bottom flange contribution to Jy
  Jy_webs: number;   // Two webs contribution to Jy (sum)
  
  // Stress and Deflection results
  sigma_u: number; // Calculated stress (kg/cm^2)
  sigma_top_compression: number; // Stress at top fiber (kg/cm^2)
  sigma_bottom_tension: number; // Stress at bottom fiber (kg/cm^2)
  f: number; // Calculated deflection (cm)
  f_allow: number; // Allowable deflection (cm)

  // Safety factors
  K_sigma: number; // Stress safety factor
  n_f: number; // Deflection safety factor
  K_buckling: number; // Local buckling safety factor for top flange
  
  // Status
  stress_check: 'pass' | 'fail';
  deflection_check: 'pass' | 'fail';
  buckling_check: 'pass' | 'fail';

  /** Calculation mode used for the run */
  calculationMode: 'single-girder' | 'i-beam' | 'double-girder' | 'v-beam';

  /** Web stiffener recommendation and layout */
  stiffener: StiffenerRecommendation;
  // --- Torsion due to rail misalignment (double-girder additions) ---
  /** Extreme torsional moment per side (kg.cm) */
  T_torsion?: number;
  /** Angle of twist (rad) */
  theta?: number;
  /** Shear stress from torsion at top flange (kg/cm^2) */
  tau_t_top?: number;
  /** Shear stress from torsion at web (kg/cm^2) */
  tau_t_web?: number;
  /** Shear stress from torsion at bottom flange (kg/cm^2) */
  tau_t_bottom?: number;
  /** Torsion safety check */
  torsion_check?: 'pass' | 'fail';
  /** Rail level difference due to twist (mm) */
  railDifferential?: number;
}

export interface StiffenerRecommendation {
  /** Whether the web requires intermediate stiffeners based on slenderness */
  required: boolean;
  /** Effective web height hw in millimetres */
  effectiveWebHeight: number;
  /** Slenderness coefficient epsilon */
  epsilon: number;
  /** Recommended spacing between stiffeners (mm) */
  optimalSpacing: number;
  /** Estimated number of stiffeners along the span */
  count: number;
  /** Recommended stiffener plate width (mm) */
  width: number;
  /** Recommended stiffener plate thickness (mm) */
  thickness: number;
  /** Minimum required second moment of area (mm^4) */
  requiredInertia: number;
  /** Marker positions along the span (cm) for visualisation */
  positions: number[];
  /** Total weight of all stiffeners (kg) */
  totalWeight: number;
}
export interface DiagramPoint {
  x: number;      // Position along the beam
  shear: number;  // Shear force value
  moment: number; // Bending moment value
}

export type DiagramData = DiagramPoint[];

// Extended inputs for double-girder mode
export interface DoubleBeamInputs extends BeamInputs {
  /** Beam center-to-center distance (mm) */
  Td: number;
  /** Rail center-to-center distance (mm) */
  Tr: number;
  /** Transversal load from cross members (kg/m) */
  transversalLoad: number;
}

// V-beam specific inputs based on the engineering drawing
export interface VBeamInputs {
  // V-beam specific geometric parameters from the image
  t3: number; // �? d�y b?ng (Web thickness) - mm
  h3: number; // Chi?u cao b?ng (Web height) - mm  
  t4: number; // �? d�y m�i (Roof thickness) - mm
  b1: number; // Chi?u r?ng c�nh (Flange width) - mm
  t1: number; // Chi?u d�y c�nh (Flange thickness) - mm
  t2: number; // Chi?u d�y th�n (Body thickness) - mm
  h1: number; // Chi?u cao I (I-height) - mm
  L: number;  // Kh?u d? d?m (Beam span) - cm
  A: number;  // T�m b�nh xe d?m bi�n A (Edge beam wheel center A) - mm
  
  // Additional dimensions from the image (optional, with defaults)
  H?: number; // Total height - mm
  H1?: number; // Height to V-section start - mm
  H2?: number; // Height to V-top corner - mm
  H3?: number; // Height from V-corner to top - mm
  Lc?: number; // Length of top-left angled segment - mm
  d?: number;  // Small horizontal offset at top-left - mm
  s?: number;  // Small vertical offset at top-right - mm
  a1?: number; // Angle of V-section - degrees
  La?: number; // Total width at top - mm
  Lb?: number; // Width at top (narrower) - mm
  Ld?: number; // Width at top (narrowest) - mm
  b?: number;  // Base width - mm
  h2?: number; // Height dimension - mm
  a?: number;  // Wheel center distance - mm

  // Material and Load properties (same as BeamInputs)
  P_nang: number; // Hoist load (kg)
  P_thietbi: number; // Trolley weight (kg)
  sigma_allow: number; // Allowable stress (kg/cm^2)
  sigma_yield: number; // Yield strength (kg/cm^2)
  E: number; // Modulus of Elasticity (kg/cm^2)
  nu: number; // Poisson's ratio
  q: number; // Self weight factor

  // Selected material type (optional; for UI/reporting)
  materialType?: MaterialType;
}

// Edge beam inputs for crane edge beam calculations
export interface EdgeBeamInputs {
  // Basic parameters
  S: number;           // Crane span (m)
  x: number;           // Trolley position from center rail to edge beam (m)
  Q: number;           // Rated load (kg)
  Gx: number;          // Trolley weight (kg)
  Gc: number;          // Main beam self-weight (kg)
  z: number;           // Number of wheels per end
  b: number;           // Number of driving wheels
  D: number;           // Wheel diameter (mm)
  B: number;           // Wheel rim width (mm)
  v: number;           // Travel speed (m/min)
  sigma_H_allow: number; // Allowable contact stress (kg/cm^2)
  tau_allow: number;   // Allowable shear stress (MPa)
  n_dc: number;        // Motor rated speed (rpm)
  i_cyclo: number;     // Cyclo gearbox ratio
  
  /**
   * Additional shaft loading parameters
   * M_b: External bending moment acting on the shaft (N*m)
   * K_b, K_t: Shock/combined loading factors for bending and torsion (ASME-style)
   */
  M_b?: number;        // External bending moment on shaft (N*m)
  K_b?: number;        // Bending shock factor (-)
  K_t?: number;        // Torsion shock factor (-)
  
  // Drive system coefficients
  eta: number;         // Overall efficiency
  m: number;           // Rail resistance coefficient
  f: number;           // Rolling coefficient
  a: number;           // Rail slope
  K_dyn: number;       // Dynamic factor
}

// Edge beam calculation results
export interface EdgeBeamResults {
  // Wheel loads
  P: number;           // Concentrated load (kg)
  R_L: number;         // Left reaction (kg)
  R_R: number;         // Right reaction (kg)
  N_L: number;         // Load per left wheel (kg)
  N_R: number;         // Load per right wheel (kg)
  N_max: number;       // Maximum wheel load (kg)
  N_t: number;         // Dynamic wheel load (kg)
  
  // Contact stress
  sigma_H: number;     // Contact stress wheel-rail (kg/cm^2)
  n_H: number;         // Contact stress safety factor
  
  // Resistance forces and power
  G_tot: number;       // Total weight (kg)
  W1: number;          // Rolling resistance (kgf)
  W2: number;          // Joint resistance (kgf)
  W3: number;          // Slope resistance (kgf)
  W: number;           // Total driving force (kgf)
  F_req: number;       // Required force per driving wheel (kgf)
  N_dc: number;        // Motor power (kW)
  
  // Speed and gear ratios
  n_wheel: number;     // Wheel speed (rpm)
  i_total: number;     // Total gear ratio
  i_gear: number;      // Gearbox to wheel ratio
  
  // Shaft checks
  M_dc: number;        // Motor torque (N*m)
  M_shaft: number;     // Shaft torque at wheel (N*m)
  T_eq: number;        // Equivalent torque incl. bending (N*m)
  M_b: number;         // Bending moment on shaft used (N*m)
  F_t: number;         // Tangential force (N)
  d_calculated: number; // Calculated shaft diameter (mm)
  shaft_check: 'pass' | 'fail';
  torque_check: 'pass' | 'fail';
  contact_stress_check: 'pass' | 'fail';
}
