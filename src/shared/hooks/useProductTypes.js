import { useState, useEffect, useCallback } from 'react';
import { getProductTypes } from '../../features/productTypes';

/**
 * Хук для загрузки типов товаров
 * @returns {Object} { productTypes, loading, error }
 */
const useProductTypes = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProductTypes = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProductTypes({ f5: force });

      if (result.success) {
        setProductTypes(result.data?.items || []);
      } else {
        setError(result.error?.message || 'Ошибка загрузки типов товаров');
      }
    } catch (err) {
      console.error('Error loading product types:', err);
      setError(err.message || 'Ошибка загрузки типов товаров');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductTypes();
  }, [loadProductTypes]);

  return {
    productTypes,
    loading,
    error,
    refresh: () => loadProductTypes(true),
  };
};

export default useProductTypes;
