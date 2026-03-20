import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useCatalog from '../../shared/hooks/useCatalog';
import useFilters from '../../shared/hooks/useFilters';
import { FiltersPanel } from '../../widgets/FiltersPanel';
import { FiltersModal } from '../../widgets/FiltersModal';
import { ProductGrid } from '../../widgets/ProductGrid';
import { SortDropdown } from '../../widgets/SortDropdown';
import { FiSliders } from 'react-icons/fi';
import styles from './CatalogPage.module.css';

/**
 * Страница каталога товаров
 * Поддерживает:
 * - Фильтрацию по category и product_type
 * - Фильтры по атрибутам
 * - Infinite scroll
 * - Корзину
 * - Сортировку (UI)
 */
const CatalogPage = () => {
  const [searchParams] = useSearchParams();

  // Параметры из URL
  const categoryId = searchParams.get('category');
  const productType = searchParams.get('product_type');

  // Мобильная версия
  const [isMobile, setIsMobile] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);

  // Сортировка
  const [sortBy, setSortBy] = useState('default');

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
      // Показываем кнопку, когда проскроллили больше 100px
      setShowFloatingFilter(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Хук каталога
  const {
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
  } = useCatalog({
    category_id: categoryId ? parseInt(categoryId, 10) : null,
    product_type_id: productType ? parseInt(productType, 10) : null,
    limit: 12,
  });

  // Хук фильтров
  const {
    selectedFilters,
    hasChanges,
    toggleFilterValue,
    applyFilters: applyLocalFilters,
    resetAll,
  } = useFilters(appliedFilters);

  /**
   * Применение фильтров (кнопка "Показать")
   */
  const handleApplyFilters = useCallback(() => {
    const filtersToApply = applyLocalFilters();
    applyFilters(filtersToApply);

    if (isMobile) {
      setIsFiltersModalOpen(false);
    }
  }, [applyLocalFilters, applyFilters, isMobile]);

  /**
   * Сброс фильтров
   */
  const handleResetFilters = useCallback(() => {
    resetAll();
    resetFilters();
  }, [resetAll, resetFilters]);

  /**
   * Изменение сортировки
   */
  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    // Логика сортировки будет реализована отдельно
    console.log('Sort by:', value);
  }, []);

  /**
   * Заголовок страницы
   */
  const getPageTitle = useCallback(() => {
    if (categoryId) {
      return `Категория ${categoryId}`;
    }
    if (productType) {
      return `Тип товара ${productType}`;
    }
    return 'Все товары';
  }, [categoryId, productType]);

  return (
    <div className={styles.catalogPage}>
      {/* Верхняя панель для мобильных - сортировка и фильтры */}
      {isMobile && (
        <div className={styles.mobileTopBar}>
          <SortDropdown sortBy={sortBy} onSortChange={handleSortChange} />
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
              <SortDropdown sortBy={sortBy} onSortChange={handleSortChange} />
            )}
          </div>

          {/* Сетка товаров */}
          <ProductGrid
            products={products}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />

          {/* Ошибка */}
          {error && (
            <div className={styles.errorMessage}>
              <p>Ошибка загрузки: {error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Плавающая кнопка фильтров для мобильных (появляется при скролле) */}
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
