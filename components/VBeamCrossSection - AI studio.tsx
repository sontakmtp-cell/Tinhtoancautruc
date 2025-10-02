import React, { useState } from 'react';

interface VBeamCrossSectionProps {
  inputs: {
    t3: number; // Độ dày bụng V-web
    h3: number; // Chiều dài bụng V-web (cạnh huyền)
    t4: number; // Độ dày mái
    b1: number; // Chiều rộng cánh đáy
    t1: number; // Độ dày cánh đáy
    t2: number; // Độ dày thân giữa
    h1: number; // Chiều cao thân giữa
  };
  activeInput?: string;
}

// Thành phần Dimension không thay đổi, giữ nguyên như của bạn
const Dimension: React.FC<{ 
  x1: number; y1: number; x2: number; y2: number; 
  label: string; isHighlighted?: boolean; 
  position?: 'left' | 'right' | 'top' | 'bottom'; 
  onMouseEnter?: () => void; onMouseLeave?: () => void; 
}> = ({ x1, y1, x2, y2, label, isHighlighted, position = 'bottom', onMouseEnter, onMouseLeave }) => {
  const offset = 10;
  const tickSize = 3;
  const textColor = isHighlighted ? '#22c55e' : '#94a3b8';

  let line1, line2, textPos;

  if (position === 'left' || position === 'right') {
    const x = position === 'left' ? Math.min(x1, x2) - offset : Math.max(x1, x2) + offset;
    line1 = { x1: x - tickSize, y1, x2: x + tickSize, y2: y1 };
    line2 = { x1: x - tickSize, y1: y2, x2: x + tickSize, y2: y2 };
    textPos = { x: x, y: (y1 + y2) / 2 };
  } else {
    const y = position === 'top' ? Math.min(y1, y2) - offset : Math.max(y1, y2) + offset;
    line1 = { x1, y1: y - tickSize, x2: x1, y2: y + tickSize };
    line2 = { x1: x2, y1: y - tickSize, x2: x2, y2: y + tickSize };
    textPos = { x: (x1 + x2) / 2, y };
  }

  return (
    <g className="text-xs" fill={textColor} stroke={textColor} strokeWidth="1" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <line 
        x1={position === 'left' || position === 'right' ? textPos.x : x1} 
        y1={position === 'top' || position === 'bottom' ? textPos.y : y1} 
        x2={position === 'left' || position === 'right' ? textPos.x : x2} 
        y2={position === 'top' || position === 'bottom' ? textPos.y : y2} 
      />
      <line {...line1} />
      <line {...line2} />
      <line 
        x1={x1} y1={y1} 
        x2={position === 'left' || position === 'right' ? textPos.x + (position === 'left' ? tickSize : -tickSize) : x1} 
        y2={position === 'top' || position === 'bottom' ? textPos.y + (position === 'top' ? tickSize : -tickSize) : y1} 
        strokeDasharray="2 2" opacity="0.7" 
      />
      <line 
        x1={x2} y1={y2} 
        x2={position === 'left' || position === 'right' ? textPos.x + (position === 'left' ? tickSize : -tickSize) : x2} 
        y2={position === 'top' || position === 'bottom' ? textPos.y + (position === 'top' ? tickSize : -tickSize) : y2} 
        strokeDasharray="2 2" opacity="0.7" 
      />
      <text
        x={textPos.x} y={textPos.y}
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


export const VBeamCrossSection: React.FC<VBeamCrossSectionProps> = ({ inputs, activeInput }) => {
  const [hoveredKey, setHoveredKey] = useState<keyof VBeamCrossSectionProps['inputs'] | null>(null);
  
  const { t3, h3, t4, b1, t1, t2, h1 } = inputs;

  // --- CÁC THAM SỐ THIẾT KẾ CỐ ĐỊNH ---
  const a1_deg = 30; // Góc nghiêng của V-web
  const a1_rad = (a1_deg * Math.PI) / 180;
  const H3_const = 99.07; // Chiều cao từ đỉnh V-web lên đỉnh mái (dựa trên bản vẽ)

  // --- TÍNH TOÁN CÁC KÍCH THƯỚC PHỤ THUỘC ---
  const vWebHeight = h3 * Math.cos(a1_rad);
  const vWebHalfWidth = h3 * Math.sin(a1_rad);
  const totalGeometricHeight = t1 + h1 + vWebHeight + H3_const;
  const totalGeometricWidth = Math.max(b1, 2 * vWebHalfWidth);

  // --- THIẾT LẬP SCENE VẼ ---
  const width = 800;
  const height = 600;
  const padding = 100;
  
  const scale = Math.min(
    (width - padding * 2) / totalGeometricWidth,
    (height - padding * 2) / totalGeometricHeight
  );
  const s = (val: number) => val * scale;

  const centerX = width / 2;
  const bottomY = height - padding;

  // --- TÍNH TOÁN CÁC TỌA ĐỘ ĐIỂM QUAN TRỌNG ---
  const baseBottomY = bottomY;
  const flangeTopY = baseBottomY - s(t1);
  const vJunctionY = flangeTopY - s(h1);
  const leftWebTopX = centerX - s(vWebHalfWidth);
  const rightWebTopX = centerX + s(vWebHalfWidth);
  const webTopY = vJunctionY - s(vWebHeight);
  const apexX = centerX;
  const apexY = webTopY - s(H3_const);

  // --- CÁC KÍCH THƯỚC ĐƯỢC SUY RA ĐỂ HIỂN THỊ ---
  const H = totalGeometricHeight;
  const H1 = t1 + h1;
  const H2 = t1 + h1 + vWebHeight;
  const La = 2 * vWebHalfWidth;

  // --- LOGIC HIGHLIGHT ---
  const isDimensionHighlighted = (key: keyof typeof inputs) => activeInput === key || hoveredKey === key;
  const dimensionToPartsMap: { [key in keyof typeof inputs]?: string[] } = {
    b1: ['base-flange'], t1: ['base-flange'], t2: ['base-web'],
    h1: ['base-web'], t3: ['v-web'], h3: ['v-web'], t4: ['v-roof'],
  };
  const isPartHighlighted = (partName: string) => {
    const isHovered = hoveredKey ? dimensionToPartsMap[hoveredKey]?.includes(partName) : false;
    const isActive = activeInput ? dimensionToPartsMap[activeInput as keyof typeof inputs]?.includes(partName) : false;
    return isHovered || isActive;
  };

  const fillClass = 'fill-blue-600/80 dark:fill-blue-500/80';
  const highlightFillClass = 'fill-green-500/80 dark:fill-green-400/80 animate-pulse';
  const strokeClass = 'stroke-gray-400 dark:stroke-gray-500';
  const dimColor = (key: keyof typeof inputs) => isDimensionHighlighted(key) ? '#22c55e' : '#94a3b8';

  // --- Tọa độ cho các đường kích thước tùy chỉnh ---
  const h3Angle = 90 - a1_deg;
  const h3_dx = rightWebTopX - centerX;
  const h3_dy = webTopY - vJunctionY;
  const h3_len = Math.hypot(h3_dx, h3_dy);
  const h3_nx = -h3_dy / h3_len;
  const h3_ny = h3_dx / h3_len;
  const h3Offset = 20;

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="w-full h-[600px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
          
          {/* Trục đối xứng */}
          <line x1={centerX} y1={apexY - 20} x2={centerX} y2={baseBottomY + 20} stroke="#f87171" strokeWidth="0.75" strokeDasharray="4 2" opacity="0.8" />

          {/* CÁC BỘ PHẬN CỦA DẦM */}
          <g>
            {/* Cánh đáy (Base flange) */}
            <rect x={centerX - s(b1) / 2} y={flangeTopY} width={s(b1)} height={s(t1)} className={isPartHighlighted('base-flange') ? highlightFillClass : fillClass} stroke={strokeClass} strokeWidth="0.5"/>
            {/* Thân giữa (Base web) */}
            <rect x={centerX - s(t2) / 2} y={vJunctionY} width={s(t2)} height={s(h1)} className={isPartHighlighted('base-web') ? highlightFillClass : fillClass} stroke={strokeClass} strokeWidth="0.5"/>
            {/* V-web trái */}
            {(() => { const dx = leftWebTopX - centerX, dy = webTopY - vJunctionY, len = Math.hypot(dx, dy), nx = (dy / len) * (s(t3) / 2), ny = (-dx / len) * (s(t3) / 2); return (<polygon points={`${centerX - nx},${vJunctionY - ny} ${centerX + nx},${vJunctionY + ny} ${leftWebTopX + nx},${webTopY + ny} ${leftWebTopX - nx},${webTopY - ny}`} className={isPartHighlighted('v-web') ? highlightFillClass : fillClass} stroke={strokeClass} strokeWidth="0.5"/>);})()}
            {/* V-web phải */}
            {(() => { const dx = rightWebTopX - centerX, dy = webTopY - vJunctionY, len = Math.hypot(dx, dy), nx = (dy / len) * (s(t3) / 2), ny = (-dx / len) * (s(t3) / 2); return (<polygon points={`${centerX - nx},${vJunctionY - ny} ${centerX + nx},${vJunctionY + ny} ${rightWebTopX + nx},${webTopY + ny} ${rightWebTopX - nx},${webTopY - ny}`} className={isPartHighlighted('v-web') ? highlightFillClass : fillClass} stroke={strokeClass} strokeWidth="0.5"/>);})()}
            {/* Mái trái */}
            {(() => { const dx = leftWebTopX - apexX, dy = webTopY - apexY, len = Math.hypot(dx, dy), nx = (dy / len) * (s(t4) / 2), ny = (-dx / len) * (s(t4) / 2); return (<polygon points={`${apexX - nx},${apexY - ny} ${apexX + nx},${apexY + ny} ${leftWebTopX + nx},${webTopY + ny} ${leftWebTopX - nx},${webTopY - ny}`} className={isPartHighlighted('v-roof') ? highlightFillClass : fillClass} stroke={strokeClass} strokeWidth="0.5"/>);})()}
            {/* Mái phải */}
            {(() => { const dx = rightWebTopX - apexX, dy = webTopY - apexY, len = Math.hypot(dx, dy), nx = (dy / len) * (s(t4) / 2), ny = (-dx / len) * (s(t4) / 2); return (<polygon points={`${apexX - nx},${apexY - ny} ${apexX + nx},${apexY + ny} ${rightWebTopX + nx},${webTopY + ny} ${rightWebTopX - nx},${webTopY - ny}`} className={isPartHighlighted('v-roof') ? highlightFillClass : fillClass} stroke={strokeClass} strokeWidth="0.5"/>);})()}
          </g>

          {/* --- CÁC ĐƯỜNG KÍCH THƯỚC --- */}
          {/* b1, t1, h1 */}
          <Dimension x1={centerX - s(b1)/2} y1={baseBottomY} x2={centerX + s(b1)/2} y2={baseBottomY} label={`b1 = ${b1}`} isHighlighted={isDimensionHighlighted('b1')} onMouseEnter={() => setHoveredKey('b1')} onMouseLeave={() => setHoveredKey(null)} />
          <Dimension x1={centerX + s(b1)/2 + 10} y1={flangeTopY} x2={centerX + s(b1)/2 + 10} y2={baseBottomY} label={`t1 = ${t1}`} isHighlighted={isDimensionHighlighted('t1')} position="right" onMouseEnter={() => setHoveredKey('t1')} onMouseLeave={() => setHoveredKey(null)} />
          <Dimension x1={centerX - s(b1)/2 - 10} y1={vJunctionY} x2={centerX - s(b1)/2 - 10} y2={flangeTopY} label={`h1 = ${h1}`} isHighlighted={isDimensionHighlighted('h1')} position="left" onMouseEnter={() => setHoveredKey('h1')} onMouseLeave={() => setHoveredKey(null)} />
          {/* t2 */}
          <Dimension x1={centerX - s(t2)/2} y1={vJunctionY + 15} x2={centerX + s(t2)/2} y2={vJunctionY + 15} label={`t2 = ${t2}`} isHighlighted={isDimensionHighlighted('t2')} position="bottom" onMouseEnter={() => setHoveredKey('t2')} onMouseLeave={() => setHoveredKey(null)} />

          {/* h3 (Slanted Dimension) */}
          <g stroke={dimColor('h3')} fill={dimColor('h3')} strokeWidth="1" onMouseEnter={() => setHoveredKey('h3')} onMouseLeave={() => setHoveredKey(null)}>
            <line x1={centerX} y1={vJunctionY} x2={centerX + h3_nx * h3Offset} y2={vJunctionY + h3_ny * h3Offset} strokeDasharray="2 2" opacity="0.7"/>
            <line x1={rightWebTopX} y1={webTopY} x2={rightWebTopX + h3_nx * h3Offset} y2={webTopY + h3_ny * h3Offset} strokeDasharray="2 2" opacity="0.7"/>
            <line x1={centerX + h3_nx * h3Offset} y1={vJunctionY + h3_ny * h3Offset} x2={rightWebTopX + h3_nx * h3Offset} y2={webTopY + h3_ny * h3Offset} />
            <text x={(centerX + rightWebTopX)/2 + h3_nx * (h3Offset + 5)} y={(vJunctionY + webTopY)/2 + h3_ny * (h3Offset + 5)} dy="0.35em" textAnchor="middle" transform={`rotate(-${h3Angle} ${(centerX + rightWebTopX)/2} ${(vJunctionY + webTopY)/2})`} className="text-xs font-semibold">{`h3 = ${h3}`}</text>
          </g>
          
          {/* t3 (Leader Line) */}
          <g stroke={dimColor('t3')} fill={dimColor('t3')} strokeWidth="1" onMouseEnter={() => setHoveredKey('t3')} onMouseLeave={() => setHoveredKey(null)}>
            <line x1={rightWebTopX + 30} y1={webTopY + s(vWebHeight/2)} x2={(rightWebTopX + centerX) / 2} y2={(webTopY + vJunctionY) / 2} stroke="#94a3b8" markerEnd='url(#arrow)'/>
            <text x={rightWebTopX + 35} y={webTopY + s(vWebHeight/2)} dy="0.35em" className="text-xs font-semibold">{`t3 = ${t3}`}</text>
          </g>

          {/* t4 (Leader Line) */}
          <g stroke={dimColor('t4')} fill={dimColor('t4')} strokeWidth="1" onMouseEnter={() => setHoveredKey('t4')} onMouseLeave={() => setHoveredKey(null)}>
            <line x1={leftWebTopX - 30} y1={webTopY - s(H3_const/2)} x2={(leftWebTopX + apexX) / 2} y2={(webTopY + apexY) / 2} stroke="#94a3b8" markerEnd='url(#arrow)'/>
            <text x={leftWebTopX - 35} y={webTopY - s(H3_const/2)} dy="0.35em" textAnchor='end' className="text-xs font-semibold">{`t4 = ${t4}`}</text>
          </g>
          
          {/* Góc a1 */}
          <g>
            <path d={`M ${centerX+s(20)} ${vJunctionY} A ${s(20)} ${s(20)} 0 0 0 ${centerX + s(20 * Math.sin(a1_rad))} ${vJunctionY - s(20 * Math.cos(a1_rad))}`} fill="none" stroke="#94a3b8" strokeWidth="1"/>
            <text x={centerX + s(25)} y={vJunctionY - s(10)} className="text-xs font-semibold" fill="#94a3b8">{a1_deg}°</text>
          </g>

          {/* --- Kích thước suy ra --- */}
          {/* H, H1, H2 */}
          <Dimension x1={rightWebTopX + 60} y1={apexY} x2={rightWebTopX + 60} y2={baseBottomY} label={`H = ${H.toFixed(2)}`} position="right" />
          <Dimension x1={rightWebTopX + 40} y1={webTopY} x2={rightWebTopX + 40} y2={baseBottomY} label={`H2 = ${H2.toFixed(2)}`} position="right" />
          <Dimension x1={rightWebTopX + 20} y1={vJunctionY} x2={rightWebTopX + 20} y2={baseBottomY} label={`H1 = ${H1.toFixed(2)}`} position="right" />
          {/* H3 */}
          <Dimension x1={leftWebTopX - 20} y1={apexY} x2={leftWebTopX - 20} y2={webTopY} label={`H3 = ${H3_const.toFixed(2)}`} position="left" />
          {/* La */}
          <Dimension x1={leftWebTopX} y1={apexY} x2={rightWebTopX} y2={apexY} label={`La = ${La.toFixed(2)}`} position="top" />

        </svg>
      </div>
    </div>
  );
};