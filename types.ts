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
  calculationMode: 'single-girder' | 'i-beam' | 'double-girder';

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
