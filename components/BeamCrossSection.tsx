import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BeamCrossSectionProps {
  inputs: {
    b: number; // Flange width b (mm)
    h: number; // Total height H (mm)
    t1: number; // Bottom flange thickness (mm)
    t2: number; // Top flange thickness (mm)
    t3: number; // Web thickness tw (mm)
    b1: number; // Web spacing b1 (mm)
    b3: number; // Top flange width b3 (mm)
  };
  activeInput?: string;
  beamType: 'single-girder' | 'i-beam';
  stiffenerLayout?: {
    positions: number[];
    span: number;
    spacing: number;
    count: number;
    required: boolean;
  };

}

const Dimension: React.FC<{ x1: number; y1: number; x2: number; y2: number; label: string; isHighlighted?: boolean; position?: 'left' | 'right' | 'top' | 'bottom'; onMouseEnter?: () => void; onMouseLeave?: () => void; }> = ({ x1, y1, x2, y2, label, isHighlighted, position = 'bottom', onMouseEnter, onMouseLeave }) => {
  const offset = 10;
  const tickSize = 3;
  const textColor = isHighlighted ? '#22c55e' : '#94a3b8';

  let line1, line2, textPos;

  if (position === 'left' || position === 'right') { // Vertical dimension
    const x = position === 'left' ? Math.min(x1, x2) - offset : Math.max(x1, x2) + offset;
    line1 = { x1: x - tickSize, y1, x2: x + tickSize, y2: y1 };
    line2 = { x1: x - tickSize, y1: y2, x2: x + tickSize, y2: y2 };
    textPos = { x: x, y: (y1 + y2) / 2 };
  } else { // Horizontal dimension
    const y = position === 'top' ? Math.min(y1, y2) - offset : Math.max(y1, y2) + offset;
    line1 = { x1, y1: y - tickSize, x2: x1, y2: y + tickSize };
    line2 = { x1: x2, y1: y - tickSize, x2: x2, y2: y + tickSize };
    textPos = { x: (x1 + x2) / 2, y };
  }

  return (
    <g className="text-xs" fill={textColor} stroke={textColor} strokeWidth="1" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* Main dimension line */}
      <line x1={position === 'left' || position === 'right' ? textPos.x : x1} y1={position === 'top' || position === 'bottom' ? textPos.y : y1} x2={position === 'left' || position === 'right' ? textPos.x : x2} y2={position === 'top' || position === 'bottom' ? textPos.y : y2} />
      {/* Ticks */}
      <line {...line1} />
      <line {...line2} />
      {/* Extension lines */}
      <line x1={x1} y1={y1} x2={position === 'left' || position === 'right' ? textPos.x + (position === 'left' ? tickSize : -tickSize) : x1} y2={position === 'top' || position === 'bottom' ? textPos.y + (position === 'top' ? tickSize : -tickSize) : y1} strokeDasharray="2 2" opacity="0.7" />
      <line x1={x2} y1={y2} x2={position === 'left' || position === 'right' ? textPos.x + (position === 'left' ? tickSize : -tickSize) : x2} y2={position === 'top' || position === 'bottom' ? textPos.y + (position === 'top' ? tickSize : -tickSize) : y2} strokeDasharray="2 2" opacity="0.7" />
      {/* Text */}
      <text
        x={textPos.x}
        y={textPos.y}
        dy={position === 'bottom' ? '1.2em' : (position === 'top' ? '-0.5em' : '0.35em')}
        dx={position === 'left' ? '-0.5em' : (position === 'right' ? '0.5em' : 0)}
        textAnchor={position === 'left' ? 'end' : position === 'right' ? 'start' : 'middle'}
        className="font-semibold"
      >
        {label}
      </text>
    </g>
  );
};

export const BeamCrossSection: React.FC<BeamCrossSectionProps> = ({ inputs, activeInput, beamType, stiffenerLayout }) => {
  const [hoveredKey, setHoveredKey] = useState<keyof BeamCrossSectionProps['inputs'] | null>(null);
  const { t } = useTranslation();
  const { b, h, t1, t2, t3, b1, b3: b3_input } = inputs;
  const b3 = beamType === 'i-beam' ? b : b3_input;
  const stiffeners = stiffenerLayout;

  const width = 400;
  const height = 400;
  const padding = 60;
  const showStiffenerMarkers = Boolean(
    stiffeners &&
    stiffeners.required &&
    stiffeners.positions.length > 0 &&
    stiffeners.span > 0
  );
  const stiffenerSpan = stiffeners?.span ?? 0;
  const trackStartX = padding;
  const trackEndX = width - padding;
  const trackWidth = trackEndX - trackStartX;
  const trackY = height - padding * 0.35;
  const markerColor = '#ef4444';
  const stiffenerLabel = t('calculator.stiffenerMarkersLabel');
  const spacingLabel = stiffeners && stiffeners.required && stiffeners.spacing > 0
    ? t('calculator.stiffenerSpacingLegend', { value: Math.round(stiffeners.spacing).toLocaleString() })
    : null;

  const totalWidth = Math.max(b, b3);
  const totalHeight = h;

  const scale = Math.min(
    (width - padding * 2) / totalWidth,
    (height - padding * 2) / totalHeight
  );

  const s = {
    h: h * scale,
    b: b * scale,
    t1: t1 * scale,
    t2: t2 * scale,
    t3: t3 * scale,
    b1: b1 * scale,
    b3: b3 * scale,
  };

  const centerX = width / 2;
  const topY = (height - s.h) / 2;

  const isDimensionHighlighted = (key: keyof typeof inputs) => activeInput === key || hoveredKey === key;

  const dimensionToPartsMap: { [key in keyof typeof inputs]?: string[] } = {
    b: ['bottom-flange'],
    h: ['top-flange', 'bottom-flange', 'web-i-beam', 'web-left', 'web-right'],
    t1: ['bottom-flange'],
    t2: ['top-flange'],
    t3: ['web-i-beam', 'web-left', 'web-right'],
    b1: ['web-left', 'web-right'],
    b3: ['top-flange'],
  };

  const isPartHighlighted = (partName: string) => {
    const activePartKeys = Object.keys(dimensionToPartsMap).filter(key => dimensionToPartsMap[key as keyof typeof inputs]?.includes(partName));
    const isHovered = hoveredKey ? dimensionToPartsMap[hoveredKey]?.includes(partName) : false;
    const isActive = activeInput ? activePartKeys.includes(activeInput) : false;
    return isHovered || isActive;
  };

  const fillClass = 'fill-blue-600/80 dark:fill-blue-500/80';
  const highlightFillClass = 'fill-green-500/80 dark:fill-green-400/80 animate-pulse';
  const strokeClass = 'stroke-gray-400 dark:stroke-gray-500';

  const parts = {
    'top-flange': { x: centerX - s.b3 / 2, y: topY, width: s.b3, height: s.t2, highlight: isPartHighlighted('top-flange') },
    'bottom-flange': { x: centerX - s.b / 2, y: topY + s.h - s.t1, width: s.b, height: s.t1, highlight: isPartHighlighted('bottom-flange') },
    'web-i-beam': { x: centerX - s.t3 / 2, y: topY + s.t2, width: s.t3, height: s.h - s.t1 - s.t2, highlight: isPartHighlighted('web-i-beam') },
    'web-left': { x: centerX - s.b1 / 2 - s.t3, y: topY + s.t2, width: s.t3, height: s.h - s.t1 - s.t2, highlight: isPartHighlighted('web-left') },
    'web-right': { x: centerX + s.b1 / 2, y: topY + s.t2, width: s.t3, height: s.h - s.t1 - s.t2, highlight: isPartHighlighted('web-right') },
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="w-full h-[400px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Beam Shape */}
          <g className={strokeClass} strokeWidth="0.5">
            <rect {...(({ highlight, ...rest }) => rest)(parts['top-flange'])} className={parts['top-flange'].highlight ? highlightFillClass : fillClass} />
            <rect {...(({ highlight, ...rest }) => rest)(parts['bottom-flange'])} className={parts['bottom-flange'].highlight ? highlightFillClass : fillClass} />
            {beamType === 'i-beam' ? (
              <rect
                {...(({ highlight, ...rest }) => rest)(parts['web-i-beam'])}
                className={parts['web-i-beam'].highlight ? highlightFillClass : fillClass}
              />
            ) : (
              <>
                <rect
                  {...(({ highlight, ...rest }) => rest)(parts['web-left'])}
                  className={parts['web-left'].highlight ? highlightFillClass : fillClass}
                />
                <rect
                  {...(({ highlight, ...rest }) => rest)(parts['web-right'])}
                  className={parts['web-right'].highlight ? highlightFillClass : fillClass}
                />
              </>
            )}
          </g>

          {/* Dimensions */}
          <Dimension
            x1={centerX - s.b3 / 2} y1={topY}
            x2={centerX + s.b3 / 2} y2={topY}
            label={beamType === 'i-beam' ? `b = ${b}` : `b3 = ${b3_input}`}
            isHighlighted={isDimensionHighlighted(beamType === 'i-beam' ? 'b' : 'b3')}
            position="top"
            onMouseEnter={() => setHoveredKey(beamType === 'i-beam' ? 'b' : 'b3')}
            onMouseLeave={() => setHoveredKey(null)}
          />
          <Dimension
            x1={centerX - s.b / 2} y1={topY + s.h}
            x2={centerX + s.b / 2} y2={topY + s.h}
            label={`b = ${b}`}
            isHighlighted={isDimensionHighlighted('b')}
            position="bottom"
            onMouseEnter={() => setHoveredKey('b')}
            onMouseLeave={() => setHoveredKey(null)}
          />
          <Dimension
            x1={width - padding / 2} y1={topY}
            x2={width - padding / 2} y2={topY + s.h}
            label={`H = ${h}`}
            isHighlighted={isDimensionHighlighted('h')}
            position="right"
            onMouseEnter={() => setHoveredKey('h')}
            onMouseLeave={() => setHoveredKey(null)}
          />
          <Dimension
            x1={padding / 2} y1={topY}
            x2={padding / 2} y2={topY + s.t2}
            label={`t2 = ${t2}`}
            isHighlighted={isDimensionHighlighted('t2')}
            position="left"
            onMouseEnter={() => setHoveredKey('t2')}
            onMouseLeave={() => setHoveredKey(null)}
          />
          <Dimension
            x1={padding / 2} y1={topY + s.h - s.t1}
            x2={padding / 2} y2={topY + s.h}
            label={`t1 = ${t1}`}
            isHighlighted={isDimensionHighlighted('t1')}
            position="left"
            onMouseEnter={() => setHoveredKey('t1')}
            onMouseLeave={() => setHoveredKey(null)}
          />
          {beamType === 'i-beam' ? (
            <Dimension
              x1={centerX - s.t3 / 2} y1={topY + s.h / 2}
              x2={centerX + s.t3 / 2} y2={topY + s.h / 2}
              label={`t3 = ${t3}`}
              isHighlighted={isDimensionHighlighted('t3')}
              position="left"
              onMouseEnter={() => setHoveredKey('t3')}
              onMouseLeave={() => setHoveredKey(null)}
            />
          ) : (
            <>
              <Dimension
                x1={centerX - s.b1 / 2 - s.t3} y1={topY + s.t2 + s.h / 4}
                x2={centerX - s.b1 / 2} y2={topY + s.t2 + s.h / 4}
                label={`t3 = ${t3}`}
                isHighlighted={isDimensionHighlighted('t3')}
                position="left"
                onMouseEnter={() => setHoveredKey('t3')}
                onMouseLeave={() => setHoveredKey(null)}
              />
              <Dimension
                x1={centerX - s.b1 / 2} y1={topY + s.h / 2}
                x2={centerX + s.b1 / 2} y2={topY + s.h / 2}
                label={`b1 = ${b1}`}
                isHighlighted={isDimensionHighlighted('b1')}
                position="bottom"
                onMouseEnter={() => setHoveredKey('b1')}
                onMouseLeave={() => setHoveredKey(null)}
              />
            </>
          )}

          {showStiffenerMarkers && stiffeners && stiffenerSpan > 0 && trackWidth > 0 && (
            <g>
              <line
                x1={trackStartX}
                y1={trackY}
                x2={trackEndX}
                y2={trackY}
                stroke="#94a3b8"
                strokeWidth="0.8"
                strokeDasharray="4 2"
              />
              {stiffeners.positions.map((pos, idx) => {
                const x = trackStartX + (pos / stiffenerSpan) * trackWidth;
                return (
                  <g key={`stiffener-marker-${idx}`}>
                    <line x1={x} y1={trackY - 12} x2={x} y2={trackY + 12} stroke={markerColor} strokeWidth="1.6" />
                    <polygon
                      points={`${x},${trackY - 16} ${x - 4},${trackY - 6} ${x + 4},${trackY - 6}`}
                      fill={markerColor}
                    />
                  </g>
                );
              })}
              <text x={trackStartX} y={trackY - 18} textAnchor="start" fontSize="10" fill="#64748b">
                {stiffenerLabel}
              </text>
              {spacingLabel && (
                <text x={trackStartX} y={trackY + 22} textAnchor="start" fontSize="10" fill="#94a3b8">
                  {spacingLabel}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
