import { useEffect, useState, useCallback } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../../app/store/wishlistStore';
import { AddToCart } from '../../features/add-to-cart';
import styles from './StickyProductBar.module.css';

const StickyProductBar = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isVisible, setIsVisible] = useState(false);

  const inWishlist = product?.id ? isInWishlist(product.id) : false;

  const handleWishlistToggle = useCallback(() => {
    if (product?.id) {
      toggleWishlist(product.id);
    }
  }, [product?.id, toggleWishlist]);

  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  useEffect(() => {
    let cleanupFn = null;
    
    // Даём время DOM обновиться после рендера
    const timer = setTimeout(() => {
      // Находим секцию с описанием по data-атрибуту
      const descriptionSection = document.querySelector('[data-section="description"]');

      if (!descriptionSection) {
        console.warn('[StickyProductBar] descriptionSection not found');
        return;
      }

      const handleScroll = () => {
        const descriptionTop = descriptionSection.getBoundingClientRect().top;
        const shouldBeVisible = descriptionTop < 100;
        // Показываем плашку, когда описание заходит за верх экрана
        setIsVisible(shouldBeVisible);
      };

      // Первичная проверка
      handleScroll();

      window.addEventListener('scroll', handleScroll, { passive: true });

      // Сохраняем cleanup функцию
      cleanupFn = () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cleanupFn) cleanupFn();
    };
  }, [product]); // Добавляем product как зависимость, чтобы пересоздать listener после загрузки продукта

  if (!product) return null;

  const firstImage = product.images?.[0]?.image_url || null;

  return (
    <div className={`${styles.stickyBar} ${isVisible ? styles.stickyBarVisible : ''}`}>
      <div className={styles.stickyBarInner}>
        <div className={styles.left}>
          {firstImage && (
            <div className={styles.thumbnail}>
              <img src={firstImage} alt={product.name} />
            </div>
          )}
          <div className={styles.info}>
            <div className={styles.productName}>{product.name}</div>
            <button
              className={`${styles.wishlistButton} ${inWishlist ? styles.wishlistActive : ''}`}
              onClick={handleWishlistToggle}
              type="button"
            >
              <FiHeart size={16} />
              <span>{inWishlist ? 'В избранном' : 'В избранное'}</span>
            </button>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.price}>{formatPrice(product.price)}</div>
          <AddToCart productId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default StickyProductBar;
