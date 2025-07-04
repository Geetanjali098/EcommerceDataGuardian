import React from 'react';
import { Link } from 'wouter';
import { 
  Card, CardContent, CardFooter 
} from '@/components/ui/card';
import { QualityMetric } from '@/types';
import { BarChartBig, Clock, CheckCircle, Target } from 'lucide-react';
import { cn, getChangeColor, getChangeIcon } from '@/lib/utils';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-queries';

interface QualityScoreCardsProps {
  metrics: QualityMetric;
  isLoading?: boolean;
}

export function QualityScoreCards({ metrics, isLoading = false }: QualityScoreCardsProps) {
  const scoreCards = [
    {
      title: 'Overall Quality Score',
      score: metrics?.overallScore,
      change: metrics?.trendChange,
      icon: <BarChartBig className="text-primary" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/quality/overall'
    },
    {
      title: 'Data Freshness',
      score: metrics?.dataFreshness,
      change: metrics?.freshnessChange,
      icon: <Clock className="text-success" />,
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/quality/freshness'
    },
    {
      title: 'Data Completeness',
      score: metrics?.dataCompleteness,
      change: metrics?.completenessChange,
      icon: <CheckCircle className="text-warning" />,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      href: '/quality/completeness'
    },
    {
      title: 'Data Accuracy',
      score: metrics?.dataAccuracy,
      change: metrics?.accuracyChange,
      icon: <Target className="text-secondary" />,
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      href: '/quality/accuracy'
    }
  ];

  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white dark:bg-dark-light shadow">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md p-3 animate-pulse">
                  <div className="h-5 w-5"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-dark px-5 py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {scoreCards.map((card, index) => (
        <Card key={index} className="bg-white dark:bg-dark-light shadow overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className={cn("flex-shrink-0 rounded-md p-3", card.bgColor)}>
                {card.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {card.title}
                </div>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {card.score}%
                  </div>
                  <div className={cn("ml-2 flex items-baseline text-sm font-semibold", getChangeColor(card.change))}>
                    {getChangeIcon(card.change) === 'arrow-up' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {getChangeIcon(card.change) === 'arrow-down' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="ml-1">{Math.abs(card.change)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-dark px-5 py-3">
            <Link href={card.href} className="text-sm font-medium text-primary hover:text-blue-600">
              View details
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default QualityScoreCards;
