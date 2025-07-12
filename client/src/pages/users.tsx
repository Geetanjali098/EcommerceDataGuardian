import React , {useEffect,useState}from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { User } from '@/types';
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription, CardFooter 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, UserCog, Mail, Shield, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/axios';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock data for users
const createUser = async () => {
  await addDoc(collection(db, 'users'), {
    name: 'Geetanjali',
    role: 'admin',
    createdAt: new Date(),
  });
};
// Mock users for display
const USER_LIST: User[] = [
  {
    id: 1,
    username: 'geetanjali',
    role: "admin",
    name: 'Geetanjali Nishad',
    email: 'nishadgeetanjali84@gmail.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: 2,
    username: 'gitu',
    role: "analyst",
    name: 'Gitu Nishad',
    email: 'gitunishad38@gmail.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=analyst'
  },
  {
    id: 3,
    username: 'jsmith',
    role: "analyst",
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jsmith'
  },
  {
    id: 4,
    username: 'mjohnson',
    role: "analyst",
    name: 'Mary Johnson',
    email: 'mary.johnson@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mjohnson'
  }
];

export default function UsersPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);
  const { toast } = useToast();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  
    
  // Use React Query to fetch users
  const { data: users = [], isLoading, isError, refetch } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get("/api/users");
      return response.data;
    },
     enabled: !!currentUser && currentUser.role === 'admin', // Only fetch if admin
     staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isCurrentUserAdmin = currentUser?.role === 'admin';
  
  const handleAddUser = () => {
    toast({
      title: 'Not Implemented',
      description: 'Adding new users is not implemented in this demo',
    });
  };
  
  const handleEditUser = (userId: number) => {
    toast({
      title: 'Not Implemented',
      description: `Editing user ${userId} is not implemented in this demo`,
    });
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };
  
   if (isError) {
    toast({
      title: 'Error',
      description: 'Failed to fetch users',
      variant: 'destructive',
    });
  }
  
  if (!isCurrentUserAdmin) {
    return (
      <>
        <Helmet>
          <title>Access Denied | E-Commerce Data Quality</title>
        </Helmet> 

                 <div className="min-h-screen">
          <Sidebar isOpen={isDesktopSidebarOpen} onToggle={toggleDesktopSidebar} />

           <div className="flex h-screen">
          <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col">
            <Navbar 
              onSidebarToggle={() => setIsMobileSidebarOpen(true)}
              onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              onDesktopSidebarToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
              isDesktopSidebarOpen={isDesktopSidebarOpen}
            />
       
            <main className="lg:ml-64 w-full h-full px-4 sm:px-8 lg:px-64 py-6 pt-16 overflow-y-auto bg-gray-50 dark:bg-dark">
              <div className="max-w-md mx-auto mt-20 text-center justify-center">             
                <Shield className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  You don't have permission to access the user management page.
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
        <title>Users & Roles | E-Commerce Data Quality</title>
        <meta name="description" content="Manage users and their access roles" />
      </Helmet>
      
     <div className="min-h-screen">
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
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Users & Roles</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage user accounts and access permissions</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button onClick={handleAddUser}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add New User
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Users List */}
            <Card className="bg-white dark:bg-dark-light shadow mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage all users and their roles in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                   {isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-[200px]">User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>                     
                        {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}
                            <Avatar>
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                       
                          <TableCell className="font-medium">
                            <div>
                              <div>{user.name}</div>
                              <div className="text-xs text-gray-500">@{user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1 text-gray-500" />
                              <span>{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditUser(user.id)}
                            >
                              <UserCog className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                    )}
                </div>      
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {users.length} users
                </div>
              </CardFooter>
            </Card>
            
            {/* Role Information */}
            <Card className="bg-white dark:bg-dark-light shadow">
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
                <CardDescription>
                  System roles and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Admin</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Administrators have full access to all features, including user management, 
                      system settings, and all data quality metrics. They can configure alerts, 
                      manage data sources, and view all reports.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">User Management</Badge>
                      <Badge variant="outline">System Settings</Badge>
                      <Badge variant="outline">Alert Configuration</Badge>
                      <Badge variant="outline">All Reports</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex items-center mb-2">
                      <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Analyst</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Analysts can view all data quality metrics and reports, but cannot access 
                      user management or system settings. They can view data sources, pipelines, and 
                      anomalies, and export reports.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">View Metrics</Badge>
                      <Badge variant="outline">View Reports</Badge>
                      <Badge variant="outline">Export Data</Badge>
                      <Badge variant="outline">View Anomalies</Badge>
                    </div>
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
