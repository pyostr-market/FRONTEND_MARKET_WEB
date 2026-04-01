import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../app/store/cartStore';
import { AddToCart } from '../../features/add-to-cart';
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
    getItemQuantity,
    getTotalQuantity,
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

  // Режим 1: Товар не в корзине
  if (quantity === 0) {
    return (
      <div className={styles.mobileCartBar}>
        <AddToCart productId={productId} />
      </div>
    );
  }

  // Режим 2: Товар в корзине
  const totalPrice = price * quantity;
  return (
    <div className={styles.mobileCartBar}>
      <Link to="/cart" className={styles.cartLink}>
        <div className={styles.cartInfo}>
          <span className={styles.cartLabel}>В корзине</span>
          <span className={styles.cartTotal}>{formatPrice(totalPrice)}</span>
        </div>
      </Link>

      <div className={styles.quantityControl}>
        <AddToCart productId={productId} />
      </div>
    </div>
  );
};

export default MobileCartButton;
