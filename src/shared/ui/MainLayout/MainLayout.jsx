import { useState } from 'react';
import Header from '../../../widgets/Header/Header';
import MobileHeader from '../../../widgets/MobileHeader/MobileHeader';
import MobileNavbar from '../../../widgets/MobileNavbar/MobileNavbar';
import SearchOverlay from '../../../widgets/SearchOverlay/SearchOverlay';
import ProfileModal from '../../../widgets/ProfileModal/ProfileModal';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className={styles.mainLayout}>
      <Header onProfileClick={() => setIsProfileModalOpen(true)} />
      <MobileHeader onProfileClick={() => setIsProfileModalOpen(true)} />
      <SearchOverlay />
      <main className={styles.mainContent}>
        {children}
      </main>
      <MobileNavbar onProfileClick={() => setIsProfileModalOpen(true)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};

export default MainLayout;
