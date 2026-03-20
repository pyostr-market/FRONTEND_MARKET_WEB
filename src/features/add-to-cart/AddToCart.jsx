import { useCart } from '../../app/store/cartStore';
import styles from './AddToCart.module.css';

/**
 * Компонент кнопки добавления в корзину
 * @param {Object} props
 * @param {number} props.productId - ID товара
 * @param {number} [props.initialQuantity=0] - Начальное количество
 * @param {Function} [props.onQuantityChange] - Callback при изменении количества
 */
const AddToCart = ({ productId, initialQuantity = 0, onQuantityChange }) => {
  const {
    addToCart,
    removeFromCart,
    getItemQuantity,
    incrementQuantity,
    decrementQuantity,
    MAX_ITEM_QUANTITY,
  } = useCart();

  const quantity = getItemQuantity(productId);

  /**
   * Обработчик добавления
   */
  const handleAddToCart = () => {
    if (quantity === 0) {
      addToCart(productId, 1);
    }
  };

  /**
   * Обработчик увеличения
   */
  const handleIncrement = () => {
    if (quantity < MAX_ITEM_QUANTITY) {
      incrementQuantity(productId);
      onQuantityChange?.(quantity + 1);
    }
  };

  /**
   * Обработчик уменьшения
   */
  const handleDecrement = () => {
    if (quantity <= 1) {
      removeFromCart(productId);
      onQuantityChange?.(0);
    } else {
      decrementQuantity(productId);
      onQuantityChange?.(quantity - 1);
    }
  };

  // Режим просмотра (товар не добавлен)
  if (quantity === 0) {
    return (
      <button className={styles.addButton} onClick={handleAddToCart}>
        Добавить
      </button>
    );
  }

  // Режим управления количеством
  return (
    <div className={styles.quantityControl}>
      <button
        className={styles.quantityBtn}
        onClick={handleDecrement}
        aria-label="Уменьшить количество"
      >
        −
      </button>
      <span className={styles.quantityValue}>{quantity}</span>
      <button
        className={styles.quantityBtn}
        onClick={handleIncrement}
        disabled={quantity >= MAX_ITEM_QUANTITY}
        aria-label="Увеличить количество"
      >
        +
      </button>
    </div>
  );
};

export default AddToCart;
