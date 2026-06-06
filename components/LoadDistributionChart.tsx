import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { EdgeBeamInputs } from '../types';
import { ChartFrame } from './ChartFrame';
import { useChartTheme } from './chartTheme';

interface LoadDistributionChartProps {
  inputs: EdgeBeamInputs;
}

interface LoadData {
  x: number;
  R_L: number;
  R_R: number;
  N_max: number;
}

const calculateLoadAtPosition = (inputs: EdgeBeamInputs, x: number) => {
  const span = inputs.S > 0 ? inputs.S : 1;
  const wheelsPerEnd = inputs.z > 0 ? inputs.z : 1;
  const liftedLoad = inputs.Q + inputs.Gx;
  const R_L = inputs.Gc / 2 + (liftedLoad * (span - x)) / span;
  const R_R = inputs.Gc / 2 + (liftedLoad * x) / span;

  return { R_L, R_R, N_max: Math.max(R_L, R_R) / wheelsPerEnd };
};

const generateLoadData = (inputs: EdgeBeamInputs): LoadData[] => {
  const span = Math.max(inputs.S, 0);
  const numberOfPoints = 51;
  const step = span / (numberOfPoints - 1);

  return Array.from({ length: numberOfPoints }, (_, index) => {
    const x = index * step;
    const loads = calculateLoadAtPosition(inputs, x);
    return {
      x: Math.round(x * 100) / 100,
      R_L: Math.round(loads.R_L * 10) / 10,
      R_R: Math.round(loads.R_R * 10) / 10,
      N_max: Math.round(loads.N_max * 10) / 10,
    };
  });
};

const formatValue = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value);

export const LoadDistributionChart: React.FC<LoadDistributionChartProps> = ({ inputs }) => {
  const { t } = useTranslation();
  const theme = useChartTheme();
  const data = useMemo(() => generateLoadData(inputs), [inputs]);
  const critical = data.reduce((max, point) => (point.N_max > max.N_max ? point : max), data[0]);

  const tooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-lg border px-3 py-2 text-xs shadow-lg"
        style={{ background: theme.tooltipBackground, borderColor: theme.grid, color: theme.text }}
      >
        <p className="mb-1 font-semibold">{t('Trolley position')}: {label} m</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex min-w-52 items-center justify-between gap-4 py-0.5">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-mono font-semibold">{formatValue(entry.value)} kg</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ChartFrame
      id="load-distribution-chart"
      title={t('Load Distribution by Trolley Position')}
      description={t('This diagram shows how reactions and wheel loads change as the trolley moves along the main beam')}
      insight={(
        <span>
          <strong className="font-mono">{formatValue(critical.N_max)} kg</strong>
          {' · '}{t('Max Wheel Load (N_max)')}
        </span>
      )}
      footer={(
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
          {[
            [theme.comparison, t('Left Reaction (R_L)'), false],
            [theme.primary, t('Right Reaction (R_R)'), false],
            [theme.critical, t('Max Wheel Load (N_max)'), true],
          ].map(([color, label, dashed]) => (
            <span key={String(label)} className="flex items-center gap-2">
              <span
                className="block w-7 border-t-2"
                style={{ borderColor: String(color), borderStyle: dashed ? 'dashed' : 'solid' }}
              />
              {label}
            </span>
          ))}
        </div>
      )}
    >
      <div className="h-[320px] w-full sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 18, left: 0, bottom: 12 }}>
            <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="3 4" />
            <XAxis
              dataKey="x"
              stroke={theme.mutedText}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              minTickGap={32}
              label={{ value: t('Trolley Position (m)'), position: 'insideBottom', offset: -8 }}
            />
            <YAxis
              stroke={theme.mutedText}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={formatValue}
              label={{ value: t('Load (kg)'), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={tooltip} cursor={{ stroke: theme.mutedText, strokeDasharray: '3 3' }} />
            <Line type="linear" dataKey="R_L" name={t('Left Reaction (R_L)')} stroke={theme.comparison} strokeWidth={2} dot={false} />
            <Line type="linear" dataKey="R_R" name={t('Right Reaction (R_R)')} stroke={theme.primary} strokeWidth={2} dot={false} />
            <Line type="linear" dataKey="N_max" name={t('Max Wheel Load (N_max)')} stroke={theme.critical} strokeWidth={2.5} strokeDasharray="7 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
};
