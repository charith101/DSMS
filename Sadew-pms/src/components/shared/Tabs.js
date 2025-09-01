import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Tabs component for organizing content into separate views
 * Follows the design system and accessibility best practices
 */
const Tabs = ({
  children,
  defaultActiveTab = 0,
  variant = 'default',
  size = 'base',
  className = '',
  onChange,
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  
  // Filter out only TabPanel children
  const tabPanels = React.Children.toArray(children).filter(
    child => child.type && child.type.displayName === 'TabPanel'
  );
  
  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };
  
  // Build tabs classes
  const getTabsClasses = () => {
    let classes = ['tabs-container'];
    
    // Variant classes
    if (variant !== 'default') {
      classes.push(`tabs-${variant}`);
    }
    
    // Size classes
    if (size !== 'base') {
      classes.push(`tabs-${size}`);
    }
    
    // Custom classes
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <div className={getTabsClasses()} {...props}>
      <div className="tabs-header" role="tablist">
        {tabPanels.map((panel, index) => (
          <button
            key={index}
            role="tab"
            className={`tab ${activeTab === index ? 'tab-active' : ''}`}
            onClick={() => handleTabChange(index)}
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
          >
            {panel.props.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabPanels.map((panel, index) => (
          <div
            key={index}
            role="tabpanel"
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            hidden={activeTab !== index}
            tabIndex={0}
            className="tab-panel"
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultActiveTab: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'pills', 'underline']),
  size: PropTypes.oneOf(['sm', 'base', 'lg']),
  className: PropTypes.string,
  onChange: PropTypes.func
};

/**
 * TabPanel component for individual tab content
 */
const TabPanel = ({ children, label, className = '', ...props }) => (
  <div className={`tab-panel-content ${className}`} {...props}>
    {children}
  </div>
);

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
  className: PropTypes.string
};

TabPanel.displayName = 'TabPanel';

export { Tabs, TabPanel };