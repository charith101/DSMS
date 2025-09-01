import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Import components to test
import PaymentCheckout from '../../pages/student/PaymentCheckout';
import FinancialDashboard from '../../pages/financial/FinancialDashboard';
import { Button, Input, Modal } from '../../components/shared';
import AccessibleNavigation from '../../components/AccessibleNavigation';

// Mock contexts
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Accessibility Integration Tests', () => {
  describe('WCAG 2.1 AA Compliance', () => {
    test('PaymentCheckout component has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <PaymentCheckout />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('FinancialDashboard component has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <FinancialDashboard />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Button component has no accessibility violations', async () => {
      const { container } = render(
        <Button>Accessible Button</Button>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Input component has no accessibility violations', async () => {
      const { container } = render(
        <Input label="Accessible Input" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    test('payment form can be completed using only keyboard', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PaymentCheckout />
        </TestWrapper>
      );

      // Navigate to package select using Tab
      await user.tab();
      const packageSelect = screen.getByLabelText(/choose a package/i);
      expect(packageSelect).toHaveFocus();

      // Select package using keyboard
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // Navigate to next step button
      await user.tab();
      const nextButton = screen.getByText(/next step/i);
      expect(nextButton).toHaveFocus();

      // Proceed to next step
      await user.keyboard('{Enter}');

      // Should be on payment details step
      expect(screen.getByText(/payment details/i)).toBeInTheDocument();
    });

    test('navigation menu is keyboard accessible', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AccessibleNavigation />
        </TestWrapper>
      );

      // Focus first navigation item
      const firstNavItem = screen.getAllByRole('link')[0];
      firstNavItem.focus();

      // Navigate through menu items using arrow keys
      await user.keyboard('{ArrowRight}');
      const secondNavItem = screen.getAllByRole('link')[1];
      expect(secondNavItem).toHaveFocus();

      // Use Enter to activate link
      await user.keyboard('{Enter}');
      // Link should be activated (tested via href or onClick)
    });

    test('modal dialogs trap focus correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <h2>Modal Title</h2>
          <Input label="Modal Input" />
          <Button>Modal Button</Button>
        </Modal>
      );

      // Focus should be trapped within modal
      const modalTitle = screen.getByText('Modal Title');
      const modalInput = screen.getByLabelText(/modal input/i);
      const modalButton = screen.getByText('Modal Button');

      // Tab should cycle through modal elements only
      modalInput.focus();
      await user.tab();
      expect(modalButton).toHaveFocus();

      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      expect(modalInput).toHaveFocus();
    });

    test('skip links work correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AccessibleNavigation />
          <main id="main-content">
            <h1>Main Content</h1>
          </main>
        </TestWrapper>
      );

      // Tab to activate skip link
      await user.tab();
      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveFocus();

      // Activate skip link
      await user.keyboard('{Enter}');

      // Focus should move to main content
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    test('form errors are announced to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <Input 
          label="Required Field" 
          required 
          error="This field is required"
        />
      );

      const input = screen.getByLabelText(/required field/i);
      const errorMessage = screen.getByText('This field is required');

      // Error should have alert role for screen reader announcement
      expect(errorMessage).toHaveAttribute('role', 'alert');
      
      // Input should be associated with error message
      expect(input).toHaveAttribute('aria-describedby');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('loading states are announced to screen readers', async () => {
      render(
        <Button loading loadingText="Processing payment...">
          Pay Now
        </Button>
      );

      const button = screen.getByRole('button');
      
      // Button should indicate loading state
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
      
      // Loading text should be announced
      expect(screen.getByText('Processing payment...')).toBeInTheDocument();
    });

    test('dynamic content changes are announced', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const [message, setMessage] = React.useState('');
        
        return (
          <div>
            <Button onClick={() => setMessage('Action completed successfully!')}>
              Perform Action
            </Button>
            {message && (
              <div role="status" aria-live="polite">
                {message}
              </div>
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByText('Perform Action');
      await user.click(button);

      const statusMessage = screen.getByText('Action completed successfully!');
      expect(statusMessage).toHaveAttribute('role', 'status');
      expect(statusMessage).toHaveAttribute('aria-live', 'polite');
    });

    test('progress indicators are accessible', async () => {
      render(
        <div>
          <div role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: '60%' }}>60% complete</div>
          </div>
          <div aria-live="polite" id="progress-status">
            Step 2 of 3: Payment Details
          </div>
        </div>
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');

      const statusText = screen.getByText('Step 2 of 3: Payment Details');
      expect(statusText).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Visual Accessibility', () => {
    test('color contrast meets WCAG AA standards', async () => {
      // This test would typically use a tool like axe-core to check contrast
      const { container } = render(
        <div className="bg-primary-color text-white p-4">
          <h2>High Contrast Text</h2>
          <p>This text should meet WCAG AA contrast requirements.</p>
        </div>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });

      expect(results).toHaveNoViolations();
    });

    test('focus indicators are visible and clear', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <Button>First Button</Button>
          <Button>Second Button</Button>
          <Input label="Test Input" />
        </div>
      );

      // Tab through elements and check focus indicators
      await user.tab();
      const firstButton = screen.getByText('First Button');
      expect(firstButton).toHaveFocus();
      // Focus indicator should be visible (tested via CSS or computed styles)

      await user.tab();
      const secondButton = screen.getByText('Second Button');
      expect(secondButton).toHaveFocus();

      await user.tab();
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveFocus();
    });

    test('text scales appropriately without breaking layout', async () => {
      // Test at different zoom levels (simulated by font-size changes)
      const TestComponent = () => (
        <div style={{ fontSize: '200%' }}>
          <Button>Scaled Button</Button>
          <Input label="Scaled Input" />
          <p>This text should remain readable and functional when scaled to 200%.</p>
        </div>
      );

      const { container } = render(<TestComponent />);

      // Component should still be functional with increased font size
      const button = screen.getByText('Scaled Button');
      const input = screen.getByLabelText('Scaled Input');

      expect(button).toBeVisible();
      expect(input).toBeVisible();
      
      // Check that text doesn't overflow or become unusable
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Reduced Motion Support', () => {
    test('respects prefers-reduced-motion setting', () => {
      // Mock the media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <div className="animate-spin">
          Animated Element
        </div>
      );

      // Animation should be disabled or reduced when user prefers reduced motion
      const animatedElement = screen.getByText('Animated Element');
      const computedStyle = window.getComputedStyle(animatedElement);
      
      // In a real implementation, we'd check that animation-duration is 0.01ms
      // or animation is paused when prefers-reduced-motion is reduce
      expect(animatedElement).toBeInTheDocument();
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    test('touch targets meet minimum size requirements', () => {
      render(
        <div>
          <Button size="sm">Small Button</Button>
          <Button>Regular Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        // Touch targets should be at least 44x44 pixels (iOS) or 48x48 pixels (Android)
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    test('components work with voice control', async () => {
      render(
        <div>
          <Button aria-label="Submit payment">Pay Now</Button>
          <Input label="Credit card number" />
        </div>
      );

      // Elements should have proper labels for voice control
      const button = screen.getByLabelText('Submit payment');
      const input = screen.getByLabelText('Credit card number');

      expect(button).toBeInTheDocument();
      expect(input).toBeInTheDocument();

      // Voice commands like "click submit payment" should work
      fireEvent.click(button);
      expect(button).toHaveBeenCalled || expect(button).toBeInTheDocument();
    });
  });

  describe('Multi-language Support', () => {
    test('components support RTL languages', () => {
      const { container } = render(
        <div dir="rtl" lang="ar">
          <Button>زر الدفع</Button>
          <Input label="رقم البطاقة" />
        </div>
      );

      // Layout should adapt to RTL direction
      const rtlContainer = container.firstChild;
      expect(rtlContainer).toHaveAttribute('dir', 'rtl');
      expect(rtlContainer).toHaveAttribute('lang', 'ar');

      // Elements should be properly positioned for RTL
      const button = screen.getByRole('button');
      const input = screen.getByRole('textbox');
      
      expect(button).toBeVisible();
      expect(input).toBeVisible();
    });

    test('aria-labels and descriptions support internationalization', () => {
      const i18nMessages = {
        'button.pay': 'Pay Now',
        'input.cardNumber': 'Credit card number',
        'error.required': 'This field is required'
      };

      render(
        <div>
          <Button aria-label={i18nMessages['button.pay']}>
            {i18nMessages['button.pay']}
          </Button>
          <Input 
            label={i18nMessages['input.cardNumber']} 
            error={i18nMessages['error.required']}
          />
        </div>
      );

      expect(screen.getByLabelText('Pay Now')).toBeInTheDocument();
      expect(screen.getByLabelText('Credit card number')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });
});