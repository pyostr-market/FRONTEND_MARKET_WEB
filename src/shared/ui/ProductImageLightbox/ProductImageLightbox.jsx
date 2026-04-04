import { useState, useCallback, useRef, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiPlus, FiMinus } from 'react-icons/fi';
import LazyImage from '../LazyImage';
import styles from './ProductImageLightbox.module.css';

/**
 * Полноэкранный просмотрщик изображений товара
 * - Открытие при клике на главное изображение
 * - Свайп влево/вправо для переключения
 * - Миниатюры снизу
 * - Pinch-to-zoom (мобильный)
 * - Клик для увеличения/уменьшения (десктоп)
 * - Крестик закрытия
 */
const ProductImageLightbox = ({ images = [], initialIndex = 0, alt = '', onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const pinchStartDistanceRef = useRef(1);
  const pinchStartScaleRef = useRef(1);
  const lastTouchEndRef = useRef(0);
  const mainImageRef = useRef(null);

  const displayImages = images.length > 0 ? images : [];

  // Блокируем скролл страницы при открытом лайтбоксе
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Сброс зума при смене изображения
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  /**
   * Закрытие по Escape
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentIndex]);

  /**
   * Расчёт расстояния между двумя пальцами
   */
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * Обработка начала касания
   */
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // Начало pinch-to-zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      pinchStartDistanceRef.current = distance;
      pinchStartScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      // Начало перетаскивания при зуме
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  }, [scale, position]);

  /**
   * Обработка движения касания
   */
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleFactor = currentDistance / pinchStartDistanceRef.current;
      const newScale = Math.min(Math.max(pinchStartScaleRef.current * scaleFactor, 1), 4);
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Перетаскивание при зуме
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, scale, dragStart]);

  /**
   * Обработка окончания касания
   */
  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      pinchStartDistanceRef.current = 1;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
      
      // Ограничиваем позицию чтобы не уходить за края
      if (scale > 1 && mainImageRef.current) {
        const containerRect = mainImageRef.current.getBoundingClientRect();
        const imageRect = mainImageRef.current.firstChild?.getBoundingClientRect();
        
        if (imageRect) {
          const maxX = (imageRect.width - containerRect.width) / 2;
          const maxY = (imageRect.height - containerRect.height) / 2;
          
          setPosition(prev => ({
            x: Math.max(-maxX, Math.min(maxX, prev.x)),
            y: Math.max(-maxY, Math.min(maxY, prev.y)),
          }));
        }
      }
    }
  }, [scale]);

  /**
   * Двойной клик для зума (десктоп)
   */
  const handleDoubleClick = useCallback((e) => {
    // Защита от случайного двойного клика на мобильных
    const now = Date.now();
    if (now - lastTouchEndRef.current < 300) return;
    lastTouchEndRef.current = now;

    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  }, [scale]);

  /**
   * Клик для зума (десктоп, одинарный клик)
   */
  const handleClick = useCallback((e) => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  /**
   * Предыдущее изображение
   */
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [displayImages.length]);

  /**
   * Следующее изображение
   */
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [displayImages.length]);

  /**
   * Увеличить/уменьшить кнопками
   */
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  if (displayImages.length === 0) return null;

  const currentImage = displayImages[currentIndex];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Крестик закрытия */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
          <FiX size={28} />
        </button>

        {/* Кнопки навигации */}
        {displayImages.length > 1 && (
          <>
            <button className={`${styles.navButton} ${styles.navButtonLeft}`} onClick={handlePrev} aria-label="Предыдущее">
              <FiChevronLeft size={32} />
            </button>
            <button className={`${styles.navButton} ${styles.navButtonRight}`} onClick={handleNext} aria-label="Следующее">
              <FiChevronRight size={32} />
            </button>
          </>
        )}

        {/* Главное изображение */}
        <div 
          ref={mainImageRef}
          className={`${styles.imageContainer} ${scale > 1 ? styles.imageZoomed : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <div
            className={styles.imageWrapper}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <LazyImage
              src={currentImage.image_url}
              alt={alt}
              className={styles.mainImage}
            />
          </div>
        </div>

        {/* Счётчик */}
        {displayImages.length > 1 && (
          <div className={styles.counter}>
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}

        {/* Кнопки зума */}
        {scale !== 1 && (
          <div className={styles.zoomControls}>
            <button className={styles.zoomButton} onClick={handleZoomOut} aria-label="Уменьшить">
              <FiMinus size={20} />
            </button>
            <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
            <button className={styles.zoomButton} onClick={handleZoomIn} aria-label="Увеличить">
              <FiPlus size={20} />
            </button>
          </div>
        )}

        {/* Миниатюры снизу */}
        {displayImages.length > 1 && (
          <div className={styles.thumbnailsContainer}>
            <div className={styles.thumbnailsScroll}>
              {displayImages.map((img, index) => (
                <button
                  key={img.upload_id || index}
                  className={`${styles.thumbnail} ${
                    index === currentIndex ? styles.thumbnailActive : ''
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                  }}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageLightbox;
