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
  RotateCcw
} from 'lucide-react';
import type { BeamInputs, CalculationResults, DiagramData, MaterialType } from '../types';
import { MATERIAL_LIBRARY, MATERIAL_LABELS } from '../utils/materials';
import { calculateBeamProperties, generateDiagramData } from '../services/calculationService';
// Lazy-load AI client on demand to avoid pulling heavy SDK on first load
import { useTranslation } from 'react-i18next';
import { HamsterLoader } from './Loader';
import { InternalForceDiagram } from './InternalForceDiagram';
import { StressDistributionDiagram } from './StressDistributionDiagram';
import { DeflectedShapeDiagram } from './DeflectedShapeDiagram';
import { PDFExportButton } from './PDFReport';

import { BeamCrossSection } from './BeamCrossSection';
import { DoubleBeamCalculator } from './DoubleBeamCalculator';
import { VBeamCalculator } from './VBeamCalculator';
import { EdgeBeamCalculator } from './EdgeBeamCalculator';
import { multiplyForDisplay } from '../utils/display';

const MIN_LOADER_DURATION_MS = 4_000;

const defaultInputs: BeamInputs = {
  b: 600,
  h: 900,
  t1: 30,
  t2: 30,
  t3: 15,
  b1: 400,
  b3: 600,
  L: 800,
  A: 0,
  C: 0,
  P_nang: 15000,
  P_thietbi: 5000,
  sigma_allow: 1650,
  sigma_yield: 2450,
  E: 2.1e6,
  nu: 0.3,
  q: 20,
  materialType: 'SS400',
};

const defaultIBeamInputs: BeamInputs = {
  b: 150,      // Flange width b (mm) - typical for rolled I-beam
  h: 300,      // Total height H (mm)  
  t1: 10,      // Bottom flange thickness (mm)
  t2: 10,      // Top flange thickness (mm)
  t3: 6,       // Web thickness tw (mm)
  b1: 350,     // (kept for compatibility)
  b3: 150,     // (same as b for compatibility)
  L: 600,      // Beam span L (cm)
  A: 0,
  C: 0,
  P_nang: 10000,
  P_thietbi: 3000,
  sigma_allow: 1650,
  sigma_yield: 2450,
  E: 2.1e6,
  nu: 0.3,
  q: 20,
  materialType: 'SS400',
};

// Return translation KEYS, not translated strings; UI will call t(key) when rendering
const getInputConfig = (t: (key: string, opts?: any) => string) => [
  {
    title: 'Section geometry',
    icon: Scale,
    fields: [
      { name: 'b', label: 'calculator.bottomFlangeWidthB1Short', unit: 'mm' },
      { name: 't1', label: 'calculator.bottomFlangeThicknessT1', unit: 'mm' },
      { name: 'b3', label: 'calculator.topFlangeWidthB2', unit: 'mm' },
      { name: 't2', label: 'calculator.topFlangeThicknessT2', unit: 'mm' },
      { name: 'b1', label: 'calculator.webSpacingB2', unit: 'mm' },
      { name: 't3', label: 'calculator.webThicknessT3', unit: 'mm' },
      { name: 'h', label: 'calculator.beamHeightH', unit: 'mm' },
      { name: 'L', label: 'calculator.spanLengthL', unit: 'cm' },
      { name: 'A', label: 'endCarriageWheelCenterA', unit: 'mm' },
      { name: 'C', label: 'endInclinedSegmentC', unit: 'mm' },
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

const getIBeamInputConfig = (t: (key: string, opts?: any) => string) => [
  {
    title: 'Section geometry',
    icon: Scale,
    fields: [
      // Standard I-beam parameters
      { name: 'b', label: 'calculator.flangeWidthB', unit: 'mm' },
      { name: 't1', label: 'calculator.bottomFlangeThicknessT1', unit: 'mm' },
      { name: 't2', label: 'calculator.topFlangeThicknessT2', unit: 'mm' },
      { name: 't3', label: 'calculator.webThicknessT3', unit: 'mm' }, // UI label t3, data field t3
      { name: 'h', label: 'calculator.beamHeightH', unit: 'mm' },
      { name: 'L', label: 'calculator.beamSpanL', unit: 'cm' },
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

type BeamType = 'single-girder' | 'double-girder' | 'i-beam' | 'v-beam' | 'edge-beam';

type PreviewSection = {
  title: string;
  icon: React.FC<any>;
  description?: string;
  items: string[];
};

type BeamTab = {
  id: BeamType;
  label: string;
  subLabel: string;
  description: string;
  status: 'available' | 'preview';
  icon: React.FC<any>;
  previewSections?: PreviewSection[];
  highlights?: string[];
};

  const beamTabs: BeamTab[] = [
    {
      id: 'single-girder',
      label: 'Single girder',
      subLabel: 'Live module',
      description: 'Design single girder crane beams with geometry, loading, and safety checks.',
      status: 'available',
      icon: Scale,
      highlights: [
        'Complete geometry and load inputs',
        'Stress, deflection, and buckling verification',
        'PDF reporting with diagrams',
      ],
    },
    {
      id: 'double-girder',
      label: 'Double girder',
      subLabel: 'Live module',
      description: 'Design double girder crane beams with geometry, loading, and safety checks.',
      status: 'available',
      icon: HardHat,
      highlights: [
        'Complete geometry and load inputs for double girders',
        'Girder spacing and load distribution analysis',
        'Stress, deflection, and buckling verification',
      ],
    },
    {
      id: 'i-beam',
      label: 'Rolled I-beam',
      subLabel: 'Live module',
      description: 'Design rolled I-beam crane beams with standard section properties.',
      status: 'available',
      icon: BarChart,
      highlights: [
        'Standard rolled I-section geometry',
        'Stress, deflection, and buckling verification',
        'PDF reporting with diagrams',
      ],
    },
    {
      id: 'v-beam',
      label: 'V-type beam',
      subLabel: 'Live module',
      description: 'Design V-type crane beams with asymmetric geometry and specialized load paths.',
      status: 'available',
      icon: AreaChart,
      highlights: [
        'V-beam specific geometry and parameters',
        'Stress, deflection, and buckling verification',
        'PDF reporting with diagrams',
      ],
    },
    {
      id: 'edge-beam',
      label: 'Edge beam',
      subLabel: 'Live module',
      description: 'Calculate edge beam loads, contact stress, resistance force and motor power for crane travel mechanism.',
      status: 'available',
      icon: AreaChart,
      highlights: [
        'Wheel load distribution calculation',
        'Contact stress verification',
        'Drive motor power calculation',
        'Wheel-rail adhesion check',
      ],
    },
  ];

const BeamTypeTabs: React.FC<{ active: BeamType; onChange: (type: BeamType) => void }> = ({ active, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Ensure all tabs have identical width and height across modules */}
      <div className="flex flex-col sm:flex-row items-stretch sm:divide-x sm:divide-gray-200 dark:sm:divide-gray-700">
        {beamTabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex-1 h-full min-h-[72px] sm:min-h-[84px] text-left px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3 h-full">
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base">{t(tab.label)}</span>
                    {tab.status === 'preview' && (
                      <span
                        className={`text-xs font-medium uppercase tracking-wide rounded-full border px-2 py-0.5 ${
                          isActive ? 'border-white/60 text-white/80' : 'border-blue-400 text-blue-600'
                        }`}
                      >
                        {t('Preview')}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs sm:text-sm ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {t(tab.subLabel)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ComingSoonPanel: React.FC<{ tab: BeamTab }> = ({ tab }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-900 border border-dashed border-blue-400/50 dark:border-blue-400/40 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <tab.icon className="w-6 h-6 text-blue-500" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('calculator.moduleTitle', { module: t(tab.label) })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t(tab.subLabel)}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t(tab.description)}</p>
      {tab.highlights && tab.highlights.length > 0 && (
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
          {tab.highlights.map((item) => (
            <li key={item}>{t(item)}</li>
          ))}
        </ul>
      )}
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/60 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
        <HelpCircle className="w-3 h-3" />
        {t('calculator.designPhase')}
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{ title: string | React.ReactNode; icon: React.FC<any>; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon: Icon, children, defaultOpen = true }) => {
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

export const CraneBeamCalculator: React.FC = () => {
  const [beamType, setBeamType] = useState<BeamType>('single-girder');
  const [inputs, setInputs] = useState<BeamInputs>(defaultInputs);
  const [inputStrings, setInputStrings] = useState<Partial<Record<keyof BeamInputs, string>>>(() => {
    const map: Partial<Record<keyof BeamInputs, string>> = {};
    (Object.keys(defaultInputs) as (keyof BeamInputs)[]).forEach((k) => {
      map[k] = String((defaultInputs as any)[k] ?? '');
    });
    return map;
  });
  const [materialType, setMaterialType] = useState<MaterialType>(defaultInputs.materialType || 'SS400');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCallingAI, setIsCallingAI] = useState<boolean>(false);

  const activeTab = beamTabs.find((tab) => tab.id === beamType) ?? beamTabs[0];
  const isPrimaryModule = activeTab.status === 'available';

  useEffect(() => {
    setResults(null);
    setDiagramData(null);
    setRecommendation('');
    setIsLoading(false);
    setIsCallingAI(false);
    
    // Set default inputs based on beam type
    if (beamType === 'i-beam') {
      setInputs(defaultIBeamInputs);
      const map: Partial<Record<keyof BeamInputs, string>> = {};
      (Object.keys(defaultIBeamInputs) as (keyof BeamInputs)[]).forEach((k) => {
        map[k] = String((defaultIBeamInputs as any)[k] ?? '');
      });
      setInputStrings(map);
      setMaterialType(defaultIBeamInputs.materialType || 'SS400');
    } else if (beamType === 'single-girder') {
      setInputs(defaultInputs);
      const map: Partial<Record<keyof BeamInputs, string>> = {};
      (Object.keys(defaultInputs) as (keyof BeamInputs)[]).forEach((k) => {
        map[k] = String((defaultInputs as any)[k] ?? '');
      });
      setInputStrings(map);
      setMaterialType(defaultInputs.materialType || 'SS400');
    }
  }, [beamType]);

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
    const raw = inputStrings[name as keyof BeamInputs] ?? '';
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
    // Cập nhật inputStrings để hiển thị giá trị mới trong UI
    setInputStrings((prev) => {
      if (type === 'CUSTOM') {
        return { ...prev, materialType: type };
      }
      const mat = MATERIAL_LIBRARY[type];
      return {
        ...prev,
        materialType: type,
        sigma_allow: String(mat.sigma_allow),
        sigma_yield: String(mat.sigma_yield),
        E: String(mat.E),
        nu: String(mat.nu),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPrimaryModule) {
      return;
    }

    setIsLoading(true);
    setResults(null);
    setDiagramData(null);
    setRecommendation('');

    const loaderStart = Date.now();

    try {
      // Sanitize any pending string inputs to numbers before calculation
      const sanitized: BeamInputs = { ...(inputs as any) };
      (Object.keys(sanitized) as (keyof BeamInputs)[]).forEach((k) => {
        const raw = inputStrings[k];
        if (typeof raw === 'string') {
          const n = Number(raw.replace(',', '.'));
          if (!Number.isNaN(n)) (sanitized as any)[k] = n;
        }
      });
      setInputs(sanitized);

      const calcMode = (beamType === 'i-beam') ? 'i-beam' : 'single-girder';
      const calculatedResults = calculateBeamProperties(sanitized, calcMode);
      const newDiagramData = generateDiagramData(sanitized, calculatedResults);

      setResults(calculatedResults);
      setDiagramData(newDiagramData);

      const hasFailed =
        calculatedResults.stress_check === 'fail' ||
        calculatedResults.deflection_check === 'fail' ||
        calculatedResults.buckling_check === 'fail';

      if (hasFailed) {
        setIsCallingAI(true);
        const { getDesignRecommendation } = await import('../services/geminiService');
        const geminiRec = await getDesignRecommendation(inputs, calculatedResults);
        setRecommendation(geminiRec);
        setIsCallingAI(false);
      }
    } catch (error) {
      console.error('Calculation Error:', error);
      setRecommendation(t('calculator.error'));
      setIsCallingAI(false);
    } finally {
      const elapsed = Date.now() - loaderStart;
      if (elapsed < MIN_LOADER_DURATION_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADER_DURATION_MS - elapsed));
      }
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const defaultValues = beamType === 'i-beam' ? defaultIBeamInputs : defaultInputs;
    setInputs(defaultValues);
    const map: Partial<Record<keyof BeamInputs, string>> = {};
    (Object.keys(defaultValues) as (keyof BeamInputs)[]).forEach((k) => {
      map[k] = String((defaultValues as any)[k] ?? '');
    });
    setInputStrings(map);
    setMaterialType(defaultValues.materialType || 'SS400');
    setResults(null);
    setDiagramData(null);
    setRecommendation('');
    setIsLoading(false);
    setIsCallingAI(false);
  };

  const { t } = useTranslation();

  const geometricBalanceItems = React.useMemo(() => {
    const items: { key: string; label: string; status: 'pass' | 'fail'; value: string }[] = [];
    if (!results || beamType !== 'single-girder') return items;

    const H_cm = inputs.h / 10;
    const L_cm = inputs.L; // already in cm
    const b1_cm = inputs.b / 10; // bottom flange width (label b1)
    const body_cm = inputs.b1 / 10; // web spacing (labelled as body width)
    // A and C inputs are now in mm on the UI; convert to cm for checks
    const A_cm = inputs.A / 10;
    const C_cm = inputs.C / 10;
    
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
        // If not provided, mark as fail with increase suggestion to reach min
        items.push({ key, label, status: 'fail', value: t('increaseByPct', { pct: '100.0' }) });
      } else {
        items.push({ key, label, status: 'pass', value: t('meetsCriterion') });
      }
    };

    // Single girder specific geometric balance checks
    // 1) H = 1/18 .. 1/14 of L
    assess('H', t('Beam height H'), H_cm, L_cm, 1 / 18, 1 / 14);
    // 2) b1 (bottom flange width) = 1/3 .. 1/2 of H
    assess('b1', t('calculator.bottomFlangeWidthB1Short'), b1_cm, H_cm, 1 / 3, 1 / 2);
    // 3) web spacing b2 (data field b1) = 1/50 .. 1/40 of L
    assess('web-spacing-b1', t('calculator.webSpacingB2'), body_cm, L_cm, 1 / 50, 1 / 40);
    // 4) A = 1/7 .. 1/5 of L
    assess('A', t('endCarriageWheelCenterA'), A_cm, L_cm, 1 / 7, 1 / 5);
    // 5) C = 0.10 .. 0.15 of L
    assess('C', t('endInclinedSegmentC'), C_cm, L_cm, 0.10, 0.15);

    return items;
  }, [inputs, results, t, beamType]);

  const stiffenerLayout = React.useMemo(() => {
    if (!results?.stiffener || !results.stiffener.required || results.stiffener.count <= 0) {
      return undefined;
    }

    const { optimalSpacing, count } = results.stiffener;
    const span_cm = inputs.L; // Nhịp dầm, đơn vị cm
    const spacing_cm = optimalSpacing / 10; // Bước sườn, đổi từ mm sang cm
    const newPositions: number[] = [];

    // Tính toán khoảng trống ở hai đầu dầm để căn giữa khối sườn
    // Dựa trên công thức: (L - (số lượng sườn - 1) * bước sườn) / 2
    // (count - 1) vì có `count` sườn sẽ tạo ra `count - 1` khoảng cách
    const totalStiffenerBlockLength = (count - 1) * spacing_cm;
    const firstStiffenerPos = (span_cm - totalStiffenerBlockLength) / 2;

    // Tạo mảng vị trí các sườn
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

  const activeInputKey = !results && typeof document !== 'undefined'
    ? (Object.keys(inputStrings) as (keyof BeamInputs)[]).find((key) => document.activeElement?.id === key)
    : undefined;

  // Render specialized calculators for double-girder and v-beam
  if (beamType === 'double-girder') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <BeamTypeTabs active={beamType} onChange={setBeamType} />
        <DoubleBeamCalculator />
      </div>
    );
  }

  if (beamType === 'v-beam') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <BeamTypeTabs active={beamType} onChange={setBeamType} />
        <VBeamCalculator />
      </div>
    );
  }

  if (beamType === 'edge-beam') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <BeamTypeTabs active={beamType} onChange={setBeamType} />
        <EdgeBeamCalculator />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <BeamTypeTabs active={beamType} onChange={setBeamType} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-1">
          {/* Mobile-only Cross Section Diagram */}
          {isPrimaryModule && !isLoading && !results && (
            <div className="block lg:hidden">
              <CollapsibleSection title={t('Cross-section reference')} icon={Scale}>
                <div id="cross-section-diagram-mobile">
                  <BeamCrossSection
                    inputs={inputs}
                    activeInput={activeInputKey}
                    beamType={beamType as 'single-girder' | 'i-beam'}
                    stiffenerLayout={stiffenerLayout}
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}
          {isPrimaryModule ? (
            (beamType === 'i-beam' ? getIBeamInputConfig(t) : getInputConfig(t)).map(({ title, icon, fields }) => (
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
                    {/* Removed auto-fill hint per request */}
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
            ))
          ) : activeTab.previewSections && activeTab.previewSections.length > 0 ? (
            activeTab.previewSections.map((section) => (
              <CollapsibleSection key={section.title} title={t(section.title)} icon={section.icon}>
                {section.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t(section.description)}</p>
                )}
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {section.items.map((item) => (
                    <li key={item}>{t(item)}</li>
                  ))}
                </ul>
              </CollapsibleSection>
            ))
          ) : (
              <CollapsibleSection title={t('calculator.modulePreview')} icon={HelpCircle}>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('calculator.modulePreviewDescription')}
                </p>
              </CollapsibleSection>
          )}

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
              disabled={!isPrimaryModule || isLoading}
              className="calc-button w-1/3 flex justify-center items-center py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1rem)' }}
            >
              {isPrimaryModule
                ? isLoading
                  ? t('calculator.calculating')
                  : t('calculator.calculate')
                : t('calculator.inDesign')}
              {isPrimaryModule && !isLoading && <ChevronsRight className="ml-2 h-5 w-5 flex-shrink-0" />}
            </button>
            <PDFExportButton
              inputs={inputs}
              results={results}
              isLoading={isLoading}
              aiRecommendation={recommendation}
              className={`w-1/3 ${!isPrimaryModule ? 'pointer-events-none opacity-50' : ''}`}
            />
          </div>
          {!isPrimaryModule && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('calculator.calculationsDisabled', { module: t(activeTab.label).toLowerCase() })}
            </p>
          )}
        </form>

        <div className="lg:col-span-2 space-y-8">
          {isPrimaryModule ? (
            <>
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
                      <BeamCrossSection
                        inputs={inputs}
                        activeInput={activeInputKey}
                        beamType={beamType as 'single-girder' | 'i-beam'}
                        stiffenerLayout={stiffenerLayout}
                      />
                    </div>
                  </CollapsibleSection>
                  </div>
              )}

              {!isLoading && results && (
                <>
                  {recommendation && (
                    <div className="bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-start">
                        <Bot className="h-8 w-8 text-blue-500 mr-4 flex-shrink-0" />
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

                  {beamType === 'single-girder' && (
                    <CollapsibleSection 
                      title={
                        <div className="flex items-center gap-2">
                          <span>{t('Geometric balance')}</span>
                          <div className="group relative">
                            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
                            <div className="absolute left-0 top-6 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              <div className="hidden">{t('Geometric balance')}</div>
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
                  )}

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
                        <StressDistributionDiagram inputs={inputs} results={results} />
                        <DeflectedShapeDiagram inputs={inputs} results={results} />
                      </div>
                    </CollapsibleSection>
                  )}
                </>
              )}
            </>
          ) : (
            <ComingSoonPanel tab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
};
