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
    useCache: false, // Кэш управляется в useCatalog
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
    useCache: false, // Кэш управляется в useCatalog
  });
};

/**
 * Получить товар по ID через загрузку категории
 * @param {Object} params
 * @param {number} params.product_id - ID товара
 * @param {number} [params.category_id] - ID категории (опционально)
 * @param {boolean} [params.f5=false] - Принудительный сброс кэша
 * @returns {Promise<{success: boolean, data: {item: Object|null}, error: any}>}
 */
export const getProductById = async ({ product_id, category_id }, f5 = false) => {
  if (!product_id) {
    return {
      success: false,
      data: null,
      error: 'Product ID is required',
    };
  }

  // Если категория не указана, пробуем загрузить товар по ID напрямую
  if (!category_id) {
    // Пробуем найти товар через API рекомендаций или другой эндпоинт
    // Для начала пробуем загрузить через getProductsByIds
    return getProductsByIds([product_id], f5).then((result) => {
      if (result.success && result.data?.items?.length > 0) {
        return {
          success: true,
          data: { item: result.data.items[0] },
          error: null,
        };
      }
      return {
        success: true,
        data: { item: null },
        error: null,
      };
    });
  }

  // Загружаем все товары категории
  const result = await crmApi.request('/product', {
    params: {
      category_id,
      limit: 100,
    },
    f5,
    useCache: false, // Кэш управляется в useCatalog
  });

  if (result.success && result.data?.items?.length > 0) {
    // Ищем нужный товар по ID
    const item = result.data.items.find((p) => p.id === product_id);
    if (item) {
      return {
        success: true,
        data: { item },
        error: null,
      };
    }
  }

  return {
    success: true,
    data: { item: null },
    error: null,
  };
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
    limit: 100,
  };

  if (attributes && Object.keys(attributes).length > 0) {
    params.attributes = JSON.stringify(attributes);
  }

  return crmApi.request('/product', {
    params,
    f5,
    useCache: false, // Кэш управляется в useCatalog
  });
};

/**
 * Получить варианты для конкретного товара
 * @param {Object} params
 * @param {number} params.product_id - ID товара, для которого ищем варианты
 * @param {boolean} [params.f5=false] - Принудительный сброс кэша
 * @returns {Promise<{success: boolean, data: {total: number, items: Array}, error: any}>}
 */
export const getProductVariants = async ({
  product_id,
  f5 = false,
} = {}) => {
  if (!product_id) {
    return {
      success: false,
      data: null,
      error: 'Product ID is required',
    };
  }

  return crmApi.request('/product/related/variants', {
    params: { product_id },
    f5,
    useCache: false,
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
    useCache: false, // Кэш управляется отдельно
  });
};

/**
 * Получить рекомендации для товара
 * @param {Object} params
 * @param {number} params.product_id - ID товара
 * @param {string} [params.relation_type] - Тип связи (accessory, similar, bundle, upsell)
 * @param {number} [params.page=1] - Номер страницы
 * @param {number} [params.limit=20] - Количество элементов
 * @param {boolean} [params.f5=false] - Принудительный сброс кэша
 * @returns {Promise<{success: boolean, data: {items: Array, pagination: Object}, error: any}>}
 */
export const getProductRecommendations = async ({
  product_id,
  relation_type,
  page = 1,
  limit = 20,
  f5 = false,
} = {}) => {
  if (!product_id) {
    return {
      success: false,
      data: null,
      error: 'Product ID is required',
    };
  }

  const params = {
    page,
    limit,
  };

  if (relation_type) params.relation_type = relation_type;

  return crmApi.request(`/product/products/${product_id}/recommendations`, {
    params,
    f5,
    useCache: false,
  });
};

const catalogApi = {
  getProducts,
  getCatalogFilters,
  getProductRecommendations,
};

export default catalogApi;
