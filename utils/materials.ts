import type { MaterialType } from '../types';

export type MaterialProps = {
  sigma_yield: number; // kg/cm^2
  sigma_allow: number; // kg/cm^2
  E: number;           // kg/cm^2
  nu: number;          // unitless
};

export const MATERIAL_LIBRARY: Record<Exclude<MaterialType, 'CUSTOM'>, MaterialProps> = {
  SS400: { sigma_yield: 2450, sigma_allow: 1400, E: 2.1e6, nu: 0.3 },
  CT3:   { sigma_yield: 2350, sigma_allow: 1400, E: 2.1e6, nu: 0.3 },
  A36:   { sigma_yield: 2500, sigma_allow: 1500, E: 2.1e6, nu: 0.3 },
};

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  SS400: 'SS400',
  CT3: 'CT3',
  A36: 'A36',
  CUSTOM: 'Custom',
};

