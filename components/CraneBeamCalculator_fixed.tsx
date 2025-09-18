import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, CheckCircle2, XCircle, ChevronDown, ChevronUp, BarChart, AreaChart, TrendingDown, HelpCircle, HardHat, Scale, ChevronsRight, RotateCcw } from 'lucide-react';
import type { BeamInputs, CalculationResults, DiagramData } from '../types';
import { calculateBeamProperties, generateDiagramData } from '../services/calculationService';
import { getDesignRecommendation } from '../services/geminiService';
import { HamsterLoader } from './Loader';
import { InternalForceDiagram } from './InternalForceDiagram';
import { StressDistributionDiagram } from './StressDistributionDiagram';
import { DeflectedShapeDiagram } from './DeflectedShapeDiagram';
import { PDFExportButton } from './PDFReport';

const BeamGeometryDiagram: React.FC = () => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
            Sơ đồ mặt cắt dầm
        </h3>
        {/* Thay thế URL bên dưới bằng đường dẫn đến hình ảnh của bạn */}
        <img 
            src="https://i.postimg.cc/9Qm1ykCM/Unt1itled.png" 
            alt="Sơ đồ mặt cắt dầm" 
            className="w-full h-auto object-contain rounded-md"
        />
    </div>
);


const MIN_LOADER_DURATION_MS = 2_000;

const defaultInputs: BeamInputs = {
    b: 600, h: 900, t1: 30, t2: 30, t3: 15, b1: 400,
    L: 800, P_nang: 15000, P_thietbi: 5000,
    sigma_allow: 1650, sigma_yield: 2450,
    E: 2.1e6, nu: 0.3, q: 20,
};

const inputConfig: { title: string; icon: React.FC<any>; fields: { name: keyof BeamInputs; label: string; unit: string }[] }[] = [
    {
        title: 'Thuộc tính hình học',
        icon: Scale,
        fields: [
            { name: 'b', label: 'Bề rộng dầm (b)', unit: 'mm' }, 
            { name: 'h', label: 'Chiều cao dầm (H)', unit: 'mm' }, 
            { name: 't1', label: 'Dày cánh trên (t2)', unit: 'mm' }, 
            { name: 't2', label: 'Dày cánh dưới (t1)', unit: 'mm' }, 
            { name: 't3', label: 'Dày sườn bụng (t3)', unit: 'mm' }, 
            { name: 'b1', label: 'Khoảng cách sườn (b2)', unit: 'mm' },
        ],
    },
    {
        title: 'Tải trọng và Vật liệu',
        icon: HardHat,
        fields: [
            { name: 'L', label: 'Khẩu độ dầm', unit: 'cm' }, 
            { name: 'P_nang', label: 'Tải trọng nâng', unit: 'kg' },
            { name: 'P_thietbi', label: 'Tải trọng thiết bị', unit: 'kg' }, 
            { name: 'q', label: 'Tải phân bố', unit: 'kg/cm' },
            { name: 'sigma_allow', label: 'Ứng suất cho phép', unit: 'kg/cm²' }, 
            { name: 'sigma_yield', label: 'Giới hạn chảy', unit: 'kg/cm²' },
            { name: 'E', label: 'Mô-đun đàn hồi', unit: 'kg/cm²' }, 
            { name: 'nu', label: "Hệ số Poisson", unit: '' },
        ]
    }
];

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
    const [inputs, setInputs] = useState<BeamInputs>(defaultInputs);
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
    const [recommendation, setRecommendation] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

            const hasFailed = calculatedResults.stress_check === 'fail' ||
                              calculatedResults.deflection_check === 'fail' ||
                              calculatedResults.buckling_check === 'fail';

            if (hasFailed) {
                const geminiRec = await getDesignRecommendation(inputs, calculatedResults);
                setRecommendation(geminiRec);
            }
        } catch (error) {
            console.error("Calculation Error:", error);
            setRecommendation("Xảy ra lỗi trong quá trình tính toán. Vui lòng thử lại sau.");
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
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-6">
                    {inputConfig.map(({ title, icon, fields }) => (
                         <CollapsibleSection key={title} title={title} icon={icon}>
                            <div className="grid grid-cols-2 gap-4">
                                {fields.map(({ name, label, unit }) => (
                                    <div key={name} className="col-span-2 sm:col-span-1">
                                        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id={name}
                                                name={name}
                                                value={inputs[name]}
                                                onChange={handleChange}
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                                step="any"
                                            />
                                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 dark:text-gray-400">{unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    ))}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-1/4 flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            <RotateCcw className="mr-2 h-5 w-5" />
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-1/2 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Đang tính toán...' : 'Kiểm tra & Tính toán'}
                            <ChevronsRight className="ml-2 h-5 w-5" />
                        </button>
                        <PDFExportButton 
                            inputs={inputs} 
                            results={results}
                            isLoading={isLoading}
                            className="w-1/4"
                        />
                    </div>
                </form>

                <div className="lg:col-span-2 space-y-8">
                    {isLoading && <div className="flex justify-center items-center h-96"><HamsterLoader /></div>}
                    
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

                             <CollapsibleSection title="Kiểm tra An toàn" icon={HardHat}>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <CheckBadge status={results.stress_check} label="Ứng suất" value={`Kσ = ${results.K_sigma.toFixed(2)}`} />
                                    <CheckBadge status={results.deflection_check} label="Độ võng" value={`nf = ${results.n_f.toFixed(2)}`} />
                                    <CheckBadge status={results.buckling_check} label="Ổn định cục bộ" value={`K_b = ${results.K_buckling.toFixed(2)}`} />
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Kết quả Tính toán" icon={BarChart}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <ResultItem label="Diện tích F" value={results.F.toFixed(2)} unit="cm²" />
                                    <ResultItem label="Mô-men quán tính Jx" value={results.Jx.toExponential(2)} unit="cm⁴" />
                                    <ResultItem label="Mô-men quán tính Jy" value={results.Jy.toExponential(2)} unit="cm⁴" />
                                    <ResultItem label="Mô-men kháng uốn Wx" value={results.Wx.toFixed(2)} unit="cm³" />
                                    <ResultItem label="Mô-men kháng uốn Wy" value={results.Wy.toFixed(2)} unit="cm³" />
                                    <ResultItem label="Trọng tâm Yc" value={results.Yc.toFixed(2)} unit="cm" />
                                    <ResultItem label="Tổng mô-men M_x" value={results.M_x.toExponential(2)} unit="kg.cm" />
                                    <ResultItem label="Ứng suất tính toán σ" value={results.sigma_u.toFixed(2)} unit="kg/cm²" />
                                    <ResultItem label="Độ võng tính toán f" value={results.f.toFixed(3)} unit="cm" />
                                </div>
                            </CollapsibleSection>

                           {diagramData && (
                                <CollapsibleSection title="Biểu đồ Phân tích" icon={AreaChart}>
                                    <div className="grid grid-cols-1 gap-8">
                                        <InternalForceDiagram data={diagramData} title="Biểu đồ Nội lực (Mô-men uốn)" yKey="moment" unit="kg.cm" />
                                        <InternalForceDiagram data={diagramData} title="Biểu đồ Nội lực (Lực cắt)" yKey="shear" unit="kg" />
                                        <StressDistributionDiagram inputs={inputs} results={results} />
                                        <DeflectedShapeDiagram inputs={inputs} results={results} />
                                    </div>
                                </CollapsibleSection>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
