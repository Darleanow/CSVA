import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface QuantiteChartProps {
  data: DataPoint[];
}

const QuantiteChart: React.FC<QuantiteChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="1000 1000" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          cursor={{ fill: '#FFF1D6', opacity: 0.8 }}
        />
        <Legend />
        <Bar dataKey="value" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default QuantiteChart;