import { useState, useCallback, useMemo } from 'react';
import { AddToCart } from '../../features/add-to-cart';
import LazyImage from '../../shared/ui/LazyImage';
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

  const images = useMemo(() => product?.images || [], [product?.images]);
  const hasMultipleImages = !imageError && images.length > 1;

  /**
   * Получить URL изображения
   */
  const getImageUrl = useCallback(() => {
    if (imageError || !images.length) return null;

    const mainImage = images.find((img) => img.is_main);
    if (mainImage) return mainImage.image_url;

    return images[currentImageIndex]?.image_url || images[0]?.image_url;
  }, [images, currentImageIndex, imageError]);

  /**
   * Переключение на предыдущее изображение
   */
  const handlePrevImage = useCallback(() => {
    if (!hasMultipleImages) return;

    setCurrentImageIndex((prev) => {
      const newIndex = prev === 0 ? images.length - 1 : prev - 1;
      onImageChange?.(product.id, newIndex);
      return newIndex;
    });
  }, [hasMultipleImages, images.length, onImageChange, product.id]);

  /**
   * Переключение на следующее изображение
   */
  const handleNextImage = useCallback(() => {
    if (!hasMultipleImages) return;

    setCurrentImageIndex((prev) => {
      const newIndex = prev === images.length - 1 ? 0 : prev + 1;
      onImageChange?.(product.id, newIndex);
      return newIndex;
    });
  }, [hasMultipleImages, images.length, onImageChange, product.id]);

  /**
   * Свайп для мобильных
   */
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    e.currentTarget.dataset.startX = touch.clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      const startX = e.currentTarget.dataset.startX;
      if (!startX) return;

      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleNextImage();
        } else {
          handlePrevImage();
        }
      }

      delete e.currentTarget.dataset.startX;
    },
    [handleNextImage, handlePrevImage]
  );

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
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.imageWrapper}>
          <LazyImage
            src={getImageUrl()}
            alt={product?.name || 'Товар'}
            className={styles.productImage}
            observerOptions={{ rootMargin: '200px' }}
            onError={() => setImageError(true)}
          />
        </div>

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
      </div>

      {/* Контент */}
      <div className={styles.productContent}>
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
