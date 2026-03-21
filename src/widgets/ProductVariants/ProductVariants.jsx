import LazyImage from '../../shared/ui/LazyImage';
import styles from './ProductVariants.module.css';

/**
 * Миниатюры вариантов товара (для переключения между цветами/версиями)
 * Все варианты в одной горизонтальной строке с прокруткой
 * @param {Object} props
 * @param {Array} props.variants - Варианты товара
 * @param {number} props.currentProductId - ID текущего товара
 * @param {Function} props.onVariantSelect - Callback при выборе варианта
 */
const ProductVariants = ({ variants = [], currentProductId, onVariantSelect }) => {
  /**
   * Получить главное изображение
   */
  const getMainImage = (variant) => {
    if (!variant.images?.length) return null;
    const main = variant.images.find(img => img.is_main);
    return main || variant.images[0];
  };

  /**
   * Получить краткие характеристики (исключая "Серия" и "Производитель")
   */
  const getShortSpecs = (variant) => {
    if (!variant.attributes) return [];

    return variant.attributes
      .filter(attr =>
        attr.is_filterable &&
        !['Серия', 'Производитель'].includes(attr.name)
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

      {/* Все варианты в одной строке с горизонтальным скроллом */}
      <div className={styles.variantList}>
        {variants.map((variant) => {
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
  );
};

export default ProductVariants;
