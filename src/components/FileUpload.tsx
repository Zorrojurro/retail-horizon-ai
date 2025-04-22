
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cloud, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Sample CSV data with more consistent values for demonstration
const sampleData = `date,product_id,product_name,units_sold,price,category,region,promotion,competitor_price
2023-01-01,1,Coffee Maker,12,99.99,home,north,Yes,109.99
2023-01-15,1,Coffee Maker,10,99.99,home,north,No,104.99
2023-02-01,1,Coffee Maker,15,89.99,home,north,Yes,104.99
2023-02-15,1,Coffee Maker,18,89.99,home,north,No,99.99
2023-03-01,1,Coffee Maker,22,89.99,home,north,Yes,99.99
2023-03-15,1,Coffee Maker,20,89.99,home,north,No,104.99
2023-04-01,1,Coffee Maker,18,89.99,home,north,No,99.99
2023-04-15,1,Coffee Maker,10,99.99,home,north,No,109.99
2023-05-01,1,Coffee Maker,12,99.99,home,north,No,109.99
2023-05-15,1,Coffee Maker,15,89.99,home,north,Yes,99.99
2023-06-01,1,Coffee Maker,20,89.99,home,north,Yes,99.99
2023-06-15,1,Coffee Maker,15,89.99,home,north,No,104.99
2023-07-01,1,Coffee Maker,12,99.99,home,north,No,109.99
2023-07-15,1,Coffee Maker,8,99.99,home,north,No,109.99
2023-08-01,1,Coffee Maker,10,99.99,home,north,No,104.99
2023-08-15,1,Coffee Maker,15,89.99,home,north,Yes,99.99
2023-09-01,1,Coffee Maker,25,89.99,home,north,Yes,99.99
2023-09-15,1,Coffee Maker,22,89.99,home,north,Yes,99.99
2023-10-01,1,Coffee Maker,28,89.99,home,north,Yes,99.99
2023-10-15,1,Coffee Maker,25,89.99,home,north,Yes,99.99
2023-11-01,1,Coffee Maker,20,89.99,home,north,Yes,99.99
2023-11-15,1,Coffee Maker,15,89.99,home,north,No,104.99
2023-12-01,1,Coffee Maker,25,89.99,home,north,Yes,99.99
2023-12-15,1,Coffee Maker,28,89.99,home,north,Yes,99.99`;

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
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain", // Allow .txt files that might contain CSV data
        "application/octet-stream" // Some systems use this generic type
      ];
      
      // Check if the file extension is .csv or if it's a recognized CSV type
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.endsWith('.csv') && 
          !selectedFile.name.endsWith('.txt')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      setFile(selectedFile);
      
      // Parse the CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            toast.error("Failed to read file content");
            return;
          }
          
          const text = event.target.result as string;
          console.log("CSV file content sample:", text.substring(0, 200));
          
          if (text.trim().length === 0) {
            toast.error("The file is empty");
            return;
          }
          
          const data = parseCSV(text);
          
          if (data.length === 0) {
            toast.error("No data found in CSV file");
            return;
          }
          
          // Validate required fields
          if (data.length > 0) {
            const firstRow = data[0];
            const missingFields = [];
            
            if (!hasField(firstRow, ['date'])) {
              missingFields.push("date");
            }
            
            if (!hasField(firstRow, ['product_id', 'id', 'product', 'item_id'])) {
              missingFields.push("product ID");
            }
            
            if (!hasField(firstRow, ['units_sold', 'sales', 'quantity', 'units'])) {
              missingFields.push("sales quantity");
            }
            
            if (missingFields.length > 0) {
              toast.error(`Missing required fields: ${missingFields.join(", ")}`);
              return;
            }
            
            console.log("Parsed CSV data:", data);
            
            // Normalize data to ensure it has the required fields
            const normalizedData = normalizeData(data);
            console.log("Normalized data sample:", normalizedData.slice(0, 2));
            
            onDataLoaded(normalizedData, selectedFile.name);
            toast.success(`${data.length} records loaded successfully`);
          } else {
            toast.error("No data found in CSV file");
          }
        } catch (error: any) {
          console.error("Error parsing CSV:", error);
          toast.error(`Failed to parse CSV file: ${error.message || "Unknown error"}`);
        }
      };
      
      reader.onerror = () => {
        toast.error("Failed to read the file");
      };
      
      reader.readAsText(selectedFile);
    }
  };

  // Helper function to check if an object has at least one of the fields
  const hasField = (obj: any, fields: string[]): boolean => {
    return fields.some(field => obj[field] !== undefined);
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
        // Convert to number if it's a string
        if (typeof normalized.units_sold === 'string') {
          normalized.units_sold = parseFloat(normalized.units_sold) || 0;
        }
      }
      
      // Ensure product_name exists
      if (!normalized.product_name) {
        normalized.product_name = `Product ${normalized.product_id}`;
      }
      
      // Ensure price exists
      if (!normalized.price) {
        normalized.price = normalized.unit_price || normalized.selling_price || 0;
        // Convert to number if it's a string
        if (typeof normalized.price === 'string') {
          normalized.price = parseFloat(normalized.price) || 0;
        }
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
      } else {
        // Add a placeholder date if none exists
        normalized.date = new Date().toISOString().split('T')[0];
      }
      
      // Ensure category exists
      if (!normalized.category) {
        normalized.category = "default";
      }
      
      // Ensure region exists
      if (!normalized.region) {
        normalized.region = "default";
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
    
    // Auto-detect delimiter by checking first line
    let delimiter = ',';
    if (lines[0].includes(';')) delimiter = ';';
    else if (lines[0].includes('\t')) delimiter = '\t';
    else if (lines[0].includes('|')) delimiter = '|';
    
    // Handle headers with potential quotes and whitespace
    const headers = lines[0].split(delimiter).map(header => {
      let cleanHeader = header.trim();
      // Remove quotes if present
      if ((cleanHeader.startsWith('"') && cleanHeader.endsWith('"')) || 
          (cleanHeader.startsWith("'") && cleanHeader.endsWith("'"))) {
        cleanHeader = cleanHeader.substring(1, cleanHeader.length - 1);
      }
      return cleanHeader.trim().toLowerCase();
    });
    
    console.log("CSV headers:", headers);
    
    const result = [];
    
    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle quoted values properly
      const values = [];
      let currentValue = "";
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"' && (j === 0 || lines[i][j-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          values.push(currentValue);
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue);
      
      // Skip if we didn't get any values
      if (values.length === 0) continue;
      
      // Create an object from headers and values
      const obj: Record<string, any> = {};
      
      for (let j = 0; j < Math.min(headers.length, values.length); j++) {
        if (!headers[j]) continue; // Skip empty headers
        
        let value = values[j].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        
        // Convert to appropriate type
        if (value === "" || value.toLowerCase() === "null" || value.toLowerCase() === "n/a") {
          obj[headers[j]] = null;
        } else if (!isNaN(Number(value)) && value !== "") {
          obj[headers[j]] = parseFloat(value);
        } else if (value.toLowerCase() === "true") {
          obj[headers[j]] = true;
        } else if (value.toLowerCase() === "false") {
          obj[headers[j]] = false;
        } else {
          obj[headers[j]] = value;
        }
      }
      
      // Only add if we have at least some data
      if (Object.keys(obj).length > 0) {
        result.push(obj);
      }
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
          The CSV should include date, product ID, and sales quantity columns.
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
              accept=".csv,.txt"
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
