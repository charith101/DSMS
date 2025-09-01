import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing loading states with async operations
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} Loading state and execution function
 */
export const useAsyncOperation = (asyncFunction, options = {}) => {
  const {
    onSuccess = () => {},
    onError = () => {},
    immediate = false,
    dependencies = []
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const cancelRef = useRef(false);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      cancelRef.current = false;

      const result = await asyncFunction(...args);

      if (!cancelRef.current) {
        setData(result);
        onSuccess(result);
      }

      return result;
    } catch (err) {
      if (!cancelRef.current) {
        setError(err);
        onError(err);
      }
      throw err;
    } finally {
      if (!cancelRef.current) {
        setLoading(false);
      }
    }
  }, [asyncFunction, onSuccess, onError]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    cancelRef.current = false;
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    cancel,
    reset
  };
};

/**
 * Custom hook for managing multiple loading states
 * @param {Object} initialStates - Initial loading states
 * @returns {Object} Loading states and control functions
 */
export const useLoadingStates = (initialStates = {}) => {
  const [loadingStates, setLoadingStates] = useState(initialStates);

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return Boolean(loadingStates[key]);
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const resetAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    resetAll
  };
};

/**
 * Custom hook for debounced loading states
 * @param {boolean} loading - Current loading state
 * @param {number} delay - Delay in milliseconds
 * @returns {boolean} Debounced loading state
 */
export const useDebouncedLoading = (loading, delay = 200) => {
  const [debouncedLoading, setDebouncedLoading] = useState(loading);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoading(loading);
    }, delay);

    return () => clearTimeout(timer);
  }, [loading, delay]);

  return debouncedLoading;
};

/**
 * Custom hook for retry functionality
 * @param {Function} operation - The operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Object} Retry state and control functions
 */
export const useRetry = (operation, maxRetries = 3, retryDelay = 1000) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async (...args) => {
    if (retryCount >= maxRetries) {
      throw new Error(`Max retries (${maxRetries}) exceeded`);
    }

    setIsRetrying(true);
    
    try {
      const result = await operation(...args);
      setRetryCount(0); // Reset on success
      return result;
    } catch (error) {
      setRetryCount(prev => prev + 1);
      
      if (retryCount < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return retry(...args);
      } else {
        throw error;
      }
    } finally {
      setIsRetrying(false);
    }
  }, [operation, retryCount, maxRetries, retryDelay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
    reset
  };
};

/**
 * Custom hook for polling data with loading states
 * @param {Function} fetchFunction - Function to fetch data
 * @param {number} interval - Polling interval in milliseconds
 * @param {Object} options - Configuration options
 * @returns {Object} Polling state and control functions
 */
export const usePolling = (fetchFunction, interval = 5000, options = {}) => {
  const {
    immediate = true,
    enabled = true,
    onError = () => {}
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        onError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction, onError]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop polling based on enabled flag
  useEffect(() => {
    if (enabled) {
      if (immediate) {
        fetchData();
      }
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, immediate, startPolling, stopPolling, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    startPolling,
    stopPolling
  };
};

export default {
  useAsyncOperation,
  useLoadingStates,
  useDebouncedLoading,
  useRetry,
  usePolling
};