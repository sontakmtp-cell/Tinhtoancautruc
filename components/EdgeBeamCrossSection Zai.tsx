import React, { useState } from 'react';
import type { EdgeBeamInputs } from '../types';

interface EdgeBeamCrossSectionProps {
  inputs: EdgeBeamInputs;
  activeInput?: keyof EdgeBeamInputs;
}
const HighlightableText: React.FC<{
  x: number;
  y: number;
  label: string;
  paramName: keyof EdgeBeamInputs;
  activeInput?: keyof EdgeBeamInputs;
  onHover: (param: keyof EdgeBeamInputs | null) => void;
  className?: string;
  textAnchor?: 'start' | 'middle' | 'end';
}> = ({ x, y, label, paramName, activeInput, onHover, className = '', textAnchor = 'middle' }) => {
  const isHighlighted = activeInput === paramName;
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      className={`${className} ${isHighlighted ? 'fill-blue-600 dark:fill-blue-400 font-bold' : ''}`}
      onMouseEnter={() => onHover(paramName)}
      onMouseLeave={() => onHover(null)}
    >
      {label}
    </text>
  );
};
export const EdgeBeamCrossSection: React.FC<EdgeBeamCrossSectionProps> = ({ inputs, activeInput: propActiveInput }) => {
  const [hoveredInput, setHoveredInput] = useState<keyof EdgeBeamInputs | null>(null);
  const activeInput = propActiveInput || hoveredInput;

  // Calculate scaled dimensions for display
  const S_display = Math.max(inputs.S, 1);
  const x_display = Math.max(0, Math.min(inputs.x, S_display));
  const B_display = Math.max(inputs.B, 10);

  // Calculate trolley position as percentage for SVG positioning
  const trolleyPositionPercent = S_display > 0 ? (x_display / S_display) * 100 : 10;

  // Highlight active parameter
  const getHighlightClass = (paramName: keyof EdgeBeamInputs) => {
    return activeInput === paramName ? 'animate-pulse' : '';
  };

  const totalWheels = Math.max(1, Math.min(inputs.z, 6));
  const totalDriveWheels = Math.min(inputs.b, totalWheels * 2);

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <svg
        width="100%"
        height="400"
        viewBox="0 0 800 400"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-gray-600 dark:fill-gray-400" />
          </marker>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" className="stroke-gray-400 dark:stroke-gray-600" strokeWidth="0.5"/>
          </pattern>
        </defs>

        {/* Title */}
        <text x="400" y="25" textAnchor="middle" className="text-base font-semibold fill-gray-800 dark:fill-gray-200">
          Sơ Đồ Cầu Trục - Hình Chiếu Bằng
        </text>

        {/* Rails */}
        <g id="rail-group">
          {/* Left Rail */}
          <rect x="80" y="40" width="15" height="320" fill="url(#hatch)" className="stroke-gray-600 dark:stroke-gray-400"/>
          <rect x="80" y="40" width="15" height="320" fill="none" className="stroke-gray-600 dark:stroke-gray-400" strokeWidth="1.5"/>
          <text x="65" y="200" textAnchor="middle" transform="rotate(-90, 65, 200)" className="text-xs font-medium fill-gray-700 dark:fill-gray-300">
            Ray trái
          </text>

          {/* Right Rail */}
          <rect x="705" y="40" width="15" height="320" fill="url(#hatch)" className="stroke-gray-600 dark:stroke-gray-400"/>
          <rect x="705" y="40" width="15" height="320" fill="none" className="stroke-gray-600 dark:stroke-gray-400" strokeWidth="1.5"/>
          <text x="740" y="200" textAnchor="middle" transform="rotate(90, 740, 200)" className="text-xs font-medium fill-gray-700 dark:fill-gray-300">
            Ray phải
          </text>
        </g>

        {/* Crane Bridge */}
        <g id="crane-bridge">
          {/* Edge Beams */}
          <rect x="70" y="120" width="30" height="200" className={`fill-gray-200 dark:fill-gray-700 stroke-gray-500 dark:stroke-gray-400 stroke-[1.5] ${getHighlightClass('S')}`}/>
          <rect x="700" y="120" width="30" height="200" className={`fill-gray-200 dark:fill-gray-700 stroke-gray-500 dark:stroke-gray-400 stroke-[1.5] ${getHighlightClass('S')}`}/>
          <HighlightableText x={85} y={110} label="Dầm biên" paramName="S" activeInput={activeInput} onHover={setHoveredInput} className="text-xs font-medium fill-gray-700 dark:fill-gray-300" />

          {/* Wheels */}
          <g id="wheels">
            {/* Left Wheels */}
            {Array.from({ length: totalWheels }, (_, i) => {
              const wheelNumber = (i * 2) + 1; // Position 0->wheel 1, position 1->wheel 3, position 2->wheel 5
              const isDriveWheel = wheelNumber <= totalDriveWheels;

              let wheelY;
              if (totalWheels === 1) {
                wheelY = 220;
              } else {
                const startY = 140;
                const endY = 300;
                const spacing = (endY - startY) / (totalWheels - 1);
                wheelY = startY + (i * spacing);
              }

              return (
                <rect
                  key={`left-wheel-${i}`}
                  x="75"
                  y={wheelY}
                  width="20"
                  height="25"
                  rx="3"
                  className={isDriveWheel
                    ? `fill-blue-300 dark:fill-blue-500 stroke-blue-600 dark:stroke-blue-400 stroke-[1.5] ${getHighlightClass('b')}`
                    : `fill-gray-300 dark:fill-gray-600 stroke-gray-500 dark:stroke-gray-400 stroke-1 ${getHighlightClass('z')}`
                  }
                />
              );
            })}

            {/* Right Wheels */}
            {Array.from({ length: totalWheels }, (_, i) => {
              const wheelNumber = (i * 2) + 2; // Position 0->wheel 2, 1->wheel 4, etc.
              const isDriveWheel = wheelNumber <= totalDriveWheels;

              let wheelY;
              if (totalWheels === 1) {
                wheelY = 220;
              } else {
                const startY = 140;
                const endY = 300;
                const spacing = (endY - startY) / (totalWheels - 1);
                wheelY = startY + (i * spacing);
              }

              return (
                <rect
                  key={`right-wheel-${i}`}
                  x="705"
                  y={wheelY}
                  width="20"
                  height="25"
                  rx="3"
                  className={isDriveWheel
                    ? `fill-blue-300 dark:fill-blue-500 stroke-blue-600 dark:stroke-blue-400 stroke-[1.5] ${getHighlightClass('b')}`
                    : `fill-gray-300 dark:fill-gray-600 stroke-gray-500 dark:stroke-gray-400 stroke-1 ${getHighlightClass('z')}`
                  }
                />
              );
            })}
          </g>

          {/* Drive System */}
          <g id="drive-system">
            {/* Generate motors for driving wheels following alternating pattern */}
            {Array.from({ length: totalDriveWheels }, (_, motorIndex) => {
              const driveWheelNumber = motorIndex + 1; // Drive wheel 1, 2, 3, 4, 5, 6...

              // Determine side and position based on odd/even wheel number
              const isOddWheel = driveWheelNumber % 2 === 1;
              const isLeftSide = isOddWheel; // Odd wheels (1,3,5) go to left, even wheels (2,4,6) go to right

              // Calculate position index on each side
              const positionOnSide = Math.floor((driveWheelNumber - (isLeftSide ? 1 : 2)) / 2);

              // Calculate wheel Y position that this motor will drive
              let wheelY;
              if (totalWheels === 1) {
                wheelY = 220;
              } else {
                const startY = 140;
                const endY = 300;
                const spacing = (endY - startY) / (totalWheels - 1);
                wheelY = startY + (positionOnSide * spacing);
              }

              // Position motor aligned with its corresponding wheel
              const motorX = isLeftSide ? 25 : 740;
              const motorY = wheelY - 5; // Align with wheel

              // Transmission shaft from motor to wheel
              const shaftX1 = isLeftSide ? motorX + 40 : motorX - 5;
              const shaftX2 = isLeftSide ? 75 : 705; // Connect to wheel
              const shaftY = wheelY + 7;

              return (
                <g key={`motor-${motorIndex}`} id={`motor-${driveWheelNumber}`}>
                  <rect
                    x={motorX}
                    y={motorY}
                    width="35"
                    height="35"
                    rx="4"
                    className={`fill-blue-200 dark:fill-blue-800 stroke-blue-600 dark:stroke-blue-400 stroke-[1.5] ${getHighlightClass('n_dc')}`}
                  />
                  <rect
                    x={motorX + (isLeftSide ? 30 : -15)}
                    y={motorY + 10}
                    width="15"
                    height="15"
                    rx="2"
                    className="fill-blue-300 dark:fill-blue-600 stroke-blue-600 dark:stroke-blue-400 stroke-[1.5]"
                  />
                  <line
                    x1={shaftX1}
                    y1={shaftY}
                    x2={shaftX2}
                    y2={shaftY}
                    className="stroke-gray-500 dark:stroke-gray-400 stroke-[3] stroke-linecap-round"
                  />
                  <text
                    x={motorX + 17}
                    y={motorY + 50}
                    textAnchor="middle"
                    className="text-[8px] font-medium fill-gray-700 dark:fill-gray-300"
                  >
                    ĐC{driveWheelNumber}
                  </text>
                </g>
              );
            })}
          </g>
          {/* Main Beam */}
          <rect x="100" y="220" width="600" height="25" className={`fill-gray-200 dark:fill-gray-700 stroke-gray-500 dark:stroke-gray-400 stroke-[1.5] ${getHighlightClass('Gc')}`}/>
          <HighlightableText x={400} y={210} label="Dầm chính" paramName="Gc" activeInput={activeInput} onHover={setHoveredInput} className="text-xs font-medium fill-gray-700 dark:fill-gray-300" />
        </g>

        {/* Trolley */}
        <g id="trolley">
          <rect
            x={100 + (trolleyPositionPercent / 100) * 600 - 30}
            y="195"
            width="60"
            height="50"
            className={`fill-indigo-200 dark:fill-indigo-800 stroke-indigo-500 dark:stroke-indigo-400 stroke-[1.5] ${getHighlightClass('x') || getHighlightClass('Gx')}`}
          />
          <line
            x1={100 + (trolleyPositionPercent / 100) * 600}
            y1="195"
            x2={100 + (trolleyPositionPercent / 100) * 600}
            y2="175"
            className="stroke-indigo-500 dark:stroke-indigo-400 stroke-1 stroke-dasharray-3"
          />
          <HighlightableText x={100 + (trolleyPositionPercent / 100) * 600} y={170} label="Xe con" paramName="Gx" activeInput={activeInput} onHover={setHoveredInput} className="text-xs font-medium fill-indigo-600 dark:fill-indigo-400" />
        </g>

        {/* Dimensions */}
        <g id="dimensions">
          {/* Span S */}
          <line x1="85" y1="350" x2="715" y2="350" className={`stroke-gray-600 dark:stroke-gray-400 stroke-[1.5] ${getHighlightClass('S')}`} markerStart="url(#arrow)" markerEnd="url(#arrow)"/>
          <line x1="85" y1="340" x2="85" y2="360" className="stroke-gray-400 dark:stroke-gray-500 stroke-1 stroke-dasharray-3"/>
          <line x1="715" y1="340" x2="715" y2="360" className="stroke-gray-400 dark:stroke-gray-500 stroke-1 stroke-dasharray-3"/>
          <HighlightableText x={400} y={340} label={`S = ${S_display.toFixed(1)} m`} paramName="S" activeInput={activeInput} onHover={setHoveredInput} className="text-xs font-semibold fill-gray-800 dark:fill-gray-200" />
          <text x="400" y="375" textAnchor="middle" className="text-xs font-medium fill-gray-600 dark:fill-gray-400">(Khẩu độ cầu trục)</text>

          {/* Trolley position x */}
          <line
            x1="85"
            y1="60"
            x2={100 + (trolleyPositionPercent / 100) * 600}
            y2="60"
            className={`stroke-gray-600 dark:stroke-gray-400 stroke-[1.5] ${getHighlightClass('x')}`} markerStart="url(#arrow)" markerEnd="url(#arrow)"
          />
          <line x1="85" y1="50" x2="85" y2="120" className="stroke-gray-400 dark:stroke-gray-500 stroke-1 stroke-dasharray-3"/>
          <line
            x1={100 + (trolleyPositionPercent / 100) * 600}
            y1="50"
            x2={100 + (trolleyPositionPercent / 100) * 600}
            y2="195"
            className="stroke-gray-400 dark:stroke-gray-500 stroke-1 stroke-dasharray-3"
          />
          <HighlightableText x={(85 + 100 + (trolleyPositionPercent / 100) * 600) / 2} y={50} label={`x = ${x_display.toFixed(1)} m`} paramName="x" activeInput={activeInput} onHover={setHoveredInput} className="text-xs font-semibold fill-gray-800 dark:fill-gray-200" />
          <text
            x={(85 + 100 + (trolleyPositionPercent / 100) * 600) / 2}
            y="80"
            textAnchor="middle"
            className="text-xs font-medium fill-gray-600 dark:fill-gray-400"
          >
            (Vị trí xe con)
          </text>

          {/* Rail width B */}
          <line x1="80" y1="30" x2="80" y2="15" className="stroke-gray-400 dark:stroke-gray-500 stroke-1 stroke-dasharray-3"/>
          <line x1="95" y1="30" x2="95" y2="15" className="stroke-gray-400 dark:stroke-gray-500 stroke-1 stroke-dasharray-3"/>
          <line x1="80" y1="25" x2="95" y2="25" className={`stroke-gray-600 dark:stroke-gray-400 stroke-[1.5] ${getHighlightClass('B')}`} markerStart="url(#arrow)" markerEnd="url(#arrow)"/>
          <HighlightableText x={87.5} y={12} label={`B=${B_display}mm`} paramName="B" activeInput={activeInput} onHover={setHoveredInput} className="text-[9px] font-semibold fill-gray-800 dark:fill-gray-200" />

          {/* Rail center lines */}
          <line x1="87.5" y1="40" x2="87.5" y2="380" className="stroke-blue-500 stroke-1 stroke-dasharray-4"/>
          <text x="87.5" y="395" textAnchor="middle" className="text-[9px] fill-blue-500">Tâm ray</text>
          <line x1="712.5" y1="40" x2="712.5" y2="380" className="stroke-blue-500 stroke-1 stroke-dasharray-4"/>
          <text x="712.5" y="395" textAnchor="middle" className="text-[9px] fill-blue-500">Tâm ray</text>
        </g>

        {/* Legend */}
        <g id="legend" transform="translate(520, 50)">
          <rect x="0" y="0" width="15" height="10" className="fill-blue-300 dark:fill-blue-500 stroke-blue-600 dark:stroke-blue-400 stroke-[1.5]"/>
          <text x="20" y="8" className="text-[9px] font-medium fill-gray-700 dark:fill-gray-300">Bánh xe chủ động ({totalDriveWheels})</text>

          <rect x="0" y="15" width="15" height="10" className="fill-gray-300 dark:fill-gray-600 stroke-gray-500 dark:stroke-gray-400 stroke-1"/>
          <text x="20" y="23" className="text-[9px] font-medium fill-gray-700 dark:fill-gray-300">Bánh xe bị động ({Math.max(0, totalWheels * 2 - totalDriveWheels)})</text>

          <rect x="0" y="30" width="15" height="10" className="fill-blue-200 dark:fill-blue-800 stroke-blue-600 dark:stroke-blue-400 stroke-[1.5]"/>
          <text x="20" y="38" className="text-[9px] font-medium fill-gray-700 dark:fill-gray-300">Động cơ ({totalDriveWheels})</text>

          <rect x="0" y="45" width="15" height="10" className="fill-indigo-200 dark:fill-indigo-800 stroke-indigo-500 dark:stroke-indigo-400 stroke-[1.5]"/>
          <text x="20" y="53" className="text-[9px] font-medium fill-gray-700 dark:fill-gray-300">Xe con</text>
        </g>
      </svg>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">Thông số hiển thị:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>Khẩu độ S: <span className="font-semibold text-gray-800 dark:text-gray-200">{S_display.toFixed(1)} m</span></div>
          <div>Vị trí xe con x: <span className="font-semibold text-gray-800 dark:text-gray-200">{x_display.toFixed(1)} m</span></div>
          <div>Bề rộng ray B: <span className="font-semibold text-gray-800 dark:text-gray-200">{B_display} mm</span></div>
          <div>Số bánh/đầu z: <span className="font-semibold text-gray-800 dark:text-gray-200">{inputs.z}</span></div>
          <div>Bánh chủ động b: <span className="font-semibold text-gray-800 dark:text-gray-200">{inputs.b}</span></div>
          <div>Số động cơ: <span className="font-semibold text-gray-800 dark:text-gray-200">{totalDriveWheels}</span></div>
          <div>Đường kính bánh D: <span className="font-semibold text-gray-800 dark:text-gray-200">{inputs.D} mm</span></div>
          <div>Bánh bị động: <span className="font-semibold text-gray-800 dark:text-gray-200">{Math.max(0, inputs.z * 2 - inputs.b)}</span></div>
        </div>
        {inputs.z > 6 && (
          <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
            * Chỉ hiển thị tối đa 6 bánh xe mỗi bên trên sơ đồ.
          </p>
        )}
        {inputs.b === 0 && (
          <p className="text-orange-600 dark:text-orange-400 text-xs mt-2">
            * Cảnh báo: Không có bánh xe chủ động (b=0), hệ thống không thể di chuyển.
          </p>
        )}
        {inputs.b > inputs.z * 2 && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-2">
            * Lỗi: Số bánh chủ động ({inputs.b}) không thể lớn hơn tổng số bánh xe ({inputs.z * 2}).
          </p>
        )}
      </div>
    </div>
  );
};