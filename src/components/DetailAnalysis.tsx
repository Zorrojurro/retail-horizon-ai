
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DetailAnalysisProps {
  rec: {
    trendDirection: "up" | "down";
  };
  product: any[];
}

export function DetailAnalysis({ rec, product }: DetailAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detailed Analysis</CardTitle>
        <CardDescription>
          Factors affecting product performance in the Indian market
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Seasonal Impact</h4>
              <p className="text-sm text-muted-foreground">
                Sales of this product tend to {rec.trendDirection === "up" ? "increase" : "decrease"} during {product[0].season}.
                {rec.trendDirection === "up"
                  ? " Consider increasing stock levels during this season."
                  : " Consider reducing orders during this season."}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Price Sensitivity</h4>
              <p className="text-sm text-muted-foreground">
                {Math.abs(product[0].price - product[product.length-1].competitor_price) > 5
                  ? "There is a significant price difference compared to competitors, which may impact sales."
                  : "The product is competitively priced in the market."}
                {product[0].price > product[product.length-1].competitor_price
                  ? " Consider adjusting your pricing strategy to remain competitive."
                  : ""}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Festival Season Impact</h4>
              <p className="text-sm text-muted-foreground">
                Indian festival seasons (Diwali, Holi, Navratri) significantly impact sales patterns.
                {rec.trendDirection === "up"
                  ? " Plan for increased inventory during major festivals to maximize revenue opportunities."
                  : " Consider targeted promotions during festival seasons to boost sales."}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Regional Variations</h4>
              <p className="text-sm text-muted-foreground">
                Sales patterns vary across different regions in India. North and West India show stronger
                demand during winter months, while South India maintains more consistent demand year-round.
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
