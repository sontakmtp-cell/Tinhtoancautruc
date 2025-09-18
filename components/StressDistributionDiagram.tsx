
import React from 'react';
import type { BeamInputs, CalculationResults } from '../types';

interface DiagramProps {
  inputs: BeamInputs;
  results: CalculationResults;
}

export const StressDistributionDiagram: React.FC<DiagramProps> = ({ inputs, results }) => {
    const { h, b, t1, t2, t3, b1 } = inputs;
    const { Yc, sigma_top_compression, sigma_bottom_tension } = results;
    const Yc_mm = Yc * 10;

    const width = 500;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 20, left: 80 };
    
    const beamScale = (height - padding.top - padding.bottom) / h;
    const scaledH = h * beamScale;
    const scaledB = b * beamScale;
    const scaledT1 = t1 * beamScale;
    const scaledT2 = t2 * beamScale;
    const scaledT3 = t3 * beamScale;
    const scaledB1 = b1 * beamScale;
    const scaledYc = Yc_mm * beamScale;

    const beamX = padding.left + 20;

    const maxStress = Math.max(sigma_top_compression, sigma_bottom_tension);
    const stressScale = maxStress > 0 ? 120 / maxStress : 0;
    const stressX = beamX + scaledB + 40;

    const formatValue = (val: number) => {
        if (Math.abs(val) < 1) return val.toFixed(2);
        return val.toFixed(0);
    }

    return (
        <div id="stress-diagram">
            <h4 className="text-md font-semibold text-center mb-2 text-gray-700 dark:text-gray-300">Stress Distribution Diagram</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-gray-600 dark:text-gray-400" aria-label="Stress distribution diagram on cross section">
                <g transform={`translate(0, ${padding.top})`}>
                    {/* Dimension Lines */}
                    <g className="stroke-current" strokeWidth="0.5">
                        {/* H dimension */}
                        <line x1={padding.left - 50} y1={0} x2={padding.left - 50} y2={scaledH} strokeDasharray="2,2"/>
                        <line x1={padding.left - 55} y1={0} x2={padding.left - 45} y2={0} />
                        <line x1={padding.left - 55} y1={scaledH} x2={padding.left - 45} y2={scaledH} />
                        <text x={padding.left - 60} y={scaledH / 2} textAnchor="end" alignmentBaseline="middle" fontSize="10" className="fill-current">h = {h} mm</text>

                        {/* Yc dimension */}
                        <line x1={padding.left - 20} y1={scaledH - scaledYc} x2={padding.left - 20} y2={scaledH} strokeDasharray="2,2"/>
                        <line x1={padding.left - 25} y1={scaledH - scaledYc} x2={padding.left - 15} y2={scaledH - scaledYc} />
                        <line x1={padding.left - 25} y1={scaledH} x2={padding.left - 15} y2={scaledH} />
                         <text x={padding.left - 25} y={scaledH - scaledYc/2} textAnchor="end" alignmentBaseline="middle" fontSize="10" className="fill-current">Yc = {Yc_mm.toFixed(1)} mm</text>
                    </g>
                    
                    {/* Beam Cross-section */}
                    <g transform={`translate(${beamX}, 0)`} className="fill-gray-200 dark:fill-gray-700 stroke-gray-500 dark:stroke-gray-400" strokeWidth="1">
                        <rect x="0" y="0" width={scaledB} height={scaledT1} />
                        <rect x="0" y={scaledH - scaledT2} width={scaledB} height={scaledT2} />
                        <rect x={(scaledB - scaledB1)/2 - scaledT3} y={scaledT1} width={scaledT3} height={scaledH - scaledT1 - scaledT2} />
                        <rect x={(scaledB + scaledB1)/2} y={scaledT1} width={scaledT3} height={scaledH - scaledT1 - scaledT2} />
                    </g>
                    
                    {/* Neutral Axis */}
                    <line 
                        x1={padding.left - 10} y1={scaledH - scaledYc} 
                        x2={stressX + 130} y2={scaledH - scaledYc} 
                        className="stroke-gray-500 dark:stroke-gray-400" strokeDasharray="3,3" strokeWidth="1" 
                    />
                    <text x={stressX + 135} y={scaledH - scaledYc} textAnchor="start" alignmentBaseline="middle" fontSize="10" className="fill-current">Neutral Axis</text>

                    {/* Stress Diagram */}
                    <g transform={`translate(${stressX}, 0)`}>
                        {/* Vertical line */}
                        <line x1="0" y1="0" x2="0" y2={scaledH} className="stroke-current" strokeWidth="0.5" />

                        {/* Compression Area */}
                        <polygon 
                            points={`0,${scaledH - scaledYc} ${-sigma_top_compression * stressScale},0 0,0`}
                            className="fill-red-500/20 stroke-red-500" strokeWidth="1"
                        />
                        <text x={-sigma_top_compression * stressScale - 5} y="10" textAnchor="end" fontSize="10" className="fill-red-500">
                           -{formatValue(sigma_top_compression)} (compression)
                        </text>

                        {/* Tension Area */}
                        <polygon 
                            points={`0,${scaledH - scaledYc} ${sigma_bottom_tension * stressScale},${scaledH} 0,${scaledH}`}
                            className="fill-blue-500/20 stroke-blue-500" strokeWidth="1"
                        />
                         <text x={sigma_bottom_tension * stressScale + 5} y={scaledH - 5} textAnchor="start" fontSize="10" className="fill-blue-500">
                           +{formatValue(sigma_bottom_tension)} (tension)
                        </text>

                         <text x="0" y="-5" textAnchor="middle" fontSize="10" className="fill-current">σ (kg/cm²)</text>
                    </g>
                </g>
            </svg>
        </div>
    );
};







