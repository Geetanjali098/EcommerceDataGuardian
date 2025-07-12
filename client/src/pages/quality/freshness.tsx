import React from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { useQuery } from '@tanstack/react-query';
import { QualityMetric } from '@/types';
import { Clock, TrendingUp, TrendingDown, BarChartBig, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, getChangeColor } from '@/lib/utils';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-queries';

export default function FreshnessReport() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true); // New state for desktop sidebar
  
   // Fetch metrics using authenticated query
  const { data: qualityMetrics, isLoading: isLoadingMetrics } = useAuthenticatedQuery<QualityMetric>([
    '/api/dashboard/quality-metrics'
  ]);

   const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
  
  return (
    <>
      <Helmet>
        <title>Data Freshness Report | E-Commerce Data Quality</title>
        <meta name="description" content="Detailed report on data freshness metrics and analysis" />
      </Helmet>
      
        
                <div className="min-h-screen">
                     {/* Desktop Sidebar with toggle state */}
                     <Sidebar isOpen={isDesktopSidebarOpen} onToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} />

      <div className="flex-h-screen">
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          <Navbar onSidebarToggle={() => setIsMobileSidebarOpen(true)}
           onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    onDesktopSidebarToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                              isDesktopSidebarOpen={isDesktopSidebarOpen} />
          
          <main className="lg:ml-64 w-full px-4 sm:px-6 lg:px-8 py-6 pt-16 overflow-y-auto bg-gray-50 dark:bg-dark">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <a href="/dashboard" className="hover:text-primary">Dashboard</a>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white">Data Freshness</span>
            </div>
            
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Freshness Report</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Analysis of how recently your data was updated</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button>
                    <BarChartBig className="mr-2 h-4 w-4" /> Export Report
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Freshness Score */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      Data Freshness Score
                    </CardTitle>
                    <CardDescription>How recently your data has been updated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMetrics ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ) : qualityMetrics ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-full">
                          <div className="text-5xl font-bold text-gray-900 dark:text-white">
                            {qualityMetrics.dataFreshness}%
                          </div>
                        </div>
                        <div className="mt-4 flex justify-center items-center">
                          <div className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center", 
                            getChangeColor(qualityMetrics.freshnessChange))}>
                            {qualityMetrics.freshnessChange > 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {qualityMetrics.freshnessChange > 0 ? '+' : ''}{qualityMetrics.freshnessChange}% from last period
                          </div>
                        </div>
                        <div className="mt-6 w-full max-w-md mx-auto">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div 
                              className="bg-green-500 h-4 rounded-full" 
                              style={{ width: `${qualityMetrics.dataFreshness}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <div>0%</div>
                            <div>50%</div>
                            <div>100%</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No freshness metrics available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Data Update Timeline */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Data Update Timeline</CardTitle>
                    <CardDescription>Latest updates across data sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute top-0 left-4 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                        <ul className="space-y-6">
                          <li className="relative pl-10">
                            <div className="absolute left-0 top-0 bg-green-100 dark:bg-green-900/20 border-4 border-green-400 rounded-full h-8 w-8 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-green-500 dark:text-green-400" />
                            </div>
                            <div className="bg-white dark:bg-dark-lighter p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900 dark:text-white">Product Catalog</h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                25,845 products updated with latest inventory and price changes
                              </p>
                            </div>
                          </li>
                          <li className="relative pl-10">
                            <div className="absolute left-0 top-0 bg-blue-100 dark:bg-blue-900/20 border-4 border-blue-400 rounded-full h-8 w-8 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            </div>
                            <div className="bg-white dark:bg-dark-lighter p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900 dark:text-white">Customer Data</h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Profile information and preferences refreshed for active customers
                              </p>
                            </div>
                          </li>
                          <li className="relative pl-10">
                            <div className="absolute left-0 top-0 bg-yellow-100 dark:bg-yellow-900/20 border-4 border-yellow-400 rounded-full h-8 w-8 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                            </div>
                            <div className="bg-white dark:bg-dark-lighter p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900 dark:text-white">Order History</h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">12 hours ago</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Order statuses and tracking information updated for 1,248 active orders
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Analysis Card */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Freshness Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Data Freshness Rating</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Your data freshness score is <strong>{qualityMetrics?.dataFreshness}%</strong>, which is 
                          <strong> {qualityMetrics?.dataFreshness && qualityMetrics.dataFreshness >= 90 ? 'excellent' : 
                            qualityMetrics?.dataFreshness && qualityMetrics.dataFreshness >= 75 ? 'good' : 
                            qualityMetrics?.dataFreshness && qualityMetrics.dataFreshness >= 60 ? 'fair' : 'poor'}</strong>. 
                          Freshness measures how recently your data has been updated.
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Data Source Analysis</h3>
                        <ul className="mt-2 space-y-2">
                          <li className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Product Catalog</span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Excellent</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Customer Data</span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Excellent</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Order History</span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Good</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Shipping Info</span>
                            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Fair</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Areas for Improvement</h3>
                        <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                          <li>More frequent updates to shipping information</li>
                          <li>Implement real-time inventory synchronization</li>
                          <li>Reduce lag time for order status updates</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recency Stats */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Data Recency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Real-time (less than 5 min)</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Recent (less than 1 hour)</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Today (less than 24 hours)</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">15%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Older (more than 24 hours)</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">5%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
      </div>
    </>
  );
}