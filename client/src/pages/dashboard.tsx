import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/use-auth';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-queries';
import { downloadCSV } from '@/lib/utils';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { QualityScoreCards, } from '@/components/dashboard/quality-score-cards';
import { QualityTrendChart } from '@/components/dashboard/quality-trend-chart';
import { PipelineStatus } from '@/components/dashboard/pipeline-status';
import { DataIssuesSummary } from '@/components/dashboard/data-issues-summary';
import { RecentAnomalies } from '@/components/dashboard/recent-anomalies';
import { DataQualityBySource } from '@/components/dashboard/data-quality-by-source';
import { ScrollableStats } from '@/components/dashboard/scrollable-stats';
import { ScrollableInsights } from '@/components/dashboard/scrollable-insights';
import { QualityMetric, DataPipeline, DataIssue, DataSource, Anomaly, QualityTrendDataPoint } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DownloadIcon } from 'lucide-react';



export default function Dashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // New state for desktop sidebar
   const { user, isAuthenticated, isLoading } = useAuth();
  const [timeRange, setTimeRange] = useState('24h');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const DesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
 
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render the page content
  if (!isAuthenticated || !user) {
    return null;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render the page content
  if (!isAuthenticated || !user) {
    return null;
  }


  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render the page content
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // Fetch dashboard data using authenticated queries
 // Matches: /api/dashboard/quality-scores
const { data: qualityMetrics, isLoading: isLoadingMetrics } = useAuthenticatedQuery<QualityMetric>([
  '/api/dashboard/quality-scores'
]);

//  Matches: /api/dashboard/pipeline-status
const { data: pipelines, isLoading: isLoadingPipelines } = useAuthenticatedQuery<DataPipeline[]>([
  '/api/dashboard/pipeline-status'
]);

//  Matches: /api/dashboard/data-issues
const { data: issues, isLoading: isLoadingIssues } = useAuthenticatedQuery<DataIssue[]>([
  '/api/dashboard/data-issues'
]);

//  Matches: /api/dashboard/data-quality-by-source
const { data: sources, isLoading: isLoadingSources } = useAuthenticatedQuery<DataSource[]>([
  '/api/dashboard/data-quality-by-source'
]);

//  Matches: /api/dashboard/recent-anomalies
const { data: anomalies, isLoading: isLoadingAnomalies } = useAuthenticatedQuery<Anomaly[]>([
  '/api/dashboard/recent-anomalies'
]);

// Matches: /api/dashboard/quality-trends
const { data: trendData, isLoading: isLoadingTrendData } = useAuthenticatedQuery<QualityTrendDataPoint[]>([
  '/api/dashboard/quality-trends'
]);

  
  const handleRefreshPipelines = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/data-pipelines'] });
    toast({
      title: 'Refreshed',
      description: 'Pipeline data has been refreshed',
    });
  };
  
  const handleExportReport = async () => {
    try {
      toast({
        title: 'Exporting Report',
        description: 'Preparing your data quality report...',
      });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/export/report', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data-quality-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Complete',
        description: 'Report downloaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export report',
        variant: 'destructive',
      });
    }
  };
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    toast({
      title: 'Time Range Updated',
      description: `Dashboard now showing data for the last ${value === '24h' ? '24 hours' : value === '7d' ? '7 days' : value === '30d' ? '30 days' : 'quarter'}`,
    });
    // In a real implementation, we would refetch data with the new time range
  };

   const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
  
  return (
    <>
      <Helmet>
        <title>Dashboard | E-Commerce Data Quality</title>
        <meta name="description" content="Monitor and analyze data quality metrics across your e-commerce platform" />
      </Helmet>

      <div className="flex h-screen">
        {/* Desktop Sidebar with toggle state */}
        <Sidebar isOpen = {isDesktopSidebarOpen} onToggle={toggleDesktopSidebar} />
      
      <div className="flex-h-screen">
        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          <Navbar 
            onSidebarToggle={() => setIsMobileSidebarOpen(true)}
            onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onDesktopSidebarToggle={toggleDesktopSidebar}
            isDesktopSidebarOpen={isDesktopSidebarOpen} 
          />
          
          {/* Adjust main content margin based on sidebar state */}

          <main className="lg:ml-64 w-full px-4 sm:px-6 lg:px-8 py-6 pt-16 overflow-y-auto bg-gray-50 dark:bg-dark">

            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">E-Commerce Data Quality Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Monitor and analyze data quality metrics across your e-commerce platform</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="quarter">Last quarter</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleExportReport}>
                    <DownloadIcon className="mr-2 h-4 w-4" /> Export Report
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Horizontal Scrollable Stats */}
            <div className="mb-6 relative px-4 -mx-4 sm:-mx-6 lg:-mx-8">
              <ScrollableStats />
            </div>
            
            {/* Quality Score Cards */}
            <div className="mb-6">
              <QualityScoreCards 
                metrics={qualityMetrics as QualityMetric} 
                isLoading={isLoadingMetrics} 
              />
            </div>
            
            {/* Horizontal Scrollable Insights */}
            <div className="mb-6 relative px-4 -mx-4 sm:-mx-6 lg:-mx-8">
              <ScrollableInsights />
            </div>
            
            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main column - 2/3 width on large screens */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quality Trend Chart */}
                <QualityTrendChart 
                  trendData={trendData || []} 
                  isLoading={isLoadingTrendData} 
                />
                
                {/* Data Pipelines */}
                <PipelineStatus 
                  pipelines={pipelines || []} 
                  isLoading={isLoadingPipelines}
                  onRefresh={handleRefreshPipelines}
                />
              </div>
              
              {/* Sidebar column - 1/3 width on large screens */}
              <div className="space-y-6">
                {/* Data Issues Summary */}
                <DataIssuesSummary 
                  issues={issues || []} 
                  isLoading={isLoadingIssues} 
                />
                
                {/* Recent Anomalies */}
                <RecentAnomalies 
                  anomalies={anomalies || []} 
                  isLoading={isLoadingAnomalies} 
                />
                
                {/* Data Quality By Source */}
                <DataQualityBySource 
                  sources={sources || []} 
                  isLoading={isLoadingSources} 
                />
              </div>
            </div>
          </main>
        </div>
      </div>
      </div>
    </>  
  );
}

// This code is a React component for a dashboard page in an e-commerce data quality monitoring application.
