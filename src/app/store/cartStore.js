import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Контекст корзины
 * Хранит состояние корзины и методы для управления ею
 */
const CartContext = createContext(null);

/**
 * Максимальное количество товара одного вида
 */
const MAX_ITEM_QUANTITY = 10;

/**
 * Ключ для localStorage
 */
const CART_STORAGE_KEY = 'marketplace_cart';

/**
 * Провайдер корзины
 */
export const CartProvider = ({ children }) => {
  // Состояние корзины: { [productId]: quantity }
  const [cartItems, setCartItems] = useState(() => {
    // Загрузка из localStorage при начальном рендере
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (typeof parsed === 'object' && parsed !== null) {
          console.log('Loaded cart from localStorage:', parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
    }
    return {};
  });

  // Сохранение в localStorage при изменении
  useEffect(() => {
    try {
      const serialized = JSON.stringify(cartItems);
      localStorage.setItem(CART_STORAGE_KEY, serialized);
      console.log('Saved cart to localStorage:', cartItems);
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cartItems]);

  /**
   * Добавить товар в корзину
   * @param {number} productId - ID товара
   * @param {number} [quantity=1] - Количество
   * @returns {boolean} Успешность добавления
   */
  const addToCart = useCallback((productId, quantity = 1) => {
    if (!productId || quantity <= 0) return false;

    setCartItems((prev) => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.min(currentQuantity + quantity, MAX_ITEM_QUANTITY);

      return {
        ...prev,
        [productId]: newQuantity,
      };
    });

    return true;
  }, []);

  /**
   * Удалить товар из корзины
   * @param {number} productId
   */
  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Установить количество товара
   * @param {number} productId
   * @param {number} quantity
   */
  const setItemQuantity = useCallback((productId, quantity) => {
    if (!productId) return;

    setCartItems((prev) => {
      if (quantity <= 0 || quantity === null || quantity === undefined) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }

      const newQuantity = Math.min(Math.max(0, quantity), MAX_ITEM_QUANTITY);

      return {
        ...prev,
        [productId]: newQuantity,
      };
    });
  }, []);

  /**
   * Увеличить количество на 1
   * @param {number} productId
   */
  const incrementQuantity = useCallback((productId) => {
    setCartItems((prev) => {
      const currentQuantity = prev[productId] || 0;
      if (currentQuantity >= MAX_ITEM_QUANTITY) return prev;

      return {
        ...prev,
        [productId]: currentQuantity + 1,
      };
    });
  }, []);

  /**
   * Уменьшить количество на 1 (если 0 - удалить)
   * @param {number} productId
   */
  const decrementQuantity = useCallback((productId) => {
    setCartItems((prev) => {
      const currentQuantity = prev[productId] || 0;
      if (currentQuantity <= 1) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [productId]: currentQuantity - 1,
      };
    });
  }, []);

  /**
   * Получить количество товара
   * @param {number} productId
   * @returns {number}
   */
  const getItemQuantity = useCallback(
    (productId) => {
      return cartItems[productId] || 0;
    },
    [cartItems]
  );

  /**
   * Проверить, есть ли товар в корзине
   * @param {number} productId
   * @returns {boolean}
   */
  const isInCart = useCallback(
    (productId) => {
      return !!cartItems[productId];
    },
    [cartItems]
  );

  /**
   * Получить общее количество товаров в корзине
   * @returns {number}
   */
  const getTotalQuantity = useCallback(() => {
    return Object.values(cartItems).reduce((total, qty) => total + qty, 0);
  }, [cartItems]);

  /**
   * Получить количество уникальных товаров
   * @returns {number}
   */
  const getUniqueItemsCount = useCallback(() => {
    return Object.keys(cartItems).length;
  }, [cartItems]);

  /**
   * Очистить корзину
   */
  const clearCart = useCallback(() => {
    setCartItems({});
  }, []);

  /**
   * Получить все товары корзины
   * @returns {Object}
   */
  const getCartItems = useCallback(() => {
    return cartItems;
  }, [cartItems]);

  const value = {
    // Состояние
    cartItems,

    // Методы добавления/удаления
    addToCart,
    removeFromCart,

    // Методы изменения количества
    setItemQuantity,
    incrementQuantity,
    decrementQuantity,

    // Методы получения информации
    getItemQuantity,
    isInCart,
    getTotalQuantity,
    getUniqueItemsCount,
    getCartItems,

    // Очистка
    clearCart,

    // Константы
    MAX_ITEM_QUANTITY,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Хук для использования корзины
 * @returns {Object}
 */
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

const cartStore = {
  CartProvider,
  useCart,
};

export default cartStore;
