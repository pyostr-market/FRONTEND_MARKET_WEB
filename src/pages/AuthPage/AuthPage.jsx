import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import usePhoneInput from '../../shared/hooks/usePhoneInput';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [isLoading, setIsLoading] = useState(false);
  const [phoneFormatted, setPhoneFormatted, phoneRaw] = usePhoneInput('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_USER_SERVICE_BASE_URL || 'http://localhost:8000';

  const handleBack = () => {
    if (step === 'code') {
      setStep('phone');
      setPhoneFormatted('');
      setCode(['', '', '', '', '', '']);
      setError('');
    } else {
      navigate(-1);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Проверяем, что номер полный (11 цифр)
    if (phoneRaw.length !== 11) {
      setError('Введите корректный номер телефона');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/verification/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneRaw,
          delivery_method: 'telegram',
        }),
      });

      if (response.ok) {
        setStep('code');
      } else {
        setError('Ошибка при отправке кода. Попробуйте позже.');
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте подключение.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/registration/register/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneRaw,
          code: code.join(''),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Сохраняем токены
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('session_id', data.session_id?.toString() || '');
        // Перенаправляем на главную
        navigate('/');
      } else {
        setError('Неверный код. Попробуйте еще раз.');
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте подключение.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Автофокус на следующее поле
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        {/* Header с кнопкой назад */}
        <div className={styles.authHeader}>
          <button className={styles.backBtn} onClick={handleBack}>
            <FiArrowLeft size={20} />
          </button>
          <span className={styles.headerTitle}>
            {step === 'phone' ? 'Вход в профиль' : 'Ввод кода'}
          </span>
          <div className={styles.headerSpacer} />
        </div>

        {/* Основной контент */}
        <div className={styles.authBody}>
          {step === 'phone' ? (
            <>
              {/* Иконка профиля */}
              <div className={styles.profileIconWrapper}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              {/* Заголовок */}
              <h1 className={styles.title}>Вход в профиль</h1>
              <p className={styles.subtitle}>
                Введите номер телефона для входа или регистрации
              </p>

              {/* Форма */}
              <form onSubmit={handleSendCode} className={styles.authForm}>
                <label className={styles.formLabel}>
                  <span className={styles.labelText}>Номер телефона</span>
                  <input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phoneFormatted}
                    onChange={setPhoneFormatted}
                    className={styles.formInput}
                    autoFocus
                    disabled={isLoading}
                  />
                </label>

                {error && <div className={styles.errorText}>{error}</div>}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading || phoneRaw.length !== 11}
                >
                  {isLoading ? 'Отправка...' : 'Продолжить'}
                </button>
              </form>

              <p className={styles.termsText}>
                Нажимая «Продолжить», вы соглашаетесь с{' '}
                <a href="/terms" className={styles.link}>условиями использования</a>{' '}
                и{' '}
                <a href="/privacy" className={styles.link}>политикой конфиденциальности</a>
              </p>
            </>
          ) : (
            <>
              {/* Иконка кода */}
              <div className={styles.profileIconWrapper}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              {/* Заголовок */}
              <h1 className={styles.title}>Введите код</h1>
              <p className={styles.subtitle}>
                Мы отправили 6-значный код в Telegram
              </p>

              {/* Форма ввода кода */}
              <div className={styles.codeForm}>
                <div className={styles.codeInputs}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={styles.codeInput}
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {error && <div className={styles.errorText}>{error}</div>}

                <button
                  className={styles.submitBtn}
                  onClick={handleVerifyCode}
                  disabled={isLoading || code.join('').length !== 6}
                >
                  {isLoading ? 'Проверка...' : 'Войти'}
                </button>

                <button
                  className={styles.resendBtn}
                  onClick={() => setStep('phone')}
                  disabled={isLoading}
                >
                  Отправить код повторно
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
