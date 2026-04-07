import { useState, useEffect, useCallback } from 'react';
import { FiLogOut, FiUser, FiShoppingBag, FiHeart, FiMonitor, FiChevronLeft, FiChevronRight, FiRefreshCw, FiTool, FiMessageSquare, FiStar } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Tabs from '../../shared/ui/Tabs/Tabs';
import Spinner from '../../shared/ui/Spinner/Spinner';
import Toast from '../../shared/ui/Toast/Toast';
import IndividualProfile from '../../features/profile/IndividualProfile/IndividualProfile';
import CompanyProfile from '../../features/profile/CompanyProfile/CompanyProfile';
import SessionsList from '../../features/profile/SessionsList/SessionsList';
import useProfile from '../../shared/hooks/useProfile';
import styles from './ProfilePage.module.css';
import logoImg from '../../logo.png';

// Вкладки левого меню
const SIDEBAR_TABS = [
  { key: 'personal', label: 'Личные данные', icon: <FiUser size={20} />, accent: 'blue' },
  { key: 'orders', label: 'Заказы', icon: <FiShoppingBag size={20} />, accent: 'purple' },
  { key: 'tradein', label: 'Trade-in', icon: <FiRefreshCw size={20} />, accent: 'cyan' },
  { key: 'repair', label: 'Ремонт', icon: <FiTool size={20} />, accent: 'orange' },
  { key: 'reviews', label: 'Отзывы', icon: <FiMessageSquare size={20} />, accent: 'yellow' },
  { key: 'sessions', label: 'Активные сессии', icon: <FiMonitor size={20} />, accent: 'indigo' },
  { key: 'referrals', label: 'Реферальная система', icon: <FiStar size={20} />, accent: 'green' },
  { key: 'loyalty', label: 'Программа лояльности', icon: <FiHeart size={20} />, accent: 'pink' },
];

// Вкладки личных данных
const PROFILE_TABS = [
  { key: 'individual', label: 'Физическое лицо' },
  { key: 'company', label: 'Юридическое лицо' },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSidebarTab, setActiveSidebarTab] = useState('personal');
  const [activeProfileTab, setActiveProfileTab] = useState('individual');
  const [toast, setToast] = useState({ isOpen: false, type: 'info', message: '' });

  const {
    profile,
    loading,
    error,
    saving,
    updateProfile,
    refreshProfile,
    getDefaultTab,
  } = useProfile();

  // Определяем активную вкладку после загрузки профиля
  useEffect(() => {
    if (!loading && profile) {
      setActiveProfileTab(getDefaultTab());
    }
  }, [loading, profile, getDefaultTab]);

  // Синхронизация URL-параметра с активной вкладкой (мобильная навигация)
  // На мобильной версии: ?tab=personal — раздел открыт, без ?tab — экран выбора разделов
  const mobileTab = searchParams.get('tab');
  const isMobileContentVisible = !!mobileTab;

  // При клике на раздел — ставим ?tab=key
  const handleSidebarTabChange = useCallback((key) => {
    setActiveSidebarTab(key);
    setSearchParams({ tab: key }, { replace: false });
  }, [setSearchParams]);

  // Кнопка «Назад» на мобильном — убираем ?tab, возвращаемся к выбору разделов
  const handleMobileBack = useCallback(() => {
    setSearchParams({}, { replace: false });
  }, [setSearchParams]);

  // При загрузке страницы если есть ?tab — активируем его
  useEffect(() => {
    if (mobileTab && SIDEBAR_TABS.find(t => t.key === mobileTab)) {
      setActiveSidebarTab(mobileTab);
    }
  }, [mobileTab]);

  // Слушаем popstate (кнопка «Назад» браузера) — если ?tab убран, сбрасываем
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (!tab) {
        // Пользователь вернулся назад — сбрасываем на экран разделов
        setActiveSidebarTab('personal');
      } else if (SIDEBAR_TABS.find(t => t.key === tab)) {
        setActiveSidebarTab(tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    navigate('/');
  };

  /**
   * Извлекает текстовое сообщение из объекта ошибки
   */
  const extractErrorMessage = (err) => {
    if (!err) return 'Произошла ошибка';
    if (typeof err === 'string') return err;
    if (typeof err === 'object') {
      return err.message || err.detail || err.error?.message || JSON.stringify(err);
    }
    return 'Произошла ошибка';
  };

  const handleTerminateSession = async (sessionId) => {
    const { terminateSession } = await import('../../shared/api/userApi');
    const result = await terminateSession(sessionId);
    if (result.success) {
      setToast({
        isOpen: true,
        type: 'success',
        message: 'Сессия завершена',
      });
      await refreshProfile();
    } else {
      const errMsg = extractErrorMessage(result.error);
      setToast({
        isOpen: true,
        type: 'error',
        message: errMsg,
      });
    }
  };

  const handleTerminateAllSessions = async () => {
    const { terminateAllSessions } = await import('../../shared/api/userApi');
    const result = await terminateAllSessions();
    if (result.success) {
      const count = result.data?.terminated_count || 0;
      setToast({
        isOpen: true,
        type: 'success',
        message: `Завершено сессий: ${count}`,
      });
      await refreshProfile();
    } else {
      const errMsg = extractErrorMessage(result.error);
      setToast({
        isOpen: true,
        type: 'error',
        message: errMsg,
      });
    }
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
        message: extractErrorMessage(result.error),
      });
    }

    return result;
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  };

  // Заглушка для неразработанных разделов
  const renderPlaceholder = (title, icon, accentColor) => (
    <div className={styles.placeholder}>
      <div className={`${styles.placeholderIcon} ${styles[`placeholderIcon--${accentColor}`]}`}>
        {icon}
      </div>
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
      const errorMessage = extractErrorMessage(error);

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
        return renderPlaceholder('Заказы', <FiShoppingBag size={32} />, 'purple');

      case 'tradein':
        return renderPlaceholder('Trade-in', <FiRefreshCw size={32} />, 'cyan');

      case 'repair':
        return renderPlaceholder('Ремонт', <FiTool size={32} />, 'orange');

      case 'reviews':
        return renderPlaceholder('Отзывы', <FiMessageSquare size={32} />, 'yellow');

      case 'sessions':
        return (
          <SessionsList
            sessions={profile?.sessions || []}
            currentSessionId={null}
            onTerminateSession={handleTerminateSession}
            onTerminateAll={handleTerminateAllSessions}
            onRefresh={refreshProfile}
          />
        );

      case 'referrals':
        return renderPlaceholder('Реферальная система', <FiStar size={32} />, 'green');

      case 'loyalty':
        return renderPlaceholder('Программа лояльности', <FiHeart size={32} />, 'pink');

      default:
        return null;
    }
  };

  const activeTabData = SIDEBAR_TABS.find(t => t.key === activeSidebarTab);

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        {/* Боковая панель — десктоп */}
        <aside className={styles.sidebar}>
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
              <FiLogOut size={16} />
              <span>Выйти</span>
            </button>
          </div>
        </aside>

        {/* Основной контент — десктоп */}
        <main className={styles.mainContent}>
          {renderContent()}
        </main>

        {/* Мобильный вид: выбор разделов (скрыт на десктопе) */}
        <div className={`${styles.mobileSections} ${!isMobileContentVisible ? styles.mobileSectionsActive : ''}`}>
          {/* Шапка с логотипом и баллами */}
          <div className={styles.mobileHeader}>
            <div className={styles.mobileHeaderTop}>
              <div className={styles.mobileLogo}>
                <img src={logoImg} alt="Marker" className={styles.mobileLogoImg} />
              </div>
              <div className={styles.mobilePoints}>
                <span className={styles.mobilePointsValue}>2 000</span>
                <span className={styles.mobilePointsLabel}>баллов</span>
              </div>
            </div>
          </div>
          
          <div className={styles.mobileSectionsList}>
            {SIDEBAR_TABS.map((tab) => (
              <button
                key={tab.key}
                className={styles.mobileSectionRow}
                onClick={() => handleSidebarTabChange(tab.key)}
              >
                <div className={`${styles.mobileSectionRowIcon} ${styles[`mobileSectionRowIcon--${tab.accent}`]}`}>
                  {tab.icon}
                </div>
                <span className={styles.mobileSectionRowLabel}>{tab.label}</span>
                <FiChevronRight size={18} className={styles.mobileSectionRowArrow} />
              </button>
            ))}
          </div>
          <div className={styles.mobileSectionsFooter}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <FiLogOut size={16} />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {/* Мобильный вид: содержимое раздела (скрыт на десктопе) */}
        <div className={`${styles.mobileContent} ${isMobileContentVisible ? styles.mobileContentActive : ''}`}>
          <div className={styles.mobileContentHeader}>
            <button className={styles.mobileContentBack} onClick={handleMobileBack}>
              <FiChevronLeft size={20} />
              <span>Назад</span>
            </button>
            <span className={styles.mobileContentTitle}>{activeTabData?.label}</span>
          </div>
          <div className={styles.mobileContentBody}>
            {renderContent()}
          </div>
        </div>
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
