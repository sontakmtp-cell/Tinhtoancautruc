
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BeamInputs, CalculationResults } from '../types';

interface DiagramProps {
  inputs: BeamInputs;
  results: CalculationResults;
}

export const DeflectedShapeDiagram: React.FC<DiagramProps> = ({ inputs, results }) => {
    const { t } = useTranslation();
    const { L } = inputs;
    const { f, f_allow } = results;

    const width = 500;
    const height = 150;
    const padding = { top: 20, right: 20, bottom: 40, left: 20 };
    
    const contentWidth = width - padding.left - padding.right;
    const contentHeight = height - padding.top - padding.bottom;

    // Use a larger scale for visualization, based on length L for proportion
    const verticalScale = f_allow > 0 ? contentHeight / (f_allow * 2) : 1;

    const y_undeflected = padding.top;
    const y_deflected = y_undeflected + f * verticalScale;
    const y_allowable = y_undeflected + f_allow * verticalScale;
    
    // A quadratic Bezier's peak is halfway to its control point's y-value.
    // To make the curve peak at y_deflected, the control point must be twice as far.
    const controlY = 2 * y_deflected - y_undeflected;

    // A simple quadratic curve path for deflection shape
    const deflectedPath = `M ${padding.left},${y_undeflected} Q ${padding.left + contentWidth / 2},${controlY} ${padding.left + contentWidth},${y_undeflected}`;

    const formatValue = (val: number) => val.toPrecision(3);

    return (
        <div id="deflection-diagram">
            <h4 className="text-md font-semibold text-center mb-2 text-gray-700 dark:text-gray-300">{t('Deflected Shape Diagram')}</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-gray-600 dark:text-gray-400" aria-label={t('deflectionDiagram.ariaLabel')}>
                {/* Allowable deflection area */}
                <rect 
                    x={padding.left} 
                    y={y_undeflected} 
                    width={contentWidth} 
                    height={y_allowable - y_undeflected} 
                    className="fill-green-500/10" 
                />
                <line
                    x1={padding.left} y1={y_allowable}
                    x2={width-padding.right} y2={y_allowable}
                    className="stroke-green-500" strokeDasharray="2,2" strokeWidth="1"
                />
                 <text x={width - padding.right + 5} y={y_allowable} alignmentBaseline="middle" fontSize="10" className="fill-green-500">{t('deflectionDiagram.allowable', { value: formatValue(f_allow) })}</text>

                {/* Undeflected beam */}
                <line 
                    x1={padding.left} y1={y_undeflected} 
                    x2={width-padding.right} y2={y_undeflected} 
                    className="stroke-current" strokeDasharray="4,4" strokeWidth="1" 
                />

                {/* Deflected beam */}
                <path d={deflectedPath} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" />
                
                {/* Deflection annotation */}
                <line 
                    x1={width/2} y1={y_undeflected} 
                    x2={width/2} y2={y_deflected} 
                    className="stroke-current" strokeWidth="0.5"
                />
                <path d={`M ${width/2 - 5},${y_deflected - 5} L ${width/2},${y_deflected} L ${width/2 + 5},${y_deflected - 5}`} fill="none" className="stroke-current" strokeWidth="0.5" />
                <text x={width/2 + 5} y={y_undeflected + (y_deflected - y_undeflected)/2} alignmentBaseline="middle" fontSize="10" className="fill-blue-600 dark:fill-blue-400">{t('deflectionDiagram.actual', { value: formatValue(f) })}</text>


                {/* Support triangles */}
                <path d={`M ${padding.left},${y_undeflected} l -7,10 l 14,0 z`} className="fill-current" />
                <path d={`M ${width-padding.right},${y_undeflected} l -7,10 l 14,0 z`} className="fill-current" />

                {/* Length annotation */}
                <line x1={padding.left} y1={height - 25} x2={width - padding.right} y2={height - 25} className="stroke-current" strokeWidth="0.5" />
                <line x1={padding.left} y1={height - 30} x2={padding.left} y2={height - 20} className="stroke-current" strokeWidth="0.5" />
                <line x1={width - padding.right} y1={height - 30} x2={width - padding.right} y2={height - 20} className="stroke-current" strokeWidth="0.5" />
                <text x={width/2} y={height - 10} textAnchor="middle" fontSize="10" className="fill-current">L = {L.toFixed(0)} cm</text>
            </svg>
        </div>
    );
};
