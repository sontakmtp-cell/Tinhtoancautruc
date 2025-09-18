import React from 'react';
import type { DiagramData } from '../types';

interface DiagramProps {
  data: DiagramData;
  title: string;
  yKey: 'shear' | 'moment';
  unit: string;
}

export const InternalForceDiagram: React.FC<DiagramProps> = ({ data, title, yKey, unit }) => {
    if (!data || data.length === 0) {
        return <div className="text-sm text-gray-500">Không có dữ liệu để vẽ biểu đồ.</div>;
    }

    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    
    const contentWidth = width - padding.left - padding.right;
    const contentHeight = height - padding.top - padding.bottom;

    const xMax = data.length > 0 ? data[data.length - 1].x : 0;
    const yValues = data.map(d => d[yKey]);
    const yMaxAbs = yValues.length > 0 ? Math.max(...yValues.map(Math.abs)) : 0;
    
    // For shear, the diagram spans positive and negative. For moment, it's typically all positive for this load case.
    const yMin = yKey === 'shear' && Math.min(...yValues) < 0 ? -yMaxAbs : 0;
    const yMax = yMaxAbs;

    const xScale = (x: number) => padding.left + (x / xMax) * contentWidth;
    const yScale = (y: number) => {
        if (yMax === yMin) return padding.top + contentHeight / 2; // Avoid division by zero
        return padding.top + contentHeight - ((y - yMin) / (yMax - yMin)) * contentHeight;
    };
    
    const pathData = data.map((d, i) => {
        const x = xScale(d.x);
        const y = yScale(d[yKey]);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');

    const zeroLineY = yScale(0);

    const formatValue = (val: number) => {
        if (Math.abs(val) >= 1e6) return (val / 1e6).toPrecision(3) + 'M';
        if (Math.abs(val) >= 1e3) return (val / 1e3).toPrecision(3) + 'k';
        return val.toFixed(0);
    }

    // Generate unique ID for PDF capture
    const diagramId = yKey === 'moment' ? 'moment-diagram' : 'shear-diagram';
    
    return (
        <div id={diagramId}>
            <h4 className="text-md font-semibold text-center mb-2 text-gray-300">{title}</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-gray-400" aria-label={title}>
                {/* Axes */}
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" strokeWidth="0.5" />
                <line x1={padding.left} y1={zeroLineY} x2={width - padding.right} y2={zeroLineY} stroke="currentColor" strokeWidth="0.5" />

                {/* Grid lines */}
                <line x1={xScale(xMax / 2)} y1={padding.top} x2={xScale(xMax / 2)} y2={height - padding.bottom} stroke="currentColor" strokeDasharray="2,2" opacity="0.3" />

                {/* Path fill */}
                <path d={`${pathData} L ${xScale(xMax)} ${zeroLineY} L ${xScale(0)} ${zeroLineY} Z`} className="text-blue-500" fill="currentColor" fillOpacity="0.1" />

                {/* Path line */}
                <path d={pathData} fill="none" className="text-blue-400" stroke="currentColor" strokeWidth="1.5" />

                {/* Labels */}
                {/* Y-axis labels */}
                {yMax !== yMin && (
                  <>
                    <text x={padding.left - 8} y={yScale(yMax)} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="currentColor">{formatValue(yMax)}</text>
                    <text x={padding.left - 8} y={yScale(yMin)} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="currentColor">{formatValue(yMin)}</text>
                  </>
                )}
                <text x={padding.left - 8} y={zeroLineY} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="currentColor">0</text>
                
                {/* X-axis labels */}
                <text x={padding.left} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="currentColor">0</text>
                <text x={xScale(xMax/2)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="currentColor">L/2</text>
                <text x={width - padding.right} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="currentColor">L={xMax.toFixed(0)}</text>

                {/* Unit label */}
                <text x="10" y="15" fontSize="10" fill="currentColor" className="font-semibold">{unit}</text>
            </svg>
        </div>
    );
};
