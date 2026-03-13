import { FiUser, FiHeart, FiShoppingCart, FiGrid, FiPackage, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import paths from '../../app/router/paths';
import SearchOverlay from '../SearchOverlay/SearchOverlay';
import { ProductTypeMenu } from '../ProductTypeMenu';
import styles from './Header.module.css';

const Header = ({ onProfileClick, isAuthorized = false }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <Link to={paths.HOME} className={styles.logo}>
              <img src="/logo.png" alt="Marketplace" className={styles.logoImage} />
            </Link>
            <button className={styles.catalogBtn}>
              <FiGrid size={18} />
              <span>Каталог</span>
              <FiChevronDown size={16} />
            </button>
          </div>

          <div className={styles.headerCenter}>
            <SearchOverlay variant="desktop" />
          </div>

          <div className={styles.headerRight}>
            <button className={styles.headerActionBtn} title="Заказы">
              <FiPackage size={20} />
              <span className={styles.actionLabel}>Заказы</span>
            </button>
            <button className={styles.headerActionBtn} title="Профиль" onClick={onProfileClick}>
              <FiUser size={20} />
              <span className={styles.actionLabel}>Профиль</span>
            </button>
            <button className={styles.headerActionBtn} title="Избранное">
              <FiHeart size={20} />
              <span className={styles.actionLabel}>Избранное</span>
            </button>
            <Link to={paths.CART} className={styles.headerActionBtn} title="Корзина">
              <FiShoppingCart size={20} />
              <span className={styles.actionLabel}>Корзина</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.categoriesBar}>
        <div className={styles.categoriesContainer}>
          <ProductTypeMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
