import styles from './CartPageSkeleton.module.css';

/**
 * Скелетон страницы корзины
 * Отображает placeholder-элементы вместо реальных товаров и итоговой панели
 */
const CartPageSkeleton = () => {
  return (
    <div className={styles.cartPage}>
      <div className={styles.cartContainer}>
        <h1 className={styles.cartTitle}>Корзина</h1>

        <div className={styles.cartContent}>
          {/* Список товаров — скелетоны карточек */}
          <div className={styles.cartItems}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.cartItem}>
                {/* Изображение */}
                <div className={styles.itemImage}>
                  <div className={styles.skeletonImage} />
                </div>

                {/* Информация */}
                <div className={styles.itemInfo}>
                  <div className={styles.skeletonPrice} />
                  <div className={styles.skeletonName} />
                  <div className={styles.skeletonArticle} />
                  <div className={styles.itemBadges}>
                    <div className={styles.skeletonBadge} />
                    <div className={styles.skeletonBadge} />
                  </div>
                </div>

                {/* Действия */}
                <div className={styles.itemActions}>
                  <div className={styles.itemBottomActions}>
                    <div className={styles.skeletonWishlistBtn} />
                    <div className={styles.skeletonRemoveBtn} />
                    <div className={styles.skeletonAddToCart} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Итоговая панель — скелетон */}
          <div className={styles.cartSummary}>
            <div className={styles.skeletonSummaryTitle} />
            <div className={styles.summaryRow}>
              <div className={styles.skeletonSummaryLabel} />
              <div className={styles.skeletonSummaryValue} />
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.skeletonSummaryLabel} />
              <div className={styles.skeletonSummaryValue} />
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.skeletonSummaryLabel} />
              <div className={styles.skeletonSummaryValueFree} />
            </div>
            <div className={styles.summaryTotal}>
              <div className={styles.skeletonTotalLabel} />
              <div className={styles.skeletonTotalValue} />
            </div>
            <div className={styles.summaryBenefits}>
              <div className={styles.skeletonBenefit} />
              <div className={styles.skeletonBenefit} />
            </div>
            <div className={styles.skeletonCheckoutBtn} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPageSkeleton;
