import { useState, useCallback } from 'react';

/**
 * Форматирует номер телефона в формат +7 (XXX) XXX-XX-XX
 * @param {string} value - Сырое значение номера
 * @returns {string} - Отформатированный номер
 */
const formatPhone = (value) => {
  // Удаляем все нецифровые символы
  const digits = value.replace(/\D/g, '');
  
  // Если начинается с 8, заменяем на 7
  let normalized = digits;
  if (digits.startsWith('8')) {
    normalized = '7' + digits.slice(1);
  }
  
  // Если не начинается с 7, добавляем 7
  if (!normalized.startsWith('7')) {
    normalized = '7' + normalized;
  }
  
  // Ограничиваем длину 11 цифрами
  const limited = normalized.slice(0, 11);
  
  // Форматируем: +7 (XXX) XXX-XX-XX
  if (limited.length <= 1) {
    return limited ? '+7' : '';
  }
  if (limited.length <= 4) {
    return `+7 (${limited.slice(1)}`;
  }
  if (limited.length <= 7) {
    return `+7 (${limited.slice(1, 4)}) ${limited.slice(4)}`;
  }
  if (limited.length <= 9) {
    return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`;
  }
  return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9, 11)}`;
};

/**
 * Хук для ввода номера телефона с маской
 * @param {string} initialValue - Начальное значение
 * @returns {[string, function, string]} - [отформатированное значение, функция изменения, сырое значение]
 */
const usePhoneInput = (initialValue = '') => {
  const [formattedValue, setFormattedValue] = useState(formatPhone(initialValue));
  const [rawValue, setRawValue] = useState(initialValue.replace(/\D/g, ''));

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    
    // Если пользователь стёр всё, разрешаем
    if (!value) {
      setFormattedValue('');
      setRawValue('');
      return;
    }
    
    // Если начинает вводить с 8 или +8
    if (value.startsWith('+8') || value.startsWith('8')) {
      const rest = value.replace(/^[\u002B]?8/, '');
      const newRaw = '7' + rest.replace(/\D/g, '');
      setRawValue(newRaw);
      setFormattedValue(formatPhone(newRaw));
      return;
    }
    
    // Если начинает вводить с +7
    if (value.startsWith('+7')) {
      const rest = value.slice(2).replace(/\D/g, '');
      const newRaw = '7' + rest;
      setRawValue(newRaw);
      setFormattedValue(formatPhone(newRaw));
      return;
    }
    
    // Обычный ввод цифр
    const digits = value.replace(/\D/g, '');
    if (digits) {
      const newRaw = digits.startsWith('7') ? digits : '7' + digits;
      setRawValue(newRaw);
      setFormattedValue(formatPhone(newRaw));
    }
  }, []);

  return [formattedValue, handleChange, rawValue];
};

export { formatPhone };
export default usePhoneInput;
