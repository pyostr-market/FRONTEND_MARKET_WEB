import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import paths from '../../app/router/paths';
import SearchOverlay from '../SearchOverlay/SearchOverlay';
import styles from './MobileHeader.module.css';

const MobileHeader = () => {
  return (
    <header className={styles.mobileHeader}>
      <div className={styles.mobileHeaderContainer}>
        <div className={styles.mobileSearchWrapper}>
          <SearchOverlay variant="mobile" />
        </div>
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
