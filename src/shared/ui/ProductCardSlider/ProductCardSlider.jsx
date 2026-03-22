import { useState, useCallback, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LazyImage from '../LazyImage/index';
import { DEFAULT_IMAGES } from '../../config/appConfig';
import styles from './ProductCardSlider.module.css';

/**
 * Слайдер изображений для карточки товара
 * @param {Object} props
 * @param {Array} props.images - Массив изображений товара
 * @param {string} props.alt - Альтернативный текст
 */
const ProductCardSlider = ({ images = [], alt = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Получаем главное изображение или первое
  const mainImage = useMemo(() => {
    if (!images || images.length === 0) return null;
    const main = images.find((img) => img.is_main);
    return main || images[0];
  }, [images]);

  const imageUrl = mainImage?.image_url || DEFAULT_IMAGES.NOT_FOUND;

  const hasMultipleImages = images.length > 1;

  /**
   * Предыдущее изображение
   */
  const handlePrev = useCallback((e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => {
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  }, [images.length]);

  /**
   * Следующее изображение
   */
  const handleNext = useCallback((e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => {
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  }, [images.length]);

  /**
   * Клик по индикатору
   */
  const handleIndicatorClick = useCallback((e, index) => {
    e.stopPropagation();
    setCurrentIndex(index);
  }, []);

  // Если нет изображений или одно изображение
  if (!hasMultipleImages) {
    return (
      <div className={styles.sliderContainer}>
        <LazyImage
          src={imageUrl}
          alt={alt}
          className={styles.sliderImage}
        />
      </div>
    );
  }

  return (
    <div className={styles.sliderContainer}>
      {/*/!* Стрелки *!/*/}
      {/*<button*/}
      {/*  className={`${styles.arrow} ${styles.arrowLeft}`}*/}
      {/*  onClick={handlePrev}*/}
      {/*  aria-label="Предыдущее изображение"*/}
      {/*>*/}
      {/*  <FiChevronLeft size={16} />*/}
      {/*</button>*/}

      {/*<button*/}
      {/*  className={`${styles.arrow} ${styles.arrowRight}`}*/}
      {/*  onClick={handleNext}*/}
      {/*  aria-label="Следующее изображение"*/}
      {/*>*/}
      {/*  <FiChevronRight size={16} />*/}
      {/*</button>*/}

      {/* Изображение */}
      <LazyImage
        src={imageUrl}
        alt={alt}
        className={styles.sliderImage}
      />

      {/* Индикаторы */}
      <div className={styles.indicators}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${
              index === currentIndex ? styles.indicatorActive : ''
            }`}
            onClick={(e) => handleIndicatorClick(e, index)}
            aria-label={`Изображение ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCardSlider;
