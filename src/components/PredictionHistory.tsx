
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch, Calendar } from "lucide-react";

// Mock data for demonstration
const mockHistory = [
  {
    id: 1,
    filename: "sales_data_2024.csv",
    date: "2024-04-19",
    predictions: 12
  },
  {
    id: 2,
    filename: "march_sales.csv",
    date: "2024-03-15",
    predictions: 8
  }
];

export function PredictionHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="h-5 w-5" />
          Previous Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Predictions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.filename}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {item.date}
                  </div>
                </TableCell>
                <TableCell>{item.predictions} months</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
