import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    test('renders input with default props', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveClass('form-input');
    });

    test('renders input with label', () => {
      render(<Input label="Username" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Username');
      
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', input.id);
    });

    test('generates unique ID when not provided', () => {
      render(<Input label="Test Input" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id');
      expect(input.id).toMatch(/^input-/);
    });

    test('uses provided ID', () => {
      render(<Input id="custom-id" label="Test Input" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });
  });

  describe('Input Types', () => {
    const types = ['email', 'password', 'number', 'tel', 'url', 'search'];
    
    types.forEach(type => {
      test(`renders ${type} input type`, () => {
        render(<Input type={type} />);
        
        const input = screen.getByRole(type === 'search' ? 'searchbox' : 'textbox');
        expect(input).toHaveAttribute('type', type);
      });
    });
  });

  describe('Input Sizes', () => {
    test('renders small input', () => {
      render(<Input size="sm" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input-sm');
    });

    test('renders large input', () => {
      render(<Input size="lg" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input-lg');
    });

    test('renders base size without additional class', () => {
      render(<Input size="base" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input');
      expect(input).not.toHaveClass('form-input-base');
    });
  });

  describe('Input States', () => {
    test('renders error state', () => {
      render(<Input state="error" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('renders success state', () => {
      render(<Input state="success" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input-success');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    test('renders disabled input', () => {
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    test('renders readonly input', () => {
      render(<Input readOnly />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('Error Handling', () => {
    test('displays error message using error prop', () => {
      render(<Input label="Test" error="This field is required" />);
      
      const errorMessage = screen.getByText('This field is required');
      const input = screen.getByRole('textbox');
      
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(input).toHaveClass('form-input-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    test('displays error message using errorMessage prop', () => {
      render(<Input label="Test" errorMessage="Invalid input" />);
      
      const errorMessage = screen.getByText('Invalid input');
      const input = screen.getByRole('textbox');
      
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(input).toHaveClass('form-input-error');
    });

    test('error prop takes precedence over errorMessage prop', () => {
      render(<Input error="Error prop" errorMessage="ErrorMessage prop" />);
      
      expect(screen.getByText('Error prop')).toBeInTheDocument();
      expect(screen.queryByText('ErrorMessage prop')).not.toBeInTheDocument();
    });

    test('error state overrides other states', () => {
      render(<Input state="success" error="Has error" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input-error');
      expect(input).not.toHaveClass('form-input-success');
    });
  });

  describe('Success State', () => {
    test('displays success message', () => {
      render(<Input successMessage="Input is valid" />);
      
      const successMessage = screen.getByText('Input is valid');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveClass('form-success');
    });

    test('success message is hidden when error is present', () => {
      render(<Input successMessage="Valid" error="Has error" />);
      
      expect(screen.queryByText('Valid')).not.toBeInTheDocument();
      expect(screen.getByText('Has error')).toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    test('displays help text', () => {
      render(<Input helpText="Enter your username" />);
      
      const helpText = screen.getByText('Enter your username');
      const input = screen.getByRole('textbox');
      
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveClass('form-help');
      expect(input).toHaveAttribute('aria-describedby');
    });

    test('help text is hidden when error message is present', () => {
      render(<Input helpText="Help text" error="Error message" />);
      
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    test('help text is hidden when success message is present', () => {
      render(<Input helpText="Help text" successMessage="Success message" />);
      
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    test('marks label as required', () => {
      render(<Input label="Required Field" required />);
      
      const label = screen.getByText('Required Field');
      expect(label).toHaveClass('required');
    });

    test('non-required field does not have required class', () => {
      render(<Input label="Optional Field" />);
      
      const label = screen.getByText('Optional Field');
      expect(label).not.toHaveClass('required');
    });
  });

  describe('Event Handling', () => {
    test('calls onChange when input value changes', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    test('calls onBlur when input loses focus', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    test('calls onFocus when input gains focus', () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('Value Handling', () => {
    test('displays provided value', () => {
      render(<Input value="test value" onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test value');
    });

    test('handles number value', () => {
      render(<Input type="number" value={42} onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('42');
    });
  });

  describe('Accessibility', () => {
    test('associates label with input', () => {
      render(<Input id="test-input" label="Test Label" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    test('sets aria-invalid correctly', () => {
      const { rerender } = render(<Input />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
      
      rerender(<Input error="Has error" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('sets aria-describedby when help text is present', () => {
      render(<Input helpText="Help text" />);
      
      const input = screen.getByRole('textbox');
      const helpTextId = input.getAttribute('aria-describedby');
      
      expect(helpTextId).toBeTruthy();
      expect(document.getElementById(helpTextId)).toHaveTextContent('Help text');
    });

    test('error message has alert role', () => {
      render(<Input error="Error message" />);
      
      const errorMessage = screen.getByText('Error message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('Forward Ref', () => {
    test('forwards ref to input element', () => {
      const ref = React.createRef();
      render(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('Additional Props', () => {
    test('passes through additional props to input', () => {
      render(
        <Input 
          placeholder="Enter text"
          name="test-input"
          autoComplete="username"
          data-testid="custom-input"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
      expect(input).toHaveAttribute('name', 'test-input');
      expect(input).toHaveAttribute('autocomplete', 'username');
      expect(input).toHaveAttribute('data-testid', 'custom-input');
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      render(<Input className="custom-input-class" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input-class');
    });

    test('combines multiple classes correctly', () => {
      render(<Input size="lg" state="error" className="custom-class" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input', 'form-input-lg', 'form-input-error', 'custom-class');
    });
  });

  describe('Form Group Structure', () => {
    test('wraps input in form-group div', () => {
      render(<Input label="Test" />);
      
      const formGroup = screen.getByText('Test').closest('.form-group');
      expect(formGroup).toBeInTheDocument();
    });

    test('maintains proper element order in form group', () => {
      render(<Input label="Test Label" helpText="Help text" />);
      
      const formGroup = document.querySelector('.form-group');
      const children = Array.from(formGroup.children);
      
      expect(children[0]).toHaveClass('form-label');
      expect(children[1]).toHaveClass('form-input');
      expect(children[2]).toHaveClass('form-help');
    });
  });
});