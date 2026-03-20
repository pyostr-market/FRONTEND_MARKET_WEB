import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import paths from '../../app/router/paths';
import styles from './CheckoutPage.module.css';

/**
 * Страница оформления заказа
 */
const CheckoutPage = () => {
  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutContainer}>
        <Link to={paths.CART} className={styles.backButton}>
          <FiArrowLeft size={20} />
          Назад в корзину
        </Link>

        <h1 className={styles.checkoutTitle}>Оформление заказа</h1>

        <div className={styles.checkoutContent}>
          <p className={styles.checkoutText}>
            Страница оформления заказа находится в разработке
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
