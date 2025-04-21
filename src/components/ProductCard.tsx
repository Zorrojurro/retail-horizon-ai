
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ProductCardProps {
  product: any[];
  productId: string;
  onExport: (productId: string) => void;
}

export function ProductCard({ product, productId, onExport }: ProductCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Product Details</CardTitle>
        <CardDescription>{product[0].product_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current price:</span>
            <span className="font-medium">₹{product[product.length-1].price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Competitor price:</span>
            <span className="font-medium">₹{product[product.length-1].competitor_price}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 gap-1"
            onClick={() => onExport(productId)}
          >
            <Download className="h-3 w-3" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
