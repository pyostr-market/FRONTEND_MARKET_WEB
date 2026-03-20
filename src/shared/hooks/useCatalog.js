import { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from '../../entities/product';

/**
 * Хук для управления состоянием каталога товаров
 * @param {Object} options
 * @param {number} [options.category_id] - ID категории
 * @param {number} [options.product_type_id] - ID типа товара
 * @param {number} [options.device_type_id] - ID типа устройства
 * @param {string} [options.sort_type] - Тип сортировки: default, price_asc, price_desc
 * @param {number} [options.limit=10] - Количество товаров на страницу
 * @returns {Object}
 */
const useCatalog = ({
  category_id,
  product_type_id,
  device_type_id,
  sort_type = 'default',
  limit = 10,
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

  // Пагинация
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Ref для предотвращения дублирующих запросов
  const loadingRef = useRef(false);

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
          setHasMore(items.length > 0 && currentOffset + items.length < totalItems);

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
   * @param {Object} newFilters - { RAM: ["8 GB"], Color: ["Black"] }
   */
  const applyFilters = useCallback(
    (newFilters) => {
      setAppliedFilters(newFilters);
      setOffset(0);
      setProducts([]);

      // Загрузка с новыми фильтрами
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
      // Загружаем с пустыми фильтрами, но с текущей категорией/типом
      loadProducts(false, {}, false);
    }, 0);
  }, [loadProducts]);

  /**
   * Загрузка следующей страницы (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    const newOffset = offset + limit;
    setOffset(newOffset);
    // Загружаем следующую страницу с текущими примененными фильтрами
    await loadProducts(true, null, true);
  }, [loadingMore, hasMore, offset, limit, loadProducts]);

  /**
   * Первичная загрузка
   */
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    // Сброс и загрузка товаров при изменении категории/типа
    // Сбрасываем фильтры при переключении категории
    setProducts([]);
    setOffset(0);
    setAppliedFilters({});
    loadProducts(false, {}, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category_id, product_type_id, device_type_id]);

  useEffect(() => {
    // Перезагрузка при изменении сортировки
    setProducts([]);
    setOffset(0);
    loadProducts(false, {}, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort_type]);

  return {
    // Товары
    products,
    total,
    loading,
    loadingMore,
    error,
    hasMore,

    // Фильтры
    filters,
    filtersLoading,
    appliedFilters,

    // Действия
    applyFilters,
    resetFilters,
    loadMore,
    refresh: () => loadProducts(false, null, true),
  };
};

export default useCatalog;
