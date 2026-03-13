import { crmApi } from '../../shared/api/apiClient';

/**
 * Получение дерева типов товаров
 * @param {Object} options - Опции запроса
 * @param {boolean} options.f5 - Принудительный сброс кэша
 * @param {number} options.ttl - Время жизни кэша в мс (по умолчанию 60000)
 * @returns {Promise<{success: boolean, data: {total: number, items: Array}, error: any}>}
 */
export async function getProductTypes({ f5 = false, ttl = 60000 } = {}) {
  return crmApi.request('/product/type/tree', {
    method: 'GET',
    f5,
    ttl,
  });
}
