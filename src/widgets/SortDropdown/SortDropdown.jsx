import { useState, useCallback } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import styles from './SortDropdown.module.css';

/**
 * Выпадающий список сортировки (UI компонент)
 * @param {Object} props
 * @param {string} props.sortBy - Текущая сортировка
 * @param {Function} props.onSortChange - Callback при изменении сортировки
 */
const SortDropdown = ({ sortBy, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'price_asc', label: 'Сначала дешевле' },
    { value: 'price_desc', label: 'Сначала дороже' },
  ];

  const currentOption = sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0];

  /**
   * Переключение dropdown
   */
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Выбор опции
   */
  const handleSelect = useCallback(
    (value) => {
      onSortChange?.(value);
      setIsOpen(false);
    },
    [onSortChange]
  );

  /**
   * Закрытие по клику вне
   */
  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  return (
    <div className={styles.sortDropdown} onBlur={handleBlur} tabIndex={0}>
      <button
        className={styles.sortButton}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        <span className={styles.sortLabel}>Сортировка:</span>
        <span className={styles.sortValue}>{currentOption.label}</span>
        <FiChevronDown
          size={16}
          className={`${styles.sortIcon} ${isOpen ? styles.sortIconOpen : ''}`}
        />
      </button>

      {isOpen && (
        <div className={styles.sortMenu}>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.sortOption} ${
                option.value === sortBy ? styles.sortOptionActive : ''
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
