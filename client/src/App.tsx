import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Helmet } from "react-helmet";
import { useAuth } from "./hooks/use-auth";
import React, { Suspense } from "react";


// Direct imports for non-lazy pages

import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Signup from './pages/signup';



// Protected route component
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

    // Check if user has valid token but no user data (token might be expired)
  const hasToken = !!localStorage.getItem('token');
  if (hasToken && !user && !isLoading) {
    // Token exists but user data is null, likely expired token
    localStorage.removeItem('token');
    return <Redirect to="/login" />;
  }
  
  
  // Render the component if authenticated, otherwise redirect to login
  return isAuthenticated ? <Component {...rest} /> : <Redirect to="/login" />;
}

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-primary">Loading...</div>
  </div>
);

const DynamicImport = ({ importFn }: { importFn: () => Promise<any> }) => {
  const [Component, setComponent] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    importFn().then((module) => {
      setComponent(() => module.default);
    });
  }, [importFn]);

  return Component ? <Component /> : <Loading />;
};

function Router() {
  return (
      <Switch>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        
        {/* Dashboard Section */}
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        
        <Route path="/data-sources">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/data-sources")} />
            </Suspense>
          )} />
        </Route>
        
        <Route path="/data-pipelines">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/data-pipelines")} />
            </Suspense>
          )} />
        </Route>
        
        {/* Analytics Section */}
        <Route path="/reports">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/reports")} />
            </Suspense>
          )} />
        </Route>
        
        <Route path="/anomalies">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/anomalies")} />
            </Suspense>
          )} />
        </Route>
        
        <Route path="/alerts">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/alerts")} />
            </Suspense>
          )} />
        </Route>
        
        {/* Quality Reports Section */}
        <Route path="/quality/overall">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/quality/overall")} />
            </Suspense>
          )} />
        </Route>
        
        <Route path="/quality/freshness">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/quality/freshness")} />
            </Suspense>
          )} />
        </Route>
        
        <Route path="/quality/completeness">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/quality/completeness")} />
            </Suspense>
          )} />
        </Route>
        
        <Route path="/quality/accuracy">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/quality/accuracy")} />
            </Suspense>
          )} />
        </Route>
        
        {/* Settings Section */}
        <Route path="/users">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/users")} />
            </Suspense>
          )} />
        </Route>
        
        <Route path="/settings">
          <ProtectedRoute component={() => (
            <Suspense fallback={<Loading />}>
              <DynamicImport importFn={() => import("@/pages/settings")} />
            </Suspense>
          )} />
        </Route>
              
        <Route path="/signup">
          <Signup />
        </Route>

        {/* Fallback to 404 */}
        <Route path="404">
          <NotFound />
        </Route>
      </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Helmet
          titleTemplate="%s | E-Commerce Data Quality"
          defaultTitle="E-Commerce Data Quality Dashboard"
        >
          <meta name="description" content="Visualize and track data quality metrics for an e-commerce platform" />
        </Helmet>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
