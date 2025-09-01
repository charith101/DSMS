import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button, Input, Card } from '../components/shared';

/**
 * Login page component with form validation
 */
const LoginPage = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await login(formData);
    } catch (error) {
      setErrors({
        submit: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const demoCredentials = [
    {
      email: 'student@example.com',
      password: 'password',
      role: 'Student',
      description: 'Access student portal with payment and history features'
    },
    {
      email: 'admin@example.com',
      password: 'password',
      role: 'Administrator',
      description: 'Access admin panel for payment recording and invoices'
    },
    {
      email: 'financial@example.com',
      password: 'password',
      role: 'Financial Manager',
      description: 'Access financial dashboard, reports, and refund processing'
    }
  ];
  
  const quickLogin = (email, password) => {
    setFormData({ email, password });
  };
  
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-color rounded-xl flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-primary">
            Payment Management System
          </h2>
          <p className="mt-2 text-secondary">
            Sign in to your account to continue
          </p>
        </div>
        
        {/* Login Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <Input
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              state={errors.email ? 'error' : null}
              errorMessage={errors.email}
              required
            />
            
            {/* Password Field */}
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              state={errors.password ? 'error' : null}
              errorMessage={errors.password}
              required
            />
            
            {/* Submit Error */}
            {errors.submit && (
              <div className="alert alert-error">
                {errors.submit}
              </div>
            )}
            
            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              block
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
        
        {/* Demo Credentials */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Demo Credentials
          </h3>
          <div className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm text-primary">
                      {cred.role}
                    </div>
                    <div className="text-xs text-secondary">
                      {cred.email}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => quickLogin(cred.email, cred.password)}
                  >
                    Use
                  </Button>
                </div>
                <p className="text-xs text-tertiary">
                  {cred.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This is a demo system. Use the provided credentials above to explore different user roles and features.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;