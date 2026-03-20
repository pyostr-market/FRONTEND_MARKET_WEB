import { useState, useCallback, useMemo } from 'react';
import { AddToCart } from '../../features/add-to-cart';
import LazyImage from '../../shared/ui/LazyImage';
import { DEFAULT_IMAGES } from '../../shared/config/appConfig';
import styles from './ProductCard.module.css';

/**
 * Карточка товара
 * @param {Object} props
 * @param {Object} props.product - Данные товара
 * @param {Function} [props.onImageChange] - Callback при смене изображения
 */
const ProductCard = ({ product, onImageChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);

  const images = useMemo(() => product?.images || [], [product?.images]);
  const hasMultipleImages = !imageError && images.length > 1;

  /**
   * Свайп для мобильных
   */
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchOffset(0);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartX) return;
    
    const touch = e.touches[0];
    const diff = touch.clientX - touchStartX;
    setTouchOffset(diff);
  }, [touchStartX]);

  const handleTouchEnd = useCallback(() => {
    if (!touchOffset) return;

    const threshold = 50;
    
    if (Math.abs(touchOffset) > threshold) {
      setCurrentImageIndex((prev) => {
        if (touchOffset > 0) {
          // Свайп вправо - предыдущее изображение
          return prev === 0 ? images.length - 1 : prev - 1;
        } else {
          // Свайп влево - следующее изображение
          return prev === images.length - 1 ? 0 : prev + 1;
        }
      });
    }

    setTouchStartX(0);
    setTouchOffset(0);
  }, [touchOffset, images.length]);

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

  return (
    <div className={styles.productCard}>
      {/* Изображение с каруселью */}
      <div
        className={styles.imageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.imageWrapper}>
          <div 
            className={styles.carouselTrack} 
            style={{ 
              transform: `translateX(calc(-${currentImageIndex * 100}% + ${touchOffset}px))`,
              transition: touchOffset ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {images.length === 0 || imageError ? (
              // Заглушка если нет изображений
              <div className={styles.carouselSlide}>
                <img
                  src={DEFAULT_IMAGES.NOT_FOUND}
                  alt="Нет изображения"
                  className={styles.productImage}
                />
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
        {/* Индикаторы карусели */}
        {hasMultipleImages && (
          <div className={styles.carouselIndicators}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${
                  index === currentImageIndex ? styles.indicatorActive : ''
                }`}
                onClick={() => {
                  setCurrentImageIndex(index);
                  onImageChange?.(product.id, index);
                }}
                aria-label={`Изображение ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Название */}
        <h3 className={styles.productName}>{product?.name || 'Без названия'}</h3>

        {/* Цена */}
        <div className={styles.productPrice}>{formatPrice(product?.price)}</div>

        {/* Кнопка добавления в корзину */}
        <div className={styles.productActions}>
          <AddToCart productId={product?.id} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
