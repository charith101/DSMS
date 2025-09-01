import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for form state management with validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @param {Function} onSubmit - Function to call on form submission
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}, validationRules = {}, onSubmit = () => {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validation function for a single field
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.requiredMessage || `${fieldName} is required`;
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return rules.minLengthMessage || `${fieldName} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.maxLengthMessage || `${fieldName} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation (regex)
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || `${fieldName} format is invalid`;
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return rules.emailMessage || 'Please enter a valid email address';
      }
    }

    // Custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value, values);
      if (customError) return customError;
    }

    return '';
  }, [validationRules, values]);

  // Validate all fields
  const validateAllFields = useCallback(() => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [validateField, validationRules, values]);

  // Handle field change
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Real-time validation for touched fields
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [touched, validateField]);

  // Handle field blur
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field on blur
    const error = validateField(fieldName, values[fieldName] || '');
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, [validateField, values]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationRules).forEach(fieldName => {
      allTouched[fieldName] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const formIsValid = validateAllFields();
    
    if (!formIsValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAllFields, onSubmit, values, validationRules]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  // Update form values programmatically
  const setFieldValue = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  // Set multiple field values
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Effect to validate form when values change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateAllFields();
    }
  }, [values, touched, validateAllFields]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldValues,
    validateAllFields
  };
};

export default useForm;