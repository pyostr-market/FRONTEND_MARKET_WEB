import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../../app/store/wishlistStore';
import { useCart } from '../../app/store/cartStore';
import useCartProducts from '../../shared/hooks/useCartProducts';
import LazyImage from '../../shared/ui/LazyImage';
import { AddToCart } from '../../features/add-to-cart';
import paths from '../../app/router/paths';
import styles from './WishlistPage.module.css';
import { DEFAULT_IMAGES } from '../../shared/config';

/**
 * Страница избранного
 */
const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, getTotalCount } = useWishlist();
  const { addToCart } = useCart();

  const totalCount = getTotalCount();

  /**
   * Форматирование цены
   */
  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽';
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(numPrice);
  }, []);

  /**
   * Обработчик удаления из избранного
   */
  const handleRemoveFromWishlist = useCallback((productId) => {
    removeFromWishlist(productId);
  }, [removeFromWishlist]);

  /**
   * Обработчик добавления в корзину
   */
  const handleAddToCart = useCallback((productId) => {
    addToCart(productId, 1);
  }, [addToCart]);

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
            <WishlistItem
              key={productId}
              productId={productId}
              formatPrice={formatPrice}
              onRemove={handleRemoveFromWishlist}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Карточка товара в избранном
 */
const WishlistItem = ({ productId, formatPrice, onRemove, onAddToCart }) => {
  const { products, loading, error } = useCartProducts([productId]);
  
  const product = products[0];

  if (loading) {
    return (
      <div className={styles.wishlistItem}>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonPrice}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.wishlistItem}>
        <div className={styles.productNotFound}>Товар недоступен</div>
        <button
          className={styles.removeButton}
          onClick={() => onRemove(productId)}
        >
          Удалить
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wishlistItem}>
      <Link to={`${paths.PRODUCT(product.id)}?category=${product.category?.id || ''}`} className={styles.itemLink}>
        <div className={styles.itemImage}>
          {product.images && product.images.length > 0 ? (
            <LazyImage
              src={product.images[0].image_url}
              alt={product.name}
              className={styles.productImage}
            />
          ) : (
            <img src={DEFAULT_IMAGES.NOT_FOUND} alt="Нет изображения" className={styles.productImage} />
          )}
        </div>
      </Link>

      <div className={styles.itemInfo}>
        <Link to={`${paths.PRODUCT(product.id)}?category=${product.category?.id || ''}`} className={styles.itemNameLink}>
          <h3 className={styles.itemName}>{product.name}</h3>
        </Link>
        
        <div className={styles.itemArticle}>Арт. {product.id}</div>
        
        <div className={styles.itemPrice}>{formatPrice(product.price)}</div>

        <div className={styles.itemActions}>
          <AddToCart productId={product.id} />
        </div>
      </div>

      <button
        className={styles.removeButton}
        onClick={() => onRemove(productId)}
        aria-label="Удалить из избранного"
        title="Удалить из избранного"
      >
        <FiHeart size={18} />
      </button>
    </div>
  );
};

export default WishlistPage;
