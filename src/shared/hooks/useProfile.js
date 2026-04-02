import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile as updateProfileApi } from '../api/userApi';

/**
 * Hook для управления профилем пользователя
 * @returns {Object}
 */
const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  /**
   * Загрузка профиля пользователя
   */
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        // Извлекаем сообщение об ошибке из объекта
        const errorMessage = typeof response.error === 'object' 
          ? response.error?.detail || response.error?.message || 'Ошибка загрузки профиля'
          : response.error;
        setError(errorMessage);
      }
    } catch (err) {
      setError(err.message || 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Обновление профиля пользователя
   * @param {Object} profileData - Данные для обновления
   */
  const updateProfile = async (profileData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await updateProfileApi(profileData);
      if (response.success) {
        setProfile(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError(err.message || 'Ошибка сохранения профиля');
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  /**
   * Проверка, заполнен ли профиль физлица
   */
  const isIndividualProfileFilled = useCallback(() => {
    if (!profile?.individual_profile) return false;
    const { first_name, last_name } = profile.individual_profile;
    return !!(first_name && last_name);
  }, [profile]);

  /**
   * Проверка, заполнен ли профиль юрлица
   */
  const isCompanyProfileFilled = useCallback(() => {
    if (!profile?.company_profile) return false;
    const { company_name, tax_id } = profile.company_profile;
    return !!(company_name && tax_id);
  }, [profile]);

  /**
   * Определение активной вкладки по умолчанию
   * - Если заполнено только физлицо → individual
   * - Если заполнено только юрлицо → company
   * - Если заполнены оба или ни одного → individual
   */
  const getDefaultTab = useCallback(() => {
    const individualFilled = isIndividualProfileFilled();
    const companyFilled = isCompanyProfileFilled();

    if (companyFilled && !individualFilled) {
      return 'company';
    }
    return 'individual';
  }, [isIndividualProfileFilled, isCompanyProfileFilled]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    saving,
    updateProfile,
    refreshProfile: loadProfile,
    isIndividualProfileFilled,
    isCompanyProfileFilled,
    getDefaultTab,
  };
};

export default useProfile;
