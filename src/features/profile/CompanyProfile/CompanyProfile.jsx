import { useState, useEffect } from 'react';
import { FiBriefcase } from 'react-icons/fi';
import Input from '../../../shared/ui/Input/Input';
import Button from '../../../shared/ui/Button/Button';
import styles from './CompanyProfile.module.css';

/**
 * Компонент профиля юридического лица
 * @param {Object} props
 * @param {Object} props.profileData - Данные профиля из API
 * @param {boolean} props.disabled - Отключен ли компонент
 * @param {boolean} props.saving - Сохранение в процессе
 * @param {function} props.onSave - Callback при сохранении
 */
const CompanyProfile = ({ profileData, disabled, saving, onSave }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    tax_id: '',
    legal_address: '',
    actual_address: '',
  });
  const [errors, setErrors] = useState({});

  // Заполняем форму данными из профиля
  useEffect(() => {
    if (profileData?.company_profile) {
      setFormData({
        company_name: profileData.company_profile.company_name || '',
        tax_id: profileData.company_profile.tax_id || '',
        legal_address: profileData.company_profile.legal_address || '',
        actual_address: profileData.company_profile.actual_address || '',
      });
    }
  }, [profileData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.company_name?.trim()) {
      newErrors.company_name = 'Введите название компании';
    } else if (formData.company_name.length > 255) {
      newErrors.company_name = 'Название не должно превышать 255 символов';
    }

    if (!formData.tax_id?.trim()) {
      newErrors.tax_id = 'Введите ИНН';
    } else if (!/^\d{10,12}$/.test(formData.tax_id.replace(/\s/g, ''))) {
      newErrors.tax_id = 'ИНН должен содержать 10 или 12 цифр';
    }

    if (formData.legal_address && formData.legal_address.length > 500) {
      newErrors.legal_address = 'Адрес не должен превышать 500 символов';
    }

    if (formData.actual_address && formData.actual_address.length > 500) {
      newErrors.actual_address = 'Адрес не должен превышать 500 символов';
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
      company_profile: {
        company_name: formData.company_name.trim(),
        tax_id: formData.tax_id.replace(/\s/g, ''),
        legal_address: formData.legal_address.trim() || null,
        actual_address: formData.actual_address.trim() || null,
      },
    };

    await onSave(payload);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FiBriefcase size={24} />
        </div>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Юридическое лицо</h2>
          <p className={styles.subtitle}>
            Реквизиты организации для выставления счетов и документов
          </p>
        </div>
      </div>

      <div className={styles.fields}>
        <Input
          label="Название компании"
          value={formData.company_name}
          onChange={handleChange('company_name')}
          placeholder="ООО «Рога и Копыта»"
          disabled={disabled || saving}
          error={!!errors.company_name}
          errorText={errors.company_name}
          required
          autoComplete="organization"
        />

        <Input
          label="ИНН"
          value={formData.tax_id}
          onChange={handleChange('tax_id')}
          placeholder="1234567890"
          disabled={disabled || saving}
          error={!!errors.tax_id}
          errorText={errors.tax_id}
          required
          autoComplete="off"
          maxLength={15}
        />

        <Input
          label="Юридический адрес"
          value={formData.legal_address}
          onChange={handleChange('legal_address')}
          placeholder="г. Москва, ул. Ленина, д. 1"
          disabled={disabled || saving}
          error={!!errors.legal_address}
          errorText={errors.legal_address}
          autoComplete="street-address"
        />

        <Input
          label="Фактический адрес"
          value={formData.actual_address}
          onChange={handleChange('actual_address')}
          placeholder="г. Москва, ул. Ленина, д. 1"
          disabled={disabled || saving}
          error={!!errors.actual_address}
          errorText={errors.actual_address}
          autoComplete="off"
        />
      </div>

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          size="large"
          loading={saving}
          disabled={disabled}
        >
          Сохранить
        </Button>
      </div>
    </form>
  );
};

export default CompanyProfile;
