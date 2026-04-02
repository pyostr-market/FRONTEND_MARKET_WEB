import { useState, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LazyImage from '../LazyImage';
import { DEFAULT_IMAGES } from '../../config/appConfig';
import styles from './ProductSlider.module.css';

/**
 * Слайдер товара с главным изображением и миниатюрами
 * @param {Object} props
 * @param {Array} props.images - Массив изображений товара
 * @param {string} props.alt - Альтернативный текст
 */
const ProductSlider = ({ images = [], alt = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);
  const touchStartXRef = useRef(0);
  const sliderRef = useRef(null);

  // Получаем изображения для отображения
  const displayImages = images.length > 0 ? images : [
    { image_url: DEFAULT_IMAGES.NOT_FOUND, is_main: true }
  ];

  const currentImage = displayImages[currentIndex] || displayImages[0];
  const imageUrl = currentImage?.image_url || DEFAULT_IMAGES.NOT_FOUND;
  const hasMultipleImages = displayImages.length > 1;

  /**
   * Предыдущее изображение
   */
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      return prev === 0 ? displayImages.length - 1 : prev - 1;
    });
  }, [displayImages.length]);

  /**
   * Следующее изображение
   */
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      return prev === displayImages.length - 1 ? 0 : prev + 1;
    });
  }, [displayImages.length]);

  /**
   * Клик по миниатюре
   */
  const handleThumbnailClick = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  /**
   * Свайп для мобильных с плавной прокруткой
   */
  const handleTouchStart = useCallback((e) => {
    touchStartXRef.current = e.touches[0].clientX;
    setTouchOffset(0);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartXRef.current;
    setTouchOffset(diff);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const threshold = 100; // Порог срабатывания свайпа
    
    if (Math.abs(touchOffset) > threshold) {
      if (touchOffset > 0) {
        // Свайп вправо - предыдущее
        handlePrev();
      } else {
        // Свайп влево - следующее
        handleNext();
      }
    }
    
    setTouchOffset(0);
  }, [touchOffset, handlePrev, handleNext]);

  return (
    <div className={styles.sliderContainer} ref={sliderRef}>
      {/* Главное изображение */}
      <div
        className={styles.mainImageWrapper}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={styles.imageTrack}
          style={{
            transform: `translateX(${touchOffset}px)`,
            transition: touchOffset ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <LazyImage
            src={imageUrl}
            alt={alt}
            className={styles.mainImage}
          />
        </div>

        {/* Точки-индикаторы (мобильные) */}
        {hasMultipleImages && (
          <div className={styles.mobileIndicators}>
            {displayImages.map((_, index) => (
              <button
                key={index}
                className={`${styles.mobileIndicator} ${
                  index === currentIndex ? styles.mobileIndicatorActive : ''
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Изображение ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Миниатюры (только десктоп) */}
      {hasMultipleImages && (
        <div className={styles.thumbnailsContainer}>
          {displayImages.map((img, index) => (
            <button
              key={img.upload_id || index}
              className={`${styles.thumbnail} ${
                index === currentIndex ? styles.thumbnailActive : ''
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`Изображение ${index + 1}`}
            >
              <LazyImage
                src={img.image_url}
                alt={`${alt} - изображение ${index + 1}`}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSlider;
