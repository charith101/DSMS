import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useKeyboardNavigation, useFocusTrap } from '../../hooks/useAccessibility';
import { KEYS, ARIA_ROLES } from '../../utils/accessibilityUtils';

/**
 * Accessible Main Navigation Component
 * Implements WCAG 2.1 AA keyboard navigation and screen reader support
 */
const AccessibleNavigation = () => {
  const { user, logout } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  
  // Focus trap for mobile menu
  const { containerRef: mobileMenuContainer } = useFocusTrap(isMobileMenuOpen);
  const { containerRef: userMenuContainer } = useFocusTrap(isUserMenuOpen);
  
  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (!user.isAuthenticated) return [];
    
    switch (user.role) {
      case 'student':
        return [
          { href: '/student', label: 'Dashboard', icon: '🏠' },
          { href: '/student/payments', label: 'Make Payment', icon: '💳' },
          { href: '/student/history', label: 'Payment History', icon: '📋' }
        ];
      case 'admin':
        return [
          { href: '/admin', label: 'Admin Dashboard', icon: '⚙️' },
          { href: '/admin/record-payment', label: 'Record Payment', icon: '✍️' },
          { href: '/admin/invoices', label: 'Manage Invoices', icon: '🧾' }
        ];
      case 'financial-manager':
        return [
          { href: '/financial', label: 'Financial Dashboard', icon: '📊' },
          { href: '/financial/refunds', label: 'Process Refunds', icon: '💰' },
          { href: '/financial/pricing', label: 'Manage Pricing', icon: '🏷️' },
          { href: '/financial/reports', label: 'Generate Reports', icon: '📈' }
        ];
      default:
        return [];
    }
  };
  
  const navigationItems = getNavigationItems();
  const userMenuItems = [
    { label: 'Profile Settings', action: () => console.log('Profile') },
    { label: 'Account Security', action: () => console.log('Security') },
    { label: 'Preferences', action: () => console.log('Preferences') },
    { label: 'Sign Out', action: logout }
  ];
  
  // Keyboard navigation for main nav
  const mainNavigation = useKeyboardNavigation(navigationItems, {
    onSelect: (item) => {
      window.location.href = item.href;
    },
    onEscape: () => setIsMobileMenuOpen(false)
  });
  
  // Keyboard navigation for user menu
  const userMenuNavigation = useKeyboardNavigation(userMenuItems, {
    onSelect: (item) => {
      item.action();
      setIsUserMenuOpen(false);
    },
    onEscape: () => setIsUserMenuOpen(false)
  });
  
  // Close menus on escape or outside click
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === KEYS.ESCAPE) {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Skip link component
  const SkipLink = ({ href, children }) => (
    <a
      href={href}
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      {children}
    </a>
  );




  
  if (!user.isAuthenticated) {
    return (
      <nav 
        role={ARIA_ROLES.BANNER}
        aria-label=\"Main navigation\"
        className=\"bg-white border-b border-gray-200\"
      >
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"flex justify-between items-center h-16\">
            <div className=\"flex items-center\">
              <Link 
                to=\"/\"
                className=\"text-xl font-bold text-primary-color\"
                aria-label=\"Payment Management System - Home\"
              >
                Payment Management System
              </Link>
            </div>
            <Link 
              to=\"/login\"
              className=\"btn btn-primary enhanced-btn\"
              aria-label=\"Sign in to your account\"
            >
              <span className="btn-content">Sign In</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <>
      {/* Skip Links */}
      <div className=\"skip-links\">
        <SkipLink href=\"#main-content\">Skip to main content</SkipLink>
        <SkipLink href=\"#main-navigation\">Skip to navigation</SkipLink>
      </div>
      
      <nav 
        role={ARIA_ROLES.BANNER}
        aria-label=\"Main navigation\"
        className=\"bg-white border-b border-gray-200 sticky top-0 z-40\"
      >
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"flex justify-between items-center h-16\">
            {/* Logo */}
            <div className=\"flex items-center\">
              <Link 
                to=\"/\"
                className=\"text-xl font-bold text-primary-color\"
                aria-label=\"Payment Management System - Home\"
              >
                <span aria-hidden=\"true\">💳</span>
                <span className=\"ml-2\">PMS</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className=\"hidden md:flex md:space-x-1\">
              <ul 
                role={ARIA_ROLES.MENUBAR}
                aria-label=\"Main menu\"
                className=\"flex space-x-1\"
                id=\"main-navigation\"
              >
                {navigationItems.map((item, index) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href} role=\"none\">
                      <Link
                        to={item.href}
                        role={ARIA_ROLES.MENUITEM}
                        aria-current={isActive ? 'page' : undefined}
                        className={`nav-link ${
                          isActive ? 'nav-link-active' : ''
                        }`}
                        {...mainNavigation.getItemProps(index)}
                      >
                        <span aria-hidden=\"true\" className=\"mr-2\">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* User Menu */}
            <div className=\"relative\" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onKeyDown={(e) => {
                  if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
                    e.preventDefault();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }
                }}
                className=\"flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-color rounded-md p-2\"
                aria-expanded={isUserMenuOpen}
                aria-haspopup={ARIA_ROLES.MENU}
                aria-label={`User menu for ${user.name || 'User'}`}
                id=\"user-menu-button\"
              >
                <div className=\"w-8 h-8 bg-primary-color text-white rounded-full flex items-center justify-center\">
                  <span aria-hidden=\"true\">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className=\"hidden md:block\">{user.name || 'User'}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill=\"none\" 
                  viewBox=\"0 0 24 24\" 
                  stroke=\"currentColor\"
                  aria-hidden=\"true\"
                >
                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 9l-7 7-7-7\" />
                </svg>
              </button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  ref={userMenuContainer}
                  role={ARIA_ROLES.MENU}
                  aria-labelledby=\"user-menu-button\"
                  className=\"absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50\"
                >
                  <ul className=\"py-1\" role=\"none\">
                    {userMenuItems.map((item, index) => (
                      <li key={item.label} role=\"none\">
                        <button
                          onClick={() => {
                            item.action();
                            setIsUserMenuOpen(false);
                          }}
                          role={ARIA_ROLES.MENUITEM}
                          className=\"block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none\"
                          {...userMenuNavigation.getItemProps(index)}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className=\"md:hidden\">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className=\"text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-color rounded-md p-2\"
                aria-expanded={isMobileMenuOpen}
                aria-haspopup={ARIA_ROLES.MENU}
                aria-label=\"Toggle mobile menu\"
              >
                <svg 
                  className=\"w-6 h-6\" 
                  fill=\"none\" 
                  viewBox=\"0 0 24 24\" 
                  stroke=\"currentColor\"
                  aria-hidden=\"true\"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
                  ) : (
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M4 6h16M4 12h16M4 18h16\" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div 
              ref={mobileMenuContainer}
              className=\"md:hidden border-t border-gray-200 bg-white\"
              role={ARIA_ROLES.MENU}
              aria-label=\"Mobile navigation menu\"
            >
              <ul className=\"px-2 pt-2 pb-3 space-y-1\" role=\"none\">
                {navigationItems.map((item, index) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href} role=\"none\">
                      <Link
                        to={item.href}
                        role={ARIA_ROLES.MENUITEM}
                        aria-current={isActive ? 'page' : undefined}
                        className={`mobile-nav-link ${
                          isActive ? 'mobile-nav-link-active' : ''
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        {...mainNavigation.getItemProps(index)}
                      >
                        <span aria-hidden=\"true\" className=\"mr-3\">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </nav>
    </> // Fragment closing tag
  );
};

export default AccessibleNavigation;