import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useCatalog, { clearLegacyCache, clearCatalogCache } from '../../shared/hooks/useCatalog';
import useFilterUrl from '../../shared/hooks/useFilterUrl';
import useCategoryName from '../../shared/hooks/useCategoryName';
import useProductTypeName from '../../shared/hooks/useProductTypeName';
import useCatalogScroll from '../../shared/hooks/useCatalogScroll';
import { FiltersPanel } from '../../widgets/FiltersPanel';
import { FiltersModal } from '../../widgets/FiltersModal';
import { ProductGrid } from '../../widgets/ProductGrid';
import { ProductGridVirtual } from '../../widgets/ProductGridVirtual';
import { SortDropdown } from '../../widgets/SortDropdown';
import { FiSliders } from 'react-icons/fi';
import styles from './CatalogPage.module.css';

// Порог переключения на виртуализацию (количество товаров)
const VIRTUALIZATION_THRESHOLD = 100;

/**
 * Полная очистка всех кэшей каталога
 */
const clearAllCatalogCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('catalogCache_v1_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('[CatalogPage] All catalog cache cleared');
};

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const productType = searchParams.get('product_type');

  // Очистка ВСЕГО кэша при загрузке страницы (после перезагрузки)
  useEffect(() => {
    clearAllCatalogCache();
  }, []);

  // Очистка кэша при размонтировании (уход с страницы каталога)
  useEffect(() => {
    return () => {
      console.log('[CatalogPage] Unmounting, clearing all cache');
      clearAllCatalogCache();
    };
  }, []);

  const { categoryName } = useCategoryName(categoryId);
  const { productTypeName } = useProductTypeName(productType);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);

  const categoryIdNum = categoryId ? parseInt(categoryId, 10) : null;
  const productTypeIdNum = productType ? parseInt(productType, 10) : null;

  const catalogParamsBase = { category_id: categoryIdNum, product_type_id: productTypeIdNum, limit: 12, enableCache: true };

  // Мобильное определение
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Плавающая кнопка фильтров
  useEffect(() => {
    if (!isMobile) return;
    const handleScroll = () => setShowFloatingFilter(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const { filters, filtersLoading, applyFilters: applyCatalogFilters } = useCatalog({
    ...catalogParamsBase,
    sort_type: 'default',
  });

  const { sort_type: urlSortType, filters: urlFilters, updateUrl } = useFilterUrl(filters);
  const [appliedFilters, setAppliedFilters] = useState(urlFilters);
  const prevCategoryKey = useRef(`${categoryId}-${productType}`);

  // Сброс фильтров и кэша при изменении категории или типа товара
  useEffect(() => {
    const currentKey = `${categoryId}-${productType}`;
    if (prevCategoryKey.current !== currentKey) {
      console.log('[CatalogPage] Category/type changed, resetting filters and clearing cache');
      setAppliedFilters({});
      clearCatalogCache(categoryIdNum, productTypeIdNum);
      prevCategoryKey.current = currentKey;
    }
  }, [categoryId, productType, categoryIdNum, productTypeIdNum]);

  const { products, total, loading, loadingMore, error, hasMore, applyFilters: applySortedFilters, resetFilters: sortedResetFilters, loadMore } = useCatalog({
    ...catalogParamsBase,
    sort_type: urlSortType,
    initialFilters: appliedFilters,
  });

  const [selectedFilters, setSelectedFilters] = useState(urlFilters);
  const selectedFiltersRef = useRef(urlFilters);
  useEffect(() => { selectedFiltersRef.current = selectedFilters; }, [selectedFilters]);

  // Хук для управления скроллом
  const { clearScrollState } = useCatalogScroll({
    productsCount: products.length,
    loading,
    categoryId: categoryIdNum?.toString() || 'all',
    productType: productType?.toString() || 'all',
    enableRestore: true,
  });

  const hasChanges = Object.keys(selectedFilters).length > 0;
  const toggleFilterValue = useCallback((name, value) => {
    setSelectedFilters(prev => {
      const current = prev[name] || [];
      const newValues = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      if (newValues.length === 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: newValues };
    });
  }, []);

  const handleApplyFilters = useCallback(() => {
    const filtersToApply = selectedFiltersRef.current;
    setAppliedFilters(filtersToApply);
    applyCatalogFilters(filtersToApply);
    applySortedFilters(filtersToApply);
    updateUrl({ filters: filtersToApply });
    setSelectedFilters(filtersToApply);
    selectedFiltersRef.current = filtersToApply;
    // Очищаем scroll state при применении фильтров
    clearScrollState();
    // Сбрасываем кэш при применении новых фильтров
    clearCatalogCache(categoryIdNum, productTypeIdNum);
    if (isMobile) setIsFiltersModalOpen(false);
  }, [applyCatalogFilters, applySortedFilters, updateUrl, isMobile, clearScrollState, categoryIdNum, productTypeIdNum]);

  const handleResetFilters = useCallback(() => {
    setSelectedFilters({});
    selectedFiltersRef.current = {};
    setAppliedFilters({});

    // Сбрасываем каталоги
    sortedResetFilters();
    applyCatalogFilters({});

    // Очищаем scroll state и кэш при сбросе фильтров
    clearScrollState();
    clearCatalogCache(categoryIdNum, productTypeIdNum);
    updateUrl({ filters: {}, sort_type: 'default' });
  }, [sortedResetFilters, applyCatalogFilters, updateUrl, clearScrollState, categoryIdNum, productTypeIdNum]);

  const handleSortChange = useCallback((value) => {
    console.log('[CatalogPage] handleSortChange:', value);
    // Очищаем scroll state при изменении сортировки
    clearScrollState();
    // Обновляем URL
    updateUrl({ sort_type: value });
    // Сбрасываем кэш каталога для перезагрузки с новой сортировкой
    clearCatalogCache(categoryIdNum, productTypeIdNum);
  }, [updateUrl, clearScrollState, categoryIdNum, productTypeIdNum]);

  const getPageTitle = useCallback(() => {
    if (categoryName) return categoryName;
    if (productTypeName) return productTypeName;
    return 'Все товары';
  }, [categoryName, productTypeName]);

  const handleImageChange = useCallback((productId, imageIndex) => {
    console.log(`Image changed for product ${productId} to index ${imageIndex}`);
  }, []);

  // Временно используем обычный ProductGrid для отладки
  const useVirtualization = false;

  return (
      <div className={styles.catalogPage}>
        {isMobile && (
            <div className={styles.mobileTopBar}>
              <SortDropdown sortBy={urlSortType} onSortChange={handleSortChange} />
              <button className={styles.mobileFiltersBtn} onClick={() => setIsFiltersModalOpen(true)}>
                <FiSliders size={18} /><span>Фильтры</span>
                {hasChanges && <span className={styles.filtersBadge}>{Object.keys(selectedFilters).length}</span>}
              </button>
            </div>
        )}

        <div className={styles.catalogContent}>
          {!isMobile && (
              <FiltersPanel
                  filters={filters}
                  selectedFilters={selectedFilters}
                  onToggleFilter={toggleFilterValue}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                  hasChanges={hasChanges}
                  loading={filtersLoading}
              />
          )}

          <div className={styles.catalogMain}>
            <div className={styles.catalogHeader} data-catalog-grid>
              <div className={styles.catalogInfo}>
                <h1 className={styles.catalogTitle}>{getPageTitle()}</h1>
                {!loading && products.length > 0 && (
                    <span className={styles.productsCount}>
                  {total} {total === 1 ? 'товар' : total < 5 ? 'товара' : 'товаров'}
                </span>
                )}
              </div>
              {!isMobile && <SortDropdown sortBy={urlSortType} onSortChange={handleSortChange} />}
            </div>

            {useVirtualization ? (
              <ProductGridVirtual
                  products={products}
                  loading={loading}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  onImageChange={handleImageChange}
              />
            ) : (
              <ProductGrid
                  products={products}
                  loading={loading}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  onImageChange={handleImageChange}
              />
            )}

            {error && <div className={styles.errorMessage}><p>Ошибка загрузки: {error}</p></div>}
          </div>
        </div>

        {isMobile && showFloatingFilter && (
            <button className={styles.floatingFiltersBtn} onClick={() => setIsFiltersModalOpen(true)}>
              <FiSliders size={20} /><span>Фильтры</span>
              {hasChanges && <span className={styles.floatingBadge}>{Object.keys(selectedFilters).length}</span>}
            </button>
        )}

        {isMobile && (
            <FiltersModal
                isOpen={isFiltersModalOpen}
                onClose={() => setIsFiltersModalOpen(false)}
                filters={filters}
                selectedFilters={selectedFilters}
                onToggleFilter={toggleFilterValue}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                hasChanges={hasChanges}
                loading={filtersLoading}
            />
        )}
      </div>
  );
};

export default CatalogPage;