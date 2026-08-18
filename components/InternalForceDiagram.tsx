import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { DiagramData } from '../types';
import { useChartTheme } from './chartTheme';
import { usePlotlyReady } from '../utils/loadPlotly';

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
  const theme = useChartTheme();
  const plotlyReady = usePlotlyReady();

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0 || !plotlyReady || typeof Plotly === 'undefined') {
      return;
    }

    const isMobile = window.innerWidth < 768;
    const mobileMargin = { l: 40, r: 15, b: 40, t: 40, pad: 4 };
    const desktopMargin = { l: 60, r: 20, b: 50, t: 50, pad: 4 };
    const mobileFontSize = 10;
    const desktopFontSize = 12;
    const isDarkMode = theme.isDarkMode;
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d[yKey]);
    const peakIndex = yValues.reduce(
      (best, value, index) => Math.abs(value) > Math.abs(yValues[best]) ? index : best,
      0,
    );

    const trace = {
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines',
      fill: 'tozeroy',
      line: {
        color: theme.primary,
        width: 2.5,
      },
      fillcolor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
      hovertemplate: `x = %{x:.1f} cm<br>${title}: %{y:.2f} ${unit}<extra></extra>`,
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
              color: theme.warning,
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
            ax: isMobile ? 0 : 0,
            ay: isMobile ? -30 : -40,
            font: { 
              color: theme.warning,
              size: isMobile ? mobileFontSize : desktopFontSize
            }
          });
        }
      });
    }

    annotations.push({
      x: xValues[peakIndex],
      y: yValues[peakIndex],
      text: `${Math.abs(yValues[peakIndex]).toFixed(2)} ${unit}`,
      showarrow: true,
      arrowhead: 0,
      arrowwidth: 1,
      arrowcolor: theme.primary,
      ax: 0,
      ay: yValues[peakIndex] >= 0 ? -34 : 34,
      bgcolor: isDarkMode ? '#111827' : '#ffffff',
      bordercolor: theme.primary,
      borderpad: 4,
      font: { color: theme.text, size: isMobile ? mobileFontSize : desktopFontSize },
    });

    const layout = {
      title: {
        text: title,
        font: {
          color: theme.text,
          size: 16,
        },
      },
      xaxis: {
        title: `L (cm)`,
        color: theme.mutedText,
        gridcolor: theme.grid,
        zerolinecolor: theme.grid,
      },
      yaxis: {
        title: unit,
        color: theme.mutedText,
        gridcolor: theme.grid,
        zerolinecolor: theme.comparison,
      },
      margin: isMobile ? mobileMargin : desktopMargin,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      showlegend: false,
      shapes: shapes,
      annotations: annotations,
    };

    Plotly.react(chartRef.current, [trace], layout, {
      responsive: true,
      displayModeBar: false,
      scrollZoom: false,
    });

    const handleResize = () => {
      if (chartRef.current) {
        Plotly.Plots.resize(chartRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) Plotly.purge(chartRef.current);
    };

  }, [data, title, yKey, unit, stiffenerMarkers, t, theme, plotlyReady]);

  // Generate unique ID for PDF capture
  const diagramId = yKey === 'moment' ? 'moment-diagram' : 'shear-diagram';

  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-500">{t('diagram.noData')}</div>;
  }

  return (
    <div id={diagramId} ref={chartRef} className="w-full h-[300px]" />
  );
};
