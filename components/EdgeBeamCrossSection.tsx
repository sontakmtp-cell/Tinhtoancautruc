import React from 'react';
import type { EdgeBeamInputs } from '../types';

interface EdgeBeamCrossSectionProps {
  inputs: EdgeBeamInputs;
  activeInput?: keyof EdgeBeamInputs;
}

export const EdgeBeamCrossSection: React.FC<EdgeBeamCrossSectionProps> = ({ inputs, activeInput }) => {
  // Calculate scaled dimensions for display
  const S_display = Math.max(inputs.S, 1);
  const x_display = Math.max(0, Math.min(inputs.x, S_display));
  const B_display = Math.max(inputs.B, 10);
  
  // Calculate trolley position as percentage for SVG positioning
  const trolleyPositionPercent = S_display > 0 ? (x_display / S_display) * 100 : 10;
  
  // Highlight active parameter
  const getHighlightClass = (paramName: keyof EdgeBeamInputs) => {
    return activeInput === paramName ? 'crane-highlight' : '';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
      <style dangerouslySetInnerHTML={{
        __html: `
        .crane-highlight {
          filter: drop-shadow(0 0 8px #3b82f6);
          animation: pulse-highlight 2s infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% { filter: drop-shadow(0 0 8px #3b82f6); }
          50% { filter: drop-shadow(0 0 12px #60a5fa); }
        }
        
        .crane-label {
          font-size: 12px;
          font-weight: 500;
          fill: #1f2937;
        }
        
        .crane-param-label {
          font-size: 12px;
          font-weight: 600;
          fill: #1d4ed8;
        }
        
        .crane-main-component {
          fill: #e5e7eb;
          stroke: #6b7280;
          stroke-width: 1.5;
        }
        
        .crane-drive-component {
          fill: #bfdbfe;
          stroke: #2563eb;
          stroke-width: 1.5;
        }
        
        .crane-wheel-component {
          fill: #d1d5db;
          stroke: #4b5563;
          stroke-width: 1;
        }
        
        .crane-drive-wheel-component {
          fill: #93c5fd;
          stroke: #2563eb;
          stroke-width: 1.5;
        }
        
        .crane-trolley-component {
          fill: #c7d2fe;
          stroke: #4f46e5;
          stroke-width: 1.5;
        }
        
        .crane-dim-line {
          stroke: #4b5563;
          stroke-width: 1.5;
          marker-start: url(#arrow);
          marker-end: url(#arrow);
        }
        
        .crane-ext-line {
          stroke: #9ca3af;
          stroke-width: 1;
          stroke-dasharray: 3 3;
        }
        
        .crane-transmission-shaft {
          stroke: #6b7280;
          stroke-width: 3;
          stroke-linecap: round;
        }
        
        @media (max-width: 768px) {
          .crane-label { font-size: 10px; }
          .crane-param-label { font-size: 10px; }
        }
        `
      }} />
      
      <svg 
        width="100%" 
        height="400" 
        viewBox="0 0 800 400" 
        xmlns="http://www.w3.org/2000/svg" 
        className="border border-gray-300 dark:border-gray-600 rounded"
        style={{ backgroundColor: '#f9fafb' }}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
          </marker>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" stroke="#9ca3af" strokeWidth="0.5"/>
          </pattern>
        </defs>

        {/* Title */}
        <text x="400" y="25" textAnchor="middle" fontSize="16" fontWeight="600" fill="#111827">
          Sơ Đồ Cầu Trục - Hình Chiếu Bằng
        </text>

        {/* Rails */}
        <g id="rail-group">
          {/* Left Rail */}
          <rect x="80" y="40" width="15" height="320" fill="url(#hatch)" stroke="#4b5563"/>
          <rect x="80" y="40" width="15" height="320" fill="none" stroke="#4b5563" strokeWidth="1.5"/>
          <text x="65" y="200" className="crane-label" textAnchor="middle" transform="rotate(-90, 65, 200)">
            Ray trái
          </text>
          
          {/* Right Rail */}
          <rect x="705" y="40" width="15" height="320" fill="url(#hatch)" stroke="#4b5563"/>
          <rect x="705" y="40" width="15" height="320" fill="none" stroke="#4b5563" strokeWidth="1.5"/>
          <text x="740" y="200" className="crane-label" textAnchor="middle" transform="rotate(90, 740, 200)">
            Ray phải
          </text>
        </g>

        {/* Crane Bridge */}
        <g id="crane-bridge">
          {/* Edge Beams */}
          <rect x="70" y="120" width="30" height="200" className={`crane-main-component ${getHighlightClass('S')}`}/>
          <rect x="700" y="120" width="30" height="200" className={`crane-main-component ${getHighlightClass('S')}`}/>
          <text x="85" y="110" textAnchor="middle" className="crane-label">Dầm biên</text>

          {/* Wheels */}
          <g id="wheels">
            {/* Left Wheels */}
            {Array.from({ length: Math.max(1, Math.min(inputs.z, 6)) }, (_, i) => {
              // Left side has driving wheels 1, 3, 5, ... (odd numbered)
              // Check if this wheel position corresponds to an odd-numbered driving wheel
              const wheelNumber = (i * 2) + 1; // Position 0->wheel 1, position 1->wheel 3, position 2->wheel 5
              const isDriveWheel = wheelNumber <= inputs.b;
              
              const numWheels = Math.max(1, Math.min(inputs.z, 6));
              
              // Calculate wheel position - distribute evenly within beam bounds
              let wheelY;
              if (numWheels === 1) {
                wheelY = 200; // Center position for single wheel
              } else {
                const startY = 140; // Start a bit lower from top of beam
                const endY = 300;   // End a bit higher from bottom of beam
                const spacing = (endY - startY) / (numWheels - 1);
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
                    ? `crane-drive-wheel-component ${getHighlightClass('D')}` 
                    : `crane-wheel-component ${getHighlightClass('z')}`
                  }
                />
              );
            })}
            
            {/* Right Wheels */}
            {Array.from({ length: Math.max(1, Math.min(inputs.z, 6)) }, (_, i) => {
              // Right side has driving wheels 2, 4, 6, ... (even numbered)
              // Check if this wheel position corresponds to an even-numbered driving wheel
              const wheelNumber = (i * 2) + 2; // Position 0->wheel 2, position 1->wheel 4, position 2->wheel 6
              const isDriveWheel = wheelNumber <= inputs.b;
              
              const numWheels = Math.max(1, Math.min(inputs.z, 6));
              
              // Calculate wheel position - distribute evenly within beam bounds
              let wheelY;
              if (numWheels === 1) {
                wheelY = 200; // Center position for single wheel
              } else {
                const startY = 140; // Start a bit lower from top of beam
                const endY = 300;   // End a bit higher from bottom of beam
                const spacing = (endY - startY) / (numWheels - 1);
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
                    ? `crane-drive-wheel-component ${getHighlightClass('D')}` 
                    : `crane-wheel-component ${getHighlightClass('z')}`
                  }
                />
              );
            })}
          </g>

          {/* Drive System */}
          <g id="drive-system">
            {/* Generate motors for driving wheels following alternating pattern */}
            {Array.from({ length: Math.min(inputs.b, inputs.z * 2) }, (_, motorIndex) => {
              const driveWheelNumber = motorIndex + 1; // Drive wheel 1, 2, 3, 4, 5, 6...
              
              // Determine side and position based on odd/even wheel number
              const isOddWheel = driveWheelNumber % 2 === 1;
              const isLeftSide = isOddWheel; // Odd wheels (1,3,5) go to left, even wheels (2,4,6) go to right
              
              // Calculate position index on each side
              const positionOnSide = Math.floor((driveWheelNumber - (isLeftSide ? 1 : 2)) / 2);
              
              // Calculate wheel Y position that this motor will drive
              const totalWheelsPerSide = Math.max(1, Math.min(inputs.z, 6));
              let wheelY;
              if (totalWheelsPerSide === 1) {
                wheelY = 200; // Center position for single wheel
              } else {
                const startY = 140;
                const endY = 300;
                const spacing = (endY - startY) / (totalWheelsPerSide - 1);
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
                    className={`crane-drive-component ${getHighlightClass('n_dc')}`}
                  />
                  <rect 
                    x={motorX + (isLeftSide ? 30 : -15)} 
                    y={motorY + 10} 
                    width="15" 
                    height="15" 
                    rx="2" 
                    className="crane-drive-component" 
                    fill="#93c5fd"
                  />
                  <line 
                    x1={shaftX1} 
                    y1={shaftY} 
                    x2={shaftX2} 
                    y2={shaftY} 
                    className="crane-transmission-shaft"
                    strokeWidth="2"
                  />
                  <text 
                    x={motorX + 17} 
                    y={motorY + 50} 
                    textAnchor="middle" 
                    fontSize="8" 
                    className="crane-label"
                  >
                    ĐC{driveWheelNumber}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Main Beam */}
          <rect x="100" y="220" width="600" height="25" className={`crane-main-component ${getHighlightClass('Gc')}`}/>
          <text x="400" y="210" textAnchor="middle" className="crane-label">Dầm chính</text>
        </g>

        {/* Trolley */}
        <g id="trolley">
          <rect 
            x={100 + (trolleyPositionPercent / 100) * 600 - 30} 
            y="195" 
            width="60" 
            height="50" 
            className={`crane-trolley-component ${getHighlightClass('x') || getHighlightClass('Gx')}`}
          />
          <line 
            x1={100 + (trolleyPositionPercent / 100) * 600} 
            y1="195" 
            x2={100 + (trolleyPositionPercent / 100) * 600} 
            y2="175" 
            className="crane-ext-line" 
            stroke="#4f46e5"
          />
          <text 
            x={100 + (trolleyPositionPercent / 100) * 600} 
            y="170" 
            textAnchor="middle" 
            className="crane-label" 
            fill="#4f46e5"
          >
            Xe con
          </text>
        </g>

        {/* Dimensions */}
        <g id="dimensions">
          {/* Span S */}
          <line x1="85" y1="350" x2="715" y2="350" className={`crane-dim-line ${getHighlightClass('S')}`}/>
          <line x1="85" y1="340" x2="85" y2="360" className="crane-ext-line"/>
          <line x1="715" y1="340" x2="715" y2="360" className="crane-ext-line"/>
          <text x="400" y="340" textAnchor="middle" className={`crane-param-label ${getHighlightClass('S') ? 'crane-highlight' : ''}`}>
            S = {S_display.toFixed(1)} m
          </text>
          <text x="400" y="375" textAnchor="middle" className="crane-label">(Khẩu độ cầu trục)</text>
          
          {/* Trolley position x */}
          <line 
            x1="85" 
            y1="60" 
            x2={100 + (trolleyPositionPercent / 100) * 600} 
            y2="60" 
            className={`crane-dim-line ${getHighlightClass('x')}`}
          />
          <line x1="85" y1="50" x2="85" y2="120" className="crane-ext-line"/>
          <line 
            x1={100 + (trolleyPositionPercent / 100) * 600} 
            y1="50" 
            x2={100 + (trolleyPositionPercent / 100) * 600} 
            y2="195" 
            className="crane-ext-line"
          />
          <text 
            x={(85 + 100 + (trolleyPositionPercent / 100) * 600) / 2} 
            y="50" 
            textAnchor="middle" 
            className={`crane-param-label ${getHighlightClass('x') ? 'crane-highlight' : ''}`}
          >
            x = {x_display.toFixed(1)} m
          </text>
          <text 
            x={(85 + 100 + (trolleyPositionPercent / 100) * 600) / 2} 
            y="80" 
            textAnchor="middle" 
            className="crane-label"
          >
            (Vị trí xe con)
          </text>
          
          {/* Rail width B */}
          <line x1="80" y1="30" x2="80" y2="15" className="crane-ext-line"/>
          <line x1="95" y1="30" x2="95" y2="15" className="crane-ext-line"/>
          <line x1="80" y1="25" x2="95" y2="25" className={`crane-dim-line ${getHighlightClass('B')}`}/>
          <text x="87.5" y="12" textAnchor="middle" fontSize="9" className={`crane-param-label ${getHighlightClass('B') ? 'crane-highlight' : ''}`}>
            B = {B_display}mm
          </text>

          {/* Rail center lines */}
          <line x1="87.5" y1="40" x2="87.5" y2="380" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4"/>
          <text x="87.5" y="395" textAnchor="middle" fontSize="9" fill="#3b82f6">Tâm ray</text>
          <line x1="712.5" y1="40" x2="712.5" y2="380" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4"/>
          <text x="712.5" y="395" textAnchor="middle" fontSize="9" fill="#3b82f6">Tâm ray</text>
        </g>

        {/* Legend */}
        <g id="legend" transform="translate(520, 50)">
          <rect x="0" y="0" width="15" height="10" className="crane-drive-wheel-component"/>
          <text x="20" y="8" fontSize="9" className="crane-label">Bánh xe chủ động ({inputs.b})</text>
          
          <rect x="0" y="15" width="15" height="10" className="crane-wheel-component"/>
          <text x="20" y="23" fontSize="9" className="crane-label">Bánh xe bị động ({Math.max(0, inputs.z * 2 - inputs.b)})</text>
          
          <rect x="0" y="30" width="15" height="10" className="crane-drive-component"/>
          <text x="20" y="38" fontSize="9" className="crane-label">Động cơ ({Math.min(inputs.b, inputs.z * 2)})</text>
          
          <rect x="0" y="45" width="15" height="10" className="crane-trolley-component"/>
          <text x="20" y="53" fontSize="9" className="crane-label">Xe con</text>
        </g>
      </svg>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-2">Thông số hiển thị:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>Khẩu độ S: <span className="font-semibold">{S_display.toFixed(1)} m</span></div>
          <div>Vị trí xe con x: <span className="font-semibold">{x_display.toFixed(1)} m</span></div>
          <div>Bề rộng ray B: <span className="font-semibold">{B_display} mm</span></div>
          <div>Số bánh/đầu z: <span className="font-semibold">{inputs.z}</span></div>
          <div>Bánh chủ động b: <span className="font-semibold">{inputs.b}</span></div>
          <div>Số động cơ: <span className="font-semibold">{Math.min(inputs.b, inputs.z * 2)}</span></div>
          <div>Đường kính bánh D: <span className="font-semibold">{inputs.D} mm</span></div>
          <div>Bánh bị động: <span className="font-semibold">{Math.max(0, inputs.z * 2 - inputs.b)}</span></div>
        </div>
        {inputs.z > 6 && (
          <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
            * Chỉ hiển thị tối đa 6 bánh xe trên hình vẽ
          </p>
        )}
        {inputs.b === 0 && (
          <p className="text-orange-600 dark:text-orange-400 text-xs mt-2">
            * Không có bánh xe chủ động, không hiển thị động cơ
          </p>
        )}
        {inputs.b > inputs.z * 2 && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-2">
            * Số bánh chủ động không thể lớn hơn tổng số bánh xe ({inputs.z * 2})
          </p>
        )}
      </div>
    </div>
  );
};