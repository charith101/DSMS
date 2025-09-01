import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Select component with validation states
 * Follows the design system from forms.css
 */
const Select = forwardRef(({
  size = 'base',
  state = null,
  disabled = false,
  placeholder = 'Select an option...',
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
  children,
  options = [],
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle error state from error prop or errorMessage
  const hasError = error || errorMessage;
  const displayState = hasError ? 'error' : state;
  const displayErrorMessage = error || errorMessage;
  
  // Build select classes
  const getSelectClasses = () => {
    let classes = ['form-input', 'form-select'];
    
    // Size classes
    if (size !== 'base') {
      classes.push(`form-input-${size}`, `form-select-${size}`);
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
          htmlFor={selectId} 
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        className={getSelectClasses()}
        aria-invalid={displayState === 'error' ? 'true' : 'false'}
        aria-describedby={
          (helpText || displayErrorMessage || successMessage) 
            ? `${selectId}-help` 
            : undefined
        }
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {/* Render options from array */}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        
        {/* Render children (option elements) */}
        {children}
      </select>
      
      {helpText && !displayErrorMessage && !successMessage && (
        <div id={`${selectId}-help`} className="form-help">
          {helpText}
        </div>
      )}
      
      {displayErrorMessage && (
        <div id={`${selectId}-help`} className="form-error" role="alert">
          {displayErrorMessage}
        </div>
      )}
      
      {successMessage && !displayErrorMessage && (
        <div id={`${selectId}-help`} className="form-success">
          {successMessage}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  size: PropTypes.oneOf(['sm', 'base', 'lg']),
  state: PropTypes.oneOf(['error', 'success']),
  disabled: PropTypes.bool,
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
  onFocus: PropTypes.func,
  children: PropTypes.node,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  )
};

export default Select;