import { useEffect, useCallback, useRef } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductGrid.module.css';

/**
 * Сетка товаров с infinite scroll
 */
const ProductGrid = ({
  products,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onImageChange,
}) => {
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  /**
   * Intersection Observer для infinite scroll
   */
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, onLoadMore]);

  /**
   * Skeleton для загрузки
   */
  const renderSkeleton = useCallback(() => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className={styles.skeletonCard}>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonPrice}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    ));
  }, []);

  /**
   * Пустое состояние
   */
  if (!loading && products && products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📦</div>
        <h3 className={styles.emptyTitle}>Товары не найдены</h3>
        <p className={styles.emptyText}>
          Попробуйте изменить параметры фильтрации
        </p>
      </div>
    );
  }

  return (
    <div className={styles.productGrid}>
      {/* Товары */}
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onImageChange={onImageChange}
        />
      ))}

      {/* Skeleton при первой загрузке */}
      {loading && renderSkeleton()}

      {/* Индикатор загрузки следующей страницы */}
      {loadingMore && (
        <div className={styles.loadingMore}>
          <div className={styles.spinner}></div>
          <span>Загрузка товаров...</span>
        </div>
      )}

      {/* Конец списка */}
      {!hasMore && products.length > 0 && (
        <div className={styles.endOfList}>
          <span>Все товары показаны</span>
        </div>
      )}

      {/* Ref для observer */}
      <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
    </div>
  );
};

export default ProductGrid;
