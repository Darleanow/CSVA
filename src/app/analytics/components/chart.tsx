import React from "react";
import { Card, CardContent, Typography, Badge, Box } from "@mui/material";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const data = [
  { value: 100 },
  { value: 120 },
  { value: 90 },
  { value: 140 },
  { value: 160 },
  { value: 200 },
];

export default function AnalyticsCard() {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: 3,
        padding: 2,
        maxWidth: 300,
        backgroundColor: "#fff",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Users
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          14k
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Last 30 days
        </Typography>
        <Badge
          badgeContent="+25%"
          sx={{
            backgroundColor: "#e6f4ea",
            color: "#34a853",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            marginTop: 1,
          }}
        />
        <Box mt={2}>
          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={data}>
              <Line type="monotone" dataKey="value" stroke="#34a853" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
