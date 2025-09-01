/**
 * Performance optimization utilities for the Payment Management System
 */

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fonts = [
    '/fonts/Inter-Regular.woff2',
    '/fonts/Inter-Medium.woff2',
    '/fonts/Inter-SemiBold.woff2'
  ];

  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = font;
    document.head.appendChild(link);
  });

  // Preload critical images
  const criticalImages = [
    '/images/logo.svg',
    '/images/payment-icons.svg'
  ];

  criticalImages.forEach(image => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = image;
    document.head.appendChild(link);
  });
};

/**
 * Optimize images using intersection observer for lazy loading
 */
export class ImageOptimizer {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    }
  }

  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Memory management utilities
 */
export const memoryManager = {
  // Cache for storing frequently accessed data
  cache: new Map(),
  maxCacheSize: 100,

  // Set cache with LRU eviction
  set(key, value, ttl = 300000) { // 5 minutes default TTL
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  },

  // Get from cache with TTL check
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  },

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  },

  // Clear all cache
  clear() {
    this.cache.clear();
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Virtual scrolling implementation for large lists
 */
export class VirtualScrollManager {
  constructor(container, itemHeight, totalItems, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.renderItem = renderItem;
    this.scrollTop = 0;
    this.containerHeight = container.clientHeight;
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.init();
  }

  init() {
    this.calculateVisible();
    this.render();
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.calculateVisible();
    this.render();
  }

  calculateVisible() {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const end = Math.min(
      start + Math.ceil(this.containerHeight / this.itemHeight) + 1,
      this.totalItems
    );
    this.visibleStart = start;
    this.visibleEnd = end;
  }

  render() {
    const items = [];
    for (let i = this.visibleStart; i < this.visibleEnd; i++) {
      items.push(this.renderItem(i));
    }

    this.container.innerHTML = `
      <div style="height: ${this.visibleStart * this.itemHeight}px;"></div>
      ${items.join('')}
      <div style="height: ${(this.totalItems - this.visibleEnd) * this.itemHeight}px;"></div>
    `;
  }

  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll);
  }
}

/**
 * Web Worker utilities for offloading heavy computations
 */
export const webWorkerUtils = {
  // Create a worker from a function
  createWorker(fn) {
    const blob = new Blob([`(${fn.toString()})()`], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  },

  // Process data in a web worker
  async processInWorker(data, processingFunction) {
    return new Promise((resolve, reject) => {
      const worker = this.createWorker(() => {
        // Using this context instead of self to avoid ESLint no-restricted-globals error
        // eslint-disable-next-line no-restricted-globals
        self.onmessage = function(e) {
          try {
            // Convert the processing function to string and create a new function
            const fnString = e.data.processingFunction;
            const fn = new Function('return ' + fnString)();
            const result = fn(e.data.data);
            // eslint-disable-next-line no-restricted-globals
            self.postMessage({ success: true, result });
          } catch (error) {
            // eslint-disable-next-line no-restricted-globals
            self.postMessage({ success: false, error: error.message });
          }
        };
      });

      worker.onmessage = (e) => {
        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
        worker.terminate();
      };

      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };

      worker.postMessage({
        data,
        processingFunction: processingFunction.toString()
      });
    });
  }
};

/**
 * Service Worker registration for caching
 */
export const serviceWorkerManager = {
  register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            // Removed console.log
            this.handleUpdate(registration);
          })
          .catch(registrationError => {
            // Removed console.log
          });
      });
    }
  },

  handleUpdate(registration) {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          this.showUpdateNotification();
        }
      });
    });
  },

  showUpdateNotification() {
    // Show update notification to user
    const updateNotification = document.createElement('div');
    updateNotification.className = 'update-notification';
    updateNotification.innerHTML = `
      <div class="update-notification-content">
        <span>New version available!</span>
        <button onclick="window.location.reload()">Update</button>
      </div>
    `;
    document.body.appendChild(updateNotification);
  }
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  // Measure component render time
  measureRender(componentName, renderFunction) {
    const start = performance.now();
    const result = renderFunction();
    const end = performance.now();
    
    // Removed console.log
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMetric('render_time', {
        component: componentName,
        duration: end - start
      });
    }
    
    return result;
  },

  // Measure function execution time
  measureFunction(functionName, fn, ...args) {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    // Removed console.log
    return result;
  },

  // Get current performance metrics
  getMetrics() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        // Navigation timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        
        // Paint timing
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        
        // Memory (if available)
        memory: performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null
      };
    }
    return null;
  },

  // Send metrics to analytics service
  sendMetric(eventName, data) {
    // In a real application, this would send to your analytics service
    // Removed console.log
  }
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimizer = {
  // Dynamically import modules only when needed
  async loadModule(modulePath) {
    try {
      const module = await import(modulePath);
      return module.default || module;
    } catch (error) {
      // Removed console.error
      throw error;
    }
  },

  // Preload modules that will be needed soon
  preloadModule(modulePath) {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = modulePath;
    document.head.appendChild(link);
  }
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  // Register service worker
  serviceWorkerManager.register();
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Start memory cleanup interval
  setInterval(() => {
    memoryManager.cleanup();
  }, 60000); // Clean up every minute
  
  // Log initial performance metrics
  setTimeout(() => {
    const metrics = performanceMonitor.getMetrics();
    // Removed console.log for metrics
  }, 2000);
};