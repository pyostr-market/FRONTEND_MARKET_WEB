import { useState, useEffect } from 'react';
import styles from './IndividualProfile.module.css';

const IndividualProfile = ({ profileData, disabled, saving, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
  });

  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);

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

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Введите имя';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Введите фамилию';
    }

    if (formData.first_name.length > 100) {
      newErrors.first_name = 'Максимум 100 символов';
    }

    if (formData.last_name.length > 100) {
      newErrors.last_name = 'Максимум 100 символов';
    }

    if (formData.middle_name.length > 100) {
      newErrors.middle_name = 'Максимум 100 символов';
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
      individual_profile: {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name.trim() || null,
      },
    };

    const result = await onSave(payload);

    if (result?.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase();

  return (
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {initials || '👤'}
          </div>

          <div>
            <h2 className={styles.title}>Персональные данные</h2>

            {isSaved && (
                <div className={styles.saved}>Сохранено</div>
            )}
          </div>
        </div>

        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>

            <div className={styles.grid}>

              <div className={styles.field}>
                <label className={styles.label}>Фамилия</label>

                <input
                    value={formData.last_name}
                    onChange={handleChange('last_name')}
                    className={`${styles.input} ${errors.last_name ? styles.error : ''}`}
                    placeholder="Иванов"
                    disabled={disabled || saving}
                    autoComplete="family-name"
                />

                {errors.last_name && (
                    <div className={styles.errorText}>{errors.last_name}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Имя</label>

                <input
                    value={formData.first_name}
                    onChange={handleChange('first_name')}
                    className={`${styles.input} ${errors.first_name ? styles.error : ''}`}
                    placeholder="Иван"
                    disabled={disabled || saving}
                    autoComplete="given-name"
                />

                {errors.first_name && (
                    <div className={styles.errorText}>{errors.first_name}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Отчество</label>

                <input
                    value={formData.middle_name}
                    onChange={handleChange('middle_name')}
                    className={`${styles.input} ${errors.middle_name ? styles.error : ''}`}
                    placeholder="Петрович"
                    disabled={disabled || saving}
                    autoComplete="additional-name"
                />

                {errors.middle_name && (
                    <div className={styles.errorText}>{errors.middle_name}</div>
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

export default IndividualProfile;