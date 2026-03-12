import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import paths from '../../app/router/paths';
import styles from './MobileNavbar.module.css';

const MobileNavbar = ({ onProfileClick }) => {
  const location = useLocation();

  const navItems = [
    { path: paths.HOME, icon: FiHome, label: 'Главная' },
    { path: paths.CATALOG, icon: FiGrid, label: 'Каталог' },
    { path: paths.CART, icon: FiShoppingCart, label: 'Корзина' },
    { path: paths.WISHLIST, icon: FiHeart, label: 'Избранное' },
    { icon: FiUser, label: 'Профиль', isModal: true },
  ];

  return (
    <nav className={styles.mobileNavbar}>
      <div className={styles.mobileNavbarContainer}>
        {navItems.map((item, index) => {
          const { path, icon: Icon, label, isModal } = item;

          if (isModal) {
            return (
              <button
                key={label}
                className={styles.mobileNavItem}
                onClick={onProfileClick}
              >
                <Icon size={24} />
                <span>{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={`${styles.mobileNavItem} ${location.pathname === path ? styles.active : ''}`}
            >
              <Icon size={24} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;
