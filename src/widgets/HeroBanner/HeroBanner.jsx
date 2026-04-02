import { useState, useEffect, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LazyImage from '../../shared/ui/LazyImage';
import styles from './HeroBanner.module.css';

const banners = [
  {
    id: 1,
    image: 'https://cdn1.ozonusercontent.com/s3/sellerassets/ww1450_q80/262ac286-2e0d-11f1-adce-7a7515a0343e.jpeg',
    link: '/catalog?product_type=1',
    // title: 'Новинки 2026',
  },
  {
    id: 2,
    image: 'https://cdn1.ozonusercontent.com/s3/sellerassets/ww1450_q80/6f5abc18-2827-11f1-b262-1a38fcde72a6.jpeg',
    link: '/catalog?sale=true',
    // title: 'Скидки до 50%',
  },
  {
    id: 3,
    image: 'https://cdn1.ozonusercontent.com/s3/sellerassets/ww1450_q80/aa5cd75e-278d-11f1-9ae4-1ec772ae998e.jpeg',
    link: '/catalog?delivery=free',
    // title: 'Бесплатная доставка',
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);
  const autoplayRef = useRef(null);

  /**
   * Автоматическое переключение слайдов
   */
  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, []);

  /**
   * Переход к слайду
   */
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  /**
   * Прокрутка влево
   */
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  /**
   * Прокрутка вправо
   */
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, []);

  /**
   * Touch события для мобильных
   */
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
    // Останавливаем autoplay при касании
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    const currentX = e.touches[0].clientX;
    setTouchOffset(currentX - touchStartX);
  }, [touchStartX]);

  const handleTouchEnd = useCallback(() => {
    const threshold = 50;
    
    if (touchOffset > threshold) {
      prevSlide();
    } else if (touchOffset < -threshold) {
      nextSlide();
    }
    
    setTouchOffset(0);
    
    // Возобновляем autoplay
    autoplayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
  }, [touchOffset, prevSlide, nextSlide]);

  return (
    <div className={styles.heroBanner}>
      <div className={styles.sliderContainer}>
        {/* Стрелки */}
        <button
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={prevSlide}
          aria-label="Предыдущий слайд"
          type="button"
        >
          <FiChevronLeft size={24} />
        </button>

        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={nextSlide}
          aria-label="Следующий слайд"
          type="button"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Слайды */}
        <div
          className={styles.slidesWrapper}
          style={{
            transform: `translateX(calc(-${currentSlide * 100}% + ${touchOffset}px))`,
            transition: touchOffset ? 'none' : 'transform 0.5s ease-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.link}
              className={styles.slide}
            >
              <LazyImage
                src={banner.image}
                alt={banner.title}
                className={styles.slideImage}
              />
              <div className={styles.slideOverlay}>
                <h2 className={styles.slideTitle}>{banner.title}</h2>
              </div>
            </a>
          ))}
        </div>

        {/* Индикаторы */}
        <div className={styles.indicators}>
          {banners.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentSlide ? styles.indicatorActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Слайд ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
