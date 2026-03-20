import { useState, useRef, useEffect } from 'react';
import { FiUser, FiHeart, FiShoppingCart, FiGrid, FiPackage, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../../app/store/cartStore';
import paths from '../../app/router/paths';
import SearchOverlay from '../SearchOverlay/SearchOverlay';
import { ProductTypeMenu } from '../ProductTypeMenu';
import CatalogMenu from '../CatalogMenu';
import styles from './Header.module.css';

const Header = ({ onProfileClick, isAuthorized = false }) => {
  const { getTotalQuantity } = useCart();
  const cartCount = getTotalQuantity();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const catalogRef = useRef(null);

  // Закрытие при клике вне области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCatalogOpen && catalogRef.current && !catalogRef.current.contains(event.target)) {
        setIsCatalogOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCatalogOpen]);

  // Блокировка прокрутки фона при открытом каталоге
  useEffect(() => {
    if (isCatalogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCatalogOpen]);

  // Отслеживание скролла для скрытия categoriesBar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={styles.header}>
      {/* Overlay с blur эффектом */}
      {isCatalogOpen && (
        <div className={styles.overlay} onClick={() => setIsCatalogOpen(false)} />
      )}
      
      <div className={styles.headerTop} ref={catalogRef}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <Link to={paths.HOME} className={styles.logo}>
              <img src="/logo.png" alt="Marketplace" className={styles.logoImage} />
            </Link>
            <button
              className={`${styles.catalogBtn} ${isCatalogOpen ? styles.catalogBtnActive : ''}`}
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            >
              {isCatalogOpen ? <FiX size={18} /> : <FiGrid size={18} />}
              <span>Каталог</span>
            </button>
          </div>

          <div className={styles.headerCenter}>
            <SearchOverlay variant="desktop" />
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
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Выпадающее меню каталога - на всю ширину хедера */}
        {isCatalogOpen && (
          <div className={styles.catalogDropdown}>
            <CatalogMenu onClose={() => setIsCatalogOpen(false)} />
          </div>
        )}
      </div>

      <div className={`${styles.categoriesBar} ${isScrolled ? styles.categoriesBarHidden : ''}`}>
        <div className={styles.categoriesContainer}>
          <ProductTypeMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
