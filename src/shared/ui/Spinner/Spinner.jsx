import styles from './Spinner.module.css';

/**
 * Компонент Spinner
 * @param {Object} props
 * @param {'small' | 'medium' | 'large'} props.size - Размер спиннера
 * @param {string} props.className - Дополнительный CSS класс
 */
const Spinner = ({ size = 'medium', className = '' }) => {
  const sizeClass = styles[size];

  return (
    <svg
      className={`${styles.spinner} ${sizeClass} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className={styles.spinnerTrack}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className={styles.spinnerArrow}
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Spinner;
