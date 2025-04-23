
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ProductCardProps {
  product: any[];
  productId: string;
  forecast?: any[];
  onExport: (productId: string) => void;
}

export function ProductCard({ product, productId, forecast, onExport }: ProductCardProps) {
  const handleExport = () => {
    // Combine actual and forecast data
    const exportData = product.map((item: any, index: number) => {
      const forecastItem = forecast?.[index] || {};
      return {
        date: item.date,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        competitor_price: item.competitor_price,
        units_sold: item.units_sold,
        forecast_units: forecastItem.forecast || '',
      };
    });

    // Convert to CSV
    const headers = ['Date', 'Product ID', 'Product Name', 'Price', 'Competitor Price', 'Actual Sales', 'Forecast Sales'];
    const csvContent = [
      headers.join(','),
      ...exportData.map((row: any) => [
        row.date,
        row.product_id,
        `"${row.product_name}"`,
        row.price,
        row.competitor_price,
        row.units_sold,
        row.forecast_units
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `product_${productId}_with_forecast.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Product Details</CardTitle>
        <CardDescription>{product[0]?.product_name || 'Product'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current price:</span>
            <span className="font-medium">₹{product[product.length-1]?.price || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Competitor price:</span>
            <span className="font-medium">₹{product[product.length-1]?.competitor_price || 0}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 gap-1"
            onClick={handleExport}
          >
            <Download className="h-3 w-3" />
            Export Data with Forecast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
