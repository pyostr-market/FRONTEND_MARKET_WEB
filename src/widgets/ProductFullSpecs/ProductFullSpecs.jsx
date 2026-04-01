import { useState } from 'react';
import styles from './ProductFullSpecs.module.css';

/**
 * Полные характеристики товара
 * @param {Object} props
 * @param {Array} props.attributes - Массив всех атрибутов товара
 */
const ProductFullSpecs = ({ attributes = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!attributes || attributes.length === 0) {
    return null;
  }

  // Фильтруем атрибуты, которые уже показаны в коротких характеристиках
  const filterAttributes = attributes.filter(attr => attr.is_filter);
  const otherAttributes = attributes.filter(attr => !attr.is_filter);

  // Если все атрибуты уже показаны в коротких характеристиках, не показываем этот блок
  if (filterAttributes.length === attributes.length) {
    return null;
  }

  // Показываем максимум 5 атрибутов в свёрнутом состоянии
  const MAX_COLLAPSED = 5;
  const displayedAttributes = isExpanded 
    ? attributes 
    : attributes.slice(0, MAX_COLLAPSED);
  
  const hasMore = attributes.length > MAX_COLLAPSED;

  return (
    <div className={styles.fullSpecs}>
      <h2 className={styles.title}>Характеристики</h2>

      <div className={`${styles.specsList} ${!isExpanded && hasMore ? styles.collapsed : ''}`}>
        {displayedAttributes.map((attr, index) => (
          <div
            key={attr.id || index}
            className={`${styles.specItem} ${attr.is_filter ? styles.filterAttribute : ''}`}
          >
            <span className={styles.specName}>{attr.name}</span>
            <span className={styles.specValue}>{attr.value}</span>
          </div>
        ))}

        {/* Градиентный оверлей когда свёрнуто */}
        {!isExpanded && hasMore && (
          <div className={styles.gradientOverlay}>
            <button
              className={styles.expandButton}
              onClick={() => setIsExpanded(true)}
              type="button"
            >
              Развернуть все
            </button>
          </div>
        )}
      </div>

      {isExpanded && hasMore && (
        <button
          className={styles.expandButtonCollapsed}
          onClick={() => setIsExpanded(false)}
          type="button"
        >
          Свернуть
        </button>
      )}
    </div>
  );
};

export default ProductFullSpecs;
