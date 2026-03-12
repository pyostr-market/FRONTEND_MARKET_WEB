import { FiUser, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import paths from '../../app/router/paths';
import styles from './Header.module.css';

const Header = ({ onProfileClick }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <Link to={paths.HOME} className={styles.logo}>
            Marketplace
          </Link>
          <button className={styles.catalogBtn}>Каталог</button>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Поиск товаров"
              className={styles.searchInput}
              readOnly
            />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.headerIconBtn} title="Профиль" onClick={onProfileClick}>
            <FiUser size={24} />
          </button>
          <button className={styles.headerIconBtn} title="Избранное">
            <FiHeart size={24} />
          </button>
          <Link to={paths.CART} className={styles.headerIconBtn} title="Корзина">
            <FiShoppingCart size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
