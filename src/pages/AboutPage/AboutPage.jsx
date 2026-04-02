import { FaTelegram, FaInstagram, FaVk, FaYoutube } from 'react-icons/fa';
import { FiShield, FiTruck, FiRefreshCw, FiHeadphones, FiAward, FiUsers } from 'react-icons/fi';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  const stats = [
    { value: '7', label: 'лет на рынке' },
    { value: '100 000+', label: 'довольных клиентов' },
    { value: '2', label: 'филиала в столицах России' },
    { value: '2 500+', label: 'товаров на сайте' },
  ];

  const features = [
    {
      icon: FiAward,
      title: 'Бюджетные и премиальные бренды',
      description: 'Широкий выбор техники на любой бюджет',
    },
    {
      icon: FiShield,
      title: 'Гарантия до 2-х лет',
      description: 'Официальная гарантия на всю технику',
    },
    {
      icon: FiHeadphones,
      title: 'Собственный сервисный центр',
      description: 'Профессиональное обслуживание и ремонт',
    },
    {
      icon: FiRefreshCw,
      title: 'Программа Трейд-ин',
      description: 'Обмен старой техники на новую с выгодной скидкой',
    },
    {
      icon: FiUsers,
      title: 'Продажа аксессуаров',
      description: 'От зарядных устройств до стильных чехлов',
    },
    {
      icon: FiTruck,
      title: 'Безопасная доставка',
      description: 'Доставка по всей России',
    },
  ];

  const socialLinks = [
    {
      icon: FaTelegram,
      label: 'Telegram',
      subscribers: '26 тыс. подписчиков',
      href: 'https://telegram.org',
      color: '#229ED9',
    },
    {
      icon: FaInstagram,
      label: 'Instagram',
      subscribers: '89 тыс. подписчиков',
      href: 'https://instagram.com',
      color: '#E4405F',
      note: '*Принадлежит компании Meta, признанной экстремистской и запрещённой на территории РФ',
    },
    {
      icon: FaVk,
      label: 'VK',
      subscribers: '3,5 тыс. подписчиков',
      href: 'https://vk.com',
      color: '#0077FF',
    },
    {
      icon: FaYoutube,
      label: 'YouTube',
      subscribers: '49.6 тыс. подписчиков',
      href: 'https://youtube.com',
      color: '#FF0000',
    },
  ];

  return (
    <div className={styles.aboutPage}>
      {/* Герой с фото */}
      <div className={styles.heroSection}>
        {/*<div className={styles.heroImage}>*/}
        {/*  <img*/}
        {/*    src=""*/}
        {/*    alt="О компании"*/}
        {/*    className={styles.heroImageMain}*/}
        {/*  />*/}
        {/*</div>*/}
      </div>

      {/* Миссия */}
      <div className={styles.missionSection}>
        <h1 className={styles.title}>О нас</h1>
        <p className={styles.mission}>
          Миссия MAZON — помогать каждому легко и выгодно приобретать нужную технику.
        </p>
      </div>

      {/* Цифры */}
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>О нас в цифрах</h2>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Что мы предлагаем */}
      <div className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Мы предлагаем</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <feature.icon size={32} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Заключение */}
      <div className={styles.conclusionSection}>
        <p className={styles.conclusion}>
          MAZON — это сочетание надёжности, высоких стандартов сервиса и привлекательных условий,
          которые делают покупку и обслуживание техники простыми и комфортными.
        </p>
      </div>

      {/* Социальные сети */}
      <div className={styles.socialSection}>
        <h2 className={styles.sectionTitle}>Мы в социальных сетях</h2>
        <div className={styles.socialGrid}>
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              className={styles.socialCard}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.socialIcon} style={{ color: social.color }}>
                <social.icon size={40} />
              </div>
              <div className={styles.socialInfo}>
                <div className={styles.socialLabel}>{social.label}</div>
                <div className={styles.socialSubscribers}>{social.subscribers}</div>
              </div>
              {social.note && (
                <div className={styles.socialNote}>{social.note}</div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
