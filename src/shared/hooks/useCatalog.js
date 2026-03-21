import { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from '../../entities/product';

/**
 * Хук для управления состоянием каталога товаров
 * @param {Object} options
 * @param {string} options.cacheKeyPrefix - Префикс для ключа кэша
 */
const useCatalog = ({
  category_id,
  product_type_id,
  device_type_id,
  sort_type = 'default',
  limit = 10,
  enableCache = false,
  cacheKeyPrefix = 'catalogCache_v1',
} = {}) => {
  // Состояние товаров - всегда пустые изначально
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Состояние фильтров
  const [filters, setFilters] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Выбранные фильтры (примененные)
  const [appliedFilters, setAppliedFilters] = useState({});

  // Ref для хранения актуальных appliedFilters
  const appliedFiltersRef = useRef(appliedFilters);
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  // Пагинация
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Ref для предотвращения дублирующих запросов
  const loadingRef = useRef(false);

  // Ref для отслеживания, был ли уже запрос для текущей категории
  const fetchKeyRef = useRef(`${category_id}-${product_type_id}-${device_type_id}`);
  
  // Обновляем fetchKey при изменении категории
  useEffect(() => {
    const newKey = `${category_id}-${product_type_id}-${device_type_id}`;
    if (fetchKeyRef.current !== newKey) {
      fetchKeyRef.current = newKey;
    }
  }, [category_id, product_type_id, device_type_id]);

  // Ref для отслеживания, восстановлен ли кэш
  const cacheRestoredRef = useRef(false);

  /**
   * Загрузка товаров
   */
  const loadProducts = useCallback(
    async (isAppend = false, customFilters = null, useCurrentFilters = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      if (!isAppend) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const currentOffset = isAppend ? offset + limit : 0;

        // Используем переданные фильтры или текущие из ref
        let filtersToUse;
        if (customFilters !== null) {
          filtersToUse = customFilters;
        } else if (useCurrentFilters) {
          filtersToUse = appliedFiltersRef.current;
        } else {
          filtersToUse = {};
        }

        const result = await productApi.getProducts({
          category_id,
          product_type_id,
          device_type_id,
          sort_type,
          attributes: filtersToUse,
          limit,
          offset: currentOffset,
          f5: !isAppend,
        });

        if (result.success) {
          const { items, total: totalItems } = result.data;

          if (isAppend) {
            setProducts((prev) => [...prev, ...items]);
          } else {
            setProducts(items);
            setOffset(0);
          }

          setTotal(totalItems);
          // Правильный расчет hasMore
          const loadedCount = isAppend ? products.length + items.length : items.length;
          setHasMore(loadedCount < totalItems);

          if (!isAppend) {
            setOffset(currentOffset);
          }
        } else {
          setError(result.error?.message || 'Ошибка загрузки товаров');
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err.message || 'Ошибка загрузки товаров');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category_id, product_type_id, device_type_id, sort_type, limit, offset]
  );

  /**
   * Загрузка фильтров
   */
  const loadFilters = useCallback(async () => {
    setFiltersLoading(true);

    try {
      const result = await productApi.getCatalogFilters({
        category_id,
        product_type_id,
        device_type_id,
      });

      if (result.success) {
        setFilters(result.data?.filters || []);
      } else {
        console.error('Error loading filters:', result.error);
        setFilters([]);
      }
    } catch (err) {
      console.error('Error loading filters:', err);
      setFilters([]);
    } finally {
      setFiltersLoading(false);
    }
  }, [category_id, product_type_id, device_type_id]);

  /**
   * Применение фильтров
   */
  const applyFilters = useCallback(
    (newFilters) => {
      setAppliedFilters(newFilters);
      setOffset(0);
      setProducts([]);

      setTimeout(() => {
        loadProducts(false, newFilters, false);
      }, 0);
    },
    [loadProducts]
  );

  /**
   * Сброс фильтров
   */
  const resetFilters = useCallback(() => {
    setAppliedFilters({});
    setOffset(0);
    setProducts([]);

    setTimeout(() => {
      loadProducts(false, {}, false);
    }, 0);
  }, [loadProducts]);

  /**
   * Загрузка следующей страницы (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (loadingRef.current || loadingMore || !hasMore) return;

    const newOffset = offset + limit;
    setOffset(newOffset);
    await loadProducts(true, null, true);
  }, [loadingMore, hasMore, offset, limit, loadProducts]);

  /**
   * Первичная загрузка
   */
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    // При изменении категории/типа всегда сбрасываем флаг
    cacheRestoredRef.current = false;
    
    // Восстанавливаем из кэша при изменении категории
    if (enableCache) {
      const cacheKey = `${cacheKeyPrefix}_${category_id || 'all'}_${product_type_id || 'all'}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cache = JSON.parse(cached);
          // Проверяем актуальность (не старше 5 минут)
          if (Date.now() - cache.timestamp < 5 * 60 * 1000 && cache.products && cache.products.length > 0) {
            setProducts(cache.products || []);
            setTotal(cache.total || 0);
            setOffset(cache.offset || 0);
            setAppliedFilters(cache.appliedFilters || {});
            appliedFiltersRef.current = cache.appliedFilters || {};
            setLoading(false);
            setHasMore((cache.offset || 0) + (cache.products || []).length < (cache.total || 0));
            cacheRestoredRef.current = true;
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to restore cache:', e);
      }
    }

    // Сброс и загрузка товаров при изменении категории/типа
    setProducts([]);
    setOffset(0);
    setAppliedFilters({});
    loadProducts(false, {}, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category_id, product_type_id, device_type_id, enableCache, cacheKeyPrefix]);

  // Сбрасываем флаг восстановления кэша при размонтировании
  useEffect(() => {
    return () => {
      cacheRestoredRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Перезагрузка при изменении сортировки (только если не default)
    if (sort_type !== 'default') {
      setProducts([]);
      setOffset(0);
      loadProducts(false, {}, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort_type]);

  // Сохранение состояния в кэш при изменениях (только если включен кэш)
  useEffect(() => {
    if (!enableCache || loading || products.length === 0) {
      return;
    }

    const cacheKey = `${cacheKeyPrefix}_${category_id || 'all'}_${product_type_id || 'all'}`;
    const state = {
      products,
      total,
      offset,
      appliedFilters,
      sort_type,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save catalog cache:', e);
    }
  }, [enableCache, cacheKeyPrefix, category_id, product_type_id, products, total, offset, appliedFilters, sort_type, loading]);

  return {
    products,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    filters,
    filtersLoading,
    appliedFilters,
    applyFilters,
    resetFilters,
    loadMore,
    refresh: () => loadProducts(false, null, true),
  };
};

/**
 * Очистка кэша
 */
export const clearCatalogCache = (category_id, product_type_id, cacheKeyPrefix = 'catalogCache_v1') => {
  const cacheKey = `${cacheKeyPrefix}_${category_id || 'all'}_${product_type_id || 'all'}`;
  localStorage.removeItem(cacheKey);
};

/**
 * Очистка всего кэша каталога
 */
export const clearAllCatalogCache = (cacheKeyPrefix = 'catalogCache_v1') => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(cacheKeyPrefix + '_'));
  keys.forEach(k => localStorage.removeItem(k));
};

export default useCatalog;
