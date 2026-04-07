import { useCallback, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiArrowRight, FiSliders } from 'react-icons/fi';
import { useWishlist } from '../../app/store/wishlistStore';
import useCartProducts from '../../shared/hooks/useCartProducts';
import useWishlistFilters from '../../shared/hooks/useWishlistFilters';
import { FiltersPanel } from '../../widgets/FiltersPanel';
import { FiltersModal } from '../../widgets/FiltersModal';
import { SortDropdown } from '../../widgets/SortDropdown';
import WishlistItem from '../../widgets/WishlistItem/WishlistItem';
import paths from '../../app/router/paths';
import styles from './WishlistPage.module.css';

/**
 * Страница избранного
 */
const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, getTotalCount } = useWishlist();

  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortType, setSortType] = useState('default');

  const totalCount = getTotalCount();

  /**
   * Обработчик удаления из избранного
   */
  const handleRemoveFromWishlist = useCallback((productId) => {
    removeFromWishlist(productId);
  }, [removeFromWishlist]);

  /**
   * Переключение значения фильтра
   */
  const toggleFilterValue = useCallback((name, value) => {
    setSelectedFilters((prev) => {
      const current = prev[name] || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (newValues.length === 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: newValues };
    });
  }, []);

  /**
   * Применение фильтров
   */
  const handleApplyFilters = useCallback(() => {
    setIsFiltersModalOpen(false);
  }, []);

  /**
   * Сброс фильтров
   */
  const handleResetFilters = useCallback(() => {
    setSelectedFilters({});
  }, []);

  /**
   * Изменение сортировки
   */
  const handleSortChange = useCallback((value) => {
    setSortType(value);
  }, []);

  const hasChanges = Object.keys(selectedFilters).length > 0;

  /**
   * Пустое избранное
   */
  if (wishlistItems.length === 0) {
    return (
      <div className={styles.wishlistPage}>
        <div className={styles.emptyWishlist}>
          <div className={styles.emptyWishlistIcon}>
            <FiHeart size={80} />
          </div>
          <h1 className={styles.emptyWishlistTitle}>Список избранного пуст</h1>
          <p className={styles.emptyWishlistText}>
            Добавьте товары в избранное, чтобы быстро находить их здесь
          </p>
          <Link to={paths.CATALOG} className={styles.emptyWishlistButton}>
            Перейти в каталог
            <FiArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wishlistPage}>
      {/* Мобильная панель сверху — только фильтры + счётчик */}
      <div className={styles.mobileTopBar}>
        <span className={styles.mobileCount}>{totalCount} {totalCount === 1 ? 'товар' : totalCount < 5 ? 'товара' : 'товаров'}</span>
        <button className={styles.mobileFiltersBtn} onClick={() => setIsFiltersModalOpen(true)}>
          <FiSliders size={18} />
          <span>Фильтры</span>
          {hasChanges && <span className={styles.filtersBadge}>{Object.keys(selectedFilters).length}</span>}
        </button>
      </div>

      <div className={styles.wishlistContainer}>
        <div className={styles.wishlistContent}>
          {/* Десктопная панель фильтров */}
          <div className={styles.desktopFilters}>
            <WishlistFiltersSidebar selectedFilters={selectedFilters} onToggleFilter={toggleFilterValue} onApply={handleApplyFilters} onReset={handleResetFilters} hasChanges={hasChanges} />
          </div>

          <div className={styles.wishlistMain}>
            {/* Заголовок только для десктопа */}
            <div className={styles.wishlistHeader}>
              <h1 className={styles.wishlistTitle}>Избранное</h1>
              <div className={styles.wishlistActions}>
                <span className={styles.wishlistCount}>
                  {totalCount} {totalCount === 1 ? 'товар' : totalCount < 5 ? 'товара' : 'товаров'}
                </span>
                <SortDropdown sortBy={sortType} onSortChange={handleSortChange} />
                <button className={styles.clearWishlistButton} onClick={() => clearWishlist()}>
                  Очистить всё
                </button>
              </div>
            </div>

            <WishlistGrid
              wishlistItems={wishlistItems}
              selectedFilters={selectedFilters}
              sortType={sortType}
              onRemove={handleRemoveFromWishlist}
            />
          </div>
        </div>
      </div>

      {/* Мобильное модальное окно фильтров */}
      <WishlistFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilterValue}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        hasChanges={hasChanges}
      />
    </div>
  );
};

/**
 * Сайдбар фильтров для десктопной версии
 */
const WishlistFiltersSidebar = ({ selectedFilters, onToggleFilter, onApply, onReset, hasChanges }) => {
  // Загружаем все товары избранного для извлечения фильтров
  const { wishlistItems } = useWishlist();
  const { products } = useCartProducts(wishlistItems);
  const filters = useWishlistFilters(products);

  if (filters.length === 0) return null;

  return (
    <FiltersPanel
      filters={filters}
      selectedFilters={selectedFilters}
      onToggleFilter={onToggleFilter}
      onApply={onApply}
      onReset={onReset}
      hasChanges={hasChanges}
      loading={false}
    />
  );
};

/**
 * Модальное окно фильтров для мобильной версии
 */
const WishlistFiltersModal = ({ isOpen, onClose, selectedFilters, onToggleFilter, onApply, onReset, hasChanges }) => {
  const { wishlistItems } = useWishlist();
  const { products } = useCartProducts(wishlistItems);
  const filters = useWishlistFilters(products);

  return (
    <FiltersModal
      isOpen={isOpen}
      onClose={onClose}
      filters={filters}
      selectedFilters={selectedFilters}
      onToggleFilter={onToggleFilter}
      onApply={onApply}
      onReset={onReset}
      hasChanges={hasChanges}
      loading={false}
    />
  );
};

/**
 * Сетка товаров избранного с фильтрацией и сортировкой
 */
const WishlistGrid = ({ wishlistItems, selectedFilters, sortType, onRemove }) => {
  // Загружаем все товары
  const { products, loading } = useCartProducts(wishlistItems);

  // Применяем фильтры
  const filteredProducts = useMemo(() => {
    if (Object.keys(selectedFilters).length === 0) return products;

    return products.filter((product) => {
      if (!product.attributes) return false;

      // Проверяем каждый фильтр
      return Object.entries(selectedFilters).every(([filterName, filterValues]) => {
        // Ищем атрибут с таким именем и проверяем, есть ли его значение в выбранных
        const attr = product.attributes.find(
          (a) => a.name === filterName && filterValues.includes(a.value)
        );
        return !!attr;
      });
    });
  }, [products, selectedFilters]);

  // Применяем сортировку
  const sortedProducts = useMemo(() => {
    if (sortType === 'default') return filteredProducts;

    const sorted = [...filteredProducts];
    if (sortType === 'price_asc') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortType === 'price_desc') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return sorted;
  }, [filteredProducts, sortType]);

  if (loading) {
    return (
      <div className={styles.wishlistGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonPrice}></div>
            <div className={styles.skeletonName}></div>
          </div>
        ))}
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <div className={styles.emptyFilters}>
        <p>Товары не найдены</p>
        <button className={styles.resetFiltersBtn} onClick={() => window.location.reload()}>
          Сбросить фильтры
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wishlistGrid}>
      {sortedProducts.map((product) => (
        <WishlistItem key={product.id} productId={product.id} />
      ))}
    </div>
  );
};

export default WishlistPage;
