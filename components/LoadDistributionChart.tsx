import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { EdgeBeamInputs } from './EdgeBeamCalculator';

interface LoadDistributionChartProps {
  inputs: EdgeBeamInputs;
}

interface LoadData {
  x: number;
  R_L: number;
  R_R: number;
  N_max: number;
}

// Hàm tính toán phản lực tại một vị trí x cụ thể
const calculateLoadAtPosition = (inputs: EdgeBeamInputs, x: number) => {
  const span = inputs.S > 0 ? inputs.S : 1;
  const wheelsPerEnd = inputs.z > 0 ? inputs.z : 1;
  const P = inputs.Q + inputs.Gx;
  
  // Tính phản lực
  const R_L = inputs.Gc / 2 + (P * (span - x)) / span;
  const R_R = inputs.Gc / 2 + (P * x) / span;
  
  // Tính tải trọng bánh xe
  const N_L = R_L / wheelsPerEnd;
  const N_R = R_R / wheelsPerEnd;
  const N_max = Math.max(N_L, N_R);
  
  return { R_L, R_R, N_max };
};

// Tạo dữ liệu cho biểu đồ
const generateLoadData = (inputs: EdgeBeamInputs): LoadData[] => {
  const span = inputs.S;
  const numberOfPoints = 50; // Số điểm để vẽ đường mượt
  const step = span / (numberOfPoints - 1);
  
  const data: LoadData[] = [];
  
  for (let i = 0; i < numberOfPoints; i++) {
    const x = i * step;
    const loads = calculateLoadAtPosition(inputs, x);
    data.push({
      x: Math.round(x * 100) / 100, // Làm tròn 2 chữ số
      R_L: Math.round(loads.R_L * 10) / 10,
      R_R: Math.round(loads.R_R * 10) / 10,
      N_max: Math.round(loads.N_max * 10) / 10
    });
  }
  
  return data;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {t('Trolley position')}: {label} m
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} kg
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const LoadDistributionChart: React.FC<LoadDistributionChartProps> = ({ inputs }) => {
  const { t } = useTranslation();
  const data = generateLoadData(inputs);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('Load Distribution by Trolley Position')}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {t('This diagram shows how reactions and wheel loads change as the trolley moves along the main beam')}
      </p>
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              dataKey="x"
              stroke="currentColor"
              className="text-gray-600 dark:text-gray-400"
              label={{
                value: t('Trolley Position (m)'),
                position: 'insideBottom',
                offset: -5,
                style: { textAnchor: 'middle' }
              }}
            />
            <YAxis
              stroke="currentColor"
              className="text-gray-600 dark:text-gray-400"
              label={{
                value: t('Load (kg)'),
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            {/* Phản lực đầu trái - màu xanh lá */}
            <Line
              type="monotone"
              dataKey="R_L"
              name={t('Left Reaction (R_L)')}
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2 }}
            />
            
            {/* Phản lực đầu phải - màu xanh dương */}
            <Line
              type="monotone"
              dataKey="R_R"
              name={t('Right Reaction (R_R)')}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            
            {/* Tải trọng bánh xe lớn nhất - màu đỏ */}
            <Line
              type="monotone"
              dataKey="N_max"
              name={t('Max Wheel Load (N_max)')}
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Ghi chú giải thích */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          {t('Chart Interpretation')}:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• <span className="font-medium text-green-600">{t('Left Reaction (R_L)')}</span>: {t('Decreases as trolley moves right')}</li>
          <li>• <span className="font-medium text-blue-600">{t('Right Reaction (R_R)')}</span>: {t('Increases as trolley moves right')}</li>
          <li>• <span className="font-medium text-red-600">{t('Max Wheel Load (N_max)')}</span>: {t('Critical load for structural verification')}</li>
        </ul>
      </div>
    </div>
  );
};
