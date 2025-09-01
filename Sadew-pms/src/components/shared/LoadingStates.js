import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading Spinner Component
 * Reusable loading indicator with different sizes and variants
 */
const LoadingSpinner = ({ 
  size = 'base', 
  variant = 'primary', 
  centered = false,
  label = 'Loading...',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'base':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (variant) {
      case 'primary':
        return 'border-primary-color';
      case 'secondary':
        return 'border-secondary-color';
      case 'white':
        return 'border-white';
      case 'gray':
        return 'border-gray-400';
      default:
        return 'border-primary-color';
    }
  };

  const spinnerClasses = [
    'animate-spin',
    'rounded-full',
    'border-2',
    'border-t-transparent',
    getSizeClasses(),
    getColorClasses(),
    className
  ].join(' ');

  const containerClasses = centered 
    ? 'flex items-center justify-center min-h-[200px]' 
    : 'inline-flex items-center space-x-2';

  return (
    <div className={containerClasses} role="status" aria-label={label}>
      <div className={spinnerClasses}></div>
      {centered && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
};

/**
 * Loading Overlay Component
 * Full-screen or container overlay with loading spinner
 */
const LoadingOverlay = ({ 
  isVisible = false, 
  message = 'Loading...', 
  fullScreen = false,
  children 
}) => {
  if (!isVisible) return children || null;

  const overlayClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center'
    : 'absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center';

  return (
    <>
      {children && <div className="relative">{children}</div>}
      <div className={overlayClasses}>
        <div className="text-center">
          <LoadingSpinner size="lg" centered />
          <p className="mt-4 text-lg text-gray-600">{message}</p>
        </div>
      </div>
    </>
  );
};

/**
 * Loading Button Component
 * Button with integrated loading state
 */
const LoadingButton = ({ 
  loading = false, 
  children, 
  disabled,
  loadingText = 'Loading...',
  className = '',
  ...props 
}) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`btn relative ${className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" variant="white" />
          <span className="ml-2">{loadingText}</span>
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
};

/**
 * Skeleton Loading Component
 * Placeholder loading animation for content
 */
const SkeletonLoader = ({ 
  lines = 3, 
  height = '1rem', 
  className = '',
  avatar = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index}
            className="bg-gray-200 rounded"
            style={{ 
              height,
              width: index === lines - 1 ? '75%' : '100%'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

/**
 * Data Loading State Component
 * Comprehensive loading state handler for data fetching
 */
const DataLoadingState = ({ 
  loading = false,
  error = null,
  data = null,
  children,
  loadingComponent = null,
  errorComponent = null,
  emptyComponent = null,
  retryFunction = null
}) => {
  // Loading state
  if (loading) {
    return loadingComponent || (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" centered />
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return errorComponent || (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">{error.message || 'An unexpected error occurred'}</p>
        {retryFunction && (
          <button 
            onClick={retryFunction}
            className="btn btn-primary"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return emptyComponent || (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-600">There's nothing to display at the moment.</p>
      </div>
    );
  }

  // Success state with data
  return children;
};

// PropTypes definitions
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'base', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray']),
  centered: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string
};

LoadingOverlay.propTypes = {
  isVisible: PropTypes.bool,
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  children: PropTypes.node
};

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  loadingText: PropTypes.string,
  className: PropTypes.string
};

SkeletonLoader.propTypes = {
  lines: PropTypes.number,
  height: PropTypes.string,
  className: PropTypes.string,
  avatar: PropTypes.bool
};

DataLoadingState.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.object,
  data: PropTypes.any,
  children: PropTypes.node.isRequired,
  loadingComponent: PropTypes.node,
  errorComponent: PropTypes.node,
  emptyComponent: PropTypes.node,
  retryFunction: PropTypes.func
};

export {
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  SkeletonLoader,
  DataLoadingState
};

export default LoadingSpinner;