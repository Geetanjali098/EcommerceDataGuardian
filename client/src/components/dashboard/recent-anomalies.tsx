import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Anomaly } from '@/types';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn, formatTimeAgo, getSeverityColor, getSeverityIcon } from '@/lib/utils';

interface RecentAnomaliesProps {
  anomalies: Anomaly[];
  isLoading?: boolean;
}

export function RecentAnomalies({ anomalies, isLoading = false }: RecentAnomaliesProps) {
  const newAnomaliesCount = anomalies?.filter(anomaly => anomaly.isNew).length || 0;
  
  const getSeverityIconComponent = (severity: string) => {
    switch (getSeverityIcon(severity)) {
      case 'exclamation-circle':
        return <AlertCircle className="text-error" />;
      case 'exclamation-triangle':
        return <AlertTriangle className="text-warning" />;
      case 'info-circle':
        return <Info className="text-info" />;
      default:
        return <Info className="text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-dark-light shadow">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Recent Anomalies</CardTitle>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="ml-3 w-full">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-dark-light shadow">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Recent Anomalies</CardTitle>
        {newAnomaliesCount > 0 && (
          <Badge variant="destructive" className="rounded-full text-xs font-medium">
            {newAnomaliesCount} New
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className={cn("p-3 rounded-lg border", getSeverityColor(anomaly.severity))}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {getSeverityIconComponent(anomaly.severity)}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {anomaly.title}
                  </h3>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <p>{anomaly.description}</p>
                    <p className="mt-1">{formatTimeAgo(anomaly.timestamp)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/anomalies">
            <a className="text-sm font-medium text-primary hover:text-blue-600">
              View all anomalies →
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentAnomalies;
