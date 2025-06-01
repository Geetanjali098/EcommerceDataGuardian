import React from 'react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { DataPipeline } from '@/types';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Filter, RefreshCw, Clock, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { PipelineStatus } from '@/components/dashboard/pipeline-status';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { cn, formatTimeAgo, getScoreColor, getStatusColor } from '@/lib/utils';


export default function DataPipelines() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
   const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // New state for desktop sidebar
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch data pipelines
  const { data: pipelines, isLoading: isLoadingPipelines } = useQuery<DataPipeline[]>({
    queryKey: ['/api/dashboard/data-pipelines'],
  });
  
  const handleRefreshPipelines = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/data-pipelines'] });
    toast({
      title: 'Refreshed',
      description: 'Pipeline data has been refreshed',
    });
  };
  
  // Calculate pipeline status counts
  const counts = React.useMemo(() => {
    if (!pipelines) return { running: 0, completed: 0, failed: 0, warning: 0 };
    
    return pipelines.reduce((acc, pipeline) => {
      acc[pipeline.status] = (acc[pipeline.status] || 0) + 1;
      return acc;
    }, { running: 0, completed: 0, failed: 0, warning: 0 } as Record<string, number>);
  }, [pipelines]);
  
   const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
   
  return (
    <>
      <Helmet>
        <title>Data Pipelines | E-Commerce Data Quality</title>
        <meta name="description" content="Monitor and manage data pipelines for your e-commerce platform" />
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
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Pipelines</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Monitor and manage your data processing pipelines</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button onClick={handleRefreshPipelines}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh All
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white dark:bg-dark-light shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Running</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.running}</p>
                    </div>
                    <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/30">
                      <Clock className="h-6 w-6 text-green-500 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-dark-light shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.completed}</p>
                    </div>
                    <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                      <CheckCircle className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-dark-light shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Warning</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.warning}</p>
                    </div>
                    <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900/30">
                      <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-dark-light shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.failed}</p>
                    </div>
                    <div className="rounded-full p-2 bg-red-100 dark:bg-red-900/30">
                      <AlertOctagon className="h-6 w-6 text-red-500 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Pipeline Table */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-primary" />
                  Pipeline Status
                </CardTitle>
                <CardDescription>
                  Current status of all data processing pipelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PipelineStatus 
                  pipelines={pipelines || []} 
                  isLoading={isLoadingPipelines}
                  onRefresh={handleRefreshPipelines}
                />
              </CardContent>
            </Card>
            
            {/* Pipeline Details */}
            <Card className="bg-white dark:bg-dark-light shadow">
              <CardHeader className="pb-2">
                <CardTitle>Pipeline Details</CardTitle>
                <CardDescription>
                  Detailed view of individual pipelines and their metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPipelines ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 h-20 rounded-md"></div>
                    ))}
                  </div>
                ) : pipelines && pipelines.length > 0 ? (
                  <div className="space-y-4">
                    {pipelines.map((pipeline) => (
                      <div 
                        key={pipeline.id} 
                        className="p-4 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900 dark:text-white">{pipeline.name}</h3>
                              <span className={cn("ml-2 px-2 py-0.5 text-xs font-semibold rounded-full", getStatusColor(pipeline.status))}>
                                {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Last run: {formatTimeAgo(pipeline.lastRun.toString())}
                            </p>
                          </div>
                          <div className="mt-3 md:mt-0 flex items-center">
                            <div className="mr-4">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Records</p>
                              <p className="font-semibold">{pipeline.recordCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Health</p>
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div className={cn("h-2.5 rounded-full", getScoreColor(pipeline.healthScore))} style={{ width: `${pipeline.healthScore}%` }}></div>
                                </div>
                                <span className="ml-2 text-sm">{pipeline.healthScore}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">No pipelines available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      </div>
    </>
  );
}