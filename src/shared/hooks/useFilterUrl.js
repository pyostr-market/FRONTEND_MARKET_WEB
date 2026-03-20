import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Хук для синхронизации фильтров и сортировки с URL
 * @param {Array} filters - Список доступных фильтров [{ name, options: [{ value }] }]
 * @returns {Object}
 */
const useFilterUrl = (filters = []) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Доступные значения фильтров для быстрой проверки
  const availableFilterValues = useMemo(() => {
    const values = {};
    filters.forEach((filter) => {
      values[filter.name] = new Set(filter.options?.map((opt) => opt.value) || []);
    });
    return values;
  }, [filters]);

  /**
   * Парсинг параметров из URL
   * @returns {Object} { sort_type, filters: { RAM: ["8 GB"], Color: ["Black"] } }
   */
  const parseFromUrl = useMemo(() => {
    const result = {
      sort_type: 'default',
      filters: {},
    };

    // Парсим sort_type
    const sortType = searchParams.get('sort_type');
    if (sortType && ['default', 'price_asc', 'price_desc'].includes(sortType)) {
      result.sort_type = sortType;
    }

    // Парсим фильтры
    filters.forEach((filter) => {
      const paramName = `filter_${filter.name}`;
      const paramValue = searchParams.get(paramName);

      if (paramValue) {
        try {
          const values = JSON.parse(decodeURIComponent(paramValue));

          if (Array.isArray(values)) {
            // Валидируем каждое значение
            const validValues = values.filter(
              (v) => availableFilterValues[filter.name]?.has(v)
            );

            if (validValues.length > 0) {
              result.filters[filter.name] = validValues;
            }
          }
        } catch (e) {
          // Игнорируем невалидный JSON
          console.warn(`Invalid filter value for ${filter.name}:`, paramValue);
        }
      }
    });

    return result;
  }, [searchParams, filters, availableFilterValues]);

  /**
   * Обновление параметров в URL
   * @param {Object} params - { sort_type, filters }
   */
  const updateUrl = (params) => {
    const newParams = new URLSearchParams(searchParams);

    // Обновляем sort_type
    if (params.sort_type && params.sort_type !== 'default') {
      newParams.set('sort_type', params.sort_type);
    } else {
      newParams.delete('sort_type');
    }

    // Обновляем фильтры
    if (params.filters) {
      Object.entries(params.filters).forEach(([filterName, values]) => {
        const paramName = `filter_${filterName}`;

        if (values && values.length > 0) {
          // Проверяем что фильтр существует
          if (availableFilterValues[filterName]) {
            // Валидируем значения
            const validValues = values.filter((v) =>
              availableFilterValues[filterName].has(v)
            );

            if (validValues.length > 0) {
              newParams.set(
                paramName,
                encodeURIComponent(JSON.stringify(validValues))
              );
            } else {
              newParams.delete(paramName);
            }
          } else {
            newParams.delete(paramName);
          }
        } else {
          newParams.delete(paramName);
        }
      });
    }

    setSearchParams(newParams, { replace: true });
  };

  /**
   * Очистка параметров фильтра из URL
   * @param {string} filterName - Имя фильтра
   */
  const removeFilterFromUrl = (filterName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(`filter_${filterName}`);
    setSearchParams(newParams, { replace: true });
  };

  /**
   * Очистка всех параметров фильтров из URL
   */
  const clearFiltersFromUrl = () => {
    const newParams = new URLSearchParams(searchParams);

    // Удаляем все filter_* параметры
    Array.from(newParams.keys()).forEach((key) => {
      if (key.startsWith('filter_')) {
        newParams.delete(key);
      }
    });

    // Также удаляем sort_type если default
    if (newParams.get('sort_type') === 'default') {
      newParams.delete('sort_type');
    }

    setSearchParams(newParams, { replace: true });
  };

  return {
    // Распарсенные параметры
    sort_type: parseFromUrl.sort_type,
    filters: parseFromUrl.filters,

    // Методы
    updateUrl,
    removeFilterFromUrl,
    clearFiltersFromUrl,
  };
};

export default useFilterUrl;
