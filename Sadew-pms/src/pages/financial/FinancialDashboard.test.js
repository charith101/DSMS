import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinancialDashboard from './FinancialDashboard';
import { PaymentProvider } from '../../contexts/PaymentContext';
import { UserProvider } from '../../contexts/UserContext';

// Mock contexts
const mockPaymentContext = {
  payments: [
    {
      id: 1,
      amount: 900,
      status: 'completed',
      createdAt: '2024-01-15T10:00:00Z',
      paymentMethod: 'credit_card',
      studentName: 'John Doe',
      packageType: 'premium'
    },
    {
      id: 2,
      amount: 50,
      status: 'completed',
      createdAt: '2024-01-15T08:00:00Z',
      paymentMethod: 'cash',
      studentName: 'Jane Smith',
      packageType: 'individual'
    },
    {
      id: 3,
      amount: -300,
      status: 'refunded',
      createdAt: '2024-01-14T15:00:00Z',
      paymentMethod: 'credit_card',
      studentName: 'Mike Johnson',
      packageType: 'basic'
    }
  ],
  processPayment: jest.fn(),
  loading: false,
  error: null
};

const mockUserContext = {
  user: { id: 1, name: 'Financial Manager', role: 'financial' },
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  error: null
};

const TestWrapper = ({ children }) => (
  <UserProvider value={mockUserContext}>
    <PaymentProvider value={mockPaymentContext}>
      {children}
    </PaymentProvider>
  </UserProvider>
);

describe('FinancialDashboard Component', () => {
  describe('Initial Render', () => {
    test('renders dashboard header correctly', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive financial analytics and reporting for your driving school.')).toBeInTheDocument();
    });

    test('displays key financial metrics', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$45,230')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('$8,450')).toBeInTheDocument();
      expect(screen.getByText('Outstanding')).toBeInTheDocument();
      expect(screen.getByText('$2,150')).toBeInTheDocument();
      expect(screen.getByText('Collection Rate')).toBeInTheDocument();
      expect(screen.getByText('94.2%')).toBeInTheDocument();
    });

    test('shows percentage changes in metrics', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('+18% from last month')).toBeInTheDocument();
      expect(screen.getByText('+25% from last month')).toBeInTheDocument();
      expect(screen.getByText('+2.1% from last month')).toBeInTheDocument();
      expect(screen.getByText('23 pending payments')).toBeInTheDocument();
    });
  });

  describe('Charts Section', () => {
    test('displays chart placeholders', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Revenue Trend (Last 6 Months)')).toBeInTheDocument();
      expect(screen.getByText('Payment Methods Distribution')).toBeInTheDocument();
      expect(screen.getByText('Revenue Chart')).toBeInTheDocument();
      expect(screen.getByText('Payment Methods Chart')).toBeInTheDocument();
    });

    test('shows chart implementation notes', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Chart will be implemented with Recharts')).toBeInTheDocument();
      expect(screen.getByText('Pie chart will be implemented with Recharts')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    test('displays all quick action cards', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Generate Report')).toBeInTheDocument();
      expect(screen.getByText('Process Refunds')).toBeInTheDocument();
      expect(screen.getByText('Manage Pricing')).toBeInTheDocument();
      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });

    test('quick action cards have correct descriptions', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Create comprehensive financial reports')).toBeInTheDocument();
      expect(screen.getByText('Handle refund requests and processing')).toBeInTheDocument();
      expect(screen.getByText('Update package prices and discounts')).toBeInTheDocument();
      expect(screen.getByText('Export financial data for accounting')).toBeInTheDocument();
    });

    test('quick action buttons are clickable', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const createReportButton = screen.getByText('Create Report');
      const viewRefundsButton = screen.getByText('View Refunds');
      const updatePricingButton = screen.getByText('Update Pricing');
      const exportButton = screen.getByText('Export');

      expect(createReportButton).toBeInTheDocument();
      expect(viewRefundsButton).toBeInTheDocument();
      expect(updatePricingButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();

      // Test that buttons are clickable (though we don't test actual functionality)
      fireEvent.click(createReportButton);
      fireEvent.click(viewRefundsButton);
      fireEvent.click(updatePricingButton);
      fireEvent.click(exportButton);
    });
  });

  describe('Recent Transactions', () => {
    test('displays recent transactions section', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });

    test('shows sample transaction data', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('John Doe - Premium Package')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith - Individual Lesson')).toBeInTheDocument();
      expect(screen.getByText('Refund - Mike Johnson')).toBeInTheDocument();
    });

    test('displays transaction amounts and status', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('+$900.00')).toBeInTheDocument();
      expect(screen.getByText('+$50.00')).toBeInTheDocument();
      expect(screen.getByText('-$300.00')).toBeInTheDocument();
      
      const completedBadges = screen.getAllByText('Completed');
      expect(completedBadges).toHaveLength(2);
      expect(screen.getByText('Refunded')).toBeInTheDocument();
    });

    test('shows transaction payment methods and timing', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Credit Card • 2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('Cash • 5 hours ago')).toBeInTheDocument();
      expect(screen.getByText('Package cancellation • 1 day ago')).toBeInTheDocument();
    });
  });

  describe('Outstanding Payments', () => {
    test('displays outstanding payments section', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Outstanding Payments')).toBeInTheDocument();
    });

    test('shows sample outstanding payment data', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Sarah Wilson - Basic Package')).toBeInTheDocument();
      expect(screen.getByText('Tom Brown - Premium Package')).toBeInTheDocument();
    });

    test('displays overdue information', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('5 days overdue')).toBeInTheDocument();
      expect(screen.getByText('2 days overdue')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('uses proper grid layout for metrics', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const metricsGrid = screen.getByText('Total Revenue').closest('.grid');
      expect(metricsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    test('uses proper grid layout for charts', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const chartsGrid = screen.getByText('Revenue Trend (Last 6 Months)').closest('.grid');
      expect(chartsGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
    });

    test('uses proper grid layout for quick actions', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const actionsGrid = screen.getByText('Generate Report').closest('.grid');
      expect(actionsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Financial Dashboard');

      const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    test('buttons have proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    test('status badges have proper semantic meaning', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const statusBadges = screen.getAllByText(/Completed|Refunded|Overdue/);
      statusBadges.forEach(badge => {
        expect(badge).toBeVisible();
      });
    });
  });

  describe('Responsive Design', () => {
    test('applies responsive classes correctly', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      // Check for responsive grid classes
      const grids = document.querySelectorAll('.grid');
      expect(grids.length).toBeGreaterThan(0);
      
      grids.forEach(grid => {
        expect(grid.className).toMatch(/(sm:|md:|lg:)/);
      });
    });
  });

  describe('Visual Indicators', () => {
    test('displays trend arrows correctly', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      // Check for SVG trend indicators
      const trendArrows = document.querySelectorAll('svg path[d*="M5 10l7-7"]');
      expect(trendArrows.length).toBeGreaterThan(0);
    });

    test('applies correct styling for positive changes', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const positiveChanges = document.querySelectorAll('.card-stat-change-positive');
      expect(positiveChanges.length).toBeGreaterThan(0);
    });

    test('displays icons for quick actions', () => {
      render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      // Check for action icons
      const actionIcons = document.querySelectorAll('.mx-auto.h-8.w-8');
      expect(actionIcons.length).toBe(4); // One for each quick action
    });
  });
});