import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  BarChart,
  AreaChart,
  TrendingDown,
  HelpCircle,
  HardHat,
  Scale,
  ChevronsRight,
  RotateCcw,
  Copy
} from 'lucide-react';
import type { CalculationResults, DiagramData, MaterialType, VBeamInputs, BeamInputs } from '../types';
import { MATERIAL_LIBRARY, MATERIAL_LABELS } from '../utils/materials';
import { useTranslation } from 'react-i18next';
import { HamsterLoader } from './Loader';
import { InternalForceDiagram } from './InternalForceDiagram';
import { StressDistributionDiagram } from './StressDistributionDiagram';
import { DeflectedShapeDiagram } from './DeflectedShapeDiagram';
import { PDFExportButton } from './PDFReport';
import { VBeamCrossSection } from './VBeamCrossSection';
import { multiplyForDisplay } from '../utils/display';

const MIN_LOADER_DURATION_MS = 4_000;

// Helper function to convert VBeamInputs to BeamInputs for compatibility
const convertVBeamToBeamInputs = (vBeamInputs: VBeamInputs): BeamInputs => ({
  b: vBeamInputs.b1, // Flange width
  h: vBeamInputs.H || (vBeamInputs.h1 + vBeamInputs.h3), // Total height
  t1: vBeamInputs.t1, // Bottom flange thickness
  t2: vBeamInputs.t2, // Top flange thickness (using body thickness as approximation)
  t3: vBeamInputs.t3, // Web thickness
  b1: vBeamInputs.b1, // Web spacing (using flange width as approximation)
  b3: vBeamInputs.b1, // Top flange width
  L: vBeamInputs.L,
  A: vBeamInputs.A / 10, // Convert mm to cm
  C: 0, // Not applicable for V-beam
  P_nang: vBeamInputs.P_nang,
  P_thietbi: vBeamInputs.P_thietbi,
  sigma_allow: vBeamInputs.sigma_allow,
  sigma_yield: vBeamInputs.sigma_yield,
  E: vBeamInputs.E,
  nu: vBeamInputs.nu,
  q: vBeamInputs.q,
  materialType: vBeamInputs.materialType,
});

// --- Tính toán các giá trị mặc định dựa trên hình học ---
const default_t1 = 16;
const default_h1 = 235;
const default_h3 = 1000;
const a1_rad = (30 * Math.PI) / 180; // Góc nghiêng V-web là 30 độ
const default_vWebHeight = default_h3 * Math.cos(a1_rad);
const default_H1 = default_t1 + default_h1;
const default_H2 = default_H1 + default_vWebHeight;
const default_H3 = 99.07; // Giá trị tham khảo từ bản vẽ gốc
const default_H = default_H2 + default_H3;

// Định nghĩa inputs mặc định cho dầm V
const defaultVBeamInputs: VBeamInputs = {
  // V-beam specific parameters from the image
  t3: 6,       // Độ dày bụng (Web thickness) - mm
  h3: 1000,      // Chiều cao bụng (Web height) - mm
  t4: 10,       // Độ dày mái (Roof thickness) - mm
  b1: 170,      // Chiều rộng cánh (Flange width) - mm
  t1: 16,       // Chiều dày cánh (Flange thickness) - mm
  t2: 12,       // Chiều dày thân (Body thickness) - mm
  h1: default_h1,      // Chiều cao I (I-height) - mm
  L: 1200,      // Khẩu độ dầm (Beam span) - cm
  A: 150,       // Tâm bánh xe dầm biên A (Edge beam wheel center A) - mm
  
  // Các kích thước tổng thể, được tính toán tự động để nhất quán
  H: default_H,      // Total height - mm
  H1: default_H1,      // Height to V-section start - mm
  H2: default_H2,     // Height to V-top corner - mm
  H3: default_H3,      // Height from V-corner to top - mm
  Lc: 480,      // Length of top-left angled segment - mm
  d: 50,        // Small horizontal offset at top-left - mm
  s: 30,        // Small vertical offset at top-right - mm
  a1: 45,       // Angle of V-section - degrees
  La: 700,      // Total width at top - mm
  Lb: 600,      // Width at top (narrower) - mm
  Ld: 550,      // Width at top (narrowest) - mm
  b: 500,       // Base width - mm
  h2: 640,      // Height dimension - mm
  a: 150,       // Wheel center distance - mm

  // Material and Load properties
  P_nang: 40000,    // Hoist load (kg)
  P_thietbi: 12000, // Trolley weight (kg)
  sigma_allow: 1650,
  sigma_yield: 2450,
  E: 2.1e6,
  nu: 0.3,
  q: 25,        // Self weight factor
  materialType: 'SS400',
};

// Cấu hình input cho dầm V
const getVBeamInputConfig = (t: (key: string, opts?: any) => string) => [
  {
    title: 'Section geometry',
    icon: Scale,
    fields: [
      // V-beam specific parameters
      { name: 't3', label: 'calculator.webThicknessT3', unit: 'mm' },
      { name: 'h3', label: 'calculator.webHeightH3', unit: 'mm' },
      { name: 't4', label: 'calculator.roofThicknessT4', unit: 'mm' },
      { name: 'b1', label: 'calculator.flangeWidthB1', unit: 'mm' },
      { name: 't1', label: 'calculator.flangeThicknessT1', unit: 'mm' },
      { name: 't2', label: 'calculator.bodyThicknessT2', unit: 'mm' },
      { name: 'h1', label: 'calculator.iHeightH1', unit: 'mm' },
      { name: 'L', label: 'calculator.spanLengthL', unit: 'cm' },
      { name: 'A', label: 'endCarriageWheelCenterA', unit: 'mm' },
    ],
  },
  {
    title: 'Loading & material',
    icon: HardHat,
    fields: [
      { name: 'P_nang', label: 'Hoist load', unit: 'kg' },
      { name: 'P_thietbi', label: 'Trolley weight', unit: 'kg' },
      { name: 'sigma_allow', label: 'Allowable stress', unit: 'kg/cm²' },
      { name: 'sigma_yield', label: 'Yield stress', unit: 'kg/cm²' },
      { name: 'E', label: 'Elastic modulus E', unit: 'kg/cm²' },
      { name: 'nu', label: 'Poisson ratio (nu)', unit: '' },
    ],
  },
] as const;

const CollapsibleSection: React.FC<{ 
  title: string | React.ReactNode; 
  icon: React.FC<any>; 
  children: React.ReactNode; 
  defaultOpen?: boolean 
}> = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
      <button
        type="button"
        aria-expanded={isOpen}
        data-section-title={typeof title === 'string' ? title : 'Section'}
        className="w-full flex justify-between items-center p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center" style={{ textTransform: 'none' }}>
          <Icon className="w-5 h-5 mr-3 text-blue-500" />
          {title}
        </h3>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && <div className="px-4 pt-2 pb-5 border-t border-gray-200 dark:border-gray-700">{children}</div>}
    </div>
  );
};

const ResultItem: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-gray-900 dark:text-white">
      {value} <span className="text-sm font-normal text-gray-600 dark:text-gray-300">{unit}</span>
    </p>
  </div>
);

const CheckBadge: React.FC<{ status: 'pass' | 'fail'; label: string; value: string }> = ({ status, label, value }) => {
  const isPass = status === 'pass';
  const bgColor = isPass ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50';
  const textColor = isPass ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300';
  const Icon = isPass ? CheckCircle2 : XCircle;

  return (
    <div className={`p-3 rounded-md ${bgColor} ${textColor}`}>
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-2" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
};

export const VBeamCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<VBeamInputs>(defaultVBeamInputs);
  const [inputStrings, setInputStrings] = useState<Partial<Record<keyof VBeamInputs, string>>>(() => {
    const map: Partial<Record<keyof VBeamInputs, string>> = {};
    (Object.keys(defaultVBeamInputs) as (keyof VBeamInputs)[]).forEach((k) => {
      map[k] = String((defaultVBeamInputs as any)[k] ?? '');
    });
    return map;
  });
  const [materialType, setMaterialType] = useState<MaterialType>(defaultVBeamInputs.materialType || 'SS400');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCallingAI, setIsCallingAI] = useState<boolean>(false);

  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Keep raw string for better UX with decimals and partial typing
    setInputStrings((prev) => ({ ...prev, [name]: value }));

    // Normalize decimal separator to dot for parsing
    const normalized = value.replace(',', '.');
    const isIntermediate =
      normalized === '' ||
      normalized === '-' ||
      normalized === '.' ||
      normalized === '-.' ||
      /\.$/.test(normalized);

    if (!isIntermediate) {
      const numValue = Number(normalized);
      if (!Number.isNaN(numValue)) {
        setInputs((prev) => ({ ...prev, [name]: numValue as any }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const raw = inputStrings[name as keyof VBeamInputs] ?? '';
    const normalized = String(raw).replace(',', '.');
    const numValue = Number(normalized);
    if (!Number.isNaN(numValue)) {
      setInputs((prev) => ({ ...prev, [name]: numValue as any }));
      setInputStrings((prev) => ({ ...prev, [name]: String(numValue) }));
    }
  };

  const handleMaterialSelect = (type: MaterialType) => {
    setMaterialType(type);
    setInputs((prev) => {
      if (type === 'CUSTOM') {
        return { ...prev, materialType: type };
      }
      const mat = MATERIAL_LIBRARY[type];
      return {
        ...prev,
        materialType: type,
        sigma_allow: mat.sigma_allow,
        sigma_yield: mat.sigma_yield,
        E: mat.E,
        nu: mat.nu,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setResults(null);
    setDiagramData(null);
    setRecommendation('');

    const loaderStart = Date.now();

    try {
      // TODO: Implement V-beam calculation service
      // For now, create mock results
      const mockResults: CalculationResults = {
        F: 245.6,
        Yc: 68.2,
        Xc: 25.0,
        Jx: 1.2e6,
        Jy: 3.8e5,
        Wx: 17600,
        Wy: 15200,
        P: inputs.P_nang + inputs.P_thietbi,
        M_bt: 0,
        M_vn: 0,
        M_x: 6.8e6,
        M_y: 0,
        beamSelfWeight: 245.6,
        q: inputs.q,
        Jx_top: 2.1e5,
        Jx_bottom: 3.2e5,
        Jx_webs: 6.7e5,
        Jy_top: 1.8e5,
        Jy_bottom: 2.1e5,
        Jy_webs: -1.0e4,
        sigma_u: 386.4,
        sigma_top_compression: 386.4,
        sigma_bottom_tension: 386.4,
        f: 2.1,
        f_allow: 2.4,
        K_sigma: 4.27,
        n_f: 1.14,
        K_buckling: 1.8,
        stress_check: 'pass',
        deflection_check: 'pass',
        buckling_check: 'pass',
        calculationMode: 'single-girder',
        stiffener: {
          required: false,
          effectiveWebHeight: inputs.h3,
          epsilon: 1.2,
          optimalSpacing: 1500,
          count: 0,
          width: 150,
          thickness: 12,
          requiredInertia: 2.5e6,
          positions: [],
          totalWeight: 0,
        },
      };

      setResults(mockResults);
      
      // Generate mock diagram data
      const mockDiagramData: DiagramData = [];
      for (let i = 0; i <= 20; i++) {
        const x = (i / 20) * inputs.L;
        const shear = inputs.P_nang * (0.5 - x / inputs.L);
        const moment = inputs.P_nang * x * (1 - x / inputs.L) / 2;
        mockDiagramData.push({ x, shear, moment });
      }
      setDiagramData(mockDiagramData);
      
      setRecommendation('');
    } catch (error) {
      console.error('V-Beam Calculation Error:', error);
      setRecommendation('');
    } finally {
      const elapsed = Date.now() - loaderStart;
      if (elapsed < MIN_LOADER_DURATION_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADER_DURATION_MS - elapsed));
      }
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputs(defaultVBeamInputs);
    const map: Partial<Record<keyof VBeamInputs, string>> = {};
    (Object.keys(defaultVBeamInputs) as (keyof VBeamInputs)[]).forEach((k) => {
      map[k] = String((defaultVBeamInputs as any)[k] ?? '');
    });
    setInputStrings(map);
    setMaterialType(defaultVBeamInputs.materialType || 'SS400');
    setResults(null);
    setDiagramData(null);
    setRecommendation('');
    setIsLoading(false);
    setIsCallingAI(false);
  };

  // Tính toán cân bằng hình học cho dầm V
  const geometricBalanceItems = React.useMemo(() => {
    const items: { key: string; label: string; status: 'pass' | 'fail'; value: string }[] = [];
    if (!results) return items;

    const H_cm = inputs.H! / 10;
    const L_cm = inputs.L; // already in cm
    const b1_cm = inputs.b1 / 10; // flange width
    const h1_cm = inputs.h1 / 10; // I-height
    const h3_cm = inputs.h3 / 10; // web height
    const A_cm = inputs.A / 10;
    
    const assess = (
      key: string,
      label: string,
      actual: number,
      ref: number,
      minRatio: number,
      maxRatio: number
    ) => {
      const minVal = minRatio * ref;
      const maxVal = maxRatio * ref;
      if (actual < minVal && actual > 0) {
        const pct = ((minVal - actual) / actual) * 100;
        items.push({ key, label, status: 'fail', value: t('increaseByPct', { pct: pct.toFixed(1) }) });
      } else if (actual > maxVal && actual > 0) {
        const pct = ((actual - maxVal) / actual) * 100;
        items.push({ key, label, status: 'fail', value: t('decreaseByPct', { pct: pct.toFixed(1) }) });
      } else if (actual === 0) {
        items.push({ key, label, status: 'fail', value: t('increaseByPct', { pct: '100.0' }) });
      } else {
        items.push({ key, label, status: 'pass', value: t('meetsCriterion') });
      }
    };

    // V-beam specific geometric balance checks
    // 1) H = 1/16 .. 1/12 of L (similar to other beam types)
    assess('H', t('Total height H'), H_cm, L_cm, 1 / 16, 1 / 12);
    // 2) b1 (flange width) = 1/3 .. 1/2 of H
    assess('b1', t('calculator.flangeWidthB1'), b1_cm, H_cm, 1 / 3, 1 / 2);
    // 3) h1 (I-height) = 1/2 .. 2/3 of H
    assess('h1', t('calculator.iHeightH1'), h1_cm, H_cm, 1 / 2, 2 / 3);
    // 4) h3 (web height) = 1/4 .. 1/3 of H
    assess('h3', t('calculator.webHeightH3'), h3_cm, H_cm, 1 / 4, 1 / 3);
    // 5) A = 1/8 .. 1/6 of L
    assess('A', t('endCarriageWheelCenterA'), A_cm, L_cm, 1 / 8, 1 / 6);

    return items;
  }, [inputs, results, t]);

  const activeInputKey = !results && typeof document !== 'undefined'
    ? (Object.keys(inputStrings) as (keyof VBeamInputs)[]).find((key) => document.activeElement?.id === key)
    : undefined;

  // Mock stiffener layout for display
  const stiffenerLayout = React.useMemo(() => {
    if (!results?.stiffener || !results.stiffener.required || results.stiffener.count <= 0) {
      return undefined;
    }

    const { optimalSpacing, count } = results.stiffener;
    const span_cm = inputs.L;
    const spacing_cm = optimalSpacing / 10;
    const newPositions: number[] = [];

    const totalStiffenerBlockLength = (count - 1) * spacing_cm;
    const firstStiffenerPos = (span_cm - totalStiffenerBlockLength) / 2;

    for (let i = 0; i < count; i++) {
      const pos = firstStiffenerPos + i * spacing_cm;
      newPositions.push(pos);
    }

    return {
      positions: newPositions,
      span: span_cm,
      spacing: optimalSpacing,
      count: newPositions.length,
      required: results.stiffener.required,
    };
  }, [results, inputs.L]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-1">
          {/* Mobile-only Cross Section Diagram */}
          {!isLoading && !results && (
            <div className="block lg:hidden">
              <CollapsibleSection title={t('Cross-section reference')} icon={Scale}>
                <div id="cross-section-diagram-mobile">
                  <VBeamCrossSection
                    inputs={inputs}
                    activeInput={activeInputKey}
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Input Sections */}
          {getVBeamInputConfig(t).map(({ title, icon, fields }) => (
            <CollapsibleSection key={title} title={t(title)} icon={icon}>
              {/* Material selection radio buttons for Loading & material section */}
              {title === 'Loading & material' && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Material')}</div>
                  <div className="radio-input">
                    {(['SS400','CT3','A36','CUSTOM'] as MaterialType[]).map((mt) => (
                      <label key={mt} className="label">
                        <input
                          type="radio"
                          name="materialType"
                          value={mt}
                          checked={materialType === mt}
                          onChange={() => handleMaterialSelect(mt)}
                        />
                        <span className="text">{MATERIAL_LABELS[mt]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {fields.map(({ name, label, unit }) => {
                  const isMaterialField = ['sigma_allow','sigma_yield','E','nu'].includes(name as string);
                  const disabled = isMaterialField && materialType !== 'CUSTOM';
                  return (
                    <div key={name} className="col-span-2 sm:col-span-1 calc-field">
                      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t(label)}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id={name}
                          name={name}
                          value={inputStrings[name] ?? String(inputs[name] ?? '')}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input mb-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                          step="any"
                          inputMode="decimal"
                          disabled={disabled}
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-300 pointer-events-none">
                          {unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          ))}

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="calc-button w-1/3 flex justify-center items-center py-3 px-4"
              style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1rem)' }}
            >
              <RotateCcw className="mr-2 h-5 w-5 flex-shrink-0" />
              {t('calculator.reset')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="calc-button w-1/3 flex justify-center items-center py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1rem)' }}
            >
              {isLoading ? t('calculator.calculating') : t('calculator.calculate')}
              {!isLoading && <ChevronsRight className="ml-2 h-5 w-5 flex-shrink-0" />}
            </button>
            <PDFExportButton
              inputs={convertVBeamToBeamInputs(inputs)}
              results={results}
              isLoading={isLoading}
              aiRecommendation={recommendation}
              className="w-1/3"
            />
          </div>
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-8">
          {isLoading && (
            <div className="flex justify-center items-center h-96">
              <HamsterLoader
                status={isCallingAI ? 'warning' : 'default'}
                messageKey="loader.default"
                warningMessageKey="loader.warning"
              />
            </div>
          )}

          {!isLoading && !results && (
            <div className="hidden lg:block">
              <CollapsibleSection title={t('Cross-section reference')} icon={Scale}>
                <div id="cross-section-diagram">
                  <VBeamCrossSection
                    inputs={inputs}
                    activeInput={activeInputKey}
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}

          {!isLoading && results && (
            <>
              {recommendation && (
                <div className="bg-orange-50 dark:bg-gray-800 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <Bot className="h-8 w-8 text-orange-500 mr-4 flex-shrink-0" />
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{recommendation}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              <CollapsibleSection 
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('safetyChecks')}</span>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
                      <div className="absolute left-0 top-6 w-96 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: t('calculator.safetyChecksTooltip') }} />
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                } 
                icon={HardHat}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <CheckBadge
                    status={results.stress_check}
                    label={t('Stress check')}
                    value={`K_sigma = ${results.K_sigma.toFixed(2)}`}
                  />
                  <CheckBadge
                    status={results.deflection_check}
                    label={t('Deflection')}
                    value={`n_f = ${results.n_f.toFixed(2)}`}
                  />
                  <CheckBadge
                    status={results.buckling_check}
                    label={t('Buckling')}
                    value={`K_buckling = ${results.K_buckling.toFixed(2)}`}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('Geometric balance')}</span>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
                      <div className="absolute left-0 top-6 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <div>{t('calculator.geometricBalanceTooltip')}</div>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                } 
                icon={Scale}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {geometricBalanceItems.map((it) => (
                    <CheckBadge key={it.key} status={it.status} label={it.label} value={it.value} />
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('calculator.stiffenerRecommendationTitle')}</span>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
                      <div className="absolute left-0 top-6 w-96 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <img src="https://i.postimg.cc/Px7tKMZS/Untitled.png" alt="Stiffener illustration" className="w-full h-auto rounded" />
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                }
                icon={TrendingDown}
              >
                <div className="space-y-4">
                  {results.stiffener.required ? (
                    <p className="text-sm text-gray-900 dark:text-white">{t('calculator.stiffenerRequiredMessage')}</p>
                  ) : (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {t('calculator.stiffenerOptionalMessage')}
                    </p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <ResultItem label={t('calculator.stiffenerSpacing')} value={results.stiffener.optimalSpacing.toFixed(0)} unit="mm" />
                    <ResultItem label={t('calculator.stiffenerCount')} value={multiplyForDisplay(results.stiffener.count).toString()} unit={t('calculator.unitPieces')} />
                    <ResultItem label={t('calculator.stiffenerWidth')} value={results.stiffener.width.toFixed(0)} unit="mm" />
                    <ResultItem label={t('calculator.stiffenerThickness')} value={results.stiffener.thickness.toFixed(0)} unit="mm" />
                    <ResultItem label={t('calculator.stiffenerInertia')} value={results.stiffener.requiredInertia.toExponential(2)} unit="mm^4" />
                    <ResultItem label={t('stiffenerWeight')} value={multiplyForDisplay(results.stiffener.totalWeight).toFixed(1)} unit="kg" />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('Calculation summary')}</span>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
                      <div className="absolute left-0 top-6 w-96 max-w-[22rem] p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <div className="font-medium mb-2">{t('calculator.referencesTitle')}</div>
                        <ul className="list-disc list-inside space-y-1">
                          {(t('calculator.references', { returnObjects: true }) as string[]).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                }
                icon={BarChart}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ResultItem label={t('Area F')} value={results.F.toFixed(2)} unit="cm²" />
                  <ResultItem label={t('Moment of inertia Jx')} value={results.Jx.toExponential(2)} unit="cm⁴" />
                  <ResultItem label={t('Moment of inertia Jy')} value={results.Jy.toExponential(2)} unit="cm⁴" />
                  <ResultItem label={t('Section modulus Wx')} value={results.Wx.toFixed(2)} unit="cm³" />
                  <ResultItem label={t('Section modulus Wy')} value={results.Wy.toFixed(2)} unit="cm³" />
                  <ResultItem label={t('Neutral axis Yc')} value={results.Yc.toFixed(2)} unit="cm" />
                  <ResultItem label={t('Bending moment Mx')} value={results.M_x.toExponential(2)} unit="kg.cm" />
                  <ResultItem label={t('Stress sigma_u')} value={results.sigma_u.toFixed(2)} unit="kg/cm²" />
                  <ResultItem label={t('Deflection f')} value={results.f.toFixed(3)} unit="cm" />
                  <ResultItem label={t('selfWeight')} value={results.beamSelfWeight.toFixed(1)} unit="kg" />
                </div>
              </CollapsibleSection>

              {diagramData && (
                <CollapsibleSection title={t('Analysis diagrams')} icon={AreaChart}>
                  <div className="grid grid-cols-1 gap-8">
                    <InternalForceDiagram
                      data={diagramData}
                      title={t('Internal Force Diagram (Bending Moment)')}
                      yKey="moment"
                      unit="kg.cm"
                    />
                    <InternalForceDiagram
                      data={diagramData}
                      title={t('Internal Force Diagram (Shear Force)')}
                      yKey="shear"
                      unit="kg"                          
                      stiffenerMarkers={stiffenerLayout && stiffenerLayout.required ? { positions: stiffenerLayout.positions, span: stiffenerLayout.span } : undefined}
                    />
                    <StressDistributionDiagram inputs={convertVBeamToBeamInputs(inputs)} results={results} />
                    <DeflectedShapeDiagram inputs={convertVBeamToBeamInputs(inputs)} results={results} />
                  </div>
                </CollapsibleSection>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
