import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './Toast.module.css';

/**
 * Компонент Toast-уведомления
 * @param {Object} props
 * @param {'success' | 'error' | 'info'} props.type - Тип уведомления
 * @param {string} props.message - Сообщение
 * @param {boolean} props.isOpen - Открыто ли уведомление
 * @param {function} props.onClose - Callback при закрытии
 * @param {number} props.duration - Время отображения в мс (0 = не закрывать автоматически)
 */
const Toast = ({ type = 'info', message, isOpen, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: <FiCheckCircle size={20} />,
    error: <FiXCircle size={20} />,
    info: <FiInfo size={20} />,
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastContent}>
        <span className={styles.toastIcon}>{icons[type]}</span>
        <span className={styles.toastMessage}>{message}</span>
      </div>
      <button className={styles.toastClose} onClick={onClose}>
        <FiX size={18} />
      </button>
    </div>
  );
};

export default Toast;
