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
import { getDesignRecommendation } from '../services/geminiService';
import { HamsterLoader } from './Loader';
import { InternalForceDiagram } from './InternalForceDiagram';
import { StressDistributionDiagram } from './StressDistributionDiagram';
import { DeflectedShapeDiagram } from './DeflectedShapeDiagram';
import { PDFExportButton } from './PDFReport';
import { useT, useLanguage } from '../utils/i18n';
import { gbT } from '../utils/geometryBalanceI18n';

const BeamGeometryDiagram: React.FC = () => (
  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
      <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
      Cross-section reference
    </h3>
    <img
      src="https://i.postimg.cc/43PbZZ5t/Untitled1.png"
      alt="Example beam cross section"
      className="w-full h-auto object-contain rounded-md"
    />
  </div>
);

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

const inputConfig: { title: string; icon: React.FC<any>; fields: { name: keyof BeamInputs; label: string; unit: string }[] }[] = [
  {
    title: 'Section geometry',
    icon: Scale,
    fields: [
      // Pair 1: Bottom flange width b1 next to Bottom flange thickness (VI label t1 -> code t2)
      { name: 'b', label: 'Bottom flange width b1', unit: 'mm' },
      { name: 't2', label: 'Bottom flange thickness t2', unit: 'mm' },
      // Pair 2: Top flange width (VI label b2 -> code b3) next to Top flange thickness (VI label t2 -> code t1)
      { name: 'b3', label: 'Top flange width b3', unit: 'mm' },
      { name: 't1', label: 'Top flange thickness t1', unit: 'mm' },
      // Pair 3: Web width (VI label b3 -> code b1) next to Web thickness t3
      { name: 'b1', label: 'Web spacing b2', unit: 'mm' },
      { name: 't3', label: 'Web thickness t3', unit: 'mm' },
      // Remaining: Section height h
      { name: 'h', label: 'Section height h', unit: 'mm' },
      // Additional geometry-related distances (now in mm)
      { name: 'A', label: 'End carriage wheel center distance A', unit: 'mm' },
      { name: 'C', label: 'End inclined segment length C', unit: 'mm' },
    ],
  },
  {
    title: 'Loading & material',
    icon: HardHat,
    fields: [
      { name: 'L', label: 'Span length L', unit: 'cm' },
      { name: 'P_nang', label: 'Hoist load', unit: 'kg' },
      { name: 'P_thietbi', label: 'Trolley weight', unit: 'kg' },
      { name: 'sigma_allow', label: 'Allowable stress', unit: 'kg/cm²' },
      { name: 'sigma_yield', label: 'Yield stress', unit: 'kg/cm²' },
      { name: 'E', label: 'Elastic modulus E', unit: 'kg/cm²' },
      { name: 'nu', label: 'Poisson ratio (nu)', unit: '' },
    ],
  },
];

type BeamType = 'single-girder' | 'double-girder' | 'i-beam' | 'v-beam';

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
    subLabel: 'Preview layout',
    description: 'Preview of the upcoming twin-girder workflow with spacing and load sharing controls.',
    status: 'preview',
    icon: HardHat,
    previewSections: [
      {
        title: 'Geometry & spacing',
        icon: Scale,
        description: 'Capture twin girder spacing, plate sizing, and cross tie arrangement.',
        items: [
          'Girder spacing (center to center)',
          'Upper and lower flange plate thickness',
          'Cross tie spacing and detailing',
        ],
      },
      {
        title: 'Load sharing & service',
        icon: HardHat,
        description: 'Define trolley arrangement and distribute crane loads between girders.',
        items: [
          'Wheel load per girder',
          'Crab load distribution factor',
          'Serviceability deflection limit',
        ],
      },
      {
        title: 'Bracing & stability',
        icon: TrendingDown,
        description: 'Plan diaphragms, lateral ties, and torsional restraint checks.',
        items: [
          'Web stiffener spacing',
          'Top lateral bracing member',
          'Torsional restraint class',
        ],
      },
    ],
    highlights: [
      'Dedicated inputs for twin girders and rail alignment',
      'Independent deflection limits per girder',
      'Shared hoist load factors and diaphragm layout',
    ],
  },
  {
    id: 'i-beam',
    label: 'Rolled I-beam',
    subLabel: 'Preview layout',
    description: 'UI mock for selecting standard rolled I sections with combined checks.',
    status: 'preview',
    icon: BarChart,
    previewSections: [
      {
        title: 'Section selection',
        icon: BarChart,
        description: 'Choose catalogue sections or define custom welded profiles.',
        items: [
          'Catalogue profile ID',
          'Section modulus about strong axis',
          'Shear area factors',
        ],
      },
      {
        title: 'Service criteria',
        icon: HelpCircle,
        description: 'Control allowable stress and deflection combinations.',
        items: [
          'Allowable bending stress',
          'Allowable web shear stress',
          'Deflection limit (L/ratio)',
        ],
      },
      {
        title: 'Connections & support',
        icon: HardHat,
        description: 'Document support type and splice locations.',
        items: [
          'Support condition library',
          'Splice location list',
          'Bearing plate thickness',
        ],
      },
    ],
    highlights: [
      'Library of standard rolled sections',
      'Combined bending and shear verification',
      'Connection checklist for splice plates',
    ],
  },
  {
    id: 'v-beam',
    label: 'V-type beam',
    subLabel: 'Preview layout',
    description: 'Preview of asymmetric V-type girder inputs and stability criteria.',
    status: 'preview',
    icon: AreaChart,
    previewSections: [
      {
        title: 'Geometry definition',
        icon: AreaChart,
        description: 'Set leg angle, thickness, and spacing for the V configuration.',
        items: [
          'Leg angle (degrees)',
          'Chord or tie thickness',
          'Panel length / spacing',
        ],
      },
      {
        title: 'Load paths',
        icon: HardHat,
        description: 'Distribute vertical and horizontal loads into the legs.',
        items: [
          'Vertical load split factor',
          'Horizontal guide load',
          'Dynamic amplification factors',
        ],
      },
      {
        title: 'Stability checks',
        icon: HelpCircle,
        description: 'Prepare lateral torsional and local buckling verifications.',
        items: [
          'Lateral restraint spacing',
          'Local buckling reduction factor',
          'Combined stress utilisation target',
        ],
      },
    ],
    highlights: [
      'Asymmetric load path visualisation',
      'Custom leg stiffness modelling',
      'Stability checklist for lateral bracing',
    ],
  },
];

const BeamTypeTabs: React.FC<{ active: BeamType; onChange: (type: BeamType) => void }> = ({ active, onChange }) => {
  const t = useT();
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:divide-x sm:divide-gray-200 dark:sm:divide-gray-700">
        {beamTabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex-1 text-left px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
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
                        Preview
                      </span>
                    )}
                  </div>
                  <p className={`text-xs sm:text-sm ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {tab.subLabel}
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

const ComingSoonPanel: React.FC<{ tab: BeamTab }> = ({ tab }) => (
  <div className="bg-white dark:bg-gray-900 border border-dashed border-blue-400/50 dark:border-blue-400/40 rounded-lg p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <tab.icon className="w-6 h-6 text-blue-500" />
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tab.label} module</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tab.subLabel}</p>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{tab.description}</p>
    {tab.highlights && tab.highlights.length > 0 && (
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
        {tab.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )}
    <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/60 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
      <HelpCircle className="w-3 h-3" />
      Design phase
    </div>
  </div>
);

const CollapsibleSection: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
      <button
        type="button"
        aria-expanded={isOpen}
        data-section-title={title}
        className="w-full flex justify-between items-center p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <Icon className="w-5 h-5 mr-3 text-blue-500" />
          {title}
        </h3>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200 dark:border-gray-700">{children}</div>}
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
  }, [beamType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
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

    if (!isPrimaryModule) {
      return;
    }

    setIsLoading(true);
    setResults(null);
    setDiagramData(null);
    setRecommendation('');

    const loaderStart = Date.now();

    try {
      const calculatedResults = calculateBeamProperties(inputs);
      const newDiagramData = generateDiagramData(inputs, calculatedResults);

      setResults(calculatedResults);
      setDiagramData(newDiagramData);

      const hasFailed =
        calculatedResults.stress_check === 'fail' ||
        calculatedResults.deflection_check === 'fail' ||
        calculatedResults.buckling_check === 'fail';

      if (hasFailed) {
        setIsCallingAI(true);
        const geminiRec = await getDesignRecommendation(inputs, calculatedResults);
        setRecommendation(geminiRec);
        setIsCallingAI(false);
      }
    } catch (error) {
      console.error('Calculation Error:', error);
      setRecommendation('An error occurred during calculation. Please try again.');
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
    setInputs(defaultInputs);
    setResults(null);
    setDiagramData(null);
    setRecommendation('');
    setIsLoading(false);
    setIsCallingAI(false);
  };

  const t = useT();
  const { lang } = useLanguage();

  const geometricBalanceItems = React.useMemo(() => {
    const items: { key: string; label: string; status: 'pass' | 'fail'; value: string }[] = [];
    if (!results) return items;

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
        items.push({ key, label, status: 'fail', value: gbT(lang, 'increaseBy').replace('{pct}', pct.toFixed(1)) });
      } else if (actual > maxVal && actual > 0) {
        const pct = ((actual - maxVal) / actual) * 100;
        items.push({ key, label, status: 'fail', value: gbT(lang, 'decreaseBy').replace('{pct}', pct.toFixed(1)) });
      } else if (actual === 0) {
        // If not provided, mark as fail with increase suggestion to reach min
        items.push({ key, label, status: 'fail', value: gbT(lang, 'increaseBy').replace('{pct}', '100.0') });
      } else {
        items.push({ key, label, status: 'pass', value: gbT(lang, 'meets') });
      }
    };

    // 1) H = 1/18 .. 1/14 of L
    assess('H', lang === 'vi' ? 'Chiều cao dầm H' : 'Beam height H', H_cm, L_cm, 1 / 18, 1 / 14);
    // 2) b1 (bottom flange width) = 1/3 .. 1/2 of H
    assess('b1', lang === 'vi' ? 'Chiều rộng cánh dưới b1' : 'Bottom flange width b1', b1_cm, H_cm, 1 / 3, 1 / 2);
    // 3) body width (web spacing) b3 (UI label maps to b1) = 1/50 .. 1/40 of L
    assess('b3', lang === 'vi' ? 'Rộng thân b3' : 'Body width b3', body_cm, L_cm, 1 / 50, 1 / 40);
    // 4) A = 1/7 .. 1/5 of L
    assess('A', lang === 'vi' ? 'Tâm bánh xe dầm biên A' : 'End carriage wheel center distance A', A_cm, L_cm, 1 / 7, 1 / 5);
    // 5) C = 0.10 .. 0.15 of L
    assess('C', lang === 'vi' ? 'Chiều dài đoạn nghiêng đầu dầm C' : 'End inclined segment length C', C_cm, L_cm, 0.10, 0.15);

    return items;
  }, [inputs, results, t]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <BeamTypeTabs active={beamType} onChange={setBeamType} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-6">
          {isPrimaryModule ? (
            inputConfig.map(({ title, icon, fields }) => (
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
                      <div key={name} className="col-span-2 sm:col-span-1">
                        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(label)}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id={name}
                            name={name}
                            value={inputs[name]}
                            onChange={handleChange}
                            className={`input ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                            step="any"
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
              <CollapsibleSection key={section.title} title={section.title} icon={section.icon}>
                {section.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{section.description}</p>
                )}
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CollapsibleSection>
            ))
          ) : (
              <CollapsibleSection title="Module preview" icon={HelpCircle}>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Detailed input groups for this module will be added soon.
                </p>
              </CollapsibleSection>
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="calc-button w-1/3 flex justify-center items-center py-3 px-4"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Reset
            </button>
            <button
              type="submit"
              disabled={!isPrimaryModule || isLoading}
              className="calc-button w-1/3 flex justify-center items-center py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrimaryModule ? (isLoading ? 'Calculating...' : 'Calculate') : 'In design'}
              {isPrimaryModule && <ChevronsRight className="ml-2 h-5 w-5" />}
            </button>
            <PDFExportButton
              inputs={inputs}
              results={results}
              isLoading={isLoading}
              className={`w-1/3 ${!isPrimaryModule ? 'pointer-events-none opacity-50' : ''}`}
            />
          </div>
          {!isPrimaryModule && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Calculations will be enabled once the {activeTab.label.toLowerCase()} engine is ready.
            </p>
          )}
        </form>

        <div className="lg:col-span-2 space-y-8">
          {isPrimaryModule ? (
            <>
              {isLoading && (
                <div className="flex justify-center items-center h-96">
                  <HamsterLoader
                    messageVi={
                      isCallingAI
                        ? 'Cảnh báo !! Tham số đầu vào không đủ an toàn. Đang tìm giải pháp tối ưu, xin vui lòng đợi trong giây lát...'
                        : 'Đang thực hiện quy trình tính toán...'
                    }
                    messageEn={
                      isCallingAI
                        ? 'Warning! Input parameters may be unsafe. Searching for an optimal solution, please wait...'
                        : 'Performing complex calculations...'
                    }
                  />
                </div>
              )}

              {!isLoading && !results && <BeamGeometryDiagram />}

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

                  <CollapsibleSection title={t('Safety checks')} icon={HardHat}>
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

                  <CollapsibleSection title={gbT(lang, 'geometricBalance')} icon={Scale}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {geometricBalanceItems.map((it) => (
                        <CheckBadge key={it.key} status={it.status} label={it.label} value={it.value} />
                      ))}
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection title={t('Calculation summary')} icon={BarChart}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <ResultItem label={t('Area F')} value={results.F.toFixed(2)} unit="cm^2" />
                      <ResultItem label={t('Moment of inertia Jx')} value={results.Jx.toExponential(2)} unit="cm^4" />
                      <ResultItem label={t('Moment of inertia Jy')} value={results.Jy.toExponential(2)} unit="cm^4" />
                      <ResultItem label={t('Section modulus Wx')} value={results.Wx.toFixed(2)} unit="cm^3" />
                      <ResultItem label={t('Section modulus Wy')} value={results.Wy.toFixed(2)} unit="cm^3" />
                      <ResultItem label={t('Neutral axis Yc')} value={results.Yc.toFixed(2)} unit="cm" />
                      <ResultItem label={t('Bending moment Mx')} value={results.M_x.toExponential(2)} unit="kg.cm" />
                      <ResultItem label={t('Stress sigma_u')} value={results.sigma_u.toFixed(2)} unit="kg/cm²" />
                      <ResultItem label={t('Deflection f')} value={results.f.toFixed(3)} unit="cm" />
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

