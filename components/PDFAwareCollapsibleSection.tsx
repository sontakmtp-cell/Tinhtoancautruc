import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { isGlobalPDFGenerating } from '../utils/pdfState';

interface PDFAwareCollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  icon?: React.ElementType;
  className?: string;
}

export const PDFAwareCollapsibleSection: React.FC<PDFAwareCollapsibleSectionProps> = ({
  title,
  children,
  isExpanded,
  onToggle,
  icon: Icon,
  className = '',
}) => {
  const handleToggle = () => {
    // Prevent collapse/expand during PDF generation
    if (isGlobalPDFGenerating()) {
      console.log('[PDF] Section toggle blocked during generation');
      return;
    }
    onToggle();
  };

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 rounded-lg shadow-md transition-colors ${className}`}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        data-section-title={title}
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors disabled:opacity-50"
        disabled={isGlobalPDFGenerating()}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>
      {isExpanded && (
        <div className="p-6 space-y-6">
          {children}
        </div>
      )}
    </div>
  );
};
