import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Anomaly } from '@/types';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn, formatTimeAgo, getSeverityColor } from '@/lib/utils';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-queries';

export default function Anomalies() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);
  const [severityFilter, setSeverityFilter] = React.useState<string>("all");
  const { toast } = useToast();
  
   // Fetch recent anomalies for the alert history
    const { data: anomalies, isLoading: isLoadingAnomalies } = useAuthenticatedQuery<Anomaly[]>
    (['/api/dashboard/anomalies']);

  // Log the loading state and anomalies data for debugging
  console.log('Anomalies Page - isLoadingAnomalies:', isLoadingAnomalies);
  console.log('Anomalies Page - anomalies:', anomalies);
  
  // Filter anomalies by severity
  const filteredAnomalies = React.useMemo(() => {
    if (!anomalies) return [];
    if (severityFilter === "all") return anomalies;
    return anomalies.filter(anomaly => anomaly.severity === severityFilter);
  }, [anomalies, severityFilter]);
  
  // Count anomalies by severity
  const counts = React.useMemo(() => {
    if (!anomalies) return { critical: 0, warning: 0, info: 0 };
    
    return anomalies.reduce((acc, anomaly) => {
      acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
      return acc;
    }, { critical: 0, warning: 0, info: 0 } as Record<string, number>);
  }, [anomalies]);
  
  const handleSeverityFilterChange = (value: string) => {
    setSeverityFilter(value);
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="text-error" />;
      case 'warning':
        return <AlertTriangle className="text-warning" />;
      case 'info':
        return <Info className="text-info" />;
      default:
        return <Info className="text-gray-500" />;
    }
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  }; 
  
  return (
    <>
      <Helmet>
        <title>Anomalies | E-Commerce Data Quality</title>
        <meta name="description" content="Detected anomalies in your e-commerce data" />
      </Helmet>
       
      <div className="flex h-screen">
        <Sidebar isOpen={isDesktopSidebarOpen} onToggle={toggleDesktopSidebar} />
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          <Navbar  
            onSidebarToggle={() => setIsMobileSidebarOpen(true)}
            onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onDesktopSidebarToggle={toggleDesktopSidebar}
            isDesktopSidebarOpen={isDesktopSidebarOpen}
          />
          
          <main className=" flex-1 lg:ml-20 w-full px-4 sm:px-6 lg:px-8 py-6 pt-16 overflow-y-auto bg-gray-50 dark:bg-dark">
            {/* Page Header */}
            <div className="mb-6 max-w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Anomalies</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Detected anomalies and data quality issues</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Select value={severityFilter} onValueChange={handleSeverityFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
           
            {/* Severity Counts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full">
              <Card className="bg-white dark:bg-dark-light shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.critical}</p>
                    </div>
                    <div className="rounded-full p-2 bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
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
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Info</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.info}</p>
                    </div>
                    <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                      <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Anomalies List */}
            <Card className="bg-white dark:bg-dark-light shadow w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                  {severityFilter === "all" ? "All Anomalies" : `${severityFilter.charAt(0).toUpperCase() + severityFilter.slice(1)} Anomalies`}
                </CardTitle>
                <CardDescription>
                  {filteredAnomalies.length} anomalies detected in your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnomalies ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 h-24 rounded-md"></div>
                    ))}
                  </div>
                ) : filteredAnomalies.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAnomalies.map((anomaly) => (
                      <div 
                        key={anomaly.id} 
                        className={cn("p-4 rounded-lg border", getSeverityColor(anomaly.severity))}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {getSeverityIcon(anomaly.severity)}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-medium text-gray-900 dark:text-white">{anomaly.title}</h3>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimeAgo(anomaly.timestamp.toString())}
                                </span>
                                {anomaly.isNew && (
                                  <Badge variant="destructive" className="ml-2">New</Badge>
                                )}
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                              {anomaly.description}
                            </p>
                            <div className="mt-2">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  anomaly.severity === 'critical' ? 'border-red-300 dark:border-red-700' :
                                  anomaly.severity === 'warning' ? 'border-yellow-300 dark:border-yellow-700' :
                                  'border-blue-300 dark:border-blue-700'
                                )}
                              >
                                {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No anomalies found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No {severityFilter !== "all" ? severityFilter : ""} anomalies detected in your data.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
}