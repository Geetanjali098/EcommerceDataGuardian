import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { BarChartBig, Lock, AlertTriangle } from 'lucide-react';
import { getAuth, } from 'firebase/auth';
import app  from '@/lib/firebase';

// Define the login form schema using Zod
// This schema validates the login form inputs
const loginFormSchema = z.object({
  identifier: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [authError, setAuthError] = useState<string>('');
      // Initialize Firebase authentication and navigation
    const auth = getAuth(app);
   
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: '', // This will accept both username and email
      password: '',
    },
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);
 
  const onSubmit = (values: LoginFormValues) => {
    setAuthError('');

     // ✅ Console payload before sending
  console.log("Login Payload:", {
    username: values.identifier,
    password: values.password,
  });
   
    // Use the login mutation with error handling
login.mutate({
  username: values.identifier, // username OR email
  password: values.password,
}, {
  onSuccess: async (data) => {
    localStorage.setItem('token', data.token); // ✅ Save token
    // ✅ Optional: Set token for axios
    const api = (await import('@/lib/axios')).default;
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    
    setLocation('/dashboard');
  },
  // Handle successful login
  // This will redirect to the dashboard if login is successful
  onError: (error: any) => {
    const errorMessage = error.message || "Invalid credentials. Please try again.";
    setAuthError(`Authentication Error: ${errorMessage}`);
    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description: "Please check your credentials and try again.",
    });
  }
});
  };

  return (
    <>
      <Helmet>
        <title>Login | E-Commerce Data Quality</title>
        <meta name="description" content="Login to access the E-Commerce Data Quality Dashboard" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="px-4 py-3 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center space-x-2">
            <BarChartBig className="text-primary text-xl" />
            <span className="font-semibold text-lg">Data Quality Dashboard</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Authentication Error Banner */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-2 h-4 w-4" />
                  <span className="text-sm text-red-700 dark:text-red-300">{authError}</span>
                </div>
              </div>
            )}

            <Card className="w-full">
              <CardHeader className="pb-2 space-y-0">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BarChartBig className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Data Quality Dashboard</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access the dashboard
                </CardDescription>
              </CardHeader>

              <CardContent className='py-3'>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username or Email</FormLabel>
                          <FormControl>
                            <Input
                              className='py-2 text-sm bg-gray-50 dark:bg-gray-700'
                              placeholder="Enter your username or email"
                              {...field}
                              autoComplete="username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              className='py-2 text-sm bg-gray-50 dark:bg-gray-700'
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                              autoComplete="current-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full py-2.5 text-sm bg-primary hover:bg-primary/90"
                      disabled={login.isPending}
                    >
                      {login.isPending ? (
                        "Logging in..."
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" /> Sign In
                        </>
                      )}
                    </Button>                 
                   <p className="text-sm text-center text-muted-foreground mt-2">
                      Don&apos;t have an account?{" "}
                 <a href="/signup" className="text-primary hover:underline">Sign up</a>
                    </p>
                  </form>
                </Form>             
              </CardContent>

              <CardFooter className='pt-0'>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 w-full">
                  <p className="text-sm font-medium mb-1">Demo credentials:</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Username: admin | Password: admin123</p>
                    <p>Username: analyst | Password: analyst123</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}


