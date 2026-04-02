import { userApi as api } from './apiClient';

/**
 * API для работы с профилем пользователя
 * Base URL: /users
 */

/**
 * Получение профиля текущего пользователя
 * @returns {Promise<{success: boolean, data: UserProfile, error: any}>}
 */
export const getProfile = () => api.request('/users/profile', {
  method: 'GET',
  useCache: false, // Не кэшируем профиль, чтобы всегда получать актуальные данные
});

/**
 * Обновление профиля пользователя
 * @param {Object} profileData - Данные для обновления
 * @param {string|null} profileData.fio - ФИО пользователя
 * @param {Object|null} profileData.individual_profile - Данные физлица
 * @param {Object|null} profileData.company_profile - Данные юрлица
 * @returns {Promise<{success: boolean, data: UserProfile, error: any}>}
 */
export const updateProfile = (profileData) => api.request('/users/profile', {
  method: 'PATCH',
  data: profileData,
  useCache: false,
});

/**
 * Завершение сессии
 * @param {number} sessionId - ID сессии
 * @returns {Promise<{success: boolean, data: boolean, error: any}>}
 */
export const terminateSession = (sessionId) => api.request(`/users/sessions/${sessionId}`, {
  method: 'DELETE',
  useCache: false,
});

/**
 * Завершение всех сессий (кроме текущей)
 * @returns {Promise<{success: boolean, data: {terminated_count: number}, error: any}>}
 */
export const terminateAllSessions = () => api.request('/users/sessions', {
  method: 'DELETE',
  useCache: false,
});

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getProfile,
  updateProfile,
  terminateSession,
  terminateAllSessions,
};
