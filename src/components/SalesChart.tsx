
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
  TooltipProps,
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
    if (!data || data.length === 0) {
      console.log("No data provided to SalesChart component");
      return;
    }

    console.log("SalesChart received data:", data);
    console.log("Product ID to filter:", productId);
    
    // More robust product ID filtering - convert both to strings for comparison
    const productData = data.filter(item => {
      const itemProductId = String(item.product_id);
      const targetProductId = String(productId);
      return itemProductId === targetProductId;
    });
    
    if (productData.length === 0) {
      console.log(`No data found for product ID: ${productId}`);
      return;
    }
    
    console.log(`Found ${productData.length} data points for product ID ${productId}`);
    
    // Sort data by date first to ensure chronological order
    const sortedData = [...productData].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Process and format the data for the chart with more robust handling
    const formattedData = sortedData.map(item => {
      // Ensure date is properly handled
      let formattedDate;
      try {
        // Handle different date formats that might come from user CSV files
        const dateObj = new Date(item.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else {
          // If date parsing fails, use the original string
          formattedDate = item.date;
        }
      } catch (e) {
        console.log("Error formatting date:", e);
        formattedDate = item.date; // Fallback to the original string
      }
      
      // Create a new object with all necessary properties, handling null/undefined gracefully
      return {
        ...item,
        date: formattedDate,
        // Ensure proper handling of units_sold and forecast - force conversion to numbers when possible
        units_sold: item.units_sold !== null && item.units_sold !== undefined 
          ? Number(item.units_sold) 
          : null,
        forecast: item.forecast !== undefined && item.forecast !== null
          ? Number(item.forecast) 
          : null
      };
    });
    
    console.log("Formatted and sorted chart data:", formattedData);
    setChartData(formattedData);
  }, [data, productId]);

  // Get theme colors for the chart
  const colors = {
    axis: theme === "dark" ? "#9ca3af" : "#6b7280",
    grid: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    tooltip: theme === "dark" ? "#1f2937" : "#f3f4f6",
    actual: theme === "dark" ? "#3b82f6" : "#2563eb",
    forecast: theme === "dark" ? "#f97316" : "#ea580c",
  };

  // Custom tooltip formatter to better handle nulls and provide clearer labels
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-md p-2 text-xs">
          <p className="font-medium text-foreground">{label}</p>
          <div className="space-y-1 pt-1">
            {payload.map((entry, index) => {
              if (entry.value !== null && entry.value !== undefined) {
                return (
                  <p key={`item-${index}`} style={{ color: entry.color }}>
                    {entry.name}: {entry.value}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Show a message if no data is available
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-center text-muted-foreground">
        No data available for this product
      </div>
    );
  }

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
        <Tooltip content={<CustomTooltip />} />
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
