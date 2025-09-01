import React from 'react';

/**
 * Donut Chart Component - Circular chart for showing data distribution
 */
const DonutChart = ({ 
  data = [], 
  size = 200,
  strokeWidth = 20,
  showCenter = true,
  centerValue,
  centerLabel,
  showLegend = true,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`donut-chart ${className}`} style={{ width: size, height: size }}>
        <div className="donut-center">
          <div className="text-gray-500">No data</div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  let cumulativePercentage = 0;
  
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
    
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage: Math.round(percentage * 10) / 10,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const colors = [
    'var(--primary-color)',
    'var(--success-color)',
    'var(--warning-color)',
    'var(--info-color)',
    'var(--error-color)',
    'var(--purple-400)',
    'var(--blue-400)',
    'var(--green-400)'
  ];

  return (
    <div className={className}>
      <div className="donut-chart" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {segments.map((segment, index) => (
            <circle
              key={index}
              className="donut-segment"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color || colors[index % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              title={`${segment.label}: ${segment.value} (${segment.percentage}%)`}
            />
          ))}
        </svg>
        
        {showCenter && (
          <div className="donut-center">
            <div className="donut-center-value">
              {centerValue || total.toLocaleString()}
            </div>
            {centerLabel && (
              <div className="donut-center-label">
                {centerLabel}
              </div>
            )}
          </div>
        )}
      </div>
      
      {showLegend && (
        <div className="chart-legend">
          {segments.map((segment, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: segment.color || colors[index % colors.length] }}
              />
              <span className="legend-label">{segment.label}</span>
              <span className="legend-value">({segment.percentage}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonutChart;