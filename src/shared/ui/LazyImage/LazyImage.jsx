import { useState, useCallback } from 'react';
import { DEFAULT_IMAGES } from '../../config/appConfig';
import styles from './LazyImage.module.css';

/**
 * Компонент для ленивой загрузки изображений с обработкой ошибок
 * @param {string} src - URL изображения
 * @param {string} alt - Альтернативный текст
 * @param {string} className - Дополнительный класс
 * @param {Object} observerOptions - Опции Intersection Observer
 * @param {boolean} flush - Если true, убирает фон и центрирование (изображение на всю площадь)
 */
function LazyImage({ src, alt = '', className = '', observerOptions = {}, flush = false }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);

  /**
   * Ref для Intersection Observer
   */
  const containerRef = useCallback(
    (node) => {
      if (!src) return;

      if (node) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsInView(true);
                observer.disconnect();
              }
            });
          },
          {
            rootMargin: observerOptions.rootMargin || '100px',
            threshold: observerOptions.threshold || 0.01,
          }
        );

        observer.observe(node);
      }
    },
    [src, observerOptions]
  );

  /**
   * Обработка ошибки загрузки
   */
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  /**
   * Обработка успешной загрузки
   */
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Если src не предоставлен, показываем заглушку
  if (!src || hasError) {
    return (
      <div className={`${flush ? styles.containerFlush : styles.container} ${className}`}>
        <img
          src={DEFAULT_IMAGES.NOT_FOUND}
          alt={alt || 'Изображение недоступно'}
          className={`${styles.image} ${styles.loaded}`}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`${flush ? styles.containerFlush : styles.container} ${className}`}>
      {/* Placeholder пока не загружено */}
      {!isLoaded && !isInView && (
        <div className={styles.placeholder} />
      )}

      {/* Изображение */}
      {(isInView || isLoaded) && (
        <img
          src={src}
          alt={alt}
          className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

export default LazyImage;
