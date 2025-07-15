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
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-queries';
import { useToast } from '@/hooks/use-toast';
import { Database, BarChart2, AlertTriangle } from 'lucide-react';
import { DataQualityBySource } from '@/components/dashboard/data-quality-by-source';
import { cn } from '@/lib/utils';



export default function DataSources() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // New state for desktop sidebar
  const { toast } = useToast();

  // Mock data sources
  const dataSources = [
    {
      id: 1,
      name: 'Sales Database',
      type: 'PostgreSQL',
      status: 'connected',
      lastSync: '2024-01-12T10:30:00Z',
      qualityScore: 94,
      recordCount: 150000,
      issues: 12
    },
    {
      id: 2,
      name: 'Customer Data Sync',
      type: 'API',
      status: 'connected',
      lastSync: '2024-01-12T09:15:00Z',
      qualityScore: 87,
      recordCount: 85000,
      issues: 28
    },
    {
      id: 3,
      name: 'Product Catalog Update',
      type: 'CSV File',
      status: 'error',
      lastSync: '2024-01-11T18:45:00Z',
      qualityScore: 76,
      recordCount: 45000,
      issues: 45
    },
    {
      id: 4,
      name: 'Inventory System',
      type: 'MySQL',
      status: 'connected',
      lastSync: '2024-01-12T11:00:00Z',
      qualityScore: 91,
      recordCount: 32000,
      issues: 8
    }
  ];

  const totalSources = dataSources.length;
  const healthySources = dataSources.filter(s => s.status === 'connected').length;
  const atRiskSources = dataSources.filter(s => s.status === 'error').length;

  
 // Fetch data sources using authenticated query
  const { data: sources, isLoading: isLoadingSources } = useAuthenticatedQuery<DataSource[]>([
    '/api/dashboard/data-sources'
  ]);
  console.log('Data Sources - isLoadingSources:', isLoadingSources);
  console.log('Data Sources - sources:', sources);

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
              </div>

      <div className="flex-h-screen">     
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />          
        </div>
        
        <div className="flex-1 flex flex-col">
          <Navbar onSidebarToggle={() => setIsMobileSidebarOpen(true)}
            onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onDesktopSidebarToggle={toggleDesktopSidebar}
            isDesktopSidebarOpen={isDesktopSidebarOpen}/>
            </div>

          
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
              <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sources</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalSources}</p>
                    </div>
                    <Database className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                  </div>
                </CardContent>

                  <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Healthy Sources</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{healthySources}</p>
                    </div>
                    <BarChart2 className="h-10 w-10 text-green-500 dark:text-green-400" />
                  </div>
                </CardContent>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">At Risk</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{atRiskSources}</p>
                    </div>
                    <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Source</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Quality Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Records</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Issues</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataSources.map((source) => (
                        <tr key={source.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">{source.name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{source.type}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={source.status === 'connected' ? 'default' : 'destructive'}
                              className={source.status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                            >
                              {source.status === 'connected' ? 'Connected' : 'Error'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{source.qualityScore}%</span>
                              <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    source.qualityScore >= 90 ? 'bg-green-500' : 
                                    source.qualityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${source.qualityScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-900 dark:text-white">{source.recordCount.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-medium ${
                              source.issues > 30 ? 'text-red-600 dark:text-red-400' :
                              source.issues > 15 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {source.issues}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(source.lastSync).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              </Card>
            </div>
          </main>
         </>
  );
}