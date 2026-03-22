import { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useCatalog from '../../shared/hooks/useCatalog';
import useFilterUrl from '../../shared/hooks/useFilterUrl';
import useCategoryName from '../../shared/hooks/useCategoryName';
import useProductTypeName from '../../shared/hooks/useProductTypeName';
import { FiltersPanel } from '../../widgets/FiltersPanel';
import { FiltersModal } from '../../widgets/FiltersModal';
import { ProductGrid } from '../../widgets/ProductGrid';
import { SortDropdown } from '../../widgets/SortDropdown';
import { FiSliders } from 'react-icons/fi';
import styles from './CatalogPage.module.css';

const SCROLL_KEY = 'catalogScroll_v2';

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const productType = searchParams.get('product_type');
  const didRestoreScroll = useRef(false);

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

  useEffect(() => {
    const currentKey = `${categoryId}-${productType}`;
    if (prevCategoryKey.current !== currentKey) {
      setAppliedFilters({});
      prevCategoryKey.current = currentKey;
    }
  }, [categoryId, productType]);

  const { products, total, loading, loadingMore, error, hasMore, applyFilters: applySortedFilters, resetFilters: sortedResetFilters, loadMore } = useCatalog({
    ...catalogParamsBase,
    sort_type: urlSortType,
    initialFilters: appliedFilters,
  });

  const [selectedFilters, setSelectedFilters] = useState(urlFilters);
  const selectedFiltersRef = useRef(urlFilters);
  useEffect(() => { selectedFiltersRef.current = selectedFilters; }, [selectedFilters]);

  // Сохранение scroll и количества товаров при уходе
  useEffect(() => {
    return () => {
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify({
        scrollPos: window.scrollY,
        productsCount: products.length
      }));
    };
  }, [products.length]);

  // Восстановление scroll
  useLayoutEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (!saved || didRestoreScroll.current) return;

    const { scrollPos, productsCount } = JSON.parse(saved);

    const tryScroll = () => {
      const gridEl = document.querySelector(`.${styles.catalogMain}`);
      if (!gridEl) return;

      const imgs = Array.from(gridEl.querySelectorAll('img'));
      const allLoaded = imgs.every(img => img.complete);

      // Проверяем, что все товары отрендерены и картинки загружены
      if (products.length >= productsCount && allLoaded) {
        window.scrollTo(0, scrollPos);
        sessionStorage.removeItem(SCROLL_KEY);
        didRestoreScroll.current = true;
        return true;
      }
      return false;
    };

    if (!tryScroll()) {
      // Проверяем каждые 50ms
      const interval = setInterval(() => {
        if (tryScroll()) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [products.length]);

  // Сброс флага скролла только при изменении категории (не фильтров!)
  useEffect(() => {
    didRestoreScroll.current = false;
  }, [categoryId, productType]);

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
    if (isMobile) setIsFiltersModalOpen(false);
  }, [applyCatalogFilters, applySortedFilters, updateUrl, isMobile]);

  const handleResetFilters = useCallback(() => {
    setSelectedFilters({});
    selectedFiltersRef.current = {};
    setAppliedFilters({});
    
    // Сбрасываем каталоги
    sortedResetFilters();
    applyCatalogFilters({});
    
    updateUrl({ filters: {}, sort_type: 'default' });
  }, [sortedResetFilters, applyCatalogFilters, updateUrl]);

  const handleSortChange = useCallback((value) => {
    updateUrl({ sort_type: value });
  }, [updateUrl]);

  const getPageTitle = useCallback(() => {
    if (categoryName) return categoryName;
    if (productTypeName) return productTypeName;
    return 'Все товары';
  }, [categoryName, productTypeName]);

  const handleImageChange = useCallback((productId, imageIndex) => {
    console.log(`Image changed for product ${productId} to index ${imageIndex}`);
  }, []);

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
            <div className={styles.catalogHeader}>
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

            <ProductGrid
                products={products}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={loadMore}
                onImageChange={handleImageChange}
            />

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