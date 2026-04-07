import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../../app/store/wishlistStore';
import { AddToCart } from '../../features/add-to-cart';
import LazyImage from '../../shared/ui/LazyImage';
import ProductTags from '../../shared/ui/ProductTags/ProductTags';
import paths from '../../app/router/paths';
import styles from './ProductCard.module.css';
import { DEFAULT_IMAGES } from '../../shared/config';

const getRating = () => {
  const stars = (Math.random() * 1.5 + 3.5).toFixed(1);
  const reviews = Math.floor(Math.random() * 50 + 5);
  return { stars, reviews };
};

const SCROLL_KEY = 'catalogScroll_v1';

const ProductCard = ({ product, onImageChange, hideWishlistButton }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);

  const [rating] = useState(() => getRating());
  const { stars, reviews } = rating;

  const images = useMemo(() => product?.images || [], [product?.images]);
  const hasMultipleImages = !imageError && images.length > 1;
  
  const inWishlist = product?.id ? isInWishlist(product.id) : false;

  const productLink = product?.id
      ? `${paths.PRODUCT(product.id)}?category=${product.category?.id || ''}`
      : '#';

  const handleProductLinkClick = useCallback(() => {
    sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
  }, []);

  const handleProductLinkMouseDown = useCallback(() => {
    sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
  }, []);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchOffset(0);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartX) return;
    const touch = e.touches[0];
    setTouchOffset(touch.clientX - touchStartX);
  }, [touchStartX]);

  const handleTouchEnd = useCallback(() => {
    if (!touchOffset) return;
    const threshold = 50;

    if (Math.abs(touchOffset) > threshold) {
      setCurrentImageIndex((prev) => {
        if (touchOffset > 0) return prev === 0 ? images.length - 1 : prev - 1;
        else return prev === images.length - 1 ? 0 : prev + 1;
      });
    }

    setTouchStartX(0);
    setTouchOffset(0);
  }, [touchOffset, images.length]);

  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽';
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(numPrice);
  }, []);

  const handleWishlistToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product?.id) {
      toggleWishlist(product.id);
    }
  }, [product?.id, toggleWishlist]);

  return (
      <div className={styles.productCard}>
        {/* Кнопка избранного */}
        {product?.id && !hideWishlistButton && (
          <button
            className={`${styles.wishlistButton} ${inWishlist ? styles.wishlistActive : ''}`}
            onClick={handleWishlistToggle}
            aria-label={inWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
            type="button"
          >
            <FiHeart size={20} />
          </button>
        )}

        {/* Изображение */}
        <div className={styles.imageContainer}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
          {/* Теги */}
          <ProductTags tags={product?.tags} position="bottom-left" />
          
          <div className={styles.imageWrapper}>
            <div className={styles.carouselTrack}
                 style={{
                   transform: `translateX(calc(-${currentImageIndex * 100}% + ${touchOffset}px))`,
                   transition: touchOffset ? 'none' : 'transform 0.3s ease-out',
                 }}>
              {images.length === 0 || imageError ? (
                  <div className={styles.carouselSlide}>
                    <img src={DEFAULT_IMAGES.NOT_FOUND} alt="Нет изображения" className={styles.productImage} />
                  </div>
              ) : (
                  images.map((img, index) => (
                      <div key={img.upload_id || index} className={styles.carouselSlide}>
                        <LazyImage
                            src={img.image_url}
                            alt={product?.name || 'Товар'}
                            className={styles.productImage}
                            observerOptions={{ rootMargin: '200px' }}
                            onError={() => setImageError(true)}
                        />
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className={styles.productContent}>
          {/* Миниатюрные индикаторы сверху блока */}
          {hasMultipleImages && (
              <div className={styles.carouselIndicatorsTop}>
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.indicatorSmall} ${index === currentImageIndex ? styles.indicatorActiveSmall : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                          onImageChange?.(product.id, index);
                        }}
                        aria-label={`Изображение ${index + 1}`}
                    />
                ))}
              </div>
          )}

          <div className={styles.productPrice}>{formatPrice(product?.price)}</div>

          <Link to={productLink} className={styles.productNameLink}
                onClick={handleProductLinkClick}
                onMouseDown={handleProductLinkMouseDown}>
            <h3 className={styles.productName}>{product?.name || 'Без названия'}</h3>
          </Link>

          <div className={styles.rating}>
            {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>{i < Math.floor(stars) ? '★' : i < stars ? '☆' : '☆'}</span>
            ))}

            <span className={styles.reviewCount}>({reviews})</span>

          </div>

          {/* Кнопка Добавить / счётчик */}
          <div className={styles.productActions}>
            <AddToCart productId={product?.id} />
          </div>
        </div>
      </div>
  );
};

export default ProductCard;