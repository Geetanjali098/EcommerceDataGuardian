import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { DataSource } from '@/types';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Database, BarChart2, AlertTriangle } from 'lucide-react';
import { DataQualityBySource } from '@/components/dashboard/data-quality-by-source';
import { cn } from '@/lib/utils';



export default function DataSources() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // New state for desktop sidebar
  const { toast } = useToast();
  
  // Fetch data sources
  const { data: sources, isLoading: isLoadingSources } = useQuery<DataSource[]>({
    queryKey: ['/api/dashboard/data-sources'],
  });

   const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
  
  
  return (
    <>
      <Helmet>
        <title>Data Sources | E-Commerce Data Quality</title>
        <meta name="description" content="View and manage data sources for your e-commerce platform" />
      </Helmet>
      
      <div className="min-h-screen">
              {/* Desktop Sidebar with toggle state */}
              <Sidebar isOpen={isDesktopSidebarOpen} onToggle={toggleDesktopSidebar} />

      <div className="flex-h-screen">     
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          <Navbar onSidebarToggle={() => setIsMobileSidebarOpen(true)}
            onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onDesktopSidebarToggle={toggleDesktopSidebar}
            isDesktopSidebarOpen={isDesktopSidebarOpen}/>
          
     {/* Adjust main content margin based on sidebar state */}
               
           <main className={cn(
           " lg:ml-64 w-full px-40 sm:px-20 lg:px-40 py-14 pt-31 overflow-y-auto bg-gray-50 dark:bg-dark",
            // Reduced margin when sidebar is collapsed,
           )}>
            {/* Page Title */}

            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Sources</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage and monitor quality metrics for all data sources</p>
                </div>
              </div>
            </div>
            
            {/* Summary Card */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5 text-primary" />
                  Data Sources Overview
                </CardTitle>
                <CardDescription>
                  Summary of all connected data sources and their quality metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sources</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{sources?.length || 0}</p>
                      </div>
                      <Database className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Healthy Sources</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {sources?.filter(source => source.qualityScore >= 80).length || 0}
                        </p>
                      </div>
                      <BarChart2 className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">At Risk</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {sources?.filter(source => source.qualityScore < 60).length || 0}
                        </p>
                      </div>
                      <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Data Quality By Source */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataQualityBySource 
                sources={sources || []} 
                isLoading={isLoadingSources} 
              />
              
              {/* Detailed Sources List */}
              <Card className="bg-white dark:bg-dark-light shadow">
                <CardHeader>
                  <CardTitle>Source Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSources ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 h-16 rounded-md"></div>
                      ))}
                    </div>
                  ) : sources && sources.length > 0 ? (
                    <div className="space-y-4">
                      {sources.map((source) => (
                        <div 
                          key={source.id} 
                          className="p-4 rounded-md border border-gray-200 dark:border-gray-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{source.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {source.id}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span 
                              className={`inline-block w-3 h-3 rounded-full ${
                                source.qualityScore >= 80 ? 'bg-green-500' : 
                                source.qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            ></span>
                            <span className="font-medium">{source.qualityScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">No data sources available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
    </>
  );
}