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
 * Получить товары по списку ID
 * @param {Array<number>} product_ids - Массив ID товаров
 * @param {boolean} [f5=false] - Принудительный сброс кэша
 * @returns {Promise<{success: boolean, data: {items: Array}, error: any}>}
 */
export const getProductsByIds = async (product_ids, f5 = false) => {
  if (!product_ids || product_ids.length === 0) {
    return {
      success: true,
      data: { items: [] },
      error: null,
    };
  }

  // Создаём params вручную для передачи множественных product_ids
  const params = new URLSearchParams();
  product_ids.forEach((id) => {
    params.append('product_ids', id.toString());
  });

  return crmApi.request('/product', {
    params,
    f5,
    // Кэш 10 секунд
    ttl: 10000,
  });
};

/**
 * Получить товар по ID
 * @param {number} productId - ID товара
 * @param {boolean} [f5=false] - Принудительный сброс кэша
 * @returns {Promise<{success: boolean, data: {item: Object}, error: any}>}
 */
export const getProductById = async (productId, f5 = false) => {
  if (!productId) {
    return {
      success: false,
      data: null,
      error: 'Product ID is required',
    };
  }

  return crmApi.request(`/product/${productId}`, {
    params: {},
    f5,
    ttl: 60000, // 1 минута
  });
};

/**
 * Получить товары категории (для вариантов товара)
 * @param {Object} params
 * @param {number} params.category_id - ID категории
 * @param {Object} [params.attributes] - Фильтры по атрибутам
 * @param {boolean} [params.f5=false] - Принудительный сброс кэша
 * @returns {Promise<{success: boolean, data: {items: Array}, error: any}>}
 */
export const getCategoryProducts = async ({
  category_id,
  attributes,
  f5 = false,
} = {}) => {
  const params = {
    category_id,
    limit: 50, // Получаем все товары категории
  };

  if (attributes && Object.keys(attributes).length > 0) {
    params.attributes = JSON.stringify(attributes);
  }

  return crmApi.request('/product', {
    params,
    f5,
    ttl: 30000, // 30 секунд
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
