import { useState } from 'react';
import { FiUser, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Phone:', phone);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        {/* Header с кнопкой назад */}
        <div className={styles.authHeader}>
          <button className={styles.backBtn} onClick={handleBack}>
            <FiArrowLeft size={20} />
          </button>
          <span className={styles.headerTitle}>Вход в профиль</span>
          <div className={styles.headerSpacer} />
        </div>

        {/* Основной контент */}
        <div className={styles.authBody}>
          {/* Иконка профиля */}
          <div className={styles.profileIconWrapper}>
            <FiUser size={40} />
          </div>

          {/* Заголовок */}
          <h1 className={styles.title}>Вход в профиль</h1>
          <p className={styles.subtitle}>
            Введите номер телефона для входа или регистрации
          </p>

          {/* Форма */}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <label className={styles.formLabel}>
              <span className={styles.labelText}>Номер телефона</span>
              <input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.formInput}
                autoFocus
              />
            </label>

            <button type="submit" className={styles.submitBtn}>
              Продолжить
            </button>
          </form>

          {/* Дополнительная информация */}
          <p className={styles.termsText}>
            Нажимая «Продолжить», вы соглашаетесь с{' '}
            <a href="/terms" className={styles.link}>условиями использования</a>{' '}
            и{' '}
            <a href="/privacy" className={styles.link}>политикой конфиденциальности</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
