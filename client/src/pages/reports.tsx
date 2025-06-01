import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { 
  QualityMetric, DataIssue, DataSource, QualityTrendDataPoint 
} from '@/types';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart2, PieChart, Download, Calendar, 
  ArrowDown, ArrowUp, Square 
} from 'lucide-react';
import { cn, downloadCSV } from '@/lib/utils';
import { Chart } from '@/components/ui/chart';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';


export default function Reports() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true); // New state for desktop sidebar
  const [timeRange, setTimeRange] = React.useState('month');
  const { toast } = useToast();
  
  // Fetch report data
  const { data: qualityMetrics, isLoading: isLoadingMetrics } = useQuery<QualityMetric>({
    queryKey: ['/api/dashboard/quality-metrics'],
  });
  
  const { data: issues, isLoading: isLoadingIssues } = useQuery<DataIssue[]>({
    queryKey: ['/api/dashboard/data-issues'],
  });
  
  const { data: sources, isLoading: isLoadingSources } = useQuery<DataSource[]>({
    queryKey: ['/api/dashboard/data-sources'],
  });
  
  const { data: trendData, isLoading: isLoadingTrendData } = useQuery<QualityTrendDataPoint[]>({
    queryKey: ['/api/dashboard/quality-trend'],
  });
  
  const handleExportReport = () => {
    toast({
      title: 'Exporting Report',
      description: 'Preparing your data quality report...',
    });
    
    downloadCSV('/api/export/report', 'data-quality-report.csv');
  };
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    toast({
      title: 'Time Range Updated',
      description: `Report now showing data for ${value === 'week' ? 'the last week' : value === 'month' ? 'the last month' : value === 'quarter' ? 'the last quarter' : 'the last year'}`,
    });
  };
  
  // Prepare issue chart data
  const issuesChartData = React.useMemo(() => {
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
          borderWidth: 1,
        }
      ]
    };
  }, [issues]);
  
  // Prepare sources chart data
  const sourcesChartData = React.useMemo(() => {
    if (!sources?.length) return null;
    
    return {
      labels: sources.map(source => source.name),
      datasets: [
        {
          label: 'Quality Score',
          data: sources.map(source => source.qualityScore),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        }
      ]
    };
  }, [sources]);

     const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
  
  return (
    <>
      <Helmet>
        <title>Reports | E-Commerce Data Quality</title>
        <meta name="description" content="Data quality reports and metrics for your e-commerce platform" />
      </Helmet>


       <div className="min-h-screen">
        {/* Desktop Sidebar with toggle state */}
      <Sidebar isOpen={isDesktopSidebarOpen} onToggle={toggleDesktopSidebar} />
      
      {/* Mobile Sidebar */}
      <div className="flex-h-screen">
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
         <Navbar onSidebarToggle={() => setIsMobileSidebarOpen(true)}
                              onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                              onDesktopSidebarToggle={toggleDesktopSidebar}
                              isDesktopSidebarOpen={isDesktopSidebarOpen}/>

         {/* Adjust main content margin based on sidebar state */}          
          
          <main className="lg:ml-64 w-full px-4 sm:px-6 lg:px-8 py-6 pt-16 overflow-y-auto bg-gray-50 dark:bg-dark">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reports</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Comprehensive data quality reports and analytics</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleExportReport}>
                    <Download className="mr-2 h-4 w-4" /> Export Report
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quality Metrics Summary */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                  Quality Metrics Summary
                </CardTitle>
                <CardDescription>
                  Overview of key quality metrics for {timeRange === 'week' ? 'the last week' : timeRange === 'month' ? 'the last month' : timeRange === 'quarter' ? 'the last quarter' : 'the last year'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse h-24 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    ))}
                  </div>
                ) : qualityMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Quality</p>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{qualityMetrics.overallScore}%</span>
                        <span className={cn("ml-2 flex items-center text-sm", 
                          qualityMetrics.trendChange >= 0 ? "text-green-500" : "text-red-500")}>
                          {qualityMetrics.trendChange >= 0 ? (
                            <ArrowUp className="h-4 w-4 mr-0.5" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-0.5" />
                          )}
                          {Math.abs(qualityMetrics.trendChange)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Freshness</p>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{qualityMetrics.dataFreshness}%</span>
                        <span className={cn("ml-2 flex items-center text-sm", 
                          qualityMetrics.freshnessChange >= 0 ? "text-green-500" : "text-red-500")}>
                          {qualityMetrics.freshnessChange >= 0 ? (
                            <ArrowUp className="h-4 w-4 mr-0.5" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-0.5" />
                          )}
                          {Math.abs(qualityMetrics.freshnessChange)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Completeness</p>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{qualityMetrics.dataCompleteness}%</span>
                        <span className={cn("ml-2 flex items-center text-sm", 
                          qualityMetrics.completenessChange >= 0 ? "text-green-500" : "text-red-500")}>
                          {qualityMetrics.completenessChange >= 0 ? (
                            <ArrowUp className="h-4 w-4 mr-0.5" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-0.5" />
                          )}
                          {Math.abs(qualityMetrics.completenessChange)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Accuracy</p>
                      <div className="mt-1 flex items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{qualityMetrics.dataAccuracy}%</span>
                        <span className={cn("ml-2 flex items-center text-sm", 
                          qualityMetrics.accuracyChange >= 0 ? "text-green-500" : "text-red-500")}>
                          {qualityMetrics.accuracyChange >= 0 ? (
                            <ArrowUp className="h-4 w-4 mr-0.5" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-0.5" />
                          )}
                          {Math.abs(qualityMetrics.accuracyChange)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">No quality metrics available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Issues Distribution */}
              <Card className="bg-white dark:bg-dark-light shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-primary" />
                    Issues Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingIssues ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-pulse h-48 w-48 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                    </div>
                  ) : issuesChartData ? (
                    <Chart
                      id="issuesChart"
                      type="pie"
                      data={issuesChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          }
                        }
                      }}
                      height={300}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No issues data available</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Distribution of data quality issues by type
                  </div>
                </CardFooter>
              </Card>
              
              {/* Sources Quality */}
              <Card className="bg-white dark:bg-dark-light shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                    Source Quality Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSources ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-pulse h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    </div>
                  ) : sourcesChartData ? (
                    <Chart
                      id="sourcesChart"
                      type="bar"
                      data={sourcesChartData}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false,
                          }
                        }
                      }}
                      height={300}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No source data available</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Quality scores by data source
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {/* Legend */}
            <Card className="bg-white dark:bg-dark-light shadow">
              <CardHeader>
                <CardTitle>Report Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Metrics Explanation</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Square className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                        <span><strong>Overall Quality:</strong> Weighted average of all quality metrics</span>
                      </li>
                      <li className="flex items-start">
                        <Square className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span><strong>Data Freshness:</strong> How recently data was updated</span>
                      </li>
                      <li className="flex items-start">
                        <Square className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />
                        <span><strong>Data Completeness:</strong> Percentage of required fields with values</span>
                      </li>
                      <li className="flex items-start">
                        <Square className="h-4 w-4 text-purple-500 mt-0.5 mr-2" />
                        <span><strong>Data Accuracy:</strong> Correctness of data based on validation rules</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Score Interpretation</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Square className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span><strong>85-100%:</strong> Excellent quality, minimal issues</span>
                      </li>
                      <li className="flex items-start">
                        <Square className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />
                        <span><strong>70-84%:</strong> Good quality, some improvements needed</span>
                      </li>
                      <li className="flex items-start">
                        <Square className="h-4 w-4 text-orange-500 mt-0.5 mr-2" />
                        <span><strong>50-69%:</strong> Fair quality, significant improvements needed</span>
                      </li>
                      <li className="flex items-start">
                        <Square className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                        <span><strong>0-49%:</strong> Poor quality, urgent attention required</span>
                      </li>
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