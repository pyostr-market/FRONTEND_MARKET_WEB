import { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import styles from './ProfileModal.module.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Phone:', phone);
    onClose();
  };

  return (
    <div className={styles.profileModalOverlay} onClick={onClose}>
      <div className={styles.profileModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.profileModalHeader}>
          <h2>Вход в профиль</h2>
          <button className={styles.profileModalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.profileModalBody}>
          <div className={styles.profileIconWrapper}>
            <FiUser size={48} />
          </div>

          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <label className={styles.profileFormLabel}>
              Номер телефона
              <input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.profileFormInput}
                autoFocus
              />
            </label>

            <button type="submit" className={styles.profileSubmitBtn}>
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
