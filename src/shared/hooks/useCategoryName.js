import { useState, useEffect, useCallback } from 'react';
import { crmApi } from '../api/apiClient';

/**
 * Хук для получения названия категории по ID
 * @param {number|null} categoryId - ID категории
 * @returns {Object} { categoryName, loading }
 */
const useCategoryName = (categoryId) => {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCategory = useCallback(async () => {
    if (!categoryId) {
      setCategoryName('');
      return;
    }

    setLoading(true);

    try {
      // Получаем дерево категорий и ищем нужную
      const result = await crmApi.request('/category/tree', {
        params: {},
      });

      if (result.success) {
        // Рекурсивный поиск категории по ID
        const findCategory = (items) => {
          for (const item of items) {
            if (item.id === parseInt(categoryId, 10)) {
              return item.name;
            }
            if (item.children && item.children.length > 0) {
              const found = findCategory(item.children);
              if (found) return found;
            }
          }
          return null;
        };

        const name = findCategory(result.data?.items || []);
        if (name) {
          setCategoryName(name);
        } else {
          setCategoryName(`Категория ${categoryId}`);
        }
      } else {
        setCategoryName(`Категория ${categoryId}`);
      }
    } catch (err) {
      console.error('Error loading category:', err);
      setCategoryName(`Категория ${categoryId}`);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  return { categoryName, loading };
};

export default useCategoryName;
