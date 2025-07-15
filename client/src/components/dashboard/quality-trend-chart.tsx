import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart } from '@/components/ui/chart';
import { QualityTrendDataPoint } from '@/types';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QualityTrendChartProps {
 data?: any;
  isLoading?: boolean; 
}


export function QualityTrendChart({ data, isLoading = false }: QualityTrendChartProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Quality Score (%)'
        },
        min: 0,
        max: 100
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <Card className="bg-white dark:bg-dark-light shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Data Quality Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse h-48 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        ) : data ? (
          <div className="h-64">
              <Chart
              id="qualityTrendChart"
              type="line"
              data={data}
              options={chartOptions}
              height={256}
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No trend data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QualityTrendChart;