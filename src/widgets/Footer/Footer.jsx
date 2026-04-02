import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { FaVk, FaTelegram, FaYoutube } from 'react-icons/fa';
import paths from '../../app/router/paths';
import styles from './Footer.module.css';

const Footer = () => {
  const [openSections, setOpenSections] = useState({
    legal: true,
    buyers: true,
    company: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const legalLinks = [
    { label: 'Политика использования файлов cookie', href: paths.COOKIE_POLICY },
    { label: 'Политика конфиденциальности', href: paths.PRIVACY_POLICY },
    { label: 'Согласие на обработку персональных данных', href: paths.CONSENT },
    { label: 'Публичная оферта', href: paths.PUBLIC_OFFER },
    { label: 'Информация о юр. лице', href: paths.LEGAL_ENTITY },
  ];

  const buyerLinks = [
    { label: 'Trade-in', href: '/trade-in' },
    { label: 'Ремонт', href: '/repair' },
    { label: 'Доставка и оплата', href: paths.DELIVERY },
    { label: 'Новости', href: '/news' },
    { label: 'О нас', href: paths.ABOUT },
    { label: 'Контакты', href: paths.CONTACTS },
    { label: 'Гарантия', href: paths.WARRANTY },
  ];

  const companyLinks = [
    { label: 'Партнёрам', href: '/partners' },
    { label: 'Франшиза', href: '/franchise' },
    { label: 'Вакансии', href: '/careers' },
    { label: 'Реквизиты', href: '/details' },
  ];

  const socialLinks = [
    { icon: FaVk, href: 'https://vk.com', label: 'ВКонтакте' },
    { icon: FaTelegram, href: 'https://telegram.org', label: 'Telegram' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className={styles.footer}>
      {/* Верхняя часть футера */}
      <div className={styles.footerTop}>
        <div className={styles.footerContainer}>
          {/* Левая колонка - Информация для покупателей */}
          <div className={styles.footerColumn}>
            <div className={styles.footerColumnTitle}>
              <h3>Покупателям</h3>
            </div>
            <ul className={styles.footerLinks}>
              {buyerLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Средняя колонка - Юридическая информация */}
          <div className={styles.footerColumn}>
            <div className={styles.footerColumnTitle}>
              <h3>Юридическая информация</h3>
            </div>
            <ul className={styles.footerLinks}>
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Правая колонка - О компании + Контакты */}
          <div className={styles.footerColumn}>
            <div className={styles.footerColumnTitle}>
              <h3>О компании</h3>
            </div>
            <ul className={styles.footerLinks}>
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>

            {/*/!* Контакты *!/*/}
            {/*<div className={styles.footerContacts}>*/}
            {/*  <div className={styles.contactItem}>*/}
            {/*    <FiMapPin size={18} />*/}
            {/*    <span>г. Москва, ул. Примерная, д. 10</span>*/}
            {/*  </div>*/}
            {/*  <div className={styles.contactItem}>*/}
            {/*    <FiPhone size={18} />*/}
            {/*    <a href="tel:+78000000000">+7 (800) 000-00-00</a>*/}
            {/*  </div>*/}
            {/*  <div className={styles.contactItem}>*/}
            {/*    <FiMail size={18} />*/}
            {/*    <a href="mailto:info@marker.ru">info@marker.ru</a>*/}
            {/*  </div>*/}
            {/*  <div className={styles.contactItem}>*/}
            {/*    <FiClock size={18} />*/}
            {/*    <span>Ежедневно с 9:00 до 21:00</span>*/}
            {/*  </div>*/}
            {/*</div>*/}

            {/* Соцсети */}
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Нижняя часть футера */}
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContent}>
          <div className={styles.copyright}>
            <span>© 2024–2026 «MAZON». Все права защищены.</span>
          </div>
          <div className={styles.legalInfo}>
            <span>ООО «Интернет техноголии»</span>
            <span>ИНН 1234567890</span>
            <span>ОГРН 1234567890123</span>
          </div>
        </div>
      </div>

      {/* Мобильная версия - аккордеон */}
      <div className={styles.footerMobile}>
        <div className={styles.footerContainer}>
          {/* Покупателям */}
          <div className={styles.mobileSection}>
            <button
              className={styles.mobileSectionHeader}
              onClick={() => toggleSection('buyers')}
              type="button"
            >
              <span>Покупателям</span>
              <FiChevronDown
                size={20}
                className={`${styles.mobileSectionIcon} ${openSections.buyers ? styles.iconOpen : ''}`}
              />
            </button>
            {openSections.buyers && (
              <ul className={styles.mobileSectionContent}>
                {buyerLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Юридическая информация */}
          <div className={styles.mobileSection}>
            <button
              className={styles.mobileSectionHeader}
              onClick={() => toggleSection('legal')}
              type="button"
            >
              <span>Юридическая информация</span>
              <FiChevronDown
                size={20}
                className={`${styles.mobileSectionIcon} ${openSections.legal ? styles.iconOpen : ''}`}
              />
            </button>
            {openSections.legal && (
              <ul className={styles.mobileSectionContent}>
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* О компании */}
          <div className={styles.mobileSection}>
            <button
              className={styles.mobileSectionHeader}
              onClick={() => toggleSection('company')}
              type="button"
            >
              <span>О компании</span>
              <FiChevronDown
                size={20}
                className={`${styles.mobileSectionIcon} ${openSections.company ? styles.iconOpen : ''}`}
              />
            </button>
            {openSections.company && (
              <ul className={styles.mobileSectionContent}>
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Контакты в мобильной версии */}
          <div className={styles.mobileContacts}>
            <div className={styles.contactItem}>
              <FiMapPin size={18} />
              <span>г. Москва, ул. Примерная, д. 10</span>
            </div>
            <div className={styles.contactItem}>
              <FiPhone size={18} />
              <a href="tel:+78000000000">+7 (800) 000-00-00</a>
            </div>
            <div className={styles.contactItem}>
              <FiMail size={18} />
              <a href="mailto:info@marker.ru">info@marker.ru</a>
            </div>
          </div>

          {/* Соцсети в мобильной версии */}
          <div className={styles.socialLinks}>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
              >
                <social.icon size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Нижняя часть для мобильной версии */}
      <div className={styles.footerMobileBottom}>
        <div className={styles.footerContainer}>
          <div className={styles.copyright}>
            <span>© 2024–2026 Marker. Все права защищены.</span>
          </div>
          <div className={styles.legalInfo}>
            <span>ООО «Маркер»</span>
            <span>ИНН 1234567890</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
