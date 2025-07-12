// src/pages/signup.tsx
import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { BarChartBig, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from '@/components/ui/card';
import {
  Form, FormField, FormItem,
  FormLabel, FormControl, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Link } from 'react-router-dom';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'analyst']),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'analyst',
    },
  });
  

 // Function to handle form submission
  // This function will be called when the form is submitted
  const onSubmit = async (values: SignupFormValues) => {
    try {
      const response = await apiRequest('POST', '/api/auth/signup', values);
      console.log("Submitted values:", values);
      
      if (response.ok) {
        toast({
          title: 'Signup successful',
          description: 'You can now log in with your credentials.',
        });
        navigate('/login');
       console.log("Navigating to login"); 
      } else {
        const data = await response.json();
        toast({
          title: 'Signup failed',
          description: data.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Error',
        description: 'Unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Signup | E-Commerce Data Quality</title>
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
            <Card className="w-full">
              <CardHeader className="pb-2 space-y-0">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                  Fill in the details to register
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3"> 
                      <FormField
                        control={form.control}
                             name="name"
                                 render={({ field }) => (
                                         <FormItem>
                                      <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                      <Input
                               className="py-2 text-sm bg-gray-50 dark:bg-gray-700"
                               placeholder="Enter your full name"
                                 {...field}
                                        />
                                    </FormControl>
                                <FormMessage />
                                         </FormItem>
                                     )}
                                     />                 
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              className="py-2 text-sm bg-gray-50 dark:bg-gray-700"
                              placeholder="Choose a username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              className="py-2 text-sm bg-gray-50 dark:bg-gray-700"
                              placeholder="you@example.com"
                              {...field}
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
                              type="password"
                              className="py-2 text-sm bg-gray-50 dark:bg-gray-700"
                              placeholder="Choose a strong password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Role</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            >
                              <option value="analyst">Analyst</option>
                              <option value="admin">Admin</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full py-2.5 text-sm bg-primary hover:bg-primary/90">
                      Create Account
                    </Button>
                  </form>
                </Form>
            
              </CardContent>
              <CardFooter className="text-center text-sm text-muted-foreground">
               Already have an account?
<Link to="/login" className="text-primary underline ml-1">Login here</Link>           
             </CardFooter>   
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}

