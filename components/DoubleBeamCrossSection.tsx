import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DoubleBeamCrossSectionProps {
  inputs: {
    b1: number; // Bottom flange width b1 (mm)
    b2: number; // Top flange width b2 (mm)
    H: number; // Total height H (mm)
    t1: number; // Bottom flange thickness t1 (mm)
    t2: number; // Top flange thickness t2 (mm)
    b3: number; // Web spacing b3 (mm)
    t3: number; // Web thickness t3 (mm)
    Td: number; // Distance between beam centers Td (mm)
    Tr: number; // Distance between rail centers Tr (mm)
  };
  activeInput?: string;
}

const Dimension: React.FC<{ 
  x1: number; 
  y1: number; 
  x2: number; 
  y2: number; 
  label: string; 
  isHighlighted?: boolean; 
  position?: 'left' | 'right' | 'top' | 'bottom'; 
  onMouseEnter?: () => void; 
  onMouseLeave?: () => void; 
}> = ({ x1, y1, x2, y2, label, isHighlighted, position = 'bottom', onMouseEnter, onMouseLeave }) => {
  const offset = 10;
  const tickSize = 3;
  const textColor = isHighlighted ? '#22c55e' : '#3b82f6';

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
      <line 
        x1={position === 'left' || position === 'right' ? textPos.x : x1} 
        y1={position === 'top' || position === 'bottom' ? textPos.y : y1} 
        x2={position === 'left' || position === 'right' ? textPos.x : x2} 
        y2={position === 'top' || position === 'bottom' ? textPos.y : y2} 
      />
      {/* Ticks */}
      <line {...line1} />
      <line {...line2} />
      {/* Extension lines */}
      <line 
        x1={x1} 
        y1={y1} 
        x2={position === 'left' || position === 'right' ? textPos.x + (position === 'left' ? tickSize : -tickSize) : x1} 
        y2={position === 'top' || position === 'bottom' ? textPos.y + (position === 'top' ? tickSize : -tickSize) : y1} 
        strokeDasharray="2 2" 
        opacity="0.7" 
      />
      <line 
        x1={x2} 
        y1={y2} 
        x2={position === 'left' || position === 'right' ? textPos.x + (position === 'left' ? tickSize : -tickSize) : x2} 
        y2={position === 'top' || position === 'bottom' ? textPos.y + (position === 'top' ? tickSize : -tickSize) : y2} 
        strokeDasharray="2 2" 
        opacity="0.7" 
      />
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

export const DoubleBeamCrossSection: React.FC<DoubleBeamCrossSectionProps> = ({ inputs, activeInput }) => {
  const [hoveredKey, setHoveredKey] = useState<keyof DoubleBeamCrossSectionProps['inputs'] | null>(null);
  const { t } = useTranslation();
  const { b1, b2, H, t1, t2, b3, t3, Td, Tr } = inputs;

  const width = 600;
  const height = 400;
  const padding = 80;
  
  // Calculate positions for two beams
  const totalWidth = Td + b2; // Total width including distance between beams
  const totalHeight = H;
  
  const scale = Math.min(
    (width - padding * 2) / totalWidth,
    (height - padding * 2) / totalHeight
  );

  const s = {
    b1: b1 * scale,
    b2: b2 * scale,
    H: H * scale,
    t1: t1 * scale,
    t2: t2 * scale,
    b3: b3 * scale,
    t3: t3 * scale,
    Td: Td * scale,
    Tr: Tr * scale,
  };

  // Calculate beam positions
  const centerY = height / 2 + 60; // Lower the diagram to create space for dimension lines
  const leftBeamCenterX = padding + s.b2 / 2;
  const rightBeamCenterX = padding + s.Td + s.b2 / 2;
  const beamTopY = centerY - s.H / 2;

  // Calculate rail positions based on Tr parameter
  // Tr is the distance between rail centers, so rails are positioned symmetrically
  const railWidth = 50; // Rail width in mm
  const railHeight = 100; // Rail height in mm
  const sRailWidth = railWidth * scale;
  const sRailHeight = railHeight * scale;
  
  // Calculate rail center positions based on Tr
  // Both rails move symmetrically to maintain Tr distance between centers
  const railSpacing = s.Tr; // Distance between rail centers
  const railCenterSpacing = railSpacing / 2; // Half the distance for symmetric positioning
  
  // Calculate overall center position for both beams and rails
  const overallCenterX = (leftBeamCenterX + rightBeamCenterX) / 2;
  
  // Position rails symmetrically around the overall center
  const leftRailCenterX = overallCenterX - railCenterSpacing;
  const rightRailCenterX = overallCenterX + railCenterSpacing;

  const isDimensionHighlighted = (key: keyof typeof inputs) => activeInput === key || hoveredKey === key;

  const fillClass = 'fill-blue-600/80 dark:fill-blue-500/80';
  const highlightFillClass = 'fill-green-500/80 dark:fill-green-400/80 animate-pulse';
  const strokeClass = 'stroke-gray-400 dark:stroke-gray-500';

  // Define beam parts for both beams
  const createBeamParts = (centerX: number) => ({
    'top-flange': { x: centerX - s.b2 / 2, y: beamTopY, width: s.b2, height: s.t2 },
    'bottom-flange': { x: centerX - s.b1 / 2, y: beamTopY + s.H - s.t1, width: s.b1, height: s.t1 },
    'web-left': { x: centerX - s.b3 / 2 - s.t3, y: beamTopY + s.t2, width: s.t3, height: s.H - s.t1 - s.t2 },
    'web-right': { x: centerX + s.b3 / 2, y: beamTopY + s.t2, width: s.t3, height: s.H - s.t1 - s.t2 },
  });

  const leftBeamParts = createBeamParts(leftBeamCenterX);
  const rightBeamParts = createBeamParts(rightBeamCenterX);

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="w-full h-[500px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Left Beam */}
          <g className={strokeClass} strokeWidth="0.5">
            <rect {...leftBeamParts['top-flange']} className={fillClass} />
            <rect {...leftBeamParts['bottom-flange']} className={fillClass} />
            <rect {...leftBeamParts['web-left']} className={fillClass} />
            <rect {...leftBeamParts['web-right']} className={fillClass} />
          </g>

          {/* Right Beam */}
          <g className={strokeClass} strokeWidth="0.5">
            <rect {...rightBeamParts['top-flange']} className={fillClass} />
            <rect {...rightBeamParts['bottom-flange']} className={fillClass} />
            <rect {...rightBeamParts['web-left']} className={fillClass} />
            <rect {...rightBeamParts['web-right']} className={fillClass} />
          </g>

          {/* Rails positioned based on Tr parameter */}
          <g className={strokeClass} strokeWidth="0.5">
            {/* Left rail - rectangular shape 100mm x 50mm */}
            <rect 
              x={leftRailCenterX - sRailWidth / 2} 
              y={beamTopY - sRailHeight} 
              width={sRailWidth} 
              height={sRailHeight} 
              className="fill-gray-300 dark:fill-gray-600"
            />
            {/* Right rail - positioned based on Tr distance */}
            <rect 
              x={rightRailCenterX - sRailWidth / 2} 
              y={beamTopY - sRailHeight} 
              width={sRailWidth} 
              height={sRailHeight} 
              className="fill-gray-300 dark:fill-gray-600"
            />
          </g>

          {/* Dimensions for left beam */}
          <Dimension
            x1={leftBeamCenterX - s.b2 / 2} 
            y1={beamTopY}
            x2={leftBeamCenterX + s.b2 / 2} 
            y2={beamTopY}
            label={`b2 = ${b2}`}
            isHighlighted={isDimensionHighlighted('b2')}
            position="top"
            onMouseEnter={() => setHoveredKey('b2')}
            onMouseLeave={() => setHoveredKey(null)}
          />
          
          <Dimension
            x1={leftBeamCenterX - s.b1 / 2} 
            y1={beamTopY + s.H}
            x2={leftBeamCenterX + s.b1 / 2} 
            y2={beamTopY + s.H}
            label={`b1 = ${b1}`}
            isHighlighted={isDimensionHighlighted('b1')}
            position="bottom"
            onMouseEnter={() => setHoveredKey('b1')}
            onMouseLeave={() => setHoveredKey(null)}
          />

          {/* Dimensions for right beam (b1 and b2) */}
          <Dimension
            x1={rightBeamCenterX - s.b2 / 2} 
            y1={beamTopY}
            x2={rightBeamCenterX + s.b2 / 2} 
            y2={beamTopY}
            label={`b2 = ${b2}`}
            isHighlighted={isDimensionHighlighted('b2')}
            position="top"
            onMouseEnter={() => setHoveredKey('b2')}
            onMouseLeave={() => setHoveredKey(null)}
          />

          {/* Height dimension */}
          <Dimension
            x1={rightBeamCenterX + s.b2 / 2 + 20} 
            y1={beamTopY}
            x2={rightBeamCenterX + s.b2 / 2 + 20} 
            y2={beamTopY + s.H}
            label={`H = ${H}`}
            isHighlighted={isDimensionHighlighted('H')}
            position="right"
            onMouseEnter={() => setHoveredKey('H')}
            onMouseLeave={() => setHoveredKey(null)}
          />

          {/* Thickness dimensions */}
          <Dimension
            x1={leftBeamCenterX - s.b1 / 2 - 20} 
            y1={beamTopY}
            x2={leftBeamCenterX - s.b1 / 2 - 20} 
            y2={beamTopY + s.t2}
            label={`t2 = ${t2}`}
            isHighlighted={isDimensionHighlighted('t2')}
            position="left"
            onMouseEnter={() => setHoveredKey('t2')}
            onMouseLeave={() => setHoveredKey(null)}
          />

          <Dimension
            x1={leftBeamCenterX - s.b1 / 2 - 20} 
            y1={beamTopY + s.H - s.t1}
            x2={leftBeamCenterX - s.b1 / 2 - 20} 
            y2={beamTopY + s.H}
            label={`t1 = ${t1}`}
            isHighlighted={isDimensionHighlighted('t1')}
            position="left"
            onMouseEnter={() => setHoveredKey('t1')}
            onMouseLeave={() => setHoveredKey(null)}
          />

          {/* Web spacing and thickness */}
          <Dimension
            x1={leftBeamCenterX - s.b3 / 2} 
            y1={beamTopY + s.t2 + s.H / 4}
            x2={leftBeamCenterX + s.b3 / 2} 
            y2={beamTopY + s.t2 + s.H / 4}
            label={`b3 = ${b3}`}
            isHighlighted={isDimensionHighlighted('b3')}
            position="bottom"
            onMouseEnter={() => setHoveredKey('b3')}
            onMouseLeave={() => setHoveredKey(null)}
          />

          <Dimension
            x1={leftBeamCenterX - s.b3 / 2 - s.t3} 
            y1={beamTopY + s.t2 + s.H / 3}
            x2={leftBeamCenterX - s.b3 / 2} 
            y2={beamTopY + s.t2 + s.H / 3}
            label={`t3 = ${t3}`}
            isHighlighted={isDimensionHighlighted('t3')}
            position="left"
            onMouseEnter={() => setHoveredKey('t3')}
            onMouseLeave={() => setHoveredKey(null)}
          />

          {/* Distance between beam centers - Td */}
          <Dimension
            x1={leftBeamCenterX} 
            y1={beamTopY - 20}
            x2={rightBeamCenterX} 
            y2={beamTopY - 20}
            label={`Td = ${Td}`}
            isHighlighted={isDimensionHighlighted('Td')}
            position="top"
            onMouseEnter={() => setHoveredKey('Td')}
            onMouseLeave={() => setHoveredKey(null)}
          />

          {/* Distance between rail centers - Tr */}
          <Dimension
            x1={leftRailCenterX} 
            y1={beamTopY - sRailHeight - 40}
            x2={rightRailCenterX} 
            y2={beamTopY - sRailHeight - 40}
            label={`Tr = ${Tr}`}
            isHighlighted={isDimensionHighlighted('Tr')}
            position="top"
            onMouseEnter={() => setHoveredKey('Tr')}
            onMouseLeave={() => setHoveredKey(null)}
          />
        </svg>
      </div>
    </div>
  );
};
