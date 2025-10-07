import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  BarChart,
  HardHat,
  Scale,
  ChevronsRight,
  RotateCcw,
  Settings,
  Zap,
  Cog,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HamsterLoader } from './Loader';
import { LoadDistributionChart } from './LoadDistributionChart';
import { ResistanceBreakdownChart } from './ResistanceBreakdownChart';
import { EdgeBeamPDFExportButton } from './EdgeBeamPDFReport';
import { EdgeBeamCrossSection } from './EdgeBeamCrossSection';
import type { EdgeBeamInputs, EdgeBeamResults } from '../types';

const MIN_LOADER_DURATION_MS = 4_000;

// Giá trị mặc định
const defaultEdgeBeamInputs: EdgeBeamInputs = {
  // Thông số cơ bản
  S: 19.7,               // Khẩu độ cầu trục (m)
  x: 2,                // Tâm xe con đến tâm ray dầm biên (m)
  Q: 35000,             // Tải nâng danh định (kg)
  Gx: 1800,             // Trọng lượng xe con (kg)
  Gc: 12000,            // Tự trọng dầm chính (kg)
  z: 2,                // Số bánh ở mỗi đầu dầm chính
  b: 2,                // Số bánh chủ động
  D: 370,              // Đường kính bánh xe (mm)
  B: 80,               // Bề rộng ray (mm)
  v: 40,               // Tốc độ di chuyển (m/min)
  sigma_H_allow: 4500, // Ứng suất tiếp xúc cho phép (kg/cm^2)
  tau_allow: 40,       // Ứng suất cắt cho phép của trục (MPa)
  n_dc: 1450,          // Tốc độ định mức động cơ (rpm)
  i_cyclo: 20,         // Tỉ số truyền động cơ hộp số
  
  // Hệ số truyền động
  eta: 0.9,            // Hiệu suất truyền động tổng
  m: 0.01,             // Hệ số cản ray/gờ nối
  f: 0.001,            // Hệ số lăn
  a: 0.003,            // Độ dốc ray
  K_dyn: 1.1,          // Hệ số khởi động cho tải bánh
};

// Ensure new optional shaft parameters have sensible defaults
// (Using property assignment to avoid brittle diffs with comments/encoding)
// These are used to incorporate bending moment effects in shaft sizing.
// Defaults: no bending (M_b=0), no shock amplification (K_b=K_t=1)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
defaultEdgeBeamInputs.M_b = 0;
// @ts-ignore
defaultEdgeBeamInputs.K_b = 1.0;
// @ts-ignore
defaultEdgeBeamInputs.K_t = 1.0;

type EdgeBeamInputField = {
  name: keyof EdgeBeamInputs;
  label: string;
  unit: string;
};

type EdgeBeamInputSection = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  fields: readonly EdgeBeamInputField[];
};

type EdgeBeamInputStrings = Record<keyof EdgeBeamInputs, string>;

const createInputStringsFromValues = (values: EdgeBeamInputs): EdgeBeamInputStrings =>
  (Object.keys(values) as (keyof EdgeBeamInputs)[]).reduce((acc, key) => {
    acc[key] = String(values[key] ?? '');
    return acc;
  }, {} as EdgeBeamInputStrings);

const isEdgeBeamInputKey = (value: string): value is keyof EdgeBeamInputs =>
  Object.prototype.hasOwnProperty.call(defaultEdgeBeamInputs, value);

// Hàm tính toán dầm biên
const calculateEdgeBeam = (inputs: EdgeBeamInputs): EdgeBeamResults => {
  const span = inputs.S > 0 ? inputs.S : 1;
  const trolleyPosition = Math.max(0, Math.min(inputs.x, span));
  const wheelsPerEnd = inputs.z > 0 ? inputs.z : 1;
  const wheelRadiusMeters = inputs.D > 0 ? (inputs.D / 1000) / 2 : 0; // Convert mm to meters, then to radius
  const efficiency = inputs.eta > 0 ? inputs.eta : 1;
  const contactWidthCm = Math.max(inputs.B / 10, 0); // Convert mm to cm
  const travelSpeed = Math.max(0, inputs.v);
  const motorSpeed = Math.abs(inputs.n_dc);
  const dynamicFactor = Math.max(inputs.K_dyn, 0);
  const railResistance = Math.max(inputs.m, 0);
  const rollingCoefficient = Math.abs(inputs.f);
  const slopeCoefficient = Math.max(inputs.a, 0);

  const P = inputs.Q + inputs.Gx;
  const R_L = inputs.Gc / 2 + (P * (span - trolleyPosition)) / span;
  const R_R = inputs.Gc / 2 + (P * trolleyPosition) / span;
  const N_L = R_L / wheelsPerEnd;
  const N_R = R_R / wheelsPerEnd;
  const N_max = Math.max(N_L, N_R);
  const N_t = dynamicFactor * N_max;

  const wheelDiameterCm = inputs.D / 10; // Convert mm to cm
  const contactFactor = contactWidthCm * wheelDiameterCm;
  const sigma_H = contactFactor > 0 ? 423 * Math.sqrt(N_t / contactFactor) : 0;
  const n_H = sigma_H > 0 ? inputs.sigma_H_allow / sigma_H : 0;

  // 3) Lực cản và tổng lực kéo (kgf) — CHUẨN
  const G_tot = inputs.Q + inputs.Gx + inputs.Gc; // kg
  const f = Math.abs(inputs.f);
  const m = Math.max(inputs.m, 0);
  const a = Math.max(inputs.a, 0);

  const W_roll  = f * G_tot;   // kgf - rolling resistance
  const W_joint = m * G_tot;   // kgf - rail/joint resistance
  const W_slope = a * G_tot;   // kgf - slope resistance
  const W = W_roll + W_joint + W_slope; // kgf - total

  // 4) Công suất động cơ (kW) theo công thức kgf bạn đang dùng
  const eta = Math.min(Math.max(inputs.eta, 1e-3), 1); // (0,1]
  const N_dc = (W * travelSpeed) / (60 * 102 * eta);   // kW

  // 5) Tốc độ bánh và tỉ số truyền
  const n_wheel = inputs.D > 0 ? travelSpeed / (Math.PI * (inputs.D / 1000)) : 0; // Convert mm to meters for calculation
  const i_total = n_wheel > 0 && motorSpeed > 0 ? motorSpeed / n_wheel : 0;
  const i_gear  = inputs.i_cyclo > 0 ? i_total / inputs.i_cyclo : 0;

  // 6) Mô men động cơ và mô men tại bánh (khả dụng)
  const M_dc = motorSpeed > 0 ? (9550 * N_dc) / motorSpeed : 0; // N·m
  const M_shaft = M_dc * i_total * eta;                         // N·m tại bánh

  // 7) Lực kéo yêu cầu mỗi bánh chủ động và mô men yêu cầu
  const b_drive = Math.max(1, Math.floor(inputs.b));
  const r = wheelRadiusMeters; // m
  const F_req_per_wheel_kgf = W / b_drive;             // kgf
  const F_req_per_wheel_N   = F_req_per_wheel_kgf * 9.81; // N
  const T_wheel_req = r > 0 ? F_req_per_wheel_N * r : 0;   // N·m

  // 8) Lực tiếp tuyến (hiển thị) và kiểm tra đủ mô men
  const F_t = r > 0 ? M_shaft / r : 0;                 // N
  const torque_ok = M_shaft >= T_wheel_req;            // boolean cho badge/cảnh báo

  // 9) Đường kính trục tính toán (mm) — dùng NHU CẦU để thiết kế
  const T_design = Math.max(T_wheel_req, 0);           // có thể nhân thêm K_start nếu cần
  // Equivalent torque accounting for bending (ASME): Te = sqrt((Kt*T)^2 + (Kb*M_b)^2)
  // Set Kb = Kt = K_dyn as requested (no separate inputs)
  const K_dyn_factor = Math.max(inputs.K_dyn, 0);
  const Kb = K_dyn_factor;
  const Kt = K_dyn_factor;
  const M_b = Math.max(inputs.M_b ?? 0, 0);
  const T_eq = Math.sqrt((Kt * T_design) * (Kt * T_design) + (Kb * M_b) * (Kb * M_b));
  const d_calculated =
    inputs.tau_allow > 0
      ? Math.pow((16 * T_eq * 1000) / (Math.PI * inputs.tau_allow), 1/3)
      : 0;

  const contact_stress_check = n_H >= 1.2 ? 'pass' : 'fail';
  const minShaftDiameter = 20;
  const shaft_check = d_calculated >= minShaftDiameter ? 'pass' : 'fail';
  const torque_check = torque_ok ? 'pass' : 'fail';

  return {
    P,
    R_L,
    R_R,
    N_L,
    N_R,
    N_max,
    N_t,
    sigma_H,
    n_H,
    G_tot,
    W1: W_roll,
    W2: W_joint,
    W3: W_slope,
    W,
    F_req: F_req_per_wheel_kgf,
    N_dc,
    n_wheel,
    i_total,
    i_gear,
    M_dc,
    M_shaft,
    T_eq,
    M_b,
    F_t,
    d_calculated,
    shaft_check,
    torque_check,
    contact_stress_check
  };
};

// Cấu hình input cho dầm biên
const edgeBeamInputConfig: readonly EdgeBeamInputSection[] = [
  {
    title: 'Basic parameters',
    icon: Scale,
    fields: [
      { name: 'S', label: 'Crane span S', unit: 'm' },
      { name: 'x', label: 'Trolley position x', unit: 'm' },
      { name: 'Q', label: 'Rated load Q', unit: 'kg' },
      { name: 'Gx', label: 'Trolley weight Gx', unit: 'kg' },
      { name: 'Gc', label: 'Main beam self-weight Gc', unit: 'kg' }
    ]
  },
  {
    title: 'Drive parameters',
    icon: Settings,
    fields: [
      { name: 'z', label: 'Number of wheels per end z', unit: '-' },
      { name: 'b', label: 'Number of driving wheels b', unit: '-' },
      { name: 'D', label: 'Wheel diameter D', unit: 'mm' },
      { name: 'B', label: 'Wheel rim width B', unit: 'mm' },
      { name: 'v', label: 'Travel speed v', unit: 'm/min' },
      { name: 'sigma_H_allow', label: 'Allowable contact stress', unit: 'kg/cm^2' },
      { name: 'tau_allow', label: 'Allowable shear stress', unit: 'MPa' },
      { name: 'n_dc', label: 'Motor rated speed', unit: 'rpm' },
      { name: 'i_cyclo', label: 'Cyclo gearbox ratio', unit: '-' }
    ]
  },
  {
    title: 'Drive system coefficients',
    icon: Cog,
    fields: [
      { name: 'eta', label: 'Overall efficiency η', unit: '-' },
      { name: 'm', label: 'Rail resistance coefficient m', unit: '-' },
      { name: 'f', label: 'Rolling coefficient f', unit: '-' },
      { name: 'a', label: 'Rail slope a', unit: '-' },
      { name: 'K_dyn', label: 'Dynamic factor K_dyn', unit: '-' },    ]
  }
];

const getEdgeBeamInputConfig = () => edgeBeamInputConfig;

const CollapsibleSection: React.FC<{
  title: string | React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  defaultOpen?: boolean;
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

export const EdgeBeamCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<EdgeBeamInputs>(defaultEdgeBeamInputs);
  const [inputStrings, setInputStrings] = useState<EdgeBeamInputStrings>(() =>
  createInputStringsFromValues(defaultEdgeBeamInputs)
);
  const [results, setResults] = useState<EdgeBeamResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCallingAI, setIsCallingAI] = useState<boolean>(false);
  const [showTableModal, setShowTableModal] = useState<boolean>(false);

  const { t } = useTranslation();

  // Track active input for highlighting in diagram
  const activeInputKey = !results && typeof document !== 'undefined'
    ? (Object.keys(inputStrings) as (keyof EdgeBeamInputs)[]).find((key) => document.activeElement?.id === key)
    : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  if (!isEdgeBeamInputKey(name)) {
    return;
  }

  const key = name;
  setInputStrings((prev) => ({ ...prev, [key]: value }));

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
      setInputs((prev) => ({ ...prev, [key]: numValue }));
    }
  }
};

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  const { name } = e.target;
  if (!isEdgeBeamInputKey(name)) {
    return;
  }

  const key = name;
  const raw = inputStrings[key];
  const normalized = raw.replace(',', '.');
  const numValue = Number(normalized);

  if (!Number.isNaN(numValue) && numValue >= 0) {
    setInputs((prev) => ({ ...prev, [key]: numValue }));
    setInputStrings((prev) => ({ ...prev, [key]: String(numValue) }));
  } else {
    setInputStrings((prev) => ({ ...prev, [key]: String(inputs[key]) }));
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setResults(null);

    const loaderStart = Date.now();
    
    try {
      const calcResults = calculateEdgeBeam(inputs);
      setResults(calcResults);
    } catch (error) {
      console.error('Edge Beam Calculation Error:', error);
    } finally {
      const elapsed = Date.now() - loaderStart;
      if (elapsed < MIN_LOADER_DURATION_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADER_DURATION_MS - elapsed));
      }
      setIsLoading(false);
    }
  };

  const handleReset = () => {
  setInputs({ ...defaultEdgeBeamInputs });
  setInputStrings(createInputStringsFromValues(defaultEdgeBeamInputs));
  setResults(null);
  setIsLoading(false);
  setIsCallingAI(false);
};

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-1">
          {/* Mobile-only Crane Diagram */}
          {!isLoading && !results && (
            <div className="block lg:hidden">
              <CollapsibleSection title={t('Crane reference diagram')} icon={Scale}>
                <div id="crane-diagram-mobile">
                  <EdgeBeamCrossSection
                    inputs={inputs}
                    activeInput={activeInputKey}
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Input Sections */}
          {getEdgeBeamInputConfig().map((config) => {
            const { title, icon, fields } = config;
            return (
              <CollapsibleSection key={title} title={t(title)} icon={icon}>
                <div className="grid grid-cols-2 gap-4">
                  {fields.map(({ name, label, unit }) => {
                  const inputValue = inputStrings[name];
                  
                  // Nếu là trường i_cyclo, render cả input và nút Bảng tra cùng hàng
                  if (name === 'i_cyclo') {
                    return (
                      <React.Fragment key={name}>
                        <div className="col-span-2 sm:col-span-1 calc-field">
                          <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <span>{t(label)}</span>
                              <div className="group relative">
                                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
                                <div className="absolute left-0 top-6 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-pre-line">
                                  <div>{t('calculator.tooltip.i_cyclo')}</div>
                                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                              </div>
                            </div>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              id={name}
                              name={name}
                              value={inputValue}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="input mb-2"
                              step="any"
                              inputMode="decimal"
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-300 pointer-events-none">
                              {unit}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1 calc-field">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bảng tra cứu
                          </label>
                          <div className="group relative -mt-5">
                            <button
                              type="button"
                              onClick={() => setShowTableModal(true)}
                              className="w-full h-[42px] inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors duration-200 cursor-pointer"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Bảng tra
                            </button>
                            {/* Desktop hover tooltip */}
                            <div className="hidden md:block absolute left-1/2 top-full mt-2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              <img 
                                src="/bang tra.png" 
                                alt="Bảng tra cứu"
                                className="max-w-2xl max-h-[768px] object-contain shadow-2xl rounded-lg border border-gray-300 dark:border-gray-600"
                              />
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-300 dark:border-gray-600 rotate-45"></div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <div key={name} className="col-span-2 sm:col-span-1 calc-field">
                      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <span>{t(label)}</span>
                          {(name === 'm' || name === 'x' || name === 'f' || name === 'K_dyn') && (
                            <div className="group relative">
                              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
                              <div className="absolute left-0 top-6 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-pre-line">
                                {name === 'm' && <div>{t('calculator.tooltip.m')}</div>}
                                {name === 'x' && <div>{t('calculator.tooltip.x')}</div>}
                                {name === 'f' && <div>{t('calculator.tooltip.f')}</div>}
                                {name === 'K_dyn' && <div>{t('calculator.tooltip.K_dyn')}</div>}
                                {/* no M_b tooltip as input removed */}
                                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id={name}
                          name={name}
                          value={inputValue}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="input mb-2"
                          step="any"
                          inputMode="decimal"
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
            );
          })}

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
            <EdgeBeamPDFExportButton
              inputs={inputs}
              results={results}
              isLoading={isLoading}
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
            <>
              <div className="hidden lg:block">
                <CollapsibleSection title={t('Crane reference diagram')} icon={Scale}>
                  <div id="crane-diagram">
                    <EdgeBeamCrossSection
                      inputs={inputs}
                      activeInput={activeInputKey}
                    />
                  </div>
                </CollapsibleSection>
              </div>
              
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('Edge Beam Calculator')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('Enter parameters and click Calculate to analyze edge beam loads and motor power.')}
                </p>
              </div>
            </>
          )}

          {!isLoading && results && (
            <>
              {/* Kết luận */}
              <CollapsibleSection title={t('Conclusion')} icon={HardHat}>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <ResultItem label={t('Calculated shaft diameter d')} value={results.d_calculated.toFixed(1)} unit="mm" />
                  <ResultItem label={t('Motor power N_dc')} value={results.N_dc.toFixed(2)} unit="kW" />
                  <ResultItem label={t('Cyclo gearbox to wheel ratio i_gear')} value={results.i_gear.toFixed(2)} unit="-" />
                  <CheckBadge
                    status={results.contact_stress_check}
                    label={t('Wheel strength check')}
                    value={`n_H = ${results.n_H.toFixed(2)}`}
                  />
                </div>
              </CollapsibleSection>

              {/* Tóm tắt tính toán */}
              <CollapsibleSection title={t('Calculation summary')} icon={BarChart}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ResultItem label={t('Concentrated load P')} value={results.P.toFixed(0)} unit="kg" />
                  <ResultItem label={t('Left reaction R_L')} value={results.R_L.toFixed(0)} unit="kg" />
                  <ResultItem label={t('Right reaction R_R')} value={results.R_R.toFixed(0)} unit="kg" />
                  <ResultItem label={t('Max wheel load N_max')} value={results.N_max.toFixed(0)} unit="kg" />
                  <ResultItem label={t('Dynamic wheel load N_t')} value={results.N_t.toFixed(0)} unit="kg" />
                  <ResultItem label={t('Contact stress σ_H')} value={results.sigma_H.toFixed(1)} unit="kg/cm^2" />
                  <ResultItem label={t('Rolling resistance W_roll')} value={results.W1.toFixed(1)} unit="kgf" />
                  <ResultItem label={t('Joint resistance W_joint')} value={results.W2.toFixed(1)} unit="kgf" />
                  <ResultItem label={t('Slope resistance W_slope')} value={results.W3.toFixed(1)} unit="kgf" />
                  <ResultItem label={t('Total resistance W')} value={results.W.toFixed(1)} unit="kgf" />
                  <ResultItem label={t('Wheel speed n_wheel')} value={results.n_wheel.toFixed(2)} unit="rpm" />
                  <ResultItem label={t('Total gear ratio i_total')} value={results.i_total.toFixed(2)} unit="-" />
                  <ResultItem label={t('Motor torque M_dc')} value={results.M_dc.toFixed(1)} unit="N*m" />
                  <ResultItem label={t('Shaft torque M_shaft')} value={results.M_shaft.toFixed(1)} unit="N*m" />
                  <ResultItem label={t('Equivalent torque T_e')} value={results.T_eq.toFixed(1)} unit="N*m" />
                  <ResultItem label={t('Tangential force F_t')} value={results.F_t.toFixed(0)} unit="N" />
                </div>
              </CollapsibleSection>

              {/* Biểu đồ Phân bố Tải trọng theo Vị trí Xe con */}
              <LoadDistributionChart inputs={inputs} />

              {/* Biểu đồ Phân rã Lực cản Tổng */}
              <ResistanceBreakdownChart inputs={inputs} />
            </>
          )}
        </div>
      </div>

      {/* Mobile Modal for Table Display */}
      {showTableModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            // Close modal when clicking outside the content
            if (e.target === e.currentTarget) {
              setShowTableModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-full max-h-full overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bảng tra cứu</h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
              <img 
                src="/bang tra.png" 
                alt="Bảng tra cứu"
                className="w-full h-auto object-contain select-none"
                style={{ 
                  maxWidth: 'calc(100vw - 2rem)', 
                  minWidth: '320px',
                  touchAction: 'pinch-zoom'
                }}
                draggable={false}
              />
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                <span className="inline-block md:hidden">Pinch to zoom • Scroll to navigate</span>
                <span className="hidden md:inline-block">Click outside or press × to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
