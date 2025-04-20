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
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDataLoaded = async (loadedData: any[], filename: string) => {
    setIsLoading(true);
    setCurrentFile(filename);
    
    setTimeout(async () => {
      setData(loadedData);
      setForecast(loadedData);
      setDataLoaded(true);
      
      try {
        await supabase.from('predictions').insert({
          filename,
          data: loadedData,
          forecast: loadedData,
          user_id: user?.id
        });
        
        toast({
          title: "Prediction saved",
          description: "Your prediction has been saved and will appear in the history."
        });
      } catch (error) {
        console.error('Error saving prediction:', error);
        toast({
          title: "Error",
          description: "Failed to save the prediction.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleViewPrediction = (predictionData: any[], predictionForecast: any[], filename: string) => {
    setData(predictionData);
    setForecast(predictionForecast);
    setCurrentFile(filename);
    setDataLoaded(true);
    setActiveTab("upload");
  };

  const handleReset = () => {
    setData([]);
    setForecast([]);
    setDataLoaded(false);
    setIsLoading(false);
    setCurrentFile("");
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
                        AI-Powered Demand Forecasting
                      </h1>
                      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Upload your sales data and get AI-driven insights to optimize inventory 
                        and increase profitability for your small business.
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
                    </div>
                    <ForecastResults data={data} forecast={forecast} />
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
