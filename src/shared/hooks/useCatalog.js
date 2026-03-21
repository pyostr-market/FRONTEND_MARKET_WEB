import { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from '../../entities/product';

const CATALOG_CACHE_KEY = 'catalogCache_v1';

/**
 * Хук для управления состоянием каталога товаров
 */
const useCatalog = ({
  category_id,
  product_type_id,
  device_type_id,
  sort_type = 'default',
  limit = 10,
  enableCache = false,
} = {}) => {
  // Получаем кэш сразу при инициализации
  const cacheKey = `${CATALOG_CACHE_KEY}_${category_id || 'all'}_${product_type_id || 'all'}`;
  const cachedState = useRef(null);
  
  if (enableCache) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const state = JSON.parse(cached);
        // Проверяем актуальность (не старше 5 минут)
        if (Date.now() - state.timestamp < 5 * 60 * 1000) {
          cachedState.current = state;
        }
      }
    } catch (e) {
      console.warn('Failed to read cache:', e);
    }
  }

  // Инициализируем состояние из кэша, если есть
  const initialProducts = cachedState.current?.products || [];
  const initialTotal = cachedState.current?.total || 0;
  const initialOffset = cachedState.current?.offset || 0;
  const initialAppliedFilters = cachedState.current?.appliedFilters || {};

  // Состояние товаров
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Состояние фильтров
  const [filters, setFilters] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Выбранные фильтры (примененные)
  const [appliedFilters, setAppliedFilters] = useState(initialAppliedFilters);

  // Ref для хранения актуальных appliedFilters
  const appliedFiltersRef = useRef(appliedFilters);
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  // Пагинация
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(
    initialProducts.length > 0 ? initialOffset + initialProducts.length < initialTotal : true
  );

  // Ref для предотвращения дублирующих запросов
  const loadingRef = useRef(false);

  // Ref для отслеживания, был ли уже запрос
  const didFetch = useRef(initialProducts.length > 0);

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
    // Если уже есть кэшированные товары - не загружаем заново
    if (didFetch.current) return;

    // Сброс и загрузка товаров при изменении категории/типа
    setProducts([]);
    setOffset(0);
    setAppliedFilters({});
    loadProducts(false, {}, false);
    didFetch.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category_id, product_type_id, device_type_id]);

  useEffect(() => {
    // Если уже есть кэшированные товары - не перезагружаем при изменении сортировки
    if (didFetch.current && initialProducts.length > 0 && sort_type === 'default') return;

    // Перезагрузка при изменении сортировки
    setProducts([]);
    setOffset(0);
    loadProducts(false, {}, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort_type]);

  // Сохранение состояния в кэш при изменениях (только если включен кэш)
  useEffect(() => {
    if (!enableCache || loading || products.length === 0) {
      return;
    }

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
  }, [enableCache, cacheKey, products, total, offset, appliedFilters, sort_type, loading]);

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
 * Получение закэшированного состояния
 */
export const getCachedCatalogState = (category_id, product_type_id) => {
  const cacheKey = `${CATALOG_CACHE_KEY}_${category_id || 'all'}_${product_type_id || 'all'}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const state = JSON.parse(cached);
      // Проверяем актуальность (не старше 5 минут)
      if (Date.now() - state.timestamp < 5 * 60 * 1000) {
        return state;
      }
      localStorage.removeItem(cacheKey);
    }
  } catch (e) {
    console.warn('Failed to get catalog cache:', e);
  }
  return null;
};

/**
 * Очистка кэша
 */
export const clearCatalogCache = (category_id, product_type_id) => {
  const cacheKey = `${CATALOG_CACHE_KEY}_${category_id || 'all'}_${product_type_id || 'all'}`;
  localStorage.removeItem(cacheKey);
};

export default useCatalog;
