import { useState, useCallback, useRef, useEffect, Fragment } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LazyImage from '../LazyImage';
import ProductImageLightbox from '../ProductImageLightbox/ProductImageLightbox';
import { DEFAULT_IMAGES } from '../../config/appConfig';
import styles from './ProductSlider.module.css';

/**
 * Слайдер товара с главным изображением и миниатюрами
 * На десктопе: одно изображение + миниатюры справа
 * На мобильном: CSS Scroll Snap карусель
 * При клике: открывается полноэкранный лайтбокс
 */
const ProductSlider = ({ images = [], alt = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const scrollContainerRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);

  // Получаем изображения для отображения
  const displayImages = images.length > 0 ? images : [
    { image_url: DEFAULT_IMAGES.NOT_FOUND, is_main: true }
  ];

  const hasMultipleImages = displayImages.length > 1;

  /**
   * Открыть лайтбокс
   */
  const openLightbox = useCallback(() => {
    setIsLightboxOpen(true);
  }, []);

  /**
   * Закрыть лайтбокс
   */
  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  /**
   * Обновляем currentIndex при скролле (для мобильной версии)
   */
  const handleScroll = useCallback(() => {
    if (isScrollingProgrammatically.current) return;
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth * 0.85;
    const newIndex = Math.round(scrollLeft / itemWidth);

    if (newIndex >= 0 && newIndex < displayImages.length && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, displayImages.length]);

  /**
   * Переход к конкретному слайду
   */
  const goToSlide = useCallback((index) => {
    if (!scrollContainerRef.current) return;
    
    isScrollingProgrammatically.current = true;
    setCurrentIndex(index);
    
    const container = scrollContainerRef.current;
    const itemWidth = container.offsetWidth * 0.85;
    const targetScroll = index * itemWidth;
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    // Сбрасываем флаг после завершения анимации
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 400);
  }, []);

  /**
   * Предыдущее изображение
   */
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(displayImages.length - 1);
    }
  }, [currentIndex, displayImages.length, goToSlide]);

  /**
   * Следующее изображение
   */
  const handleNext = useCallback(() => {
    if (currentIndex < displayImages.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(0);
    }
  }, [currentIndex, displayImages.length, goToSlide]);

  /**
   * Клик по миниатюре
   */
  const handleThumbnailClick = useCallback((index) => {
    goToSlide(index);
  }, [goToSlide]);

  return (
    <Fragment>
      <div className={styles.sliderContainer}>
      {/* Главное изображение */}
      <div className={styles.mainImageWrapper}>
        {/* Карусель для мобильной версии с CSS Scroll Snap */}
        <div 
          ref={scrollContainerRef}
          className={`${styles.mobileCarousel} ${!hasMultipleImages ? styles.carouselSingle : ''}`}
          onScroll={handleScroll}
        >
          {displayImages.map((img, index) => (
            <div 
              key={img.upload_id || index}
              className={styles.carouselItem}
              onClick={index === currentIndex ? openLightbox : undefined}
            >
              <LazyImage
                src={img.image_url}
                alt={`${alt} - изображение ${index + 1}`}
                className={`${styles.mainImage} ${index === currentIndex ? styles.mainImageClickable : ''}`}
              />
            </div>
          ))}
        </div>

        {/* Кнопки навигации (десктоп) */}
        {/*{hasMultipleImages && (*/}
        {/*  <>*/}
        {/*    <button*/}
        {/*      className={`${styles.navButton} ${styles.navButtonLeft}`}*/}
        {/*      onClick={handlePrev}*/}
        {/*      aria-label="Предыдущее изображение"*/}
        {/*    >*/}
        {/*      <FiChevronLeft size={20} />*/}
        {/*    </button>*/}
        {/*    <button*/}
        {/*      className={`${styles.navButton} ${styles.navButtonRight}`}*/}
        {/*      onClick={handleNext}*/}
        {/*      aria-label="Следующее изображение"*/}
        {/*    >*/}
        {/*      <FiChevronRight size={20} />*/}
        {/*    </button>*/}
        {/*  </>*/}
        {/*)}*/}

        {/* Счётчик изображений (десктоп) */}
        {hasMultipleImages && (
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}

        {/* Точки-индикаторы (мобильные) */}
        {hasMultipleImages && (
          <div className={styles.mobileIndicators}>
            {displayImages.map((_, index) => (
              <button
                key={index}
                className={`${styles.mobileIndicator} ${
                  index === currentIndex ? styles.mobileIndicatorActive : ''
                }`}
                onClick={() => handleThumbnailClick(index)}
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

    {/* Полноэкранный лайтбокс */}
    {isLightboxOpen && (
      <ProductImageLightbox
        images={displayImages}
        initialIndex={currentIndex}
        alt={alt}
        onClose={closeLightbox}
      />
    )}
    </Fragment>
  );
};

export default ProductSlider;
