import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    navigate('/');
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1 className={styles.title}>Профиль</h1>
        </div>

        <div className={styles.profileBody}>
          {/* Заглушка профиля */}
          <div className={styles.profilePlaceholder}>
            <div className={styles.placeholderIcon}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className={styles.placeholderTitle}>Профиль в разработке</h2>
            <p className={styles.placeholderText}>
              Скоро здесь появится информация о вашем профиле, заказах и настройках
            </p>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FiLogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
