import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../app/store/cartStore';
import LazyImage from '../../shared/ui/LazyImage';
import { DEFAULT_IMAGES } from '../../shared/config/appConfig';
import paths from '../../app/router/paths';
import styles from './CartPage.module.css';

/**
 * Страница корзины
 */
const CartPage = () => {
  const {
    cartItems,
    setItemQuantity,
    removeFromCart,
    clearCart,
    getTotalQuantity,
    MAX_ITEM_QUANTITY,
  } = useCart();

  const totalItems = getTotalQuantity();

  /**
   * Форматирование цены
   */
  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽';
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(numPrice);
  }, []);

  /**
   * Обработчик изменения количества
   */
  const handleQuantityChange = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setItemQuantity(productId, Math.min(newQuantity, MAX_ITEM_QUANTITY));
    }
  }, [removeFromCart, setItemQuantity, MAX_ITEM_QUANTITY]);

  /**
   * Обработчик удаления товара
   */
  const handleRemoveItem = useCallback((productId) => {
    removeFromCart(productId);
  }, [removeFromCart]);

  /**
   * Товары в корзине (заглушка, пока нет API для получения деталей товаров)
   */
  const cartProducts = useMemo(() => {
    // Временные данные для демонстрации
    // В реальности здесь будет запрос к API для получения деталей товаров по ID
    return Object.entries(cartItems).map(([productId, quantity]) => ({
      id: parseInt(productId, 10),
      name: `Товар ${productId}`,
      price: (1000 + parseInt(productId, 10) * 100).toString(),
      image: null,
      quantity,
      maxQuantity: MAX_ITEM_QUANTITY,
    }));
  }, [cartItems, MAX_ITEM_QUANTITY]);

  /**
   * Общая сумма
   */
  const totalPrice = useMemo(() => {
    return cartProducts.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  }, [cartProducts]);

  /**
   * Пустая корзина
   */
  if (cartProducts.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <FiShoppingCart size={80} />
          </div>
          <h1 className={styles.emptyCartTitle}>Корзина пуста</h1>
          <p className={styles.emptyCartText}>
            Выберите товары в каталоге и добавьте их в корзину
          </p>
          <Link to={paths.CATALOG} className={styles.emptyCartButton}>
            Перейти в каталог
            <FiArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartContainer}>
        <h1 className={styles.cartTitle}>Корзина</h1>

        <div className={styles.cartContent}>
          {/* Список товаров */}
          <div className={styles.cartItems}>
            {cartProducts.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                {/* Изображение */}
                <div className={styles.itemImage}>
                  <LazyImage
                    src={item.image || DEFAULT_IMAGES.NOT_FOUND}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                </div>

                {/* Информация о товаре */}
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                </div>

                {/* Количество */}
                <div className={styles.itemQuantity}>
                  <button
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    aria-label="Уменьшить количество"
                  >
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value, 10))
                    }
                    className={styles.quantityInput}
                    min="1"
                    max={item.maxQuantity}
                  />
                  <button
                    className={styles.quantityButton}
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.maxQuantity}
                    aria-label="Увеличить количество"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {/* Итого за товар */}
                <div className={styles.itemTotal}>
                  {formatPrice((parseFloat(item.price) * item.quantity).toString())}
                </div>

                {/* Удалить */}
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="Удалить товар"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Итоговая панель */}
          <div className={styles.cartSummary}>
            <h2 className={styles.summaryTitle}>Итого</h2>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Товары ({totalItems} шт.)</span>
              <span className={styles.summaryValue}>
                {formatPrice(totalPrice.toString())}
              </span>
            </div>

            <div className={styles.summaryTotal}>
              <span className={styles.totalLabel}>Общая сумма:</span>
              <span className={styles.totalValue}>
                {formatPrice(totalPrice.toString())}
              </span>
            </div>

            <Link to={paths.CHECKOUT} className={styles.checkoutButton}>
              Оформить заказ
              <FiArrowRight size={20} />
            </Link>

            <button className={styles.clearButton} onClick={clearCart}>
              Очистить корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
