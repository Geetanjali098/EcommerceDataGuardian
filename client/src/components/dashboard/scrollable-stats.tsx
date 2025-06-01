import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollableMetricsCards } from './scrollable-metrics-cards';
import { 
  BarChart2, TrendingUp, Database, CheckCircle, 
  AlertCircle, Clock, Users, ShoppingBag, ArrowUp, 
  ArrowDown, Activity, HardDrive, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}

const StatsCard = ({ title, value, change, icon, color = 'blue' }: StatsCardProps) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
  };

  return (
    <Card className="bg-white dark:bg-dark-light shadow border-0 flex-shrink-0 w-[220px] sm:w-[250px]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("rounded-full p-2", colorMap[color as keyof typeof colorMap] || colorMap.blue)}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center text-sm font-medium", 
              change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {change >= 0 ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

export function ScrollableStats() {
  // Sample data for the scrollable cards
  const statsData = [
    { title: 'Overall Quality Score', value: '92%', change: 3.2, icon: <BarChart2 className="h-5 w-5" />, color: 'blue' },
    { title: 'Data Sources', value: '8', icon: <Database className="h-5 w-5" />, color: 'purple' },
    { title: 'Active Pipelines', value: '12', icon: <Activity className="h-5 w-5" />, color: 'green' },
    { title: 'Critical Anomalies', value: '3', change: -2.1, icon: <AlertCircle className="h-5 w-5" />, color: 'red' },
    { title: 'Data Volume', value: '1.2 TB', change: 5.8, icon: <HardDrive className="h-5 w-5" />, color: 'indigo' },
    { title: 'Total Products', value: '4,521', change: 1.2, icon: <ShoppingBag className="h-5 w-5" />, color: 'teal' },
    { title: 'Active Users', value: '8,294', change: 7.4, icon: <Users className="h-5 w-5" />, color: 'orange' },
    { title: 'Reports Generated', value: '312', icon: <FileText className="h-5 w-5" />, color: 'yellow' },
  ];
  
  return (
    <ScrollableMetricsCards title="Key Metrics at a Glance">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </ScrollableMetricsCards>
  );
}