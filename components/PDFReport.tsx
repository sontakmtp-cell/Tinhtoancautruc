import React, { useState } from 'react';
import { FileText, Download, Settings, User, Calendar, FolderOpen } from 'lucide-react';
import type { BeamInputs, CalculationResults } from '../types';
import { generatePDFReport } from '../services/pdfService';

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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Wait extra time to ensure all calculations and rendering are complete
      console.log('Waiting for all elements to be fully rendered...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Ensure all diagram sections are expanded before generating PDF
      await expandAllDiagramSections();
      
      // Wait additional time after expanding sections
      console.log('Waiting after expanding sections...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await generatePDFReport(inputs, results, {
        projectName,
        engineer,
        includeCharts,
        chartElements: includeCharts ? [
          { id: 'moment-diagram', title: 'Moment Diagram' },
          { id: 'shear-diagram', title: 'Shear Force Diagram' },
          { id: 'stress-diagram', title: 'Stress Distribution Diagram' },
          { id: 'deflection-diagram', title: 'Deflection Diagram' }
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
    try {
      // Find all buttons that might control collapsible sections
      const sectionButtons = document.querySelectorAll<HTMLButtonElement>('button[data-section-title]');
      
      for (const buttonElement of Array.from(sectionButtons)) {
        const text = (buttonElement.dataset.sectionTitle || buttonElement.textContent || '').trim();
        const normalizedText = text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\u00ad/g, '')
          .toLowerCase();

        // Check if this is the analysis diagram section
        const isDiagramSection =
          normalizedText.includes('bieu do') && normalizedText.includes('phan tich');

        if (!isDiagramSection) {
          continue;
        }

        const ariaExpanded = buttonElement.getAttribute('aria-expanded');
        const isCollapsed = ariaExpanded === 'false';

        if (isCollapsed) {
          buttonElement.click();
          console.log(`Expanding section: ${text}`);
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log(`Section already expanded: ${text}`);
        }
      }
      // Also ensure all sections are visible by scrolling them into view
      const chartElements = [
        'moment-diagram',
        'shear-diagram', 
        'stress-diagram',
        'deflection-diagram'
      ];
      
      for (const elementId of chartElements) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.warn('Failed to expand diagram sections:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-500" />
              Generate PDF Report
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
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter project name..."
              />
            </div>

            {/* Engineer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Design Engineer
              </label>
              <input
                type="text"
                value={engineer}
                onChange={(e) => setEngineer(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter engineer name..."
              />
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
                Include analysis diagrams
              </label>
            </div>

            {/* Report Preview Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                Report Contents
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Project and engineer information</li>
                <li>• Input parameters (geometry, loads, materials)</li>
                <li>• Detailed calculation results</li>
                <li>• Safety checks (stress, deflection, stability)</li>
                <li>• Overall assessment and conclusions</li>
                {includeCharts && <li>• Analysis diagrams (forces, stress, deflection)</li>}
              </ul>
            </div>

            {/* Date Info */}
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Created: {new Date().toLocaleDateString('en-US')}
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white rounded-md transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF
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
        className={`flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors ${className}`}
      >
        <FileText className="w-4 h-4 mr-2" />
        Export PDF Report
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


