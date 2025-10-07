import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Settings, User, Calendar, FolderOpen, Globe } from 'lucide-react';
import type { EdgeBeamInputs, EdgeBeamResults, Language } from '../types';

interface EdgeBeamPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: EdgeBeamInputs;
  results: EdgeBeamResults;
  aiRecommendation?: string;
}

export const EdgeBeamPDFModal: React.FC<EdgeBeamPDFModalProps> = ({
  isOpen,
  onClose,
  inputs,
  results,
  aiRecommendation,
}) => {
  const { t, i18n } = useTranslation();
  const [projectName, setProjectName] = useState(() => t('Edge Beam Drive System Project'));
  const [engineer, setEngineer] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAI, setIncludeAI] = useState(false);
  const [language, setLanguage] = useState<Language>('vi');
  const [isGenerating, setIsGenerating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      console.log('Waiting for all elements to be fully rendered...');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await expandAllDiagramSections();

      console.log('Waiting after expanding sections...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const pdfT = i18n.getFixedT(language);
      // Dynamically import edge beam PDF generator
      const { generateEdgeBeamPDFReport } = await import('../services/edgeBeamPdfService');
      await generateEdgeBeamPDFReport(inputs, results, {
        projectName,
        engineer,
        includeCharts,
        language,
        aiRecommendation: includeAI && aiRecommendation ? aiRecommendation : undefined,
        chartElements: includeCharts
          ? [
              { id: 'load-distribution-chart', title: pdfT('Load Distribution by Trolley Position') },
              { id: 'resistance-breakdown-chart', title: pdfT('Total Resistance Breakdown') },
            ]
          : [],
      });
    } catch (error) {
      console.error('Error generating edge beam PDF:', error);
      alert(t('pdf.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const expandAllDiagramSections = async () => {
    const sections = document.querySelectorAll('[data-section-title]');
    for (const section of sections) {
      const button = section as HTMLButtonElement;
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      if (!isExpanded) {
        button.click();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  };

  if (!isOpen) return null;

  const summaryItems = [
    t('Project Information'),
    t('Input Parameters'),
    t('Calculation Results'),
    t('Safety Checks'),
    t('Overall Assessment'),
  ];
  if (includeCharts) {
    summaryItems.push(t('Load Distribution Analysis'));
    summaryItems.push(t('Resistance Force Analysis'));
  }
  if (includeAI && aiRecommendation) {
    summaryItems.push(t('AI Recommendations'));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start sm:justify-center z-50 p-0 sm:p-4">
      <div ref={modalRef} className="ml-2 sm:ml-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[calc(100vw-2rem)] sm:max-w-md h-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500" />
              {t('Generate Edge Beam Report')}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FolderOpen className="w-4 h-4 inline mr-1" />
              {t('Project Name')}
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder={t('Enter project name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              {t('Design Engineer')}
            </label>
            <input
              type="text"
              value={engineer}
              onChange={(e) => setEngineer(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder={t('Enter engineer name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              {t('Report Language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="en">{t('English')}</option>
              <option value="vi">{t('Vietnamese')}</option>
            </select>
          </div>

          {/* Desktop-only options */}
          <div className="hidden sm:flex items-center">
            <input
              type="checkbox"
              id="includeCharts"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="includeCharts" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('Include Charts')}
            </label>
          </div>

          <div className="hidden sm:flex items-center">
            <input
              type="checkbox"
              id="includeAI"
              checked={includeAI}
              onChange={(e) => setIncludeAI(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="includeAI" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('Include AI Recommendations')}
            </label>
          </div>

          <div className="hidden sm:block bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              {t('Report Contents')}
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {summaryItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            {includeCharts && (
              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('Included Charts')}:
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>→ {t('Load Distribution by Trolley Position')}</li>
                  <li>→ {t('Total Resistance Breakdown')}</li>
                </ul>
              </div>
            )}
          </div>

          <div className="hidden sm:flex text-sm text-gray-500 dark:text-gray-400 items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {t('Created')}: {new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="calc-button flex-1 px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('Generating...')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {t('Generate')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface EdgeBeamPDFExportButtonProps {
  inputs: EdgeBeamInputs;
  results: EdgeBeamResults | null;
  isLoading?: boolean;
  className?: string;
  aiRecommendation?: string;
}

export const EdgeBeamPDFExportButton: React.FC<EdgeBeamPDFExportButtonProps> = ({
  inputs,
  results,
  isLoading = false,
  className = '',
  aiRecommendation,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (!results || isLoading) {
      if (isLoading) {
        alert(t('Please wait for calculations to complete'));
      } else {
        alert(t('Please perform calculations first'));
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
        {t('Export PDF')}
      </button>

      {results && (
        <EdgeBeamPDFModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inputs={inputs}
          results={results}
          aiRecommendation={aiRecommendation}
        />
      )}
    </>
  );
};
