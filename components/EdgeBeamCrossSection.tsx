import React, { useMemo, useState } from 'react';
import type { EdgeBeamInputs } from '../types';

interface EdgeBeamCrossSectionProps {
  inputs: EdgeBeamInputs;
  activeInput?: keyof EdgeBeamInputs;
}

type BeamSide = 'left' | 'right';

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

const VIEW = {
  width: 800,
  height: 520,
  top: 72,
  bottom: 420,
  leftRailX: 140,
  rightRailX: 660,
  railWidth: 22,
  edgeBeamWidth: 54,
  mainBeamY: 246,
  mainBeamHeight: 28,
  railExtension: 54
};

const getWheelYPositions = (count: number) => {
  if (count <= 1) return [(VIEW.top + VIEW.bottom) / 2];

  const usableTop = VIEW.top + 54;
  const usableBottom = VIEW.bottom - 54;
  const gap = (usableBottom - usableTop) / (count - 1);

  return Array.from({ length: count }, (_, index) => usableTop + index * gap);
};

export const EdgeBeamCrossSection: React.FC<EdgeBeamCrossSectionProps> = ({ inputs, activeInput: propActiveInput }) => {
  const [hoveredInput, setHoveredInput] = useState<keyof EdgeBeamInputs | null>(null);
  const activeInput = propActiveInput || hoveredInput;

  const span = Math.max(inputs.S, 1);
  const trolleyPosition = Math.max(0, Math.min(inputs.x, span));
  const wheelRimWidth = Math.max(inputs.B, 10);
  const wheelsPerSide = Math.max(1, Math.min(Math.floor(inputs.z), 6));
  const requestedDriveWheels = Math.max(0, Math.floor(inputs.b));
  const totalWheels = wheelsPerSide * 2;
  const driveWheelCount = Math.min(requestedDriveWheels, totalWheels);
  const passiveWheelCount = Math.max(0, totalWheels - driveWheelCount);
  const trolleyX = VIEW.leftRailX + (trolleyPosition / span) * (VIEW.rightRailX - VIEW.leftRailX);
  const wheelYPositions = useMemo(() => getWheelYPositions(wheelsPerSide), [wheelsPerSide]);

  const getHighlightClass = (paramName: keyof EdgeBeamInputs) =>
    activeInput === paramName ? 'animate-pulse' : '';

  const isDriveWheel = (side: BeamSide, index: number) => {
    const wheelOrder = index * 2 + (side === 'left' ? 1 : 2);
    return wheelOrder <= driveWheelCount;
  };

  const renderWheelSet = (side: BeamSide) => {
    const railX = side === 'left' ? VIEW.leftRailX : VIEW.rightRailX;
    const wheelX = railX - 13;
    const motorX = side === 'left' ? railX - 82 : railX + 46;
    const gearboxX = side === 'left' ? railX - 47 : railX + 28;
    const shaftStartX = side === 'left' ? gearboxX + 18 : railX + 18;
    const shaftEndX = side === 'left' ? railX - 18 : gearboxX;

    return wheelYPositions.map((wheelY, index) => {
      const drive = isDriveWheel(side, index);
      const wheelNumber = index * 2 + (side === 'left' ? 1 : 2);

      return (
        <g key={`${side}-wheel-${index}`}>
          <rect
            x={wheelX}
            y={wheelY - 16}
            width="26"
            height="32"
            rx="6"
            className={drive
              ? `fill-blue-300 dark:fill-blue-500 stroke-blue-700 dark:stroke-blue-300 stroke-[1.5] ${getHighlightClass('b')}`
              : `fill-slate-300 dark:fill-slate-600 stroke-slate-600 dark:stroke-slate-400 stroke-[1.3] ${getHighlightClass('z')}`
            }
          />
          <line
            x1={railX - 18}
            y1={wheelY}
            x2={railX + 18}
            y2={wheelY}
            className="stroke-slate-500 dark:stroke-slate-300 stroke-[1.5]"
          />
          <circle
            cx={railX}
            cy={wheelY}
            r="3"
            className="fill-white dark:fill-slate-900 stroke-slate-600 dark:stroke-slate-300"
          />
          {drive && (
            <g>
              <rect
                x={motorX}
                y={wheelY - 16}
                width="34"
                height="32"
                rx="5"
                className={`fill-sky-100 dark:fill-sky-900 stroke-sky-700 dark:stroke-sky-300 stroke-[1.5] ${getHighlightClass('n_dc')}`}
              />
              <circle
                cx={motorX + 17}
                cy={wheelY}
                r="8"
                className="fill-sky-300 dark:fill-sky-600 stroke-sky-700 dark:stroke-sky-300"
              />
              <rect
                x={gearboxX}
                y={wheelY - 10}
                width="18"
                height="20"
                rx="3"
                className="fill-sky-200 dark:fill-sky-700 stroke-sky-700 dark:stroke-sky-300 stroke-[1.3]"
              />
              <line
                x1={shaftStartX}
                y1={wheelY}
                x2={shaftEndX}
                y2={wheelY}
                className="stroke-slate-600 dark:stroke-slate-300 stroke-[3] stroke-linecap-round"
              />
              <text
                x={motorX + 17}
                y={wheelY + 29}
                textAnchor="middle"
                className="text-[9px] font-semibold fill-sky-800 dark:fill-sky-200"
              >
                ĐC{wheelNumber}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="overflow-x-auto pb-2">
        <svg
          width="100%"
          height="520"
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          xmlns="http://www.w3.org/2000/svg"
          className="min-w-[720px] md:min-w-0 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600"
        >
        <defs>
          <marker id="edge-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-600 dark:fill-slate-300" />
          </marker>
          <pattern id="rail-hatch" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
          </pattern>
          <linearGradient id="beam-fill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" className="text-slate-100 dark:text-slate-700" stopColor="currentColor" />
            <stop offset="100%" className="text-slate-300 dark:text-slate-800" stopColor="currentColor" />
          </linearGradient>
        </defs>

        <text x="400" y="30" textAnchor="middle" className="text-base font-semibold fill-slate-800 dark:fill-slate-100">
          Sơ Đồ Cầu Trục - Hình Chiếu Bằng
        </text>

        <g id="runway-rails">
          {[VIEW.leftRailX, VIEW.rightRailX].map((railX, index) => (
            <g key={railX}>
              <rect
                x={railX - VIEW.railWidth / 2}
                y={VIEW.top - VIEW.railExtension}
                width={VIEW.railWidth}
                height={VIEW.bottom - VIEW.top + VIEW.railExtension * 2}
                fill="url(#rail-hatch)"
                className="stroke-slate-500 dark:stroke-slate-400 stroke-[1.5]"
              />
              <line
                x1={railX}
                y1={VIEW.top - VIEW.railExtension - 8}
                x2={railX}
                y2={VIEW.bottom + VIEW.railExtension + 8}
                className="stroke-blue-500 stroke-[1.2] stroke-dasharray-5"
              />
              <text
                x={index === 0 ? railX - 38 : railX + 38}
                y={(VIEW.top + VIEW.bottom) / 2}
                textAnchor="middle"
                transform={`rotate(${index === 0 ? -90 : 90}, ${index === 0 ? railX - 38 : railX + 38}, ${(VIEW.top + VIEW.bottom) / 2})`}
                className="text-xs font-medium fill-slate-600 dark:fill-slate-300"
              >
                Dầm biên
              </text>
            </g>
          ))}
        </g>

        <g id="edge-beams">
          {[VIEW.leftRailX, VIEW.rightRailX].map((railX, index) => (
            <g key={`edge-beam-${railX}`}>
              <rect
                x={railX - VIEW.edgeBeamWidth / 2}
                y={VIEW.top}
                width={VIEW.edgeBeamWidth}
                height={VIEW.bottom - VIEW.top}
                rx="8"
                fill="url(#beam-fill)"
                className={`stroke-slate-600 dark:stroke-slate-300 stroke-[1.7] ${getHighlightClass('z')}`}
              />
              <line
                x1={railX}
                y1={VIEW.top + 18}
                x2={railX}
                y2={VIEW.bottom - 18}
                className="stroke-slate-500/70 dark:stroke-slate-300/70 stroke-[1] stroke-dasharray-6"
              />
              <text
                x={index === 0 ? railX - 32 : railX + 32}
                y={VIEW.top - 18}
                textAnchor={index === 0 ? 'end' : 'start'}
                className="text-xs font-semibold fill-slate-700 dark:fill-slate-200"
              >
                Ray dọc nhà xưởng
              </text>
            </g>
          ))}
          {renderWheelSet('left')}
          {renderWheelSet('right')}
        </g>

        <g id="main-girder">
          <rect
            x={VIEW.leftRailX}
            y={VIEW.mainBeamY - VIEW.mainBeamHeight / 2}
            width={VIEW.rightRailX - VIEW.leftRailX}
            height={VIEW.mainBeamHeight}
            rx="7"
            className={`fill-slate-200 dark:fill-slate-700 stroke-slate-600 dark:stroke-slate-300 stroke-[1.7] ${getHighlightClass('Gc')}`}
          />
          <line
            x1={VIEW.leftRailX + 18}
            y1={VIEW.mainBeamY}
            x2={VIEW.rightRailX - 18}
            y2={VIEW.mainBeamY}
            className="stroke-slate-500 dark:stroke-slate-300 stroke-[1.2] stroke-dasharray-8"
          />
          <HighlightableText
            x={400}
            y={VIEW.mainBeamY - 24}
            label="Dầm chính"
            paramName="Gc"
            activeInput={activeInput}
            onHover={setHoveredInput}
            className="text-xs font-semibold fill-slate-700 dark:fill-slate-200"
          />
        </g>

        <g id="trolley">
          <line
            x1={trolleyX}
            y1={VIEW.mainBeamY - 64}
            x2={trolleyX}
            y2={VIEW.mainBeamY + 58}
            className={`stroke-indigo-500 dark:stroke-indigo-300 stroke-[1.3] stroke-dasharray-4 ${getHighlightClass('x')}`}
          />
          <rect
            x={trolleyX - 34}
            y={VIEW.mainBeamY - 44}
            width="68"
            height="58"
            rx="8"
            className={`fill-indigo-100 dark:fill-indigo-900 stroke-indigo-600 dark:stroke-indigo-300 stroke-[1.7] ${getHighlightClass('x')} ${getHighlightClass('Gx')}`}
          />
          <circle cx={trolleyX - 18} cy={VIEW.mainBeamY + 19} r="5" className="fill-indigo-400 dark:fill-indigo-300" />
          <circle cx={trolleyX + 18} cy={VIEW.mainBeamY + 19} r="5" className="fill-indigo-400 dark:fill-indigo-300" />
          <HighlightableText
            x={trolleyX}
            y={VIEW.mainBeamY - 54}
            label="Xe con"
            paramName="Gx"
            activeInput={activeInput}
            onHover={setHoveredInput}
            className="text-xs font-semibold fill-indigo-700 dark:fill-indigo-200"
          />
        </g>

        <g id="dimensions">
          <line
            x1={VIEW.leftRailX}
            y1="468"
            x2={VIEW.rightRailX}
            y2="468"
            className={`stroke-slate-600 dark:stroke-slate-300 stroke-[1.5] ${getHighlightClass('S')}`}
            markerStart="url(#edge-arrow)"
            markerEnd="url(#edge-arrow)"
          />
          <line x1={VIEW.leftRailX} y1="442" x2={VIEW.leftRailX} y2="486" className="stroke-slate-400 dark:stroke-slate-500 stroke-1 stroke-dasharray-4" />
          <line x1={VIEW.rightRailX} y1="442" x2={VIEW.rightRailX} y2="486" className="stroke-slate-400 dark:stroke-slate-500 stroke-1 stroke-dasharray-4" />
          <HighlightableText
            x="400"
            y="458"
            label={`S = ${span.toFixed(1)} m`}
            paramName="S"
            activeInput={activeInput}
            onHover={setHoveredInput}
            className="text-xs font-semibold fill-slate-800 dark:fill-slate-100"
          />
          <text x="400" y="493" textAnchor="middle" className="text-xs font-medium fill-slate-600 dark:fill-slate-300">
            Khẩu độ giữa hai tâm ray dầm biên
          </text>

          <line
            x1={VIEW.leftRailX}
            y1="64"
            x2={trolleyX}
            y2="64"
            className={`stroke-indigo-600 dark:stroke-indigo-300 stroke-[1.5] ${getHighlightClass('x')}`}
            markerStart="url(#edge-arrow)"
            markerEnd="url(#edge-arrow)"
          />
          <line x1={trolleyX} y1="58" x2={trolleyX} y2={VIEW.mainBeamY - 44} className="stroke-indigo-400 dark:stroke-indigo-300 stroke-1 stroke-dasharray-4" />
          <HighlightableText
            x={(VIEW.leftRailX + trolleyX) / 2}
            y="55"
            label={`x = ${trolleyPosition.toFixed(1)} m`}
            paramName="x"
            activeInput={activeInput}
            onHover={setHoveredInput}
            className="text-xs font-semibold fill-indigo-700 dark:fill-indigo-200"
          />

          <line x1={VIEW.leftRailX - 11} y1="438" x2={VIEW.leftRailX + 11} y2="438" className={`stroke-slate-600 dark:stroke-slate-300 stroke-[1.4] ${getHighlightClass('B')}`} markerStart="url(#edge-arrow)" markerEnd="url(#edge-arrow)" />
          <HighlightableText
            x={VIEW.leftRailX}
            y="455"
            label={`B = ${wheelRimWidth} mm`}
            paramName="B"
            activeInput={activeInput}
            onHover={setHoveredInput}
            className="text-[10px] font-semibold fill-slate-700 dark:fill-slate-200"
          />
        </g>

        <g id="legend" transform="translate(316, 82)">
          <rect x="0" y="0" width="168" height="86" rx="8" className="fill-white/90 dark:fill-slate-900/80 stroke-slate-200 dark:stroke-slate-700" />
          <rect x="12" y="14" width="18" height="14" rx="4" className="fill-blue-300 dark:fill-blue-500 stroke-blue-700 dark:stroke-blue-300" />
          <text x="38" y="25" className="text-[10px] font-medium fill-slate-700 dark:fill-slate-200">Bánh chủ động: {driveWheelCount}</text>
          <rect x="12" y="36" width="18" height="14" rx="4" className="fill-slate-300 dark:fill-slate-600 stroke-slate-600 dark:stroke-slate-300" />
          <text x="38" y="47" className="text-[10px] font-medium fill-slate-700 dark:fill-slate-200">Bánh bị động: {passiveWheelCount}</text>
          <circle cx="21" cy="66" r="8" className="fill-sky-300 dark:fill-sky-600 stroke-sky-700 dark:stroke-sky-300" />
          <text x="38" y="69" className="text-[10px] font-medium fill-slate-700 dark:fill-slate-200">Động cơ: {driveWheelCount}</text>
        </g>
        </svg>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">Thông số hiển thị:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>Khẩu độ S: <span className="font-semibold text-gray-800 dark:text-gray-200">{span.toFixed(1)} m</span></div>
          <div>Vị trí xe con x: <span className="font-semibold text-gray-800 dark:text-gray-200">{trolleyPosition.toFixed(1)} m</span></div>
          <div>Bề rộng vành B: <span className="font-semibold text-gray-800 dark:text-gray-200">{wheelRimWidth} mm</span></div>
          <div>Số bánh/ bên z: <span className="font-semibold text-gray-800 dark:text-gray-200">{inputs.z}</span></div>
          <div>Bánh chủ động b: <span className="font-semibold text-gray-800 dark:text-gray-200">{inputs.b}</span></div>
          <div>Động cơ hiển thị: <span className="font-semibold text-gray-800 dark:text-gray-200">{driveWheelCount}</span></div>
          <div>Đường kính bánh D: <span className="font-semibold text-gray-800 dark:text-gray-200">{inputs.D} mm</span></div>
          <div>Bánh bị động: <span className="font-semibold text-gray-800 dark:text-gray-200">{passiveWheelCount}</span></div>
        </div>
        {inputs.z > 6 && (
          <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
            * Chỉ hiển thị tối đa 6 bánh xe mỗi bên trên sơ đồ.
          </p>
        )}
        <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
          * Sơ đồ thể hiện mặt bằng: hai ray dọc nhà xưởng, hai dầm biên chạy trên ray, dầm chính nối giữa hai dầm biên và xe con di chuyển theo khẩu độ S.
        </p>
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
