import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { EdgeBeamInputs } from '../types';
import { ChartFrame } from './ChartFrame';
import { CHART_COLORS, useChartTheme } from './chartTheme';

interface ResistanceBreakdownChartProps {
  inputs: EdgeBeamInputs;
}

interface ResistanceData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const calculateResistanceBreakdown = (inputs: EdgeBeamInputs): ResistanceData[] => {
  const totalWeight = inputs.Q + inputs.Gx + inputs.Gc;
  const values = [
    { name: 'Rolling Resistance', value: Math.abs(inputs.f) * totalWeight, color: CHART_COLORS.primary },
    { name: 'Rail/Joint Resistance', value: Math.max(inputs.m, 0) * totalWeight, color: CHART_COLORS.warning },
    { name: 'Slope Resistance', value: Math.max(inputs.a, 0) * totalWeight, color: CHART_COLORS.comparison },
  ];
  const total = values.reduce((sum, item) => sum + item.value, 0);

  return values
    .map(item => ({
      ...item,
      value: Math.round(item.value * 10) / 10,
      percentage: total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value);
};

const formatValue = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value);

export const ResistanceBreakdownChart: React.FC<ResistanceBreakdownChartProps> = ({ inputs }) => {
  const { t } = useTranslation();
  const theme = useChartTheme();
  const data = useMemo(() => calculateResistanceBreakdown(inputs), [inputs]);
  const totalResistance = data.reduce((sum, item) => sum + item.value, 0);
  const dominant = data[0];

  const tooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload as ResistanceData;
    return (
      <div
        className="rounded-lg border px-3 py-2 text-xs shadow-lg"
        style={{ background: theme.tooltipBackground, borderColor: theme.grid, color: theme.text }}
      >
        <p className="font-semibold">{t(item.name)}</p>
        <p className="mt-1 font-mono">{formatValue(item.value)} kgf · {item.percentage.toFixed(1)}%</p>
      </div>
    );
  };

  return (
    <ChartFrame
      id="resistance-breakdown-chart"
      title={t('Total Resistance Breakdown')}
      description={t('This diagram shows the contribution of each resistance component to the total driving force required')}
      insight={(
        <span>
          {t('Total Resistance')}: <strong className="font-mono">{formatValue(totalResistance)} kgf</strong>
        </span>
      )}
      footer={(
        <p className="text-xs text-slate-600 dark:text-slate-400">
          <strong className="text-slate-800 dark:text-slate-200">{t(dominant.name)}</strong>
          {' · '}{dominant.percentage.toFixed(1)}%
        </p>
      )}
    >
      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 48, left: 8, bottom: 8 }}>
            <CartesianGrid stroke={theme.grid} horizontal={false} strokeDasharray="3 4" />
            <XAxis
              type="number"
              stroke={theme.mutedText}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              tickFormatter={formatValue}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={138}
              stroke={theme.mutedText}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => t(value)}
            />
            <Tooltip content={tooltip} cursor={{ fill: theme.grid, opacity: 0.35 }} />
            <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={38}>
              {data.map(item => <Cell key={item.name} fill={item.color} />)}
              <LabelList
                dataKey="percentage"
                position="right"
                formatter={(value: unknown) => `${Number(value).toFixed(1)}%`}
                fill={theme.text}
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2 px-2 pt-2 sm:grid-cols-3">
        {data.map(item => (
          <div key={item.name} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              {t(item.name)}
            </div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formatValue(item.value)} kgf
            </div>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
};
