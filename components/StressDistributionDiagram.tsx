import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { BeamInputs, CalculationResults } from '../types';
import { buildCrossSectionGeometry } from './crossSectionGeometry';

declare const Plotly: any;

interface DiagramProps {
  inputs: BeamInputs;
  results: CalculationResults;
}

const DEFAULT_DESIRED_HEIGHT = 300;
const VERTICAL_PADDING_MM = 20;

export const StressDistributionDiagram: React.FC<DiagramProps> = ({ inputs, results }) => {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);

  const {
    h,
    b,
    t1,
    t2,
    t3,
    b1,
    b3,
    vBeamParams,
  } = inputs;
  const {
    Yc,
    sigma_top_compression,
    sigma_bottom_tension,
    calculationMode,
  } = results;

  const Yc_mm = Yc * 10;

  useEffect(() => {
    if (!chartRef.current || typeof Plotly === 'undefined') {
      return;
    }

    const isMobile = window.innerWidth < 768;
    const isDarkMode = document.documentElement.classList.contains('dark');
    const horizontalGap = isMobile ? 32 : 64;
    const stressGap = isMobile ? 40 : 60;
    const mobileMargin = { l: 35, r: 10, b: 40, t: 40, pad: 2 };
    const desktopMargin = { l: 60, r: 20, b: 50, t: 50, pad: 4 };
    const desktopFontSize = 10;

    const geometry = buildCrossSectionGeometry(inputs, calculationMode);
    const { polygons, bounds } = geometry;
    const crossSectionHeight = Math.max(bounds.maxY - bounds.minY, 1);
    const crossSectionWidth = Math.max(bounds.maxX - bounds.minX, 1);
    const scale = DEFAULT_DESIRED_HEIGHT / crossSectionHeight;
    const scaledHeight = crossSectionHeight * scale;
    const scaledWidth = crossSectionWidth * scale;

    const crossSectionLeft = -scaledWidth - horizontalGap;
    const toDisplayX = (x: number) => (x - bounds.minX) * scale + crossSectionLeft;
    const toDisplayY = (y: number) => (y - bounds.minY) * scale;
    const crossSectionRight = crossSectionLeft + scaledWidth;
    const bottomDisplay = toDisplayY(bounds.minY);
    const topDisplay = toDisplayY(bounds.maxY);
    const yPadding = VERTICAL_PADDING_MM * scale;
    const stressOffset = crossSectionRight + horizontalGap;

    const crossSectionColor = isDarkMode ? 'rgba(75, 85, 99, 0.7)' : 'rgba(209, 213, 219, 1)';
    const crossSectionLineColor = 'rgba(107, 114, 128, 1)';

    const polygonShapes = polygons
      .map((polygon) => {
        if (!polygon.points.length) {
          return null;
        }
        const pathSegments = polygon.points.map((pt, index) => {
          const x = toDisplayX(pt.x).toFixed(2);
          const y = toDisplayY(pt.y).toFixed(2);
          return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
        });
        return {
          type: 'path',
          path: `${pathSegments.join(' ')} Z`,
          fillcolor: crossSectionColor,
          line: { width: 1, color: crossSectionLineColor },
          xref: 'x',
          yref: 'y',
        };
      })
      .filter(Boolean);

    const safeYc = Math.min(Math.max(Yc_mm, bounds.minY), bounds.maxY);
    const neutralAxisY = toDisplayY(safeYc);

    const stressMax = Math.max(
      Math.abs(sigma_top_compression || 0),
      Math.abs(sigma_bottom_tension || 0),
    );
    const stressRightExtent = stressOffset + stressMax + stressGap;

    const compressionTrace = {
      x: [stressOffset, stressOffset - sigma_top_compression, stressOffset],
      y: [neutralAxisY, topDisplay, topDisplay],
      type: 'scatter',
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(239, 68, 68, 0.2)',
      line: { color: isDarkMode ? '#f87171' : '#ef4444', width: 1.5 },
      hoverinfo: 'none',
    };

    const tensionTrace = {
      x: [stressOffset, stressOffset + sigma_bottom_tension, stressOffset],
      y: [neutralAxisY, bottomDisplay, bottomDisplay],
      type: 'scatter',
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(59, 130, 246, 0.2)',
      line: { color: isDarkMode ? '#60a5fa' : '#3b82f6', width: 1.5 },
      hoverinfo: 'none',
    };

    const shapes = [
      ...polygonShapes,
      {
        type: 'line',
        x0: crossSectionLeft - horizontalGap / 2,
        x1: stressRightExtent,
        y0: neutralAxisY,
        y1: neutralAxisY,
        line: { color: crossSectionLineColor, width: 1, dash: 'dash' },
      },
    ];

    const tickCount = 6;
    const tickStep = crossSectionHeight / Math.max(tickCount - 1, 1);
    const tickvals: number[] = [];
    const ticktext: string[] = [];
    for (let i = 0; i < tickCount; i += 1) {
      const mmValue = bounds.minY + tickStep * i;
      tickvals.push(toDisplayY(mmValue));
      ticktext.push(`${Math.round(mmValue)}`);
    }

    const annotations: any[] = [
      {
        x: stressOffset - sigma_top_compression,
        y: topDisplay,
        xref: 'x',
        yref: 'y',
        text: `-${sigma_top_compression.toFixed(1)} MPa (${t('stressDiagram.compression')})`,
        showarrow: false,
        xanchor: 'right',
        yanchor: 'bottom',
        ax: isMobile ? -16 : -28,
        ay: -6,
        font: { color: isDarkMode ? '#f87171' : '#ef4444' },
      },
      {
        x: stressOffset + sigma_bottom_tension,
        y: bottomDisplay,
        xref: 'x',
        yref: 'y',
        text: `+${sigma_bottom_tension.toFixed(1)} MPa (${t('stressDiagram.tension')})`,
        showarrow: false,
        xanchor: 'left',
        yanchor: 'top',
        ax: 28,
        ay: 6,
        font: { color: isDarkMode ? '#60a5fa' : '#3b82f6' },
      },
      {
        x: crossSectionLeft - horizontalGap / 2,
        y: neutralAxisY,
        xref: 'x',
        yref: 'y',
        text: `Yc=${Yc_mm.toFixed(1)} mm`,
        showarrow: false,
        xanchor: 'right',
        font: { color: crossSectionLineColor, size: desktopFontSize },
      },
      {
        x: stressOffset,
        y: neutralAxisY,
        xref: 'x',
        yref: 'y',
        text: 'N.A.',
        showarrow: false,
        xanchor: 'center',
        yanchor: 'bottom',
        font: { color: crossSectionLineColor, size: 10 },
      },
    ];

    if (!isMobile) {
      const crossSectionCentreX = toDisplayX((bounds.minX + bounds.maxX) / 2);
      const bottomLabelY = bottomDisplay - yPadding / 2;
      const heightLabelX = crossSectionLeft - horizontalGap / 2;
      const heightLabelY = toDisplayY(bounds.minY + crossSectionHeight / 2);
      const bottomFlangeCentreY = toDisplayY(bounds.minY + (t1 || 0) / 2);
      const topFlangeCentreY = toDisplayY(bounds.maxY - (t2 || 0) / 2);
      const sectionMidY = toDisplayY(bounds.minY + crossSectionHeight / 2);
      const webRightFaceX = toDisplayX((bounds.minX + bounds.maxX) / 2 + (t3 || 0) / 2);

      if (calculationMode === 'i-beam') {
        annotations.push(
          {
            x: crossSectionCentreX,
            y: bottomLabelY,
            xref: 'x',
            yref: 'y',
            text: `b = ${Math.round(b)} mm`,
            showarrow: false,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: heightLabelX,
            y: heightLabelY,
            xref: 'x',
            yref: 'y',
            text: `h = ${Math.round(h)} mm`,
            showarrow: false,
            textangle: -90,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionRight + horizontalGap / 3,
            y: bottomFlangeCentreY,
            xref: 'x',
            yref: 'y',
            text: `t1 = ${Math.round(t1 || 0)} mm`,
            showarrow: false,
            xanchor: 'left',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionRight + horizontalGap / 3,
            y: topFlangeCentreY,
            xref: 'x',
            yref: 'y',
            text: `t2 = ${Math.round(t2 || 0)} mm`,
            showarrow: false,
            xanchor: 'left',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: webRightFaceX + 6,
            y: sectionMidY,
            xref: 'x',
            yref: 'y',
            text: `t3 = ${Math.round(t3 || 0)} mm`,
            showarrow: false,
            textangle: 90,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
        );
      } else if (calculationMode === 'single-girder' || calculationMode === 'double-girder') {
        annotations.push(
          {
            x: crossSectionCentreX,
            y: bottomLabelY,
            xref: 'x',
            yref: 'y',
            text: `b = ${Math.round(b)} mm`,
            showarrow: false,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionCentreX,
            y: topDisplay + yPadding / 2,
            xref: 'x',
            yref: 'y',
            text: `b3 = ${Math.round(b3 || b)} mm`,
            showarrow: false,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionCentreX,
            y: heightLabelY,
            xref: 'x',
            yref: 'y',
            text: `b1 = ${Math.round(b1 || 0)} mm`,
            showarrow: false,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: heightLabelX,
            y: heightLabelY,
            xref: 'x',
            yref: 'y',
            text: `h = ${Math.round(h)} mm`,
            showarrow: false,
            textangle: -90,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionRight + horizontalGap / 3,
            y: bottomFlangeCentreY,
            xref: 'x',
            yref: 'y',
            text: `t1 = ${Math.round(t1 || 0)} mm`,
            showarrow: false,
            xanchor: 'left',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionRight + horizontalGap / 3,
            y: topFlangeCentreY,
            xref: 'x',
            yref: 'y',
            text: `t2 = ${Math.round(t2 || 0)} mm`,
            showarrow: false,
            xanchor: 'left',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionRight + horizontalGap / 3,
            y: sectionMidY,
            xref: 'x',
            yref: 'y',
            text: `t3 = ${Math.round(t3 || 0)} mm`,
            showarrow: false,
            textangle: 90,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
        );
      } else if (calculationMode === 'v-beam' && vBeamParams) {
        const { h1: h1Param = 0, h3: h3Param = 0, t4: t4Param = 0 } = vBeamParams;
        const webAngleRad = ((vBeamParams.webAngleDeg ?? 30) * Math.PI) / 180;
        const vWebMidY = toDisplayY((t1 || 0) + h1Param + (h3Param * Math.cos(webAngleRad)) / 2);
        annotations.push(
          {
            x: crossSectionCentreX,
            y: bottomLabelY,
            xref: 'x',
            yref: 'y',
            text: `b1 = ${Math.round(b1 || b)} mm`,
            showarrow: false,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: heightLabelX,
            y: toDisplayY((t1 || 0) + h1Param / 2),
            xref: 'x',
            yref: 'y',
            text: `h1 = ${Math.round(h1Param)} mm`,
            showarrow: false,
            textangle: -90,
            xanchor: 'center',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionRight + horizontalGap / 3,
            y: vWebMidY,
            xref: 'x',
            yref: 'y',
            text: `h3 = ${Math.round(h3Param)} mm`,
            showarrow: false,
            xanchor: 'left',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
          {
            x: crossSectionRight + horizontalGap / 3,
            y: toDisplayY(bounds.maxY - t4Param / 2),
            xref: 'x',
            yref: 'y',
            text: `t4 = ${Math.round(t4Param)} mm`,
            showarrow: false,
            xanchor: 'left',
            font: { color: crossSectionLineColor, size: desktopFontSize },
          },
        );
      }
    }

    const layout = {
      title: {
        text: t('stressDiagram.ariaLabel'),
        font: { color: isDarkMode ? '#e5e7eb' : '#374151', size: 16 },
      },
      xaxis: {
        title: `${t('stressDiagram.unit')}`,
        range: [crossSectionLeft - horizontalGap, stressRightExtent + stressGap],
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
      },
      yaxis: {
        title: `${t('Height')} (mm)`,
        range: [bottomDisplay - yPadding, topDisplay + yPadding],
        showgrid: false,
        zeroline: false,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
        tickmode: 'array',
        tickvals,
        ticktext,
      },
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: isMobile ? mobileMargin : desktopMargin,
      shapes,
      annotations,
    };

    Plotly.newPlot(chartRef.current, [compressionTrace, tensionTrace], layout, {
      responsive: true,
      displayModeBar: false,
    });

    const handleResize = () => {
      if (chartRef.current) {
        Plotly.Plots.resize(chartRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [inputs, results, t, calculationMode]);

  return (
    <div id="stress-diagram" ref={chartRef} className="w-full h-[400px]" />
  );
};