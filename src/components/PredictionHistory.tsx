
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Eye, FileBox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface PredictionHistoryProps {
  onViewPrediction: (data: any[], forecast: any[], filename: string, metadata?: any) => void;
}

export function PredictionHistory({ onViewPrediction }: PredictionHistoryProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPredictions(data || []);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [user]);

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
                <CalendarIcon className="h-3 w-3" />
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
            <CardFooter>
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
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
