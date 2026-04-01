import { useCart } from '../../app/store/cartStore';
import { FiShoppingCart } from 'react-icons/fi';
import styles from './AddToCart.module.css';

/**
 * Компонент кнопки добавления в корзину
 * @param {Object} props
 * @param {number} props.productId - ID товара
 * @param {Function} [props.onQuantityChange] - Callback при изменении количества (productId, newQuantity)
 * @param {boolean} [props.delayedRemoval=false] - Удалять товар с задержкой (для корзины)
 * @param {boolean} [props.mobile=false] - Мобильная версия (увеличенные размеры)
 */
const AddToCart = ({ productId, onQuantityChange, delayedRemoval = false, mobile = false }) => {
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
      onQuantityChange?.(productId, 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < MAX_ITEM_QUANTITY) {
      incrementQuantity(productId);
      onQuantityChange?.(productId, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      if (delayedRemoval) {
        // Для корзины: сообщаем о желании удалить, родитель сам запустит удаление с задержкой
        onQuantityChange?.(productId, 0);
      } else {
        // Для страницы товара: удаляем мгновенно
        removeFromCart(productId);
        onQuantityChange?.(productId, 0);
      }
    } else {
      decrementQuantity(productId);
      onQuantityChange?.(productId, quantity - 1);
    }
  };

  if (quantity === 0) {
    return (
        <button
            className={`${styles.addButtonFull} ${mobile ? styles.addButtonFull_mobile : ''}`}
            onClick={handleAddToCart}
            data-add-to-cart={productId}
        >
          <FiShoppingCart className={styles.cartIcon} />
          Добавить
        </button>
    );
  }

  return (
      <div className={`${styles.quantityControlFull} ${mobile ? styles.quantityControlFull_mobile : ''}`}>
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