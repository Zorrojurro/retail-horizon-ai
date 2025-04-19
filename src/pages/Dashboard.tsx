
import { useState } from "react";
import { Header } from "@/components/Header";
import { FileUpload } from "@/components/FileUpload";
import { ForecastResults } from "@/components/ForecastResults";
import { PredictionHistory } from "@/components/PredictionHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { ThemeProvider } from "@/hooks/use-theme";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleDataLoaded = (loadedData: any[]) => {
    setIsLoading(true);
    setTimeout(() => {
      setData(loadedData);
      setForecast(loadedData);
      setDataLoaded(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setData([]);
    setForecast([]);
    setDataLoaded(false);
    setIsLoading(false);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto space-y-10">
            <Tabs defaultValue="upload" className="w-full">
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
                <PredictionHistory />
              </TabsContent>
            </TabsList>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
