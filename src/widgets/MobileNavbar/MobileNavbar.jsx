import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../app/store/cartStore';
import { useWishlist } from '../../app/store/wishlistStore';
import paths from '../../app/router/paths';
import styles from './MobileNavbar.module.css';

const MobileNavbar = () => {
  const location = useLocation();
  const { getTotalQuantity } = useCart();
  const { getTotalCount } = useWishlist();
  const cartCount = getTotalQuantity();
  const wishlistCount = getTotalCount();

  const navItems = [
    { path: paths.HOME, icon: FiHome, label: 'Главная' },
    { path: paths.CATALOG, icon: FiGrid, label: 'Каталог' },
    { path: paths.CART, icon: FiShoppingCart, label: 'Корзина', badge: cartCount },
    { path: paths.WISHLIST, icon: FiHeart, label: 'Избранное', badge: wishlistCount },
    { path: paths.AUTH, icon: FiUser, label: 'Профиль' },
  ];

  return (
    <nav className={styles.mobileNavbar}>
      <div className={styles.mobileNavbarContainer}>
        {navItems.map((item) => {
          const { path, icon: Icon, label, badge } = item;

          return (
            <Link
              key={path}
              to={path}
              className={`${styles.mobileNavItem} ${location.pathname === path ? styles.active : ''}`}
            >
              <div className={styles.navItemContent}>
                <Icon size={24} />
                {badge > 0 && (
                  <span className={styles.navBadge}>{badge}</span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;
