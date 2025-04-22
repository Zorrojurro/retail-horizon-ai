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
      
      // Accept CSV files with various MIME types that might be used by different systems
      const validTypes = [
        "text/csv", 
        "application/csv", 
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ];
      
      // Check if the file extension is .csv or if it's a recognized CSV type
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      setFile(selectedFile);
      
      // Parse the CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          console.log("CSV file content sample:", text.substring(0, 200));
          
          const data = parseCSV(text);
          
          // Validate required fields
          if (data.length > 0) {
            const firstRow = data[0];
            
            // Check for minimum required fields
            if (!firstRow.date) {
              toast.error("CSV must contain a 'date' column");
              return;
            }
            
            if (!firstRow.product_id && !firstRow.id && !firstRow.product && !firstRow.item_id) {
              toast.error("CSV must contain a product identifier column (product_id, id, product, or item_id)");
              return;
            }
            
            if (!firstRow.units_sold && !firstRow.sales && !firstRow.quantity && !firstRow.units) {
              toast.error("CSV must contain a sales data column (units_sold, sales, quantity, or units)");
              return;
            }
            
            console.log("Parsed CSV data:", data);
            
            // Normalize data to ensure it has the required fields
            const normalizedData = normalizeData(data);
            console.log("Normalized data:", normalizedData);
            
            onDataLoaded(normalizedData, selectedFile.name);
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

  // Normalize data to ensure it has the required fields
  const normalizeData = (data: any[]): any[] => {
    return data.map(row => {
      const normalized: any = { ...row };
      
      // Ensure product_id exists (use alternatives if needed)
      if (!normalized.product_id) {
        normalized.product_id = normalized.id || normalized.product || normalized.item_id || 'unknown';
      }
      
      // Ensure units_sold exists (use alternatives if needed)
      if (!normalized.units_sold) {
        normalized.units_sold = normalized.sales || normalized.quantity || normalized.units || 0;
      }
      
      // Ensure product_name exists
      if (!normalized.product_name) {
        normalized.product_name = `Product ${normalized.product_id}`;
      }
      
      // Ensure price exists
      if (!normalized.price) {
        normalized.price = normalized.unit_price || normalized.selling_price || 0;
      }
      
      // Ensure date is in a consistent format
      if (normalized.date) {
        // Try to convert to ISO format if it's not already
        try {
          const dateObj = new Date(normalized.date);
          if (!isNaN(dateObj.getTime())) {
            normalized.date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
        } catch (e) {
          // Keep original if it can't be parsed
          console.warn("Could not parse date:", normalized.date);
        }
      }
      
      return normalized;
    });
  };

  const parseCSV = (text: string): any[] => {
    // Split by newlines, handling different newline formats
    const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row");
    }
    
    // Parse headers, handling various delimiters
    let delimiter = ',';
    if (lines[0].includes(';')) delimiter = ';';
    else if (lines[0].includes('\t')) delimiter = '\t';
    
    const headers = lines[0].split(delimiter).map(header => header.trim());
    console.log("CSV headers:", headers);
    
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const data = lines[i].split(delimiter);
      
      // Skip lines with incorrect field count, but be somewhat flexible
      if (data.length < headers.length * 0.8) {
        console.warn(`Line ${i} has too few fields (${data.length}), expected approximately ${headers.length}. Line: ${lines[i]}`);
        continue;
      }
      
      const obj: any = {};
      
      for (let j = 0; j < Math.min(headers.length, data.length); j++) {
        const header = headers[j];
        if (!header) continue; // Skip empty headers
        
        // Convert numeric values and handle empty cells
        const value = data[j]?.trim() || '';
        
        if (value === '') {
          obj[header] = null;
        } else if (!isNaN(Number(value)) && value !== '') {
          obj[header] = Number(value);
        } else {
          obj[header] = value;
        }
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
          The CSV should include at least date, product ID, and sales quantity columns.
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
