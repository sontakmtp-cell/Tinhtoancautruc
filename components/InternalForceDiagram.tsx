import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { DiagramData } from '../types';

// Make sure Plotly is available in the global scope
declare const Plotly: any;

interface DiagramProps {
  data: DiagramData;
  title: string;
  yKey: 'shear' | 'moment';
  unit: string;
  stiffenerMarkers?: { positions: number[]; span: number };
}

export const InternalForceDiagram: React.FC<DiagramProps> = ({ data, title, yKey, unit, stiffenerMarkers }) => {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0 || typeof Plotly === 'undefined') {
      return;
    }

    const isDarkMode = document.documentElement.classList.contains('dark');
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d[yKey]);

    const trace = {
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines',
      fill: 'tozeroy',
      line: {
        color: isDarkMode ? '#3b82f6' : '#2563eb', // blue-500 dark / blue-600 light
        width: 2,
      },
      fillcolor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
    };

    const shapes: any[] = [];
    const annotations: any[] = [];
    
    if (stiffenerMarkers && stiffenerMarkers.positions.length > 0) {
      stiffenerMarkers.positions.forEach((pos, index) => {
        // Draw stiffeners at start, end, and in-between.
        if (pos >= 0 && pos <= stiffenerMarkers.span) {
          // Add vertical line for stiffener
          shapes.push({
            type: 'line',
            x0: pos,
            x1: pos,
            y0: Math.min(...yValues),
            y1: Math.max(...yValues),
            line: {
              color: isDarkMode ? '#f87171' : '#ef4444', // red-400 dark / red-500 light
              width: 1,
              dash: 'dot',
            },
          });

          // Add annotation for stiffener position
          annotations.push({
            x: pos,
            y: Math.max(...yValues),
            text: `${t('calculator.stiffenerLabel')} ${index + 1}<br>x = ${pos} cm`,
            showarrow: true,
            arrowhead: 2,
            arrowsize: 1,
            arrowwidth: 1.5,
            ax: 0,
            ay: 40,
            font: { 
              color: isDarkMode ? '#f87171' : '#ef4444',
              size: 12 
            }
          });
        }
      });
    }

    const layout = {
      title: {
        text: title,
        font: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          size: 16,
        },
      },
      xaxis: {
        title: `L (cm)`,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
        gridcolor: isDarkMode ? '#374151' : '#e5e7eb',
      },
      yaxis: {
        title: unit,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
        gridcolor: isDarkMode ? '#374151' : '#e5e7eb',
        zerolinecolor: isDarkMode ? '#4b5563' : '#d1d5db',
      },
      margin: { l: 60, r: 20, b: 50, t: 50, pad: 4 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      showlegend: false,
      shapes: shapes,
      annotations: annotations,
    };

    Plotly.newPlot(chartRef.current, [trace], layout, { responsive: true, displayModeBar: false });

    const handleResize = () => {
      if (chartRef.current) {
        Plotly.Plots.resize(chartRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [data, title, yKey, unit, stiffenerMarkers]);

  // Generate unique ID for PDF capture
  const diagramId = yKey === 'moment' ? 'moment-diagram' : 'shear-diagram';

  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-500">{t('diagram.noData')}</div>;
  }

  return (
    <div id={diagramId} ref={chartRef} className="w-full h-[300px]" />
  );
};
