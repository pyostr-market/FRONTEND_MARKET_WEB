import { FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import paths from '../../app/router/paths';
import styles from './MobileHeader.module.css';

const MobileHeader = ({ onProfileClick }) => {
  return (
    <header className={styles.mobileHeader}>
      <div className={styles.mobileHeaderContainer}>
        <Link to={paths.HOME} className={styles.mobileLogo}>
          Marketplace
        </Link>
        <button className={styles.searchTriggerBtn} onClick={onProfileClick}>
          Поиск
        </button>
        <Link to={paths.CART} className={styles.mobileCartBtn}>
          <FiShoppingCart size={24} />
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
