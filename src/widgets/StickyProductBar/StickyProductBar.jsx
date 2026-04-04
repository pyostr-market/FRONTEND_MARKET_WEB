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
      // Пробуем найти элементы по data-атрибутам или используем fallback
      let triggerElement = document.querySelector('[data-section="description"]');
      
      if (!triggerElement) {
        // Fallback: пробуем найти buyBlock по data-атрибуту
        triggerElement = document.querySelector('[data-section="buy"]');
      }

      if (triggerElement) {
        // Гистерезис: появляется позже при скролле вниз, убирается раньше при скролле вверх
        let currentlyVisible = false;
        let lastScrollY = window.scrollY;
        
        const handleScroll = () => {
          const elementTop = triggerElement.getBoundingClientRect().top;
          const currentScrollY = window.scrollY;
          
          let shouldBeVisible;
          
          if (currentlyVisible) {
            // Плашка уже видна — убираем когда buyBlock возвращается к верху экрана (-100px)
            shouldBeVisible = elementTop < -100;
          } else {
            // Плашка ещё скрыта — показываем только когда buyBlock полностью ушёл за экран (-600px)
            shouldBeVisible = elementTop < -600;
          }
          
          if (shouldBeVisible !== currentlyVisible) {
            currentlyVisible = shouldBeVisible;
          }
          
          lastScrollY = currentScrollY;
          setIsVisible(shouldBeVisible);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        cleanupFn = () => {
          window.removeEventListener('scroll', handleScroll);
        };
      } else {
        // Финальный fallback: используем простой порог скролла с гистерезисом
        let currentlyVisible = false;
        let lastScrollY = window.scrollY;
        
        const handleScroll = () => {
          const currentScrollY = window.scrollY || window.pageYOffset;
          const scrollingDown = currentScrollY > lastScrollY;
          let shouldBeVisible;
          
          if (currentlyVisible) {
            // Уже видно — убираем РАНЬШЕ при скролле ВВЕРХ
            shouldBeVisible = currentScrollY > 200;
          } else {
            // Ещё не видно — показываем ПОЗЖЕ при скролле ВНИЗ
            shouldBeVisible = currentScrollY > 500;
          }
          
          if (shouldBeVisible !== currentlyVisible) {
            currentlyVisible = shouldBeVisible;
          }
          
          lastScrollY = currentScrollY;
          setIsVisible(shouldBeVisible);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        cleanupFn = () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (cleanupFn) cleanupFn();
    };
  }, [product]);

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
