import React from 'react';
import PropTypes from 'prop-types';
import { useBreakpoint, useResponsive } from '../hooks/useResponsive';

/**
 * Responsive Layout Component
 * Implements mobile-first responsive design patterns
 */
const ResponsiveLayout = ({ children, className = '', ...props }) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  
  return (
    <div 
      className={`responsive-layout ${className}`}
      data-mobile={isMobile}
      data-tablet={isTablet}
      data-desktop={isDesktop}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Responsive Grid Component
 * Auto-adjusting grid based on screen size
 */
export const ResponsiveGrid = ({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = '',
  ...props 
}) => {
  const responsive = useResponsive({
    breakpointColumns: columns,
    defaultSpacing: gap
  });
  
  const gridClasses = [
    'grid',
    `grid-cols-${responsive.columns}`,
    `gap-${responsive.spacing}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Container Component
 * Provides consistent responsive container behavior
 */
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'xl',
  padding = true,
  center = true,
  className = '',
  ...props 
}) => {
  const containerClasses = [
    'container',
    maxWidth && `max-w-${maxWidth}`,
    center && 'mx-auto',
    padding && 'px-4',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Stack Component
 * Vertical stacking with responsive spacing
 */
export const ResponsiveStack = ({ 
  children, 
  spacing = { xs: 2, sm: 4, md: 6 },
  direction = { xs: 'col', md: 'row' },
  align = 'start',
  justify = 'start',
  className = '',
  ...props 
}) => {
  const { current } = useBreakpoint();
  
  // Get current direction
  const getCurrentDirection = () => {
    const directions = Object.entries(direction).reverse();
    for (const [breakpoint, dir] of directions) {
      if (current === breakpoint || 
          (current === 'xs' && breakpoint === 'xs') ||
          (current === 'sm' && ['xs', 'sm'].includes(breakpoint)) ||
          (current === 'md' && ['xs', 'sm', 'md'].includes(breakpoint)) ||
          (current === 'lg' && ['xs', 'sm', 'md', 'lg'].includes(breakpoint)) ||
          (current === 'xl' && ['xs', 'sm', 'md', 'lg', 'xl'].includes(breakpoint))) {
        return dir;
      }
    }
    return 'col';
  };
  
  // Get current spacing
  const getCurrentSpacing = () => {
    const spacings = Object.entries(spacing).reverse();
    for (const [breakpoint, space] of spacings) {
      if (current === breakpoint || 
          (current === 'xs' && breakpoint === 'xs') ||
          (current === 'sm' && ['xs', 'sm'].includes(breakpoint)) ||
          (current === 'md' && ['xs', 'sm', 'md'].includes(breakpoint)) ||
          (current === 'lg' && ['xs', 'sm', 'md', 'lg'].includes(breakpoint)) ||
          (current === 'xl' && ['xs', 'sm', 'md', 'lg', 'xl'].includes(breakpoint))) {
        return space;
      }
    }
    return 4;
  };
  
  const currentDirection = getCurrentDirection();
  const currentSpacing = getCurrentSpacing();
  
  const stackClasses = [
    'flex',
    `flex-${currentDirection}`,
    `items-${align}`,
    `justify-${justify}`,
    currentDirection === 'col' ? `space-y-${currentSpacing}` : `space-x-${currentSpacing}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={stackClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Card Grid Component
 * Grid of cards that adapts to screen size
 */
export const ResponsiveCardGrid = ({ 
  children, 
  minCardWidth = 280,
  maxColumns = 4,
  gap = 6,
  className = '',
  ...props 
}) => {
  const { width } = useBreakpoint();
  
  // Calculate optimal columns based on available width
  const calculateColumns = () => {
    const availableWidth = width - 32; // Account for container padding
    const cardsPerRow = Math.floor(availableWidth / (minCardWidth + (gap * 8)));
    return Math.min(Math.max(cardsPerRow, 1), maxColumns);
  };
  
  const columns = calculateColumns();
  
  const gridClasses = [
    'grid',
    `grid-cols-${columns}`,
    `gap-${gap}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Show/Hide Component
 * Shows or hides content based on breakpoints
 */
export const ResponsiveShow = ({ 
  children, 
  breakpoint = 'md',
  above = true,
  className = '',
  ...props 
}) => {
  const { isBreakpoint } = useBreakpoint();
  const shouldShow = above ? isBreakpoint(breakpoint) : !isBreakpoint(breakpoint);
  
  if (!shouldShow) return null;
  
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Text Component
 * Adjusts text size based on breakpoint
 */
export const ResponsiveText = ({ 
  children,
  sizes = { xs: 'text-sm', sm: 'text-base', md: 'text-lg', lg: 'text-xl' },
  className = '',
  as = 'p',
  ...props 
}) => {
  const { current } = useBreakpoint();
  
  const getCurrentSize = () => {
    return sizes[current] || sizes.sm || 'text-base';
  };
  
  const Component = as;
  const textClasses = [getCurrentSize(), className].filter(Boolean).join(' ');
  
  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
};

/**
 * Responsive Spacer Component
 * Adds responsive spacing between elements
 */
export const ResponsiveSpacer = ({ 
  height = { xs: 4, sm: 6, md: 8, lg: 12 },
  className = '',
  ...props 
}) => {
  const { current } = useBreakpoint();
  
  const getCurrentHeight = () => {
    return height[current] || height.sm || 4;
  };
  
  const spacerClasses = [`h-${getCurrentHeight()}`, className].filter(Boolean).join(' ');
  
  return <div className={spacerClasses} {...props} />;
};

// PropTypes
ResponsiveLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.object,
  gap: PropTypes.number,
  className: PropTypes.string
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
  padding: PropTypes.bool,
  center: PropTypes.bool,
  className: PropTypes.string
};

ResponsiveStack.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.object,
  direction: PropTypes.object,
  align: PropTypes.string,
  justify: PropTypes.string,
  className: PropTypes.string
};

ResponsiveCardGrid.propTypes = {
  children: PropTypes.node.isRequired,
  minCardWidth: PropTypes.number,
  maxColumns: PropTypes.number,
  gap: PropTypes.number,
  className: PropTypes.string
};

ResponsiveShow.propTypes = {
  children: PropTypes.node.isRequired,
  breakpoint: PropTypes.string,
  above: PropTypes.bool,
  className: PropTypes.string
};

ResponsiveText.propTypes = {
  children: PropTypes.node.isRequired,
  sizes: PropTypes.object,
  className: PropTypes.string,
  as: PropTypes.string
};

ResponsiveSpacer.propTypes = {
  height: PropTypes.object,
  className: PropTypes.string
};

export default ResponsiveLayout;