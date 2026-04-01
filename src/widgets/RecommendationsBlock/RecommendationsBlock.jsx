import { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../../widgets/ProductCard/ProductCard';
import useProductRecommendations from '../../shared/hooks/useProductRecommendations';
import styles from './RecommendationsBlock.module.css';

const RELATION_TYPES = {
  ACCESSORY: 'accessory',
  SIMILAR: 'similar',
  BUNDLE: 'bundle',
  UPSELL: 'upsell',
};

const RELATION_TITLES = {
  [RELATION_TYPES.ACCESSORY]: 'Рекомендуем также',
  [RELATION_TYPES.SIMILAR]: 'Похожие товары',
  [RELATION_TYPES.BUNDLE]: 'С этим товаром покупают',
  [RELATION_TYPES.UPSELL]: 'Более дорогие альтернативы',
};

/**
 * Блок рекомендаций товаров
 * @param {Object} props
 * @param {number} props.productId - ID товара
 * @param {string} [props.relationType] - Тип связи (accessory, similar, bundle, upsell)
 * @param {string} [props.title] - Заголовок блока (опционально)
 * @param {number} [props.limit=20] - Количество загружаемых рекомендаций
 */
const RecommendationsBlock = ({
  productId,
  relationType = RELATION_TYPES.ACCESSORY,
  title,
  limit = 20,
}) => {
  const { recommendations, loading, error } = useProductRecommendations({
    product_id: productId,
    relation_type: relationType,
    limit,
  });

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  /**
   * Проверка видимости стрелок
   */
  const checkArrows = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  /**
   * Прокрутка влево
   */
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector(`.${styles.recommendationCard}`)?.offsetWidth || 0;
    const gap = 16;
    const scrollAmount = cardWidth + gap;

    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  /**
   * Прокрутка вправо
   */
  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector(`.${styles.recommendationCard}`)?.offsetWidth || 0;
    const gap = 16;
    const scrollAmount = cardWidth + gap;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  /**
   * Обработчик скролла
   */
  const handleScroll = useCallback(() => {
    checkArrows();
  }, [checkArrows]);

  useEffect(() => {
    checkArrows();
  }, [recommendations, checkArrows]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={styles.recommendationsBlock}>
      <h2 className={styles.sectionTitle}>
        {title || RELATION_TITLES[relationType] || 'Рекомендации'}
      </h2>

      <div className={styles.sliderContainer}>
        {/* Левая стрелка */}
        {showLeftArrow && (
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={scrollLeft}
            aria-label="Прокрутить влево"
            type="button"
          >
            <FiChevronLeft size={24} />
          </button>
        )}

        {/* Контейнер с карточками */}
        <div
          ref={scrollContainerRef}
          className={styles.scrollContainer}
          onScroll={handleScroll}
        >
          {recommendations.map((product) => (
            <div key={product.id} className={styles.recommendationCard}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Правая стрелка */}
        {showRightArrow && (
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={scrollRight}
            aria-label="Прокрутить вправо"
            type="button"
          >
            <FiChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RecommendationsBlock;
export { RELATION_TYPES };
