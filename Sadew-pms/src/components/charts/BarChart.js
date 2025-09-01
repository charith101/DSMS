import React from 'react';

/**
 * Bar Chart Component - Simple vertical bar chart
 */
const BarChart = ({ 
  data = [], 
  height = 200,
  showValues = true,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`bar-chart ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className={`bar-chart ${className}`} style={{ height }}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 60); // Leave space for labels
        
        return (
          <div key={index} className="bar-chart-item">
            {showValues && (
              <div className="bar-value">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </div>
            )}
            <div 
              className="bar" 
              style={{ 
                height: `${barHeight}px`,
                backgroundColor: item.color || 'var(--primary-color)'
              }}
              title={`${item.label}: ${item.value}`}
            />
            <div className="bar-label">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;