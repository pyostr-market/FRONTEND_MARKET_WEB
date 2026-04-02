import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import styles from './CookieBanner.module.css';

const COOKIE_CONSENT_KEY = 'cookie_consent';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Проверка мобильного устройства
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Проверка согласия на куки
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      // Показываем баннер с небольшой задержкой
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.cookieBanner} ${isMobile ? styles.mobile : ''}`}>
      <div className={styles.content}>
        <p className={styles.text}>
          Мы используем файлы cookie для улучшения работы сайта.
          Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
          <Link to="/cookie-policy" className={styles.link}>
            Политикой использования файлов cookie
          </Link>
        </p>
        <button
          className={styles.acceptButton}
          onClick={handleAccept}
          type="button"
        >
          Согласен
        </button>
      </div>
      <button
        className={styles.closeButton}
        onClick={handleAccept}
        aria-label="Закрыть"
        type="button"
      >
        <FiX size={20} />
      </button>
    </div>
  );
};

export default CookieBanner;
