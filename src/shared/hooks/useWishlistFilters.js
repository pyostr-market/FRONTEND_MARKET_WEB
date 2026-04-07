import { useMemo } from 'react';

/**
 * Хук для извлечения фильтров из товаров избранного
 * @param {Array<Object>} products - Массив загруженных товаров
 * @returns {Array<Object>} Фильтры [{ name, options: [{ value, count }] }]
 */
const useWishlistFilters = (products = []) => {
  return useMemo(() => {
    if (!products || products.length === 0) return [];

    // Собираем все значения атрибутов из товаров
    const attributeMap = {};

    products.forEach((product) => {
      if (!product.attributes) return;

      product.attributes.forEach((attr) => {
        // Только фильтруемые атрибуты
        if (!attr.is_filterable) return;

        if (!attributeMap[attr.name]) {
          attributeMap[attr.name] = {};
        }

        if (!attributeMap[attr.name][attr.value]) {
          attributeMap[attr.name][attr.value] = 0;
        }

        attributeMap[attr.name][attr.value]++;
      });
    });

    // Преобразуем в структуру фильтров
    const filters = Object.entries(attributeMap).map(([name, values]) => ({
      name,
      options: Object.entries(values)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count), // Сортируем по популярности
    }));

    return filters;
  }, [products]);
};

export default useWishlistFilters;
