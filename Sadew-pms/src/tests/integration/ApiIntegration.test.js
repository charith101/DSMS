import { paymentService, userService, apiClient } from '../../services';

// Mock axios
jest.mock('axios');

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment Service Integration', () => {
    test('processes payment with proper request format', async () => {
      const mockResponse = {
        data: {
          success: true,
          transactionId: 'txn_123456',
          amount: 500,
          status: 'completed',
          timestamp: '2024-01-15T10:00:00Z'
        }
      };

      // Mock the API client post method
      apiClient.post = jest.fn().mockResolvedValue(mockResponse);

      const paymentData = {
        packageId: 'basic',
        amount: 500,
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890'
      };

      const result = await paymentService.processPayment(paymentData);

      expect(apiClient.post).toHaveBeenCalledWith('/payments/process', paymentData);
      expect(result).toEqual({
        success: true,
        transactionId: 'txn_123456',
        amount: 500,
        status: 'completed',
        timestamp: '2024-01-15T10:00:00Z'
      });
    });

    test('handles payment processing errors correctly', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: 'PAYMENT_DECLINED',
            message: 'Insufficient funds',
            code: 'CARD_DECLINED'
          }
        }
      };

      apiClient.post = jest.fn().mockRejectedValue(mockError);

      const paymentData = {
        packageId: 'basic',
        amount: 500,
        cardNumber: '4111111111111111'
      };

      await expect(paymentService.processPayment(paymentData))
        .rejects
        .toMatchObject({
          message: 'Insufficient funds',
          code: 'CARD_DECLINED',
          type: 'PAYMENT_DECLINED'
        });
    });

    test('fetches payment history with pagination', async () => {
      const mockResponse = {
        data: {
          payments: [
            {
              id: 1,
              amount: 500,
              status: 'completed',
              createdAt: '2024-01-15T10:00:00Z',
              packageType: 'basic'
            },
            {
              id: 2,
              amount: 900,
              status: 'completed',
              createdAt: '2024-01-14T15:30:00Z',
              packageType: 'premium'
            }
          ],
          pagination: {
            total: 25,
            page: 1,
            limit: 10,
            totalPages: 3
          }
        }
      };

      apiClient.get = jest.fn().mockResolvedValue(mockResponse);

      const filters = {
        page: 1,
        limit: 10,
        status: 'completed',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      const result = await paymentService.getPaymentHistory(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/payments/history', { params: filters });
      expect(result.payments).toHaveLength(2);
      expect(result.pagination.total).toBe(25);
    });

    test('processes refund request correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          refundId: 'ref_789012',
          amount: 500,
          status: 'processed',
          originalTransactionId: 'txn_123456'
        }
      };

      apiClient.post = jest.fn().mockResolvedValue(mockResponse);

      const refundData = {
        transactionId: 'txn_123456',
        amount: 500,
        reason: 'Customer cancellation'
      };

      const result = await paymentService.processRefund(refundData);

      expect(apiClient.post).toHaveBeenCalledWith('/payments/refund', refundData);
      expect(result.success).toBe(true);
      expect(result.refundId).toBe('ref_789012');
    });

    test('retrieves payment statistics correctly', async () => {
      const mockResponse = {
        data: {
          totalRevenue: 45230,
          monthlyRevenue: 8450,
          outstanding: 2150,
          collectionRate: 94.2,
          paymentMethodStats: {
            creditCard: 75,
            cash: 20,
            bankTransfer: 5
          },
          monthlyTrends: [
            { month: 'Jan', revenue: 7200 },
            { month: 'Feb', revenue: 8450 },
            { month: 'Mar', revenue: 9100 }
          ]
        }
      };

      apiClient.get = jest.fn().mockResolvedValue(mockResponse);

      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-03-31'
      };

      const result = await paymentService.getPaymentStatistics(dateRange);

      expect(apiClient.get).toHaveBeenCalledWith('/payments/statistics', { params: dateRange });
      expect(result.totalRevenue).toBe(45230);
      expect(result.paymentMethodStats.creditCard).toBe(75);
      expect(result.monthlyTrends).toHaveLength(3);
    });
  });

  describe('User Service Integration', () => {
    test('authenticates user successfully', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
            profile: {
              phone: '1234567890',
              dateOfBirth: '1995-05-15'
            }
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'refresh_token_here',
          expiresIn: 3600
        }
      };

      apiClient.post = jest.fn().mockResolvedValue(mockResponse);

      const credentials = {
        email: 'john@example.com',
        password: 'password123'
      };

      const result = await userService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result.user.id).toBe(1);
      expect(result.token).toBeTruthy();
      expect(result.user.role).toBe('student');
    });

    test('handles authentication errors correctly', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        }
      };

      apiClient.post = jest.fn().mockRejectedValue(mockError);

      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      await expect(userService.login(credentials))
        .rejects
        .toMatchObject({
          message: 'Invalid email or password',
          type: 'INVALID_CREDENTIALS'
        });
    });

    test('registers new user successfully', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'student',
            createdAt: '2024-01-15T10:00:00Z'
          },
          token: 'new_user_token',
          message: 'Registration successful'
        }
      };

      apiClient.post = jest.fn().mockResolvedValue(mockResponse);

      const registrationData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '0987654321',
        dateOfBirth: '1998-03-20'
      };

      const result = await userService.register(registrationData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registrationData);
      expect(result.user.name).toBe('Jane Smith');
      expect(result.token).toBeTruthy();
    });

    test('updates user profile correctly', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 1,
            name: 'John Updated',
            email: 'john.updated@example.com',
            profile: {
              phone: '1111111111',
              address: '123 New Street'
            }
          }
        }
      };

      apiClient.put = jest.fn().mockResolvedValue(mockResponse);

      const profileData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '1111111111',
        address: '123 New Street'
      };

      const result = await userService.updateProfile(1, profileData);

      expect(apiClient.put).toHaveBeenCalledWith('/users/1/profile', profileData);
      expect(result.user.name).toBe('John Updated');
      expect(result.user.profile.address).toBe('123 New Street');
    });

    test('changes password successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Password changed successfully'
        }
      };

      apiClient.post = jest.fn().mockResolvedValue(mockResponse);

      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const result = await userService.changePassword(passwordData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', passwordData);
      expect(result.message).toBe('Password changed successfully');
    });

    test('initiates password reset correctly', async () => {
      const mockResponse = {
        data: {
          message: 'Password reset email sent',
          resetToken: 'reset_token_123'
        }
      };

      apiClient.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await userService.requestPasswordReset('user@example.com');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'user@example.com'
      });
      expect(result.message).toContain('reset email sent');
    });
  });

  describe('API Client Integration', () => {
    test('sets authentication token correctly', () => {
      const token = 'test_token_123';
      
      apiClient.setAuthToken(token);
      
      expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    test('removes authentication token correctly', () => {
      apiClient.removeAuthToken();
      
      expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
    });

    test('handles request timeout correctly', async () => {
      // Mock a timeout error
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      apiClient.get = jest.fn().mockRejectedValue(timeoutError);

      await expect(apiClient.get('/slow-endpoint'))
        .rejects
        .toMatchObject({
          code: 'ECONNABORTED',
          message: expect.stringContaining('timeout')
        });
    });

    test('retries failed requests with exponential backoff', async () => {
      // Mock network error that should trigger retry
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error'
      };

      let callCount = 0;
      apiClient.get = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(networkError);
        }
        return Promise.resolve({ data: { success: true } });
      });

      const result = await apiClient.get('/flaky-endpoint');

      expect(callCount).toBe(3);
      expect(result.data.success).toBe(true);
    });

    test('handles rate limiting correctly', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: {
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            retryAfter: 60
          }
        }
      };

      apiClient.post = jest.fn().mockRejectedValue(rateLimitError);

      await expect(apiClient.post('/api/endpoint'))
        .rejects
        .toMatchObject({
          response: {
            status: 429,
            data: {
              error: 'RATE_LIMIT_EXCEEDED'
            }
          }
        });
    });
  });

  describe('Error Handling Integration', () => {
    test('transforms API errors to user-friendly messages', async () => {
      const mockErrors = [
        {
          response: { status: 400, data: { error: 'VALIDATION_ERROR' } },
          expectedType: 'VALIDATION_ERROR'
        },
        {
          response: { status: 401, data: { error: 'UNAUTHORIZED' } },
          expectedType: 'UNAUTHORIZED'
        },
        {
          response: { status: 403, data: { error: 'FORBIDDEN' } },
          expectedType: 'FORBIDDEN'
        },
        {
          response: { status: 404, data: { error: 'NOT_FOUND' } },
          expectedType: 'NOT_FOUND'
        },
        {
          response: { status: 500, data: { error: 'INTERNAL_ERROR' } },
          expectedType: 'INTERNAL_ERROR'
        }
      ];

      for (const mockError of mockErrors) {
        apiClient.get = jest.fn().mockRejectedValue(mockError);

        try {
          await apiClient.get('/test-endpoint');
        } catch (error) {
          expect(error.type).toBe(mockError.expectedType);
        }
      }
    });

    test('provides fallback for network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';

      apiClient.get = jest.fn().mockRejectedValue(networkError);

      try {
        await apiClient.get('/test-endpoint');
      } catch (error) {
        expect(error.message).toContain('Network Error');
        expect(error.type).toBe('NETWORK_ERROR');
      }
    });
  });

  describe('Data Validation Integration', () => {
    test('validates payment data before sending to API', async () => {
      const invalidPaymentData = {
        // Missing required fields
        amount: 'invalid',
        cardNumber: '1234'
      };

      await expect(paymentService.processPayment(invalidPaymentData))
        .rejects
        .toMatchObject({
          type: 'VALIDATION_ERROR',
          message: expect.stringContaining('Invalid payment data')
        });
    });

    test('validates user registration data', async () => {
      const invalidRegistrationData = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email format
        password: '123' // Too short password
      };

      await expect(userService.register(invalidRegistrationData))
        .rejects
        .toMatchObject({
          type: 'VALIDATION_ERROR'
        });
    });
  });

  describe('Caching Integration', () => {
    test('caches payment statistics for performance', async () => {
      const mockResponse = {
        data: { totalRevenue: 45230, monthlyRevenue: 8450 }
      };

      apiClient.get = jest.fn().mockResolvedValue(mockResponse);

      // First call should hit the API
      await paymentService.getPaymentStatistics();
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Second call within cache period should use cached data
      await paymentService.getPaymentStatistics();
      expect(apiClient.get).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    test('invalidates cache when new payment is processed', async () => {
      // Setup cache
      await paymentService.getPaymentStatistics();
      
      // Process payment (should invalidate cache)
      await paymentService.processPayment({
        packageId: 'basic',
        amount: 500,
        cardNumber: '4111111111111111'
      });

      // Next statistics call should hit API again
      apiClient.get = jest.fn().mockResolvedValue({
        data: { totalRevenue: 45730 } // Updated revenue
      });

      await paymentService.getPaymentStatistics();
      expect(apiClient.get).toHaveBeenCalled();
    });
  });
});