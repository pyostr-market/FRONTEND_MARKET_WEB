import { useState, useEffect, useRef } from 'react';

/**
 * Хук для ленивой загрузки изображений через Intersection Observer
 * @param {string} src - URL изображения
 * @param {Object} options - Опции Intersection Observer
 * @returns {[boolean, React.RefObject]} [isLoaded, ref]
 */
export function useLazyImage(src, options = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Если нет src, не наблюдаем
    if (!src) {
      setIsLoaded(true);
      return;
    }

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
        rootMargin: '100px', // Начинаем загружать за 100px до появления
        threshold: 0.01,
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [src, options]);

  // Загружаем изображение только когда оно в области видимости
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(true); // Показываем placeholder при ошибке

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src]);

  return [isLoaded, ref];
}

export default useLazyImage;
