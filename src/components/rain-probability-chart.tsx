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
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { ForecastData } from "@/api/types"; // Make sure this includes `list: ForecastItem[]`

interface RainProbabilityChartProps {
  forecastData?: ForecastData; // Optional in case of loading
}

export function RainProbabilityChart({ forecastData }: RainProbabilityChartProps) {
  const list = forecastData?.list ?? [];

  const data = list.slice(0, 8).map((item) => ({
    time: format(new Date(item.dt * 1000), "ha"),
    rain: typeof item.pop === "number" ? Math.round(item.pop * 100) : 0,
  }));

  const hasData = data.length > 0;

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Rain Probability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#888888" fontSize={12} />
                <YAxis domain={[0, 100]} unit="%" stroke="#888888" fontSize={12} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="rain"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm text-muted-foreground">No data available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
