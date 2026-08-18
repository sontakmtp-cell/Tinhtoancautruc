
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { BeamInputs, CalculationResults } from '../types';
import { useChartTheme } from './chartTheme';
import { usePlotlyReady } from '../utils/loadPlotly';

declare const Plotly: any;

interface DiagramProps {
  inputs: BeamInputs;
  results: CalculationResults;
}

export const DeflectedShapeDiagram: React.FC<DiagramProps> = ({ inputs, results }) => {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);
  const { L } = inputs;
  const { f, f_allow } = results;
  const theme = useChartTheme();
  const plotlyReady = usePlotlyReady();

  useEffect(() => {
    if (!chartRef.current || !plotlyReady || typeof Plotly === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    const mobileMargin = { l: 30, r: 15, b: 40, t: 40, pad: 2 };
    const desktopMargin = { l: 40, r: 20, b: 50, t: 50, pad: 4 };
    const mobileFontSize = 10;
    const desktopFontSize = 12;

    const x = Array.from({ length: 101 }, (_, i) => (i / 100) * L);
    const y_deflected = x.map(val => -f * Math.sin((Math.PI * val) / L));

    const traces = [
      // Undeflected
      {
        x: [0, L], y: [0, 0], mode: 'lines',
        line: { color: theme.comparison, width: 1.5, dash: 'dash' },
        hoverinfo: 'none',
      },
      // Deflected
      {
        x: x, y: y_deflected, mode: 'lines',
        line: { color: theme.primary, width: 2.5 },
        name: `${t('deflectionDiagram.actual', { value: f.toPrecision(3) })}`,
        hovertemplate: 'x = %{x:.1f} cm<br>f = %{y:.3f} cm<extra></extra>',
      },
      // Allowable
      {
        x: [0, L], y: [-f_allow, -f_allow], mode: 'lines',
        line: { color: theme.critical, width: 1.5, dash: 'dot' },
        name: `${t('deflectionDiagram.allowable', { value: f_allow.toPrecision(3) })}`,
      }
    ];

    const layout = {
      title: {
        text: t('deflectionDiagram.ariaLabel'),
        font: { color: theme.text, size: 16 },
      },
      xaxis: {
        title: `L = ${L.toFixed(0)} cm`,
        showgrid: false, zeroline: false, showticklabels: false,
        color: theme.mutedText,
      },
      yaxis: {
        title: 'Deflection (cm)',
        showgrid: false, zeroline: false, showticklabels: false,
        range: [-f_allow * 1.5, f_allow * 0.5],
        color: theme.mutedText,
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        yanchor: 'bottom', y: 1.02,
        xanchor: 'right', x: 1,
        font: { color: theme.mutedText, size: isMobile ? mobileFontSize : desktopFontSize }
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: isMobile ? mobileMargin : desktopMargin,
      annotations: [
        // Maximum deflection annotation
        {
          x: L/2,
          y: -f,
          text: `fmax = ${f.toPrecision(3)} cm`,
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowwidth: 1.5,
          ax: 0,
          ay: -30,
          bgcolor: theme.isDarkMode ? '#111827' : '#ffffff',
          bordercolor: theme.primary,
          borderpad: 3,
          font: { color: theme.primary, size: mobileFontSize }
        },
        // Left support annotation
        {
          x: 0,
          y: 0,
          text: t('deflectionDiagram.support'),
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowwidth: 1.5,
          ax: 0,
          ay: 30,
          font: { color: theme.mutedText, size: 11 }
        },
        // Right support annotation
        {
          x: L,
          y: 0,
          text: t('deflectionDiagram.support'),
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowwidth: 1.5,
          ax: 0,
          ay: 30,
          font: { color: theme.mutedText, size: 11 }
        },
        // Allowable deflection annotation
        {
          x: L * 0.85,
          y: -f_allow,
          text: `[f] = ${f_allow.toPrecision(3)} cm`,
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowwidth: 1.5,
          ax: 0,
          ay: -30,
          font: { color: theme.critical, size: mobileFontSize }
        }
      ],
      shapes: [
        // Support triangles
        { type: 'path', path: `M 0,0 L -${L*0.02},-${f_allow*0.2} L ${L*0.02},-${f_allow*0.2} Z`, fillcolor: theme.comparison, line: {width: 0} },
        { type: 'path', path: `M ${L},0 L ${L-L*0.02},-${f_allow*0.2} L ${L+L*0.02},-${f_allow*0.2} Z`, fillcolor: theme.comparison, line: {width: 0} }
      ]
    };

    Plotly.react(chartRef.current, traces, layout, { responsive: true, displayModeBar: false, scrollZoom: false });
    
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

  }, [inputs, results, theme, t, plotlyReady]);

  return (
    <div id="deflection-diagram" ref={chartRef} className="w-full h-[250px]" />
  );
};
