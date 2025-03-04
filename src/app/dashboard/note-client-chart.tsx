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

const NoteClientChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="1000 1000" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          cursor={{ fill: '#C8E0F9', opacity: "0.8" }}
        />
        <Legend />
        <Bar dataKey="value" fill="#1976d3" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default NoteClientChart;
