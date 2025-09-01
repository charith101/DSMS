import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Layout from './Layout';
import { LoadingSpinner } from '../components/shared/LoadingStates';

// Lazy load components for code splitting
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const StudentDashboard = React.lazy(() => import('../pages/student/StudentDashboard'));
const PaymentCheckout = React.lazy(() => import('../pages/student/PaymentCheckout'));
const PaymentHistory = React.lazy(() => import('../pages/student/PaymentHistory'));
const PricingPage = React.lazy(() => import('../pages/student/PricingPage'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const PaymentRecording = React.lazy(() => import('../pages/admin/PaymentRecording'));
const InvoiceManagement = React.lazy(() => import('../pages/admin/InvoiceManagement'));
const FinancialDashboard = React.lazy(() => import('../pages/financial/FinancialDashboard'));
const RefundProcessing = React.lazy(() => import('../pages/financial/RefundProcessing'));
const PricingManagement = React.lazy(() => import('../pages/financial/PricingManagement'));
const ReportGenerator = React.lazy(() => import('../pages/financial/ReportGenerator'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

/**
 * Loading fallback component for lazy-loaded routes
 */
const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner 
      size="lg" 
      variant="primary" 
      centered={true}
      label="Loading page..."
    />
  </div>
);

/**
 * Wrapper component that provides Suspense boundary for lazy routes
 */
const LazyRouteWrapper = ({ children }) => (
  <Suspense fallback={<RouteFallback />}>
    {children}
  </Suspense>
);

/**
 * Protected Route component that checks authentication and permissions
 */
const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { user } = useUser();
  
  // Show loading while checking authentication
  if (user.isLoading) {
    return (
      <div className="App-loading">
        <div className="App-loading-spinner"></div>
        <div className="App-loading-text">Loading...</div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Check permission-based access
  if (requiredPermission && !user.permissions.includes(requiredPermission) && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

/**
 * Public Route component that redirects authenticated users
 */
const PublicRoute = ({ children }) => {
  const { user } = useUser();
  
  // Show loading while checking authentication
  if (user.isLoading) {
    return (
      <div className="App-loading">
        <div className="App-loading-spinner"></div>
        <div className="App-loading-text">Loading...</div>
      </div>
    );
  }
  
  // Redirect authenticated users to their dashboard
  if (user.isAuthenticated) {
    switch (user.role) {
      case 'student':
        return <Navigate to="/student" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'financial-manager':
        return <Navigate to="/financial" replace />;
      default:
        return <Navigate to="/student" replace />;
    }
  }
  
  return children;
};

/**
 * Role-based dashboard redirect
 */
const DashboardRedirect = () => {
  const { user } = useUser();
  
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'student':
      return <Navigate to="/student" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'financial-manager':
      return <Navigate to="/financial" replace />;
    default:
      return <Navigate to="/student" replace />;
  }
};

/**
 * Unauthorized page component
 */
const UnauthorizedPage = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <svg 
          className="mx-auto h-16 w-16 text-warning-color" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 0h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V6a2 2 0 00-2-2H8a2 2 0 00-2 2v3m8 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v0" 
          />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-warning-color mb-4">
        Access Denied
      </h2>
      
      <p className="text-secondary mb-6">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      
      <button 
        onClick={() => window.history.back()}
        className="btn btn-primary"
      >
        Go Back
      </button>
    </div>
  </div>
);

/**
 * Main App Routes component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LazyRouteWrapper>
              <LoginPage />
            </LazyRouteWrapper>
          </PublicRoute>
        } 
      />
      
      {/* Root redirect */}
      <Route path="/" element={<DashboardRedirect />} />
      
      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute requiredRole="student">
            <Layout>
              <LazyRouteWrapper>
                <Routes>
                  <Route index element={<StudentDashboard />} />
                  <Route path="payments" element={<PaymentCheckout />} />
                  <Route path="history" element={<PaymentHistory />} />
                </Routes>
              </LazyRouteWrapper>
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <LazyRouteWrapper>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="record-payment" element={<PaymentRecording />} />
                  <Route path="invoices" element={<InvoiceManagement />} />
                </Routes>
              </LazyRouteWrapper>
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Financial Manager Routes */}
      <Route
        path="/financial/*"
        element={
          <ProtectedRoute requiredRole="financial-manager">
            <Layout>
              <LazyRouteWrapper>
                <Routes>
                  <Route index element={<FinancialDashboard />} />
                  <Route path="dashboard" element={<FinancialDashboard />} />
                  <Route path="refunds" element={<RefundProcessing />} />
                  <Route path="pricing" element={<PricingManagement />} />
                  <Route path="reports" element={<ReportGenerator />} />
                </Routes>
              </LazyRouteWrapper>
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={
        <LazyRouteWrapper>
          <NotFoundPage />
        </LazyRouteWrapper>
      } />
    </Routes>
  );
};

export default AppRoutes;