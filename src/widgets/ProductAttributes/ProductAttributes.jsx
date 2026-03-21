import { useCallback, useMemo } from 'react';
import styles from './ProductAttributes.module.css';

/**
 * Компонент выбора атрибутов товара (память, цвет и т.д.)
 * @param {Object} props
 * @param {Array} props.filters - Список фильтров (атрибутов)
 * @param {Object} props.selectedAttributes - Выбранные атрибуты { RAM: "256 GB", Color: "Black" }
 * @param {Object} props.availableAttributeValues - Доступные значения атрибутов
 * @param {Function} props.onAttributeChange - Callback при изменении атрибута
 */
const ProductAttributes = ({
  filters = [],
  selectedAttributes = {},
  availableAttributeValues = {},
  onAttributeChange,
}) => {
  /**
   * Группировка фильтров по имени
   */
  const groupedFilters = useMemo(() => {
    const groups = {};

    filters.forEach((filter) => {
      if (!filter.is_filterable) return;

      if (!groups[filter.name]) {
        groups[filter.name] = {
          name: filter.name,
          values: new Set(),
        };
      }

      filter.options?.forEach((option) => {
        groups[filter.name].values.add(option.value);
      });
    });

    return groups;
  }, [filters]);

  /**
   * Обработчик выбора значения атрибута
   */
  const handleAttributeSelect = useCallback((attrName, attrValue) => {
    onAttributeChange?.(attrName, attrValue);
  }, [onAttributeChange]);

  /**
   * Проверка доступности значения атрибута
   */
  const isAttributeValueAvailable = useCallback((attrName, attrValue) => {
    return availableAttributeValues[attrName]?.has(attrValue) || false;
  }, [availableAttributeValues]);

  /**
   * Проверка выбранности значения
   */
  const isSelected = useCallback((attrName, attrValue) => {
    return selectedAttributes[attrName] === attrValue;
  }, [selectedAttributes]);

  // Если нет фильтров, не показываем ничего
  if (Object.keys(groupedFilters).length === 0) {
    return null;
  }

  return (
    <div className={styles.attributesContainer}>
      <h2 className={styles.attributesTitle}>Характеристики</h2>

      {Object.entries(groupedFilters).map(([attrName, group]) => (
        <div key={attrName} className={styles.attributeGroup}>
          <div className={styles.attributeName}>{attrName}</div>

          <div className={styles.attributeValues}>
            {Array.from(group.values).map((value) => {
              const available = isAttributeValueAvailable(attrName, value);
              const selected = isSelected(attrName, value);

              return (
                <button
                  key={value}
                  className={`
                    ${styles.attributeValue}
                    ${selected ? styles.attributeValueSelected : ''}
                    ${!available ? styles.attributeValueUnavailable : ''}
                  `}
                  onClick={() => available && handleAttributeSelect(attrName, value)}
                  disabled={!available}
                  aria-label={`${attrName}: ${value}`}
                  aria-pressed={selected}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductAttributes;
