import React from 'react';

/**
 * Progress Ring Component - Circular progress indicator
 */
const ProgressRing = ({ 
  value = 0, 
  max = 100, 
  size = 120, 
  strokeWidth = 8, 
  variant = 'primary',
  label,
  showValue = true,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`progress-ring progress-ring-${variant} ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="progress-ring-center">
        {showValue && (
          <div className="progress-ring-value">
            {Math.round(progress)}%
          </div>
        )}
        {label && (
          <div className="progress-ring-label">
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;