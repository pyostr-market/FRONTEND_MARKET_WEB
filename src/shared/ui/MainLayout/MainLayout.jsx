import { useState, useEffect } from 'react';
import Header from '../../../widgets/Header/Header';
import MobileHeader from '../../../widgets/MobileHeader/MobileHeader';
import MobileNavbar from '../../../widgets/MobileNavbar/MobileNavbar';
import ProfileModal from '../../../widgets/ProfileModal/ProfileModal';
import Footer from '../../../widgets/Footer/Footer';
import styles from './MainLayout.module.css';

const MainLayout = ({ children, showSearch = true }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserAuthorized, setIsUserAuthorized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsUserAuthorized(!!token);
  }, []);

  // Определение мобильного устройства по ширине экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProfileClick = () => {
    if (isUserAuthorized) {
      // Если авторизован - переходим в профиль
      window.location.href = '/profile';
    } else if (isMobile) {
      // На мобильном переходим на страницу авторизации
      window.location.href = '/auth';
    } else {
      // На ПК открываем модальное окно
      setIsProfileModalOpen(true);
    }
  };

  // Закрываем модальное окно при авторизации
  useEffect(() => {
    if (isUserAuthorized) {
      setIsProfileModalOpen(false);
    }
  }, [isUserAuthorized]);

  return (
    <div className={styles.mainLayout}>
      <Header onProfileClick={handleProfileClick} isAuthorized={isUserAuthorized} />
      <MobileHeader showSearch={showSearch} />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Footer />
      <MobileNavbar />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};

export default MainLayout;
