import { Link } from 'react-router-dom';
import { FiHome, FiGrid } from 'react-icons/fi';
import paths from '../../app/router/paths';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <span className={styles.errorCode}>404</span>
        </div>
        
        <h1 className={styles.title}>Страница не найдена</h1>
        
        <p className={styles.description}>
          К сожалению, страница, которую вы ищете, не существует или была перемещена.
        </p>
        
        <div className={styles.actions}>
          <Link to={paths.HOME} className={styles.actionButton}>
            <FiHome size={20} />
            <span>На главную</span>
          </Link>
          
          <Link to={paths.CATALOG} className={styles.actionButtonSecondary}>
            <FiGrid size={20} />
            <span>В каталог</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
