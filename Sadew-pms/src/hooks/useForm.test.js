import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm Hook', () => {
  const initialValues = {
    name: '',
    email: '',
    password: ''
  };

  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      requiredMessage: 'Name is required',
      minLengthMessage: 'Name must be at least 2 characters'
    },
    email: {
      required: true,
      email: true,
      requiredMessage: 'Email is required',
      emailMessage: 'Please enter a valid email'
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 20,
      requiredMessage: 'Password is required',
      minLengthMessage: 'Password must be at least 6 characters',
      maxLengthMessage: 'Password must be no more than 20 characters'
    }
  };

  describe('Initial State', () => {
    test('initializes with provided initial values', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(false);
    });

    test('initializes with empty object when no initial values provided', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.values).toEqual({});
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('Field Validation', () => {
    test('validates required fields', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      act(() => {
        result.current.handleBlur('name');
      });

      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.touched.name).toBe(true);
    });

    test('validates email format', () => {
      const { result } = renderHook(() => 
        useForm({ email: 'invalid-email' }, validationRules)
      );

      act(() => {
        result.current.handleBlur('email');
      });

      expect(result.current.errors.email).toBe('Please enter a valid email');
    });

    test('validates minimum length', () => {
      const { result } = renderHook(() => 
        useForm({ name: 'a' }, validationRules)
      );

      act(() => {
        result.current.handleBlur('name');
      });

      expect(result.current.errors.name).toBe('Name must be at least 2 characters');
    });

    test('validates maximum length', () => {
      const longPassword = 'a'.repeat(25);
      const { result } = renderHook(() => 
        useForm({ password: longPassword }, validationRules)
      );

      act(() => {
        result.current.handleBlur('password');
      });

      expect(result.current.errors.password).toBe('Password must be no more than 20 characters');
    });

    test('validates pattern regex', () => {
      const phoneValidation = {
        phone: {
          pattern: /^\d{10}$/,
          patternMessage: 'Phone must be 10 digits'
        }
      };

      const { result } = renderHook(() => 
        useForm({ phone: '123' }, phoneValidation)
      );

      act(() => {
        result.current.handleBlur('phone');
      });

      expect(result.current.errors.phone).toBe('Phone must be 10 digits');
    });

    test('validates with custom validation function', () => {
      const customValidation = {
        confirmPassword: {
          custom: (value, values) => {
            if (value !== values.password) {
              return 'Passwords do not match';
            }
          }
        }
      };

      const { result } = renderHook(() => 
        useForm({ password: 'test123', confirmPassword: 'different' }, customValidation)
      );

      act(() => {
        result.current.handleBlur('confirmPassword');
      });

      expect(result.current.errors.confirmPassword).toBe('Passwords do not match');
    });
  });

  describe('Form State Management', () => {
    test('handles field value changes', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      act(() => {
        result.current.handleChange('name', 'John Doe');
      });

      expect(result.current.values.name).toBe('John Doe');
    });

    test('validates field on change when already touched', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      // First, touch the field
      act(() => {
        result.current.handleBlur('name');
      });

      // Then change the value
      act(() => {
        result.current.handleChange('name', 'Jo');
      });

      expect(result.current.errors.name).toBe('Name must be at least 2 characters');
    });

    test('does not validate field on change when not touched', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      act(() => {
        result.current.handleChange('name', '');
      });

      expect(result.current.errors.name).toBeUndefined();
    });

    test('marks field as touched on blur', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      act(() => {
        result.current.handleBlur('name');
      });

      expect(result.current.touched.name).toBe(true);
    });
  });

  describe('Form Validation', () => {
    test('validates all fields and updates isValid state', () => {
      const { result } = renderHook(() => 
        useForm({ name: 'John', email: 'john@example.com', password: 'password123' }, validationRules)
      );

      act(() => {
        result.current.validateAllFields();
      });

      expect(result.current.isValid).toBe(true);
      expect(Object.keys(result.current.errors)).toHaveLength(0);
    });

    test('sets isValid to false when form has errors', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      act(() => {
        result.current.validateAllFields();
      });

      expect(result.current.isValid).toBe(false);
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    });
  });

  describe('Form Submission', () => {
    test('handles successful form submission', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const validFormData = { name: 'John', email: 'john@example.com', password: 'password123' };
      
      const { result } = renderHook(() => 
        useForm(validFormData, validationRules, onSubmit)
      );

      const mockEvent = { preventDefault: jest.fn() };

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalledWith(validFormData);
      expect(result.current.isSubmitting).toBe(false);
    });

    test('prevents submission when form is invalid', async () => {
      const onSubmit = jest.fn();
      
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules, onSubmit)
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(Object.keys(result.current.touched).length).toBeGreaterThan(0);
    });

    test('sets isSubmitting state during submission', async () => {
      const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const validFormData = { name: 'John', email: 'john@example.com', password: 'password123' };
      
      const { result } = renderHook(() => 
        useForm(validFormData, validationRules, onSubmit)
      );

      let submissionPromise;
      
      act(() => {
        submissionPromise = result.current.handleSubmit();
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        await submissionPromise;
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    test('handles submission errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
      const validFormData = { name: 'John', email: 'john@example.com', password: 'password123' };
      
      const { result } = renderHook(() => 
        useForm(validFormData, validationRules, onSubmit)
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
      expect(result.current.isSubmitting).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Form Reset', () => {
    test('resets form to initial values', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      // Make some changes
      act(() => {
        result.current.handleChange('name', 'John');
        result.current.handleBlur('name');
      });

      expect(result.current.values.name).toBe('John');
      expect(result.current.touched.name).toBe(true);

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('Programmatic Field Updates', () => {
    test('setFieldValue updates single field', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      act(() => {
        result.current.setFieldValue('name', 'Jane');
      });

      expect(result.current.values.name).toBe('Jane');
    });

    test('setFieldValues updates multiple fields', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      act(() => {
        result.current.setFieldValues({ name: 'Jane', email: 'jane@example.com' });
      });

      expect(result.current.values.name).toBe('Jane');
      expect(result.current.values.email).toBe('jane@example.com');
    });
  });

  describe('Validation Effect', () => {
    test('validates form when values change and fields are touched', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      // Touch a field first
      act(() => {
        result.current.handleBlur('name');
      });

      // Then change values
      act(() => {
        result.current.setFieldValue('name', 'John Doe');
      });

      expect(result.current.isValid).toBe(false); // Still invalid due to other required fields
      expect(result.current.errors.name).toBeUndefined(); // But name field is now valid
    });

    test('does not validate when no fields are touched', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, validationRules)
      );

      act(() => {
        result.current.setFieldValue('name', 'John');
      });

      expect(result.current.isValid).toBe(false);
      expect(Object.keys(result.current.errors)).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles validation rules for non-existent fields', () => {
      const { result } = renderHook(() => 
        useForm({ name: 'John' }, { nonExistentField: { required: true } })
      );

      act(() => {
        result.current.validateAllFields();
      });

      expect(result.current.errors.nonExistentField).toBe('nonExistentField is required');
    });

    test('handles empty validation rules object', () => {
      const { result } = renderHook(() => 
        useForm(initialValues, {})
      );

      act(() => {
        result.current.handleBlur('name');
      });

      expect(result.current.errors.name).toBeUndefined();
    });

    test('handles field changes with no validation rules', () => {
      const { result } = renderHook(() => 
        useForm({ name: '' }, {})
      );

      act(() => {
        result.current.handleChange('name', 'John');
        result.current.handleBlur('name');
      });

      expect(result.current.values.name).toBe('John');
      expect(result.current.errors.name).toBeUndefined();
      expect(result.current.touched.name).toBe(true);
    });
  });
});