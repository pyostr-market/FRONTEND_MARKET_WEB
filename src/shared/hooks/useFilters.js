import { useState, useCallback, useEffect } from 'react';

/**
 * Хук для управления состоянием фильтров
 * @param {Object} initialFilters - Начальные фильтры
 * @returns {Object}
 */
const useFilters = (initialFilters = {}) => {
  // Выбранные значения фильтров (до применения)
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  // Примененные фильтры
  const [appliedFilters, setAppliedFilters] = useState({});

  // Синхронизация при изменении initialFilters (например, при смене категории)
  useEffect(() => {
    setSelectedFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  // Флаг наличия изменений
  const hasChanges = Object.keys(selectedFilters).length > 0 ||
    Object.keys(appliedFilters).length !== Object.keys(selectedFilters).length ||
    Object.keys(selectedFilters).some(
      (key) =>
        JSON.stringify(selectedFilters[key]) !== JSON.stringify(appliedFilters[key])
    );

  /**
   * Переключение значения фильтра
   * @param {string} filterName - Имя фильтра (RAM, Color, etc.)
   * @param {string} value - Значение
   */
  const toggleFilterValue = useCallback((filterName, value) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[filterName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      if (newValues.length === 0) {
        const { [filterName]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [filterName]: newValues,
      };
    });
  }, []);

  /**
   * Установка значения фильтра
   * @param {string} filterName
   * @param {Array} values
   */
  const setFilterValues = useCallback((filterName, values) => {
    if (!values || values.length === 0) {
      setSelectedFilters((prev) => {
        const { [filterName]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setSelectedFilters((prev) => ({
        ...prev,
        [filterName]: values,
      }));
    }
  }, []);

  /**
   * Применение фильтров
   * @returns {Object} Примененные фильтры
   */
  const applyFilters = useCallback(() => {
    setAppliedFilters(selectedFilters);
    return selectedFilters;
  }, [selectedFilters]);

  /**
   * Сброс всех фильтров
   */
  const resetAll = useCallback(() => {
    setSelectedFilters({});
    setAppliedFilters({});
  }, []);

  /**
   * Сброс к примененным (отмена изменений)
   */
  const revertToApplied = useCallback(() => {
    setSelectedFilters(appliedFilters);
  }, [appliedFilters]);

  /**
   * Проверка, выбрано ли значение
   * @param {string} filterName
   * @param {string} value
   * @returns {boolean}
   */
  const isSelected = useCallback((filterName, value) => {
    return selectedFilters[filterName]?.includes(value) || false;
  }, [selectedFilters]);

  /**
   * Получить количество выбранных фильтров
   * @returns {number}
   */
  const getSelectedCount = useCallback(() => {
    return Object.values(selectedFilters).reduce(
      (total, values) => total + values.length,
      0
    );
  }, [selectedFilters]);

  return {
    selectedFilters,
    appliedFilters,
    hasChanges,
    toggleFilterValue,
    setFilterValues,
    applyFilters,
    resetAll,
    revertToApplied,
    isSelected,
    getSelectedCount,
  };
};

export default useFilters;
