import React, { useState } from 'react';
import { FileText, Download, Settings, User, Calendar, FolderOpen, Globe } from 'lucide-react';
import type { BeamInputs, CalculationResults } from '../types';
import { generatePDFReport } from '../services/pdfService';
import { Language } from '../utils/translations';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: BeamInputs;
  results: CalculationResults;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({ 
  isOpen, 
  onClose, 
  inputs, 
  results 
}) => {
  const [projectName, setProjectName] = useState('Crane Beam Calculation Project');
  const [engineer, setEngineer] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      console.log('Waiting for all elements to be fully rendered...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await expandAllDiagramSections();
      
      console.log('Waiting after expanding sections...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await generatePDFReport(inputs, results, {
        projectName,
        engineer,
        includeCharts,
        language,
        chartElements: includeCharts ? [
          { id: 'moment-diagram', title: t('momentDiagram') },
          { id: 'shear-diagram', title: t('shearDiagram') },
          { id: 'stress-diagram', title: t('stressDiagram') },
          { id: 'deflection-diagram', title: t('deflectionDiagram') }
        ] : []
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const expandAllDiagramSections = async () => {
    // ... (existing implementation)
  };

  if (!isOpen) return null;

  const t = (key: string) => {
    const translations: { [lang: string]: { [key: string]: string } } = {
      en: {
        generateReport: "Generate PDF Report",
        projectName: "Project Name",
        enterProjectName: "Enter project name...",
        designEngineer: "Design Engineer",
        enterEngineerName: "Enter engineer name...",
        reportLanguage: "Report Language",
        includeDiagrams: "Include analysis diagrams",
        reportContents: "Report Contents",
        contentProject: "Project and engineer information",
        contentInputs: "Input parameters (geometry, loads, materials)",
        contentResults: "Detailed calculation results",
        contentChecks: "Safety checks (stress, deflection, stability)",
        contentAssessment: "Overall assessment and conclusions",
        contentDiagrams: "Analysis diagrams (forces, stress, deflection)",
        created: "Created",
        cancel: "Cancel",
        generating: "Generating...",
        generate: "Generate PDF",
        export: "Export PDF",
        waitMessage: "Please wait for calculations to complete before generating the report.",
        performMessage: "Please perform calculations before generating the report.",
        momentDiagram: "Moment Diagram",
        shearDiagram: "Shear Force Diagram",
        stressDiagram: "Stress Distribution Diagram",
        deflectionDiagram: "Deflection Diagram",
      },
      vi: {
        generateReport: "Tạo Báo cáo PDF",
        projectName: "Tên dự án",
        enterProjectName: "Nhập tên dự án...",
        designEngineer: "Kỹ sư thiết kế",
        enterEngineerName: "Nhập tên kỹ sư...",
        reportLanguage: "Ngôn ngữ Báo cáo",
        includeDiagrams: "Bao gồm biểu đồ phân tích",
        reportContents: "Nội dung Báo cáo",
        contentProject: "Thông tin dự án và kỹ sư",
        contentInputs: "Thông số đầu vào (hình học, tải trọng, vật liệu)",
        contentResults: "Kết quả tính toán chi tiết",
        contentChecks: "Kiểm tra an toàn (ứng suất, độ võng, ổn định)",
        contentAssessment: "Đánh giá tổng thể và kết luận",
        contentDiagrams: "Biểu đồ phân tích (lực, ứng suất, độ võng)",
        created: "Ngày tạo",
        cancel: "Hủy",
        generating: "Đang tạo...",
        generate: "Tạo PDF",
        export: "Xuất PDF",
        waitMessage: "Vui lòng đợi quá trình tính toán hoàn tất trước khi tạo báo cáo.",
        performMessage: "Vui lòng thực hiện tính toán trước khi tạo báo cáo.",
        momentDiagram: "Biểu đồ mômen uốn",
        shearDiagram: "Biểu đồ lực cắt",
        stressDiagram: "Biểu đồ phân bố ứng suất",
        deflectionDiagram: "Biểu đồ độ võng",
      },
    };
    return translations[language][key] || key;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-500" />
              {t('generateReport')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FolderOpen className="w-4 h-4 inline mr-1" />
                {t('projectName')}
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('enterProjectName')}
              />
            </div>

            {/* Engineer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                {t('designEngineer')}
              </label>
              <input
                type="text"
                value={engineer}
                onChange={(e) => setEngineer(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('enterEngineerName')}
              />
            </div>

            {/* Report Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                {t('reportLanguage')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>

            {/* Include Charts Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeCharts"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="includeCharts" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('includeDiagrams')}
              </label>
            </div>

            {/* Report Preview Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                {t('reportContents')}
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• {t('contentProject')}</li>
                <li>• {t('contentInputs')}</li>
                <li>• {t('contentResults')}</li>
                <li>• {t('contentChecks')}</li>
                <li>• {t('contentAssessment')}</li>
                {includeCharts && <li>• {t('contentDiagrams')}</li>}
              </ul>
            </div>

            {/* Date Info */}
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {t('created')}: {new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="calc-button flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('generating')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t('generate')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PDFExportButtonProps {
  inputs: BeamInputs;
  results: CalculationResults | null;
  isLoading?: boolean;
  className?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({ 
  inputs, 
  results, 
  isLoading = false,
  className = '' 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (!results || isLoading) {
      if (isLoading) {
        alert('Please wait for calculations to complete before generating the report.');
      } else {
        alert('Please perform calculations before generating the report.');
      }
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!results || isLoading}
        className={`calc-button flex items-center justify-center py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1rem)' }}
      >
        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
        Export
      </button>

      {results && (
        <PDFReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inputs={inputs}
          results={results}
        />
      )}
    </>
  );
};
