import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { BeamInputs, CalculationResults } from '../types';

declare const Plotly: any;

interface DiagramProps {
  inputs: BeamInputs;
  results: CalculationResults;
}

export const StressDistributionDiagram: React.FC<DiagramProps> = ({ inputs, results }) => {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);
  const { h, b, t1, t2, t3, b1 } = inputs;
  const b3 = (inputs as any).b3 !== undefined ? ((inputs as any).b3 as number) : b; // fallback if missing
  const { Yc, sigma_top_compression, sigma_bottom_tension } = results;
  const Yc_mm = Yc * 10;
  const isIBeam = (results as any)?.calculationMode === 'i-beam';

  useEffect(() => {
    if (!chartRef.current || typeof Plotly === 'undefined') return;

    const isDarkMode = document.documentElement.classList.contains('dark');
    const traces = [];
    const shapes = [];

    // --- Cross-section ---
    const crossSectionColor = isDarkMode ? 'rgba(75, 85, 99, 0.7)' : 'rgba(209, 213, 219, 1)';
    const crossSectionLineColor = isDarkMode ? 'rgba(107, 114, 128, 1)' : 'rgba(107, 114, 128, 1)';
    const topFlangeWidth = isIBeam ? b : b3;
    
    // --- Scaling Logic ---
    const totalGeomWidth = Math.max(b, topFlangeWidth);
    const totalGeomHeight = h;
    const desiredHeight = 300; // Target display height for the cross-section
    const scale = desiredHeight / totalGeomHeight;

    const s = {
      h: h * scale,
      b: b * scale,
      t1: t1 * scale,
      t2: t2 * scale,
      t3: t3 * scale,
      b1: b1 * scale,
      b3: (isIBeam ? b : b3) * scale,
    };
    const scaledTotalWidth = totalGeomWidth * scale;
    const xOffset = -scaledTotalWidth / 2 - 40; // Offset to the left

    // Top flange
    shapes.push({ type: 'rect', x0: xOffset - s.b3 / 2, y0: s.h - s.t2, x1: xOffset + s.b3 / 2, y1: s.h, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
    // Bottom flange
    shapes.push({ type: 'rect', x0: xOffset - s.b / 2, y0: 0, x1: xOffset + s.b / 2, y1: s.t1, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
    // Web(s)
    if (isIBeam) {
      shapes.push({ type: 'rect', x0: xOffset - s.t3 / 2, y0: s.t1, x1: xOffset + s.t3 / 2, y1: s.h - s.t2, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
    } else {
      shapes.push({ type: 'rect', x0: xOffset - s.b1 / 2 - s.t3, y0: s.t1, x1: xOffset - s.b1 / 2, y1: s.h - s.t2, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
      shapes.push({ type: 'rect', x0: xOffset + s.b1 / 2, y0: s.t1, x1: xOffset + s.b1 / 2 + s.t3, y1: s.h - s.t2, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
    }

    // --- Stress Diagram ---
    const maxAbsStress = Math.max(sigma_top_compression, sigma_bottom_tension);
    const stressOffset = 20; // Start stress diagram to the right of the cross-section

    // Compression
    traces.push({
      x: [stressOffset, stressOffset - sigma_top_compression, stressOffset],
      y: [Yc_mm * scale, s.h, s.h],
      type: 'scatter', mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(239, 68, 68, 0.2)',
      line: { color: isDarkMode ? '#f87171' : '#ef4444', width: 1.5 },
      hoverinfo: 'none',
    });

    // Tension
    traces.push({
      x: [stressOffset, stressOffset + sigma_bottom_tension, stressOffset],
      y: [Yc_mm * scale, 0, 0],
      type: 'scatter', mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(59, 130, 246, 0.2)',
      line: { color: isDarkMode ? '#60a5fa' : '#3b82f6', width: 1.5 },
      hoverinfo: 'none',
    });

    // Neutral Axis
    shapes.push({
      type: 'line', x0: xOffset - scaledTotalWidth / 2 - 20, y0: Yc_mm * scale, x1: stressOffset + sigma_bottom_tension + 20, y1: Yc_mm * scale,
      line: { color: isDarkMode ? '#6b7280' : '#6b7280', width: 1, dash: 'dash' }
    });

    const layout = {
      title: {
        text: t('stressDiagram.ariaLabel'),
        font: { color: isDarkMode ? '#e5e7eb' : '#374151', size: 16 },
      },
      xaxis: {
        title: `${t('stressDiagram.unit')}`,
        range: [xOffset - scaledTotalWidth / 2 - 20, stressOffset + sigma_bottom_tension + 60],
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
      },
      yaxis: {
        title: 'Height (mm)',
        range: [-20, s.h + 20],
        showgrid: false,
        zeroline: false,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
      },
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 60, r: 20, b: 50, t: 50, pad: 4 },
      shapes: shapes,
      annotations: [
        {
          x: stressOffset - sigma_top_compression, y: s.h,
          xref: 'x', yref: 'y',
          text: `-${sigma_top_compression.toFixed(1)} (${t('stressDiagram.compression')})`,
          showarrow: false, ax: -40, ay: 0, xanchor: 'right',
          font: { color: isDarkMode ? '#f87171' : '#ef4444' }
        },
        {
          x: stressOffset + sigma_bottom_tension, y: 0,
          xref: 'x', yref: 'y',
          text: `+${sigma_bottom_tension.toFixed(1)} (${t('stressDiagram.tension')})`,
          showarrow: false, ax: 40, ay: 0, xanchor: 'left',
          font: { color: isDarkMode ? '#60a5fa' : '#3b82f6' }
        },
        {
          x: xOffset - scaledTotalWidth / 2 - 10, y: Yc_mm * scale,
          xref: 'x', yref: 'y',
          text: `Yc=${Yc_mm.toFixed(1)}`,
          showarrow: false, xanchor: 'right',
          font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: 10 }
        },
        {
          x: stressOffset, y: Yc_mm * scale,
          xref: 'x', yref: 'y',
          text: 'N.A.',
          showarrow: false, xanchor: 'center', yanchor: 'bottom',
          font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: 10 }
        }
      ]
    };

    Plotly.newPlot(chartRef.current, traces, layout, { responsive: true, displayModeBar: false });

    const handleResize = () => {
      if (chartRef.current) {
        Plotly.Plots.resize(chartRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [inputs, results, t]);

  return (
    <div id="stress-diagram" ref={chartRef} className="w-full h-[400px]" />
  );
};
