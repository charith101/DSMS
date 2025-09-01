import axios from 'axios';

/**
 * Base API Client Configuration
 * Provides centralized HTTP client with interceptors for error handling,
 * authentication, and request/response transformation
 */

class ApiClient {
  constructor(config = {}) {
    const {
      baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
      timeout = 10000,
      retryAttempts = 3,
      retryDelay = 1000
    } = config;

    // Create axios instance
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        config.metadata = { startTime: new Date() };

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
            params: config.params
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime;

        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
            status: response.status,
            data: response.data
          });
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ API Error:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
          });
        }

        // Handle specific HTTP status codes
        await this.handleResponseError(error);

        // Retry logic for specific errors
        if (this.shouldRetry(error, originalRequest)) {
          return this.retryRequest(originalRequest);
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Get authentication token from storage
   */
  getAuthToken() {
    try {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token, persistent = false) {
    try {
      if (persistent) {
        localStorage.setItem('authToken', token);
        sessionStorage.removeItem('authToken');
      } else {
        sessionStorage.setItem('authToken', token);
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.warn('Failed to set auth token:', error);
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    try {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    } catch (error) {
      console.warn('Failed to clear auth token:', error);
    }
  }

  /**
   * Handle response errors
   */
  async handleResponseError(error) {
    const status = error.response?.status;

    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        this.clearAuthToken();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;

      case 403:
        // Forbidden - show access denied message
        console.warn('Access denied:', error.response?.data?.message);
        break;

      case 429:
        // Rate limiting - wait before retry
        const retryAfter = error.response?.headers['retry-after'];
        if (retryAfter) {
          await this.delay(parseInt(retryAfter) * 1000);
        }
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - log for monitoring
        console.error('Server error:', {
          status,
          url: error.config?.url,
          message: error.response?.data?.message
        });
        break;

      default:
        // Other errors
        break;
    }
  }

  /**
   * Check if request should be retried
   */
  shouldRetry(error, originalRequest) {
    // Don't retry if already retried maximum times
    if (originalRequest._retryCount >= this.retryAttempts) {
      return false;
    }

    // Don't retry for certain status codes
    const nonRetryableStatus = [400, 401, 403, 404, 422];
    if (error.response && nonRetryableStatus.includes(error.response.status)) {
      return false;
    }

    // Don't retry for non-GET requests with client errors
    if (originalRequest.method !== 'get' && error.response?.status < 500) {
      return false;
    }

    // Retry for network errors or server errors
    return !error.response || error.response.status >= 500;
  }

  /**
   * Retry failed request
   */
  async retryRequest(originalRequest) {
    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

    // Exponential backoff
    const delay = this.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
    await this.delay(delay);

    console.log(`🔄 Retrying request (${originalRequest._retryCount}/${this.retryAttempts}):`, originalRequest.url);

    return this.client.request(originalRequest);
  }

  /**
   * Normalize error response
   */
  normalizeError(error) {
    const normalizedError = {
      message: 'An unexpected error occurred',
      status: null,
      code: null,
      details: null,
      timestamp: new Date().toISOString(),
      url: error.config?.url,
      method: error.config?.method
    };

    if (error.response) {
      // Server responded with error status
      normalizedError.status = error.response.status;
      normalizedError.message = error.response.data?.message || 
                                 error.response.data?.error || 
                                 `Server error: ${error.response.status}`;
      normalizedError.code = error.response.data?.code;
      normalizedError.details = error.response.data?.details;
    } else if (error.request) {
      // Network error
      normalizedError.message = 'Network error: Please check your connection';
      normalizedError.code = 'NETWORK_ERROR';
    } else {
      // Other error
      normalizedError.message = error.message || 'Request failed';
      normalizedError.code = 'REQUEST_ERROR';
    }

    return normalizedError;
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generic request method
   */
  async request(config) {
    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.request({ ...config, method: 'get', url });
  }

  /**
   * POST request
   */
  async post(url, data = null, config = {}) {
    return this.request({ ...config, method: 'post', url, data });
  }

  /**
   * PUT request
   */
  async put(url, data = null, config = {}) {
    return this.request({ ...config, method: 'put', url, data });
  }

  /**
   * PATCH request
   */
  async patch(url, data = null, config = {}) {
    return this.request({ ...config, method: 'patch', url, data });
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.request({ ...config, method: 'delete', url });
  }

  /**
   * Upload file
   */
  async upload(url, file, config = {}) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request({
      ...config,
      method: 'post',
      url,
      data: formData,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Download file
   */
  async download(url, config = {}) {
    return this.request({
      ...config,
      method: 'get',
      url,
      responseType: 'blob'
    });
  }
}

// Create and export singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient };