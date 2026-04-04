import { useState, useCallback, useEffect, useMemo } from 'react';
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

  const hasMultipleImages = images.length > 1;

  // При каждом рендере (когда images меняется) — сбрасываем на первое изображение
  const displayImage = useMemo(() => {
    if (!images || images.length === 0) return null;
    if (!hasMultipleImages) {
      const main = images.find((img) => img.is_main);
      return main || images[0];
    }
    return images[currentIndex] || images[0];
  }, [images, currentIndex, hasMultipleImages]);

  const imageUrl = displayImage?.image_url || DEFAULT_IMAGES.NOT_FOUND;

  /**
   * Предыдущее изображение
   */
  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => {
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  }, [images.length]);

  /**
   * Следующее изображение
   */
  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => {
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  }, [images.length]);

  /**
   * Клик по индикатору
   */
  const handleIndicatorClick = useCallback((e, index) => {
    e?.stopPropagation();
    setCurrentIndex(index);
  }, []);

  // Сбрасываем индекс при смене набора изображений
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

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
      {/* Стрелки */}
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
