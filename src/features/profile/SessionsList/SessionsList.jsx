import { useState } from 'react';
import { FiMonitor, FiX, FiMapPin, FiClock, FiShield } from 'react-icons/fi';
import Button from '../../../shared/ui/Button/Button';
import styles from './SessionsList.module.css';

/**
 * Форматирует дату в читаемый вид
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Возвращает иконку браузера
 */
const getBrowserIcon = (browser) => {
  const b = (browser || '').toLowerCase();
  if (b.includes('chrome')) return '🌐';
  if (b.includes('firefox')) return '🦊';
  if (b.includes('safari')) return '🧭';
  if (b.includes('edge')) return '🔷';
  if (b.includes('opera')) return '🔴';
  return '🌐';
};

/**
 * Возвращает иконку ОС
 */
const getOsIcon = (os) => {
  const o = (os || '').toLowerCase();
  if (o.includes('windows')) return '🪟';
  if (o.includes('ios') || o.includes('iphone') || o.includes('ipad')) return '📱';
  if (o.includes('android')) return '🤖';
  if (o.includes('mac')) return '🍎';
  if (o.includes('linux')) return '🐧';
  return '💻';
};

/**
 * Компонент списка активных сессий
 * @param {Object} props
 * @param {Array} props.sessions - Список сессий из профиля
 * @param {number|null} props.currentSessionId - ID текущей сессии
 * @param {function} props.onTerminateSession - Callback удаления одной сессии
 * @param {function} props.onTerminateAll - Callback удаления всех сессий
 * @param {function} props.onRefresh - Callback обновления списка
 */
const SessionsList = ({ sessions, currentSessionId, onTerminateSession, onTerminateAll, onRefresh }) => {
  const [terminatingId, setTerminatingId] = useState(null);
  const [terminatingAll, setTerminatingAll] = useState(false);
  const [confirmTerminateAll, setConfirmTerminateAll] = useState(false);

  const activeSessions = sessions.filter(s => s.is_active);

  const handleTerminate = async (sessionId) => {
    setTerminatingId(sessionId);
    await onTerminateSession(sessionId);
    setTerminatingId(null);
  };

  const handleTerminateAll = async () => {
    setTerminatingAll(true);
    await onTerminateAll();
    setTerminatingAll(false);
    setConfirmTerminateAll(false);
  };

  if (activeSessions.length === 0) {
    return (
      <div className={styles.empty}>
        <FiMonitor size={40} />
        <h3 className={styles.emptyTitle}>Нет активных сессий</h3>
        <p className={styles.emptyText}>Здесь будут отображаться ваши активные сессии</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>Активные сессии</h2>
          <p className={styles.subtitle}>
            {activeSessions.length} {getSessionsWord(activeSessions.length)}
          </p>
        </div>
        {activeSessions.length > 1 && (
          <div className={styles.headerActions}>
            {!confirmTerminateAll ? (
              <Button
                variant="ghost"
                size="small"
                onClick={() => setConfirmTerminateAll(true)}
              >
                Завершить все
              </Button>
            ) : (
              <div className={styles.confirmBlock}>
                <span className={styles.confirmText}>Завершить все?</span>
                <Button
                  variant="danger"
                  size="small"
                  loading={terminatingAll}
                  onClick={handleTerminateAll}
                >
                  Да
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setConfirmTerminateAll(false)}
                >
                  Нет
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.sessionsList}>
        {activeSessions.map((session) => {
          const isCurrent = currentSessionId ? session.id === currentSessionId : false;

          return (
            <div
              key={session.id}
              className={`${styles.sessionCard} ${isCurrent ? styles.sessionCardCurrent : ''}`}
            >
              <div className={styles.sessionCardTop}>
                <div className={styles.sessionIcon}>
                  {getOsIcon(session.os)}
                </div>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionDevice}>
                    <span className={styles.sessionDeviceName}>
                      {session.browser || 'Неизвестный браузер'} {getBrowserIcon(session.browser)}
                    </span>
                    {isCurrent && (
                      <span className={styles.currentBadge}>
                        <FiShield size={10} /> Это устройство
                      </span>
                    )}
                  </div>
                  <div className={styles.sessionMeta}>
                    {session.os && (
                      <span className={styles.metaItem}>
                        {getOsIcon(session.os)} {session.os}
                      </span>
                    )}
                    {session.device_info && (
                      <span className={styles.metaItem}>
                        {session.device_info}
                      </span>
                    )}
                  </div>
                  <div className={styles.sessionDetails}>
                    {session.geo_info && (
                      <span className={styles.detailItem}>
                        <FiMapPin size={12} /> {session.geo_info}
                      </span>
                    )}
                    <span className={styles.detailItem}>
                      <FiClock size={12} /> {formatDate(session.last_activity)}
                    </span>
                  </div>
                </div>
              </div>

              {!isCurrent && (
                <div className={styles.sessionCardActions}>
                  <button
                    className={styles.terminateBtn}
                    onClick={() => handleTerminate(session.id)}
                    disabled={terminatingId === session.id}
                  >
                    {terminatingId === session.id ? (
                      <span className={styles.spinner}>⏳</span>
                    ) : (
                      <FiX size={14} />
                    )}
                    <span>Закрыть</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Склонение слова «сессия»
 */
function getSessionsWord(count) {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 19) return 'сессий';
  if (lastOne === 1) return 'сессия';
  if (lastOne >= 2 && lastOne <= 4) return 'сессии';
  return 'сессий';
}

export default SessionsList;
