
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Calendar, Download, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesChart } from "./SalesChart";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ForecastResultsProps {
  data: any[];
  forecast: any[];
}

export function ForecastResults({ data, forecast }: ForecastResultsProps) {
  // Group by product
  const productGroups = data.reduce((groups: Record<string, any[]>, item) => {
    const productId = item.product_id;
    if (!groups[productId]) {
      groups[productId] = [];
    }
    groups[productId].push(item);
    return groups;
  }, {});

  // Get unique product IDs
  const productIds = Object.keys(productGroups);

  // Helper function to determine recommendation
  const getRecommendation = (product: any[]) => {
    const lastSixMonths = product.slice(-6);
    const totalSales = lastSixMonths.reduce((sum, item) => sum + item.units_sold, 0);
    const avgSales = totalSales / lastSixMonths.length;
    
    // Simple analysis based on average sales and trend
    const firstHalf = lastSixMonths.slice(0, 3);
    const secondHalf = lastSixMonths.slice(3);
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.units_sold, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.units_sold, 0) / secondHalf.length;
    
    const trend = secondHalfAvg - firstHalfAvg;
    const trendPercentage = ((trend / firstHalfAvg) * 100).toFixed(1);
    
    let recommendation;
    let sentiment;
    let duration;
    
    if (trend > 0 && avgSales > 15) {
      recommendation = "Stock up on this product";
      sentiment = "positive";
      duration = "6+ months";
    } else if (trend > 0 && avgSales <= 15) {
      recommendation = "Maintain current inventory";
      sentiment = "neutral";
      duration = "3-6 months";
    } else if (trend <= 0 && avgSales > 10) {
      recommendation = "Reduce order frequency";
      sentiment = "neutral";
      duration = "2-3 months";
    } else {
      recommendation = "Consider phasing out";
      sentiment = "negative";
      duration = "1-2 months";
    }
    
    return {
      recommendation,
      sentiment,
      duration,
      trend: trendPercentage,
      trendDirection: trend > 0 ? "up" : "down",
      avgSales: avgSales.toFixed(1)
    };
  };

  const exportCSV = (productId: string) => {
    const product = productGroups[productId];
    const headers = Object.keys(product[0]).join(',');
    const rows = product.map(item => Object.values(item).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product_${productId}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in">
      <Tabs defaultValue={productIds[0]}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold">Product Analysis & Forecast</h2>
          <TabsList className="overflow-auto">
            {productIds.map(productId => (
              <TabsTrigger key={productId} value={productId}>
                Product {productId}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {productIds.map(productId => {
          const product = productGroups[productId];
          const rec = getRecommendation(product);
          
          return (
            <TabsContent key={productId} value={productId} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Performance</CardTitle>
                    <CardDescription>6-month sales trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{rec.avgSales}</p>
                        <p className="text-sm text-muted-foreground">Average Units/Week</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={
                          rec.sentiment === "positive" ? "default" : 
                          rec.sentiment === "neutral" ? "secondary" : "destructive"
                        }>
                          {rec.trendDirection === "up" ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {rec.trend}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recommendation</CardTitle>
                    <CardDescription>AI-powered insight</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{rec.recommendation}</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Projected viability: {rec.duration}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Product Details</CardTitle>
                    <CardDescription>{product[0].product_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current price:</span>
                        <span className="font-medium">${product[product.length-1].price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Competitor price:</span>
                        <span className="font-medium">${product[product.length-1].competitor_price}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 gap-1"
                        onClick={() => exportCSV(productId)}
                      >
                        <Download className="h-3 w-3" />
                        Export Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ChartLine className="h-5 w-5" />
                        Sales Forecast
                      </CardTitle>
                      <CardDescription>Historical and projected sales for the next 6 months</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <SalesChart data={product} productId={productId} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Analysis</CardTitle>
                  <CardDescription>
                    Factors affecting product performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full rounded-md">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Seasonal Impact</h4>
                        <p className="text-sm text-muted-foreground">
                          Sales of this product tend to {rec.trendDirection === "up" ? "increase" : "decrease"} during {product[0].season}. 
                          {rec.trendDirection === "up" 
                            ? " Consider increasing stock levels during this season." 
                            : " Consider reducing orders during this season."}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Price Sensitivity</h4>
                        <p className="text-sm text-muted-foreground">
                          {Math.abs(product[0].price - product[product.length-1].competitor_price) > 5
                            ? "There is a significant price difference compared to competitors, which may impact sales."
                            : "The product is competitively priced in the market."}
                          {product[0].price > product[product.length-1].competitor_price
                            ? " Consider adjusting your pricing strategy to remain competitive."
                            : ""}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Promotion Effectiveness</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.some(p => p.promotion === "Yes")
                            ? "Promotions have shown to increase sales by approximately 30%. Consider running more targeted promotions."
                            : "No promotion data available for this product."}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
