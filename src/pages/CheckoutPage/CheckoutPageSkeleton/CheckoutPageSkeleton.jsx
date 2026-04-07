import styles from './CheckoutPageSkeleton.module.css';

/**
 * Скелетон страницы оформления заказа
 * Повторяет структуру: форма получателя, доставка, оплата, комментарий, товары, итого
 */
const CheckoutPageSkeleton = () => {
  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutContainer}>
        {/* Кнопка назад */}
        <div className={styles.skeletonBackButton}>
          <div className={styles.skeletonBackIcon} />
          <div className={styles.skeletonBackText} />
        </div>

        {/* Заголовок */}
        <h1 className={styles.checkoutTitle}>
          <div className={styles.skeletonTitleLine} />
        </h1>

        <div className={styles.checkoutContent}>
          {/* Левая колонка — форма */}
          <div className={styles.checkoutForm}>
            {/* Получатель */}
            <div className={styles.section}>
              <div className={styles.skeletonSectionTitle} />
              <div className={styles.typeTabs}>
                <div className={styles.skeletonTypeTab} />
                <div className={styles.skeletonTypeTab} />
              </div>
              <div className={styles.formGrid}>
                {[...Array(4)].map((_, i) => (
                  <div key={`recipient-${i}`} className={styles.skeletonInput} />
                ))}
              </div>
            </div>

            {/* Доставка */}
            <div className={styles.section}>
              <div className={styles.skeletonSectionTitle} />
              <div className={styles.deliveryTabs}>
                {[...Array(3)].map((_, i) => (
                  <div key={`delivery-${i}`} className={styles.skeletonDeliveryTab} />
                ))}
              </div>
            </div>

            {/* Оплата */}
            <div className={styles.section}>
              <div className={styles.skeletonSectionTitle} />
              <div className={styles.paymentTabs}>
                {[...Array(2)].map((_, i) => (
                  <div key={`payment-${i}`} className={styles.skeletonPaymentTab} />
                ))}
              </div>
            </div>

            {/* Комментарий */}
            <div className={styles.section}>
              <div className={styles.skeletonSectionTitle} />
              <div className={styles.skeletonComment} />
            </div>

            {/* Состав заказа — мобильная версия */}
            <div className={styles.section}>
              <div className={styles.skeletonSectionTitle} />
              <div className={styles.orderItems}>
                {[...Array(3)].map((_, i) => (
                  <div key={`order-item-${i}`} className={styles.orderItem}>
                    <div className={styles.orderItemImage}>
                      <div className={styles.skeletonOrderImage} />
                    </div>
                    <div className={styles.orderItemInfo}>
                      <div className={styles.skeletonOrderName} />
                      <div className={styles.skeletonOrderQty} />
                    </div>
                    <div className={styles.skeletonOrderPrice} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка — итого (десктоп) */}
          <div className={styles.checkoutSummary}>
            <div className={styles.skeletonSummaryTitle} />
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
            <div className={styles.skeletonSubmitBtn} />
            <div className={styles.skeletonSummaryNote} />
          </div>
        </div>

        {/* Мобильная панель итого */}
        <div className={styles.mobileSummary}>
          <div className={styles.mobileSummaryInfo}>
            <div className={styles.skeletonMobileTotalLabel} />
            <div className={styles.skeletonMobileTotalValue} />
            <div className={styles.skeletonMobileTotalItems} />
          </div>
          <div className={styles.skeletonMobileSubmitBtn} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageSkeleton;
