import React from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { QualityMetric, QualityTrendDataPoint } from '@/types';
import { BarChartBig, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Chart } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { cn, getChangeColor } from '@/lib/utils';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-queries';

export default function OverallQualityReport() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);
  
 
   // Fetch metrics using authenticated queries
  const { data: qualityMetrics, isLoading: isLoadingMetrics } = useAuthenticatedQuery<QualityMetric>([
    '/api/dashboard/quality-metrics'
  ]);
  
  // Fetch trend data using authenticated query
  const { data: trendData, isLoading: isLoadingTrendData } = useAuthenticatedQuery<QualityTrendDataPoint[]>([
    '/api/dashboard/quality-trend'
  ]);
  
  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!trendData?.length) return null;
    
    return {
      labels: trendData.map(point => point.month),
      datasets: [
        {
          label: 'Overall Quality',
          data: trendData.map(point => point.overallQuality),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.3,
        }
      ]
    };
  }, [trendData]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(this: any, tickValue: any, index: number, ticks: any[]) {
            return tickValue + '%';
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    }
  };

   const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
  
  
  return (
    <>
      <Helmet>
        <title>Overall Quality Report | E-Commerce Data Quality</title>
        <meta name="description" content="Detailed report on overall data quality metrics and trends" />
      </Helmet>
      
        <div className="min-h-screen">
      <Sidebar isOpen={isDesktopSidebarOpen} onToggle={toggleDesktopSidebar} />
    
      <div className="flex-h-screen">
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          <Navbar onSidebarToggle={() => setIsMobileSidebarOpen(true)}
           onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    onDesktopSidebarToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                              isDesktopSidebarOpen={isDesktopSidebarOpen} 
          />
          
          <main className="lg:ml-64 w-full px-4 sm:px-6 lg:px-8 py-6 pt-16 overflow-y-auto bg-gray-50 dark:bg-dark">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <a href="/dashboard" className="hover:text-primary">Dashboard</a>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white">Overall Quality</span>
            </div>
            
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Overall Quality Report</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Comprehensive analysis of your data quality metrics</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button variant="outline" className="mr-2">
                    <Clock className="mr-2 h-4 w-4" /> Historical Data
                  </Button>
                  <Button>
                    <BarChartBig className="mr-2 h-4 w-4" /> Export Report
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quality Score Summary */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <BarChartBig className="mr-2 h-5 w-5 text-primary" />
                  Quality Score Summary
                </CardTitle>
                <CardDescription>Current quality metrics for your e-commerce data</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ) : qualityMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Quality</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{qualityMetrics.overallScore}%</p>
                        </div>
                        <div className={cn("px-2 py-1 rounded text-xs font-medium", getChangeColor(qualityMetrics.trendChange))}>
                          {qualityMetrics.trendChange > 0 ? '+' : ''}{qualityMetrics.trendChange}%
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${qualityMetrics.overallScore}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Freshness</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{qualityMetrics.dataFreshness}%</p>
                        </div>
                        <div className={cn("px-2 py-1 rounded text-xs font-medium", getChangeColor(qualityMetrics.freshnessChange))}>
                          {qualityMetrics.freshnessChange > 0 ? '+' : ''}{qualityMetrics.freshnessChange}%
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${qualityMetrics.dataFreshness}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Completeness</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{qualityMetrics.dataCompleteness}%</p>
                        </div>
                        <div className={cn("px-2 py-1 rounded text-xs font-medium", getChangeColor(qualityMetrics.completenessChange))}>
                          {qualityMetrics.completenessChange > 0 ? '+' : ''}{qualityMetrics.completenessChange}%
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${qualityMetrics.dataCompleteness}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Accuracy</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{qualityMetrics.dataAccuracy}%</p>
                        </div>
                        <div className={cn("px-2 py-1 rounded text-xs font-medium", getChangeColor(qualityMetrics.accuracyChange))}>
                          {qualityMetrics.accuracyChange > 0 ? '+' : ''}{qualityMetrics.accuracyChange}%
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${qualityMetrics.dataAccuracy}%` }}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No quality metrics available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quality Trend */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Overall Quality Trend
                </CardTitle>
                <CardDescription>Quality score trends over the past months</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTrendData ? (
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ) : chartData ? (
                  <div className="h-72">
                    <Chart 
                      id="qualityTrendChart"
                      type="line"
                      data={chartData}
                      options={chartOptions}
                    />
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Analysis & Recommendations */}
            <Card className="bg-white dark:bg-dark-light shadow">
              <CardHeader className="pb-2">
                <CardTitle>Analysis & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <h3 className="font-medium text-gray-900 dark:text-white">Overall Analysis</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Your overall data quality score is {qualityMetrics?.overallScore}%, which is {qualityMetrics?.overallScore && qualityMetrics.overallScore >= 85 ? 'excellent' : qualityMetrics?.overallScore && qualityMetrics.overallScore >= 70 ? 'good' : 'needs improvement'}.
                      {qualityMetrics?.trendChange && qualityMetrics.trendChange > 0 ? 
                        ` There has been a ${qualityMetrics.trendChange}% improvement over the last period.` : 
                        qualityMetrics?.trendChange && qualityMetrics.trendChange < 0 ? 
                        ` There has been a ${Math.abs(qualityMetrics.trendChange)}% decline over the last period.` : 
                        ''}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                    <h3 className="font-medium text-gray-900 dark:text-white">Key Strengths</h3>
                    <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                      <li>Data freshness score is strong at {qualityMetrics?.dataFreshness}%</li>
                      <li>Regular data updates are keeping information current</li>
                      <li>Consistency in data structure across sources</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                    <h3 className="font-medium text-gray-900 dark:text-white">Areas for Improvement</h3>
                    <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                      {qualityMetrics?.dataCompleteness && qualityMetrics.dataCompleteness < 80 && (
                        <li>Data completeness is below target at {qualityMetrics.dataCompleteness}%</li>
                      )}
                      {qualityMetrics?.dataAccuracy && qualityMetrics.dataAccuracy < 80 && (
                        <li>Data accuracy could be improved from current {qualityMetrics.dataAccuracy}%</li>
                      )}
                      <li>Add additional validation rules to increase data accuracy</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <h3 className="font-medium text-gray-900 dark:text-white">Recommendations</h3>
                    <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                      <li>Implement additional field validation on product data entry</li>
                      <li>Review data transformation pipelines for potential issues</li>
                      <li>Set up alerts for sudden drops in data quality metrics</li>
                      <li>Consider automated data cleansing for historical records</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      </div>
    </>
  );
}