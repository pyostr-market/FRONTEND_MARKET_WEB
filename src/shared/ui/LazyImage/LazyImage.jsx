import { useLazyImage } from '../../hooks/useLazyImage';
import { DEFAULT_IMAGES } from '../../config/appConfig';
import styles from './LazyImage.module.css';

/**
 * Компонент для ленивой загрузки изображений
 * @param {string} src - URL изображения
 * @param {string} alt - Альтернативный текст
 * @param {string} className - Дополнительный класс
 * @param {Object} observerOptions - Опции Intersection Observer
 */
function LazyImage({ src, alt = '', className = '', observerOptions = {} }) {
  const [isLoaded, ref] = useLazyImage(src, observerOptions);
  
  // Если src не предоставлен, показываем только placeholder
  if (!src) {
    return (
      <div ref={ref} className={`${styles.container} ${className}`}>
        <div className={styles.placeholder} />
      </div>
    );
  }

  return (
    <div ref={ref} className={`${styles.container} ${className}`}>
      {!isLoaded && <div className={styles.placeholder} />}
      <img
        src={src}
        alt={alt}
        className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
        loading="lazy"
        onError={(e) => {
          // Если изображение не загрузилось, показываем заглушку
          e.target.src = DEFAULT_IMAGES.NOT_FOUND;
        }}
      />
    </div>
  );
}

export default LazyImage;
