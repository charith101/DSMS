import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

// Mock LoadingSpinner component
jest.mock('./LoadingStates', () => ({
  LoadingSpinner: ({ size, variant, label }) => (
    <div data-testid="loading-spinner" data-size={size} data-variant={variant} aria-label={label}>
      Loading...
    </div>
  )
}));

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    test('renders button with children', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    test('renders with default props', () => {
      render(<Button>Default Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveClass('btn', 'btn-primary');
      expect(button).not.toBeDisabled();
    });

    test('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Button Types', () => {
    test('renders submit button when type is submit', () => {
      render(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    test('renders reset button when type is reset', () => {
      render(<Button type="reset">Reset</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Button Variants', () => {
    const variants = [
      'primary',
      'secondary',
      'success',
      'error',
      'warning',
      'outline',
      'outline-primary',
      'outline-secondary',
      'outline-success',
      'outline-error',
      'ghost',
      'ghost-primary'
    ];

    variants.forEach(variant => {
      test(`renders ${variant} variant correctly`, () => {
        render(<Button variant={variant}>Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass(`btn-${variant}`);
      });
    });
  });

  describe('Button Sizes', () => {
    test('renders small button', () => {
      render(<Button size="sm">Small Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-sm');
    });

    test('renders large button', () => {
      render(<Button size="lg">Large Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-lg');
    });

    test('renders base size without additional class', () => {
      render(<Button size="base">Base Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn');
      expect(button).not.toHaveClass('btn-base');
    });
  });

  describe('Button States', () => {
    test('renders disabled button', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('renders loading button with spinner', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      const spinner = screen.getByTestId('loading-spinner');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn-loading');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders loading button with custom loading text', () => {
      render(<Button loading loadingText="Processing...">Process</Button>);
      
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.queryByText('Process')).not.toBeInTheDocument();
    });

    test('block button has correct class', () => {
      render(<Button block>Block Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-block');
    });

    test('icon button has correct class', () => {
      render(<Button icon>Icon Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-icon');
    });
  });

  describe('Event Handling', () => {
    test('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading Spinner Configuration', () => {
    test('uses correct spinner variant for primary button', () => {
      render(<Button loading variant="primary">Loading</Button>);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('data-variant', 'white');
    });

    test('uses correct spinner variant for outline button', () => {
      render(<Button loading variant="outline-primary">Loading</Button>);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('data-variant', 'primary');
    });

    test('uses correct spinner variant for ghost button', () => {
      render(<Button loading variant="ghost">Loading</Button>);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('data-variant', 'primary');
    });

    test('uses correct spinner size for small button', () => {
      render(<Button loading size="sm">Loading</Button>);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('data-size', 'xs');
    });

    test('uses correct spinner size for large button', () => {
      render(<Button loading size="lg">Loading</Button>);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('data-size', 'sm');
    });

    test('uses correct spinner size for base button', () => {
      render(<Button loading size="base">Loading</Button>);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('data-size', 'xs');
    });
  });

  describe('Accessibility', () => {
    test('has proper button role', () => {
      render(<Button>Accessible Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('sets aria-busy when loading', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('does not set aria-busy when not loading', () => {
      render(<Button>Normal Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-busy', 'true');
    });

    test('loading spinner has proper aria-label', () => {
      render(<Button loading>Loading Button</Button>);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });
  });

  describe('Forward Ref', () => {
    test('forwards ref to button element', () => {
      const ref = React.createRef();
      render(<Button ref={ref}>Ref Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveTextContent('Ref Button');
    });
  });

  describe('Additional Props', () => {
    test('passes through additional props to button element', () => {
      render(
        <Button 
          data-testid="custom-button" 
          aria-label="Custom label"
          id="my-button"
        >
          Custom Button
        </Button>
      );
      
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('id', 'my-button');
    });
  });

  describe('Class Name Generation', () => {
    test('combines multiple modifier classes correctly', () => {
      render(
        <Button 
          variant="outline-success" 
          size="lg" 
          block 
          icon 
          loading
          className="custom-class"
        >
          Complex Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'btn',
        'btn-outline-success',
        'btn-lg',
        'btn-block',
        'btn-icon',
        'btn-loading',
        'custom-class'
      );
    });
  });

  describe('PropTypes Validation', () => {
    // Note: PropTypes validation happens in development mode
    // These tests verify the component handles edge cases gracefully
    
    test('handles undefined children gracefully', () => {
      // This would show a PropTypes warning in development
      render(<Button>{undefined}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('handles invalid variant gracefully', () => {
      // Component should still render even with invalid variant
      render(<Button variant="invalid-variant">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-invalid-variant');
    });
  });
});