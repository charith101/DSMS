import React from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced Error Boundary Component with better error handling and logging
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) // Generate unique error ID
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous'
    };
    
    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(errorDetails);
      console.warn('Error logged for reporting:', errorDetails);
    }
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorDetails);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
    
    // Call optional retry callback
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };
  
  handleReportError = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    // In a real app, this would send to an error reporting service
    console.log('Error reported:', errorDetails);
    alert(`Error reported with ID: ${this.state.errorId}`);
  };
  
  getErrorTitle() {
    if (this.props.title) return this.props.title;
    
    const error = this.state.error;
    if (error?.name === 'ChunkLoadError') {
      return 'Application Update Available';
    }
    return 'Oops! Something went wrong';
  }
  
  getErrorMessage() {
    if (this.props.message) return this.props.message;
    
    const error = this.state.error;
    if (error?.name === 'ChunkLoadError') {
      return 'A new version of the application is available. Please refresh the page to continue.';
    }
    return "We're sorry for the inconvenience. An unexpected error occurred while loading this page.";
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }
      
      // Default error UI
      return (
        <div className="error-boundary">
          <div className="container mx-auto px-4 py-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg 
                  className="mx-auto h-16 w-16 text-error-color" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-error-color mb-4">
                {this.getErrorTitle()}
              </h2>
              
              <p className="text-secondary mb-6">
                {this.getErrorMessage()}
              </p>
              
              {this.state.errorId && (
                <p className="text-sm text-gray-500 mb-4">
                  Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
                </p>
              )}
              
              <div className="space-y-3">
                <button 
                  onClick={this.handleRetry}
                  className="btn btn-primary btn-block"
                >
                  Try Again
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn btn-outline flex-1"
                  >
                    Reload Page
                  </button>
                  
                  {this.state.errorId && (
                    <button 
                      onClick={this.handleReportError}
                      className="btn btn-outline flex-1"
                    >
                      Report Error
                    </button>
                  )}
                </div>
                
                {this.props.showHomeButton !== false && (
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="btn btn-outline btn-block"
                  >
                    Go to Homepage
                  </button>
                )}
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                  <summary className="cursor-pointer font-medium text-sm">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 text-xs">
                    <p className="font-semibold">Error:</p>
                    <pre className="whitespace-pre-wrap text-error-color mb-2">
                      {this.state.error.toString()}
                    </pre>
                    
                    {this.state.error.stack && (
                      <>
                        <p className="font-semibold">Stack Trace:</p>
                        <pre className="whitespace-pre-wrap text-gray-600 mb-2 text-xs">
                          {this.state.error.stack}
                        </pre>
                      </>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <>
                        <p className="font-semibold">Component Stack:</p>
                        <pre className="whitespace-pre-wrap text-gray-600 text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Render children normally when there's no error
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  onRetry: PropTypes.func,
  userId: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  showHomeButton: PropTypes.bool
};

ErrorBoundary.defaultProps = {
  showHomeButton: true
};

export default ErrorBoundary;