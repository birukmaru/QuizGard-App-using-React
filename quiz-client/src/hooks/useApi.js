import { useState, useCallback } from 'react';
import api from '@/lib/api';

/**
 * Generic API hook for data fetching
 */
export function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (method, url, params = {}, config = {}) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await api.get(url, { params, ...config });
          break;
        case 'post':
          response = await api.post(url, params, config);
          break;
        case 'put':
          response = await api.put(url, params, config);
          break;
        case 'patch':
          response = await api.patch(url, params, config);
          break;
        case 'delete':
          response = await api.delete(url, { params, ...config });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, params = {}, config = {}) => {
    return execute('GET', url, params, config);
  }, [execute]);

  const post = useCallback((url, data = {}, config = {}) => {
    return execute('POST', url, data, config);
  }, [execute]);

  const put = useCallback((url, data = {}, config = {}) => {
    return execute('PUT', url, data, config);
  }, [execute]);

  const patch = useCallback((url, data = {}, config = {}) => {
    return execute('PATCH', url, data, config);
  }, [execute]);

  const del = useCallback((url, params = {}, config = {}) => {
    return execute('DELETE', url, params, config);
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    get,
    post,
    put,
    patch,
    del,
    execute,
    reset,
    clearError: () => setError(null),
  };
}

/**
 * Hook for paginated data fetching
 */
export function usePaginatedApi() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (fetchFn, pageNum = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFn(pageNum, pageSize);

      if (pageNum === 1) {
        setItems(response.data || response.results || []);
      } else {
        setItems((prev) => [...prev, ...(response.data || response.results || [])]);
      }

      // Update pagination info
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalItems(response.pagination.total || 0);
      } else if (response.totalPages) {
        setTotalPages(response.totalPages);
        setTotalItems(response.total);
      }

      setHasMore(pageNum < (response.pagination?.totalPages || response.totalPages || 1));
      setPage(pageNum);

      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const nextPage = useCallback(async (fetchFn, pageSize = 10) => {
    if (!hasMore || loading) return;
    return fetchPage(fetchFn, page + 1, pageSize);
  }, [fetchPage, page, hasMore, loading]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
    setTotalItems(0);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    items,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    hasMore,
    fetchPage,
    nextPage,
    reset,
    clearError: () => setError(null),
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate() {
  const [optimisticData, setOptimisticData] = useState(null);
  const [pending, setPending] = useState(false);

  const optimisticUpdate = useCallback((updateFn, rollbackFn) => {
    setPending(true);

    // Apply optimistic update
    setOptimisticData((prev) => {
      const optimistic = updateFn(prev);
      return optimistic;
    });

    return {
      confirm: () => setPending(false),
      rollback: (error) => {
        if (rollbackFn) {
          setOptimisticData((prev) => rollbackFn(prev, error));
        }
        setPending(false);
      },
    };
  }, []);

  return {
    optimisticData,
    pending,
    optimisticUpdate,
  };
}

export default useApi;
