import styles from './Button.module.css';

/**
 * Компонент Button
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое кнопки
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} props.variant - Вариант кнопки
 * @param {'small' | 'medium' | 'large'} props.size - Размер кнопки
 * @param {boolean} props.disabled - Отключена ли кнопка
 * @param {boolean} props.loading - Состояние загрузки
 * @param {string} props.className - Дополнительный CSS класс
 * @param {function} props.onClick - Обработчик клика
 * @param {string} props.type - Тип кнопки (button, submit, reset)
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    disabled ? styles.disabled : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className={styles.spinner} viewBox="0 0 24 24" fill="none">
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
      )}
      <span className={loading ? styles.loadingText : ''}>{children}</span>
    </button>
  );
};

export default Button;
