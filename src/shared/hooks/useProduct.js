import { useState, useEffect, useCallback, useMemo } from 'react';
import { getProductById, getCategoryProducts, getCatalogFilters } from '../api/catalogApi';

/**
 * Хук для загрузки товара и его вариантов
 * @param {Object} params
 * @param {number} params.product_id - ID товара
 * @param {number} params.category_id - ID категории
 * @returns {Object}
 */
const useProduct = ({ product_id, category_id }) => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загрузка товара
   */
  const loadProduct = useCallback(async (id, catId) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getProductById({ product_id: id, category_id: catId });

      if (result.success && result.data?.item) {
        setProduct(result.data.item);
      } else if (result.error) {
        setError(result.error);
      } else {
        setError('Товар не найден');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.message || 'Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Загрузка вариантов товара (товары той же категории)
   */
  const loadVariants = useCallback(async (categoryId, currentAttributes = {}) => {
    if (!categoryId) return;

    try {
      const result = await getCategoryProducts({
        category_id: categoryId,
        attributes: Object.keys(currentAttributes).length > 0 ? currentAttributes : undefined,
      });

      if (result.success) {
        setVariants(result.data?.items || []);
      }
    } catch (err) {
      console.error('Error loading variants:', err);
    }
  }, []);

  /**
   * Загрузка фильтров категории
   */
  const loadFilters = useCallback(async (categoryId) => {
    if (!categoryId) return;

    try {
      const result = await getCatalogFilters({ category_id: categoryId });

      if (result.success) {
        setFilters(result.data?.filters || []);
      }
    } catch (err) {
      console.error('Error loading filters:', err);
    }
  }, []);

  /**
   * Извлечение доступных значений атрибутов из вариантов
   */
  const availableAttributeValues = useMemo(() => {
    const values = {};

    variants.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        if (attr.is_filterable) {
          if (!values[attr.name]) {
            values[attr.name] = new Set();
          }
          values[attr.name].add(attr.value);
        }
      });
    });

    return values;
  }, [variants]);

  /**
   * Найти вариант по атрибутам
   */
  const findVariantByAttributes = useCallback((attributes) => {
    return variants.find((variant) => {
      return Object.entries(attributes).every(([attrName, attrValue]) => {
        return variant.attributes?.some(
          (attr) => attr.name === attrName && attr.value === attrValue
        );
      });
    });
  }, [variants]);

  /**
   * Загрузка при монтировании
   */
  useEffect(() => {
    if (!product_id) return;

    loadProduct(product_id, category_id);
  }, [product_id, category_id, loadProduct]);

  /**
   * Загрузка вариантов и фильтров при загрузке товара
   */
  useEffect(() => {
    if (!product?.category?.id) return;

    loadVariants(product.category.id);
    loadFilters(product.category.id);
  }, [product?.category?.id, loadVariants, loadFilters]);

  return {
    product,
    variants,
    filters,
    availableAttributeValues,
    findVariantByAttributes,
    loading,
    error,
    loadVariants,
    loadFilters,
  };
};

export default useProduct;
