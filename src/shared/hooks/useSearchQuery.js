import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Хук для работы с поисковым запросом в URL
 * Возвращает [query, setQuery] — query всегда актуален из URL
 */
const useSearchQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';

  const setQuery = useCallback((newQuery, replace = true) => {
    const params = new URLSearchParams(searchParams);

    if (newQuery && newQuery.trim()) {
      params.set('q', newQuery.trim());
    } else {
      params.delete('q');
    }

    setSearchParams(params, { replace });
  }, [searchParams, setSearchParams]);

  return [query, setQuery];
};

export default useSearchQuery;
