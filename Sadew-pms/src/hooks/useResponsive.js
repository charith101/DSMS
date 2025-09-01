import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design utilities
 */

/**
 * Hook to get current window dimensions
 * @returns {Object} Window dimensions and responsive state
 */
export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

/**
 * Hook to detect current breakpoint
 * @returns {Object} Current breakpoint information
 */
export const useBreakpoint = () => {
  const { width } = useWindowDimensions();
  
  const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };
  
  const getCurrentBreakpoint = () => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };
  
  const isBreakpoint = (breakpoint) => {
    return width >= breakpoints[breakpoint];
  };
  
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;
  
  return {
    width,
    current: getCurrentBreakpoint(),
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints
  };
};

/**
 * Hook for media query matching
 * @param {string} query - Media query string
 * @returns {boolean} Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

/**
 * Hook to detect device capabilities
 * @returns {Object} Device capability information
 */
export const useDeviceCapabilities = () => {
  const hasTouch = useMediaQuery('(hover: none) and (pointer: coarse)');
  const hasHover = useMediaQuery('(hover: hover)');
  const canHover = useMediaQuery('(any-hover: hover)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  return {
    hasTouch,
    hasHover,
    canHover,
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
    isTouchDevice: hasTouch,
    isMouseDevice: hasHover
  };
};

/**
 * Hook for responsive component behavior
 * @param {Object} config - Responsive configuration
 * @returns {Object} Responsive state and utilities
 */
export const useResponsive = (config = {}) => {
  const { 
    defaultColumns = 1,
    breakpointColumns = {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4
    },
    defaultSpacing = 4,
    breakpointSpacing = {}
  } = config;
  
  const { current, isBreakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();
  
  // Get current number of columns
  const getColumns = () => {
    for (const [breakpoint, columns] of Object.entries(breakpointColumns).reverse()) {
      if (isBreakpoint(breakpoint)) {
        return columns;
      }
    }
    return defaultColumns;
  };
  
  // Get current spacing
  const getSpacing = () => {
    for (const [breakpoint, spacing] of Object.entries(breakpointSpacing).reverse()) {
      if (isBreakpoint(breakpoint)) {
        return spacing;
      }
    }
    return defaultSpacing;
  };
  
  return {
    columns: getColumns(),
    spacing: getSpacing(),
    breakpoint: current,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint
  };
};

/**
 * Hook for responsive text sizing
 * @param {Object} sizes - Text sizes for different breakpoints
 * @returns {string} Current text size class
 */
export const useResponsiveText = (sizes = {}) => {
  const defaultSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };
  
  const textSizes = { ...defaultSizes, ...sizes };
  const { current } = useBreakpoint();
  
  return textSizes[current] || textSizes.sm;
};

/**
 * Hook for responsive spacing
 * @param {Object} spacing - Spacing values for different breakpoints
 * @returns {string} Current spacing value
 */
export const useResponsiveSpacing = (spacing = {}) => {
  const defaultSpacing = {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const spacingValues = { ...defaultSpacing, ...spacing };
  const { current } = useBreakpoint();
  
  return spacingValues[current] || spacingValues.sm;
};

/**
 * Hook for responsive grid layout
 * @param {Object} config - Grid configuration
 * @returns {Object} Grid layout properties
 */
export const useResponsiveGrid = (config = {}) => {
  const {
    minItemWidth = 250,
    maxColumns = 4,
    gap = 16
  } = config;
  
  const { width } = useWindowDimensions();
  
  const calculateColumns = () => {
    const availableWidth = width - (gap * 2); // Account for container padding
    const itemsPerRow = Math.floor(availableWidth / (minItemWidth + gap));
    return Math.min(Math.max(itemsPerRow, 1), maxColumns);
  };
  
  return {
    columns: calculateColumns(),
    gridTemplateColumns: `repeat(${calculateColumns()}, 1fr)`,
    gap: `${gap}px`,
    minItemWidth: `${minItemWidth}px`
  };
};

/**
 * Hook for orientation detection
 * @returns {Object} Orientation information
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    typeof window !== 'undefined' && window.screen?.orientation?.type || 'landscape-primary'
  );
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.screen?.orientation?.type || 'landscape-primary');
    };
    
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
      return () => {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      };
    }
  }, []);
  
  const isPortrait = orientation.includes('portrait');
  const isLandscape = orientation.includes('landscape');
  
  return {
    orientation,
    isPortrait,
    isLandscape
  };
};

export default {
  useWindowDimensions,
  useBreakpoint,
  useMediaQuery,
  useDeviceCapabilities,
  useResponsive,
  useResponsiveText,
  useResponsiveSpacing,
  useResponsiveGrid,
  useOrientation
};