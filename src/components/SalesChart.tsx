
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
      console.log("Raw data received:", data);
      console.log("Looking for product ID:", productId);
      
      // Filter data for the specific product
      const productData = data.filter(item => item.product_id === productId);
      
      if (productData.length === 0) {
        console.log("No data found for product ID:", productId);
        return;
      }
      
      console.log("Product data:", productData);
      
      // Format dates for better display
      const processed = productData.map(item => {
        // Make a copy of the item to avoid mutation
        const newItem = { ...item };
        
        // Format the date
        newItem.date = new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        
        // Handle forecast values correctly
        if (item.units_sold === null && item.forecast) {
          // This is a forecast data point
          newItem.forecast = item.forecast;
          newItem.units_sold = null;
        } else if (item.forecast) {
          // This is a historical data point with a forecast value
          newItem.forecast = null;
        }
        
        return newItem;
      });
      
      console.log("Processed chart data:", processed);
      setChartData(processed);
    } else {
      console.log("No data received or empty data array");
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

  if (!chartData || chartData.length === 0) {
    console.log("No chart data available to render");
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-center text-muted-foreground">
        No data available for this product
      </div>
    );
  }

  console.log("Rendering chart with data:", chartData);

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
        <YAxis 
          tick={{ fill: colors.axis, fontSize: 12 }}
          allowDecimals={false}
          domain={[0, 'auto']}
        />
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
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={colors.forecast}
          strokeDasharray="5 5"
          name="Forecast"
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
