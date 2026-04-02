import { FiShield, FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiTool } from 'react-icons/fi';
import styles from './WarrantyPage.module.css';

const WarrantyPage = () => {
  const warrantyPeriods = [
    {
      category: 'Смартфоны',
      period: '2 года',
      description: 'с момента приобретения',
      color: '#00c853',
    },
    {
      category: 'Товары других категорий',
      period: '1 год',
      description: 'стандартная гарантия',
      color: '#005bff',
    },
    {
      category: 'Беспроводные наушники',
      period: '6 месяцев',
      description: 'с момента приобретения',
      color: '#f59e0b',
    },
    {
      category: 'Товары категории "БУ"',
      period: '3 месяца',
      description: 'с момента приобретения',
      color: '#dc2626',
    },
  ];

  const refusalReasons = [
    {
      icon: FiAlertTriangle,
      title: 'Попадание влаги',
      description: 'Производители не дают гарантию на водостойкость техники. При выявлении попадания влаги будет отказано в гарантийном обслуживании.',
      color: '#f59e0b',
    },
    {
      icon: FiTool,
      title: 'Внешнее вмешательство',
      description: 'Ремонт в стороннем неавторизованном сервисе, вскрытие устройства (за исключением нашего сервиса) — основание для отказа.',
      color: '#dc2626',
    },
    {
      icon: FiXCircle,
      title: 'Неправильная эксплуатация',
      description: 'Поломка, связанная с неправильной эксплуатацией или механическим повреждением (трещины, сколы) не является гарантийным случаем.',
      color: '#dc2626',
    },
  ];

  const warrantyTerms = [
    {
      number: '1',
      text: 'После проведения тестирования, гарантийное обслуживание осуществляется в срок до 45 дней с момента подачи заявления с указанием претензий к качеству товара. (Закон о правах потребителя, ст.20, п.1.)',
    },
    {
      number: '2',
      text: 'Гарантийный срок начинается с момента приобретения товара.',
    },
    {
      number: '3',
      text: 'Согласно «Закону о защите прав потребителей», при обнаружении неисправности, гарантийный ремонт осуществляется в течение установленного гарантийного срока.',
    },
  ];

  const applePolicy = [
    'При приеме товара клиент ОБЯЗАН отключить функцию «Найти устройство» в настройках iCloud',
    'Клиент ОБЯЗАН стереть ВСЕ персональные данные из устройства',
    'Если клиент воспользуется другим устройством Apple во время ремонта и активирует iCloud, он ОБЯЗАН отключить функцию «Найти устройство»',
    'Если клиент не выполнит данные условия, компания Apple имеет право отказать в гарантийном обслуживании',
  ];

  return (
    <div className={styles.warrantyPage}>
      {/* Заголовок */}
      <div className={styles.headerSection}>
        <FiShield size={48} className={styles.headerIcon} />
        <h1 className={styles.title}>Гарантия</h1>
        <p className={styles.subtitle}>
          Гарантия на все смартфоны — 2 года. На другие товары — от 3 месяцев до 1 года
        </p>
      </div>

      {/* Сроки гарантии */}
      <div className={styles.periodsSection}>
        <h2 className={styles.sectionTitle}>Гарантийные сроки</h2>
        <div className={styles.periodsGrid}>
          {warrantyPeriods.map((item, index) => (
            <div key={index} className={styles.periodCard}>
              <div 
                className={styles.periodBadge}
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                <FiCheckCircle size={24} />
              </div>
              <h3 className={styles.periodCategory}>{item.category}</h3>
              <div className={styles.periodValue}>{item.period}</div>
              <p className={styles.periodDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Что такое гарантия */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h2 className={styles.infoCardTitle}>Что такое гарантийный период?</h2>
          <p className={styles.infoCardText}>
            Гарантийный период – время, в течение которого клиент может требовать 
            устранения дефектов товара от продавца или изготовителя. Продавец должен 
            устранить недостатки, если не докажет, что они возникли из-за неправильной 
            эксплуатации товара покупателем.
          </p>
        </div>
        <div className={styles.infoCard}>
          <h2 className={styles.infoCardTitle}>Обнаружили брак?</h2>
          <p className={styles.infoCardText}>
            Если в процессе эксплуатации техники вы обнаружили брак, не связанный с 
            неправильной эксплуатацией или механическим повреждением, сообщите об этом 
            в магазин или позвоните нам.
          </p>
        </div>
      </div>

      {/* Отказ в гарантии */}
      <div className={styles.refusalSection}>
        <h2 className={styles.sectionTitle}>Почему могут отказать в гарантии?</h2>
        <div className={styles.refusalGrid}>
          {refusalReasons.map((reason, index) => (
            <div key={index} className={styles.refusalCard}>
              <div 
                className={styles.refusalIcon}
                style={{ backgroundColor: `${reason.color}15`, color: reason.color }}
              >
                <reason.icon size={32} />
              </div>
              <h3 className={styles.refusalTitle}>{reason.title}</h3>
              <p className={styles.refusalDescription}>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Сроки обслуживания */}
      <div className={styles.termsSection}>
        <h2 className={styles.sectionTitle}>Сроки гарантийного обслуживания</h2>
        <div className={styles.termsList}>
          {warrantyTerms.map((term, index) => (
            <div key={index} className={styles.termItem}>
              <div className={styles.termNumber}>{term.number}</div>
              <p className={styles.termText}>{term.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Политика Apple */}
      <div className={styles.appleSection}>
        <div className={styles.appleHeader}>
          <FiInfo size={32} className={styles.appleIcon} />
          <h2 className={styles.appleTitle}>Важно для устройств Apple</h2>
        </div>
        <p className={styles.appleIntro}>
          Для всех устройств компании Apple действует новая политика безопасности 
          и гарантийного обслуживания!
        </p>
        <ul className={styles.appleList}>
          {applePolicy.map((item, index) => (
            <li key={index} className={styles.appleListItem}>
              <FiCheckCircle size={20} className={styles.appleCheckIcon} />
              {item}
            </li>
          ))}
        </ul>
        <div className={styles.appleNote}>
          <FiAlertTriangle size={24} className={styles.appleNoteIcon} />
          <p>
            <strong>Обратите внимание!</strong> В связи с прекращением работы официальных 
            представительств Apple в России и отсутствием оригинальных комплектующих, 
            возможна отправка электроники для гарантийной замены или ремонта в Европу 
            и страны СНГ.
          </p>
        </div>
      </div>

      {/* Заключение */}
      <div className={styles.conclusionSection}>
        <FiShield size={40} className={styles.conclusionIcon} />
        <p className={styles.conclusionText}>
          Мы выполняем все гарантийные обязательства в соответствии с официальными 
          правилами обслуживания техники.
        </p>
      </div>
    </div>
  );
};

export default WarrantyPage;
