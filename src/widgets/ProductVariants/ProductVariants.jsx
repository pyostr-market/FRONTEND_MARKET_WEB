import { useMemo } from 'react';
import LazyImage from '../../shared/ui/LazyImage';
import styles from './ProductVariants.module.css';

// Атрибуты, которые нужно исключать из отображения
const EXCLUDED_ATTRIBUTES = ['Серия', 'Производитель'];

/**
 * Миниатюры вариантов товара (для переключения между цветами/версиями)
 * @param {Object} props
 * @param {Array} props.variants - Варианты товара
 * @param {number} props.currentProductId - ID текущего товара
 * @param {Function} props.onVariantSelect - Callback при выборе варианта
 */
const ProductVariants = ({ variants = [], currentProductId, onVariantSelect }) => {
  /**
   * Группируем варианты по основному атрибуту (например, цвет)
   */
  const groupedVariants = useMemo(() => {
    const groups = {};
    
    variants.forEach((variant) => {
      // Находим атрибут "Цвет" или первый фильтруемый (кроме исключённых)
      const colorAttr = variant.attributes?.find(
        a => (a.name === 'Цвет' || a.is_filterable) && 
             !EXCLUDED_ATTRIBUTES.includes(a.name)
      );
      const groupName = colorAttr?.value || 'Другие';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(variant);
    });
    
    return groups;
  }, [variants]);

  /**
   * Получить главное изображение
   */
  const getMainImage = (variant) => {
    if (!variant.images?.length) return null;
    const main = variant.images.find(img => img.is_main);
    return main || variant.images[0];
  };

  /**
   * Получить краткие характеристики
   */
  const getShortSpecs = (variant) => {
    if (!variant.attributes) return [];
    
    // Показываем атрибуты, кроме исключённых
    return variant.attributes
      .filter(attr => 
        attr.is_filterable && 
        !EXCLUDED_ATTRIBUTES.includes(attr.name)
      )
      .slice(0, 2)
      .map(attr => attr.value);
  };

  if (variants.length <= 1) {
    return null;
  }

  return (
    <div className={styles.variantsContainer}>
      <h3 className={styles.variantsTitle}>Доступные варианты</h3>
      
      {Object.entries(groupedVariants).map(([groupName, groupVariants]) => (
        <div key={groupName} className={styles.variantGroup}>
          <div className={styles.groupName}>{groupName}</div>
          
          <div className={styles.variantList}>
            {groupVariants.map((variant) => {
              const isCurrent = variant.id === currentProductId;
              const mainImage = getMainImage(variant);
              const shortSpecs = getShortSpecs(variant);

              return (
                <button
                  key={variant.id}
                  className={`${styles.variantCard} ${isCurrent ? styles.variantCardActive : ''}`}
                  onClick={() => onVariantSelect(variant)}
                  disabled={isCurrent}
                >
                  <div className={styles.variantImage}>
                    {mainImage ? (
                      <LazyImage
                        src={mainImage.image_url}
                        alt={variant.name}
                        className={styles.variantImage}
                      />
                    ) : (
                      <div className={styles.noImage}>Нет фото</div>
                    )}
                    
                    {isCurrent && (
                      <div className={styles.activeMarker}>✓</div>
                    )}
                  </div>
                  
                  {shortSpecs.length > 0 && (
                    <div className={styles.variantSpecs}>
                      {shortSpecs.map((spec, index) => (
                        <span key={index} className={styles.specItem}>{spec}</span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductVariants;
