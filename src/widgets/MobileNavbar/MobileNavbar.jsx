import { memo, useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser, FiLogIn } from 'react-icons/fi';
import CartBadge from './CartBadge';
import WishlistBadge from './WishlistBadge';
import paths from '../../app/router/paths';
import styles from './MobileNavbar.module.css';

/**
 * Проверка авторизации — читаем напрямую из localStorage
 */
const checkAuth = () => {
  try {
    return !!localStorage.getItem('access_token');
  } catch {
    return false;
  }
};

const MobileNavbar = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const isUserAuthorized = checkAuth();
  const [catalogClickCount, setCatalogClickCount] = useState(0);

  const pathname = location.pathname;
  const isProductPage = pathname.startsWith('/product/');
  const isCatalogPage = pathname === paths.CATALOG;

  /**
   * Обработка клика по кнопке "Каталог":
   * - С товарной страницы или второе нажатие — назад
   * - С других страниц — обычный переход в каталог
   */
  const handleCatalogClick = useCallback((e) => {
    if (isProductPage || (isCatalogPage && catalogClickCount > 0)) {
      e.preventDefault();
      navigate(-1);
      setCatalogClickCount(0);
    } else {
      setCatalogClickCount((prev) => prev + 1);
    }
  }, [isProductPage, isCatalogPage, catalogClickCount, navigate]);

  // Сброс счётчика при переходе на страницы, не связанные с каталогом
  useEffect(() => {
    if (!isProductPage && !isCatalogPage && catalogClickCount > 0) {
      setCatalogClickCount(0);
    }
  }, [isProductPage, isCatalogPage, catalogClickCount]);

  const profilePath = isUserAuthorized ? paths.PROFILE : paths.AUTH;
  const ProfileIcon = isUserAuthorized ? FiUser : FiLogIn;
  const profileLabel = isUserAuthorized ? 'Профиль' : 'Войти';

  // Определяем активный путь
  const homeActive = pathname === paths.HOME || pathname === '/';
  const catalogActive = pathname === paths.CATALOG;
  const cartActive = pathname === paths.CART;
  const wishlistActive = pathname === paths.WISHLIST;
  // Профиль — может быть с query params (?tab=orders)
  const profileActive = pathname === paths.PROFILE || pathname.startsWith(paths.PROFILE + '?');

  return (
    <nav className={styles.mobileNavbar} aria-label="Мобильная навигация">
      <div className={styles.mobileNavbarContainer}>
        {/* Главная */}
        <Link
          to={paths.HOME}
          className={`${styles.mobileNavItem}${homeActive ? ' ' + styles.active : ''}`}
        >
          <div className={styles.navItemContent}>
            <FiHome size={24} />
          </div>
          <span>Главная</span>
        </Link>

        {/* Каталог */}
        <Link
          to={paths.CATALOG}
          className={`${styles.mobileNavItem}${catalogActive ? ' ' + styles.active : ''}`}
          onClick={handleCatalogClick}
        >
          <div className={styles.navItemContent}>
            <FiGrid size={24} />
          </div>
          <span>Каталог</span>
        </Link>

        {/* Корзина */}
        <Link
          to={paths.CART}
          className={`${styles.mobileNavItem}${cartActive ? ' ' + styles.active : ''}`}
        >
          <div className={styles.navItemContent}>
            <FiShoppingCart size={24} />
            <CartBadge />
          </div>
          <span>Корзина</span>
        </Link>

        {/* Избранное */}
        <Link
          to={paths.WISHLIST}
          className={`${styles.mobileNavItem}${wishlistActive ? ' ' + styles.active : ''}`}
        >
          <div className={styles.navItemContent}>
            <FiHeart size={24} />
            <WishlistBadge />
          </div>
          <span>Избранное</span>
        </Link>

        {/* Профиль / Войти */}
        <Link
          to={profilePath}
          className={`${styles.mobileNavItem}${profileActive ? ' ' + styles.active : ''}`}
        >
          <div className={styles.navItemContent}>
            <ProfileIcon size={24} />
          </div>
          <span>{profileLabel}</span>
        </Link>
      </div>
    </nav>
  );
});

MobileNavbar.displayName = 'MobileNavbar';

export default MobileNavbar;
