import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Main layout component that wraps authenticated pages
 * Provides header, sidebar, and main content area
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  return (
    <div className="layout-page">
      {/* Header */}
      <Header 
        user={user}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      {/* Main Content Area */}
      <div className="layout-main">
        {/* Sidebar */}
        <Sidebar 
          user={user}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          currentPath={location.pathname}
        />
        
        {/* Main Content */}
        <main className="layout-content">
          {children}
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;