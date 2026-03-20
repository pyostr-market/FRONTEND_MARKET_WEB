/**
 * Product Entity
 * Модель данных и API методы для работы с товарами
 */

import { getProducts, getCatalogFilters } from '../../shared/api/catalogApi';

/**
 * Модель товара
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string|null} description
 * @property {string} price
 * @property {Array} images
 * @property {Array} attributes
 * @property {Object|null} category
 * @property {Object|null} supplier
 */

/**
 * Модель фильтра
 * @typedef {Object} Filter
 * @property {string} name
 * @property {boolean} is_filterable
 * @property {Array} options
 */

/**
 * API методы для товаров
 */
export const productApi = {
  /**
   * Получить список товаров
   * @param {Object} filters
   * @param {number} [filters.category_id]
   * @param {number} [filters.product_type_id]
   * @param {number} [filters.device_type_id]
   * @param {string} [filters.name]
   * @param {Object} [filters.attributes]
   * @param {number} [filters.limit=10]
   * @param {number} [filters.offset=0]
   * @param {boolean} [filters.f5=false]
   * @returns {Promise<{success: boolean, data: {total: number, items: Product[]}, error: any}>}
   */
  getProducts,

  /**
   * Получить фильтры для каталога
   * @param {Object} params
   * @param {number} [params.category_id]
   * @param {number} [params.product_type_id]
   * @param {number} [params.device_type_id]
   * @param {boolean} [params.f5=false]
   * @returns {Promise<{success: boolean, data: {filters: Filter[]}, error: any}>}
   */
  getCatalogFilters,
};

/**
 * Селекторы для товаров
 */
export const productSelectors = {
  /**
   * Получить главное изображение товара
   * @param {Product} product
   * @returns {string|null}
   */
  getMainImage: (product) => {
    if (!product?.images?.length) return null;
    const mainImage = product.images.find((img) => img.is_main);
    return mainImage?.image_url || product.images[0]?.image_url || null;
  },

  /**
   * Получить цену товара как число
   * @param {Product} product
   * @returns {number}
   */
  getPriceAsNumber: (product) => {
    if (!product?.price) return 0;
    return parseFloat(product.price);
  },

  /**
   * Получить атрибут по имени
   * @param {Product} product
   * @param {string} attributeName
   * @returns {string|null}
   */
  getAttributeValue: (product, attributeName) => {
    if (!product?.attributes?.length) return null;
    const attr = product.attributes.find((a) => a.name === attributeName);
    return attr?.value || null;
  },

  /**
   * Получить все фильтруемые атрибуты
   * @param {Product} product
   * @returns {Array}
   */
  getFilterableAttributes: (product) => {
    if (!product?.attributes?.length) return [];
    return product.attributes.filter((a) => a.is_filterable);
  },
};

const productModule = {
  productApi,
  productSelectors,
};

export default productModule;
