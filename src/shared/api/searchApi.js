import { crmApi } from './apiClient';

/**
 * Поиск товаров с подсказками
 * @param {string} query - Поисковый запрос
 * @param {number} [limit=10] - Количество товаров
 * @param {number} [offset=0] - Смещение
 * @returns {Promise<{success: boolean, data: {total: number, items: Array, suggestions: Array}, error: any}>}
 */
export const searchProducts = async (query, limit = 10, offset = 0) => {
  if (!query || !query.trim()) {
    return {
      success: true,
      data: { total: 0, items: [], suggestions: [] },
      error: null,
    };
  }

  return crmApi.request('/product/search', {
    params: {
      query: query.trim(),
      limit,
      offset,
    },
    useCache: false,
  });
};
