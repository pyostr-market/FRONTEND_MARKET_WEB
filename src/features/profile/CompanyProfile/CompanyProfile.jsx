import { useState, useEffect } from 'react';
import styles from './CompanyProfile.module.css';

const CompanyProfile = ({ profileData, disabled, saving, onSave }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    tax_id: '',
    legal_address: '',
    actual_address: '',
  });

  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);

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

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Введите название компании';
    }

    if (formData.company_name.length > 255) {
      newErrors.company_name = 'Максимум 255 символов';
    }

    if (!formData.tax_id.trim()) {
      newErrors.tax_id = 'Введите ИНН';
    } else if (!/^\d{10,12}$/.test(formData.tax_id.replace(/\s/g, ''))) {
      newErrors.tax_id = 'ИНН должен содержать 10 или 12 цифр';
    }

    if (formData.legal_address.length > 500) {
      newErrors.legal_address = 'Максимум 500 символов';
    }

    if (formData.actual_address.length > 500) {
      newErrors.actual_address = 'Максимум 500 символов';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      company_profile: {
        company_name: formData.company_name.trim(),
        tax_id: formData.tax_id.replace(/\s/g, ''),
        legal_address: formData.legal_address.trim() || null,
        actual_address: formData.actual_address.trim() || null,
      },
    };

    const result = await onSave(payload);

    if (result?.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>Юридическое лицо</h2>

          <p className={styles.subtitle}>
            Реквизиты компании для выставления счетов и документов
          </p>

          {isSaved && (
              <div className={styles.saved}>Сохранено</div>
          )}
        </div>

        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>

            <div className={styles.grid}>

              <div className={styles.field}>
                <label className={styles.label}>Название компании</label>

                <input
                    value={formData.company_name}
                    onChange={handleChange('company_name')}
                    className={`${styles.input} ${errors.company_name ? styles.error : ''}`}
                    placeholder="ООО «Рога и Копыта»"
                    disabled={disabled || saving}
                    autoComplete="organization"
                />

                {errors.company_name && (
                    <div className={styles.errorText}>{errors.company_name}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>ИНН</label>

                <input
                    value={formData.tax_id}
                    onChange={handleChange('tax_id')}
                    className={`${styles.input} ${errors.tax_id ? styles.error : ''}`}
                    placeholder="1234567890"
                    disabled={disabled || saving}
                    maxLength={15}
                />

                {errors.tax_id && (
                    <div className={styles.errorText}>{errors.tax_id}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Юридический адрес</label>

                <input
                    value={formData.legal_address}
                    onChange={handleChange('legal_address')}
                    className={`${styles.input} ${errors.legal_address ? styles.error : ''}`}
                    placeholder="г. Москва, ул. Ленина, д. 1"
                    disabled={disabled || saving}
                />

                {errors.legal_address && (
                    <div className={styles.errorText}>{errors.legal_address}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Фактический адрес</label>

                <input
                    value={formData.actual_address}
                    onChange={handleChange('actual_address')}
                    className={`${styles.input} ${errors.actual_address ? styles.error : ''}`}
                    placeholder="г. Москва, ул. Ленина, д. 1"
                    disabled={disabled || saving}
                />

                {errors.actual_address && (
                    <div className={styles.errorText}>{errors.actual_address}</div>
                )}
              </div>

            </div>

            <button
                type="submit"
                className={styles.saveButton}
                disabled={disabled || saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>

          </form>
        </div>
      </div>
  );
};

export default CompanyProfile;