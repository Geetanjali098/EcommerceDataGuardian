import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollableMetricsCards } from './scrollable-metrics-cards';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Search, AlertTriangle, 
  FileText, Clock, Globe, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  title: string;
  description: string;
  category: string;
  timestamp: string;
  icon: React.ReactNode;
  color?: string;
}

const InsightCard = ({ title, description, category, timestamp, icon, color = 'blue' }: InsightCardProps) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
  };

  const badgeColorMap = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  };

  return (
    <Card className="bg-white dark:bg-dark-light shadow border-0 flex-shrink-0 w-[320px] sm:w-[350px]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("rounded-full p-2", colorMap[color as keyof typeof colorMap] || colorMap.blue)}>
            {icon}
          </div>
          <Badge className={cn(badgeColorMap[color as keyof typeof badgeColorMap] || badgeColorMap.blue)}>
            {category}
          </Badge>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{description}</p>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-1" />{timestamp}
        </div>
      </CardFooter>
    </Card>
  );
};

export function ScrollableInsights() {
  // Sample data for the scrollable insights
  const insightsData = [
    { 
      title: 'Conversion Rate Increase', 
      description: 'Product page conversion rate has increased by 12% after recent UI updates.', 
      category: 'Performance', 
      timestamp: '2 hours ago', 
      icon: <TrendingUp className="h-5 w-5" />, 
      color: 'green' 
    },
    { 
      title: 'Search Results Anomaly', 
      description: 'Detected unusual pattern in search results for "summer collection" with high abandonment.', 
      category: 'Anomaly', 
      timestamp: '4 hours ago', 
      icon: <Search className="h-5 w-5" />, 
      color: 'red'
    },
    { 
      title: 'Data Freshness Alert', 
      description: 'Product inventory data is 4 hours behind schedule. Check data pipeline.', 
      category: 'Alert', 
      timestamp: '6 hours ago', 
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'yellow'
    },
    { 
      title: 'New Trend Detected', 
      description: 'Mobile users are showing 28% higher engagement with video content.', 
      category: 'Trend', 
      timestamp: '12 hours ago', 
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'purple' 
    },
    { 
      title: 'Geographical Insight', 
      description: 'Users from West Coast spend 15% more time on product pages during evenings.', 
      category: 'Regional', 
      timestamp: '1 day ago', 
      icon: <Globe className="h-5 w-5" />,
      color: 'blue' 
    },
    { 
      title: 'Weekly Report Available', 
      description: 'Your custom weekly data quality report is now available for download.', 
      category: 'Report', 
      timestamp: '1 day ago', 
      icon: <FileText className="h-5 w-5" />,
      color: 'orange' 
    },
  ];
  
  return (
    <ScrollableMetricsCards title="Featured Insights">
      {insightsData.map((insight, index) => (
        <InsightCard
          key={index}
          title={insight.title}
          description={insight.description}
          category={insight.category}
          timestamp={insight.timestamp}
          icon={insight.icon}
          color={insight.color}
        />
      ))}
    </ScrollableMetricsCards>
  );
}