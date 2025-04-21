
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Calendar } from "lucide-react";

interface Recommendation {
  recommendation: string;
  sentiment: string;
  duration: string;
  trend: string;
  trendDirection: "up" | "down";
  avgSales: string;
}

interface RecommendationCardProps {
  rec: Recommendation;
}

export function RecommendationCard({ rec }: RecommendationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recommendation</CardTitle>
        <CardDescription>AI-powered insight</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-lg font-medium">{rec.recommendation}</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Projected viability: {rec.duration}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
