import { FiMapPin, FiClock, FiPhone, FiTruck, FiCreditCard, FiDollarSign, FiCheck, FiPackage, FiBriefcase } from 'react-icons/fi';
import styles from './DeliveryPage.module.css';

const DeliveryPage = () => {
  const stores = [
    {
      city: 'Москва',
      metro: 'Багратионовская/ Фили',
      address: 'ул. Барклая 6с3. БЦ «Барклай парк», 1 этаж (налево), офис 104',
      hours: '12:00 – 21:00',
      phone: '+7 (812) 317-67-64',
    },
    {
      city: 'Санкт-Петербург',
      metro: 'Маяковская',
      address: 'ул. Стремянная 22/3',
      hours: '10:00 – 21:30',
      phone: '+7 (812) 317-67-64',
    },
  ];

  const deliveryMethods = [
    {
      icon: FiPackage,
      title: 'Самовывоз',
      description: 'Бесплатно заберите заказ в наших магазинах',
      details: 'Вы можете забрать свой заказ в наших магазинах в Москве и Санкт-Петербурге. Менеджер уведомит вас о готовности заказа.',
      color: '#00c853',
    },
    {
      icon: FiTruck,
      title: 'Доставка по Москве и Санкт-Петербургу',
      description: 'Курьером в день заказа',
      details: 'Доставка осуществляется курьером в день заказа. Стоимость доставки рассчитывается по тарифу "Яндекс.Доставки" и может меняться в зависимости от загруженности транспортных сетей.',
      color: '#005bff',
    },
    {
      icon: FiDollarSign,
      title: 'Доставка по России',
      description: 'Транспортной компанией СДЭК',
      details: 'Доставка осуществляется по полной предоплате транспортной компанией "СДЭК" или другой транспортной компанией на Ваш выбор. Срок доставки зависит от региона.',
      color: '#f59e0b',
    },
  ];

  const paymentMethods = [
    {
      icon: FiCreditCard,
      title: 'В магазине',
      methods: ['Наличными', 'Картой банка'],
      note: 'уточняйте стоимость',
    },
    {
      icon: FiCheck,
      title: 'Курьеру наличными',
      methods: ['По Санкт-Петербургу'],
      note: null,
    },
    {
      icon: FiBriefcase,
      title: 'Предоплата по СБП',
      methods: ['Доставка по Санкт-Петербургу', 'Доставка по России'],
      note: 'Система быстрых платежей',
    },
    {
      icon: FiDollarSign,
      title: 'Юридическим лицам',
      methods: ['Безналичный расчет'],
      note: 'уточняйте стоимость',
    },
  ];

  return (
    <div className={styles.deliveryPage}>
      {/* Заголовок */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Доставка и оплата</h1>
        <p className={styles.subtitle}>
          Удобные способы доставки и оплаты для наших клиентов
        </p>
      </div>

      {/* Магазины для самовывоза */}
      <div className={styles.storesSection}>
        <h2 className={styles.sectionTitle}>Самовывоз</h2>
        <p className={styles.sectionDescription}>
          Вы можете забрать свой заказ в наших магазинах или заказать доставку
        </p>
        <div className={styles.storesGrid}>
          {stores.map((store, index) => (
            <div key={index} className={styles.storeCard}>
              <div className={styles.storeHeader}>
                <FiMapPin size={24} className={styles.storeIcon} />
                <h3 className={styles.storeCity}>{store.city}</h3>
              </div>
              <div className={styles.storeBody}>
                <div className={styles.storeInfo}>
                  <span className={styles.infoLabel}>Адрес:</span>
                  <p className={styles.infoText}>
                    ст.м. «{store.metro}»<br />
                    {store.address}
                  </p>
                </div>
                <div className={styles.storeInfo}>
                  <FiClock size={18} className={styles.infoIcon} />
                  <span className={styles.infoLabel}>Время работы:</span>
                  <p className={styles.infoText}>{store.hours}</p>
                </div>
                <div className={styles.storeInfo}>
                  <FiPhone size={18} className={styles.infoIcon} />
                  <span className={styles.infoLabel}>Телефон:</span>
                  <a href={`tel:${store.phone}`} className={styles.infoLink}>
                    {store.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Способы доставки */}
      <div className={styles.deliverySection}>
        <h2 className={styles.sectionTitle}>Способы доставки</h2>
        <div className={styles.deliveryGrid}>
          {deliveryMethods.map((method, index) => (
            <div key={index} className={styles.deliveryCard}>
              <div 
                className={styles.deliveryIcon}
                style={{ backgroundColor: `${method.color}15`, color: method.color }}
              >
                <method.icon size={32} />
              </div>
              <h3 className={styles.deliveryTitle}>{method.title}</h3>
              <p className={styles.deliveryDescription}>{method.description}</p>
              <p className={styles.deliveryDetails}>{method.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Способы оплаты */}
      <div className={styles.paymentSection}>
        <h2 className={styles.sectionTitle}>Оплата</h2>
        <div className={styles.paymentGrid}>
          {paymentMethods.map((method, index) => (
            <div key={index} className={styles.paymentCard}>
              <div className={styles.paymentIcon}>
                <method.icon size={32} />
              </div>
              <h3 className={styles.paymentTitle}>{method.title}</h3>
              <ul className={styles.paymentMethods}>
                {method.methods.map((item, idx) => (
                  <li key={idx} className={styles.paymentMethod}>
                    <FiCheck size={16} className={styles.checkIcon} />
                    {item}
                  </li>
                ))}
              </ul>
              {method.note && (
                <p className={styles.paymentNote}>{method.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Информация */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <FiTruck size={40} className={styles.infoCardIcon} />
          <h3>Отслеживание заказа</h3>
          <p>
            После оформления заказа вы получите трек-номер для отслеживания 
            посылки. Вы сможете следить за статусом доставки в личном кабинете 
            или на сайте транспортной компании.
          </p>
        </div>
        <div className={styles.infoCard}>
          <FiCheck size={40} className={styles.infoCardIcon} />
          <h3>Гарантия доставки</h3>
          <p>
            Мы гарантируем сохранность товара при доставке. Все отправления 
            застрахованы. В случае повреждения товара при транспортировке 
            мы заменим его за свой счет.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
