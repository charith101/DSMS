/**
 * Accessibility utilities and constants for WCAG 2.1 AA compliance
 */

// ARIA roles and properties constants
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  MENUBAR: 'menubar',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  ALERT: 'alert',
  STATUS: 'status',
  REGION: 'region',
  BANNER: 'banner',
  MAIN: 'main',
  NAVIGATION: 'navigation',
  CONTENTINFO: 'contentinfo',
  COMPLEMENTARY: 'complementary',
  FORM: 'form',
  SEARCH: 'search',
  APPLICATION: 'application',
  DOCUMENT: 'document',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  ROW: 'row',
  ROWHEADER: 'rowheader',
  COLUMNHEADER: 'columnheader',
  LISTBOX: 'listbox',
  OPTION: 'option',
  COMBOBOX: 'combobox',
  TREE: 'tree',
  TREEITEM: 'treeitem',
  GROUP: 'group'
};

// Keyboard key constants
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
};

// WCAG 2.1 AA color contrast ratios
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5,
  LARGE_TEXT: 3.0,
  NON_TEXT: 3.0
};

// Focus management utilities
export const focusUtils = {
  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {NodeList} Focusable elements
   */
  getFocusableElements(container) {
    const focusableSelectors = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable]:not([contenteditable="false"])'
    ].join(', ');

    return container.querySelectorAll(focusableSelectors);
  },

  /**
   * Move focus to the first focusable element
   * @param {HTMLElement} container - Container element
   */
  focusFirst(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },

  /**
   * Move focus to the last focusable element
   * @param {HTMLElement} container - Container element
   */
  focusLast(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  },

  /**
   * Check if an element is focusable
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} Whether the element is focusable
   */
  isFocusable(element) {
    const focusableSelectors = [
      'a[href]',
      'button',
      'textarea',
      'input:not([type="hidden"])',
      'select',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]:not([contenteditable="false"])'
    ];

    return focusableSelectors.some(selector => element.matches(selector)) &&
           !element.disabled &&
           !element.hidden &&
           element.offsetParent !== null;
  }
};

// Screen reader utilities
export const screenReaderUtils = {
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level ('polite' or 'assertive')
   */
  announce(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Create accessible description for complex UI
   * @param {string} description - Description text
   * @returns {string} Unique ID for the description
   */
  createDescription(description) {
    const id = `desc-${Math.random().toString(36).substr(2, 9)}`;
    const descElement = document.createElement('div');
    descElement.id = id;
    descElement.className = 'sr-only';
    descElement.textContent = description;
    document.body.appendChild(descElement);
    return id;
  }
};

// Color and contrast utilities
export const colorUtils = {
  /**
   * Convert hex color to RGB
   * @param {string} hex - Hex color code
   * @returns {Object} RGB values
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Calculate relative luminance
   * @param {Object} rgb - RGB color object
   * @returns {number} Relative luminance
   */
  getLuminance(rgb) {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} Contrast ratio
   */
  getContrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const lum1 = this.getLuminance(rgb1);
    const lum2 = this.getLuminance(rgb2);
    
    const lightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (lightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG AA standards
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @param {boolean} isLargeText - Whether text is large (18pt+ or 14pt+ bold)
   * @returns {boolean} Whether combination is accessible
   */
  isAccessible(foreground, background, isLargeText = false) {
    const ratio = this.getContrastRatio(foreground, background);
    const requiredRatio = isLargeText ? CONTRAST_RATIOS.LARGE_TEXT : CONTRAST_RATIOS.NORMAL_TEXT;
    return ratio >= requiredRatio;
  }
};

// Semantic HTML utilities
export const semanticUtils = {
  /**
   * Generate accessible heading hierarchy
   * @param {number} level - Heading level (1-6)
   * @param {string} text - Heading text
   * @param {Object} props - Additional props
   * @returns {Object} Heading props
   */
  getHeadingProps(level, text, props = {}) {
    const validLevel = Math.max(1, Math.min(6, level));
    return {
      role: 'heading',
      'aria-level': validLevel,
      ...props,
      children: text
    };
  },

  /**
   * Generate accessible landmark props
   * @param {string} landmark - Landmark type
   * @param {string} label - Accessible label
   * @returns {Object} Landmark props
   */
  getLandmarkProps(landmark, label) {
    const landmarks = {
      banner: { role: 'banner' },
      navigation: { role: 'navigation' },
      main: { role: 'main' },
      complementary: { role: 'complementary' },
      contentinfo: { role: 'contentinfo' },
      search: { role: 'search' },
      form: { role: 'form' },
      region: { role: 'region' }
    };

    const props = landmarks[landmark] || { role: 'region' };
    
    if (label) {
      props['aria-label'] = label;
    }

    return props;
  },

  /**
   * Generate accessible list props
   * @param {string} type - List type ('ordered', 'unordered', 'description')
   * @param {number} itemCount - Number of items
   * @returns {Object} List props
   */
  getListProps(type, itemCount) {
    const props = {
      'aria-label': `List with ${itemCount} items`
    };

    switch (type) {
      case 'ordered':
        props.role = 'list';
        break;
      case 'unordered':
        props.role = 'list';
        break;
      case 'description':
        props.role = 'list';
        break;
      default:
        props.role = 'list';
    }

    return props;
  }
};

// Form accessibility utilities
export const formUtils = {
  /**
   * Generate accessible form field props
   * @param {Object} config - Field configuration
   * @returns {Object} Form field props
   */
  getFieldProps({
    id,
    label,
    required = false,
    error = null,
    description = null,
    type = 'text'
  }) {
    const props = {
      id,
      'aria-required': required,
      'aria-invalid': Boolean(error)
    };

    // Associate with label
    if (label) {
      props['aria-labelledby'] = `${id}-label`;
    }

    // Associate with description and error
    const describedBy = [];
    if (description) {
      describedBy.push(`${id}-description`);
    }
    if (error) {
      describedBy.push(`${id}-error`);
    }
    if (describedBy.length > 0) {
      props['aria-describedby'] = describedBy.join(' ');
    }

    return props;
  },

  /**
   * Generate accessible fieldset props
   * @param {string} legend - Fieldset legend
   * @param {string} description - Optional description
   * @returns {Object} Fieldset props
   */
  getFieldsetProps(legend, description) {
    const props = {
      role: 'group',
      'aria-labelledby': `fieldset-legend-${Math.random().toString(36).substr(2, 9)}`
    };

    if (description) {
      props['aria-describedby'] = `fieldset-desc-${Math.random().toString(36).substr(2, 9)}`;
    }

    return props;
  }
};

// Generate unique IDs for accessibility
export const generateId = (prefix = 'element') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  ARIA_ROLES,
  KEYS,
  CONTRAST_RATIOS,
  focusUtils,
  screenReaderUtils,
  colorUtils,
  semanticUtils,
  formUtils,
  generateId
};