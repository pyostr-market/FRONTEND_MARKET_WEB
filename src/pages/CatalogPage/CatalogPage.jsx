import { useState, useCallback, useEffect, useRef } from 'react';
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

const SCROLL_KEY = 'catalogScroll_v1';

/**
 * Страница каталога товаров
 */
const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const didRestoreScroll = useRef(false);

  // Параметры из URL
  const categoryId = searchParams.get('category');
  const productType = searchParams.get('product_type');

  // Получаем названия
  const { categoryName } = useCategoryName(categoryId);
  const { productTypeName } = useProductTypeName(productType);

  // Мобильная версия
  const [isMobile, setIsMobile] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);

  // Получаем categoryId как число
  const categoryIdNum = categoryId ? parseInt(categoryId, 10) : null;
  const productTypeIdNum = productType ? parseInt(productType, 10) : null;

  // Базовые параметры каталога
  const catalogParamsBase = {
    category_id: categoryIdNum,
    product_type_id: productTypeIdNum,
    limit: 12,
    enableCache: false, // Отключаем кэш для отладки
  };

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

  // Первый хук для получения фильтров (без сортировки)
  const {
    filters,
    filtersLoading,
    applyFilters: applyCatalogFilters,
    resetFilters: resetCatalogFilters,
  } = useCatalog({ ...catalogParamsBase, sort_type: 'default' });

  // Хук для работы с URL - используем загруженные фильтры для парсинга
  const {
    sort_type: urlSortType,
    filters: urlFilters,
    updateUrl,
  } = useFilterUrl(filters);

  // Используем urlFilters напрямую вместо initialFilters
  // Это обеспечивает синхронизацию фильтров из URL с каталогом
  const [appliedFilters, setAppliedFilters] = useState(urlFilters);
  const prevCategoryKey = useRef(`${categoryId}-${productType}`);
  const prevUrlFiltersRef = useRef(urlFilters);
  
  // Обновляем appliedFilters при изменении категории
  useEffect(() => {
    const currentKey = `${categoryId}-${productType}`;
    if (prevCategoryKey.current !== currentKey) {
      // Категория изменилась - сбрасываем appliedFilters
      setAppliedFilters({});
      prevCategoryKey.current = currentKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, productType]);
  
  // Обновляем appliedFilters из urlFilters при их изменении
  useEffect(() => {
    const prevStr = JSON.stringify(prevUrlFiltersRef.current);
    const currStr = JSON.stringify(urlFilters);
    if (prevStr !== currStr) {
      setAppliedFilters(urlFilters);
      prevUrlFiltersRef.current = urlFilters;
    }
  }, [urlFilters]);

  // Второй хук для получения товаров с сортировкой и применением фильтров из URL
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
  } = useCatalog({ ...catalogParamsBase, sort_type: urlSortType, initialFilters: appliedFilters });

  // Локальное состояние для выбранных фильтров - инициализируем из urlFilters
  const [selectedFilters, setSelectedFilters] = useState(urlFilters);
  const selectedFiltersRef = useRef(urlFilters);

  // Обновляем ref при изменении selectedFilters
  useEffect(() => {
    selectedFiltersRef.current = selectedFilters;
  }, [selectedFilters]);

  // Синхронизация selectedFilters с urlFilters при изменении URL
  // Это нужно для отображения применённых фильтров в чекбоксах
  useEffect(() => {
    const selectedStr = JSON.stringify(selectedFiltersRef.current);
    const urlStr = JSON.stringify(urlFilters);
    
    // Синхронизируем только если фильтры отличаются
    if (selectedStr !== urlStr) {
      setSelectedFilters(urlFilters);
      selectedFiltersRef.current = urlFilters;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlFilters]);

  // Сброс selectedFilters при изменении категории
  useEffect(() => {
    const currentKey = `${categoryId}-${productType}`;
    if (prevCategoryKey.current !== currentKey) {
      // Категория изменилась - сбрасываем selectedFilters
      setSelectedFilters(urlFilters);
      selectedFiltersRef.current = urlFilters;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, productType]);

  // Флаг наличия изменений
  const hasChanges = Object.keys(selectedFilters).length > 0;

  /**
   * Переключение значения фильтра
   */
  const toggleFilterValue = useCallback((filterName, value) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[filterName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      if (newValues.length === 0) {
        const { [filterName]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [filterName]: newValues,
      };
    });
  }, []);

  /**
   * Применение фильтров (кнопка "Показать")
   */
  const handleApplyFilters = useCallback(() => {
    const filtersToApply = selectedFiltersRef.current;
    applyCatalogFilters(filtersToApply);
    applySortedFilters(filtersToApply);
    updateUrl({ filters: filtersToApply });

    // Синхронизируем selectedFilters с применёнными
    setSelectedFilters(filtersToApply);
    selectedFiltersRef.current = filtersToApply;

    if (isMobile) {
      setIsFiltersModalOpen(false);
    }
  }, [applyCatalogFilters, applySortedFilters, isMobile, updateUrl]);

  /**
   * Сброс фильтров
   */
  const handleResetFilters = useCallback(() => {
    console.log('[CatalogPage] handleResetFilters called');
    setSelectedFilters({});
    selectedFiltersRef.current = {};
    
    // Сбрасываем appliedFilters - это вызовет перезагрузку каталога через useEffect в useCatalog
    console.log('[CatalogPage] Setting appliedFilters to empty');
    setAppliedFilters({});
    
    // Обновляем URL
    updateUrl({ filters: {}, sort_type: 'default' });
  }, [updateUrl]);

  /**
   * Изменение сортировки
   */
  const handleSortChange = useCallback((value) => {
    updateUrl({ sort_type: value });
  }, [updateUrl]);

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

  // Восстановление позиции скролла после загрузки товаров
  useEffect(() => {
    if (!loading && products.length > 0 && !didRestoreScroll.current) {
      const savedPosition = sessionStorage.getItem(SCROLL_KEY);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        window.scrollTo(0, position);
        didRestoreScroll.current = true;
        sessionStorage.removeItem(SCROLL_KEY);
      }
    }
  }, [loading, products.length]);

  // Сброс флага восстановления скролла при изменении категории
  useEffect(() => {
    didRestoreScroll.current = false;
  }, [categoryId, productType]);

  // Сохранение позиции скролла при уходе со страницы
  useEffect(() => {
    return () => {
      sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
    };
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
