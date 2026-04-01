import { useState, useEffect, useCallback } from 'react';
import { getProductRecommendations } from '../api/catalogApi';

/**
 * Хук для загрузки рекомендаций товара
 * @param {Object} params
 * @param {number} params.product_id - ID товара
 * @param {string} [params.relation_type] - Тип связи (accessory, similar, bundle, upsell)
 * @param {number} [params.limit=20] - Количество элементов
 * @returns {Object} { recommendations, loading, error }
 */
const useProductRecommendations = ({
  product_id,
  relation_type,
  limit = 20,
} = {}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загрузка рекомендаций
   */
  const loadRecommendations = useCallback(async () => {
    if (!product_id) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getProductRecommendations({
        product_id,
        relation_type,
        limit,
      });

      if (result.success && result.data?.items) {
        setRecommendations(result.data.items);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError(err.message || 'Ошибка загрузки рекомендаций');
    } finally {
      setLoading(false);
    }
  }, [product_id, relation_type, limit]);

  /**
   * Загрузка при монтировании или изменении параметров
   */
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refetch: loadRecommendations,
  };
};

export default useProductRecommendations;
