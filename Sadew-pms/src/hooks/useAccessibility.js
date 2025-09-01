import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for managing keyboard navigation in lists/menus
 * @param {Array} items - Array of items to navigate through
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation state and handlers
 */
export const useKeyboardNavigation = (items = [], options = {}) => {
  const {
    initialIndex = -1,
    loop = true,
    onSelect = () => {},
    onEscape = () => {},
    enabled = true
  } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const itemRefs = useRef([]);

  // Update refs array when items change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= items.length) {
            return loop ? 0 : prev;
          }
          return nextIndex;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => {
          const nextIndex = prev - 1;
          if (nextIndex < 0) {
            return loop ? items.length - 1 : prev;
          }
          return nextIndex;
        });
        break;

      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          onSelect(items[activeIndex], activeIndex);
        }
        break;

      case 'Escape':
        event.preventDefault();
        onEscape();
        break;

      default:
        break;
    }
  }, [enabled, items, activeIndex, loop, onSelect, onEscape]);

  // Focus the active item
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].focus();
    }
  }, [activeIndex]);

  const getItemProps = useCallback((index) => ({
    ref: (el) => {
      itemRefs.current[index] = el;
    },
    tabIndex: index === activeIndex ? 0 : -1,
    'aria-selected': index === activeIndex,
    onKeyDown: handleKeyDown
  }), [activeIndex, handleKeyDown]);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps
  };
};

/**
 * Custom hook for managing focus trapping within a container
 * @param {boolean} enabled - Whether focus trap is enabled
 * @returns {Object} Focus trap refs and utilities
 */
export const useFocusTrap = (enabled = true) => {
  const containerRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors));
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (!enabled || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [enabled, getFocusableElements]);

  // Set up focus trap
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0];
      lastFocusableRef.current = focusableElements[focusableElements.length - 1];
      
      // Focus first element
      firstFocusableRef.current.focus();
    }

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown, getFocusableElements]);

  return {
    containerRef,
    firstFocusableRef,
    lastFocusableRef
  };
};

/**
 * Custom hook for managing live regions for screen readers
 * @param {string} polite - Politeness level: 'polite' or 'assertive'
 * @returns {Function} Announce function
 */
export const useLiveRegion = (polite = 'polite') => {
  const liveRegionRef = useRef(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', polite);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('aria-relevant', 'text');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, [polite]);

  const announce = useCallback((message) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  }, []);

  return announce;
};

/**
 * Custom hook for managing unique IDs for accessibility
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const useUniqueId = (prefix = 'id') => {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
};

/**
 * Custom hook for managing reduced motion preferences
 * @returns {boolean} Whether user prefers reduced motion
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event) => setPrefersReducedMotion(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Custom hook for managing skip links
 * @param {Array} skipTargets - Array of skip target objects {id, label}
 * @returns {Object} Skip link utilities
 */
export const useSkipLinks = (skipTargets = []) => {
  const skipToContent = useCallback((targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const SkipLinks = useCallback(() => (
    <div className="skip-links" aria-label="Skip navigation links">
      {skipTargets.map(({ id, label }) => (
        <button
          key={id}
          className="skip-link"
          onClick={() => skipToContent(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              skipToContent(id);
            }
          }}
        >
          Skip to {label}
        </button>
      ))}
    </div>
  ), [skipTargets, skipToContent]);

  return {
    skipToContent,
    SkipLinks
  };
};

export default {
  useKeyboardNavigation,
  useFocusTrap,
  useLiveRegion,
  useUniqueId,
  usePrefersReducedMotion,
  useSkipLinks
};