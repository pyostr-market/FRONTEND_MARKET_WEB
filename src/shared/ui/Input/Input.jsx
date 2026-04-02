import { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Компонент Input
 * @param {Object} props
 * @param {string} props.value - Значение input
 * @param {function} props.onChange - Обработчик изменения
 * @param {string} props.type - Тип input (text, email, tel, password, etc.)
 * @param {string} props.placeholder - Placeholder
 * @param {boolean} props.disabled - Отключен ли input
 * @param {boolean} props.error - Есть ли ошибка
 * @param {string} props.errorText - Текст ошибки
 * @param {string} props.label - Label для input
 * @param {string} props.className - Дополнительный CSS класс
 * @param {string} props.name - Имя input
 * @param {boolean} props.required - Обязательное ли поле
 * @param {string} props.autoComplete - autoComplete атрибут
 */
const Input = forwardRef(({
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false,
  error = false,
  errorText = '',
  label = '',
  className = '',
  name = '',
  required = false,
  autoComplete,
  ...props
}, ref) => {
  const inputClassNames = [
    styles.input,
    error ? styles.error : '',
    disabled ? styles.disabled : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <label className={styles.label}>
      {label && <span className={styles.labelText}>{label}</span>}
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClassNames}
        name={name}
        required={required}
        autoComplete={autoComplete}
        {...props}
      />
      {error && errorText && (
        <span className={styles.errorText}>{errorText}</span>
      )}
    </label>
  );
});

Input.displayName = 'Input';

export default Input;
