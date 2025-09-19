export interface BeamInputs {
  // Geometric properties (mm)
  b: number; // Overall width
  h: number; // Overall height
  t1: number; // Top flange thickness
  t2: number; // Bottom flange thickness
  t3: number; // Web thickness
  b1: number; // Gap between webs

  // Material and Load properties
  L: number; // Beam span (cm)
  P_nang: number; // Lifting load (kg)
  P_thietbi: number; // Equipment load (kg)
  sigma_allow: number; // Allowable stress (kg/cm^2)
  sigma_yield: number; // Yield strength (kg/cm^2)
  E: number; // Modulus of Elasticity (kg/cm^2)
  nu: number; // Poisson's ratio
  q: number; // Distributed load (kg/cm)
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
}

export interface DiagramPoint {
  x: number;      // Position along the beam
  shear: number;  // Shear force value
  moment: number; // Bending moment value
}

export type DiagramData = DiagramPoint[];

