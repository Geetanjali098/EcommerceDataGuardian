import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataSource } from '@/types';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getScoreColor } from '@/lib/utils';

interface DataQualityBySourceProps {
  sources: DataSource[];
  isLoading?: boolean;
}

export function DataQualityBySource({ sources, isLoading = false }: DataQualityBySourceProps) {
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-dark-light shadow">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Quality by Data Source</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full animate-pulse" style={{ width: `${Math.random() * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-dark-light shadow">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Quality by Data Source</CardTitle>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sources.map((source) => (
            <div key={source.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{source.name}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{source.qualityScore}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={cn("h-2 rounded-full", getScoreColor(source.qualityScore))} 
                  style={{ width: `${source.qualityScore}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/reports/sources">
            <a className="text-sm font-medium text-primary hover:text-blue-600">
              View detailed breakdown →
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default DataQualityBySource;
