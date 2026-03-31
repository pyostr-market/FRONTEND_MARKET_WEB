import styles from './ProductShortSpecs.module.css';

// Атрибуты, которые нужно исключать из отображения
const EXCLUDED_ATTRIBUTES = ['Серия', 'Производитель'];

/**
 * Краткие характеристики товара
 * @param {Object} props
 * @param {Array} props.attributes - Атрибуты товара
 */
const ProductShortSpecs = ({ attributes = [] }) => {
  if (!attributes || attributes.length === 0) {
    return null;
  }

  // Показываем только фильтруемые атрибуты, кроме исключённых
  const filterableAttrs = attributes.filter(
    attr => attr.is_filterable && !EXCLUDED_ATTRIBUTES.includes(attr.name)
  );

  if (filterableAttrs.length === 0) {
    return null;
  }

  return (
    <div className={styles.specsContainer}>
      <h3 className={styles.specsTitle}>О товаре</h3>
      
      <ul className={styles.specsList}>
        {filterableAttrs.map((attr) => (
          <li key={attr.id || attr.name} className={styles.specItem}>
            <span className={styles.specName}>{attr.name}:</span>
            <span className={styles.specValue}>{attr.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductShortSpecs;
