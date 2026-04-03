import { useState, useEffect } from 'react';
import Input from '../../../shared/ui/Input/Input';
import Button from '../../../shared/ui/Button/Button';
import styles from './IndividualProfile.module.css';

/**
 * Компонент профиля физического лица
 * @param {Object} props
 * @param {Object} props.profileData - Данные профиля из API
 * @param {boolean} props.disabled - Отключен ли компонент
 * @param {boolean} props.saving - Сохранение в процессе
 * @param {function} props.onSave - Callback при сохранении
 */
const IndividualProfile = ({ profileData, disabled, saving, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
  });
  const [errors, setErrors] = useState({});

  // Заполняем форму данными из профиля
  useEffect(() => {
    if (profileData?.individual_profile) {
      setFormData({
        first_name: profileData.individual_profile.first_name || '',
        last_name: profileData.individual_profile.last_name || '',
        middle_name: profileData.individual_profile.middle_name || '',
      });
    }
  }, [profileData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'Введите имя';
    } else if (formData.first_name.length > 100) {
      newErrors.first_name = 'Имя не должно превышать 100 символов';
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Введите фамилию';
    } else if (formData.last_name.length > 100) {
      newErrors.last_name = 'Фамилия не должна превышать 100 символов';
    }

    if (formData.middle_name && formData.middle_name.length > 100) {
      newErrors.middle_name = 'Отчество не должно превышать 100 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      individual_profile: {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name.trim() || null,
      },
    };

    await onSave(payload);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2 className={styles.title}>Физическое лицо</h2>
        <p className={styles.subtitle}>
          Личные данные для оформления заказов и доставки
        </p>
      </div>

      <div className={styles.fields}>
        <Input
          label="Фамилия"
          value={formData.last_name}
          onChange={handleChange('last_name')}
          placeholder="Иванов"
          disabled={disabled || saving}
          error={!!errors.last_name}
          errorText={errors.last_name}
          required
          autoComplete="family-name"
        />

        <Input
          label="Имя"
          value={formData.first_name}
          onChange={handleChange('first_name')}
          placeholder="Иван"
          disabled={disabled || saving}
          error={!!errors.first_name}
          errorText={errors.first_name}
          required
          autoComplete="given-name"
        />

        <Input
          label="Отчество"
          value={formData.middle_name}
          onChange={handleChange('middle_name')}
          placeholder="Петрович"
          disabled={disabled || saving}
          error={!!errors.middle_name}
          errorText={errors.middle_name}
          autoComplete="additional-name"
        />
      </div>

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          size="medium"
          loading={saving}
          disabled={disabled}
        >
          Сохранить
        </Button>
      </div>
    </form>
  );
};

export default IndividualProfile;
