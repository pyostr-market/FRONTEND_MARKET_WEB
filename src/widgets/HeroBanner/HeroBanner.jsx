import { useState, useEffect, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LazyImage from '../../shared/ui/LazyImage';
import styles from './HeroBanner.module.css';

const banners = [
  {
    id: 1,
    image: 'https://tuneapp.ru/image/cache/catalog/banner/slajder/rassrochka-1440x320.png',
    link: '/catalog?product_type=1',
    title: '',
  },
  {
    id: 2,
    image: 'https://tuneapp.ru/image/cache/catalog/banner/glavnaya/dostavka_1variant-1440x320.png',
    link: '/catalog?sale=true',
    // title: 'Скидки до 50%',
  },
  {
    id: 3,
    image: 'https://tuneapp.ru/image/cache/catalog/banner/slaidery_june_2024/glavnaja-slai%CC%86der1-1440x320.png',
    link: '/catalog?delivery=free',
    // title: 'Бесплатная доставка',
  },
  {
    id: 4,
    image: 'https://tuneapp.ru/image/cache/catalog/banner/slaidery_august_2024/banner2-1440x320.jpg',
    link: '/catalog?delivery=free',
    // title: 'Бесплатная доставка',
  },
];

const AUTOPLAY_DELAY = 5000;
const SWIPE_THRESHOLD = 50;

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);

  const autoplayRef = useRef(null);

  const startAutoplay = useCallback(() => {
    stopAutoplay();

    autoplayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, AUTOPLAY_DELAY);
  }, []);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, []);

  const handleTouchStart = useCallback(
      (e) => {
        setTouchStartX(e.touches[0].clientX);
        stopAutoplay();
      },
      [stopAutoplay]
  );

  const handleTouchMove = useCallback(
      (e) => {
        const currentX = e.touches[0].clientX;
        setTouchOffset(currentX - touchStartX);
      },
      [touchStartX]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchOffset > SWIPE_THRESHOLD) {
      prevSlide();
    } else if (touchOffset < -SWIPE_THRESHOLD) {
      nextSlide();
    }

    setTouchOffset(0);
    startAutoplay();
  }, [touchOffset, prevSlide, nextSlide, startAutoplay]);

  return (
      <div className={styles.heroBanner}>
        <div className={styles.sliderContainer}>
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

          <div
              className={styles.slidesWrapper}
              style={{
                transform: `translateX(-${currentSlide * 100}%) translateX(${touchOffset}px)`,
                transition: touchOffset ? 'none' : 'transform 0.5s ease-out',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
          >
            {banners.map((banner) => (
                <a key={banner.id} href={banner.link} className={styles.slide}>
                  <LazyImage
                      src={banner.image}
                      alt={banner.title}
                      className={styles.slideImage}
                      flush
                  />

                  {banner.title && (
                      <div className={styles.slideOverlay}>
                        <h2 className={styles.slideTitle}>{banner.title}</h2>
                      </div>
                  )}
                </a>
            ))}
          </div>

          <div className={styles.indicators}>
            {banners.map((_, index) => (
                <button
                    key={index}
                    className={`${styles.indicator} ${
                        index === currentSlide ? styles.indicatorActive : ''
                    }`}
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