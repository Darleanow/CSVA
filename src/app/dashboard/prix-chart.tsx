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

interface PrixChartProps {
  data: DataPoint[];
}

const PrixChart: React.FC<PrixChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="1000 1000" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          cursor={{ fill: '#D4EDDE', opacity: 0.8 }}
        />
        <Legend />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PrixChart;