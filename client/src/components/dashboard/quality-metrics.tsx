// components/dashboard/quality-metrics.tsx
import { Card, CardContent } from "@/components/ui/card";
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-queries';

type QualityMetric = {
  overallScore: number;
  trendChange: number;
  dataFreshness: number;
  freshnessChange: number;
  dataCompleteness: number;
  completenessChange: number;
  dataAccuracy: number;
  accuracyChange: number;
};

export function QualityMetrics() {
  const { data: qualityMetrics, isLoading } = useAuthenticatedQuery<QualityMetric>(
    ["/api/dashboard/quality-metrics"]
  );

  if (isLoading || !qualityMetrics) return <div>Loading quality metrics...</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent>
          <p className="text-lg font-semibold">Overall Score: {qualityMetrics.overallScore}</p>
          <p className="text-sm text-muted">Trend: {qualityMetrics.trendChange}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-lg font-semibold">Accuracy: {qualityMetrics.dataAccuracy}%</p>
          <p className="text-sm text-muted">Change: {qualityMetrics.accuracyChange}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-lg font-semibold">Completeness: {qualityMetrics.dataCompleteness}%</p>
          <p className="text-sm text-muted">Change: {qualityMetrics.completenessChange}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-lg font-semibold">Freshness: {qualityMetrics.dataFreshness}%</p>
          <p className="text-sm text-muted">Change: {qualityMetrics.freshnessChange}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
