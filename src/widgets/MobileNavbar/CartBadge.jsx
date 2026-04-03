import { memo } from 'react';
import { useCart } from '../../app/store/cartStore';
import styles from './MobileNavbar.module.css';

/**
 * Отдельный memo-компонент для бейджа корзины.
 * Перерендеривается только при изменении количества товаров в корзине.
 */
const CartBadge = memo(() => {
  const { getTotalQuantity } = useCart();
  const count = getTotalQuantity();

  if (count <= 0) return null;

  return <span className={styles.navBadge}>{count}</span>;
});

CartBadge.displayName = 'CartBadge';

export default CartBadge;
