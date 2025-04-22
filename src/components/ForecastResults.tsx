
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Calendar, Download, ArrowUp, ArrowDown, Lightbulb, Brain, Database, Cloud, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesChart } from "./SalesChart";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./ProductCard";
import { RecommendationCard } from "./RecommendationCard";
import { DetailAnalysis } from "./DetailAnalysis";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ForecastResultsProps {
  data: any[];
  forecast: any[];
  metadata?: {
    model: string;
    confidence: number;
    factors: string[];
    modelDescription?: string;
    dataPoints?: number;
    forecastHorizon?: string;
  } | null;
  isLoading?: boolean;
}

export function ForecastResults({ data, forecast, metadata, isLoading = false }: ForecastResultsProps) {
  console.log("ForecastResults data:", data);
  console.log("ForecastResults forecast:", forecast);
  
  const productGroups = data.reduce((groups: Record<string, any[]>, item) => {
    const productId = item.product_id;
    if (!groups[productId]) {
      groups[productId] = [];
    }
    groups[productId].push(item);
    return groups;
  }, {});

  const productIds = Object.keys(productGroups);
  console.log("Product IDs found:", productIds);

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
      trendDirection: trend > 0 ? "up" as const : "down" as const,
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

  if (!forecast || forecast.length === 0) {
    console.log("No forecast data available");
  } else {
    console.log("Forecast data:", forecast);
  }

  return (
    <div className="space-y-6 animate-in">
      {metadata && (
        <Card className="bg-muted/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{metadata.model}</CardTitle>
            </div>
            <CardDescription>
              Advanced time-series forecasting with Indian market intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Model Confidence: {(metadata.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ChartLine className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">
                  {metadata.dataPoints} predictions over {metadata.forecastHorizon}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {metadata.factors.map((factor: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="model-details">
                <AccordionTrigger className="text-sm font-medium">
                  About the Forecasting Model
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      This forecast uses the <strong>Holt-Winters exponential smoothing algorithm</strong> with 
                      special adjustments for the Indian market. The model incorporates multiple factors:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Seasonal Patterns</p>
                          <p className="text-xs">Accounts for Indian festivals, holidays, and seasonal buying trends</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Cloud className="h-4 w-4 text-cyan-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Regional Weather Impact</p>
                          <p className="text-xs">Adjusts for monsoon, summer, and other regional weather patterns</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Database className="h-4 w-4 text-purple-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Historical Trends</p>
                          <p className="text-xs">Analyzes your past sales data to detect patterns and trends</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Price Elasticity</p>
                          <p className="text-xs">Models how price changes affect consumer demand in Indian markets</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="mt-3 text-xs">
                        <strong>Cloud-Based Architecture:</strong> This application leverages cloud technology through Supabase's 
                        serverless edge functions for real-time processing, secure data storage, and on-demand scaling. Your forecasts 
                        are generated in the cloud, allowing for complex calculations without taxing your local device.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                    <SalesChart 
                      data={forecast.length > 0 ? forecast : data} 
                      productId={productId} 
                    />
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
