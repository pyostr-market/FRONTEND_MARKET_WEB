import { useRef, useLayoutEffect, useEffect, useCallback } from 'react';

const CATALOG_SCROLL_KEY = 'catalogScroll_v2';

/**
 * Хук для сохранения и восстановления позиции скролла каталога
 * @param {Object} params
 * @param {number} params.productsCount - Количество загруженных товаров
 * @param {boolean} params.loading - Индикатор загрузки
 * @param {string} params.categoryId - ID категории для уникальности ключа
 * @param {string} params.productType - ID типа товара
 * @returns {Object}
 */
const useCatalogScroll = ({
  productsCount,
  loading,
  categoryId,
  productType,
  enableRestore = true,
} = {}) => {
  const didRestoreScroll = useRef(false);
  const restoreTimeoutRef = useRef(null);
  const productsCountRef = useRef(productsCount);

  // Обновляем ref при изменении productsCount
  useEffect(() => {
    productsCountRef.current = productsCount;
  }, [productsCount]);

  // Уникальный ключ для этой категории/типа
  const scrollKey = `${CATALOG_SCROLL_KEY}_${categoryId || 'all'}_${productType || 'all'}`;

  /**
   * Сохранение позиции скролла при размонтировании
   */
  const saveScrollPosition = useCallback(() => {
    const scrollData = {
      scrollPos: window.scrollY,
      productsCount: productsCountRef.current,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(scrollKey, JSON.stringify(scrollData));
    console.log('[useCatalogScroll] Saved scroll:', scrollData, 'key:', scrollKey);
  }, [scrollKey]);

  /**
   * Сохранение при размонтировании
   */
  useEffect(() => {
    return () => {
      saveScrollPosition();
    };
  }, [saveScrollPosition]);  // Только saveScrollPosition, без productsCount

  /**
   * Проверка готовности изображений
   */
  const checkImagesLoaded = useCallback(() => {
    const gridEl = document.querySelector('[data-catalog-grid]') ||
                   document.querySelector('.virtualGridWrapper');
    if (!gridEl) return false;

    const images = Array.from(gridEl.querySelectorAll('img'));
    if (images.length === 0) return true;

    return images.every((img) => img.complete && img.naturalHeight !== 0);
  }, []);

  /**
   * Восстановление позиции скролла (только при первом рендере после возврата)
   */
  const restoreScrollPosition = useCallback(() => {
    if (!enableRestore || didRestoreScroll.current) return false;

    const saved = sessionStorage.getItem(scrollKey);
    if (!saved) return false;

    try {
      const { scrollPos, productsCount: savedProductsCount } = JSON.parse(saved);

      // Проверяем, что все товары отрендерены
      if (productsCount < savedProductsCount) {
        return false;
      }

      // Проверяем загрузку изображений
      if (!checkImagesLoaded()) {
        return false;
      }

      // Восстанавливаем позицию
      window.scrollTo(0, scrollPos);
      sessionStorage.removeItem(scrollKey);
      didRestoreScroll.current = true;
      console.log('[useCatalogScroll] Restored scroll:', scrollPos, 'key:', scrollKey);

      return true;
    } catch (e) {
      console.warn('Failed to restore scroll position:', e);
      sessionStorage.removeItem(scrollKey);
      return false;
    }
  }, [enableRestore, scrollKey, productsCount, checkImagesLoaded]);

  /**
   * Автоматическое восстановление при изменении количества товаров
   */
  useLayoutEffect(() => {
    if (loading || !enableRestore) return;

    // Пробуем восстановить сразу
    if (restoreScrollPosition()) {
      return;
    }

    // Если не удалось, пробуем с интервалом
    if (restoreTimeoutRef.current) {
      clearInterval(restoreTimeoutRef.current);
    }

    restoreTimeoutRef.current = setInterval(() => {
      const restored = restoreScrollPosition();
      if (restored) {
        clearInterval(restoreTimeoutRef.current);
        restoreTimeoutRef.current = null;
      }
    }, 50);

    return () => {
      if (restoreTimeoutRef.current) {
        clearInterval(restoreTimeoutRef.current);
        restoreTimeoutRef.current = null;
      }
    };
  }, [productsCount, loading, enableRestore, restoreScrollPosition]);

  /**
   * Сброс флага восстановления при смене категории
   */
  useEffect(() => {
    didRestoreScroll.current = false;
  }, [categoryId, productType]);

  /**
   * Очистка sessionStorage при явном сбросе
   */
  const clearScrollState = useCallback(() => {
    sessionStorage.removeItem(scrollKey);
    didRestoreScroll.current = false;
  }, [scrollKey]);

  return {
    didRestoreScroll: didRestoreScroll.current,
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollState,
    resetRestoreFlag: () => { didRestoreScroll.current = false; },
  };
};

/**
 * Утилита для получения сохранённой позиции скролла
 */
export const getSavedScrollPosition = () => {
  try {
    const saved = sessionStorage.getItem(CATALOG_SCROLL_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to get saved scroll position:', e);
    return null;
  }
};

/**
 * Утилита для очистки сохранённой позиции
 */
export const clearSavedScrollPosition = () => {
  sessionStorage.removeItem(CATALOG_SCROLL_KEY);
};

export default useCatalogScroll;
