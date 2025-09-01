import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from './shared';

/**
 * Header component with user profile and navigation controls
 */
const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useUser();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };
  
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };
  
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'student': 'Student',
      'admin': 'Administrator',
      'financial-manager': 'Financial Manager'
    };
    return roleNames[role] || role;
  };
  
  return (
    <header className="layout-header modern-header">
      <div className="header-container">
        {/* Left side - Logo and menu toggle */}
        <div className="header-left">
          {/* Mobile menu toggle */}
          <button
            onClick={onToggleSidebar}
            className="header-menu-toggle lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          
          {/* Logo */}
          <div className="header-logo">
            <div className="logo-icon">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="logo-text">
              DSMS
            </span>
          </div>
        </div>
        
        {/* Center - Search Bar */}
        <div className="header-center">
          <div className="search-container">
            <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
          </div>
        </div>
        
        {/* Right side - User profile */}
        <div className="header-right">
          {/* Notifications */}
         
          
          {/* Logout Button */}
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="sm"
            title="Sign Out"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Button>
          
          {/* User Profile Dropdown */}
          <div className="user-profile-dropdown">
            <button
              onClick={toggleProfileDropdown}
              className="profile-trigger"
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div className="user-avatar">
                <span className="avatar-text">
                  {user.profile?.name?.charAt(0) || 'U'}
                </span>
              </div>
              
              {/* User info */}
              <div className="user-info">
                <div className="user-name">
                  {user.profile?.name || 'User'}
                </div>
                <div className="user-role">
                  {getRoleDisplayName(user.role)}
                </div>
              </div>
              
              {/* Dropdown arrow */}
              <svg
                className={`dropdown-arrow ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {profileDropdownOpen && (
              <div className="dropdown-menu right-0 mt-2">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-sm font-medium text-primary">
                    {user.profile?.name || 'User'}
                  </div>
                  <div className="text-xs text-secondary">
                    {user.profile?.email || 'user@example.com'}
                  </div>
                </div>
                
                <button className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile Settings
                </button>
                
                <button className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Account Settings
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item text-error-color" onClick={handleLogout}>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;