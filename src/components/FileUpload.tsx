
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cloud, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Sample CSV data
const sampleData = `date,product_id,product_name,units_sold,price,season,holiday,promotion,weather,competitor_price
2023-01-01,001,Coffee Maker,12,99.99,Winter,New Year,Yes,Cold,109.99
2023-01-08,001,Coffee Maker,8,99.99,Winter,None,No,Cold,109.99
2023-01-15,001,Coffee Maker,10,99.99,Winter,None,No,Cold,104.99
2023-01-22,001,Coffee Maker,15,89.99,Winter,None,Yes,Cold,104.99
2023-01-29,001,Coffee Maker,20,89.99,Winter,None,Yes,Cold,99.99
2023-02-05,001,Coffee Maker,18,89.99,Winter,None,No,Cold,99.99
2023-02-12,001,Coffee Maker,25,89.99,Winter,Valentine's Day,Yes,Cold,99.99
2023-02-19,001,Coffee Maker,15,89.99,Winter,None,No,Cold,104.99
2023-02-26,001,Coffee Maker,12,89.99,Winter,None,No,Mild,104.99
2023-03-05,001,Coffee Maker,10,99.99,Spring,None,No,Mild,109.99
2023-03-12,001,Coffee Maker,8,99.99,Spring,None,No,Mild,109.99
2023-03-19,001,Coffee Maker,14,89.99,Spring,None,Yes,Mild,99.99
2023-03-26,001,Coffee Maker,20,89.99,Spring,None,Yes,Warm,99.99
2023-04-02,001,Coffee Maker,22,89.99,Spring,Easter,Yes,Warm,99.99
2023-04-09,001,Coffee Maker,25,89.99,Spring,None,Yes,Warm,99.99
2023-04-16,001,Coffee Maker,18,89.99,Spring,None,No,Warm,104.99
2023-04-23,001,Coffee Maker,15,89.99,Spring,None,No,Warm,104.99
2023-04-30,001,Coffee Maker,12,99.99,Spring,None,No,Warm,109.99
2023-05-07,001,Coffee Maker,10,99.99,Spring,None,No,Hot,109.99
2023-05-14,001,Coffee Maker,15,89.99,Spring,None,Yes,Hot,99.99
2023-05-21,001,Coffee Maker,22,89.99,Spring,None,Yes,Hot,99.99
2023-05-28,001,Coffee Maker,28,89.99,Spring,Memorial Day,Yes,Hot,99.99
2023-06-04,001,Coffee Maker,20,89.99,Summer,None,No,Hot,104.99
2023-06-11,001,Coffee Maker,15,89.99,Summer,None,No,Hot,104.99
2023-06-18,001,Coffee Maker,12,99.99,Summer,None,No,Hot,109.99
2023-06-25,001,Coffee Maker,10,99.99,Summer,None,No,Hot,109.99`;

interface FileUploadProps {
  onDataLoaded: (data: any[], filename: string) => void;
  isLoading: boolean;
}

export function FileUpload({ onDataLoaded, isLoading }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if the file is a CSV
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      setFile(selectedFile);
      
      // Parse the CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const data = parseCSV(text);
          
          // Validate required fields
          if (data.length > 0) {
            const firstRow = data[0];
            if (!firstRow.date || !firstRow.product_id) {
              toast.error("CSV must contain at least 'date' and 'product_id' columns");
              return;
            }
            
            console.log("Parsed CSV data:", data);
            onDataLoaded(data, selectedFile.name);
            toast.success("Data loaded successfully");
          } else {
            toast.error("No data found in CSV file");
          }
        } catch (error) {
          console.error("Error parsing CSV:", error);
          toast.error("Failed to parse CSV file. Make sure it's properly formatted.");
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row");
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    
    console.log("CSV headers:", headers);
    
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const data = lines[i].split(',');
      if (data.length !== headers.length) {
        console.warn(`Line ${i} has ${data.length} fields, expected ${headers.length}. Line: ${lines[i]}`);
        continue; // Skip malformed lines
      }
      
      const obj: any = {};
      
      for (let j = 0; j < headers.length; j++) {
        // Convert numeric values
        const value = data[j]?.trim();
        if (!isNaN(Number(value)) && value !== '') {
          obj[headers[j]] = Number(value);
        } else {
          obj[headers[j]] = value;
        }
      }
      
      // Ensure required fields are present
      if (!obj.product_id) {
        obj.product_id = `unknown_${i}`;
      }
      
      if (!obj.product_name) {
        obj.product_name = `Product ${obj.product_id}`;
      }
      
      result.push(obj);
    }
    
    if (result.length === 0) {
      throw new Error("No valid data rows found in CSV");
    }
    
    return result;
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retailhorizon_sample_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sample CSV downloaded");
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-in">
      <CardHeader>
        <CardTitle className="text-xl">Upload Sales Data</CardTitle>
        <CardDescription>
          Upload a CSV file with your historical sales data to generate forecasts.
          Make sure your CSV includes at least these columns: date, product_id, product_name, units_sold
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-secondary/50 border-primary/20"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Cloud className="w-10 h-10 mb-3 text-primary/60" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">CSV files only</p>
              {file && (
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                  <FileSpreadsheet className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
            <Input
              id="dropzone-file"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>
        </div>
      </CardContent>
      <CardFooter className="justify-between flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="gap-1"
          onClick={downloadSampleCSV}
        >
          <Download className="h-4 w-4" />
          Download Sample CSV
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Don't have data? Use our sample dataset to try out the tool.
        </div>
      </CardFooter>
    </Card>
  );
}
