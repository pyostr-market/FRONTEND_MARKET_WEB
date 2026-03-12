import { FiUser, FiHeart, FiShoppingCart, FiGrid, FiPackage, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import paths from '../../app/router/paths';
import styles from './Header.module.css';

const CATEGORIES = [
  'Смартфоны',
  'Телевизоры',
  'Планшеты',
  'Компьютеры',
  'Ноутбуки',
  'Бытовая техника',
  'Одежда',
  'Детям',
];

const Header = ({ onProfileClick, isAuthorized = false }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <Link to={paths.HOME} className={styles.logo}>
              <img src="/logo.png" alt="Marketplace" className={styles.logoImage} />
            </Link>
            <button className={styles.catalogBtn}>
              <FiGrid size={18} />
              <span>Каталог</span>
              <FiChevronDown size={16} />
            </button>
          </div>

          <div className={styles.headerCenter}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Поиск товаров"
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.headerRight}>
            <button className={styles.headerActionBtn} title="Заказы">
              <FiPackage size={20} />
              <span className={styles.actionLabel}>Заказы</span>
            </button>
            <button className={styles.headerActionBtn} title="Профиль" onClick={onProfileClick}>
              <FiUser size={20} />
              <span className={styles.actionLabel}>Профиль</span>
            </button>
            <button className={styles.headerActionBtn} title="Избранное">
              <FiHeart size={20} />
              <span className={styles.actionLabel}>Избранное</span>
            </button>
            <Link to={paths.CART} className={styles.headerActionBtn} title="Корзина">
              <FiShoppingCart size={20} />
              <span className={styles.actionLabel}>Корзина</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.categoriesBar}>
        <div className={styles.categoriesContainer}>
          {CATEGORIES.map((category) => (
            <Link key={category} to={paths.CATALOG} className={styles.categoryItem}>
              {category}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
