import { useState, useCallback } from 'react';
import { FiMapPin, FiClock, FiPhone, FiMail, FiCheck, FiCopy, FiExternalLink } from 'react-icons/fi';
import styles from './ContactsPage.module.css';

const ContactsPage = () => {
  const [copiedStore, setCopiedStore] = useState(null);

  const stores = [
    {
      id: 'moscow',
      city: 'Москва',
      metro: 'Багратионовская/ Фили',
      address: 'г. Москва, ст.м. «Багратионовская/ Фили», ул. Барклая 6с3. БЦ «Барклай парк», 1 этаж (налево), офис 104.',
      addressShort: 'ул. Барклая 6с3. БЦ «Барклай парк», 1 этаж (налево), офис 104',
      hours: '12:00 – 21:00',
      phone: '+7 (812) 317-67-64',
      mapUrl: 'https://yandex.ru/maps/?text=Москва,ул.Барклая,6с3,БЦ Барклай парк',
    },
    {
      id: 'spb',
      city: 'Санкт-Петербург',
      metro: 'Маяковская',
      address: 'г. Санкт-Петербург, ст.м. «Маяковская», ул. Стремянная 22/3',
      addressShort: 'ул. Стремянная 22/3',
      hours: '10:00 – 21:30',
      phone: '+7 (812) 317-67-64',
      mapUrl: 'https://yandex.ru/maps/?text=Санкт-Петербург,ул.Стремянная,22/3',
    },
  ];

  const handleCopyAddress = useCallback((storeId, address) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedStore(storeId);
      setTimeout(() => setCopiedStore(null), 2000);
    });
  }, []);

  return (
    <div className={styles.contactsPage}>
      {/* Заголовок */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Контакты</h1>
        <p className={styles.subtitle}>
          Мы на связи с 10:00 до 21:30. Без выходных.
        </p>
      </div>

      {/* Магазины */}
      <div className={styles.storesSection}>
        <div className={styles.storesGrid}>
          {stores.map((store) => (
            <div key={store.id} className={styles.storeCard}>
              <div className={styles.storeHeader}>
                <FiMapPin size={28} className={styles.storeIcon} />
                <h2 className={styles.storeCity}>{store.city}</h2>
              </div>

              <div className={styles.storeBody}>
                {/* Адрес */}
                <div className={styles.storeInfo}>
                  <div className={styles.infoHeader}>
                    <FiMapPin size={18} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Адрес:</span>
                  </div>
                  <p className={styles.infoText}>
                    ст.м. «{store.metro}»<br />
                    {store.addressShort}
                  </p>
                  <div className={styles.addressActions}>
                    <button
                      className={styles.copyButton}
                      onClick={() => handleCopyAddress(store.id, store.address)}
                      type="button"
                    >
                      {copiedStore === store.id ? (
                        <>
                          <FiCheck size={16} />
                          <span>Скопировано</span>
                        </>
                      ) : (
                        <>
                          <FiCopy size={16} />
                          <span>Копировать адрес</span>
                        </>
                      )}
                    </button>
                    <a
                      href={store.mapUrl}
                      className={styles.mapButton}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiExternalLink size={16} />
                      <span>Яндекс.Карты</span>
                    </a>
                  </div>
                </div>

                {/* Время работы */}
                <div className={styles.storeInfo}>
                  <div className={styles.infoHeader}>
                    <FiClock size={18} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Время работы:</span>
                  </div>
                  <p className={styles.infoText}>{store.hours}</p>
                </div>

                {/* Телефон */}
                <div className={styles.storeInfo}>
                  <div className={styles.infoHeader}>
                    <FiPhone size={18} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Телефон:</span>
                  </div>
                  <a href={`tel:${store.phone}`} className={styles.infoLink}>
                    {store.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <FiClock size={40} className={styles.infoCardIcon} />
          <h3>Режим работы поддержки</h3>
          <p>
            Наша служба поддержки работает ежедневно с 10:00 до 21:30 
            по московскому времени. Мы отвечаем в течение 15 минут.
          </p>
        </div>
        <div className={styles.infoCard}>
          <FiMail size={40} className={styles.infoCardIcon} />
          <h3>Электронная почта</h3>
          <p>
            По всем вопросам вы можете написать нам на почту 
            <a href="mailto:info@marker.ru" className={styles.emailLink}> info@marker.ru</a>
          </p>
        </div>
      </div>

      {/* Карта */}
      <div className={styles.mapSection}>
        <h2 className={styles.sectionTitle}>Мы на карте</h2>
        <div className={styles.mapContainer}>
          <iframe
            src="https://yandex.ru/map-widget/v1/?ll=37.500000%2C55.750000&z=10"
            className={styles.mapFrame}
            title="Карта магазинов"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
