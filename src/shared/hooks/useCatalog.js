import { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from '../../entities/product';

const CATALOG_CACHE_KEY = 'catalogCache_v1';

const useCatalog = ({
                      category_id,
                      product_type_id,
                      device_type_id,
                      sort_type = 'default',
                      limit = 10,
                      enableCache = false,
                      cacheKeyPrefix = CATALOG_CACHE_KEY,
                      initialFilters = {},
                      preserveProducts = false,
                    } = {}) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const [appliedFilters, setAppliedFilters] = useState({});
  const appliedFiltersRef = useRef(appliedFilters);
  useEffect(() => { appliedFiltersRef.current = appliedFilters; }, [appliedFilters]);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);
  const isFirstLoadRef = useRef(true);
  const prevCategoryRef = useRef(null);
  const prevInitialFiltersRef = useRef({});

  const loadProducts = useCallback(async (isAppend = false, customFilters = null, useCurrentFilters = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!isAppend) setLoading(true);
    else setLoadingMore(true);

    setError(null);

    try {
      const currentOffset = isAppend ? offset + limit : 0;
      setOffset(currentOffset);

      let filtersToUse = {};
      if (customFilters !== null) filtersToUse = customFilters;
      else if (useCurrentFilters) filtersToUse = appliedFiltersRef.current;

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
        setProducts(prev => isAppend ? [...prev, ...items] : items);
        setTotal(totalItems);
        setHasMore(currentOffset + items.length < totalItems);
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
  }, [category_id, product_type_id, device_type_id, sort_type, limit, offset]);

  const loadFilters = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const result = await productApi.getCatalogFilters({ category_id, product_type_id, device_type_id });
      if (result.success) setFilters(result.data?.filters || []);
      else setFilters([]);
    } catch {
      setFilters([]);
    } finally {
      setFiltersLoading(false);
    }
  }, [category_id, product_type_id, device_type_id]);

  const applyFilters = useCallback((newFilters) => {
    setAppliedFilters(newFilters);
    setOffset(0);
    if (!preserveProducts) setProducts([]);
    loadProducts(false, newFilters, false);
  }, [loadProducts, preserveProducts]);

  const resetFilters = useCallback(() => {
    setAppliedFilters({});
    setOffset(0);
    if (!preserveProducts) setProducts([]);
    loadProducts(false, {}, false);
  }, [loadProducts, preserveProducts]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || loadingMore || !hasMore) return;
    loadProducts(true, null, true);
  }, [loadingMore, hasMore, loadProducts]);

  useEffect(() => { loadFilters(); }, [loadFilters]);

  useEffect(() => {
    const categoryKey = `${category_id || 'all'}_${product_type_id || 'all'}`;
    const categoryChanged = prevCategoryRef.current !== categoryKey;
    const filtersChanged = JSON.stringify(prevInitialFiltersRef.current) !== JSON.stringify(initialFilters);

    prevCategoryRef.current = categoryKey;
    prevInitialFiltersRef.current = initialFilters;

    if (isFirstLoadRef.current || categoryChanged || filtersChanged) {
      isFirstLoadRef.current = false;
      if (!preserveProducts) setProducts([]);
      setOffset(0);
      const filtersToUse = Object.keys(initialFilters).length ? initialFilters : {};
      loadProducts(false, filtersToUse, false);
    }
  }, [category_id, product_type_id, device_type_id, initialFilters, preserveProducts, loadProducts]);

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

export const clearCatalogCache = (category_id, product_type_id, cacheKeyPrefix = CATALOG_CACHE_KEY) => {
  const cacheKey = `${cacheKeyPrefix}_${category_id || 'all'}_${product_type_id || 'all'}`;
  localStorage.removeItem(cacheKey);
};

export default useCatalog;