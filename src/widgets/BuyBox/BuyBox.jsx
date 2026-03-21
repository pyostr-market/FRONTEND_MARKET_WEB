import { useState, useCallback, useMemo } from 'react';
import { FiShoppingCart, FiHeart, FiShare2 } from 'react-icons/fi';
import { useCart } from '../../app/store/cartStore';
import styles from './BuyBox.module.css';

/**
 * Блок покупки товара (цена, количество, корзина)
 * @param {Object} props
 * @param {Object} props.product - Товар
 * @param {Function} props.onVariantChange - Callback при смене варианта
 */
const BuyBox = ({ product, onVariantChange }) => {
  const { addToCart, getItemQuantity, isInCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Форматирование цены
  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽';
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(numPrice);
  }, []);

  // Текущая цена
  const currentPrice = useMemo(() => {
    return product?.price ? parseFloat(product.price) : 0;
  }, [product?.price]);

  // Общая сумма
  const totalPrice = useMemo(() => {
    return currentPrice * quantity;
  }, [currentPrice, quantity]);

  // Количество в корзине
  const cartQuantity = isInCart(product?.id) ? getItemQuantity(product?.id) : 0;

  /**
   * Увеличить количество
   */
  const handleIncrement = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, 10));
  }, []);

  /**
   * Уменьшить количество
   */
  const handleDecrement = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  }, []);

  /**
   * Изменение количества input
   */
  const handleQuantityChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setQuantity(Math.min(Math.max(value, 1), 10));
    }
  }, []);

  /**
   * Добавить в корзину
   */
  const handleAddToCart = useCallback(() => {
    if (product?.id) {
      addToCart(product.id, quantity);
    }
  }, [product?.id, quantity, addToCart]);

  /**
   * Купить сейчас
   */
  const handleBuyNow = useCallback(() => {
    if (product?.id) {
      addToCart(product.id, quantity);
      // Переход в корзину будет реализован позже
    }
  }, [product?.id, quantity, addToCart]);

  if (!product) {
    return null;
  }

  return (
    <div className={styles.buyBox}>
      {/* Цена */}
      <div className={styles.priceSection}>
        <div className={styles.currentPrice}>{formatPrice(product.price)}</div>
        {product.old_price && (
          <div className={styles.oldPrice}>{formatPrice(product.old_price)}</div>
        )}
      </div>

      {/* Информация о наличии */}
      <div className={styles.availability}>
        <span className={styles.inStock}>✓ В наличии</span>
        {product.supplier?.name && (
          <span className={styles.seller}>Продавец: {product.supplier.name}</span>
        )}
      </div>

      {/* Количество */}
      <div className={styles.quantitySection}>
        <label className={styles.quantityLabel}>Количество:</label>
        <div className={styles.quantityControl}>
          <button
            className={styles.quantityBtn}
            onClick={handleDecrement}
            disabled={quantity <= 1}
            aria-label="Уменьшить количество"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className={styles.quantityInput}
            min="1"
            max="10"
          />
          <button
            className={styles.quantityBtn}
            onClick={handleIncrement}
            disabled={quantity >= 10}
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>
      </div>

      {/* Итоговая сумма */}
      <div className={styles.totalSection}>
        <span className={styles.totalLabel}>Итого:</span>
        <span className={styles.totalPrice}>{formatPrice(totalPrice.toString())}</span>
      </div>

      {/* Кнопки действий */}
      <div className={styles.actionsSection}>
        <button
          className={styles.addToCartBtn}
          onClick={handleAddToCart}
          disabled={cartQuantity >= 10}
        >
          <FiShoppingCart size={20} />
          {cartQuantity > 0 ? `В корзине (${cartQuantity})` : 'Добавить в корзину'}
        </button>

        <button
          className={styles.buyNowBtn}
          onClick={handleBuyNow}
        >
          Купить сейчас
        </button>
      </div>

      {/* Дополнительные действия */}
      <div className={styles.extraActions}>
        <button className={styles.extraBtn} aria-label="В избранное">
          <FiHeart size={20} />
          <span>В избранное</span>
        </button>

        <button className={styles.extraBtn} aria-label="Поделиться">
          <FiShare2 size={20} />
          <span>Поделиться</span>
        </button>
      </div>

      {/* Доставка */}
      <div className={styles.deliveryInfo}>
        <div className={styles.deliveryItem}>
          <span className={styles.deliveryIcon}>🚚</span>
          <div>
            <div className={styles.deliveryTitle}>Бесплатная доставка</div>
            <div className={styles.deliveryText}>от 2 999 ₽</div>
          </div>
        </div>
        <div className={styles.deliveryItem}>
          <span className={styles.deliveryIcon}>📦</span>
          <div>
            <div className={styles.deliveryTitle}>Срок доставки</div>
            <div className={styles.deliveryText}>2-5 дней</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyBox;
