
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/hooks/use-theme";

interface SalesChartProps {
  data: any[];
  productId: string;
}

export function SalesChart({ data, productId }: SalesChartProps) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.length) {
      // Group data by week/month for better visualization
      const processed = data.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));

      // Generate forecast data (in a real app, this would come from an AI model)
      const lastDate = new Date(data[data.length - 1].date);
      const lastPrice = data[data.length - 1].price;
      const avgSales = data.reduce((sum, item) => sum + item.units_sold, 0) / data.length;
      
      // Generate simple forecast (in a real app, this would use actual ML)
      const forecast = [];
      for (let i = 1; i <= 6; i++) {
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(forecastDate.getDate() + i * 7);
        
        // Simple forecast algorithm (would be replaced by actual ML model)
        let projectedSales;
        if (i <= 2) {
          projectedSales = avgSales * (1 + 0.05 * i); // Slight increase
        } else if (i <= 4) {
          projectedSales = avgSales * (1 + 0.08 * i); // Larger increase
        } else {
          projectedSales = avgSales * (1 + 0.1 * i); // Even larger increase
        }
        
        forecast.push({
          date: forecastDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          units_sold: null,
          forecast: Math.round(projectedSales),
          price: lastPrice,
        });
      }

      // Combine actual data with forecast
      const combined = [
        ...processed.map(item => ({
          ...item,
          forecast: null,
        })),
        ...forecast,
      ];

      setChartData(combined);
    }
  }, [data, productId]);

  // Get theme colors for the chart
  const colors = {
    axis: theme === "dark" ? "#9ca3af" : "#6b7280",
    grid: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    tooltip: theme === "dark" ? "#1f2937" : "#f3f4f6",
    actual: theme === "dark" ? "#3b82f6" : "#2563eb",
    forecast: theme === "dark" ? "#f97316" : "#ea580c",
  };

  if (!chartData.length) return <div>Loading chart data...</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 10,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={70}
          tick={{ fill: colors.axis, fontSize: 12 }}
        />
        <YAxis tick={{ fill: colors.axis, fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltip,
            borderRadius: "0.5rem",
            border: "none",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="units_sold"
          stroke={colors.actual}
          name="Actual Sales"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={colors.forecast}
          strokeDasharray="5 5"
          name="Forecast"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
