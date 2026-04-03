import { memo } from 'react';
import { useWishlist } from '../../app/store/wishlistStore';
import styles from './MobileNavbar.module.css';

/**
 * Отдельный memo-компонент для бейджа избранного.
 * Перерендеривается только при изменении количества в избранном.
 */
const WishlistBadge = memo(() => {
  const { getTotalCount } = useWishlist();
  const count = getTotalCount();

  if (count <= 0) return null;

  return <span className={styles.navBadge}>{count}</span>;
});

WishlistBadge.displayName = 'WishlistBadge';

export default WishlistBadge;
