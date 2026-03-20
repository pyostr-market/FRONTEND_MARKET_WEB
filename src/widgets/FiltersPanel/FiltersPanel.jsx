import { useState, useCallback } from 'react';
import styles from './FiltersPanel.module.css';

/**
 * Панель фильтров для десктопной версии
 * @param {Object} props
 * @param {Array} props.filters - Список фильтров [{ name, options: [{ value, count }] }]
 * @param {Object} props.selectedFilters - Выбранные фильтры { RAM: ["8 GB"] }
 * @param {Function} props.onToggleFilter - Переключение фильтра
 * @param {Function} props.onApply - Применение фильтров
 * @param {Function} props.onReset - Сброс фильтров
 * @param {boolean} props.hasChanges - Есть ли изменения
 * @param {boolean} props.loading - Загрузка
 */
const FiltersPanel = ({
  filters,
  selectedFilters,
  onToggleFilter,
  onApply,
  onReset,
  hasChanges,
  loading,
}) => {
  const [expandedFilters, setExpandedFilters] = useState({});

  /**
   * Переключение раскрытия фильтра
   */
  const toggleExpanded = useCallback((filterName) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  }, []);

  /**
   * Проверка, выбрано ли значение
   */
  const isSelected = useCallback(
    (filterName, value) => {
      return selectedFilters[filterName]?.includes(value) || false;
    },
    [selectedFilters]
  );

  /**
   * Получить количество выбранных
   */
  const getSelectedCount = useCallback(() => {
    return Object.values(selectedFilters).reduce(
      (total, values) => total + values.length,
      0
    );
  }, [selectedFilters]);

  /**
   * Loading
   */
  if (loading) {
    return (
      <aside className={styles.filtersPanel}>
        <div className={styles.skeleton}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonFilter}>
              <div className={styles.skeletonTitle}></div>
              <div className={styles.skeletonOptions}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className={styles.skeletonOption}></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  /**
   * Пустое состояние
   */
  if (!filters || filters.length === 0) {
    return null;
  }

  return (
    <aside className={styles.filtersPanel}>
      <div className={styles.filtersHeader}>
        <h2 className={styles.filtersTitle}>Фильтры</h2>
        {getSelectedCount() > 0 && (
          <span className={styles.selectedCount}>{getSelectedCount()} выбрано</span>
        )}
      </div>

      <div className={styles.filtersContent}>
        {filters.map((filter) => {
          const isExpanded = expandedFilters[filter.name] || false;
          const visibleOptions = isExpanded
            ? filter.options
            : filter.options.slice(0, 5);

          return (
            <div key={filter.name} className={styles.filterGroup}>
              <div
                className={styles.filterHeader}
                onClick={() => toggleExpanded(filter.name)}
              >
                <span className={styles.filterName}>{filter.name}</span>
                <span className={styles.expandIcon}>
                  {isExpanded ? '−' : '+'}
                </span>
              </div>

              <div className={styles.filterOptions}>
                {visibleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`${styles.filterOption} ${
                      isSelected(filter.name, option.value) ? styles.selected : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(filter.name, option.value)}
                      onChange={() => onToggleFilter(filter.name, option.value)}
                      className={styles.checkbox}
                    />
                    <span className={styles.optionLabel}>
                      <span className={styles.optionValue}>{option.value}</span>
                      {option.count !== undefined && option.count !== null && (
                        <span className={styles.optionCount}>{option.count}</span>
                      )}
                    </span>
                  </label>
                ))}

                {filter.options.length > 5 && (
                  <button
                    className={styles.showMoreBtn}
                    onClick={() => toggleExpanded(filter.name)}
                  >
                    {isExpanded ? 'Свернуть' : `Показать все (${filter.options.length})`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.filtersFooter}>
        <button
          className={styles.resetBtn}
          onClick={onReset}
          disabled={getSelectedCount() === 0}
        >
          Сбросить
        </button>
        <button
          className={`${styles.applyBtn} ${!hasChanges ? styles.applyBtnDisabled : ''}`}
          onClick={onApply}
          disabled={!hasChanges}
        >
          Показать
        </button>
      </div>
    </aside>
  );
};

export default FiltersPanel;
