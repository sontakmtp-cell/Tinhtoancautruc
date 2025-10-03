import type { BeamInputs, CalculationResults } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface CrossSectionPolygon {
  id: string;
  points: Point[];
}

export interface CrossSectionGeometry {
  polygons: CrossSectionPolygon[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

const rectanglePoints = (xLeft: number, yBottom: number, width: number, height: number): Point[] => {
  const safeWidth = Math.max(width, 0);
  const safeHeight = Math.max(height, 0);
  return [
    { x: xLeft, y: yBottom },
    { x: xLeft + safeWidth, y: yBottom },
    { x: xLeft + safeWidth, y: yBottom + safeHeight },
    { x: xLeft, y: yBottom + safeHeight },
  ];
};

const computeBounds = (polygons: CrossSectionPolygon[]): CrossSectionGeometry['bounds'] => {
  if (!polygons.length) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  polygons.forEach(({ points }) => {
    points.forEach(({ x, y }) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
  });

  if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  return { minX, maxX, minY, maxY };
};

const mirrorPoints = (points: Point[]): Point[] => points.slice().reverse().map((pt) => ({ x: -pt.x, y: pt.y }));

export const buildCrossSectionGeometry = (
  inputs: BeamInputs,
  mode: CalculationResults['calculationMode'],
): CrossSectionGeometry => {
  const {
    b,
    h,
    t1,
    t2,
    t3,
    b1,
    b3,
    vBeamParams,
  } = inputs;

  const polygons: CrossSectionPolygon[] = [];

  const bottomFlangeWidth = Number.isFinite(b) ? b : 0;
  const topFlangeWidth = Number.isFinite(b3) ? b3 : bottomFlangeWidth;
  const bottomFlangeThickness = Number.isFinite(t1) ? t1 : 0;
  const topFlangeThickness = Number.isFinite(t2) ? t2 : 0;
  const webThickness = Number.isFinite(t3) ? t3 : 0;
  const clearWebSpacing = Number.isFinite(b1) ? b1 : 0;
  const totalHeight = Number.isFinite(h) ? h : bottomFlangeThickness + topFlangeThickness;

  const webHeight = Math.max(totalHeight - bottomFlangeThickness - topFlangeThickness, 0);
  const bottomFlangeY = 0;
  const bottomFlangeTopY = bottomFlangeY + bottomFlangeThickness;
  const topFlangeBottomY = Math.max(totalHeight - topFlangeThickness, bottomFlangeTopY);

  const pushStandardFlanges = () => {
    polygons.push({
      id: 'bottom-flange',
      points: rectanglePoints(-bottomFlangeWidth / 2, bottomFlangeY, bottomFlangeWidth, bottomFlangeThickness),
    });
    polygons.push({
      id: 'top-flange',
      points: rectanglePoints(-topFlangeWidth / 2, topFlangeBottomY, topFlangeWidth, topFlangeThickness),
    });
  };

  switch (mode) {
    case 'i-beam': {
      pushStandardFlanges();
      polygons.push({
        id: 'web',
        points: rectanglePoints(-webThickness / 2, bottomFlangeTopY, webThickness, webHeight),
      });
      break;
    }
    case 'single-girder':
    case 'double-girder': {
      pushStandardFlanges();
      const halfGap = clearWebSpacing / 2;
      polygons.push({
        id: 'left-web',
        points: rectanglePoints(-(halfGap + webThickness), bottomFlangeTopY, webThickness, webHeight),
      });
      polygons.push({
        id: 'right-web',
        points: rectanglePoints(halfGap, bottomFlangeTopY, webThickness, webHeight),
      });
      break;
    }
    case 'v-beam': {
      if (!vBeamParams) {
        pushStandardFlanges();
        break;
      }

      const {
        h1,
        h3,
        t4,
        webAngleDeg = 30,
        roofAngleDeg = 10,
      } = vBeamParams;

      const webAngle = (webAngleDeg * Math.PI) / 180;
      const roofAngle = (roofAngleDeg * Math.PI) / 180;
      const yJunc = bottomFlangeTopY + (Number.isFinite(h1) ? h1 : 0);

      polygons.push({
        id: 'bottom-flange',
        points: rectanglePoints(-bottomFlangeWidth / 2, bottomFlangeY, bottomFlangeWidth, bottomFlangeThickness),
      });

      if (h1 > 0 && t2 > 0) {
        polygons.push({
          id: 'central-web',
          points: rectanglePoints(-t2 / 2, bottomFlangeTopY, t2, h1),
        });
      }

      const sinWeb = Math.sin(webAngle);
      const cosWeb = Math.cos(webAngle);
      const webTopInnerR = {
        x: (t2 / 2) + (h3 * sinWeb),
        y: yJunc + (h3 * cosWeb),
      };
      const apexInnerY = webTopInnerR.y + Math.tan(roofAngle) * webTopInnerR.x;
      const apexInner = { x: 0, y: apexInnerY };
      const apexOuter = { x: 0, y: apexInnerY + t4 };

      const webNormal = { x: Math.cos(webAngle), y: -Math.sin(webAngle) };
      const webJuncOuterR = {
        x: (t2 / 2) + webThickness * webNormal.x,
        y: yJunc + webThickness * webNormal.y,
      };
      const webTopOuterR = {
        x: webTopInnerR.x + webThickness * webNormal.x,
        y: webTopInnerR.y + webThickness * webNormal.y,
      };

      const tanWeb = Math.tan(webAngle);
      const tanRoof = Math.tan(roofAngle);
      const cotWeb = tanWeb === 0 ? 0 : 1 / tanWeb;
      const denom = cotWeb + tanRoof;
      const xIntersect = denom === 0
        ? webTopOuterR.x
        : (apexOuter.y - webTopOuterR.y + cotWeb * webTopOuterR.x) / denom;
      const yIntersect = apexOuter.y - (tanRoof * xIntersect);
      const roofWebOuterCornerR = { x: xIntersect, y: yIntersect };

      const vWebRight = [
        { x: t2 / 2, y: yJunc },
        webTopInnerR,
        webTopOuterR,
        webJuncOuterR,
      ];
      polygons.push({ id: 'v-web-right', points: vWebRight });
      polygons.push({ id: 'v-web-left', points: mirrorPoints(vWebRight) });

      const roofRight = [
        webTopInnerR,
        apexInner,
        apexOuter,
        roofWebOuterCornerR,
      ];
      polygons.push({ id: 'roof-right', points: roofRight });
      polygons.push({ id: 'roof-left', points: mirrorPoints(roofRight) });
      break;
    }
    default: {
      pushStandardFlanges();
      polygons.push({
        id: 'web',
        points: rectanglePoints(-webThickness / 2, bottomFlangeTopY, webThickness, webHeight),
      });
    }
  }

  const bounds = computeBounds(polygons);

  return { polygons, bounds };
};