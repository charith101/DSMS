import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '../utils/performance';

/**
 * Performance Monitor Component
 * Displays performance metrics in development mode
 */
const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Get initial metrics after a delay to allow for page load
    const timer = setTimeout(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    }, 2000);

    // Update metrics periodically
    const interval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV === 'production' || !metrics) {
    return null;
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const formatTime = (time) => {
    return time ? `${Math.round(time)}ms` : 'N/A';
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className="performance-monitor">
      {/* Toggle Button */}
      <button
        className="performance-monitor-toggle"
        onClick={toggleVisibility}
        title="Performance Monitor"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ⚡
      </button>

      {/* Metrics Panel */}
      {isVisible && (
        <div
          className="performance-monitor-panel"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '300px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 9998,
            padding: '16px',
            fontSize: '14px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '12px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>
              Performance Metrics
            </h3>
            <button
              onClick={toggleVisibility}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {/* Load Timing */}
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#374151', fontSize: '14px' }}>
                Load Timing
              </h4>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                <div>DOM Content Loaded: {formatTime(metrics.domContentLoaded)}</div>
                <div>Load Complete: {formatTime(metrics.loadComplete)}</div>
              </div>
            </div>

            {/* Paint Timing */}
            <div>
              <h4 style={{ margin: '8px 0 4px 0', color: '#374151', fontSize: '14px' }}>
                Paint Timing
              </h4>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                <div>First Paint: {formatTime(metrics.firstPaint)}</div>
                <div>First Contentful Paint: {formatTime(metrics.firstContentfulPaint)}</div>
              </div>
            </div>

            {/* Memory Usage */}
            {metrics.memory && (
              <div>
                <h4 style={{ margin: '8px 0 4px 0', color: '#374151', fontSize: '14px' }}>
                  Memory Usage
                </h4>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  <div>Used: {formatBytes(metrics.memory.used)}</div>
                  <div>Total: {formatBytes(metrics.memory.total)}</div>
                  <div>Limit: {formatBytes(metrics.memory.limit)}</div>
                  <div style={{ 
                    marginTop: '4px',
                    padding: '4px 8px',
                    backgroundColor: metrics.memory.used / metrics.memory.total > 0.8 
                      ? '#fef2f2' 
                      : '#f0fdf4',
                    color: metrics.memory.used / metrics.memory.total > 0.8 
                      ? '#dc2626' 
                      : '#16a34a',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    Usage: {Math.round((metrics.memory.used / metrics.memory.total) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Performance Score */}
            <div>
              <h4 style={{ margin: '8px 0 4px 0', color: '#374151', fontSize: '14px' }}>
                Performance Score
              </h4>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                {getPerformanceScore(metrics)}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 style={{ margin: '8px 0 4px 0', color: '#374151', fontSize: '14px' }}>
                Recommendations
              </h4>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>
                {getRecommendations(metrics).map((rec, index) => (
                  <div key={index} style={{ 
                    marginBottom: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '4px'
                  }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Calculate a simple performance score based on metrics
 */
const getPerformanceScore = (metrics) => {
  let score = 100;
  
  // Deduct points for slow paint times
  if (metrics.firstContentfulPaint > 2000) score -= 20;
  else if (metrics.firstContentfulPaint > 1000) score -= 10;
  
  // Deduct points for slow load times
  if (metrics.loadComplete > 3000) score -= 20;
  else if (metrics.loadComplete > 1500) score -= 10;
  
  // Deduct points for high memory usage
  if (metrics.memory && metrics.memory.used / metrics.memory.total > 0.8) {
    score -= 15;
  }
  
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#ea580c' : '#dc2626';
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '4px 8px',
      backgroundColor: color + '20',
      color: color,
      borderRadius: '4px',
      fontWeight: 'bold'
    }}>
      <span>{score}/100</span>
      <div style={{
        width: '100px',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

/**
 * Generate performance recommendations based on metrics
 */
const getRecommendations = (metrics) => {
  const recommendations = [];
  
  if (metrics.firstContentfulPaint > 2000) {
    recommendations.push('🎨 Optimize critical CSS and reduce render-blocking resources');
  }
  
  if (metrics.loadComplete > 3000) {
    recommendations.push('⚡ Consider code splitting and lazy loading');
  }
  
  if (metrics.memory && metrics.memory.used / metrics.memory.total > 0.8) {
    recommendations.push('🧠 Optimize memory usage and check for memory leaks');
  }
  
  if (metrics.domContentLoaded > 1500) {
    recommendations.push('📦 Reduce JavaScript bundle size');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Performance looks good!');
  }
  
  return recommendations.slice(0, 3); // Show max 3 recommendations
};

export default PerformanceMonitor;