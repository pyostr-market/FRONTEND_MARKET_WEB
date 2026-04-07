import styles from './WishlistItem.module.css';

/**
 * Скелетон карточки товара в избранном
 */
const WishlistItemSkeleton = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonImage} />
    <div className={styles.skeletonContent}>
      <div className={styles.skeletonPrice} />
      <div className={styles.skeletonName} />
      <div className={styles.skeletonRating} />
      <div className={styles.skeletonButton} />
    </div>
  </div>
);

export default WishlistItemSkeleton;
