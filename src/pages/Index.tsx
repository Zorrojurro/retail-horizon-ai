
import { useState } from "react";
import { Header } from "@/components/Header";
import { FileUpload } from "@/components/FileUpload";
import { ForecastResults } from "@/components/ForecastResults";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleDataLoaded = (loadedData: any[]) => {
    setIsLoading(true);

    // Simulate AI processing time
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
        <Toaster position="top-right" />
        <Header />
        
        <main className="flex-1 container py-8">
          <div className="max-w-6xl mx-auto space-y-10">
            {!dataLoaded && (
              <div className="space-y-4 text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight">
                  AI-Powered Demand Forecasting
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Upload your sales data and get AI-driven insights to optimize inventory 
                  and increase profitability for your small business.
                </p>
              </div>
            )}
            
            {!dataLoaded ? (
              <FileUpload onDataLoaded={handleDataLoaded} isLoading={isLoading} />
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
          </div>
        </main>
        
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RetailHorizon AI. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Cloud-based demand forecasting for small businesses
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
