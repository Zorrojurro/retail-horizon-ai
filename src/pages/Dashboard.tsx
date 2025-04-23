
import { useState } from "react";
import { Header } from "@/components/Header";
import { FileUpload } from "@/components/FileUpload";
import { ForecastResults } from "@/components/ForecastResults";
import { PredictionHistory } from "@/components/PredictionHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { ThemeProvider } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [activeTab, setActiveTab] = useState("upload");
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [modelMetadata, setModelMetadata] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDataLoaded = async (loadedData: any[], filename: string) => {
    setIsLoading(true);
    setCurrentFile(filename);
    setData(loadedData);
    
    try {
      // Call the demand forecasting edge function
      setIsForecastLoading(true);
      
      console.log("Sending data to forecast function:", loadedData);
      
      const { data: forecastResponse, error } = await supabase.functions.invoke('demand-forecast', {
        body: { data: loadedData }
      });
      
      if (error) {
        console.error("Error from forecast function:", error);
        throw error;
      }
      
      console.log("Received forecast response:", forecastResponse);
      
      // If we don't have a proper forecast response, use original data as fallback
      if (!forecastResponse || !forecastResponse.forecast || forecastResponse.forecast.length === 0) {
        console.log("No forecast data returned, using original data as fallback");
        setForecast(loadedData);
        toast({
          title: "Forecast Error",
          description: "Could not generate forecast. Using original data instead.",
          variant: "destructive"
        });
      } else {
        console.log("Setting forecast data:", forecastResponse.forecast);
        setForecast(forecastResponse.forecast);
        setModelMetadata(forecastResponse?.metadata || null);
        
        // Save the prediction to the database
        if (user) {
          console.log("Saving prediction to database for user:", user.id);
          try {
            const { data: savedPrediction, error: saveError } = await supabase
              .from('predictions')
              .insert({
                filename,
                data: loadedData,
                forecast: forecastResponse.forecast,
                metadata: forecastResponse?.metadata || null,
                user_id: user.id
              });
            
            if (saveError) {
              console.error("Error saving prediction:", saveError);
              toast({
                title: "Warning",
                description: "Forecast generated but could not be saved to history.",
                variant: "destructive"
              });
              throw saveError;
            }
            
            console.log("Prediction saved successfully:", savedPrediction);
            
            toast({
              title: "Forecast generated",
              description: "Your AI-powered forecast has been saved and is ready to view."
            });
          } catch (dbError: any) {
            console.error('Error saving forecast to database:', dbError);
            toast({
              title: "Warning",
              description: "Forecast generated but could not be saved to history: " + dbError.message,
              variant: "destructive"
            });
          }
        } else {
          // For non-logged in users, just show the forecast without saving
          console.log("User not logged in, not saving prediction");
          toast({
            title: "Forecast generated",
            description: "Your AI-powered forecast is ready to view. Log in to save your forecasts."
          });
        }
      }
      
      setDataLoaded(true);
    } catch (error: any) {
      console.error('Error generating forecast:', error);
      toast({
        title: "Forecasting Error",
        description: error.message || "There was a problem generating your forecast. Please try again with a different CSV format.",
        variant: "destructive"
      });
      // Use original data as fallback
      console.log("Using original data as fallback due to error");
      setForecast(loadedData);
      setDataLoaded(true);
    } finally {
      setIsForecastLoading(false);
      setIsLoading(false);
    }
  };

  const handleViewPrediction = (predictionData: any[], predictionForecast: any[], filename: string, metadata?: any) => {
    console.log("Viewing prediction with data:", predictionData);
    console.log("Forecast data:", predictionForecast);
    
    // Ensure we always have valid arrays
    setData(predictionData || []);
    setForecast(predictionForecast || predictionData || []);
    setCurrentFile(filename);
    setModelMetadata(metadata);
    setDataLoaded(true);
    setActiveTab("upload");
  };

  const handleReset = () => {
    setData([]);
    setForecast([]);
    setDataLoaded(false);
    setIsLoading(false);
    setCurrentFile("");
    setModelMetadata(null);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto space-y-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="upload">New Prediction</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                {!dataLoaded ? (
                  <>
                    <div className="space-y-4 text-center mb-8">
                      <h1 className="text-4xl font-bold tracking-tight">
                        AI-Powered Demand Forecasting for Indian Businesses
                      </h1>
                      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Upload your sales data and get AI-driven insights to optimize inventory 
                        and increase profitability for your business in the Indian market.
                      </p>
                    </div>
                    <FileUpload onDataLoaded={handleDataLoaded} isLoading={isLoading} />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleReset}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Upload Another File
                      </Button>
                      {isForecastLoading && (
                        <div className="text-sm text-muted-foreground">
                          Generating AI forecast for the Indian market...
                        </div>
                      )}
                    </div>
                    <ForecastResults 
                      data={data} 
                      forecast={forecast} 
                      metadata={modelMetadata}
                      isLoading={isForecastLoading}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <PredictionHistory onViewPrediction={handleViewPrediction} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
