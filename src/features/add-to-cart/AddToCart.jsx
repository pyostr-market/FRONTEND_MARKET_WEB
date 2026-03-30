import { useCart } from '../../app/store/cartStore';
import { FiShoppingCart } from 'react-icons/fi';
import styles from './AddToCart.module.css';

/**
 * Компонент кнопки добавления в корзину
 * @param {Object} props
 * @param {number} props.productId - ID товара
 * @param {Function} [props.onQuantityChange] - Callback при изменении количества
 */
const AddToCart = ({ productId, onQuantityChange }) => {
  const {
    addToCart,
    removeFromCart,
    getItemQuantity,
    incrementQuantity,
    decrementQuantity,
    MAX_ITEM_QUANTITY,
  } = useCart();

  const quantity = getItemQuantity(productId);

  const handleAddToCart = () => {
    if (quantity === 0) {
      addToCart(productId, 1);
      onQuantityChange?.(1);
    }
  };

  const handleIncrement = () => {
    if (quantity < MAX_ITEM_QUANTITY) {
      incrementQuantity(productId);
      onQuantityChange?.(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      // Не удаляем товар сразу, а только сообщаем о желании уменьшить до 0
      onQuantityChange?.(0);
    } else {
      decrementQuantity(productId);
      onQuantityChange?.(quantity - 1);
    }
  };

  if (quantity === 0) {
    return (
        <button
            className={styles.addButtonFull}
            onClick={handleAddToCart}
            data-add-to-cart={productId}
        >
          <FiShoppingCart className={styles.cartIcon} />
          Добавить
        </button>
    );
  }

  return (
      <div className={styles.quantityControlFull}>
        <button className={styles.quantityButton} onClick={handleDecrement}>−</button>
        <span className={styles.quantityValue}>{quantity}</span>
        <button
            className={styles.quantityButton}
            onClick={handleIncrement}
            disabled={quantity >= MAX_ITEM_QUANTITY}
        >
          +
        </button>
      </div>
  );
};

export default AddToCart;