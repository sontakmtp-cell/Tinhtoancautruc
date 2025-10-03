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
  // Note: For V-beam with load on bottom flange:
  // - sigma_top_compression actually represents tension stress at top fiber
  // - sigma_bottom_tension actually represents compression stress at bottom fiber
  // This is corrected in calculateVBeamProperties return values
  const Yc_mm = Yc * 10;
  const isIBeam = (results as any)?.calculationMode === 'i-beam';

  useEffect(() => {
    if (!chartRef.current || typeof Plotly === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    const mobileMargin = { l: 35, r: 10, b: 40, t: 40, pad: 2 };
    const desktopMargin = { l: 60, r: 20, b: 50, t: 50, pad: 4 };
    const mobileFontSize = 9;
    const desktopFontSize = 10;
    const isDarkMode = document.documentElement.classList.contains('dark');
    const traces = [];
    const shapes = [];

    // --- Cross-section ---
    const crossSectionColor = isDarkMode ? 'rgba(75, 85, 99, 0.7)' : 'rgba(209, 213, 219, 1)';
    const crossSectionLineColor = isDarkMode ? 'rgba(107, 114, 128, 1)' : 'rgba(107, 114, 128, 1)';
    const topFlangeWidth = isIBeam ? b : b3;
    
    // Convert actual dimensions to display coordinates
    const yToDisplay = (y: number) => y * scale;
    
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
    const xOffset = -scaledTotalWidth / 2 - (isMobile ? 20 : 40); // Offset to the left

    // Y coordinates are relative to the bottom of the beam (y=0)
    const y_bottom_flange_top = t1;
    const y_top_flange_bottom = h - t2;

    // Top flange
    shapes.push({ type: 'rect', x0: xOffset - s.b3 / 2, y0: y_top_flange_bottom, x1: xOffset + s.b3 / 2, y1: h, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
    // Bottom flange
    shapes.push({ type: 'rect', x0: xOffset - s.b / 2, y0: 0, x1: xOffset + s.b / 2, y1: y_bottom_flange_top, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
    // Web(s)
    if (isIBeam) {
      const web_height = h - t1 - t2;
      shapes.push({ type: 'rect', x0: xOffset - s.t3 / 2, y0: y_bottom_flange_top, x1: xOffset + s.t3 / 2, y1: y_top_flange_bottom, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
    } else {
      // Left web
      const web_left_x0 = xOffset - s.b1 / 2 - s.t3;
      const web_left_x1 = xOffset - s.b1 / 2;
      shapes.push({ type: 'rect', x0: web_left_x0, y0: y_bottom_flange_top, x1: web_left_x1, y1: y_top_flange_bottom, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
      // Right web
      const web_right_x0 = xOffset + s.b1 / 2;
      const web_right_x1 = xOffset + s.b1 / 2 + s.t3;
      shapes.push({ type: 'rect', x0: web_right_x0, y0: y_bottom_flange_top, x1: web_right_x1, y1: y_top_flange_bottom, fillcolor: crossSectionColor, line: { width: 1, color: crossSectionLineColor } });
    }

    // --- Stress Diagram ---
    const maxAbsStress = Math.max(sigma_top_compression, sigma_bottom_tension);
    const stressOffset = 20; // Start stress diagram to the right of the cross-section

    // Compression
    traces.push({
      x: [stressOffset, stressOffset - sigma_top_compression, stressOffset],
      y: [Yc_mm, h, h],  // Use actual dimensions
      type: 'scatter', mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(239, 68, 68, 0.2)',
      line: { color: isDarkMode ? '#f87171' : '#ef4444', width: 1.5 },
      hoverinfo: 'none',
    });

    // Tension
    traces.push({
      x: [stressOffset, stressOffset + sigma_bottom_tension, stressOffset],
      y: [Yc_mm, 0, 0],  // Use actual dimensions
      type: 'scatter', mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(59, 130, 246, 0.2)',
      line: { color: isDarkMode ? '#60a5fa' : '#3b82f6', width: 1.5 },
      hoverinfo: 'none',
    });

    // Neutral Axis
    shapes.push({
      type: 'line', x0: xOffset - scaledTotalWidth / 2 - 20, y0: Yc_mm, x1: stressOffset + sigma_bottom_tension + 20, y1: Yc_mm,
      line: { color: isDarkMode ? '#6b7280' : '#6b7280', width: 1, dash: 'dash' }
    });

    const layout = {
      title: {
        text: t('stressDiagram.ariaLabel'),
        font: { color: isDarkMode ? '#e5e7eb' : '#374151', size: 16 },
      },
      xaxis: {
        title: `${t('stressDiagram.unit')}`,
        range: [xOffset - scaledTotalWidth / 2 - (isMobile ? 25 : 40), stressOffset + sigma_bottom_tension + 60],
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
      },
      yaxis: {
        title: `${t('Height')} (mm)`,
        range: [-20, h + 20],  // Use actual height instead of scaled height
        showgrid: false,
        zeroline: false,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
      },
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: isMobile ? mobileMargin : desktopMargin,
      shapes: shapes,
      annotations: [
        // Stress values
        {
          x: stressOffset - sigma_top_compression, y: s.h,
          xref: 'x', yref: 'y',
          text: `-${sigma_top_compression.toFixed(1)} MPa (${t('stressDiagram.compression')})`,
          showarrow: false, ax: isMobile ? -20 : -40, ay: 0, xanchor: 'right',
          font: { color: isDarkMode ? '#f87171' : '#ef4444' }
        },
        {
          x: stressOffset + sigma_bottom_tension, y: 0,
          xref: 'x', yref: 'y',
          text: `+${sigma_bottom_tension.toFixed(1)} MPa (${t('stressDiagram.tension')})`,
          showarrow: false, ax: 40, ay: 0, xanchor: 'left',
          font: { color: isDarkMode ? '#60a5fa' : '#3b82f6' },
        },
        // Neutral axis
        {
          x: xOffset - scaledTotalWidth / 2 - 10, y: Yc_mm * scale,
          xref: 'x', yref: 'y',
          text: `Yc=${(Yc * 10).toFixed(1)} mm`,
          showarrow: false, xanchor: 'right',
          font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: desktopFontSize }
        },
        {
          x: stressOffset, y: Yc_mm * scale,
          xref: 'x', yref: 'y',
          text: 'N.A.',
          showarrow: false, xanchor: 'center', yanchor: 'bottom',
          font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: 10 }
        },
        // Cross-section dimensions (show only on desktop)
        ...(!isMobile ? [
          {
            x: xOffset, y: -10,
            xref: 'x', yref: 'y',
            text: `b = ${b} mm`,
            showarrow: false,
            yanchor: 'top',
            xanchor: 'center',
            font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: desktopFontSize }
          },
          {
            x: xOffset - scaledTotalWidth / 2 - 30, y: h / 2,
            xref: 'x', yref: 'y',
            text: `h = ${h} mm`,
            showarrow: false,
            textangle: -90,
            xanchor: 'center',
            yanchor: 'middle',
            font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: desktopFontSize }
          },
          // Flange and web thicknesses
          {
            x: xOffset + scaledTotalWidth / 2 + 10, y: h,
            xref: 'x', yref: 'y',
            text: `t2 = ${t2} mm`,
            showarrow: false,
            xanchor: 'left',
            font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: desktopFontSize }
          },
          {
            x: xOffset + scaledTotalWidth / 2 + 10, y: 0,
            xref: 'x', yref: 'y',
            text: `t1 = ${t1} mm`,
            showarrow: false,
            xanchor: 'left',
            font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: desktopFontSize }
          },
          ...(isIBeam ? [{
            x: xOffset + s.t3/2 + 5, y: h/2,
            xref: 'x', yref: 'y',
            text: `t3 = ${t3} mm`,
            showarrow: false,
            textangle: 90,
            xanchor: 'center',
            font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: desktopFontSize }
          }] : [
            {
              x: xOffset + s.b1/2 + s.t3 + 5, y: h/2,
              xref: 'x', yref: 'y',
              text: `t3 = ${t3} mm`,
              showarrow: false,
              textangle: 90,
              xanchor: 'center',
              font: { color: isDarkMode ? '#9ca3af' : '#4b5563', size: desktopFontSize }
            }
          ])
        ] : [])
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
