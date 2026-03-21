import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useCatalog, { clearCatalogCache, clearAllCatalogCache } from '../../shared/hooks/useCatalog';
import useFilters from '../../shared/hooks/useFilters';
import useFilterUrl from '../../shared/hooks/useFilterUrl';
import useCategoryName from '../../shared/hooks/useCategoryName';
import useProductTypeName from '../../shared/hooks/useProductTypeName';
import { FiltersPanel } from '../../widgets/FiltersPanel';
import { FiltersModal } from '../../widgets/FiltersModal';
import { ProductGrid } from '../../widgets/ProductGrid';
import { SortDropdown } from '../../widgets/SortDropdown';
import { FiSliders } from 'react-icons/fi';
import styles from './CatalogPage.module.css';

const SCROLL_POSITION_KEY = 'catalogScroll_v1';

/**
 * Страница каталога товаров
 */
const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const pageMountedRef = useRef(false);

  // Параметры из URL
  const categoryId = searchParams.get('category');
  const productType = searchParams.get('product_type');
  
  // Ключ для принудительного эффекта при изменении параметров
  const paramsKey = `${categoryId || ''}-${productType || ''}`;

  // Получаем названия
  const { categoryName } = useCategoryName(categoryId);
  const { productTypeName } = useProductTypeName(productType);

  // Отмечаем, что страница смонтировалась
  useEffect(() => {
    pageMountedRef.current = true;
    return () => {
      pageMountedRef.current = false;
    };
  }, []);

  // Очищаем кэш при изменении категории или product_type
  useEffect(() => {
    // Очищаем весь кэш каталога при изменении параметров
    clearAllCatalogCache();
  }, [paramsKey]);

  // Мобильная версия
  const [isMobile, setIsMobile] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);

  // Флаги для восстановления
  const didRestoreScroll = useRef(false);

  // Получаем categoryId как число для кэша
  const categoryIdNum = categoryId ? parseInt(categoryId, 10) : null;
  const productTypeIdNum = productType ? parseInt(productType, 10) : null;

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Отслеживание скролла для плавающей кнопки фильтра
  useEffect(() => {
    if (!isMobile) return;
    const handleScroll = () => {
      setShowFloatingFilter(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Параметры каталога
  const catalogParams = {
    category_id: categoryIdNum,
    product_type_id: productTypeIdNum,
    limit: 12,
    enableCache: true,
  };

  // Первый хук для получения фильтров (без сортировки)
  const {
    filters,
    filtersLoading,
    applyFilters: applyCatalogFilters,
    resetFilters: resetCatalogFilters,
  } = useCatalog({ ...catalogParams, sort_type: 'default' }, paramsKey);

  // Хук для работы с URL (должен быть после filters)
  const {
    sort_type: urlSortType,
    filters: urlFilters,
    updateUrl,
  } = useFilterUrl(filters);

  // Хук фильтров - инициализируем из URL
  const {
    selectedFilters,
    hasChanges,
    toggleFilterValue,
    applyFilters: applyLocalFilters,
    resetAll,
  } = useFilters(urlFilters);

  // Второй хук для получения товаров с сортировкой
  const {
    products,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    applyFilters: applySortedFilters,
    resetFilters: sortedResetFilters,
    loadMore,
  } = useCatalog({ ...catalogParams, sort_type: urlSortType }, paramsKey);

  // Восстановление позиции скролла после загрузки товаров
  useEffect(() => {
    if (!loading && products.length > 0 && !didRestoreScroll.current) {
      const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        window.scrollTo(0, position);
        didRestoreScroll.current = true;
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
      }
    }
  }, [loading, products.length]);

  // Сохранение позиции скролла при уходе со страницы
  useEffect(() => {
    return () => {
      // Сохраняем текущую позицию скролла
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
    };
  }, []);

  /**
   * Применение фильтров (кнопка "Показать")
   */
  const handleApplyFilters = useCallback(() => {
    const filtersToApply = applyLocalFilters();
    applyCatalogFilters(filtersToApply);
    applySortedFilters(filtersToApply);
    updateUrl({ filters: filtersToApply });

    if (isMobile) {
      setIsFiltersModalOpen(false);
    }
  }, [applyLocalFilters, applyCatalogFilters, applySortedFilters, isMobile, updateUrl]);

  /**
   * Сброс фильтров
   */
  const handleResetFilters = useCallback(() => {
    resetAll();
    resetCatalogFilters();
    sortedResetFilters();
    updateUrl({ filters: {}, sort_type: 'default' });
    clearCatalogCache(categoryIdNum, productTypeIdNum);
    didRestoreScroll.current = false;
  }, [resetAll, resetCatalogFilters, sortedResetFilters, updateUrl, categoryIdNum, productTypeIdNum]);

  /**
   * Изменение сортировки
   */
  const handleSortChange = useCallback((value) => {
    updateUrl({ sort_type: value });
    clearCatalogCache(categoryIdNum, productTypeIdNum);
    didRestoreScroll.current = false;
  }, [updateUrl, categoryIdNum, productTypeIdNum]);

  /**
   * Заголовок страницы
   */
  const getPageTitle = useCallback(() => {
    if (categoryName) {
      return categoryName;
    }
    if (productTypeName) {
      return productTypeName;
    }
    return 'Все товары';
  }, [categoryName, productTypeName]);

  /**
   * Обработчик смены изображения
   */
  const handleImageChange = useCallback((productId, imageIndex) => {
    console.log(`Image changed for product ${productId} to index ${imageIndex}`);
  }, []);

  return (
    <div className={styles.catalogPage}>
      {/* Верхняя панель для мобильных - сортировка и фильтры */}
      {isMobile && (
        <div className={styles.mobileTopBar}>
          <SortDropdown sortBy={urlSortType} onSortChange={handleSortChange} />
          <button
            className={styles.mobileFiltersBtn}
            onClick={() => setIsFiltersModalOpen(true)}
          >
            <FiSliders size={18} />
            <span>Фильтры</span>
            {Object.keys(selectedFilters).length > 0 && (
              <span className={styles.filtersBadge}>
                {Object.keys(selectedFilters).length}
              </span>
            )}
          </button>
        </div>
      )}

      <div className={styles.catalogContent}>
        {/* Панель фильтров для десктопа */}
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

        {/* Контент каталога */}
        <div className={styles.catalogMain}>
          {/* Верхняя панель */}
          <div className={styles.catalogHeader}>
            <div className={styles.catalogInfo}>
              <h1 className={styles.catalogTitle}>{getPageTitle()}</h1>
              {!loading && products.length > 0 && (
                <span className={styles.productsCount}>
                  {total} {total === 1 ? 'товар' : total < 5 ? 'товара' : 'товаров'}
                </span>
              )}
            </div>

            {/* Сортировка для десктопа */}
            {!isMobile && (
              <SortDropdown sortBy={urlSortType} onSortChange={handleSortChange} />
            )}
          </div>

          {/* Сетка товаров */}
          <ProductGrid
            products={products}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onImageChange={handleImageChange}
          />

          {/* Ошибка */}
          {error && (
            <div className={styles.errorMessage}>
              <p>Ошибка загрузки: {error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Плавающая кнопка фильтров для мобильных */}
      {isMobile && showFloatingFilter && (
        <button
          className={styles.floatingFiltersBtn}
          onClick={() => setIsFiltersModalOpen(true)}
        >
          <FiSliders size={20} />
          <span>Фильтры</span>
          {Object.keys(selectedFilters).length > 0 && (
            <span className={styles.floatingBadge}>
              {Object.keys(selectedFilters).length}
            </span>
          )}
        </button>
      )}

      {/* Модальное окно фильтров для мобильных */}
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
