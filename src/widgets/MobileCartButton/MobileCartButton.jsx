import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../app/store/cartStore';
import styles from './MobileCartButton.module.css';

/**
 * Мобильная кнопка корзины
 * Показывает кнопку "Добавить" или счётчик с кнопками +/-
 * @param {Object} props
 * @param {number} props.productId - ID товара
 * @param {number} props.price - Цена товара
 */
const MobileCartButton = ({ productId, price }) => {
  const {
    addToCart,
    removeFromCart,
    getItemQuantity,
    incrementQuantity,
    decrementQuantity,
    getTotalQuantity,
    MAX_ITEM_QUANTITY,
  } = useCart();

  const quantity = getItemQuantity(productId);
  const totalItems = getTotalQuantity();

  /**
   * Форматирование цены
   */
  const formatPrice = useCallback((p) => {
    if (!p) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(p);
  }, []);

  /**
   * Добавить в корзину
   */
  const handleAddToCart = useCallback(() => {
    if (quantity === 0) {
      addToCart(productId, 1);
    }
  }, [quantity, productId, addToCart]);

  /**
   * Увеличить количество
   */
  const handleIncrement = useCallback(() => {
    if (quantity < MAX_ITEM_QUANTITY) {
      incrementQuantity(productId);
    }
  }, [quantity, productId, incrementQuantity, MAX_ITEM_QUANTITY]);

  /**
   * Уменьшить количество
   */
  const handleDecrement = useCallback(() => {
    if (quantity <= 1) {
      removeFromCart(productId);
    } else {
      decrementQuantity(productId);
    }
  }, [quantity, productId, decrementQuantity, removeFromCart]);

  // Режим 1: Товар не в корзине
  if (quantity === 0) {
    return (
      <div className={styles.mobileCartBar}>
        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
          <FiShoppingCart size={20} />
          <span>Добавить в корзину</span>
        </button>
      </div>
    );
  }

  // Режим 2: Товар в корзине
  const totalPrice = price * quantity;

  return (
    <div className={styles.mobileCartBar}>
      <Link to="/cart" className={styles.cartLink}>
        <FiShoppingCart size={20} />
        <div className={styles.cartInfo}>
          <span className={styles.cartLabel}>В корзине</span>
          <span className={styles.cartTotal}>{formatPrice(totalPrice)}</span>
        </div>
        {totalItems > 0 && (
          <span className={styles.cartBadge}>{totalItems}</span>
        )}
      </Link>

      <div className={styles.quantityControl}>
        <button
          className={styles.quantityBtn}
          onClick={handleDecrement}
          aria-label="Уменьшить количество"
        >
          <FiMinus size={18} />
        </button>
        <span className={styles.quantityValue}>{quantity}</span>
        <button
          className={styles.quantityBtn}
          onClick={handleIncrement}
          disabled={quantity >= MAX_ITEM_QUANTITY}
          aria-label="Увеличить количество"
        >
          <FiPlus size={18} />
        </button>
      </div>
    </div>
  );
};

export default MobileCartButton;
