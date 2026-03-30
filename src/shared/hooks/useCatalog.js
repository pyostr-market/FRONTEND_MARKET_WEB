import { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from '../../entities/product';

const CATALOG_CACHE_KEY = 'catalogCache_v1';

/**
 * Хук для управления состоянием каталога товаров
 * Использует ЕДИНЫЙ кэш, который дополняется при листании
 */
const useCatalog = ({
                      category_id,
                      product_type_id,
                      device_type_id,
                      sort_type = 'default',
                      limit = 12,
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

  // Ref для хранения актуального products.length
  const productsLengthRef = useRef(0);
  useEffect(() => {
    productsLengthRef.current = products.length;
  }, [products.length]);

  // Ref для хранения актуального offset
  const offsetRef = useRef(offset);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

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
          // Используем ref для актуального offset при append
          const currentOffset = isAppend ? offsetRef.current + limit : 0;

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
              // ДОПОЛНЯЕМ существующие товары (единый кэш)
              setProducts((prev) => {
                const newProducts = [...prev, ...items];
                productsLengthRef.current = newProducts.length;
                setHasMore(newProducts.length < totalItems);
                return newProducts;
              });
            } else {
              // Заменяем товары (новый запрос)
              setProducts(items);
              productsLengthRef.current = items.length;
              setOffset(0);
              offsetRef.current = 0;
              setHasMore(items.length < totalItems);
            }

            setTotal(totalItems);

            if (!isAppend) {
              setOffset(currentOffset);
              offsetRef.current = currentOffset;
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
      [category_id, product_type_id, device_type_id, sort_type, limit]
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
   * Загрузка следующей страницы (infinite scroll / единый кэш)
   */
  const loadMore = useCallback(async () => {
    console.log('[useCatalog] loadMore called:', {
      loading: loadingRef.current,
      hasMore,
      offset: offsetRef.current,
      products: productsLengthRef.current
    });

    // Проверяем через ref, чтобы избежать гонки условий
    if (loadingRef.current || !hasMore) {
      console.log('[useCatalog] loadMore skipped');
      return;
    }

    // Устанавливаем флаг загрузки
    loadingRef.current = true;
    setLoadingMore(true);

    try {
      const newOffset = offsetRef.current + limit;
      console.log('[useCatalog] loadMore requesting:', { offset: newOffset, limit });

      setOffset(newOffset);
      offsetRef.current = newOffset;

      // Загружаем товары с новым offset
      const currentOffset = newOffset;
      let filtersToUse = appliedFiltersRef.current;

      const result = await productApi.getProducts({
        category_id,
        product_type_id,
        device_type_id,
        sort_type,
        attributes: filtersToUse,
        limit,
        offset: currentOffset,
        f5: false,
      });

      console.log('[useCatalog] loadMore response:', result);

      if (result.success) {
        const { items, total: totalItems } = result.data;
        console.log('[useCatalog] loadMore items:', items.length, 'total:', totalItems);

        // ДОПОЛНЯЕМ единый кэш новыми товарами
        setProducts((prev) => {
          const newProducts = [...prev, ...items];
          productsLengthRef.current = newProducts.length;
          const moreAvailable = newProducts.length < totalItems;
          console.log('[useCatalog] loadMore new products:', newProducts.length, 'hasMore:', moreAvailable);
          setHasMore(moreAvailable);
          return newProducts;
        });

        setTotal(totalItems);
      } else {
        setError(result.error?.message || 'Ошибка загрузки товаров');
      }
    } catch (err) {
      console.error('Error loading more products:', err);
      setError(err.message || 'Ошибка загрузки товаров');
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [category_id, product_type_id, device_type_id, sort_type, limit, hasMore]);

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
      // ЕДИНЫЙ ключ кэша (без offset!)
      const filtersKey = Object.keys(initialFilters).length > 0 ? '_f_' + JSON.stringify(initialFilters) : '';
      const cacheKey = `${cacheKeyPrefix}_${categoryKey}${filtersKey}`;

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cache = JSON.parse(cached);
          // Проверяем актуальность (не старше 5 минут)
          if (Date.now() - cache.timestamp < 5 * 60 * 1000 && cache.products && cache.products.length > 0) {
            console.log('[useCatalog] Restored from cache:', {
              products: cache.products.length,
              total: cache.total,
              key: cacheKey
            });
            setProducts(cache.products || []);
            setTotal(cache.total || 0);
            setLoading(false);
            // hasMore рассчитываем из восстановленных данных
            setHasMore(cache.products.length < (cache.total || 0));
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

  // Ref для хранения предыдущего состояния для кэша
  const prevCacheStateRef = useRef({ products: 0, total: 0, sort_type: '' });

  // Сохранение состояния в ЕДИНЫЙ кэш при изменениях
  useEffect(() => {
    if (!enableCache || loading || products.length === 0) {
      return;
    }

    // Проверяем, изменились ли данные (защита от множественного сохранения)
    const prev = prevCacheStateRef.current;
    const changed = prev.products !== products.length || 
                    prev.total !== total || 
                    prev.sort_type !== sort_type;

    if (!changed) return;

    // ЕДИНЫЙ ключ кэша (без offset!)
    const categoryKey = `${category_id || 'all'}_${product_type_id || 'all'}`;
    const filtersKey = Object.keys(initialFilters).length > 0 ? '_f_' + JSON.stringify(initialFilters) : '';
    const cacheKey = `${cacheKeyPrefix}_${categoryKey}${filtersKey}`;

    const state = {
      products,
      total,
      // offset НЕ сохраняем - он не нужен для единого кэша
      sort_type,
      timestamp: Date.now(),
    };

    // Обновляем ref
    prevCacheStateRef.current = { products: products.length, total, sort_type };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(state));
      console.log('[useCatalog] Saved to cache:', {
        products: products.length,
        total,
        key: cacheKey
      });
    } catch (e) {
      console.warn('Failed to save catalog cache:', e);
    }
  }, [enableCache, cacheKeyPrefix, category_id, product_type_id, products, total, sort_type, loading, initialFilters]);

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
  // Очищаем ЕДИНЫЙ кэш для категории
  const categoryKey = `${category_id || 'all'}_${product_type_id || 'all'}`;
  const baseCacheKey = `${cacheKeyPrefix}_${categoryKey}`;

  // Перебираем все ключи localStorage и удаляем подходящие (включая кэш с фильтрами)
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(baseCacheKey)) {
      localStorage.removeItem(key);
      console.log('[useCatalog] Cleared cache key:', key);
    }
  });
};

/**
 * Очистка старого кэша marketplace_cache_* для /product
 */
export const clearLegacyCache = () => {
  let count = 0;
  Object.keys(localStorage).forEach((key) => {
    // Удаляем все marketplace_cache для /product
    if (key.startsWith('marketplace_cache_') && key.includes('/product')) {
      localStorage.removeItem(key);
      count++;
    }
  });
  console.log('[useCatalog] Legacy marketplace_cache for /product cleared:', count, 'keys removed');
};

export default useCatalog;
