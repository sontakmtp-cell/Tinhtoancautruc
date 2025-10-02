import React, { useMemo, useState } from "react";
import { Dimension } from "./Dimension";

interface VBeamCrossSectionProps {
  inputs: {
    t3: number; // Độ dày V-web
    h3: number; // Chiều dài V-web (đo theo cạnh nghiêng)
    t4: number; // Độ dày mái (đo thẳng đứng)
    b1: number; // Rộng cánh đáy
    t1: number; // Dày cánh đáy
    t2: number; // Dày thân thẳng đứng giữa
    h1: number; // Cao thân thẳng đứng giữa (từ đỉnh cánh đáy đến nút V)
  };
  activeInput?: keyof VBeamCrossSectionProps["inputs"];
}

type K = keyof VBeamCrossSectionProps["inputs"];

export const VBeamCrossSection: React.FC<VBeamCrossSectionProps> = ({ inputs, activeInput }) => {
  const [hover, setHover] = useState<K | null>(null);

  // Góc thiết kế
  const a1 = 30 * Math.PI / 180; // web so với phương thẳng đứng
  const alpha = 10 * Math.PI / 180; // mái so với phương ngang

  const {
    t3, h3, t4, b1, t1, t2, h1
  } = inputs;

  // Tính toán hình học dựa trên đầu vào
  const geom = useMemo(() => {
    // Gốc tọa độ (0,0) ở tâm cánh đáy, trục y hướng lên
    const yJunc = t1 + h1; // Cao độ nút giao V (từ đáy)

    // --- TÍNH TOÁN CÁC ĐIỂM BIÊN TRONG (INNER) ---
    // Điểm trên của V-web (biên trong), bắt đầu từ mép của thân đứng t2
    const webTopInnerR = {
      x: t2 / 2 + h3 * Math.sin(a1),
      y: yJunc + h3 * Math.cos(a1)
    };
    
    // Đỉnh mái (biên trong) được xác định bởi đường thẳng dốc alpha đi qua webTopInnerR
    // y = y_web + tan(alpha) * (x_apex - x_web) -> y_apex = y_web + tan(alpha) * x_web (vì x_apex = 0)
    const yApexInner = webTopInnerR.y + Math.tan(alpha) * webTopInnerR.x;
    const apexInner = { x: 0, y: yApexInner };

    // --- TÍNH TOÁN CÁC ĐIỂM BIÊN NGOÀI (OUTER) ---
    // Đỉnh mái (biên ngoài), dày t4 theo phương đứng
    const apexOuter = { x: 0, y: yApexInner + t4 };

    // Các điểm biên ngoài của V-web, dày t3 vuông góc với thân web
    const webNormal = { x: Math.cos(a1), y: -Math.sin(a1) }; // Vector pháp tuyến của web phải
    const webJuncOuterR = {
      x: t2 / 2 + t3 * webNormal.x,
      y: yJunc + t3 * webNormal.y
    };
    const webTopOuterR = {
      x: webTopInnerR.x + t3 * webNormal.x,
      y: webTopInnerR.y + t3 * webNormal.y
    };

    // Tìm giao điểm của đường mái ngoài và đường web ngoài
    // Pt đường mái ngoài: y = apexOuter.y - tan(alpha) * x
    // Pt đường web ngoài: (y - webTopOuterR.y) = cot(a1) * (x - webTopOuterR.x)
    const tan_a1 = Math.tan(a1);
    const tan_alpha = Math.tan(alpha);
    const cot_a1 = 1 / tan_a1;

    const x_intersect = (apexOuter.y - webTopOuterR.y + cot_a1 * webTopOuterR.x) / (cot_a1 + tan_alpha);
    const y_intersect = apexOuter.y - tan_alpha * x_intersect;
    const roofWebOuterCornerR = { x: x_intersect, y: y_intersect };

    // --- CÁC KÍCH THƯỚC SUY RA ---
    const H1_from_bottom = t1 + h1; // H1 tính từ đáy
    const H2_from_bottom = webTopInnerR.y;
    const H3 = yApexInner - webTopInnerR.y;
    const H_total = yApexInner + t4; // Tổng chiều cao đến đỉnh ngoài
    
    const Ld = webTopInnerR.x;
    const Lb = roofWebOuterCornerR.x;
    const La = 2 * Lb;
    const Lc = Lb; // Đối xứng
    const d = Math.hypot(roofWebOuterCornerR.x - webTopOuterR.x, roofWebOuterCornerR.y - webTopOuterR.y);

    return {
      // Các điểm hình học đối xứng bên phải
      webTopInnerR, apexInner, apexOuter, webJuncOuterR, webTopOuterR, roofWebOuterCornerR,
      // Các kích thước suy ra
      H: H_total,
      H1: H1_from_bottom,
      H2: H2_from_bottom,
      H3, La, Lb, Lc, Ld, d,
      // phụ trợ
      yJunc,
      baseWidth: b1,
      halfTopOuter: Lb,
    };
  }, [t1, h1, h3, t3, t4, t2, b1, a1, alpha]);

  // Thiết lập khung vẽ
  const W = 860, Hsvg = 620, pad = 80;
  const maxX = Math.max(geom.halfTopOuter, b1 / 2) + 60;
  const maxY = geom.H + 40;
  const scale = Math.min((W - 2 * pad) / (2 * maxX), (Hsvg - 2 * pad) / maxY);
  const S = (v: number) => v * scale;

  const cx = W / 2;
  const by = Hsvg - pad;

  const partHL: Record<string, K[]> = {
    "base-flange": ["b1", "t1"],
    "base-web": ["t2", "h1"],
    "v-web": ["t3", "h3"],
    "v-roof": ["t4"]
  };
  const isPartHL = (name: string) =>
    (hover && partHL[name]?.includes(hover)) ||
    (activeInput && partHL[name]?.includes(activeInput));

  const fill = "fill-blue-600/80 dark:fill-blue-500/80";
  const fillHL = "fill-green-500/80 dark:fill-green-400/80 animate-pulse";
  const stroke = "#9ca3af";

  const toXY = (p: {x: number, y: number}) => ({ x: cx + S(p.x), y: by - S(p.y) });
  const toXYMirror = (p: {x: number, y: number}) => ({ x: cx - S(p.x), y: by - S(p.y) });

  // Các điểm toạ độ pixel
  const P = {
    apexIn: toXY(geom.apexInner),
    apexOut: toXY(geom.apexOuter),
    webInR: toXY(geom.webTopInnerR),
    webInL: toXYMirror(geom.webTopInnerR),
    webOutR: toXY(geom.webTopOuterR),
    webOutL: toXYMirror(geom.webTopOuterR),
    juncOutR: toXY(geom.webJuncOuterR),
    juncOutL: toXYMirror(geom.webJuncOuterR),
    roofWebCornerR: toXY(geom.roofWebOuterCornerR),
    roofWebCornerL: toXYMirror(geom.roofWebOuterCornerR),
  };

  const poly4 = (p1: {x:number;y:number}, p2:{x:number;y:number}, p3:{x:number;y:number}, p4:{x:number;y:number}) =>
    `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;

  const dimHL = (k: K) => (activeInput === k || hover === k);

  const dx = P.webInR.x - (cx + S(t2 / 2)), dy = P.webInR.y - (by - S(geom.yJunc));
  const len = Math.hypot(dx, dy) || 1;
  const nx = (dy / len), ny = (-dx / len);

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="w-full h-[620px]">
        <svg viewBox={`0 0 ${W} ${Hsvg}`} className="w-full h-full">
          {/* Trục đối xứng */}
          <line x1={cx} y1={P.apexOut.y - 20} x2={cx} y2={by + 20} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="5 3" />

          {/* Cấu kiện */}
          {/* Cánh đáy */}
          <rect
            x={cx - S(b1 / 2)} y={by - S(t1)}
            width={S(b1)} height={S(t1)}
            className={isPartHL("base-flange") ? fillHL : fill}
            stroke={stroke} strokeWidth="0.6"
          />

          {/* Thân giữa (đứng) */}
          <rect
            x={cx - S(t2/2)} y={by - S(t1 + h1)}
            width={S(t2)} height={S(h1)}
            className={isPartHL("base-web") ? fillHL : fill}
            stroke={stroke} strokeWidth="0.6"
          />

          {/* Web nghiêng phải */}
          <polygon
            points={poly4(
              { x: cx + S(t2/2), y: by - S(geom.yJunc) },
              P.webInR, P.webOutR, P.juncOutR
            )}
            className={isPartHL("v-web") ? fillHL : fill}
            stroke={stroke} strokeWidth="0.6"
          />
           {/* Web nghiêng trái */}
           <polygon
            points={poly4(
              { x: cx - S(t2/2), y: by - S(geom.yJunc) },
              P.webInL, P.webOutL, P.juncOutL
            )}
            className={isPartHL("v-web") ? fillHL : fill}
            stroke={stroke} strokeWidth="0.6"
          />

          {/* Mái phải */}
          <polygon
            points={poly4(P.webInR, P.apexIn, P.apexOut, P.roofWebCornerR)}
            className={isPartHL("v-roof") ? fillHL : fill}
            stroke={stroke} strokeWidth="0.6"
          />
          {/* Mái trái */}
          <polygon
            points={poly4(P.webInL, P.apexIn, P.apexOut, P.roofWebCornerL)}
            className={isPartHL("v-roof") ? fillHL : fill}
            stroke={stroke} strokeWidth="0.6"
          />

          {/* --- Dimensions --- */}
          <Dimension
            x1={cx - S(b1 / 2)} y1={by} x2={cx + S(b1 / 2)} y2={by}
            label={`b1 = ${b1.toFixed(2)}`} isHighlighted={dimHL("b1")}
            onMouseEnter={() => setHover("b1")} onMouseLeave={() => setHover(null)}
          />
          <Dimension
            x1={cx + S(b1 / 2)} y1={by} x2={cx + S(b1 / 2)} y2={by - S(t1)}
            label={`t1 = ${t1.toFixed(2)}`} position="right" isHighlighted={dimHL("t1")}
            onMouseEnter={() => setHover("t1")} onMouseLeave={() => setHover(null)}
          />
          <Dimension
            x1={cx - S(b1 / 2)} y1={by - S(t1)} x2={cx - S(b1 / 2)} y2={by - S(geom.yJunc)}
            label={`h1 = ${h1.toFixed(2)}`} position="left" isHighlighted={dimHL("h1")}
            onMouseEnter={() => setHover("h1")} onMouseLeave={() => setHover(null)}
          />
          {/* t2 leader */}
          <g stroke={dimHL("t2") ? "#22c55e" : "#94a3b8"} fill={dimHL("t2") ? "#22c55e" : "#94a3b8"} onMouseEnter={() => setHover("t2")} onMouseLeave={() => setHover(null)}>
            <line x1={cx + S(b1 / 2) + 20} y1={by - S(t1 + h1 / 2)} x2={cx} y2={by - S(t1 + h1 / 2)} />
            <text x={cx + S(b1 / 2) + 24} y={by - S(t1 + h1 / 2)} className="text-xs font-semibold" dominantBaseline="middle">
              {`t2 = ${t2.toFixed(2)}`}
            </text>
          </g>

          {/* h3 (đo dọc V-web) */}
          <g stroke={dimHL("h3") ? "#22c55e" : "#94a3b8"} fill="none" onMouseEnter={() => setHover("h3")} onMouseLeave={() => setHover(null)}>
            <line x1={cx + S(t2/2) + nx*25} y1={by - S(geom.yJunc) + ny*25} x2={P.webInR.x + nx*25} y2={P.webInR.y + ny*25}/>
            <line x1={cx + S(t2/2)} y1={by - S(geom.yJunc)} x2={cx + S(t2/2) + nx*25} y2={by - S(geom.yJunc) + ny*25} strokeDasharray="3 3" opacity={0.7}/>
            <line x1={P.webInR.x} y1={P.webInR.y} x2={P.webInR.x + nx*25} y2={P.webInR.y + ny*25} strokeDasharray="3 3" opacity={0.7}/>
            <text x={(cx + S(t2/2) + P.webInR.x)/2 + nx*32} y={(by - S(geom.yJunc) + P.webInR.y)/2 + ny*32}
                  className="text-xs font-semibold" dominantBaseline="middle" textAnchor="middle" fill={dimHL("h3") ? "#22c55e" : "#94a3b8"}
                  transform={`rotate(${-60} ${(cx + S(t2/2) + P.webInR.x)/2 + nx*32} ${(by - S(geom.yJunc) + P.webInR.y)/2 + ny*32})`}>
              {`h3 = ${h3.toFixed(2)}`}
            </text>
          </g>

          {/* t3, t4 leader */}
          <g stroke={dimHL("t3") ? "#22c55e" : "#94a3b8"} fill={dimHL("t3") ? "#22c55e" : "#94a3b8"} onMouseEnter={() => setHover("t3")} onMouseLeave={() => setHover(null)}>
             <line x1={ (P.juncOutR.x + P.webOutR.x)/2 + 40 } y1={ (P.juncOutR.y + P.webOutR.y)/2 } x2={ (cx + S(t2/2) + P.webInR.x)/2 } y2={ (by - S(geom.yJunc) + P.webInR.y)/2 }/>
             <text x={ (P.juncOutR.x + P.webOutR.x)/2 + 44 } y={ (P.juncOutR.y + P.webOutR.y)/2 } className="text-xs font-semibold" dominantBaseline="middle">
              {`t3 = ${t3.toFixed(2)}`}
            </text>
          </g>
          <g stroke={dimHL("t4") ? "#22c55e" : "#94a3b8"} fill={dimHL("t4") ? "#22c55e" : "#94a3b8"} onMouseEnter={() => setHover("t4")} onMouseLeave={() => setHover(null)}>
             <line x1={ (P.roofWebCornerL.x + P.apexOut.x)/2 - 40 } y1={ (P.roofWebCornerL.y + P.apexOut.y)/2 } x2={ (P.webInL.x + P.apexIn.x)/2 } y2={ (P.webInL.y + P.apexIn.y)/2 }/>
             <text x={ (P.roofWebCornerL.x + P.apexOut.x)/2 - 44 } y={ (P.roofWebCornerL.y + P.apexOut.y)/2 } textAnchor="end" className="text-xs font-semibold" dominantBaseline="middle">
               {`t4 = ${t4.toFixed(2)}`}
             </text>
          </g>

          {/* Các kích thước suy ra */}
          <Dimension x1={P.roofWebCornerR.x} y1={P.apexOut.y} x2={P.roofWebCornerR.x} y2={by} label={`H = ${geom.H.toFixed(2)}`} position="right" offset={80} textOrientation="vertical" />
          <Dimension x1={P.roofWebCornerR.x} y1={P.webInR.y} x2={P.roofWebCornerR.x} y2={by} label={`H2 = ${geom.H2.toFixed(2)}`} position="right" offset={60} textOrientation="vertical" />
          <Dimension x1={P.roofWebCornerR.x} y1={by - S(geom.yJunc)} x2={P.roofWebCornerR.x} y2={by} label={`H1 = ${geom.H1.toFixed(2)}`} position="right" offset={40} textOrientation="vertical" />
          <Dimension x1={P.roofWebCornerL.x} y1={P.apexIn.y} x2={P.roofWebCornerL.x} y2={P.webInL.y} label={`H3 = ${geom.H3.toFixed(2)}`} position="left" offset={40} />

          {/* La, Lb, Ld, Lc */}
          <Dimension x1={P.roofWebCornerL.x} y1={P.apexOut.y} x2={P.roofWebCornerR.x} y2={P.apexOut.y} label={`La = ${geom.La.toFixed(2)}`} position="top" offset={50} />
          <Dimension x1={cx} y1={P.apexOut.y} x2={P.roofWebCornerR.x} y2={P.apexOut.y} label={`Lb = ${geom.Lb.toFixed(2)}`} position="top" offset={30} />
          <Dimension x1={cx} y1={P.apexIn.y} x2={P.webInR.x} y2={P.apexIn.y} label={`Ld = ${geom.Ld.toFixed(2)}`} position="top" offset={10} />
          <Dimension x1={P.roofWebCornerL.x} y1={P.webInL.y} x2={cx} y2={P.webInL.y} label={`Lc = ${geom.Lc.toFixed(2)}`} position="bottom" offset={10} />

          {/* Góc a1, alpha */}
          <g fill="#94a3b8">
            <path d={`M ${cx + S(t2/2 + 22)} ${by - S(geom.yJunc)} A ${S(22)} ${S(22)} 0 0 0 ${cx + S(t2/2 + 22*Math.sin(a1))} ${by - S(geom.yJunc + 22*Math.cos(a1))}`} fill="none" stroke="#94a3b8"/>
            <text x={cx + S(t2/2 + 26)} y={by - S(geom.yJunc) - S(10)} className="text-xs font-semibold">{`a1 = 30°`}</text>

            <path d={`M ${P.apexIn.x + S(22)} ${P.apexIn.y} A ${S(22)} ${S(22)} 0 0 1 ${P.apexIn.x + S(22*Math.cos(alpha))} ${P.apexIn.y + S(22*Math.sin(alpha))}`} fill="none" stroke="#94a3b8"/>
            <text x={P.apexIn.x + S(26)} y={P.apexIn.y + S(14)} className="text-xs font-semibold">{`α = 10°`}</text>
          </g>
        </svg>
      </div>
    </div>
  );
};