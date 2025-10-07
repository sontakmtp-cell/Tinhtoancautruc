import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { EdgeBeamInputs } from '../types';

interface ResistanceBreakdownChartProps {
  inputs: EdgeBeamInputs;
}

interface ResistanceData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

// Hàm tính toán các loại lực cản
const calculateResistanceBreakdown = (inputs: EdgeBeamInputs): ResistanceData[] => {
  // Tổng trọng lượng
  const G_tot = inputs.Q + inputs.Gx + inputs.Gc;
  
  // Các lực cản thành phần
  const W_roll = Math.abs(inputs.f) * G_tot;      // Lực cản lăn
  const W_joint = Math.max(inputs.m, 0) * G_tot;  // Lực cản gờ nối/ray
  const W_slope = Math.max(inputs.a, 0) * G_tot;  // Lực cản độ dốc
  
  // Tổng lực cản
  const W_total = W_roll + W_joint + W_slope;
  
  return [
    {
      name: 'Rolling Resistance',
      value: Math.round(W_roll * 10) / 10,
      color: '#3b82f6', // Xanh dương
      percentage: W_total > 0 ? Math.round((W_roll / W_total) * 100 * 10) / 10 : 0
    },
    {
      name: 'Rail/Joint Resistance',
      value: Math.round(W_joint * 10) / 10,
      color: '#f59e0b', // Vàng cam
      percentage: W_total > 0 ? Math.round((W_joint / W_total) * 100 * 10) / 10 : 0
    },
    {
      name: 'Slope Resistance',
      value: Math.round(W_slope * 10) / 10,
      color: '#ef4444', // Đỏ
      percentage: W_total > 0 ? Math.round((W_slope / W_total) * 100 * 10) / 10 : 0
    }
  ];
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {t(data.name)}
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {t('Force')}: {data.value} kgf
        </p>
        <p className="text-sm text-green-600 dark:text-green-400">
          {t('Percentage')}: {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

// Custom label component để hiển thị giá trị trên cột
const CustomLabel = ({ value, percentage }: { value: number; percentage: number }) => {
  if (value === 0) return null;
  
  return (
    <text
      x="50%"
      y="50%"
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-xs font-medium"
    >
      {value} kgf
      <tspan x="50%" dy="12" className="text-xs">
        ({percentage}%)
      </tspan>
    </text>
  );
};

export const ResistanceBreakdownChart: React.FC<ResistanceBreakdownChartProps> = ({ inputs }) => {
  const { t } = useTranslation();
  const data = calculateResistanceBreakdown(inputs);
  
  // Tính tổng lực cản
  const totalResistance = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div id="resistance-breakdown-chart" className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('Total Resistance Breakdown')}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {t('This diagram shows the contribution of each resistance component to the total driving force required')}
      </p>
      
      {/* Hiển thị tổng lực cản */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('Total Resistance')}:
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {totalResistance.toFixed(1)} kgf
        </p>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              className="text-gray-300 dark:text-gray-600" 
            />
            <XAxis
              dataKey="name"
              stroke="currentColor"
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tickFormatter={(value) => t(value)}
            />
            <YAxis
              stroke="currentColor"
              className="text-gray-600 dark:text-gray-400"
              label={{
                value: t('Resistance Force (kgf)'),
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth={1}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Bảng chi tiết */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 text-gray-900 dark:text-white font-medium">
                {t('Resistance Type')}
              </th>
              <th className="text-right py-2 px-3 text-gray-900 dark:text-white font-medium">
                {t('Force (kgf)')}
              </th>
              <th className="text-right py-2 px-3 text-gray-900 dark:text-white font-medium">
                {t('Percentage (%)')}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-3 flex items-center">
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-900 dark:text-white">
                    {t(item.name)}
                  </span>
                </td>
                <td className="text-right py-2 px-3 text-gray-900 dark:text-white font-mono">
                  {item.value.toFixed(1)}
                </td>
                <td className="text-right py-2 px-3 text-gray-900 dark:text-white font-mono">
                  {item.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-semibold">
              <td className="py-2 px-3 text-gray-900 dark:text-white">
                {t('Total')}
              </td>
              <td className="text-right py-2 px-3 text-gray-900 dark:text-white font-mono">
                {totalResistance.toFixed(1)}
              </td>
              <td className="text-right py-2 px-3 text-gray-900 dark:text-white font-mono">
                100.0%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Ghi chú giải thích */}
      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-2">
          {t('Analysis Notes')}:
        </h4>
        <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
          <li>• <span className="font-medium">{t('Rolling Resistance')}</span>: {t('Caused by bearing friction and wheel deformation')}</li>
          <li>• <span className="font-medium">{t('Rail/Joint Resistance')}</span>: {t('Caused by rail irregularities and joint gaps')}</li>
          <li>• <span className="font-medium">{t('Slope Resistance')}</span>: {t('Caused by rail inclination')}</li>
        </ul>
      </div>
    </div>
  );
};
