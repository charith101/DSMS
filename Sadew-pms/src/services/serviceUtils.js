/**
 * Service Utilities
 * Common utilities and helpers for API services
 */

/**
 * Create a mock service for development/testing
 * @param {Object} mockData - Mock data responses
 * @param {number} delay - Simulated network delay
 * @returns {Object} Mock service instance
 */
export const createMockService = (mockData = {}, delay = 1000) => {
  const mockDelay = (response) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(response), delay);
    });
  };

  return new Proxy({}, {
    get(target, prop) {
      if (typeof prop === 'string' && mockData[prop]) {
        return async (...args) => {
          console.log(`🎭 Mock API Call: ${prop}`, args);
          const response = typeof mockData[prop] === 'function' 
            ? mockData[prop](...args) 
            : mockData[prop];
          return mockDelay(response);
        };
      }
      return () => Promise.reject(new Error(`Mock method '${prop}' not implemented`));
    }
  });
};

/**
 * Create a cached service wrapper
 * @param {Object} service - Original service instance
 * @param {Object} options - Cache options
 * @returns {Object} Cached service instance
 */
export const createCachedService = (service, options = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100,
    keyGenerator = (...args) => JSON.stringify(args)
  } = options;

  const cache = new Map();
  const timestamps = new Map();

  const isExpired = (key) => {
    const timestamp = timestamps.get(key);
    return !timestamp || (Date.now() - timestamp) > ttl;
  };

  const cleanupExpired = () => {
    for (const [key, timestamp] of timestamps.entries()) {
      if ((Date.now() - timestamp) > ttl) {
        cache.delete(key);
        timestamps.delete(key);
      }
    }
  };

  const limitSize = () => {
    if (cache.size > maxSize) {
      // Remove oldest entries
      const entries = Array.from(timestamps.entries())
        .sort(([,a], [,b]) => a - b)
        .slice(0, cache.size - maxSize);
      
      entries.forEach(([key]) => {
        cache.delete(key);
        timestamps.delete(key);
      });
    }
  };

  return new Proxy(service, {
    get(target, prop) {
      const original = target[prop];
      
      if (typeof original === 'function') {
        return async (...args) => {
          const key = `${prop}:${keyGenerator(...args)}`;
          
          // Check cache
          if (cache.has(key) && !isExpired(key)) {
            console.log(`💾 Cache hit: ${prop}`);
            return cache.get(key);
          }
          
          // Call original method
          console.log(`🌐 Cache miss: ${prop}`);
          try {
            const result = await original.apply(target, args);
            
            // Store in cache
            cache.set(key, result);
            timestamps.set(key, Date.now());
            
            // Cleanup
            cleanupExpired();
            limitSize();
            
            return result;
          } catch (error) {
            // Don't cache errors
            throw error;
          }
        };
      }
      
      return original;
    }
  });
};

/**
 * Create a retry wrapper for service methods
 * @param {Object} service - Original service instance
 * @param {Object} options - Retry options
 * @returns {Object} Service with retry capability
 */
export const createRetryService = (service, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryOn = (error) => error.status >= 500,
    backoffFactor = 2
  } = options;

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  return new Proxy(service, {
    get(target, prop) {
      const original = target[prop];
      
      if (typeof original === 'function') {
        return async (...args) => {
          let lastError;
          
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              return await original.apply(target, args);
            } catch (error) {
              lastError = error;
              
              if (attempt === maxRetries || !retryOn(error)) {
                throw error;
              }
              
              const delayMs = retryDelay * Math.pow(backoffFactor, attempt);
              console.log(`🔄 Retrying ${prop} (${attempt + 1}/${maxRetries}) in ${delayMs}ms`);
              await delay(delayMs);
            }
          }
          
          throw lastError;
        };
      }
      
      return original;
    }
  });
};

/**
 * Create service with request/response logging
 * @param {Object} service - Original service instance
 * @param {Object} options - Logging options
 * @returns {Object} Service with logging
 */
export const createLoggingService = (service, options = {}) => {
  const {
    logRequests = true,
    logResponses = true,
    logErrors = true,
    logger = console
  } = options;

  return new Proxy(service, {
    get(target, prop) {
      const original = target[prop];
      
      if (typeof original === 'function') {
        return async (...args) => {
          const startTime = Date.now();
          
          if (logRequests) {
            logger.log(`📤 Service call: ${prop}`, args);
          }
          
          try {
            const result = await original.apply(target, args);
            const duration = Date.now() - startTime;
            
            if (logResponses) {
              logger.log(`📥 Service response: ${prop} (${duration}ms)`, result);
            }
            
            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            
            if (logErrors) {
              logger.error(`❌ Service error: ${prop} (${duration}ms)`, error);
            }
            
            throw error;
          }
        };
      }
      
      return original;
    }
  });
};

/**
 * Batch multiple requests
 * @param {Array} requests - Array of request functions
 * @param {Object} options - Batch options
 * @returns {Promise<Array>} Array of results
 */
export const batchRequests = async (requests, options = {}) => {
  const {
    concurrency = 5,
    failFast = false
  } = options;

  const results = [];
  const errors = [];

  // Process requests in batches
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    
    try {
      const batchResults = await Promise.allSettled(
        batch.map(request => typeof request === 'function' ? request() : request)
      );
      
      batchResults.forEach((result, index) => {
        const globalIndex = i + index;
        
        if (result.status === 'fulfilled') {
          results[globalIndex] = result.value;
        } else {
          errors[globalIndex] = result.reason;
          
          if (failFast) {
            throw result.reason;
          }
        }
      });
    } catch (error) {
      if (failFast) {
        throw error;
      }
    }
  }

  return {
    results,
    errors,
    hasErrors: errors.some(error => error !== undefined)
  };
};

/**
 * Create a service health checker
 * @param {Object} service - Service instance
 * @param {Object} options - Health check options
 * @returns {Function} Health check function
 */
export const createHealthChecker = (service, options = {}) => {
  const {
    endpoint = 'health',
    timeout = 5000,
    expectedResponse = { status: 'ok' }
  } = options;

  return async () => {
    const startTime = Date.now();
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), timeout);
      });
      
      const healthPromise = service[endpoint] 
        ? service[endpoint]()
        : service.get('/health');
      
      const response = await Promise.race([healthPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;
      
      const isHealthy = JSON.stringify(response) === JSON.stringify(expectedResponse);
      
      return {
        healthy: isHealthy,
        responseTime,
        response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: false,
        responseTime,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };
};

/**
 * Service response validator
 * @param {Object} schema - Expected response schema
 * @returns {Function} Validation middleware
 */
export const createResponseValidator = (schema) => {
  return (service) => {
    return new Proxy(service, {
      get(target, prop) {
        const original = target[prop];
        
        if (typeof original === 'function' && schema[prop]) {
          return async (...args) => {
            const result = await original.apply(target, args);
            
            // Simple schema validation (could be enhanced with a proper validator)
            const validate = (data, expectedSchema) => {
              if (typeof expectedSchema === 'object' && expectedSchema !== null) {
                for (const [key, expectedType] of Object.entries(expectedSchema)) {
                  if (data[key] === undefined) {
                    console.warn(`Missing property: ${key}`);
                  } else if (typeof data[key] !== expectedType && expectedType !== 'any') {
                    console.warn(`Type mismatch for ${key}: expected ${expectedType}, got ${typeof data[key]}`);
                  }
                }
              }
            };
            
            validate(result, schema[prop]);
            return result;
          };
        }
        
        return original;
      }
    });
  };
};

export default {
  createMockService,
  createCachedService,
  createRetryService,
  createLoggingService,
  batchRequests,
  createHealthChecker,
  createResponseValidator
};