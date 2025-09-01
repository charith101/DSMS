import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { PaymentProvider } from './contexts/PaymentContext';
import AppRoutes from './components/AppRoutes';
import ErrorBoundary from './components/shared/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';
import { initializePerformanceOptimizations } from './utils/performance';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize performance optimizations
    initializePerformanceOptimizations();
  }, []);

  return (
    <ErrorBoundary>
      <UserProvider>
        <PaymentProvider>
          <Router>
            <div className="App layout-page">
              <AppRoutes />
              <PerformanceMonitor />
            </div>
          </Router>
        </PaymentProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;