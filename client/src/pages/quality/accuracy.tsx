import React from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { useQuery } from '@tanstack/react-query';
import { QualityMetric } from '@/types';
import { Target, TrendingUp, TrendingDown, BarChartBig, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, getChangeColor } from '@/lib/utils';

export default function AccuracyReport() {
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
        <title>Data Accuracy Report | E-Commerce Data Quality</title>
        <meta name="description" content="Detailed report on data accuracy metrics and analysis" />
      </Helmet>
      
      <div className="min-h-screen">
        {/* Desktop Sidebar with toggle state */}
        <Sidebar isOpen={isDesktopSidebarOpen} onToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} />
        
        {/* Mobile Sidebar */}
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
              <span className="text-gray-900 dark:text-white">Data Accuracy</span>
            </div>
            
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Accuracy Report</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Analysis of data correctness and validation</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button>
                    <BarChartBig className="mr-2 h-4 w-4" /> Export Report
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Accuracy Score */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-primary" />
                  Data Accuracy Score
                </CardTitle>
                <CardDescription>Measure of data correctness based on validation rules</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ) : qualityMetrics ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                      <div className="text-5xl font-bold text-gray-900 dark:text-white">
                        {qualityMetrics.dataAccuracy}%
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center items-center">
                      <div className={cn("px-3 py-1 rounded-full text-sm font-medium flex items-center", 
                        getChangeColor(qualityMetrics.accuracyChange))}>
                        {qualityMetrics.accuracyChange > 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {qualityMetrics.accuracyChange > 0 ? '+' : ''}{qualityMetrics.accuracyChange}% from last period
                      </div>
                    </div>
                    <div className="mt-6 w-full max-w-md mx-auto">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div 
                          className="bg-purple-500 h-4 rounded-full" 
                          style={{ width: `${qualityMetrics.dataAccuracy}%` }}
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
                    <p className="text-gray-500 dark:text-gray-400">No accuracy metrics available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Accuracy by Data Type */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Accuracy by Data Type</CardTitle>
                    <CardDescription>How accurate different types of data are</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Text Data */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Text Data</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">97%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '97%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Product names, descriptions, customer names
                        </p>
                      </div>
                      
                      {/* Numeric Data */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Numeric Data</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">94%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Prices, quantities, dimensions, weights
                        </p>
                      </div>
                      
                      {/* Date/Time Data */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Date/Time Data</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">96%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Order dates, shipping dates, customer registration dates
                        </p>
                      </div>
                      
                      {/* Address Data */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Address Data</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">82%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Shipping addresses, billing addresses
                        </p>
                      </div>
                      
                      {/* Email Data */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Email Data</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">98%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Customer email addresses
                        </p>
                      </div>
                      
                      {/* Phone Data */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Phone Data</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">88%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Customer phone numbers
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Accuracy Analysis */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Accuracy Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Overall Status</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Your data accuracy score is <strong>{qualityMetrics?.dataAccuracy}%</strong>, which is 
                          <strong> {qualityMetrics?.dataAccuracy && qualityMetrics.dataAccuracy >= 90 ? 'excellent' : 
                            qualityMetrics?.dataAccuracy && qualityMetrics.dataAccuracy >= 75 ? 'good' : 
                            qualityMetrics?.dataAccuracy && qualityMetrics.dataAccuracy >= 60 ? 'fair' : 'poor'}</strong>.
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Problem Areas</h3>
                        <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                          <li>Address data has the lowest accuracy (82%)</li>
                          <li>Phone number format inconsistencies (88%)</li>
                          <li>Product weight/dimension discrepancies</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                        <h3 className="font-medium text-gray-900 dark:text-white">Strengths</h3>
                        <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                          <li>Email validation is highly effective (98%)</li>
                          <li>Text data maintains excellent accuracy (97%)</li>
                          <li>Date formatting is consistent across systems</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Validation Rules */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Validation Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Email Format</span>
                        <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                          99.8% pass
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Price Range</span>
                        <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                          99.6% pass
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Postal Code</span>
                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
                          94.2% pass
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Phone Format</span>
                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
                          91.5% pass
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-dark-lighter">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Address Verification</span>
                        <span className="text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">
                          85.4% pass
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recommendations */}
                <Card className="bg-white dark:bg-dark-light shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2 mt-0.5">
                          <span className="block w-3 h-3 bg-blue-500 rounded-full"></span>
                        </div>
                        <span>Implement address validation service for shipping addresses</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2 mt-0.5">
                          <span className="block w-3 h-3 bg-blue-500 rounded-full"></span>
                        </div>
                        <span>Standardize phone number format across all collection points</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2 mt-0.5">
                          <span className="block w-3 h-3 bg-blue-500 rounded-full"></span>
                        </div>
                        <span>Add automated unit conversion for product dimensions</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2 mt-0.5">
                          <span className="block w-3 h-3 bg-blue-500 rounded-full"></span>
                        </div>
                        <span>Improve product data quality checks before import</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2 mt-0.5">
                          <span className="block w-3 h-3 bg-blue-500 rounded-full"></span>
                        </div>
                        <span>Review and update data validation rules quarterly</span>
                      </li>
                    </ul>
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