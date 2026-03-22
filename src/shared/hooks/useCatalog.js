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
                      cacheKeyPrefix = CATALOG_CACHE_KEY,
                      initialFilters = {},
                    } = {}) => {
  // Состояние товаров
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

  // Ref для хранения initialFilters
  const initialFiltersRef = useRef(initialFilters);
  useEffect(() => {
    initialFiltersRef.current = initialFilters;
  }, [initialFilters]);

  // Пагинация
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Ref для предотвращения дублирующих запросов
  const loadingRef = useRef(false);

  // Ref для отслеживания, восстановлен ли кэш
  const cacheRestoredRef = useRef(false);

  // Ref для отслеживания предыдущей категории (для сброса кэша)
  const prevCategoryRef = useRef(null);

  // Ref для отслеживания предыдущих initialFilters
  const prevInitialFiltersRef = useRef({});

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
        setLoading(true);

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
    const categoryKey = `${category_id || 'all'}_${product_type_id || 'all'}`;
    const categoryChanged = prevCategoryRef.current !== categoryKey;
    const filtersChanged = JSON.stringify(prevInitialFiltersRef.current) !== JSON.stringify(initialFilters);

    // Сбрасываем флаг при изменении категории
    if (categoryChanged) {
      cacheRestoredRef.current = false;
      prevCategoryRef.current = categoryKey;
    }

    // Сохраняем предыдущие initialFilters
    prevInitialFiltersRef.current = initialFilters;

    // Восстанавливаем из кэша только если категория изменилась
    if (enableCache && categoryChanged) {
      // Ключ кэша включает фильтры для отфильтрованных результатов
      const filtersKey = Object.keys(initialFilters).length > 0 ? '_f_' + JSON.stringify(initialFilters) : '';
      const cacheKey = `${cacheKeyPrefix}_${categoryKey}${filtersKey}`;

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cache = JSON.parse(cached);
          // Проверяем актуальность (не старше 5 минут)
          if (Date.now() - cache.timestamp < 5 * 60 * 1000 && cache.products && cache.products.length > 0) {
            setProducts(cache.products || []);
            setTotal(cache.total || 0);
            setOffset(cache.offset || 0);
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

    // Загружаем с API - используем initialFilters если есть
    // Перезагружаем только если категория изменилась или initialFilters изменились
    if (categoryChanged || filtersChanged) {
      setProducts([]);
      setOffset(0);
      const filtersToUse = Object.keys(initialFilters).length > 0 ? initialFilters : {};
      loadProducts(false, filtersToUse, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category_id, product_type_id, device_type_id, enableCache, cacheKeyPrefix, initialFilters]);

  // Сохранение состояния в кэш при изменениях (только товары, не фильтры!)
  useEffect(() => {
    if (!enableCache || loading || products.length === 0) {
      return;
    }

    // Ключ кэша включает фильтры для отфильтрованных результатов
    const categoryKey = `${category_id || 'all'}_${product_type_id || 'all'}`;
    const filtersKey = Object.keys(initialFilters).length > 0 ? '_f_' + JSON.stringify(initialFilters) : '';
    const cacheKey = `${cacheKeyPrefix}_${categoryKey}${filtersKey}`;

    const state = {
      products,
      total,
      offset,
      sort_type,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save catalog cache:', e);
    }
  }, [enableCache, cacheKeyPrefix, category_id, product_type_id, products, total, offset, sort_type, loading, initialFilters]);

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
export const clearCatalogCache = (category_id, product_type_id, cacheKeyPrefix = CATALOG_CACHE_KEY) => {
  // Очищаем основной кэш и все кэши с фильтрами
  const categoryKey = `${category_id || 'all'}_${product_type_id || 'all'}`;
  const baseCacheKey = `${cacheKeyPrefix}_${categoryKey}`;

  // Перебираем все ключи localStorage и удаляем подходящие
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(baseCacheKey)) {
      localStorage.removeItem(key);
    }
  });
};

export default useCatalog;
