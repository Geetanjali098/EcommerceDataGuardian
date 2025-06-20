import React ,{useState}from 'react';
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
import { BarChartBig, Lock } from 'lucide-react';

// ✅ Firebase imports
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import axios from 'axios';
import app from '@/lib/firebase'; // Import your initialized Firebase app

const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>('analyst');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // 🔐 Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const onSubmit = (values: LoginFormValues) => {
    login.mutate({
      username: values.username,
      password: values.password,
    }, {
      onSuccess: (data) => {
        setLocation('/dashboard');
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid credentials. Please try again.",
        });
      }
    });
  };

  // ✅ Google Sign-In handler
  // Import your initialized Firebase app
  
  const handleGoogleSignIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
          
       // ✅ Send token + selected role to backend
    const res = await axios.post("/api/auth/google", {
      token,
      role: selectedRole, // 👈 important
    });
    
      // Set JWT in localStorage and Axios
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "Try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | E-Commerce Data Quality</title>
        <meta name="description" content="Login to access the E-Commerce Data Quality Dashboard" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark">
        <header className="px-4 py-3 flex justify-end">
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-sm">
            <CardHeader className=" pb-2 space-y-0">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-primary/10 p-2 rounded-full">
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
                 {/*Username*/}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                           className='py-2 text-sm'                 
                            placeholder="Enter your username"
                            {...field}
                            autoComplete="username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/*Password*/}
                     {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                        className='py-2 text-sm'
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

          {/*Sign In Button*/}
                  <Button

                    type="submit"
                    className="w-full py-2 text-sm"
                    disabled={login.isPending}
                  >
                    {login.isPending ?
                      "Logging in..." :
                      <>
                        <Lock className="mr-2 h-4 w-4" /> Sign In
                      </>
                    }
                  </Button>
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  OR Don't have an account?
                  </p>
                </form>
              </Form>

                     {/* ✅ Role Selection Dropdown */}
            <div className="mt-2">
              <label
                htmlFor="role-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select your role
              </label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white text-sm"
              >
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>

              {/* 🔐 Google Sign-In Button */}
              <Button
                onClick={handleGoogleSignIn}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-transparent text-blue-600 dark:text-blue-400 hover:underline hover:bg-transparent"
                variant="link"             
              >
                <img src="https://img.icons8.com/color-glass/48/google-logo.png" alt="Google" className="h-5 w-5" />
              Sign up with Google based on your work role 
              </Button>
            </CardContent>

            <CardFooter className='pt-0'>
              <div className="text-sm text-center w-full text-gray-500 dark:text-gray-400">
                <p>Demo credentials:</p>
                <p>Username: admin | Password: admin123</p>
                <p>Username: analyst | Password: analyst123</p>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </>
  );
}

