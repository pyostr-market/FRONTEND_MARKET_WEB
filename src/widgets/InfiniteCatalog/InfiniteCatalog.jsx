import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts } from '../../shared/api/catalogApi';
import ProductCard from '../ProductCard/ProductCard';
import styles from './InfiniteCatalog.module.css';

const ITEMS_PER_PAGE = 21;

/**
 * Блок бесконечного каталога товаров
 * Подгружает товары из общего каталога постранично при скролле
 */
const InfiniteCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  /**
   * Загрузка товаров
   */
  const loadProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await getProducts({
        limit: ITEMS_PER_PAGE,
        offset,
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
    }
  }, [offset, loading, hasMore]);

  /**
   * Инициализация загрузки при появлении в зоне видимости
   */
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      loadProducts();
    }
  }, [initialized, loadProducts]);

  /**
   * Observer для бесконечного скролла
   */
  useEffect(() => {
    if (loading || !hasMore) return;

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        setOffset((prev) => prev + ITEMS_PER_PAGE);
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  /**
   * Загрузка при изменении offset
   */
  useEffect(() => {
    if (offset > 0) {
      loadProducts();
    }
  }, [offset, loadProducts]);

  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <div className={styles.infiniteCatalog}>
      <h2 className={styles.sectionTitle}>Все товары</h2>

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

export default InfiniteCatalog;
