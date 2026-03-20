import { crmApi } from './apiClient';

/**
 * Получить список товаров с фильтрацией
 * @param {Object} params
 * @param {number} [params.category_id] - ID категории
 * @param {number} [params.product_type_id] - ID типа товара
 * @param {number} [params.device_type_id] - ID типа устройства (альтернатива product_type_id)
 * @param {string} [params.name] - Поиск по названию
 * @param {Object} [params.attributes] - Фильтры по атрибутам { RAM: ["8 GB"], Color: ["Black"] }
 * @param {string} [params.sort_type] - Тип сортировки: default, price_asc, price_desc
 * @param {number} [params.limit=10] - Количество товаров
 * @param {number} [params.offset=0] - Смещение
 * @param {boolean} [params.f5=false] - Принудительный сброс кэша
 * @returns {Promise<{success: boolean, data: {total: number, items: Array}, error: any}>}
 */
export const getProducts = async ({
  category_id,
  product_type_id,
  device_type_id,
  name,
  attributes,
  sort_type,
  limit = 10,
  offset = 0,
  f5 = false,
} = {}) => {
  const params = {
    limit,
    offset,
  };

  if (category_id) params.category_id = category_id;
  if (product_type_id) params.product_type_id = product_type_id;
  if (device_type_id) params.device_type_id = device_type_id;
  if (name) params.name = name;
  if (sort_type) params.sort_type = sort_type;

  if (attributes && Object.keys(attributes).length > 0) {
    params.attributes = JSON.stringify(attributes);
  }

  return crmApi.request('/product', {
    params,
    f5,
  });
};

/**
 * Получить доступные фильтры для категории/типа товара
 * @param {Object} params
 * @param {number} [params.category_id] - ID категории
 * @param {number} [params.product_type_id] - ID типа товара
 * @param {number} [params.device_type_id] - ID типа устройства
 * @param {boolean} [params.f5=false] - Принудительный сброс кэша
 * @returns {Promise<{success: boolean, data: {filters: Array}, error: any}>}
 */
export const getCatalogFilters = async ({
  category_id,
  product_type_id,
  device_type_id,
  f5 = false,
} = {}) => {
  const params = {};

  if (category_id) params.category_id = category_id;
  if (product_type_id) params.product_type_id = product_type_id;
  if (device_type_id) params.device_type_id = device_type_id;

  return crmApi.request('/product/catalog/filters', {
    params,
    f5,
  });
};

const catalogApi = {
  getProducts,
  getCatalogFilters,
};

export default catalogApi;
