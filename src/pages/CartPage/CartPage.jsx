import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight, FiTruck, FiShield } from 'react-icons/fi';
import { useCart } from '../../app/store/cartStore';
import useCartProducts from '../../shared/hooks/useCartProducts';
import { ProductCardSlider } from '../../shared/ui/ProductCardSlider';
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

  // Получаем ID товаров из корзины
  const productIds = useMemo(() => {
    return Object.keys(cartItems).map((id) => parseInt(id, 10));
  }, [cartItems]);

  // Загружаем реальные товары по ID
  const {
    products,
    loading,
    error,
  } = useCartProducts(productIds);

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
   * Товары в корзине с количествами
   */
  const cartProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      quantity: cartItems[product.id] || 1,
      maxQuantity: MAX_ITEM_QUANTITY,
    }));
  }, [products, cartItems, MAX_ITEM_QUANTITY]);

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
    if (loading) {
      return (
        <div className={styles.cartPage}>
          <div className={styles.cartContainer}>
            <h1 className={styles.cartTitle}>Корзина</h1>
            <div className={styles.loading}>Загрузка товаров...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.cartPage}>
          <div className={styles.cartContainer}>
            <h1 className={styles.cartTitle}>Корзина</h1>
            <div className={styles.error}>Ошибка: {error}</div>
          </div>
        </div>
      );
    }

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
                {/* Изображение со слайдером */}
                <div className={styles.itemImage}>
                  <ProductCardSlider
                    images={item.images || []}
                    alt={item.name}
                  />
                </div>

                {/* Информация о товаре */}
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.itemArticle}>Арт. {item.id}</div>
                  <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                  
                  <div className={styles.itemBadges}>
                    <span className={styles.badge}>
                      <FiTruck size={14} /> Быстрая доставка
                    </span>
                    <span className={styles.badge}>
                      <FiShield size={14} /> Гарантия качества
                    </span>
                  </div>
                </div>

                {/* Количество и удаление */}
                <div className={styles.itemActions}>
                  <div className={styles.itemQuantity}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      aria-label="Уменьшить количество"
                    >
                      <FiMinus size={14} />
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
                      <FiPlus size={14} />
                    </button>
                  </div>

                  <div className={styles.itemTotal}>
                    <span className={styles.itemTotalLabel}>Итого:</span>
                    <span className={styles.itemTotalValue}>
                      {formatPrice((parseFloat(item.price) * item.quantity).toString())}
                    </span>
                  </div>

                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Удалить товар"
                  >
                    <FiTrash2 size={18} />
                    <span className={styles.removeButtonText}>Удалить</span>
                  </button>
                </div>
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

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Доставка</span>
              <span className={styles.summaryValueFree}>Бесплатно</span>
            </div>

            <div className={styles.summaryTotal}>
              <span className={styles.totalLabel}>Общая сумма:</span>
              <span className={styles.totalValue}>
                {formatPrice(totalPrice.toString())}
              </span>
            </div>

            <div className={styles.summaryBenefits}>
              <span className={styles.benefitItem}>
                <FiTruck size={16} /> Бесплатная доставка
              </span>
              <span className={styles.benefitItem}>
                <FiShield size={16} /> Гарантия возврата
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
