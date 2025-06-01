import React from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { useQuery } from '@tanstack/react-query';
import { QualityMetric } from '@/types';
import { CheckCircle, TrendingUp, TrendingDown, BarChartBig, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, getChangeColor } from '@/lib/utils';

export default function CompletenessReport() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true); // New state for desktop sidebar
  
  // Fetch metrics
  const { data: qualityMetrics, isLoading: isLoadingMetrics } = useQuery<QualityMetric>({
    queryKey: ['/api/dashboard/quality-metrics'],
  });

   const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
  
  return (
    <>
      <Helmet>
        <title>Data Completeness Report | E-Commerce Data Quality</title>
        <meta name="description" content="Detailed report on data completeness metrics and analysis" />
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
              <span className="text-gray-900 dark:text-white">Data Completeness</span>
            </div>
            
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Completeness Report</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Analysis of data field coverage and missing values</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button>
                    <BarChartBig className="mr-2 h-4 w-4" /> Export Report
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Completeness Score */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                  Data Completeness Score
                </CardTitle>
                <CardDescription>Percentage of required fields with valid values</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ) : qualityMetrics ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                      <div className="text-5xl font-bold text-gray-900 dark:text-white">
                        {qualityMetrics.dataCompleteness}%
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center items-center">
                      <div className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center", 
                        getChangeColor(qualityMetrics.completenessChange))}>
                        {qualityMetrics.completenessChange > 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {qualityMetrics.completenessChange > 0 ? '+' : ''}{qualityMetrics.completenessChange}% from last period
                      </div>
                    </div>
                    <div className="mt-6 w-full max-w-md mx-auto">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div 
                          className="bg-yellow-500 h-4 rounded-full" 
                          style={{ width: `${qualityMetrics.dataCompleteness}%` }}
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
                    <p className="text-gray-500 dark:text-gray-400">No completeness metrics available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Completeness By Entity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-white dark:bg-dark-light shadow h-full">
                  <CardHeader className="pb-2">
                    <CardTitle>Completeness By Entity</CardTitle>
                    <CardDescription>Data completeness across different data entities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Products */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Products</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">95%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      
                      {/* Customers */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Customers</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">82%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                      
                      {/* Orders */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Orders</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">91%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '91%' }}></div>
                        </div>
                      </div>
                      
                      {/* Shipping */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Shipping</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      
                      {/* Inventory */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Inventory</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">89%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: '89%' }}></div>
                        </div>
                      </div>
                      
                      {/* Reviews */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Reviews</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">68%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                {/* Completeness Analysis */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Completeness Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Overall Status</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Your data completeness score is <strong>{qualityMetrics?.dataCompleteness}%</strong>, which is 
                          <strong> {qualityMetrics?.dataCompleteness && qualityMetrics.dataCompleteness >= 90 ? 'excellent' : 
                            qualityMetrics?.dataCompleteness && qualityMetrics.dataCompleteness >= 75 ? 'good' : 
                            qualityMetrics?.dataCompleteness && qualityMetrics.dataCompleteness >= 60 ? 'fair' : 'poor'}</strong>.
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Critical Issues</h3>
                        <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                          <li>Review data has the lowest completeness (68%)</li>
                          <li>Shipping information missing in 22% of records</li>
                          <li>Customer demographic data incomplete</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Recommendations</h3>
                        <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                          <li>Make review rating fields required</li>
                          <li>Improve shipping data collection at checkout</li>
                          <li>Implement data validation for customer profiles</li>
                          <li>Promote profile completion with incentives</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Missing Data Fields */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Top Missing Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">customer.phone</span>
                        <span className="text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">48% missing</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">review.comment</span>
                        <span className="text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">42% missing</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">shipping.apartment</span>
                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">35% missing</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">customer.birthdate</span>
                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">29% missing</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">product.dimensions</span>
                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">22% missing</span>
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