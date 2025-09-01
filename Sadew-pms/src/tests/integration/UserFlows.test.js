import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { PaymentProvider } from '../contexts/PaymentContext';
import { UserProvider } from '../contexts/UserContext';

// Mock API calls
const mockApiCalls = {
  login: jest.fn(),
  processPayment: jest.fn(),
  fetchPayments: jest.fn(),
  fetchUserProfile: jest.fn()
};

// Mock the API services
jest.mock('../services', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  },
  paymentService: {
    processPayment: (...args) => mockApiCalls.processPayment(...args),
    getPaymentHistory: jest.fn().mockResolvedValue([]),
    getPaymentStatistics: jest.fn().mockResolvedValue({})
  },
  userService: {
    login: (...args) => mockApiCalls.login(...args),
    logout: jest.fn(),
    getCurrentUser: (...args) => mockApiCalls.fetchUserProfile(...args),
    updateProfile: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

const TestAppWrapper = ({ children, initialUser = null }) => {
  const mockUserContext = {
    user: initialUser,
    login: mockApiCalls.login,
    logout: jest.fn(),
    loading: false,
    error: null
  };

  const mockPaymentContext = {
    payments: [],
    processPayment: mockApiCalls.processPayment,
    loading: false,
    error: null
  };

  return (
    <BrowserRouter>
      <UserProvider value={mockUserContext}>
        <PaymentProvider value={mockPaymentContext}>
          {children}
        </PaymentProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

describe('Integration Tests - User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Student Payment Flow', () => {
    test('complete payment flow from login to confirmation', async () => {
      const user = userEvent.setup();
      
      // Mock successful login
      mockApiCalls.login.mockResolvedValue({
        user: { id: 1, name: 'John Doe', role: 'student', email: 'john@example.com' },
        token: 'mock-token'
      });

      // Mock successful payment processing
      mockApiCalls.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_123456',
        amount: 500,
        status: 'completed'
      });

      render(
        <TestAppWrapper>
          <App />
        </TestAppWrapper>
      );

      // Step 1: Login
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockApiCalls.login).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123'
        });
      });

      // Step 2: Navigate to payment page
      const makePaymentLink = screen.getByText(/make payment/i);
      await user.click(makePaymentLink);

      await waitFor(() => {
        expect(screen.getByText(/select package/i)).toBeInTheDocument();
      });

      // Step 3: Select package
      const packageSelect = screen.getByLabelText(/choose a package/i);
      await user.selectOptions(packageSelect, 'basic');

      const nextButton = screen.getByText(/next step/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/payment details/i)).toBeInTheDocument();
      });

      // Step 4: Fill payment details
      const cardNumberInput = screen.getByLabelText(/card number/i);
      const expiryInput = screen.getByLabelText(/expiry date/i);
      const cvvInput = screen.getByLabelText(/cvv/i);
      const cardholderInput = screen.getByLabelText(/cardholder name/i);

      await user.type(cardNumberInput, '4111 1111 1111 1111');
      await user.type(expiryInput, '12/25');
      await user.type(cvvInput, '123');
      await user.type(cardholderInput, 'John Doe');

      // Step 5: Submit payment
      const submitButton = screen.getByText(/complete payment/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApiCalls.processPayment).toHaveBeenCalledWith(expect.objectContaining({
          packageId: 'basic',
          amount: 500,
          cardNumber: '4111 1111 1111 1111',
          expiryDate: '12/25',
          cvv: '123',
          cardholderName: 'John Doe'
        }));
      });

      // Step 6: Verify confirmation page
      await waitFor(() => {
        expect(screen.getByText(/payment confirmation/i)).toBeInTheDocument();
        expect(screen.getByText(/txn_123456/i)).toBeInTheDocument();
      });
    });

    test('handles payment failure gracefully', async () => {
      const user = userEvent.setup();

      // Mock payment failure
      mockApiCalls.processPayment.mockRejectedValue(new Error('Payment failed'));

      render(
        <TestAppWrapper initialUser={{ id: 1, name: 'John Doe', role: 'student' }}>
          <App />
        </TestAppWrapper>
      );

      // Navigate to payment page
      const makePaymentLink = screen.getByText(/make payment/i);
      await user.click(makePaymentLink);

      // Complete package selection
      const packageSelect = screen.getByLabelText(/choose a package/i);
      await user.selectOptions(packageSelect, 'basic');
      
      const nextButton = screen.getByText(/next step/i);
      await user.click(nextButton);

      // Fill payment details
      const cardNumberInput = screen.getByLabelText(/card number/i);
      await user.type(cardNumberInput, '4111 1111 1111 1111');
      // ... fill other required fields

      // Submit payment
      const submitButton = screen.getByText(/complete payment/i);
      await user.click(submitButton);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
      });

      // User should be able to retry
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });
  });

  describe('Admin Payment Recording Flow', () => {
    test('admin can record cash payment successfully', async () => {
      const user = userEvent.setup();

      // Mock admin user
      const adminUser = { id: 2, name: 'Admin User', role: 'admin' };

      render(
        <TestAppWrapper initialUser={adminUser}>
          <App />
        </TestAppWrapper>
      );

      // Navigate to admin dashboard
      const adminDashboardLink = screen.getByText(/admin dashboard/i);
      await user.click(adminDashboardLink);

      // Go to record payment
      const recordPaymentButton = screen.getByText(/record payment/i);
      await user.click(recordPaymentButton);

      // Fill payment recording form
      const studentSelect = screen.getByLabelText(/student/i);
      const packageSelect = screen.getByLabelText(/package/i);
      const paymentMethodSelect = screen.getByLabelText(/payment method/i);
      const amountInput = screen.getByLabelText(/amount/i);

      await user.selectOptions(studentSelect, 'student-1');
      await user.selectOptions(packageSelect, 'basic');
      await user.selectOptions(paymentMethodSelect, 'cash');
      await user.type(amountInput, '500');

      // Submit recording
      const recordButton = screen.getByText(/record payment/i);
      await user.click(recordButton);

      await waitFor(() => {
        expect(screen.getByText(/payment recorded successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Financial Manager Dashboard Flow', () => {
    test('financial manager can view dashboard and generate reports', async () => {
      const user = userEvent.setup();

      // Mock financial manager user
      const financialUser = { id: 3, name: 'Financial Manager', role: 'financial' };

      render(
        <TestAppWrapper initialUser={financialUser}>
          <App />
        </TestAppWrapper>
      );

      // Navigate to financial dashboard
      const dashboardLink = screen.getByText(/financial dashboard/i);
      await user.click(dashboardLink);

      // Verify dashboard elements
      await waitFor(() => {
        expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
        expect(screen.getByText(/this month/i)).toBeInTheDocument();
        expect(screen.getByText(/outstanding/i)).toBeInTheDocument();
        expect(screen.getByText(/collection rate/i)).toBeInTheDocument();
      });

      // Test report generation
      const generateReportButton = screen.getByText(/create report/i);
      await user.click(generateReportButton);

      // This would open a modal or navigate to report page
      await waitFor(() => {
        expect(screen.getByText(/report generation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Integration', () => {
    test('real-time validation works across payment flow', async () => {
      const user = userEvent.setup();

      render(
        <TestAppWrapper initialUser={{ id: 1, role: 'student' }}>
          <App />
        </TestAppWrapper>
      );

      // Navigate to payment page
      const makePaymentLink = screen.getByText(/make payment/i);
      await user.click(makePaymentLink);

      // Skip package selection for this test
      const packageSelect = screen.getByLabelText(/choose a package/i);
      await user.selectOptions(packageSelect, 'basic');
      
      const nextButton = screen.getByText(/next step/i);
      await user.click(nextButton);

      // Test invalid card number
      const cardNumberInput = screen.getByLabelText(/card number/i);
      await user.type(cardNumberInput, '1234');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/invalid card number/i)).toBeInTheDocument();
      });

      // Test valid card number removes error
      await user.clear(cardNumberInput);
      await user.type(cardNumberInput, '4111 1111 1111 1111');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid card number/i)).not.toBeInTheDocument();
      });

      // Test required field validation
      const cvvInput = screen.getByLabelText(/cvv/i);
      await user.focus(cvvInput);
      await user.tab(); // Leave empty and blur

      await waitFor(() => {
        expect(screen.getByText(/cvv is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary Integration', () => {
    test('error boundary catches and displays errors', async () => {
      // Mock a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestAppWrapper>
          <ErrorComponent />
        </TestAppWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Check for retry button
      expect(screen.getByText(/try again/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Navigation and Routing Integration', () => {
    test('protected routes redirect unauthorized users', async () => {
      render(
        <TestAppWrapper initialUser={null}>
          <App />
        </TestAppWrapper>
      );

      // Try to access protected admin route directly
      window.history.pushState({}, 'Admin Page', '/admin');

      await waitFor(() => {
        // Should redirect to login
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });

    test('role-based access control works correctly', async () => {
      const studentUser = { id: 1, role: 'student' };

      render(
        <TestAppWrapper initialUser={studentUser}>
          <App />
        </TestAppWrapper>
      );

      // Student trying to access admin route
      window.history.pushState({}, 'Admin Page', '/admin');

      await waitFor(() => {
        // Should show access denied or redirect
        expect(screen.getByText(/not authorized|access denied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence Integration', () => {
    test('user session persists across page refreshes', async () => {
      // Mock localStorage with existing token
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'valid-token';
        if (key === 'user_data') return JSON.stringify({ id: 1, role: 'student' });
        return null;
      });

      mockApiCalls.fetchUserProfile.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        role: 'student'
      });

      render(
        <TestAppWrapper>
          <App />
        </TestAppWrapper>
      );

      // Should automatically log in user based on stored token
      await waitFor(() => {
        expect(mockApiCalls.fetchUserProfile).toHaveBeenCalled();
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });
});