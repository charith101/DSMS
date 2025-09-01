import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input component with validation states and various types
 * Follows the design system from forms.css
 */
const Input = forwardRef(({
  type = 'text',
  size = 'base',
  state = null,
  disabled = false,
  readOnly = false,
  placeholder = '',
  className = '',
  label,
  required = false,
  helpText,
  errorMessage,
  successMessage,
  error, // New prop for error message (backwards compatibility)
  id,
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle error state from error prop or errorMessage
  const hasError = error || errorMessage;
  const displayState = hasError ? 'error' : state;
  const displayErrorMessage = error || errorMessage;
  
  // Build input classes
  const getInputClasses = () => {
    let classes = ['form-input'];
    
    // Size classes
    if (size !== 'base') {
      classes.push(`form-input-${size}`);
    }
    
    // State classes
    if (displayState === 'error') {
      classes.push('form-input-error');
    } else if (displayState === 'success') {
      classes.push('form-input-success');
    }
    
    // Custom classes
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <div className="form-group">
      {label && (
        <label 
          htmlFor={inputId} 
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        className={getInputClasses()}
        aria-invalid={displayState === 'error' ? 'true' : 'false'}
        aria-describedby={
          (helpText || displayErrorMessage || successMessage) 
            ? `${inputId}-help` 
            : undefined
        }
        {...props}
      />
      
      {helpText && !displayErrorMessage && !successMessage && (
        <div id={`${inputId}-help`} className="form-help">
          {helpText}
        </div>
      )}
      
      {displayErrorMessage && (
        <div id={`${inputId}-help`} className="form-error" role="alert">
          {displayErrorMessage}
        </div>
      )}
      
      {successMessage && !displayErrorMessage && (
        <div id={`${inputId}-help`} className="form-success">
          {successMessage}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.oneOf([
    'text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date'
  ]),
  size: PropTypes.oneOf(['sm', 'base', 'lg']),
  state: PropTypes.oneOf(['error', 'success']),
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  helpText: PropTypes.string,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  error: PropTypes.string, // New prop for backwards compatibility
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func
};

export default Input;