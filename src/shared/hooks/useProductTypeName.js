import { useState, useEffect, useCallback } from 'react';
import { getProductTypes } from '../../features/productTypes';

/**
 * Хук для получения названия типа товара по ID
 * @param {number|null} productTypeId - ID типа товара
 * @returns {Object} { productTypeName, loading }
 */
const useProductTypeName = (productTypeId) => {
  const [productTypeName, setProductTypeName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadProductType = useCallback(async () => {
    if (!productTypeId) {
      setProductTypeName('');
      return;
    }

    setLoading(true);

    try {
      const result = await getProductTypes({});

      if (result.success) {
        // Ищем тип товара по ID
        const findType = (items) => {
          for (const item of items) {
            if (item.id === parseInt(productTypeId, 10)) {
              return item.name;
            }
            if (item.children && item.children.length > 0) {
              const found = findType(item.children);
              if (found) return found;
            }
          }
          return null;
        };

        const name = findType(result.data?.items || []);
        if (name) {
          setProductTypeName(name);
        } else {
          setProductTypeName(`Тип товара ${productTypeId}`);
        }
      } else {
        setProductTypeName(`Тип товара ${productTypeId}`);
      }
    } catch (err) {
      console.error('Error loading product type:', err);
      setProductTypeName(`Тип товара ${productTypeId}`);
    } finally {
      setLoading(false);
    }
  }, [productTypeId]);

  useEffect(() => {
    loadProductType();
  }, [loadProductType]);

  return { productTypeName, loading };
};

export default useProductTypeName;
