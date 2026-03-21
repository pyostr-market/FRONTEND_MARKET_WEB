import { useState, useCallback } from 'react';
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

  // Получаем изображения для отображения
  const displayImages = images.length > 0 ? images : [
    { image_url: DEFAULT_IMAGES.NOT_FOUND, is_main: true }
  ];

  // Находим главное изображение или используем первое
  const mainImageIndex = displayImages.findIndex(img => img.is_main);
  const initialIndex = mainImageIndex >= 0 ? mainImageIndex : 0;

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
   * Клавиатурная навигация
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  }, [handlePrev, handleNext]);

  return (
    <div 
      className={styles.sliderContainer}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Главное изображение */}
      <div className={styles.mainImageWrapper}>
        <LazyImage
          src={imageUrl}
          alt={alt}
          className={styles.mainImage}
        />

        {/* Стрелки навигации */}
        {hasMultipleImages && (
          <>
            <button
              className={`${styles.navButton} ${styles.navButtonLeft}`}
              onClick={handlePrev}
              aria-label="Предыдущее изображение"
            >
              <FiChevronLeft size={24} />
            </button>

            <button
              className={`${styles.navButton} ${styles.navButtonRight}`}
              onClick={handleNext}
              aria-label="Следующее изображение"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Счётчик изображений */}
        {hasMultipleImages && (
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Миниатюры */}
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
