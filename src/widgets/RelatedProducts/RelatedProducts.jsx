import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts } from '../../shared/api/catalogApi';
import ProductCard from '../ProductCard/ProductCard';
import styles from './RelatedProducts.module.css';

const ITEMS_PER_PAGE = 21;

/**
 * Блок "Возможно, будет интересно"
 * Подгружает товары из общего каталога постранично при скролле
 */
const RelatedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  
  // Используем ref для предотвращения бесконечного цикла
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);
  const loadProductsRef = useRef(null);

  // Синхронизируем ref с состояниями
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  /**
   * Загрузка товаров
   */
  const loadProducts = useCallback(async (currentOffset) => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    
    try {
      const result = await getProducts({
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
      });

      if (result.success && result.data?.items) {
        const newItems = result.data.items;

        setProducts((prev) => {
          // Фильтруем дубликаты
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueItems = newItems.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueItems];
        });

        // Если товаров меньше, чем запрашивали — значит достигли конца
        if (newItems.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Сохраняем функцию в ref
  useEffect(() => {
    loadProductsRef.current = loadProducts;
  }, [loadProducts]);

  // Начальная загрузка
  useEffect(() => {
    loadProductsRef.current(0);
  }, []);

  /**
   * Observer для бесконечного скролла
   */
  useEffect(() => {
    // Даём время DOM обновиться после первого рендера
    const timer = setTimeout(() => {
      if (!loadMoreRef.current) {
        return;
      }
      
      const options = {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      };

      observerRef.current = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
          const newOffset = offsetRef.current + ITEMS_PER_PAGE;
          offsetRef.current = newOffset;
          loadProductsRef.current(newOffset);
        }
      }, options);

      observerRef.current.observe(loadMoreRef.current);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <div className={styles.relatedProducts}>
      <h2 className={styles.sectionTitle}>Возможно, будет интересно</h2>

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCardWrapper}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Элемент для отслеживания скролла */}
      {hasMore && (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
          {loading && (
            <div className={styles.loadingSpinner} />
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className={styles.endMessage}>
          Все товары показаны
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;
