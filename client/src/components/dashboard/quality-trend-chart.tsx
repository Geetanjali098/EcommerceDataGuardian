import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart } from '@/components/ui/chart';
import { QualityTrendDataPoint } from '@/types';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QualityTrendChartProps {
  trendData: QualityTrendDataPoint[];
  isLoading?: boolean;
}

export function QualityTrendChart({ trendData, isLoading = false }: QualityTrendChartProps) {
  const chartData = useMemo(() => {
    if (!trendData?.length) return null;
    
    return {
      labels: trendData.map(item => item.month),
      datasets: [
        {
          label: 'Overall Quality',
          data: trendData.map(item => item.overallQuality),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Completeness',
          data: trendData.map(item => item.completeness),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Accuracy',
          data: trendData.map(item => item.accuracy),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }, [trendData]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: 70,
        max: 100,
        ticks: {
          callback: function(this: any, tickValue: any, index: number, ticks: any[]) {
            return tickValue + '%';
          }
        }
      }
    },
    plugins: {
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + context.parsed.y + '%';
          }
        }
      },
      legend: {
        position: 'top' as const,
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-dark-light shadow">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Data Quality Trend</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-dark-light shadow">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Data Quality Trend</CardTitle>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData ? (
            <Chart
              id="qualityTrendChart"
              type="line"
              data={chartData}
              options={chartOptions}
              height={320}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No trend data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default QualityTrendChart;
