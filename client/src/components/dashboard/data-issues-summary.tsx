import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart } from '@/components/ui/chart';
import { DataIssue } from '@/types';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';

interface DataIssuesSummaryProps {
  issues: DataIssue[];
  isLoading?: boolean;
}

export function DataIssuesSummary({ issues, isLoading = false }: DataIssuesSummaryProps) {
  const chartData = useMemo(() => {
    if (!issues?.length) return null;
    
    return {
      labels: issues.map(issue => {
        const type = issue.type.replace(/_/g, ' ');
        return type.charAt(0).toUpperCase() + type.slice(1);
      }),
      datasets: [
        {
          data: issues.map(issue => issue.count),
          backgroundColor: issues.map(issue => issue.color),
          borderWidth: 0,
          hoverOffset: 5
        }
      ]
    };
  }, [issues]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + ' issues';
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-dark-light shadow">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Data Issues Summary</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="w-56 h-56 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            <div className="space-y-3 mt-6 w-full">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                  <div className="flex-1 flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-dark-light shadow">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Data Issues Summary</CardTitle>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>
      </CardHeader>
      <CardContent>
        <div>
          {chartData ? (
            <Chart
              id="issuesDonutChart"
              type="doughnut"
              data={chartData}
              options={chartOptions}
              className="mb-4 mx-auto"
              height={220}
              width={220}
            />
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No issues data available</p>
            </div>
          )}
          
          <div className="space-y-3 mt-6">
            {issues.map((issue) => {
              const type = issue.type.replace(/_/g, ' ');
              const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
              
              return (
                <div key={issue.id} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: issue.color }}></div>
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formattedType}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(issue.count)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <Link href="/reports/issues">
              <a className="text-sm font-medium text-primary hover:text-blue-600">
                View detailed report →
              </a>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DataIssuesSummary;
