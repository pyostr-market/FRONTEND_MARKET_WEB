import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../../app/store/wishlistStore';
import useCartProducts from '../../shared/hooks/useCartProducts';
import ProductCard from '../../widgets/ProductCard/ProductCard';
import paths from '../../app/router/paths';
import styles from './WishlistPage.module.css';

/**
 * Страница избранного
 */
const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, getTotalCount } = useWishlist();

  const totalCount = getTotalCount();

  /**
   * Обработчик удаления из избранного
   */
  const handleRemoveFromWishlist = useCallback((productId) => {
    removeFromWishlist(productId);
  }, [removeFromWishlist]);

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
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlistHeader}>
          <h1 className={styles.wishlistTitle}>Избранное</h1>
          <div className={styles.wishlistActions}>
            <span className={styles.wishlistCount}>{totalCount} {totalCount === 1 ? 'товар' : totalCount < 5 ? 'товара' : 'товаров'}</span>
            <button
              className={styles.clearWishlistButton}
              onClick={() => clearWishlist()}
            >
              Очистить всё
            </button>
          </div>
        </div>

        <div className={styles.wishlistGrid}>
          {wishlistItems.map((productId) => (
            <div key={productId} className={styles.wishlistItemWrapper}>
              <ProductCardWrapper productId={productId} />

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Обёртка для ProductCard с загрузкой товара
 */
const ProductCardWrapper = ({ productId }) => {
  const { products, loading, error } = useCartProducts([productId]);
  
  const product = products[0];

  if (loading || error || !product) {
    return (
      <div className={styles.productNotFound}>
        {error ? 'Ошибка' : 'Загрузка...'}
      </div>
    );
  }

  return <ProductCard product={product} />;
};

export default WishlistPage;
