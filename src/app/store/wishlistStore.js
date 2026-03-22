import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Контекст избранного (Wishlist)
 * Хранит состояние избранного и методы для управления им
 */
const WishlistContext = createContext(null);

/**
 * Ключ для localStorage
 */
const WISHLIST_STORAGE_KEY = 'marketplace_wishlist';

/**
 * Провайдер избранного
 */
export const WishlistProvider = ({ children }) => {
  // Состояние избранного: Set с ID товаров
  const [wishlistItems, setWishlistItems] = useState(() => {
    // Загрузка из localStorage при начальном рендере
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          console.log('Loaded wishlist from localStorage:', parsed);
          return new Set(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading wishlist from localStorage:', e);
    }
    return new Set();
  });

  // Сохранение в localStorage при изменении
  useEffect(() => {
    try {
      const serialized = JSON.stringify(Array.from(wishlistItems));
      localStorage.setItem(WISHLIST_STORAGE_KEY, serialized);
      console.log('Saved wishlist to localStorage:', wishlistItems);
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlistItems]);

  /**
   * Добавить товар в избранное
   * @param {number} productId - ID товара
   * @returns {boolean} Успешность добавления
   */
  const addToWishlist = useCallback((productId) => {
    if (!productId) return false;

    setWishlistItems((prev) => {
      if (prev.has(productId)) return prev;
      
      const next = new Set(prev);
      next.add(productId);
      return next;
    });

    return true;
  }, []);

  /**
   * Удалить товар из избранного
   * @param {number} productId
   */
  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  }, []);

  /**
   * Переключить статус избранного
   * @param {number} productId
   * @returns {boolean} true если добавлено, false если удалено
   */
  const toggleWishlist = useCallback((productId) => {
    let added = false;
    
    setWishlistItems((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        added = false;
      } else {
        next.add(productId);
        added = true;
      }
      return next;
    });
    
    return added;
  }, []);

  /**
   * Проверить, есть ли товар в избранном
   * @param {number} productId
   * @returns {boolean}
   */
  const isInWishlist = useCallback(
    (productId) => {
      return wishlistItems.has(productId);
    },
    [wishlistItems]
  );

  /**
   * Получить общее количество товаров в избранном
   * @returns {number}
   */
  const getTotalCount = useCallback(() => {
    return wishlistItems.size;
  }, [wishlistItems]);

  /**
   * Получить все ID товаров в избранном
   * @returns {number[]}
   */
  const getWishlistItems = useCallback(() => {
    return Array.from(wishlistItems);
  }, [wishlistItems]);

  /**
   * Очистить избранное
   */
  const clearWishlist = useCallback(() => {
    setWishlistItems(new Set());
  }, []);

  const value = {
    // Состояние
    wishlistItems: getWishlistItems(),

    // Методы добавления/удаления
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,

    // Методы получения информации
    isInWishlist,
    getTotalCount,
    getWishlistItems,

    // Очистка
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

/**
 * Хук для использования избранного
 * @returns {Object}
 */
export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
};

const wishlistStore = {
  WishlistProvider,
  useWishlist,
};

export default wishlistStore;
