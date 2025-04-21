import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Calendar, Download, ArrowUp, ArrowDown, Lightbulb, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesChart } from "./SalesChart";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./ProductCard";
import { RecommendationCard } from "./RecommendationCard";
import { DetailAnalysis } from "./DetailAnalysis";

interface ForecastResultsProps {
  data: any[];
  forecast: any[];
  metadata?: {
    model: string;
    confidence: number;
    factors: string[];
  } | null;
  isLoading?: boolean;
}

export function ForecastResults({ data, forecast, metadata, isLoading = false }: ForecastResultsProps) {
  const productGroups = data.reduce((groups: Record<string, any[]>, item) => {
    const productId = item.product_id;
    if (!groups[productId]) {
      groups[productId] = [];
    }
    groups[productId].push(item);
    return groups;
  }, {});

  const productIds = Object.keys(productGroups);

  const getRecommendation = (product: any[]) => {
    const lastSixMonths = product.slice(-6);
    const totalSales = lastSixMonths.reduce((sum, item) => sum + item.units_sold, 0);
    const avgSales = totalSales / lastSixMonths.length;
    
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {metadata && (
        <Card className="bg-muted/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Forecast Model</CardTitle>
            </div>
            <CardDescription>Powered by time-series analysis with Indian market adjustments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Model: {metadata.model}</span>
              </div>
              <div className="flex items-center gap-2">
                <ChartLine className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">Confidence: {(metadata.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {metadata.factors.map((factor: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

                <RecommendationCard rec={rec} />
                <ProductCard product={product} productId={productId} onExport={exportCSV} />
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ChartLine className="h-5 w-5" />
                        Sales Forecast
                      </CardTitle>
                      <CardDescription>Historical and projected sales for the next 12 weeks</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <SalesChart data={forecast.filter(item => item.product_id === productId)} productId={productId} />
                  </div>
                </CardContent>
              </Card>

              <DetailAnalysis rec={rec} product={product} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
