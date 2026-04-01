import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser, FiLogIn } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../app/store/cartStore';
import { useWishlist } from '../../app/store/wishlistStore';
import paths from '../../app/router/paths';
import styles from './MobileNavbar.module.css';

const MobileNavbar = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalQuantity } = useCart();
  const { getTotalCount } = useWishlist();
  const cartCount = getTotalQuantity();
  const wishlistCount = getTotalCount();
  const [isUserAuthorized, setIsUserAuthorized] = useState(false);
  const [catalogClickCount, setCatalogClickCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsUserAuthorized(!!token);
  }, []);

  const isProductPage = location.pathname.startsWith('/product/');
  const isCatalogPage = location.pathname === paths.CATALOG;

  /**
   * Обработка клика по кнопке "Каталог"
   * Первое нажатие — возврат назад (как кнопка "Назад")
   * Второе нажатие — переход в начало каталога
   */
  const handleCatalogClick = useCallback((e) => {
    if (isProductPage || (isCatalogPage && catalogClickCount > 0)) {
      // Первое нажатие с страницы товара или второе нажатие с каталога — идём назад
      e.preventDefault();
      navigate(-1);
      setCatalogClickCount(0);
    } else {
      // Обычный переход в каталог
      setCatalogClickCount((prev) => prev + 1);
    }
  }, [isProductPage, isCatalogPage, catalogClickCount, navigate]);

  // Сбрасываем счётчик кликов только при переходе на страницы, не связанные с каталогом
  useEffect(() => {
    const isUnrelatedPage = !isProductPage && !isCatalogPage;
    if (isUnrelatedPage && catalogClickCount > 0) {
      setCatalogClickCount(0);
    }
  }, [isProductPage, isCatalogPage, catalogClickCount]);

  const navItems = useMemo(() => [
    { path: paths.HOME, icon: FiHome, label: 'Главная' },
    { path: paths.CATALOG, icon: FiGrid, label: 'Каталог' },
    { path: paths.CART, icon: FiShoppingCart, label: 'Корзина', badge: cartCount },
    { path: paths.WISHLIST, icon: FiHeart, label: 'Избранное', badge: wishlistCount },
    {
      path: isUserAuthorized ? paths.PROFILE : paths.AUTH,
      icon: isUserAuthorized ? FiUser : FiLogIn,
      label: isUserAuthorized ? 'Профиль' : 'Войти',
    },
  ], [cartCount, wishlistCount, isUserAuthorized]);

  return (
    <nav className={styles.mobileNavbar}>
      <div className={styles.mobileNavbarContainer}>
        {navItems.map((item) => {
          const { path, icon: Icon, label, badge } = item;

          // Для кнопки "Каталог" используем специальную логику
          if (path === paths.CATALOG) {
            return (
              <a
                key={path}
                href={path}
                className={`${styles.mobileNavItem} ${location.pathname === path ? styles.active : ''}`}
                onClick={handleCatalogClick}
              >
                <div className={styles.navItemContent}>
                  <Icon size={24} />
                  {badge > 0 && (
                    <span className={styles.navBadge}>{badge}</span>
                  )}
                </div>
                <span>{label}</span>
              </a>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={`${styles.mobileNavItem} ${location.pathname === path ? styles.active : ''}`}
            >
              <div className={styles.navItemContent}>
                <Icon size={24} />
                {badge > 0 && (
                  <span className={styles.navBadge}>{badge}</span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

export default MobileNavbar;
