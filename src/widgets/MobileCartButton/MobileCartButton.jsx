import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../app/store/cartStore';
import styles from './MobileCartButton.module.css';

/**
 * Мобильная кнопка корзины
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
    MAX_ITEM_QUANTITY,
  } = useCart();

  const quantity = getItemQuantity(productId);
  const [isAnimating, setIsAnimating] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const formatPrice = useCallback((p) => {
    if (!p) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(p);
  }, []);

  const handleAddToCart = useCallback(() => {
    addToCart(productId, 1);
    setIsAnimating(true);
    setJustAdded(true);
    setTimeout(() => setIsAnimating(false), 800);
    setTimeout(() => setJustAdded(false), 1200);
  }, [productId, addToCart]);

  const handleIncrement = useCallback(() => {
    if (quantity < MAX_ITEM_QUANTITY) {
      incrementQuantity(productId);
    }
  }, [quantity, productId, incrementQuantity, MAX_ITEM_QUANTITY]);

  const handleDecrement = useCallback(() => {
    if (quantity <= 1) {
      removeFromCart(productId);
    } else {
      decrementQuantity(productId);
    }
  }, [quantity, productId, decrementQuantity, removeFromCart]);

  const totalPrice = price * quantity;
  const inCart = quantity > 0;

  return (
    <div className={`${styles.mobileCartBar} ${isAnimating ? styles.animating : ''}`}>
      {/* Кнопка, которая превращается (60% ширины) */}
      <div className={`${styles.mainButtonWrapper} ${inCart ? styles.mainButtonWrapperCart : ''}`}>
        <div className={`${styles.mainButton} ${inCart ? styles.mainButtonCart : ''}`}>
          {/* Текст "Добавить в корзину" */}
          <span className={`${styles.addText} ${inCart ? styles.addTextHidden : ''}`}>
            <FiShoppingCart size={20} className={styles.buttonIcon} />
            Добавить в корзину
          </span>
          
          {/* Ссылка "В корзине" + сумма (две строки) */}
          <Link to="/cart" className={`${styles.cartText} ${inCart ? styles.cartTextVisible : ''}`}>
            <span className={styles.cartTop}>
              {justAdded ? (
                <FiCheck size={16} className={styles.checkIcon} />
              ) : (
                <FiShoppingCart size={16} className={styles.miniCartIcon} />
              )}
              <span className={styles.cartLabel}>В корзине</span>
            </span>
            <span className={styles.cartSum}>{formatPrice(totalPrice)}</span>
          </Link>
          
          {/* Невидимая кнопка для добавления (только когда не в корзине) */}
          {!inCart && (
            <button 
              className={styles.buttonOverlay}
              onClick={handleAddToCart}
              type="button"
            />
          )}
        </div>
      </div>

      {/* Счётчик справа (40% ширины) */}
      <div className={`${styles.quantityControlWrapper} ${inCart ? styles.quantityControlVisible : ''}`}>
        <div className={styles.quantityControl}>
          <button
            className={styles.quantityBtn}
            onClick={handleDecrement}
            aria-label="Уменьшить количество"
            type="button"
          >
            <FiMinus size={16} />
          </button>
          <span className={styles.quantityValue}>{quantity}</span>
          <button
            className={styles.quantityBtn}
            onClick={handleIncrement}
            disabled={quantity >= MAX_ITEM_QUANTITY}
            aria-label="Увеличить количество"
            type="button"
          >
            <FiPlus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCartButton;
