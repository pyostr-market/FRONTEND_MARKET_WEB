import { useState } from 'react';
import Header from '../../../widgets/Header/Header';
import MobileHeader from '../../../widgets/MobileHeader/MobileHeader';
import MobileNavbar from '../../../widgets/MobileNavbar/MobileNavbar';
import ProfileModal from '../../../widgets/ProfileModal/ProfileModal';
import styles from './MainLayout.module.css';

const MainLayout = ({ children, showSearch = true }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const isAuthorized = false;

  return (
    <div className={styles.mainLayout}>
      <Header onProfileClick={() => setIsProfileModalOpen(true)} isAuthorized={isAuthorized} />
      <MobileHeader showSearch={showSearch} />
      <main className={styles.mainContent}>
        {children}
      </main>
      <MobileNavbar onProfileClick={() => setIsProfileModalOpen(true)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};

export default MainLayout;
