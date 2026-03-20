import SearchOverlay from '../SearchOverlay/SearchOverlay';
import styles from './MobileHeader.module.css';

const MobileHeader = () => {
  return (
    <header className={styles.mobileHeader}>
      <div className={styles.mobileHeaderContainer}>
        <div className={styles.mobileSearchWrapper}>
          <SearchOverlay variant="mobile" />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
