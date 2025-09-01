import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card component with various layouts and styles
 * Follows the design system from cards.css
 */
const Card = ({
  children,
  variant = 'default',
  size = 'base',
  elevated = false,
  bordered = false,
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  // Build card classes
  const getCardClasses = () => {
    let classes = ['card'];
    
    // Variant classes
    if (variant !== 'default') {
      classes.push(`card-${variant}`);
    }
    
    // Size classes
    if (size !== 'base') {
      classes.push(`card-${size}`);
    }
    
    // Modifier classes
    if (elevated) classes.push('card-elevated');
    if (bordered) classes.push('card-bordered');
    if (interactive) classes.push('card-interactive');
    
    // Custom classes
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <div
      className={getCardClasses()}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => e.key === 'Enter' && onClick && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'success',
    'error',
    'warning'
  ]),
  size: PropTypes.oneOf(['sm', 'base', 'lg']),
  elevated: PropTypes.bool,
  bordered: PropTypes.bool,
  interactive: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

/**
 * Card Header component
 */
const CardHeader = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '', 
  ...props 
}) => (
  <div className={`card-header ${className}`} {...props}>
    <div>
      {title && <h3 className="card-header-title">{title}</h3>}
      {subtitle && <p className="card-header-subtitle">{subtitle}</p>}
      {children}
    </div>
    {actions && <div className="card-header-actions">{actions}</div>}
  </div>
);

CardHeader.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  className: PropTypes.string
};

/**
 * Card Body component
 */
const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

/**
 * Card Footer component
 */
const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

/**
 * Card Image component
 */
const CardImage = ({ 
  src, 
  alt, 
  position = 'top',
  className = '', 
  ...props 
}) => (
  <img
    src={src}
    alt={alt}
    className={`card-image card-image-${position} ${className}`}
    {...props}
  />
);

CardImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom']),
  className: PropTypes.string
};

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Image = CardImage;

export default Card;