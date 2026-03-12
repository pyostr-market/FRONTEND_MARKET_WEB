import { FiShoppingCart, FiSearch, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import paths from '../../app/router/paths';
import styles from './MobileHeader.module.css';

const MobileHeader = ({ onProfileClick }) => {
  return (
    <header className={styles.mobileHeader}>
      <div className={styles.mobileHeaderContainer}>
        <button className={styles.mobileSearchBtn}>
          <FiSearch size={20} />
          <span className={styles.searchPlaceholder}>Поиск</span>
        </button>
        <div className={styles.mobileActions}>
          <Link to={paths.WISHLIST} className={styles.mobileActionBtn}>
            <FiHeart size={22} />
          </Link>
          <Link to={paths.CART} className={styles.mobileActionBtn}>
            <FiShoppingCart size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
