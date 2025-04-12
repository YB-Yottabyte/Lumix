"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import type { ForecastData } from "@/api/types";

interface TemperatureTrendChartProps {
  data: ForecastData;
}

export function TemperatureTrendChart({ data }: TemperatureTrendChartProps) {
  if (!data?.list || !Array.isArray(data.list) || data.list.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-white shadow">
        <p className="text-center text-sm text-muted-foreground">
          No temperature data available.
        </p>
      </div>
    );
  }

  const chartData = data.list.map((item) => ({
    time: format(new Date(item.dt * 1000), "EEE ha"), // e.g., Mon 3PM
    temperature: Math.round(item.main.temp),
  }));

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        5-Day Temperature Trend
      </h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              fontSize={12}
              tick={{ fill: "#6b7280" }} // Tailwind gray-500
              interval={6}
            />
            <YAxis
              unit="°C"
              fontSize={12}
              tick={{ fill: "#6b7280" }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{ fontSize: "0.875rem" }}
              formatter={(value) => `${value}°C`}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#4f46e5" // Indigo-600
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
