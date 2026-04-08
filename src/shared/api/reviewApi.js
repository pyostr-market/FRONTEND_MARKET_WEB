import { crmApi } from './apiClient';

/**
 * Получить отзывы товара
 * @param {Object} params
 * @param {number} params.product_id - ID товара
 * @param {number} [params.limit=20] - Количество элементов
 * @param {number} [params.offset=0] - Смещение
 * @returns {Promise<{success: boolean, data: {total: number, average_rating: number|null, items: Array}, error: any}>}
 */
export const getProductReviews = async ({ product_id, limit = 20, offset = 0 }) => {
  if (!product_id) {
    return {
      success: false,
      data: null,
      error: 'Product ID is required',
    };
  }

  return crmApi.request(`/reviews/product/${product_id}`, {
    params: { limit, offset },
    useCache: false,
  });
};

/**
 * Создать отзыв
 * @param {Object} data
 * @param {number} data.product_id - ID товара
 * @param {number} data.rating - Оценка (1.0 – 5.0)
 * @param {string} [data.text] - Текст отзыва
 * @param {string} [data.images_json] - JSON-массив объектов {upload_id, ordering}
 * @returns {Promise<{success: boolean, data: Object, error: any}>}
 */
export const createReview = async ({ product_id, rating, text, images_json }) => {
  const formData = new FormData();
  formData.append('product_id', product_id);
  formData.append('rating', rating);
  if (text !== undefined && text !== null) {
    formData.append('text', text);
  }
  if (images_json) {
    formData.append('images_json', images_json);
  }

  return crmApi.request('/reviews', {
    method: 'POST',
    data: formData,
    useCache: false,
  });
};

/**
 * Обновить отзыв
 * @param {Object} params
 * @param {number} params.review_id - ID отзыва
 * @param {number} [params.rating] - Новая оценка
 * @param {string} [params.text] - Новый текст
 * @param {string} [params.images_json] - JSON-массив операций с изображениями
 * @returns {Promise<{success: boolean, data: Object, error: any}>}
 */
export const updateReview = async ({ review_id, rating, text, images_json }) => {
  const formData = new FormData();
  if (rating !== undefined && rating !== null) {
    formData.append('rating', rating);
  }
  if (text !== undefined && text !== null) {
    formData.append('text', text);
  }
  if (images_json) {
    formData.append('images_json', images_json);
  }

  return crmApi.request(`/reviews/${review_id}`, {
    method: 'PUT',
    data: formData,
    useCache: false,
  });
};

/**
 * Удалить отзыв
 * @param {number} review_id - ID отзыва
 * @returns {Promise<{success: boolean, data: Object, error: any}>}
 */
export const deleteReview = async (review_id) => {
  return crmApi.request(`/reviews/${review_id}`, {
    method: 'DELETE',
    useCache: false,
  });
};

/**
 * Получить отзыв по ID
 * @param {number} review_id - ID отзыва
 * @returns {Promise<{success: boolean, data: Object, error: any}>}
 */
export const getReviewById = async (review_id) => {
  return crmApi.request(`/reviews/${review_id}`, {
    useCache: false,
  });
};

const reviewApi = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
};

export default reviewApi;
