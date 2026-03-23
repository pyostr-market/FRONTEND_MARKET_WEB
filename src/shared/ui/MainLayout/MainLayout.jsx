import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import Header from '../../../widgets/Header/Header';
import MobileHeader from '../../../widgets/MobileHeader/MobileHeader';
import MobileNavbar from '../../../widgets/MobileNavbar/MobileNavbar';
import ProfileModal from '../../../widgets/ProfileModal/ProfileModal';
import styles from './MainLayout.module.css';

const MainLayout = ({ children, showSearch = true }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const isAuthorized = false;
  
  // Проверка на мобильное устройство
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const handleProfileClick = () => {
    if (isMobile) {
      // На мобильном переходим на страницу авторизации
      window.location.href = '/auth';
    } else {
      // На ПК открываем модальное окно
      setIsProfileModalOpen(true);
    }
  };

  return (
    <div className={styles.mainLayout}>
      <Header onProfileClick={handleProfileClick} isAuthorized={isAuthorized} />
      <MobileHeader showSearch={showSearch} />
      <main className={styles.mainContent}>
        {children}
      </main>
      <MobileNavbar />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};

export default MainLayout;
