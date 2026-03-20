import { useState, useEffect, useCallback } from 'react';
import { getProductsByIds } from '../api/catalogApi';

/**
 * Хук для загрузки товаров корзины по ID
 * @param {Array<number>} productIds - Массив ID товаров
 * @returns {Object}
 */
const useCartProducts = (productIds = []) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загрузка товаров
   */
  const loadProducts = useCallback(async (force = false) => {
    if (!productIds || productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getProductsByIds(productIds, force);

      if (result.success) {
        // Сортируем товары в том же порядке, что и ID в корзине
        const sortedProducts = productIds
          .map((id) => result.data.items.find((item) => item.id === id))
          .filter(Boolean);

        setProducts(sortedProducts);
      } else {
        setError(result.error?.message || 'Ошибка загрузки товаров');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error loading cart products:', err);
      setError(err.message || 'Ошибка загрузки товаров');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [productIds]);

  /**
   * Загрузка при изменении productIds
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * Принудительное обновление
   */
  const refresh = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refresh,
  };
};

export default useCartProducts;
