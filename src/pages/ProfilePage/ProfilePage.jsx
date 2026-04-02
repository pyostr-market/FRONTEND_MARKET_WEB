import { useState, useEffect } from 'react';
import { FiLogOut, FiUser, FiShoppingBag, FiGift, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Tabs from '../../shared/ui/Tabs/Tabs';
import Spinner from '../../shared/ui/Spinner/Spinner';
import Toast from '../../shared/ui/Toast/Toast';
import IndividualProfile from '../../features/profile/IndividualProfile/IndividualProfile';
import CompanyProfile from '../../features/profile/CompanyProfile/CompanyProfile';
import useProfile from '../../shared/hooks/useProfile';
import styles from './ProfilePage.module.css';

// Вкладки левого меню
const SIDEBAR_TABS = [
  { key: 'personal', label: 'Личные данные', icon: <FiUser size={20} /> },
  { key: 'orders', label: 'Заказы', icon: <FiShoppingBag size={20} /> },
  { key: 'referrals', label: 'Реферальная система', icon: <FiGift size={20} /> },
  { key: 'loyalty', label: 'Программа лояльности', icon: <FiHeart size={20} /> },
];

// Вкладки личных данных
const PROFILE_TABS = [
  { key: 'individual', label: 'Физическое лицо' },
  { key: 'company', label: 'Юридическое лицо' },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeSidebarTab, setActiveSidebarTab] = useState('personal');
  const [activeProfileTab, setActiveProfileTab] = useState('individual');
  const [toast, setToast] = useState({ isOpen: false, type: 'info', message: '' });

  const {
    profile,
    loading,
    error,
    saving,
    updateProfile,
    getDefaultTab,
  } = useProfile();

  // Определяем активную вкладку после загрузки профиля
  useEffect(() => {
    if (!loading && profile) {
      setActiveProfileTab(getDefaultTab());
    }
  }, [loading, profile, getDefaultTab]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    navigate('/');
  };

  const handleSaveProfile = async (payload) => {
    const result = await updateProfile(payload);
    
    if (result.success) {
      setToast({
        isOpen: true,
        type: 'success',
        message: 'Данные успешно сохранены',
      });
    } else {
      setToast({
        isOpen: true,
        type: 'error',
        message: result.error?.message || result.error || 'Ошибка при сохранении',
      });
    }
    
    return result;
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  };

  // Заглушка для неразработанных разделов
  const renderPlaceholder = (title, icon) => (
    <div className={styles.placeholder}>
      <div className={styles.placeholderIcon}>{icon}</div>
      <h2 className={styles.placeholderTitle}>{title}</h2>
      <p className={styles.placeholderText}>
        Этот раздел в разработке и скоро появится
      </p>
    </div>
  );

  // Рендер контента в зависимости от активной вкладки
  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner size="large" />
          <p className={styles.loadingText}>Загрузка профиля...</p>
        </div>
      );
    }

    if (error) {
      const errorMessage = typeof error === 'object' 
        ? error?.detail || error?.message || 'Произошла ошибка'
        : error;
      
      return (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{errorMessage}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    switch (activeSidebarTab) {
      case 'personal':
        return (
          <div className={styles.profileContent}>
            <Tabs
              tabs={PROFILE_TABS}
              activeTab={activeProfileTab}
              onTabChange={setActiveProfileTab}
              orientation="horizontal"
            />

            <div className={styles.tabContent}>
              {activeProfileTab === 'individual' && (
                <IndividualProfile
                  profileData={profile}
                  disabled={false}
                  saving={saving}
                  onSave={handleSaveProfile}
                />
              )}
              {activeProfileTab === 'company' && (
                <CompanyProfile
                  profileData={profile}
                  disabled={false}
                  saving={saving}
                  onSave={handleSaveProfile}
                />
              )}
            </div>
          </div>
        );

      case 'orders':
        return renderPlaceholder('Заказы', <FiShoppingBag size={48} />);

      case 'referrals':
        return renderPlaceholder('Реферальная система', <FiGift size={48} />);

      case 'loyalty':
        return renderPlaceholder('Программа лояльности', <FiHeart size={48} />);

      default:
        return null;
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        {/* Боковая панель */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.userAvatar}>
              {profile?.fio ? (
                <span className={styles.avatarText}>
                  {profile.fio.charAt(0).toUpperCase()}
                </span>
              ) : (
                <FiUser size={24} />
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {profile?.fio || 'Пользователь'}
              </span>
              {profile?.is_verified && (
                <span className={styles.verifiedBadge}>✓</span>
              )}
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <Tabs
              tabs={SIDEBAR_TABS}
              activeTab={activeSidebarTab}
              onTabChange={setActiveSidebarTab}
              orientation="vertical"
            />
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <FiLogOut size={20} />
              <span>Выйти</span>
            </button>
          </div>
        </aside>

        {/* Основной контент */}
        <main className={styles.mainContent}>
          {renderContent()}
        </main>
      </div>

      {/* Toast уведомления */}
      <Toast
        type={toast.type}
        message={toast.message}
        isOpen={toast.isOpen}
        onClose={handleCloseToast}
        duration={3000}
      />
    </div>
  );
};

export default ProfilePage;
