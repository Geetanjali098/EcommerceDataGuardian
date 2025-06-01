import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataPipeline } from '@/types';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatNumber, formatTimeAgo, getScoreColor, getStatusColor } from '@/lib/utils';

interface PipelineStatusProps {
  pipelines: DataPipeline[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function PipelineStatus({ pipelines, isLoading = false, onRefresh }: PipelineStatusProps) {
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-dark-light shadow">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Data Pipeline Status</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded h-2.5 animate-pulse"></div>
                        <div className="ml-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-dark-light shadow">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Data Pipeline Status</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3 bg-gray-50 dark:bg-dark text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pipeline
                </TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 dark:bg-dark text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Run
                </TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 dark:bg-dark text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 dark:bg-dark text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Records
                </TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 dark:bg-dark text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Health
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-gray-700">
              {pipelines.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {pipeline.name}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(pipeline.lastRun)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusColor(pipeline.status))}>
                      {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(pipeline.recordCount)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className={cn("h-2.5 rounded-full", getScoreColor(pipeline.healthScore))} style={{ width: `${pipeline.healthScore}%` }}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{pipeline.healthScore}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default PipelineStatus;
