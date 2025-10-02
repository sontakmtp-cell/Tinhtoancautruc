import React from 'react';

interface DimensionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  isHighlighted?: boolean;
  position?: "left" | "right" | "top" | "bottom";
  offset?: number; // Khoảng cách từ đối tượng đến đường kích thước
  textOrientation?: "horizontal" | "vertical"; // Hướng của chữ
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Dimension: React.FC<DimensionProps> = (props) => {
  const {
    x1, y1, x2, y2, label,
    isHighlighted, position = "bottom",
    offset = 20,
    textOrientation = "horizontal",
    onMouseEnter, onMouseLeave
  } = props;

  const tick = 3;
  const c = isHighlighted ? "#22c55e" : "#94a3b8";

  let line1, line2, textPos: { x: number; y: number };

  if (position === "left" || position === "right") {
    const x = position === "left" ? Math.min(x1, x2) - offset : Math.max(x1, x2) + offset;
    line1 = { x1: x - tick, y1, x2: x + tick, y2: y1 };
    line2 = { x1: x - tick, y1: y2, x2: x + tick, y2: y2 };
    textPos = { x, y: (y1 + y2) / 2 };
  } else {
    const y = position === "top" ? Math.min(y1, y2) - offset : Math.max(y1, y2) + offset;
    line1 = { x1, y1: y - tick, x2: x1, y2: y + tick };
    line2 = { x1: x2, y1: y - tick, x2: x2, y2: y + tick };
    textPos = { x: (x1 + x2) / 2, y };
  }

  return (
    <g stroke={c} fill={c} strokeWidth={1} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* Dimension line */}
      <line
        x1={position === "left" || position === "right" ? textPos.x : x1}
        y1={position === "top" || position === "bottom" ? textPos.y : y1}
        x2={position === "left" || position === "right" ? textPos.x : x2}
        y2={position === "top" || position === "bottom" ? textPos.y : y2}
      />
      {/* Ticks */}
      <line {...line1} />
      <line {...line2} />
      {/* Extension lines */}
      <line x1={x1} y1={y1}
            x2={position === "left" || position === "right" ? textPos.x + (position === "left" ? tick : -tick) : x1}
            y2={position === "top" || position === "bottom" ? textPos.y + (position === "top" ? tick : -tick) : y1}
            strokeDasharray="2 2" opacity={0.7}/>
      <line x1={x2} y1={y2}
            x2={position === "left" || position === "right" ? textPos.x + (position === "left" ? tick : -tick) : x2}
            y2={position === "top" || position === "bottom" ? textPos.y + (position === "top" ? tick : -tick) : y2}
            strokeDasharray="2 2" opacity={0.7}/>
      {/* Text */}
      <text x={textPos.x}
            y={textPos.y}
            dy={(position === "bottom" || (textOrientation === "vertical" && (position === "left" || position === "right"))) ? "1.2em" : position === "top" ? "-0.5em" : "0.35em"}
            dx={(textOrientation === "horizontal" && position === "left") ? "-0.5em" : (textOrientation === "horizontal" && position === "right") ? "0.5em" : 0}
            textAnchor={(textOrientation === "horizontal" && position === "left") ? "end" : (textOrientation === "horizontal" && position === "right") ? "start" : "middle"}
            transform={textOrientation === 'vertical' && (position === 'left' || position === 'right') ? `rotate(-90 ${textPos.x} ${textPos.y})` : ''}
            className="font-semibold text-xs">
        {label}
      </text>
    </g>
  );
};