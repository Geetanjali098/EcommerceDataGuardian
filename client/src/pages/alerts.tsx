import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Anomaly } from '@/types';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription, CardFooter 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Clock, Mail, Smartphone, Zap, Check, X } from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';




const ALERT_TYPES = [
  { 
    id: 1, 
    name: 'Data Freshness Alert', 
    description: 'Alert when data is outdated beyond threshold',
    isEnabled: true,
    lastTriggered: '2025-05-11T15:30:00',
    channelEmail: true,
    channelSMS: false,
    channelApp: true,
    threshold: '24 hours'
  },
  { 
    id: 2, 
    name: 'Quality Drop Alert', 
    description: 'Alert when data quality score drops more than 5%',
    isEnabled: true,
    lastTriggered: '2025-05-10T09:45:00',
    channelEmail: true,
    channelSMS: true,
    channelApp: true,
    threshold: '5% drop'
  },
  { 
    id: 3, 
    name: 'Missing Data Alert', 
    description: 'Alert when critical fields are missing in new records',
    isEnabled: false,
    lastTriggered: '2025-05-08T11:20:00',
    channelEmail: true,
    channelSMS: false,
    channelApp: false,
    threshold: 'Any missing'
  },
  { 
    id: 4, 
    name: 'Pipeline Failure Alert', 
    description: 'Alert when any data pipeline fails to complete',
    isEnabled: true,
    lastTriggered: '2025-05-12T03:15:00',
    channelEmail: true,
    channelSMS: true,
    channelApp: true,
    threshold: 'Any failure'
  },
  { 
    id: 5, 
    name: 'Duplicate Data Alert', 
    description: 'Alert when duplicate records exceed threshold',
    isEnabled: true,
    lastTriggered: '2025-05-09T14:10:00',
    channelEmail: true,
    channelSMS: false,
    channelApp: true,
    threshold: '100+ records'
  }
];


export default function Alerts() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // New state for desktop sidebar
  const [alertConfigs, setAlertConfigs] = React.useState(ALERT_TYPES);
  const { toast } = useToast();
  
  // Fetch recent anomalies for the alert history
  const { data: anomalies, isLoading: isLoadingAnomalies } = useQuery<Anomaly[]>({
    queryKey: ['/api/dashboard/anomalies', { limit: 5 }],
  });
  
  const handleToggleAlert = (id: number) => {
    setAlertConfigs(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isEnabled: !alert.isEnabled } : alert
      )
    );
    
    const alert = alertConfigs.find(a => a.id === id);
    toast({
      title: `Alert ${alert?.isEnabled ? 'Disabled' : 'Enabled'}`,
      description: `${alert?.name} has been ${alert?.isEnabled ? 'disabled' : 'enabled'}.`,
    });
  };
  
  const handleToggleChannel = (id: number, channel: 'channelEmail' | 'channelSMS' | 'channelApp') => {
    setAlertConfigs(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, [channel]: !alert[channel] } : alert
      )
    );
    
    const alert = alertConfigs.find(a => a.id === id);
    const channelName = channel === 'channelEmail' ? 'Email' : channel === 'channelSMS' ? 'SMS' : 'App';
    
    toast({
      title: `${channelName} Notifications ${alert?.[channel] ? 'Disabled' : 'Enabled'}`,
      description: `${channelName} notifications for ${alert?.name} have been ${alert?.[channel] ? 'disabled' : 'enabled'}.`,
    });
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };

  interface AlertHistoryButtonProps {
  onClick: () => void;
}

  return (
    <>
      <Helmet>
        <title>Alerts | E-Commerce Data Quality</title>
        <meta name="description" content="Configure and manage alerts for data quality issues" />
      </Helmet>     

            <div className="min-h-screen">
              {/* Desktop Sidebar with toggle state */}
              <Sidebar isOpen={isDesktopSidebarOpen} onToggle={toggleDesktopSidebar} />

      <div className="flex-h-screen">        
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          <Navbar onSidebarToggle={() => setIsMobileSidebarOpen(true)}
              onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onDesktopSidebarToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                              isDesktopSidebarOpen={isDesktopSidebarOpen} />
          
          <main className="lg:ml-64 w-full px-4 sm:px-6 lg:px-8 py-6 pt-16 overflow-y-auto bg-gray-50 dark:bg-dark">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Alerts</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Configure and manage data quality alerts</p>
                </div>
                <div className="mt-4 md:mt-0">
                   <Button
                      onClick={() => toast({
                       title: "Create New Alert",
                      description: "This feature will allow you to create a new alert (coming soon).",
                             })}
                        className="w-full sm:w-auto">                              
                          <Bell className="mr-2 h-4 w-4" /> Create New Alert
                              </Button>
                                 </div>
                                       </div>
                                             </div>
            
            {/* Alert Configuration */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-primary" />
                  Alert Configuration
                </CardTitle>
                <CardDescription>
                  Manage your data quality alert settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Alert Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Triggered</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Notification Channels</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertConfigs.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{alert.name}</div>
                              <div className="text-xs text-gray-500">{alert.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch 
                              checked={alert.isEnabled} 
                              onCheckedChange={() => handleToggleAlert(alert.id)}
                              className={cn(
                                alert.isEnabled 
                                  ? "bg-primary" 
                                  : "bg-gray-200 dark:bg-gray-700"
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            {alert.lastTriggered ? (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{formatTimeAgo(alert.lastTriggered)}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{alert.threshold}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant={alert.channelEmail ? "default" : "outline"} 
                                size="icon"
                                onClick={() => handleToggleChannel(alert.id, 'channelEmail')}
                                title="Email"
                                className="h-7 w-7"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant={alert.channelSMS ? "default" : "outline"} 
                                size="icon"
                                onClick={() => handleToggleChannel(alert.id, 'channelSMS')}
                                title="SMS"
                                className="h-7 w-7"
                              >
                                <Smartphone className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant={alert.channelApp ? "default" : "outline"} 
                                size="icon"
                                onClick={() => handleToggleChannel(alert.id, 'channelApp')}
                                title="App Notification"
                                className="h-7 w-7"
                              >
                                <Zap className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Alert History */}
            <Card className="bg-white dark:bg-dark-light shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  Recent Alert History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAnomalies ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 h-16 rounded-md"></div>
                    ))}
                  </div>
                ) : anomalies && anomalies.length > 0 ? (
                  <div className="space-y-4">
                    {anomalies.map((anomaly) => (
                      <div key={anomaly.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900 dark:text-white">{anomaly.title}</h3>
                              <Badge variant="outline" className="ml-2">
                                {anomaly.severity}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{anomaly.description}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Detected {formatTimeAgo(anomaly.timestamp.toString())}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <Badge variant="secondary" className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              <Check className="h-3 w-3 text-green-500" />
                            </Badge>
                            <Badge variant="secondary" className="flex items-center">
                              <Smartphone className="h-3 w-3 mr-1" />
                              <X className="h-3 w-3 text-gray-500" />
                            </Badge>
                            <Badge variant="secondary" className="flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              <Check className="h-3 w-3 text-green-500" />
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">No recent alerts triggered</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">     
  
                <Button 
                  variant="link" 
                  className="text-sm text-primary hover:underline"
                  onClick={() => toast({
                    title: "View All Alerts",
                    description: "This feature will allow you to view all alerts (coming soon).",
                  })}
                >
                  View All Alerts
                </Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
      </div>     
    </>
  );
}

// This component is responsible for displaying the alerts page, including the alert configuration and recent alert history.