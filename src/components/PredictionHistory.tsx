
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileBox, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface PredictionHistoryProps {
  onViewPrediction: (data: any[], forecast: any[], filename: string, metadata?: any) => void;
}

export function PredictionHistory({ onViewPrediction }: PredictionHistoryProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPredictions = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching predictions for user ID:", user.id);
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching predictions:", error);
        throw error;
      }
      
      console.log("Predictions fetched:", data?.length || 0, "records", data);
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load prediction history",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for predictions table
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up real-time subscription for predictions");
    const channel = supabase
      .channel('prediction-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Real-time prediction update received:", payload);
          fetchPredictions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchPredictions();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prediction deleted successfully",
      });

      // Refresh the predictions list
      fetchPredictions();
    } catch (error) {
      console.error('Error deleting prediction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete prediction",
      });
    }
  };

  const handleExport = (prediction: any) => {
    // Combine actual and forecast data
    const exportData = [];
    
    // Add all data points (actual data)
    if (prediction.data && Array.isArray(prediction.data)) {
      for (const item of prediction.data) {
        const exportItem: any = {
          date: item.date,
          product_id: item.product_id || '',
          product_name: item.product_name || '',
          price: item.price || 0,
          competitor_price: item.competitor_price || 0,
          units_sold: item.units_sold || 0,
          forecast_units: '' // Empty for actual data
        };
        exportData.push(exportItem);
      }
    }
    
    // Add all forecast data points
    if (prediction.forecast && Array.isArray(prediction.forecast)) {
      for (const item of prediction.forecast) {
        // Only add forecast items that are not in the original data (have null units_sold)
        if (item.units_sold === null) {
          const exportItem: any = {
            date: item.date,
            product_id: item.product_id || '',
            product_name: item.product_name || '',
            price: item.price || 0,
            competitor_price: item.competitor_price || 0,
            units_sold: '',
            forecast_units: item.forecast || 0
          };
          exportData.push(exportItem);
        }
      }
    }

    // Sort by date
    exportData.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Convert to CSV
    const headers = ['Date', 'Product ID', 'Product Name', 'Price', 'Competitor Price', 'Actual Sales', 'Forecast Sales'];
    const csvContent = [
      headers.join(','),
      ...exportData.map((row: any) => [
        row.date,
        row.product_id,
        `"${row.product_name.replace(/"/g, '""')}"`, // Escape quotes in CSV
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
    link.download = `${prediction.filename}_with_forecast.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold mb-4">Your Prediction History</div>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileBox className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No predictions yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload your first dataset to get started with AI-powered forecasting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Prediction History</h2>
        <Badge variant="outline" className="text-xs">
          {predictions.length} {predictions.length === 1 ? 'prediction' : 'predictions'}
        </Badge>
      </div>

      <div className="grid gap-4">
        {predictions.map((prediction) => (
          <Card key={prediction.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{prediction.filename}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {prediction.created_at ? format(new Date(prediction.created_at), 'MMM d, yyyy • HH:mm') : 'Unknown date'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Data points:</span> {prediction.data?.length || 0}
                {prediction.metadata && (
                  <span className="ml-3">
                    <span className="font-medium">Model:</span> {prediction.metadata.model}
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => onViewPrediction(
                  prediction.data, 
                  prediction.forecast, 
                  prediction.filename,
                  prediction.metadata
                )}
              >
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => handleExport(prediction)}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleDelete(prediction.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
