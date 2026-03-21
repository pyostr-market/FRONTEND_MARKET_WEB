import { useCallback, useMemo } from 'react';
import styles from './ProductAttributes.module.css';

/**
 * Компонент выбора атрибутов товара (память, цвет и т.д.)
 * @param {Object} props
 * @param {Array} props.filters - Список фильтров (атрибутов)
 * @param {Object} props.selectedAttributes - Выбранные атрибуты { RAM: "256 GB", Color: "Black" }
 * @param {Object} props.availableAttributeValues - Доступные значения атрибутов
 * @param {Object} props.currentProductAttributes - Атрибуты текущего товара
 * @param {Array} props.variants - Варианты товара
 * @param {Function} props.onAttributeChange - Callback при изменении атрибута
 */
const ProductAttributes = ({
  filters = [],
  selectedAttributes = {},
  availableAttributeValues = {},
  currentProductAttributes = {},
  variants = [],
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
   * Проверка доступности значения атрибута с учётом выбранных
   */
  const isAttributeValueAvailable = useCallback((attrName, attrValue) => {
    // Проверяем, есть ли такое значение вообще
    if (!availableAttributeValues[attrName]?.has(attrValue)) {
      return false;
    }

    // Если других атрибутов не выбрано, значение доступно
    const otherSelectedAttrs = Object.entries(selectedAttributes)
      .filter(([name]) => name !== attrName);
    
    if (otherSelectedAttrs.length === 0) {
      return true;
    }

    // Проверяем, есть ли товар с такой комбинацией
    const hasVariant = variants.some((variant) => {
      // Проверяем, есть ли у варианта проверяемое значение
      const hasAttrValue = variant.attributes?.some(
        (a) => a.name === attrName && a.value === attrValue
      );
      
      if (!hasAttrValue) return false;
      
      // Проверяем остальные выбранные атрибуты
      return otherSelectedAttrs.every(([name, value]) => {
        return variant.attributes?.some((a) => a.name === name && a.value === value);
      });
    });

    return hasVariant;
  }, [selectedAttributes, availableAttributeValues, variants]);

  /**
   * Обработчик выбора значения атрибута
   */
  const handleAttributeSelect = useCallback((attrName, attrValue) => {
    onAttributeChange?.(attrName, attrValue);
  }, [onAttributeChange]);

  /**
   * Проверка выбранности значения
   */
  const isSelected = useCallback((attrName, attrValue) => {
    return currentProductAttributes[attrName] === attrValue;
  }, [currentProductAttributes]);

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
              const selected = isSelected(attrName, value);
              const available = isAttributeValueAvailable(attrName, value);

              return (
                <button
                  key={value}
                  className={`
                    ${styles.attributeValue}
                    ${selected ? styles.attributeValueSelected : ''}
                    ${!available ? styles.attributeValueUnavailable : ''}
                  `}
                  onClick={() => handleAttributeSelect(attrName, value)}
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
