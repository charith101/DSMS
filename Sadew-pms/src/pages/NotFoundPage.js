import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found page component
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="max-w-md mx-auto text-center px-4">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-color opacity-20">
            404
          </div>
        </div>
        
        {/* Error Icon */}
        <div className="mb-6">
          <svg 
            className="mx-auto h-16 w-16 text-secondary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-primary mb-4">
          Page Not Found
        </h1>
        
        <p className="text-secondary mb-8 text-lg">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link 
            to="/"
            className="btn btn-primary btn-block"
          >
            Go to Dashboard
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="btn btn-outline btn-block"
          >
            Go Back
          </button>
        </div>
        
        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-tertiary mb-2">
            Need help? Contact our support team:
          </p>
          <a 
            href="mailto:support@drivingschool.com"
            className="link text-sm"
          >
            support@drivingschool.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;