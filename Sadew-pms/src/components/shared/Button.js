import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { LoadingSpinner } from './LoadingStates';

/**
 * Button component with multiple variants and sizes
 * Follows the design system from buttons.css
 */
const Button = forwardRef(({
  children,
  type = 'button',
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  loadingText = null,
  block = false,
  icon = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  // Build class names based on props
  const getButtonClasses = () => {
    let classes = ['btn'];
    
    // Variant classes
    if (variant.startsWith('outline-')) {
      classes.push(`btn-${variant}`);
    } else if (variant.startsWith('ghost')) {
      classes.push(`btn-${variant}`);
    } else {
      classes.push(`btn-${variant}`);
    }
    
    // Size classes
    if (size !== 'base') {
      classes.push(`btn-${size}`);
    }
    
    // Additional modifier classes
    if (block) classes.push('btn-block');
    if (icon) classes.push('btn-icon');
    if (loading) classes.push('btn-loading');
    
    // Custom classes
    if (className) classes.push(className);
    
    return classes.join(' ');
  };
  
  const getSpinnerVariant = () => {
    if (variant.includes('outline') || variant.includes('ghost')) {
      return 'primary';
    }
    return 'white';
  };
  
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'xs';
      case 'lg':
        return 'sm';
      default:
        return 'xs';
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={getButtonClasses()}
      onClick={onClick}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <LoadingSpinner 
            size={getSpinnerSize()} 
            variant={getSpinnerVariant()}
            label="Loading"
          />
          <span>{loadingText || 'Loading...'}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf([
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
  ]),
  size: PropTypes.oneOf(['sm', 'base', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  block: PropTypes.bool,
  icon: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;