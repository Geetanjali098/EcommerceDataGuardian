import React from 'react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Form, FormControl, FormDescription, 
  FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Settings, DatabaseIcon, BellRing, Lock, Cloud, GlobeIcon, Wrench } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';

// Define form schemas
const generalSettingsSchema = z.object({
  systemName: z.string().min(2, {
    message: "System name must be at least 2 characters.",
  }),
  timezone: z.string({
    required_error: "Please select a timezone.",
  }),
  dateFormat: z.string({
    required_error: "Please select a date format.",
  }),
  analyticsTimeRange: z.string({
    required_error: "Please select a default time range.",
  }),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  appNotifications: z.boolean().default(true),
  notificationFrequency: z.string(),
  severityThreshold: z.array(z.number()).default([50]),
});

export default function SettingsPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const isCurrentUserAdmin = currentUser?.role === 'admin';
  
  // General Settings Form
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      systemName: "E-Commerce Data Quality Dashboard",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      analyticsTimeRange: "month",
    },
  });
  
  // Notification Settings Form
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      appNotifications: true,
      notificationFrequency: "immediate",
      severityThreshold: [50],
    },
  });
  
  const onSubmitGeneral = (values: z.infer<typeof generalSettingsSchema>) => {
    toast({
      title: "General Settings Updated",
      description: "Your general settings have been saved successfully.",
    });
    console.log(values);
  };
  
  const onSubmitNotifications = (values: z.infer<typeof notificationSettingsSchema>) => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved successfully.",
    });
    console.log(values);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  }; 
  
  if (!isCurrentUserAdmin) {
    return (
      <>
        <Helmet>
          <title>Access Denied | E-Commerce Data Quality</title>
        </Helmet>
        
        <div className="flex h-screen">
          <Sidebar  isOpen={isDesktopSidebarOpen} onToggle={toggleDesktopSidebar}/>

          <div className="flex h-screen">
          <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col">
            <Navbar onSidebarToggle={() => setIsMobileSidebarOpen(true)} 
                onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              onDesktopSidebarToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
              isDesktopSidebarOpen={isDesktopSidebarOpen}/>
            
            <main className="lg:ml-64 w-full h-full px-4 sm:px-6 lg:px-64 py-8 pt-20 overflow-y-auto bg-gray-50 dark:bg-dark">
              <div className="max-w-md mx-auto mt-20 text-center flex-item-center justify-center ">
                <Lock className="mx-auto h-16 w-16 justify-center text-gray-400 dark:text-gray-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  You don't have permission to access the system settings page.
                  This feature is restricted to administrators only.
                </p>
                <Button className="mt-4" variant="default" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </main>
          </div>
        </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>System Settings | E-Commerce Data Quality</title>
        <meta name="description" content="Configure system settings for your data quality dashboard" />
      </Helmet>
        
        <div className="min-h-screen">
        <Sidebar isOpen={isDesktopSidebarOpen} onToggle={toggleDesktopSidebar} />

      <div className="flex-h-screen">
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          <Navbar onSidebarToggle={() => setIsMobileSidebarOpen(true)} 
             onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              onDesktopSidebarToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
              isDesktopSidebarOpen={isDesktopSidebarOpen}/>
          
          <main className="lg:ml-64 w-full h-full px-4 sm:px-8 lg:px-64 py-6 pt-16 overflow-y-auto bg-gray-50 dark:bg-dark">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">System Settings</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Configure global system settings and preferences</p>
                </div>
              </div>
            </div>
            
            {/* Settings Tabs */}
            <Card className="bg-white dark:bg-dark-light shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Manage global settings for the data quality dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general">
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="general">
                      <Wrench className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                      <BellRing className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="data">
                      <DatabaseIcon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Data Settings</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* General Settings Tab */}
                  <TabsContent value="general">
                    <Form {...generalForm}>
                      <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
                        <FormField
                          control={generalForm.control}
                          name="systemName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>System Name</FormLabel>
                              <FormControl>
                                <Input placeholder="E-Commerce Data Quality Dashboard" {...field} />
                              </FormControl>
                              <FormDescription>
                                This name will be displayed in the browser title and header.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Timezone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UTC">UTC</SelectItem>
                                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                All dates and times will be displayed in this timezone.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="dateFormat"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Date Format</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="MM/DD/YYYY" id="format-us" />
                                    <Label htmlFor="format-us">MM/DD/YYYY (US)</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="DD/MM/YYYY" id="format-eu" />
                                    <Label htmlFor="format-eu">DD/MM/YYYY (EU)</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="YYYY-MM-DD" id="format-iso" />
                                    <Label htmlFor="format-iso">YYYY-MM-DD (ISO)</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="analyticsTimeRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Analytics Time Range</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select default time range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="day">Last 24 Hours</SelectItem>
                                  <SelectItem value="week">Last 7 Days</SelectItem>
                                  <SelectItem value="month">Last 30 Days</SelectItem>
                                  <SelectItem value="quarter">Last 90 Days</SelectItem>
                                  <SelectItem value="year">Last 12 Months</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                This will be the default time range for all analytics views.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit">Save General Settings</Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  {/* Notifications Tab */}
                  <TabsContent value="notifications">
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Notification Channels</h3>
                          
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Email Notifications
                                  </FormLabel>
                                  <FormDescription>
                                    Receive alerts and reports via email
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="smsNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    SMS Notifications
                                  </FormLabel>
                                  <FormDescription>
                                    Receive critical alerts via SMS
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="appNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    In-App Notifications
                                  </FormLabel>
                                  <FormDescription>
                                    Show notifications in the dashboard interface
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={notificationForm.control}
                          name="notificationFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notification Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select notification frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="immediate">Immediate</SelectItem>
                                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                                  <SelectItem value="daily">Daily Digest</SelectItem>
                                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                How often you want to receive notification digests
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="severityThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Severity Threshold (0-100)</FormLabel>
                              <FormControl>
                                <Slider
                                  defaultValue={field.value}
                                  max={100}
                                  step={5}
                                  onValueChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription>
                                Only receive notifications for issues above this severity level.
                                Current: {field.value}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit">Save Notification Settings</Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  {/* Data Settings Tab */}
                  <TabsContent value="data">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Data Retention</h3>
                        
                        <div className="flex flex-col space-y-2">
                          <Label>Historical Data Retention Period</Label>
                          <Select defaultValue="365">
                            <SelectTrigger>
                              <SelectValue placeholder="Select retention period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 Days</SelectItem>
                              <SelectItem value="90">90 Days</SelectItem>
                              <SelectItem value="180">180 Days</SelectItem>
                              <SelectItem value="365">1 Year</SelectItem>
                              <SelectItem value="730">2 Years</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            How long to keep historical data quality metrics and anomalies
                          </p>
                        </div>
                        
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label className="text-base">
                              Automatic Data Archiving
                            </Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Automatically archive older data to save storage space
                            </p>
                          </div>
                          <Switch defaultChecked={true} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Data Export</h3>
                        
                        <div className="flex flex-col space-y-2">
                          <Label>Default Export Format</Label>
                          <Select defaultValue="csv">
                            <SelectTrigger>
                              <SelectValue placeholder="Select export format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Default file format for data exports
                          </p>
                        </div>
                        
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label className="text-base">
                              Include Metadata in Exports
                            </Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Include additional metadata and field descriptions in exported files
                            </p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Data Settings</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last update: May 13, 2025 at 10:30 AM
                </p>
              </CardFooter>
            </Card>
        </main>
        </div>
      </div>
        </div>  
    </>
  );
}