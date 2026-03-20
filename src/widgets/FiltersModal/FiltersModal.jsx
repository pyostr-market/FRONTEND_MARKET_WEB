import { useState, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import styles from './FiltersModal.module.css';

/**
 * Модальное окно фильтров для мобильной версии
 * @param {Object} props
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Закрытие модального окна
 * @param {Array} props.filters - Список фильтров
 * @param {Object} props.selectedFilters - Выбранные фильтры
 * @param {Function} props.onToggleFilter - Переключение фильтра
 * @param {Function} props.onApply - Применение фильтров
 * @param {Function} props.onReset - Сброс фильтров
 * @param {boolean} props.hasChanges - Есть ли изменения
 * @param {boolean} props.loading - Загрузка
 */
const FiltersModal = ({
  isOpen,
  onClose,
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
   * Обработчик применения
   */
  const handleApply = () => {
    onApply();
    onClose();
  };

  /**
   * Закрытие по ESC
   */
  useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  /**
   * Блокировка скролла фона
   */
  useState(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Loading
   */
  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Фильтры</h2>
            <button className={styles.closeBtn} onClick={onClose}>
              <FiX size={24} />
            </button>
          </div>
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
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Фильтры</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {getSelectedCount() > 0 && (
          <div className={styles.selectedBadge}>
            Выбрано: {getSelectedCount()}
          </div>
        )}

        <div className={styles.filtersContent}>
          {!filters || filters.length === 0 ? (
            <div className={styles.emptyFilters}>
              <p>Нет доступных фильтров</p>
            </div>
          ) : (
            filters.map((filter) => {
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
                          isSelected(filter.name, option.value)
                            ? styles.selected
                            : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected(filter.name, option.value)}
                          onChange={() =>
                            onToggleFilter(filter.name, option.value)
                          }
                          className={styles.checkbox}
                        />
                        <span className={styles.optionLabel}>
                          <span className={styles.optionValue}>
                            {option.value}
                          </span>
                          {option.count !== undefined &&
                            option.count !== null && (
                              <span className={styles.optionCount}>
                                {option.count}
                              </span>
                            )}
                        </span>
                      </label>
                    ))}

                    {filter.options.length > 5 && (
                      <button
                        className={styles.showMoreBtn}
                        onClick={() => toggleExpanded(filter.name)}
                      >
                        {isExpanded
                          ? 'Свернуть'
                          : `Показать все (${filter.options.length})`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.resetBtn}
            onClick={onReset}
            disabled={getSelectedCount() === 0}
          >
            Сбросить
          </button>
          <button
            className={`${styles.applyBtn} ${
              !hasChanges ? styles.applyBtnDisabled : ''
            }`}
            onClick={handleApply}
            disabled={!hasChanges}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
